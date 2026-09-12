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

─────────────────── POST JONLI QOLADI ───────────────────

Post chiqqandan keyin o'lik bo'lib qolardi: obunachi uni ko'radi,
lekin uni yana kimdir yechdimi — bilmaydi. Yozuvning oxirida jonli
qator turadi va u `yangila()` orqali yangilanadi
(`management/commands/kanal_yangila.py`, har o'n besh daqiqada):

    hech kim yechmagan   🥇 Hali hech kim yechmagan — birinchi bo'ling!
    yechganlar bor       ✅ Masalani yechganlar: 7

Son o'zgarmagan bo'lsa Telegramga UMUMAN murojaat qilinmaydi:
oxirgi yozilgani `Masala.kanal_sanoq` da turadi.

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


def sanoq_kaliti(masala: Masala) -> str:
    """
    Postda oxirgi marta yozilgan sonlar.

    Faqat SOLISHTIRISH uchun: postdagi qator o'zgardimi degan
    savolga bazadan javob beradi va Telegramga behuda so'rov
    yubormaslikka imkon beradi.

    IKKI son, chunki qatorda ikkalasi turadi: nechta odam urinib
    ko'rgani va nechtasi yechgani. Bittasi o'zgarsa ham qator
    boshqacha yoziladi.
    """
    return f"{masala.urinish_soni}:{masala.yechdi_soni}"


def qiyinlik_qatori(masala: Masala) -> str:
    """
    Post ostidagi jonli qator: masala QANCHALIK QIYIN chiqdi.

    ─────────────── NEGA SON EMAS, NISBAT ───────────────

    Ilgari bu yerda "Masalani yechganlar: 7" turardi. U hisoblagich
    edi va hech narsa aytmasdi: yettita ko'pmi yoki ozmi — bilib
    bo'lmasdi, chunki nechta odam umuman urinib ko'rgani noma'lum.

    "12 kishidan atigi 4 tasi birinchi urinishda topdi" esa
    masalaning QIYINLIGINI aytadi. Va u boshqa ish qiladi: odam
    o'zini o'sha to'rttaning ichiga qo'ymoqchi bo'ladi. Hisoblagich
    hech kimni hech qayerga chorlamaydi, nisbat esa chorlaydi.

    ─────────────── QAYSI URINISH BO'LISHIDAN QAT'I NAZAR ───────────────

    Sanoq masalani OXIR-OQIBAT topganlarni oladi. Ilgari u faqat
    birinchi urinishda topganlarni sanardi va o'shanda ikkinchi
    urinishda topgan odam "yecholmagan" tomonda qolardi — bu uning
    mehnatini inkor qilish edi.

    Qiyinlik foizi esa hamon BIRINCHI urinishga quriladi
    (`Masala.qiyinlik`): u masalaning o'zi haqidagi o'lchov va
    "kim yetib keldi" degan savoldan boshqa narsani so'raydi.

    ─────────────── BESHTA HOLAT ───────────────

    Qator masala qanday ketayotganiga qarab boshqacha gapiradi:

      hech kim urinmagan   chaqiriq — "birinchi bo'ling"
      hech kim yecholmagan eng kuchli chaqiriq
      yarmidan kami        "atigi" bilan — masala qiyin
      ko'pchilik yechgan   quruq nisbat, maqtovsiz
      hammasi yechgan      nisbatsiz — u g'aliz o'qilardi

    "atigi" faqat qiyin masalada qo'shiladi. Oson masalada u
    maqtanchoqdek eshitilardi va son o'zi yetarli.
    """
    urinish, topgan = masala.urinish_soni, masala.yechdi_soni

    if not urinish:
        return "<b>🥇 Hali hech kim yechmagan — birinchi bo'ling!</b>"
    if not topgan:
        return (
            f"<b>🔥 {urinish} kishi urinib ko'rdi — hali hech kim yecholmadi</b>"
        )

    # Hamma yechgan bo'lsa NISBAT bermaydi: "3 kishidan 3 tasi
    # yechdi" degan gap o'zi bilan o'zi gaplashadi va g'aliz
    # o'qiladi. Bunday paytda son o'zi yetadi.
    if topgan == urinish:
        return f"<b>✅ {topgan} kishi yechdi</b>"

    atigi = "atigi " if topgan * 2 < urinish else ""
    belgi = "🔥" if atigi else "✅"
    return f"<b>{belgi} {urinish} kishidan {atigi}{topgan} tasi yechdi</b>"


def variantlar_qatori(masala: Masala) -> str:
    """
    Test variantlari — A) B) C) D).

    Ilgari post variantlarni umuman ko'rsatmasdi va odam ilovaga
    kirmasdan turib o'ylay olmasdi: post o'zi hech narsa bermay,
    faqat havola bo'lib qolardi. Endi u kanalning o'zida o'qiladi
    va ilovaga TEKSHIRISH uchun kiriladi.

    Javob yoziladigan masalada bo'sh qaytadi — o'shanda post
    variantsiz, lekin xuddi shu shaklda chiqadi.
    """
    if not masala.variantlar:
        return ""
    harflar = "ABCDEFGH"
    return "\n".join(
        f"{harflar[i]})  {qalqon(str(v))}"
        for i, v in enumerate(masala.variantlar[:len(harflar)])
    )


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

    ─────────────── POSTDA NIMA BOR ───────────────

      sinf · muallif      qalin emas — ma'lumot, mazmun emas
      shart               oddiy og'irlikda
      SAVOL               qalin — ko'z shu yerga tushadi
      A) B) C) D)         faqat test masalasida
      qiyinlik qatori     jonli, har yangilanishda o'zgaradi
      teglar              postning oxiri

    "Javobingizni ilovada kiriting…" degan chaqiriq OLINDI: u
    tugmaning ostida turardi va tugmaning o'zi allaqachon shuni
    aytadi.
    """
    nom = sinf_nomi(masala.sinf)
    # Sinf nomi teg bo'lib ham ketadi: kanal o'sganda odam o'z sinfi
    # bo'yicha qidira oladi. Telegram tegida faqat harf, raqam va
    # pastki chiziq bo'ladi.
    teg = nom.replace("-", "").replace("'", "").replace(" ", "_")

    # Muallif BIRINCHI QATORDA. Kanal oqimida odam postning faqat
    # birinchi qatorini ko'radi va "buni kim yozgan?" degan savol
    # aynan o'sha yerda tug'iladi. Ustoz yozgan masalada nom unvoni
    # bilan chiqadi (`Pupil.muallif_ismi`): masalani kim yozgani
    # uning og'irligini o'zgartiradi — o'quvchi yozgani mashq,
    # ustoz yozgani dars.
    #
    # Bu qator QALIN EMAS. U ma'lumot, mazmun emas — ko'z avval
    # masalaning o'ziga tushishi kerak.
    muallif = masala.muallif.pupil.muallif_ismi or masala.muallif.name
    bosh = qalqon(nom) + (f" · {qalqon(muallif)}" if muallif else "")

    variantlar = variantlar_qatori(masala)
    qiyinlik = qiyinlik_qatori(masala)

    # Matnga qolgan joy: variantlar allaqachon o'z ulushini oldi.
    # Busiz uzun shartli test masalasida sarlavha Telegram
    # chegarasidan oshib ketardi va xabar umuman ketmasdi.
    joy = MATN_JOYI - len(variantlar)
    matn = masala.matn.strip()
    if len(matn) > joy:
        kesik = matn[:joy]
        chek = kesik.rfind(" ")
        matn = (kesik[:chek] if chek > joy * 0.6 else kesik).rstrip() + "…"

    # SAVOL ajratiladi va faqat U qalin bo'ladi.
    #
    # Ilgari butun shart qalin edi. Ikki abzas qalin matn ko'zni
    # charchatadi va ichidagi savol ajralib turmaydi — hammasi
    # qalin bo'lsa, hech narsa qalin emas.
    #
    # Ajratish oxirgi bo'sh qatordan: masala odatda "shart, keyin
    # savol" tarzida yoziladi. Bo'sh qator bo'lmasa — butun matn
    # savol deb olinadi, ya'ni qisqa masalada ham qoida buzilmaydi.
    shart, ajratgich, savol = matn.rpartition("\n\n")
    if not ajratgich:
        shart, savol = "", matn

    bolaklar = [bosh]
    if shart:
        bolaklar.append(qalqon(shart.strip()))
    bolaklar.append(f"<b>{qalqon(savol.strip())}</b>")
    if variantlar:
        bolaklar.append(variantlar)
    bolaklar.append(qiyinlik)
    bolaklar.append(f"#masala #{teg}")

    # Bo'laklar orasida BITTA bo'sh qator. Ilgari ular turli
    # masofada turardi va post bitta uzun bo'lak bo'lib ko'rinardi.
    return "\n\n".join(bolaklar)


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
        # Postda qanday sonlar yozilgani ESLAB QOLINADI — keyingi
        # yangilash "o'zgardimi?" degan savolga bazadan javob
        # topadi va Telegramga behuda so'rov ketmaydi.
        masala.kanal_sanoq = sanoq_kaliti(masala)
        masala.save(update_fields=[
            "kanal_at", "kanal_post_id", "kanal_yoq", "kanal_tekshir_at",
            "kanal_sanoq",
        ])
    return holat, izoh


def yangila(masala: Masala) -> str:
    """
    Kanaldagi postning sanoq qatorini yangilaydi.

    `yangilandi` | `ozgarmagan` | `yoq` | `xato` | `yuborilmagan`.

    ─────────────── AVVAL BAZA, KEYIN TELEGRAM ───────────────

    Sonlar o'zgarmagan bo'lsa Telegramga UMUMAN murojaat qilinmaydi.
    Busiz har yurishda o'nlab post uchun so'rov ketardi va ularning
    deyarli hammasi "message is not modified" bo'lib qaytardi —
    ya'ni butun ish behuda va limitni behuda yeydigan bo'lardi.

    ─────────────── POST YO'QOLGAN BO'LSA ───────────────

    Tahrirlash "bunday xabar yo'q" desa, bu kunlik tekshiruv topadigan
    holatning o'zi (`tekshir`). Uni shu yerda ham belgilab qo'yamiz:
    ma'lumot allaqachon qo'lda va uni tashlab yuborishning ma'nosi
    yo'q.
    """
    if masala.kanal_at is None or not masala.kanal_post_id:
        return "yuborilmagan"

    # Yo'qolgan post yangilanmaydi. U allaqachon belgilangan va
    # admindan qayta yuborishni kutyapti; buyruq esa har o'n besh
    # daqiqada ishlaydi — ya'ni busiz o'sha ikki-uchta post uchun
    # kuniga yuzlab behuda so'rov ketardi. Qayta yuborish bayroqni
    # o'zi so'ndiradi va post ro'yxatga qaytadi (`yubor`).
    if masala.kanal_yoq:
        return "yoq"

    kalit = sanoq_kaliti(masala)
    if kalit == masala.kanal_sanoq:
        return "ozgarmagan"

    kanal = kanal_nomi()
    if not kanal:
        return "xato"

    holat = xabar.sarlavhani_yangila(
        kanal, masala.kanal_post_id, sarlavha(masala),
        tugmalar(masala), rasmli=bool(masala.rasm),
    )

    maydonlar = []
    if holat in ("yangilandi", "ozgarmagan"):
        masala.kanal_sanoq = kalit
        maydonlar.append("kanal_sanoq")
    if holat == "yoq" and not masala.kanal_yoq:
        masala.kanal_yoq = True
        maydonlar.append("kanal_yoq")
    if maydonlar:
        masala.save(update_fields=maydonlar)
    return holat


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
