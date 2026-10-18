# Contributing

Thank you for helping improve Persian documents. Issues and pull requests are welcome in **Persian or English**.

## Reporting a problem

The fastest way to get a formatting bug fixed is a report that lets someone see it. Please include:

1. the `.docx` file (or a minimal one that shows the problem — remove anything confidential);
2. a screenshot of the problem **from Microsoft Word** (not only from a preview);
3. your Word version and operating system;
4. the fonts used, and whether they are installed on your machine;
5. the request you gave Claude, if the file came from Claude.

Use the issue templates; they ask for exactly this.

## Proposing a change

1. Fork the repository and create a branch.
2. Set up and run the checks:

   ```bash
   npm ci
   npm test
   npm run example
   ```

3. If you change a rule in `SKILL.md`, update `scripts/fa_docx.js` to match (section 8 of `SKILL.md` and the script must stay identical), and add or update a test in `tests/`.
4. If your change affects how pages look, attach before/after page images to the pull request (`bash scripts/preview.sh examples/minimal-letter.docx` creates them).
5. Add a line under **Unreleased** in `CHANGELOG.md`.

## Guidelines

- Keep `SKILL.md` short and practical: one rule per line, with the reason when it is not obvious.
- Prefer rules proven in a real document over theory.
- Do not add font files or any third-party material whose license is unclear.
- Do not add network access, telemetry or calls to external services to the scripts.
- Write Persian examples with correct ZWNJ and Persian digits.

## Releases

Maintainers tag releases as `vX.Y.Z`, attach `persian-word-documents.zip` (the skill folder: `SKILL.md` + `scripts/`) and its SHA-256 checksum, and copy the changelog entry into the release notes.

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE) and that you follow the [Code of Conduct](CODE_OF_CONDUCT.md).
