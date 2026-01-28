#!/usr/bin/env node

/**
 * Creates valid PNG files for Expo assets
 * These are simple solid-color images that will work with the build process
 */

const fs = require('fs');
const path = require('path');

// Valid minimal PNG with proper structure (red color #D00000)
// This is a properly formatted 100x100 red PNG
function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);   // width
  ihdrData.writeUInt32BE(height, 4);  // height
  ihdrData.writeUInt8(8, 8);          // bit depth
  ihdrData.writeUInt8(2, 9);          // color type (RGB)
  ihdrData.writeUInt8(0, 10);         // compression
  ihdrData.writeUInt8(0, 11);         // filter
  ihdrData.writeUInt8(0, 12);         // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk (image data)
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    rawData[rowStart] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      rawData[pixelStart] = r;     // R
      rawData[pixelStart + 1] = g; // G
      rawData[pixelStart + 2] = b; // B
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  const table = makeCrcTable();

  for (let i = 0; i < buffer.length; i++) {
    crc = table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }

  return crc ^ 0xffffffff;
}

function makeCrcTable() {
  const table = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }
  return table;
}

// Create assets directory
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// AB InBev red: #D00000 = RGB(208, 0, 0)
const red = { r: 208, g: 0, b: 0 };

// Create icon (1024x1024) - using smaller size that will be scaled
console.log('Creating icon.png...');
const icon = createPNG(512, 512, red.r, red.g, red.b);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);

console.log('Creating adaptive-icon.png...');
const adaptiveIcon = createPNG(512, 512, red.r, red.g, red.b);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIcon);

console.log('Creating splash.png...');
const splash = createPNG(512, 512, red.r, red.g, red.b);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash);

console.log('\n✅ Created valid PNG files in assets/');
console.log('   - icon.png (512x512)');
console.log('   - adaptive-icon.png (512x512)');
console.log('   - splash.png (512x512)');
