import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { renderSVG } from "uqr";
import {
  createPhotoSession,
  isPhotoContentType,
  type PhotoContentType,
} from "@/lib/photos";

const MAX_FILES = 20;
const MAX_BODY_LENGTH = 4096;
const NO_STORE = { "Cache-Control": "private, no-store" };

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

function isAuthorized(request: Request) {
  const key = process.env.BOOTH_API_KEY;
  if (!key) {
    console.error("BOOTH_API_KEY is not set: rejecting booth requests");
    return false;
  }
  const header = request.headers.get("authorization") ?? "";
  return timingSafeEqual(sha256(header), sha256(`Bearer ${key}`));
}

function parseContentTypes(body: string): PhotoContentType[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }

  const files = (parsed as { files?: unknown } | null)?.files;
  if (!Array.isArray(files) || files.length < 1 || files.length > MAX_FILES) {
    return null;
  }

  const contentTypes = files.map(
    (file: { contentType?: unknown } | null) => file?.contentType,
  );
  return contentTypes.every(isPhotoContentType) ? contentTypes : null;
}

function errorResponse(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return errorResponse("unauthorized", 401, {
      "WWW-Authenticate": "Bearer",
    });
  }

  const body = await request.text();
  if (body.length > MAX_BODY_LENGTH) {
    return errorResponse("payload_too_large", 413);
  }

  const contentTypes = parseContentTypes(body);
  if (!contentTypes) return errorResponse("invalid_request", 400);

  const session = await createPhotoSession(contentTypes);
  if (!session) return errorResponse("storage_unavailable", 503);

  const url = `${new URL(request.url).origin}/p/${session.code}`;

  return NextResponse.json(
    { ...session, url, qrSvg: renderSVG(url, { border: 4 }) },
    { status: 201, headers: NO_STORE },
  );
}
