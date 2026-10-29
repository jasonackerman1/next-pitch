"""Resize Jay's finished brand art (_brand/art/, local only) into the app's img/ (WebP: a quarter of the PNG size, same look) and icons/ (PNG, which iOS needs).

Heads keep their full square canvas (they were all drawn on one blank base, so they line up
exactly; trimming them one by one would break that). Run again whenever art is redone:
    python3 tools/process_art.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / '_brand' / 'art'

def save(img, dest, size=None, height=None, trim=False):
    img = img.convert('RGBA')
    if trim:
        img = img.crop(img.getbbox())
    if size:
        img = img.resize((size, size), Image.LANCZOS)
    if height:
        img = img.resize((round(img.width * height / img.height), height), Image.LANCZOS)
    dest = dest.with_suffix('.webp')
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, quality=90, method=6)
    print(f'{dest.relative_to(ROOT)}  {img.size}  {dest.stat().st_size // 1024} KB')

HEADS = ['happy', 'excited', 'laughing', 'wink', 'cool', 'surprised', 'gameface', 'determined', 'thinking']
POSES = ['batting', 'coaching', 'fielding', 'running', 'throwing', 'primary', 'celebrate', 'thumbsup']
BADGES = ['rookie', 'streak', 'headsup', 'stealer', 'goldglove', 'rulebook', 'thinker', 'iqmaster']

for h in HEADS:
    save(Image.open(SRC / f'head-{h}.png'), ROOT / 'img/skip' / f'head-{h}.png', size=300)
# Small runner/fielder figure on the field diagram.
save(Image.open(SRC / 'head-happy.png'), ROOT / 'img/skip/head-mini.png', size=96)
for p in POSES:
    save(Image.open(SRC / f'pose-{p}.png'), ROOT / 'img/skip' / f'pose-{p}.png', height=460)
for b in BADGES:
    save(Image.open(SRC / f'badge-{b}.png'), ROOT / 'img/badges' / f'{b}.png', size=200, trim=True)
save(Image.open(SRC / 'reward-glove.png'), ROOT / 'img/reward-glove.png', size=240, trim=True)
save(Image.open(SRC / 'logo.png'), ROOT / 'img/logo.png', height=300, trim=True)

icon = Image.open(SRC / 'app-icon.png').convert('RGB')
for s in (180, 192, 512):
    out = ROOT / 'icons' / f'icon-{s}.png'
    icon.resize((s, s), Image.LANCZOS).save(out, optimize=True)
    print(f'icons/icon-{s}.png  {out.stat().st_size // 1024} KB')
