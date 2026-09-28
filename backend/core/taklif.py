"""
TAKLIF VA NATIJA KARTASI — o'sishning asosiy halqasi.

    natija → karta (rasm) → guruh / do'st → shaxsiy havola → yangi odam

─────────────────── NEGA KERAK ───────────────────

Haftalik o'sish hisobotining birinchi xulosasi: eng ko'p odamni
"hamma bir xil ishlaydigan" test postlari olib keladi, Telegram'dan
to'g'ridan kelganlar esa eng ko'p qoladi (38%, saytdan kelganlar 9%).
Ya'ni tanish odamning havolasi bilan kelgan — qoladi. Karta shuni
avtomatlashtiradi: DTM/sertifikat natijasi chiroyli rasm bo'lib
odamning o'z Telegram'iga keladi, u uni sinf guruhiga yuboradi,
tugmada esa UNING havolasi turadi.

─────────────────── HAVOLA ───────────────────

`t.me/<bot>?start=ref_<pk>[_dtm|_sertifikat]` — bot ichida (`?start=`),
Mini App emas: yangi odam bot bilan suhbat ochadi (eslatma yuborish
mumkin), va birinchi ochilish inline tugmadan bo'ladi (`initData`).
Pk ochiq turadi — u hech narsa bermaydi, faqat "kim taklif qildi".

Mukofot — TANGA EMAS: tanga mijozda hisoblanadi (`lib/progress.tsx`)
va serverdan berib bo'lmaydi. O'rniga taklif qilgan odam bot orqali
darhol xabar oladi ("Ali sizning havolangiz bilan qo'shildi — jami 3")
va sanoq ilovada ko'rinadi. Tan olinish bu yerda tangadan kuchliroq.
"""
from __future__ import annotations

import html
import io
import re

from django.conf import settings

from .models import Identity, ImtihonNatija, Pupil

#: `/start ref_12` yoki `/start ref_12_dtm`.
REF = re.compile(r"^/start ref_(\d{1,10})(?:_(dtm|sertifikat))?\s*$")


def _bot() -> str:
    return (getattr(settings, "BOT_USERNAME", "") or "aqlzone_bot").lstrip("@")


def havola(pupil: Pupil, bolim: str = "") -> str:
    return f"https://t.me/{_bot()}?start=ref_{pupil.pk}" + (f"_{bolim}" if bolim else "")


def ajrat(matn: str) -> tuple[int | None, str]:
    """`/start ref_12_dtm` → (12, "dtm"). Mos kelmasa (None, "")."""
    m = REF.match(matn.strip())
    return (int(m.group(1)), m.group(2) or "") if m else (None, "")


def boglash(yangi: Pupil, taklifchi_pk: int) -> Pupil | None:
    """
    Yangi hisobni taklif qilganga bog'laydi. Taklif qilgan odam qaytadi
    (xabar yuborish uchun); bog'lanmasa — `None`.

    O'zini o'zi taklif qila olmaydi va birinchi taklif o'zgarmaydi.
    """
    if yangi.pk == taklifchi_pk or yangi.taklif_qilgan_id:
        return None
    taklifchi = Pupil.objects.filter(pk=taklifchi_pk).first()
    if not taklifchi:
        return None
    Pupil.objects.filter(pk=yangi.pk, taklif_qilgan__isnull=True).update(taklif_qilgan=taklifchi)
    return taklifchi


def taklifchiga_xabar(taklifchi: Pupil, yangi: Pupil) -> None:
    """Taklif qilgan odamga — darhol va uning tilida. Xato jim o'tadi."""
    from . import xabar as X
    from .matn import M, tilni_tanla

    kirish = taklifchi.identities.filter(provider=Identity.TELEGRAM).first()
    if not kirish or taklifchi.xabar_yopiq_at:
        return
    til = tilni_tanla(taklifchi.til)
    soni = taklifchi.taklif_qilinganlar.count()
    ism = html.escape(yangi.first_name or M("taklifIsmsiz", til))
    try:
        X.yubor(kirish.external_id, M("taklifQoshildi", til, ism=ism, n=soni))
    except Exception:                                   # noqa: BLE001
        pass


# ------------------------------------------------------------------ karta

#: Sertifikat darajasi — `frontend/src/lib/sertifikat.ts` dagi `DARAJALAR`
#: bilan BIR XIL (75 ballik shkala). U yerda o'zgarsa, shu yerda ham.
DARAJALAR = [(70, "A+"), (65, "A"), (60, "B+"), (55, "B"), (50, "C+"), (46, "C")]


def daraja(ball100: float) -> str:
    b = ball100 * 75 / 100
    return next((d for chegara, d in DARAJALAR if b >= chegara), "")


def karta(n: ImtihonNatija) -> bytes:
    """
    Natija kartasi — 1080×1080 JPEG, kanal kartalari uslubida
    (`matematika_kanal.misol_rasmi`): qorong'i fon, brend ko'ki, xira logotip.
    """
    from PIL import Image, ImageDraw

    from .kunlik_kartochka import _shrift
    from .matematika_kanal import _FON, _KARTA, _KOK, _OQ, _XIRA
    from .tamga import _belgi

    S, EN = 2, 1080
    t = Image.new("RGB", (EN * S, EN * S), _FON)
    d = ImageDraw.Draw(t)
    m = 60 * S
    d.rounded_rectangle([m, m, EN * S - m, EN * S - m], radius=48 * S, fill=_KARTA)
    belgi = _belgi(820 * S)
    belgi.putalpha(belgi.getchannel("A").point(lambda a: a * 0.10))
    t = t.convert("RGBA")
    t.alpha_composite(belgi, ((EN * S - belgi.width) // 2, (EN * S - belgi.height) // 2 + 20 * S))
    t = t.convert("RGB")
    d = ImageDraw.Draw(t)

    def orta(y: int, matn: str, sh, rang) -> None:
        d.text(((EN * S - d.textlength(matn, font=sh)) / 2, y * S), matn, font=sh, fill=rang)

    sert = n.tur == "sert"
    orta(150, f"{'MILLIY SERTIFIKAT' if sert else 'DTM'} · {n.variant}-VARIANT", _shrift(40 * S), _KOK)
    if sert:
        katta, izoh = f"{(n.ball or 0):.1f}".replace(".", ","), "ball / 100"
        dr = daraja(n.ball or 0)
        pastki = f"Taxminiy daraja: {dr}" if dr else "Sertifikat chegarasiga oz qoldi"
    else:
        katta, izoh = f"{n.togri}/{n.jami}", "to'g'ri javob"
        pastki = f"{round(100 * n.togri / n.jami) if n.jami else 0}% · {n.sekund // 60} daqiqa"
    orta(300, katta, _shrift(230 * S), _OQ)
    orta(570, izoh, _shrift(44 * S, False), _XIRA)
    orta(650, pastki, _shrift(48 * S), _OQ)
    orta(800, "Siz-chi? Shu variantni ishlab ko'ring", _shrift(40 * S), _KOK)
    orta(900, "Aql Zone · @" + _bot(), _shrift(32 * S, False), _XIRA)

    t = t.resize((EN, EN), Image.LANCZOS)
    xotira = io.BytesIO()
    t.save(xotira, format="JPEG", quality=90)
    return xotira.getvalue()


class UlashXato(Exception):
    def __init__(self, sabab: str, kod: int = 409, havola: str = ""):
        super().__init__(sabab)
        self.sabab, self.kod, self.havola = sabab, kod, havola


def ulash(profil, tur: str, variant: int) -> dict:
    """
    Oxirgi natija kartasini odamning O'Z Telegram'iga yuboradi (kunlik son
    kartochkasi kabi: guruhga u o'zi yo'naltiradi). Telegram'i yo'q bo'lsa —
    xato va havola: ilova oddiy "ulashish" oynasini ochadi.
    """
    from . import xabar as X
    from .matn import M, tilni_tanla

    pupil = profil.pupil
    bolim = "sertifikat" if tur == "sert" else "dtm"
    link = havola(pupil, bolim)
    n = (ImtihonNatija.objects.filter(profile=profil, tur="sert" if tur == "sert" else "", kurs="",
                                      variant=variant).order_by("-mijoz_vaqt").first())
    if not n:
        raise UlashXato("natija_yoq", 404, link)
    kirish = pupil.identities.filter(provider=Identity.TELEGRAM).first()
    if not kirish or not getattr(settings, "BOT_TOKEN", ""):
        raise UlashXato("telegram_yoq", 409, link)
    til = tilni_tanla(pupil.til)
    holat, izoh, _ = X.rasm_yubor(
        kirish.external_id, karta(n), M("kartaIzoh", til),
        tugmalar=[(M("tMenHam", til), link, X.YASHIL)],
    )
    if holat == "bloklandi":
        X.bloklanganini_belgila(pupil.pk)
    if holat != "yuborildi":
        raise UlashXato(izoh or "yuborilmadi", 502, link)
    return {"ok": True, "havola": link}


def holat(pupil: Pupil) -> dict:
    """Ilovadagi "Do'stlarni taklif qilish" qatori uchun."""
    return {"havola": havola(pupil), "soni": pupil.taklif_qilinganlar.count()}
