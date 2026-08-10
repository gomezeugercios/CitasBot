"""
Genera las dos imágenes PNG de la landing:

  assets/img/og.png      1200x630  → preview de WhatsApp / Twitter / LinkedIn
  assets/img/poster.png  1280x720  → portada del vídeo demo

Se dibujan por código (sin fotos de stock, sin dependencias de diseño) para
que puedas regenerarlas cambiando los textos de abajo:

    python tools/make-images.py

Requisitos:  pip install pillow
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ─────────────────────────── TEXTOS EDITABLES ───────────────────────────
BRAND = "CITASBOT"

OG_LINES = [("Tu recepción cierra", "white"),
            ("a las 20:00.", "white"),
            ("Tus clientes, no.", "lime")]
OG_SUB = "Chatbot de citas 24/7 por WhatsApp y Telegram"
OG_PILL = "Ver la demo de 60 segundos"

POSTER_TITLE = "Así da una cita a las 22:41"
POSTER_SUB = "Demo real · 60 segundos"

# ─────────────────────────── PALETA (= styles.css) ──────────────────────
BG = (10, 11, 15)
TXT = (243, 245, 239)
TXT2 = (162, 169, 180)
LIME = (198, 242, 78)
LIME_D = (166, 220, 34)
VIOLET = (124, 92, 255)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img"
FONTS = Path("C:/Windows/Fonts")


def font(bold: bool, size: int) -> ImageFont.FreeTypeFont:
    """Segoe UI: grotesca limpia presente en Windows. Cambia la ruta si usas
    otra (p. ej. una Space Grotesk descargada) y vuelve a ejecutar el script."""
    for name in (["segoeuib.ttf", "arialbd.ttf"] if bold else ["segoeui.ttf", "arial.ttf"]):
        p = FONTS / name
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default(size)


def backdrop(w: int, h: int, glows) -> Image.Image:
    """Fondo con resplandores radiales: se calcula pequeño y se escala, que es
    la forma barata de conseguir un degradado suave sin numpy."""
    sw, sh = 160, max(1, round(160 * h / w))
    small = Image.new("RGB", (sw, sh), BG)
    px = small.load()
    for y in range(sh):
        for x in range(sw):
            r, g, b = BG
            for (cx, cy, rad, color, strength) in glows:
                dx = (x / sw - cx) / rad
                dy = (y / sh - cy) / (rad * sw / sh)
                d = (dx * dx + dy * dy) ** 0.5
                if d < 1:
                    k = (1 - d) ** 2 * strength
                    r += (color[0] - r) * k
                    g += (color[1] - g) * k
                    b += (color[2] - b) * k
            px[x, y] = (int(r), int(g), int(b))
    return small.resize((w, h), Image.LANCZOS)


def tracked(draw, xy, text, fnt, fill, track=0):
    """Texto con espaciado entre letras (Pillow no lo trae de serie)."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + track
    return x


def pill(draw, x, y, text, fnt, pad=(30, 16)):
    tw = draw.textlength(text, font=fnt)
    th = fnt.size
    w, h = tw + pad[0] * 2, th + pad[1] * 2
    draw.rounded_rectangle([x, y, x + w, y + h], radius=h / 2, fill=LIME)
    draw.text((x + pad[0], y + pad[1] - 2), text, font=fnt, fill=BG)
    return w, h


def phone(img, x, y, w, h, bubbles):
    """Maqueta de móvil con burbujas de chat, en RGBA para las transparencias."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle([x, y, x + w, y + h], radius=w * 0.13,
                        fill=(16, 19, 28, 255), outline=(255, 255, 255, 48), width=2)
    inset = w * 0.035
    d.rounded_rectangle([x + inset, y + inset, x + w - inset, y + h - inset],
                        radius=w * 0.105, fill=(12, 14, 20, 255))
    # barra superior
    d.rounded_rectangle([x + w * 0.32, y + inset + 10, x + w * 0.68, y + inset + 26],
                        radius=8, fill=(6, 7, 11, 255))
    d.ellipse([x + w * 0.10, y + w * 0.20, x + w * 0.10 + 34, y + w * 0.20 + 34], fill=LIME + (255,))
    d.rounded_rectangle([x + w * 0.10 + 48, y + w * 0.20 + 5, x + w * 0.10 + 150, y + w * 0.20 + 15],
                        radius=5, fill=(255, 255, 255, 130))
    d.rounded_rectangle([x + w * 0.10 + 48, y + w * 0.20 + 22, x + w * 0.10 + 110, y + w * 0.20 + 30],
                        radius=4, fill=(198, 242, 78, 150))
    d.line([x + inset, y + w * 0.42, x + w - inset, y + w * 0.42], fill=(255, 255, 255, 28), width=2)

    cy = y + w * 0.55
    for side, lines, bw in bubbles:
        bh = 22 * len(lines) + 26
        if side == "user":
            bx1, bx0 = x + w - inset - 16, x + w - inset - 16 - bw
            fill, line = LIME + (255,), (10, 11, 15, 190)
        else:
            bx0, bx1 = x + inset + 16, x + inset + 16 + bw
            fill, line = (255, 255, 255, 26), (255, 255, 255, 150)
        d.rounded_rectangle([bx0, cy, bx1, cy + bh], radius=16, fill=fill)
        ly = cy + 14
        for wfrac in lines:
            d.rounded_rectangle([bx0 + 14, ly, bx0 + 14 + (bw - 28) * wfrac, ly + 10],
                                radius=5, fill=line)
            ly += 22
        cy += bh + 14
    img.alpha_composite(layer)


# ─────────────────────────── OG 1200x630 ───────────────────────────
def make_og():
    W, H = 1200, 630
    img = backdrop(W, H, [
        (0.06, 0.05, 0.62, VIOLET, 0.42),
        (0.86, 0.92, 0.55, LIME, 0.20),
        (0.62, 0.10, 0.40, VIOLET, 0.18),
    ]).convert("RGBA")
    d = ImageDraw.Draw(img)

    f_brand = font(True, 24)
    f_h = font(True, 62)
    f_sub = font(False, 29)
    f_pill = font(True, 27)

    # chip de marca
    d.ellipse([72, 76, 90, 94], fill=LIME)
    tracked(d, (104, 72), BRAND, f_brand, TXT, track=3.4)

    y = 158
    for text, kind in OG_LINES:
        d.text((70, y), text, font=f_h, fill=LIME if kind == "lime" else TXT)
        y += 76

    d.text((72, y + 22), OG_SUB, font=f_sub, fill=TXT2)
    pill(d, 72, y + 92, OG_PILL, f_pill)

    phone(img, 812, 62, 316, 506, [
        ("user", [1.0, 0.45], 190),
        ("bot", [1.0, 0.92, 0.5], 236),
        ("user", [0.8], 150),
    ])

    img.convert("RGB").save(OUT / "og.png", optimize=True)


# ─────────────────────────── Póster 1280x720 ───────────────────────
# Ojo: NO lleva botón de play dibujado. El play lo pone el CSS encima
# (facade de YouTube) o el propio navegador (<video>). Dos serían un error.
def make_poster():
    W, H = 1280, 720
    img = backdrop(W, H, [
        (0.50, 0.10, 0.72, VIOLET, 0.36),
        (0.10, 0.92, 0.58, LIME, 0.13),
        (0.92, 0.85, 0.52, VIOLET, 0.18),
    ]).convert("RGBA")
    d = ImageDraw.Draw(img)

    # chip de marca arriba a la izquierda (zona que el overlay no tapa)
    f_brand = font(True, 22)
    d.ellipse([64, 60, 80, 76], fill=LIME)
    tracked(d, (94, 56), BRAND, f_brand, TXT, track=3.2)

    # halo detrás del móvil
    halo = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dh = ImageDraw.Draw(halo)
    for i in range(16):
        k = 1 - i / 16
        rr = 250 + i * 24
        dh.ellipse([640 - rr, 360 - rr * 0.78, 640 + rr, 360 + rr * 0.78],
                   fill=VIOLET + (int(9 * k),))
    img.alpha_composite(halo)

    phone(img, 490, 96, 300, 528, [
        ("user", [0.9], 168),
        ("bot", [1.0, 0.86], 224),
        ("user", [0.65], 132),
        ("bot", [1.0, 0.55], 224),
    ])

    # apunte de escena abajo a la derecha (bottom-left lo ocupa el overlay)
    f_s = font(False, 24)
    txt = POSTER_SUB
    d.text((W - 64 - d.textlength(txt, font=f_s), H - 84), txt, font=f_s, fill=TXT2)
    t2 = POSTER_TITLE
    f_t = font(True, 30)
    d.text((W - 64 - d.textlength(t2, font=f_t), H - 128), t2, font=f_t, fill=TXT)

    img.convert("RGB").save(OUT / "poster.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    make_og()
    make_poster()
    for f in ("og.png", "poster.png"):
        print(f"{f:12} {(OUT / f).stat().st_size / 1024:6.1f} KB")
