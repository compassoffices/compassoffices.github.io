#!/usr/bin/env python3
"""
Build the single self-contained Client Directory HTML for
Compass Offices - Wing On Centre (HKG).

Edit anything in src/ (the shell, the three content fragments, or the
assets) and re-run this script. It inlines every asset so the output is
one portable file with zero external dependencies (images become base64
data-URIs; logos/tagline/element become inline SVG or SVG data-URIs).

    python3 build.py

Output: compass-client-directory-wing-on-centre.html  (in this folder)
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "src"
ASSETS = SRC / "assets"
OUT = HERE / "compass-client-directory-wing-on-centre.html"


def read(p):
    return Path(p).read_text(encoding="utf-8")


def png_data_uri(p):
    b = Path(p).read_bytes()
    return "data:image/png;base64," + base64.b64encode(b).decode()


def svg_data_uri(p):
    # SVG injected via <img src="...">  (footer logo + tagline)
    b = Path(p).read_bytes()
    return "data:image/svg+xml;base64," + base64.b64encode(b).decode()


def main():
    shell = read(SRC / "shell.html")
    a = read(SRC / "content_a.html")
    b = read(SRC / "content_b.html")
    c = read(SRC / "content_c.html")

    # --- inline assets inside the content fragments ---
    # ELEMENT + LOGO_LIGHT are injected as raw inline <svg> (no data-URI wrapper)
    a = a.replace("{{ELEMENT}}", read(ASSETS / "element.svg"))

    c = c.replace("{{FLOORPLAN}}", png_data_uri(ASSETS / "floorplan.png"))
    c = c.replace("{{EVAC}}", png_data_uri(ASSETS / "evacuation.png"))
    c = c.replace("{{LOGO_DARK}}", svg_data_uri(ASSETS / "logo-dark.svg"))
    c = c.replace("{{TAGLINE}}", svg_data_uri(ASSETS / "tagline.svg"))

    content = a + "\n\n" + b + "\n\n" + c

    # --- assemble the shell ---
    html = shell.replace("{{LOGO_LIGHT}}", read(ASSETS / "logo-light.svg"))
    html = html.replace("{{CONTENT}}", content)

    OUT.write_text(html, encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print(f"Built {OUT.name}  ({kb:.0f} KB)")


if __name__ == "__main__":
    main()
