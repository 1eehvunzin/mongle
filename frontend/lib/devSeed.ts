// Dev-only, one-time local data seed for testing in Expo Go: runs the real
// /api/recognize pipeline against the three sample photos in assets/ref and
// saves the results as catches via the same path capture.tsx uses, so the
// feed/home/profile screens have something to render without shooting real
// photos first. Gated by __DEV__ and a done-once AsyncStorage flag.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { recognize } from "./api";
import { createCatch, setNickname } from "./localStore";

// v2: bumped so anyone who already ran the v1 (no-location) seed gets these
// three re-added with map pins instead of being skipped as "already done".
const SEED_FLAG_KEY = "mongle.devSeeded.v2";

const SEED_ITEMS = [
  {
    image: require("../assets/ref/cloud-1.jpg"),
    place_name: "남산",
    lat: 37.5512,
    lng: 126.9882,
  },
  {
    image: require("../assets/ref/cloud-2.jpg"),
    place_name: "여의도 한강공원",
    lat: 37.5285,
    lng: 126.9327,
  },
  {
    image: require("../assets/ref/cloud-3.jpg"),
    place_name: "경복궁",
    lat: 37.5796,
    lng: 126.977,
  },
];

export async function seedDevCatchesOnce(): Promise<void> {
  if (!__DEV__) return;
  if (await AsyncStorage.getItem(SEED_FLAG_KEY)) return;

  await setNickname("구름지기");

  for (const item of SEED_ITEMS) {
    try {
      const asset = Asset.fromModule(item.image);
      await asset.downloadAsync();
      const base64 = await FileSystem.readAsStringAsync(
        asset.localUri ?? asset.uri,
        { encoding: FileSystem.EncodingType.Base64 },
      );
      const result = await recognize(base64);
      await createCatch({
        cloud_name: result.name,
        cloud_type: result.type,
        confidence: result.confidence,
        photo_base64: base64,
        place_name: item.place_name,
        lat: item.lat,
        lng: item.lng,
      });
    } catch (e) {
      console.warn("[devSeed] skipped one seed image:", e);
    }
  }

  await AsyncStorage.setItem(SEED_FLAG_KEY, "1");
}
