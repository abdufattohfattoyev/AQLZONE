"""
Aql Zone — asosiy marshrutlar.

    /api/health          holat tekshiruvi
    /api/v1/...          REST API (core.urls)
    /boshqaruv           administrator hisoboti (Telegram orqali)
    /boshqaruv/reklama   botdan e'lon tarqatish
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
    # Kirish sahifasi endi alohida manzil emas — yuboradigan forma yo'q va
    # `panel` uni kirmagan odamga o'zi chizadi. Eski manzil saqlanib
    # qolgan: unga qo'yilgan xatcho'p SPA'ning "bunday sahifa yo'q"
    # ekraniga tushib qolmasin.
    path("boshqaruv/kirish", boshqaruv.eski_kirish),
    path("boshqaruv/chiqish", boshqaruv.chiqish, name="boshqaruv-chiqish"),
    path("boshqaruv/reklama", boshqaruv.reklama, name="boshqaruv-reklama"),
    path("boshqaruv/duel", boshqaruv.duellar, name="boshqaruv-duel"),
    path("boshqaruv/masalalar", boshqaruv.masalalar, name="boshqaruv-masalalar"),
    # Botdagi havola: /boshqaruv/havola/<imzolangan kod>
    path("boshqaruv/havola/<str:kod>", boshqaruv.havola, name="boshqaruv-havola"),
    *spa_urlpatterns(),
]
