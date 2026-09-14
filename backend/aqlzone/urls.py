"""
Aql Zone — asosiy marshrutlar.

    /api/health          holat tekshiruvi
    /api/v1/...          REST API (core.urls)
    /boshqaruv           administrator hisoboti (Telegram orqali)
    /boshqaruv/masalalar          tasdiqlash navbati
    /boshqaruv/masalalar/hisobot  masalalar bo'limi statistikasi
    /boshqaruv/reklama   botdan e'lon tarqatish
    boshqa hammasi       React ilova (SPA) — /kurs/1-sinf kabi URL'lar
                         sahifa yangilanganda ham ishlashi uchun.

Tartib MUHIM: SPA eng oxirida turadi, chunki u qolgan hamma manzilni
o'ziga oladi. `/boshqaruv` undan keyin yozilsa, React ilova ochilib,
"bunday sahifa yo'q" degan ekran chiqardi.
"""
from django.urls import include, path

from core import boshqaruv, masala_hisobot
from core.views import health
from core.media import media_urlpatterns
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
    # Hozir kim nima ishlayapti. JSON alohida: sahifa har 5 soniyada
    # faqat ro'yxatni so'raydi, o'zini qayta yuklamaydi.
    path("boshqaruv/jonli", boshqaruv.jonli, name="boshqaruv-jonli"),
    path("boshqaruv/jonli.json", boshqaruv.jonli_json, name="boshqaruv-jonli-json"),
    path("boshqaruv/masalalar", boshqaruv.masalalar, name="boshqaruv-masalalar"),
    # Masalalar hisoboti — tasdiqlash navbatidan ALOHIDA manzil.
    # Ikkalasi ikki xil ish: navbatda masala O'QILADI va qaror
    # qilinadi, hisobotda esa bo'lim qanday ishlayotgani ko'riladi.
    # Bitta sahifada bo'lsa, har tasdiqlashdan keyin butun hisobot
    # qaytadan hisoblanardi.
    path("boshqaruv/masalalar/hisobot", masala_hisobot.sahifa,
         name="boshqaruv-masala-hisobot"),
    # Botdagi havola: /boshqaruv/havola/<imzolangan kod>
    path("boshqaruv/havola/<str:kod>", boshqaruv.havola, name="boshqaruv-havola"),

    # Foydalanuvchi yuborgan rasmlar. SPA dan OLDIN turishi shart —
    # aks holda React ilova bu manzilni ham o'ziga olib, rasm o'rniga
    # sahifa qaytarardi.
    #
    # Faylni Django beradi, nginx emas: oldindagi nginx boshqa
    # loyihaga tegishli va uning sozlamasiga tegmaslik kerak
    # (`docker-compose.yml` dagi izohga qarang). Rasmlar soni oz va
    # hajmi kichik — bu yuk sezilmaydi.
    *media_urlpatterns(),
    *spa_urlpatterns(),
]
