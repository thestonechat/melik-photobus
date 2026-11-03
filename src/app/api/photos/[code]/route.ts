import { NextResponse } from "next/server";
import { pictureManifest } from "@/data/pictures";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const key = code.trim().toUpperCase();
  const photos = pictureManifest[key];

  if (!photos || photos.length === 0) {
    return NextResponse.json({ code: key, photos: [] }, { status: 404 });
  }

  return NextResponse.json({ code: key, photos });
}