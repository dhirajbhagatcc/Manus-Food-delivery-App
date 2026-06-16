// Generates ApplyTrack PWA/app icons as PNGs (no external deps).
// Draws a "target" mark: indigo background with concentric rings.
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public");
fs.mkdirSync(OUT, { recursive: true });

// CRC32 table
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function hexToRgb(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

function drawIcon(size, { maskable = false } = {}) {
  const bg = hexToRgb("#4f46e5"); // indigo-600
  const white = [255, 255, 255];
  const ring = hexToRgb("#c7d2fe"); // indigo-200
  const dot = hexToRgb("#f43f5e"); // rose-500 bullseye

  const cx = size / 2;
  const cy = size / 2;
  // Smaller artwork radius for maskable safe-zone.
  const maxR = size * (maskable ? 0.34 : 0.42);

  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      let color = bg;
      if (d <= maxR) {
        const r = d / maxR; // 0..1 within artwork
        if (r > 0.82) color = white;
        else if (r > 0.62) color = ring;
        else if (r > 0.42) color = white;
        else if (r > 0.22) color = ring;
        else color = dot;
      }
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = 255;
    }
  }

  // Add filter byte (0) at the start of each scanline.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const targets = [
  ["pwa-192x192.png", 192, {}],
  ["pwa-512x512.png", 512, {}],
  ["maskable-512x512.png", 512, { maskable: true }],
  ["apple-touch-icon.png", 180, {}],
  ["favicon-32x32.png", 32, {}],
];
for (const [name, size, opts] of targets) {
  fs.writeFileSync(path.join(OUT, name), drawIcon(size, opts));
  console.log("wrote", name);
}
