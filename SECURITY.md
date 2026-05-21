# Security Policy

This project is a static HTML/CSS/JavaScript portfolio site. It does not process authenticated user sessions on the server.

## Reporting a vulnerability

Please report security concerns via [GitHub Issues](https://github.com/Bigessfour/CloudResumeChallenge-frontend/issues). Do not post license keys or secrets in public issues.

## Secrets

Never commit:

- `.env`
- `syncfusion-license.txt`
- `js/syncfusion-license.js`

Use machine environment variables or gitignored local files as documented in the README.
