/**
 * Generates minimal PNG placeholders when assets/images are missing from the workspace.
 * Run: node scripts/generate-placeholder-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const imagesDir = path.join(root, 'assets', 'images');
const tabDir = path.join(imagesDir, 'tabIcons');

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, r, g, b) {
  const row = Buffer.alloc(1 + width * 3);
  row[0] = 0;
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }
  const raw = Buffer.alloc((1 + width * 3) * height);
  for (let y = 0; y < height; y++) {
    row.copy(raw, y * row.length);
  }
  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function writePng(filePath, size, color) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, createPng(size, size, ...color));
  console.log('Wrote', path.relative(root, filePath));
}

const stormBlue = [34, 211, 238];
const stormRose = [255, 77, 109];
const dark = [15, 23, 42];

const files = [
  ['icon.png', 1024, stormBlue],
  ['favicon.png', 48, stormBlue],
  ['splash-icon.png', 128, stormBlue],
  ['android-icon-foreground.png', 512, stormBlue],
  ['android-icon-background.png', 512, dark],
  ['android-icon-monochrome.png', 512, stormRose],
  ['expo-logo.png', 128, stormBlue],
  ['logo-glow.png', 128, stormRose],
  ['expo-badge.png', 128, stormBlue],
  ['expo-badge-white.png', 128, [248, 250, 252]],
  ['tabIcons/home.png', 48, stormBlue],
  ['tabIcons/explore.png', 48, stormRose],
  ['tabIcons/map.png', 48, stormRose],
];

for (const [rel, size, color] of files) {
  writePng(path.join(imagesDir, rel), size, color);
}
