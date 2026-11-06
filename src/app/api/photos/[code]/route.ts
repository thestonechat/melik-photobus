import { NextResponse } from "next/server";
import { getPhotos, normalizeCode } from "@/lib/photos";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const key = normalizeCode(code);
  const photos = await getPhotos(key);

  if (!photos) {
    return NextResponse.json(
      { code: key, photos: [], error: "storage_unavailable" },
      { status: 503, headers },
    );
  }

  return NextResponse.json(
    { code: key, photos },
    { status: photos.length > 0 ? 200 : 404, headers },
  );
}
