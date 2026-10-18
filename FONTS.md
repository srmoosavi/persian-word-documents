# Fonts

**This repository contains no font files.** Documents built with the skill only *name* fonts; the reader's computer supplies them. That keeps the repository free of licensing problems and lets every user choose.

## The four font paths

| Path | Body | Headings | Where the fonts come from | Redistribution |
|---|---|---|---|---|
| A — Classic Iranian official | B Nazanin, B Lotus, B Mitra, B Zar | B Titr, B Yekan | Installed with many Persian Windows setups and Persian Office add-ons | Terms are not clearly published. **Do not commit or attach these fonts**; let each user install them from their own source |
| B — Modern open-source | Vazirmatn, Sahel, Samim, Shabnam, Parastoo | Vazirmatn Bold, Estedad | Their official GitHub repositories (below) | Open font licenses (mostly SIL OFL 1.1) allow use and embedding; check each repository for its current license |
| C — System-safe | Tahoma, Arial, Segoe UI, Times New Roman | Bold weights of the same | Shipped with Windows and macOS | Licensed with the operating system; do not redistribute |
| D — Office-native | Calibri, Segoe UI | Segoe UI Semibold | Shipped with Microsoft Office / Windows | Licensed with Office/Windows; do not redistribute |

Official sources for path B:

- Vazirmatn — https://github.com/rastikerdar/vazirmatn
- Sahel — https://github.com/rastikerdar/sahel-font
- Samim — https://github.com/rastikerdar/samim-font
- Shabnam — https://github.com/rastikerdar/shabnam-font
- Parastoo — https://github.com/rastikerdar/parastoo-font
- Estedad — https://github.com/aminabedi68/Estedad

## Sharing documents outside your organization

If the reader may not have the fonts:

- choose path C, or
- embed the fonts in the file from Word: *File › Options › Save › Embed fonts in the file* (only for fonts whose license allows embedding), or
- also send a PDF.

## Preview fonts

`scripts/preview.sh` installs the npm package `vazirmatn` into a local `.preview-fonts/` folder and maps the document's font names to it **only for rendering previews** in LibreOffice. The `.docx` itself is not changed and still names the fonts you chose.
