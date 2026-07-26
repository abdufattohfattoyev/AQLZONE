"""
Universal kirish (Identity) va profillar (Profile) — 1-bosqich.

Migratsiya ATAYLAB uchga bo'lingan:

    0002  yangi jadvallarni yaratadi, eski ustunlarga TEGMAYDI
    0003  ma'lumotni eskidan yangiga ko'chiradi
    0004  eski ustunlarni o'chiradi

Bitta migratsiyada qilinsa, ma'lumot ko'chirilmasdan ustunlar yo'qolardi
va har bir bolaning butun progressi o'chib ketardi. Uch bosqich esa
har qadamda ma'lumot joyida turishini kafolatlaydi.
"""
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [("core", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="Identity",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("provider", models.CharField(choices=[("device", "qurilma"), ("telegram", "Telegram"), ("phone", "telefon"), ("google", "Google")], max_length=20)),
                ("external_id", models.CharField(max_length=190)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("pupil", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="identities", to="core.pupil")),
            ],
            options={
                "verbose_name": "kirish usuli",
                "verbose_name_plural": "kirish usullari",
                "db_table": "identities",
            },
        ),
        migrations.CreateModel(
            name="Profile",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(blank=True, default="", max_length=40)),
                ("avatar", models.CharField(blank=True, default="", max_length=40)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("pupil", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="profiles", to="core.pupil")),
            ],
            options={
                "verbose_name": "profil",
                "verbose_name_plural": "profillar",
                "db_table": "profiles",
                "ordering": ["created_at", "pk"],
            },
        ),
        migrations.AddIndex(
            model_name="identity",
            index=models.Index(fields=["pupil"], name="identities_pupil_i_cb309c_idx"),
        ),
        migrations.AddConstraint(
            model_name="identity",
            constraint=models.UniqueConstraint(fields=("provider", "external_id"), name="identity_provider_external_uniq"),
        ),
        migrations.AddIndex(
            model_name="profile",
            index=models.Index(fields=["pupil"], name="profiles_pupil_i_5d28f2_idx"),
        ),
        # Yangi ustunlar hozircha BO'SH BO'LISHI mumkin — 0003 ularni to'ldiradi.
        migrations.AddField(
            model_name="progress",
            name="profile",
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name="progress", to="core.profile"),
        ),
        migrations.AddField(
            model_name="lessonresult",
            name="profile",
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name="results", to="core.profile"),
        ),
    ]
