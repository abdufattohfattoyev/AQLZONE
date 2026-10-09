"""
Aql Zone Telegram boti.

Ishlatish:

    python manage.py bot            # doimiy tinglaydi (long polling)
    python manage.py bot --bir      # bitta o'qish va chiqish (sinov uchun)

Suhbat oqimi ataylab qisqa — ota-ona bitta tugma bosadi, xolos:

    /start
      → salom + "✅ Saytga kirish" havolasi (1 soat amal qiladi)
      → havola bosiladi, sayt o'zi kiradi, ichida ism-familiya so'raladi
    /raqam
      → "📱 Raqamni yuborish" tugmasi (ixtiyoriy: eslatma va tiklash uchun)

Nega havola, Login Widget emas: widget domenni BotFather'da ro'yxatga
olishni talab qiladi va telefonda qo'shimcha oyna ochadi. Bot esa
foydalanuvchi kimligini ALLAQACHON biladi — eng qisqa yo'l shu.

Nega long polling, webhook emas: webhook uchun doimiy HTTPS manzil va
sertifikat kerak. Polling esa noutbukda ham, serverda ham bir xil
ishlaydi va hech qanday sozlash talab qilmaydi. Yuk ortganda webhook'ga
o'tish oson — bu fayldagi `yangilikni_qayta_ishla()` o'zgarmaydi.

Diqqat: raqam faqat FOYDALANUVCHI O'ZI tugmani bosganda keladi. Telegram
boshqa yo'l bilan raqam berishga ruxsat bermaydi, ya'ni rozilik har doim
aniq bo'ladi.
"""
from __future__ import annotations

import html
import json
import time
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_date

from core import boshqaruv
from core.auth import kirish_kodi_yasa, tg_ismi
from core.matn import TILLAR, M, barcha, tilni_tanla
from core.models import Identity, KirishKodi, Pupil
from core.xabar import KOK, QIZIL, YASHIL, tugma_yasa

#: Telegram javobni shuncha sekund ushlab turadi (yangilik bo'lmasa).
KUTISH = 25

#: Tarmoq uzilganda shuncha kutib qayta urinamiz.
QAYTA_URINISH = 5


def api(usul: str, **payload) -> dict:
    """Telegram Bot API chaqiruvi. Xato bo'lsa bo'sh natija qaytadi."""
    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/{usul}"
    so_rov = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(so_rov, timeout=KUTISH + 10) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        # 403 = foydalanuvchi botni bloklagan. Bu xato emas, oddiy holat.
        return {"ok": False, "xato": f"HTTP {e.code}"}
    except Exception as e:
        return {"ok": False, "xato": str(e)}


def _til_top(tg_id: str, tg_tili: str | None) -> str:
    """
    Shu odam uchun xabar tili.

    Tartib muhim: MAVJUD hisobda ilovada tanlangan til ustun turadi.
    Telegram interfeysi ruscha bo'lgani "darslarni ham ruscha o'qiydi"
    degani emas — ko'p oilada telefon ruscha, bola esa o'zbek maktabida.
    Hisob yo'q bo'lsa Telegram tili yagona ishora bo'lib qoladi.
    """
    kirish = (
        Identity.objects.filter(provider=Identity.TELEGRAM, external_id=tg_id)
        .select_related("pupil")
        .first()
    )
    if kirish and kirish.pupil.til:
        return tilni_tanla(kirish.pupil.til)
    return tilni_tanla(tg_tili)


def raqamni_tozala(xom: str) -> str:
    """
    Telegram raqamni "+998901234567" yoki "998901234567" ko'rinishida beradi.
    Bittasini tanlaymiz, aks holda bir odam ikki xil yozuvda ikki hisob
    ochib olardi.
    """
    faqat_raqam = "".join(c for c in (xom or "") if c.isdigit())
    return f"+{faqat_raqam}" if faqat_raqam else ""


@transaction.atomic
def raqamni_bogla(
    tg_id: str, telefon: str, ism: str, familiya: str, til: str = "",
) -> tuple[Pupil, bool]:
    """
    Telefonni Telegram hisobiga bog'laydi.

    Qaytaradi: (hisob, yangi_bog'landimi).

    Uch holat bor va uchalasi ham hisobga olingan:
      1. Telegram hisobi yo'q      → yangi hisob ochiladi
      2. Bor, raqami yo'q          → raqam qo'shiladi
      3. Bor, raqami boshqa        → eskisi almashtiriladi (raqam o'zgargan)
    """
    kirish = (
        Identity.objects.filter(provider=Identity.TELEGRAM, external_id=tg_id)
        .select_related("pupil")
        .first()
    )
    if kirish:
        pupil = kirish.pupil
    else:
        # Til YANGI hisobga Telegram'dan yoziladi: odam hali ilovani
        # ochmagan, ya'ni boshqa ishora yo'q. Ilova ochilganda o'zining
        # tanlovini yuboradi va bu qiymat ustiga yoziladi.
        pupil = Pupil.objects.create(
            first_name=ism, last_name=familiya, til=til or "uz",
        )
        Identity.objects.create(
            pupil=pupil, provider=Identity.TELEGRAM, external_id=tg_id
        )

    # Ism/familiya faqat BO'SH bo'lsa to'ldiriladi — foydalanuvchi ilovada
    # o'zi yozgan qiymatni bot qayta yozib yubormasligi kerak.
    maydon = []
    if not pupil.first_name and ism:
        pupil.first_name, maydon = ism, maydon + ["first_name"]
    if not pupil.last_name and familiya:
        pupil.last_name, maydon = familiya, maydon + ["last_name"]
    if maydon:
        pupil.save(update_fields=maydon)

    if not telefon:
        return pupil, False

    mavjud = Identity.objects.filter(
        provider=Identity.TELEFON, external_id=telefon
    ).first()
    if mavjud and mavjud.pupil_id == pupil.pk:
        return pupil, False                      # allaqachon shu hisobda

    if mavjud:
        # Bu raqam boshqa hisobda edi. Uni ko'chirmaymiz — progressni
        # jimgina birlashtirish xavfli. Eski bog'lanish o'chiriladi,
        # raqam joriy hisobga o'tadi.
        mavjud.delete()

    # Shu hisobning eski raqami bo'lsa (odam raqamini almashtirgan) — olib tashlaymiz.
    Identity.objects.filter(pupil=pupil, provider=Identity.TELEFON).delete()
    Identity.objects.create(
        pupil=pupil, provider=Identity.TELEFON, external_id=telefon
    )
    return pupil, True


def muddat_matni(til: str = "uz") -> str:
    """
    "1 soat" / "30 daqiqa" — xabarda ko'rsatish uchun.

    Hisoblanadi, qo'lda yozilmaydi: `KirishKodi.DAQIQA` o'zgarganda xabar
    ham o'zgarsin. Aks holda kod 30 daqiqa yashaydi-yu, bot "1 soat"
    deyaverardi va foydalanuvchi havolani ishlamayapti deb o'ylardi.
    """
    d = KirishKodi.DAQIQA
    if d >= 60 and d % 60 == 0:
        return M("muddatSoat", til, n=d // 60)
    return M("muddatDaqiqa", til, n=d)


#: Mini App ichidagi bo'limlarning yo'llari.
#:
#: Klaviaturadagi har bir tugma ilovaning AYNAN SHU ekranini ochadi —
#: "ilovani oching, keyin o'zingiz toping" emas. Farqi katta: botdan
#: kelgan odam bir bosishda kerakli joyga tushadi.
OYIN_YOLI = "/oyinlar"
DUEL_YOLI = "/oyinlar/duel"
MAYDON_YOLI = "/oyinlar/maydon"
REYTING_YOLI = "/reyting"
#: DTM — `/imtihon` oxirgi tanlangan turga (DTM yoki sertifikat) o'zi o'tadi.
DTM_YOLI = "/imtihon"
SERTIFIKAT_YOLI = "/sertifikat"
MASALALAR_YOLI = "/masalalar"


def ilova_url(yol: str = "") -> str:
    """
    Mini App manzili, ixtiyoriy ichki yo'l bilan.

    Oxiridagi qiya chiziq olib tashlanadi: `MINI_APP_URL` ni `.env` ga
    ikki xil yozish mumkin va `https://aql-zone.uz//oyinlar` degan manzil
    Telegram tekshiruvidan o'tmasdi.
    """
    asos = (settings.MINI_APP_URL or "").rstrip("/")
    return f"{asos}{yol}" if asos else ""


def asosiy_klaviatura(til: str) -> dict | None:
    """
    Suhbat ostida DOIM turadigan to'rtta tugma.

    NEGA KERAK. Bot faqat buyruqni tushunardi va ularni hech qayerda
    ko'rsatmасdi: `/oyinlar` deb yozgan odam "Boshlash uchun /start
    yuboring" degan javob olardi — ya'ni bot bilgan narsasini o'zi
    yashirib turardi. Buyruqni eslab qolish esa hech kimning ishi emas.

    Ilovaga olib boradigan BESHTA tugma ham to'g'ridan-to'g'ri
    ILOVANI ochadi (`web_app`): ular xabar yubormaydi, bosilishi bilan
    kerakli bo'lim ochiladi. Faqat "Yordam" oddiy matn yuboradi.

    KLAVIATURA YOPILADI (`is_persistent` YO'Q). Ilgari u `True` edi —
    "odam bir marta yashirsa, boshqa topolmaydi" degan qo'rquv bilan.
    Amalda esa teskarisi chiqdi: Telegram bunda kiritish maydonidagi
    klaviatura belgisini UMUMAN olib tashlaydi, ya'ni oltita rangli
    tugma telefon ekranining yarmini egallab, hech qanday yo'l bilan
    yig'ilmasdi. Android'da esa "ortga" bosilganda avval klaviatura
    yopilishi kerak — u darrov qaytib chiqqani uchun ortga tugmasi
    ishlamayotgandek tuyulardi va suhbatdan chiqib bo'lmasdi.

    Yashirilgan klaviatura yo'qolmaydi: uning o'rnida kiritish maydonida
    belgi turadi va bir bosishda qaytadi. Bundan tashqari har `/start` va
    javobsiz qolgan har qanday xabar uni qaytadan yuboradi.

    `MINI_APP_URL` sozlanmagan bo'lsa (lokal ishlab chiqish) klaviatura
    UMUMAN chizilmaydi: yarim ishlaydigan tugmalar — yo'qidan yomonroq.
    """
    if not ilova_url():
        return None
    return {
        "keyboard": [
            # ─────────── BITTA BOSISH, IKKITA EMAS ───────────
            #
            # Ilgari bu tugmalar oddiy MATN yuborardi, bot esa javobida
            # INLINE "Ochish" tugmasini qaytarardi. Sabab texnik edi:
            # reply-klaviatura tugmasidan ochilgan Mini App `initData`
            # olmaydi, ya'ni ilova odamni Telegram hisobidan tanimaydi.
            #
            # Amalda esa bu ikki bosishga aylanardi: "Reyting" bosgan
            # odam reytingni emas, yana bitta tugmani ko'rardi. Ilova
            # bir marta `initData` bilan ochilgach (menyu tugmasi,
            # inline tugma yoki havola orqali) tokeni SHU qurilmada
            # saqlanadi va keyingi ochilishlarda `initData` kerak
            # bo'lmaydi — ya'ni bu tugmalar ham to'g'ri hisobga tushadi.
            # ─────────── TUGMALAR TANLOVI (2026-09) ───────────
            #
            # Ilgari: Darslar · Bellashuv, Bugungi maydon · O'yinlar,
            # Reyting · Yordam. Ilovaning eng ko'p kerak bo'ladigan ikki
            # bo'limi — DTM/sertifikat va masalalar — botda umuman yo'q
            # edi (kelganlarning ko'pi talaba va abituriyent), ularning
            # o'rnini ilova ichida ikkinchi darajali Maydon va Reyting
            # egallab turardi. Ikkalasi ham ilovada qoldi ("O'yin" va
            # "Men" bo'limlarida), buyruqlari ham ishlaydi.
            #
            # "Darslar" endi "Ilovani ochish": tugma darslarni emas,
            # bosh sahifani ("Bugun") ochadi — nomi ishiga mos bo'lsin.
            [tugma_yasa(M("tIlova", til), YASHIL,
                        web_app={"url": ilova_url()})],
            [
                tugma_yasa(M("tDtm", til), KOK,
                           web_app={"url": ilova_url(DTM_YOLI)}),
                tugma_yasa(M("tMasalalar", til), KOK,
                           web_app={"url": ilova_url(MASALALAR_YOLI)}),
            ],
            [
                tugma_yasa(M("tOyinlar", til), KOK,
                           web_app={"url": ilova_url(OYIN_YOLI)}),
                tugma_yasa(M("tDuel", til), KOK,
                           web_app={"url": ilova_url(DUEL_YOLI)}),
            ],
            # To'rtinchi qator — ilovani OCHMAYDIGAN yagona tugma.
            #
            # "Raqam" bu yerdan OLIB TASHLANDI: raqam bir marta beriladi
            # va undan keyin bu tugma hech qachon kerak bo'lmaydi. U
            # `/raqam` buyrug'i bo'lib qoladi.
            #
            # "Yordam" NEYTRAL (rangsiz). Ilgari qizil edi — ajralib
            # tursin deb. Lekin qizil ilovada faqat XATO ma'nosida va
            # yordam xato emas; rangsiz tugma rangli to'rttasi orasida
            # baribir ajralib turadi.
            [tugma_yasa(M("tYordamTugma", til))],
        ],
        "resize_keyboard": True,
        # Yozish maydonidagi "Сообщение…" o'rniga — brend nomi (64 belgigacha).
        # Telegram uni klaviatura OCHIQ turganda ko'rsatadi.
        "input_field_placeholder": "Aql Zone",
    }


def menyu_tugmasini_qoy(chat_id: int, til: str) -> None:
    """
    Kiritish maydoni yonidagi menyu tugmasi — SHU suhbat uchun.

    Umumiy (`chat_id` siz) sozlash ham bor, lekin u BITTA tilda qotib
    qoladi: o'zbekcha qo'ysak ruszabon odam "Ochish" degan tanish
    bo'lmagan so'zni ko'radi. Suhbat bo'yicha qo'yilganda esa har kim
    o'z tilida ko'radi — xuddi saytdagidek.
    """
    if not ilova_url():
        return
    api(
        "setChatMenuButton",
        chat_id=chat_id,
        menu_button={
            "type": "web_app",
            "text": M("menyuTugma", til),
            "web_app": {"url": ilova_url()},
        },
    )


def raqam_sora(chat_id: int, matn: str, til: str = "uz") -> None:
    """Telefon raqamini so'raydigan klaviatura."""
    api(
        "sendMessage",
        chat_id=chat_id,
        text=matn,
        parse_mode="HTML",
        reply_markup={
            # YASHIL — raqam endi MAJBURIY va bu ekrandagi yagona
            # harakat. Ilgari u ko'k edi, chunki qadam ixtiyoriy edi.
            "keyboard": [[tugma_yasa(
                M("tRaqamniYuborish", til), YASHIL,
                # Telegram raqamni FAQAT shu tugma orqali beradi.
                request_contact=True,
            )]],
            "resize_keyboard": True,
            "one_time_keyboard": True,
        },
    )


def ilova_tugmalari(til: str, havola: str) -> list[list[dict]]:
    """
    Botdagi asosiy tugmalar: ilova va (zaxira sifatida) sayt havolasi.

    **Ilova BIRINCHI va YASHIL.** Ilgari birinchi o'rinda sayt havolasi
    turardi va u brauzerni ochardi — odam Telegram'dan chiqib ketardi.
    U yerda uch narsa yo'qoladi: hisobga kirish qaytadan boshlanadi,
    orqaga qaytish uchun Telegram'ni topib, botni qidirish kerak
    bo'ladi, va bolaning qo'lidagi telefonda brauzer oynasi allaqachon
    o'nlab boshqa varaq bilan to'la. Mini App esa bot suhbatining
    ustida ochiladi va kirish o'z-o'zidan bo'ladi (`initData`).

    SAYT HAVOLASI YO'Q va bu ataylab. U ilgari ikkinchi qatorda turardi
    va yonida Telegram'ning "tashqariga chiqasiz" strelkasi (↗)
    chizilardi. Odamlarning bir qismi aynan o'shani bosardi — chunki u
    tanish ko'rinadi — va brauzerga chiqib ketardi. U yerda hisobga
    kirish qaytadan boshlanadi, orqaga qaytish uchun botni qidirish
    kerak bo'ladi va aynan o'sha yo'lda ko'pchilik yo'qoladi.

    Endi botdan chiqadigan yagona yo'l — ilovaning O'ZI, Telegram
    ichida.

    `MINI_APP_URL` sozlanmagan bo'lsa (lokal ishlab chiqish) sayt
    havolasi zaxira bo'lib qaytadi: busiz botdan umuman chiqib
    bo'lmasdi.
    """
    if not settings.MINI_APP_URL:
        return [[tugma_yasa(M("tSaytgaKirish", til), YASHIL, url=havola)]] if havola else []

    return [[tugma_yasa(
        M("tIlovaniOchish", til), YASHIL,
        web_app={"url": settings.MINI_APP_URL},
    )]]


def raqam_kerakmi(pupil: Pupil) -> bool:
    """
    Shu hisobdan raqam TALAB QILINADIMI.

    Ikki shart: raqami yo'q VA hisob `RAQAM_MAJBURIY_DAN` sanasidan
    keyin ochilgan.

    Ikkinchisi muhim. Talab joriy qilingan paytda ilovada allaqachon
    o'nlab odam bor edi va ular hisobini raqamsiz ochgan. Ularni bir
    kunda darvoza oldida qoldirish — ishonchni yo'qotishning eng tez
    yo'li: bola kecha o'ynagan ilovaga bugun kira olmay qoladi va nega
    ekanini tushunmaydi. Eskilardan raqam KEYINROQ, e'lon orqali
    so'raladi.

    Sana sozlanmagan bo'lsa raqam hech kimdan talab qilinmaydi.
    """
    if pupil.telefon:
        return False

    xom = (getattr(settings, "RAQAM_MAJBURIY_DAN", "") or "").strip()
    if not xom:
        return False

    chegara = parse_date(xom)
    if chegara is None:                      # `.env` da buzuq sana
        return False
    return timezone.localtime(pupil.created_at).date() >= chegara


def raqami_yoq(tg_id: str) -> bool:
    """Shu Telegram hisobidan raqam talab qilinadimi (`raqam_kerakmi`)."""
    kirish = (
        Identity.objects.filter(provider=Identity.TELEGRAM, external_id=tg_id)
        .select_related("pupil")
        .first()
    )
    return bool(kirish) and raqam_kerakmi(kirish.pupil)


def salom_yubor(
    chat_id: int, tg_id: str, ism: str, familiya: str, til: str = "uz",
) -> str:
    """
    /start javobi: salom va bir martalik "Saytga kirish" havolasi.

    Havola HAR /start da yangidan yasaladi va eskisi o'chadi
    (`kirish_kodi_yasa`). Ya'ni suhbatda yotib qolgan eski havola bilan
    hech kim kira olmaydi — faqat oxirgisi ishlaydi.

    SAYT_URL sozlanmagan bo'lsa havola yasab bo'lmaydi. Bunda jim
    turmaymiz: eski oqimga — raqam so'rashga — tushamiz va sababini
    jurnalda ko'rsatamiz. Aks holda bot "ishlayapti" ko'rinadi-yu,
    foydalanuvchi hech qayerga o'ta olmaydi.
    """
    salom = M("salom", til, ism=(", " + ism if ism else ""))

    if not settings.SAYT_URL:
        raqam_sora(chat_id, salom + M("saytYoq", til), til)
        return f"{tg_id}: /start — SAYT_URL yo'q, raqam so'raldi"

    # Hisob shu yerda yaratiladi (yoki topiladi): havola aynan shu hisobga
    # kiritishi kerak. Raqam bo'sh — u keyin, /raqam orqali qo'shiladi.
    pupil, _ = raqamni_bogla(tg_id, "", ism, familiya, til)
    havola = f"{settings.SAYT_URL}/kirish/{kirish_kodi_yasa(pupil)}"

    # Hisob allaqachon bor bo'lsa, ILOVADA tanlangan til ustun turadi:
    # Telegram interfeysi ruscha bo'lgani odam darslarni ham ruscha
    # o'qiydi degani emas.
    til = pupil.til or til

    # Raqam YO'Q — ilovaga o'tkazmaymiz. Salom va so'rov BITTA xabarda
    # ketadi: ikkitaga bo'linsa, odam birinchisiga javob berib,
    # ikkinchisini o'qimasdi.
    #
    # Doimiy klaviatura ham berilmaydi: uning tugmalari ilovani ochadi
    # va darvoza ochiq qolib ketardi.
    if raqam_kerakmi(pupil):
        raqam_sora(chat_id, salom + M("raqamNegaKerak", til), til)
        return f"{tg_id}: /start — raqam so'raldi (hisob #{pupil.pk})"

    tugmalar = ilova_tugmalari(til, havola)
    klaviatura = asosiy_klaviatura(til)

    # Menyu tugmasi ham shu odamning tilida bo'lsin.
    menyu_tugmasini_qoy(chat_id, til)

    if not klaviatura:
        # Mini App sozlanmagan — klaviatura ham yo'q. Bunday paytda
        # yagona yo'l sayt havolasi bo'lib qoladi.
        api("sendMessage", chat_id=chat_id,
            text=salom + M("tugmaniBos", til, muddat=muddat_matni(til)),
            parse_mode="HTML", reply_markup={"inline_keyboard": tugmalar})
        return f"{tg_id}: /start — javob berildi (hisob #{pupil.pk})"

    # IKKITA xabar, va sabab texnik: bitta xabarda yo doimiy klaviatura,
    # yo inline tugma bo'ladi — ikkalasi birga bo'lmaydi. Bu yerda
    # ikkalasi ham kerak va ular bir xil ish qilmaydi:
    #
    #   • klaviatura — HAR KUNGI yo'l. Tugmalari ilovani o'zi ochadi va
    #     suhbat ostida doim turadi.
    #   • inline tugma — BIRINCHI kirish. Telegram reply-klaviaturadan
    #     ochilgan Mini App ga `initData` bermaydi, ya'ni ilova odamni
    #     tanimaydi. Inline tugma esa beradi. Birinchi ochilish shu
    #     yerdan bo'lsa, hisob qurilmada saqlanadi va undan keyin
    #     klaviatura tugmalari ham to'g'ri hisobga tushadi.
    #
    # Tartib ham shundan: salom va klaviatura oldin, yashil tugma esa
    # OXIRGI xabarda — ya'ni odam ko'radigan eng pastki narsa aynan
    # bosilishi kerak bo'lgan tugma bo'ladi.
    api("sendMessage", chat_id=chat_id,
        text=salom + M("pastdagiTugma", til),
        parse_mode="HTML", reply_markup=klaviatura)
    # Ikkinchi xabar FAQAT ilovani hali Telegram ichida ochmaganga.
    # Ilgari har `/start` da ikkala xabar kelardi va qaytgan odam uchun
    # ikkinchisi ortiqcha edi: uning qurilmasida hisob allaqachon bor
    # (`platform="tg"` sessiyasi — `auth_telegram`), klaviatura tugmalari
    # to'g'ri hisobga tushadi.
    if pupil.sessions.filter(platform="tg").exists():
        return f"{tg_id}: /start — javob berildi, bitta xabar (hisob #{pupil.pk})"
    api("sendMessage", chat_id=chat_id,
        text=M("birinchiOchish", til),
        parse_mode="HTML", reply_markup={"inline_keyboard": tugmalar})
    return f"{tg_id}: /start — javob berildi (hisob #{pupil.pk})"


def oyinlarni_yubor(chat_id: int, til: str) -> None:
    """
    /oyinlar — o'yinlar bo'limi haqida va uni ochadigan tugma.

    Tugma to'g'ridan-to'g'ri `/oyinlar` sahifasiga olib boradi, bosh
    sahifaga emas: odam o'yin so'radi, ya'ni uni yana bir marta bosishga
    majburlashning hech qanday sababi yo'q.
    """
    url = ilova_url(OYIN_YOLI)
    if not url:
        api("sendMessage", chat_id=chat_id, text=M("ilovaSozlanmagan", til))
        return
    api(
        "sendMessage",
        chat_id=chat_id,
        text=M("oyinlar", til),
        parse_mode="HTML",
        reply_markup={"inline_keyboard": [[tugma_yasa(
            M("tOyinniOch", til), YASHIL, web_app={"url": url},
        )]]},
    )


def bolimni_yubor(chat_id: int, til: str, yol: str, kalit: str) -> None:
    """
    Ilovaning bitta bo'limi haqida qisqa gap va uni ochadigan tugma.

    Uchta buyruq (`/duel`, `/maydon`, `/reyting`) shu bitta funksiyadan
    o'tadi: ular faqat matn va manzil bilan farq qiladi. Har biriga
    alohida funksiya yozilsa, ulardan biri albatta `ilovaSozlanmagan`
    holatini unutgan bo'lardi.

    Tugma TO'G'RIDAN-TO'G'RI kerakli ekranga olib boradi — bosh
    sahifaga emas: odam nima so'raganini aytdi, uni yana qidirishga
    majburlashning sababi yo'q.
    """
    url = ilova_url(yol)
    if not url:
        api("sendMessage", chat_id=chat_id, text=M("ilovaSozlanmagan", til))
        return
    api(
        "sendMessage",
        chat_id=chat_id,
        text=M(kalit, til),
        parse_mode="HTML",
        reply_markup={"inline_keyboard": [[tugma_yasa(
            M("tOchish", til), YASHIL, web_app={"url": url},
        )]]},
    )


def ilovani_yubor(chat_id: int, pupil: Pupil, yangi: bool) -> None:
    """Raqam qabul qilingandan keyin — kirish havolasi va Mini App tugmasi."""
    til = pupil.til or "uz"
    matn = M("raqamSaqlandi" if yangi else "raqamAllaqachon", til)

    havola = (
        f"{settings.SAYT_URL}/kirish/{kirish_kodi_yasa(pupil)}"
        if settings.SAYT_URL else ""
    )
    tugmalar = ilova_tugmalari(til, havola)

    # Eski "raqam yuborish" klaviaturasi o'rniga ASOSIY klaviatura
    # qaytariladi. Ilgari u shunchaki o'chirilardi va suhbat pastida
    # bo'shliq qolardi — odam raqamni bergandan keyin qayerga borishni
    # bilmay qolardi. Mini App sozlanmagan bo'lsa avvalgidek o'chadi.
    api("sendMessage", chat_id=chat_id, text=matn,
        reply_markup=asosiy_klaviatura(til) or {"remove_keyboard": True})

    if not tugmalar:
        api("sendMessage", chat_id=chat_id, text=M("ilovaSozlanmagan", til))
        return

    api(
        "sendMessage",
        chat_id=chat_id,
        text=M("ilovagaOtish", til, muddat=muddat_matni(til)),
        reply_markup={"inline_keyboard": tugmalar},
    )


def xabarni_yop(tg_id: str) -> None:
    """
    "Boshqa yozmang" — hisobga belgi qo'yiladi.

    Bloklashdan farqi bor va u muhim: bloklash — bizdan qochish, bu esa
    hurmat bilan so'ralgan iltimos. Shu sabab belgilangan hisobga hech
    qanday xabar bormaydi (na eslatma, na qaytarish), lekin bot odam
    o'zi yozsa avvalgidek javob beradi va hisob buzilmaydi.
    """
    Pupil.objects.filter(
        identities__provider=Identity.TELEGRAM,
        identities__external_id=tg_id,
        xabar_yopiq_at__isnull=True,
    ).update(xabar_yopiq_at=timezone.now())


def tugma_javobi(q: dict) -> str:
    """
    Inline tugma bosilganda (`callback_query`).

    Telegram HAR BOSISHGA javob kutadi: `answerCallbackQuery` yuborilmasa,
    tugma foydalanuvchining ekranida bir necha soniya "yuklanmoqda"
    holatida qotib qoladi va u tugmani buzuq deb o'ylaydi. Shu sabab
    javob eng birinchi ketadi, ish esa keyin bajariladi.
    """
    kim = q.get("from") or {}
    tg_id = str(kim.get("id") or "")
    data = str(q.get("data") or "")
    til = _til_top(tg_id, kim.get("language_code"))

    if data == "xabar_yopiq":
        xabarni_yop(tg_id)
        api("answerCallbackQuery", callback_query_id=q.get("id"))
        # Tugma ikkinchi marta bosilmasin: xabar ostidagi klaviatura
        # olib tashlanadi va o'rniga tasdiq matni yuboriladi.
        xabar = q.get("message") or {}
        if xabar.get("message_id"):
            api("editMessageReplyMarkup",
                chat_id=xabar["chat"]["id"], message_id=xabar["message_id"],
                reply_markup={"inline_keyboard": []})
            api("sendMessage", chat_id=xabar["chat"]["id"],
                text=M("xabarYopildi", til))
        return f"{tg_id}: xabarlar o'chirildi"

    if data == "kanal_tekshir":
        return kanal_tekshir_tugmasi(q, tg_id, til)

    if data.startswith(("quiz_ok:", "quiz_yoq:")):
        return quiz_namuna_tugmasi(q, tg_id, data)

    if data.startswith("premium_tarif:"):
        api("answerCallbackQuery", callback_query_id=q.get("id"))
        chat = ((q.get("message") or {}).get("chat") or {}).get("id") or int(tg_id)
        return premium_kartani_yubor(chat, tg_id, til, data.split(":", 1)[1])

    if data.startswith(("premium_ok:", "premium_rad:")):
        return premium_qaror_tugmasi(q, tg_id, data)

    api("answerCallbackQuery", callback_query_id=q.get("id"))
    return f"{tg_id}: noma'lum tugma ({data[:32]})"


#: Admin quiz namunasi tugmasi — natijaga qarab javob matni.
QUIZ_QAROR_MATNI = {
    "yuborildi": "✅ Kanalga yuborildi",
    "rad": "❌ Olib tashlandi",
    "eskirgan": "Bu namuna allaqachon hal qilingan",
    "ruxsat_yoq": "Faqat admin uchun",
    "xato": "Kanalga yuborilmadi — qayta bosib ko'ring",
}


def quiz_namuna_tugmasi(q: dict, tg_id: str, data: str) -> str:
    """ "✅ Kanalga" / "❌ Kerak emas" — `core/quiz_namuna.py`. """
    from core import quiz_namuna as QN
    natija = QN.qaror(data, tg_id)
    api("answerCallbackQuery", callback_query_id=q.get("id"),
        text=QUIZ_QAROR_MATNI[natija], show_alert=natija in ("ruxsat_yoq", "xato"))
    # Hal qilingan namunaning tugmalari o'rniga — natija (bosib bo'lmaydigan yozuv).
    xabar = q.get("message") or {}
    if natija in ("yuborildi", "rad", "eskirgan") and xabar.get("message_id"):
        api("editMessageReplyMarkup",
            chat_id=xabar["chat"]["id"], message_id=xabar["message_id"],
            reply_markup={"inline_keyboard": [[{"text": QUIZ_QAROR_MATNI[natija],
                                                "callback_data": "quiz_hal"}]]})
    return f"{tg_id}: quiz namuna — {natija}"


# ------------------------------------------------ imtihon premium
#
# `/start premium[_1oy|_3oy]` → tarif → karta raqami → chek RASMI →
# adminga rasm + "✅ Tasdiqlash" / "❌ Rad etish" (`core/premium.py`).
#
# Tanlangan tarif keshda 24 soat turadi: odam to'lovni bank ilovasida
# qilib, chekni keyinroq yuboradi. Tarif tanlanmagan bo'lsa kelgan rasm
# oddiy rasm — bot unga "chek qabul qilindi" demaydi.

PREMIUM_KESH = 24 * 3600


def _som(n: int) -> str:
    return f"{n:,}".replace(",", " ")


def premium_boshla(chat_id: int, tg_id: str, til: str, matn: str) -> str:
    from core import premium as PR

    if not settings.PREMIUM_KARTA:
        api("sendMessage", chat_id=chat_id, text=M("premiumYopiq", til))
        return f"{tg_id}: premium — karta sozlanmagan"
    if PR.pupil_tg(tg_id) is None:
        api("sendMessage", chat_id=chat_id, text=M("premiumHisobYoq", til))
        return f"{tg_id}: premium — hisob yo'q"
    # Ilovadagi tarif tugmasi tarifni o'zi aytadi: `premium_3oy`.
    tarif = matn.split("premium", 1)[1].lstrip("_").strip() if "premium" in matn else ""
    if tarif in PR.TARIF_KUN:
        return premium_kartani_yubor(chat_id, tg_id, til, tarif)
    narx = PR.narxlar()
    pupil = PR.pupil_tg(tg_id)
    # Faol bo'lsa — avval qancha qolgani (soatlari bilan), keyin uzaytirish.
    if PR.faolmi(pupil):
        api("sendMessage", chat_id=chat_id, parse_mode="HTML",
            text=M("premiumHolat", til, qolgan=PR.qolgan_matn(pupil.premium_gacha, til),
                   gacha=timezone.localtime(pupil.premium_gacha).strftime("%d.%m.%Y %H:%M")))
    qatorlar = [
        [tugma_yasa(M("tPremium7kun", til, narx=_som(narx["7kun"])), KOK,
                    callback_data="premium_tarif:7kun")],
        [tugma_yasa(M("tPremium1oy", til, narx=_som(narx["1oy"])), YASHIL,
                    callback_data="premium_tarif:1oy")],
    ]
    if PR.admin_havola():
        qatorlar.append([tugma_yasa(M("tAdminAloqa", til), "", url=PR.admin_havola())])
    api("sendMessage", chat_id=chat_id, parse_mode="HTML",
        text=M("premiumTariflar", til, narx7=_som(narx["7kun"]), narx1=_som(narx["1oy"])),
        reply_markup={"inline_keyboard": qatorlar})
    return f"{tg_id}: premium — tariflar"


def premium_kartani_yubor(chat_id: int, tg_id: str, til: str, tarif: str) -> str:
    from django.core.cache import cache
    from core import premium as PR

    if tarif not in PR.TARIF_KUN or not settings.PREMIUM_KARTA:
        return f"{tg_id}: premium — noto'g'ri tarif"
    cache.set(f"premium_tarif:{tg_id}", tarif, PREMIUM_KESH)
    egasi = settings.PREMIUM_KARTA_EGASI
    api("sendMessage", chat_id=chat_id, parse_mode="HTML",
        text=M("premiumKarta", til, tarif=PR.tarif_nomi(tarif, til),
               narx=_som(PR.narxlar()[tarif]), karta=html.escape(settings.PREMIUM_KARTA),
               egasi=f"👤 {html.escape(egasi)}" if egasi else ""),
        reply_markup={"inline_keyboard": [[tugma_yasa(M("tAdminAloqa", til), "", url=PR.admin_havola())]]}
        if PR.admin_havola() else None)
    return f"{tg_id}: premium — karta ({tarif})"


def premium_chek(chat_id: int, tg_id: str, til: str, file_id: str) -> str | None:
    """
    Chek rasmi. Tarif tanlanmagan bo'lsa `None` — rasm boshqa narsa
    bo'lishi mumkin va u pastdagi umumiy javobga tushadi.
    """
    from django.core.cache import cache
    from core import premium as PR

    tarif = cache.get(f"premium_tarif:{tg_id}")
    if not tarif:
        return None
    pupil = PR.pupil_tg(tg_id)
    if pupil is None:
        api("sendMessage", chat_id=chat_id, text=M("premiumHisobYoq", til))
        return f"{tg_id}: premium chek — hisob yo'q"
    try:
        t = PR.tolov_yoz(pupil, tarif, file_id)
    except PR.ChekXato:
        api("sendMessage", chat_id=chat_id, text=M("premiumKop", til))
        return f"{tg_id}: premium chek — kutilayotgan ko'p"
    cache.delete(f"premium_tarif:{tg_id}")
    api("sendMessage", chat_id=chat_id, text=M("premiumChekOlindi", til))
    for admin in settings.ADMIN_TG:
        api("sendPhoto", chat_id=admin, photo=file_id, caption=PR.admin_izohi(t),
            parse_mode="HTML", reply_markup=PR.admin_tugmalari(t))
    return f"{tg_id}: premium chek #{t.pk} ({tarif})"


#: Admin bosgandan keyin tugmalar o'rnida qoladigan yozuv.
PREMIUM_QAROR_MATNI = {
    "tasdiqlandi": "✅ Tasdiqlangan",
    "rad": "❌ Rad etilgan",
    "yoq": "To'lov topilmadi",
    "ruxsat_yoq": "Faqat admin uchun",
}


def premium_qaror_tugmasi(q: dict, tg_id: str, data: str) -> str:
    """
    "✅ Tasdiqlash" / "❌ Rad etish". Ikkinchi bosish (yoki ikkinchi admin)
    hech narsani o'zgartirmaydi — `premium.hal_qil` holatni qulf ostida
    tekshiradi — faqat haqiqiy holatni ko'rsatadi.
    """
    from core import premium as PR

    if not boshqaruv.admin_tg_mi(tg_id):
        api("answerCallbackQuery", callback_query_id=q.get("id"),
            text=PREMIUM_QAROR_MATNI["ruxsat_yoq"], show_alert=True)
        return f"{tg_id}: premium qaror — admin emas"
    tur, _, xom = data.partition(":")
    if not xom.isdigit():
        api("answerCallbackQuery", callback_query_id=q.get("id"))
        return f"{tg_id}: premium qaror — buzuq"
    natija, t = PR.hal_qil(int(xom), tasdiq=tur == "premium_ok")
    if natija in ("tasdiqlandi", "rad"):
        PR.foydalanuvchiga_xabar(t)
    holat = t.holat if t else "yoq"
    yozuv = PREMIUM_QAROR_MATNI[holat]
    if natija == "eskirgan":
        yozuv = f"Allaqachon: {yozuv}"
    api("answerCallbackQuery", callback_query_id=q.get("id"), text=yozuv,
        show_alert=natija in ("eskirgan", "yoq"))
    xabar = q.get("message") or {}
    if xabar.get("message_id") and t:
        api("editMessageReplyMarkup", chat_id=xabar["chat"]["id"], message_id=xabar["message_id"],
            reply_markup={"inline_keyboard": [[{"text": PREMIUM_QAROR_MATNI[holat],
                                                "callback_data": "premium_hal"}]]})
    return f"{tg_id}: premium #{xom} — {natija}"


# ------------------------------------------------ majburiy kanal a'zoligi

def kanal_shartini_yubor(chat_id: int, tg_id: str, til: str, matn: str) -> str:
    """
    A'zo bo'lmagan odamga "kanalga a'zo bo'ling" xabari.

    U yozgan buyruq (masalan `/start duel_ab12`) eslab qolinadi: a'zolik
    tasdiqlangach xuddi shu buyruq bajariladi va odam kelgan joyiga
    tushadi, qaytadan havolani izlamaydi.
    """
    from django.core.cache import cache
    from core import kanal as K
    from core import osish as O
    O.bot_hodisa(O.BotHodisa.KANAL_SHART, kim=tg_id)
    cache.set(f"kanal_kutilgan:{tg_id}", matn or "/start", 3600)
    api("sendMessage", chat_id=chat_id, text=M("kanalShart", til), parse_mode="HTML",
        reply_markup={"inline_keyboard": [
            [tugma_yasa(M("tKanalgaOtish", til), KOK, url=K.havola())],
            [tugma_yasa(M("tAzoBoldim", til), YASHIL, callback_data="kanal_tekshir")],
        ]})
    return f"{tg_id}: kanal sharti ko'rsatildi"


def kanal_tekshir_tugmasi(q: dict, tg_id: str, til: str) -> str:
    """ "A'zo bo'ldim" — Telegram'dan KESHSIZ qayta so'raladi. """
    from django.core.cache import cache
    from core import kanal as K
    natija = K.azo_mi(tg_id)
    if natija is False:
        api("answerCallbackQuery", callback_query_id=q.get("id"),
            text=M("kanalHaliYoq", til), show_alert=True)
        return f"{tg_id}: hali a'zo emas"
    api("answerCallbackQuery", callback_query_id=q.get("id"), text=M("kanalRahmat", til))
    from core import osish as O
    O.bot_hodisa(O.BotHodisa.KANAL_OTDI, kim=tg_id)
    cache.set(f"kanal_azo:{tg_id}", 1, 12 * 3600)
    Pupil.objects.filter(
        identities__provider=Identity.TELEGRAM, identities__external_id=tg_id,
    ).update(kanal_azo_at=timezone.now())
    xabar = q.get("message") or {}
    if xabar.get("message_id"):
        api("deleteMessage", chat_id=xabar["chat"]["id"], message_id=xabar["message_id"])
    kutilgan = cache.get(f"kanal_kutilgan:{tg_id}") or "/start"
    cache.delete(f"kanal_kutilgan:{tg_id}")
    return yangilikni_qayta_ishla({"message": {
        "chat": {"id": (xabar.get("chat") or {}).get("id") or int(tg_id)},
        "from": q.get("from") or {"id": int(tg_id)},
        "text": kutilgan,
    }})


def yangilikni_qayta_ishla(u: dict) -> str:
    """
    Bitta yangilik. Nima qilinganini qisqa satr qilib qaytaradi (jurnalga).

    Webhook'ga o'tilsa ham AYNAN shu funksiya chaqiriladi — polling
    mantiqidan mustaqil.
    """
    # Inline tugma bosilishi — alohida tur, `message` emas.
    if u.get("callback_query"):
        return tugma_javobi(u["callback_query"])

    xabar = u.get("message") or u.get("edited_message")
    if not xabar:
        return ""

    chat_id = xabar["chat"]["id"]
    kim = xabar.get("from") or {}
    tg_id = str(kim.get("id") or "")
    # Telegram ismi bezakli bo'lishi mumkin (`꧁❖DAVRONOV❖꧂`) — bazaga
    # tozalangan holda tushadi, aks holda reyting o'sha bezakni ko'rsatardi.
    ism, familiya = tg_ismi(kim)
    # Telegram interfeysi tili — YANGI hisob uchun yagona ishora. Mavjud
    # hisobda ilovada tanlangan til ustun turadi (`salom_yubor`).
    til = _til_top(tg_id, kim.get("language_code"))

    # --- kontakt keldi ---
    kontakt = xabar.get("contact")
    if kontakt:
        # Boshqa odamning vizitkasini yuborish mumkin. Faqat O'ZINIKI qabul
        # qilinadi, aks holda birov begona raqamni bog'lab qo'yardi.
        if str(kontakt.get("user_id") or "") != tg_id:
            api("sendMessage", chat_id=chat_id, text=M("begonaKontakt", til))
            return f"{tg_id}: begona kontakt rad etildi"

        telefon = raqamni_tozala(kontakt.get("phone_number", ""))
        if not telefon:
            api("sendMessage", chat_id=chat_id, text=M("raqamOqilmadi", til))
            return f"{tg_id}: raqam bo'sh"

        pupil, yangi = raqamni_bogla(tg_id, telefon, ism, familiya, til)
        ilovani_yubor(chat_id, pupil, yangi)
        return f"{tg_id}: raqam bog'landi (hisob #{pupil.pk})"

    # --- rasm keldi: Premium cheki bo'lishi mumkin ---
    # Rasm yoki rasm-fayl (ba'zilar chekni "fayl" qilib yuboradi). Eng
    # katta o'lchamdagisi olinadi — admin raqamlarni o'qiy olsin.
    rasm = xabar.get("photo") or []
    hujjat = xabar.get("document") or {}
    file_id = (rasm[-1].get("file_id") if rasm
               else hujjat.get("file_id") if str(hujjat.get("mime_type", "")).startswith("image/")
               else "")
    if file_id:
        javob = premium_chek(chat_id, tg_id, til, file_id)
        if javob:
            return javob

    # --- matn keldi ---
    matn = (xabar.get("text") or "").strip()

    # Voronkaning birinchi qadami — kanal shartidan OLDIN sanaladi:
    # shart ko'rsatilgandan keyin sanalsa, u yerda ketganlar ko'rinmasdi.
    if matn.startswith("/start"):
        from core import osish as O
        O.bot_hodisa(O.BotHodisa.START, O.start_manbasi(matn), kim=tg_id)

    # Majburiy kanal a'zoligi — ilovaga olib boradigan har qanday yo'ldan
    # OLDIN. Administratorlar (boshqaruv paneli) tekshirilmaydi.
    from core import kanal as K
    if (matn and not str(tg_id) in {str(x) for x in getattr(settings, "ADMIN_TG", [])}
            and not K.bot_otkazadimi(tg_id)):
        return kanal_shartini_yubor(chat_id, tg_id, til, matn)
    # Chaqiruv havolasi: `/start duel_<kod>`.
    #
    # Javob INLINE tugma bilan ketadi va bu ataylab: reply-klaviatura
    # tugmasidan ochilgan Mini App `initData` OLMAYDI (Telegram
    # hujjati), ya'ni ilova odamni tanimaydi va duel o'ynab bo'lmaydi.
    # Inline tugma esa to'liq `initData` beradi.
    if matn.startswith("/start duel_"):
        kod = matn.split("duel_", 1)[1].strip()[:16]
        if kod.replace("-", "").replace("_", "").isalnum():
            bolimni_yubor(chat_id, til, f"/duel/{kod}", "duelChaqiruvBot")
            return f"{tg_id}: chaqiruv havolasi ({kod})"

    # Jamoaviy o'yin xonasi: `/start xona_<kod>` — "Do'stlarni chaqirish"
    # tugmasi yuboradigan havola. Kod faqat raqam.
    if matn.startswith("/start xona_"):
        kod = matn.split("xona_", 1)[1].strip()[:8]
        if kod.isdigit():
            bolimni_yubor(chat_id, til, f"/xona/{kod}", "xonaChaqiruvBot")
            return f"{tg_id}: xona havolasi ({kod})"

    # `/start masala_<id>` va `/start masalalar` — ZAXIRA yo'l.
    #
    # Kanal tugmalari hozir `?startapp=` bilan ilovani BIR bosishda
    # ochadi (`masala_kanal.havola`, `test_toplam`): botda "Main Mini
    # App" yoqilgan. U o'chirilsa Telegram `BOT_INVALID` beradi — bir
    # marta shunday bo'lgan. O'shanda `?start=` havolalari (eski postlar,
    # duel ulashish havolasi `duel.havola`) shu yerga tushadi va bot
    # ilovani ochadigan tugma yuboradi. Yon foydasi: bu yo'l bilan kelgan
    # odam bot bilan SUHBAT ochadi va unga keyin eslatma yuborish mumkin.
    if matn.startswith("/start masala_"):
        # `-k` (kanal belgisi) raqamdan ajratiladi.
        xom = matn.split("masala_", 1)[1].strip()[:12].split("-")[0]
        if xom.isdigit() and int(xom) > 0:
            bolimni_yubor(chat_id, til, f"/masalalar/{int(xom)}", "masalaBot")
            return f"{tg_id}: masala havolasi (#{int(xom)})"

    # Test to'plami posti: `/start test_<id>` va `/start testlar`.
    # `?start=` zaxira yo'li — sababi yuqoridagi masala izohida.
    if matn.startswith("/start test_"):
        xom = matn.split("test_", 1)[1].strip()[:12].split("-")[0]
        if xom.isdigit() and int(xom) > 0:
            bolimni_yubor(chat_id, til, f"/toplam/{int(xom)}", "toplamBot")
            return f"{tg_id}: test to'plami havolasi (#{int(xom)})"

    # Kunlik son natijasi ulashilganda: `/start kunlik`.
    if matn.startswith("/start kunlik"):
        bolimni_yubor(chat_id, til, "/oyinlar/kunlik-son", "kunlikSonBot")
        return f"{tg_id}: kunlik son havolasi"

    # Karvon yo'li ulashilganda: `/start karvon`.
    if matn.startswith("/start karvon"):
        bolimni_yubor(chat_id, til, "/oyinlar/karvon", "karvonBot")
        return f"{tg_id}: karvon yo'li havolasi"

    if matn.startswith("/start testlar"):
        bolimni_yubor(chat_id, til, "/testlar", "testlarBot")
        return f"{tg_id}: testlar bo'limi"

    if matn.startswith("/start masalalar"):
        bolimni_yubor(chat_id, til, "/masalalar", "masalalarBot")
        return f"{tg_id}: masalalar bo'limi"

    # DTM va milliy sertifikat — ulashilgan reyting yoki kanal posti.
    # `/start dtm_reyting` kabi davomi bo'lsa ham shu bo'lim ochiladi.
    if matn.startswith("/start dtm"):
        bolimni_yubor(chat_id, til, DTM_YOLI, "dtmHaqida")
        return f"{tg_id}: DTM havolasi"

    if matn.startswith("/start sertifikat"):
        bolimni_yubor(chat_id, til, SERTIFIKAT_YOLI, "sertifikatHaqida")
        return f"{tg_id}: sertifikat havolasi"

    # Reklama roliklarining tugmalari (`rolik_post`). Ilgari bu
    # parametrlar BU YERDA YO'Q edi va tugma odamni bo'limga emas,
    # ilovaning boshiga olib borardi: rolikda ko'rgan narsasini u
    # yana o'zi qidirishga majbur bo'lardi.
    if matn.startswith("/start kichkintoy"):
        bolimni_yubor(chat_id, til, "/kichkintoy", "kichkintoyBot")
        return f"{tg_id}: kichkintoylar bo'limi"

    if matn.startswith("/start oyinlar"):
        bolimni_yubor(chat_id, til, "/oyinlar", "oyinlarBot")
        return f"{tg_id}: o'yinlar bo'limi"

    if matn.startswith("/start qabul"):
        bolimni_yubor(chat_id, til, "/qabul", "qabulBot")
        return f"{tg_id}: qabul (prezident maktabi) havolasi"

    if matn.startswith("/start mantiq"):
        bolimni_yubor(chat_id, til, "/mantiq", "mantiqBot")
        return f"{tg_id}: mantiq bo'limi"

    # `sinf_<kod>` dan OLDIN tekshirilmaydi: pastdagi shart aniqroq.
    if matn.startswith("/start sinflar"):
        bolimni_yubor(chat_id, til, "/sinflar", "sinflarBot")
        return f"{tg_id}: sinflar bo'limi"

    # DTM marafoni — kanaldagi e'lon tugmasi (`core/marafon.py`).
    if matn.startswith("/start marafon"):
        bolimni_yubor(chat_id, til, "/marafon", "marafonHaqida")
        return f"{tg_id}: marafon havolasi"

    # O'qituvchi bergan sinf kodi: `/start sinf_ABC234` (`core/sinf.py`).
    if matn.startswith("/start sinf_"):
        kod = matn.split("sinf_", 1)[1].strip()[:8].upper()
        if kod.isalnum():
            bolimni_yubor(chat_id, til, f"/sinf/qoshil/{kod}", "sinfBot")
            return f"{tg_id}: sinf kodi ({kod})"

    # Imtihon Premium — ilovadagi "To'ladim — chekni yuborish" tugmasi.
    if matn.startswith("/start premium"):
        return premium_boshla(chat_id, tg_id, til, matn)

    if matn.startswith("/start"):
        # Odam o'zi yozdi — demak xabarlarga qarshi emas. "Boshqa
        # yozmang" belgisi olib tashlanadi, aks holda u eslatmalardan
        # abadiy chetda qolardi va buni tushuntiradigan joy yo'q.
        Pupil.objects.filter(
            identities__provider=Identity.TELEGRAM,
            identities__external_id=tg_id,
            xabar_yopiq_at__isnull=False,
        ).update(xabar_yopiq_at=None)

        # Taklif havolasi (`/start ref_12[_dtm]`, `core/taklif.py`): hisob
        # shu /start da YARATILSA — taklif qilganga bog'lanadi va u darhol
        # xabar oladi. Mavjud odam birovning havolasini bossa sanalmaydi.
        from core import taklif as TK
        taklifchi_pk, bolim = TK.ajrat(matn)
        yangi = taklifchi_pk is not None and not Identity.objects.filter(
            provider=Identity.TELEGRAM, external_id=tg_id).exists()
        javob = salom_yubor(chat_id, tg_id, ism, familiya, til)
        if yangi:
            kirish = Identity.objects.filter(provider=Identity.TELEGRAM, external_id=tg_id).first()
            taklifchi = TK.boglash(kirish.pupil, taklifchi_pk) if kirish else None
            if taklifchi:
                TK.taklifchiga_xabar(taklifchi, kirish.pupil)
                javob += f" · taklif: #{taklifchi.pk}"
        # Kartadagi "Men ham ishlayman" — kelgan odam o'sha bo'limga tushsin.
        if bolim == "dtm":
            bolimni_yubor(chat_id, til, DTM_YOLI, "dtmHaqida")
        elif bolim == "sertifikat":
            bolimni_yubor(chat_id, til, SERTIFIKAT_YOLI, "sertifikatHaqida")
        return javob

    # Doimiy klaviatura tugmasi bosilgan bo'lishi mumkin. Tugma oddiy
    # MATN yuboradi, shuning uchun uni buyruqlardan oldin taniymiz —
    # aks holda u pastdagi "tushunmadim" javobiga tushib ketardi.
    #
    # Tanish BARCHA tilda bo'ladi (`barcha`): Telegram allaqachon
    # yuborilgan klaviaturani o'zi yangilamaydi, ya'ni tilini
    # almashtirgan odamning ekranida eski tildagi tugma qolib ketishi
    # mumkin va u ham ishlashi kerak.
    # Ilovaga olib boradigan hamma yo'l bitta darvozadan o'tadi.
    # Tekshiruv SHU YERDA, har bir yuboruvchi funksiyada emas: ular
    # to'rtta va biriga qo'shishni unutsak, darvozada teshik qolardi.
    if raqami_yoq(tg_id) and (
        matn.startswith(("/oyinlar", "/duel", "/maydon", "/reyting", "/dtm", "/sertifikat", "/masalalar"))
        or matn in barcha("tOyinlar")
    ):
        raqam_sora(chat_id, M("raqamNegaKerak", til), til)
        return f"{tg_id}: raqam so'raldi (ilovaga kirish uchun)"

    if matn in barcha("tIlova"):
        bolimni_yubor(chat_id, til, "", "darslarHaqida")
        return f"{tg_id}: darslar"

    if matn.startswith("/oyinlar") or matn in barcha("tOyinlar"):
        oyinlarni_yubor(chat_id, til)
        return f"{tg_id}: o'yinlar"

    if matn in barcha("tDuel"):
        bolimni_yubor(chat_id, til, DUEL_YOLI, "duelHaqida")
        return f"{tg_id}: duel tugmasi"

    if matn in barcha("tMaydon"):
        bolimni_yubor(chat_id, til, MAYDON_YOLI, "maydonHaqida")
        return f"{tg_id}: maydon tugmasi"

    if matn in barcha("tReyting"):
        bolimni_yubor(chat_id, til, REYTING_YOLI, "reytingHaqida")
        return f"{tg_id}: reyting tugmasi"

    if matn.startswith("/duel"):
        bolimni_yubor(chat_id, til, DUEL_YOLI, "duelHaqida")
        return f"{tg_id}: /duel"

    if matn.startswith("/maydon"):
        bolimni_yubor(chat_id, til, MAYDON_YOLI, "maydonHaqida")
        return f"{tg_id}: /maydon"

    if matn.startswith("/reyting"):
        bolimni_yubor(chat_id, til, REYTING_YOLI, "reytingHaqida")
        return f"{tg_id}: /reyting"

    if matn.startswith("/dtm") or matn in barcha("tDtm"):
        bolimni_yubor(chat_id, til, DTM_YOLI, "dtmHaqida")
        return f"{tg_id}: /dtm"

    if matn.startswith("/sertifikat"):
        bolimni_yubor(chat_id, til, SERTIFIKAT_YOLI, "sertifikatHaqida")
        return f"{tg_id}: /sertifikat"

    if matn.startswith("/marafon"):
        bolimni_yubor(chat_id, til, "/marafon", "marafonHaqida")
        return f"{tg_id}: /marafon"

    # Imtihon Premium — holat (qancha qoldi) va tariflar.
    if matn.startswith("/premium"):
        return premium_boshla(chat_id, tg_id, til, "/start premium")

    if matn.startswith("/masalalar") or matn in barcha("tMasalalar"):
        bolimni_yubor(chat_id, til, MASALALAR_YOLI, "masalalarBot")
        return f"{tg_id}: /masalalar"

    if matn in barcha("tRaqamTugma"):
        raqam_sora(chat_id, M("raqamSora", til), til)
        return f"{tg_id}: raqam tugmasi"

    if matn in barcha("tYordamTugma"):
        api("sendMessage", chat_id=chat_id, text=M("yordam", til))
        return f"{tg_id}: yordam tugmasi"

    # Raqam endi majburiy emas — kirish havola orqali bo'ladi. Lekin u
    # hisobni tiklashda va eslatma yuborishda kerak, shuning uchun alohida
    # buyruq bo'lib qoladi.
    if matn.startswith("/raqam"):
        raqam_sora(chat_id, M("raqamSora", til), til)
        return f"{tg_id}: /raqam"

    # Boshqaruv paneli — faqat administratorlarga.
    #
    # Javob ikki xil bo'lishi SHART emas: begona odamga "sen admin emassan"
    # deb aytish o'zi ma'lumot beradi (demak bunday panel bor). Shuning
    # uchun ro'yxatda bo'lmagan odam boshqa noma'lum buyruq bilan bir xil
    # javob oladi — pastdagi umumiy javob.
    if matn.startswith("/boshqaruv") and boshqaruv.admin_tg_mi(tg_id):
        if not settings.SAYT_URL:
            api("sendMessage", chat_id=chat_id,
                text="SAYT_URL sozlanmagan — havola yasab bo'lmaydi.")
            return f"{tg_id}: /boshqaruv — SAYT_URL yo'q"
        api("sendMessage", chat_id=chat_id,
            text="🔐 <b>Boshqaruv paneli</b>\n\nHavola 10 daqiqa amal qiladi.",
            parse_mode="HTML",
            # Ko'k — bu ish quroli, bolaga mo'ljallangan asosiy harakat
            # emas. Yashil faqat foydalanuvchi yo'lida ishlatiladi.
            reply_markup={"inline_keyboard": [[
                tugma_yasa("📊 Panelni ochish", KOK,
                           url=boshqaruv.havola_yasa(tg_id)),
            ]]})
        return f"{tg_id}: /boshqaruv — havola yuborildi"

    # Haftalik o'sish hisoboti — istalgan payt, faqat adminga (`core/osish.py`).
    if matn.startswith("/osish") and boshqaruv.admin_tg_mi(tg_id):
        from core import osish as O
        api("sendMessage", chat_id=chat_id, text=O.hisobot_matni(), parse_mode="HTML",
            link_preview_options={"is_disabled": True})
        return f"{tg_id}: /osish — hisobot yuborildi"

    if matn.startswith("/help"):
        yordam = M("yordam", til)
        if boshqaruv.admin_tg_mi(tg_id):
            yordam += M("yordamAdmin", til)
        api("sendMessage", chat_id=chat_id, text=yordam)
        return f"{tg_id}: /help"

    # Boshqa har qanday xabar — yo'naltiramiz.
    #
    # Klaviatura shu yerda ham QAYTA yuboriladi. Sabab: bu yangilikdan
    # oldin botdan foydalangan odamlarda u umuman yo'q va ular /start ni
    # boshqa hech qachon yozmasligi mumkin. Endi esa istalgan xabar
    # ularga tugmalarni qaytaradi.
    #
    # LEKIN raqami yo'q odamga BERILMAYDI. Klaviatura tugmalari endi
    # ilovani o'zi ochadi va bot ular haqida hech qanday xabar olmaydi —
    # ya'ni "raqamni so'rash" darvozasi tugma bosilgandan KEYIN ishlay
    # olmaydi. Yagona joy — klaviaturaning o'zini bermaslik.
    if raqami_yoq(tg_id):
        raqam_sora(chat_id, M("raqamNegaKerak", til), til)
        return f"{tg_id}: boshqa xabar — raqam so'raldi"

    klaviatura = asosiy_klaviatura(til)
    api("sendMessage", chat_id=chat_id,
        text=M("boshlaTugma" if klaviatura else "boshlaStart", til),
        reply_markup=klaviatura or None)
    return f"{tg_id}: boshqa xabar"


#: "/" tugmasi ostidagi ro'yxat — klaviatura tartibida. `/maydon` ro'yxatdan
#: chiqdi (klaviaturadan ham), lekin buyruq sifatida ishlayveradi.
BUYRUQLAR = (
    ("start", "buyruqStart"),
    ("dtm", "buyruqDtm"),
    ("sertifikat", "buyruqSertifikat"),
    ("premium", "buyruqPremium"),
    ("masalalar", "buyruqMasalalar"),
    ("oyinlar", "buyruqOyinlar"),
    ("duel", "buyruqDuel"),
    ("reyting", "buyruqReyting"),
    ("raqam", "buyruqRaqam"),
    ("help", "buyruqYordam"),
)


def buyruqlarni_ornat() -> None:
    """
    Telegram'dagi buyruqlar ro'yxatini o'rnatadi (`setMyCommands`).

    NEGA KERAK. Ro'yxat o'rnatilmagunicha kiritish maydonidagi "/"
    tugmasi BO'SH ro'yxat ko'rsatadi — ya'ni bot nima qila olishini
    faqat taxmin qilib topish mumkin edi.

    Har til uchun ALOHIDA yuboriladi (`language_code`), ustiga
    tilsiz nusxa ham qo'yiladi: uchinchi tilda telefon ishlatadigan
    odam o'zbekchasini ko'radi — loyihaning asosiy tili.

    Bot ishga tushganda BIR MARTA chaqiriladi: ro'yxat Telegram
    tomonida saqlanadi va har xabarda qayta yuborish keraksiz.
    """
    for til in TILLAR:
        api(
            "setMyCommands",
            commands=[{"command": c, "description": M(k, til)} for c, k in BUYRUQLAR],
            language_code=til,
        )
    api(
        "setMyCommands",
        commands=[{"command": c, "description": M(k)} for c, k in BUYRUQLAR],
    )


class Command(BaseCommand):
    help = "Aql Zone Telegram boti (long polling)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--bir", action="store_true",
            help="bitta o'qish va chiqish (sinov uchun)",
        )

    def handle(self, *args, **o):
        if not settings.BOT_TOKEN:
            raise CommandError("BOT_TOKEN sozlanmagan (backend/.env)")

        kim = api("getMe")
        if not kim.get("ok"):
            raise CommandError(f"Telegram javob bermadi: {kim.get('xato', kim)}")
        nom = kim["result"].get("username", "?")
        self.stdout.write(self.style.SUCCESS(f"bot @{nom} ishga tushdi"))
        if not settings.SAYT_URL:
            self.stdout.write(self.style.WARNING(
                "diqqat: SAYT_URL bo'sh — «Saytga kirish» havolasi yasalmaydi, "
                "bot faqat raqam so'raydi"
            ))
        if not settings.MINI_APP_URL:
            self.stdout.write(self.style.WARNING(
                "diqqat: MINI_APP_URL bo'sh — Mini App tugmasi va doimiy "
                "klaviatura ko'rsatilmaydi"
            ))

        # Buyruqlar ro'yxati — bir marta, ishga tushishda. Telegram uni
        # o'zida saqlaydi, shuning uchun har xabarda takrorlash keraksiz.
        buyruqlarni_ornat()

        # Oxirgi ishlangan yangilik. Telegram shundan keyingilarini beradi,
        # ya'ni bir xabar ikki marta qayta ishlanmaydi.
        oxirgi = 0
        while True:
            j = api("getUpdates", offset=oxirgi + 1, timeout=KUTISH)
            if not j.get("ok"):
                self.stderr.write(f"xato: {j.get('xato', j)}")
                if o["bir"]:
                    return
                time.sleep(QAYTA_URINISH)
                continue

            for u in j.get("result", []):
                oxirgi = max(oxirgi, u["update_id"])
                try:
                    izoh = yangilikni_qayta_ishla(u)
                except Exception as e:
                    # Bitta xabardagi xato butun botni to'xtatmasligi kerak.
                    self.stderr.write(f"yangilik #{u['update_id']} xato: {e}")
                    continue
                if izoh:
                    self.stdout.write(f"  {izoh}")

            if o["bir"]:
                self.stdout.write("--bir: chiqildi")
                return
