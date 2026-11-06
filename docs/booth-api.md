# Booth upload API

How the photo booth hands photos to the website. Any language works: it is plain HTTP.

1. `POST /api/booth/sessions` to get a code, a QR code and one upload URL per photo.
2. `PUT` each photo straight to storage using its upload URL.
3. Show the QR code once every upload has succeeded.

Guests scan the QR code and land on `/p/<CODE>`, where the photos are already visible.

## Authentication

`POST /api/booth/sessions` requires:

```
Authorization: Bearer <BOOTH_API_KEY>
```

The key is a secret for the booth software. Do not put it in a web page, a QR code or a log. The endpoint sends no CORS headers, so it cannot be called from a browser page on another origin.

## 1. Create a session

List the photos you are about to upload, in the order guests should see them.

```sh
curl -X POST "https://YOUR-SITE/api/booth/sessions" \
  -H "Authorization: Bearer $BOOTH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "files": [{ "contentType": "image/jpeg" }, { "contentType": "image/png" }] }'
```

Response, `201 Created`:

```json
{
  "code": "7K2M9QXD",
  "url": "https://YOUR-SITE/p/7K2M9QXD",
  "qrSvg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...</svg>",
  "expiresAt": "2026-11-05T18:15:00.000Z",
  "uploads": [
    {
      "method": "PUT",
      "url": "https://...",
      "headers": {
        "content-type": "image/jpeg",
        "x-vercel-blob-access": "private"
      }
    },
    {
      "method": "PUT",
      "url": "https://...",
      "headers": {
        "content-type": "image/png",
        "x-vercel-blob-access": "private"
      }
    }
  ]
}
```

| Field       | Meaning                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| `code`      | 8 characters. Guests can also type it into the site's "Your pictures" section.                       |
| `url`       | The guest page. It is what the QR code contains.                                                     |
| `qrSvg`     | The QR code as an SVG string: white background, built-in quiet zone, scales to any size.             |
| `expiresAt` | When the upload URLs stop working (15 minutes). Guest access to the photos does not expire with it.  |
| `uploads`   | One entry per file, in request order.                                                                |

## 2. Upload the photos

For each entry in `uploads`, send the raw image bytes (not multipart) using exactly the `method`, `url` and `headers` it gives you. Treat them as opaque: do not rebuild the URL or drop headers, because they can change without notice.

```sh
curl -X PUT "$UPLOAD_URL" \
  -H "content-type: image/jpeg" \
  -H "x-vercel-blob-access: private" \
  --data-binary @photo.jpg
```

Any `2xx` means the photo is stored. Do not depend on the response body.

Each upload URL works for one photo, at one path. It only accepts the content type you declared, and only up to 15 MiB. A stored photo cannot be replaced.

## 3. Show the QR code

Show `qrSvg`, ideally with `code` beside it, **only after every upload has returned `2xx`**. Showing it earlier sends guests to a page with missing photos.

If a guest scans within a moment of the last upload and sees "not found", the page tells them to refresh.

## Limits

| Limit                  | Value                                     |
| ---------------------- | ----------------------------------------- |
| Photos per session     | 1 to 20                                   |
| Content types          | `image/jpeg`, `image/png`, `image/webp`   |
| Size per photo         | 15 MiB (15,728,640 bytes)                 |
| Upload URL lifetime    | 15 minutes                                |
| Session request body   | 4,096 characters of JSON                  |

## Errors

`POST /api/booth/sessions` returns JSON such as `{ "error": "invalid_request" }`:

| Status | `error`               | Meaning                                            | Retry?               |
| ------ | --------------------- | -------------------------------------------------- | -------------------- |
| `400`  | `invalid_request`     | Not JSON, 0 or over 20 files, or a disallowed type | No, fix the request  |
| `401`  | `unauthorized`        | Missing or wrong key                               | No, check the key    |
| `413`  | `payload_too_large`   | Request body over the limit                        | No, fix the request  |
| `503`  | `storage_unavailable` | Storage could not be reached                       | Yes, with backoff    |

The `PUT` goes to the storage provider, not this site, and its error codes are not documented. Treat anything other than `2xx` as a failed upload.

## Retries

- **Creating a session:** on `503` or a network error, retry with backoff. Nothing has been stored, and each attempt gets a new code.
- **Uploading a photo:** on a network error or `5xx`, repeat the same `PUT` up to 3 times with backoff (1s, 2s, 4s) until `expiresAt`.
- **A retry that fails after a lost response:** if the first attempt reached storage but its response was lost, the retry is refused because photos cannot be overwritten. Before giving up, check what actually arrived:

  ```sh
  curl "https://YOUR-SITE/api/photos/$CODE"
  ```

  This returns `{ "code": "...", "photos": ["..."] }`, or `404` with an empty list while nothing has arrived. If `photos` has one entry per file, the session is complete.

- **Giving up:** if a session cannot be completed, or `expiresAt` has passed, discard it and start again with a new session, uploading every photo. Never show the QR code of an incomplete session.
