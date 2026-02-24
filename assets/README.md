# App Assets

This folder should contain the following image files:

## Required Images

1. **icon.png** (1024x1024)
   - Main app icon
   - Used for app store and home screen

2. **splash.png** (1284x2778)
   - Splash screen shown when app launches
   - Recommended: AB InBev logo on red (#D00000) background

3. **adaptive-icon.png** (1024x1024)
   - Android adaptive icon foreground
   - Should have transparent background

## Quick Setup

You can create simple placeholder icons using any image editor, or use an online tool:

1. Go to https://www.canva.com or any image editor
2. Create a 1024x1024 image with:
   - Red background (#D00000)
   - White text "KEG" in center
3. Save as icon.png and adaptive-icon.png
4. Create a 1284x2778 version for splash.png

Or use the generate script (requires ImageMagick):

```bash
./scripts/generate-assets.sh
```
