"""
"XATO HAQIDA XABAR BERISH" — foydalanuvchi savolda xato topdi.

Ikki eshik, bitta joy:

  * ilova — har savol ostidagi kichik tugma (`components/XatoXabar.tsx`,
    `POST /api/v1/xato-xabar`);
  * bot   — kun savoli ostidagi "⚠️ Xato haqida" (`core/kun_savoli.py`).

Ikkalasi ham shu yerdagi `saqla` dan o'tadi: tekshiruv, kunlik chegara,
adminga xabar — bir joyda. Aks holda bittasida unutilgan chegara
botni spam quroliga aylantirardi.

─────────────────── NEGA SURAT SAQLANADI ───────────────────

Ilovadagi savollar generatorda HAR SAFAR qaytadan yasaladi — "o'sha
savol"ni keyin topib bo'lmaydi. Shuning uchun xabar bilan birga
savolning o'zi keladi (matn, variantlar, to'g'ri javob, tanlangani):
admin xatoni shu suratdan ko'radi va generatorni tuzatadi.

─────────────────── HAL QILISH ───────────────────

Admin botdagi tugmani ("✅ Tuzatildi" / "❌ Xato emas") yoki paneldagi
`/boshqaruv/xatolar` ni bosadi. Ikkalasi `hal_qil` dan o'tadi — holat
qulf ostida tekshiriladi, ikki admin bir vaqtda bossa ham bir marta.
"Tuzatildi" da xabar bergan odamga bot rahmat aytadi: u yuborgan narsa
izsiz yo'qolmaganini bilsa, keyingi safar yana yozadi.
"""
from __future__ import annotations

import html
import json
import logging
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone

from .models import Identity, Pupil, XatoXabar

log = logging.getLogger(__name__)

SABAB_NOMI = dict(XatoXabar.SABABLAR)

#: Bir odamdan bir kunda shuncha xabar. Halol foydalanuvchi bundan
#: oshirmaydi; oshirgani — tugmani o'yinchoq qilgan bola.
KUNLIK_CHEGARA = 20

#: Savol suratining eng katta hajmi (JSON belgilari). Chizmali savolda
#: SVG bo'lishi mumkin — u surat uchun kerak emas va bazani shishiradi.
SURAT_MAX = 6000

#: Botdagi izoh kutish muddati: "nima xato?" deb so'ralgandan keyin
#: shuncha vaqt ichida yozilgan matn izoh bo'lib qo'shiladi.
IZOH_KUTISH = 15 * 60


def _qisqa(s, n: int) -> str:
    return str(s or "").strip()[:n]


def _surat(xom) -> dict:
    """Mijoz yuborgan savol surati — faqat oddiy maydonlar, chegaralangan."""
    if not isinstance(xom, dict):
        return {}
    toza: dict = {}
    for k, v in xom.items():
        k = str(k)[:24]
        if k in ("rasm", "yechim", "gens"):        # chizma SVG, yechim qadamlari — kerak emas
            continue
        if isinstance(v, (str, int, float, bool)) or v is None:
            toza[k] = v if not isinstance(v, str) else v[:600]
        elif isinstance(v, (list, dict)):
            toza[k] = v
    matn = json.dumps(toza, ensure_ascii=False)
    if len(matn) > SURAT_MAX:
        # Katta ro'yxatlar (rasmli variantlar) — kesiladi, asosiysi qoladi.
        toza = {k: toza[k] for k in ("matn", "prompt", "text", "choices", "answer", "tanlangan", "type")
                if k in toza}
        if len(json.dumps(toza, ensure_ascii=False)) > SURAT_MAX:
            toza = {"matn": str(toza.get("matn") or toza.get("prompt") or "")[:600]}
    return toza


def bugun_soni(pupil: Pupil) -> int:
    bosh = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)
    return XatoXabar.objects.filter(pupil=pupil, created_at__gte=bosh).count()


def saqla(pupil: Pupil | None, d: dict, manba: str = "ilova") -> tuple[str, XatoXabar | None]:
    """
    Xabarni yozadi va adminga yuboradi. `(natija, yozuv)`:

      `saqlandi`  yangi yozuv
      `takror`    shu odam shu savolga bugun allaqachon yozgan — o'sha qaytadi
      `chegara`   kunlik chegara
      `bosh`      hech narsa yo'q (na sabab, na savol)
    """
    sabab = str(d.get("sabab") or "")
    if sabab not in SABAB_NOMI:
        sabab = "boshqa"
    izoh = _qisqa(d.get("izoh"), 500)
    surat = _surat(d.get("savol"))
    kalit = _qisqa(d.get("kalit"), 80)
    joy = _qisqa(d.get("joy"), 160)
    if not surat and not izoh:
        return "bosh", None

    if pupil is not None:
        if kalit:
            bosh = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)
            eski = (XatoXabar.objects.filter(pupil=pupil, kalit=kalit, created_at__gte=bosh)
                    .filter(savol=surat).first() if surat else None)
            if eski is not None:
                return "takror", eski
        if bugun_soni(pupil) >= KUNLIK_CHEGARA:
            return "chegara", None

    x = XatoXabar.objects.create(
        pupil=pupil, manba=manba[:8], joy=joy, kalit=kalit, sabab=sabab, izoh=izoh, savol=surat,
    )
    adminga_yubor(x)
    return "saqlandi", x


# ------------------------------------------------------------ adminga


def _savol_matni(s: dict) -> str:
    """Suratdan odam o'qiydigan savol: matn, variantlar, to'g'ri va tanlangan."""
    e = lambda v: html.escape(str(v), quote=False)
    qator = []
    matn = s.get("matn") or " · ".join(str(s[k]) for k in ("prompt", "text") if s.get(k))
    if matn:
        qator.append(f"❓ {e(str(matn)[:700])}")
    variantlar = s.get("choices") or s.get("variantlar") or []
    togri = s.get("answer")
    tanlangan = s.get("tanlangan")
    if isinstance(variantlar, list) and variantlar:
        vs = []
        for i, v in enumerate(variantlar[:6]):
            belgi = " ✅" if togri is not None and str(v) == str(togri) else ""
            belgi += " 👈" if tanlangan is not None and str(v) == str(tanlangan) else ""
            vs.append(f"{'ABCDEF'[i]}) {e(str(v)[:60])}{belgi}")
        qator.append("\n".join(vs))
    elif togri is not None:
        qator.append(f"Javob: <b>{e(togri)}</b>")
    return "\n".join(qator)


def admin_matni(x: XatoXabar) -> str:
    e = lambda v: html.escape(str(v), quote=False)
    p = x.pupil
    kim = "—"
    if p is not None:
        kim = e(p.toliq_ism or "—")
        if p.username:
            kim += f" @{e(p.username)}"
        kim += f" · #{p.pk}"
    takror = XatoXabar.objects.filter(kalit=x.kalit).count() if x.kalit else 1
    qism = [
        f"⚠️ <b>Xato haqida xabar #{x.pk}</b>",
        f"📍 {e(x.joy or '—')}",
        f"❗ {e(SABAB_NOMI.get(x.sabab, x.sabab))}",
    ]
    if x.izoh:
        qism.append(f"💬 «{e(x.izoh)}»")
    savol = _savol_matni(x.savol or {})
    if savol:
        qism.append(savol)
    qism.append(f"👤 {kim} · {'bot' if x.manba == 'bot' else 'ilova'}")
    if takror > 1:
        qism.append(f"🔁 Shu savolga jami <b>{takror}</b> ta xabar")
    return "\n".join(qism)


def admin_tugmalari(x: XatoXabar) -> list[list[dict]]:
    from .xabar import QIZIL, YASHIL, tugma_yasa

    if x.holat != XatoXabar.YANGI:
        return [[{"text": "✅ Tuzatildi" if x.holat == XatoXabar.TUZATILDI else "❌ Xato emas",
                  "callback_data": "xx_hal"}]]
    return [[tugma_yasa("✅ Tuzatildi", YASHIL, callback_data=f"xx_ok:{x.pk}"),
             tugma_yasa("❌ Xato emas", QIZIL, callback_data=f"xx_rad:{x.pk}")]]


def adminga_yubor(x: XatoXabar) -> None:
    """Har adminga alohida fon vazifasi (`xabar.adminga_yangi_hisob` dagidek)."""
    adminlar = [str(a) for a in getattr(settings, "ADMIN_TG", []) if a]
    if not adminlar or not getattr(settings, "BOT_TOKEN", "") or getattr(settings, "TESTDA", False):
        return
    from .vazifalar import fonda, telegram_xabar

    matn = admin_matni(x)
    for tg_id in adminlar:
        fonda(telegram_xabar, tg_id, matn, klaviatura=admin_tugmalari(x))


def adminga_izoh(x: XatoXabar, izoh: str) -> None:
    """Botda keyin yozilgan izoh — adminga qisqa qo'shimcha."""
    adminlar = [str(a) for a in getattr(settings, "ADMIN_TG", []) if a]
    if not adminlar or not getattr(settings, "BOT_TOKEN", "") or getattr(settings, "TESTDA", False):
        return
    from .vazifalar import fonda, telegram_xabar

    matn = (f"💬 <b>#{x.pk} ga izoh</b> ({html.escape(x.joy or '—', quote=False)})\n"
            f"«{html.escape(izoh, quote=False)}»")
    for tg_id in adminlar:
        fonda(telegram_xabar, tg_id, matn, klaviatura=admin_tugmalari(x))


# ------------------------------------------------------------ hal qilish


def hal_qil(pk: int, holat: str) -> tuple[str, XatoXabar | None]:
    """`(natija, yozuv)`: `hal_qilindi` | `eskirgan` | `yoq`."""
    if holat not in (XatoXabar.TUZATILDI, XatoXabar.RAD):
        return "yoq", None
    with transaction.atomic():
        x = XatoXabar.objects.select_for_update().filter(pk=pk).first()
        if x is None:
            return "yoq", None
        if x.holat != XatoXabar.YANGI:
            return "eskirgan", x
        x.holat = holat
        x.hal_at = timezone.now()
        x.save(update_fields=["holat", "hal_at"])
        # Shu savolga kelgan boshqa yangi xabarlar ham — bitta tuzatish
        # hammasini yopadi, admin har birini alohida bosib o'tirmasin.
        sheriklar = []
        if x.kalit:
            sheriklar = list(XatoXabar.objects.select_for_update()
                             .filter(kalit=x.kalit, holat=XatoXabar.YANGI).exclude(pk=x.pk))
            XatoXabar.objects.filter(pk__in=[s.pk for s in sheriklar]).update(holat=holat, hal_at=x.hal_at)
    if holat == XatoXabar.TUZATILDI:
        for y in [x, *sheriklar]:
            y.holat = holat
            rahmat_yubor(y)
    return "hal_qilindi", x


def rahmat_yubor(x: XatoXabar) -> None:
    """Xabar bergan odamga — "tuzatildi, rahmat". Telegram'i bo'lsa."""
    if x.pupil_id is None or getattr(settings, "TESTDA", False) or not getattr(settings, "BOT_TOKEN", ""):
        return
    p = x.pupil
    if p.bot_bloklandi_at or p.xabar_yopiq_at:
        return
    tg = Identity.objects.filter(pupil_id=x.pupil_id, provider=Identity.TELEGRAM).values_list(
        "external_id", flat=True).first()
    if not tg:
        return
    from .matn import M, tilni_tanla
    from .vazifalar import fonda, telegram_xabar

    til = tilni_tanla(p.til)
    fonda(telegram_xabar, tg, M("xatoTuzatildi", til, joy=html.escape(x.joy or "—", quote=False)))


# ------------------------------------------------------------ panel


def panel_statistika(kunlar: int = 30, holat: str = "yangi") -> dict:
    hozir = timezone.now()
    chegara = hozir - timedelta(days=kunlar)
    qs = XatoXabar.objects.select_related("pupil")
    if holat in dict(XatoXabar.HOLATLAR):
        royxat = qs.filter(holat=holat)
    else:
        holat = "hammasi"
        royxat = qs.all()
    royxat = list(royxat.order_by("-created_at")[:150])
    for x in royxat:
        x.sabab_nomi = SABAB_NOMI.get(x.sabab, x.sabab)
        x.savol_matn = _savol_matni(x.savol or {})
        x.takror = 0
    # Bir savolga kelgan xabarlar soni — eng ko'p shikoyat qilingan tepada ko'rinsin.
    kalitlar = {x.kalit for x in royxat if x.kalit}
    sanoq = dict(XatoXabar.objects.filter(kalit__in=kalitlar).values_list("kalit")
                 .annotate(n=Count("id")).values_list("kalit", "n"))
    for x in royxat:
        x.takror = sanoq.get(x.kalit, 1)

    davr = XatoXabar.objects.filter(created_at__gte=chegara)
    eng_kop = list(davr.exclude(joy="").values("joy").annotate(n=Count("id"))
                   .order_by("-n")[:10])
    sabablar = [{"nom": SABAB_NOMI.get(r["sabab"], r["sabab"]), "n": r["n"]}
                for r in davr.values("sabab").annotate(n=Count("id")).order_by("-n")]
    return {
        "royxat": royxat,
        "holat": holat,
        "kunlar": kunlar,
        "yangi_soni": XatoXabar.objects.filter(holat=XatoXabar.YANGI).count(),
        "davr_soni": davr.count(),
        "tuzatildi_soni": davr.filter(holat=XatoXabar.TUZATILDI).count(),
        "rad_soni": davr.filter(holat=XatoXabar.RAD).count(),
        "bot_soni": davr.filter(manba="bot").count(),
        "odam_soni": davr.exclude(pupil=None).values("pupil").distinct().count(),
        "eng_kop": eng_kop,
        "sabablar": sabablar,
        "yangilangan": hozir,
    }


def navbat_soni() -> int:
    return XatoXabar.objects.filter(holat=XatoXabar.YANGI).count()


def bugungi_sanoq(kun=None) -> dict:
    """Admin kunlik hisoboti uchun: bugun nechta xabar, qaysi manbadan."""
    kun = kun or timezone.localdate()
    qs = XatoXabar.objects.filter(created_at__date=kun)
    return qs.aggregate(jami=Count("id"), bot=Count("id", filter=Q(manba="bot")),
                        ilova=Count("id", filter=Q(manba="ilova")))
