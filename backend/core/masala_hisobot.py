"""
Masalalar bo'limining hisoboti — /boshqaruv/masalalar/hisobot.

─────────────────────── NEGA ALOHIDA SAHIFA ───────────────────────

Masalalar bo'limi qolgan ilovadan BOSHQACHA ishlaydi. Darslar
generator bilan yasaladi va ular haqida beriladigan savol bitta:
"bola o'tdimi". Masala esa ODAM yozadi, ikkinchi odam yechadi —
shuning uchun uning ustida uchta boshqa-boshqa savol turadi:

    1. Bugun bo'lim TIRIKMI      → kim yechdi, nechta odam, nechta masala
    2. Masalalar YAXSHIMI        → ko'rdi → urindi → yechdi voronkasi
    3. Kim YOZYAPTI va yozgani ishlayaptimi → mualliflar jadvali

Bu savollar asosiy panelning ichiga sig'maydi: u yerda hamma raqam
"nechta bola mashq qildi" degan o'lchov atrofida turadi va masala
raqamlari u yerda yo'qolib ketardi.

─────────────────────── NIMA SANALADI ───────────────────────

Asosiy panel ro'yxatdan o'tmagan hisoblarni CHETLAB o'tadi
(`boshqaruv.ROYXAT`): u qatorlar odam ilovani ko'rishidan oldin
yaraladi va hisobotni bo'sh hisoblar bilan to'ldirardi.

Bu yerda esa bunday filtr YO'Q va bu ataylab. Urinish qatori o'z-o'zidan
paydo bo'lmaydi — kimdir masalani ochib, o'qib, javob yozgan bo'ladi.
Uni "ro'yxatdan o'tmagan" degani uchun sanamaslik bo'lgan ishni inkor
qilish bo'lardi, va "bugun nechta odam yechdi" degan son haqiqatdan
kam chiqardi.
"""
from __future__ import annotations

from datetime import timedelta

from django.db.models import Count, Q, Sum
from django.http import Http404
from django.shortcuts import render
from django.utils import timezone

from .boshqaruv import (
    _chiziq, _foiz, _ozgarish, _yoniq, davr as davr_tanla, kirganmi, kirish,
    sinf_nomi,
)
from .models import Masala, MasalaKorish, MasalaUrinish

#: Jadvallarda bir sahifada nechta qator ko'rsatiladi.
#:
#: Chegara brauzer uchun: jadvallar sahifada to'liq chiziladi va
#: qidiruv ham, saralash ham o'sha yerda ishlaydi. Bir necha ming
#: qator bo'lsa sahifa ochilishda qotib qolardi.
MASALA_CHEGARA = 300
ODAM_CHEGARA = 200
OQIM_CHEGARA = 50

#: "Eng qiyin" va "eng oson" ro'yxatiga tushish uchun kerakli
#: urinishlar soni.
#:
#: Ikkita urinishdan chiqqan 0% ham, 100% ham tasodif. Bunday qatorni
#: ro'yxat boshiga qo'yish esa admin e'tiborini aynan HECH NARSA
#: ko'rsatmaydigan masalaga qaratardi.
QIYINLIK_MIN = 5


def _ism(first: str, last: str, profil: str) -> str:
    """
    Jadvalda ko'rinadigan nom.

    Uch bosqich: hisobning to'liq ismi → profil nomi → bo'sh chiziq.
    Ikkinchisi kerak, chunki masalani BOLA yechadi va hisob ota-onaniki
    bo'lishi mumkin — ismi kiritilmagan hisobda profil nomi yagona
    ko'rsatkich bo'lib qoladi.
    """
    toliq = " ".join(x for x in (first or "", last or "") if x).strip()
    return toliq or (profil or "").strip() or "—"


def hisobot(kunlar: int = 30) -> dict:
    """
    Sahifaning butun ma'lumoti — bitta joyda.

    Tuzilishi asosiy paneldagi bilan bir xil: avval bir marta o'qib
    olinadigan xom ma'lumot, keyin undan chiqadigan hamma ko'rsatkich.
    Ya'ni yangi raqam kerak bo'lganda yangi so'rov emas, o'sha
    to'plamdan hisob qo'shiladi.
    """
    hozir = timezone.now()
    bugun = timezone.localtime(hozir).date()
    oraliq = hozir - timedelta(days=kunlar)
    oraliq_kun = bugun - timedelta(days=kunlar - 1)

    # ------------------------------------------------------ xom ma'lumot
    #
    # Butun urinishlar tarixi bo'ylab BITTA o'tish. Undan chiqadigan
    # narsalar: bugungi sonlar, kunlik grafik, yechuvchilar jadvali,
    # "bugun kim yechdi" ro'yxati va so'nggi oqim. Har biri uchun
    # alohida so'rov yozilsa, sahifa o'nlab `GROUP BY` ga aylanardi.
    xom = list(
        MasalaUrinish.objects.values_list(
            "profile__pupil_id",
            "profile__pupil__first_name",
            "profile__pupil__last_name",
            "profile__name",
            "masala__raqam",
            "masala_id",
            "togri",
            "yechdi",
            "soni",
            "created_at",
            "yechdi_at",
        )
    )

    odamlar: dict = {}          # hisob → yechuvchi jadvalining qatori
    kun_yechish: dict = {}      # kun → o'sha kuni yechilgan masalalar
    kun_yechgan: dict = {}      # kun → o'sha kuni yechgan odamlar
    kun_urinish: dict = {}      # kun → o'sha kuni boshlangan urinishlar
    kun_uringan: dict = {}      # kun → o'sha kuni urinib ko'rgan odamlar
    bugungilar: list = []       # bugun yechilganlar, oxirgisi birinchi

    jami_urinish = jami_yechdi = jami_birinchida = 0

    for (
        pupil, first, last, profil_ism, raqam, masala_id,
        togri, yechdi, soni, boshlandi, yechildi,
    ) in xom:
        ism = _ism(first, last, profil_ism)
        u_kun = timezone.localtime(boshlandi).date()

        jami_urinish += 1
        jami_yechdi += 1 if yechdi else 0
        jami_birinchida += 1 if togri else 0

        kun_urinish[u_kun] = kun_urinish.get(u_kun, 0) + 1
        kun_uringan.setdefault(u_kun, set()).add(pupil)

        o = odamlar.get(pupil)
        if o is None:
            o = odamlar[pupil] = {
                "id": pupil, "ism": ism,
                "bosh": (ism[:1] or "?").upper(),
                "qidiruv": ism.lower(),
                "masalalar": 0, "yechdi": 0, "birinchida": 0,
                "javoblar": 0, "kunlar": set(), "oxirgi": None,
            }
        o["masalalar"] += 1
        o["javoblar"] += soni or 1
        o["yechdi"] += 1 if yechdi else 0
        o["birinchida"] += 1 if togri else 0

        if yechdi and yechildi is not None:
            y_kun = timezone.localtime(yechildi).date()
            o["kunlar"].add(y_kun)
            if o["oxirgi"] is None or yechildi > o["oxirgi"]:
                o["oxirgi"] = yechildi
            kun_yechish[y_kun] = kun_yechish.get(y_kun, 0) + 1
            kun_yechgan.setdefault(y_kun, set()).add(pupil)
            if y_kun == bugun:
                bugungilar.append({
                    "ism": ism,
                    "bosh": (ism[:1] or "?").upper(),
                    "raqam": raqam,
                    "masala": masala_id,
                    "vaqt": yechildi,
                    "birinchida": togri,
                    "urinish": soni or 1,
                })

    bugungilar.sort(key=lambda b: b["vaqt"], reverse=True)

    # Ko'rishlar alohida jadvalda: masalani ochgan, lekin javob
    # yozmagan odam urinishlar ichida umuman turmaydi. Aynan u
    # voronkaning eng muhim qadami — "ochdi-yu, urinmadi".
    kun_korgan: dict = {}
    korgan_odamlar: set = set()
    for pupil, sana in MasalaKorish.objects.values_list(
        "profile__pupil_id", "created_at"
    ):
        korgan_odamlar.add(pupil)
        kun_korgan.setdefault(timezone.localtime(sana).date(), set()).add(pupil)

    # ---------------------------------------------------------- masalalar
    masalalar_qs = Masala.objects.select_related("muallif__pupil")
    sanoq = dict(masalalar_qs.values_list("holat").annotate(n=Count("id")))
    tasdiq_qs = masalalar_qs.filter(holat=Masala.TASDIQ)

    yigindi = tasdiq_qs.aggregate(
        korish=Sum("korish_soni"),
        urinish=Sum("urinish_soni"),
        yechdi=Sum("yechdi_soni"),
        birinchida=Sum("yechgan_soni"),
        like=Sum("like_soni"),
        dislike=Sum("dislike_soni"),
    )
    korish = yigindi["korish"] or 0
    urinish = yigindi["urinish"] or 0
    yechildi = yigindi["yechdi"] or 0
    birinchida = yigindi["birinchida"] or 0

    # ------------------------------------------------------------- bugun
    #
    # Sahifaning eng tepasidagi qator. Savol bitta va u har kuni bir
    # xil: **bo'lim bugun tirikmi**.
    bugun_sonlar = {
        "yechganlar": len(kun_yechgan.get(bugun, ())),
        "yechishlar": kun_yechish.get(bugun, 0),
        "uringanlar": len(kun_uringan.get(bugun, ())),
        "urinishlar": kun_urinish.get(bugun, 0),
        "korganlar": len(kun_korgan.get(bugun, ())),
        "yangi": masalalar_qs.filter(created_at__date=bugun).count(),
        "navbat": sanoq.get(Masala.KUTMOQDA, 0),
    }

    # Kecha bilan solishtirish. Bitta kunning soni o'z-o'zidan hech
    # narsa demaydi — u faqat kechagisi yonida ma'no oladi.
    kecha = bugun - timedelta(days=1)
    kechagi = {
        "yechganlar": len(kun_yechgan.get(kecha, ())),
        "yechishlar": kun_yechish.get(kecha, 0),
        "uringanlar": len(kun_uringan.get(kecha, ())),
    }
    # Farq shablonda hisoblab bo'lmaydi (u yerda arifmetika yo'q) va
    # `None` — solishtirish MA'NOSIZ bo'lgan holat: kecha umuman
    # harakat bo'lmagan bo'lsa, "+500%" yozib qo'yish yolg'on bo'lardi.
    farq = {
        nom: _ozgarish(bugun_sonlar[nom], kechagi[nom])
        for nom in ("yechganlar", "yechishlar", "uringanlar")
    }

    # -------------------------------------------------------- davr ichida
    davr_yechish = sum(n for k, n in kun_yechish.items() if k >= oraliq_kun)
    davr_yechgan = set()
    for k, odam in kun_yechgan.items():
        if k >= oraliq_kun:
            davr_yechgan |= odam
    davr_urinish = sum(n for k, n in kun_urinish.items() if k >= oraliq_kun)

    davr = {
        "yechishlar": davr_yechish,
        "yechganlar": len(davr_yechgan),
        "urinishlar": davr_urinish,
        "yangi_masala": masalalar_qs.filter(created_at__gte=oraliq).count(),
        "kunlik": round(davr_yechish / (kunlar or 1), 1),
    }

    # ----------------------------------------------------------- voronka
    #
    # Masalalar bo'limining butun sog'ligi shu to'rt qatorda. Har qadam
    # oldingisining ICHIDA turadi va eng katta tushish qayerda bo'lsa,
    # ish ham o'sha yerda:
    #
    #   ko'rdi → urindi   past bo'lsa — masala matni qo'rqitadi
    #   urindi → yechdi   past bo'lsa — masala juda qiyin yoki noaniq
    voronka = []
    oldingi = None
    for nom, son, izoh in (
        ("Masalani ochgan", korish, "ro'yxatdan bosib kirgan (muallif sanalmaydi)"),
        ("Javob yozgan", urinish, "kamida bir marta urinib ko'rgan"),
        ("Yechgan", yechildi, "nechanchi urinishda bo'lishidan qat'i nazar"),
        ("Birinchi urinishda", birinchida, "yordamsiz, birinchi javobdayoq"),
    ):
        q = {"nom": nom, "son": son, "izoh": izoh, "foiz": _foiz(son, korish)}
        q["tushdi"] = (oldingi["son"] - son) if oldingi else 0
        q["tushdi_foiz"] = _foiz(q["tushdi"], oldingi["son"]) if oldingi else 0
        voronka.append(q)
        oldingi = q

    # ------------------------------------------------------ kunlik grafik
    qator = []
    for i in range(kunlar - 1, -1, -1):
        k = bugun - timedelta(days=i)
        qator.append({
            "sana": k,
            "kun": k.strftime("%d.%m"),
            "yechish": kun_yechish.get(k, 0),
            "yechgan": len(kun_yechgan.get(k, ())),
            "urinish": kun_urinish.get(k, 0),
            "dam": k.weekday() >= 5,
        })
    eng_yechish = max([q["yechish"] for q in qator] + [1])
    eng_yechgan = max([q["yechgan"] for q in qator] + [1])
    for q in qator:
        q["balandlik"] = round(q["yechish"] * 100 / eng_yechish)

    grafik = {
        "qator": qator,
        "eng_yechish": eng_yechish,
        "eng_yechgan": eng_yechgan,
        # Yechgan ODAMLAR chizig'i — ustunlar ustidan o'tadigan ikkinchi
        # qatlam. Ikkalasi birga "ko'p yechildimi yoki ko'p odam
        # yechdimi" degan farqni ko'rsatadi.
        "chiziq": _chiziq([q["yechgan"] for q in qator], eng_yechgan),
        "belgilar": (
            [qator[0]["kun"], qator[len(qator) // 2]["kun"], qator[-1]["kun"]]
            if qator else []
        ),
    }

    # ------------------------------------------------------ yechuvchilar
    for o in odamlar.values():
        o["kun_soni"] = len(o["kunlar"])
        o["oxirgi_kun"] = (
            (bugun - max(o["kunlar"])).days if o["kunlar"] else None
        )
        # "Birinchi urinishda topish" ulushi — odamning O'Z kuchi
        # bilan yechganlari. Yechganlariga emas, URINGANLARIGA
        # nisbatan olinadi: maxrajni yechganlar qilib qo'ysak, u
        # "yecholmagan" masalalarni butunlay yashirardi.
        o["foiz"] = _foiz(o["birinchida"], o["masalalar"])
        # O'rtacha necha javobdan keyin topgan. 1,0 — hammasini
        # birinchi urinishda; 3,0 dan yuqorisi masala qiyinligidan
        # ham ko'ra ro'yxatda tasodifiy javob terilganini bildiradi.
        o["ortacha"] = round(o["javoblar"] / (o["masalalar"] or 1), 1)
        del o["kunlar"]

    yechuvchilar = sorted(
        odamlar.values(), key=lambda o: (-o["yechdi"], -o["masalalar"])
    )[:ODAM_CHEGARA]
    yechuvchi_soni = sum(1 for o in odamlar.values() if o["yechdi"])

    # ---------------------------------------------------- masalalar jadvali
    #
    # Sanoqlar `Masala` ustunlaridan olinadi, urinishlar jadvalidan
    # sanalmaydi: ular allaqachon o'sha yerda turadi va yuzta masalali
    # sahifa yuzta guruh so'rovini keltirib chiqarmasligi kerak.
    masalalar = []
    for m in masalalar_qs.order_by("-created_at")[:MASALA_CHEGARA]:
        muallif = m.muallif.pupil.muallif_ismi or m.muallif.name or "—"
        masalalar.append({
            "id": m.pk,
            "raqam": m.raqam,
            "matn": m.matn,
            "holat": m.holat,
            "sinf": sinf_nomi(m.sinf),
            "muallif": muallif,
            "qidiruv": f"{m.raqam or ''} {muallif} {m.matn[:120]}".lower(),
            "korish": m.korish_soni,
            "urinish": m.urinish_soni,
            "yechdi": m.yechdi_soni,
            "birinchida": m.yechgan_soni,
            # Urinmaganlar uchun 100 emas, bo'sh: jadvalda "100%"
            # degan raqam "hamma yechdi" bo'lib o'qilardi, aslida
            # esa hech kim urinmagan bo'ladi.
            "qiyinlik": m.qiyinlik if m.urinish_soni else None,
            "urinish_foiz": _foiz(m.urinish_soni, m.korish_soni),
            "like": m.like_soni,
            "dislike": m.dislike_soni,
            "ovoz": m.ovoz,
            "kanalda": bool(m.kanal_at) and not m.kanal_yoq,
            "kanal_yoq": m.kanal_yoq,
            "sana": m.created_at,
        })

    # Eng qiyin va eng oson — yetarli urinish yig'ilganlaridan.
    olchanganlar = [
        m for m in masalalar
        if m["holat"] == Masala.TASDIQ and m["urinish"] >= QIYINLIK_MIN
    ]
    qiyin = sorted(olchanganlar, key=lambda m: m["qiyinlik"])[:10]
    oson = sorted(olchanganlar, key=lambda m: -m["qiyinlik"])[:10]
    # Hech kim urinmagan tasdiqlangan masalalar — ro'yxatda ko'zga
    # tashlanmayotganlari. Ular uchun ish boshqacha: masalani tuzatish
    # emas, uni ko'rinadigan qilish (kanal posti).
    tegilmagan = [
        m for m in masalalar
        if m["holat"] == Masala.TASDIQ and not m["urinish"]
    ]

    # -------------------------------------------------------- mualliflar
    xom_muallif = (
        masalalar_qs.values(
            "muallif__pupil_id",
            "muallif__pupil__first_name",
            "muallif__pupil__last_name",
            "muallif__pupil__ustoz",
            "muallif__name",
        )
        .annotate(
            jami=Count("id"),
            tasdiq=Count("id", filter=Q(holat=Masala.TASDIQ)),
            rad=Count("id", filter=Q(holat=Masala.RAD)),
            navbat=Count("id", filter=Q(holat=Masala.KUTMOQDA)),
            korish=Sum("korish_soni"),
            urinish=Sum("urinish_soni"),
            yechdi=Sum("yechdi_soni"),
            like=Sum("like_soni"),
            dislike=Sum("dislike_soni"),
        )
        .order_by("-jami")[:ODAM_CHEGARA]
    )

    mualliflar = []
    for a in xom_muallif:
        ism = _ism(
            a["muallif__pupil__first_name"],
            a["muallif__pupil__last_name"],
            a["muallif__name"],
        )
        if a["muallif__pupil__ustoz"] and ism != "—":
            ism = f"Ustoz {ism}"
        mualliflar.append({
            "ism": ism,
            "bosh": (ism[:1] or "?").upper(),
            "qidiruv": ism.lower(),
            "jami": a["jami"],
            "tasdiq": a["tasdiq"],
            "rad": a["rad"],
            "navbat": a["navbat"],
            # Tasdiq ulushi — muallif qanchalik ishonchli yozayotgani.
            "tasdiq_foiz": _foiz(a["tasdiq"], a["jami"]),
            "korish": a["korish"] or 0,
            "urinish": a["urinish"] or 0,
            "yechdi": a["yechdi"] or 0,
            # Bitta masalaga o'rtacha nechta yechuvchi. Muallifning
            # HAQIQIY hissasi shu: yigirmata masala yozib, hech biri
            # yechilmasa, bu bittani yozib yuztaga yetkazgandan kam.
            "bir_masalaga": round(
                (a["yechdi"] or 0) / (a["tasdiq"] or 1), 1
            ),
            "ovoz": (a["like"] or 0) - (a["dislike"] or 0),
        })

    # ------------------------------------------------------ sinflar kesimi
    xom_sinf = (
        tasdiq_qs.values("sinf")
        .annotate(
            soni=Count("id"),
            korish=Sum("korish_soni"),
            urinish=Sum("urinish_soni"),
            yechdi=Sum("yechdi_soni"),
            birinchida=Sum("yechgan_soni"),
        )
        .order_by("sinf")
    )
    sinflar = []
    for s in xom_sinf:
        sinflar.append({
            "nom": sinf_nomi(s["sinf"]),
            "soni": s["soni"],
            "korish": s["korish"] or 0,
            "urinish": s["urinish"] or 0,
            "yechdi": s["yechdi"] or 0,
            "qiyinlik": _foiz(s["birinchida"] or 0, s["urinish"] or 0),
        })
    sinf_eng = max([s["yechdi"] for s in sinflar] + [1])
    for s in sinflar:
        s["ulush"] = round(s["yechdi"] * 100 / sinf_eng)

    # ---------------------------------------------------------- so'nggi oqim
    oqim = []
    for u in (
        MasalaUrinish.objects
        .select_related("profile__pupil", "masala")
        .order_by("-created_at")[:OQIM_CHEGARA]
    ):
        ism = _ism(
            u.profile.pupil.first_name, u.profile.pupil.last_name, u.profile.name
        )
        oqim.append({
            "ism": ism,
            "bosh": (ism[:1] or "?").upper(),
            "raqam": u.masala.raqam,
            "matn": u.masala.matn,
            "togri": u.togri,
            "yechdi": u.yechdi,
            "urinish": u.soni,
            "vaqt": u.created_at,
            "yechildi": u.yechdi_at,
        })

    return {
        "yangilangan": timezone.localtime(hozir),
        "kunlar": kunlar,
        "bugun": bugun_sonlar,
        "kechagi": kechagi,
        "farq": farq,
        "davr": davr,
        "umumiy": {
            "jami": sum(sanoq.values()),
            "tasdiq": sanoq.get(Masala.TASDIQ, 0),
            "kutmoqda": sanoq.get(Masala.KUTMOQDA, 0),
            "rad": sanoq.get(Masala.RAD, 0),
            "korish": korish,
            "urinish": urinish,
            "yechdi": yechildi,
            "birinchida": birinchida,
            # O'rtacha qiyinlik — birinchi urinishda topilganlar ulushi.
            # 50% atrofi sog'lom: undan yuqorisi masalalar yengilligini,
            # 20% dan pasti esa bo'lim odamni charchatayotganini bildiradi.
            "qiyinlik": _foiz(birinchida, urinish),
            "yechuvchilar": yechuvchi_soni,
            "uringanlar": len(odamlar),
            "korganlar": len(korgan_odamlar),
            "mualliflar": len(mualliflar),
            "kanalda": tasdiq_qs.filter(
                kanal_at__isnull=False, kanal_yoq=False
            ).count(),
            "kanal_yoq": masalalar_qs.filter(kanal_yoq=True).count(),
            "tegilmagan": len(tegilmagan),
            "like": yigindi["like"] or 0,
            "dislike": yigindi["dislike"] or 0,
            "jami_urinish_qator": jami_urinish,
            "jami_yechdi_qator": jami_yechdi,
            "jami_birinchida": jami_birinchida,
        },
        "voronka": voronka,
        "grafik": grafik,
        "bugungilar": bugungilar,
        "yechuvchilar": yechuvchilar,
        "masalalar": masalalar,
        "mualliflar": mualliflar,
        "sinflar": sinflar,
        "qiyin": qiyin,
        "oson": oson,
        "tegilmagan": tegilmagan[:10],
        "oqim": oqim,
        "qiyinlik_min": QIYINLIK_MIN,
    }


def sahifa(request):
    """Masalalar hisoboti. Kirish qoidasi qolgan panel bilan bir xil."""
    if not _yoniq():
        raise Http404
    if not kirganmi(request):
        return kirish(request)
    return render(
        request, "boshqaruv/masala_hisobot.html", hisobot(davr_tanla(request))
    )
