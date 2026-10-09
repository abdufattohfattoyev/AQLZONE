"""
Server yozadigan xabarlar — ikki tilda.

Bu yerda FAQAT foydalanuvchi ko'radigan matn turadi: botdagi javoblar va
eslatma. Interfeys matnlari mijozda (`frontend/src/lib/matn.ts`) — server
ularni umuman bilmasligi kerak.

Til qayerdan olinadi:

  * mavjud hisobda — `Pupil.til`, ilova o'zi yozib qo'yadi;
  * YANGI hisobda — Telegram bergan `language_code` (odam hali ilovani
    ochmagan, ya'ni boshqa ishora yo'q).

Ikkinchi qoida muhim: /start ga javob birinchi aloqa bo'ladi va u odam
o'qiy oladigan tilda bo'lishi kerak, aks holda u tugmani bosmaydi.
Standart — o'zbekcha: loyihaning asosiy tili.
"""
from __future__ import annotations

#: Qo'llab-quvvatlanadigan tillar.
TILLAR = ("uz", "ru")

STANDART = "uz"


def tilni_tanla(xom: str | None) -> str:
    """
    Til kodini normallashtiradi.

    Telegram `language_code` ni "ru", "ru-RU", "uz-UZ" ko'rinishida beradi,
    baza esa ikki harf saqlaydi. Tanimagan qiymat standartga tushadi —
    yarim tanish tilda xabar yuborgandan ko'ra o'zbekchasi yaxshiroq.
    """
    kod = (xom or "").strip().lower()[:2]
    return kod if kod in TILLAR else STANDART


#: Xabarlar. Qiymat — {"uz": ..., "ru": ...}.
#:
#: `{nom}` ko'rinishidagi o'rinlar `M()` ga berilgan qiymatlar bilan
#: to'ldiriladi.
XABAR: dict[str, dict[str, str]] = {
    # ---------------------------------------------------------- bot: /start
    "salom": {
        "uz": (
            # Ilgari faqat "bola darslik boblari bo'ylab yuradi" edi. Lekin
            # kelganlarning ko'pi talaba va abituriyent — ularga DTM,
            # sertifikat va oliy matematika borligini birinchi xabar aytsin.
            "Assalomu alaykum{ism}! 👋\n\n"
            "<b>Aql Zone</b> — matematika bir joyda:\n"
            "🎓 1–11-sinf darslari, algebra va geometriya\n"
            "📝 DTM va Milliy sertifikat variantlari — xato tahlili bilan\n"
            "🧩 Masalalar, 🎮 o'yinlar va do'st bilan bellashuv"
        ),
        "ru": (
            "Здравствуйте{ism}! 👋\n\n"
            "<b>Aql Zone</b> — вся математика в одном месте:\n"
            "🎓 уроки 1–11 классов, алгебра и геометрия\n"
            "📝 варианты ДТМ и Нац. сертификата — с разбором ошибок\n"
            "🧩 задачи, 🎮 игры и дуэли с друзьями"
        ),
    },
    "saytYoq": {
        "uz": (
            "\n\n⚠️ Sayt manzili sozlanmagan (SAYT_URL).\n"
            "Progress yo'qolmasligi uchun raqamingizni yuboring."
        ),
        "ru": (
            "\n\n⚠️ Адрес сайта не настроен (SAYT_URL).\n"
            "Чтобы прогресс не потерялся, отправьте свой номер."
        ),
    },
    "tugmaniBos": {
        "uz": (
            "\n\nPastdagi «✅ Saytga kirish» tugmasini bosing — avtomatik kirasiz.\n\n"
            "Tugma {muddat} amal qiladi."
        ),
        "ru": (
            "\n\nНажмите кнопку «✅ Войти на сайт» ниже — вход выполнится автоматически.\n\n"
            "Кнопка действует {muddat}."
        ),
    },
    #: `/start` dagi IKKINCHI xabar — ilovani birinchi marta ochadigan
    #: yashil tugma bilan birga ketadi.
    #:
    #: NEGA ALOHIDA XABAR. Bitta xabarda yo doimiy klaviatura, yo inline
    #: tugma bo'ladi — ikkalasi birga bo'lmaydi. Klaviatura tugmalari
    #: ilovani o'zi ochadi, lekin Telegram REPLY-klaviaturadan ochilgan
    #: Mini App ga `initData` bermaydi: birinchi kirish o'sha yerdan
    #: bo'lsa, ilova odamni tanimay anonim hisob yasab qo'yardi. Inline
    #: tugma esa `initData` beradi — shuning uchun birinchi ochilish
    #: AYNAN shu tugmadan bo'lishi kerak. Undan keyin hisob qurilmada
    #: saqlanadi va klaviatura tugmalari ham to'g'ri hisobga tushadi.
    "birinchiOchish": {
        "uz": "👇 Boshlash uchun shu tugmani bosing.",
        "ru": "👇 Нажмите эту кнопку, чтобы начать.",
    },
    "tSaytgaKirish": {"uz": "✅ Saytga kirish", "ru": "✅ Войти на сайт"},
    "tIlovaniOchish": {"uz": "🎓 Ilovani ochish", "ru": "🎓 Открыть приложение"},
    "tRaqamniYuborish": {"uz": "📱 Raqamni yuborish", "ru": "📱 Отправить номер"},

    # ------------------------------------------------ bot: doimiy klaviatura
    #
    # Bu to'rttasi suhbat ostida DOIM turadi. Ular oddiy tugmalardan farq
    # qiladi: matn emas, KLAVIATURA yuboradi — ya'ni odam nima yozishni
    # o'ylab o'tirmaydi. Ilgari bot faqat buyruqni tushunardi va "/oyinlar"
    # deb yozgan odam "Boshlash uchun /start yuboring" degan javob olardi,
    # ya'ni bot bilgan narsasini yashirib turardi.
    #
    # Yozuvlar QISQA: ikkitasi bir qatorga sig'ishi kerak va ruschasi
    # o'zbekchasidan uzun bo'lishi mumkin.
    # "Darslar" emas: tugma bosh sahifani ("Bugun") ochadi, darslar ro'yxatini emas.
    "tIlova": {"uz": "🎓 Ilovani ochish", "ru": "🎓 Открыть приложение"},
    "tDtm": {"uz": "📝 DTM · Sertifikat", "ru": "📝 ДТМ · Сертификат"},
    "tMasalalar": {"uz": "🧩 Masalalar", "ru": "🧩 Задачи"},
    "tOyinlar": {"uz": "🎮 O'yinlar", "ru": "🎮 Игры"},
    "tDuel": {"uz": "⚔️ Bellashuv", "ru": "⚔️ Дуэль"},
    "tMaydon": {"uz": "🏟 Bugungi maydon", "ru": "🏟 Арена дня"},
    "tReyting": {"uz": "🏆 Reyting", "ru": "🏆 Рейтинг"},
    "tRaqamTugma": {"uz": "📱 Raqam", "ru": "📱 Номер"},
    "tYordamTugma": {"uz": "❓ Yordam", "ru": "❓ Помощь"},

    # ---------------------------------------------------------- bot: o'yinlar
    "oyinlar": {
        "uz": (
            "🎮 <b>Matematik o'yinlar</b>\n\n"
            "Sakkizta o'yin, har birida uch daraja:\n"
            "🟢 oson — 6–9 yosh\n"
            "🔵 o'rta — 10–14 yosh\n"
            "🔴 qiyin — kattalar\n\n"
            "Tezkor hisob, ko'paytirish jadvali, yashirin amal, "
            "ketma-ketlik, chamalash, tarozi, «24» va sonlar xotirasi.\n\n"
            "Har kuni o'ynang — rekordingiz saqlanadi."
        ),
        "ru": (
            "🎮 <b>Математические игры</b>\n\n"
            "Восемь игр, в каждой три уровня:\n"
            "🟢 лёгкий — 6–9 лет\n"
            "🔵 средний — 10–14 лет\n"
            "🔴 сложный — взрослым\n\n"
            "Быстрый счёт, таблица умножения, скрытый знак, "
            "последовательность, прикидка, весы, «24» и память на числа.\n\n"
            "Играйте каждый день — рекорд сохраняется."
        ),
    },
    "tOyinniOch": {"uz": "🎮 O'yinlarni ochish", "ru": "🎮 Открыть игры"},

    # --------------------------------------------------- bot: buyruqlar ro'yxati
    #
    # Telegram'dagi "/" tugmasi ostidagi ro'yxat (`setMyCommands`). Uni
    # o'rnatmagunimizcha ro'yxat BO'SH turardi va odam bot nima
    # qilishini umuman bilmasdi — buyruqni faqat taxmin qilib topardi.
    # Ilgari "Boshlash va saytga kirish" — `/start` endi sayt havolasini
    # emas, ilovani ochadigan tugmani beradi.
    "buyruqStart": {"uz": "Boshlash — ilovani ochish", "ru": "Начать — открыть приложение"},
    "buyruqDtm": {"uz": "DTM variantlari — 30 savol, 60 daqiqa", "ru": "Варианты ДТМ — 30 вопросов, 60 минут"},
    "buyruqSertifikat": {"uz": "Milliy sertifikat — 45 topshiriq", "ru": "Нац. сертификат — 45 заданий"},
    "buyruqPremium": {"uz": "Imtihon Premium — qancha qoldi, uzaytirish", "ru": "Imtihon Premium — сколько осталось"},
    "buyruqMasalalar": {"uz": "Masalalar — yeching va yozing", "ru": "Задачи — решайте и публикуйте"},
    "dtmHaqida": {
        "uz": (
            "📝 <b>DTM va Milliy sertifikat</b>\n\n"
            "12 tadan variant, haqiqiy imtihon vaqti bilan. Oxirida — qaysi "
            "mavzuda yiqilganingiz, har savolning yechimi va shu haftaning reytingi."
        ),
        "ru": (
            "📝 <b>ДТМ и Национальный сертификат</b>\n\n"
            "По 12 вариантов, с реальным временем экзамена. В конце — темы с "
            "ошибками, решение каждого вопроса и рейтинг недели."
        ),
    },
    "sertifikatHaqida": {
        "uz": (
            "🏅 <b>Milliy sertifikat</b>\n\n"
            "Rasmiy formatda: 45 topshiriq, 100 ball, 3 soat. Natijada taxminiy "
            "daraja, ball yo'qotilgan mavzular va har topshiriqning yechimi."
        ),
        "ru": (
            "🏅 <b>Национальный сертификат</b>\n\n"
            "В официальном формате: 45 заданий, 100 баллов, 3 часа. В результате — "
            "примерный уровень, темы с потерянными баллами и решения."
        ),
    },
    "buyruqOyinlar": {"uz": "Matematik o'yinlar", "ru": "Математические игры"},
    "buyruqDuel": {"uz": "Do'st bilan bellashuv", "ru": "Дуэль с другом"},
    "buyruqMaydon": {"uz": "Bugungi maydon — 3 bosqich", "ru": "Арена дня — 3 этапа"},
    "buyruqReyting": {"uz": "Reyting jadvali", "ru": "Таблица рейтинга"},
    "masalaBot": {
        "uz": (
            "🧩 <b>Masala sizni kutyapti</b>\n\n"
            "Shartni o‘qing, javobingizni yozing — u yerda tekshiriladi "
            "va yechimi ochiladi. Ochish uchun pastdagi tugmani bosing."
        ),
        "ru": (
            "🧩 <b>Задача ждёт вас</b>\n\n"
            "Прочитайте условие и введите ответ — он проверится, "
            "и откроется решение. Нажмите кнопку ниже."
        ),
    },
    "toplamBot": {
        "uz": (
            "📝 <b>Test to‘plami sizni kutyapti</b>\n\n"
            "Hamma bir xil savollarni yechadi — natijangiz boshqalar bilan "
            "solishtiriladi. Boshlash uchun pastdagi tugmani bosing."
        ),
        "ru": (
            "📝 <b>Вас ждёт тестовый сборник</b>\n\n"
            "У всех одни и те же вопросы — ваш результат сравнят с остальными. "
            "Нажмите кнопку ниже."
        ),
    },
    "testlarBot": {
        "uz": (
            "📝 <b>Testlar bo‘limi</b>\n\n"
            "Sinfingizni tanlang: bob testlari, to‘liq blok va hamma uchun "
            "bir xil test to‘plamlari. Ochish uchun pastdagi tugmani bosing."
        ),
        "ru": (
            "📝 <b>Раздел тестов</b>\n\n"
            "Выберите класс: тесты по главам, полный блок и общие сборники. "
            "Нажмите кнопку ниже."
        ),
    },
    "masalalarBot": {
        "uz": (
            "🧩 <b>Masalalar bo‘limi</b>\n\n"
            "Foydalanuvchilar yozgan masalalar — yeching va o‘zingiznikini "
            "qo‘shing. Ochish uchun pastdagi tugmani bosing."
        ),
        "ru": (
            "🧩 <b>Раздел задач</b>\n\n"
            "Задачи от пользователей — решайте и добавляйте свои. "
            "Нажмите кнопку ниже."
        ),
    },
    "duelChaqiruvBot": {
        "uz": (
            "⚔️ <b>Sizni bellashuvga chaqirishdi!</b>\n\n"
            "Do‘stingiz bilan bir xil savollarni yechasiz. "
            "Ochish uchun pastdagi tugmani bosing."
        ),
        "ru": (
            "⚔️ <b>Вас вызвали на дуэль!</b>\n\n"
            "Вы решите те же задания, что и друг. "
            "Нажмите кнопку ниже."
        ),
    },
    "kunlikSonBot": {
        "uz": (
            "🔢 <b>Kunlik son</b>\n\n"
            "Yashirin tenglikni 6 urinishda toping — har kuni yangi jumboq. "
            "Boshlash uchun pastdagi tugmani bosing."
        ),
        "ru": (
            "🔢 <b>Число дня</b>\n\n"
            "Найдите скрытое равенство за 6 попыток — каждый день новое. "
            "Нажмите кнопку ниже."
        ),
    },
    "xonaChaqiruvBot": {
        "uz": (
            "🎲 <b>Sizni jamoaviy o'yinga chaqirishdi!</b>\n\n"
            "Xona tayyor — hamma yig'ilib, «Tayyorman» bossa o'yin boshlanadi. "
            "Kirish uchun pastdagi tugmani bosing."
        ),
        "ru": (
            "🎲 <b>Вас позвали в командную игру!</b>\n\n"
            "Комната готова — когда все нажмут «Готов», игра начнётся. "
            "Нажмите кнопку ниже."
        ),
    },
    "darslarHaqida": {
        "uz": (
            "🎓 <b>Darslar</b>\n\n"
            "Yo‘l xaritasi, yulduzlar va har safar yangi savollar. "
            "Ochish uchun tugmani bosing."
        ),
        "ru": (
            "🎓 <b>Уроки</b>\n\n"
            "Карта пути, звёзды и каждый раз новые задания. "
            "Нажмите кнопку."
        ),
    },
    "duelHaqida": {
        "uz": "⚔️ <b>Do'st bilan bellashuv</b>\n\nIkkalangiz ham AYNAN bir xil "
              "savollarni yechasiz — 60 soniya. Do'stingiz hozir ilovada bo'lsa, "
              "birga o'ynaysiz va ballaringiz bir-biringizga ko'rinib turadi. "
              "Bo'lmasa, chaqiruv havolasi qoladi va u istalgan payt javob beradi.",
        "ru": "⚔️ <b>Дуэль с другом</b>\n\nВы оба решаете ОДНИ И ТЕ ЖЕ задания — "
              "60 секунд. Если друг сейчас в приложении, играете вместе и видите "
              "очки друг друга. Если нет — останется ссылка-вызов.",
    },
    "maydonHaqida": {
        "uz": "🏟 <b>Bugungi maydon</b>\n\nHar kuni uchta bosqich va ular "
              "hammaga bir xil. Kuniga bir marta, yarim tunda yopiladi.",
        "ru": "🏟 <b>Арена дня</b>\n\nКаждый день три этапа, "
              "одинаковых для всех. Один раз в день.",
    },
    "reytingHaqida": {
        "uz": "🏆 <b>Reyting</b>\n\nBarcha kurslar bo'yicha yig'ilgan yulduzlar hisoblanadi.",
        "ru": "🏆 <b>Рейтинг</b>\n\nСчитаются звёзды по всем курсам.",
    },
    "tOchish": {"uz": "Ochish", "ru": "Открыть"},
    "buyruqRaqam": {"uz": "Telefon raqamini bog'lash", "ru": "Привязать номер телефона"},
    "buyruqYordam": {"uz": "Yordam", "ru": "Помощь"},
    #: Kiritish maydoni yonidagi menyu tugmasi.
    "menyuTugma": {"uz": "Ochish", "ru": "Открыть"},

    # ------------------------------------------------------------ bot: raqam
    #: Birinchi kirganda — qisqa va yumshoq. Bu yerda uzun tushuntirish
    #: ishlamaydi: odam hali ilovani ko'rmagan va nimani himoya
    #: qilayotganini bilmaydi.
    #: Raqam MAJBURIY: usiz ilovaga o'tkazilmaydi. Matn shuni ochiq
    #: aytadi va NEGA kerakligini tushuntiradi — sababsiz talab
    #: qilingan raqam odamni bot bilan birga yo'qotadi.
    #: `/start` xabarining oxirgi qatori. Havola muddati haqida gap
    #: YO'Q: kirish endi Mini App orqali, imzo bilan bo'ladi va
    #: hech qanday muddat qo'yilmaydi.
    "pastdagiTugma": {
        "uz": ("\n\n👇 Pastdagi tugmalardan boshlang."
        ),
        "ru": (
            "\n\n👇 Начните с кнопок ниже."
        ),
    },
    "raqamNegaKerak": {
        "uz": (
            "\n\n📱 Davom etish uchun raqamingizni yuboring.\n\n"
            "Bu hisobingizni saqlab qoladi: telefon almashsa yoki brauzer "
            "tozalansa ham yulduzlaringiz joyida qoladi."
        ),
        "ru": (
            "\n\n📱 Для продолжения отправьте свой номер.\n\n"
            "Это сохранит ваш профиль: при смене телефона или очистке "
            "браузера звёзды останутся на месте."
        ),
    },
    "raqamSora": {
        "uz": (
            "Raqamingizni yuboring — telefon yoki brauzer almashsa ham "
            "hisobingiz va yulduzlaringiz joyida qoladi."
        ),
        "ru": (
            "Отправьте свой номер — при смене телефона или браузера ваш "
            "профиль и звёзды останутся на месте."
        ),
    },
    "begonaKontakt": {
        "uz": "Iltimos, o'z raqamingizni yuboring — tugmani bosing.",
        "ru": "Пожалуйста, отправьте свой номер — нажмите кнопку.",
    },
    "raqamOqilmadi": {
        "uz": "Raqam o'qilmadi, qayta urining.",
        "ru": "Номер не распознан, попробуйте снова.",
    },
    "raqamSaqlandi": {
        "uz": "Rahmat, raqam saqlandi ✅",
        "ru": "Спасибо, номер сохранён ✅",
    },
    "raqamAllaqachon": {
        "uz": "Raqamingiz allaqachon saqlangan ✅",
        "ru": "Ваш номер уже сохранён ✅",
    },
    "ilovaSozlanmagan": {
        "uz": "⚠️ Ilova manzili sozlanmagan (SAYT_URL / MINI_APP_URL).",
        "ru": "⚠️ Адрес приложения не настроен (SAYT_URL / MINI_APP_URL).",
    },
    "ilovagaOtish": {
        "uz": "Ilovaga o'tish — tugma {muddat} amal qiladi:",
        "ru": "Перейти в приложение — кнопка действует {muddat}:",
    },

    # -------------------------------------------------------- bot: qolganlar
    "yordam": {
        "uz": (
            # Ilgari "/start — saytga kirish havolasi" va "tugmalar doim
            # shu yerda" deyilardi: ikkalasi ham endi to'g'ri emas
            # (klaviatura ataylab yig'iladi).
            "/start — ilovani ochish\n"
            "/dtm — DTM variantlari\n"
            "/sertifikat — Milliy sertifikat\n"
            "/masalalar — masalalar\n"
            "/oyinlar — matematik o'yinlar\n"
            "/duel — do'st bilan bellashuv\n"
            "/reyting — reyting\n"
            "/raqam — telefon raqamini bog'lash\n\n"
            "Pastdagi tugmalar yashirinsa — yozish maydonidagi klaviatura belgisini bosing.\n"
            "Savollar bo'lsa shu yerga yozing."
        ),
        "ru": (
            "/start — открыть приложение\n"
            "/dtm — варианты ДТМ\n"
            "/sertifikat — Национальный сертификат\n"
            "/masalalar — задачи\n"
            "/oyinlar — математические игры\n"
            "/duel — дуэль с другом\n"
            "/reyting — рейтинг\n"
            "/raqam — привязать номер телефона\n\n"
            "Если кнопки скрылись — нажмите значок клавиатуры в поле ввода.\n"
            "Если есть вопросы — напишите сюда."
        ),
    },
    "yordamAdmin": {
        "uz": "\n/boshqaruv — hisobot paneli\n/osish — haftalik o'sish hisoboti",
        "ru": "\n/boshqaruv — панель отчётов\n/osish — отчёт о росте за неделю",
    },
    # Noma'lum xabarga javob — IKKI xil.
    #
    # Doimiy klaviatura bor bo'lsa odamni tugmaga yo'naltirish kerak:
    # u allaqachon ekranda turadi va buyruq yozishdan osonroq. Klaviatura
    # yo'q bo'lsa (Mini App sozlanmagan) esa o'sha gapni aytish —
    # yo'q narsaga ishora qilish bo'lardi, shuning uchun eski javob
    # o'z o'rnida qoladi.
    "boshlaTugma": {
        "uz": (
            # Ilgari bu yerda klaviaturada YO'Q "📱 Raqam" sanalardi.
            # Endi ro'yxat yo'q — tugmalar shu xabar bilan birga keladi
            # va o'zi ko'rinib turadi; qo'lda yozilgan ro'yxat esa har
            # safar klaviatura o'zgarganda eskirib qolardi.
            "Quyidagi tugmalardan birini tanlang 👇"
        ),
        "ru": (
            "Выберите одну из кнопок ниже 👇"
        ),
    },
    "boshlaStart": {
        "uz": "Boshlash uchun /start yuboring.",
        "ru": "Чтобы начать, отправьте /start.",
    },

    # -------------------------------------------------------------- muddat
    "muddatSoat": {"uz": "{n} soat", "ru": "{n} ч."},
    "muddatDaqiqa": {"uz": "{n} daqiqa", "ru": "{n} мин."},

    # --------------------------------------------------- haftalik hisobot
    # Ota-onaga har yakshanba (`haftalik_hisobot.py`). Kattaga yozilgan:
    # o'yin so'zlari yo'q, raqamlar oldinda.
    "hisobotSarlavha": {"uz": "📊 <b>Haftalik hisobot</b>", "ru": "📊 <b>Отчёт за неделю</b>"},
    "hisobotProfil": {
        "uz": (
            "<b>{ism}</b>\n"
            "Faol kunlar: {kun} / 7\n"
            "Darslar: {dars} ta · {daqiqa} daqiqa\n"
            "To'g'ri javoblar: {aniqlik}%"
        ),
        "ru": (
            "<b>{ism}</b>\n"
            "Активных дней: {kun} / 7\n"
            "Уроков: {dars} · {daqiqa} мин.\n"
            "Правильных ответов: {aniqlik}%"
        ),
    },
    "hisobotZaif": {"uz": "Qiynalgan mavzu: {mavzu}", "ru": "Трудная тема: {mavzu}"},
    "hisobotBosh": {
        "uz": "<b>{ism}</b>\nBu hafta mashq qilinmadi.",
        "ru": "<b>{ism}</b>\nНа этой неделе занятий не было.",
    },
    "hisobotOxiri": {
        "uz": "Hisobotni ilovadagi Ota-ona panelida o'chirish mumkin.",
        "ru": "Отчёт можно отключить в панели для родителей в приложении.",
    },
    # ------------------------------------------------------ taklif va karta
    "taklifIsmsiz": {"uz": "Yangi o'quvchi", "ru": "Новый участник"},
    "taklifQoshildi": {
        "uz": "🎉 <b>{ism}</b> sizning havolangiz bilan Aql Zone'ga qo'shildi!\n\n"
              "Siz taklif qilganlar: <b>{n}</b> kishi. Rahmat! 🙌",
        "ru": "🎉 <b>{ism}</b> присоединился к Aql Zone по вашей ссылке!\n\n"
              "Вы пригласили: <b>{n}</b>. Спасибо! 🙌",
    },
    "kartaIzoh": {
        "uz": "📤 Natijangiz kartasi.\n\nUni do'stlaringizga yoki sinf guruhiga yuboring — "
              "pastdagi tugma orqali kelganlar sizning taklifingiz bo'lib sanaladi.",
        "ru": "📤 Карточка вашего результата.\n\nПерешлите её друзьям или в группу класса — "
              "пришедшие по кнопке ниже засчитаются как ваши приглашения.",
    },
    "tMenHam": {"uz": "📝 Men ham ishlayman", "ru": "📝 Я тоже решу"},

    # ------------------------------------------------------ marafon va sinf
    "marafonHaqida": {
        "uz": "🏃 <b>DTM marafoni</b>\n\nHar kuni bitta kun varianti — 10 ta DTM savoli, 20 daqiqa. "
              "Ball to'g'ri javoblardan yig'iladi, har kunning birinchi urinishi hisoblanadi. "
              "Yakunda g'oliblar kanalda e'lon qilinadi.",
        "ru": "🏃 <b>Марафон ДТМ</b>\n\nКаждый день — вариант дня: 10 вопросов ДТМ, 20 минут. "
              "Баллы — сумма верных ответов, засчитывается первая попытка дня. "
              "Победителей объявим в канале.",
    },
    "marafonEslatma": {
        "uz": "🏃 Marafonning <b>{kun}-kuni</b> ({kun}/{jami}) — bugungi variant sizni kutyapti.\n"
              "Zanjiringiz: <b>{zanjir} kun</b>. 20 daqiqa yetadi — o'tkazib yuborilgan kun qaytmaydi.",
        "ru": "🏃 <b>День {kun}</b> марафона ({kun}/{jami}) — сегодняшний вариант ждёт вас.\n"
              "Ваша серия: <b>{zanjir} дн.</b> Хватит 20 минут — пропущенный день не вернуть.",
    },
    "tMarafon": {"uz": "🏃 Bugungi variant", "ru": "🏃 Вариант дня"},
    "sinfBot": {
        "uz": "👩‍🏫 <b>Sinfga qo'shilish</b>\n\nO'qituvchingiz sizni sinfga taklif qildi. "
              "Qo'shilsangiz, o'qituvchi natijalaringizni ko'radi va sinf reytingida bo'lasiz.",
        "ru": "👩‍🏫 <b>Вступление в класс</b>\n\nУчитель пригласил вас в класс. "
              "После вступления учитель видит ваши результаты, а вы — рейтинг класса.",
    },

    # ------------------------------------------------------------- duel
    # Ilgari `core/duel.py` da faqat o'zbekcha yozilgan edi — ruscha
    # foydalanuvchi chaqiruv va natijani o'zbekcha olardi.
    "duelChaqiruv": {
        "uz": (
            "⚔️ <b>{ism} sizni bellashuvga chaqirdi!</b>\n\n"
            "Ikkalangiz bir xil savollarni yechasiz — kim tezroq va "
            "aniqroq javob bersa, o'sha yutadi."
        ),
        "ru": (
            "⚔️ <b>{ism} вызывает вас на дуэль!</b>\n\n"
            "Вы оба решаете одни и те же вопросы — побеждает тот, "
            "кто ответит быстрее и точнее."
        ),
    },
    "tQabulQilish": {"uz": "⚔️ Qabul qilish", "ru": "⚔️ Принять"},
    "duelDurang": {
        "uz": "🤝 <b>Durang!</b>\n\n{raqib} bilan {hisob} — teng chiqdingiz.",
        "ru": "🤝 <b>Ничья!</b>\n\n{raqib} — {hisob}, поровну.",
    },
    "duelYutdingiz": {
        "uz": "🏆 <b>Siz yutdingiz!</b>\n\n{raqib} — {hisob}",
        "ru": "🏆 <b>Вы победили!</b>\n\n{raqib} — {hisob}",
    },
    "duelYutqazdingiz": {
        "uz": "😔 <b>{raqib} sizni yutdi</b>\n\nHisob: {hisob}",
        "ru": "😔 <b>Победа за {raqib}</b>\n\nСчёт: {hisob}",
    },
    "tJavobBerish": {"uz": "⚔️ Javob berish", "ru": "⚔️ Ответить"},
    "tKunlikSon": {"uz": "Bugungi sonni yechish", "ru": "Решить число дня"},

    # Ilgari "Batafsil" — nima ochilishini aytmasdi.
    "tHisobotOchish": {"uz": "📊 Hisobotni ochish", "ru": "📊 Открыть отчёт"},

    # ------------------------------------------------------------- eslatma
    "eslatmaIsmsiz": {"uz": "Do'stim", "ru": "Друг"},
    "tMashqQilish": {"uz": "Mashq qilish", "ru": "Заниматься"},
    "eslatmaZanjir": {
        "uz": (
            "🔥 <b>{ism}</b>, zanjiring <b>{kun} kun</b>.\n\n"
            "Bugun mashq qilmasang uzilib qoladi — atigi 6 ta savol yetadi."
        ),
        "ru": (
            "🔥 <b>{ism}</b>, твоя серия — <b>{kun} дн.</b>\n\n"
            "Если сегодня не позанимаешься, она прервётся — хватит всего 6 вопросов."
        ),
    },
    # Talabaga — o'z tilida. "Yulduz yig'mading" degan bolalar matni
    # talabani ilovadan uzoqlashtiradi; unga nazorat va fan muhim.
    "eslatmaTalaba0": {
        "uz": (
            "📘 <b>{ism}</b>, bugun oliy matematikadan bitta dars qilamizmi?\n\n"
            "15 daqiqa — va oraliq nazoratga bir qadam yaqinroq."
        ),
        "ru": (
            "📘 <b>{ism}</b>, пройдём сегодня один урок высшей математики?\n\n"
            "15 минут — и вы на шаг ближе к промежуточному контролю."
        ),
    },
    "eslatmaTalaba1": {
        "uz": (
            "⏱ <b>{ism}</b>, sessiya variantini sinab ko'ring: 30 savol, 60 daqiqa.\n\n"
            "Oxirida taxminiy baho va qaysi mavzuda qoqilganingiz chiqadi."
        ),
        "ru": (
            "⏱ <b>{ism}</b>, попробуйте вариант сессии: 30 вопросов, 60 минут.\n\n"
            "В конце — примерная оценка и темы, где были ошибки."
        ),
    },
    "eslatmaTalaba2": {
        "uz": (
            "🧮 <b>{ism}</b>, limit, hosila, integral — bugun qaysi biri?\n\n"
            "Formulalar ham bir joyda, yechim qadam-baqadam."
        ),
        "ru": (
            "🧮 <b>{ism}</b>, пределы, производные, интегралы — что сегодня?\n\n"
            "Формулы в одном месте, решение по шагам."
        ),
    },
    "eslatmaBirKun": {
        "uz": (
            "👋 <b>{ism}</b>, kecha zo'r ishlading!\n\n"
            "Bugun ham davom etamizmi? 5 daqiqa — va zanjiring ikki kun bo'ladi."
        ),
        "ru": (
            "👋 <b>{ism}</b>, вчера ты отлично поработал!\n\n"
            "Продолжим сегодня? 5 минут — и серия станет двухдневной."
        ),
    },
    "eslatma0": {
        "uz": (
            "👋 <b>{ism}</b>, bugun Aql Zone'da mashq qilmading.\n\n"
            "Atigi 6 ta savol — boshlaymizmi?"
        ),
        "ru": (
            "👋 <b>{ism}</b>, сегодня ты ещё не занимался в Aql Zone.\n\n"
            "Всего 6 вопросов — начнём?"
        ),
    },
    "eslatma1": {
        "uz": (
            "🎯 <b>{ism}</b>, bugungi maqsading kutib turibdi.\n\n"
            "5 daqiqa — va yulduz qo'lingda."
        ),
        "ru": (
            "🎯 <b>{ism}</b>, твоя цель на сегодня ждёт.\n\n"
            "5 минут — и звезда у тебя в руках."
        ),
    },
    "eslatma2": {
        "uz": (
            "🏆 <b>{ism}</b>, haftalik ligada o'rning tushib ketmasin.\n\n"
            "Bitta dars yetadi — guruhdoshlaring uxlamayapti!"
        ),
        "ru": (
            "🏆 <b>{ism}</b>, не теряй место в недельной лиге.\n\n"
            "Хватит одного урока — соперники не спят!"
        ),
    },
    "eslatma3": {
        "uz": (
            "⭐ <b>{ism}</b>, bugun hali bitta ham yulduz yig'mading.\n\n"
            "Birinchisini olamizmi?"
        ),
        "ru": (
            "⭐ <b>{ism}</b>, сегодня у тебя пока ни одной звезды.\n\n"
            "Возьмём первую?"
        ),
    },

    # ------------------------------------------------------- qaytarish
    #
    # Uchta xabar, keyin BUTUNLAY sukut. Har biri boshqa narsa haqida
    # gapiradi va bu ataylab: bir xil gapni uch marta takrorlash —
    # yolvorish, va u ishlamaydi.
    #
    #   7-kun   yo'qotish yo'q ekanini aytadi (eng katta qo'rquv shu)
    #   21-kun  yangi sabab beradi
    #   45-kun  oxirgi, ochiq aytilgan xayrlashuv
    "qaytarish1": {
        "uz": (
            "👋 <b>{ism}</b>, ancha vaqt ko'rinmading.\n\n"
            "Yulduzlaring ham, tangalaring ham joyida turibdi — hech narsa "
            "yo'qolmagan. Qaytishing uchun 5 daqiqa yetadi."
        ),
        "ru": (
            "👋 <b>{ism}</b>, тебя давно не было.\n\n"
            "Твои звёзды и монеты на месте — ничего не пропало. Чтобы "
            "вернуться, хватит 5 минут."
        ),
    },
    "qaytarish2": {
        "uz": (
            "🎯 <b>{ism}</b>, ilovada yangilik bor.\n\n"
            "Endi har kuni bittadan sinov ochiladi — atigi 6 ta savol, "
            "tangasi ikki barobar. Bir ko'rib chiqasanmi?"
        ),
        "ru": (
            "🎯 <b>{ism}</b>, в приложении есть новое.\n\n"
            "Теперь каждый день открывается испытание — всего 6 вопросов, "
            "а монет вдвое больше. Заглянешь?"
        ),
    },
    "qaytarish3": {
        "uz": (
            "🌱 <b>{ism}</b>, bu oxirgi xabarim — boshqa bezovta qilmayman.\n\n"
            "Hisobing va yulduzlaring o'chirilmaydi: xohlagan kuning "
            "qaytsang, hammasi o'z joyida turgan bo'ladi."
        ),
        "ru": (
            "🌱 <b>{ism}</b>, это моё последнее сообщение — больше "
            "беспокоить не буду.\n\n"
            "Профиль и звёзды не удаляются: вернёшься в любой день — "
            "всё будет на месте."
        ),
    },
    "tQaytish": {"uz": "Davom etish", "ru": "Продолжить"},
    "tXabarniOchir": {"uz": "Boshqa yozmang", "ru": "Больше не писать"},
    "xabarYopildi": {
        "uz": (
            "Yaxshi, boshqa yozmaymiz ✅\n\n"
            "Ilovaning o'zi avvalgidek ishlaydi va hisobingizga hech narsa "
            "bo'lmaydi. Xohlagan paytda /start yuboring."
        ),
        "ru": (
            "Хорошо, больше писать не будем ✅\n\n"
            "Само приложение работает как прежде, с профилем ничего не "
            "случится. Напишите /start, когда захотите."
        ),
    },
    "karvonBot": {
        "uz": (
            "🐫 <b>Karvon yo'li</b>\n\n"
            "Ipak yo'li bo'ylab sarguzasht: to'siqlarni yechib, Toshkentdan Xivaga yeting!"
        ),
        "ru": (
            "🐫 <b>Путь каравана</b>\n\n"
            "Приключение по Шёлковому пути: решайте препятствия и дойдите из Ташкента до Хивы!"
        ),
    },
    "kichkintoyBot": {
        "uz": (
            "🧸 <b>Kichkintoylar</b>\n\n"
            "2 yoshdan: rasmli va ovozli o'yinlar — hayvonlar, ranglar, raqamlar. "
            "O'qiy olmaydigan bola ham tushunadi."
        ),
        "ru": (
            "🧸 <b>Малыши</b>\n\n"
            "С 2 лет: игры с картинками и озвучкой — животные, цвета, числа. "
            "Поймёт даже ребёнок, который ещё не читает."
        ),
    },
    "oyinlarBot": {
        "uz": (
            "🎲 <b>O'yinlar</b>\n\n"
            "Tezkor hisob, tarozi, 24 va boshqalar — 3 daraja. O'ynab hisobla."
        ),
        "ru": (
            "🎲 <b>Игры</b>\n\n"
            "Быстрый счёт, весы, 24 и другие — 3 уровня. Считай играя."
        ),
    },
    "qabulBot": {
        "uz": (
            "🎓 <b>Prezident maktablariga tayyorlov</b>\n\n"
            "4-sinf bitiruvchilari uchun: 30 topshiriq, 90 daqiqa — haqiqiy imtihondagidek. "
            "Oxirida mavzular bo'yicha tahlil va har savolning yechimi."
        ),
        "ru": (
            "🎓 <b>Подготовка к Президентским школам</b>\n\n"
            "Для выпускников 4 класса: 30 заданий, 90 минут — как на настоящем экзамене. "
            "В конце разбор по темам и решение каждого вопроса."
        ),
    },
    "mantiqBot": {
        "uz": (
            "🧩 <b>Mantiq va fikrlash</b>\n\n"
            "2–4-sinf uchun 14 ta usul: tovuqlar va quyonlar, sehrli kvadrat, tarozi va boshqalar."
        ),
        "ru": (
            "🧩 <b>Логика и мышление</b>\n\n"
            "14 приёмов для 2–4 класса: куры и кролики, магический квадрат, весы и другие."
        ),
    },
    "sinflarBot": {
        "uz": (
            "👩‍🏫 <b>O'qituvchi uchun sinf</b>\n\n"
            "Sinf ochasiz, o'quvchilar kod bilan qo'shiladi — kim ishlayapti va "
            "kim qayerda qiynalayotganini ko'rib turasiz."
        ),
        "ru": (
            "👩‍🏫 <b>Класс для учителя</b>\n\n"
            "Создаёте класс, ученики присоединяются по коду — вы видите, кто работает "
            "и у кого какие трудности."
        ),
    },
    #: Majburiy kanal a'zoligi (`KANAL_MAJBURIY`).
    "kanalShart": {
        "uz": (
            "📢 <b>Aql Zone'dan foydalanish uchun kanalimizga a'zo bo'ling</b>\n\n"
            "Kanalda har kuni yangi masalalar, testlar va o'yin yangiliklari chiqadi.\n\n"
            "1. «Kanalga o'tish» tugmasini bosing va a'zo bo'ling\n"
            "2. Qaytib «✅ A'zo bo'ldim» tugmasini bosing"
        ),
        "ru": (
            "📢 <b>Чтобы пользоваться Aql Zone, подпишитесь на наш канал</b>\n\n"
            "В канале каждый день новые задачи, тесты и новости игр.\n\n"
            "1. Нажмите «Перейти в канал» и подпишитесь\n"
            "2. Вернитесь и нажмите «✅ Я подписался»"
        ),
    },
    "tKanalgaOtish": {"uz": "📢 Kanalga o'tish", "ru": "📢 Перейти в канал"},
    "tAzoBoldim": {"uz": "✅ A'zo bo'ldim", "ru": "✅ Я подписался"},
    "kanalHaliYoq": {
        "uz": "Siz hali kanalga a'zo emassiz. Avval a'zo bo'ling, keyin qayta bosing.",
        "ru": "Вы ещё не подписаны. Сначала подпишитесь, затем нажмите снова.",
    },
    "kanalRahmat": {
        "uz": "Rahmat! A'zolik tasdiqlandi ✅",
        "ru": "Спасибо! Подписка подтверждена ✅",
    },
    # ------------------------------------------------- imtihon premium
    # `core/premium.py`, botdagi `/start premium`. Karta raqami matnga
    # `.env` dan qo'yiladi — bu yerda hech qachon turmaydi.
    "premiumTariflar": {
        "uz": (
            "⭐ <b>Imtihon Premium</b>\n\n"
            "DTM, Milliy sertifikat va Prezident maktabi — barcha variantlar, "
            "to'liq tahlil va haftalik reyting.\n\n"
            "• 7 kun — <b>{narx7} so'm</b>\n"
            "• 1 oy — <b>{narx1} so'm</b>\n\n"
            "Tarifni tanlang:"
        ),
        "ru": (
            "⭐ <b>Imtihon Premium</b>\n\n"
            "ДТМ, Нац. сертификат и Президентская школа — все варианты, "
            "полный разбор и недельный рейтинг.\n\n"
            "• 7 дней — <b>{narx7} сум</b>\n"
            "• 1 месяц — <b>{narx1} сум</b>\n\n"
            "Выберите тариф:"
        ),
    },
    "tPremium7kun": {"uz": "7 kun — {narx} so'm", "ru": "7 дней — {narx} сум"},
    "tPremium1oy": {"uz": "1 oy — {narx} so'm", "ru": "1 месяц — {narx} сум"},
    "premiumKarta": {
        "uz": (
            "💳 <b>{tarif} — {narx} so'm</b>\n\n"
            "Shu kartaga o'tkazing:\n"
            "<code>{karta}</code>\n"
            "{egasi}\n\n"
            "📸 To'lagach, <b>chek rasmini</b> shu yerga yuboring — "
            "tekshirib, Premium'ni yoqamiz."
        ),
        "ru": (
            "💳 <b>{tarif} — {narx} сум</b>\n\n"
            "Переведите на эту карту:\n"
            "<code>{karta}</code>\n"
            "{egasi}\n\n"
            "📸 После оплаты отправьте сюда <b>фото чека</b> — "
            "мы проверим и включим Premium."
        ),
    },
    "premiumYopiq": {
        "uz": "To'lov hozircha qabul qilinmayapti. Birozdan keyin qayta urinib ko'ring.",
        "ru": "Оплата сейчас не принимается. Попробуйте чуть позже.",
    },
    "premiumHisobYoq": {
        "uz": "Avval /start bosing va ilovaga shu Telegram orqali kiring — Premium hisobingizga yoziladi.",
        "ru": "Сначала нажмите /start и войдите в приложение через этот Telegram — Premium запишется на ваш аккаунт.",
    },
    "premiumKop": {
        "uz": "Sizda tekshirilmagan cheklar bor — admin ko'rib chiqqach javob beramiz.",
        "ru": "У вас уже есть непроверенные чеки — ответим после проверки.",
    },
    "premiumChekOlindi": {
        "uz": "✅ Chek qabul qilindi. Admin tekshirgach, Premium yoqiladi va shu yerga xabar keladi.",
        "ru": "✅ Чек получен. После проверки Premium включится, и сюда придёт сообщение.",
    },
    "premiumTasdiq": {
        "uz": (
            "⭐ <b>Premium yoqildi!</b>\n\n"
            "📦 Tarif: {tarif}\n"
            "⏳ Qoldi: <b>{qolgan}</b>\n"
            "📅 Tugaydi: {gacha}\n\n"
            "Barcha imtihon variantlari ochiq. Omad!"
        ),
        "ru": (
            "⭐ <b>Premium включён!</b>\n\n"
            "📦 Тариф: {tarif}\n"
            "⏳ Осталось: <b>{qolgan}</b>\n"
            "📅 До: {gacha}\n\n"
            "Все варианты экзаменов открыты. Удачи!"
        ),
    },
    "premiumRad": {
        "uz": "To'lov tasdiqlanmadi. Savol bo'lsa, admin bilan bog'laning.",
        "ru": "Оплата не подтверждена. Если есть вопросы, свяжитесь с админом.",
    },
    "premiumEslatma": {
        "uz": "⏳ Imtihon Premium tugashiga <b>{qolgan}</b> qoldi ({gacha}). Tayyorgarlik uzilmasin — uzaytirib qo'ying.",
        "ru": "⏳ До конца Imtihon Premium осталось <b>{qolgan}</b> ({gacha}). Чтобы подготовка не прервалась — продлите.",
    },
    "premiumHolat": {
        "uz": "⭐ Premium faol — yana <b>{qolgan}</b> ({gacha} gacha).",
        "ru": "⭐ Premium активен — ещё <b>{qolgan}</b> (до {gacha}).",
    },
    "tPremiumOchish": {"uz": "📝 Variantlarni ochish", "ru": "📝 Открыть варианты"},
    "tPremiumUzaytirish": {"uz": "⭐ Uzaytirish", "ru": "⭐ Продлить"},
    "tAdminAloqa": {"uz": "💬 Admin bilan aloqa", "ru": "💬 Связаться с админом"},
    # ---------------------------------------------------------- AI ustoz (`core/ai.py`)
    "buyruqAi": {"uz": "AI ustoz — savol bering yoki masala rasmini yuboring",
                 "ru": "AI-репетитор — задайте вопрос или пришлите фото задачи"},
    "aiBotSalom": {
        "uz": (
            "🤖 <b>AI ustoz</b> tayyor.\n\n"
            "Savolingizni yozing yoki masala rasmini yuboring — qadam-baqadam tushuntiraman.\n"
            "Bugun yana <b>{qolgan}</b> ta savol mumkin.\n\n"
            "Yangi mavzu: /ai · Chiqish: /stop"
        ),
        "ru": (
            "🤖 <b>AI-репетитор</b> готов.\n\n"
            "Напишите вопрос или пришлите фото задачи — объясню по шагам.\n"
            "Сегодня осталось вопросов: <b>{qolgan}</b>.\n\n"
            "Новая тема: /ai · Выход: /stop"
        ),
    },
    # Premiumsiz, sinov bor — necha bepul savol qolgani (`ai.bepul_qolgan`).
    "aiBotSalomBepul": {
        "uz": (
            "🤖 <b>AI ustoz</b> tayyor.\n\n"
            "Savolingizni yozing yoki masala rasmini yuboring — qadam-baqadam tushuntiraman.\n"
            "Sizda <b>{qolgan}</b> ta bepul savol bor, keyin — Imtihon Premium.\n\n"
            "Yangi mavzu: /ai · Chiqish: /stop"
        ),
        "ru": (
            "🤖 <b>AI-репетитор</b> готов.\n\n"
            "Напишите вопрос или пришлите фото задачи — объясню по шагам.\n"
            "Бесплатных вопросов: <b>{qolgan}</b>, дальше — Imtihon Premium.\n\n"
            "Новая тема: /ai · Выход: /stop"
        ),
    },
    "aiPremium": {
        "uz": (
            "🤖 <b>AI ustoz</b> — Imtihon Premium imkoniyati: imtihondagi xatolaringizni "
            "tushuntiradi, masalani yechishga yordam beradi va zaif mavzularingiz bo'yicha reja tuzadi."
        ),
        "ru": (
            "🤖 <b>AI-репетитор</b> — возможность Imtihon Premium: объясняет ошибки в экзамене, "
            "помогает решить задачу и составляет план по слабым темам."
        ),
    },
    "aiYopiq": {"uz": "AI ustoz hozircha ishlamayapti. Keyinroq urinib ko'ring.",
                "ru": "AI-репетитор пока не работает. Попробуйте позже."},
    "aiChegara": {"uz": "Bugungi {n} ta savol tugadi. Ertaga yana so'rashingiz mumkin.",
                  "ru": "Сегодняшние {n} вопросов закончились. Завтра можно снова."},
    "aiJami": {"uz": "AI ustoz hozir juda band — birozdan keyin urinib ko'ring.",
               "ru": "AI-репетитор сейчас перегружен — попробуйте чуть позже."},
    "aiBand": {"uz": "⏳ Oldingi savolga javob yozilyapti — biroz kuting.",
               "ru": "⏳ Ответ на прошлый вопрос ещё пишется — подождите немного."},
    "aiXato": {"uz": "Javob olib bo'lmadi. Savolni qayta yuboring.",
               "ru": "Не удалось получить ответ. Отправьте вопрос ещё раз."},
    "aiRasmXato": {"uz": "Rasmni o'qib bo'lmadi — boshqa rasm yuboring.",
                   "ru": "Не удалось прочитать фото — пришлите другое."},
    "aiChiqdi": {"uz": "AI ustoz o'chdi. Qaytish uchun: /ai",
                 "ru": "AI-репетитор выключен. Чтобы вернуться: /ai"},
}


def barcha(kalit: str) -> set[str]:
    """
    Bitta kalitning BARCHA tildagi matni.

    Doimiy klaviatura tugmalari uchun kerak: ular oddiy matn yuboradi va
    bot uni tanib olishi shart. Tanish faqat JORIY tilda bo'lsa, tilini
    almashtirgan odamning ekranida eski tildagi tugmalar qolib ketardi
    (Telegram klaviaturani o'zi yangilamaydi) va ular bosilganda bot
    "tushunmadim" derdi.
    """
    juft = XABAR.get(kalit) or {}
    return {v for v in juft.values() if v}


def M(kalit: str, til: str = STANDART, **orin) -> str:
    """
    Xabar matni — berilgan tilda, o'rinlari to'ldirilgan holda.

    Tarjimasi yo'q kalit O'ZBEKCHA qaytadi: yangi xabar qo'shilganda bot
    jim qolmaydi, shunchaki bir tilda gapiradi.
    """
    juft = XABAR.get(kalit)
    if not juft:
        return kalit
    matn = juft.get(til) or juft[STANDART]
    return matn.format(**orin) if orin else matn
