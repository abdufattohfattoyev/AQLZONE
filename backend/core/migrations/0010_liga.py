"""
Haftalik liga jadvali.

`LessonResult` ning `AlterModelOptions` i bu o'zgarishga aloqador emas:
modeldan `ordering` allaqachon olib tashlangan edi, lekin migratsiya
yozilmagan. Django uni birinchi imkoniyatda ilova qiladi — jadval
tegilmaydi, faqat migratsiya holati modelga to'g'rilanadi.
"""
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_pupil_kanal_azo'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='lessonresult',
            options={},
        ),
        migrations.CreateModel(
            name='LigaAzo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hafta', models.DateField()),
                ('daraja', models.IntegerField(default=0)),
                ('guruh', models.IntegerField(default=0)),
                ('yulduz', models.IntegerField(default=0)),
                ('orin', models.IntegerField(default=0)),
                ('natija', models.CharField(blank=True, choices=[('', 'hali yakunlanmagan'), ('kotarildi', 'yuqori darajaga'), ('qoldi', 'shu darajada'), ('tushdi', 'quyi darajaga')], default='', max_length=12)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='liga', to='core.profile')),
            ],
            options={
                'db_table': 'liga_azo',
                'indexes': [models.Index(fields=['hafta', 'daraja', 'guruh'], name='liga_azo_hafta_b99bd7_idx')],
                'constraints': [models.UniqueConstraint(fields=('profile', 'hafta'), name='liga_bir_haftada_bir_marta')],
            },
        ),
    ]
