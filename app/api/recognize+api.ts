// Expo Router API route — runs server-side only (Node during `expo start`,
// a real server on deploy). Code here, including OPENAI_API_KEY below, is
// never included in the client bundle, unlike an EXPO_PUBLIC_ variable.
import "dotenv/config";

// Kept in sync with constants/mock.ts `clouds` — the set of catches the
// client knows how to display. Recognition is asked to pick one of these
// rather than freeform text so the result always maps onto an existing dex
// entry.
const KNOWN_CLOUDS = [
  { name: "뭉게구름", type: "적운" },
  { name: "새털구름", type: "권운" },
  { name: "양떼구름", type: "권적운" },
  { name: "비늘구름", type: "고적운" },
  { name: "먹구름", type: "적란운" },
  { name: "안개구름", type: "층운" },
  { name: "렌즈구름", type: "렌즈운" },
];

type RecognizeResult = {
  name: string;
  type: string;
  confidence: number;
  reasoning: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "서버에 OPENAI_API_KEY가 설정되어 있지 않아요." },
      { status: 500 },
    );
  }

  const body = await request.json();
  const imageBase64: string | undefined = body?.imageBase64;
  if (!imageBase64) {
    return Response.json({ error: "imageBase64가 필요해요." }, { status: 400 });
  }

  const dataUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  const optionList = KNOWN_CLOUDS.map((c) => `${c.name} (${c.type})`).join(
    ", ",
  );

  const openaiResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              `너는 하늘 사진을 보고 구름 종류를 식별하는 분류기야. ` +
              `반드시 다음 목록 중 하나만 골라: ${optionList}. ` +
              `애매하면 가장 가까운 걸 골라. ` +
              `JSON으로만 답해: {"name": "목록의 한글 이름", "type": "목록의 괄호 안 한자어", ` +
              `"confidence": 0~1 사이 숫자, "reasoning": "한 문장 이유(한국어)"}.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "이 하늘 사진의 구름 종류를 식별해줘." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    },
  );

  if (!openaiResponse.ok) {
    const detail = await openaiResponse.text();
    return Response.json(
      { error: "이미지 인식에 실패했어요.", detail },
      { status: 502 },
    );
  }

  const completion = await openaiResponse.json();
  const raw = completion?.choices?.[0]?.message?.content;
  if (!raw) {
    return Response.json(
      { error: "인식 결과를 읽지 못했어요." },
      { status: 502 },
    );
  }

  let parsed: RecognizeResult;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return Response.json(
      { error: "인식 결과 형식이 올바르지 않아요.", detail: raw },
      { status: 502 },
    );
  }

  const match =
    KNOWN_CLOUDS.find((c) => c.name === parsed.name) ?? KNOWN_CLOUDS[0];

  return Response.json({
    name: match.name,
    type: match.type,
    confidence: parsed.confidence ?? null,
    reasoning: parsed.reasoning ?? "",
  });
}
