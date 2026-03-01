import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

const PASSPORT_DIR = "/tmp/voicepassport";

async function ensureDir() {
  try { await fs.mkdir(PASSPORT_DIR, { recursive: true }); } catch { /* exists */ }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.name || !data.entries || data.entries.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = uuidv4().slice(0, 8);

    const passport = {
      name: data.name,
      title: data.title || "",
      photo: data.photo || null,
      photoZoom: data.photoZoom || 1,
      photoOffsetY: data.photoOffsetY || 0,
      email: data.email || "",
      phone: data.phone || "",
      company: data.company || "",
      location: data.location || "",
      links: data.links || [],
      primaryLink: data.primaryLink || null,
      nativeLang: data.nativeLang || "en",
      transcript: data.transcript || "",
      originalAudio: data.originalAudio || null,
      entries: data.entries,
      createdAt: new Date().toISOString(),
    };

    await ensureDir();
    await fs.writeFile(
      path.join(PASSPORT_DIR, `${id}.json`),
      JSON.stringify(passport)
    );

    return NextResponse.json({ id, url: `/p/${id}` });
  } catch (err) {
    console.error("Save passport error:", err);
    return NextResponse.json({ error: "Failed to save passport" }, { status: 500 });
  }
}
