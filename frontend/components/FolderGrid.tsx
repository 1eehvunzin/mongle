import {
  Image,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import type { Folder } from "../lib/feedFilters";

const GRID_PADDING = rs(10);
const MAX_PHOTO_W = rs(92);
const PHOTO_RATIO = 4 / 3; // portrait height / width
const TILT = 9; // degrees

// Where each of a folder's (up to) three photos sits in the pile, front first:
// the newest photo stands upright in front, the older two fan out behind it,
// tilted either way — like an album stack in Photos. Offsets are fractions of
// the photo width so the pile scales with it.
const SLOTS = [
  { rotate: 0, dx: 0, dy: 0.05 },
  { rotate: TILT, dx: 0.26, dy: -0.03 },
  { rotate: -TILT, dx: -0.26, dy: -0.02 },
];

// A tilted card is wider than it is at rest: w·cos + h·sin. This is the
// widest the whole fanned pile gets, in photo-widths, and it must fit inside
// one grid column or neighbouring piles overlap.
const rad = (deg: number) => (deg * Math.PI) / 180;
const TILTED_W = Math.cos(rad(TILT)) + PHOTO_RATIO * Math.sin(rad(TILT));
const PILE_WIDTH_IN_PHOTOS = 2 * (SLOTS[1].dx + TILTED_W / 2);

function StackCard({
  uri,
  slot,
  w,
  h,
  containerW,
  containerH,
}: {
  uri: string | null;
  slot: (typeof SLOTS)[number];
  w: number;
  h: number;
  // The pile box's own size, so each card's centered position can be given
  // as an explicit top/left rather than leaning on the parent's alignItems /
  // justifyContent to center an absolutely-positioned child with no offsets.
  // Yoga (native) does that; CSS (web, via react-native-web) does not — this
  // rendered centered on native and off on web, or the other way around,
  // depending on which engine's fallback you hit. Explicit top/left is the
  // one answer both platforms agree on.
  containerW: number;
  containerH: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: (containerW - w) / 2 + slot.dx * w,
        top: (containerH - h) / 2 + slot.dy * h,
        width: w,
        height: h,
        borderRadius: rs(13),
        // Shadow lives here and the clip one level down, so iOS keeps it.
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        transform: [{ rotate: `${slot.rotate}deg` }],
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: rs(13),
          overflow: "hidden",
          backgroundColor: glass.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="cloud" size={rs(28)} color={glass.subMuted} />
        )}
      </View>
    </View>
  );
}

// Two-column grid of folders. Each folder is a small pile of its newest photos
// (one, two, or three) with the folder name and count underneath; a folder
// with no photos shows a single placeholder card.
export default function FolderGrid({
  folders,
  onOpen,
}: {
  folders: Folder[];
  onOpen: (key: string) => void;
}) {
  const { width } = useWindowDimensions();
  const columnW = (width - GRID_PADDING * 2) / 2;
  // Size the photos so a full three-photo pile fits in a column with a little
  // air on each side, however narrow the screen is.
  const photoW = Math.min(MAX_PHOTO_W, (columnW * 0.94) / PILE_WIDTH_IN_PHOTOS);
  const photoH = photoW * PHOTO_RATIO;
  const stackH = photoH + rs(26);
  const rows = folders.reduce<Folder[][]>((all, folder, index) => {
    if (index % 2 === 0) all.push([folder]);
    else all[all.length - 1].push(folder);
    return all;
  }, []);

  return (
    <View
      style={{
        paddingHorizontal: GRID_PADDING,
      }}
    >
      {rows.map((row, rowIndex) => (
        <View
          key={row[0].key}
          style={{
            flexDirection: "row",
            marginBottom: rs(20),
          }}
        >
          {row.map((folder) => (
            <FolderTile
              key={folder.key}
              folder={folder}
              columnW={columnW}
              stackH={stackH}
              photoW={photoW}
              photoH={photoH}
              onOpen={onOpen}
            />
          ))}
          {row.length === 1 ? <View style={{ width: "50%" }} /> : null}
        </View>
      ))}
    </View>
  );
}

function FolderTile({
  folder,
  columnW,
  stackH,
  photoW,
  photoH,
  onOpen,
}: {
  folder: Folder;
  columnW: number;
  stackH: number;
  photoW: number;
  photoH: number;
  onOpen: (key: string) => void;
}) {
  const photos = folder.items
    .map((item) => item.photo_url)
    .filter((uri): uri is string => !!uri)
    .slice(0, SLOTS.length);
  const cards = photos.length > 0 ? photos : [null];

  return (
    <Pressable
      onPress={() => onOpen(folder.key)}
      accessibilityRole="button"
      accessibilityLabel={`${folder.label} ${folder.items.length}장`}
      style={({ pressed }) => ({
        width: "50%",
        alignItems: "center",
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ width: columnW, height: stackH }}>
        {cards
          .map((uri, index) => ({ uri, slot: SLOTS[index] }))
          .reverse()
          .map(({ uri, slot }, index) => (
            <StackCard
              key={index}
              uri={uri}
              slot={slot}
              w={photoW}
              h={photoH}
              containerW={columnW}
              containerH={stackH}
            />
          ))}
      </View>
      <Text
        className="font-bold"
        numberOfLines={1}
        style={{
          width: columnW,
          textAlign: "center",
          fontSize: rs(13.5),
          color: glass.ink,
          marginTop: rs(8),
        }}
      >
        {folder.label}
      </Text>
      <Text
        style={{
          fontSize: rs(11),
          color: glass.sub,
          marginTop: 2,
          textAlign: "center",
        }}
      >
        {folder.items.length}장
      </Text>
    </Pressable>
  );
}
