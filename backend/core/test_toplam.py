"""
Test to'plamlari — natija yozish va Telegram kanal posti.

Tuzilishi `masala_kanal.py` bilan ATAYLAB bir xil: yubor → yangila →
tekshir. Ikkalasini ham bitta jadval (`kanal_yangila`, har 15 daqiqa)
yuritadi va admin ikkalasini ham bir xil tugma bilan joylaydi. Ikki xil
yo'l bo'lsa, biri tuzatilib ikkinchisi eskirib qolardi.

─────────────────── POST NEGA RASMLI ───────────────────

Matnli xabarda Telegram xabar RAQAMINI qaytarmaydi (`xabar.yubor`), raqamsiz
esa postni keyin tahrirlab bo'lmaydi — "N kishi ishladi" qatori o'lik
bo'lib qolardi. Rasmli xabar raqam beradi. Rasmning o'zi ham foydali:
kanal oqimida matnli post ko'zga tashlanmaydi, katta "9-SINF · 15 SAVOL"
kartasi esa to'xtatadi.
"""
from __future__ import annotations

import html
import io

from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from . import xabar
from .kanal import kanal_nomi
from .models import Profile, TestIshlash, TestToplam

TUGMA = "📝 Testni boshlash"
TUGMA_BOSHQA = "📚 Boshqa testlar"

#: `start_param` bo'lagi — `components/BotdanKelgan.tsx` shuni taniydi.
BOSH = "test_"
ROYXAT_PARAM = "testlar"


# ─────────────────────────────────────────────────────────── natija

def ishladi(toplam: TestToplam, profile: Profile, togri: int, jami: int,
            sekund: int) -> dict:
    """
    Natijani yozadi va o'rindagi statistikani qaytaradi.

    Faqat BIRINCHI natija sanoqqa kiradi (`TestIshlash` dagi izoh). Qayta
    ishlaganda ham statistika qaytadi — odam o'zini baribir ko'rsin — lekin
    son o'zgarmaydi va `birinchi: False` bo'ladi.

    Ball QISQICH ichiga olinadi: mijoz yuborgan son manfiy yoki savollar
    sonidan katta bo'lsa, o'rtacha bir odam tufayli buzilardi.
    """
    jami = max(1, min(int(jami), toplam.savol_soni))
    togri = max(0, min(int(togri), jami))
    sekund = max(0, min(int(sekund), toplam.daqiqa * 60 + 60))

    with transaction.atomic():
        _, birinchi = TestIshlash.objects.get_or_create(
            toplam=toplam, profile=profile,
            defaults={"togri": togri, "jami": jami, "sekund": sekund},
        )
        if birinchi:
            # F() bilan — ikki bola bir soniyada tugatsa ham biri yo'qolmaydi.
            TestToplam.objects.filter(pk=toplam.pk).update(
                ishlagan_soni=F("ishlagan_soni") + 1,
                togri_jami=F("togri_jami") + togri,
            )
    toplam.refresh_from_db(fields=["ishlagan_soni", "togri_jami"])
    return {"birinchi": birinchi, **statistika(toplam, profile)}


def statistika(toplam: TestToplam, profile: Profile | None) -> dict:
    """
    To'plam bo'yicha umumiy sonlar va shu odamning o'rni.

    "Nechta odamdan yaxshiroq" — FOIZ, o'rin raqami emas. "37-o'rin" degan
    gap 200 kishilik to'plamda xafa qiladi, "ishlaganlarning 80% idan
    yaxshiroq" esa xuddi shu natijani g'urur bilan aytadi.
    """
    natija = None
    if profile is not None:
        mening = TestIshlash.objects.filter(toplam=toplam, profile=profile).first()
        if mening:
            past = TestIshlash.objects.filter(toplam=toplam, togri__lt=mening.togri).count()
            boshqalar = max(toplam.ishlagan_soni - 1, 0)
            natija = {
                "togri": mening.togri,
                "jami": mening.jami,
                "sekund": mening.sekund,
                # Yolg'iz ishlagan odam uchun foiz ma'nosiz — 100 ham, 0 ham yolg'on.
                "yaxshiroqFoiz": round(past * 100 / boshqalar) if boshqalar else None,
            }
    return {
        "ishlagan": toplam.ishlagan_soni,
        "ortacha": toplam.ortacha,
        "mening": natija,
    }


def ishlaganlar(toplam: TestToplam, chegara: int = 300) -> list[dict]:
    """
    Kim bu to'plamni ishlagan — FAQAT administrator uchun ro'yxat.

    Tartib: ENG YAXSHI NATIJA birinchi, teng bo'lsa — tezroq ishlagan.
    Masaladagi ro'yxatdan (`masala.yechganlar`, oxirgisi birinchi) farqi
    ataylab: testda admin avval "kim eng yaxshi ishladi?" deb qaraydi.

    Faqat BIRINCHI urinish — jadvalda boshqasi yo'q (`TestIshlash` izohi).
    """
    qs = (
        TestIshlash.objects.filter(toplam=toplam)
        .select_related("profile__pupil")
        .order_by("-togri", "sekund", "created_at")[:chegara]
    )
    return [
        {
            "profilId": i.profile_id,
            "ism": i.profile.pupil.toliq_ism or i.profile.name,
            "avatar": i.profile.avatar,
            "togri": i.togri,
            "jami": i.jami,
            "sekund": i.sekund,
            "sana": i.created_at,
        }
        for i in qs
    ]


def toplam_json(t: TestToplam, profile: Profile | None) -> dict:
    return {
        "id": t.pk,
        "raqam": t.raqam,
        "sinf": t.sinf,
        "nom": t.nom,
        "urug": t.urug,
        "savol": t.savol_soni,
        "daqiqa": t.daqiqa,
        **statistika(t, profile),
    }


# ─────────────────────────────────────────────────────────── kanal

def _bot() -> str:
    return (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")


def havola(t: TestToplam) -> str:
    """AYNAN shu to'plamni ochadigan manzil (`masala_kanal.havola` dagi izoh)."""
    bot = _bot()
    # `-k` — kanaldan kelganini tahlilga bildiradi (`masala_kanal.KANAL_BELGI`).
    return f"https://t.me/{bot}?startapp={BOSH}{t.pk}-k" if bot else ""


def royxat_havolasi() -> str:
    bot = _bot()
    return f"https://t.me/{bot}?startapp={ROYXAT_PARAM}" if bot else ""


def sanoq_kaliti(t: TestToplam) -> str:
    """Postda oxirgi yozilgan sonlar — "o'zgardimi?" degan savol uchun."""
    return f"{t.ishlagan_soni}:{t.togri_jami}"


def sanoq_qatori(t: TestToplam) -> str:
    """
    Post ostidagi jonli qator.

    Masaladagi kabi holatga qarab boshqacha gapiradi:

      hech kim ishlamagan   chaqiriq — "birinchi bo'ling"
      ishlaganlar bor       son VA o'rtacha — o'rtacha "sen undan
                            ko'proq topa olasanmi?" degan savolni beradi
    """
    if not t.ishlagan_soni:
        return "<b>🥇 Hali hech kim ishlamagan — birinchi bo'ling!</b>"
    return (
        f"<b>✅ {t.ishlagan_soni} kishi ishladi · "
        f"o'rtacha {t.ortacha:g} / {t.savol_soni}</b>"
    )


def sarlavha(t: TestToplam) -> str:
    q = lambda s: html.escape(s, quote=False)  # noqa: E731
    return "\n\n".join([
        f"<b>📝 {q(t.nom)} — test to'plami</b>",
        (f"{t.savol_soni} ta savol · {t.daqiqa} daqiqa\n"
         f"Algebra va geometriya aralash — maktabdagi nazorat ishi kabi."),
        "Hamma bir xil savollarni yechadi: natijangiz boshqalar bilan "
        "solishtiriladi va nechta foizidan yaxshiroq ekaningiz ko'rinadi.",
        sanoq_qatori(t),
        f"#test #{t.sinf}sinf",
    ])


def tugmalar(t: TestToplam) -> list[tuple[str, str, str]]:
    manzil = havola(t)
    if not manzil:
        return []
    natija = [(TUGMA, manzil, xabar.YASHIL)]
    royxat = royxat_havolasi()
    if royxat:
        natija.append((TUGMA_BOSHQA, royxat, xabar.KOK))
    return natija


def muqova(t: TestToplam) -> bytes:
    """
    Post rasmi — katta, o'qiladigan karta.

    Supersampling bilan chiziladi (`masala_rasm.py` dagi sabab): Pillow
    chiziqni tekislamaydi, uch barobar katta chizib kichraytirish esa
    qirralarni silliqlaydi.
    """
    from PIL import Image, ImageDraw

    from .tamga import _shrift

    S, W, H = 3, 1280, 720
    RANGLAR = {9: ((91, 108, 255), (155, 92, 246)), 10: ((34, 184, 207), (59, 130, 246)),
               11: ((255, 159, 67), (255, 107, 107))}
    a, b = RANGLAR.get(t.sinf, RANGLAR[9])

    im = Image.new("RGB", (W * S, H * S))
    ch = ImageDraw.Draw(im)
    for y in range(H * S):
        k = y / (H * S)
        ch.line([(0, y), (W * S, y)], fill=tuple(int(a[i] + (b[i] - a[i]) * k) for i in range(3)))

    def yoz(xy, matn, px, rang=(255, 255, 255)):
        f = _shrift(px * S)
        if f is None:
            return
        ch.text((xy[0] * S, xy[1] * S), matn, font=f, fill=rang, anchor="mm")

    # Oq karta
    ch.rounded_rectangle([90 * S, 90 * S, (W - 90) * S, (H - 90) * S], 60 * S,
                         fill=(255, 255, 255))
    yoz((W / 2, 200), "TEST TO'PLAMI", 44, a)
    yoz((W / 2, 320), f"{t.sinf}-SINF", 120, (26, 36, 80))
    yoz((W / 2, 430), t.nom.split("·")[-1].strip().upper(), 54, b)
    yoz((W / 2, 540), f"{t.savol_soni} savol  ·  {t.daqiqa} daqiqa", 44, (120, 133, 170))

    im = im.resize((W, H), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=90)
    return buf.getvalue()


def yubor(t: TestToplam, qayta: bool = False) -> tuple[str, str]:
    """Kanalga joylaydi. Holatlar va `qayta` — `masala_kanal.yubor` bilan bir xil."""
    if t.kanal_at is not None and not qayta:
        return "takror", ""
    kanal = kanal_nomi()
    if not kanal or not havola(t):
        return "sozlanmagan", ""
    if qayta and t.kanal_post_id:
        xabar.post_ochir(kanal, t.kanal_post_id)

    holat, izoh, post_id = xabar.rasm_yubor(kanal, muqova(t), sarlavha(t), tugmalar(t))
    if holat == "yuborildi":
        t.kanal_at = timezone.now()
        t.kanal_post_id = post_id or None
        t.kanal_yoq = False
        t.kanal_tekshir_at = t.kanal_at
        t.kanal_sanoq = sanoq_kaliti(t)
        t.save(update_fields=["kanal_at", "kanal_post_id", "kanal_yoq",
                              "kanal_tekshir_at", "kanal_sanoq"])
    return holat, izoh


def yangila(t: TestToplam) -> str:
    """Post ostidagi sanoq qatorini yangilaydi — sonlar o'zgargandagina."""
    if t.kanal_at is None or not t.kanal_post_id:
        return "yuborilmagan"
    if t.kanal_yoq:
        return "yoq"
    kalit = sanoq_kaliti(t)
    if kalit == t.kanal_sanoq:
        return "ozgarmagan"
    kanal = kanal_nomi()
    if not kanal:
        return "xato"

    holat = xabar.sarlavhani_yangila(kanal, t.kanal_post_id, sarlavha(t), tugmalar(t), rasmli=True)
    maydonlar = []
    if holat in ("yangilandi", "ozgarmagan"):
        t.kanal_sanoq = kalit
        maydonlar.append("kanal_sanoq")
    if holat == "yoq":
        t.kanal_yoq = True
        maydonlar.append("kanal_yoq")
    if maydonlar:
        t.save(update_fields=maydonlar)
    return holat


def post_havolasi(t: TestToplam) -> str:
    kanal = kanal_nomi().lstrip("@")
    if not kanal:
        return ""
    return f"https://t.me/{kanal}/{t.kanal_post_id}" if t.kanal_post_id else f"https://t.me/{kanal}"
