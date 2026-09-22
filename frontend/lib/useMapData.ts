import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ensureAccount } from "./auth";
import { CatchOut, getMapPins } from "./localStore";
import { filterPinsBySpecies, hasCoords, speciesInPins } from "./mapMeta";

// State shared by the web (Leaflet) and native (react-native-maps) map
// screens: the user's pins, the species filter, and the selected pin. Only
// the map drawing itself differs between platforms.
export function useMapData() {
  const [pins, setPins] = useState<CatchOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [species, setSpecies] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      await ensureAccount();
      setPins(await getMapPins());
    } catch {
      // best-effort — keep whatever was last loaded, if anything.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const speciesList = useMemo(() => speciesInPins(pins), [pins]);
  const visiblePins = useMemo(
    () => filterPinsBySpecies(pins, species),
    [pins, species],
  );
  const geoPins = useMemo(() => visiblePins.filter(hasCoords), [visiblePins]);

  // A filter change can hide the selected pin — drop the selection then.
  useEffect(() => {
    if (selectedId != null && !visiblePins.some((p) => p.id === selectedId)) {
      setSelectedId(null);
    }
  }, [visiblePins, selectedId]);

  const selectedPin = useMemo(
    () => visiblePins.find((p) => p.id === selectedId) ?? null,
    [visiblePins, selectedId],
  );

  return {
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
  };
}
