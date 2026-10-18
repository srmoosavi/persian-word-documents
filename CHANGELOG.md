# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `.gitattributes` so shell and Python scripts keep LF line endings on Windows clones.
- README sample section now shows all three pages of the release guide and a rendered RTL figure.
- README notes the `docx` versions the helper module is tested with (9.7.1 and 9.11.0).

### Changed

- `docx` 9.7.1 → 9.11.0 (all tests pass; generated documents unchanged).
- GitHub Actions: `actions/checkout` and `actions/setup-node` v4 → v7.

### Security

- `main` is protected against deletion and force pushes.

## [0.9.0] — 2026-10-18 (pre-release)

First public pre-release, for feedback before 1.0.

### Added

- `SKILL.md` with RTL rules for paragraphs, runs, tables, sections, indents, headings and left-side blocks.
- Four font paths (classic Iranian, modern open-source, system-safe, Office-native) with sizing and line-spacing guidance.
- Text hygiene rules: Persian digits, ی/ک normalization, ZWNJ, punctuation, Shamsi dates, formal letter conventions.
- `scripts/fa_docx.js` helper module: headings, justified paragraphs, `**bold**` and `` `code` `` markup, bullets, Persian-numbered items, RTL tables with tinted ratings, captions, callouts, figures, left-side blocks, section post-processing.
- File names, paths and code inside Persian text are written as LTR runs wrapped in LRM marks; Latin-only table cells become LTR paragraphs.
- `scripts/render_figure.py` (RTL HTML figure → PNG) and `scripts/preview.sh` (.docx → PDF and page images with preview fonts).
- Examples: a minimal formal letter, a 3-page release guide with a figure, and an HTML figure template.
- 9 structural tests and a GitHub Actions workflow.
- Documentation in English and Persian; security policy; font licensing notes.

[Unreleased]: https://github.com/srmoosavi/persian-word-documents/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/srmoosavi/persian-word-documents/releases/tag/v0.9.0
