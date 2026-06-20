/**
 * Pull the Syncfusion EJ2 license key from macOS Keychain, write it to
 * syncfusion-license.txt (gitignored), then hand off to
 * scripts/syncfusion-license-from-env.mjs which generates js/syncfusion-license.js.
 *
 * The MCP API key is NOT touched by this script — that key lives in ~/.zshenv
 * per docs/SYNCFUSION_SETUP_MACOS.md (so it never lands on disk inside the repo).
 *
 * Docs: https://ej2.syncfusion.com/documentation/licensing/license-key-registration
 */
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

if (process.platform !== "darwin") {
  console.error(
    "This script is macOS-only. On Windows use `npm run syncfusion:provision`, on Linux set SYNCFUSION_LICENSE manually."
  );
  process.exit(1);
}

const KEYCHAIN_CANDIDATES = [
  { service: "com.wileyco.syncfusion.license", account: "SYNCFUSION_LICENSE_KEY" },
  { service: "SYNCFUSION_LICENSE_KEY", account: "SYNCFUSION_LICENSE_KEY" },
  { service: "Syncfusion License Key", account: "syncfusion" },
];

function fromKeychain({ service, account }) {
  try {
    const out = execFileSync(
      "security",
      ["find-generic-password", "-s", service, "-a", account, "-w"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    const trimmed = out.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

function resolveLicense() {
  for (const candidate of KEYCHAIN_CANDIDATES) {
    const key = fromKeychain(candidate);
    if (key) {
      return { key, ...candidate };
    }
  }
  return null;
}

const resolved = resolveLicense();

if (!resolved) {
  console.error(
    [
      "No Syncfusion license key found in macOS Keychain.",
      "",
      "Tried (service / account):",
      ...KEYCHAIN_CANDIDATES.map((c) => `  - ${c.service} / ${c.account}`),
      "",
      "Add one via Keychain Access.app or the security CLI:",
      "  security add-generic-password \\",
      "    -s 'com.wileyco.syncfusion.license' \\",
      "    -a SYNCFUSION_LICENSE_KEY \\",
      "    -w 'YOUR_LICENSE_KEY_HERE'",
      "",
      "Get a key: https://www.syncfusion.com/account/downloads",
      "Setup guide: docs/SYNCFUSION_SETUP_MACOS.md",
    ].join("\n")
  );
  process.exit(1);
}

if (resolved.key.length < 20) {
  console.error(
    `License key from '${resolved.service}' looks too short (${resolved.key.length} chars). Verify the Keychain entry.`
  );
  process.exit(1);
}

writeFileSync("syncfusion-license.txt", resolved.key + "\n", "utf8");
console.log(
  `Wrote syncfusion-license.txt from Keychain (service: ${resolved.service}, account: ${resolved.account}).`
);

console.log("Generating js/syncfusion-license.js …");
const gen = spawnSync("node", ["scripts/syncfusion-license-from-env.mjs"], {
  stdio: "inherit",
  env: process.env,
  shell: false,
});

if (gen.status !== 0) {
  process.exit(gen.status ?? 1);
}

console.log("Done. Run `npm run serve` and confirm no trial banner in an incognito window.");
