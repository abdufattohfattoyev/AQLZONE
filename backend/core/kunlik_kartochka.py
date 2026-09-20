"""
Kunlik son — ulashiladigan natija kartochkasi (PNG).

─────────────────── NEGA RASM, MATN EMAS ───────────────────

Ilgari ulashish emoji kvadratchalarini MATN qilib yuborardi. Sinf
guruhida u boshqa xabarlar orasida yo'qolib ketadi va 30 kun ichida
tugma bor-yo'g'i BIR marta bosildi. Rasm esa guruhda o'zi ko'zga
tashlanadi, ostida esa havola va tugma turadi — ya'ni kartochkaning
o'zi reklama bo'ladi.

─────────────────── JUMBOQ OCHILIB QOLMAYDI ───────────────────

Kartochkada faqat RANGLAR bor, sonlar yo'q. Aks holda uni ko'rgan
do'st javobni bilib qolardi va kunlik jumboqning butun ma'nosi
yo'qolardi — hamma bir xil savolni O'ZI yechishi kerak.

Bot rasmni FAQAT o'yinchining o'z suhbatiga yuboradi. Guruhga
yo'naltirishni odam o'zi qiladi: begona guruhga bot yozishi — spam.
"""
from __future__ import annotations

import io

from django.conf import settings
from django.utils import timezone
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from . import kunlik_son as KS
from . import xabar as X
from .models import Identity, KunlikSonNatija, Profile

#: Kvadrat kartochka: Telegram uni kesmasdan, to'liq ko'rsatadi.
EN, BAL = 1000, 880
S = 2                                   # supersampling (silliq chetlar uchun)

FON = (18, 15, 13)
FON2 = (44, 28, 16)
OQ = (249, 244, 238)
XIRA = (168, 154, 140)
OLTIN = (245, 188, 77)
RANG = {"yashil": (46, 160, 110), "oltin": (229, 169, 60), "boz": (58, 50, 44)}

SHRIFT_QALIN = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    r"C:\Windows\Fonts\segoeuib.ttf",
)
SHRIFT_ODDIY = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    r"C:\Windows\Fonts\segoeui.ttf",
)


def _shrift(px: int, qalin: bool = True):
    for yol in (SHRIFT_QALIN if qalin else SHRIFT_ODDIY):
        try:
            return ImageFont.truetype(yol, px)
        except Exception:                              # noqa: BLE001
            continue
    return ImageFont.load_default()


def _markazda(d: ImageDraw.ImageDraw, y: int, matn: str, shrift, rang) -> None:
    en = d.textlength(matn, font=shrift)
    d.text(((EN * S - en) / 2, y), matn, font=shrift, fill=rang)


def chiz(*, ism: str, raqam: int, daraja: int, urinish: int, bajardi: bool,
         sekund: int, zanjir: int, ranglar: list[list[str]],
         joy: int | None = None, yechgan: int = 0) -> bytes:
    """Kartochkani chizadi va PNG baytlarini qaytaradi."""
    t = Image.new("RGB", (EN * S, BAL * S), FON)
    d = ImageDraw.Draw(t)

    # Yumshoq issiq yog'du — qorong'i fon "o'lik" ko'rinmasin.
    nur = Image.new("RGB", (EN * S, BAL * S), (0, 0, 0))
    ImageDraw.Draw(nur).ellipse(
        [EN * S // 2 - 420 * S, -260 * S, EN * S // 2 + 420 * S, 360 * S], fill=FON2)
    t = Image.blend(t, nur.filter(ImageFilter.GaussianBlur(120 * S)), 0.55)
    d = ImageDraw.Draw(t)

    _markazda(d, 70 * S, "AQL ZONE", _shrift(30 * S), OLTIN)
    _markazda(d, 118 * S, f"Kunlik son #{raqam}", _shrift(58 * S), OQ)
    daraja_nom = {1: "Oson", 2: "O'rta", 3: "Qiyin"}.get(daraja, "")
    natija = f"{urinish}/{KS.URINISH}" if bajardi else f"X/{KS.URINISH}"
    daqiqa, soniya = divmod(max(0, sekund), 60)
    vaqt = f"{daqiqa} daq {soniya} s" if daqiqa else f"{soniya} s"
    _markazda(d, 196 * S, f"{daraja_nom} · {natija} urinish · {vaqt}", _shrift(30 * S, False), XIRA)

    # Kvadratchalar — faqat ranglar, sonlar yo'q.
    ustun = max((len(r) for r in ranglar), default=8)
    katak = min(78, int(700 / max(ustun, 1)))
    oraliq = max(6, katak // 9)
    kx = (EN - (katak * ustun + oraliq * (ustun - 1))) // 2
    ky = 270
    for qator in ranglar:
        for i, r in enumerate(qator):
            x = (kx + i * (katak + oraliq)) * S
            y = ky * S
            d.rounded_rectangle([x, y, x + katak * S, y + katak * S],
                                radius=int(katak * S * 0.22), fill=RANG.get(r, RANG["boz"]))
        ky += katak + oraliq

    pastki = ky + 30
    if zanjir > 0:
        yoz = f"{zanjir} kun ketma-ket"
        sh = _shrift(40 * S)
        en = d.textlength(yoz, font=sh)
        quti = [(EN * S - en) / 2 - 34 * S, pastki * S, (EN * S + en) / 2 + 34 * S, (pastki + 72) * S]
        d.rounded_rectangle(quti, radius=36 * S, fill=(52, 34, 18), outline=OLTIN, width=2 * S)
        d.text(((EN * S - en) / 2, (pastki + 14) * S), yoz, font=sh, fill=OLTIN)
        pastki += 100

    _markazda(d, pastki * S, ism[:28], _shrift(44 * S), OQ)
    pastki += 64
    if joy and yechgan:
        _markazda(d, pastki * S, f"Bugun {yechgan} kishi yechdi · siz {joy}-o'rinda",
                  _shrift(32 * S, False), XIRA)
    _markazda(d, (BAL - 120) * S, "Sen nechanchi urinishda yechasan?", _shrift(34 * S, False), XIRA)
    bot = getattr(settings, "BOT_USERNAME", "") or "aqlzone_bot"
    _markazda(d, (BAL - 72) * S, f"@{bot}", _shrift(34 * S), OLTIN)

    t = t.resize((EN, BAL), Image.LANCZOS)
    xotira = io.BytesIO()
    t.save(xotira, format="PNG", optimize=True)
    return xotira.getvalue()


def natijadan(h: KunlikSonNatija, profil: Profile) -> bytes:
    from .duel import korinadigan_ism

    yechim = KS.jumboq(KS.kun_kaliti(h.sana), h.daraja)
    ranglar = [KS.solishtir(u, yechim) for u in (h.urinishlar or [])]
    kun_royxat = KS.royxat(kun=h.sana)
    return chiz(
        ism=korinadigan_ism(profil), raqam=KS.jumboq_raqami(h.sana), daraja=h.daraja,
        urinish=h.urinish, bajardi=h.bajardi, sekund=h.sekund,
        zanjir=KS.zanjir(profil, h.sana), ranglar=ranglar,
        joy=KS.joy(profil, h.sana, h.daraja), yechgan=kun_royxat["yechgan"],
    )


def _tg_id(profil: Profile) -> str:
    kirish = (Identity.objects.filter(pupil=profil.pupil, provider=Identity.TELEGRAM)
              .values_list("external_id", flat=True).first())
    return str(kirish or "")


def telegramga_yubor(profil: Profile, kun=None) -> dict:
    """
    Bugungi natija kartochkasini o'yinchining o'z suhbatiga yuboradi.

    Odam uni O'ZI kerakli guruhga yo'naltiradi — shuning uchun tugma
    havolasi umumiy (`?start=kunlik`), shaxsiy emas.
    """
    kun = kun or timezone.localdate()
    h = (KunlikSonNatija.objects.filter(profile=profil, sana=kun)
         .order_by("-bajardi", "urinish").first())
    if not h:
        raise KS.KunlikXato("natija_yoq", 409)
    chat_id = _tg_id(profil)
    if not chat_id:
        raise KS.KunlikXato("telegram_yoq", 409)
    if not getattr(settings, "BOT_TOKEN", ""):
        raise KS.KunlikXato("bot_yoq", 503)

    bot = getattr(settings, "BOT_USERNAME", "") or "aqlzone_bot"
    sarlavha = (f"<b>Kunlik son #{KS.jumboq_raqami(h.sana)}</b>\n"
                f"{'Yechildi' if h.bajardi else 'Bugun bo`lmadi'} · "
                f"{h.urinish}/{KS.URINISH} urinish\n\n"
                "Kartochkani do'stlaringizga yoki sinf guruhiga yuboring.")
    holat, izoh, _ = X.rasm_yubor(
        chat_id, natijadan(h, profil), sarlavha,
        tugmalar=[("Men ham o'ynayman", f"https://t.me/{bot}?start=kunlik", "")],
    )
    if holat == "bloklandi":
        X.bloklanganini_belgila(profil.pupil_id)
        raise KS.KunlikXato("bloklangan", 409)
    if holat != "yuborildi":
        raise KS.KunlikXato(izoh or "yuborilmadi", 502)
    return {"ok": True, "yuborildi": True}
