"""
`MasalaUrinish.yechdi_at` — masala qachon yechilgani.

Eski qatorlar `created_at` bilan to'ldiriladi. Bu taxmin, lekin eng
yaqin taxmin: maydon paydo bo'lgunga qadar urinish va yechim deyarli
har doim bitta o'tirishda bo'lardi. Bo'sh qoldirish esa yomonroq
bo'lardi — o'shanda hisobotning "yechilganlar" grafigi maydon
qo'shilgan kundan boshlanib, undan oldingi butun tarix yo'qolgandek
ko'rinardi.
"""
from django.db import migrations, models


def sanani_toldir(apps, schema_editor):
    MasalaUrinish = apps.get_model("core", "MasalaUrinish")
    MasalaUrinish.objects.filter(yechdi=True, yechdi_at__isnull=True).update(
        yechdi_at=models.F("created_at")
    )


class Migration(migrations.Migration):

    dependencies = [("core", "0034_masala_yechdi_soni")]

    operations = [
        migrations.AddField(
            model_name="masalaurinish",
            name="yechdi_at",
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
        migrations.AddIndex(
            model_name="masalaurinish",
            index=models.Index(
                fields=["-created_at"], name="masala_urin_created_369b95_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="masalaurinish",
            index=models.Index(
                fields=["-yechdi_at"], name="masala_urin_yechdi__82a989_idx"
            ),
        ),
        # Orqaga qaytarish hech narsa qilmaydi: ustun o'chib ketadi.
        migrations.RunPython(sanani_toldir, migrations.RunPython.noop),
    ]
