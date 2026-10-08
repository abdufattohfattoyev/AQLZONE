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

Belgining shakli `frontend/public/logo.svg` dan olingan: firuza plitka,
unda yonma-yon oq "A" va amber "Z" (2026-10-08 dan; ilgari shapka + "A" +
ochiq kitob edi). Ikkalasini birga o'zgartiring: bir xil brend ikki xil
ko'rinsa, u brend bo'lmay qoladi.

─────────────────── NEGA SHRIFT ZAXIRALI ───────────────────

Konteynerda shrift bo'lmasligi mumkin (Dockerfile'ga `fonts-dejavu-core`
qo'shilgan, lekin lokal ishlab chiqishda Windows shrifti ishlatiladi).
Shrift topilmasa tamg'a MATNSIZ — faqat belgi — bo'lib bosiladi.
Rasmni umuman qabul qilmaslikdan bu ancha yaxshi: masala rasmi
shriftga bog'liq bo'lib qolmasligi kerak.
"""
from __future__ import annotations

try:
    from PIL import Image, ImageChops, ImageDraw, ImageFont
except ImportError:                                   # pragma: no cover
    Image = None                                      # type: ignore[assignment]
    ImageChops = None                                 # type: ignore[assignment]
    ImageDraw = None                                  # type: ignore[assignment]
    ImageFont = None                                  # type: ignore[assignment]

#: Brend ranglari — `logo.svg` dagi gradientlarning uchlari (firuza palitra).
FON_BOSH = (44, 198, 212)       # #2cc6d4
FON_ORTA = (23, 179, 193)       # #17b3c1 — asosiy rang
FON_OXIR = (14, 143, 155)       # #0e8f9b
OQ_BOSH = (255, 255, 255)
OQ_OXIR = (227, 246, 248)       # #e3f6f8
AMBER_BOSH = (255, 184, 77)     # #ffb84d
AMBER_OXIR = (217, 119, 6)      # #d97706
A_SOYA = (8, 99, 107, 140)
Z_SOYA = (138, 75, 0, 153)
SIYOH = (31, 41, 55)            # #1f2937
FIRUZA = (14, 143, 155)         # "Zone" yozuvi — oq yostiqda o'qilishi uchun to'q firuza

#: Harflar — `logo.svg` dagi chiziqlar (120x120 to'rda), qalinligi 11.
A_YOL = [(19, 88), (42, 30), (65, 88)]
A_KONDALANG = [(30, 69), (54, 69)]
Z_YOL = [(63, 32), (98, 32), (65, 88), (101, 88)]
QALIN = 11

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


def _gradient(olcham: int, ranglar, diagonal: bool = True):
    """
    Bir necha rangli gradient (diagonal yoki tik).

    64x64 da chiziladi va kattalashtiriladi: har pikselni Python'da
    hisoblash rasm yuklashning har safarida sezilarli sekinlik berardi,
    kattalashtirilgan gradientni esa ko'z ajratmaydi.
    """
    kichik = Image.new("RGB", (64, 64))
    px = kichik.load()
    oxir = len(ranglar) - 1
    for y in range(64):
        for x in range(64):
            t = (x + y) / 126 if diagonal else y / 63
            i = min(int(t * oxir), oxir - 1)
            u = t * oxir - i
            a, b = ranglar[i], ranglar[i + 1]
            px[x, y] = tuple(round(a[j] + (b[j] - a[j]) * u) for j in range(3))
    return kichik.resize((olcham, olcham), Image.BILINEAR)


def _chiziq(d, nuqtalar, qalin: float, rang) -> None:
    """Uchlari va burilishlari YUMALOQ siniq chiziq (SVG round cap/join)."""
    d.line(nuqtalar, fill=rang, width=round(qalin), joint="curve")
    r = qalin / 2
    for x, y in nuqtalar:
        d.ellipse([x - r, y - r, x + r, y + r], fill=rang)


def _belgi(olcham: int, plitka: bool = True):
    """
    AqlZone belgisi (firuza plitka + oq "A" + amber "Z") — shaffof RGBA.

    `logo.svg` bilan bir xil: avval Z (orqada), keyin A — A'ning o'ng oyog'i
    Z'ning pastini yopib turadi. Har harfning ostida siljigan soyasi bor.

    `plitka=False` — faqat harflar, fonsiz. Kanal rasmlaridagi xira SUV
    BELGISI uchun: to'liq plitka 10% shaffoflikda ham matn ostida katta
    to'rtburchak dog' bo'lib qolardi, harflar esa fonga yumshoq singadi.
    """
    k = olcham / BAZA
    im = Image.new("RGBA", (olcham, olcham), (0, 0, 0, 0))

    def n(nuqtalar, dx=0.0, dy=0.0):
        return [((x + dx) * k, (y + dy) * k) for x, y in nuqtalar]

    if plitka:
        # Plitka: yumaloq to'rtburchak niqob orqali gradient.
        niqob = Image.new("L", (olcham, olcham), 0)
        ImageDraw.Draw(niqob).rounded_rectangle([0, 0, olcham - 1, olcham - 1], 28 * k, fill=255)
        im.paste(_gradient(olcham, (FON_BOSH, FON_ORTA, FON_OXIR)), (0, 0), niqob)

        # Tepadagi yaltiroq: oq, pastga qarab yo'qoladi.
        yaltir = Image.new("L", (olcham, olcham), 0)
        yd = yaltir.load()
        chegara = round(62 * k * 0.55)
        for y in range(chegara):
            q = round(77 * (1 - y / chegara))
            for x in range(olcham):
                yd[x, y] = q
        yaltir = ImageChops.multiply(yaltir, niqob)
        im.alpha_composite(Image.merge("RGBA", (*Image.new("RGB", (olcham, olcham), (255, 255, 255)).split(), yaltir)))

    def harf(yollar, rangi_bosh, rangi_oxir, soya, diagonal):
        qatlam = Image.new("RGBA", (olcham, olcham), (0, 0, 0, 0))
        sd = ImageDraw.Draw(qatlam)
        for yol in yollar:
            _chiziq(sd, n(yol, 1.4, 3), QALIN * k, soya)
        im.alpha_composite(qatlam)
        niqob = Image.new("L", (olcham, olcham), 0)
        nd = ImageDraw.Draw(niqob)
        for yol in yollar:
            _chiziq(nd, n(yol), QALIN * k, 255)
        im.paste(_gradient(olcham, (rangi_bosh, rangi_oxir), diagonal), (0, 0), niqob)

    harf([Z_YOL], AMBER_BOSH, AMBER_OXIR, Z_SOYA, True)
    harf([A_YOL, A_KONDALANG], OQ_BOSH, OQ_OXIR, A_SOYA, False)
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
                        fill=(255, 255, 255, 232), outline=(200, 236, 241, 255),
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
