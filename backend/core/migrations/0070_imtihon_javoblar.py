from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0069_diagnostika'),
    ]

    operations = [
        migrations.AddField(
            model_name='imtihonnatija',
            name='javoblar',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
