// Minimal example: a short formal Persian letter built with scripts/fa_docx.js
// Run: npm ci && npm run example   → examples/minimal-letter.docx
const path = require("path");
const d = require("docx");
const h = require("../scripts/fa_docx");
const { P, T } = h;
const C = d.AlignmentType.CENTER;

const date = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

const children = [
  new d.Paragraph({ bidirectional: true, alignment: C, spacing: { after: 200 }, children: [h.run("بسمه تعالی", { font: T.title, size: 26, color: T.navy })] }),
  h.leftBlock([P(`تاریخ: ${date}`, { after: 0 }), P("پیوست: ندارد", { after: 0 })], 3238),
  P("**شرکت محترم نمونه**", { before: 240, after: 40 }),
  P("**موضوع:** نمونه نامه رسمی فارسی", { after: 200 }),
  P("با سلام و احترام،"),
  P("این نامه نمونه‌ای از خروجی ماژول `fa_docx.js` است: متن راست‌به‌چپ و هم‌تراز، ارقام فارسی مانند " + h.fa("1405") + "، نیم‌فاصله درست و مسیرهایی مانند `examples/` که جابه‌جا نمی‌شوند."),
  h.tcap("نمونه جدول"),
  h.table(["ردیف", "شرح", "وضعیت"], [
    ["۱", "متن و تیترها راست‌به‌چپ", "تأیید|g"],
    ["۲", "جدول از راست شروع می‌شود", "تأیید|g"],
    ["۳", "نام فایل در سلول: `SKILL.md`", "تأیید|g"],
  ], [1200, 6038, 2400], { align: [C, undefined, C] }),
  new d.Paragraph({ spacing: { before: 300 }, children: [] }),
  h.leftBlock([P("با تجدید احترام", { align: C, after: 60 }), P("**نام و نام خانوادگی**", { align: C })], 4238),
];

const doc = new d.Document({ ...h.docDefaults(), sections: [{ properties: { page: h.page }, children }] });
const out = path.join(__dirname, "minimal-letter.docx");
h.save(doc, out).then(() => console.log("written:", out));
