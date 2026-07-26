"""
Universal kirish va profillar — 2-bosqich: MA'LUMOTNI KO'CHIRISH.

Har bir mavjud hisob uchun:
    1. `tg_id` / `device_id` dan `Identity` qatorlari yasaladi
    2. bitta `Profile` yaratiladi
    3. o'sha hisobning progressi va dars natijalari shu profilga bog'lanadi

Orqaga qaytarish ham yozilgan (`orqaga`): 0004 hali qo'llanmagan bo'lsa,
migratsiyani bekor qilib eski holatga qaytish mumkin. Ma'lumot bilan
ishlaydigan migratsiyada bu shart — aks holda xato chiqsa yo'l yopiq
bo'lib qoladi.
"""
from django.db import migrations


def oldinga(apps, schema_editor):
    Pupil = apps.get_model("core", "Pupil")
    Identity = apps.get_model("core", "Identity")
    Profile = apps.get_model("core", "Profile")

    for pupil in Pupil.objects.all().iterator():
        # --- kirish usullari ---
        for provider, qiymat in (("telegram", pupil.tg_id), ("device", pupil.device_id)):
            if not qiymat:
                continue
            # Bir xil juftlik ikki marta yozilmasin: eski bazada tasodifan
            # takrorlangan bo'lsa, yagonalik cheklovi migratsiyani to'xtatardi.
            Identity.objects.get_or_create(
                provider=provider, external_id=str(qiymat), defaults={"pupil": pupil}
            )

        # --- profil ---
        ism = (pupil.first_name or pupil.username or "").strip()
        profile = Profile.objects.create(pupil=pupil, name=ism or "Men")

        # --- progress va natijalar shu profilga o'tadi ---
        Progress = apps.get_model("core", "Progress")
        Progress.objects.filter(pupil=pupil).update(profile=profile)

        LessonResult = apps.get_model("core", "LessonResult")
        LessonResult.objects.filter(pupil=pupil).update(profile=profile)


def orqaga(apps, schema_editor):
    """Yangi jadvallarni bo'shatamiz; eski ustunlar hali joyida turibdi."""
    apps.get_model("core", "Identity").objects.all().delete()
    # Profillar o'chishi bilan progressdagi bog'lanish ham bo'shaydi
    apps.get_model("core", "Profile").objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [("core", "0002_identity_profile")]

    operations = [migrations.RunPython(oldinga, orqaga)]
