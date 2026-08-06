"""
Ovoz — matnni o'zbekcha talaffuzga aylantirish (TTS).

NEGA SERVERDA, MIJOZDA EMAS. Uch sabab, va uchalasi ham amaliy:

  1. KALIT. Aisha kaliti pullik. U mijozga chiqsa, uni birinchi ochgan
     odam nusxalab olib, boshqa loyihada ishlatib yuboradi va hisob
     bizning nomimizdan tugaydi.
  2. PUL. Bir xil so'z ("olma") kuniga ming marta so'raladi. Serverda
     u BIR MARTA yasaladi va shundan keyin fayl bo'lib turadi — ya'ni
     ming bolaga bitta so'zning narxi to'lanadi.
  3. INTERNETSIZ. Yasalgan fayl `/api/v1/ovoz` orqali oddiy audio bo'lib
     ketadi, mijozdagi `sw.js` esa uni keshlaydi. Ikkinchi marta u
     umuman tarmoqsiz eshitiladi.

KESH ABADIY va bu ataylab. "Olma" so'zining talaffuzi ertaga
o'zgarmaydi, ya'ni muddat qo'yish faqat qayta-qayta pul to'lash degani.
Ovoz almashtirilsa (`AISHA_MODEL`) kalit ham o'zgaradi, chunki u xeshga
kiradi — eski fayllar shunchaki ishlatilmay qoladi.

XAVFSIZLIK. Ochiq TTS proksisi — birovning hisobidan bepul ovoz
yasashning eng oson yo'li. Shuning uchun ikki qavat bor:

  * KESHDAN o'qish hammaga ochiq — bu shunchaki fayl berish;
  * YANGI yasash tokenli so'rovdan va kunlik belgi limitidan o'tadi
    (`views.ovoz`). Bola hech qachon yasashga tegmaydi: butun lug'at
    oldindan tayyorlanadi (`manage.py ovoz`).
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
import urllib.error
import urllib.request
import uuid
from pathlib import Path

from django.conf import settings

#: Aisha bitta so'rovda shuncha belgini qabul qiladi.
MAX_BELGI = 1000

#: Bizning cheklov — undan ancha past.
#:
#: Bu bo'lim BITTA SO'ZNI aytadi ("mashina", "qizil", "besh"), eng
#: uzuni qisqa gap ("Mashinani top"). 200 belgi bundan o'n barobar
#: keng, ya'ni haqiqiy matn hech qachon kesilmaydi — lekin kimdir
#: endpointni kitob o'qitish uchun ishlatolmaydi.
MAX_SORV = 200

#: Tarmoq kutish muddati (sekund). Aisha odatda 1–3 sekundda javob beradi.
KUTISH = 30

#: Fayl kengaytmasi va MIME turi. Aisha WAV qaytaradi (24 kHz, mono).
#:
#: mp3 ga siqish ATAYLAB qilinmayapti: u `ffmpeg` ni talab qiladi va
#: obrazga ~250 MB qo'shadi. Bitta so'z ~40 KB — butun lug'at 3 MB
#: atrofida, ya'ni ilovada allaqachon turgan mp3 to'plami bilan bir xil
#: tartibda. Siqish kerak bo'lsa, keshni bir marta o'tkazish kifoya.
KENGAYTMA = ".wav"
MIME = "audio/wav"


def kesh_papka() -> Path:
    """
    Yasalgan fayllar qayerda yotadi.

    Standart holatda `/data/ovoz` — Docker volume'i, ya'ni konteyner
    qayta qurilganda ham saqlanadi. Busiz har joylashda butun lug'at
    qaytadan yasalardi va har safar pul ketardi.
    """
    p = Path(getattr(settings, "OVOZ_KESH", "") or "")
    if not p:
        p = Path(settings.BASE_DIR) / "ovoz-kesh"
    p.mkdir(parents=True, exist_ok=True)
    return p


def tozala(matn: str) -> str:
    """
    Matnni talaffuzga tayyorlaydi.

    Uch narsa olib tashlanadi va har birining sababi bor:

      * EMOJI va belgilar — TTS ularni nomi bilan o'qib yuboradi
        ("qizil olma" o'rniga "qizil olma qizil doira");
      * IKKI KARRA BO'SHLIQ — ba'zi ovozlar unda pauza qiladi;
      * boshi-oxiridagi bo'shliq — xeshni ikkiga bo'lib yuboradi
        ("olma" va "olma " ikki xil fayl bo'lib qolardi).

    Apostrof QOLADI: o'zbekchada u harfning bir qismi ("o'g'il") va uni
    olib tashlash so'zni butunlay boshqa so'zga aylantiradi.
    """
    s = unicodedata.normalize("NFC", matn or "")
    # Harf, raqam, bo'shliq va tinish belgilari qoladi; qolgani ketadi.
    # `So` (belgi-emoji) va `Cs` (surrogat) shu yerda tushib qoladi.
    s = "".join(c for c in s if unicodedata.category(c)[0] in "LNZP" or c in " '`’‘")
    s = re.sub(r"\s+", " ", s).strip()
    return s[:MAX_SORV]


def kalit(matn: str, til: str = "uz") -> str:
    """
    Fayl nomi — matn, til va OVOZ NOMIDAN yasalgan xesh.

    Ovoz nomi xeshga ATAYLAB kiradi. Busiz ovozni almashtirganimizda
    eski fayllar joyida qolib, ilova ikki xil ovozda gapirardi — bola
    uchun bu "boshqa odam gapiryapti" degani.

    Matn SHU YERDA tozalanadi, chaqiruvchida emas. `tozala()` idempotent,
    ya'ni ikki marta chaqirilishi hech narsani buzmaydi — lekin uni
    unutgan chaqiruvchi butunlay boshqa faylga murojaat qilib, tayyor
    ovozni "yo'q" deb topardi.
    """
    ovoz = getattr(settings, "AISHA_MODEL", "") or "Gulnoza"
    kayfiyat = getattr(settings, "AISHA_KAYFIYAT", "") or "Cheerful"
    xom = f"{til}|{ovoz}|{kayfiyat}|{tozala(matn)}"
    return hashlib.sha1(xom.encode("utf-8")).hexdigest()[:20]


def yol(matn: str, til: str = "uz") -> Path:
    """Shu matnning kesh fayli qayerda turishi kerakligi (bor-yo'qligidan qat'i nazar)."""
    return kesh_papka() / f"{kalit(matn, til)}{KENGAYTMA}"


def bormi(matn: str, til: str = "uz") -> Path | None:
    """Kesh fayli bor bo'lsa — yo'li, aks holda `None`."""
    p = yol(matn, til)
    return p if p.exists() and p.stat().st_size > 0 else None


class OvozXato(Exception):
    """TTS xizmati javob bermadi yoki rad etdi."""


class BudjetTugadi(OvozXato):
    """Kunlik belgi chegarasi to'lgan — bugun yangi ovoz yasalmaydi."""


# ------------------------------------------------------------- kunlik budjet
#
# Hisob oddiy JSON faylda turadi, `django.core.cache` da emas. Sabab
# amaliy: standart kesh — jarayon ichidagi xotira, gunicorn esa uchta
# ishchi bilan ishlaydi. Ya'ni chegara amalda uch barobar bo'lib
# ketardi. Fayl esa ishchilar uchun umumiy.
#
# Sanoq ANIQ emas va bo'lishi ham shart emas: ikki so'rov bir vaqtda
# kelsa, biri ikkinchisining ustiga yozib, bir nechta belgi hisobdan
# tushib qolishi mumkin. Bu chegara — pulni himoya qiladigan to'siq,
# buxgalteriya emas.


def _hisob_fayl() -> Path:
    return kesh_papka() / "_kunlik.json"


def kunlik_hisob() -> int:
    """Bugun nechta belgi yasalgan."""
    from django.utils import timezone

    try:
        xom = json.loads(_hisob_fayl().read_text(encoding="utf-8"))
    except Exception:                                  # noqa: BLE001 — fayl yo'q yoki buzuq
        return 0
    if xom.get("sana") != timezone.localdate().isoformat():
        return 0
    return int(xom.get("belgi") or 0)


def kunlik_qosh(n: int) -> None:
    """Bugungi hisobga `n` ta belgi qo'shadi."""
    from django.utils import timezone

    bugun = timezone.localdate().isoformat()
    try:
        _hisob_fayl().write_text(
            json.dumps({"sana": bugun, "belgi": kunlik_hisob() + max(0, n)}),
            encoding="utf-8",
        )
    except Exception:                                  # noqa: BLE001
        # Yozolmadik (disk to'la, ruxsat yo'q). Bu ovozni to'xtatish
        # uchun sabab emas — chegara shunchaki bugun ishlamaydi.
        pass


def budjet_bormi(matn: str) -> bool:
    """Shu matnni yasashga bugungi chegara yetadimi."""
    chegara = int(getattr(settings, "OVOZ_KUNLIK_BELGI", 0) or 0)
    if chegara <= 0:
        return True
    return kunlik_hisob() + len(matn) <= chegara


def _sorov(usul: str, url: str, *, sarlavha: dict, tana: bytes | None = None) -> bytes:
    so_rov = urllib.request.Request(url, data=tana, headers=sarlavha, method=usul)
    try:
        with urllib.request.urlopen(so_rov, timeout=KUTISH) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        izoh = ""
        try:
            izoh = e.read().decode("utf-8", "replace")[:300]
        except Exception:                              # noqa: BLE001
            pass
        raise OvozXato(f"HTTP {e.code}: {izoh}") from e
    except Exception as e:                             # noqa: BLE001 — tarmoq
        raise OvozXato(str(e)[:300]) from e


def _multipart(maydon: dict[str, str]) -> tuple[bytes, str]:
    """
    `multipart/form-data` tanasini qo'lda yig'adi.

    Aisha aynan shu ko'rinishni kutadi. Tashqi paket (`requests`)
    qo'shilmadi: loyihada bog'liqliklar ataylab qisqa va bu yerda
    yuboriladigan narsa — bir nechta qisqa matn maydoni.
    """
    chek = f"----aqlzone{uuid.uuid4().hex}"
    bolak: list[bytes] = []
    for nom, qiymat in maydon.items():
        bolak.append(f"--{chek}\r\n".encode())
        bolak.append(f'Content-Disposition: form-data; name="{nom}"\r\n\r\n'.encode())
        bolak.append(f"{qiymat}\r\n".encode())
    bolak.append(f"--{chek}--\r\n".encode())
    return b"".join(bolak), f"multipart/form-data; boundary={chek}"


# ------------------------------------------------------------- ruxsat ro'yxati
#
# NEGA OQ RO'YXAT KERAK. Ovoz butun ilovada yoniq va `gapir()` istalgan
# matnni yubora oladi: dars savoli, yo'lboshchi gapi, kelajakdagi yangi
# ekran. Ularning matni esa TASODIFIY sonlar bilan yasaladi ("8 + 5 = ?")
# — ya'ni har savol YANGI satr bo'ladi va har biri uchun Aisha'ga pul
# ketardi. Bir oyda bu yuz minglab belgi degani.
#
# Kunlik chegara buni to'xtatadi, lekin faqat CHEGARADA: undan
# oldingisi baribir to'lanadi va nima uchun to'langani noma'lum bo'lib
# qoladi.
#
# Oq ro'yxat esa savolni butunlay boshqa tomondan yechadi: YASASH
# faqat biz oldindan tanlagan lug'at uchun mumkin. Qolgan hamma matn
# keshdan (yoki tayyor mp3 to'plamidan) o'qiladi, topilmasa jim
# qoladi — bu esa ilova uchun normal holat.
#
# Ro'yxatga qo'shish oson: `core/lugat/` ga satr qo'shiladi va
# `manage.py ovoz` yurgiziladi.

_LUGAT_PAPKA = Path(__file__).resolve().parent / "lugat"

_ruxsat: set[str] | None = None


def ruxsat_royxati() -> set[str]:
    """
    Yasashga ruxsat berilgan matnlar — `core/lugat/*.txt` dagi hammasi.

    Bir marta o'qiladi va xotirada qoladi: fayl o'zgarmaydi (u kod bilan
    birga keladi), har so'rovda diskka chiqish esa keraksiz.
    """
    global _ruxsat
    if _ruxsat is None:
        toplam: set[str] = set()
        try:
            for f in sorted(_LUGAT_PAPKA.glob("*.txt")):
                for xom in f.read_text(encoding="utf-8").splitlines():
                    s = xom.strip()
                    if s and not s.startswith("#"):
                        toplam.add(tozala(s))
        except Exception:                              # noqa: BLE001
            # Papka yo'q yoki o'qilmadi. Bo'sh ro'yxat = hech narsa
            # yasalmaydi. Bu to'g'ri sukut: sozlamasi buzilgan server
            # pul sarflab qo'ymasligi kerak.
            toplam = set()
        _ruxsat = toplam
    return _ruxsat


def ruxsatmi(matn: str) -> bool:
    """Shu matn uchun YANGI ovoz yasashga ruxsat bormi."""
    return tozala(matn) in ruxsat_royxati()


def tili(matn: str) -> str:
    """
    Matn qaysi tilda — kirill harfi bormi degan savol bo'yicha.

    Lug'at bitta faylda ikki tilni saqlaydi ("mashina" va "машина") va
    ularni TTS ga TO'G'RI til bilan yuborish shart: "машина" ni `uz`
    bilan yuborsak, o'zbek ovozi kirillni harfma-harf o'qib beradi.

    Tekshiruv sodda va shuning uchun ishonchli: o'zbekcha lotin
    yozuvida kirill harfi hech qachon uchramaydi.
    """
    return "ru" if any("Ѐ" <= c <= "ӿ" for c in matn) else "uz"


def yasa(matn: str, til: str = "uz", *, budjet: bool = True) -> Path:
    """
    Matnni ovozga aylantiradi va keshga yozadi. Yo'lini qaytaradi.

    Kesh URINISHDAN OLDIN tekshiriladi: bir vaqtda ikki so'rov kelsa,
    ikkinchisi tayyor faylni topadi va Aisha'ga bekorga chiqmaydi.

    Yozish ATOMAR: avval vaqtinchalik faylga tushadi, keyin joyiga
    ko'chiriladi. Busiz yarim yuklangan fayl kesh bo'lib qolardi va
    ilova o'sha so'zni abadiy "chirillab" o'qirdi.
    """
    matn = tozala(matn)
    if not matn:
        raise OvozXato("matn bo'sh")

    tayyor = bormi(matn, til)
    if tayyor:
        return tayyor

    xizmat_kaliti = getattr(settings, "AISHA_KEY", "") or ""
    if not xizmat_kaliti:
        raise OvozXato("AISHA_KEY sozlanmagan")

    # `budjet=False` — faqat `manage.py ovoz` uchun. U administrator
    # qo'li bilan ishga tushadi va butun lug'atni bir o'tishda
    # tayyorlaydi; kunlik chegara esa begonalardan himoya, o'zimizdan
    # emas.
    if budjet and not budjet_bormi(matn):
        raise BudjetTugadi("kunlik chegara to'ldi")

    maydon = {
        "transcript": matn[:MAX_BELGI],
        "language": til if til in {"uz", "ru", "en"} else "uz",
        # Kayfiyat va ovoz FAQAT o'zbekchada beriladi — Aisha boshqa
        # tilda ularni rad etadi va butun so'rov 400 bo'lib qaytardi.
        **(
            {
                "model": getattr(settings, "AISHA_MODEL", "") or "Gulnoza",
                "mood": getattr(settings, "AISHA_KAYFIYAT", "") or "Cheerful",
                # Bolalar uchun sekinroq. 1.0 — odatdagi tezlik.
                "speed": str(getattr(settings, "AISHA_TEZLIK", "") or "0.9"),
            }
            if til == "uz" else {}
        ),
    }
    tana, tur = _multipart(maydon)
    xom = _sorov(
        "POST", "https://back.aisha.group/api/v1/tts/post/",
        sarlavha={"X-Api-Key": xizmat_kaliti, "Content-Type": tur},
        tana=tana,
    )

    try:
        javob = json.loads(xom)
    except Exception as e:                             # noqa: BLE001
        raise OvozXato("javob JSON emas") from e

    manzil = str(javob.get("audio_path") or "")
    if not manzil:
        raise OvozXato(f"audio_path yo'q: {str(javob)[:200]}")
    # Hujjatda yo'l nisbiy ham bo'lishi mumkin deyilgan; amalda to'liq
    # CDN manzili keladi. Ikkalasi ham qo'llab-quvvatlanadi.
    if manzil.startswith("/"):
        manzil = f"https://back.aisha.group{manzil}"
    if not manzil.startswith("https://"):
        raise OvozXato("audio_path HTTPS emas")

    audio = _sorov("GET", manzil, sarlavha={"User-Agent": "aqlzone"})
    if len(audio) < 512:
        raise OvozXato(f"audio juda kichik ({len(audio)} bayt)")

    manzil_fayl = yol(matn, til)
    vaqtinchalik = manzil_fayl.with_suffix(f".{uuid.uuid4().hex[:8]}.qism")
    vaqtinchalik.write_bytes(audio)
    vaqtinchalik.replace(manzil_fayl)

    # Hisob FAYL YOZILGANDAN KEYIN o'sadi: so'rov yo'lda uzilib qolsa,
    # pul ham ketmagan, ya'ni uni hisoblashning ma'nosi yo'q.
    kunlik_qosh(len(matn))
    return manzil_fayl
