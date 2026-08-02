from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_duel_shartlar'),
    ]

    operations = [
        migrations.AddField(
            model_name='duel',
            name='chaqirgan_yana',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='duel',
            name='qabul_yana',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='duel',
            name='keyingi',
            field=models.OneToOneField(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='avvalgi', to='core.duel',
            ),
        ),
    ]
