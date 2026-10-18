// Structural tests for scripts/fa_docx.js — run with: npm test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs"), os = require("os"), path = require("path");
const d = require("docx");
const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("docx"))] }));
const h = require("../scripts/fa_docx");

async function build(children) {
  const file = path.join(os.tmpdir(), `fa-docx-test-${process.pid}-${Math.random().toString(36).slice(2)}.docx`);
  await h.save(new d.Document({ ...h.docDefaults(), sections: [{ properties: { page: h.page }, children }] }), file);
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  fs.unlinkSync(file);
  return zip.file("word/document.xml").async("string");
}
const paragraphs = (xml) => xml.match(/<w:p>[\s\S]*?<\/w:p>|<w:p [\s\S]*?<\/w:p>/g) || [];

test("fa() converts Latin digits to Persian", () => {
  assert.strictEqual(h.fa("2026-10-18"), "۲۰۲۶-۱۰-۱۸");
});

test("norm() converts Arabic yeh/kaf to Persian", () => {
  assert.strictEqual(h.norm("كتاب يك"), "کتاب یک");
});

test("every section carries <w:bidi/>", async () => {
  const xml = await build([h.P("سلام")]);
  const sects = xml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/g);
  assert.ok(sects && sects.length > 0);
  for (const s of sects) assert.match(s, /<w:bidi\/>/);
});

test("Persian paragraphs are bidi and runs are RTL", async () => {
  const xml = await build([h.P("این یک **آزمون** است."), h.H1("۱. عنوان"), h.H2("۱-۱. زیرعنوان")]);
  for (const p of paragraphs(xml)) {
    if (/[؀-ۿ]/.test(p)) assert.match(p, /<w:bidi\/>/, "Persian paragraph without <w:bidi/>");
  }
  assert.match(xml, /<w:rtl\/>/);
  assert.match(xml, /w:cs="B Nazanin"/);
});

test("no LEFT/RIGHT alignment anywhere", async () => {
  const xml = await build([
    h.P("متن"), h.H1("عنوان"), h.bullet("مورد"), h.num(1, "گام"), h.callout("یادداشت"),
    h.table(["الف", "ب"], [["یک", "دو"]], [4819, 4819]),
    h.leftBlock([h.P("امضا")]),
  ]);
  assert.doesNotMatch(xml, /<w:jc w:val="(left|right)"\/>/);
});

test("tables are visually right-to-left", async () => {
  const xml = await build([h.table(["ستون ۱", "ستون ۲"], [["الف", "ب"]], [4819, 4819])]);
  assert.match(xml, /<w:bidiVisual\/>/);
});

test("inline code/paths are LTR runs wrapped in LRM marks", async () => {
  const xml = await build([h.P("مسیر `~/.claude/skills/` را ببینید.")]);
  assert.ok(xml.includes("‎~/.claude/skills/‎"), "path not wrapped in LRM");
  const run = xml.match(/<w:r>(?:(?!<w:r>)[\s\S])*?~\/\.claude\/skills\/[\s\S]*?<\/w:r>/)[0];
  assert.match(run, /<w:rtl w:val="(false|0)"\/>/);
});

test("a Latin-only table cell becomes an LTR paragraph", async () => {
  const xml = await build([h.table(["فایل", "توضیح"], [["`examples/`", "نمونه‌ها"]], [4819, 4819])]);
  const p = paragraphs(xml).find((x) => x.includes("examples/"));
  assert.ok(p, "cell paragraph not found");
  assert.doesNotMatch(p, /<w:bidi\/>/);
});

test("captions are numbered with Persian digits", async () => {
  const xml = await build([h.tcap("نمونه")]);
  assert.match(xml, /جدول [۰-۹]+ — نمونه/);
});
