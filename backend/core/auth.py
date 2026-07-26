"""
Aql Zone — autentifikatsiya.

Kirish yo'llari har xil, natija bir xil: sessiya tokeni. Shu sabab APK/iOS
ilova ham xuddi shu API'dan foydalanadi — Telegram'ga bog'liq emas.

Har bir usul `hisob_topish()` dan o'tadi va `Identity` qatorini yasaydi.
Yangi usul (telefon, Google) qo'shish uchun faqat o'sha usulni tekshiradigan
view yoziladi — bu fayldagi qolgan mantiq o'zgarmaydi.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import secrets
from urllib.parse import parse_qsl

from django.conf import settings
from django.utils import timezone
from rest_framework import authentication, exceptions

from .models import Identity, KirishKodi, Pupil, Session

#: initData qancha vaqt amal qiladi (sekund).
MAX_AUTH_AGE = 24 * 60 * 60


def sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------- Telegram


class TelegramXato(Exception):
    """Tekshiruv o'tmadi — HTTP kodi bilan birga."""

    def __init__(self, code: int, error: str) -> None:
        super().__init__(error)
        self.code = code
        self.error = error


def verify_telegram(init_data: str | None, bot_token: str | None = None) -> dict:
    """
    Telegram hujjatidagi algoritm:

        secret = HMAC_SHA256(key="WebAppData", msg=bot_token)
        hash   = HMAC_SHA256(key=secret, msg=saralangan "k=v\\n...")

    Mos kelmasa — ma'lumot ishonchsiz. Bu tekshiruvsiz har kim boshqa
    bolaning nomidan yozib ketishi mumkin bo'lardi.
    """
    bot_token = settings.BOT_TOKEN if bot_token is None else bot_token
    if not bot_token:
        raise TelegramXato(503, "BOT_TOKEN sozlanmagan")
    if not init_data or not isinstance(init_data, str):
        raise TelegramXato(401, "initData yo'q")

    # strict_parsing=False: buzuq satrda ham xato ko'tarilmasin, pastda hash tutadi.
    juftlar = dict(parse_qsl(init_data, keep_blank_values=True))
    kelgan_hash = juftlar.pop("hash", "")
    juftlar.pop("signature", None)  # hash hisobiga kirmaydi

    if len(kelgan_hash) != 64 or not all(c in "0123456789abcdefABCDEF" for c in kelgan_hash):
        raise TelegramXato(401, "hash noto'g'ri")

    dcs = "\n".join(f"{k}={v}" for k, v in sorted(juftlar.items()))
    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    kutilgan = hmac.new(secret, dcs.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(kutilgan, kelgan_hash.lower()):
        raise TelegramXato(401, "imzo mos kelmadi")

    try:
        auth_date = int(juftlar.get("auth_date", "0"))
    except ValueError:
        auth_date = 0
    if not auth_date or timezone.now().timestamp() - auth_date > MAX_AUTH_AGE:
        raise TelegramXato(401, "initData eskirgan")

    try:
        user = json.loads(juftlar.get("user", "null"))
    except ValueError:
        user = None
    if not isinstance(user, dict) or not user.get("id"):
        raise TelegramXato(401, "user topilmadi")

    return user


#: Login Widget imzosiga kiradigan maydonlar.
#:
#: Ro'yxat YOPIQ. Telegram imzoni faqat shu maydonlar ustidan hisoblaydi;
#: begona kalitni qo'shsak imzo mos kelmay qolardi, e'tiborsiz qoldirsak
#: esa mijoz istalgan qo'shimcha ma'lumotni imzosiz kiritib yuborardi.
WIDGET_MAYDONLAR = ("auth_date", "first_name", "id", "last_name", "photo_url", "username")


def verify_telegram_widget(data: dict | None, bot_token: str | None = None) -> dict:
    """
    Login Widget (oddiy veb sayt) imzosini tekshiradi.

    Mini App'nikidan FARQ QILADI va farq faqat bitta qatorda — kalitni
    yasashda:

        Mini App:  secret = HMAC_SHA256(key="WebAppData", msg=bot_token)
        Widget:    secret = SHA256(bot_token)

    Shuning uchun ikkalasi alohida funksiya. Bittasiga birlashtirilsa
    "nega imzo mos kelmayapti?" degan savol yillab qidiriladigan bo'lardi:
    kod to'g'ri ko'rinadi, natija esa doim 401.

    Telegram hujjati: https://core.telegram.org/widgets/login#checking-authorization
    """
    bot_token = settings.BOT_TOKEN if bot_token is None else bot_token
    if not bot_token:
        raise TelegramXato(503, "BOT_TOKEN sozlanmagan")
    if not isinstance(data, dict) or not data:
        raise TelegramXato(401, "Telegram ma'lumoti yo'q")

    kelgan_hash = str(data.get("hash") or "")
    if len(kelgan_hash) != 64 or not all(c in "0123456789abcdefABCDEF" for c in kelgan_hash):
        raise TelegramXato(401, "hash noto'g'ri")

    # Telegram yubormagan maydon imzoga umuman kirmaydi — shuning uchun
    # bo'sh qiymatlar tashlab yuboriladi, `None` ham, "" ham.
    juftlar = {
        k: str(data[k])
        for k in WIDGET_MAYDONLAR
        if data.get(k) not in (None, "")
    }
    if "id" not in juftlar:
        raise TelegramXato(401, "id yo'q")

    dcs = "\n".join(f"{k}={juftlar[k]}" for k in sorted(juftlar))
    secret = hashlib.sha256(bot_token.encode()).digest()
    kutilgan = hmac.new(secret, dcs.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(kutilgan, kelgan_hash.lower()):
        raise TelegramXato(401, "imzo mos kelmadi")

    try:
        auth_date = int(juftlar.get("auth_date", "0"))
    except ValueError:
        auth_date = 0
    if not auth_date or timezone.now().timestamp() - auth_date > MAX_AUTH_AGE:
        raise TelegramXato(401, "ma'lumot eskirgan")

    # Mini App bilan bir xil shakl qaytaramiz, shunda chaqiruvchi ikkalasini
    # ajratib o'tirmaydi.
    return {
        "id": juftlar["id"],
        "first_name": juftlar.get("first_name", ""),
        "last_name": juftlar.get("last_name", ""),
        "username": juftlar.get("username", ""),
        "photo_url": juftlar.get("photo_url", ""),
    }


def verify_any(data: dict) -> dict:
    """
    Qaysi Telegram usuli kelganini o'zi aniqlaydi.

    `initData` bor — demak Mini App; yo'q — demak veb saytdagi widget.
    Shu bitta funksiya tufayli `auth/telegram` ham, `auth/link` ham
    ikkala manbani bir xil qabul qiladi va view'larda shart takrorlanmaydi.
    """
    init_data = data.get("initData")
    if init_data:
        return verify_telegram(init_data)
    return verify_telegram_widget(data.get("tg"))


# ---------------------------------------------------------------- sessiyalar


def issue_token(pupil: Pupil, platform: str = "") -> str:
    token = secrets.token_urlsafe(32)
    hozir = timezone.now()
    Session.objects.create(
        token_hash=sha256(token),
        pupil=pupil,
        platform=(platform or "")[:16],
        created_at=hozir,
        last_seen=hozir,
    )
    return token


def kirish_kodi_yasa(pupil: Pupil) -> str:
    """
    Botdagi havola uchun bir martalik kod.

    Eski kodlar shu zahoti o'chiriladi: odam tugmani ikki marta so'rasa,
    faqat OXIRGI havola ishlashi kerak. Aks holda bir necha kunlik
    yaroqli havolalar suhbatda yotib qolardi.
    """
    KirishKodi.objects.filter(pupil=pupil).delete()
    kod = secrets.token_urlsafe(32)
    KirishKodi.objects.create(kod_hash=sha256(kod), pupil=pupil)
    return kod


def kod_bilan_kir(kod: str) -> Pupil | None:
    """
    Kodni hisobga almashtiradi. Yaroqsiz yoki eskirgan bo'lsa `None`.

    Kod HAR QANDAY holatda o'chiriladi — eskirgani ham. Bazada yotib
    qolgan kod hech kimga foyda bermaydi, lekin o'g'irlangan bazada
    keraksiz ma'lumot bo'lib turadi.

    G'OLIBNI O'CHIRISH ANIQLAYDI, o'qish emas. Bitta havola bo'yicha ikki
    so'rov bir vaqtda kelishi mumkin — brauzer havolani oldindan yuklab
    qo'yadi, React ishlab chiqish rejimida effektni ikki marta chaqiradi,
    odam esa tugmani ikki marta bosadi. Ikkalasi ham qatorni o'qib ulgursa,
    ikkalasi ham "kirdim" deb hisoblardi va IKKINCHISI hisoblarni qayta
    birlashtirishga tushib, 500 qaytarardi (shu xato bo'lgan).
    O'chirish esa bazada ketma-ket bajariladi: `delete()` nechta qator
    o'chirganini aytadi va faqat 1 olgan so'rov davom etadi.
    """
    if not kod or not isinstance(kod, str):
        return None
    kod_hash = sha256(kod)
    row = KirishKodi.objects.select_related("pupil").filter(kod_hash=kod_hash).first()
    if row is None:
        return None
    soni, _ = KirishKodi.objects.filter(kod_hash=kod_hash).delete()
    if not soni:
        return None                      # boshqa so'rov ilgariroq oldi
    return None if row.eskirgan else row.pupil


class BearerTokenAuthentication(authentication.BaseAuthentication):
    """`Authorization: Bearer <token>` sarlavhasidan bolani topadi."""

    keyword = "Bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode("latin-1")
        parts = header.split()
        if len(parts) != 2 or parts[0].lower() != self.keyword.lower():
            return None  # token yo'q — anonim so'rov (kirish endpointlari uchun)

        token_hash = sha256(parts[1])
        try:
            sess = Session.objects.select_related("pupil").get(token_hash=token_hash)
        except Session.DoesNotExist:
            raise exceptions.AuthenticationFailed("token yaroqsiz")

        yosh = (timezone.now() - sess.created_at).days
        if yosh > settings.SESSION_TTL_DAYS:
            sess.delete()
            raise exceptions.AuthenticationFailed("sessiya muddati tugagan")

        # Har so'rovda yozish o'rniga kuniga bir marta — SQLite bo'shashsin.
        if (timezone.now() - sess.last_seen).total_seconds() > 3600:
            Session.objects.filter(pk=token_hash).update(last_seen=timezone.now())

        return sess.pupil, token_hash

    def authenticate_header(self, request):
        return self.keyword


# ------------------------------------------------- bolani topish / yaratish


def hisob_topish(provider: str, external_id: str, **yangi_maydonlar) -> Pupil:
    """
    Kirish usuli bo'yicha hisobni topadi, bo'lmasa yaratadi.

    Barcha provayderlar shu bitta funksiyadan o'tadi. Telefon yoki Google
    qo'shilganda bu yerga hech narsa yozilmaydi — faqat `provider` boshqa
    bo'ladi. Universal kirishning butun mohiyati shu.
    """
    kirish = (
        Identity.objects.select_related("pupil")
        .filter(provider=provider, external_id=external_id)
        .first()
    )
    if kirish:
        return kirish.pupil

    pupil = Pupil.objects.create(**yangi_maydonlar)
    Identity.objects.create(pupil=pupil, provider=provider, external_id=external_id)
    # Har bir yangi hisob darhol bitta profil bilan boshlanadi, aks holda
    # birinchi so'rovgacha progressni bog'lash uchun joy bo'lmaydi.
    pupil.asosiy_profil()
    return pupil


def pupil_by_telegram(tg: dict) -> Pupil:
    ism = tg.get("first_name") or ""
    familiya = tg.get("last_name") or ""
    username = tg.get("username") or ""
    pupil = hisob_topish(
        Identity.TELEGRAM,
        str(tg["id"]),
        first_name=ism,
        last_name=familiya,
        username=username,
    )
    ismni_yangila(pupil, ism, familiya, username)
    return pupil


def ismni_yangila(pupil: Pupil, ism: str, familiya: str, username: str) -> None:
    """
    Telegram'dan kelgan ismni hisobga yozadi.

    Uch qoida, va uchalasi ham amalda kerak bo'lgan:

    1. **Qo'lda yozilgan ism ustiga yozilmaydi.** Foydalanuvchi ismini
       ilovada o'zi tuzatgan bo'lsa (`ism_qolda`), keyingi kirishda u
       Telegram'nikiga almashib ketmasligi kerak.
    2. **Familiya faqat bo'sh bo'lsa to'ldiriladi.** Telegram'da familiya
       ixtiyoriy: bugun bor, ertaga o'chirilgan bo'lishi mumkin. Bo'sh
       qiymatni yozib yuborsak, foydalanuvchi kiritgan familiya yo'qolardi
       va u ro'yxatdan chiqib qolardi.
    3. **Ikkalasi to'lgan zahoti ro'yxat yopiladi.** Telegram'da ism ham,
       familiya ham bo'lsa, odamdan yana so'rash keraksiz ish.
    """
    maydon = ["username"]
    if not pupil.ism_qolda and ism:
        pupil.first_name = ism
        maydon.append("first_name")
    if familiya and not pupil.last_name:
        pupil.last_name = familiya
        maydon.append("last_name")
    pupil.username = username
    pupil.save(update_fields=maydon)
    pupil.royxatni_yop()


def pupil_by_device(device_id: str) -> Pupil:
    return hisob_topish(Identity.QURILMA, device_id)
