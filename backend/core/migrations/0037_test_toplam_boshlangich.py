"""
Birinchi to'plamlar: 9, 10 va 11-sinf uchun uchtadan blok.

Urug'lar QO'LDA qo'yilgan va o'zgarmasligi kerak: urug' almashsa, test
boshqa bo'ladi va avval ishlaganlarning natijasi yangi savollarga
yopishib qolardi.

Uchta blok ataylab: bitta to'plam bir kechada ishlab bo'linadi va
"yana bormi?" degan savolga javob kerak. Uchtasi bir haftalik kanal
posti ham bo'ladi.
"""
from django.db import migrations

TOPLAMLAR = [
    # (raqam, sinf, blok, urug')
    (1, 9, 1, 900101), (2, 9, 2, 900202), (3, 9, 3, 900303),
    (4, 10, 1, 1000101), (5, 10, 2, 1000202), (6, 10, 3, 1000303),
    (7, 11, 1, 1100101), (8, 11, 2, 1100202), (9, 11, 3, 1100303),
]


def yarat(apps, schema_editor):
    TestToplam = apps.get_model("core", "TestToplam")
    for raqam, sinf, blok, urug in TOPLAMLAR:
        TestToplam.objects.get_or_create(
            raqam=raqam,
            defaults={
                "sinf": sinf,
                "nom": f"{sinf}-sinf · {blok}-blok",
                "urug": urug,
                # 11-sinfda DTM sur'atiga yaqinroq: savoliga 1,5 daqiqa.
                "savol_soni": 20 if sinf == 11 else 15,
                "daqiqa": 30 if sinf == 11 else 20,
            },
        )


class Migration(migrations.Migration):

    dependencies = [("core", "0036_test_toplam")]

    operations = [migrations.RunPython(yarat, migrations.RunPython.noop)]
