// Persian (Farsi) RTL helpers for docx-js — part of persian-word-documents (MIT)
// Mirrors section 8 of SKILL.md. Requires: npm package "docx" (jszip comes with it).
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
