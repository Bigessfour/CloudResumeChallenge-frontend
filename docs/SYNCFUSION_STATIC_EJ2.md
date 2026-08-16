# Syncfusion EJ2 — static vanilla JS

Conventions for this portfolio site. Contributor IDE folders (`.cursor/`, `.trunk/`) are local-only and are not committed.

- Stack: HTML5, vanilla JavaScript, Syncfusion EJ2 via **CDN global scripts** (no Webpack/Vite unless requested).
- When MCP returns TypeScript, convert to **ES5/global `ej`** patterns per [EJ2 JavaScript docs](https://ej2.syncfusion.com/javascript/documentation/).
- Pin CDN version consistently (currently `ej2/30.1.37`).
- Register license in gitignored `js/syncfusion-license.js` immediately after `ej2.min.js` via `ej.base.registerLicense` (generate with `npm run syncfusion:license`).
- MCP uses the machine env var `Syncfusion_API_Key`. Do not commit keys or a repo-local `.cursor/mcp.json`.
- Theme: **Material 3 dark** to match the resume.
- Keep `index.html` as entry; CSS in `css/styles.css`, app logic in `js/app.js`.
- Prefer incremental UI: one section per change (header → experience grid → charts).
- Preview with `npm run serve` (http://127.0.0.1:8000).
