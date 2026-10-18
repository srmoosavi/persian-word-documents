# Security policy

## Supported versions

| Version | Supported |
|---|---|
| 0.9.x (pre-release) | ✅ |
| < 0.9 | ❌ |

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability**. Include what you found, how to reproduce it, and which version you used.

What to expect:

- acknowledgement within **7 days**;
- an assessment and a planned fix date within **14 days**;
- a fix and a release note for confirmed issues, normally within **30 days**, with credit to the reporter if they wish.

## What this project does — the security model

A skill is a set of instructions plus scripts that Claude may run. Before installing any skill, read it. For this one:

| Component | What it does | What it does not do |
|---|---|---|
| `SKILL.md` | Tells Claude how to format Persian Word documents | Does not ask Claude to fetch remote content, read unrelated files, or send data anywhere |
| `scripts/fa_docx.js` | Builds `.docx` files in memory with `docx` and writes the file path you give it | No network access, no shell commands, no reading of other files (except PNG images you pass to `fig()`) |
| `scripts/render_figure.py` | Opens a local HTML file in a headless browser and saves a PNG | Opens only the file you pass; fonts must be local |
| `scripts/preview.sh` | Converts a `.docx` to PDF and images; installs the `vazirmatn` npm package for preview fonts; writes one fontconfig alias file in your home directory | Does not modify your main `fonts.conf` or anything outside the paths it prints |

## Supply chain

- Runtime dependency: `docx` (pinned to an exact version in `package.json`; `package-lock.json` is committed). `jszip` comes with `docx`.
- Optional tools: Playwright (figures), LibreOffice and Poppler (previews), the `vazirmatn` npm package (preview fonts).
- Dependabot watches npm packages and GitHub Actions.
- CI runs with read-only repository permissions.
- Each release includes a ZIP of the skill and its SHA-256 checksum. Verify before uploading:

```bash
sha256sum persian-word-documents.zip      # Linux
shasum -a 256 persian-word-documents.zip  # macOS
Get-FileHash persian-word-documents.zip   # Windows PowerShell
```

## Out of scope

- Vulnerabilities in Claude, Microsoft Word, LibreOffice or other third-party software — report those to their vendors.
- Problems caused by modified copies of this skill.
