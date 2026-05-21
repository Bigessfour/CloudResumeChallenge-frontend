import { existsSync, readFileSync, writeFileSync } from "node:fs";

const PLACEHOLDER = "YOUR_SYNCFUSION_LICENSE_KEY";
const LICENSE_FILE = "syncfusion-license.txt";
const DOCS_URL =
  "https://ej2.syncfusion.com/documentation/licensing/license-key-registration";

/**
 * Parse syncfusion-license.txt: first non-empty, non-comment line is the key.
 * @see https://ej2.syncfusion.com/documentation/licensing/license-key-registration
 */
function readLicenseFile() {
  if (!existsSync(LICENSE_FILE)) {
    return null;
  }
  const lines = readFileSync(LICENSE_FILE, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    return trimmed;
  }
  return null;
}

/** Optional project .env (gitignored) — SYNCFUSION_LICENSE=... */
function readDotEnvLicense() {
  if (!existsSync(".env")) {
    return null;
  }
  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const match = trimmed.match(/^SYNCFUSION_LICENSE\s*=\s*(.+)$/);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, "");
    }
    const legacy = trimmed.match(/^SYNCFUSION_LICENSE_KEY\s*=\s*(.+)$/);
    if (legacy) {
      return legacy[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

/**
 * Resolve license key — priority matches Syncfusion docs:
 * 1. syncfusion-license.txt (file over env when both exist)
 * 2. SYNCFUSION_LICENSE / SYNCFUSION_LICENSE_KEY environment variables
 * 3. .env project file
 */
function resolveLicenseKey() {
  const fromFile = readLicenseFile();
  if (fromFile) {
    return { key: fromFile, source: LICENSE_FILE };
  }

  const fromEnv =
    process.env.SYNCFUSION_LICENSE?.trim() || process.env.SYNCFUSION_LICENSE_KEY?.trim();
  if (fromEnv) {
    return { key: fromEnv, source: "environment variable" };
  }

  const fromDotEnv = readDotEnvLicense();
  if (fromDotEnv) {
    return { key: fromDotEnv, source: ".env" };
  }

  return null;
}

const resolved = resolveLicenseKey();

if (!resolved) {
  console.error(
    [
      "Syncfusion license key not found.",
      "",
      "Official setup: " + DOCS_URL,
      "",
      "Option A — license file (recommended for this repo):",
      "  1. Copy syncfusion-license.txt.example → syncfusion-license.txt",
      "  2. Paste your key on its own line (JavaScript platform, v30.x)",
      "  3. npm run syncfusion:setup",
      "",
      "Option B — machine environment variable:",
      '  setx SYNCFUSION_LICENSE "Your_License_Key_Here"',
      "  Restart Cursor, then: npm run syncfusion:setup",
      "",
      "Option C — project .env:",
      "  SYNCFUSION_LICENSE=Your_License_Key_Here",
      "  npm run syncfusion:setup",
      "",
      "Generate a key: https://www.syncfusion.com/account/downloads",
    ].join("\n"),
  );
  process.exit(1);
}

if (resolved.key === PLACEHOLDER) {
  console.error("License key is still the placeholder. Paste your real Syncfusion license key.");
  process.exit(1);
}

const out = `/**
 * Syncfusion EJ2 license registration (generated — do not commit).
 * Source: ${resolved.source}
 * Regenerate: npm run syncfusion:license
 * Docs: ${DOCS_URL}
 */
(function () {
  "use strict";

  var LICENSE_KEY = ${JSON.stringify(resolved.key)};
  var PLACEHOLDER = ${JSON.stringify(PLACEHOLDER)};

  if (typeof ej === "undefined" || !ej.base || typeof ej.base.registerLicense !== "function") {
    console.error(
      "[Syncfusion] EJ2 must load before js/syncfusion-license.js. Keep script order: ej2.min.js, then this file.",
    );
    return;
  }

  if (!LICENSE_KEY || LICENSE_KEY === PLACEHOLDER) {
    console.warn(
      "[Syncfusion] License key missing. Run: npm run syncfusion:setup",
    );
    return;
  }

  ej.base.registerLicense(LICENSE_KEY);
})();
`;

writeFileSync("js/syncfusion-license.js", out);
console.log(`Wrote js/syncfusion-license.js from ${resolved.source}.`);
