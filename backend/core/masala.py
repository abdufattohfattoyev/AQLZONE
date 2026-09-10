"""
Masalalar bo'limining mantig'i.

`views.py` da emas, alohida faylda — chunki bu yerda qoidalar bor va
ular sinovdan HTTP siz o'tishi kerak: kim yechimni ko'ra oladi va
ovoz qanday almashadi.

────────────────────────── UCH QOIDA ──────────────────────────

1. YECHIM URINISHDAN KEYIN. Server yechimni urinmagan odamga umuman
   yubormaydi (`masala_json`). Faqat mijozda yashirilsa, uni har kim
   tarmoq oynasidan o'qib olardi.

2. BIRINCHI URINISH HISOBLANADI. Statistika "birinchi urinishda
   nechta odam yecha oldi" degan savolga javob beradi. Ikkinchi
   urinishda hamma to'g'ri topadi — yechim allaqachon ochiq.

3. TANGA YO'Q. Bo'lim mukofot bilan emas, KO'RINISH bilan ishlaydi:
   "14 kishi yechdi" degan son va muallif sahifasidagi o'quvchilar.
   Tanga bir vaqt bor edi va u faqat noto'g'ri narsani mukofotlardi
   — masala YOZISHNI, uning yaxshi bo'lishini emas. Ustiga u
   tasdiqlash navbatini o'rtamiyona masalalar bilan to'ldirardi va
   narxini admin o'z vaqti bilan to'lardi.
"""
from __future__ import annotations

from django.db import IntegrityError, transaction
from django.db.models import F, Max
from django.utils import timezone

from .models import (
    Masala, MasalaKorish, MasalaOvoz, MasalaUrinish, Profile, javob_normal,
)


# ------------------------------------------------------------------ ko'rinish


def uringanmi(masala: Masala, profile: Profile) -> MasalaUrinish | None:
    """Shu odam bu masalaga urinib ko'rganmi."""
    return MasalaUrinish.objects.filter(masala=masala, profile=profile).first()


def korildi(masala: Masala, profile: Profile) -> bool:
    """
    Masala ochilganini yozadi. Yangi ko'rish bo'lsa `True`.

    Muallifning o'zi sanalmaydi: u masalasini tekshirish uchun,
    tuzatish uchun va shunchaki qarab qo'yish uchun ochadi — bu
    qiziqish emas (`MasalaKorish` dagi izohga qarang).

    Sanoq faqat YANGI ko'rishda oshadi va u `F()` bilan oshiriladi:
    bir masalani bir vaqtda o'nlab odam ochishi mumkin, o'qib-yozish
    orasida esa qo'shni ko'rish yo'qolib ketardi.
    """
    if masala.muallif_id == profile.pk:
        return False

    _, yangi = MasalaKorish.objects.get_or_create(masala=masala, profile=profile)
    if yangi:
        Masala.objects.filter(pk=masala.pk).update(korish_soni=F("korish_soni") + 1)
        masala.refresh_from_db(fields=["korish_soni"])
    return yangi


def yechganlar(masala: Masala, chegara: int = 100) -> list[dict]:
    """
    Kim bu masalaga urinib ko'rgan — administrator uchun ro'yxat.

    Yechganlar ham, YECHOLMAGANLAR ham qaytadi va bu ataylab: "kim
    qiynaldi" degan ma'lumot "kim yechdi" dan kam qimmatli emas.
    Masalani o'nta odam ochib, hech biri yecholmasa — shart noaniq
    yozilgan bo'lishi mumkin va buni faqat shu ro'yxat ko'rsatadi.

    Tartib: OXIRGISI birinchi. Administrator ko'pincha "hozir kim
    yechdi?" degan savol bilan keladi, "birinchi kim yechgan edi?"
    degan savol bilan emas.
    """
    qs = (
        MasalaUrinish.objects
        .filter(masala=masala)
        .select_related("profile__pupil")
        .order_by("-created_at")[:chegara]
    )
    return [
        {
            "profilId": u.profile_id,
            "ism": u.profile.pupil.toliq_ism or u.profile.name,
            "avatar": u.profile.avatar,
            # Uchta holat, uchtasi ham boshqacha o'qiladi:
            #   birinchi=True   — birinchi urinishda topgan
            #   yechdi=True     — topgan, lekin keyingi urinishda
            #   ikkalasi False  — hali topolmagan
            "birinchi": u.togri,
            "yechdi": u.yechdi,
            "urinish": u.soni,
            "sana": u.created_at,
        }
        for u in qs
    ]


def keyingi_masala(masala: Masala, kim: Profile) -> dict | None:
    """
    Yechib bo'lgan odamga keyingi masala.

    ─────────────── NEGA KERAK ───────────────

    Masalani yechgan odam ro'yxatga qaytib, o'sha sahifani qaytadan
    ko'zdan kechirib, keyingisini o'zi qidirishi kerak edi. Ko'pchilik
    qidirmaydi — shu yerda to'xtaydi. Bir bosishli davom yo'li esa
    bo'limni "bitta masala" dan "ketma-ket masalalar" ga aylantiradi.

    ─────────────── QAYSI MASALA TANLANADI ───────────────

    Avval SHU SINFDAN, topilmasa istalganidan. Sinf ustuvorligi
    ataylab: 5-sinf bolasiga olimpiada masalasini berish uni davom
    ettirmaydi, to'xtatadi.

    Urinib ko'rilganlari chiqarib tashlanadi — "keyingi" degani
    yangi degani. O'z masalasi ham chiqarib tashlanadi: uni yechish
    mumkin emas.

    Eng YANGISI birinchi: ro'yxatning o'z tartibi ham shunday va
    ikki joyda ikki xil tartib bo'lsa, odam "bu qayerdan chiqdi?"
    deb qolardi.
    """
    korilgan = MasalaUrinish.objects.filter(profile=kim).values("masala_id")
    tayyor = (
        Masala.objects
        .filter(holat=Masala.TASDIQ)
        .exclude(pk=masala.pk)
        .exclude(pk__in=korilgan)
        .exclude(muallif=kim)
        .order_by("-created_at")
    )
    keyingi = tayyor.filter(sinf=masala.sinf).first() or tayyor.first()
    if keyingi is None:
        return None
    return {
        "id": keyingi.pk,
        "sinf": keyingi.sinf,
        # Matnning boshi — kartada bir qatorlik sarlavha bo'lib
        # turadi. To'lig'i keraksiz: odam uni ochganda baribir o'qiydi.
        "matn": keyingi.matn.strip().split("\n")[0][:120],
        "rasm": keyingi.rasm.url if keyingi.rasm else "",
        "variantlar": list(keyingi.variantlar or []),
    }


def masala_json(masala: Masala, kim: Profile, *, ochiq: bool | None = None) -> dict:
    """
    Masalaning mijozga ketadigan ko'rinishi.

    `yechim` FAQAT quyidagi hollarda qo'shiladi:
      * odamga yechim ochilgan bo'lsa (`MasalaUrinish.yechim_ochiq`:
        to'g'ri yechgan, uch marta urinib ko'rgan yoki tanga
        sarflagan),
      * yoki masalaning O'Z muallifi bo'lsa.

    Muallif istisnosi zarur: u yechimni o'zi yozgan va uni ko'ra
    olmasa, o'z masalasini tuzata ham olmasdi.

    Ilgari yechim BITTA urinishdan keyin ochilardi — ya'ni "yechish"
    bir marta biror narsa yozishdan iborat edi va ikkinchi urinish
    uchun sabab qolmasdi.

    `ochiq` — urinish allaqachon ma'lum bo'lganda qo'shimcha so'rov
    qilmaslik uchun (ro'yxatda ellikta masala bo'ladi).
    """
    oz = masala.muallif_id == kim.pk
    if ochiq is None:
        urinish = uringanmi(masala, kim)
        ochiq = oz or (urinish is not None and urinish.yechim_ochiq)

    d = {
        "id": masala.pk,
        # Ekranda ko'rinadigan raqam — `pk` EMAS. Ikkalasi ikki xil
        # ish qiladi: `pk` havolalar va bog'lanishlar uchun, `raqam`
        # esa odam uchun ("#7 ni ko'rdingmi?"). `pk` da teshiklar
        # bo'ladi va o'n beshta masala "2 dan 16 gacha" bo'lib
        # ko'rinardi (`Masala.raqam` dagi izohga qarang).
        "raqam": masala.raqam or masala.pk,
        "sinf": masala.sinf,
        "matn": masala.matn,
        "holat": masala.holat,
        "muallif": muallif_json(masala.muallif),
        "meniki": oz,
        "urinishSoni": masala.urinish_soni,
        "yechganSoni": masala.yechgan_soni,
        # Nechta ODAM ochgan. Urinishdan boshqa son: ko'p ochilib kam
        # yechilgan masala qiziq-u qiyin, kam ochilgani esa ro'yxatda
        # ko'zga tashlanmayapti (`MasalaKorish` ga qarang).
        "korishSoni": masala.korish_soni,
        "qiyinlik": masala.qiyinlik,
        "like": masala.like_soni,
        "dislike": masala.dislike_soni,
        "createdAt": masala.created_at,
        # Rasm manzili — bo'lmasa bo'sh satr, `null` emas. Mijozda
        # `if (m.rasm)` bir xil ishlaydi va turi doim satr bo'lgani
        # uchun tekshiruv ham soddaroq.
        "rasm": masala.rasm.url if masala.rasm else "",
        # Test variantlari — bo'sh ro'yxat bo'lsa masala javob
        # yoziladigan. Mijoz shu ro'yxatga qarab tugmalar yoki
        # kiritish maydonini chizadi.
        #
        # Ro'yxat ARALASHTIRILMAYDI: to'g'ri javob har safar boshqa
        # o'rinda tursa, masalani ikki marta ochgan odam o'zi topgan
        # javobini tanib olmasdi va bir xil bosishni takrorlay
        # olmasdi. Tartib esa muallif yozgan tartib.
        "variantlar": list(masala.variantlar or []),
        # Yechim ochiqmi — mijoz shunga qarab tugma ko'rsatadi. Maydonning
        # O'ZI yo'qligiga qarab bilish ham mumkin edi, lekin u paytda
        # "yechim yozilmagan" bilan "yechim berilmadi" bir xil ko'rinardi.
        "yechimOchiq": bool(ochiq),
    }
    if ochiq:
        d["yechim"] = masala.yechim
        d["javob"] = masala.javob
    if oz:
        # Rad etilganining sababini FAQAT muallifning o'zi ko'radi.
        if masala.holat == Masala.RAD:
            d["radSababi"] = masala.rad_sababi
    return d


def muallif_json(pr: Profile) -> dict:
    """
    Masala muallifi — ro'yxatda va masala ustida ko'rinadi.

    Ism reyting bilan BIR XIL manbadan olinadi (`Pupil`), ya'ni bir
    odam ikki joyda ikki xil nom bilan ko'rinmaydi.
    """
    pupil = pr.pupil
    return {
        "id": pr.pk,
        "ism": pupil.toliq_ism or pr.name,
        "avatar": pr.avatar,
    }


# ------------------------------------------------------------------- yuborish


def bugungi_soni(profile: Profile) -> int:
    """Shu profil bugun nechta masala yuborgan — kunlik chegara uchun."""
    boshi = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    return Masala.objects.filter(muallif=profile, created_at__gte=boshi).count()


def yubor(
    profile: Profile, sinf: int, matn: str, javob: str, yechim: str, rasm=None,
    variantlar: list[str] | None = None,
) -> Masala:
    """
    Yangi masala — navbatga tushadi, darhol ko'rinmaydi.

    Rasm shu yerda emas, KELISHDAN OLDIN tayyorlanadi
    (`core/rasm.py`): u yerda fayl haqiqatan rasmligini tekshirish
    va EXIF ni tashlash bor va u xato ko'tarishi mumkin — bu esa
    saqlashdan oldin bo'lishi kerak.

    ─────────────── KO'RINADIGAN RAQAM ───────────────

    `raqam` — ekranda turadigan son (`Masala.raqam` dagi izohga
    qarang). U eng kattasidan bittaga oshiriladi va TAKRORLANMAYDI:
    ustunda unikal cheklov bor.

    Ikki odam bir soniyada masala yuborsa, ikkinchisi shu cheklovga
    urilishi mumkin — o'shanda bir marta qaytadan urinamiz. Qulf
    olish ham mumkin edi, lekin masala kuniga bir-ikkitadan
    yuboriladi: har yuborishga qulf qo'yish shu ehtimol uchun
    qimmat narx bo'lardi.
    """
    maydonlar = dict(
        muallif=profile, sinf=sinf,
        matn=matn.strip(), javob=javob.strip(), yechim=yechim.strip(),
        variantlar=variantlar or [],
        rasm=rasm or None,
        holat=Masala.KUTMOQDA,
    )
    for _ in range(2):
        keyingi = (Masala.objects.aggregate(m=Max("raqam"))["m"] or 0) + 1
        try:
            with transaction.atomic():
                return Masala.objects.create(raqam=keyingi, **maydonlar)
        except IntegrityError:
            continue
    # Ikki urinishdan keyin ham bo'lmadi — masala RAQAMSIZ saqlanadi.
    # Uni yo'qotgandan ko'ra shunisi yaxshi: raqam ekrandagi yozuv,
    # masalaning o'zi esa odamning mehnati.
    return Masala.objects.create(**maydonlar)


# -------------------------------------------------------------------- yechish


@transaction.atomic
def javob_ber(masala: Masala, profile: Profile, javob: str) -> dict:
    """
    Javobni tekshiradi va yechimni ochadi.

    Natija: `{togri, birinchi, yechim, javob, ...}`.

    `birinchi` — shu odamning BIRINCHI urinishimi. Sanoqlar faqat
    shunda o'zgaradi. Ikkinchi marta javob bergan odam statistikaga
    tegmaydi — "nechta odam O'ZI yecha oldi" degan son halol
    qolishi kerak.

    ─────────────── XATO JAVOB YECHIMNI OCHMAYDI ───────────────

    Ilgari yechim ham, TO'G'RI JAVOB ham birinchi urinishdan keyin
    darhol ko'rinardi — to'g'ri yechganga ham, xato qilganga ham.
    Ya'ni masalani "yechish" bir marta biror narsa yozishdan iborat
    edi va ikkinchi urinish uchun sabab qolmasdi.

    Endi xato javobdan keyin faqat "bo'lmadi" deyiladi. Yechim uch
    yo'l bilan ochiladi:

      * to'g'ri javob berilsa,
      * uch marta xato urinishdan keyin — bepul
        (`MasalaUrinish.YECHIM_BEPUL`),
      * tanga sarflab — shoshayotgan odam uchun
        (`views.masala_yechim`).

    Tanga narxi va mukofoti MIJOZDA hisoblanadi (`lib/progress.tsx`),
    chunki tanga hisobi shu paytgacha o'sha yerda turadi. Server esa
    yechimni QO'RIQLAYDI: u ochilmagan bo'lsa, javob ham, yechim ham
    umuman yuborilmaydi.
    """
    togri = javob_normal(javob) == javob_normal(masala.javob)
    urinish, birinchi = MasalaUrinish.objects.get_or_create(
        masala=masala, profile=profile,
        defaults={"togri": togri, "yechdi": togri, "soni": 1, "yechim_ochiq": togri},
    )

    if birinchi:
        # Ikkala sanoq ham bitta so'rovda — o'qib-yozish orasida
        # boshqa urinish tushsa, sanoq yo'qolmasin.
        Masala.objects.filter(pk=masala.pk).update(
            urinish_soni=F("urinish_soni") + 1,
            yechgan_soni=F("yechgan_soni") + (1 if togri else 0),
        )
        masala.refresh_from_db(fields=["urinish_soni", "yechgan_soni"])
    else:
        urinish.soni = F("soni") + 1
        urinish.save(update_fields=["soni"])
        urinish.refresh_from_db(fields=["soni"])

    # To'g'ri javob yechimni ochadi. Uch marta urinib topolmagan odamga
    # ham ochiladi — u yordamsiz oldinga siljimaydi.
    yangilanadi = []
    if not urinish.yechim_ochiq and (
        togri or urinish.soni >= MasalaUrinish.YECHIM_BEPUL
    ):
        urinish.yechim_ochiq = True
        yangilanadi.append("yechim_ochiq")

    # `yechdi` — QAYSI urinishda topganidan qat'i nazar. Statistika
    # `togri` ga (birinchi urinishga) quriladi va shunday qolishi
    # kerak, lekin ro'yxatda odamni "yecholmagan" deb ko'rsatish
    # uning mehnatini inkor qilish bo'lardi.
    if togri and not urinish.yechdi:
        urinish.yechdi = True
        yangilanadi.append("yechdi")

    if yangilanadi:
        urinish.save(update_fields=yangilanadi)

    natija = {
        "togri": togri,
        "birinchi": birinchi,
        "urinishim": urinish.soni,
        "yechimOchiq": urinish.yechim_ochiq,
        "urinishSoni": masala.urinish_soni,
        "yechganSoni": masala.yechgan_soni,
        # Birinchi urinishning natijasi keyin o'zgarmaydi — mijoz
        # shuni ko'rsatadi ("siz buni yechgansiz" yoki "yecholmagansiz").
        "birinchiTogri": urinish.togri,
    }
    if urinish.yechim_ochiq:
        natija["yechim"] = masala.yechim
        natija["javob"] = masala.javob
    return natija


def yechimni_och(masala: Masala, profile: Profile) -> dict | None:
    """
    Yechimni ochadi — tanga evaziga.

    `None` qaytsa, odam bu masalaga hali UMUMAN urinmagan: yechimni
    urinmasdan sotib olish mumkin emas, aks holda bo'lim javoblar
    ro'yxatiga aylanardi.

    Tanga mijozda yechiladi. Server bu yerda faqat ochilganini
    yozib qo'yadi — shunda odam ilovani qayta ochganda yechim
    joyida turadi va ikkinchi marta to'lamaydi.
    """
    urinish = uringanmi(masala, profile)
    if urinish is None:
        return None
    if not urinish.yechim_ochiq:
        urinish.yechim_ochiq = True
        urinish.save(update_fields=["yechim_ochiq"])
    return {"yechim": masala.yechim, "javob": masala.javob, "yechimOchiq": True}


# --------------------------------------------------------------------- ovozlar


@transaction.atomic
def ovoz_ber(masala: Masala, profile: Profile, tur: str) -> dict:
    """
    Like yoki dislike qo'yadi, almashtiradi yoki QAYTARIB OLADI.

    O'sha tugmani ikkinchi marta bosish ovozni olib tashlaydi. Busiz
    bexosdan bosilgan dislike'ni qaytarib bo'lmasdi va bu, masala
    ostida turgan sonni hisobga olsak, muallif uchun haqsizlik
    bo'lardi.

    Sanoqlar `Masala` ustunlarida yangilanadi — `F()` bilan, ya'ni
    ikki odam bir vaqtda bosganda ham biri yo'qolmaydi.
    """
    eski = MasalaOvoz.objects.filter(masala=masala, profile=profile).first()
    ozgarish = {"like_soni": 0, "dislike_soni": 0}
    ustun = {MasalaOvoz.LIKE: "like_soni", MasalaOvoz.DISLIKE: "dislike_soni"}

    if eski and eski.tur == tur:
        eski.delete()                                   # qaytarib olindi
        ozgarish[ustun[tur]] -= 1
        joriy = ""
    elif eski:
        ozgarish[ustun[eski.tur]] -= 1                  # almashtirildi
        ozgarish[ustun[tur]] += 1
        eski.tur = tur
        eski.save(update_fields=["tur"])
        joriy = tur
    else:
        MasalaOvoz.objects.create(masala=masala, profile=profile, tur=tur)
        ozgarish[ustun[tur]] += 1
        joriy = tur

    Masala.objects.filter(pk=masala.pk).update(
        like_soni=F("like_soni") + ozgarish["like_soni"],
        dislike_soni=F("dislike_soni") + ozgarish["dislike_soni"],
    )
    masala.refresh_from_db(fields=["like_soni", "dislike_soni"])
    return {"ovozim": joriy, "like": masala.like_soni, "dislike": masala.dislike_soni}


def ovozlarim(profile: Profile, idlar: list[int]) -> dict[int, str]:
    """Ro'yxatdagi masalalarga shu odam qanday ovoz bergan."""
    if not idlar:
        return {}
    return dict(
        MasalaOvoz.objects
        .filter(profile=profile, masala_id__in=idlar)
        .values_list("masala_id", "tur")
    )


# ------------------------------------------------------------------ tasdiqlash


@transaction.atomic
def tasdiqla(masala: Masala) -> None:
    """
    Masalani ro'yxatga chiqaradi.

    Ikkinchi marta tasdiqlash hech narsa qilmaydi: admin bir tugmani
    ikki marta bosishi odatiy hol.
    """
    if masala.holat == Masala.TASDIQ:
        return
    masala.holat = Masala.TASDIQ
    masala.rad_sababi = ""
    masala.korilgan_at = timezone.now()
    masala.save(update_fields=["holat", "rad_sababi", "korilgan_at"])


def rad_et(masala: Masala, sabab: str) -> None:
    """
    Masalani rad etadi. SABAB majburiy — muallif nimani tuzatishni bilsin.

    """
    masala.holat = Masala.RAD
    masala.rad_sababi = (sabab or "").strip()[:300]
    masala.korilgan_at = timezone.now()
    masala.save(update_fields=["holat", "rad_sababi", "korilgan_at"])


def navbat_soni() -> int:
    """Ko'rilmagan masalalar soni — boshqaruv panelidagi belgi uchun."""
    return Masala.objects.filter(holat=Masala.KUTMOQDA).count()
