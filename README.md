# Cloud Resume Challenge — Frontend

[![CI](https://github.com/Bigessfour/CloudResumeChallenge-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Bigessfour/CloudResumeChallenge-frontend/actions/workflows/ci.yml)

Portfolio site for the [Cloud Resume Challenge](https://cloudresumechallenge.dev/): a dark, responsive resume built with **vanilla HTML/CSS/JavaScript** and **Syncfusion Essential JS 2**, deployed on AWS (S3 + CloudFront) as the challenge progresses.

**Live demo:** _Coming soon — CloudFront URL will be added after deployment._

<!-- screenshot: add assets/images/screenshot.png when ready -->

## What this demonstrates

- Professional landing page with glassmorphism UI and Syncfusion AppBar, Cards, and Buttons
- Static site suitable for S3 + CloudFront hosting
- GitHub Actions CI (ESLint, Prettier, HTMLHint, structure checks)
- Foundation for serverless visitor counter (API Gateway + Lambda) and IaC (Terraform)

## Tech stack

| Layer           | Choice                                         |
| --------------- | ---------------------------------------------- |
| Frontend        | HTML5, CSS3, vanilla JavaScript                |
| UI              | Syncfusion EJ2 30.1.37 (CDN, Material 3 dark)  |
| Quality         | ESLint, Prettier, HTMLHint, cspell             |
| CI              | GitHub Actions                                 |
| Cloud (planned) | S3, CloudFront, API Gateway, Lambda, Terraform |

## Quick start

```bash
git clone https://github.com/Bigessfour/CloudResumeChallenge-frontend.git
cd CloudResumeChallenge-frontend
npm ci
npm run syncfusion:provision   # local preview only; requires license key
npm run serve
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Scripts

| Command                        | Description                                                 |
| ------------------------------ | ----------------------------------------------------------- |
| `npm run serve`                | Local static server on port 8000                            |
| `npm run ci`                   | Lint + format check (matches GitHub Actions)                |
| `npm run syncfusion:provision` | Generate license files from env or `syncfusion-license.txt` |

## Roadmap

- [x] Landing page + navigation + CI pipeline
- [ ] Experience section with Syncfusion Grid
- [ ] Live visitor counter (API + DynamoDB)
- [ ] S3 + CloudFront + custom domain
- [ ] Terraform and full challenge write-up

## Project structure

```
├── index.html              # Page markup
├── css/styles.css          # Site styles
├── js/
│   ├── app.js              # Syncfusion control initialization
│   └── syncfusion-license.example.js
├── .github/workflows/ci.yml
├── docs/DEV_SETUP.md       # Cursor, MCP, extensions (contributors)
├── CONTRIBUTING.md
└── LICENSE                 # MIT
```

## License

- **Code:** [MIT](LICENSE) — Copyright Stephen McKitrick
- **Syncfusion EJ2:** Requires a valid [Syncfusion license key](https://ej2.syncfusion.com/documentation/licensing/license-key-registration) for local development. Keys are never committed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Developer tooling details: [docs/DEV_SETUP.md](docs/DEV_SETUP.md).

## Author

**Stephen McKitrick** — DevOps Engineer · Serverless Architect · Infrastructure Automation

- GitHub: [@Bigessfour](https://github.com/Bigessfour)
