# Android Signing, Verification & Publishing Guide

This guide covers how to digitally sign, verify, and publish the Keg Batch Scanner Android app using **Expo Application Services (EAS)**.

---

## Overview

| Step | Tool | Command |
|------|------|---------|
| Sign & Build | EAS Build | `npm run build:production` |
| Verify signature | `jarsigner` / `apksigner` | See below |
| Publish to Play Store | EAS Submit | `npm run submit:android` |
| Build + Publish in one step | EAS Build | `npm run build-and-submit` |

---

## Prerequisites

1. **Expo account** - Sign up at https://expo.dev
2. **EAS CLI** installed globally:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. **Google Play Console** account (for publishing)
4. **EAS project linked** - Run once after cloning:
   ```bash
   eas init
   ```
   This populates the `projectId` in `app.json`.

---

## 1. Digital Signing

### How signing works with EAS

EAS Build manages your Android signing credentials (keystore) securely in the cloud. When you run a production build, EAS:

1. Generates an **upload keystore** (or uses one you provide)
2. Signs the `.aab` (Android App Bundle) with that keystore
3. Stores the keystore encrypted on Expo's servers

### Option A: Let EAS manage your keystore (recommended)

```bash
npm run build:production
```

On first run, EAS will prompt you to generate a new keystore. Select **"Generate new keystore"**. EAS stores it securely and uses it for all future builds.

### Option B: Use your own keystore

1. Generate a keystore locally:
   ```bash
   keytool -genkeypair -v \
     -storetype JKS \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000 \
     -storepass YOUR_STORE_PASSWORD \
     -keypass YOUR_KEY_PASSWORD \
     -alias keg-batch-scanner \
     -keystore keg-batch-scanner.keystore \
     -dname "CN=AB InBev, OU=Engineering, O=AB InBev, L=New York, ST=NY, C=US"
   ```

2. Upload it to EAS:
   ```bash
   npm run credentials:setup
   ```
   Select **"Update existing credentials"** > **"Keystore"** > provide the `.keystore` file and passwords.

3. **NEVER commit the keystore to git.** The `.gitignore` already excludes `*.keystore` and `*.jks` files.

### Option C: Build locally with signing

```bash
npm run build:production:local
```

This builds the signed `.aab` on your local machine. EAS will still use its managed credentials.

---

## 2. Verifying the Signature

After building, download the artifact from the EAS dashboard or via CLI.

### Verify an AAB (App Bundle)

```bash
# Download the latest build
eas build:list --platform android --limit 1

# Verify with jarsigner
jarsigner -verify -verbose -certs path/to/app.aab
```

Expected output should include:
```
jar verified.
```

### Verify an APK

```bash
# If you have Android SDK build-tools installed:
apksigner verify --print-certs path/to/app.apk

# Or with jarsigner:
jarsigner -verify -verbose -certs path/to/app.apk
```

### View keystore details

```bash
# View what credentials EAS is using
npm run credentials:info

# View local keystore details (if using your own)
keytool -list -v -keystore keg-batch-scanner.keystore
```

---

## 3. Publishing to Google Play Store

### One-time setup

#### A. Create a Google Cloud Service Account

1. Go to [Google Play Console](https://play.google.com/console) > **Setup** > **API access**
2. Link to a Google Cloud project (or create one)
3. Click **Create new service account**
4. In Google Cloud Console:
   - Create the service account
   - Grant role: **Service Account User**
   - Create a JSON key and download it
5. Back in Play Console, grant the service account **Release manager** permissions
6. Save the JSON key as `play-store-credentials.json` in the project root (it is gitignored)

#### B. Set up GitHub secrets (for CI/CD)

In your GitHub repo, go to **Settings** > **Secrets and variables** > **Actions** and add:

| Secret | Value |
|--------|-------|
| `EXPO_TOKEN` | Your EAS access token (get from https://expo.dev/accounts/[account]/settings/access-tokens) |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Contents of the `play-store-credentials.json` file |

#### C. Create your app listing

Before the first submission, you must create the app in Google Play Console:

1. Go to Play Console > **Create app**
2. Use package name: `com.abinbev.kegbatchscanner`
3. Complete the required store listing (title, description, screenshots, privacy policy)
4. Create an **internal testing** track (this is where EAS will submit first)

### Submit manually

```bash
# Submit the latest production build to Google Play
npm run submit:android
```

### Build and submit in one step

```bash
npm run build-and-submit
```

### Submit via CI/CD

Push a version tag to trigger the GitHub Actions workflow:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Or trigger manually from the GitHub Actions tab using **"Run workflow"**.

---

## 4. Release Tracks

The `eas.json` is configured to submit to the **internal** track by default. To change tracks, edit `eas.json`:

```json
"submit": {
  "production": {
    "android": {
      "track": "internal"       // internal testing (default)
      // "track": "alpha"       // closed testing
      // "track": "beta"        // open testing
      // "track": "production"  // public release
    }
  }
}
```

Recommended promotion path: **internal** -> **alpha/beta** -> **production**

---

## 5. Version Management

Versions auto-increment on each production build (configured via `autoIncrement: true` in `eas.json`). To bump the user-facing version:

```bash
# Patch: 1.0.0 -> 1.0.1
npm version patch

# Minor: 1.0.0 -> 1.1.0
npm version minor

# Major: 1.0.0 -> 2.0.0
npm version major
```

The `versionCode` (Android's internal build number) is managed by EAS automatically via `appVersionSource: "remote"`.

---

## Quick Reference

```bash
# Setup credentials for the first time
npm run credentials:setup

# Build a signed production AAB
npm run build:production

# Build a signed APK for testing
npm run build:apk

# View current signing credentials
npm run credentials:info

# Submit to Google Play Store
npm run submit:android

# Build + submit in one command
npm run build-and-submit

# Bump version and release
npm run release
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No Expo project found" | Run `eas init` to link the project |
| "Keystore not found" | Run `npm run credentials:setup` to generate or upload one |
| "Play Store rejected submission" | Ensure app listing is complete in Play Console first |
| "Service account permission denied" | Verify the service account has Release Manager role in Play Console |
| Build fails with signing error | Run `npm run credentials:info` to check credential status |
