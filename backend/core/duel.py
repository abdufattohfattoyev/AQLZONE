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
from django.utils import timezone

from .models import Duel, Identity, Profile
from . import xabar as X

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


def yangi_duel(profile: Profile, oyin: str = "", savollar: int = 0,
               vaqt: int = 0) -> Duel:
    """
    Yangi chaqiruv boshlaydi (hali o'ynalmagan).

    Shartlarni CHAQIRGAN odam tanlaydi va ular ikkalasiga bir xil
    bo'ladi. Ilgari o'yinni server tasodifiy tanlardi — "chaqirgan odam
    o'zi kuchli o'yinni tanlab oladi" degan xavotir bilan. Amalda esa
    duel do'st bilan o'ynaladi: kim kim bilan o'ynashini o'zi
    kelishadi, va tanlov imkoniyati o'yinni QIZIQARLIROQ qiladi.
    """
    oyin, savollar, vaqt = shartlarni_tozala(oyin, savollar, vaqt)
    return Duel.objects.create(
        kod=kod_yasa(),
        urug=secrets.randbelow(2_000_000_000) + 1,
        oyin=oyin,
        daraja=2,
        savollar_soni=savollar,
        vaqt=vaqt,
        chaqirgan=profile,
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
        return f"https://t.me/{bot}?startapp={kod}"

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
    import threading

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

        ilova = X.ilova_havolasi()
        ilovada = bool(getattr(settings, "MINI_APP_URL", ""))
    except Exception:                                # noqa: BLE001
        return

    def yubor() -> None:
        for tg_id, matn in ((chaqirgan_tg, ch_matn), (qabul_tg, qa_matn)):
            if not tg_id:
                continue
            try:
                X.yubor(
                    tg_id, matn,
                    # "Javob berish" — duel zanjirini davom ettiradi.
                    # Bitta zarbadan keyin tugaydigan bellashuv qaytish
                    # sababi yaratmaydi.
                    tugma="⚔️ Javob berish", havola=ilova, ilovada=ilovada,
                )
            except Exception:                        # noqa: BLE001
                pass

    threading.Thread(target=yubor, daemon=True).start()


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


@transaction.atomic
def tayyorlash(duel: Duel, profile: Profile, chaqirganmi: bool) -> Duel:
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
        return {
            "raqibBor": raqib is not None,
            "raqibNom": korinadigan_ism(raqib) if raqib else "",
            "raqibTayyor": duel.qabul_tayyor,
            "raqibBall": duel.qabul_ball,
            "raqibTugadi": duel.qabul_tugatdi,
            "raqibShuYerda": duel.belgisi_yangimi(chaqirgan=False),
        }
    return {
        "raqibBor": True,
        "raqibNom": korinadigan_ism(duel.chaqirgan),
        "raqibTayyor": duel.chaqirgan_tayyor,
        "raqibBall": duel.chaqirgan_ball,
        "raqibTugadi": duel.chaqirgan_tugatdi,
        "raqibShuYerda": duel.belgisi_yangimi(chaqirgan=True),
    }
