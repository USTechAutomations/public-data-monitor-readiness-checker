# Public-data monitor readiness checker

Clockproof is a browser-only assessment for teams that depend on public-data monitors. It separates four questions that are often collapsed into one green status light: capture, integrity, operations, and decision use.

The assessment data stays in the browser. It has no analytics, API calls, cookies, form submission, package dependencies, or server-side storage. A user can download a local JSON report.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080`. Run the dependency-free checks with:

```bash
node tests/check.mjs
```

## Offer boundary

The page tests a fixed-scope $1,500 Public-Data Monitor Evidence Audit. It exposes a contact path, not checkout. The tool is an engineering readiness screen, not a security audit, legal opinion, compliance certification, or guarantee of source reuse rights.

## License

MIT. See [LICENSE](LICENSE).
