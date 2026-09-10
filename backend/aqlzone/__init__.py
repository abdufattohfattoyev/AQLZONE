"""
Celery ilovasi Django bilan BIRGA yuklanadi.

Bu fayl har qanday Django jarayonida (veb, bot, `manage.py`)
o'qiladi, ya'ni `@shared_task` bilan belgilangan vazifalar shu
yerda ro'yxatga tushadi. Usiz `vazifa.delay()` "unregistered task"
bilan yiqilardi — va faqat ISHLAB CHIQARISHDA, chunki ishlab
chiqishda vazifalar navbatsiz, joyida bajariladi.
"""
from .celery import app as celery_app

__all__ = ("celery_app",)
