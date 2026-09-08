"""
Masala rasmiga AqlZone tamg'asi.

─────────────────────── NEGA KERAK ───────────────────────

Masala rasmi bizda qolmaydi: u Telegram kanaliga chiqadi, u yerdan
skrinshot bo'lib boshqa kanallarga, guruhlarga va darsliklarga ko'chadi.
Ko'chgan rasmda esa manba yo'q — odam masalani ko'radi, lekin uni kim
tayyorlaganini va davomini qayerdan izlashni bilmaydi.

Tamg'a shu zanjirni ulaydi: rasm qayerga borsa, nom u bilan boradi.

─────────────────── NEGA AYNAN SHU YERDA ───────────────────

Tamg'a `rasm.tayyorla()` ichida, ya'ni rasm saqlanadigan YAGONA yo'lda
bosiladi. Chizmani chizadigan buyruq ham (`masala_rasm`), foydalanuvchi
yuklagan surat ham o'sha yo'ldan o'tadi — demak tamg'asiz rasm bazaga
umuman tusha olmaydi. Uni har bir chaqiruvchida alohida bosish ham
mumkin edi, lekin bitta joyda unutilsa — tamg'asiz rasm chiqib ketardi.

Belgining shakli `frontend/public/logo.svg` dan olingan (shapka + "A" +
ochiq kitob). Ikkalasini birga o'zgartiring: bir xil brend ikki xil
ko'rinsa, u brend bo'lmay qoladi.

─────────────────── NEGA SHRIFT ZAXIRALI ───────────────────

Konteynerda shrift bo'lmasligi mumkin (Dockerfile'ga `fonts-dejavu-core`
qo'shilgan, lekin lokal ishlab chiqishda Windows shrifti ishlatiladi).
Shrift topilmasa tamg'a MATNSIZ — faqat belgi — bo'lib bosiladi.
Rasmni umuman qabul qilmaslikdan bu ancha yaxshi: masala rasmi
shriftga bog'liq bo'lib qolmasligi kerak.
"""
from __future__ import annotations

import math

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:                                   # pragma: no cover
    Image = None                                      # type: ignore[assignment]
    ImageDraw = None                                  # type: ignore[assignment]
    ImageFont = None                                  # type: ignore[assignment]

#: Brend ranglari — `logo.svg` dagi gradientlarning uchlari.
A_BOSH = (47, 127, 228)
A_OXIR = (34, 189, 109)
SIYOH = (22, 39, 107)
FIRUZA = (34, 168, 192)
SHAPKA = (26, 51, 118)
SHAPKA_ICH = (22, 41, 94)
KITOB = (27, 69, 168)

#: Belgi `logo.svg` ning 120x120 lik koordinatasida chiziladi va
#: keyin kerakli o'lchamga kichraytiriladi. Supersampling — chetlari
#: silliq chiqishi uchun: kichik tamg'ada zinapoyali chet darrov
#: ko'zga tashlanadi.
BAZA = 120
S = 4

#: Tamg'aning rasm eniga nisbatan balandligi va chetdan bo'shlig'i.
ULUSH = 0.052
ENG_KICHIK = 30
CHET = 0.022

SHRIFTLAR = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\arialbd.ttf",
)


def _shrift(px: int):
    """Qalin shrift — topilmasa `None` (tamg'a matnsiz bosiladi)."""
    for yol in SHRIFTLAR:
        try:
            return ImageFont.truetype(yol, px)
        except Exception:                             # noqa: BLE001
            continue
    return None


def _burab(nuqtalar, cx: float, cy: float, burchak: float):
    """Nuqtalarni markaz atrofida buradi — shapka qiya turadi."""
    a = math.radians(burchak)
    c, s = math.cos(a), math.sin(a)
    return [
        ((x - cx) * c - (y - cy) * s + cx, (x - cx) * s + (y - cy) * c + cy)
        for x, y in nuqtalar
    ]


def _gradient(olcham: int):
    """
    Diagonal ko'k→yashil gradient.

    64x64 da chiziladi va kattalashtiriladi: har pikselni Python'da
    hisoblash rasm yuklashning har safarida sezilarli sekinlik berardi,
    kattalashtirilgan gradientni esa ko'z ajratmaydi.
    """
    kichik = Image.new("RGB", (64, 64))
    px = kichik.load()
    for y in range(64):
        for x in range(64):
            t = (x + y) / 126
            px[x, y] = tuple(
                round(A_BOSH[i] + (A_OXIR[i] - A_BOSH[i]) * t) for i in range(3)
            )
    return kichik.resize((olcham, olcham), Image.BILINEAR)


def _belgi(olcham: int):
    """AqlZone belgisi (shapka + "A" + kitob) — shaffof RGBA."""
    k = olcham / BAZA
    im = Image.new("RGBA", (olcham, olcham), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    def n(nuqtalar):
        return [(x * k, y * k) for x, y in nuqtalar]

    # "A" — tashqi uchburchak minus ikkita teshik. Gradient shaklning
    # ichiga niqob orqali quyiladi: ranglarni qo'lda bo'yashdan ko'ra
    # niqob aniqroq, chunki teshiklar ham shu yerda kesiladi.
    niqob = Image.new("L", (olcham, olcham), 0)
    nd = ImageDraw.Draw(niqob)
    nd.polygon(n([(60, 28), (109, 100), (11, 100)]), fill=255)
    nd.polygon(n([(60, 58), (71.5, 75), (48.5, 75)]), fill=0)
    nd.polygon(n([(44, 83), (76, 83), (80.5, 91), (39.5, 91)]), fill=0)
    im.paste(_gradient(olcham), (0, 0), niqob)

    # Shapka A'ning uchini yopadi, shuning uchun undan KEYIN chiziladi.
    d.polygon(n(_burab([(60, 6), (96, 22), (60, 38), (24, 22)], 60, 24, -13)),
              fill=SHAPKA)
    d.polygon(n(_burab([(48, 29), (72, 29), (72, 41), (48, 41)], 60, 24, -13)),
              fill=SHAPKA_ICH)
    popuk = _burab([(93.5, 22.6), (93.5, 44)], 60, 24, -13)
    d.line(n(popuk), fill=SHAPKA_ICH, width=max(1, round(2.6 * k)))
    px, py = popuk[1]
    r = 5 * k
    d.ellipse([px * k - r, py * k - r, px * k + r, py * k + r], fill=SHAPKA_ICH)

    # Ochiq kitob: A shu yerda "turadi". Egri chiziqlar bir nechta
    # nuqta bilan taqlid qilinadi — tamg'a o'lchamida farqi ko'rinmaydi.
    chap = [(4, 98), (20, 93.5), (40, 94), (58, 100),
            (58, 113), (40, 106), (20, 106.5), (4, 107)]
    d.polygon(n(chap), fill=KITOB)
    d.polygon(n([(120 - x, y) for x, y in chap]), fill=KITOB)
    return im


def _tamga(balandlik: int):
    """Yozuvi bilan birga to'liq tamg'a — shaffof RGBA."""
    h = balandlik * S
    belgi_o = round(h * 0.86)
    shrift = _shrift(round(h * 0.52))

    yozuv = "AqlZone"
    olchov = Image.new("RGBA", (1, 1))
    od = ImageDraw.Draw(olchov)
    matn_en = round(od.textlength(yozuv, font=shrift)) if shrift else 0

    ichki = round(h * 0.20)
    oraliq = round(h * 0.13) if matn_en else 0
    w = ichki * 2 + belgi_o + oraliq + matn_en

    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Oq yostiq: tamg'a chizmaning oq fonida ham, to'q rangli
    # bo'yalgan qismida ham bir xil o'qilishi kerak.
    d.rounded_rectangle([0, 0, w - 1, h - 1], h / 2,
                        fill=(255, 255, 255, 232), outline=(226, 232, 246, 255),
                        width=max(1, round(h * 0.035)))
    im.alpha_composite(_belgi(belgi_o), (ichki, (h - belgi_o) // 2))

    if shrift:
        # "Aql" siyoh rangda, "Zone" firuzada — logotipdagidek.
        x = ichki + belgi_o + oraliq
        y = h / 2
        d.text((x, y), "Aql", font=shrift, fill=SIYOH, anchor="lm")
        d.text((x + od.textlength("Aql", font=shrift), y), "Zone",
               font=shrift, fill=FIRUZA, anchor="lm")

    return im.resize((round(w / S), balandlik), Image.LANCZOS)


def tamgala(img):
    """
    Rasmning o'ng pastki burchagiga tamg'a bosadi va o'zini qaytaradi.

    O'ng past ATAYLAB: chizmalarda savol matni pastda-markazda, shart
    esa tepada turadi — burchak deyarli har doim bo'sh qoladi. Chapda
    esa masala matnining oxiri tez-tez tugaydi.

    Tamg'a rasm eniga nisbatan o'lchanadi: qat'iy piksel bersak, katta
    chizmada u ko'rinmas nuqtaga, kichigida esa rasmning yarmiga
    aylanardi.
    """
    if Image is None:                                 # pragma: no cover
        return img

    en, bal = img.size
    h = max(ENG_KICHIK, round(en * ULUSH))
    # Juda kichik rasmda tamg'a chizmani bosib qolmasin.
    if h * 3 > bal or h * 6 > en:
        return img

    tamga = _tamga(h)
    chet = max(6, round(en * CHET))
    img.paste(tamga, (en - tamga.width - chet, bal - tamga.height - chet), tamga)
    return img
