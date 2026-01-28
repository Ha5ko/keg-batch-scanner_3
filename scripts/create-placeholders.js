#!/usr/bin/env node

/**
 * Creates placeholder PNG images for the app
 * Run with: node scripts/create-placeholders.js
 */

const fs = require('fs');
const path = require('path');

// Minimal 1x1 red PNG (will be stretched by Expo)
// This is a valid PNG with a single red (#D00000) pixel
const redPixelPNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, // IHDR length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // width: 1
  0x00, 0x00, 0x00, 0x01, // height: 1
  0x08, 0x02,             // bit depth: 8, color type: 2 (RGB)
  0x00, 0x00, 0x00,       // compression, filter, interlace
  0x90, 0x77, 0x53, 0xde, // IHDR CRC
  0x00, 0x00, 0x00, 0x0c, // IDAT length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x08, 0xd7, 0x63, 0xa8, 0x60, 0x60, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01,
  0x27, 0x34, 0x15, 0x8e, // IDAT CRC (approximate)
  0x00, 0x00, 0x00, 0x00, // IEND length
  0x49, 0x45, 0x4e, 0x44, // IEND
  0xae, 0x42, 0x60, 0x82  // IEND CRC
]);

// Create a proper minimal red PNG
function createRedPNG() {
  // PNG with single #D00000 pixel
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPQ0ND4HwADvgHZ7o3AHAAAAABJRU5ErkJggg==',
    'base64'
  );
  return png;
}

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const placeholder = createRedPNG();

// Write placeholder images
fs.writeFileSync(path.join(assetsDir, 'icon.png'), placeholder);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), placeholder);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), placeholder);

console.log('Created placeholder images in assets/');
console.log('');
console.log('NOTE: These are minimal 1x1 pixel placeholders.');
console.log('For production, replace with proper branded images:');
console.log('  - icon.png: 1024x1024 app icon');
console.log('  - adaptive-icon.png: 1024x1024 adaptive icon');
console.log('  - splash.png: 1284x2778 splash screen');
