"""
Ro'yxatdan o'tish payti.

Mavjud hisoblar orasida ism ham, familiya ham to'ldirilganlari bor —
ular allaqachon ro'yxatdan o'tgan hisoblanadi. Aks holda ilova
yangilangach ular qaytadan ro'yxat oynasiga tushib qolardi.
"""
from django.db import migrations, models
from django.db.models import F, Q


def otganlarni_belgila(apps, schema_editor):
    Pupil = apps.get_model("core", "Pupil")
    (
        Pupil.objects.filter(registered_at__isnull=True)
        .exclude(Q(first_name="") | Q(last_name=""))
        .update(registered_at=F("created_at"))
    )


class Migration(migrations.Migration):

    dependencies = [("core", "0006_pupil_ism_qolda")]

    operations = [
        migrations.AddField(
            model_name="pupil",
            name="registered_at",
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
        # Orqaga qaytarish uchun alohida amal shart emas: ustunning o'zi
        # o'chib ketadi.
        migrations.RunPython(otganlarni_belgila, migrations.RunPython.noop),
    ]
