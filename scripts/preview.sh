#!/usr/bin/env bash
# Preview a Persian .docx as PDF + page images, mapping the document's fonts to Vazirmatn
# so LibreOffice shapes Persian correctly when the real fonts are not installed.
# Part of persian-word-documents (MIT).
#
# Usage: bash scripts/preview.sh file.docx ["Font name" ...]
#   e.g. bash scripts/preview.sh out.docx "B Nazanin" "B Titr"
#
# What it changes on this machine (preview sandbox):
#   - installs the npm package "vazirmatn" into ./.preview-fonts (if missing)
#   - copies its TTF files to ~/.fonts
#   - writes ~/.config/fontconfig/conf.d/99-persian-preview.conf (font aliases only;
#     your main fonts.conf is not touched)
# Output: file.pdf and file-page-N.png next to the .docx
set -euo pipefail

DOCX="${1:?usage: preview.sh file.docx [font names...]}"
shift || true
FONTS=("$@")
[ ${#FONTS[@]} -eq 0 ] && FONTS=("B Nazanin" "B Titr")

WORK="$(pwd)/.preview-fonts"
if [ ! -d "$WORK/node_modules/vazirmatn" ]; then
  mkdir -p "$WORK"
  npm install --prefix "$WORK" --no-audit --no-fund --silent vazirmatn
fi
mkdir -p "$HOME/.fonts" "$HOME/.config/fontconfig/conf.d"
cp -n "$WORK"/node_modules/vazirmatn/fonts/ttf/*.ttf "$HOME/.fonts/" 2>/dev/null || true

CONF="$HOME/.config/fontconfig/conf.d/99-persian-preview.conf"
{
  echo '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>'
  for f in "${FONTS[@]}"; do
    echo "  <alias><family>${f}</family><prefer><family>Vazirmatn</family></prefer></alias>"
  done
  echo '</fontconfig>'
} > "$CONF"
fc-cache -f >/dev/null

OUTDIR="$(cd "$(dirname "$DOCX")" && pwd)"
BASE="$(basename "${DOCX%.*}")"
soffice --headless --convert-to pdf --outdir "$OUTDIR" "$DOCX" >/dev/null
pdftoppm -png -r 80 "$OUTDIR/$BASE.pdf" "$OUTDIR/$BASE-page"
echo "PDF:   $OUTDIR/$BASE.pdf"
ls "$OUTDIR/$BASE"-page-*.png
echo "Note: pagination in Word differs slightly when the real fonts are used."
