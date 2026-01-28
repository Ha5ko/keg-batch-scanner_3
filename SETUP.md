# Keg Batch Scanner - Complete Setup Guide

This guide walks you through setting up the Keg Batch Scanner app from scratch.

## Overview

The app consists of two parts:
1. **React Native App** - Runs on your Android phone
2. **Google Apps Script** - Backend that writes scans to Google Sheets

---

## Part 1: Google Sheets & Apps Script Setup

### Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create a new spreadsheet
3. Name it **"Keg Batch Scans"** (click on "Untitled spreadsheet" at top-left)
4. Note the spreadsheet URL - you'll need the ID later

### Step 2: Set Up Google Apps Script

1. In your new spreadsheet, go to **Extensions → Apps Script**
2. This opens the script editor in a new tab
3. Delete any existing code in the editor
4. Copy the entire contents of `google-apps-script/Code.gs` from this repo
5. Paste it into the script editor
6. Click **File → Save** (or Ctrl+S)
7. Name the project **"Keg Scanner API"**

### Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Fill in the deployment settings:
   - **Description**: `Keg Scanner API v1`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. Click **Authorize access** and sign in with your Google account
6. Review permissions and click **Allow**
7. **IMPORTANT**: Copy the **Web app URL** that appears - you need this!

The URL looks like:
```
https://script.google.com/macros/s/AKfycb.../exec
```

### Step 4: Test the Script

1. In Apps Script, click the dropdown next to "Debug" and select `testAddScan`
2. Click **Run**
3. Go back to your spreadsheet - you should see:
   - A new sheet called "Keg Scans"
   - One test row with data

If this works, your backend is ready!

---

## Part 2: Configure the App

### Step 1: Add Your Web App URL

Open `src/utils/config.ts` and replace the placeholder:

```typescript
// Before
export const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

// After
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

### Step 2: Verify Your Email

In the same file, confirm your email is correct:

```typescript
export const USER_EMAIL = 'shantu.hasko@ab-inbev.com';
```

---

## Part 3: Install and Run

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo Go app on your Android phone (from Play Store)

### Step 1: Install Dependencies

```bash
cd keg-batch-scanner3
npm install
```

### Step 2: Start Development Server

```bash
npm start
```

This shows a QR code in your terminal.

### Step 3: Run on Your Phone

1. Open **Expo Go** app on your Android phone
2. Tap **"Scan QR Code"**
3. Scan the QR code from your terminal
4. The app will load on your phone!

---

## Part 4: Build APK for Production

When ready to create a standalone APK:

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Step 2: Build APK

```bash
eas build --platform android --profile preview
```

This builds an APK you can install directly on Android devices.

---

## Troubleshooting

### "Camera not working"
- Make sure you granted camera permissions
- Restart the app after granting permissions

### "Sync failed"
- Check your internet connection
- Verify the Google Script URL is correct
- Make sure the script is deployed as "Anyone can access"

### "Duplicate scan" message
- The app prevents scanning the same code within 5 seconds
- Wait a moment and try again

### "Network error" on sync
- Check if you're connected to WiFi or mobile data
- The app stores scans offline and syncs when connected

### Script deployment issues
- Make sure you selected "Anyone" for access
- Try redeploying the script
- Check the Apps Script execution log for errors

---

## Project Structure

```
keg-batch-scanner3/
├── App.tsx                 # Main entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── src/
│   ├── components/        # UI components
│   │   ├── Header.tsx
│   │   ├── HistoryList.tsx
│   │   ├── ScanCounter.tsx
│   │   ├── ScanFeedback.tsx
│   │   └── StatusBar.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useScanner.ts  # Barcode scanning logic
│   │   └── useSync.ts     # Sync functionality
│   ├── screens/           # App screens
│   │   └── ScannerScreen.tsx
│   ├── services/          # Business logic
│   │   ├── api.ts         # Google Sheets API
│   │   └── storage.ts     # Local storage
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   └── utils/             # Utilities
│       ├── config.ts      # App configuration
│       └── helpers.ts     # Helper functions
├── google-apps-script/    # Backend code
│   └── Code.gs
└── assets/                # App icons and images
```

---

## Features

- **Barcode Scanning**: Supports QR, EAN, Code128, Code39, and more
- **Offline Support**: Scans are stored locally until synced
- **Auto-Sync**: Automatically syncs when online
- **Duplicate Prevention**: Prevents scanning same code within 5 seconds
- **Haptic Feedback**: Vibrates on successful scan
- **Scan History**: View past scans in the app
- **Real-time Status**: Shows online/offline and pending count

---

## Support

For issues or questions, contact: shantu.hasko@ab-inbev.com
