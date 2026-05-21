import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

/**
 * Official Syncfusion setup for this static CDN project:
 * 1. npx syncfusion-license activate (when syncfusion-license.txt or SYNCFUSION_LICENSE exists)
 * 2. Generate js/syncfusion-license.js for ej.base.registerLicense in index.html
 *
 * @see https://ej2.syncfusion.com/documentation/licensing/license-key-registration
 */

const hasLicenseSource =
  existsSync("syncfusion-license.txt") ||
  Boolean(process.env.SYNCFUSION_LICENSE?.trim()) ||
  Boolean(process.env.SYNCFUSION_LICENSE_KEY?.trim()) ||
  existsSync(".env");

if (hasLicenseSource) {
  console.log("Running npx syncfusion-license activate …");
  const activate = spawnSync("npx", ["syncfusion-license", "activate"], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (activate.status !== 0) {
    console.warn(
      "syncfusion-license activate exited non-zero (ok for static CDN if step 2 succeeds).",
    );
  }
} else {
  console.log("Skipping npx syncfusion-license activate (no license source yet).");
}

console.log("Generating js/syncfusion-license.js …");
const gen = spawnSync("node", ["scripts/syncfusion-license-from-env.mjs"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(gen.status ?? 1);
