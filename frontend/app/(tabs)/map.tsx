// The actual screen lives in components/MapScreen — Expo Router's file-based
// routing pulls in every platform-suffixed file under app/ regardless of
// target platform, so a map.native.tsx route file here broke the web bundle
// even though native never touched it. Keeping platform variants outside
// app/ and re-exporting them (Expo Router's documented pattern for this)
// lets Metro's normal per-platform module resolution do its job instead.
export { default } from "../../components/MapScreen";
