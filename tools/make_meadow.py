#!/usr/bin/env python3
"""Generate assets/images/floral-meadow.svg — the low "ground floral meadow"
that sits at the foot of the half-moon venue arch. Fuller at both ends, open in
the middle, in the candlelight palette. Deterministic (fixed seed)."""
import math
import random
from pathlib import Path

random.seed(807)
W, H = 1200, 220
GROUND = 205

SAGE = ['#8C9478', '#A3A98F', '#B7BBA4', '#7D8670']
BLOOMS = [  # (petal, centre)
    ('#FFFDFA', '#ECC8AD'), ('#FBF3EA', '#D6A274'), ('#F4E3D3', '#C98E55'),
    ('#ECC8AD', '#B07A4E'), ('#E7C3B5', '#A86F5C'), ('#FFFFFF', '#E3C08F'),
]

back, mid, front = [], [], []


def density_x():
    """Pick an x weighted toward both ends (asymmetric, heavier on the left)."""
    side = 0 if random.random() < 0.56 else 1
    t = random.betavariate(1.1, 3.2)          # most mass near 0
    x = t * W * 0.62
    return x if side == 0 else W - x


def height_at(x):
    edge = min(x, W - x) / (W / 2)            # 0 at ends, 1 at centre
    return 150 * (1 - edge) ** 1.4 + 18


def stem(x, h, layer, color=None, width=1.1):
    top = GROUND - h
    bend = random.uniform(-14, 14)
    layer.append(f'<path d="M{x:.1f} {GROUND} Q{x + bend / 2:.1f} {GROUND - h / 2:.1f} {x + bend:.1f} {top:.1f}" '
                 f'stroke="{color or random.choice(SAGE)}" stroke-width="{width}" fill="none" stroke-linecap="round"/>')
    return x + bend, top


def leaf(x, y, size, angle, layer):
    layer.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{size:.1f}" ry="{size * 0.32:.1f}" '
                 f'transform="rotate({angle:.0f} {x:.1f} {y:.1f})" fill="{random.choice(SAGE)}" opacity="0.85"/>')


def bloom(x, y, r, layer):
    petal, centre = random.choice(BLOOMS)
    n = random.choice([5, 5, 6, 8])
    rot = random.uniform(0, 360)
    parts = []
    for i in range(n):
        a = math.radians(rot + i * 360 / n)
        px, py = x + math.cos(a) * r * 0.62, y + math.sin(a) * r * 0.62
        parts.append(f'<ellipse cx="{px:.1f}" cy="{py:.1f}" rx="{r * 0.55:.1f}" ry="{r * 0.36:.1f}" '
                     f'transform="rotate({math.degrees(a):.0f} {px:.1f} {py:.1f})"/>')
    layer.append(f'<g fill="{petal}" stroke="#D9C2A3" stroke-width="0.6">{"".join(parts)}</g>'
                 f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r * 0.28:.1f}" fill="{centre}"/>')


def babys_breath(x, y, layer):
    for _ in range(random.randint(5, 9)):
        dx, dy = random.gauss(0, 7), random.gauss(0, 5)
        layer.append(f'<circle cx="{x + dx:.1f}" cy="{y + dy:.1f}" r="{random.uniform(1.2, 2.2):.1f}" fill="#FFFDFA" stroke="#E2D6C6" stroke-width="0.4"/>')


# Grass
for _ in range(170):
    x = density_x()
    h = height_at(x) * random.uniform(0.25, 0.7)
    stem(x, h, back, width=random.uniform(0.6, 1.2))

# Taller wisps & leaves
for _ in range(70):
    x = density_x()
    h = height_at(x) * random.uniform(0.6, 1.0)
    tx, ty = stem(x, h, back, width=0.9)
    for k in range(random.randint(1, 3)):
        fy = GROUND - h * random.uniform(0.2, 0.7)
        leaf(x + random.uniform(-6, 6), fy, random.uniform(7, 12), random.choice([-1, 1]) * random.uniform(25, 60), mid)
    if random.random() < 0.5:
        babys_breath(tx, ty, mid)

# Blooms
for _ in range(95):
    x = density_x()
    h = height_at(x) * random.uniform(0.35, 0.95)
    tx, ty = stem(x, h, mid, width=1)
    r = random.uniform(6, 12) * (1.25 if h > 90 else 1)
    bloom(tx, ty, r, front)

# Petals scattered on the ground, like the photograph
for _ in range(40):
    x = random.uniform(0, W)
    y = GROUND + random.uniform(-3, 10)
    front.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{random.uniform(3, 6):.1f}" ry="{random.uniform(1.6, 3):.1f}" '
                 f'transform="rotate({random.uniform(-40, 40):.0f} {x:.1f} {y:.1f})" fill="#FBF3EA" stroke="#E2D6C6" stroke-width="0.5"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax meet">'
       f'<ellipse cx="{W / 2}" cy="{GROUND + 6}" rx="{W * 0.48}" ry="10" fill="#ECC8AD" opacity="0.25"/>'
       + ''.join(back) + ''.join(mid) + ''.join(front) + '</svg>\n')

out = Path(__file__).resolve().parent.parent / 'assets/images/floral-meadow.svg'
out.write_text(svg, encoding='utf-8')
print(f'Wrote {out.name} ({len(svg) // 1024} KB)')
