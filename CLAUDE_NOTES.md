# Claude Development Notes - Keg Batch Scanner

This file contains context for future Claude sessions working on this project.

## Project Overview

Android app for AB-InBev warehouse workers to scan keg batch codes using OCR and sync to Google Sheets.

**User:** x

## Tech Stack & Why

| Technology | Purpose | Why This Choice |
|------------|---------|-----------------|
| React Native + Expo SDK 50 | App framework | Cross-platform, managed workflow |
| expo-image-picker | Camera | **CRITICAL: expo-camera caused crashes**. Image picker uses native camera app - stable |
| @react-native-ml-kit/text-recognition | OCR | On-device ML, works with image picker output |
| expo-device | Device info | Captures phone model for tracking |
| AsyncStorage | Local storage | Offline backup of scans |
| Google Apps Script | Backend | No server needed, direct Sheets integration |

## Critical Issues & Solutions

### 1. App Crashing on Startup (SOLVED)
- **Cause:** Missing `SafeAreaProvider` wrapper
- **Solution:** Wrap entire app in `<SafeAreaProvider><MainApp /></SafeAreaProvider>`

### 2. expo-camera Crashes App (AVOIDED)
- **Issue:** Any use of expo-camera caused immediate crash on startup
- **Attempted:** Lazy loading, minimal implementation - all crashed
- **Solution:** Use `expo-image-picker` instead - opens native camera app, much more stable

### 3. OCR Not Detecting Batch Codes (SOLVED)
- **Issue:** Regex too strict, missed varied formats like `LS28401809:30`
- **Solution:** Flexible pattern: `L[A-Z0-9]{5,}` with optional time suffix
- **Location:** `findBatchCode()` function in App.tsx:42-68

### 4. PNG CRC Errors During Build (SOLVED)
- **Cause:** Placeholder PNG files in assets/ were invalid
- **Solution:** Generated proper PNG files with correct checksums

## Current Features

- Camera capture with 3:1 crop ratio for batch codes
- ML Kit OCR auto-detects L-codes from photos
- Real-time sync to Google Sheets on each save
- Device identifier tracking (brand + model)
- Local storage backup
- Duplicate codes allowed (same keg can be scanned multiple times)

## File Structure

```
App.tsx                      # Main app - all UI and logic in one file
app.json                     # Expo config with camera permissions
package.json                 # Dependencies
google-apps-script/Code.gs   # Google Sheets backend (user deploys separately)
assets/                      # App icons (must be valid PNGs!)
```

## Configuration

In `App.tsx` lines 23-25:
```typescript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
const USER_EMAIL = 'x';
```

## Google Sheets Columns

| Scan ID | Batch Code | Scan Timestamp | Synced At | User Email | Device |

## Build Commands

```bash
# Install dependencies
npm install

# Build Android APK
eas build --platform android --profile preview

# Must have eas.json configured (already done)
```

## Potential Future Improvements (Discussed with User)

**High priority:**
1. Sound/vibration feedback on successful scan
2. Quick re-scan button (one tap to open camera again)
3. Delete individual scans (swipe to remove)
4. Offline queue with auto-retry

**Medium priority:**
5. Session grouping (group scans by shift)
6. Scan counter/target ("15 of 50 scans")
7. Multiple users dropdown
8. Local timestamp display

## Batch Code Patterns

Examples seen:
- `L5078MA 10:52` (L + 4 digits + 2 letters + time)
- `L5074BB` (L + 4 digits + 2 letters)
- `LS28401809:30` (L + alphanumeric + time, no space)

Current regex handles all these with: `L[A-Z0-9]{5,}[\s]*\d{1,2}:\d{2}` and `L[A-Z0-9]{5,}`

## Known Limitations

1. **No camera HUD overlay** - expo-image-picker uses native camera, can't customize
2. **Crop box size not controllable** - only aspect ratio (3:1) is set, size/position is native UI
3. **No autofocus control** - native camera handles this, user can tap to focus

## Session Context

This app was built from scratch in one session. Started with expo-camera approach which failed, pivoted to expo-image-picker which worked. OCR was added after camera was stable. Google Sheets sync added last.

The user is technical but prefers cloud-based development (GitHub Codespaces).
