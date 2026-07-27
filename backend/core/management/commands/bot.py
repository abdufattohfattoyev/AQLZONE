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

from core import boshqaruv
from core.auth import kirish_kodi_yasa, tg_ismi
from core.models import Identity, KirishKodi, Pupil

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


def raqamni_tozala(xom: str) -> str:
    """
    Telegram raqamni "+998901234567" yoki "998901234567" ko'rinishida beradi.
    Bittasini tanlaymiz, aks holda bir odam ikki xil yozuvda ikki hisob
    ochib olardi.
    """
    faqat_raqam = "".join(c for c in (xom or "") if c.isdigit())
    return f"+{faqat_raqam}" if faqat_raqam else ""


@transaction.atomic
def raqamni_bogla(tg_id: str, telefon: str, ism: str, familiya: str) -> tuple[Pupil, bool]:
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
        pupil = Pupil.objects.create(first_name=ism, last_name=familiya)
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


def muddat_matni() -> str:
    """
    "1 soat" / "30 daqiqa" — xabarda ko'rsatish uchun.

    Hisoblanadi, qo'lda yozilmaydi: `KirishKodi.DAQIQA` o'zgarganda xabar
    ham o'zgarsin. Aks holda kod 30 daqiqa yashaydi-yu, bot "1 soat"
    deyaverardi va foydalanuvchi havolani ishlamayapti deb o'ylardi.
    """
    d = KirishKodi.DAQIQA
    return f"{d // 60} soat" if d >= 60 and d % 60 == 0 else f"{d} daqiqa"


def raqam_sora(chat_id: int, matn: str) -> None:
    """Telefon raqamini so'raydigan klaviatura."""
    api(
        "sendMessage",
        chat_id=chat_id,
        text=matn,
        parse_mode="HTML",
        reply_markup={
            "keyboard": [[{
                "text": "📱 Raqamni yuborish",
                # Telegram raqamni FAQAT shu tugma orqali beradi.
                "request_contact": True,
            }]],
            "resize_keyboard": True,
            "one_time_keyboard": True,
        },
    )


def salom_yubor(chat_id: int, tg_id: str, ism: str, familiya: str) -> str:
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
    salom = (
        f"Assalomu alaykum{', ' + ism if ism else ''}! 👋\n\n"
        "<b>Aql Zone</b> — 1–4-sinf matematikasi.\n"
        "Bola darslik boblari bo'ylab yuradi, yulduz yig'adi va "
        "har safar yangi savollar yechadi."
    )

    if not settings.SAYT_URL:
        raqam_sora(
            chat_id,
            salom + "\n\n⚠️ Sayt manzili sozlanmagan (SAYT_URL).\n"
                    "Progress yo'qolmasligi uchun raqamingizni yuboring.",
        )
        return f"{tg_id}: /start — SAYT_URL yo'q, raqam so'raldi"

    # Hisob shu yerda yaratiladi (yoki topiladi): havola aynan shu hisobga
    # kiritishi kerak. Raqam bo'sh — u keyin, /raqam orqali qo'shiladi.
    pupil, _ = raqamni_bogla(tg_id, "", ism, familiya)
    havola = f"{settings.SAYT_URL}/kirish/{kirish_kodi_yasa(pupil)}"

    tugmalar = [[{"text": "✅ Saytga kirish", "url": havola}]]
    if settings.MINI_APP_URL:
        tugmalar.append([
            {"text": "🎓 Ilovani ochish", "web_app": {"url": settings.MINI_APP_URL}},
        ])

    api(
        "sendMessage",
        chat_id=chat_id,
        text=(
            salom + "\n\n"
            "Pastdagi «✅ Saytga kirish» tugmasini bosing — avtomatik kirasiz.\n\n"
            f"Tugma {muddat_matni()} amal qiladi."
        ),
        parse_mode="HTML",
        # Eski "raqam yuborish" klaviaturasi osilib qolmasin.
        reply_markup={"inline_keyboard": tugmalar},
    )
    return f"{tg_id}: /start — kirish havolasi yuborildi (hisob #{pupil.pk})"


def ilovani_yubor(chat_id: int, pupil: Pupil, yangi: bool) -> None:
    """Raqam qabul qilingandan keyin — kirish havolasi va Mini App tugmasi."""
    matn = (
        "Rahmat, raqam saqlandi ✅" if yangi else "Raqamingiz allaqachon saqlangan ✅"
    )

    tugmalar = []
    if settings.SAYT_URL:
        tugmalar.append([{
            "text": "✅ Saytga kirish",
            "url": f"{settings.SAYT_URL}/kirish/{kirish_kodi_yasa(pupil)}",
        }])
    if settings.MINI_APP_URL:
        tugmalar.append([
            {"text": "🎓 Ilovani ochish", "web_app": {"url": settings.MINI_APP_URL}},
        ])

    # Avval eski "raqam yuborish" klaviaturasini olib tashlaymiz: u
    # ekranning pastida osilib qolsa, foydalanuvchi raqamni yana
    # yuborish kerakdek tuyuladi.
    api("sendMessage", chat_id=chat_id, text=matn,
        reply_markup={"remove_keyboard": True})

    if not tugmalar:
        api("sendMessage", chat_id=chat_id,
            text="⚠️ Ilova manzili sozlanmagan (SAYT_URL / MINI_APP_URL).")
        return

    api(
        "sendMessage",
        chat_id=chat_id,
        text=f"Ilovaga o'tish — tugma {muddat_matni()} amal qiladi:",
        reply_markup={"inline_keyboard": tugmalar},
    )


def yangilikni_qayta_ishla(u: dict) -> str:
    """
    Bitta yangilik. Nima qilinganini qisqa satr qilib qaytaradi (jurnalga).

    Webhook'ga o'tilsa ham AYNAN shu funksiya chaqiriladi — polling
    mantiqidan mustaqil.
    """
    xabar = u.get("message") or u.get("edited_message")
    if not xabar:
        return ""

    chat_id = xabar["chat"]["id"]
    kim = xabar.get("from") or {}
    tg_id = str(kim.get("id") or "")
    # Telegram ismi bezakli bo'lishi mumkin (`꧁❖DAVRONOV❖꧂`) — bazaga
    # tozalangan holda tushadi, aks holda reyting o'sha bezakni ko'rsatardi.
    ism, familiya = tg_ismi(kim)

    # --- kontakt keldi ---
    kontakt = xabar.get("contact")
    if kontakt:
        # Boshqa odamning vizitkasini yuborish mumkin. Faqat O'ZINIKI qabul
        # qilinadi, aks holda birov begona raqamni bog'lab qo'yardi.
        if str(kontakt.get("user_id") or "") != tg_id:
            api("sendMessage", chat_id=chat_id,
                text="Iltimos, o'z raqamingizni yuboring — tugmani bosing.")
            return f"{tg_id}: begona kontakt rad etildi"

        telefon = raqamni_tozala(kontakt.get("phone_number", ""))
        if not telefon:
            api("sendMessage", chat_id=chat_id, text="Raqam o'qilmadi, qayta urining.")
            return f"{tg_id}: raqam bo'sh"

        pupil, yangi = raqamni_bogla(tg_id, telefon, ism, familiya)
        ilovani_yubor(chat_id, pupil, yangi)
        return f"{tg_id}: raqam bog'landi (hisob #{pupil.pk})"

    # --- matn keldi ---
    matn = (xabar.get("text") or "").strip()
    if matn.startswith("/start"):
        return salom_yubor(chat_id, tg_id, ism, familiya)

    # Raqam endi majburiy emas — kirish havola orqali bo'ladi. Lekin u
    # hisobni tiklashda va eslatma yuborishda kerak, shuning uchun alohida
    # buyruq bo'lib qoladi.
    if matn.startswith("/raqam"):
        raqam_sora(
            chat_id,
            "Raqamingizni yuboring — telefon yoki brauzer almashsa ham "
            "hisobingiz va yulduzlaringiz joyida qoladi.",
        )
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
            reply_markup={"inline_keyboard": [[
                {"text": "📊 Panelni ochish", "url": boshqaruv.havola_yasa(tg_id)},
            ]]})
        return f"{tg_id}: /boshqaruv — havola yuborildi"

    if matn.startswith("/help"):
        yordam = ("/start — saytga kirish havolasini olish\n"
                  "/raqam — telefon raqamini bog'lash\n"
                  "Savollar bo'lsa shu yerga yozing.")
        if boshqaruv.admin_tg_mi(tg_id):
            yordam += "\n/boshqaruv — hisobot paneli"
        api("sendMessage", chat_id=chat_id, text=yordam)
        return f"{tg_id}: /help"

    # Boshqa har qanday xabar — yo'naltiramiz.
    api("sendMessage", chat_id=chat_id,
        text="Boshlash uchun /start yuboring.")
    return f"{tg_id}: boshqa xabar"


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
                "diqqat: MINI_APP_URL bo'sh — Mini App tugmasi ko'rsatilmaydi"
            ))

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
