# 📱 ApplyTrack on your phone

You can use ApplyTrack on a phone two ways. Both load the **same deployed backend**
(where your Claude key and database live), so the app must be deployed first
(see the Render steps in [README.md](./README.md)).

---

## Option 1 — Install the PWA (fastest, works on Android & iPhone)

ApplyTrack is a Progressive Web App, so you can install it straight from the browser —
no APK, no store.

**Android (Chrome):**
1. Open your deployed URL (e.g. `https://applytrack.onrender.com`).
2. Tap the **⋮** menu → **Add to Home screen** / **Install app**.
3. It gets its own icon and opens full-screen like a native app.

**iPhone (Safari):**
1. Open the URL → tap the **Share** button.
2. **Add to Home Screen**.

This is the recommended path for day-to-day use.

---

## Option 2 — Download a real `.apk` (built in the cloud)

A GitHub Actions workflow builds an installable Android APK for you — you don't need
Android Studio or any local tooling.

### One-time setup
1. Push this repo to GitHub (if not already).
2. In GitHub → **Settings → Secrets and variables → Actions → Variables**, add a
   repository variable:
   - **Name:** `APP_URL`
   - **Value:** your deployed URL, e.g. `https://applytrack.onrender.com`

   The APK is a thin native shell that loads this URL, so it must point at your live site.

### Build & download the APK
1. Go to the **Actions** tab → **Build Android APK** → **Run workflow**.
2. When it finishes (a few minutes), open the run and download the
   **`applytrack-apk`** artifact — inside is `app-debug.apk`.
3. Copy it to your phone and install it (you'll need to allow
   *Install unknown apps* for your file manager/browser).

> This produces a **debug** APK — perfect for personal use / sideloading. For a
> Play-Store release you'd sign a release build; ask and I can extend the workflow.

---

## How it's wired

- **PWA:** `vite-plugin-pwa` generates the web manifest + service worker (offline app
  shell; API calls always go to the network).
- **APK:** [`frontend/capacitor.config.ts`](./frontend/capacitor.config.ts) configures a
  Capacitor Android shell whose `server.url` is your deployed site (set via the
  `CAP_SERVER_URL` env var, which the workflow reads from the `APP_URL` repo variable).
- **CI:** [`.github/workflows/android-apk.yml`](./.github/workflows/android-apk.yml)
  installs deps, builds the web assets, runs `cap add/sync android`, and
  `gradlew assembleDebug`, then uploads the APK as an artifact.

Because the APK loads the real site, sign-in cookies are first-party and everything
(Discover, Generate Kit, the board) works exactly like the web app — and it
auto-updates whenever you redeploy, with no need to rebuild the APK.
