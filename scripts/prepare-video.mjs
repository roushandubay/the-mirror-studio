/**
 * Prepares the hero videos for the web.
 *
 *   1. probes both files
 *   2. extracts a poster frame so the hero paints instantly (LCP) and has
 *      something to show before the video decodes
 *   3. remuxes with +faststart so the moov atom sits at the front — without it
 *      the browser must fetch the whole file before the first frame appears,
 *      which is exactly what makes a hero video feel janky instead of smooth
 *
 * ffmpeg is deliberately NOT a project dependency — its postinstall downloads a
 * large binary, which would slow every deploy. Install it only when needed:
 *
 *   npm install --no-save ffmpeg-static ffprobe-static
 *   node scripts/prepare-video.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, renameSync, existsSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

const VIDEOS = [
  { file: "public/video/hero-desktop.mp4", poster: "public/video/hero-desktop.jpg", posterWidth: 1920 },
  { file: "public/video/hero-mobile.mp4", poster: "public/video/hero-mobile.jpg", posterWidth: 1080 },
];

const run = (bin, args) =>
  execFileSync(bin, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

function probe(file) {
  const out = run(ffprobe.path, [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,r_frame_rate,codec_name",
    "-show_entries", "format=duration,size",
    "-of", "json",
    file,
  ]);
  const j = JSON.parse(out);
  const s = j.streams?.[0] ?? {};
  return {
    width: s.width,
    height: s.height,
    codec: s.codec_name,
    fps: s.r_frame_rate,
    duration: Number(j.format?.duration ?? 0),
    sizeMB: Number(j.format?.size ?? 0) / 1048576,
  };
}

const hasFastStart = (file) => {
  const head = readFileSync(file).subarray(0, 8192).toString("latin1");
  const moov = head.indexOf("moov");
  const mdat = head.indexOf("mdat");
  return moov >= 0 && (mdat < 0 || moov < mdat);
};

for (const { file, poster, posterWidth } of VIDEOS) {
  if (!existsSync(file)) {
    console.log(`skip ${file} (missing)`);
    continue;
  }

  const info = probe(file);
  console.log(
    `${file}\n  ${info.width}x${info.height} ${info.codec} ${info.fps}fps ` +
      `${info.duration.toFixed(2)}s ${info.sizeMB.toFixed(2)}MB`,
  );

  // poster frame — a little into the clip so we skip any fade-from-black
  const at = Math.min(1.2, Math.max(0, info.duration * 0.15));
  run(ffmpegPath, [
    "-y", "-loglevel", "error",
    "-ss", String(at),
    "-i", file,
    "-frames:v", "1",
    "-vf", `scale=${posterWidth}:-2:flags=lanczos`,
    "-q:v", "4",
    poster,
  ]);
  console.log(`  poster -> ${poster} @ ${at.toFixed(2)}s`);

  if (hasFastStart(file)) {
    console.log("  faststart: already at front\n");
    continue;
  }
  const tmp = file.replace(/\.mp4$/, ".faststart.mp4");
  run(ffmpegPath, [
    "-y", "-loglevel", "error",
    "-i", file,
    "-c", "copy",              // stream copy: no quality loss, no re-encode
    "-movflags", "+faststart",
    tmp,
  ]);
  renameSync(tmp, file);
  console.log(`  faststart: remuxed (moov moved to front)\n`);
}

console.log("done");
