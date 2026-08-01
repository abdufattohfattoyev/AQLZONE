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

    Ikkita tugma to'g'ridan-to'g'ri ILOVANI ochadi (`web_app`), ya'ni
    ular xabar yubormaydi — bosilishi bilan darslar yoki o'yinlar
    ochiladi. Qolgan ikkitasi oddiy matn yuboradi va uni bot tanib oladi.

    `is_persistent` — klaviatura yopilib qolmasin: aks holda odam uni
    bir marta yashirsa, boshqa hech qachon topolmaydi.

    `MINI_APP_URL` sozlanmagan bo'lsa (lokal ishlab chiqish) klaviatura
    UMUMAN chizilmaydi: yarim ishlaydigan tugmalar — yo'qidan yomonroq.
    """
    if not ilova_url():
        return None
    return {
        "keyboard": [
            # Birinchi qator — ENG KENG va eng ko'p bosiladigani.
            [tugma_yasa(M("tIlova", til), YASHIL, web_app={"url": ilova_url()})],
            # Ikkinchi qator — ikki kishilik va kunlik: ular bugun
            # ochilishi kerak bo'lgan narsalar.
            [
                tugma_yasa(M("tDuel", til), KOK, web_app={"url": ilova_url(DUEL_YOLI)}),
                tugma_yasa(M("tMaydon", til), KOK, web_app={"url": ilova_url(MAYDON_YOLI)}),
            ],
            # Uchinchi qator — kamroq kerak bo'ladiganlari.
            [
                tugma_yasa(M("tOyinlar", til), KOK, web_app={"url": ilova_url(OYIN_YOLI)}),
                tugma_yasa(M("tReyting", til), KOK, web_app={"url": ilova_url(REYTING_YOLI)}),
            ],
            # To'rtinchi qator — ilovani OCHMAYDIGAN yagona tugma.
            #
            # "Raqam" bu yerdan OLIB TASHLANDI: raqam bir marta beriladi
            # va undan keyin bu tugma hech qachon kerak bo'lmaydi, lekin
            # ekranning sakkizdan birini egallab turardi. U hamon
            # `/raqam` buyrug'i bo'lib qoladi — ya'ni kerak bo'lganda
            # topiladi, lekin yo'lda turmaydi.
            #
            # "Yordam" QIZIL: u ilovaga olib bormaydi, balki ishlar
            # yurishmaganda bosiladi. Rang uni qolganidan ajratib turadi
            # va chalg'igan odam uni ko'zi bilan darrov topadi.
            [tugma_yasa(M("tYordamTugma", til), QIZIL)],
        ],
        "resize_keyboard": True,
        "is_persistent": True,
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

    # BITTA xabar. Ilgari ikkita edi va sabab texnik: bitta xabarda yo
    # doimiy klaviatura, yo inline tugmalar bo'ladi — ikkalasi birga
    # bo'lmaydi. Endi inline tugma KERAK EMAS: u ilovani ochardi,
    # klaviaturaning birinchi tugmasi esa aynan shu ishni qiladi. Ikki
    # xabar va ikkita bir xil tugma — takrorning eng ochiq turi.
    if klaviatura:
        api("sendMessage", chat_id=chat_id,
            text=salom + M("pastdagiTugma", til),
            parse_mode="HTML", reply_markup=klaviatura)
    else:
        # Mini App sozlanmagan — klaviatura ham yo'q. Bunday paytda
        # yagona yo'l sayt havolasi bo'lib qoladi.
        api("sendMessage", chat_id=chat_id,
            text=salom + M("tugmaniBos", til, muddat=muddat_matni(til)),
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

    api("answerCallbackQuery", callback_query_id=q.get("id"))
    return f"{tg_id}: noma'lum tugma ({data[:32]})"


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

    # --- matn keldi ---
    matn = (xabar.get("text") or "").strip()
    if matn.startswith("/start"):
        # Odam o'zi yozdi — demak xabarlarga qarshi emas. "Boshqa
        # yozmang" belgisi olib tashlanadi, aks holda u eslatmalardan
        # abadiy chetda qolardi va buni tushuntiradigan joy yo'q.
        Pupil.objects.filter(
            identities__provider=Identity.TELEGRAM,
            identities__external_id=tg_id,
            xabar_yopiq_at__isnull=False,
        ).update(xabar_yopiq_at=None)
        return salom_yubor(chat_id, tg_id, ism, familiya, til)

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
        matn.startswith(("/oyinlar", "/duel", "/maydon", "/reyting"))
        or matn in barcha("tOyinlar")
    ):
        raqam_sora(chat_id, M("raqamNegaKerak", til), til)
        return f"{tg_id}: raqam so'raldi (ilovaga kirish uchun)"

    if matn.startswith("/oyinlar") or matn in barcha("tOyinlar"):
        oyinlarni_yubor(chat_id, til)
        return f"{tg_id}: o'yinlar"

    if matn.startswith("/duel"):
        bolimni_yubor(chat_id, til, DUEL_YOLI, "duelHaqida")
        return f"{tg_id}: /duel"

    if matn.startswith("/maydon"):
        bolimni_yubor(chat_id, til, MAYDON_YOLI, "maydonHaqida")
        return f"{tg_id}: /maydon"

    if matn.startswith("/reyting"):
        bolimni_yubor(chat_id, til, REYTING_YOLI, "reytingHaqida")
        return f"{tg_id}: /reyting"

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
    klaviatura = asosiy_klaviatura(til)
    api("sendMessage", chat_id=chat_id,
        text=M("boshlaTugma" if klaviatura else "boshlaStart", til),
        reply_markup=klaviatura or None)
    return f"{tg_id}: boshqa xabar"


#: "/" tugmasi ostidagi ro'yxat. Tartib — foydalanish chastotasi bo'yicha.
BUYRUQLAR = (
    ("start", "buyruqStart"),
    ("oyinlar", "buyruqOyinlar"),
    ("duel", "buyruqDuel"),
    ("maydon", "buyruqMaydon"),
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
