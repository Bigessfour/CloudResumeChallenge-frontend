# Syncfusion setup on macOS

This page documents wiring the two Syncfusion secrets this repo needs on a Mac:

1. **`Syncfusion_API_Key`** — read by the Syncfusion TypeScript MCP server registered in [`.cursor/mcp.json`](../.cursor/mcp.json). Required for `#sf_typescript_assistant` and friends to return docs to the agent.
2. **EJ2 license key** — registered at runtime via `ej.base.registerLicense(...)` inside the gitignored `js/syncfusion-license.js`. Suppresses the trial banner when running locally.

Both keys already live in your macOS Keychain. The `security` CLI can pull them without GUI prompts as long as you grant access the first time.

> Security note: nothing in this file prints the key values. Treat the commands below as read-only Keychain lookups.

## Keychain inventory

The repo's owner Keychain has these Syncfusion entries (verified via `security dump-keychain | rg syncfusion`). Use whichever pair you have:

| Service                             | Account                  | Purpose                     |
| ----------------------------------- | ------------------------ | --------------------------- |
| `com.wileyco.syncfusion.blazor-mcp` | `SYNCFUSION_API_KEY`     | MCP API key (preferred)     |
| `SYNCFUSION_API_KEY`                | `SYNCFUSION_API_KEY`     | MCP API key (fallback)      |
| `com.wileyco.syncfusion.license`    | `SYNCFUSION_LICENSE_KEY` | EJ2 license key (preferred) |
| `SYNCFUSION_LICENSE_KEY`            | `SYNCFUSION_LICENSE_KEY` | EJ2 license key (fallback)  |
| `Syncfusion License Key`            | `syncfusion`             | EJ2 license key (legacy)    |

Smoke-test that lookup works (the `-w` flag prints the secret to stdout; pipe through `wc -c` to see length without exposing the value):

```bash
security find-generic-password \
  -s 'com.wileyco.syncfusion.blazor-mcp' \
  -a SYNCFUSION_API_KEY -w | wc -c
# Expect: a number > 20. Anything that says "could not be found" means try the next row.
```

## 1. Wire the MCP API key into Cursor

The MCP server is launched by Cursor via `npx -y @syncfusion/typescript-assistant@latest` and inherits **Cursor's own launch env**, not the env of any random shell. The cleanest way to make sure Cursor sees the right key is to export it from `~/.zshenv`, which is sourced for every shell invocation including the one Cursor uses to spawn `npx`.

Append these three lines to `~/.zshenv` (create it if it doesn't exist):

```bash
# Syncfusion MCP — value comes from macOS Keychain at shell startup.
export Syncfusion_API_Key="$(security find-generic-password -s 'com.wileyco.syncfusion.blazor-mcp' -a SYNCFUSION_API_KEY -w 2>/dev/null)"
export SYNCFUSION_API_KEY="$Syncfusion_API_Key"
```

Then **fully quit Cursor** (`Cmd-Q` — not just close the window) and reopen. Cursor only re-reads env on a cold start.

Verify the MCP is connected:

1. Cursor → **Settings** → **MCP**.
2. `sf-typescript-mcp` should be listed with a green/connected indicator.
3. In a chat, type `#sf_typescript_assistant How does the EJ2 Grid allowFiltering property work?` — you should get docs back, not the `API key is invalid` error.

If you still see the invalid-key error: the value pulled from Keychain may be stale. Open Keychain Access.app, find `com.wileyco.syncfusion.blazor-mcp`, double-click, check "Show password," and confirm the value matches your current key at [https://www.syncfusion.com/account/api-key](https://www.syncfusion.com/account/api-key).

## 2. Wire the EJ2 license key

You have a `package.json` script that handles this automatically by reading the same Keychain entries:

```bash
npm run syncfusion:provision:macos
```

This:

1. Pulls the license key from Keychain (tries the services in priority order — see [`scripts/syncfusion-provision-from-macos.mjs`](../scripts/syncfusion-provision-from-macos.mjs)).
2. Writes `syncfusion-license.txt` at the repo root (gitignored).
3. Invokes [`scripts/syncfusion-license-from-env.mjs`](../scripts/syncfusion-license-from-env.mjs) to generate `js/syncfusion-license.js` (also gitignored, loaded by `index.html` immediately after `ej2.min.js`).

Verify the license is active:

1. `npm run serve`
2. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a private/incognito window.
3. There should be **no trial license banner** at the top of the page.

## Recap: what's in the repo vs. what's on your machine

| Lives in repo (committed)                                                                       | Lives on your Mac only (gitignored / Keychain)                 |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`.cursor/mcp.json`](../.cursor/mcp.json) (server config)                                       | `Syncfusion_API_Key` env var (sourced from Keychain by zshenv) |
| [`scripts/syncfusion-provision-from-macos.mjs`](../scripts/syncfusion-provision-from-macos.mjs) | `syncfusion-license.txt`                                       |
| [`scripts/syncfusion-license-from-env.mjs`](../scripts/syncfusion-license-from-env.mjs)         | `js/syncfusion-license.js`                                     |
| This document                                                                                   | Keychain entries listed in the inventory above                 |

No plaintext API key ever lands on disk in this setup — only the EJ2 runtime license, which has to be a literal string the browser can register.

## Troubleshooting

- **`security` returns "The specified item could not be found"** — try the next row in the inventory table. Keychain names are case-sensitive.
- **MCP keeps loading or shows red** — check Cursor's MCP log (Settings → MCP → "View logs"). Most often a stale env from a previous Cursor session that needs `Cmd-Q`.
- **`registerLicense` still warns "trial"** — your local key is older than the EJ2 version on the CDN. Pin both: check [`index.html`](../index.html) for the `ej2/30.1.37` path and grab a v30.x key from [Syncfusion account → Downloads](https://www.syncfusion.com/account/downloads).
- **You want a teammate to reproduce this without your Keychain** — they should follow the same steps with their own Syncfusion account; we never share keys.

## References

- [EJ2 license registration](https://ej2.syncfusion.com/documentation/licensing/license-key-registration)
- [Syncfusion MCP installation](https://ej2.syncfusion.com/documentation/mcp-server/installation)
- [`@syncfusion/typescript-assistant` on npm](https://www.npmjs.com/package/@syncfusion/typescript-assistant)
