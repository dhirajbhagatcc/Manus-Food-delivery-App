import type { CapacitorConfig } from "@capacitor/cli";

// The APK is a thin native shell that loads your DEPLOYED ApplyTrack site,
// so the app always talks to the real backend (where your Claude key + DB live)
// and auth cookies are first-party. Set the URL via the CAP_SERVER_URL env var
// (the GitHub Actions workflow reads it from the repo variable APP_URL).
const serverUrl =
  process.env.CAP_SERVER_URL || "https://applytrack.onrender.com";

const config: CapacitorConfig = {
  appId: "com.dhirajbhagat.applytrack",
  appName: "ApplyTrack",
  webDir: "dist",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    androidScheme: "https",
  },
};

export default config;
