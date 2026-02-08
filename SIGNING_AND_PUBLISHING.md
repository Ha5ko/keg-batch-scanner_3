# Android Signing, Verification & Publishing Guide

Complete first-time walkthrough for building, signing, verifying, and publishing the **Keg Batch Scanner** Android app to the Google Play Store.

---

## What You Need Before Starting

You will need all of the following. If you don't have them yet, follow each step below.

| Requirement | Cost | Where to get it |
|-------------|------|-----------------|
| An **Expo account** | Free | https://expo.dev/signup |
| **Node.js 18+** installed | Free | https://nodejs.org |
| A **Google Play Developer account** | $25 one-time fee | https://play.google.com/console/signup |
| A **Google Cloud project** (for API access) | Free | Created during setup below |
| **Java JDK** (only needed to verify signatures locally) | Free | `sudo apt install default-jdk` or https://adoptium.net |

---

## Phase 1: Account & Project Setup

### Step 1.1 - Create your Expo account

1. Go to https://expo.dev/signup
2. Sign up with email or GitHub
3. Remember your username -- you'll need it later

### Step 1.2 - Install the EAS CLI

Open your terminal and run:

```bash
npm install -g eas-cli
```

Verify it installed:

```bash
eas --version
```

You should see something like `eas-cli/12.x.x`.

### Step 1.3 - Log in to Expo from your terminal

```bash
eas login
```

Enter the email and password from Step 1.1. You'll see:

```
Logged in as your-username
```

### Step 1.4 - Link this project to your Expo account

Navigate to the project directory and run:

```bash
cd /path/to/keg-batch-scanner3
eas init
```

This will:
- Create a project on your Expo account called "keg-batch-scanner"
- Automatically fill in the `projectId` field in `app.json` (line 41)

You'll see output like:

```
Linked to project @your-username/keg-batch-scanner (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
```

**Commit this change** -- the `projectId` in `app.json` should be in version control.

---

## Phase 2: Signing Your App

Android apps must be signed with a cryptographic key before they can be installed or published. EAS handles this for you.

### Step 2.1 - Build a signed production app bundle

Run:

```bash
npm run build:production
```

This runs: `eas build --platform android --profile production`

**What happens on first run:**

EAS will ask you about signing credentials. You'll see prompts like this:

```
No credentials found for com.abinbev.kegbatchscanner.
Generate a new Android Keystore? (Y/n)
```

**Type `Y` and press Enter.**

EAS will:
1. Generate a new Android Keystore (the signing key)
2. Encrypt it and store it securely on Expo's servers
3. Start building your app in the cloud
4. Sign the `.aab` (Android App Bundle) with that keystore

You'll see a URL like:

```
Build started: https://expo.dev/accounts/your-username/projects/keg-batch-scanner/builds/xxxxxxxx
```

**The build takes 5-15 minutes.** You can:
- Watch the progress at that URL in your browser
- Or wait in the terminal -- it will notify you when done

When finished, you'll see:

```
Build finished.
https://expo.dev/artifacts/eas/xxxxxxxx.aab
```

**That `.aab` file is your signed app.** Click the link to download it.

### Step 2.2 - Verify your credentials are saved

Run:

```bash
npm run credentials:info
```

You'll see details about your stored keystore:

```
Android Credentials (com.abinbev.kegbatchscanner)
  Keystore:
    Type:          JKS
    Key Alias:     xxxxxxxxxxxxxxxx
    MD5:           XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
    SHA1:          XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
    SHA256:        XX:XX:XX:XX:...
```

**Save the SHA1 and SHA256 fingerprints somewhere safe** -- Google Play will show these to verify your app's identity.

### Alternative: Build a test APK first (optional)

If you want to build a test APK to sideload on a device before publishing:

```bash
npm run build:apk
```

This builds a `.apk` file (not `.aab`) that you can install directly on a phone.

---

## Phase 3: Verifying the Signature

After downloading the built `.aab` or `.apk` file, you can verify it was properly signed.

### Step 3.1 - Verify an AAB file

```bash
jarsigner -verify -verbose -certs ~/Downloads/your-app.aab
```

Look for this line in the output:

```
jar verified.
```

If you see `jar verified`, the app is correctly signed.

### Step 3.2 - Verify an APK file

If you built an APK instead:

```bash
# Option A: Using jarsigner (comes with Java JDK)
jarsigner -verify -verbose -certs ~/Downloads/your-app.apk

# Option B: Using apksigner (comes with Android SDK build-tools)
# Only available if you have Android Studio installed
apksigner verify --print-certs ~/Downloads/your-app.apk
```

### Step 3.3 - View signing certificate details

To see the full certificate details of a signed file:

```bash
jarsigner -verify -verbose -certs ~/Downloads/your-app.aab 2>&1 | grep -A5 "Certificate"
```

This shows who signed it and when the certificate expires.

---

## Phase 4: Publishing to Google Play Store

### Step 4.1 - Create a Google Play Developer account

1. Go to https://play.google.com/console/signup
2. Sign in with a Google account (use a company/team account, not personal)
3. Pay the **$25 one-time registration fee**
4. Complete the account verification (may take 24-48 hours)

### Step 4.2 - Create your app in the Play Console

1. Log in to https://play.google.com/console
2. Click **"Create app"** (blue button, top right)
3. Fill in:
   - **App name**: `Keg Batch Scanner`
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or Paid, your choice)
   - Check all the declaration boxes
4. Click **"Create app"**

### Step 4.3 - Complete the store listing

Google requires several things before you can publish. Navigate through the left sidebar:

**Dashboard > Set up your app** -- Complete each required item:

1. **App access** - Select "All functionality is available without special access" (or configure access if the app requires login)
2. **Ads** - Select whether the app contains ads (probably "No")
3. **Content rating** - Fill out the questionnaire (takes ~5 minutes)
4. **Target audience** - Select age groups
5. **News app** - Select "No"
6. **Data safety** - Declare what data the app collects:
   - The app uses the camera (for scanning batch codes)
   - The app stores scan data locally on the device
   - Fill out the form honestly based on what the app does

**Store listing** (left sidebar > **Main store listing**):

1. **App name**: Keg Batch Scanner
2. **Short description** (max 80 chars): `Scan and track keg batch codes with OCR technology`
3. **Full description** (max 4000 chars): Write a description of what the app does
4. **App icon**: Upload a 512x512 PNG (you can use the `assets/icon.png` from the project)
5. **Feature graphic**: Upload a 1024x500 PNG banner image
6. **Phone screenshots**: Upload at least 2 screenshots (take these from a running device or emulator)
7. **Privacy policy URL**: You must provide a URL to a privacy policy page

### Step 4.4 - Create an Internal Testing track

1. In Play Console, go to **Testing > Internal testing** (left sidebar)
2. Click **"Create new release"**
3. For now, you can leave it empty -- EAS Submit will upload the AAB for you
4. Click **"Save"** (not "Review release" yet)
5. Under **Testers** tab, create an email list and add tester email addresses

### Step 4.5 - Set up API access (so EAS can submit automatically)

This is the most involved step. You're creating a "service account" that gives EAS permission to upload builds to your Play Console.

**In Google Play Console:**

1. Go to **Setup > API access** (left sidebar, near the bottom)
2. If prompted, click **"Link"** to link to a Google Cloud project (or **"Create new project"**)
3. Under **Service accounts**, click **"Create new service account"**
4. A dialog appears telling you to go to Google Cloud Console. Click the **"Google Cloud Console"** link

**In Google Cloud Console (new tab):**

5. You should be on the Service Accounts page. Click **"+ CREATE SERVICE ACCOUNT"** (top)
6. Fill in:
   - **Name**: `play-store-publisher`
   - **ID**: auto-fills as `play-store-publisher`
   - **Description**: `Uploads builds to Google Play via EAS`
7. Click **"CREATE AND CONTINUE"**
8. For role, select **"Basic > Editor"** (or skip this and set permissions in Play Console instead)
9. Click **"CONTINUE"**, then **"DONE"**
10. Back on the Service Accounts list, find `play-store-publisher` and click the **three dots (...)** on the right > **"Manage keys"**
11. Click **"ADD KEY" > "Create new key"**
12. Select **"JSON"** and click **"CREATE"**
13. **A JSON file downloads automatically.** This is your credentials file. Keep it safe.

**Back in Google Play Console:**

14. Click **"Done"** on the dialog
15. Click **"Refresh service accounts"** -- your new service account should appear
16. Click **"Grant access"** next to it
17. Under **App permissions**, click **"Add app"** > select **"Keg Batch Scanner"** > **"Apply"**
18. Under **Account permissions**, enable at minimum:
    - **Releases** (all sub-permissions)
    - **Store presence** > "Edit and delete draft apps"
19. Click **"Invite user"** > **"Send invite"**

### Step 4.6 - Save the credentials file to your project

1. Rename the downloaded JSON file to `play-store-credentials.json`
2. Move it to the root of this project:

```bash
mv ~/Downloads/your-downloaded-file.json ./play-store-credentials.json
```

This file is already in `.gitignore` so it won't be committed. **Never share this file publicly.**

### Step 4.7 - Submit your app to Google Play

**Option A: Submit the latest build** (after you already ran `npm run build:production`)

```bash
npm run submit:android
```

EAS will:
1. Find your latest production build
2. Read `play-store-credentials.json`
3. Upload the `.aab` to Google Play's internal testing track
4. Report success or failure

You'll see prompts like:

```
Submitting to Google Play Store (internal track)...
Successfully submitted build to Google Play Store!
```

**Option B: Build and submit in one command**

```bash
npm run build-and-submit
```

This builds a fresh signed AAB and then immediately submits it.

### Step 4.8 - Check the result in Play Console

1. Go to Play Console > **Testing > Internal testing**
2. You should see a new release with your uploaded AAB
3. Click **"Review release"**
4. Click **"Start rollout to Internal testing"**
5. Internal testers (from Step 4.4) will receive an email/link to install the app

---

## Phase 5: Promoting to Production (Public Release)

Once you've tested via internal testing and are ready to go public:

### Step 5.1 - Change the submission track

Edit `eas.json` and change `"track"` from `"internal"` to `"production"`:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./play-store-credentials.json",
      "track": "production",
      "releaseStatus": "draft",
      "changesNotSentForReview": true
    }
  }
}
```

### Step 5.2 - Submit to production

```bash
npm run build-and-submit
```

### Step 5.3 - Finalize in Play Console

1. Go to **Production** in Play Console
2. Review the release
3. Click **"Start rollout to Production"**
4. Google reviews the app (typically 1-7 days for first submission)

---

## Phase 6: Automated CI/CD with GitHub Actions

The `.github/workflows/build-and-publish.yml` workflow automates everything above. Here's how to set it up.

### Step 6.1 - Create an Expo access token

1. Go to https://expo.dev
2. Click your profile icon > **"Access tokens"** (or go to Account Settings > Access tokens)
3. Click **"Create token"**
4. Name it: `github-actions`
5. Copy the token value (you won't see it again)

### Step 6.2 - Add GitHub secrets

1. Go to your GitHub repo: https://github.com/Ha5ko/keg-batch-scanner3
2. Click **Settings** tab > **Secrets and variables** > **Actions** (left sidebar)
3. Click **"New repository secret"** and add these two secrets:

**Secret 1:**
- **Name**: `EXPO_TOKEN`
- **Value**: Paste the access token from Step 6.1

**Secret 2:**
- **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Value**: Paste the **entire contents** of your `play-store-credentials.json` file
  ```bash
  # Copy the contents to your clipboard:
  cat play-store-credentials.json | pbcopy    # macOS
  cat play-store-credentials.json | xclip     # Linux
  ```

### Step 6.3 - Trigger a release

**Automatic trigger** - Push a version tag:

```bash
# Tag the current commit
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

This triggers the workflow to build, sign, and submit to the Play Store automatically.

**Manual trigger:**

1. Go to GitHub repo > **Actions** tab
2. Click **"Build, Sign & Publish Android"** in the left sidebar
3. Click **"Run workflow"**
4. Choose profile (`production` or `preview`)
5. Check "Submit to Play Store after build" if you want auto-submission
6. Click **"Run workflow"**

---

## Day-to-Day: Releasing a New Version

Once everything above is set up, releasing a new version is just:

```bash
# Bump the version number (1.0.0 -> 1.0.1)
npm version patch

# Commit the version bump
git add package.json app.json
git commit -m "chore: bump version to 1.0.1"
git push

# Tag and push to trigger CI/CD
git tag v1.0.1
git push origin v1.0.1
```

Or do it all locally in one command:

```bash
npm run release
```

This bumps the patch version, builds a signed AAB, and submits to Google Play.

---

## All Available Commands

| Command | What it does |
|---------|-------------|
| `npm run build:apk` | Build a signed APK for testing (sideload onto devices) |
| `npm run build:production` | Build a signed AAB for the Play Store |
| `npm run build:production:local` | Build signed AAB locally (not on EAS servers) |
| `npm run credentials:setup` | Set up or update Android signing credentials |
| `npm run credentials:info` | View current signing credential details |
| `npm run submit:android` | Submit the latest build to Google Play |
| `npm run build-and-submit` | Build + submit in one step |
| `npm run release` | Bump version + build + submit |

---

## Troubleshooting

### "Not logged in"
```bash
eas login
```

### "No Expo project found" or "projectId is empty"
```bash
eas init
```
Then commit the updated `app.json`.

### "Keystore not found"
```bash
npm run credentials:setup
# Select "Generate new keystore"
```

### "Play Store rejected submission"
Your app listing in Play Console is incomplete. Check the **Dashboard** for a checklist of required items.

### "Service account permission denied"
Go back to Play Console > **Setup > API access** and make sure the service account has **Releases** permissions for the Keg Batch Scanner app.

### "Build takes too long" or times out
Free Expo accounts have limited build concurrency. Check https://expo.dev/accounts/your-username/builds for queue status. Consider upgrading to EAS Production plan for faster builds.

### "I lost my keystore"
If you used EAS-managed credentials (recommended), your keystore is safely stored on Expo's servers. Run `npm run credentials:info` to confirm. You can also download a backup:
```bash
eas credentials --platform android
# Select "Download credentials"
```
**Store the backup in a safe place** (password manager, secure drive). If you lose the keystore and it's not on EAS, you can never update your app on the Play Store.
