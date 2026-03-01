import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PASSPORT_DIR = "/tmp/voicepassport";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const filePath = path.join(PASSPORT_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Passport not found" }, { status: 404 });
  }
}
