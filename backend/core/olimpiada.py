"""
KUN MASALASI — kanal uchun olimpiada uslubidagi masalalar banki.

─────────────────── NEGA KERAK ───────────────────

Kechki post (18:05) foydalanuvchilar yozgan masalalardan chiqadi
(`masala_kanal.kunlik`). Ular tugadi va post jimgina BO'SH qoldi —
haftalik o'sish hisoboti buni birinchi kuniyoq ko'rsatdi. Bu bank
zaxira: masala bo'lmasa, shu yerdan bittasi chiqadi.

Masalalar "sal qiyin, tuzoqli" — kattalar ham o'ylab qoladigan,
lekin 1–2 daqiqada yechiladigan. Har birida bitta TUZOQ variant bor
(eng ko'p uchraydigan xato javob) va izohda yechim.

Har masala bir marta chiqadi (`KanalYozuv`, kalit `olimp:<n>`);
hammasi tugagach — boshidan.

JAVOBLAR SINOVDA qayta hisoblanadi (`tests.OlimpiadaBankTest`):
kanalga noto'g'ri javobli masala chiqishi eng yomon xato — uni
yuzlab odam ko'radi.
"""
from __future__ import annotations

#: (savol, variantlar, to'g'ri variant indeksi, izoh ≤200 belgi)
BANK: list[tuple[str, list[str], int, str]] = [
    ("2²⁰²⁶ sonini 7 ga bo'lganda qoldiq nechaga teng?",
     ["1", "2", "4", "6"], 1,
     "2³ = 8 ≡ 1 (mod 7). 2026 = 3·675 + 1, demak 2²⁰²⁶ ≡ 2¹ = 2."),
    ("1 dan 100 gacha sonlarning nechtasi 2 ga ham, 3 ga ham, 5 ga ham bo'linmaydi?",
     ["24", "26", "27", "30"], 1,
     "Kamida bittasiga bo'linadiganlar: 50+33+20−16−10−6+3 = 74. Qolgani 100 − 74 = 26."),
    ("Soat 3:40 da soat va minut millari orasidagi burchak necha gradus?",
     ["120°", "130°", "140°", "150°"], 1,
     "Minut mili 240° da, soat mili 90° + 40·0,5° = 110° da. Farq 130°. Tuzoq: 140° — soat mili siljishi unutilsa."),
    ("1 dan 100 gacha barcha sonlar ketma-ket yozildi. Jami nechta raqam ishlatildi?",
     ["189", "190", "192", "200"], 2,
     "1–9: 9 ta, 10–99: 90·2 = 180 ta, 100: 3 ta. Jami 192."),
    ("Uchburchak tomonlari 13, 14 va 15. Uning yuzi nechaga teng?",
     ["78", "84", "90", "96"], 1,
     "Geron: p = 21, S = √(21·8·7·6) = √7056 = 84."),
    ("100! (1·2·3·…·100) soni oxirida nechta nol bor?",
     ["10", "20", "24", "25"], 2,
     "Nollar 5 ko'paytuvchilaridan: 100/5 = 20 va 100/25 = 4. Jami 24. Tuzoq: 20 — 25, 50, 75, 100 dagi ikkinchi 5 unutilsa."),
    ("Raqamlari yig'indisi 9 ga teng bo'lgan ikki xonali sonlar nechta?",
     ["8", "9", "10", "11"], 1,
     "18, 27, 36, 45, 54, 63, 72, 81, 90 — 9 ta. 09 ikki xonali emas."),
    ("Uzunligi 1 km bo'lgan poyezd 1 km uzunlikdagi tunneldan 1 km/min tezlikda o'tmoqda. "
     "Poyezd tunnelga kirishidan to'liq chiqishigacha necha minut o'tadi?",
     ["1", "1,5", "2", "3"], 2,
     "Bosh qismi tunnelga kirgandan dumi chiqquncha poyezd 1 + 1 = 2 km yuradi — 2 minut."),
    ("Kitob sahifalari 1 dan 100 gacha raqamlangan. Sahifa raqamlarida «1» raqami necha marta uchraydi?",
     ["19", "20", "21", "22"], 2,
     "Birliklarda: 1, 11, …, 91 — 10 ta. O'nliklarda: 10–19 — 10 ta. Va 100 da bitta. Jami 21."),
    ("a + b = 10 va ab = 21 bo'lsa, a² + b² nechaga teng?",
     ["58", "79", "100", "121"], 0,
     "a² + b² = (a + b)² − 2ab = 100 − 42 = 58."),
    ("111111 sonini 7 ga bo'lganda qoldiq nechaga teng?",
     ["0", "1", "3", "6"], 0,
     "111111 = 7 · 15873. Umuman, 111111 = 3·7·11·13·37 — 7 ga qoldiqsiz bo'linadi."),
    ("Kvadratga ichki chizilgan doira yuzi kvadrat yuzining qancha qismini tashkil qiladi?",
     ["1/2", "3/4", "π/4", "π/2"], 2,
     "Kvadrat tomoni a, doira radiusi a/2. πa²/4 : a² = π/4 ≈ 0,785."),
    ("log₂3 · log₃4 · log₄5 · … · log₆₃64 nechaga teng?",
     ["5", "6", "63", "64"], 1,
     "Asosni almashtirish: ko'paytma log₂64 ga qisqaradi = 6."),
    ("x + 1/x = 3 bo'lsa, x³ + 1/x³ nechaga teng?",
     ["18", "21", "24", "27"], 0,
     "(x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x). 27 = x³ + 1/x³ + 9, demak 18. Tuzoq: 27."),
    ("√(12 + √(12 + √(12 + …))) cheksiz ildiz nechaga teng?",
     ["3", "4", "√12", "6"], 1,
     "x = √(12 + x) → x² − x − 12 = 0 → x = 4 (musbat ildiz)."),
    ("Tekislikdagi 5 ta nuqtadan hech uchtasi bir to'g'ri chiziqda yotmaydi. "
     "Uchlari shu nuqtalarda bo'lgan nechta uchburchak bor?",
     ["10", "15", "20", "60"], 0,
     "Uchta nuqta tanlash: C(5, 3) = 10. Tuzoq: 60 — tartib hisobga olinsa."),
    ("6 kishi uchrashdi va har biri qolganlarning har biri bilan bir marta qo'l berib ko'rishdi. "
     "Jami nechta qo'l berish bo'ldi?",
     ["12", "15", "30", "36"], 1,
     "Har juft bir marta: 6·5/2 = 15. Tuzoq: 30 — har qo'l berish ikki marta sanalsa."),
    ("Ketma-ketlikni davom ettiring: 2, 6, 12, 20, 30, …",
     ["40", "42", "44", "56"], 1,
     "n(n + 1): 1·2, 2·3, 3·4, 4·5, 5·6, 6·7 = 42."),
    ("7¹⁰⁰ sonining oxirgi raqami nechaga teng?",
     ["1", "3", "7", "9"], 0,
     "Oxirgi raqamlar davriy: 7, 9, 3, 1. 100 = 4·25, demak 1."),
    ("Bir sutkada (24 soat) soat va minut millari necha marta ustma-ust tushadi?",
     ["12", "22", "23", "24"], 1,
     "12 soatda 11 marta (soat 12 da ikki marta sanalmaydi). Sutkada 22 marta. Tuzoq: 24."),
    ("|x − 3| + |x + 2| ifodaning eng kichik qiymati nechaga teng?",
     ["0", "1", "3", "5"], 3,
     "Son o'qida x dan 3 gacha va −2 gacha masofalar yig'indisi — kamida 3 − (−2) = 5."),
    ("0,(9) = 0,999… cheksiz davriy kasr nechaga teng?",
     ["0,9", "0,99", "9/10", "1"], 3,
     "x = 0,(9) → 10x = 9,(9) → 9x = 9 → x = 1. Bu taxminiy emas, aynan 1."),
    ("Uchburchak burchaklari 1 : 2 : 3 nisbatda. Eng katta burchak necha gradus?",
     ["60°", "90°", "100°", "120°"], 1,
     "k + 2k + 3k = 180° → k = 30°. Eng kattasi 3k = 90°."),
    ("3 ta tanga tashlandi. Kamida bittasi «gerb» tushish ehtimoli qancha?",
     ["1/2", "3/4", "7/8", "1/8"], 2,
     "Qarama-qarshi hodisa — uchalasi ham «raqam»: 1/8. Demak 1 − 1/8 = 7/8."),
    ("2x + 3y = 20 tenglamaning natural sonlardagi nechta yechimi bor?",
     ["2", "3", "4", "6"], 1,
     "y juft bo'lishi kerak: y = 2 → x = 7; y = 4 → x = 4; y = 6 → x = 1. Uchta."),
    ("N = 2¹⁰ · 3⁵ sonining nechta natural bo'luvchisi bor?",
     ["15", "50", "60", "66"], 3,
     "Bo'luvchilar soni (10 + 1)(5 + 1) = 66. Tuzoq: 15 — daraja ko'rsatkichlari qo'shilsa."),
    ("Doiraning radiusi 2 marta oshirildi. Uning yuzi necha marta oshadi?",
     ["2", "4", "8", "π"], 1,
     "S = πr². Radius 2r bo'lsa, S = 4πr² — 4 marta."),
    ("1/(1·2) + 1/(2·3) + 1/(3·4) + … + 1/(99·100) nechaga teng?",
     ["1/100", "99/100", "100/101", "1"], 1,
     "1/(n(n+1)) = 1/n − 1/(n+1). Yig'indi qisqaradi: 1 − 1/100 = 99/100."),
    ("Ikki xonali son raqamlari o'rni almashtirilsa, son 27 ga kamayadi. "
     "Raqamlar ayirmasi nechaga teng?",
     ["2", "3", "7", "9"], 1,
     "(10a + b) − (10b + a) = 9(a − b) = 27 → a − b = 3."),
    ("Kub qirrasi 3 sm. U sirtidan bo'yalib, 27 ta 1 sm li kubchaga kesildi. "
     "Nechta kubchaning aynan ikki yog'i bo'yalgan?",
     ["6", "8", "12", "24"], 2,
     "Ikki yog'i bo'yalganlar — qirralar o'rtasida, har qirrada bittadan: 12 ta. Tuzoq: 8 — uchlari (3 yog'i bo'yalgan)."),
]


def masala(n: int) -> tuple[str, list[str], int, str]:
    return BANK[n % len(BANK)]


def kanalga(kanal: str, sinov: bool = False) -> tuple[str, str]:
    """
    Navbatdagi masalani kanalga — rasm va so'rovnoma BITTA postda
    (`xabar.quiz_rasm_bilan`). `(holat, izoh)` qaytaradi.

    Rasmda savol va A–D variantlar (`matematika_kanal.misol_rasmi` —
    "Tez test" bilan bir xil ko'rinish); so'rovnomada ham to'liq savol:
    rasm ochilmay qolsa yoki ekran o'quvchi bilan ham tushunarli bo'lsin.
    """
    from django.utils import timezone

    from . import matematika_kanal as MKN
    from . import xabar as X
    from .models import KanalYozuv

    n, (savol, var, togri, izoh) = navbatdagi()
    harfli = [f"{'ABCD'[i]}) {v}" for i, v in enumerate(var)]
    if sinov:
        return "sinov", f"#{n}: {savol} | {harfli} | ✅ {harfli[togri]} | {izoh}"
    rasm = MKN.misol_rasmi((MKN.KATTALAR, savol), rukn="KUN MASALASI",
                           pastki="Javobni pastda belgilang", variantlar=var)
    holat, xato, xabar_id = X.quiz_rasm_bilan(kanal, f"🧩 {savol}", harfli, togri, rasm, izoh)
    if holat == "yuborildi":
        KanalYozuv.objects.update_or_create(
            kalit=f"olimp:{n}",
            defaults={"tur": KanalYozuv.MISOL, "sarlavha": savol[:300],
                      "manba": str(xabar_id), "joylangan_at": timezone.now()},
        )
    return holat, xato


def navbatdagi() -> tuple[int, tuple[str, list[str], int, str]]:
    """Hali chiqmagan eng birinchisi; hammasi chiqqan bo'lsa — eng eskisi."""
    from .models import KanalYozuv

    chiqqan = dict(KanalYozuv.objects.filter(kalit__startswith="olimp:")
                   .values_list("kalit", "joylangan_at"))
    for n in range(len(BANK)):
        if f"olimp:{n}" not in chiqqan:
            return n, BANK[n]
    n = int(min(chiqqan, key=lambda k: chiqqan[k] or 0).split(":")[1])
    return n, BANK[n]
