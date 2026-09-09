"""
Telegram'ga xabar yuborishning YAGONA joyi.

Ilgari bu kod ikki nusxada edi: e'lon tarqatishda va eslatmada. Ikkalasi
bir xil ishni qilardi, lekin bir xil emas — masalan "odam botni
bloklagan" holati faqat bittasida hisobga olinardi. Shu sabab bloklagan
odamga eslatma har kuni yuborilaverardi va u hech qachon yetib bormasdi.

Telegram'ning uchta o'ziga xosligi shu yerda, bitta joyda hal qilinadi:

  * **403** — odam botni bloklagan yoki suhbatni o'chirgan. Bu XATO
    emas, oddiy holat: hisob belgilanadi va boshqa urinilmaydi.
  * **429** — tezlik cheklovi. Telegram qancha kutishni o'zi aytadi.
  * **"chat not found"** — hisob o'chirilgan. Qayta urinishdan foyda yo'q.
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
import uuid

from django.conf import settings
from django.utils import timezone

#: Bir soniyada nechta xabar. Telegram ~30 ga ruxsat beradi; 25 —
#: chegaraga tegib ketmaslik uchun ataylab pastroq.
TEZLIK = 25

#: Har xabardan keyingi tanaffus (sekund).
ORALIQ = 1 / TEZLIK

#: 429 javobida Telegram kutish muddatini o'zi aytadi. Aytmasa — shu.
STANDART_KUTISH = 3

#: Bitta xabarning eng katta uzunligi (Telegram cheklovi).
MAX_MATN = 4096

# ------------------------------------------------------- tugma ranglari
#
# Bot API 9.4 (2026-02-09) dan tugmaga `style` berish mumkin. Faqat
# UCHTA nom bor va o'z rangimizni (brenddagi yashil #48c97a) berib
# bo'lmaydi — Telegram uni o'z mavzusidagi ranglar bilan chizadi.
#
# Ranglar shu yerda NOM bilan turadi, kod bo'ylab "success" deb
# yozilmaydi: rang o'zi hech narsani anglatmaydi, MA'NOsi anglatadi.
# Ma'no bir joyda turgani uchun butun bot bir xil qoidaga bo'ysunadi:
#
#   YASHIL  asosiy harakat — odam shu tugma uchun kelgan
#   KOK     yordamchi yo'l — foydali, lekin majburiy emas
#   QIZIL   ortga qaytarib bo'lmaydigan tanlov
#
# DIQQAT: eski mijozlar `style` ni tanimaydi va tugmani odatdagidek
# chizadi. Shuning uchun rangga MA'NO YUKLAMASLIK kerak — "qizilini
# bosmang" degan ogohlantirish eski telefonda yo'qoladi. Rang faqat
# ko'zni yo'naltiradi, matnning o'rnini bosmaydi.
YASHIL = "success"
KOK = "primary"
QIZIL = "danger"


def tugma_yasa(matn: str, uslub: str = "", **maydon) -> dict:
    """
    Bitta tugma yasaydi.

    `uslub` bo'sh bo'lsa `style` maydoni UMUMAN qo'shilmaydi. Bo'sh satr
    yuborish ham mumkin edi, lekin Telegram noma'lum qiymatga butun
    xabarni rad etib javob beradi — ya'ni bitta e'tiborsizlik tufayli
    xabar umuman yetib bormasdi.
    """
    t = {"text": matn, **maydon}
    if uslub:
        t["style"] = uslub
    return t


def _sorov(usul: str, payload: dict) -> tuple[bool, int, str]:
    """
    Telegram chaqiruvi. `(muvaffaqiyatmi, http_kodi, izoh)` qaytadi.

    HTTP kodi ATAYLAB qaytariladi: 403 va 429 butunlay boshqacha muomala
    talab qiladi, "xato bo'ldi" degan bitta bayroq ularni ajrata olmaydi.
    """
    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/{usul}"
    so_rov = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(so_rov, timeout=20) as r:
            return json.loads(r.read()).get("ok", False), 200, ""
    except urllib.error.HTTPError as e:
        izoh = ""
        kutish = 0
        try:
            tana = json.loads(e.read())
            izoh = str(tana.get("description", ""))[:200]
            kutish = int(tana.get("parameters", {}).get("retry_after", 0))
        except Exception:
            pass
        if e.code == 429:
            time.sleep(kutish or STANDART_KUTISH)
        return False, e.code, izoh or f"HTTP {e.code}"
    except Exception as e:                       # tarmoq uzilishi va boshqalar
        return False, 0, str(e)[:200]


def yubor(
    chat_id: str,
    matn: str,
    tugma: str = "",
    havola: str = "",
    ikkinchi_tugma: str = "",
    ikkinchi_data: str = "",
    uslub: str = YASHIL,
    ikkinchi_uslub: str = QIZIL,
    ilovada: bool = False,
    qoshimcha_tugma: str = "",
    qoshimcha_havola: str = "",
    qoshimcha_uslub: str = KOK,
) -> tuple[str, str]:
    """
    Bitta xabar yuboradi. `(holat, izoh)` qaytadi.

    Holat: `yuborildi` | `bloklandi` | `xato`.

    `tugma` va `havola` ikkalasi ham berilsa, xabar ostida inline tugma
    chiqadi. Bittasi bo'sh bo'lsa tugma umuman qo'shilmaydi — yarim
    sozlangan tugma Telegram tomonidan rad etiladi va butun xabar
    yuborilmay qolardi.

    `ikkinchi_tugma` esa HAVOLA EMAS, javob tugmasi (`callback_data`):
    bosilganda bot ichida ish bajariladi, brauzer ochilmaydi. Hozircha
    bitta joyda kerak — "qaytib keling" zanjiridagi «Boshqa yozmang»
    (`management/commands/qaytarish.py`). U alohida QATORDA turadi:
    asosiy tugma bilan yonma-yon bo'lsa, bexosdan bosilishi oson bo'lardi
    va bu qaytarib bo'lmaydigan tanlov.

    Ranglar standart holda ma'noga qarab qo'yilgan: asosiy tugma YASHIL
    (odam shu havola uchun kelgan), ikkinchisi QIZIL (u doim rad javob —
    "boshqa yozmang"). Kerak bo'lsa chaqiruvchi almashtiradi.

    `ilovada=True` — tugma ilovani TELEGRAM ICHIDA ochadi (Mini App),
    brauzerni ochmaydi. Farqi katta: odam brauzerga chiqib ketsa, u
    yerda hisobga kirish qaytadan boshlanadi, orqaga qaytish esa
    Telegram'ni topib, botni qidirishni talab qiladi — o'sha yo'lda
    ko'pchilik yo'qoladi. Mini App'da esa kirish o'z-o'zidan bo'ladi
    (`initData`) va ilova bot suhbatining ustida ochiladi.

    Ikki holatda `ilovada` E'TIBORGA OLINMAYDI va oddiy havola qoladi:

      * manzil `https://` emas — Telegram Mini App'ni faqat HTTPS'da
        ochadi va boshqasini butun xabar bilan birga rad etadi;
      * manzil Telegram'ning o'zi (`t.me/...`) — uni Mini App qilib
        ochish mumkin emas.

    Tekshiruv shu yerda turadi, chaqiruvchida emas: bir joyda unutilsa,
    xabar butunlay yetib bormasdi.
    """
    payload = {
        "chat_id": chat_id,
        "text": matn[:MAX_MATN],
        "parse_mode": "HTML",
        # Havolaning kartasi xabarni cho'zib, matnni pastga surib qo'yadi.
        "link_preview_options": {"is_disabled": True},
    }
    qatorlar = []
    if tugma and havola:
        mini_app = (
            ilovada
            and havola.startswith("https://")
            and not havola.startswith("https://t.me/")
        )
        qatorlar.append([
            tugma_yasa(tugma, uslub, web_app={"url": havola}) if mini_app
            else tugma_yasa(tugma, uslub, url=havola)
        ])
    # Ikkinchi HAVOLA tugmasi — kanal postidagi «Boshqa masalalar»
    # uchun. `ikkinchi_tugma` dan farqi shu: u callback, bu havola.
    if qoshimcha_tugma and qoshimcha_havola:
        qatorlar.append([tugma_yasa(qoshimcha_tugma, qoshimcha_uslub, url=qoshimcha_havola)])
    if ikkinchi_tugma and ikkinchi_data:
        qatorlar.append([tugma_yasa(ikkinchi_tugma, ikkinchi_uslub, callback_data=ikkinchi_data)])
    if qatorlar:
        payload["reply_markup"] = {"inline_keyboard": qatorlar}

    ok, kod, izoh = _sorov("sendMessage", payload)
    if ok:
        return "yuborildi", ""
    if kod == 403 or "chat not found" in izoh.lower():
        return "bloklandi", izoh
    return "xato", izoh


#: Rasmli xabar ostidagi yozuvning eng katta uzunligi (Telegram cheklovi).
MAX_SARLAVHA = 1024


def _multipart(maydonlar: dict[str, str], rasm: bytes) -> tuple[bytes, str]:
    """
    Fayl yuborish uchun tana yasaydi.

    `sendPhoto` ni JSON bilan chaqirib bo'lmaydi — rasm baytlari
    `multipart/form-data` bo'lib ketishi kerak. Tashqi kutubxona
    qo'shmaymiz: butun loyihada Telegram bilan gaplashish `urllib`
    ustiga qurilgan va bitta funksiya uchun bog'liqlik ortdirish
    o'rinsiz.
    """
    chegara = f"----aqlzone{uuid.uuid4().hex}"
    qism: list[bytes] = []
    for kalit, qiymat in maydonlar.items():
        qism.append(
            f"--{chegara}\r\n"
            f'Content-Disposition: form-data; name="{kalit}"\r\n\r\n'
            f"{qiymat}\r\n".encode()
        )
    qism.append(
        f"--{chegara}\r\n"
        f'Content-Disposition: form-data; name="photo"; filename="masala.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n".encode()
    )
    qism.append(rasm)
    qism.append(f"\r\n--{chegara}--\r\n".encode())
    return b"".join(qism), f"multipart/form-data; boundary={chegara}"


def rasm_yubor(
    chat_id: str,
    rasm: bytes,
    sarlavha: str,
    tugmalar: list[tuple[str, str, str]] | None = None,
) -> tuple[str, str, int]:
    """
    Rasmli xabar — kanalga masala joylash uchun.

    `(holat, izoh, xabar_id)` qaytaradi. Uchinchisi — Telegram bergan
    xabar raqami: kanaldagi POSTNING O'ZIGA havola shundan quriladi
    (`t.me/<kanal>/<id>`). Xato bo'lsa 0.

    Nega alohida funksiya: matnli xabarda rasm "havola kartasi" bo'lib
    chiqadi va u kichkina, kesilgan holda ko'rinadi. Chizmali masalada
    esa chizmaning O'ZI xabarning yarmi — u to'liq va katta bo'lishi
    kerak, aks holda odam shartni tushunmaydi va bosmaydi.

    `tugmalar` — `(matn, havola, uslub)` uchliklari. Har biri O'Z
    QATORIDA turadi: kanal xabarini telefonda o'qiydigan odamda
    yonma-yon ikkita tugma tor bo'lib qoladi va matni kesiladi.

    Tugmalar HAR DOIM oddiy havola (`url`), Mini App tugmasi emas:
    kanal xabarida Telegram `web_app` tugmasiga umuman ruxsat
    bermaydi va butun xabar rad etiladi. `t.me/<bot>?startapp=...`
    havolasi esa kanalda ishlaydi va ilovani baribir Telegram
    ichida ochadi.
    """
    maydonlar = {
        "chat_id": chat_id,
        "caption": sarlavha[:MAX_SARLAVHA],
        "parse_mode": "HTML",
    }
    qatorlar = [
        [tugma_yasa(matn, uslub, url=havola)]
        for matn, havola, uslub in (tugmalar or [])
        if matn and havola
    ]
    if qatorlar:
        maydonlar["reply_markup"] = json.dumps({"inline_keyboard": qatorlar})

    tana, turi = _multipart(maydonlar, rasm)
    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendPhoto"
    so_rov = urllib.request.Request(url, data=tana, headers={"Content-Type": turi})
    try:
        with urllib.request.urlopen(so_rov, timeout=60) as r:
            javob = json.loads(r.read())
            if not javob.get("ok"):
                return "xato", "ok=false", 0
            xabar_id = int(javob.get("result", {}).get("message_id") or 0)
            return "yuborildi", "", xabar_id
    except urllib.error.HTTPError as e:
        izoh = ""
        try:
            izoh = str(json.loads(e.read()).get("description", ""))[:200]
        except Exception:
            pass
        if e.code == 403 or "chat not found" in izoh.lower():
            return "bloklandi", izoh or f"HTTP {e.code}", 0
        return "xato", izoh or f"HTTP {e.code}", 0
    except Exception as e:                       # tarmoq uzilishi va boshqalar
        return "xato", str(e)[:200], 0


#: Telegram "bunday xabar yo'q" ni shu so'zlar bilan aytadi.
#:
#: Kod hamma holatda ham 400 — ya'ni kodga qarab ajratib bo'lmaydi,
#: faqat izohga qarab. Ro'yxat ataylab tor: noma'lum xatoni "post
#: o'chirilgan" deb hisoblasak, tarmoqdagi bir kunlik uzilish butun
#: kanalni "yo'q bo'lib ketgan" deb belgilab qo'yardi.
YOQ_IZOHLARI = (
    "message to edit not found",
    "message to delete not found",
    "message_id_invalid",
    "message identifier is not specified",
)

#: Aksincha — xabar BOR ekanining eng ishonchli dalili.
#:
#: Bir xil tugmalarni qayta qo'yganda Telegram hech nimani
#: o'zgartirmaydi va shu xato bilan javob beradi. Ya'ni xato emas,
#: tasdiq: o'zgartiradigan xabar joyida turibdi.
BOR_IZOHI = "message is not modified"


def post_bormi(chat_id: str, xabar_id: int, tugmalar=None) -> str:
    """
    Kanaldagi post hali ham turibdimi. `bor` | `yoq` | `nomalum`.

    ─────────── NEGA AYNAN `editMessageReplyMarkup` ───────────

    Telegram'da "bu xabar bormi?" degan savol YO'Q — Bot API xabarni
    o'qish imkonini bermaydi. Shuning uchun tekshiruv bilvosita: biz
    xabarni O'ZGARTIRISHGA urinamiz va javobiga qaraymiz.

    Amal ataylab shu tanlangan va, masalan, `forwardMessage` emas:
    yo'naltirish tekshiruv izini boshqa suhbatda qoldirardi, o'chirish
    esa tekshirilayotgan narsani yo'q qilardi. Tugmalarni qayta qo'yish
    esa hech narsani buzmaydi — eng yomoni, u AYNAN o'sha tugmalarni
    o'z joyiga qaytaradi. Qo'lda buzilgan post shu bilan tuzalib ham
    ketadi.

    `nomalum` — uchinchi holat va u zarur: tarmoq uzilganda yoki
    Telegram javob bermaganda post "yo'q" deb belgilanmasligi kerak.
    """
    payload = {"chat_id": chat_id, "message_id": int(xabar_id)}
    qatorlar = [
        [tugma_yasa(matn, uslub, url=havola)]
        for matn, havola, uslub in (tugmalar or [])
        if matn and havola
    ]
    if qatorlar:
        payload["reply_markup"] = {"inline_keyboard": qatorlar}

    ok, kod, izoh = _sorov("editMessageReplyMarkup", payload)
    if ok:
        return "bor"
    past = izoh.lower()
    if BOR_IZOHI in past:
        return "bor"
    if any(s in past for s in YOQ_IZOHLARI):
        return "yoq"
    return "nomalum"


def sarlavhani_yangila(
    chat_id: str, xabar_id: int, sarlavha: str,
    tugmalar=None, rasmli: bool = True,
) -> str:
    """
    Kanaldagi postning YOZUVINI almashtiradi. `yangilandi` | `yoq` |
    `ozgarmagan` | `xato`.

    ─────────────── NEGA IKKI XIL AMAL ───────────────

    Rasmli post `sendPhoto` bilan chiqqan va uning matni "caption"
    deb ataladi; rasmsizi `sendMessage` bilan chiqqan va uniki
    "text". Telegram ularni ALOHIDA amal bilan tahrirlaydi va
    noto'g'risi "there is no caption in the message to edit" degan
    xato bilan qaytadi.

    ─────────────── `ozgarmagan` XATO EMAS ───────────────

    Bir xil matn bilan tahrirlashni Telegram rad etadi. Bu holat
    normal: sanoq o'zgarmagan bo'lsa post ham o'zgarmasligi kerak.
    Chaqiruvchi buni xato deb hisoblasa, har safar "yangilanmadi"
    deb yozib turardi.
    """
    payload = {
        "chat_id": chat_id,
        "message_id": int(xabar_id),
        "parse_mode": "HTML",
    }
    if rasmli:
        payload["caption"] = sarlavha[:MAX_SARLAVHA]
    else:
        payload["text"] = sarlavha[:MAX_MATN]
        payload["link_preview_options"] = {"is_disabled": True}

    qatorlar = [
        [tugma_yasa(matn, uslub, url=havola)]
        for matn, havola, uslub in (tugmalar or [])
        if matn and havola
    ]
    if qatorlar:
        payload["reply_markup"] = {"inline_keyboard": qatorlar}

    usul = "editMessageCaption" if rasmli else "editMessageText"
    ok, kod, izoh = _sorov(usul, payload)
    if ok:
        return "yangilandi"
    past = izoh.lower()
    if BOR_IZOHI in past:
        return "ozgarmagan"
    if any(s in past for s in YOQ_IZOHLARI):
        return "yoq"
    return "xato"


def post_ochir(chat_id: str, xabar_id: int) -> str:
    """
    Kanaldagi postni o'chiradi. `ochirildi` | `yoq` | `xato`.

    Qayta yuborishda kerak: eski post o'chmasa, kanalda bitta masala
    ikki marta turib qolardi va odam qaysinisiga javob berishni
    bilmasdi. Bot kanalda administrator bo'lmasa amal bajarilmaydi —
    o'sha holatda `xato` qaytadi va chaqiruvchi baribir yangi post
    yuboraveradi: dubl — masalasiz kanaldan yaxshiroq.
    """
    ok, kod, izoh = _sorov("deleteMessage",
                           {"chat_id": chat_id, "message_id": int(xabar_id)})
    if ok:
        return "ochirildi"
    if any(s in izoh.lower() for s in YOQ_IZOHLARI):
        return "yoq"
    return "xato"


def adminga_yangi_hisob(pupil) -> None:
    """
    Yangi ro'yxatdan o'tgan odam haqida administratorlarga xabar.

    `Pupil.royxatni_yop()` dan chaqiriladi — ya'ni har bir hisob uchun
    ENG KO'PI BIR MARTA. Uch xil yo'l bilan ro'yxatdan o'tiladi (qo'lda
    ism kiritish, Telegram orqali kirish, hisoblarni birlashtirish) va
    xabar o'sha uchalasi qo'shiladigan yagona nuqtada turadi.

    **Fon oqimida yuboriladi.** Funksiya foydalanuvchining so'rovi ichida
    chaqiriladi: bola "Davom etish" ni bosgan zahoti. Telegram sekin
    javob bersa (yoki umuman javob bermasa), bola shuncha vaqt ro'yxat
    oynasida qotib turardi — holbuki bu xabar unga emas, adminga kerak.
    Shuning uchun javob kutilmaydi.

    Sanoq ASOSIY OQIMDA hisoblanadi va fon oqimiga tayyor matn ketadi:
    SQLite bir vaqtda ikki oqimdan o'qilganda qulflanib qolishi mumkin,
    va bu ehtimolni ro'yxatdan o'tish yo'liga olib kirish arzimaydi.

    Xabar ketmaydigan uch holat — hammasi jimgina:
      * `ADMIN_TG` bo'sh (sozlanmagan server);
      * `BOT_TOKEN` yo'q (bot ulanmagan);
      * sinov ishlayapti (`TESTDA`).
    """
    import html
    import threading

    from django.utils import timezone

    from .models import Identity, Pupil

    adminlar = [str(x) for x in getattr(settings, "ADMIN_TG", []) if x]
    if not adminlar or not getattr(settings, "BOT_TOKEN", "") or getattr(settings, "TESTDA", False):
        return

    try:
        jami = Pupil.objects.filter(registered_at__isnull=False).count()
        bugun = Pupil.objects.filter(
            registered_at__date=timezone.localdate()
        ).count()

        # Kirish usuli — odam qaysi eshikdan kirgani. Bittadan ko'p
        # bo'lishi mumkin (qurilma + Telegram), shuning uchun hammasi.
        usullar = ", ".join(
            dict(Identity.PROVAYDERLAR).get(p, p)
            for p in pupil.identities.values_list("provider", flat=True)
        ) or "—"

        ism = html.escape(pupil.toliq_ism or "—")
        username = f"@{html.escape(pupil.username)}" if pupil.username else "—"

        matn = (
            "🆕 <b>Yangi foydalanuvchi</b>\n\n"
            f"👤 {ism}\n"
            f"🔗 {username}\n"
            f"🚪 {usullar}\n"
            f"🌐 {'ruscha' if pupil.til == 'ru' else 'o‘zbekcha'}\n\n"
            f"📊 Jami ro‘yxatdan o‘tganlar: <b>{jami}</b>\n"
            f"📅 Bugun: <b>{bugun}</b>"
        )
    except Exception:                            # noqa: BLE001 — ro'yxat buzilmasin
        # Xabar yasalmadi (masalan baza band). Ro'yxatdan o'tish esa
        # ALLAQACHON yakunlangan va uni ortga qaytarish mumkin emas —
        # shuning uchun bu yerda jim qolamiz.
        return

    def yubor_hammaga() -> None:
        for tg_id in adminlar:
            try:
                yubor(tg_id, matn)
            except Exception:                    # noqa: BLE001
                pass

    threading.Thread(target=yubor_hammaga, daemon=True).start()


def bloklanganini_belgila(pupil_id: int) -> None:
    """Botni bloklagan hisobni belgilaydi — keyin unga urinilmaydi."""
    from .models import Pupil

    Pupil.objects.filter(pk=pupil_id, bot_bloklandi_at__isnull=True).update(
        bot_bloklandi_at=timezone.now()
    )


def bot_havolasi(qayerdan: str = "") -> str:
    """Botga olib boradigan manzil. `qayerdan` — o'lchash uchun belgi."""
    bot = getattr(settings, "BOT_USERNAME", "") or ""
    if not bot:
        return ""
    return f"https://t.me/{bot}?start={qayerdan}" if qayerdan else f"https://t.me/{bot}"


def ilova_havolasi() -> str:
    """
    Ilovaning o'zi — eslatma tugmasi shu yerga olib boradi.

    Botga emas: eslatmani olgan odam ALLAQACHON botda turibdi va uni
    yana botga yuborish qadamni ko'paytiradi. Sayt manzili sozlanmagan
    bo'lsa bot havolasi zaxira bo'lib qoladi.
    """
    sayt = (getattr(settings, "MINI_APP_URL", "") or getattr(settings, "SAYT_URL", "") or "").rstrip("/")
    return sayt or bot_havolasi()
