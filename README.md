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

## Brand and publication

This existing GitHub Pages site publishes from `main:/`. A push to main republishes it. The maintained brand standard is `usta-paid-surfaces/BRAND.md`, bound to the USTA Website UI/UX rules v1.3. `BRAND_SOURCE.json` records the exact shared shell/token/font snapshot; refresh that snapshot from the canonical standard when brand rules change. Keep this tool's behavior and offer boundaries intact.

Before publishing, run the existing product checks plus:

```bash
python3 scripts/check_brand.py --dist . --css styles.css
```

Also inspect both themes at 320, 375, 768, 1024, 1280 and 1440px, keyboard focus and each input/export path. These static checks do not establish rendered accessibility or public availability.
