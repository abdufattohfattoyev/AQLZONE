"""
Aql Zone — asosiy marshrutlar.

    /api/health          holat tekshiruvi
    /api/v1/...          REST API (core.urls)
    boshqa hammasi       React ilova (SPA) — /kurs/1-sinf kabi URL'lar
                         sahifa yangilanganda ham ishlashi uchun.
"""
from django.urls import include, path

from core.views import health
from core.spa import spa_urlpatterns

urlpatterns = [
    path("api/health", health, name="health"),
    path("api/v1/", include("core.urls")),
    *spa_urlpatterns(),
]
