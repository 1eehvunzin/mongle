// Content for the home screen's news panel (components/NewsPanel.tsx): update
// logs and time-boxed event notices, shown below the weather card.
//
// - Bump an item's `id` whenever its content changes — the panel reappears for
//   anyone who dismissed the old id.
// - "update": a release log. Shown only to people who already have a catch,
//   and until dismissed. List only what is actually in the shipped build.
// - "event": a campaign notice. Shown to everyone, only between `startsAt` and
//   `endsAt` (inclusive, local dates, "YYYY-MM-DD"), and drops off by itself
//   afterwards — no cleanup needed.
//
// To announce an event, add an entry like this to NEWS:
//
//   {
//     id: "2026-09-event",
//     kind: "event",
//     title: "9월 이벤트",
//     startsAt: "2026-09-01",
//     endsAt: "2026-09-30",
//     items: ["여기에 이벤트 내용을 한 줄씩 적어요"],
//   },
export type NewsItem = {
  id: string;
  kind: "update" | "event";
  title: string;
  // update: release date, "YYYY.MM.DD"
  date?: string;
  // event window, "YYYY-MM-DD"
  startsAt?: string;
  endsAt?: string;
  items: string[];
};

export const NEWS: NewsItem[] = [
  {
    id: "2026-09-cloud-dex-and-filters",
    kind: "update",
    title: "구름 도감과 피드가 더 좋아졌어요",
    date: "2026.09.22",
    items: [
      "뭉게구름부터 야광운까지, 발견할 수 있는 구름이 19종으로 늘어났어요",
      "피드에서 종류·희귀도·월별·장소별로 내 구름을 더 쉽게 모아볼 수 있어요",
      "지도 위의 구름 이름 필터로 원하는 구름 기록만 빠르게 찾아볼 수 있어요",
      "가까운 지도 기록은 하나로 묶이고, 확대하면 각각의 구름 핀으로 나뉘어요",
    ],
  },
];
