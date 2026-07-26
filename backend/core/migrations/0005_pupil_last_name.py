"""
Hisobga familiya qo'shiladi.

Migratsiya QO'LDA yozilgan. `makemigrations` bu o'zgarish bilan birga
`progress.id`, `identity.id`, `profile.id` ustunlarini ham "qo'shmoqchi"
bo'ldi — lekin bazada ular allaqachon bor (`PRAGMA table_info` bilan
tekshirilgan). Bu Django'ning `AutoField` va `BigAutoField` o'rtasidagi
holat farqi, ya'ni haqiqiy o'zgarish emas. Ularni bu yerga qo'shish
migratsiyani xavfli va tushunarsiz qilardi, shuning uchun faqat
haqiqatan kerak bo'lgan bitta ustun yoziladi.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0004_eskini_olib_tashlash"),
    ]

    operations = [
        migrations.AddField(
            model_name="pupil",
            name="last_name",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
    ]
