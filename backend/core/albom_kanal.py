"""
Kanaldagi haftalik ALBOM — suriladigan kartalar to'plami.

    python manage.py matematika_kanal albom           # navbatdagisini joylaydi
    python manage.py matematika_kanal albom --sinov   # nima chiqishini ko'rsatadi

─────────────────── NEGA ───────────────────

Kanaldagi boshqa postlar bir kunlik: masala yechiladi, test bosiladi va
unutiladi. Albom esa SAQLAB QO'YILADIGAN post — bitta mavzuning eng
kerakli beshta narsasi, har biri alohida kartada. Odam uni imtihon
oldidan qayta ochadi va do'stiga yuboradi.

─────────────────── MAZMUN QO'LDA YOZILGAN ───────────────────

`FAKTLAR` dagi qoida: har bir formula va misol tekshirilgan. Yangi
albom qo'shganda ham shunday — misoldagi hisobni QAYTA hisoblab
ko'ring, kartadagi xato butun kanalga rasm bo'lib tarqaydi va uni
tahrirlab bo'lmaydi.

Karta — `(nom, ifoda, pastki)`:
  * nom    — kartaning tepasidagi kichik yozuv;
  * ifoda  — katta yozuv, ko'pi bilan IKKI qator (`\\n` — uzilish joyi);
  * pastki — bitta qatorli misol yoki izoh (45 belgigacha).

KALIT o'zgarmasin: u bazada "chiqdi" belgisi (`albom:<kalit>`).
"""
from __future__ import annotations

from django.utils import timezone

from core import matematika_kanal as MK
from core.models import KanalYozuv

ALBOMLAR: list[dict] = [
    {
        "kalit": "qisqa-kopaytirish",
        "rukn": "QISQA KO'PAYTIRISH",
        "sarlavha": "Qisqa ko'paytirishning 5 ta formulasi",
        "kirish": "Algebraning yarmi shu beshtasiga tayanadi: ifodani soddalashtirish, "
                  "ko'paytuvchilarga ajratish, og'zaki hisob.",
        "kartalar": [
            ("Yig'indining kvadrati", "(a + b)² =\na² + 2ab + b²", "31² = (30 + 1)² = 900 + 60 + 1 = 961"),
            ("Ayirmaning kvadrati", "(a − b)² =\na² − 2ab + b²", "49² = (50 − 1)² = 2500 − 100 + 1 = 2401"),
            ("Kvadratlar ayirmasi", "a² − b² =\n(a − b)(a + b)", "47 · 53 = 50² − 3² = 2491"),
            ("Kublar yig'indisi", "a³ + b³ =\n(a + b)(a² − ab + b²)", "x³ + 8 = (x + 2)(x² − 2x + 4)"),
            ("Kublar ayirmasi", "a³ − b³ =\n(a − b)(a² + ab + b²)", "x³ − 27 = (x − 3)(x² + 3x + 9)"),
        ],
    },
    {
        "kalit": "ogzaki-hisob",
        "rukn": "OG'ZAKI HISOB",
        "sarlavha": "Og'zaki hisobning 5 ta usuli",
        "kirish": "Kalkulyatorsiz, bir necha soniyada. Imtihonda vaqtni aynan shular tejaydi.",
        "kartalar": [
            ("11 ga ko'paytirish", "35 × 11 = 385", "3 va 5 orasiga yig'indisi: 3 + 5 = 8"),
            ("5 bilan tugagan son kvadrati", "65² = 4225", "6 × 7 = 42, oxiriga 25 yoziladi"),
            ("5 ga ko'paytirish", "48 × 5 = 240", "Yarmini 10 ga ko'paytiring: 24 × 10"),
            ("25 ga ko'paytirish", "36 × 25 = 900", "4 ga bo'lib, 100 ga ko'paytiring: 9 × 100"),
            ("9 ga ko'paytirish", "47 × 9 = 423", "10 ga ko'paytirib, o'zini ayiring: 470 − 47"),
        ],
    },
    {
        "kalit": "qiziq-sonlar",
        "rukn": "QIZIQ SONLAR",
        "sarlavha": "O'z nomi bor 5 ta son",
        "kirish": "Oddiy ko'rinadi, lekin har birining ortida bitta chiroyli xossa turadi.",
        "kartalar": [
            ("Xardi–Ramanujan soni", "1729 =\n1³ + 12³ = 9³ + 10³", "Ikki xil usulda ikki kub yig'indisi"),
            ("Kaprekar doimiysi", "7641 − 1467 = 6174", "Deyarli har qanday 4 xonali son shunga keladi"),
            ("Aylanma son", "142857 × 2 =\n285714", "Raqamlar o'sha, faqat joyi almashadi"),
            ("Birlar kvadrati", "1111² = 1234321", "11² = 121, 111² = 12321"),
            ("Mukammal son", "28 =\n1 + 2 + 4 + 7 + 14", "O'z bo'luvchilari yig'indisiga teng"),
        ],
    },
    {
        "kalit": "daraja-xossalari",
        "rukn": "DARAJA XOSSALARI",
        "sarlavha": "Darajaning 5 ta xossasi",
        "kirish": "Asos bir xil bo'lsa, daraja ko'rsatkichlari bilan ishlash kifoya.",
        "kartalar": [
            ("Ko'paytirishda qo'shiladi", "a³ · a⁴ = a⁷", "2³ · 2⁴ = 2⁷ = 128"),
            ("Bo'lishda ayiriladi", "a⁵ : a² = a³", "3⁵ : 3² = 3³ = 27"),
            ("Darajaning darajasi", "(a³)² = a⁶", "(2³)² = 8² = 64 = 2⁶"),
            ("Ko'paytmaning darajasi", "(ab)³ = a³ · b³", "(2 · 5)³ = 8 · 125 = 1000"),
            ("Nol va manfiy daraja", "a⁰ = 1\na⁻³ = 1 : a³", "5⁰ = 1,  2⁻³ = 1 : 8"),
        ],
    },
    {
        "kalit": "bolinish-belgilari",
        "rukn": "BO'LINISH BELGILARI",
        "sarlavha": "Bo'linishning 5 ta belgisi",
        "kirish": "Bo'lib o'tirmasdan, songa bir qarashda bilish mumkin.",
        "kartalar": [
            ("3 ga bo'linish", "Raqamlar yig'indisi\n3 ga bo'linsa", "738 → 7 + 3 + 8 = 18"),
            ("4 ga bo'linish", "Oxirgi ikki raqami\n4 ga bo'linsa", "5316 → 16 : 4 = 4"),
            ("9 ga bo'linish", "Raqamlar yig'indisi\n9 ga bo'linsa", "4527 → 4 + 5 + 2 + 7 = 18"),
            ("11 ga bo'linish", "Raqamlarni + − + − bilan\nhisoblaganda 11 ga bo'linsa", "2728 → 2 − 7 + 2 − 8 = −11"),
            ("25 ga bo'linish", "Oxiri 00, 25,\n50 yoki 75 bo'lsa", "3475 → 75"),
        ],
    },
    {
        "kalit": "yuza-formulalari",
        "rukn": "YUZA FORMULALARI",
        "sarlavha": "Yuzaning 5 ta formulasi",
        "kirish": "Geometriya masalalarining ko'pi shu beshta shaklga keladi.",
        "kartalar": [
            ("Kvadrat", "S = a²", "a = 6 bo'lsa, S = 36"),
            ("To'g'ri to'rtburchak", "S = a · b", "a = 5, b = 8 bo'lsa, S = 40"),
            ("Uchburchak", "S = ½ · a · h", "a = 10, h = 6 bo'lsa, S = 30"),
            ("Trapetsiya", "S = ½ · (a + b) · h", "a = 4, b = 6, h = 5 bo'lsa, S = 25"),
            ("Doira", "S = π · r²", "r = 10 bo'lsa, S = 100π ≈ 314"),
        ],
    },
    {
        "kalit": "foiz",
        "rukn": "FOIZ",
        "sarlavha": "Foiz haqida 5 ta narsa",
        "kirish": "Do'kondagi chegirmadan imtihondagi masalagacha — hammasi shu beshtasida.",
        "kartalar": [
            ("Sonning foizi", "a ning p% i =\na · p : 100", "200 ning 15% i = 200 · 15 : 100 = 30"),
            ("O'rnini almashtirsa bo'ladi", "a ning b% i =\nb ning a% i", "50 ning 8% i = 8 ning 50% i = 4"),
            ("10% — eng oson", "10% =\n10 ga bo'lish", "340 ning 10% i = 34, 5% i = 17"),
            ("20% oshirish", "20% oshirish =\n1,2 ga ko'paytirish", "500 · 1,2 = 600"),
            ("Tuzoq", "+50%, keyin −50%\n≠ boshidagi son", "100 → 150 → 75"),
        ],
    },
    {
        "kalit": "buyuk-allomalar",
        "rukn": "BUYUK ALLOMALAR",
        "sarlavha": "Matematikaga iz qoldirgan 5 alloma",
        "kirish": "Bugun darslikda turgan ko'p narsaning ildizi shu zaminda.",
        "kartalar": [
            ("Al-Xorazmiy · IX asr", "«Algebra» va «algoritm»\nso'zlari", "«Al-jabr» kitobi va «Algoritmi» nomidan"),
            ("Mirzo Ulug'bek · XV asr", "1018 ta yulduz\njadvali", "«Ziji jadidi Ko'ragoniy» asarida"),
            ("Al-Koshiy · 1424-yil", "π ning 16 ta\no'nli xonasi", "Rekord qariyb 170 yil turgan"),
            ("Beruniy · XI asr", "Yer radiusi\n≈ 6340 km", "Tog' cho'qqisidan ufqni o'lchab topgan"),
            ("Al-Farg'oniy · 861-yil", "Nil daryosidagi\nNilometr", "Qohirada qurilishiga rahbarlik qilgan"),
        ],
    },
]

# Animatsiyali (premium) emojilar — Telegramning rasmiy `RestrictedEmoji`
# to'plamidan. Ichidagi oddiy belgi — zaxira: bot premium emojini
# ishlata olmaydigan joyda (Fragment'da nomi yo'q bot kanalda) Telegram
# o'shani ko'rsatadi, post baribir chiqadi.
_EMOJI = {
    "🧮": "5472404950673791399",
    "✅": "5427009714745517609",
    "👉": "5471978009449731768",
    "🎓": "5375163339154399459",
}


def _e(belgi: str) -> str:
    return f'<tg-emoji emoji-id="{_EMOJI[belgi]}">{belgi}</tg-emoji>'


def _kalit(albom: dict) -> str:
    return f"albom:{albom['kalit']}"


def keyingi_albom() -> dict:
    """Hali chiqmagan albom, ro'yxat tartibida; hammasi chiqqan bo'lsa — eng uzoq chiqmagani."""
    chiqqan = dict(
        KanalYozuv.objects.filter(kalit__startswith="albom:").values_list("kalit", "joylangan_at")
    )
    for albom in ALBOMLAR:
        if _kalit(albom) not in chiqqan:
            return albom
    return min(ALBOMLAR, key=lambda a: chiqqan.get(_kalit(a)) or timezone.now())


def bugun_chiqdimi() -> bool:
    return KanalYozuv.objects.filter(
        kalit__startswith="albom:", joylangan_at__date=timezone.localdate()).exists()


def albom_rasmlari(albom: dict) -> list[bytes]:
    """Kartalar — kanaldagi og'zaki misol rasmi bilan bir xil ko'rinishda."""
    n = len(albom["kartalar"])
    return [
        MK.misol_rasmi((f"{i} / {n}", f"{nom}: {ifoda}"), rukn=albom["rukn"], pastki=pastki)
        for i, (nom, ifoda, pastki) in enumerate(albom["kartalar"], 1)
    ]


def albom_posti(albom: dict) -> str:
    royxat = "\n".join(f"{_e('✅')} {nom}" for nom, _, _ in albom["kartalar"])
    return (
        f"{_e('🧮')} <b>{albom['sarlavha']}</b>\n\n"
        f"{albom['kirish']}\n\n"
        f"{royxat}\n\n"
        f"{_e('👉')} Suring — har birining ostida misoli bor.\n\n"
        f"{_e('🎓')} Saqlab qo'ying, imtihon oldidan kerak bo'ladi."
    )


def albom_belgila(albom: dict, xabar_id: int = 0) -> None:
    KanalYozuv.objects.update_or_create(
        kalit=_kalit(albom),
        defaults={
            "tur": KanalYozuv.FAKT, "sarlavha": albom["sarlavha"],
            "manba": str(xabar_id or ""), "joylangan_at": timezone.now(),
        },
    )
