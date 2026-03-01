import { NextRequest, NextResponse } from "next/server";

// Clean text for TTS: remove characters that cause unnatural pauses or filler sounds
function cleanTextForTTS(rawText: string): string {
  let t = rawText;
  // Remove ellipsis and dashes that cause pauses
  t = t.replace(/\.{2,}/g, ".");
  t = t.replace(/[—–]/g, ",");
  // Remove parenthetical content
  t = t.replace(/\([^)]*\)/g, "");
  // Remove semicolons (cause awkward pauses)
  t = t.replace(/;/g, ",");
  // Remove filler words/sounds in multiple languages
  t = t.replace(/\b(uh|um|uhm|hmm|er|ah)\b/gi, "");
  t = t.replace(/(어|음|흠|그|에)\s/g, "");
  t = t.replace(/(えーと|あの|えー|まあ)\s?/g, "");
  // Clean up multiple commas/spaces
  t = t.replace(/,\s*,/g, ",");
  t = t.replace(/\s{2,}/g, " ");
  // Remove leading/trailing punctuation artifacts
  t = t.replace(/^[,\s]+/, "").replace(/[,\s]+$/, "");
  return t.trim();
}

export async function POST(req: NextRequest) {
  const { text, voice_id, language_code } = await req.json();

  if (!text || !voice_id) {
    return NextResponse.json({ error: "Missing text or voice_id" }, { status: 400 });
  }

  const cleanedText = cleanTextForTTS(text);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: cleanedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.75,
          style: 0.15,
          speed: 1.0,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const audioBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(audioBuffer).toString("base64");

  return NextResponse.json({
    audio: base64,
    language_code,
  });
}
