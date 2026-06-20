# Cloud Resume Challenge — Frontend

[![CI](https://github.com/Bigessfour/CloudResumeChallenge-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Bigessfour/CloudResumeChallenge-frontend/actions/workflows/ci.yml)
[![Live: stephenmckitrick.com](https://img.shields.io/badge/live-stephenmckitrick.com-22d3ee?logo=amazonaws&logoColor=white)](https://stephenmckitrick.com)
[![AWS Certified AI Practitioner](https://img.shields.io/badge/AWS-AI%20Practitioner-a855f7?logo=amazonaws&logoColor=white)](https://www.credly.com/badges/8f01c1d2-ba98-4d09-9ffa-e424eebe18e3)

Portfolio site for the [Cloud Resume Challenge](https://cloudresumechallenge.dev/): a dark, responsive resume built with **vanilla HTML/CSS/JavaScript** and **Syncfusion Essential JS 2**, deployed on AWS (S3 + CloudFront) as the challenge progresses.

**Live demo:** [https://stephenmckitrick.com](https://stephenmckitrick.com)

<!-- TODO: capture hero screenshot → assets/images/screenshot.png then uncomment below -->
<!-- ![Cloud Resume Challenge — hero screenshot](assets/images/screenshot.png) -->

## What this demonstrates

- Professional landing page with glassmorphism UI and Syncfusion AppBar, Cards, Accordions, Grid, and Chart
- **Badges wall** featuring AWS Certified AI Practitioner + Cloud Practitioner via the Credly CDN
- **AWS Resources** section mapping all 16 CRC challenge steps to deployed infrastructure
- Static site on S3 + CloudFront with serverless visitor counter (API Gateway + Lambda + DynamoDB)
- Animated count-up visitor counter with loading skeleton, `aria-live` updates, and graceful demo fallback
- GitHub Actions CI (ESLint, Prettier, HTMLHint, structure checks) and OIDC deploy pipeline

## Tech stack

| Layer    | Choice                                                   |
| -------- | -------------------------------------------------------- |
| Frontend | HTML5, CSS3, vanilla JavaScript                          |
| UI       | Syncfusion EJ2 30.1.37 (CDN, Material 3 dark)            |
| Quality  | ESLint, Prettier, HTMLHint, cspell                       |
| CI       | GitHub Actions                                           |
| Cloud    | S3, CloudFront, API Gateway, Lambda, DynamoDB, Terraform |

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
- [x] Experience section with Syncfusion Grid
- [x] Live visitor counter (API + DynamoDB)
- [x] S3 + CloudFront + custom domain (Route 53 NS cutover pending)
- [x] AWS Resources section (challenge progress + resource inventory)
- [x] Certifications & Badges Wall (AWS AI Practitioner added)
- [x] Visitor counter UX (skeleton + count-up + a11y)
- [x] Glassmorphism UI polish (wider Syncfusion containers, larger badges)
- [ ] Lambda pytest suite (CRC step 11)
- [ ] Next: Full OIDC → Terraform apply (see [docs/TERRAFORM-STRUCTURE.md](docs/TERRAFORM-STRUCTURE.md))
- [ ] Challenge blog post (CRC step 16)

## Documentation

- [docs/DEV_SETUP.md](docs/DEV_SETUP.md) — Cursor, MCP, and extension setup for contributors
- [docs/TERRAFORM-STRUCTURE.md](docs/TERRAFORM-STRUCTURE.md) — Companion infra repo layout, starter snippets, and OIDC apply roadmap

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
