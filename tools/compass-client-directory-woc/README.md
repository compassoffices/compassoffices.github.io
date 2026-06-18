# Compass Offices — Client Directory · Wing On Centre (HKG)

A single, self-contained bilingual (English / 繁體中文) web version of the
35-page Wing On Centre Client Directory. One HTML file, zero external
dependencies — every image, logo and the tagline are inlined.

## What you get

```
compass-client-directory-woc/
├── compass-client-directory-wing-on-centre.html   ← THE DELIVERABLE (ship this)
├── build.py                                        ← rebuilds the deliverable from src/
├── README.md
├── src/                                            ← editable source
│   ├── shell.html          page chrome: <head>, scoped .cd CSS, header,
│   │                       sidebar nav, lightbox, all JS  ({{LOGO_LIGHT}}, {{CONTENT}})
│   ├── content_a.html      Welcome · Quick reference · Centre Info ·
│   │                       Facilities · Security & Fire · Access  ({{ELEMENT}})
│   ├── content_b.html      House Rules (EN + verbatim 繁中) · Fees & Charges
│   ├── content_c.html      Floor Plan · Evacuation · Price Guide · Phone &
│   │                       Devices · Payment & Credit · footer
│   │                       ({{FLOORPLAN}}, {{EVAC}}, {{LOGO_DARK}}, {{TAGLINE}})
│   └── assets/
│       ├── logo-light.svg      header wordmark (inlined as <svg>)
│       ├── logo-dark.svg       footer wordmark (inlined as svg data-URI)
│       ├── tagline.svg         "/ A GREAT PLACE TO WORK /" (footer data-URI)
│       ├── element.svg         compass mark, hero watermark (inline <svg>)
│       ├── floorplan.png       Appendix A  (980px, base64-inlined)
│       └── evacuation.png      Appendix B  (980px, base64-inlined)
└── source/
    └── Client_Directory_-_HKG_WOC.pdf              original source PDF
```

## Editing & rebuilding

Edit any file in `src/` — copy text, a fee, a translation, swap an asset —
then run:

```bash
python3 build.py
```

That regenerates `compass-client-directory-wing-on-centre.html`, re-inlining
every asset (PNGs → `data:image/png;base64`, footer SVGs → svg data-URIs,
header logo + hero mark → raw inline `<svg>`). No build tools, no npm — just
Python 3 with Pillow not even required.

The split is deliberate: text and structure live in the four HTML files;
binary assets live in `src/assets/`. One change at a time, rebuild, upload.

## Deploying

**GitHub Pages (recommended).** Upload the built HTML as-is. The JS
(language toggle, scrollspy sidebar, click-to-zoom lightbox, print) runs
fine, and the Google Fonts `<link>` in `<head>` loads Hanken Grotesk +
Noto Sans TC.

**WordPress Custom HTML block.** Two tweaks before pasting:

1. Swap the Google Fonts `<link>` in `<head>` for `font-family: inherit`
   on the `.cd` root so it picks up the theme fonts (WP themes often block
   external font loads).
2. WP can strip `<script>` on publish — if the toggle/scrollspy stop
   working after publishing, that's why. GitHub Pages avoids this entirely.

Images are already base64-inline, so nothing else needs hosting either way.

## Conventions baked in

- All CSS scoped under the `.cd` prefix — safe to drop into any page.
- One brand orange: `#FF6600` (hover `#E55A00`). Dark sections `#1A1A1A`.
- No emoji — inline SVG icons only.
- Numbers/fees render once in language-neutral cells; only labels and prose
  toggle EN ⇆ 繁中, so figures can never drift between languages.
- House Rules & Privacy use the official verbatim Traditional Chinese from
  the source PDF; operational copy is translated to HK 繁中.

Passes the Compass brand linter clean (`--context standalone`): 0 fail, 0 warn.
