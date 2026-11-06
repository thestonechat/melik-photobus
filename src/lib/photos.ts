import { randomBytes } from "node:crypto";
import {
  issueSignedToken,
  list,
  presignUrl,
  type ListBlobResultBlob,
} from "@vercel/blob";
import { pictureManifest } from "@/data/pictures";

const PHOTO_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type PhotoContentType = keyof typeof PHOTO_EXTENSIONS;

// Crockford base32: 8 symbols of 5 bits each make a 40-bit code.
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 8;
const CODE_PATTERN = /^[0-9A-HJKMNP-TV-Z]{8}$/;

const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const UPLOAD_TTL_MS = 15 * 60 * 1000;

export function isPhotoContentType(value: unknown): value is PhotoContentType {
  return typeof value === "string" && Object.hasOwn(PHOTO_EXTENSIONS, value);
}

export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function generateCode() {
  return Array.from(
    randomBytes(CODE_LENGTH),
    (byte) => CODE_ALPHABET[byte & 31],
  ).join("");
}

/**
 * Presigns one direct-to-Blob upload per file. Tokens scope to one exact
 * pathname or the whole store, so a single store-wide token (one network call)
 * signs them all. Each URL's signature pins its own pathname and limits, and
 * `clientSigningToken` never leaves this function.
 *
 * Returns null when storage is unavailable.
 */
export async function createPhotoSession(contentTypes: PhotoContentType[]) {
  try {
    const code = generateCode();
    const token = await issueSignedToken({
      pathname: "*",
      operations: ["put"],
      allowedContentTypes: Object.keys(PHOTO_EXTENSIONS),
      maximumSizeInBytes: MAX_PHOTO_BYTES,
      validUntil: Date.now() + UPLOAD_TTL_MS,
    });

    const uploads = await Promise.all(
      contentTypes.map(async (contentType, index) => {
        const { presignedUrl } = await presignUrl(token, {
          operation: "put",
          access: "private",
          pathname: `sessions/${code}/${index + 1}.${PHOTO_EXTENSIONS[contentType]}`,
          allowedContentTypes: [contentType],
          maximumSizeInBytes: MAX_PHOTO_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
        });
        return {
          method: "PUT",
          url: presignedUrl,
          // Access is not part of the URL: the SDK's own put() sends it as a header.
          headers: {
            "content-type": contentType,
            "x-vercel-blob-access": "private",
          },
        };
      }),
    );

    return {
      code,
      expiresAt: new Date(token.validUntil).toISOString(),
      uploads,
    };
  } catch (error) {
    console.error("Photo session creation failed:", error);
    return null;
  }
}

async function listSessionPhotos(code: string) {
  const prefix = `sessions/${code}/`;
  const blobs: ListBlobResultBlob[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const page = await list({ prefix, cursor });
    blobs.push(...page.blobs);
    ({ cursor, hasMore } = page);
  }

  if (blobs.length === 0) return [];

  // Valid for the API's default of one hour. Pathnames number from 1, so a
  // numeric compare keeps 10 after 9.
  const token = await issueSignedToken({ pathname: "*", operations: ["get"] });
  const pathnames = blobs
    .map((blob) => blob.pathname)
    .filter((pathname) => pathname.startsWith(prefix))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  return Promise.all(
    pathnames.map(async (pathname) => {
      const { presignedUrl } = await presignUrl(token, {
        operation: "get",
        access: "private",
        pathname,
      });
      return presignedUrl;
    }),
  );
}

/**
 * Photo URLs for a normalized code, in shot order. Empty when the code has no
 * photos, null when storage is unavailable.
 */
export async function getPhotos(code: string): Promise<string[] | null> {
  const demoPhotos = pictureManifest[code];
  if (demoPhotos) return demoPhotos;
  if (!CODE_PATTERN.test(code)) return [];

  try {
    return await listSessionPhotos(code);
  } catch (error) {
    console.error("Photo lookup failed:", error);
    return null;
  }
}
