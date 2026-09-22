import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapTopBar from "./MapTopBar";
import MapPinBadge from "./MapPinBadge";
import MapSheet, { PANEL_HEIGHT } from "./MapSheet";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { clusterPins, hasCoords } from "../lib/mapMeta";
import { useMapData } from "../lib/useMapData";

// Centered over Seoul until real pins load — the fit-to-pins effect below
// re-frames the map once they do.
const DEFAULT_REGION = {
  latitude: 37.565,
  longitude: 126.99,
  latitudeDelta: 0.22,
  longitudeDelta: 0.22,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [latDelta, setLatDelta] = useState(DEFAULT_REGION.latitudeDelta);
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
    selectedPin,
  } = useMapData();

  // Tab bar (12 + 72) plus the safe-area inset and a small gap; the sheet
  // floats just above it. The map stops a little below the top of the
  // collapsed sheet (its rounded corners overlap) so the map provider's
  // legal/logo text at the bottom edge stays visible.
  const tabBarInset = insets.bottom + rs(12) + rs(72) + rs(10);
  const mapBottom = tabBarInset + PANEL_HEIGHT - rs(24);

  // ~7 grid cells across the visible latitude span, so bubbles split apart
  // as the user zooms in.
  const clusters = useMemo(
    () => clusterPins(geoPins, latDelta / 7),
    [geoPins, latDelta],
  );

  // Re-frame whenever the set of visible pins changes (first load, species
  // filter).
  const fitKey = geoPins.map((p) => p.id).join(",");
  useEffect(() => {
    if (!ready || geoPins.length === 0) return;
    if (geoPins.length === 1) {
      mapRef.current?.animateToRegion(
        {
          latitude: geoPins[0].lat as number,
          longitude: geoPins[0].lng as number,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        400,
      );
      return;
    }
    mapRef.current?.fitToCoordinates(
      geoPins.map((p) => ({
        latitude: p.lat as number,
        longitude: p.lng as number,
      })),
      {
        edgePadding: { top: 130, right: 50, bottom: 50, left: 50 },
        animated: true,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey]);

  useEffect(() => {
    if (!selectedPin || !hasCoords(selectedPin)) return;
    const delta = Math.min(latDelta, 0.02);
    mapRef.current?.animateToRegion(
      {
        latitude: selectedPin.lat as number,
        longitude: selectedPin.lng as number,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      400,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

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
              bottom: mapBottom,
            }}
          >
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={DEFAULT_REGION}
              mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
              onMapReady={() => setReady(true)}
              onRegionChangeComplete={(r) => setLatDelta(r.latitudeDelta)}
            >
              {clusters.map((c) => {
                const single = c.pins.length === 1;
                const selected = single && c.pins[0].id === selectedId;
                return (
                  <Marker
                    // Remount on selection change: with tracksViewChanges off
                    // the custom view would otherwise never redraw.
                    key={c.key + (selected ? "-sel" : "")}
                    coordinate={{ latitude: c.lat, longitude: c.lng }}
                    tracksViewChanges={false}
                    anchor={{ x: 0.5, y: 0.5 }}
                    onPress={() => {
                      // Catches at the exact same spot never split apart, so
                      // once zoomed in this far pick the newest one instead.
                      if (single || latDelta < 0.003) {
                        setSelectedId(c.pins[0].id);
                      } else {
                        const delta = latDelta / 3;
                        mapRef.current?.animateToRegion(
                          {
                            latitude: c.lat,
                            longitude: c.lng,
                            latitudeDelta: delta,
                            longitudeDelta: delta,
                          },
                          400,
                        );
                      }
                    }}
                  >
                    <MapPinBadge
                      rarity={c.rarity}
                      selected={selected}
                      count={c.pins.length}
                    />
                  </Marker>
                );
              })}
            </MapView>
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
            tabBarInset={tabBarInset}
            filterLabel={species}
          />
        </>
      )}
    </View>
  );
}
