"""
Do'st bilan bellashuv — chaqiruv havolasi orqali.

──────────────────────────── OQIM ────────────────────────────

    1. Chaqirgan  POST /duel            → kod, urug', o'yin, daraja
       (server o'yinni O'ZI tanlaydi — pastdagi izohga qarang)
    2. Chaqirgan o'ynaydi
    3. Chaqirgan  POST /duel/<kod>/natija  → chaqiruv tayyor, havola beriladi
    4. Do'sti     GET  /duel/<kod>      → kim chaqirgani, qaysi o'yin
    5. Do'sti     POST /duel/<kod>/qabul → o'sha urug' + raqib sanog'i
    6. Do'sti o'ynaydi
    7. Do'sti     POST /duel/<kod>/natija → g'olib aniqlanadi, botga xabar
    8. Ikkalasi   POST /duel/<kod>/yana   → ikkalasi bossa YANGI duel

─────────────────── O'YINNI SERVER TANLAYDI ───────────────────

Chaqirgan odam o'yinni o'zi tanlasa, u har doim O'ZI ENG KUCHLI
bo'lgan o'yinni tanlaydi va bellashuv ma'nosini yo'qotadi. Server
tasodifiy tanlaydi va ikkalasiga bir xil beradi — shunda g'alaba
tanlash mahoratiga emas, hisoblash mahoratiga bog'liq bo'ladi.

──────────────────── BALL NEGA QAYTARILMAYDI ────────────────────

`GET /duel/<kod>` chaqirganning BALLINI bermaydi, `POST .../qabul`
esa faqat SANOQNI beradi (har soniyadagi ball). Farqi katta: sanoq
bilan raqibning chizig'i jonli o'sib boradi, yakuniy son esa
ko'rinmaydi. Son ko'rinsa duel "nishonga urish" ga aylanadi —
o'yinchi kerakli ballni o'tishi bilan to'xtaydi va oxirigacha
urinmaydi.
"""
from __future__ import annotations

import secrets
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .models import Duel, DuelTaklif, Identity, Profile
from . import xabar as X
from .vazifalar import fonda, telegram_xabar

#: Duelda ishlatiladigan o'yinlar — frontenddagi "oqim" turidagilar.
#: Ro'yxat SHU YERDA takrorlanadi (frontendda ham bor) va bu ataylab:
#: server frontend kodini o'qiy olmaydi, o'yin nomi esa duel
#: yozuvining bir qismi bo'lib bazada qoladi. Yangi o'yin qo'shilganda
#: ikkala joyga yozish kerak — buni unutmaslik uchun sinov bor.
OYINLAR = ["tezkor", "jadval", "belgi", "ketma", "taxmin", "tarozi"]

#: Daraja: 1 — oson, 2 — o'rta, 3 — qiyin.
DARAJALAR = (1, 2, 3)

#: Bitta o'yinchi bir kunda nechta chaqiruv yasay oladi.
#:
#: Cheklov ikki narsadan himoya qiladi: bazani bo'sh duellar bilan
#: to'ldirishdan va botdan ketadigan xabarlar sonidan. 20 ta — normal
#: o'ynaydigan bolaga yetib ortadi.
KUNLIK_CHEGARA = 20

#: Ball soniyasiga shundan tez o'smaydi — aldashga qarshi eng oddiy
#: to'siq. Server savolni qayta hisoblay olmaydi (generatorlar
#: frontendda), shuning uchun chegara tekshiruvi qoladi.
MAX_BALL_SONIYA = 3

#: O'yin necha soniya davom etadi (standart).
VAQT = 60

#: Chaqirgan odam tanlay oladigan qiymatlar.
#:
#: Ro'yxat ATAYLAB qisqa: uchtadan. Erkin son so'ralsa, odam "45"
#: yozib qo'yardi va ikkinchi tomon "nega 45?" degan savol bilan
#: qolardi — tanlov qancha keng bo'lsa, qaror shuncha og'ir.
VAQTLAR = (30, 60, 90)
SAVOLLAR = (10, 20, 30)

#: Ballning eng katta chegarasi shu vaqtdan hisoblanadi.
MAX_VAQT = max(VAQTLAR)


def kod_yasa() -> str:
    """
    Havoladagi kod.

    `secrets` bilan — taxmin qilib bo'lmasin. Kod ochiq havolada
    yuriladi va uni bilgan odam duelni ocha oladi; ketma-ket sonlar
    bo'lsa, birov begona duellarni birma-bir ochib chiqardi.
    """
    return secrets.token_urlsafe(8)[:11]


def shartlarni_tozala(oyin: str, savollar, vaqt) -> tuple[str, int, int]:
    """
    Chaqirgandan kelgan shartlarni tekshiradi.

    Ro'yxatda yo'q qiymat STANDARTGA tushadi, xato qaytarilmaydi: bu
    shartlar o'yinning ko'rinishini belgilaydi, xavfsizlikka daxli
    yo'q. Eski ilova yangi maydonlarni umuman yubormasligi ham mumkin
    va o'shanda duel baribir yasalishi kerak.
    """
    return (
        oyin if oyin in OYINLAR else secrets.choice(OYINLAR),
        savollar if savollar in SAVOLLAR else 20,
        vaqt if vaqt in VAQTLAR else VAQT,
    )


def daraja_tozala(x) -> int | None:
    """
    Mijozdan kelgan daraja: 1, 2 yoki 3. Boshqasi — `None`.

    `None` "o'zgartirma" degani, standartga tushirish emas: eski ilova
    darajani umuman yubormaydi va o'shanda allaqachon yozilgani (yoki
    modeldagi standart 2) qolishi kerak.
    """
    try:
        n = int(x)
    except (TypeError, ValueError):
        return None
    return n if n in DARAJALAR else None


def yangi_duel(profile: Profile, oyin: str = "", savollar: int = 0,
               vaqt: int = 0, daraja=None, kimga: Profile | None = None) -> Duel:
    """
    Yangi chaqiruv boshlaydi (hali o'ynalmagan).

    Shartlarni CHAQIRGAN odam tanlaydi va ular ikkalasiga bir xil
    bo'ladi. Ilgari o'yinni server tasodifiy tanlardi — "chaqirgan odam
    o'zi kuchli o'yinni tanlab oladi" degan xavotir bilan. Amalda esa
    duel do'st bilan o'ynaladi: kim kim bilan o'ynashini o'zi
    kelishadi, va tanlov imkoniyati o'yinni QIZIQARLIROQ qiladi.

    DARAJA esa shart emas — u faqat chaqirganning O'ZINIKI. Raqib o'z
    darajasini chaqiruvni ochganda tanlaydi (`Duel.chaqirgan_daraja`).
    """
    oyin, savollar, vaqt = shartlarni_tozala(oyin, savollar, vaqt)
    d = daraja_tozala(daraja) or 2
    return Duel.objects.create(
        kod=kod_yasa(),
        urug=secrets.randbelow(2_000_000_000) + 1,
        oyin=oyin,
        daraja=d,
        chaqirgan_daraja=d,
        savollar_soni=savollar,
        vaqt=vaqt,
        chaqirgan=profile,
        kimga=kimga,
    )


def bugungi_soni(profile: Profile) -> int:
    bugun = timezone.localtime().date()
    return Duel.objects.filter(
        chaqirgan=profile, created_at__date=bugun
    ).count()


def natija_yaroqlimi(ball: int, xato: int, sanoq: list) -> bool:
    """
    Kelgan natija haqiqatga o'xshaydimi.

    To'liq tekshirish mumkin emas (savollar frontendda yasaladi),
    shuning uchun uchta chegara: ball manfiy emas, jismonan mumkin
    bo'lgan chegaradan oshmaydi va sanoq uzunligi o'yin vaqtiga mos.
    """
    if ball < 0 or xato < 0:
        return False
    if ball > MAX_VAQT * MAX_BALL_SONIYA:
        return False
    if not isinstance(sanoq, list) or len(sanoq) > MAX_VAQT + 5:
        return False
    return all(isinstance(x, int) and 0 <= x <= ball for x in sanoq)


def havola(kod: str) -> str:
    """
    Chaqiruv havolasi — BOTGA olib boradi, saytga emas.

    `https://t.me/<bot>?startapp=<kod>` — Telegram bu manzilni bosganda
    Mini App'ni O'ZIDA ochadi va kodni ilovaga `start_param` bo'lib
    uzatadi (`frontend/src/lib/qobiq.ts`).

    NEGA SAYT EMAS. Chaqiruv Telegramda ulashiladi va uni ochgan odam
    Telegram ichida turibdi. Sayt havolasi uni BRAUZERGA chiqarib
    yuborardi: u yerda hisobga kirish qaytadan boshlanadi, orqaga
    qaytish uchun botni qidirish kerak bo'ladi va aynan o'sha yo'lda
    ko'pchilik yo'qoladi.

    Bot nomi sozlanmagan bo'lsa (lokal ishlab chiqish) sayt manzili
    zaxira bo'lib qoladi — busiz havola umuman bo'lmasdi.
    """
    bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
    if bot:
        # `?start=` — `?startapp=` EMAS.
        #
        # `startapp` Mini App'ni to'g'ridan-to'g'ri ochadi, lekin buning
        # uchun BotFather'da "Main Mini App" sozlangan bo'lishi SHART.
        # Sozlanmagan bo'lsa Telegram havolani oddiy bot havolasi deb
        # qabul qiladi: suhbat ochiladi va `/start` ketadi — odam esa
        # duel o'rniga salom xabarini ko'radi.
        #
        # `?start=duel_<kod>` esa hamma joyda ishlaydi: bot buyruqni
        # oladi va javobida INLINE tugma yuboradi. Inline tugmadan
        # ochilgan Mini App esa to'liq `initData` oladi — bu duel uchun
        # shart, chunki raqib kimligi Telegram hisobidan aniqlanadi.
        return f"https://t.me/{bot}?start=duel_{kod}"

    asos = (
        getattr(settings, "MINI_APP_URL", "")
        or getattr(settings, "SAYT_URL", "")
        or ""
    ).rstrip("/")
    return f"{asos}/duel/{kod}" if asos else ""


# ------------------------------------------------------------ xabarlar


def _tg_id(profile: Profile) -> str:
    """Profil egasining Telegram id'si (bo'lmasa bo'sh satr)."""
    kirish = profile.pupil.identities.filter(provider=Identity.TELEGRAM).first()
    return kirish.external_id if kirish else ""


#: Profil nomining STANDART qiymatlari — ular boshqa odamga
#: ko'rsatilmaydi. `Profile` yaratilganda ism topilmasa "Men" qo'yiladi
#: (`models.Pupil.asosiy_profil`) va u O'ZINGIZGA qaraganda to'g'ri
#: o'qiladi. Raqibga esa "Men sizni chaqiryapti" degan buzuq gap
#: chiqardi — shuning uchun bunday nom neytral so'zga almashadi.
OZIM_NOMLARI = {"men", "я", "i"}


def korinadigan_ism(profile: Profile | None) -> str:
    """Boshqa o'yinchiga ko'rsatiladigan nom."""
    nom = (profile.name if profile else "").strip()
    if not nom or nom.lower() in OZIM_NOMLARI:
        return "Do'stingiz"
    return nom


def _ism(profile: Profile) -> str:
    return korinadigan_ism(profile)


def chaqiruv_xabari(duel: Duel, raqib: Profile) -> bool:
    """
    Onlayn ro'yxatdan tanlangan odamga chaqiruv yuboradi.

    `True` — xabar yuborishga urinildi (Telegram'i bor va sozlama
    joyida). Natijaning O'ZI kutilmaydi: chaqirgan odam javobni
    kutib turmasligi kerak, uning ekrani darhol ochilishi kerak.

    Tugma AYNAN shu duelga olib boradi (`?startapp=<kod>`), bosh
    sahifaga emas: raqib chaqiruvni yana qidirib o'tirmasin.
    """
    import html

    tg_id = _tg_id(raqib)
    if not tg_id or not getattr(settings, "BOT_TOKEN", ""):
        return False
    if getattr(settings, "TESTDA", False):
        return True

    bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
    if not bot:
        return False

    ism = html.escape(_ism(duel.chaqirgan))
    matn = (
        f"⚔️ <b>{ism} sizni bellashuvga chaqirdi!</b>\n\n"
        "Ikkalangiz bir xil savollarni yechasiz — kim tezroq va "
        "aniqroq javob bersa, o'sha yutadi."
    )
    havola = f"https://t.me/{bot}?startapp={duel.kod}"

    # Xabar NAVBATGA qo'yiladi, oqimga emas. Farqi: oqim konteyner
    # qayta ishga tushganda jimgina yo'qolardi va chaqiruv hech
    # qayerga yetib bormasdi — chaqirgan odam esa kutib turardi.
    fonda(telegram_xabar, tg_id, matn, tugma="⚔️ Qabul qilish", havola=havola)
    return True


def natija_xabari(duel: Duel) -> None:
    """
    Ikkala tomonga natijani yuboradi.

    Xabar TUGAGANDA ketadi va bitta duel uchun bir marta. Yuborish
    fon oqimida: bu chaqiruv o'yinchining so'rovi ichida turadi va
    Telegram sekin javob bersa, bola natija ekranini kutib qolardi.

    Xato bo'lsa jim qolinadi — duel allaqachon yozilgan va uni
    xabar yuborilmagani uchun bekor qilib bo'lmaydi.
    """
    import html

    if getattr(settings, "TESTDA", False) or not getattr(settings, "BOT_TOKEN", ""):
        return

    try:
        chaqirgan_tg = _tg_id(duel.chaqirgan)
        qabul_tg = _tg_id(duel.qabul) if duel.qabul else ""
        if not chaqirgan_tg and not qabul_tg:
            return

        ch_ism = html.escape(_ism(duel.chaqirgan))
        qa_ism = html.escape(_ism(duel.qabul)) if duel.qabul else "Raqib"
        hisob_ch = f"{duel.chaqirgan_ball}:{duel.qabul_ball}"
        hisob_qa = f"{duel.qabul_ball}:{duel.chaqirgan_ball}"

        if duel.golib == "durang":
            ch_matn = f"🤝 <b>Durang!</b>\n\n{qa_ism} bilan {hisob_ch} — teng chiqdingiz."
            qa_matn = f"🤝 <b>Durang!</b>\n\n{ch_ism} bilan {hisob_qa} — teng chiqdingiz."
        elif duel.golib == "chaqirgan":
            ch_matn = f"🏆 <b>Siz yutdingiz!</b>\n\n{qa_ism} — {hisob_ch}"
            qa_matn = f"😔 <b>{ch_ism} sizni yutdi</b>\n\nHisob: {hisob_qa}"
        else:
            ch_matn = f"😔 <b>{qa_ism} sizni yutdi</b>\n\nHisob: {hisob_ch}"
            qa_matn = f"🏆 <b>Siz yutdingiz!</b>\n\n{ch_ism} — {hisob_qa}"

        # "Javob berish" duel ekraniga olib boradi, bosh sahifaga emas:
        # zanjir uzilmasligi kerak, odam esa chaqiruvni yana qidirib
        # o'tirmasin.
        ilova = (
            f"{settings.MINI_APP_URL.rstrip('/')}/oyinlar/duel"
            if getattr(settings, "MINI_APP_URL", "") else X.ilova_havolasi()
        )
        ilovada = bool(getattr(settings, "MINI_APP_URL", ""))
    except Exception:                                # noqa: BLE001
        return

    # Har tomonga ALOHIDA vazifa. Bittasida yig'ilsa, birinchisi
    # yiqilganda ikkinchisi ham qayta yuborilardi va g'olib
    # "siz yutdingiz" xabarini ikki marta olardi.
    for tg_id, matn in ((chaqirgan_tg, ch_matn), (qabul_tg, qa_matn)):
        if not tg_id:
            continue
        fonda(
            telegram_xabar, tg_id, matn,
            # "Javob berish" — duel zanjirini davom ettiradi. Bitta
            # zarbadan keyin tugaydigan bellashuv qaytish sababi
            # yaratmaydi.
            tugma="⚔️ Javob berish", havola=ilova, ilovada=ilovada,
        )


# ------------------------------------------------------------ amallar


@transaction.atomic
def natijani_yoz(duel: Duel, profile: Profile, chaqirganmi: bool,
                 ball: int, xato: int, sanoq: list) -> Duel:
    """
    Natijani tegishli tomonga yozadi.

    G'olib FAQAT ikkalasi ham tugatgach aniqlanadi. Ilgari u qabul
    qilgan tomon tugatishi bilan hisoblanardi va asinxron duelda bu
    to'g'ri edi — jonli duelda esa ikkalasi bir vaqtda o'ynaydi va
    kim birinchi tugatishi oldindan ma'lum emas.

    Qator qulflanadi: jonli duelda ikkala natija bir soniyada kelishi
    mumkin va ikkinchisi birinchisining yozuvini ko'rmasa, g'olib ikki
    marta (yoki umuman) hisoblanmasdi.
    """
    d = Duel.objects.select_for_update().get(pk=duel.pk)

    if chaqirganmi:
        d.chaqirgan_ball, d.chaqirgan_xato = ball, xato
        d.chaqirgan_sanoq, d.chaqirgan_tugatdi = sanoq, True
    else:
        d.qabul = profile
        d.qabul_ball, d.qabul_xato = ball, xato
        d.qabul_sanoq, d.qabul_tugatdi = sanoq, True

    if d.chaqirgan_tugatdi and d.qabul_tugatdi and not d.golib:
        d.golib = d.golibni_aniqla()
        d.tugadi_at = timezone.now()
        # Jonli duel tugadi — endi boshlanish vaqti kerak emas va u
        # qolsa, holat hisobi duelni "hali ketyapti" deb ko'rsatardi.
        d.boshlanadi = None

    d.save()
    return d


# ------------------------------------------------------------ jonli rejim


def belgi_qoy(duel: Duel, chaqirganmi: bool) -> None:
    """
    "Men shu yerdaman" belgisi.

    Har so'rovda yangilanadi (holat so'rash ham, ball yuborish ham).
    Shu belgi ikki savolga javob beradi: chaqirgan odam hali kutyaptimi
    va o'yin o'rtasida raqib uzilib qolmadimi.
    """
    maydon = "chaqirgan_belgi" if chaqirganmi else "qabul_belgi"
    setattr(duel, maydon, timezone.now())
    Duel.objects.filter(pk=duel.pk).update(**{maydon: timezone.now()})


def daraja_qoy(duel: Duel, chaqirganmi: bool, daraja) -> None:
    """
    O'yinchining o'z darajasini yozadi — faqat o'yin BOSHLANMAGAN bo'lsa.

    Boshlangandan keyin o'zgartirish mumkin bo'lsa, qiyin savolda
    qiynalgan odam o'yin o'rtasida "oson" ga tushib, ballini osonroq
    yig'ib olardi.
    """
    d = daraja_tozala(daraja)
    if d is None:
        return
    if chaqirganmi:
        if duel.chaqirgan_tugatdi or duel.boshlanadi is not None:
            return
        duel.chaqirgan_daraja = d
        duel.daraja = d
    else:
        if duel.qabul_tugatdi or duel.boshlanadi is not None:
            return
        duel.qabul_daraja = d


@transaction.atomic
def tayyorlash(duel: Duel, profile: Profile, chaqirganmi: bool, daraja=None) -> Duel:
    """
    "Men tayyorman" — va ikkalasi tayyor bo'lsa o'yinni boshlaydi.

    Boshlanish vaqti SERVERDA belgilanadi va mijozga "necha soniya
    qoldi" bo'lib uzatiladi. Mijozning o'z soatiga tayanib bo'lmaydi:
    telefon soati bir necha soniya oldinda bo'lgan o'yinchi duelni erta
    boshlab, tekin ustunlik olardi.

    Qulflangan qator (`select_for_update`) ham shart: ikkalasi
    "tayyorman" ni bir vaqtda bosishi mumkin va o'shanda ikkala so'rov
    ham "men birinchiman" deb boshlanish vaqtini ikki marta yozardi.
    """
    d = Duel.objects.select_for_update().get(pk=duel.pk)

    # Daraja "tayyorman" bilan BIRGA keladi: tayyorlik — bu o'yinchining
    # oxirgi qarori, undan keyin sanoq boshlanadi va daraja qotadi.
    daraja_qoy(d, chaqirganmi, daraja)

    if chaqirganmi:
        d.chaqirgan_tayyor = True
        d.chaqirgan_belgi = timezone.now()
    else:
        d.qabul = profile
        d.qabul_tayyor = True
        d.qabul_belgi = timezone.now()

    if d.ikkalasi_tayyormi and d.boshlanadi is None:
        d.boshlanadi = timezone.now() + timedelta(seconds=Duel.SANOQ_SONIYA)

    d.save(update_fields=[
        "chaqirgan_tayyor", "chaqirgan_belgi",
        "qabul", "qabul_tayyor", "qabul_belgi", "boshlanadi",
        "daraja", "chaqirgan_daraja", "qabul_daraja",
    ])
    return d


def boshlanishga_qolgan(duel: Duel) -> float | None:
    """Boshlanishga necha soniya qoldi. `None` — hali tayyor emas."""
    if duel.boshlanadi is None:
        return None
    return max(0.0, (duel.boshlanadi - timezone.now()).total_seconds())


@transaction.atomic
def jonli_ball(duel: Duel, chaqirganmi: bool, ball: int, sanoq: list) -> None:
    """
    O'yin PAYTIDAGI ballni yozadi.

    Yakuniy natija emas — shuning uchun `*_tugatdi` tegilmaydi va
    g'olib aniqlanmaydi. Bu qatorlar faqat raqibning ekranida chiziq
    bo'lib ko'rinishi uchun kerak.

    Ball faqat OSHADI: kechikib kelgan so'rov (tarmoq navbati) eski,
    kichikroq qiymat bilan ustiga yozib, raqibning chizig'ini orqaga
    tashlab yuborardi.
    """
    d = Duel.objects.select_for_update().get(pk=duel.pk)
    hozirgi = d.chaqirgan_ball if chaqirganmi else d.qabul_ball
    if ball < hozirgi:
        return

    if chaqirganmi:
        d.chaqirgan_ball, d.chaqirgan_sanoq = ball, sanoq
        d.chaqirgan_belgi = timezone.now()
        d.save(update_fields=["chaqirgan_ball", "chaqirgan_sanoq", "chaqirgan_belgi"])
    else:
        d.qabul_ball, d.qabul_sanoq = ball, sanoq
        d.qabul_belgi = timezone.now()
        d.save(update_fields=["qabul_ball", "qabul_sanoq", "qabul_belgi"])


def raqib_holati(duel: Duel, chaqirganmi: bool) -> dict:
    """Raqib haqidagi jonli ma'lumot — so'rov javobiga qo'shiladi."""
    if chaqirganmi:
        raqib = duel.qabul
        # Jonli taklif bilan chaqirilgan, lekin hali qo'shilmagan odamning
        # ismi ham ko'rinsin: lobbida "Do'stingiz kutilmoqda" emas,
        # "Aziz kutilmoqda" turishi kerak.
        nom = korinadigan_ism(raqib) if raqib else (
            korinadigan_ism(duel.kimga) if duel.kimga_id else ""
        )
        return {
            "raqibBor": raqib is not None,
            "raqibNom": nom,
            "raqibDaraja": duel.qabul_daraja if raqib else None,
            "raqibTayyor": duel.qabul_tayyor,
            "raqibBall": duel.qabul_ball,
            "raqibTugadi": duel.qabul_tugatdi,
            "raqibShuYerda": duel.belgisi_yangimi(chaqirgan=False),
        }
    return {
        "raqibBor": True,
        "raqibNom": korinadigan_ism(duel.chaqirgan),
        "raqibDaraja": duel.chaqirgan_daraja,
        "raqibTayyor": duel.chaqirgan_tayyor,
        "raqibBall": duel.chaqirgan_ball,
        "raqibTugadi": duel.chaqirgan_tugatdi,
        "raqibShuYerda": duel.belgisi_yangimi(chaqirgan=True),
    }


# ------------------------------------------------------------ umumiy hisob


def juft_hisob(men: Profile | None, raqib: Profile | None) -> dict | None:
    """
    Ikki o'yinchi orasidagi UMUMIY hisob — "Aziz bilan 4:3".

    ─────────────────── NEGA KERAK ───────────────────

    Bitta duelning bali ertaga esdan chiqadi, "4:3" esa qolib ketadi:
    u ikki bolani doimiy raqibga aylantiradi va keyingi duelga sabab
    yaratadi. Reyting (mavhum son) bu ishni qilolmaydi — undagi 1240
    hech kimga hech narsa demaydi, 4:3 esa hammaga tushunarli.

    ─────────────────── NEGA SAQLANMAYDI ───────────────────

    Hisob alohida jadvalda EMAS, har safar duellardan sanaladi.
    Sabab: saqlangan son bir kun kelib haqiqatdan farq qila boshlaydi
    (duel o'chirilsa, natija qo'lda tuzatilsa), sanash esa hech qachon
    yolg'on gapirmaydi. Bir juftlikda o'nlab duel bo'ladi, yuzlab
    emas — bu bitta arzon so'rov.
    """
    if men is None or raqib is None or men.pk == raqib.pk:
        return None

    qs = Duel.objects.filter(
        Q(chaqirgan=men, qabul=raqib) | Q(chaqirgan=raqib, qabul=men),
    ).exclude(golib="")

    hisob = {"men": 0, "raqib": 0, "durang": 0, "jami": 0}
    kunlar = set()
    for chaqirgan_id, golib, tugadi, yasaldi in qs.values_list(
        "chaqirgan_id", "golib", "tugadi_at", "created_at",
    ):
        hisob["jami"] += 1
        kunlar.add(timezone.localtime(tugadi or yasaldi).date())
        if golib == "durang":
            hisob["durang"] += 1
        elif (golib == "chaqirgan") == (chaqirgan_id == men.pk):
            hisob["men"] += 1
        else:
            hisob["raqib"] += 1
    return hisob | juft_zanjir(kunlar)


def juft_zanjir(kunlar: set) -> dict:
    """
    JUFTLIK ZANJIRI — "Aziz bilan 🔥 12 kun".

    ─────────────────── NEGA KERAK ───────────────────

    Snapchat va Duolingo'dagi do'st zanjiri: ikki kishi har kuni kamida
    bitta duel o'ynasa son o'sadi. Yolg'iz zanjirdan KUCHLIROQ, chunki
    uzilsa ikkinchi odam ham yo'qotadi — ya'ni har kim nafaqat o'zi
    uchun, balki do'sti uchun ham qaytadi.

    ─────────────────── QOIDA ───────────────────

    Zanjir bugun YOKI kecha tugagan duel bilan tirik. Kecha o'ynab,
    bugun hali o'ynamagan juftlik — `xavf`: zanjir hali bor, lekin
    yarim tunda uziladi. Ro'yxatda aynan shu juftlik tepaga chiqadi.

    Saqlanmaydi, duellardan sanaladi (`juft_hisob` bilan bir sabab).
    """
    bugun = timezone.localdate()
    kecha = bugun - timedelta(days=1)
    if bugun in kunlar:
        kun = bugun
    elif kecha in kunlar:
        kun = kecha
    else:
        return {"zanjir": 0, "bugun": False, "xavf": False}
    n = 0
    while kun in kunlar:
        n += 1
        kun -= timedelta(days=1)
    return {"zanjir": n, "bugun": bugun in kunlar, "xavf": bugun not in kunlar}


# ------------------------------------------------------------ qayta bellashuv


def qayta_duel(oldingi: Duel) -> Duel:
    """
    O'sha ikki o'yinchi uchun yangi duel — eski shartlar, YANGI urug'.

    Urug' yangilanadi: eski urug' bilan savollar ham eski bo'lardi va
    ikkinchi bellashuv "kim yaxshiroq eslab qolgan" o'yiniga aylanardi.

    Ikkalasi darhol TAYYOR deb belgilanadi va sanoq shu yerda
    boshlanadi. "Yana o'ynaymizmi?" degan savolga "ha" degan odamdan
    yana bir marta "tayyorman" so'rash — bir xil savolni ikki marta
    berish demak, va o'sha ikkinchi bosishda odam yo'qoladi.
    """
    return Duel.objects.create(
        kod=kod_yasa(),
        urug=secrets.randbelow(2_000_000_000) + 1,
        oyin=oldingi.oyin,
        daraja=oldingi.daraja,
        # Har kimning darajasi o'zida qoladi: "yana o'ynaymiz" degan odam
        # o'sha sharoitda davom etmoqchi.
        chaqirgan_daraja=oldingi.chaqirgan_daraja,
        qabul_daraja=oldingi.qabul_daraja,
        kimga=oldingi.kimga,
        savollar_soni=oldingi.savollar_soni,
        vaqt=oldingi.vaqt,
        chaqirgan=oldingi.chaqirgan,
        qabul=oldingi.qabul,
        chaqirgan_tayyor=True,
        qabul_tayyor=True,
        chaqirgan_belgi=timezone.now(),
        qabul_belgi=timezone.now(),
        boshlanadi=timezone.now() + timedelta(seconds=Duel.SANOQ_SONIYA),
    )


@transaction.atomic
def yana_soradi(duel: Duel, chaqirganmi: bool) -> Duel:
    """
    "Yana o'ynaymizmi?" — tugagan duelda bosiladi.

    Yangi duel FAQAT ikkita shart bajarilganda yasaladi:

      1. IKKALASI ham so'ragan bo'lsin. Bir tomonning xohishi yetarli
         bo'lsa, raqib o'zi bilmagan holda o'yin ichida paydo bo'lardi.
      2. Ikkalasining belgisi ham YANGI bo'lsin, ya'ni ikkalasi shu
         daqiqada ekran oldida. Taklifni bosib telefonni cho'ntagiga
         solgan odam bilan boshlangan duel ikkalasiga ham yolg'on
         natija yozardi.

    Qator qulflanadi: ikkalasi tugmani bir soniyada bosishi mumkin va
    o'shanda ikkita yangi duel yasalib, har biri o'zinikida yolg'iz
    qolardi.
    """
    # `of=("self",)` — qulf FAQAT duel qatoriga qo'yiladi.
    #
    # Usiz Postgres butun so'rovni rad etadi:
    #
    #     FOR UPDATE cannot be applied to the nullable side of an outer join
    #
    # Sabab: `keyingi` — bo'sh bo'lishi mumkin bo'lgan bog'lanish, ya'ni
    # `select_related` uni LEFT OUTER JOIN bilan oladi. Yo'q qatorni
    # qulflab bo'lmaydi va Postgres taxmin qilishdan ko'ra to'xtashni
    # tanlaydi.
    #
    # SQLite'da bu sezilmasdi: u `FOR UPDATE` ni umuman e'tiborga
    # olmaydi. Ya'ni xato bazani almashtirgandagina chiqadigan turdan
    # edi va uni sinovlar Postgres'da yuritilganda topdi.
    d = (
        Duel.objects
        .select_for_update(of=("self",))
        .select_related("keyingi")
        .get(pk=duel.pk)
    )

    # Allaqachon yasalgan — ikkinchi bosish hech narsani o'zgartirmaydi.
    if d.keyingi_id:
        return d

    if chaqirganmi:
        d.chaqirgan_yana = True
        d.chaqirgan_belgi = timezone.now()
    else:
        d.qabul_yana = True
        d.qabul_belgi = timezone.now()

    if (
        d.chaqirgan_yana and d.qabul_yana
        and d.qabul_id is not None
        and d.belgisi_yangimi(chaqirgan=True)
        and d.belgisi_yangimi(chaqirgan=False)
    ):
        d.keyingi = qayta_duel(d)

    d.save(update_fields=[
        "chaqirgan_yana", "chaqirgan_belgi",
        "qabul_yana", "qabul_belgi", "keyingi",
    ])
    return d


def yana_holati(duel: Duel, chaqirganmi: bool) -> dict:
    """Qayta bellashuv holati — so'rov javobiga qo'shiladi."""
    return {
        "menYana": duel.chaqirgan_yana if chaqirganmi else duel.qabul_yana,
        "raqibYana": duel.qabul_yana if chaqirganmi else duel.chaqirgan_yana,
        "keyingiKod": duel.keyingi.kod if duel.keyingi_id else "",
    }


# ------------------------------------------------------------ do'stlar


def _onlaynmi(profil: Profile) -> bool:
    """Profil egasi AYNI HOZIR ilovadami (`boshqaruv.ONLAYN_DAQIQA`)."""
    from .boshqaruv import ONLAYN_DAQIQA
    chegara = timezone.now() - timedelta(minutes=ONLAYN_DAQIQA)
    return profil.pupil.sessions.filter(last_seen__gte=chegara).exists()


def tanishmi(a: Profile, b: Profile) -> bool:
    """
    Ikki o'yinchi TANISHmi — ya'ni bir-biri bilan duel o'ynaganmi.

    Jonli taklifning ikkinchi sharti shu (`DuelTaklif`). "Do'st havolasi
    orqali kelgan" ham shu yerga tushadi: havolani ochib qabul qilgan
    odam `qabul` bo'lib yoziladi. Faqat YUBORILGAN, lekin javob
    berilmagan chaqiruv tanishlik emas — aks holda notanish odam bir
    marta chaqiruv yuborib, keyin jonli taklif huquqini olardi.
    """
    if a.pk == b.pk:
        return False
    return Duel.objects.filter(
        Q(chaqirgan=a, qabul=b) | Q(chaqirgan=b, qabul=a),
    ).exists()


def _ochiq_chaqiruv(chaqirgan: Profile, raqib: Profile) -> Duel | None:
    """`chaqirgan` o'ynab qo'ygan va `raqib` hali javob bermagan chaqiruv."""
    muddat = timezone.now() - timedelta(hours=Duel.MUDDAT_SOAT)
    return (
        Duel.objects
        .filter(
            Q(kimga=raqib) | Q(qabul=raqib),
            chaqirgan=chaqirgan, chaqirgan_tugatdi=True, qabul_tugatdi=False,
            boshlanadi__isnull=True, created_at__gte=muddat,
        )
        .order_by("-created_at").first()
    )


def navbat_soni(profil: Profile) -> int:
    """Menga yuborilgan va hali javob berilmagan chaqiruvlar soni."""
    muddat = timezone.now() - timedelta(hours=Duel.MUDDAT_SOAT)
    return (
        Duel.objects
        .filter(
            Q(qabul__isnull=True) | Q(qabul=profil),
            kimga=profil, chaqirgan_tugatdi=True, qabul_tugatdi=False,
            boshlanadi__isnull=True, created_at__gte=muddat,
        )
        .exclude(chaqirgan=profil)
        .count()
    )


#: Do'stlar ro'yxatida ko'pi bilan nechta odam.
MAX_DOST = 20


def dostlar(men: Profile) -> list[dict]:
    """
    "SIZNING NAVBATINGIZ" — kim bilan o'ynaganim va hozir kimning navbati.

    Trivia Crack / Words With Friends usuli: duel onlayn bo'lishi shart
    emas, har kim o'z vaqtida o'ynaydi. Ilova ochilganda esa "Aziz sizni
    kutyapti" turadi va bu qaytishning eng aniq sababi.

    Tartib qaror bo'yicha, alifbo bo'yicha emas:
      1. navbat MENDA      — kimdir javob kutyapti;
      2. zanjir XAVFDA     — bugun o'ynalmasa yarim tunda uziladi;
      3. hozir ONLAYN      — jonli o'ynash mumkin;
      4. qolgani oxirgi o'yin bo'yicha.
    """
    qs = (
        Duel.objects
        .select_related("chaqirgan__pupil", "qabul__pupil", "kimga__pupil")
        .filter(Q(chaqirgan=men) | Q(qabul=men) | Q(kimga=men))
        .order_by("-created_at")[:300]
    )

    sheriklar: dict[int, tuple[Profile, object]] = {}
    for d in qs:
        if d.chaqirgan_id == men.pk:
            sherik = d.qabul or d.kimga
        else:
            sherik = d.chaqirgan
        if sherik is None or sherik.pk == men.pk or sherik.pk in sheriklar:
            continue
        sheriklar[sherik.pk] = (sherik, d.created_at)
        if len(sheriklar) >= MAX_DOST:
            break

    from .onlayn import BOSH, YOQ, holat_xaritasi
    holatlar = holat_xaritasi([s.pupil_id for s, _ in sheriklar.values()])

    ro = []
    for sherik, oxirgi in sheriklar.values():
        hisob = juft_hisob(men, sherik) or {}
        menga = _ochiq_chaqiruv(sherik, men)
        unga = None if menga else _ochiq_chaqiruv(men, sherik)
        ochiq = menga or unga
        holat, oyin = holatlar.get(sherik.pupil_id, (BOSH, ""))
        onlayn = holat != BOSH or _onlaynmi(sherik)
        mumkin, _ = taklif_mumkinmi(men, sherik, onlayn=onlayn)
        ro.append({
            "profil": sherik.pk,
            "ism": korinadigan_ism(sherik),
            "avatar": sherik.avatar,
            "onlayn": onlayn,
            "holat": holat if onlayn else YOQ,
            "oyin": oyin,
            "hisob": hisob,
            # "men" — sherik o'ynab qo'ygan, javob menda; "u" — aksincha.
            "navbat": "men" if menga else "u" if unga else "",
            "kod": ochiq.kod if ochiq else "",
            "jonli": mumkin,
            "oxirgi": oxirgi,
        })

    ro.sort(key=lambda x: (
        x["navbat"] != "men",
        not x["hisob"].get("xavf"),
        not x["onlayn"],
        -x["oxirgi"].timestamp(),
    ))
    return ro


# ------------------------------------------------------------ jonli taklif


#: Bir juftlikka shuncha daqiqada bitta taklif.
TAKLIF_ORALIQ_DAQIQA = 60

#: Bir kunda shuncha marta rad etgan odamga boshqa taklif kelmaydi.
TAKLIF_RAD_CHEGARA = 2


def taklif_mumkinmi(kimdan: Profile, kimga: Profile,
                    onlayn: bool | None = None) -> tuple[bool, str]:
    """
    Jonli taklif yuborsa bo'ladimi — va bo'lmasa NEGA.

    Sabab mijozga qisqa kalit so'z bo'lib ketadi. Tartib arzon
    tekshiruvdan qimmatiga.

    "Bir juftlikka soatiga bitta" — umumiy "bir odamga soatiga bitta"
    emas. Umumiy chegara ikkinchi do'stni ham to'sib qo'yardi: Aziz
    chaqirgani uchun Malika bir soat chaqira olmasdi. Bezdirishdan esa
    kunlik rad chegarasi va "band" tekshiruvi himoya qiladi.
    """
    if kimdan.pk == kimga.pk:
        return False, "ozingiz"
    if kimga.taklif_yopiq:
        return False, "yopiq"
    if not tanishmi(kimdan, kimga):
        return False, "notanish"
    if onlayn is None:
        onlayn = _onlaynmi(kimga)
    if not onlayn:
        return False, "oflayn"

    # Duelda yoki darsda turgan odamning ekraniga taklif chiqmaydi: u
    # birinchisida boshqa odam bilan bellashyapti, ikkinchisida o'qiyapti.
    # Mashq o'yinidagi odam esa chaqiriladi — taklif o'yini tugagach,
    # natija ekranida ko'rinadi.
    from .onlayn import DUELDA, OQIYAPTI, profil_holati
    if profil_holati(kimga) in (DUELDA, OQIYAPTI):
        return False, "band"

    hozir = timezone.now()
    if DuelTaklif.objects.filter(
        kimdan=kimdan, kimga=kimga,
        created_at__gte=hozir - timedelta(minutes=TAKLIF_ORALIQ_DAQIQA),
    ).exclude(holat=DuelTaklif.BEKOR).exists():
        return False, "soatiga"

    kun_boshi = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)
    rad = DuelTaklif.objects.filter(
        kimga=kimga, holat=DuelTaklif.RAD, javob_at__gte=kun_boshi,
    ).count()
    if rad >= TAKLIF_RAD_CHEGARA:
        return False, "bugun_rad"

    # Ekranda bir vaqtda bitta oyna: ikkinchisi birinchisini yopib
    # qo'yardi va odam kim chaqirganini ham ko'rmay qolardi.
    if _faol_taklif(kimga) is not None:
        return False, "band"
    return True, ""


def _faol_taklif(kimga: Profile) -> DuelTaklif | None:
    chegara = timezone.now() - timedelta(seconds=DuelTaklif.MUDDAT_SONIYA)
    return (
        DuelTaklif.objects
        .select_related("duel", "kimdan")
        .filter(kimga=kimga, holat=DuelTaklif.KUTYAPTI, created_at__gte=chegara)
        .order_by("-created_at").first()
    )


@transaction.atomic
def taklif_yubor(kimdan: Profile, kimga: Profile, oyin: str = "", savollar: int = 0,
                 vaqt: int = 0, daraja=None) -> tuple[DuelTaklif | None, str]:
    """
    Jonli taklif yasaydi: duel + taklif.

    Chaqirgan odam DARHOL tayyor deb belgilanadi — u "Jonli chaqirish"
    ni bosib, lobbida kutib turibdi. Do'sti qabul qilishi bilan sanoq
    boshlanadi va hech kim "tayyorman" ni ikkinchi marta bosmaydi.
    """
    mumkin, sabab = taklif_mumkinmi(kimdan, kimga)
    if not mumkin:
        return None, sabab
    d = yangi_duel(kimdan, oyin=oyin, savollar=savollar, vaqt=vaqt,
                   daraja=daraja, kimga=kimga)
    d.chaqirgan_tayyor = True
    d.chaqirgan_belgi = timezone.now()
    d.save(update_fields=["chaqirgan_tayyor", "chaqirgan_belgi"])
    return DuelTaklif.objects.create(duel=d, kimdan=kimdan, kimga=kimga), ""


def kelgan_taklif(profil: Profile) -> DuelTaklif | None:
    """
    Menga hozir ko'rsatiladigan taklif.

    Chaqirgan odam lobbidan KETGAN bo'lsa taklif ko'rsatilmaydi: qabul
    qilgan bola bo'sh lobbiga tushib, hech kim kelmasligini kutib qolardi.
    """
    t = _faol_taklif(profil)
    if t is None or not t.duel.belgisi_yangimi(chaqirgan=True):
        return None
    return t


def taklif_holati(duel: Duel) -> dict | None:
    """Chaqirgan odamning lobbisi uchun — do'sti nima dedi."""
    t = duel.takliflar.order_by("-created_at").first()
    if t is None:
        return None
    holat = t.holat
    if holat == DuelTaklif.KUTYAPTI and t.muddati_otdimi:
        holat = "otdi"
    return {"holat": holat, "qolgan": t.qolgan_soniya}


@transaction.atomic
def taklif_javob(taklif: DuelTaklif, profil: Profile, qabul: bool,
                 daraja=None) -> tuple[Duel | None, str]:
    """
    Taklifga javob. `qabul` bo'lsa — duelga qo'shadi va sanoq boshlanadi.

    Muddati o'tgan taklifni qabul qilib bo'lmaydi: chaqirgan odam 15
    soniyadan keyin "kelmadi" deb o'zi o'ynashga o'tgan bo'lishi mumkin.
    Rad etish esa muddatdan keyin ham yoziladi — u chegara uchun sanaladi.
    """
    t = DuelTaklif.objects.select_for_update().get(pk=taklif.pk)
    if t.kimga_id != profil.pk:
        return None, "begona"
    if t.holat == DuelTaklif.BEKOR:
        return None, "bekor"
    if t.holat != DuelTaklif.KUTYAPTI:
        return None, "javob_berilgan"

    t.javob_at = timezone.now()
    if not qabul:
        t.holat = DuelTaklif.RAD
        t.save(update_fields=["holat", "javob_at"])
        return t.duel, ""

    if t.muddati_otdimi:
        return None, "muddati_otdi"
    if not t.duel.belgisi_yangimi(chaqirgan=True) or t.duel.qabul_id not in (None, profil.pk):
        return None, "ketdi"

    t.holat = DuelTaklif.QABUL
    t.save(update_fields=["holat", "javob_at"])
    return tayyorlash(t.duel, profil, chaqirganmi=False, daraja=daraja), ""


@transaction.atomic
def taklif_bekor(duel: Duel, profil: Profile) -> bool:
    """
    Chaqirgan odam kutishdan voz kechdi — "Bekor qilish".

    Faqat hali javob berilmagan taklif bekor bo'ladi: qabul qilingan
    bo'lsa sanoq allaqachon ketgan, rad etilgan bo'lsa bekor qiladigan
    narsa yo'q. Duelning o'zi o'chirilmaydi — u o'ynalmagan chaqiruv
    bo'lib qoladi va muddati o'tib o'zi yopiladi.
    """
    if duel.chaqirgan_id != profil.pk:
        return False
    t = duel.takliflar.select_for_update().filter(holat=DuelTaklif.KUTYAPTI).first()
    if t is None:
        return False
    t.holat = DuelTaklif.BEKOR
    t.javob_at = timezone.now()
    t.save(update_fields=["holat", "javob_at"])
    return True
