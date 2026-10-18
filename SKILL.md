---
name: persian-word-documents
description: Create or edit Persian (Farsi, RTL) Word .docx files with correct right-to-left text, tables, headings, lists, Persian digits, font choice, figures and formal letters.
---

# Persian (Farsi) Word documents — RTL done right

Use this skill whenever a Word/.docx deliverable contains Persian text: proposals, reports, letters, contracts, claims, manuals. It encodes the rules that produced a clean result in practice. Follow it together with the general `docx` skill (docx-js gotchas, validation, rendering).

## 1. Workflow

1. **Content first.** Settle the text, tables and figure list before writing code. Write formal Persian; no references to how the document was produced.
2. **Choose fonts** (section 3). Use a stated preference if there is one; otherwise pick a path and say which in one line.
3. **Render figures** as PNG from RTL HTML (section 7) — never draw Persian text with matplotlib.
4. **Build** with docx-js (preinstalled; `require('docx')`) using the helper module in section 8.
5. **Post-process**: add `<w:bidi/>` to every `sectPr` (the helper does it).
6. **Validate and look**: `validate.py`, convert to PDF with LibreOffice, rasterize, inspect every page (section 9). Fix, rebuild, re-check.
7. **Deliver** the .docx and mention: fonts that must be installed, and that Word will ask to update fields if a TOC is present.

## 2. Non-negotiable RTL rules

| Element | Rule |
|---|---|
| Paragraph | `bidirectional: true` on **every** paragraph, including inside table cells, headers, footers, captions |
| Run | `rightToLeft: true`, complex-script font in `font.cs`, `sizeComplexScript` = `size`, `boldComplexScript` = `bold`, `language: { bidirectional: "fa-IR" }` |
| Alignment | **Never use LEFT/RIGHT** (their meaning flips in bidi paragraphs). Body text: `BOTH` (justify). Headings: `BOTH` or `CENTER`. Title/cover/captions: `CENTER` |
| Table cell text | **Omit alignment** (defaults to start = right). Use `CENTER` for codes, numbers, short labels. Do **not** justify narrow cells — Persian justification stretches words badly |
| Table | `visuallyRightToLeft: true` → first column is on the right. Set `columnWidths` AND each cell `width` in DXA; sum = content width |
| Section | `<w:bidi/>` in each `<w:sectPr>` (post-process; docx-js has no option) |
| Indents | In bidi paragraphs `indent.left` is the **start (right) side**. Hanging indents work logically |
| Left-side blocks | Date/attachment block, signature: use a borderless 2-column RTL table and put the text in the **second** (left) column. Never align left |
| Headings | `HeadingLevel.HEADING_1/2` + `paragraphStyles` with ids `Heading1`/`Heading2` and `outlineLevel` (for TOC). Use `keepNext`; avoid `pageBreakBefore` on every H1 (creates half-empty pages) |
| Formula / pure Latin line | Separate paragraph **without** `bidirectional`, centered, e.g. Cambria Math italic |
| Code, paths, file names | Inline: an LTR run (`rightToLeft: false`) wrapped in LRM marks (U+200E) — without them `~/.claude/skills/` or `examples/` get reordered inside RTL text. In helper text use backticks: ``شاخه `examples/` ``. A table cell that is only Latin/code becomes an LTR centered paragraph (helper does it automatically) |

## 3. Fonts — choose a path (no fixed font)

Every run needs both a Persian (`cs`) font and a Latin (`ascii`/`hAnsi`) partner.

| Path | When | Body (cs) | Headings (cs) | Latin partner |
|---|---|---|---|---|
| **A — Classic Iranian official** | Recipients use Iranian Windows setups (B-fonts installed); official letters, government/ستاد entities | B Nazanin, B Lotus, B Mitra, B Zar | B Titr, B Yekan, B Nazanin Bold | Times New Roman |
| **B — Modern open-source** | Modern look; cross-platform; fonts may be shared/embedded | Vazirmatn, Sahel, Samim, Shabnam, Parastoo | Vazirmatn Bold/ExtraBold, Estedad | Calibri / Segoe UI / same font |
| **C — System-safe** | Recipient's fonts unknown; must look right anywhere without installs | Tahoma, Arial, Segoe UI, Times New Roman | Tahoma Bold, Arial Bold | same font |
| **D — Office-native modern** | Microsoft 365 users | Calibri, Segoe UI (Persian glyphs ok) | Segoe UI Semibold | same font |

Guidance:
- Sizes that read well: B Nazanin body 13 pt (size 26), tables 11 pt, H1 17 pt, H2 13.5 pt. Vazirmatn/Tahoma need ~1–1.5 pt less than B Nazanin.
- Line spacing 1.3 (`line: 312`) for body; 1.15 (`276`) in tables.
- If the document leaves the organization and fonts are Path A/B, tell the user they can embed fonts in Word (File › Options › Save › Embed fonts in the file).
- Never pick a font only because it exists in the sandbox; the sandbox is for preview only (section 9).

## 4. Text hygiene (do it before building)

- **Digits:** write Persian digits ۰۱۲۳۴۵۶۷۸۹ in Persian text and tables (helper `fa()`). Keep Latin digits only inside Latin terms (ISO 31000, D1).
- **Letters:** normalize Arabic ي/ك → Persian ی/ک; use ة/ئ only where the word really has them.
- **ZWNJ (نیم‌فاصله, U+200C):** «می‌شود»، «نشان‌دهنده»، «بسته‌ها»، «پیش‌نیاز». Never a plain space or nothing.
- **Punctuation:** «» for quotes, ، ؛ ؟ for comma/semicolon/question mark. The middle dot `·` renders like Persian zero in many fonts — use «،» or «؛» as separators instead.
- **Latin inside Persian:** plain words (Claude, Word, ISO 31000) are fine inside RTL runs; anything with leading/trailing punctuation or slashes (paths, file names, versions like `v1.0`, commands) must go in an LTR run with LRM marks (backtick markup in the helper). Avoid starting a paragraph with a Latin word.
- **Dates:** Shamsi. In Node: `new Intl.DateTimeFormat('fa-IR-u-ca-persian', {day:'numeric', month:'long', year:'numeric'}).format(d)` → «۲۶ مهر ۱۴۰۵».
- **Formal letters:** «بسمه تعالی» centered at top; تاریخ / پیوست block on the left; addressee «… محترم»; «با سلام و احترام،»; closing «با تجدید احترام»; sign with the full formal name (e.g. «سید رضا موسوی»), never a first name alone.

## 5. Lists and numbering

- **Bullets:** docx-js `numbering` with `LevelFormat.BULLET` (e.g. "■", teal, 8 pt) and `indent { left: 520, hanging: 300 }`. Works correctly on the right side.
- **Numbered items:** write the number yourself so it stays Persian: text `"۱.\t…"` with `indent { left: 560, hanging: 400 }` (hanging indent acts as the tab stop). Word list numbering often shows Latin digits.
- Checklists: same manual approach with «☐».

## 6. Tables, captions, callouts

- Header row: dark fill (e.g. navy), white bold text, centered, `tableHeader: true`; all rows `cantSplit: true`.
- Zebra body rows (very light gray) or a tinted first column for row labels (bold, dark color).
- Qualitative ratings: tint cells (green/yellow/red at low saturation) and explain the colors in the caption.
- Captions: tables «جدول ۱ — …» above the table; figures «شکل ۱ — …» below; centered, bold, colored. Number them automatically.
- Callout box: 1-cell RTL table, light tint fill, top and bottom colored borders only.
- Wide tables in portrait A4: keep ≤ 6 columns; give the descriptive column the most width; 10.5–11 pt text. Columns holding file names/paths need enough width for the longest name in monospace (≈ 110 DXA per character at 9.5 pt) or they wrap mid-name.

## 7. Figures (diagrams, charts, roadmaps, Gantt)

Render as PNG from HTML in Chromium (Playwright is available; correct Persian shaping and bidi):
- Get a Persian font for rendering: `npm install vazirmatn` (fonts in `node_modules/vazirmatn/fonts/ttf`), reference with `@font-face` `file://` URLs; open the HTML from disk with `page.goto('file://…')` (not `set_content`).
- `<html lang="fa" dir="rtl">`; in inline SVG set `direction="rtl"` and `text-anchor="middle"` (or `start` = right side under rtl). File names and code inside figures: `direction:ltr; text-align:left` on that element.
- `scripts/render_figure.py page.html out.png` renders the first `.fig` element of an HTML page (when the skill folder includes `scripts/`).
- Screenshot the figure element at `device_scale_factor` ≈ 2.4, width 1000 px; insert in Word at ~620 px wide for A4 with 2 cm margins (keep aspect ratio from the PNG header).
- RTL logic in visuals: flows, timelines, Gantt and roadmaps run **right → left** (week 1 / phase 0 on the right, time arrow pointing left). Quantitative axes (2×2, charts) keep low→high left→right and bottom→top.
- Each figure gets a title that states the finding and a one-line subtitle; one accent color; consistent palette with the document (e.g. navy #1F3A5F, teal #1C7C7D, light teal #E3F1F1, line #C9D1DA, muted #5B6B7B).
- Useful figure types for consulting/engineering documents: layered dependency diagram, reinforcing loop (cycle), 2×2 decision matrix, phase chevrons with outputs, wave roadmap with decision gates, Gantt by week, governance tree, grouped repository/system structure.
- Look at every PNG before inserting (clipping, wrapped labels, stray arrows).

## 8. Helper module (tested) — copy to `fa_docx.js` and require it

The same module ships as `scripts/fa_docx.js` next to this file; copy it into the working directory if present, otherwise write the block below to `fa_docx.js`.

```js
const fs = require("fs"), path = require("path");
const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("docx"))] }));
const d = require("docx");
const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType, HeadingLevel, ImageRun, VerticalAlign, TableLayoutType } = d;

const T = { // theme — change freely
  body: "B Nazanin", title: "B Titr", latin: "Times New Roman", mono: "Consolas",
  navy: "1F3A5F", teal: "1C7C7D", tint: "E3F1F1", line: "C9D1DA", ink: "1E2A36", muted: "5B6B7B", zebra: "F4F7FA",
  W: 9638, // A4 width 11906 − 2×1134 margins (DXA)
};
const fa = (s) => String(s).replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[x]);
const norm = (s) => String(s).replace(/ي/g, "ی").replace(/ك/g, "ک");
const font = (cs) => ({ ascii: T.latin, hAnsi: T.latin, eastAsia: T.latin, cs });

function run(text, o = {}) {
  const sz = o.size || 26;
  return new TextRun({ text: norm(text), rightToLeft: true, font: font(o.font || T.body), size: sz, sizeComplexScript: sz,
    bold: !!o.bold, boldComplexScript: !!o.bold, italics: !!o.italic, italicsComplexScript: !!o.italic,
    color: o.color || T.ink, language: { value: "en-US", bidirectional: "fa-IR" } });
}
// LTR run for code, paths, file names inside Persian text: LRM marks keep / . ~ in place
const LRM = "\u200E";
function ltr(text, o = {}) {
  const sz = o.size || 26, f = o.mono ? T.mono : T.latin;
  return new TextRun({ text: LRM + text + LRM, rightToLeft: false, font: { ascii: f, hAnsi: f, eastAsia: f, cs: T.body },
    size: sz, sizeComplexScript: sz, bold: !!o.bold, boldComplexScript: !!o.bold, color: o.color || T.ink });
}
function runs(text, o = {}) { // **bold** and `code` markup
  return String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map((p) =>
    p.startsWith("**") ? run(p.slice(2, -2), { ...o, bold: true, color: o.color || T.navy })
    : p.startsWith("`") ? ltr(p.slice(1, -1), { ...o, mono: true, size: (o.size || 26) - 3 })
    : run(p, o));
}
const P = (t, o = {}) => new Paragraph({ bidirectional: true, alignment: o.align || AlignmentType.BOTH,
  spacing: { before: o.before || 0, after: o.after ?? 140, line: o.line || 312 }, keepNext: o.keepNext, children: runs(t, o) });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, bidirectional: true, alignment: AlignmentType.BOTH, keepNext: true,
  spacing: { before: 440, after: 220 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: T.teal, space: 6 } },
  children: [run(t, { font: T.title, size: 34, color: T.navy })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.BOTH, keepNext: true,
  spacing: { before: 260, after: 120 }, children: [run(t, { font: T.title, size: 27, color: T.teal })] });
const bullet = (t) => new Paragraph({ bidirectional: true, alignment: AlignmentType.BOTH, numbering: { reference: "bul", level: 0 },
  spacing: { after: 90, line: 312 }, children: runs(t) });
const num = (i, t) => new Paragraph({ bidirectional: true, alignment: AlignmentType.BOTH, indent: { left: 560, hanging: 400 },
  spacing: { after: 90, line: 312 }, children: [run(`${fa(i)}.\t`, { bold: true, color: T.teal }), ...runs(t)] });

const thin = { style: BorderStyle.SINGLE, size: 4, color: T.line };
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const RATE = { g: "E3F2E8", m: "FFF4D6", b: "F8E1E1" }; // suffix a cell with |g |m |b to tint it
function cell(text, w, o = {}) {
  let t = String(text), fill = o.fill; const m = t.match(/\|([gmb])$/); if (m) { fill = RATE[m[1]]; t = t.slice(0, -2); }
  return new TableCell({ width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: fill ? { type: ShadingType.CLEAR, color: "auto", fill } : undefined, margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: t.split("\n").map((line) => {
      const code = /^`[^`]+`$/.test(line), latin = code || /^[\x00-\x7F]+$/.test(line);
      if (latin) return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 276 }, // pure Latin/code cell: LTR paragraph
        children: [ltr(code ? line.slice(1, -1) : line, { size: (o.size || 22) - (code ? 3 : 0), mono: code, bold: o.bold, color: o.color })] });
      return new Paragraph({ bidirectional: true, spacing: { after: 0, line: 276 },
        alignment: o.align === AlignmentType.CENTER ? AlignmentType.CENTER : undefined, // text cells: start (right), never justify
        children: runs(line, { size: o.size || 22, bold: o.bold, color: o.color }) });
    }) });
}
// align: array per column, AlignmentType.CENTER or undefined; opts.label = first column bold + tinted
function table(headers, rows, widths, opts = {}) {
  const al = opts.align || [];
  return new Table({ visuallyRightToLeft: true, width: { size: T.W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    borders: { top: thin, bottom: thin, left: thin, right: thin, insideHorizontal: thin, insideVertical: thin },
    rows: [new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) =>
        cell(h, widths[i], { fill: T.navy, bold: true, color: "FFFFFF", align: AlignmentType.CENTER })) }),
      ...rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], {
        align: al[i], fill: opts.label && i === 0 ? T.tint : (ri % 2 ? T.zebra : undefined),
        bold: opts.label && i === 0, color: opts.label && i === 0 ? T.navy : undefined })) }))] });
}
let tNo = 0, fNo = 0;
const tcap = (t) => new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 200, after: 80 },
  children: [run(`جدول ${fa(++tNo)} — ${t}`, { size: 22, bold: true, color: T.teal })] });
function fig(file, caption, width = 620) {
  const buf = fs.readFileSync(file), w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  return [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 60 },
      children: [new ImageRun({ type: "png", data: buf, transformation: { width, height: Math.round(width * h / w) } })] }),
    new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [run(`شکل ${fa(++fNo)} — ${caption}`, { size: 21, bold: true, color: T.muted })] })];
}
function callout(lines) {
  const b = { style: BorderStyle.SINGLE, size: 12, color: T.teal };
  return new Table({ visuallyRightToLeft: true, width: { size: T.W, type: WidthType.DXA }, columnWidths: [T.W],
    borders: { top: b, bottom: b, left: none, right: none, insideHorizontal: none, insideVertical: none },
    rows: [new TableRow({ children: [new TableCell({ width: { size: T.W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: T.tint }, margins: { top: 140, bottom: 140, left: 220, right: 220 },
      children: [].concat(lines).map((t) => P(t, { after: 60 })) })] })] });
}
// two-column borderless block; content goes to the LEFT column (date block, signature)
function leftBlock(paragraphs, leftWidth = 4238) {
  const nb = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
  return new Table({ visuallyRightToLeft: true, width: { size: T.W, type: WidthType.DXA }, columnWidths: [T.W - leftWidth, leftWidth], borders: nb,
    rows: [new TableRow({ children: [new TableCell({ width: { size: T.W - leftWidth, type: WidthType.DXA }, children: [new Paragraph({ children: [] })] }),
      new TableCell({ width: { size: leftWidth, type: WidthType.DXA }, children: paragraphs })] })] });
}
const docDefaults = () => ({
  styles: { default: { document: { run: { font: font(T.body), size: 26, sizeComplexScript: 26, rightToLeft: true, language: { value: "en-US", bidirectional: "fa-IR" } } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: font(T.title), size: 34, sizeComplexScript: 34, color: T.navy }, paragraph: { outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: font(T.title), size: 27, sizeComplexScript: 27, color: T.teal }, paragraph: { outlineLevel: 1 } }] },
  numbering: { config: [{ reference: "bul", levels: [{ level: 0, format: d.LevelFormat.BULLET, text: "■", alignment: AlignmentType.START,
    style: { paragraph: { indent: { left: 520, hanging: 300 } }, run: { color: T.teal, size: 16, sizeComplexScript: 16 } } }] }] },
});
const page = { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1200, left: 1134, right: 1134, header: 600, footer: 600 } };
async function save(doc, outFile) { // packs + adds <w:bidi/> to every section
  const zip = await JSZip.loadAsync(await d.Packer.toBuffer(doc));
  let xml = await zip.file("word/document.xml").async("string");
  xml = xml.replace(/<w:sectPr([^>]*)>([\s\S]*?)<\/w:sectPr>/g, (m, a, inner) => inner.includes("<w:bidi") ? m :
    `<w:sectPr${a}>${inner.includes("<w:docGrid") ? inner.replace("<w:docGrid", "<w:bidi/><w:docGrid") : inner + "<w:bidi/>"}</w:sectPr>`);
  zip.file("word/document.xml", xml);
  fs.writeFileSync(outFile, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}
module.exports = { T, fa, norm, font, run, ltr, runs, P, H1, H2, bullet, num, cell, table, tcap, fig, callout, leftBlock, docDefaults, page, save, thin, none };
```

Usage sketch:
```js
const h = require("./fa_docx"); const d = require("docx");
const doc = new d.Document({ ...h.docDefaults(), features: { updateFields: true }, sections: [{ properties: { page: h.page }, // P("فایل `SKILL.md` در شاخه `scripts/`") → LTR code runs
  footers: { default: new d.Footer({ children: [new d.Paragraph({ bidirectional: true, alignment: d.AlignmentType.CENTER,
    children: [new d.TextRun({ children: ["صفحه ", d.PageNumber.CURRENT, " از ", d.PageNumber.TOTAL_PAGES], rightToLeft: true,
      font: h.font(h.T.body), size: 20, sizeComplexScript: 20, language: { bidirectional: "fa-IR" } })] })] }) },
  children: [h.H1("۱. خلاصه مدیریتی"), h.P("متن **پررنگ** و عادی."), h.bullet("مورد"), h.num(1, "گام اول"),
    h.tcap("عنوان جدول"), h.table(["ستون ۱", "ستون ۲"], [["الف", "۱۲|g"]], [6000, 3638], { label: true, align: [undefined, d.AlignmentType.CENTER] })] }] });
h.save(doc, "out.docx");
```
Cover page: a 1-cell navy table with centered white title lines + a small 2-column info table (کارفرما، مشاور، تهیه‌کننده، تاریخ). For a short document a compact navy title band at the top of page 1 replaces the cover. TOC: `new d.TableOfContents("فهرست مطالب", { hyperlink: true, headingStyleRange: "1-2" })` with `features.updateFields: true`.

## 9. Preview and verification (sandbox)

The sandbox usually lacks Iranian fonts. For preview only, map them to a free font so LibreOffice shapes Persian correctly:
```bash
# one step, when scripts/ is present:  bash scripts/preview.sh out.docx "B Nazanin" "B Titr"
npm install vazirmatn && mkdir -p ~/.fonts ~/.config/fontconfig/conf.d && cp node_modules/vazirmatn/fonts/ttf/*.ttf ~/.fonts/
# ~/.config/fontconfig/conf.d/99-persian-preview.conf: <alias><family>B Nazanin</family><prefer><family>Vazirmatn</family></prefer></alias> (repeat for each chosen font)
fc-cache -f
python <docx-skill>/scripts/office/validate.py out.docx
python <docx-skill>/scripts/office/soffice.py --headless --convert-to pdf out.docx
pdftoppm -jpeg -r 60 out.pdf page   # build 4-up contact sheets with PIL (place pages right→left) and read them
```
Check every page for: paths/file names in correct order (zoom in at 300 dpi — at low resolution a correct `~/.claude` can look reversed); right-aligned/justified text with no left-aligned paragraphs; headings justified or centered; table columns starting from the right; no stretched words in cells; Persian digits; bullets on the right; no near-empty pages or lone lines before a heading; figures sharp and captioned; signature/date on the left. Pagination in Word will differ slightly (real fonts vs preview font) — that is expected.

## 10. Editing an existing Persian .docx

Unzip and edit `word/document.xml` (see `docx` skill). Keep or add `<w:bidi/>` in `w:pPr`, `<w:rtl/>` in `w:rPr`, `<w:bidiVisual/>` in `w:tblPr`, and `w:cs`/`w:szCs`/`w:bCs` on runs. Replace `w:jc` values `left`/`right` with `both`/`center` (or remove for start). Run `merge_runs.py` before find/replace; Persian words are often split across runs at ZWNJ. Latin paths/code found in RTL runs: set `<w:rtl w:val="0"/>` on that run and wrap its text in U+200E marks.
