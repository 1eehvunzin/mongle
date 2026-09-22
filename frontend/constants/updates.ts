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
    id: "2026-09-map-redesign",
    kind: "update",
    title: "지도가 새로워졌어요",
    date: "2026.09.21",
    items: [
      "지도가 화면 가득 커지고, 구름 핀이 희귀도별 색으로 표시돼요",
      "가까운 기록은 하나로 묶여 보이고, 확대하면 나뉘어요",
      "아래 시트에서 내 기록과 동네 스탬프를 보고, 기록을 누르면 지도가 그 위치로 이동해요",
      "피드에서 종류·희귀도·월별·장소별 폴더와 검색으로 내 구름을 찾아요",
      "알림을 켜면 연속 관측이 이어질 수 있게 저녁에 살짝 알려드려요",
    ],
  },
];
