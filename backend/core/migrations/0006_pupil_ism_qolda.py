"""
"Ism qo'lda kiritilgan" bayrog'i.

Busiz shunday bo'lardi: foydalanuvchi ilovada ismini yozadi, ertasi kuni
Telegram orqali kiradi va `pupil_by_telegram` uning ismini Telegram'dagi
ism bilan almashtirib yuboradi. Bayroq shu ikki manbani ajratadi.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0005_pupil_last_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="pupil",
            name="ism_qolda",
            field=models.BooleanField(default=False),
        ),
    ]
