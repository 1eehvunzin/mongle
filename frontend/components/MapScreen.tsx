import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import "leaflet/dist/leaflet.css";
import MapTopBar from "./MapTopBar";
import MapSheet, { PANEL_HEIGHT } from "./MapSheet";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import type { CatchOut } from "../lib/localStore";
import { clusterHtml, clusterPins, PIN_SIZE, pinHtml } from "../lib/mapMeta";
import { useMapData } from "../lib/useMapData";

const DEFAULT_CENTER: [number, number] = [37.565, 126.99];
// Space the floating tab bar takes at the bottom (12 + 72, plus a gap); the
// panel runs down behind it so the two read as one surface.
const TAB_BAR_INSET = rs(12) + rs(72) + rs(10);
// The map stops a little below the top of the panel (rounded
// corners overlap it) so the tile attribution stays visible above the sheet.
const MAP_BOTTOM = TAB_BAR_INSET + PANEL_HEIGHT - rs(24);

// react-leaflet (and leaflet underneath it) touch `window` at module-load
// time, not just at render time — fine in an actual browser, but this
// screen also gets loaded by `expo export -p web`'s static-render pass,
// which renders every route once in Node (no `window`/`document`) to build
// the hydration shell. A static top-level import here crashed that pass
// every time, which is why the web deploy had never once succeeded.
// Loaded dynamically after mount instead, so the import only ever runs in
// the browser.
//
// The stylesheet is deliberately a plain static import above, NOT a dynamic
// import() like the JS: in Metro's dev server an async CSS chunk is served as
// `.../leaflet.bundle`, which collides with the sibling `leaflet.js` and
// bundles the wrong file, so the page dies with "Requiring unknown module
// <id>" as soon as the map tab opens. CSS has no `window` access, so a
// static import is safe for the SSR/static-render pass.
type ReactLeaflet = typeof import("react-leaflet");
type LeafletNS = typeof import("leaflet");
type Loaded = { rl: ReactLeaflet; L: LeafletNS };
let loaded: Loaded | null = null;

function useLeaflet(): Loaded | null {
  const [mod, setMod] = useState(loaded);
  useEffect(() => {
    if (loaded) return;
    let cancelled = false;
    Promise.all([import("react-leaflet"), import("leaflet")]).then(
      ([rl, lf]) => {
        if (cancelled) return;
        loaded = { rl, L: ((lf as any).default ?? lf) as LeafletNS };
        setMod(loaded);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);
  return mod;
}

// Everything that needs the live Leaflet map instance: clustering by zoom,
// fitting to the visible pins, flying to the selected pin, and the markers.
function Layers({
  rl,
  L,
  pins,
  selectedId,
  onSelect,
}: {
  rl: ReactLeaflet;
  L: LeafletNS;
  pins: CatchOut[];
  selectedId: number | null;
  onSelect: (pin: CatchOut) => void;
}) {
  const map = rl.useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  // Mute the stock OSM tiles so the map sits in the app's soft palette
  // instead of shouting over the pins.
  useEffect(() => {
    const pane = map.getPane("tilePane");
    if (pane)
      pane.style.filter = "saturate(0.35) brightness(1.05) contrast(0.92)";
  }, [map]);
  rl.useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  // ~56px grid cells at the current zoom, so bubbles split as you zoom in.
  const clusters = useMemo(
    () => clusterPins(pins, (360 / Math.pow(2, zoom)) * (56 / 256)),
    [pins, zoom],
  );

  // Refit whenever the set of visible pins changes (first load, species
  // filter). Padding leaves room for the top chips and the bottom sheet.
  const fitKey = pins.map((p) => p.id).join(",");
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat as number, pins[0].lng as number], 14);
      return;
    }
    map.fitBounds(
      pins.map((p) => [p.lat as number, p.lng as number] as [number, number]),
      { paddingTopLeft: [40, 120], paddingBottomRight: [40, 50], maxZoom: 15 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  useEffect(() => {
    const sel = pins.find((p) => p.id === selectedId);
    if (!sel) return;
    map.flyTo(
      [sel.lat as number, sel.lng as number],
      Math.max(map.getZoom(), 14),
      {
        duration: 0.6,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <>
      {clusters.map((c) => {
        const single = c.pins.length === 1;
        const selected = single && c.pins[0].id === selectedId;
        const size = single ? (selected ? PIN_SIZE.selected : PIN_SIZE.base) : PIN_SIZE.cluster;
        const icon = L.divIcon({
          html: single
            ? pinHtml(c.rarity, selected)
            : clusterHtml(c.pins.length),
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        return (
          <rl.Marker
            key={c.key + (selected ? "-sel" : "")}
            position={[c.lat, c.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                // Catches at the exact same spot never split apart, so once
                // zoomed in this far just pick the newest one in the bubble.
                if (single || map.getZoom() >= 16) onSelect(c.pins[0]);
                else
                  map.flyTo([c.lat, c.lng], Math.min(map.getZoom() + 2, 17), {
                    duration: 0.5,
                  });
              },
            }}
          />
        );
      })}
    </>
  );
}

export default function MapScreen() {
  const leaflet = useLeaflet();
  const {
    pins,
    loading,
    species,
    setSpecies,
    speciesList,
    visiblePins,
    geoPins,
    selectedId,
    setSelectedId,
  } = useMapData();

  const initialCenter: [number, number] = geoPins.length
    ? [geoPins[0].lat as number, geoPins[0].lng as number]
    : DEFAULT_CENTER;

  return (
    <View style={{ flex: 1, backgroundColor: glass.bg }}>
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={glass.accent} />
        </View>
      ) : pins.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: rs(30),
          }}
        >
          <Text
            style={{ color: glass.sub, fontSize: rs(13), textAlign: "center" }}
          >
            아직 위치가 기록된 구름이 없어요.
          </Text>
        </View>
      ) : (
        <>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: MAP_BOTTOM,
            }}
          >
            {leaflet ? (
              <leaflet.rl.MapContainer
                center={initialCenter}
                zoom={12}
                zoomControl={false}
                style={{ width: "100%", height: "100%" }}
              >
                <leaflet.rl.TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Layers
                  rl={leaflet.rl}
                  L={leaflet.L}
                  pins={geoPins}
                  selectedId={selectedId}
                  onSelect={(p) => setSelectedId(p.id)}
                />
              </leaflet.rl.MapContainer>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator color={glass.accent} />
              </View>
            )}
          </View>

          <MapTopBar
            species={speciesList}
            selected={species}
            onSelect={setSpecies}
          />

          <MapSheet
            pins={visiblePins}
            selectedId={selectedId}
            onSelect={(p) => setSelectedId(p.id)}
            tabBarInset={TAB_BAR_INSET}
            filterLabel={species}
          />
        </>
      )}
    </View>
  );
}
