# Keg Batch Scanner

A mobile app for scanning keg batch codes and syncing to Google Sheets.

## Quick Start

1. **Set up Google Sheets backend** - See [SETUP.md](SETUP.md) for detailed instructions
2. **Configure the app** - Add your Google Script URL to `src/utils/config.ts`
3. **Install and run**:

```bash
npm install
npm start
```

4. Scan the QR code with Expo Go on your Android phone

## Build APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Documentation

See [SETUP.md](SETUP.md) for complete setup instructions.
