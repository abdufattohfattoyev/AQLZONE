"""
Universal kirish va profillar — 3-bosqich: ESKI USTUNLARNI OLIB TASHLASH.

0003 ma'lumotni ko'chirib bo'ldi, endi `profile` bo'sh bo'lmasligi mumkin
va eski `pupil` bog'lanishlari hamda `tg_id` / `device_id` ustunlari
keraksiz.

Bu bosqich alohida turgani muhim: agar 0003 da nimadir noto'g'ri ketgan
bo'lsa, shu migratsiyani qo'llamasdan turib xatoni ko'rish va tuzatish
mumkin — ma'lumot hali eski ustunlarda ham turibdi.
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [("core", "0003_kochirish")]

    operations = [
        # Endi bog'lanish majburiy
        migrations.AlterField(
            model_name="progress",
            name="profile",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="progress",
                to="core.profile",
            ),
        ),
        migrations.AlterField(
            model_name="lessonresult",
            name="profile",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="results",
                to="core.profile",
            ),
        ),
        # Eski indeks o'z ustuni bilan birga ketadi
        migrations.RemoveIndex(
            model_name="lessonresult",
            name="lesson_resu_pupil_i_fd1c36_idx",
        ),
        migrations.AddIndex(
            model_name="lessonresult",
            index=models.Index(fields=["profile", "-created_at"], name="lesson_resu_profile_d3b61a_idx"),
        ),
        migrations.RemoveField(model_name="progress", name="pupil"),
        migrations.RemoveField(model_name="lessonresult", name="pupil"),
        migrations.RemoveField(model_name="pupil", name="tg_id"),
        migrations.RemoveField(model_name="pupil", name="device_id"),
        migrations.AlterModelOptions(
            name="pupil",
            options={"verbose_name": "hisob", "verbose_name_plural": "hisoblar"},
        ),
    ]
