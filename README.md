# CloudResumeChallenge-frontend

A modern, dark-themed static frontend for the **Cloud Resume Challenge** built with HTML, CSS, JavaScript, and **Syncfusion Essential JS 2** components.

This project serves as the public-facing resume/portfolio site while demonstrating practical cloud engineering skills.

## Project Goals

- Complete the Cloud Resume Challenge using a professional-grade frontend

- Showcase skills in modern web development, AWS, and DevOps practices

- Create a visually impressive, accessible, and performant static site

- Use Syncfusion JS2 components for a polished user experience

- Prepare the foundation for CI/CD, Infrastructure as Code, and serverless backend integration

## Tech Stack

- **HTML5 + CSS3 + JavaScript** (Vanilla)

- **Syncfusion Essential JS 2** (UI components via CDN)

- **Responsive & Dark Theme** design (Material 3 dark)

- Future: AWS S3 + CloudFront hosting, API Gateway + Lambda (visitor counter), Terraform, GitHub Actions

## Local Development

From the project root, start a simple Python server:

```bash

# Simple Python server

python -m http.server 8000

```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

Alternatively, use the **Live Server** extension (port 5500) via `.vscode/settings.json`.

## Cursor + Syncfusion MCP Setup

### Prerequisites

- Node.js 18+

- [Syncfusion license](https://www.syncfusion.com/account/manage-trials/start-trials) (commercial, community, or trial)

- [Syncfusion API key](https://www.syncfusion.com/account/api-key) for the MCP server

### Machine-scope environment variables (recommended)

Store secrets in **Windows User or System environment variables** (not in this repo). Restart Cursor after changing them so MCP and terminals inherit new values.

| Variable | Used by |

|----------|---------|

| `Syncfusion_API_Key` | Syncfusion MCP (`@syncfusion/typescript-assistant`) — [official env name](https://ej2.syncfusion.com/documentation/mcp-server/installation) |

| `SYNCFUSION_LICENSE` | EJ2 CDN runtime — generates gitignored `js/syncfusion-license.js` via `npm run syncfusion:license` ([docs](https://ej2.syncfusion.com/documentation/licensing/license-key-registration)) |
| `SYNCFUSION_LICENSE_KEY` | Legacy alias for the same license generator script |

Optional: copy [`.env.example`](.env.example) to `.env` for project-only overrides (`.env` is gitignored). Do not commit keys.

### MCP configuration

This project includes [`.cursor/mcp.json`](.cursor/mcp.json) pointing at `@syncfusion/typescript-assistant`. The server inherits `Syncfusion_API_Key` from your machine environment (no key file path in repo config). After setting the variable:

1. Open **Cursor Settings → Features → Model Context Protocol**

2. Confirm `sf-typescript-mcp` shows **Connected**

3. Reload the window if needed

### Verify MCP

In a new Agent chat, try:

```

#sf_typescript_assistant How do I create an EJ2 Grid with paging and filtering?

```

```

#sf_typescript_ui_builder Create a dark Material 3 resume header with Card and Button controls.

```

Approve the MCP tool call when prompted. Check **Output → MCP Logs** if the server fails to connect.

### Syncfusion license (runtime)

EJ2 requires a registered license key before controls run ([license key registration](https://ej2.syncfusion.com/documentation/licensing/license-key-registration)). This static CDN app calls `ej.base.registerLicense()` from gitignored [`js/syncfusion-license.js`](js/syncfusion-license.js), loaded right after `ej2.min.js` in [`index.html`](index.html).

**Quick setup (matches Syncfusion docs + this repo):**

1. Get a key from [License & Downloads](https://www.syncfusion.com/account/downloads) — **version 30.x**, **platform JavaScript** (matches CDN `ej2/30.1.37`).

2. Provide the key using **one** of these (file takes priority over env per Syncfusion):

   | Method                     | Steps                                                                                       |
   | -------------------------- | ------------------------------------------------------------------------------------------- |
   | **License file** (easiest) | Copy `syncfusion-license.txt.example` → `syncfusion-license.txt`, paste key on its own line |
   | **Machine env**            | `setx SYNCFUSION_LICENSE "Your_License_Key_Here"` then restart Cursor                       |
   | **Project `.env`**         | `SYNCFUSION_LICENSE=Your_License_Key_Here`                                                  |

3. Run provisioning (writes `syncfusion-license.txt`, `.env`, and `js/syncfusion-license.js`):

   ```bash
   # If the key is already in Windows System/User variables:
   npm run syncfusion:provision

   # Or manual setup:
   npm run syncfusion:setup
   ```

4. Reload the site in the browser.

**Scripts:** `syncfusion:provision` (read Windows env → recommended files) · `syncfusion:setup` · `syncfusion:license` (regenerate JS only)

Per [Syncfusion license registration](https://ej2.syncfusion.com/documentation/licensing/license-key-registration), the **license file** (`syncfusion-license.txt`) takes priority over environment variables. This CDN app also registers via `ej.base.registerLicense` in `js/syncfusion-license.js` (loaded after `ej2.min.js`).

Without a real key, the license popup will keep appearing. Do not commit your license key.

## Agentic UI Builder — Mode Tags

| Tag | Use when |

|-----|----------|

| `#sf_typescript_ui_builder` | Full pages/sections (layout + controls + styling) |

| `#sf_typescript_assistant` | Single control, API, troubleshooting |

| `#sf_typescript_control` | Control metadata, props, events |

| `#sf_typescript_style` | Themes, dark mode, icons |

**Tip:** The MCP outputs TypeScript patterns. Ask the agent to convert results to **vanilla JS with EJ2 CDN global scripts** for this project.

Example prompt:

```

#sf_typescript_ui_builder Build a dark Material 3 experience section with Grid.

Convert to vanilla JavaScript using EJ2 CDN global format for my static site.

```

Project rules in [`.cursor/rules/syncfusion-static-ej2.mdc`](.cursor/rules/syncfusion-static-ej2.mdc) enforce CDN and static-site conventions.

## Syncfusion Agent Skills

[Syncfusion EJ2 JavaScript Agent Skills](https://ej2.syncfusion.com/documentation/skills/control-skills) install locally under `.agents/skills/` (52 control skills; **gitignored** — each developer runs the install command below). Cursor loads them automatically for Syncfusion-related prompts.

**Install or reinstall** (requires a `<source>` — `npx skills add --help` alone is invalid):

```bash

# All controls (non-interactive; Cursor detected automatically)

npx skills add syncfusion/javascript-ui-controls-skills -y



# Pick specific controls interactively

npx skills add syncfusion/javascript-ui-controls-skills

```

**Manage:** `npx skills list` · `npx skills update` · `npx skills remove <skill-name>`

**Resume-relevant skills already in this project:** `syncfusion-javascript-grid`, `syncfusion-javascript-buttons`, `syncfusion-javascript-card`, `syncfusion-javascript-chart`, `syncfusion-javascript-themes`, `syncfusion-javascript-common`, `syncfusion-javascript-license`.

After installing or updating skills, reload the Cursor window so the agent picks them up.

## Cursor & Editor Settings

Workspace settings: [`.vscode/settings.json`](.vscode/settings.json). Cursor workspace keys: [`.cursor/settings.json`](.cursor/settings.json). Accept **Recommended Extensions** from [`.vscode/extensions.json`](.vscode/extensions.json).

Configure in **Cursor Settings** (UI): MCP → `sf-typescript-mcp` **Connected**; Agents → auto-run with approval first; use a high-capability model for Syncfusion UI; keep codebase indexing on.

## Recommended Extensions

Open the Command Palette → **Extensions: Show Recommended Extensions** → **Install All**.

| Extension           | ID                                      | Role                                              |
| ------------------- | --------------------------------------- | ------------------------------------------------- |
| Live Server         | `ritwickdey.LiveServer`                 | Preview `index.html` on port 5500                 |
| HTML CSS Support    | `ecmel.vscode-html-css`                 | Class/id IntelliSense from `css/styles.css`       |
| Prettier            | `esbenp.prettier-vscode`                | Format HTML/CSS/JS/JSON (uses `.prettierrc.json`) |
| ESLint              | `dbaeumer.vscode-eslint`                | Lint `js/` (uses `eslint.config.js`)              |
| Error Lens          | `usernamehw.errorlens`                  | Inline diagnostics for AI + manual edits          |
| Path Intellisense   | `christian-kohler.path-intellisense`    | Asset path completion                             |
| DotENV              | `dotenv.dotenv-vscode`                  | `.env` syntax + autocloaking                      |
| EditorConfig        | `editorconfig.editorconfig`             | Consistent indentation (`.editorconfig`)          |
| HTMLHint            | `HTMLHint.vscode-htmlhint`              | HTML lint (`.htmlhintrc.json`)                    |
| Auto Close Tag      | `formulahendry.auto-close-tag`          | HTML tag pairing                                  |
| Auto Rename Tag     | `formulahendry.auto-rename-tag`         | Rename paired HTML tags                           |
| Code Spell Checker  | `streetsidesoftware.code-spell-checker` | Resume copy (`cspell.json`)                       |
| Markdown All in One | `yzhang.markdown-all-in-one`            | README + `.mdc` rules                             |
| Color Highlight     | `naumovs.color-highlight`               | Preview CSS variables/colors                      |

**Syncfusion:** No separate VS Code extension — use **Syncfusion MCP** (`.cursor/mcp.json`) + mode tags `#sf_typescript_*`.

### One-time dev tooling setup

```bash
npm install
npm run syncfusion:license   # if SYNCFUSION_LICENSE_KEY is set (machine env)
```

Runs ESLint and Prettier locally (required for their extensions to use project configs). Generates gitignored `js/syncfusion-license.js` when the license env var is present.

### Preview options

| Method      | Command / action                                                   |
| ----------- | ------------------------------------------------------------------ |
| Live Server | Right-click `index.html` → **Open with Live Server** (port 5500)   |
| Python      | `python -m http.server 8000` or task **Serve: Python (port 8000)** |
| Tasks       | Terminal → Run Task → `npm: lint` / `npm: format`                  |

## Project Structure

```

Cloud-Resume-Challenge/

├── index.html

├── css/

│   └── styles.css

├── js/

│   ├── syncfusion-license.example.js

│   ├── syncfusion-license.js   # gitignored; npm run syncfusion:license

│   └── app.js

├── assets/

│   └── images/

├── .cursor/

│   ├── mcp.json

│   ├── settings.json

│   └── rules/

│       └── syncfusion-static-ej2.mdc

├── .vscode/

│   ├── settings.json

│   ├── extensions.json

│   ├── tasks.json

│   └── launch.json

├── .editorconfig

├── .prettierrc.json

├── .htmlhintrc.json

├── eslint.config.js

├── cspell.json

├── package.json

├── .env.example

├── .gitignore

└── README.md

```

## Continuous Integration

GitHub Actions workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pushes and pull requests to `main`:

- `npm ci`
- Project structure checks (`index.html`, `css/styles.css`, `js/app.js`, Syncfusion CDN in HTML)
- `npm run lint` (ESLint on `js/`)
- `npm run format:check` (Prettier)

Run the same checks locally:

```bash
npm ci
npm run ci
```

Optional: add repository secret `SYNCFUSION_LICENSE` if you later add a build step that requires Syncfusion license activation in CI ([docs](https://ej2.syncfusion.com/documentation/licensing/license-key-registration)).

## References

- [Syncfusion MCP Installation](https://ej2.syncfusion.com/documentation/mcp-server/installation)

- [Agentic UI Builder Getting Started](https://ej2.syncfusion.com/documentation/mcp-server/agentic-ui-builder/getting-started)

- [EJ2 JavaScript Documentation](https://ej2.syncfusion.com/javascript/documentation/)

- [Cursor MCP docs](https://cursor.com/docs/context/mcp)
