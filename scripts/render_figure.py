#!/usr/bin/env python3
"""Render an RTL HTML figure to a high-resolution PNG for insertion into Word.

Part of persian-word-documents (MIT). Runs locally with Playwright's Chromium;
it opens only the local file you pass and makes no other network requests
(fonts must be referenced with file:// URLs or installed locally).

Usage:
    python scripts/render_figure.py figure.html figure.png [--selector .fig] [--width 1000] [--scale 2.4]

The HTML should use <html lang="fa" dir="rtl"> and wrap the figure in an element
matching the selector (default: .fig). Insert the PNG in Word at ~620 px wide
for A4 with 2 cm margins.
"""
import argparse
import pathlib
import sys


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("html", type=pathlib.Path)
    ap.add_argument("png", type=pathlib.Path)
    ap.add_argument("--selector", default=".fig")
    ap.add_argument("--width", type=int, default=1000)
    ap.add_argument("--scale", type=float, default=2.4)
    args = ap.parse_args()

    html = args.html.resolve()
    if not html.is_file():
        print(f"not found: {html}", file=sys.stderr)
        return 1
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright is required: pip install playwright && python -m playwright install chromium", file=sys.stderr)
        return 1

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": args.width, "height": 800}, device_scale_factor=args.scale)
        page.goto(html.as_uri())  # from disk, so file:// fonts load
        page.wait_for_timeout(300)
        el = page.locator(args.selector).first
        el.screenshot(path=str(args.png))
        box = el.bounding_box()
        browser.close()
    print(f"{args.png} ({box['width']:.0f}x{box['height']:.0f} css px)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
