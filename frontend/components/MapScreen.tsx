import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Glass from "./Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { CatchOut, getMapPins } from "../lib/localStore";
import { ensureAccount } from "../lib/auth";

const DEFAULT_CENTER = { lat: 37.565, lng: 126.99 };

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.floor(ms / 60000));
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export default function MapScreen() {
  const [pins, setPins] = useState<CatchOut[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: glass.bg }}
      edges={["top"]}
    >
      <View
        style={{
          paddingHorizontal: rs(16),
          paddingTop: rs(2),
          paddingBottom: rs(6),
        }}
      >
        <Text
          className="font-bold"
          style={{ fontSize: rs(24), color: glass.ink, letterSpacing: -0.3 }}
        >
          구름 지도
        </Text>
      </View>

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
              marginHorizontal: rs(16),
              height: rs(300),
              borderRadius: rs(20),
              overflow: "hidden",
              borderWidth: 1,
              borderColor: glass.border,
              backgroundColor: glass.gray.top,
            }}
          >
            <MapContainer
              center={[
                pins.find((pin) => pin.lat != null && pin.lng != null)?.lat ??
                  DEFAULT_CENTER.lat,
                pins.find((pin) => pin.lat != null && pin.lng != null)?.lng ??
                  DEFAULT_CENTER.lng,
              ]}
              zoom={12}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pins
                .filter((pin) => pin.lat != null && pin.lng != null)
                .map((pin) => (
                  <CircleMarker
                    key={pin.id}
                    center={[pin.lat as number, pin.lng as number]}
                    radius={9}
                    pathOptions={{
                      color: "#244F5D",
                      fillColor: "#8FC7D5",
                      fillOpacity: 0.95,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <strong>{pin.cloud_name}</strong>
                      <br />
                      {pin.place_name ?? "위치 기록"}
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>
          </View>

          <Text
            className="font-semibold"
            style={{
              fontSize: rs(11.5),
              color: glass.subMuted,
              marginHorizontal: rs(16),
              marginTop: rs(16),
              marginBottom: rs(7),
            }}
          >
            내 최근 기록
          </Text>

          {/* A plain card, not Glass — Glass's top specular sheen covers ~48%
              of its own height, which washes out text in the first row or two
              of a tall list like this (fine on short buttons/pills, not here). */}
          <View
            style={{
              marginHorizontal: rs(16),
              borderRadius: rs(18),
              backgroundColor: glass.white.top,
              borderWidth: 1,
              borderColor: glass.border,
              overflow: "hidden",
            }}
          >
            {pins.map((p, i) => (
              <View
                key={p.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: rs(12),
                  padding: rs(12),
                  borderBottomWidth: i === pins.length - 1 ? 0 : 1,
                  borderBottomColor: glass.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    className="font-semibold"
                    style={{ fontSize: rs(13), color: glass.ink }}
                  >
                    {p.cloud_name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: rs(3),
                      marginTop: 2,
                    }}
                  >
                    <Ionicons
                      name="location"
                      size={rs(10)}
                      color={glass.subMuted}
                    />
                    <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>
                      {p.place_name ?? "위치 정보 없음"} ·{" "}
                      {timeAgo(p.captured_at)}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>
                  {p.stars}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
