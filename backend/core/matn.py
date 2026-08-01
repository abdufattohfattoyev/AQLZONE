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
            "Assalomu alaykum{ism}! 👋\n\n"
            "<b>Aql Zone</b> — 1–4-sinf matematikasi.\n"
            "Bola darslik boblari bo'ylab yuradi, yulduz yig'adi va "
            "har safar yangi savollar yechadi."
        ),
        "ru": (
            "Здравствуйте{ism}! 👋\n\n"
            "<b>Aql Zone</b> — математика 1–4 классов.\n"
            "Ребёнок идёт по главам учебника, собирает звёзды и каждый раз "
            "решает новые задания."
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
    "tIlova": {"uz": "🎓 Darslar", "ru": "🎓 Уроки"},
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
    "buyruqStart": {"uz": "Boshlash va saytga kirish", "ru": "Начать и войти на сайт"},
    "buyruqOyinlar": {"uz": "Matematik o'yinlar", "ru": "Математические игры"},
    "buyruqDuel": {"uz": "Do'st bilan bellashuv", "ru": "Дуэль с другом"},
    "buyruqMaydon": {"uz": "Bugungi maydon — 3 bosqich", "ru": "Арена дня — 3 этапа"},
    "buyruqReyting": {"uz": "Reyting jadvali", "ru": "Таблица рейтинга"},
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
            "/start — saytga kirish havolasini olish\n"
            "/oyinlar — matematik o'yinlar\n"
            "/raqam — telefon raqamini bog'lash\n\n"
            "Pastdagi tugmalar doim shu yerda turadi.\n"
            "Savollar bo'lsa shu yerga yozing."
        ),
        "ru": (
            "/start — получить ссылку для входа на сайт\n"
            "/oyinlar — математические игры\n"
            "/raqam — привязать номер телефона\n\n"
            "Кнопки внизу всегда на месте.\n"
            "Если есть вопросы — напишите сюда."
        ),
    },
    "yordamAdmin": {
        "uz": "\n/boshqaruv — hisobot paneli",
        "ru": "\n/boshqaruv — панель отчётов",
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
            "Quyidagi tugmalardan birini tanlang 👇\n\n"
            "🎓 Darslar · 🎮 O'yinlar · 📱 Raqam · ❓ Yordam"
        ),
        "ru": (
            "Выберите одну из кнопок ниже 👇\n\n"
            "🎓 Уроки · 🎮 Игры · 📱 Номер · ❓ Помощь"
        ),
    },
    "boshlaStart": {
        "uz": "Boshlash uchun /start yuboring.",
        "ru": "Чтобы начать, отправьте /start.",
    },

    # -------------------------------------------------------------- muddat
    "muddatSoat": {"uz": "{n} soat", "ru": "{n} ч."},
    "muddatDaqiqa": {"uz": "{n} daqiqa", "ru": "{n} мин."},

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
