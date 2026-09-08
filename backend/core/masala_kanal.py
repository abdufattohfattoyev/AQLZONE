"""
Masalani Telegram kanaliga joylash.

Ikki joydan chaqiriladi va shuning uchun alohida modulda turadi:

  * ilovadagi admin tugmasi (`views.masala_kanal`)
  * buyruq satri (`management/commands/masala_post.py`)

─────────────────── XABAR NEGA SHUNDAY QURILGAN ───────────────────

Kanaldagi xabar uchta qismdan iborat va uchalasi ham zarur:

  RASM       chizmali masalada chizma shartning yarmi. Rasmsiz post
             oqimda ko'zga tashlanmaydi.
  MATN       to'liq shart — odam kanalning o'zida o'ylay boshlashi
             kerak. "Ilovada o'qing" degan post bosilmaydi.
  TUGMA      javob kiritish uchun. U `t.me/<bot>?startapp=masala_12`
             ga olib boradi, ya'ni Mini App AYNAN shu masalada
             ochiladi va odam javob maydonini darhol ko'radi.

Tugma ATAYLAB oddiy havola tugmasi: kanal xabarida Telegram Mini App
tugmasiga (`web_app`) ruxsat bermaydi va butun xabarni rad etadi.

─────────────────── POST YO'QOLADI, SHUNING UCHUN TEKSHIRILADI ───────

Kanalga chiqqan post abadiy emas: admin uni qo'lda o'chiradi, kanal
ko'chiriladi yoki xabar shunchaki yo'qoladi. Masalada esa `kanal_at`
to'lgan bo'lib qolaveradi — ya'ni u kunlik postga boshqa hech qachon
qaytmaydi va jimgina yo'q bo'ladi.

`tekshir()` shu holatni ko'rinadigan qiladi. U har kuni ketma-ket
ishlaydi (`management/commands/kanal_tekshir.py`), natijasi masala
ekranidagi admin qatorida chiqadi va "qayta yuborish" bir bosishda
turadi.

─────────────────── JAVOB KANALDA YOZILMAYDI ───────────────────

Kanalda javob variantlari ham, "javobni izohga yozing" ham yo'q va
bu ataylab: birinchi izohdagi javob qolgan hammaning masalasini
o'ldiradi. Javob faqat ilovada kiritiladi — o'sha yerda u
tekshiriladi, statistikaga tushadi va yechim ochiladi.
"""
from __future__ import annotations

import html

from django.conf import settings
from django.utils import timezone

from . import xabar
from .boshqaruv import sinf_nomi
from .kanal import kanal_nomi
from .models import Masala
from .rasm import jpeg_qil

#: Kanal xabaridagi tugmalar.
#:
#: Birinchisi — odam shu post uchun kelgan amal: javob kiritish.
#: Ikkinchisi — o'sha yerdayoq keyingi masalaga o'tish yo'li:
#: kanalda masalani yechgan odam ko'pincha yana bittasini so'raydi,
#: lekin uni qidirib o'tirmaydi.
TUGMA = "✍️ Javobni kiritish"
TUGMA_BOSHQA = "📚 Boshqa masalalar"

#: Ro'yxatni ochadigan `start_param` (`components/BotdanKelgan.tsx`).
ROYXAT_PARAM = "masalalar"

#: Sarlavhada shartga ajratilgan joy (Telegram jami 1024 beradi).
MATN_JOYI = 700


def _bot() -> str:
    return (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")


def havola(masala: Masala) -> str:
    """
    AYNAN shu masalani ochadigan manzil — BIR bosishda.

    ─────────── `?startapp=` NIMANI TALAB QILADI ───────────

    U Mini App'ni to'g'ridan-to'g'ri ochadi, lekin botda "Main Mini
    App" YOQILGAN bo'lishi shart (BotFather → Configure Mini App).
    Yoqilmagan botda Telegram tugmani bosgan odamga `BOT_INVALID`
    deb javob beradi va tugma umuman ishlamaydi — kanal tugmalari
    bir kun aynan shu sababdan ishlamay turgandi.

    Bot sozlamasi o'chirilsa yoki bot almashtirilsa, `?start=` yo'li
    zaxira bo'lib qoladi: bot `/start masala_<id>` ni ham tushunadi
    (`management/commands/bot.py`) va ilovani ochadigan tugma
    yuboradi. Ya'ni eski havolalar ham ishlayveradi.
    """
    bot = _bot()
    return f"https://t.me/{bot}?startapp=masala_{masala.pk}" if bot else ""


def royxat_havolasi() -> str:
    """Masalalar RO'YXATINI ochadigan manzil — bir bosishda."""
    bot = _bot()
    return f"https://t.me/{bot}?startapp={ROYXAT_PARAM}" if bot else ""


def qalqon(matn: str) -> str:
    """Telegram HTML kutadigan uchta belgi — boshqasi tegilmaydi."""
    return html.escape(matn, quote=False)


def sarlavha(masala: Masala) -> str:
    """
    Rasm ostidagi yozuv.

    Xabar HTML rejimida ketadi, shuning uchun masala matni
    QALQONLANADI. Bu shart emas, MAJBURIY: matematikada `<` va `>`
    har qadamda uchraydi ("3 < x < 7") va Telegram ularni teg deb
    o'qib, xabarni umuman rad etadi yoki matnning bir bo'lagini
    yeb qo'yadi. Masala matnini esa foydalanuvchi yozadi — ya'ni
    u yerda istalgan belgi bo'lishi mumkin.

    `quote=False` ATAYLAB: Telegram faqat uchta belgini kutadi —
    `&`, `<` va `>`. Standart `html.escape` esa apostrofni ham
    `&#x27;` ga aylantiradi va Telegram uni ochmaydi — postda
    "yo&#x27;lga" bo'lib ko'rinardi. O'zbekcha matnda apostrof esa
    deyarli har gapda bor.
    """
    matn = masala.matn.strip()
    if len(matn) > MATN_JOYI:
        kesik = matn[:MATN_JOYI]
        bosh = kesik.rfind(" ")
        matn = (kesik[:bosh] if bosh > MATN_JOYI * 0.6 else kesik).rstrip() + "…"

    nom = sinf_nomi(masala.sinf)
    # Sinf nomi teg bo'lib ham ketadi: kanal o'sganda odam o'z sinfi
    # bo'yicha qidira oladi. Telegram tegida faqat harf, raqam va
    # pastki chiziq bo'ladi.
    teg = nom.replace("-", "").replace("'", "").replace(" ", "_")
    return (
        f"<b>{qalqon(nom)}</b>\n\n"
        f"{qalqon(matn)}\n\n"
        f"Javobingizni ilovada kiriting — u yerda tekshiriladi va "
        f"yechimi ochiladi.\n\n"
        f"#masala #{teg}"
    )


def kunlik() -> Masala | None:
    """
    Bugungi masala — hali kanalga tushmagan eng eskisi.

    Eng eskisi ATAYLAB: yangi masala ro'yxatda o'zi tepada turadi va
    ko'rinadi, eski esa pastga tushib ketgan bo'ladi. Kanal aynan
    o'shalarga ikkinchi hayot beradi.

    Chizmasi borlar birinchi navbatda: rasmli post kanalda sezilarli
    darajada ko'proq ko'riladi.
    """
    tayyor = Masala.objects.filter(holat=Masala.TASDIQ, kanal_at__isnull=True)
    return (
        tayyor.exclude(rasm="").exclude(rasm__isnull=True).order_by("created_at").first()
        or tayyor.order_by("created_at").first()
    )


def tugmalar(masala: Masala) -> list[tuple[str, str, str]]:
    """
    Post ostidagi tugmalar — `(matn, havola, uslub)` uchliklari.

    Alohida funksiya, chunki ular ikki joyda bir xil kerak: postni
    YUBORISHDA va uni TEKSHIRISHDA. Tekshiruv aynan shu tugmalarni
    postga qayta qo'yib ko'radi (`xabar.post_bormi`), ya'ni ro'yxat
    ikki joyda ayri yozilsa — tekshiruv har safar postni jimgina
    o'zgartirib turardi.
    """
    manzil = havola(masala)
    if not manzil:
        return []
    natija = [(TUGMA, manzil, xabar.YASHIL)]
    royxat = royxat_havolasi()
    if royxat:
        natija.append((TUGMA_BOSHQA, royxat, xabar.KOK))
    return natija


def yubor(masala: Masala, qayta: bool = False) -> tuple[str, str]:
    """
    Masalani kanalga joylaydi. `(holat, izoh)` qaytaradi.

    Holat: `yuborildi` | `bloklandi` | `xato` | `sozlanmagan` |
    `tasdiqlanmagan` | `takror`.

    Muvaffaqiyatli bo'lsa `kanal_at` yoziladi — shundan keyin bir
    masala ikkinchi marta kanalga tushmaydi.

    ─────────────────── `qayta` NIMA UCHUN ───────────────────

    `qayta=True` — admin ATAYLAB qayta yuboryapti. Uch holatda kerak:
    post kanaldan o'chib ketgan, masala matni yoki chizmasi tuzatilgan,
    yoki post shunchaki yomon chiqqan.

    Bunda eski post AVVAL O'CHIRILADI. Aks holda kanalda bitta masala
    ikki marta turib qolardi va odam qaysi biriga javob berishni
    bilmasdi; eski postdagi eskirgan chizma esa kanalda abadiy
    qolardi. O'chirib bo'lmasa (bot administrator emas) — yangi post
    baribir ketadi: dubl masalasiz kanaldan yaxshiroq.
    """
    if masala.holat != Masala.TASDIQ:
        return "tasdiqlanmagan", ""
    if masala.kanal_at is not None and not qayta:
        return "takror", ""

    kanal = kanal_nomi()
    manzil = havola(masala)
    # Tugmasiz post ma'nosiz: odam masalani o'qiydi-yu, javob
    # kiritadigan joyni topolmaydi.
    if not kanal or not manzil:
        return "sozlanmagan", ""

    if qayta and masala.kanal_post_id:
        xabar.post_ochir(kanal, masala.kanal_post_id)

    yozuv = sarlavha(masala)
    tugmalar_ = tugmalar(masala)

    post_id = 0
    if masala.rasm:
        with masala.rasm.open("rb") as f:
            holat, izoh, post_id = xabar.rasm_yubor(kanal, jpeg_qil(f), yozuv, tugmalar_)
    else:
        # Rasmsiz masala ham joylanadi — oddiy xabar bo'lib, lekin
        # o'sha ikkita tugma bilan.
        royxat = royxat_havolasi()
        holat, izoh = xabar.yubor(
            kanal, yozuv, TUGMA, manzil,
            qoshimcha_tugma=TUGMA_BOSHQA if royxat else "",
            qoshimcha_havola=royxat,
        )

    if holat == "yuborildi":
        masala.kanal_at = timezone.now()
        masala.kanal_post_id = post_id or None
        # Yangi post — eski "yo'q" belgisi bekor bo'ladi va tekshiruv
        # vaqti ham yangilanadi: hozirgina o'z ko'zimiz bilan ko'rdik.
        masala.kanal_yoq = False
        masala.kanal_tekshir_at = masala.kanal_at
        masala.save(update_fields=[
            "kanal_at", "kanal_post_id", "kanal_yoq", "kanal_tekshir_at",
        ])
    return holat, izoh


def tekshir(masala: Masala) -> str:
    """
    Bitta masalaning posti kanalda turibdimi. `bor` | `yoq` |
    `nomalum` | `yuborilmagan`.

    Natija bazaga yoziladi: `kanal_yoq` bayrog'i va tekshiruv payti.
    `nomalum` da BAYROQ TEGILMAYDI — faqat vaqt yoziladi. Sababi
    yuqorida (`xabar.post_bormi`): javob bermagan tarmoq postni
    o'chirmaydi, uni "yo'q" deb belgilash esa adminni behuda
    qayta yuborishga majburlardi.
    """
    if masala.kanal_at is None or not masala.kanal_post_id:
        return "yuborilmagan"

    kanal = kanal_nomi()
    if not kanal:
        return "nomalum"

    holat = xabar.post_bormi(kanal, masala.kanal_post_id, tugmalar(masala))
    maydonlar = ["kanal_tekshir_at"]
    masala.kanal_tekshir_at = timezone.now()
    if holat in ("bor", "yoq"):
        masala.kanal_yoq = holat == "yoq"
        maydonlar.append("kanal_yoq")
    masala.save(update_fields=maydonlar)
    return holat


def post_havolasi(masala: Masala) -> str:
    """
    Kanaldagi postga havola.

    Post raqami ma'lum bo'lsa — AYNAN o'sha xabarga, aks holda
    kanalning o'ziga (rasmsiz masalada raqam qaytmaydi). Kanal
    sozlanmagan bo'lsa — bo'sh satr.
    """
    kanal = kanal_nomi().lstrip("@")
    if not kanal:
        return ""
    return (
        f"https://t.me/{kanal}/{masala.kanal_post_id}"
        if masala.kanal_post_id else f"https://t.me/{kanal}"
    )
