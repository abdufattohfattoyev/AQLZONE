"""
Kanaldagi "Matematika" rukni — yangiliklar, qiziq faktlar, og'zaki misollar.

    python manage.py matematika_kanal yigish          # lentalardan yangilik yig'adi
    python manage.py matematika_kanal avto --sinov    # bugungi postni ko'rsatadi
    python manage.py matematika_kanal misol           # og'zaki misolni joylaydi

─────────────────── NEGA ───────────────────

Kanalda kuniga ikkita avtomatik post bor edi (kunlik masala, kunlik son
natijalari) va ikkalasi ham "yech" deydi. O'qish uchun, ulashish uchun
post yo'q edi — kanal faqat topshiriq beradigan joy bo'lib qolgan.
Bu rukn kanalga HAYOT qo'shadi: har kuni bitta o'qiladigan narsa.

─────────────────── YANGILIK TO'QILMAYDI ───────────────────

Yangilik faqat haqiqiy o'zbek nashrlarining RSS lentasidan olinadi va
postda doim MANBA va HAVOLA turadi. Matn qayta yozilmaydi: sarlavha va
lentaning o'zidagi qisqa izoh (qisqartirilgan) — ya'ni kanal yangilik
o'ylab topmaydi va birovning maqolasini ko'chirmaydi.

Matematikaga oid xabar kam chiqadi va lenta faqat oxirgi 15–30
xabarni saqlaydi. Shuning uchun `yigish` kun davomida bir necha marta
ishlaydi va topilganini bazaga yozadi (`KanalYozuv`); kanalga esa
kuniga bir marta jamlanib chiqadi. Yangilik bo'lmagan kuni o'rniga
qiziq fakt chiqadi — kanal baribir jim qolmaydi.

─────────────────── FAKTLAR TEKSHIRILGAN ───────────────────

Faktlar ro'yxati qo'lda yozilgan va har biri umumiy manbalarda
tasdiqlanadigan narsa. Ro'yxatga yangi fakt qo'shganda ham shu qoida:
shubhali raqam yoki "aytishlaricha" darajasidagi rivoyat — yo'q.
"""
from __future__ import annotations

import html
import io
import logging
import random
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import timedelta
from email.utils import parsedate_to_datetime

from django.conf import settings
from django.utils import timezone

from core.models import KanalYozuv

log = logging.getLogger(__name__)

#: Lentalar — serverdan tekshirilgan va ishlaydiganlari (2026-09).
#: daryo.uz va xabar.uz lentasi bo'sh qaytadi, shuning uchun yo'q.
MANBALAR: list[tuple[str, str]] = [
    ("Kun.uz", "https://kun.uz/news/rss"),
    ("Gazeta.uz", "https://www.gazeta.uz/uz/rss/"),
    ("UzA", "https://uza.uz/uz/rss"),
    ("Podrobno.uz", "https://podrobno.uz/rss/"),
    ("UzDaily", "https://uzdaily.uz/uz/rss"),
    ("Nuz.uz", "https://nuz.uz/feed"),
    ("Spot.uz", "https://www.spot.uz/rss/"),
]

#: Lenta qancha kutiladi. Vazifa fonda ishlaydi, lekin sekin sayt
#: butun yig'ishni ushlab turmasin.
KUTISH = 12

#: Xabar MATEMATIKAGA oid deb hisoblanadigan so'zlar (kichik harfda).
#:
#: Faqat "olimpiada" yetmaydi: lentalarda eng ko'p uchraydigani —
#: shaxmat olimpiadasi. Shuning uchun fanning NOMI shart. Lotin va
#: kirill ikkalasi ham bor: UzA o'zbekchani kirillda yozadi.
KALIT_SOZLAR = [
    "matemati", "математи",
    "al-xorazmiy", "ал-хоразмий", "al-xwarizmi",
    "algebra", "алгебр", "geometriya", "геометри",
    "mirzo ulug'bek rasadxona", "улуғбек расадхона",
]

#: Postda ko'pi bilan nechta yangilik — uzun ro'yxat kanalda o'qilmaydi.
POSTDA_KOPI = 3

#: Shundan eski yangilik kanalga chiqmaydi — "yangilik" bo'lmay qoladi.
ESKIRISH = timedelta(days=4)

#: Izoh uzunligi — to'liq maqola emas, bir-ikki gap.
IZOH_UZUNLIGI = 220


def _normal(s: str) -> str:
    """Kichik harf va apostroflarning bir xil shakli (ʻ ʼ ‘ ’ → ')."""
    return re.sub(r"[ʻʼ‘’`´]", "'", (s or "").lower())


def matematikami(sarlavha: str, izoh: str = "") -> bool:
    t = _normal(f"{sarlavha} {izoh}")
    return any(k in t for k in KALIT_SOZLAR)


def _toza(s: str) -> str:
    """HTML teglar va ortiqcha bo'shliqlarsiz matn."""
    s = re.sub(r"<[^>]+>", " ", html.unescape(s or ""))
    return re.sub(r"\s+", " ", s).strip(" .")


def _qisqa(s: str, n: int = IZOH_UZUNLIGI) -> str:
    if len(s) <= n:
        return s
    kesim = s[:n].rsplit(" ", 1)[0]
    return kesim.rstrip(",;:—-") + "…"


def lentani_oqi(xml: bytes) -> list[dict]:
    """RSS 2.0 dan elementlar: sarlavha, havola, izoh, sana."""
    try:
        ildiz = ET.fromstring(xml)
    except ET.ParseError:
        return []
    natija = []
    for el in ildiz.iter("item"):
        sarlavha = _toza(el.findtext("title") or "")
        havola = (el.findtext("link") or el.findtext("guid") or "").strip()
        if not sarlavha or not havola.startswith("http"):
            continue
        sana = None
        try:
            sana = parsedate_to_datetime(el.findtext("pubDate") or "")
        except (TypeError, ValueError):
            pass
        natija.append({
            "sarlavha": sarlavha,
            "havola": havola,
            "izoh": _toza(el.findtext("description") or ""),
            "sana": sana,
        })
    return natija


def _yukla(url: str) -> bytes:
    so_rov = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (AqlZone; +https://aql-zone.uz)"})
    with urllib.request.urlopen(so_rov, timeout=KUTISH) as r:
        return r.read()


def yigish(yuklovchi=_yukla) -> int:
    """
    Hamma lentani o'qib, matematikaga oid YANGI xabarlarni bazaga yozadi.
    Nechta yangi topilganini qaytaradi. Bitta lenta ishlamasa, qolganlari
    davom etadi.
    """
    yangi = 0
    chegara = timezone.now() - ESKIRISH
    for manba, url in MANBALAR:
        try:
            elementlar = lentani_oqi(yuklovchi(url))
        except Exception as e:  # tarmoq, SSL, vaqt — bitta manba butun ishni to'xtatmasin
            log.warning("lenta o'qilmadi: %s — %s", manba, e)
            continue
        for el in elementlar:
            if not matematikami(el["sarlavha"], el["izoh"]):
                continue
            if el["sana"] and el["sana"] < chegara:
                continue
            _, yaratildi = KanalYozuv.objects.get_or_create(
                kalit=el["havola"][:300],
                defaults={
                    "tur": KanalYozuv.YANGILIK,
                    "sarlavha": el["sarlavha"][:300],
                    "matn": _qisqa(el["izoh"]),
                    "manba": manba,
                },
            )
            yangi += int(yaratildi)
    return yangi


def kutayotgan_yangiliklar() -> list[KanalYozuv]:
    return list(
        KanalYozuv.objects.filter(
            tur=KanalYozuv.YANGILIK, joylangan_at__isnull=True,
            topilgan_at__gte=timezone.now() - ESKIRISH,
        ).order_by("-topilgan_at")[:POSTDA_KOPI]
    )


def yangilik_posti(yozuvlar: list[KanalYozuv]) -> str:
    e = html.escape
    qism = ["📰 <b>Matematika yangiliklari</b>\n"]
    for y in yozuvlar:
        q = f"▪️ <b>{e(y.sarlavha)}</b>"
        if y.matn:
            q += f"\n{e(y.matn)}"
        q += f'\n<a href="{e(y.kalit, quote=True)}">{e(y.manba)}</a>'
        qism.append(q)
    return "\n\n".join(qism)


# ─────────────────────────── QIZIQ FAKTLAR ───────────────────────────
#
# Tartib muhim emas — tanlashda hali chiqmaganlari olinadi. KALIT
# (birinchi element) o'zgarmasin: u bazada "chiqdi" belgisi bo'lib
# turadi. Yangi fakt ro'yxat oxiriga yangi kalit bilan qo'shiladi.
FAKTLAR: list[tuple[str, str]] = [
    ("xorazmiy-algebra",
     "«Algebra» so'zi Muhammad al-Xorazmiyning IX asrda yozilgan «Al-kitob al-muxtasar fi hisob "
     "al-jabr val-muqobala» asari nomidagi <b>«al-jabr»</b> so'zidan kelib chiqqan."),
    ("xorazmiy-algoritm",
     "<b>«Algoritm»</b> so'zi al-Xorazmiy nomining lotincha shakli — «Algoritmi»dan olingan. "
     "Uning hisob haqidagi kitobi Yevropaga lotin tarjimasi orqali yetib borgan."),
    ("hind-raqamlari",
     "Biz «arab raqamlari» deb ataydigan 0–9 aslida Hindistonda paydo bo'lgan. Yevropaga ular "
     "asosan <b>al-Xorazmiyning</b> hisob kitobi tarjimasi orqali tarqalgan."),
    ("ulugbek-katalog",
     "Mirzo Ulug'bek Samarqand rasadxonasida tuzilgan «Ziji jadidi Ko'ragoniy» asarida "
     "<b>1018 ta</b> yulduzning o'rni jadvalga kiritilgan."),
    ("ulugbek-yil",
     "Ulug'bek yulduz yilining uzunligini <b>365 kun 6 soat 10 daqiqa 8 soniya</b> deb hisoblagan — "
     "zamonaviy qiymatdan farqi bir daqiqaga ham yetmaydi."),
    ("koshiy-pi",
     "G'iyosiddin Jamshid al-Koshiy 1424-yilda Samarqandda π sonini <b>16 ta o'nli xona</b> "
     "aniqligida hisoblagan. Bu rekord qariyb 170 yil davomida yangilanmagan."),
    ("koshiy-onli",
     "Al-Koshiy 1427-yilda yozgan «Miftoh al-hisob» («Hisob kaliti») asarida <b>o'nli kasrlar</b> "
     "bilan hisoblashni tizimli bayon qilgan."),
    ("beruniy-radius",
     "Abu Rayhon Beruniy Yer radiusini tog' cho'qqisidan ufq qanchalik pastga «tushishini» o'lchab "
     "hisoblagan. Natijasi — taxminan <b>6340 km</b>, haqiqiy qiymatga juda yaqin."),
    ("fargoniy-nil",
     "Ahmad al-Farg'oniy 861-yilda Qohirada Nil daryosi suv sathini o'lchaydigan inshoot — "
     "<b>Nilometr</b> qurilishiga rahbarlik qilgan. U hozir ham saqlanib qolgan."),
    ("nol",
     "Nolni alohida son sifatida, qo'shish va ayirish qoidalari bilan birinchi bo'lib hind "
     "matematigi <b>Braxmagupta</b> 628-yilda bayon qilgan."),
    ("gauss-5050",
     "Rivoyat qilinishicha, yosh Gauss 1 dan 100 gacha sonlar yig'indisini bir zumda topgan: "
     "1+100, 2+99, … — 50 juft, har biri 101. Javob: <b>5050</b>."),
    ("pi-irratsional",
     "π — irratsional son: uni hech qanday oddiy kasr ko'rinishida yozib bo'lmaydi. Buni "
     "<b>1761-yilda</b> Iogann Lambert isbotlagan."),
    ("pi-kuni",
     "<b>14-mart</b> — Pi kuni. Sana amerikacha yozilishda 3/14 bo'ladi, ya'ni π ning boshlanishi."),
    ("ikki-tub",
     "<b>2</b> — yagona juft tub son. Boshqa har qanday juft son 2 ga bo'linadi."),
    ("tub-cheksiz",
     "Tub sonlar <b>cheksiz ko'p</b>. Buni bundan 2300 yil oldin Evklid isbotlagan: har qanday "
     "chekli ro'yxatdan tashqarida yana bitta tub son topiladi."),
    ("birlar-kvadrati",
     "111 111 111 × 111 111 111 = <b>12 345 678 987 654 321</b>."),
    ("tugilgan-kun",
     "Xonada atigi <b>23 kishi</b> bo'lsa, ulardan ikkitasining tug'ilgan kuni bir xil bo'lish "
     "ehtimoli 50% dan oshadi. 70 kishida esa — 99,9%."),
    ("oltin-kesim",
     "Fibonachchi ketma-ketligida (1, 1, 2, 3, 5, 8, 13, …) qo'shni sonlar nisbati "
     "<b>oltin kesim</b> — 1,618… ga tobora yaqinlashadi."),
    ("nol-faktorial",
     "0! = <b>1</b>. Sababi: bo'sh to'plamni tartiblashning bitta usuli bor — hech narsa qilmaslik."),
    ("kaprekar",
     "Raqamlari bir xil bo'lmagan istalgan to'rt xonali son oling. Raqamlarini kamayish tartibida "
     "tuzib, o'sish tartibidagisini ayiring va takrorlang. Ko'pi bilan 7 qadamda <b>6174</b> chiqadi."),
    ("ramanujan-1729",
     "<b>1729</b> — ikki xil usulda ikki kub yig'indisi bo'ladigan eng kichik son: "
     "1³ + 12³ = 9³ + 10³. U «Xardi–Ramanujan soni» deb ataladi."),
    ("fermat",
     "Fermaning buyuk teoremasi 350 yildan ortiq isbotsiz turdi. Uni <b>1994-yilda</b> "
     "Endryu Uayls isbotladi."),
    ("futbol-top",
     "Klassik futbol to'pi <b>12 ta beshburchak</b> va <b>20 ta oltiburchakdan</b> tikiladi."),
    ("eyler",
     "e^(iπ) + 1 = 0 — Eyler ayniyati. Unda matematikaning beshta asosiy soni birlashgan: "
     "<b>0, 1, π, e va i</b>."),
    ("rubik",
     "Rubik kubigi <b>43 kvintillion</b>dan ortiq holatga ega, lekin istalganini "
     "<b>20 ta</b> yoki undan kam burish bilan yechish mumkin (2010-yilda isbotlangan)."),
    ("shaxmat-bugdoy",
     "Shaxmat taxtasining birinchi katagiga 1 ta, keyingisiga 2 ta, keyin 4 ta bug'doy "
     "qo'ysak, jami <b>18 446 744 073 709 551 615</b> ta bo'ladi — 2⁶⁴ − 1."),
    ("kantor",
     "Natural sonlar ham, juft sonlar ham cheksiz — va ular <b>«bir xil ko'p»</b>: har bir n ga 2n "
     "ni juftlab qo'yish mumkin. Buni Georg Kantor ko'rsatgan."),
    ("mobius",
     "Qog'oz tasmasini bir marta burab, uchlarini yopishtirsangiz, <b>Myobius lentasi</b> hosil "
     "bo'ladi — uning faqat bitta tomoni va bitta cheti bor."),
    ("teng-belgisi",
     "«=» belgisini <b>1557-yilda</b> uelslik Robert Rekord kiritgan: «ikki parallel chiziqdan "
     "tengroq narsa yo'q» deb."),
    ("1001",
     "Istalgan uch xonali sonni ikki marta yozing: 123 → 123123. U doim <b>7, 11 va 13</b> ga "
     "bo'linadi, chunki abcabc = abc × 1001 = abc × 7 × 11 × 13."),
    ("goldbax",
     "Goldbax gipotezasi: 2 dan katta har qanday juft son ikkita tub son yig'indisi. "
     "Kompyuterda juda katta sonlargacha tekshirilgan, lekin <b>hali isbotlanmagan</b>."),
    ("mingyillik",
     "Ming yillikning 7 ta matematik muammosining har biri uchun <b>1 million dollar</b> mukofot "
     "e'lon qilingan. Hozircha faqat bittasi — Puankare gipotezasi — yechilgan."),
    ("qogoz-oy",
     "0,1 mm qalinlikdagi qog'ozni 42 marta ikkiga buklash mumkin bo'lganida, uning qalinligi "
     "<b>Oygacha</b> bo'lgan masofadan oshib ketardi: 0,1 mm × 2⁴² ≈ 440 000 km."),
    ("ari-uyasi",
     "Asalarilar uyasi oltiburchak shaklida: tekislikni teng kataklarga bo'lishda "
     "<b>eng kam devor</b> talab qiladigan shakl aynan shu. Buni 1999-yilda Tomas Xeyls isbotlagan."),
    ("toqqiz-belgisi",
     "Son 9 ga bo'linadimi — raqamlarini qo'shing. Yig'indi 9 ga bo'linsa, sonning o'zi ham "
     "bo'linadi: <b>738</b> → 7 + 3 + 8 = 18."),
    ("xayyom",
     "Umar Xayyom XI asrda kub tenglamalarni <b>konus kesimlari</b> — parabola va giperbola "
     "kesishishi yordamida geometrik usulda yechgan."),
]


def keyingi_fakt() -> tuple[str, str]:
    """Hali chiqmagan fakt; hammasi chiqqan bo'lsa — eng uzoq chiqmagani."""
    chiqqan = dict(
        KanalYozuv.objects.filter(tur=KanalYozuv.FAKT).values_list("kalit", "joylangan_at")
    )
    yangi = [f for f in FAKTLAR if f"fakt:{f[0]}" not in chiqqan]
    if yangi:
        return random.choice(yangi)
    return min(FAKTLAR, key=lambda f: chiqqan.get(f"fakt:{f[0]}") or timezone.now())


def fakt_posti(fakt: tuple[str, str]) -> str:
    return f"💡 <b>Bilasizmi?</b>\n\n{fakt[1]}"


def fakt_belgila(fakt: tuple[str, str]) -> None:
    KanalYozuv.objects.update_or_create(
        kalit=f"fakt:{fakt[0]}",
        defaults={"tur": KanalYozuv.FAKT, "sarlavha": fakt[0], "joylangan_at": timezone.now()},
    )


# ─────────────────────────── OG'ZAKI MISOL ───────────────────────────
#
# Qalam-qog'ozsiz, 30 soniyada yechiladigan misol va uning USULI.
#
# Ikki post bo'lib chiqadi:
#   1. 15:00 — savol RASMI (`misol_rasmi`) va KIM UCHUN. Javob yo'q, tugma yo'q: o'quvchi
#      javobini izohda yozadi. Javob oldindan ko'rinsa (spoiler ham)
#      izohda bahs bo'lmaydi — hamma bosib ko'radi-yu, ketadi.
#   2. JAVOB_SOATI da — to'g'ri javob va yechish usuli, savol postiga
#      javob (reply) bo'lib. Oraliq vaqt izohlar yig'ilishi uchun.
#
# Misol kunga bog'liq (`bugungi_misol`), ya'ni javob posti savolni
# bazadan emas, qayta hisoblab oladi — ikkalasi doim bir xil.

#: Javob posti qachon chiqadi (Toshkent vaqti). Jadval: `aqlzone/celery.py`.
JAVOB_SOATI = "17:00"

#: Misol kunlari — `date.weekday()` (0 = dushanba). Jadval bilan bir xil.
MISOL_KUNLARI = {1: "seshanba", 3: "payshanba", 5: "shanba"}


def _yuqori(n: int) -> str:
    """31 → ³¹ — daraja rasmda ham, matnda ham darajadek ko'rinsin."""
    return str(n).translate(str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹"))


def _misollar(r: random.Random) -> list[tuple[str, str, str, str]]:
    """
    (kim uchun, savol, javob, usul) — har biri hisoblab yasaladi, qo'lda
    yozilmaydi. "Kim uchun" — o'sha usul maktabda o'tiladigan sinflar;
    kattaroqlar ham yecha oladi, lekin kichikroqqa og'ir bo'ladi.

    Savol doim "SHART: IFODA" shaklida: rasmda shart kichik harf bilan
    tepada, ifoda katta harf bilan o'rtada turadi (`misol_rasmi`) —
    ilovadagi savol kartasi bilan bir xil.
    """
    k = r.randint(12, 39) * 4
    ab = r.choice([x for x in range(12, 99) if x % 10 + x // 10 < 10])
    a, b = ab // 10, ab % 10
    n = r.choice([20, 30, 40, 50, 60, 80, 100, 200])
    d = r.randint(21, 99)
    daraja = r.randint(5, 12) * 4 + r.randint(1, 3)
    oxiri = [1, 7, 9, 3][daraja % 4]
    beshli = r.randint(2, 9) * 10 + 5
    bosh = beshli // 10
    burchak = r.randint(6, 20)
    foiz, son = r.choice([(15, 240), (12, 250), (35, 160), (8, 450), (25, 680), (45, 220), (6, 350)])
    bir_foiz = f"{son / 100:g}".replace(".", ",")
    # 5-hadgacha savolda yozilgan — so'raladigani 6-dan boshlab.
    qator = r.randint(6, 9)
    return [
        ("4–6-sinf", f"Hisoblang: 25 × {k}", str(25 * k),
         f"25 × 4 = 100. Shuning uchun {k} ni 4 ga bo'lamiz: {k} : 4 = {k // 4}. "
         f"Demak 25 × {k} = {k // 4} × 100 = {25 * k}."),
        ("4–6-sinf", f"Hisoblang: 11 × {ab}", str(11 * ab),
         f"Ikki xonali sonni 11 ga ko'paytirganda uning raqamlari orasiga ularning yig'indisi "
         f"yoziladi: {a} va {b} → {a}, {a} + {b} = {a + b}, {b}. Javob: {11 * ab}."),
        ("5–7-sinf", f"1 dan {n} gacha sonlar yig'indisini toping: 1 + 2 + 3 + … + {n}",
         str(n * (n + 1) // 2),
         f"Gauss usuli: sonlarni chetdan juftlaymiz — 1 + {n}, 2 + {n - 1}, 3 + {n - 2}, … "
         f"Har bir juft {n + 1} ga teng, juftlar soni {n // 2} ta. "
         f"{n // 2} × {n + 1} = {n * (n + 1) // 2}."),
        ("4–6-sinf", f"Hisoblang: 99 × {d}", str(99 * d),
         f"99 = 100 − 1. Demak 99 × {d} = 100 × {d} − {d} = {100 * d} − {d} = {99 * d}."),
        ("7–9-sinf", f"7 ning {daraja}-darajasi qanday raqam bilan tugaydi: 7{_yuqori(daraja)}", str(oxiri),
         f"7 darajalarining oxirgi raqami har 4 qadamda takrorlanadi: 7, 9, 3, 1, 7, 9, 3, 1, … "
         f"{daraja} ni 4 ga bo'lsak, qoldiq {daraja % 4} — demak oxirgi raqam {oxiri}."),
        ("6–8-sinf", f"Hisoblang: {beshli}²", str(beshli * beshli),
         f"5 bilan tugagan sonni kvadratga ko'tarishda o'nliklar raqami keyingi songa "
         f"ko'paytiriladi: {bosh} × {bosh + 1} = {bosh * (bosh + 1)}, oxiriga 25 yoziladi. "
         f"Javob: {beshli * beshli}."),
        ("8–9-sinf", f"Qavariq n burchakning nechta diagonali bor: n = {burchak}",
         str(burchak * (burchak - 3) // 2),
         f"Har bir uchdan n − 3 ta diagonal chiqadi (o'ziga va ikki qo'shnisiga chiqmaydi), "
         f"har bir diagonal esa ikki marta sanaladi. n(n − 3) / 2 = "
         f"{burchak} × {burchak - 3} / 2 = {burchak * (burchak - 3) // 2}."),
        ("5–7-sinf", f"Foizini toping: {son} ning {foiz}% i", str(son * foiz // 100),
         f"Avval 1 foizini topamiz: {son} : 100 = {bir_foiz}. Keyin uni {foiz} ga ko'paytiramiz: "
         f"{bir_foiz} × {foiz} = {son * foiz // 100}."),
        ("6–8-sinf", f"Qatorning {qator}-hadini toping: 2, 6, 12, 20, 30, …",
         str(qator * (qator + 1)),
         f"Har bir had — ketma-ket ikki sonning ko'paytmasi: 1 × 2, 2 × 3, 3 × 4, … "
         f"Demak {qator}-had = {qator} × {qator + 1} = {qator * (qator + 1)}."),
    ]


def bugungi_misol(kun=None) -> tuple[str, str, str, str]:
    """Kunga bog'liq — bir kunda qayta chaqirilsa ham o'sha misol chiqadi."""
    kun = kun or timezone.localdate()
    r = random.Random(kun.toordinal())
    return r.choice(_misollar(r))


def misol_posti(misol: tuple[str, str, str, str]) -> str:
    """
    Rasm ostidagi yozuv. Savolning o'zi RASMDA (`misol_rasmi`), bu yerda
    esa faqat nima qilish kerakligi — savolni ikki marta yozish kerak emas.
    """
    kim, _, _, _ = misol
    e = html.escape
    return (
        "🧠 <b>Og'zaki misol</b> — qalamsiz, 30 soniyada\n"
        f"👥 Kim uchun: <b>{e(kim)}</b> (kattalar ham sinab ko'rsin)\n\n"
        "💬 Javobingizni <b>izohda</b> yozing — faqat sonni, yechimni emas, "
        "boshqalar ham o'ylab ko'rsin.\n"
        f"⏰ To'g'ri javob va yechish usuli bugun soat <b>{JAVOB_SOATI}</b> da chiqadi."
    )


# Rasm ranglari — ilovaning qorong'i mavzusi va brend ranglari: kanal
# postini ko'rgan odam ilovani ochganda o'sha ko'rinishni tanisin.
_FON = (22, 28, 56)
_KARTA = (34, 43, 84)
_OQ = (244, 246, 255)
_XIRA = (150, 160, 200)
_KOK = (59, 111, 224)


def _qatorlarga(d, matn: str, shrift, kenglik: int) -> list[str]:
    qatorlar, joriy = [], ""
    for soz in matn.split():
        sinov = f"{joriy} {soz}".strip()
        if joriy and d.textlength(sinov, font=shrift) > kenglik:
            qatorlar.append(joriy)
            joriy = soz
        else:
            joriy = sinov
    return qatorlar + ([joriy] if joriy else [])


def misol_rasmi(misol: tuple, rukn: str = "OG'ZAKI MISOL", pastki: str = "",
                variantlar: list[str] | None = None) -> bytes:
    """
    Savol kartasi — JPEG baytlari (kanalga `sendPhoto` bilan chiqadi).

    Nega rasm: kanal lentasida matnli post boshqa xabarlar orasida
    ko'zdan qochadi, katta formula esa darhol ko'rinadi va uni
    skrinshot qilib ulashish ham oson. Javob rasmda YO'Q — u izohlar
    yig'ilgandan keyin alohida postda chiqadi.

    Kvadrat: Telegram uni kesmasdan, to'liq ko'rsatadi. Shrift o'lchami
    savol uzunligiga qarab tanlanadi — qisqa misol katta, uzun gap
    kichikroq, lekin doim kartaga sig'adi.
    """
    from PIL import Image, ImageDraw

    from .kunlik_kartochka import _shrift
    from .tamga import _belgi

    kim, savol = misol[0], misol[1]
    S, EN = 2, 1080                                 # S — supersampling, chetlar silliq bo'lsin
    t = Image.new("RGB", (EN * S, EN * S), _FON)
    d = ImageDraw.Draw(t)
    m = 60 * S
    d.rounded_rectangle([m, m, EN * S - m, EN * S - m], radius=48 * S, fill=_KARTA)

    # Logotip — butun kartani egallaydi, lekin juda xira va MATN
    # ORQASIDA: rasm skrinshot bo'lib tarqalganda ham kimniki ekani
    # ko'rinib tursin, savolni o'qishga esa xalaqit bermasin.
    belgi = _belgi(820 * S)
    belgi.putalpha(belgi.getchannel("A").point(lambda a: a * 0.10))
    t = t.convert("RGBA")
    t.alpha_composite(belgi, ((EN * S - belgi.width) // 2, (EN * S - belgi.height) // 2 + 20 * S))
    t = t.convert("RGB")
    d = ImageDraw.Draw(t)

    # Tepa: rukn nomi va kim uchun.
    ichki = 120 * S
    sh = _shrift(34 * S)
    d.text((ichki, 128 * S), rukn, font=sh, fill=_KOK)
    en = d.textlength(kim, font=sh)
    x2 = EN * S - ichki
    d.rounded_rectangle([x2 - en - 44 * S, 112 * S, x2, 176 * S], radius=32 * S, outline=_XIRA, width=2 * S)
    d.text((x2 - en - 22 * S, 128 * S), kim, font=sh, fill=_OQ)

    # O'rta: shart (kichik) va ifoda (katta). Ifoda sig'guncha shrift
    # kichrayadi; blok butunligicha 200–820 oralig'ida markazlanadi.
    #
    # Variantlar bilan (tez test) — savol BUTUNLIGICHA bitta oq blok
    # bo'lib 200–590 da, pastida 2×2 variant kartalari: rasmning o'zi
    # to'liq savol, ostidagi yozuv qisqa bo'lishi mumkin.
    kenglik = EN * S - 2 * ichki
    shart, _, ifoda = savol.partition(": ")
    if not ifoda or variantlar:
        shart, ifoda = "", savol
    shart_sh = _shrift(40 * S, False)
    shart_q = _qatorlarga(d, shart, shart_sh, kenglik) if shart else []
    olchamlar, sigim, maydon = (132, 116, 100, 88, 76, 66), 2, 620
    if variantlar:
        olchamlar, sigim, maydon = (72, 64, 58, 52, 46), 5, 390
    for px in olchamlar:
        shrift = _shrift(px * S)
        qatorlar = _qatorlarga(d, ifoda, shrift, kenglik)
        if len(qatorlar) <= sigim and int(px * 1.25) * len(qatorlar) <= maydon:
            break
    shart_qadam, qadam = 56 * S, int(px * S * 1.25)
    boshi = shart_qadam * len(shart_q) + (40 * S if shart_q else 0)
    y = 200 * S + (maydon * S - boshi - qadam * len(qatorlar)) // 2
    if variantlar:
        vsh = _shrift(40 * S)
        en_v, bo_y, oraliq = (kenglik - 24 * S) // 2, 96 * S, 20 * S
        for n, v in enumerate(variantlar[:4]):
            x0 = ichki + (n % 2) * (en_v + 24 * S)
            y0 = 620 * S + (n // 2) * (bo_y + oraliq)
            d.rounded_rectangle([x0, y0, x0 + en_v, y0 + bo_y], radius=24 * S, outline=_XIRA, width=2 * S)
            harf = f"{'ABCD'[n]}) "
            d.text((x0 + 28 * S, y0 + 24 * S), harf, font=vsh, fill=_KOK)
            d.text((x0 + 28 * S + d.textlength(harf, font=vsh), y0 + 24 * S), v, font=vsh, fill=_OQ)
    for q in shart_q:
        d.text(((EN * S - d.textlength(q, font=shart_sh)) / 2, y), q, font=shart_sh, fill=_XIRA)
        y += shart_qadam
    y += 40 * S if shart_q else 0
    for q in qatorlar:
        d.text(((EN * S - d.textlength(q, font=shrift)) / 2, y), q, font=shrift, fill=_OQ)
        y += qadam

    # Past: nima qilish kerak va kanal.
    past = _shrift(32 * S, False)
    yoz = pastki or f"Qalamsiz, 30 soniyada · javob {JAVOB_SOATI} da"
    d.text(((EN * S - d.textlength(yoz, font=past)) / 2, 860 * S), yoz, font=past, fill=_XIRA)
    kanal = (getattr(settings, "KANAL", "") or "").strip()
    belgi = f"Aql Zone · {kanal if kanal.startswith('@') else '@' + kanal}" if kanal else "Aql Zone"
    sh = _shrift(32 * S)
    d.text(((EN * S - d.textlength(belgi, font=sh)) / 2, 912 * S), belgi, font=sh, fill=_KOK)

    t = t.resize((EN, EN), Image.LANCZOS)
    xotira = io.BytesIO()
    t.save(xotira, format="JPEG", quality=90)
    return xotira.getvalue()


def _keyingi_misol_kuni(kun) -> str:
    for i in range(1, 8):
        nomi = MISOL_KUNLARI.get((kun + timedelta(days=i)).weekday())
        if nomi:
            return nomi
    return ""


def javob_posti(misol: tuple[str, str, str, str], kun=None) -> str:
    _, savol, javob, usul = misol
    e = html.escape
    keyingi = _keyingi_misol_kuni(kun or timezone.localdate())
    matn = (
        "✅ <b>Og'zaki misol — javob</b>\n\n"
        f"❓ {e(savol)}\n"
        f"Javob: <b>{e(javob)}</b>\n\n"
        f"💡 <b>Qanday topiladi</b>\n{e(usul)}\n\n"
        "Izohda to'g'ri yozganlarning hammasiga — qoyil! 👏"
    )
    if keyingi:
        matn += f"\nKeyingi misol — {keyingi} kuni soat 15:00 da."
    return matn


# ─────────────────────────── TEZ TEST (QUIZ) ───────────────────────────
#
# Kattalar uchun, og'zaki misoldan sal qiyinroq: savol RASMDA, uning
# ostida — Telegram test so'rovnomasi (`xabar.quiz_yubor`) 4 variant
# bilan. Odam belgilashi bilan to'g'ri javob va qisqa yechim chiqadi —
# alohida javob posti kerak emas.
#
# Savollar "tuzoqli": birinchi xayolga keladigan javob (o'rtacha tezlik
# uchun o'rta arifmetik, foizda "o'zgarmadi") variantlar orasida turadi.

#: Test kunlari — og'zaki misol bo'lmagan kunlar (dush, chor, jum).
TEST_KUNLARI = {0: "dushanba", 2: "chorshanba", 4: "juma"}

KATTALAR = "Kattalar uchun"


def _son(n: int) -> str:
    """1210000 → "1 210 000" — katta son ko'z bilan tez o'qilsin."""
    return f"{n:,}".replace(",", " ")


def _variantlar(r: random.Random, togri, xatolar, fmt=str) -> tuple[list[str], int]:
    """To'g'ri javob + 3 ta xato, takrorsiz va aralashtirilgan."""
    vs = [togri]
    for x in xatolar:
        if x not in vs and (not isinstance(x, int) or x > 0):
            vs.append(x)
    q = 1
    while len(vs) < 4:                               # faqat son javoblarda yetmay qolishi mumkin
        for x in (togri + 10 * q, togri - 10 * q):
            if x > 0 and x not in vs and len(vs) < 4:
                vs.append(x)
        q += 1
    vs = vs[:4]
    r.shuffle(vs)
    return [fmt(v) for v in vs], vs.index(togri)


def _testlar(r: random.Random) -> list[tuple[str, str, str, str, list[str], int]]:
    """
    (kim uchun, savol, javob, usul, variantlar, to'g'ri raqami).

    `usul` — quiz izohi, Telegram 200 belgidan ortig'ini qabul qilmaydi.
    """
    t = []

    # 1. Toq sonlar yig'indisi.
    n = r.randint(15, 40)
    v, i = _variantlar(r, n * n, [n * (n - 1), n * (n + 1), n * (2 * n - 1)], _son)
    t.append((KATTALAR, f"Yig'indini toping: 1 + 3 + 5 + … + {2 * n - 1}", _son(n * n),
              f"Birinchi n ta toq sonning yig'indisi n² ga teng. {2 * n - 1} = 2·{n} − 1, "
              f"ya'ni {n} ta son: {n}² = {_son(n * n)}.", v, i))

    # 2. Avval oshdi, keyin tushdi.
    p = r.choice([10, 20, 30, 40, 50])
    q = p * p // 100
    togri = f"{q}% arzonladi"
    v, i = _variantlar(r, togri, ["O'zgarmadi", f"{q}% qimmatladi", f"{p}% arzonladi"])
    t.append((KATTALAR, f"Narx avval {p}% oshdi, keyin {p}% tushdi: oxirida narx qanday o'zgardi?",
              togri,
              f"100 deb olaylik: {p}% oshsa {100 + p}. Endi {100 + p} ning {p}% i — "
              f"{(100 + p) * p // 100} ayriladi: {100 - q}. Ya'ni {q}% arzonladi.", v, i))

    # 3. O'rtacha tezlik — o'rta arifmetik EMAS.
    a, b = r.choice([(60, 40), (30, 60), (60, 90), (80, 120), (40, 120), (20, 30)])
    ort = 2 * a * b // (a + b)
    v, i = _variantlar(r, ort, [(a + b) // 2, (a + b) // 2 - 5, ort - 4], lambda x: f"{x} km/soat")
    t.append((KATTALAR, f"Mashina borishda {a} km/soat, qaytishda {b} km/soat yurdi: "
              "o'rtacha tezlik qancha?", f"{ort} km/soat",
              f"O'rtacha tezlik = butun yo'l / butun vaqt. ({a} + {b}) / 2 emas! "
              f"2·{a}·{b} / ({a} + {b}) = {ort} km/soat.", v, i))

    # 4. 100 ga yaqin sonlar ko'paytmasi.
    x, y = r.randint(2, 9), r.randint(2, 9)
    k = (100 + x) * (100 + y)
    v, i = _variantlar(r, k, [k - x * y, k + 10, k - 100], _son)
    t.append((KATTALAR, f"Hisoblang: {100 + x} × {100 + y}", _son(k),
              f"(100 + {x})(100 + {y}) = 10 000 + 100·({x} + {y}) + {x}·{y} = "
              f"10 000 + {100 * (x + y)} + {x * y} = {_son(k)}.", v, i))

    # 5. Kvadratlar ayirmasi.
    a = r.randint(56, 89)
    b = 100 - a
    k = 100 * (a - b)
    v, i = _variantlar(r, k, [(a - b) ** 2, k - 100, k + 200], _son)
    t.append((KATTALAR, f"Hisoblang: {a}² − {b}²", _son(k),
              f"a² − b² = (a − b)(a + b) = {a - b} × {a + b} = {_son(k)}.", v, i))

    # 6. Soat millari — soat mili ham siljiydi.
    h, m = r.randint(1, 11), r.choice([10, 20, 40, 50])
    xom = abs(30 * h - 11 * m // 2)
    burchak = min(xom, 360 - xom)
    sodda = abs(30 * h - 6 * m)
    sodda = min(sodda, 360 - sodda)
    v, i = _variantlar(r, burchak, [sodda, burchak + 10, burchak - 10], lambda x: f"{x}°")
    t.append((KATTALAR, f"Soat millari orasidagi kichik burchak necha gradus: {h}:{m:02d}",
              f"{burchak}°",
              f"Minut mili {6 * m}° da. Soat mili ham siljigan: {30 * h} + {m}/2 = "
              f"{30 * h + m // 2}°. Farq {xom}°"
              + (f", kichigi 360 − {xom} = {burchak}°." if xom > 180 else "."), v, i))

    # 7. Ikki quvur.
    a, b = r.choice([(3, 6), (4, 12), (6, 12), (10, 15), (12, 24), (20, 30), (6, 30), (12, 36)])
    k = a * b // (a + b)
    v, i = _variantlar(r, k, [(a + b) // 2, b - a, k + 1], lambda x: f"{x} soat")
    t.append((KATTALAR, f"Bir quvur hovuzni {a} soatda, ikkinchisi {b} soatda to'ldiradi: "
              "ikkalasi birga necha soatda to'ldiradi?", f"{k} soat",
              f"Bir soatda 1/{a} + 1/{b} = 1/{k} qismi to'ladi. Demak butun hovuz {k} soatda.", v, i))

    # 8. Foizga foiz.
    s, p = r.choice([1, 2, 5, 10]), r.choice([10, 20])
    m0 = s * 1_000_000
    y1 = m0 * (100 + p) // 100
    y2 = y1 * (100 + p) // 100
    oddiy = m0 * (100 + 2 * p) // 100
    v, i = _variantlar(r, y2, [oddiy, y1, y2 + m0 * p * p // 10_000], lambda x: f"{_son(x)} so'm")
    t.append((KATTALAR, f"Bankka {s} mln so'm yiliga {p}% dan qo'yildi (foizga foiz): "
              "2 yildan keyin qancha bo'ladi?", f"{_son(y2)} so'm",
              f"1-yil: {_son(m0)} → {_son(y1)}. 2-yil foiz {_son(y1)} dan hisoblanadi: "
              f"{_son(y2)}. Oddiy foizda {_son(oddiy)} bo'lardi.", v, i))

    # 9. Mushuk va sichqonlar.
    k = r.randint(3, 7)
    n = k * r.choice([10, 20, 30])
    v, i = _variantlar(r, k, [n, n // k, 1], lambda x: f"{x} ta")
    t.append((KATTALAR, f"{k} ta mushuk {k} daqiqada {k} ta sichqon tutadi: "
              f"{n} ta sichqonni {n} daqiqada nechta mushuk tutadi?", f"{k} ta",
              f"Bitta mushuk {k} daqiqada 1 ta sichqon tutadi, {n} daqiqada — {n // k} ta. "
              f"{n} ta sichqon uchun {n} / {n // k} = {k} ta mushuk.", v, i))
    return t


def bugungi_test(kun=None) -> tuple[str, str, str, str, list[str], int]:
    """Kunga bog'liq; og'zaki misoldan boshqa urug' — ular bir-birini takrorlamasin."""
    kun = kun or timezone.localdate()
    r = random.Random(kun.toordinal() * 7 + 3)
    return r.choice(_testlar(r))


def test_posti(test) -> str:
    """Rasm ostidagi yozuv — QISQA: savol ham, variantlar ham rasmda."""
    return "🎯 <b>Tez test</b> · javobni pastda belgilang 👇"


#: So'rovnomaning o'z savoli — to'liq savol rasmda turibdi.
QUIZ_SAVOLI = "Javobingiz qaysi? 👆 Savol rasmda"


def quiz_variantlari(test) -> list[str]:
    """"A) 72 km/soat" — rasmdagi harflar bilan bir xil."""
    return [f"{'ABCD'[n]}) {v}" for n, v in enumerate(test[4])]


def test_rasmi(test) -> bytes:
    return misol_rasmi(test, rukn="TEZ TEST", pastki="30 soniya · javobni pastda belgilang",
                       variantlar=test[4])
