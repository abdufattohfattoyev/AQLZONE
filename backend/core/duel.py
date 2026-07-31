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

#: O'yin necha soniya davom etadi.
VAQT = 60


def kod_yasa() -> str:
    """
    Havoladagi kod.

    `secrets` bilan — taxmin qilib bo'lmasin. Kod ochiq havolada
    yuriladi va uni bilgan odam duelni ocha oladi; ketma-ket sonlar
    bo'lsa, birov begona duellarni birma-bir ochib chiqardi.
    """
    return secrets.token_urlsafe(8)[:11]


def yangi_duel(profile: Profile) -> Duel:
    """Yangi chaqiruv boshlaydi (hali o'ynalmagan)."""
    return Duel.objects.create(
        kod=kod_yasa(),
        urug=secrets.randbelow(2_000_000_000) + 1,
        oyin=secrets.choice(OYINLAR),
        daraja=2,
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
    if ball > VAQT * MAX_BALL_SONIYA:
        return False
    if not isinstance(sanoq, list) or len(sanoq) > VAQT + 5:
        return False
    return all(isinstance(x, int) and 0 <= x <= ball for x in sanoq)


def havola(kod: str) -> str:
    """Chaqiruv havolasi — ilovaning duel sahifasiga olib boradi."""
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
def natijani_yoz(duel: Duel, profile: Profile, ball: int, xato: int, sanoq: list) -> str:
    """
    Natijani tegishli tomonga yozadi va kerak bo'lsa g'olibni aniqlaydi.

    Qaytaradi: `"chaqirgan"` | `"qabul"` — kimning natijasi yozilgani.
    Xato holatlar chaqiruvchida tekshiriladi.
    """
    if duel.chaqirgan_id == profile.pk and not duel.chaqirgan_tugatdi:
        duel.chaqirgan_ball = ball
        duel.chaqirgan_xato = xato
        duel.chaqirgan_sanoq = sanoq
        duel.chaqirgan_tugatdi = True
        duel.save(update_fields=[
            "chaqirgan_ball", "chaqirgan_xato", "chaqirgan_sanoq", "chaqirgan_tugatdi",
        ])
        return "chaqirgan"

    duel.qabul = profile
    duel.qabul_ball = ball
    duel.qabul_xato = xato
    duel.qabul_sanoq = sanoq
    duel.qabul_tugatdi = True
    duel.golib = duel.golibni_aniqla()
    duel.tugadi_at = timezone.now()
    duel.save(update_fields=[
        "qabul", "qabul_ball", "qabul_xato", "qabul_sanoq", "qabul_tugatdi",
        "golib", "tugadi_at",
    ])
    return "qabul"
