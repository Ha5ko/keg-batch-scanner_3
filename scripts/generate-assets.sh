#!/bin/bash

# Generate placeholder assets for Keg Batch Scanner
# Requires ImageMagick (install with: sudo apt install imagemagick)

ASSETS_DIR="$(dirname "$0")/../assets"

echo "Generating app assets..."

# Create icon.png (1024x1024)
convert -size 1024x1024 xc:'#D00000' \
  -gravity center \
  -fill white \
  -font DejaVu-Sans-Bold \
  -pointsize 300 \
  -annotate 0 'KEG' \
  "$ASSETS_DIR/icon.png"

echo "Created icon.png"

# Create adaptive-icon.png (1024x1024 with transparent background for Android)
convert -size 1024x1024 xc:transparent \
  -fill '#D00000' \
  -draw "circle 512,512 512,100" \
  -gravity center \
  -fill white \
  -font DejaVu-Sans-Bold \
  -pointsize 250 \
  -annotate 0 'KEG' \
  "$ASSETS_DIR/adaptive-icon.png"

echo "Created adaptive-icon.png"

# Create splash.png (1284x2778)
convert -size 1284x2778 xc:'#D00000' \
  -gravity center \
  -fill white \
  -font DejaVu-Sans-Bold \
  -pointsize 200 \
  -annotate 0 'KEG\nSCANNER' \
  "$ASSETS_DIR/splash.png"

echo "Created splash.png"

echo "Done! Assets generated in $ASSETS_DIR"
