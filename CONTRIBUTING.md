# Contributing

Thank you for your interest in this project. This is primarily a personal portfolio repository for the [Cloud Resume Challenge](https://cloudresumechallenge.dev/), but issues and pull requests are welcome.

## Prerequisites

- Node.js 20+
- Python 3 (optional, for local static server)
- Syncfusion EJ2 license key (local dev only — never commit keys)

## Setup

```bash
git clone https://github.com/Bigessfour/CloudResumeChallenge-frontend.git
cd CloudResumeChallenge-frontend
npm ci
```

### Syncfusion license (local preview)

```bash
# Windows: set machine env, restart terminal, then:
npm run syncfusion:provision
```

See [docs/DEV_SETUP.md](docs/DEV_SETUP.md) for Cursor MCP and environment variable details.

## Quality checks

```bash
npm run ci
```

This runs ESLint, Prettier, and matches the GitHub Actions workflow.

## Pull requests

1. Branch from `main`
2. Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
3. Ensure `npm run ci` passes
4. Do not commit `.env`, `syncfusion-license.txt`, or `js/syncfusion-license.js`

## Cursor skills (optional)

Syncfusion agent skills are installed locally via:

```bash
npx skills add syncfusion/javascript-ui-controls-skills -y
```

`skills-lock.json` is gitignored; do not commit it.
