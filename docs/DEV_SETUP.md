# Developer setup

Details for contributors using Cursor, Syncfusion MCP, and local tooling. Employers reviewing the portfolio can skip this document.

## Prerequisites

- Node.js 20+
- [Syncfusion license](https://www.syncfusion.com/account/manage-trials/start-trials) (local preview)
- [Syncfusion API key](https://www.syncfusion.com/account/api-key) (optional, for MCP)

## Environment variables

Store secrets in machine-scope variables (restart Cursor after changes):

| Variable                 | Used by                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `Syncfusion_API_Key`     | Syncfusion MCP — [official name](https://ej2.syncfusion.com/documentation/mcp-server/installation) |
| `SYNCFUSION_LICENSE`     | EJ2 runtime — `npm run syncfusion:provision`                                                       |
| `SYNCFUSION_LICENSE_KEY` | Legacy alias for provision script                                                                  |

Optional: copy [`.env.example`](../.env.example) to `.env` (gitignored).

## Syncfusion license (local)

1. Get a key from [License & Downloads](https://www.syncfusion.com/account/downloads) — **v30.x**, platform **JavaScript**.
2. `setx SYNCFUSION_LICENSE "Your_Key"` or copy `syncfusion-license.txt.example` → `syncfusion-license.txt`.
3. Run `npm run syncfusion:provision`.

## Cursor MCP

[`.cursor/mcp.json`](../.cursor/mcp.json) points at `@syncfusion/typescript-assistant`. Confirm **Connected** under Cursor Settings → MCP.

Example prompts:

```
#sf_typescript_assistant How do I create an EJ2 Grid with paging?
#sf_typescript_ui_builder Build a dark Material 3 experience section with Grid.
```

Ask the agent to convert TypeScript output to **vanilla JS + EJ2 CDN globals** per [`.cursor/rules/syncfusion-static-ej2.mdc`](../.cursor/rules/syncfusion-static-ej2.mdc).

## Agent skills (optional, local)

```bash
npx skills add syncfusion/javascript-ui-controls-skills -y
```

Skills install under `.agents/` (gitignored). `skills-lock.json` is also gitignored — do not commit.

## Recommended extensions

See [`.vscode/extensions.json`](../.vscode/extensions.json) → **Install All Workspace Recommendations**.

## Preview

| Method  | Command                                       |
| ------- | --------------------------------------------- |
| npm     | `npm run serve`                               |
| VS Code | Live Server on `index.html` (port 5500)       |
| Python  | `python -m http.server 8000 --bind 127.0.0.1` |

## References

- [EJ2 JavaScript docs](https://ej2.syncfusion.com/javascript/documentation/)
- [Syncfusion MCP installation](https://ej2.syncfusion.com/documentation/mcp-server/installation)
- [License registration](https://ej2.syncfusion.com/documentation/licensing/license-key-registration)
