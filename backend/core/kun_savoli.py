"""
KUN SAVOLI — botdan har kuni SHAXSIY savol, har kimga o'z darajasida.

    python manage.py kun_savoli yubor --sinov          # kimga qaysi savol ketishini ko'rsatadi
    python manage.py kun_savoli yubor --faqat <tg_id>  # faqat bitta odamga (sinab ko'rish)
    python manage.py kun_savoli yubor                  # hammaga
    python manage.py kun_savoli hisobot                # adminlarga kunlik hisobot

─────────────────── NIMA BORADI ───────────────────

Rasm (savol + to'rtta variant) va uning ostida tugmalar:

    [ A ] [ B ] [ C ] [ D ]
    [ ⚠️ Xato haqida xabar berish ]
    [ 🔕 Eslatmasin ]

Bosilgach xabarning o'zi o'zgaradi: to'g'ri/noto'g'ri, to'g'ri javob,
qisqa yechim va "bugun N kishi javob berdi, X% to'g'ri" — yangi xabar
yuborilmaydi, suhbat to'lib ketmaydi.

─────────────────── KIMGA, QAYSI DARAJA ───────────────────

Ro'yxatdan o'tgan, Telegram'i bog'langan, botni bloklamagan, "boshqa
yozmang" va "eslatmasin" ni bosmagan har kimga. Daraja anketadan
(`Pupil.anketa_sinf`, `daraja_top`): 7-sinf o'quvchisiga 7-sinf savoli,
talabaga kurs savoli, anketasiz kattaga — "kattalar uchun" tuzoqli test.

Savollar `matematika_kanal.SINF_MISOLLARI` dan — kanaldagi kun misoli
bilan bir manba, javoblari sinovda mustaqil tekshiriladi. Variantlar shu
yerda yasaladi (`variantlar_yasa`): to'g'ri javobga yaqin, ko'rinishi bir
xil (kasr — kasr, vaqt — vaqt), takrorsiz.

─────────────────── ADMIN HISOBOTI ───────────────────

Kechqurun adminlarga: nechta odamga ketdi, nechtasi bosdi, nechtasi
to'g'ri topdi, kim "eslatmasin" bosdi, nechta xato xabari keldi —
darajalar bo'yicha. Panelda esa kunlar kesimida (`/boshqaruv/kun-savoli`).
"""
from __future__ import annotations

import html
import json
import logging
import random
import re
import time
import urllib.error
import urllib.request
from datetime import timedelta
from fractions import Fraction

from django.conf import settings
from django.db import IntegrityError
from django.db.models import Count, Q
from django.utils import timezone

from . import matematika_kanal as MK
from .matn import M, tilni_tanla
from .models import Identity, KunSavoli, KunSavoliJavob, Pupil

log = logging.getLogger(__name__)

#: Bir yurishda eng ko'p xabar (xavfsizlik to'sig'i).
CHEKLOV = 20000

KATTALAR = MK.KATTALAR

#: Anketadagi maxsus bosqichlar → savol darajasi (`tahlil.BOSQICHLAR`).
MAXSUS = {
    0: "1-sinf",            # maktabgacha — eng yengili
    105: "4-kurs",          # magistratura
    130: "4-sinf",          # boshlang'ich sinf o'qituvchisi
    131: "7-sinf",          # 5–9-sinf o'qituvchisi
    132: "10-sinf",         # 10–11-sinf o'qituvchisi
    120: "2-kurs",          # OTM o'qituvchisi
    121: "9-sinf",          # o'quv markazi / repetitor
    140: KATTALAR,          # boshqa · maktab darajasi
    141: "1-kurs",          # boshqa · universitet darajasi
}

#: Admin hisobotida darajalar tartibi.
TARTIB = [*MK.SINF_MISOLLARI, KATTALAR]


#: Ilova kurs slug'i → kun savoli darajasi (`frontend/src/lib/curriculum`).
KURS_DARAJA = {
    "maktabgacha": "1-sinf",
    "oliy-matematika": "1-kurs",
    "oliy-matematika-2": "2-kurs",
    "ehtimollar-nazariyasi": "3-kurs",
}
_KURS_SINF = re.compile(r"^(\d{1,2})-sinf")


def kursdan_daraja(slug: str) -> str | None:
    """"8-sinf-geometriya" → "8-sinf". Tanilmasa — None."""
    slug = (slug or "").strip()
    if slug in KURS_DARAJA:
        return KURS_DARAJA[slug]
    m = _KURS_SINF.match(slug)
    if m and 1 <= int(m.group(1)) <= 11:
        return f"{int(m.group(1))}-sinf"
    return None


def daraja_top(pupil: Pupil) -> str:
    """
    Odamga qaysi darajadagi savol boradi. Avval ilovada OXIRGI ochilgan
    kurs (odam hozir nimani o'qiyotgani), u bo'lmasa — anketa.
    """
    kursdan = kursdan_daraja(pupil.songgi_kurs)
    if kursdan:
        return kursdan
    s = pupil.anketa_sinf
    if pupil.kim == "abiturient":
        return "11-sinf"
    if 1 <= s <= 11:
        return f"{s}-sinf"
    if 101 <= s <= 104:
        return f"{s - 100}-kurs"
    return MAXSUS.get(s, KATTALAR)


# ------------------------------------------------------------ variantlar

_BUTUN = re.compile(r"^−?\d{1,3}(?: \d{3})+$|^−?\d+$")
_KASR = re.compile(r"^−?\d+/\d+$")
_ONLI = re.compile(r"^−?\d+,\d+$")
_VAQT = re.compile(r"^(\d{1,2}):(\d{2})$")


def _butun_fmt(namuna: str):
    guruhli = " " in namuna
    return lambda v: MK._manfiy(MK._son(v) if guruhli else str(v))


def _yigish(togri, nomzodlar, fmt, kalit=lambda v: v) -> tuple[list[str], int] | None:
    """To'g'ri + uchta xato (takrorsiz, ko'rinishi har xil). Yetmasa — None."""
    vs, korilgan = [togri], {fmt(togri)}
    for x in nomzodlar:
        if x is None or kalit(x) == kalit(togri):
            continue
        f = fmt(x)
        if f in korilgan:
            continue
        vs.append(x)
        korilgan.add(f)
        if len(vs) == 4:
            break
    if len(vs) < 4:
        return None
    return [fmt(v) for v in vs], 0


def variantlar_yasa(javob: str, r: random.Random) -> tuple[list[str], int] | None:
    """
    Javob satridan to'rtta variant: to'g'risi va uchta ishonarli xato.
    Javob turi tanilmasa (so'z, ifoda) — None: bunday savol tugmali
    testga yaramaydi va boshqasi tanlanadi.
    """
    j = javob.strip()
    natija = None
    if _BUTUN.match(j):
        n = int(j.replace(" ", "").replace("−", "-"))
        # Uch toifadan bittadan: YAQIN (hisobda adashish), O'RTA (o'nlikda
        # adashish) va TIPIK XATO (ikki baravar, raqamlar o'rni, ishora).
        # Hammasi ±1 bo'lsa to'rtta ketma-ket son chiqardi va to'g'risi
        # deyarli doim o'rtadagisi bo'lib, taxmin bilan topilardi.
        teskari = int(str(abs(n))[::-1]) * (1 if n >= 0 else -1) if abs(n) >= 10 else None
        toifalar = [
            [n + 1, n - 1, n + 2, n - 2],
            [n + 10, n - 10, n + 5, n - 5, n + 3, n - 3],
            [n * 2, n // 2 if n % 2 == 0 else n + 20, -n, teskari, n * 10, n + 100],
        ]
        if n >= 0:
            toifalar = [[x for x in t if x is not None and x >= 0] for t in toifalar]
        tanlov = []
        for t in toifalar:
            t = [x for x in t if x is not None]
            r.shuffle(t)
            tanlov += t[:1]
        zaxira = [x for t in toifalar for x in t if x is not None]
        natija = _yigish(n, tanlov + zaxira, _butun_fmt(j))
    elif _KASR.match(j):
        f = Fraction(j.replace("−", "-"))
        a, b = f.numerator, f.denominator
        nomzod = [Fraction(b, a) if a else None, Fraction(a + 1, b), Fraction(a, b + 1),
                  Fraction(a - 1, b) if a - 1 else None, Fraction(a * 2, b), Fraction(a, b * 2), -f]
        if f > 0:
            nomzod = [x for x in nomzod if x is None or x > 0]
        oldi = nomzod[:4]
        r.shuffle(oldi)
        natija = _yigish(f, oldi + nomzod[4:], MK._kasr)
    elif _ONLI.match(j):
        f = Fraction(j.replace("−", "-").replace(",", "."))
        qadam = Fraction(1, 10 ** len(j.split(",")[1]))
        nomzod = [f + qadam, f - qadam, f * 10, f / 10, f + 1, f - 1, f + 10 * qadam]
        if f > 0:
            nomzod = [x for x in nomzod if x > 0]
        oldi = nomzod[:4]
        r.shuffle(oldi)
        natija = _yigish(f, oldi + nomzod[4:], MK._onli)
    elif (m := _VAQT.match(j)):
        daq = int(m.group(1)) * 60 + int(m.group(2))
        fmt = lambda v: f"{v // 60}:{v % 60:02d}"
        nomzod = [daq + 5, daq - 5, daq + 60, daq - 60, daq + 10, daq - 10, daq + 15]
        oldi = nomzod[:4]
        r.shuffle(oldi)
        natija = _yigish(daq, [x for x in oldi + nomzod[4:] if 0 < x < 24 * 60], fmt)
    if natija is None:
        return None
    vs, _ = natija
    togri = vs[0]
    r.shuffle(vs)
    return vs, vs.index(togri)


def savol_tanla(daraja: str, kun) -> tuple[str, list[str], int, str]:
    """
    (savol, variantlar, to'g'ri raqami, usul) — kunga va darajaga bog'liq,
    qayta chaqirilsa ham o'sha savol. Misol TURI kundan-kunga aylanadi.
    """
    o = kun.toordinal()
    if daraja == KATTALAR or daraja not in MK.SINF_MISOLLARI:
        r = random.Random(o * 13 + 5)
        testlar = MK._testlar(r)
        t = testlar[o % len(testlar)]
        return t[1], list(t[4]), int(t[5]), t[3]
    r = random.Random(o * 31 + TARTIB.index(daraja))
    misollar = MK.SINF_MISOLLARI[daraja](r)
    for k in range(len(misollar)):
        savol, javob, usul = misollar[(o + k) % len(misollar)]
        v = variantlar_yasa(javob, r)
        if v:
            return savol, v[0], v[1], usul
    # Hech biri tugmaga yaramadi (bo'lmasligi kerak) — kattalar testi.
    return savol_tanla(KATTALAR, kun)


def bugungi(daraja: str, kun=None) -> KunSavoli:
    kun = kun or timezone.localdate()
    ks = KunSavoli.objects.filter(sana=kun, daraja=daraja).first()
    if ks:
        return ks
    savol, variantlar, togri, usul = savol_tanla(daraja, kun)
    try:
        return KunSavoli.objects.create(sana=kun, daraja=daraja, savol=savol,
                                        variantlar=variantlar, togri=togri, usul=usul)
    except IntegrityError:                            # parallel yurish allaqachon yaratdi
        return KunSavoli.objects.get(sana=kun, daraja=daraja)


def rasm(ks: KunSavoli) -> bytes:
    return MK.misol_rasmi((ks.daraja, ks.savol), rukn="KUN SAVOLI",
                          pastki="Javobni pastdagi tugmalar bilan bering", variantlar=ks.variantlar)


# ------------------------------------------------------------ Telegram


def _tg(usul: str, payload: dict, rasm_baytlari: bytes | None = None) -> tuple[bool, int, str, dict]:
    """`(ok, http_kodi, izoh, natija)`. Rasm berilsa — multipart."""
    from . import xabar as X

    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/{usul}"
    if rasm_baytlari is not None:
        maydon = {k: (json.dumps(v) if isinstance(v, (dict, list)) else str(v)) for k, v in payload.items()}
        tana, turi = X._multipart(maydon, rasm_baytlari, fayl_nomi="kun-savoli.jpg")
    else:
        tana, turi = json.dumps(payload).encode(), "application/json"
    so_rov = urllib.request.Request(url, data=tana, headers={"Content-Type": turi})
    try:
        with urllib.request.urlopen(so_rov, timeout=40) as r:
            javob = json.loads(r.read())
            return bool(javob.get("ok")), 200, "", javob.get("result") or {}
    except urllib.error.HTTPError as e:
        izoh, kutish = "", 0
        try:
            tana_j = json.loads(e.read())
            izoh = str(tana_j.get("description", ""))[:200]
            kutish = int(tana_j.get("parameters", {}).get("retry_after", 0))
        except Exception:
            pass
        if e.code == 429:
            time.sleep(kutish or X.STANDART_KUTISH)
        return False, e.code, izoh or f"HTTP {e.code}", {}
    except Exception as e:                            # noqa: BLE001 — tarmoq
        return False, 0, str(e)[:200], {}


def _harflar(n: int) -> str:
    return "ABCD"[n]


def klaviatura(j: KunSavoliJavob, til: str) -> list[list[dict]]:
    """Javobgacha: variant tugmalari + xato + eslatmasin."""
    from .xabar import KOK, tugma_yasa

    return [
        [tugma_yasa(_harflar(i), KOK, callback_data=f"ks:{j.pk}:{i}") for i in range(len(j.savol.variantlar))],
        [tugma_yasa(M("tKsXato", til), callback_data=f"ksx:{j.pk}")],
        [tugma_yasa(M("tKsYop", til), callback_data="ks_yop")],
    ]


def _ilova_havola() -> str:
    from . import xabar as X

    havola = X.ilova_havolasi()
    return X.manba_bilan(havola, "kun_savoli")


def javobdan_keyin_klaviatura(j: KunSavoliJavob, til: str, yopiq: bool) -> list[list[dict]]:
    """Javobdan keyin: harflar belgili (bosib bo'lmaydi), ilova, xato, eslatmasin."""
    from .xabar import KOK, YASHIL, tugma_yasa

    ks = j.savol
    qator = []
    for i in range(len(ks.variantlar)):
        belgi = " ✅" if i == ks.togri else (" ❌" if i == j.javob else "")
        qator.append({"text": f"{_harflar(i)}{belgi}", "callback_data": "ks_hal"})
    q = [qator]
    havola = _ilova_havola()
    if havola.startswith("https://") and "t.me/" not in havola:
        q.append([tugma_yasa(M("tKsIlova", til), YASHIL, web_app={"url": havola})])
    elif havola:
        q.append([tugma_yasa(M("tKsIlova", til), YASHIL, url=havola)])
    q.append([tugma_yasa(M("tKsXato", til), callback_data=f"ksx:{j.pk}")])
    if not yopiq:
        q.append([tugma_yasa(M("tKsYop", til), callback_data="ks_yop")])
    return q


def sarlavha(ks: KunSavoli, til: str) -> str:
    return M("ksSarlavha", til, daraja=html.escape(ks.daraja))


def _yuborish(j: KunSavoliJavob, til: str) -> tuple[str, str]:
    """Bitta odamga. `(holat, izoh)`, rasm nusxasi `KunSavoli.file_id` ga yoziladi."""
    ks = j.savol
    payload = {
        "chat_id": j.tg_id,
        "caption": sarlavha(ks, til),
        "parse_mode": "HTML",
        "reply_markup": {"inline_keyboard": klaviatura(j, til)},
    }
    if ks.file_id:
        ok, kod, izoh, natija = _tg("sendPhoto", {**payload, "photo": ks.file_id})
    else:
        ok, kod, izoh, natija = _tg("sendPhoto", payload, rasm(ks))
        if ok:
            rasmlar = natija.get("photo") or []
            if rasmlar:
                ks.file_id = rasmlar[-1].get("file_id", "")
                KunSavoli.objects.filter(pk=ks.pk).update(file_id=ks.file_id)
    if ok:
        j.xabar_id = int(natija.get("message_id") or 0)
        return KunSavoliJavob.YUBORILDI, ""
    if kod == 403 or "chat not found" in izoh.lower():
        return KunSavoliJavob.BLOKLANDI, izoh
    # Rasm nusxasi eskirgan bo'lsa — keyingi odamga qaytadan yuklanadi.
    if ks.file_id and kod == 400 and "file" in izoh.lower():
        ks.file_id = ""
        KunSavoli.objects.filter(pk=ks.pk).update(file_id="")
    return KunSavoliJavob.XATO, izoh


def qabul_qiluvchilar(faqat: str = ""):
    """`(pupil, tg_id)` — bugun kun savoli boradiganlar."""
    qs = (Pupil.objects.filter(registered_at__isnull=False, bot_bloklandi_at__isnull=True,
                               xabar_yopiq_at__isnull=True, kun_savoli_yopiq_at__isnull=True)
          .filter(identities__provider=Identity.TELEGRAM).distinct())
    tg = dict(Identity.objects.filter(provider=Identity.TELEGRAM, pupil__in=qs)
              .values_list("pupil_id", "external_id"))
    for pupil in qs.iterator():
        tg_id = tg.get(pupil.pk)
        if not tg_id or (faqat and tg_id != faqat):
            continue
        yield pupil, tg_id


def yubor_hammaga(sinov: bool = False, limit: int = CHEKLOV, faqat: str = "",
                  chiqar=lambda s: None, kun=None) -> dict:
    """Bugungi kun savoli — hammaga, bir marta. Qayta yursa, olganlar o'tkaziladi."""
    from . import xabar as X

    kun = kun or timezone.localdate()
    olganlar = set(KunSavoliJavob.objects.filter(savol__sana=kun).values_list("pupil_id", flat=True))
    sanoq = {"yuborildi": 0, "bloklandi": 0, "xato": 0, "otkazildi": 0}
    savollar: dict[str, KunSavoli] = {}
    for pupil, tg_id in qabul_qiluvchilar(faqat):
        if pupil.pk in olganlar and not faqat:
            sanoq["otkazildi"] += 1
            continue
        daraja = daraja_top(pupil)
        ks = savollar.get(daraja) or bugungi(daraja, kun)
        savollar[daraja] = ks
        til = tilni_tanla(pupil.til)
        if sinov:
            chiqar(f"  → {tg_id} [{daraja}] {ks.savol.replace(chr(10), ' ')} · "
                   + " | ".join(ks.variantlar) + f" · to'g'ri: {_harflar(ks.togri)}")
            sanoq["yuborildi"] += 1
        else:
            j, yangi = KunSavoliJavob.objects.get_or_create(
                savol=ks, pupil=pupil, defaults={"tg_id": tg_id, "holat": KunSavoliJavob.XATO})
            if not yangi and j.holat == KunSavoliJavob.YUBORILDI and not faqat:
                sanoq["otkazildi"] += 1
                continue
            j.tg_id = tg_id
            holat, izoh = _yuborish(j, til)
            j.holat = holat
            j.yuborilgan_at = timezone.now()
            j.save(update_fields=["tg_id", "holat", "xabar_id", "yuborilgan_at"])
            sanoq[holat] += 1
            if holat == KunSavoliJavob.BLOKLANDI:
                X.bloklanganini_belgila(pupil.pk)
            elif holat == KunSavoliJavob.XATO:
                chiqar(f"  ✗ {tg_id}: {izoh}")
            time.sleep(X.ORALIQ)
        if sanoq["yuborildi"] >= limit:
            break
    return sanoq


# ------------------------------------------------------------ tugmalar (bot)


def _api(usul: str, **payload) -> dict:
    ok, _, _, natija = _tg(usul, payload)
    return natija if ok else {}


def _javob_ber(q: dict, matn: str = "", alert: bool = False) -> None:
    _tg("answerCallbackQuery", {"callback_query_id": q.get("id"), "text": matn[:190], "show_alert": alert})


def _javobni_ol(xom: str, tg_id: str) -> KunSavoliJavob | None:
    if not xom.isdigit():
        return None
    j = KunSavoliJavob.objects.select_related("savol", "pupil").filter(pk=int(xom)).first()
    if j is None or j.tg_id != tg_id:
        return None
    return j


def natija_matni(j: KunSavoliJavob, til: str) -> str:
    ks = j.savol
    e = lambda s: html.escape(str(s), quote=False)
    togri_v = f"{_harflar(ks.togri)}) {ks.variantlar[ks.togri]}"
    if j.togri:
        bosh = M("ksTogri", til, javob=e(togri_v))
    else:
        siz = f"{_harflar(j.javob)}) {ks.variantlar[j.javob]}" if j.javob is not None else "—"
        bosh = M("ksNotogri", til, siz=e(siz), javob=e(togri_v))
    qism = [f"🧩 <b>{'Вопрос дня' if til == 'ru' else 'Kun savoli'}</b> · {e(ks.daraja)}", bosh]
    if ks.usul:
        qism.append(M("ksUsul", til, usul=e(ks.usul)))
    n = ks.javoblar.filter(javob__isnull=False).count()
    if n >= 3:
        togri = ks.javoblar.filter(togri=True).count()
        qism.append(M("ksSanoq", til, daraja=e(ks.daraja), n=n, foiz=round(100 * togri / n)))
    qism.append(M("ksErtaga", til))
    return "\n\n".join(qism)[:1024]


def tugma(q: dict, tg_id: str, til: str, data: str) -> str:
    """Bot `callback_query` dan chaqiriladi: `ks:` `ksx:` `ksxs:` `ks_yop` `ks_hal`."""
    xabar = q.get("message") or {}
    chat_id = (xabar.get("chat") or {}).get("id") or tg_id
    msg_id = xabar.get("message_id")

    if data == "ks_hal":
        _javob_ber(q, M("ksAllaqachon", til))
        return f"{tg_id}: kun savoli — hal qilingan tugma"

    if data == "ks_yop":
        Pupil.objects.filter(identities__provider=Identity.TELEGRAM, identities__external_id=tg_id,
                             kun_savoli_yopiq_at__isnull=True).update(kun_savoli_yopiq_at=timezone.now())
        _javob_ber(q, "🔕")
        # Shu xabardagi "Eslatmasin" qatori olib tashlanadi.
        qatorlar = ((xabar.get("reply_markup") or {}).get("inline_keyboard") or [])
        qoldi = [r for r in qatorlar if not any(t.get("callback_data") == "ks_yop" for t in r)]
        if msg_id and qoldi != qatorlar:
            _api("editMessageReplyMarkup", chat_id=chat_id, message_id=msg_id,
                 reply_markup={"inline_keyboard": qoldi})
        _api("sendMessage", chat_id=chat_id, text=M("ksYopildi", til))
        return f"{tg_id}: kun savoli o'chirildi"

    tur, _, qolgan = data.partition(":")

    if tur == "ks":
        jid, _, xom_i = qolgan.partition(":")
        j = _javobni_ol(jid, tg_id)
        if j is None or not xom_i.isdigit() or int(xom_i) >= len(j.savol.variantlar):
            _javob_ber(q, M("ksEskirgan", til))
            return f"{tg_id}: kun savoli — buzuq tugma"
        if j.javob is not None:
            _javob_ber(q, M("ksAllaqachon", til))
            return f"{tg_id}: kun savoli — takror bosish"
        i = int(xom_i)
        # Faqat BIRINCHI bosish yoziladi — parallel bosish ham ikkinchisini yozmaydi.
        yangilandi = KunSavoliJavob.objects.filter(pk=j.pk, javob__isnull=True).update(
            javob=i, togri=i == j.savol.togri, javob_at=timezone.now())
        if not yangilandi:
            _javob_ber(q, M("ksAllaqachon", til))
            return f"{tg_id}: kun savoli — takror bosish"
        j.javob, j.togri = i, i == j.savol.togri
        _javob_ber(q, "✅" if j.togri else "❌")
        yopiq = bool(j.pupil.kun_savoli_yopiq_at)
        if msg_id:
            _api("editMessageCaption", chat_id=chat_id, message_id=msg_id, parse_mode="HTML",
                 caption=natija_matni(j, til),
                 reply_markup={"inline_keyboard": javobdan_keyin_klaviatura(j, til, yopiq)})
        return f"{tg_id}: kun savoli — {'to‘g‘ri' if j.togri else 'xato'}"

    if tur == "ksx":
        j = _javobni_ol(qolgan, tg_id)
        if j is None:
            _javob_ber(q, M("ksEskirgan", til))
            return f"{tg_id}: kun savoli xato — topilmadi"
        _javob_ber(q)
        from .xabar import tugma_yasa
        _api("sendMessage", chat_id=chat_id, text=M("ksXatoSora", til), parse_mode="HTML",
             reply_to_message_id=msg_id,
             reply_markup={"inline_keyboard": [
                 [tugma_yasa(M("tSababjavob", til), callback_data=f"ksxs:{j.pk}:javob"),
                  tugma_yasa(M("tSababvariant", til), callback_data=f"ksxs:{j.pk}:variant")],
                 [tugma_yasa(M("tSababsavol", til), callback_data=f"ksxs:{j.pk}:savol"),
                  tugma_yasa(M("tSababboshqa", til), callback_data=f"ksxs:{j.pk}:boshqa")],
             ]})
        return f"{tg_id}: kun savoli — xato sababi so'raldi"

    if tur == "ksxs":
        from django.core.cache import cache

        from . import xato_xabar as XX

        jid, _, sabab = qolgan.partition(":")
        j = _javobni_ol(jid, tg_id)
        if j is None:
            _javob_ber(q, M("ksEskirgan", til))
            return f"{tg_id}: kun savoli xato — topilmadi"
        ks = j.savol
        natija, x = XX.saqla(j.pupil, {
            "sabab": sabab,
            "kalit": f"kun:{ks.pk}",
            "joy": f"Kun savoli · {ks.daraja} · {ks.sana:%d.%m.%Y}",
            "savol": {
                "matn": ks.savol,
                "choices": ks.variantlar,
                "answer": ks.variantlar[ks.togri],
                "tanlangan": ks.variantlar[j.javob] if j.javob is not None else None,
                "usul": ks.usul,
            },
        }, manba="bot")
        if natija == "chegara":
            _javob_ber(q, M("ksXatoChegara", til), alert=True)
            return f"{tg_id}: xato xabari — chegara"
        _javob_ber(q, "✅")
        if x is not None:
            cache.set(f"xato_izoh:{tg_id}", x.pk, XX.IZOH_KUTISH)
        if msg_id:
            _api("editMessageText", chat_id=chat_id, message_id=msg_id, text=M("ksXatoRahmat", til),
                 reply_markup={"inline_keyboard": []})
        return f"{tg_id}: xato xabari #{x.pk if x else '-'} ({natija})"

    _javob_ber(q)
    return f"{tg_id}: kun savoli — noma'lum ({data[:24]})"


def izoh_qabul(chat_id, tg_id: str, til: str, matn: str) -> str | None:
    """
    "Nima xato ekanini yozing" dan keyin kelgan oddiy matn — izoh.
    Kutilmayotgan bo'lsa None: bot matnni odatdagidek qayta ishlaydi.
    """
    from django.core.cache import cache

    from . import xato_xabar as XX
    from .models import XatoXabar

    if not matn or matn.startswith("/"):
        return None
    pk = cache.get(f"xato_izoh:{tg_id}")
    if not pk:
        return None
    cache.delete(f"xato_izoh:{tg_id}")
    x = XatoXabar.objects.filter(pk=pk).first()
    if x is None:
        return None
    izoh = matn.strip()[:500]
    x.izoh = (f"{x.izoh}\n{izoh}" if x.izoh else izoh)[:500]
    x.save(update_fields=["izoh"])
    XX.adminga_izoh(x, izoh)
    _api("sendMessage", chat_id=chat_id, text=M("ksIzohOlindi", til))
    return f"{tg_id}: xato #{x.pk} ga izoh"


# ------------------------------------------------------------ hisobot


def _foiz(a: int, b: int) -> int:
    return round(100 * a / b) if b else 0


def kunlik_sonlar(kun=None) -> dict:
    """Bir kunning sanoqlari — admin xabari va panel uchun."""
    from . import xato_xabar as XX

    kun = kun or timezone.localdate()
    qs = KunSavoliJavob.objects.filter(savol__sana=kun)
    jami = qs.aggregate(
        yuborildi=Count("id", filter=Q(holat=KunSavoliJavob.YUBORILDI)),
        bloklandi=Count("id", filter=Q(holat=KunSavoliJavob.BLOKLANDI)),
        xato=Count("id", filter=Q(holat=KunSavoliJavob.XATO)),
        bosdi=Count("id", filter=Q(javob__isnull=False)),
        togri=Count("id", filter=Q(togri=True)),
    )
    darajalar = []
    for r in (qs.values("savol__daraja")
              .annotate(yuborildi=Count("id", filter=Q(holat=KunSavoliJavob.YUBORILDI)),
                        bosdi=Count("id", filter=Q(javob__isnull=False)),
                        togri=Count("id", filter=Q(togri=True)))):
        darajalar.append({
            "daraja": r["savol__daraja"], "yuborildi": r["yuborildi"], "bosdi": r["bosdi"],
            "togri": r["togri"], "bosdi_foiz": _foiz(r["bosdi"], r["yuborildi"]),
            "togri_foiz": _foiz(r["togri"], r["bosdi"]),
        })
    darajalar.sort(key=lambda d: TARTIB.index(d["daraja"]) if d["daraja"] in TARTIB else 99)
    yopdi = Pupil.objects.filter(kun_savoli_yopiq_at__date=kun).count()
    return {
        "kun": kun, **jami,
        "bosdi_foiz": _foiz(jami["bosdi"], jami["yuborildi"]),
        "togri_foiz": _foiz(jami["togri"], jami["bosdi"]),
        "yopdi": yopdi,
        "yopdi_jami": Pupil.objects.filter(kun_savoli_yopiq_at__isnull=False).count(),
        "xato_xabar": XX.bugungi_sanoq(kun),
        "xato_kutilmoqda": XX.navbat_soni(),
        "darajalar": darajalar,
    }


def hisobot_matni(kun=None) -> str:
    s = kunlik_sonlar(kun)
    xx = s["xato_xabar"]
    qism = [
        f"📊 <b>Kun savoli — {s['kun']:%d.%m.%Y}</b>",
        f"📤 Yuborildi: <b>{s['yuborildi']}</b>"
        + (f" · bloklagan {s['bloklandi']}" if s["bloklandi"] else "")
        + (f" · xato {s['xato']}" if s["xato"] else ""),
        f"👆 Bosdi: <b>{s['bosdi']}</b> ({s['bosdi_foiz']}%)",
        f"✅ To'g'ri topdi: <b>{s['togri']}</b> ({s['togri_foiz']}% bosganlardan)",
        f"🔕 Eslatmasin: bugun {s['yopdi']} · jami {s['yopdi_jami']}",
        f"⚠️ Xato xabarlari bugun: {xx['jami'] or 0} (bot {xx['bot'] or 0}, ilova {xx['ilova'] or 0})"
        + (f" · ko'rilmagan: <b>{s['xato_kutilmoqda']}</b>" if s["xato_kutilmoqda"] else ""),
    ]
    if s["darajalar"]:
        qism.append("")
        qism.append("<b>Darajalar bo'yicha</b> (yuborildi → bosdi · to'g'ri):")
        for d in s["darajalar"]:
            qism.append(f"• {html.escape(d['daraja'])}: {d['yuborildi']} → {d['bosdi']} "
                        f"({d['bosdi_foiz']}%) · {d['togri_foiz']}%")
    sayt = (getattr(settings, "SAYT_URL", "") or "").rstrip("/")
    if sayt:
        qism.append(f"\n🔗 {sayt}/boshqaruv/kun-savoli")
    return "\n".join(qism)


def hisobot_yubor(kun=None) -> int:
    from . import xabar as X

    adminlar = [str(a) for a in getattr(settings, "ADMIN_TG", []) if a]
    matn = hisobot_matni(kun)
    n = 0
    for tg_id in adminlar:
        holat, _ = X.yubor(tg_id, matn)
        n += holat == "yuborildi"
    return n


def panel_statistika(kunlar: int = 30) -> dict:
    """`/boshqaruv/kun-savoli`: bugun darajalar bo'yicha va kunlar kesimida."""
    bugun = timezone.localdate()
    boshi = bugun - timedelta(days=kunlar - 1)
    qatorlar = []
    for r in (KunSavoliJavob.objects.filter(savol__sana__gte=boshi)
              .values("savol__sana")
              .annotate(yuborildi=Count("id", filter=Q(holat=KunSavoliJavob.YUBORILDI)),
                        bloklandi=Count("id", filter=Q(holat=KunSavoliJavob.BLOKLANDI)),
                        bosdi=Count("id", filter=Q(javob__isnull=False)),
                        togri=Count("id", filter=Q(togri=True)))
              .order_by("-savol__sana")):
        yopdi = Pupil.objects.filter(kun_savoli_yopiq_at__date=r["savol__sana"]).count()
        qatorlar.append({
            "kun": r["savol__sana"], "yuborildi": r["yuborildi"], "bloklandi": r["bloklandi"],
            "bosdi": r["bosdi"], "togri": r["togri"], "yopdi": yopdi,
            "bosdi_foiz": _foiz(r["bosdi"], r["yuborildi"]),
            "togri_foiz": _foiz(r["togri"], r["bosdi"]),
            "kenglik": _foiz(r["bosdi"], r["yuborildi"]),
        })
    bugungi_savollar = list(KunSavoli.objects.filter(sana=bugun))
    bugungi_savollar.sort(key=lambda k: TARTIB.index(k.daraja) if k.daraja in TARTIB else 99)
    for k in bugungi_savollar:
        k.togri_matn = f"{_harflar(k.togri)}) {k.variantlar[k.togri]}" if k.variantlar else ""
    jami_yuborildi = sum(r["yuborildi"] for r in qatorlar)
    jami_bosdi = sum(r["bosdi"] for r in qatorlar)
    return {
        "bugun": kunlik_sonlar(bugun),
        "kunlar_royxati": qatorlar,
        "bugungi_savollar": bugungi_savollar,
        "kunlar": kunlar,
        "qabul_qiluvchi": sum(1 for _ in qabul_qiluvchilar()),
        "yopdi_jami": Pupil.objects.filter(kun_savoli_yopiq_at__isnull=False).count(),
        "davr_bosdi_foiz": _foiz(jami_bosdi, jami_yuborildi),
        "yangilangan": timezone.now(),
    }
