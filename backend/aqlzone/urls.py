"""
Aql Zone — asosiy marshrutlar.

    /api/health          holat tekshiruvi
    /api/v1/...          REST API (core.urls)
    /boshqaruv           administrator hisoboti (parol bilan)
    boshqa hammasi       React ilova (SPA) — /kurs/1-sinf kabi URL'lar
                         sahifa yangilanganda ham ishlashi uchun.

Tartib MUHIM: SPA eng oxirida turadi, chunki u qolgan hamma manzilni
o'ziga oladi. `/boshqaruv` undan keyin yozilsa, React ilova ochilib,
"bunday sahifa yo'q" degan ekran chiqardi.
"""
from django.urls import include, path

from core import boshqaruv
from core.views import health
from core.spa import spa_urlpatterns

urlpatterns = [
    path("api/health", health, name="health"),
    path("api/v1/", include("core.urls")),
    path("boshqaruv", boshqaruv.panel, name="boshqaruv"),
    path("boshqaruv/kirish", boshqaruv.kirish, name="boshqaruv-kirish"),
    path("boshqaruv/chiqish", boshqaruv.chiqish, name="boshqaruv-chiqish"),
    # Botdagi havola: /boshqaruv/havola/<imzolangan kod>
    path("boshqaruv/havola/<str:kod>", boshqaruv.havola, name="boshqaruv-havola"),
    *spa_urlpatterns(),
]
