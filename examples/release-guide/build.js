// Example: the 3-page Persian release guide (A4, B Nazanin/B Titr) built with scripts/fa_docx.js
// Run from the repository root: node examples/release-guide/build.js
const h = require("../../scripts/fa_docx");
const d = require("docx");
const { T, P, H1, H2, bullet, num, table, tcap, fig, callout, fa } = h;
const C = d.AlignmentType.CENTER;

const today = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long", year: "numeric" }).format(new Date("2026-10-18"));

// title band
const band = new d.Table({
  visuallyRightToLeft: true, width: { size: T.W, type: d.WidthType.DXA }, columnWidths: [T.W],
  borders: { top: h.none, bottom: h.none, left: h.none, right: h.none, insideHorizontal: h.none, insideVertical: h.none },
  rows: [new d.TableRow({ children: [new d.TableCell({
    width: { size: T.W, type: d.WidthType.DXA }, shading: { type: d.ShadingType.CLEAR, color: "auto", fill: T.navy },
    margins: { top: 300, bottom: 300, left: 300, right: 300 },
    children: [
      new d.Paragraph({ bidirectional: true, alignment: C, spacing: { after: 100 }, children: [h.run("سند راهنمای انتشار", { size: 22, color: "A9D6D6", bold: true })] }),
      new d.Paragraph({ bidirectional: true, alignment: C, spacing: { after: 100, line: 340 }, children: [h.run("انتشار Skill اسناد فارسی Word در گیت‌هاب", { font: T.title, size: 38, color: "FFFFFF" })] }),
      new d.Paragraph({ bidirectional: true, alignment: C, spacing: { after: 0 }, children: [h.run("اسناد لازم برای انتشاری حرفه‌ای، امن و آسان‌برای‌استفاده", { size: 24, color: "DDEBEB" })] }),
    ],
  })] })],
});
const meta = new d.Paragraph({ bidirectional: true, alignment: C, spacing: { before: 120, after: 200 },
  children: [h.run(`تهیه‌کننده: سید رضا موسوی   |   نسخه ${fa("0.1")}   |   ${today}`, { size: 21, color: T.muted })] });

const body = [
  band, meta,
  H1("۱. هدف و خلاصه"),
  P("این سند فهرست اسناد و فایل‌هایی را تعیین می‌کند که برای انتشار Skill `persian-word-documents` در گیت‌هاب لازم است. این Skill به Claude کمک می‌کند اسناد Word فارسی را با راست‌به‌چپ کامل، جدول‌ها و تیترهای درست، ارقام فارسی و نمودارهای خوانا تولید کند."),
  callout(["**سه وعده به کاربر:** «اطمینان» با نمونه و آزمون خودکار، «امنیت» با کد شفاف، بدون ارسال داده و با وابستگی‌های پین‌شده، و «آسودگی» با نصب کمتر از پنج دقیقه و راهنمای دوزبانه."]),
  H1("۲. ساختار پیشنهادی مخزن"),
  ...fig(__dirname + "/fig_repo.png", "ساختار پیشنهادی مخزن گیت‌هاب"),
  H1("۳. اسناد لازم"),
  P("سیزده جزء زیر، مخزن را از یک فایل ساده به یک پروژه قابل اعتماد تبدیل می‌کند. اجزای «ضروری» پیش از نخستین انتشار عمومی آماده می‌شوند."),
  tcap("اسناد و فایل‌های مخزن"),
  table(["سند", "هدف", "محتوای کلیدی", "اولویت"], [
    ["`SKILL.md`", "دستورالعمل اجرایی Claude", "سرآیند `name` و `description`؛ قواعد RTL، مسیرهای فونت و ماژول کمکی", "ضروری|g"],
    ["`README.md`\n`README.fa.md`", "معرفی و شروع سریع", "تصویر قبل و بعد، نصب در Claude و Claude Code، مثال، محدودیت‌ها، سلب مسئولیت", "ضروری|g"],
    ["`LICENSE`", "تعیین حقوق استفاده", "مجوز MIT برای کد و متن Skill", "ضروری|g"],
    ["`FONTS.md`", "شفافیت حقوقی فونت‌ها", "فونت‌ها در مخزن نیستند؛ مجوز و منبع هر مسیر فونت", "ضروری|g"],
    ["`SECURITY.md`", "گزارش امن آسیب‌پذیری", "راه تماس خصوصی، زمان پاسخ، نسخه‌های تحت پشتیبانی", "ضروری|g"],
    ["`CHANGELOG.md`", "شفافیت تغییرات", "نسخه‌بندی معنایی و تغییرات هر نسخه", "ضروری|g"],
    ["`examples/`", "اثبات کیفیت", "اسکریپت نمونه، خروجی docx و pdf، تصویر صفحات", "ضروری|g"],
    ["`scripts/`", "کد قابل استفاده مجدد", "ماژول `fa_docx.js`، ساخت نمودار، پیش‌نمایش", "ضروری|g"],
    ["`tests/`", "جلوگیری از پسرفت", "ساخت سند نمونه و اعتبارسنجی ساختار XML", "توصیه‌شده|m"],
    ["`.github/workflows/`", "آزمون خودکار", "اجرای آزمون‌ها در هر تغییر", "توصیه‌شده|m"],
    ["`.github/ISSUE_TEMPLATE/`", "گزارش منظم اشکال", "قالب گزارش اشکال و پیشنهاد، با درخواست نمونه خروجی", "توصیه‌شده|m"],
    ["`CONTRIBUTING.md`", "تسهیل مشارکت", "روش پیشنهاد تغییر، سبک کد و نحوه آزمون", "توصیه‌شده|m"],
    ["`CODE_OF_CONDUCT.md`", "فضای حرفه‌ای", "منشور رفتاری Contributor Covenant", "توصیه‌شده|m"],
  ], [2700, 1900, 3738, 1300], { label: true, align: [C, undefined, undefined, C] }),
  P("رنگ سبز «ضروری» و رنگ زرد «توصیه‌شده» را نشان می‌دهد.", { size: 20, color: T.muted, align: C, before: 60 }),

  H1("۴. امنیت و اعتماد"),
  bullet("**بدون ارسال داده:** کد هیچ اطلاعاتی را به خارج ارسال نمی‌کند و تنها فایل خروجی را در مسیر تعیین‌شده می‌نویسد."),
  bullet("**وابستگی‌های حداقلی و پین‌شده:** فقط `docx` (و `jszip` همراه آن)؛ فونت وزیرمتن صرفاً برای پیش‌نمایش. فایل `package-lock.json` منتشر و Dependabot فعال می‌شود."),
  bullet("**فونت‌های دارای حق نشر در مخزن قرار نمی‌گیرند:** فونت‌های مسیر کلاسیک روی سیستم کاربر نصب می‌شوند؛ فونت‌های متن‌باز با پیوند به منبع رسمی معرفی می‌شوند."),
  bullet("**انتشار قابل راستی‌آزمایی:** هر نسخه با برچسب (tag) در بخش Releases، به همراه فایل ZIP آماده نصب و کد هش SHA-256 آن."),
  bullet("**نام‌گذاری و سلب مسئولیت:** نام Skill شامل Claude یا Anthropic نیست. در README تصریح می‌شود که پروژه مستقل است و وابستگی رسمی به Anthropic ندارد."),

  H1("۵. نصب آسان برای کاربر"),
  P("README باید هر دو مسیر نصب را با تصویر و در چند گام کوتاه توضیح دهد:", { keepNext: true }),
  num(1, "**Claude (وب و دسکتاپ):** دریافت فایل ZIP از بخش Releases و بارگذاری آن در بخش Skills تنظیمات Claude."),
  num(2, "**Claude Code:** کپی پوشه Skill در مسیر `~/.claude/skills/` برای استفاده شخصی، یا `.claude/skills/` برای یک پروژه."),
  num(3, "**آزمون اولیه:** درخواست یک سند نمونه فارسی و مقایسه آن با فایل‌های پوشه `examples/`."),

  H1("۶. گام‌های انتشار"),
  tcap("برنامه انتشار"),
  table(["گام", "اقدام", "خروجی"], [
    ["۱", "تست داخلی Skill روی سه نوع سند: نامه، گزارش و پیشنهاد فنی", "فهرست اشکالات و اصلاح آن‌ها"],
    ["۲", "تهیه اسناد ضروری جدول ۱ و نمونه‌ها", "مخزن کامل برای نسخه پیش‌انتشار"],
    ["۳", "انتشار نسخه v0.9 به‌صورت پیش‌انتشار و دریافت بازخورد", "گزارش‌های Issue از کاربران اولیه"],
    ["۴", "رفع بازخوردها و افزودن آزمون خودکار", "انتشار نسخه v1.0"],
  ], [900, 5338, 3400], { align: [C, undefined, undefined] }),
  P("**گام بعدی پیشنهادی:** تهیه متن کامل README دوزبانه، FONTS.md، SECURITY.md و نمونه‌های پوشه `examples/` بر اساس همین فهرست.", { before: 160 }),
];

const footer = new d.Footer({ children: [new d.Paragraph({ bidirectional: true, alignment: C,
  children: [new d.TextRun({ children: ["صفحه ", d.PageNumber.CURRENT, " از ", d.PageNumber.TOTAL_PAGES], rightToLeft: true,
    font: h.font(T.body), size: 20, sizeComplexScript: 20, color: T.muted, language: { bidirectional: "fa-IR" } })] })] });

const doc = new d.Document({ ...h.docDefaults(), creator: "سید رضا موسوی", title: "انتشار Skill اسناد فارسی Word در گیت‌هاب",
  sections: [{ properties: { page: h.page }, footers: { default: footer }, children: body }] });
h.save(doc, __dirname + "/Persian-Word-Skill-GitHub-Release-Guide.docx").then(() => console.log("ok"));
