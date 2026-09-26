"""
ONLAYN O'YINCHILAR — kim hozir ilovada.

─────────────────── NEGA KERAK ───────────────────

Duel shu paytgacha faqat HAVOLA bilan ishlardi: odam chaqiruv
yasaydi, havolani do'stiga yuboradi va javobini kutadi. Bu do'sti
bor odam uchun ishlaydi. Kimsasi yo'q bola esa duelni umuman
o'ynay olmasdi — raqib topadigan joy yo'q edi.

Endi ro'yxat bor: hozir ilovada turgan odamlar ko'rinadi va
bittasini bosib chaqirsa bo'ladi.

─────────────────── KIM RO'YXATGA TUSHADI ───────────────────

Uchta shart va uchalasi ham zarur:

  1. **Oxirgi bir kunda faol** (`Session.last_seen`) — pastdagi
     "NEGA BIR KUN" ga qarang.
  2. **Ro'yxatdan o'tgan.** Ismsiz hisob ro'yxatda "Do'stingiz"
     bo'lib turardi va uni tanlashning ma'nosi yo'q.
  3. **Telegram'i bog'langan.** Chaqiruv Telegram xabari bo'lib
     boradi — boshqa yetkazish yo'li yo'q. Bog'lanmagan odamga
     chaqiruv yuborilsa, u hech qachon yetib bormasdi va
     chaqirgan odam javobini kutib o'tirardi.

─────────────────── NEGA BIR KUN, 15 DAQIQA EMAS ───────────────

Avval ro'yxat faqat oxirgi 15 daqiqada faol bo'lganlarni ko'rsatardi
va u deyarli HAR DOIM BO'SH edi. Sabab arifmetikada: bir kunda
ilovaga o'n besh chog'li odam kiradi, ya'ni istalgan lahzada ichkarida
bir-ikki kishi bo'ladi — va ulardan biri qarayotgan odamning o'zi.

Bo'sh ro'yxat esa xususiyatni o'ldiradi: bola duel ekranini ochadi,
hech kimni ko'rmaydi va boshqa qaramaydi.

Shuning uchun ro'yxat bir kunlik va ikki qismga bo'lingan: HOZIR
onlayn turganlar (`ONLAYN_DAQIQA`) va BUGUN kirganlar. Ikkinchisi
yolg'on emas — chaqiruv Telegram xabari bo'lib boradi va u odam
ilovada bo'lmasa ham yetib boradi. "Onlayn" degan so'z esa faqat
birinchi guruhga nisbatan ishlatiladi.

─────────────────── ISM QAYSI ───────────────────

Reytingdagi bilan BIR XIL manba (`Pupil.toliq_ism`). Bir odam ikki
joyda ikki xil nom bilan ko'rinmasligi kerak, aks holda "bu o'sha
odammi?" degan savol paydo bo'ladi.
"""
from __future__ import annotations

from collections import Counter
from datetime import timedelta

from django.db.models import Max
from django.utils import timezone

from .boshqaruv import ONLAYN_DAQIQA
from .jonli import ESKIRISH
from .models import Faollik, Identity, Profile, Pupil, Session

#: Ro'yxatda ko'pi bilan nechta odam ko'rsatiladi.
#:
#: Uzun ro'yxat tanlashni qiyinlashtiradi va pastdagilar baribir
#: bosilmaydi. Yigirmatasi bir ekranga sig'adi.
MAX_ODAM = 20

#: Ro'yxat qancha orqaga qaraydi (daqiqa). Bir kun — yuqoridagi
#: "NEGA BIR KUN" ga qarang.
ROYXAT_DAQIQA = 24 * 60


def onlayn_pupillar(bundan_tashqari: Pupil | None = None, daqiqa: int = ROYXAT_DAQIQA):
    """
    Faol hisoblar — eng oxirgi ko'ringani birinchi.

    `korindi` annotatsiyasi qaytadi va u chaqiruvchiga kerak:
    "hozir onlayn" bilan "bugun kirgan" ni aynan shu ajratadi.
    """
    chegara = timezone.now() - timedelta(minutes=daqiqa)
    qs = (
        Pupil.objects
        .filter(
            sessions__last_seen__gte=chegara,
            registered_at__isnull=False,
            identities__provider=Identity.TELEGRAM,
        )
        .annotate(korindi=Max("sessions__last_seen"))
        .order_by("-korindi")
        .distinct()
    )
    if bundan_tashqari is not None:
        qs = qs.exclude(pk=bundan_tashqari.pk)
    return qs[:MAX_ODAM]


def royxat(men: Pupil) -> list[dict]:
    """
    Ro'yxat mijozga ketadigan ko'rinishda.

    `profil` — chaqiruv aynan shu profilga yuboriladi. Bir hisobda
    bir necha bola bo'lishi mumkin va chaqiruvni ularning
    ASOSIYSIGA yuboramiz: qaysi bola ilovani ochib turganini server
    bilmaydi.

    `onlayn` — shu odam AYNAN HOZIR ilovadami. Mijoz shu bayroqqa
    qarab yashil nuqta qo'yadi yoki "bugun kirgan" deb yozadi.
    Ikkalasini bitta ro'yxatda berish ataylab: ular bitta savolga —
    "kimni chaqirsam bo'ladi?" — javob beradi va ikki alohida
    so'rov qilish ekranni ikki marta kutdirardi.
    """
    hozir = timezone.now() - timedelta(minutes=ONLAYN_DAQIQA)
    pupillar = list(onlayn_pupillar(men))
    holatlar = holat_xaritasi([p.pk for p in pupillar])
    javob = []
    for p in pupillar:
        profil = p.profiles.order_by("created_at", "pk").first()
        # "Meni chaqirmasin" degan odam ro'yxatda umuman ko'rinmaydi:
        # ko'rinib turib chaqirib bo'lmasligi "nega?" degan savol tug'dirardi.
        if profil is None or profil.taklif_yopiq:
            continue
        onlayn = p.korindi >= hozir
        holat, oyin = holatlar.get(p.pk, (BOSH, ""))
        javob.append({
            "profil": profil.pk,
            "ism": p.toliq_ism or profil.name,
            "avatar": profil.avatar,
            "onlayn": onlayn or holat != BOSH,
            "korindi": p.korindi,
            # Onlayn bo'lmagan odamning holati yo'q — u faqat "yaqinda edi".
            "holat": holat if (onlayn or holat != BOSH) else YOQ,
            "oyin": oyin,
        })
    return javob


# ------------------------------------------------------------ holat

#: Odamning HOZIRGI holati — chaqirish tugmasi shunga qarab o'zgaradi.
#:
#:   bosh      ilovada, hech narsa o'ynamayapti — taklif darhol ko'rinadi
#:   oyinda    mashq o'yinida — o'yin o'rtasida uzilmaydi
#:   duelda    boshqa odam bilan bellashyapti — chaqirib bo'lmaydi
#:   oqiyapti  dars, test yoki masala — o'qish vaqti himoyalanadi
#:   yoq       bugun kirgan, hozir yo'q — faqat bot orqali
BOSH, OYINDA, DUELDA, OQIYAPTI, YOQ = "bosh", "oyinda", "duelda", "oqiyapti", "yoq"


def _yangi_faollik():
    return Faollik.objects.filter(
        updated_at__gte=timezone.now() - timedelta(seconds=ESKIRISH),
    )


def holat_xaritasi(pupil_idlar: list[int]) -> dict[int, tuple[str, str]]:
    """
    `pupil_id → (holat, o'yin)` — faqat faolligi YANGI bo'lganlar uchun.

    Faollik PROFILGA yoziladi, ro'yxat esa hisob (pupil) bo'yicha: bir
    hisobda ikki bola bo'lsa, qaysi biri o'ynayotgani muhim emas — hisob
    band. Bir necha qator bo'lsa eng og'iri olinadi (duel > o'qish > o'yin).
    """
    if not pupil_idlar:
        return {}
    ogirlik = {DUELDA: 3, OQIYAPTI: 2, OYINDA: 1}
    xarita: dict[int, tuple[str, str]] = {}
    for pid, joy, nom in _yangi_faollik().filter(
        profile__pupil_id__in=pupil_idlar,
    ).values_list("profile__pupil_id", "joy", "nom"):
        holat = (
            DUELDA if joy == Faollik.DUEL
            else OYINDA if joy == Faollik.OYIN
            else OQIYAPTI
        )
        oyin = nom if joy in (Faollik.OYIN, Faollik.DUEL) else ""
        eski = xarita.get(pid)
        if eski is None or ogirlik[holat] > ogirlik[eski[0]]:
            xarita[pid] = (holat, oyin)
    return xarita


def profil_holati(profil: Profile) -> str:
    """Bitta profil egasining holati (jonli taklif tekshiruvi uchun)."""
    return holat_xaritasi([profil.pupil_id]).get(profil.pupil_id, (BOSH, ""))[0]


def oyinlar_jonli(men: Pupil) -> dict:
    """
    O'yinlar ekrani uchun: kim qaysi o'yinda — FAQAT SONLAR.

    Ismlar bu yerda qaytmaydi: ekran har 8 soniyada so'raydi va unga
    faqat "• 2" va bannerdagi son kerak. Ro'yxat duel ekranida (`royxat`).

    O'zim sanalmayman: "• 1" ni ko'rib "kimdir bor ekan" deb kirgan bola
    u yerda faqat o'zini topsa, keyingi safar songa ishonmay qo'yadi.
    """
    qatorlar = list(
        _yangi_faollik()
        .filter(joy__in=(Faollik.OYIN, Faollik.DUEL))
        .exclude(profile__pupil=men)
        .values_list("profile__pupil_id", "joy", "nom")
    )
    oyinlar = Counter(nom for _, _, nom in qatorlar if nom)
    chegara = timezone.now() - timedelta(minutes=ONLAYN_DAQIQA)
    onlayn = (
        Session.objects
        .filter(last_seen__gte=chegara, pupil__registered_at__isnull=False)
        .exclude(pupil=men)
        .values("pupil_id").distinct().count()
    )
    oyinda = len({pid for pid, _, _ in qatorlar})
    return {
        "oyinda": oyinda,
        "duelda": len({pid for pid, joy, _ in qatorlar if joy == Faollik.DUEL}),
        # O'yindagilar ham onlayn — `last_seen` 120 s da bir yozilgani
        # uchun ular sessiya bo'yicha tushib qolishi mumkin.
        "onlayn": max(onlayn, oyinda),
        "oyinlar": dict(oyinlar),
    }


def chaqirsa_boladimi(profil: Profile) -> bool:
    """Shu profilga chaqiruv yetib boradimi (Telegram'i bormi)."""
    return profil.pupil.identities.filter(provider=Identity.TELEGRAM).exists()
