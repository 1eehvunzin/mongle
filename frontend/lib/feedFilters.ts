// Pure filtering / folder-grouping over the feed's catch list, so
// the feed screen only has to hold UI state.
import type { CatchOut } from "./localStore";
import { isShapeCloud, SHAPE_GROUP_LABEL } from "./shapeClouds";

export type FolderGroup = "species" | "rarity" | "month" | "place";

export type FeedFilters = {
  query: string;
};

export type Folder = { key: string; label: string; items: CatchOut[] };

const RARITY_RANK: Record<string, number> = { 일반: 0, 희귀: 1, 전설: 2 };
const NO_PLACE = "위치 정보 없음";

// The "종류" tab's species grouping normally keys a folder by cloud_name —
// which would otherwise scatter shape clouds across the grid as one folder
// per drawn shape ("하트구름", "토끼구름", …), diluting the real-species
// list with one-off/custom names. Every shape cloud collapses into this one
// folder instead, pinned first regardless of count — opening it shows all
// of them as a flat list, same as any other folder.
const SHAPE_FOLDER_KEY = "__shape__";

export function applyFilters(items: CatchOut[], f: FeedFilters): CatchOut[] {
  const q = f.query.trim().toLowerCase();
  return items.filter((i) => {
    if (!q) return true;
    return [i.cloud_name, i.memo, i.place_name].some((v) =>
      v?.toLowerCase().includes(q),
    );
  });
}

function monthKey(iso: string): { key: string; label: string } {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return {
    key: `${y}-${String(m).padStart(2, "0")}`,
    label: `${y}년 ${m}월`,
  };
}

function folderOf(
  item: CatchOut,
  by: FolderGroup,
): { key: string; label: string } {
  switch (by) {
    case "species":
      if (isShapeCloud(item.cloud_type)) {
        return { key: SHAPE_FOLDER_KEY, label: SHAPE_GROUP_LABEL };
      }
      return { key: item.cloud_name, label: item.cloud_name };
    case "rarity":
      return { key: item.rarity_label, label: item.rarity_label };
    case "month":
      return monthKey(item.captured_at);
    case "place": {
      const place = item.place_name ?? NO_PLACE;
      return { key: place, label: place };
    }
  }
}

// Folders only ever exist for things the user has actually caught, so the
// folder list never hints at species that haven't been discovered yet.
export function groupItems(items: CatchOut[], by: FolderGroup): Folder[] {
  const map = new Map<string, Folder>();
  for (const item of items) {
    const { key, label } = folderOf(item, by);
    const folder = map.get(key);
    if (folder) folder.items.push(item);
    else map.set(key, { key, label, items: [item] });
  }
  const folders = [...map.values()];
  folders.sort((a, b) => {
    if (by === "species") {
      if (a.key === SHAPE_FOLDER_KEY) return -1;
      if (b.key === SHAPE_FOLDER_KEY) return 1;
    }
    if (by === "rarity")
      return (RARITY_RANK[b.key] ?? 0) - (RARITY_RANK[a.key] ?? 0);
    if (by === "month") return b.key.localeCompare(a.key);
    if (by === "place") {
      if (a.key === NO_PLACE) return 1;
      if (b.key === NO_PLACE) return -1;
    }
    return b.items.length - a.items.length;
  });
  return folders;
}
