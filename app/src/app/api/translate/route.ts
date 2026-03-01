import { NextRequest, NextResponse } from "next/server";

const LANGUAGES = [
  { code: "en", name: "English", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { code: "ko", name: "Korean", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { code: "ja", name: "Japanese", flag: "\ud83c\uddef\ud83c\uddf5" },
  { code: "zh", name: "Chinese (Mandarin)", flag: "\ud83c\udde8\ud83c\uddf3" },
  { code: "es", name: "Spanish", flag: "\ud83c\uddea\ud83c\uddf8" },
  { code: "fr", name: "French", flag: "\ud83c\uddeb\ud83c\uddf7" },
  { code: "de", name: "German", flag: "\ud83c\udde9\ud83c\uddea" },
  { code: "pt", name: "Portuguese", flag: "\ud83c\udde7\ud83c\uddf7" },
  { code: "it", name: "Italian", flag: "\ud83c\uddee\ud83c\uddf9" },
  { code: "hi", name: "Hindi", flag: "\ud83c\uddee\ud83c\uddf3" },
  { code: "ar", name: "Arabic", flag: "\ud83c\uddf8\ud83c\udde6" },
];

export { LANGUAGES };

export async function POST(req: NextRequest) {
  const { text, targetCodes } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text" }, { status: 400 });
  }

  // Use only the requested languages, or all if not specified
  const langsToTranslate = targetCodes
    ? LANGUAGES.filter((l) => targetCodes.includes(l.code))
    : LANGUAGES;

  const prompt = `You are a professional multilingual copywriter. Your task is NOT to translate — it is to REWRITE a self-introduction as a native speaker of each target language would naturally say it.

STEP 1 — CLEAN THE SOURCE:
Take the original text below and extract ONLY the core meaning. Remove ALL:
- Filler words in any language: uh, um, like, you know, so, well, 어, 음, 그, 좀, 이제, 약간, 뭐랄까, えーと, あの
- False starts, repetitions, stutters, trailing words
- Rambling or redundant phrases
Result: a clean, concise version of what the speaker MEANT to say.

STEP 2 — REWRITE FOR EACH LANGUAGE:
For each language, write how a confident native speaker would introduce themselves with the SAME information at a professional networking event. This is NOT translation — it is cultural adaptation.

ABSOLUTE FORMATTING RULES (for TTS output):
- NO ellipsis (...)
- NO em dashes (—) or en dashes (–)
- NO semicolons
- NO parentheses
- Use only periods, commas, and question marks
- Use short, direct sentences. Max 15 words per sentence.
- NO filler sounds or hesitation markers in ANY language
- The text must read smoothly when spoken aloud with zero pauses

LANGUAGE-SPECIFIC STYLE:
- English: Confident, casual professional. "Hi, I'm..." not "Hello, my name is..."
- Korean: 자연스러운 존댓말. "안녕하세요, 저는 ~입니다" 스타일. 격식체 아닌 부드러운 구어체.
- Japanese: 明るい自己紹介. "~と申します" より "~です" の方が自然.
- Chinese: 轻松的口语风格. 像在咖啡店聊天一样自然.
- Spanish: Tono cálido y directo. Como presentándote en un café.
- French: Ton décontracté mais professionnel. Pas de formalisme excessif.
- German: Freundlich und direkt. Wie bei einem Networking-Event.
- Portuguese: Tom caloroso e confiante. Estilo conversa informal.
- Italian: Tono caloroso e sicuro. Come a un aperitivo di networking.
- Hindi: गर्मजोशी से, आत्मविश्वास के साथ. जैसे किसी इवेंट में मिल रहे हों.
- Arabic: لهجة واثقة ودافئة. كأنك تقدم نفسك في لقاء مهني.

Original text:
"${text}"

Return ONLY a valid JSON object. Keys = language codes, values = rewritten text. No markdown, no explanation, no code blocks.
Languages: ${langsToTranslate.map((l) => `${l.code} (${l.name})`).join(", ")}
You MUST include ALL ${langsToTranslate.length} languages. Do not skip any.`;

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  const content = data.choices[0].message.content;

  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const translations = JSON.parse(cleaned);
    return NextResponse.json({ translations, languages: LANGUAGES });
  } catch {
    return NextResponse.json({ error: "Failed to parse translations", raw: content }, { status: 500 });
  }
}
