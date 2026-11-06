# 360 section video

`public/spin/` is pre-rendered from the three.js scene last present at commit `2f329f1` (`src/components/three/SpinModel.tsx`, `three/spin/*`). To change the look, restore that scene in a scratch copy and re-render.

Each frame is 1640x1080 at full size: the card at x 0-1080, the phone feed at x 1100-1640, y 0-960 (`spinFeed.ts` holds the crop). One file means card and phone are the same decoded frame.

## Re-render

1. Check out `2f329f1` in a scratch copy and set `FEED_WIDTH`/`FEED_HEIGHT` to 540/960 in `spin/spinFeed.ts`.
2. Make time steppable: `useSpinFrame` and `CameraFeed` read a global time instead of `clock.elapsedTime`, and `CameraFeed` renders on every call.
3. Make the loop periodic at 8s (the commit's scene is not):
   - `SpinModel` camera sway: `sin(music * PI / 4)` for x, `sin(music * PI / 4 - 0.94)` for y
   - `SpinStage`: `BURST_SPEED = TAU / 14 / 8`, `DECK_SPEED = -10 * TAU / 16 / 8`
   - `Dancer` sparkler: `rotation.z = stage * 5 * TAU / 8`
4. Add a scratch page with a 1080x1080 `<Canvas flat dpr={1} frameloop="never">`, the original lights and `camera`, and `Show`. For each time, call `advance()`, then composite into a 1640x1080 2D canvas: `#facc15` fill plus the WebGL canvas (the live card's CSS background), the feed canvas, and 10px of edge-stretched guard on each side of the x 1080-1100 gutter so chroma can't bleed across the crop. Fill the rest with `#171717`.
5. Save PNGs from real Chrome on a GPU (`--use-angle=metal`) at 1/30s steps, frames 0-239. The frame at t=8 must equal frame 0 exactly.
6. Encode:

```sh
VF="format=yuv420p,setparams=range=tv:color_primaries=bt709:color_trc=iec61966-2-1:colorspace=bt709"
SCALE="flags=lanczos+accurate_rnd+full_chroma_int:in_range=pc:out_range=tv:out_color_matrix=bt709"
TAG="-colorspace bt709 -color_primaries bt709 -color_trc iec61966-2-1 -color_range tv"
ffmpeg -framerate 30 -i f%04d.png -vf "scale=1230:810:$SCALE,$VF" -c:v libx264 -preset veryslow -tune animation \
  -crf 27 -profile:v high -level 4.0 -refs 4 -g 120 -bf 3 $TAG -movflags +faststart -an spin.mp4
ffmpeg -framerate 30 -i f%04d.png -vf "scale=1640:1080:$SCALE,$VF" -c:v libsvtav1 -preset 4 -crf 46 -g 120 \
  -svtav1-params tune=0 $TAG -an spin.webm
ffmpeg -i f0000.png -vf scale=1230:810:flags=lanczos -c:v libwebp -quality 75 -compression_level 6 poster.webp
```

Number the frames for the encode from t=4 (`STILL_TIME`), wrapping to t=0 halfway through, so `f0000` is the slow-motion frame. The browser holds the last frame slightly at the loop point, and in slow motion that does not show. The poster is the same frame, so the swap from poster to video does not jump. The HUD adds `STILL_TIME` back to the media time. Use `-framerate` with the 30fps frames rather than `select`: `select` drops the last frame's duration and the loop then skips a frame.

Tag the transfer as sRGB (shipped files were retagged this way): with `bt709` transfer, H.264 in Chrome and WebKit on macOS applied a gamma conversion and `#facc15` displayed as `#fbd215`. With the sRGB tag it displays as `#facc15` to `#facb15`. For H.264, x264 needs `-x264-params transfer=iec61966-2-1` if the tag above does not reach the bitstream; confirm with ffprobe.
