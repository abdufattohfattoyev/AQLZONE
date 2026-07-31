/**
 * Kurs, bob va dars nomlarining ruscha tarjimasi.
 *
 * Lug'at KALITI — o'zbekcha matnning o'zi, tarjima esa qiymat. Nega
 * shunday: `lib/curriculum/` da besh fayl, 60 dan ortiq bob va 170 dan
 * ortiq dars bor. Har biriga ikki tilli obyekt qo'ysak, o'sha beshta
 * fayl butunlay qayta yozilishi kerak bo'lardi va yangi dars qo'shish
 * ikki barobar mashaqqatga aylanardi. Bu yerda esa dastur o'zgarmaydi,
 * tarjima ustiga qo'yiladi.
 *
 * Tarjimasi yo'q matn O'ZBEKCHA HOLIDA qoladi. Ya'ni yangi dars
 * qo'shilganda hech narsa buzilmaydi — u shunchaki bu faylga tushmaguncha
 * o'zbekcha ko'rinadi.
 *
 * "1-bob." kabi oldingi qismlar lug'atda yo'q: ular dastur bilan
 * o'giriladi (`kursMatn`), aks holda bitta "Ranglar" so'zi bob raqami
 * bilan birga o'n marta takrorlanardi.
 */
import { til } from "../til";

const RU: Record<string, string> = {
  /* =============== boblar =============== */
  "Ranglar": "Цвета",
  "Shakllar": "Фигуры",
  "Hayvonlar": "Животные",
  "Mevalar": "Фрукты",
  "Transport": "Транспорт",
  "Sanash": "Счёт",
  "Qayerda turibdi": "Где находится",
  "Bir, ikki, uch": "Один, два, три",
  "5 gacha sanaymiz": "Считаем до 5",
  "10 gacha sanaymiz": "Считаем до 10",
  "Katta va kichik": "Большой и маленький",
  "Ko'p va kam": "Больше и меньше",
  "Qo'shish +": "Сложение +",
  "Ayirish −": "Вычитание −",
  "Qo'sh va ayir": "Сложи и вычти",
  "Yo'nalish": "Направление",
  "Kun tartibi": "Распорядок дня",
  "Ob-havo": "Погода",
  "Hafta kunlari": "Дни недели",
  "Naqsh va mantiq": "Узор и логика",
  "Harflar": "Буквы",
  "Bosh sinov": "Большое испытание",
  "Takrorlash — Bosh sinov": "Повторение — большое испытание",
  "1 dan 10 gacha sonlar": "Числа от 1 до 10",
  "10 ichida qo'shish": "Сложение в пределах 10",
  "10 ichida ayirish": "Вычитание в пределах 10",
  "10 ichida qo'shish va ayirish": "Сложение и вычитание в пределах 10",
  "Geometrik shakllar": "Геометрические фигуры",
  "11 dan 20 gacha sonlar": "Числа от 11 до 20",
  "100 gacha sonlar": "Числа до 100",
  "100 ichida qo'shish": "Сложение в пределах 100",
  "100 ichida ayirish": "Вычитание в пределах 100",
  "Ko'paytirishning ma'nosi": "Смысл умножения",
  "Bo'lish": "Деление",
  "Amallar tartibi": "Порядок действий",
  "Ulushlar": "Доли",
  "O'lchov va vaqt": "Измерение и время",
  "Jadval": "Таблица",
  "Takrorlash: 100 ichida amallar": "Повторение: действия в пределах 100",
  "1000 ichida sonlar": "Числа в пределах 1000",
  "1000 ichida qo'shish va ayirish": "Сложение и вычитание в пределах 1000",
  "Ko'p xonali sonlarni ko'paytirish va bo'lish":
    "Умножение и деление многозначных чисел",
  "Kasrlar (ulushlar)": "Дроби (доли)",
  "Kasrlar": "Дроби",
  "Kattaliklar: uzunlik, massa, vaqt": "Величины: длина, масса, время",
  "Kattaliklar va o'lchov birliklari": "Величины и единицы измерения",
  "Tenglama va ma'lumotlar": "Уравнение и данные",
  "Geometriya va yuza": "Геометрия и площадь",
  "Takrorlash: 1000 ichida amallar": "Повторение: действия в пределах 1000",
  "Million gacha sonlar": "Числа до миллиона",
  "Ko'p xonali sonlarni qo'shish va ayirish":
    "Сложение и вычитание многозначных чисел",
  "Ko'p xonali sonlarni ko'paytirish": "Умножение многозначных чисел",
  "Ko'p xonali sonlarni bo'lish": "Деление многозначных чисел",
  "Ifodalar va tenglamalar": "Выражения и уравнения",
  "Tezlik, vaqt, masofa": "Скорость, время, расстояние",
  "Ma'lumotlar va koordinata": "Данные и координаты",

  /* =============== darslar =============== */
  "Rangni top": "Найди цвет",
  "Rang nomi": "Название цвета",
  "Ranglar aralash": "Цвета вместе",
  "Shu rangni top": "Найди этот цвет",
  "Yetti rang": "Семь цветов",
  "Narsaning rangi": "Цвет предмета",
  "Qizil olmani top": "Найди красное яблоко",
  "Xuddi shu shaklni top": "Найди такую же фигуру",
  "Shakl nomi": "Название фигуры",
  "Shakllar aralash": "Фигуры вместе",
  "Shakllarni tanish": "Узнаём фигуры",
  "Shakllar nomi": "Названия фигур",
  "Naqsh davomi": "Продолжи узор",
  "Qaysi biri meva?": "Что из этого фрукт?",
  "Qaysi biri boshqacha?": "Что здесь лишнее?",
  "Qaysi biri boshqacha": "Что здесь лишнее",
  "Kim nima yeydi": "Кто что ест",
  "Kayfiyatni top": "Найди настроение",
  "Kim shunday deydi?": "Кто так говорит?",
  "Hayvon qanday ovoz chiqaradi": "Какой голос у животного",
  "Hayvon nomi": "Название животного",
  "Meva nomi": "Название фрукта",
  "Mevaning rangi": "Цвет фрукта",
  "Transport nomi": "Название транспорта",
  "U qayerda yuradi?": "Где он передвигается?",
  "Uzun va qisqa": "Длинный и короткий",
  "Strelka qayerga qaragan?": "Куда смотрит стрелка?",
  "Kun qismini top": "Найди часть дня",
  "Keyin nima bo'ladi?": "Что будет потом?",
  "Keyingi kun": "Следующий день",
  "Ob-havoni top": "Найди погоду",
  "Bunday kunda nima kerak?": "Что нужно в такой день?",
  "3 gacha sanash": "Счёт до 3",
  "5 gacha sanash": "Счёт до 5",
  "10 gacha sanash": "Счёт до 10",
  "5 tagacha sanash": "Счёт до 5 предметов",
  "10 tagacha sanash": "Счёт до 10 предметов",
  "Bitta, ikkita, uchta": "Один, два, три",
  "Raqamlar 1–5": "Цифры 1–5",
  "Raqamlar 6–10": "Цифры 6–10",
  "Sonlar qatori": "Числовой ряд",
  "Sonlar qatori 10 gacha": "Числовой ряд до 10",
  "Sonlar nuri": "Числовой луч",
  "Sonlar nuri (100 gacha)": "Числовой луч (до 100)",
  "Sonlar tarkibi": "Состав числа",
  "Keyingi son": "Следующее число",
  "Keyingi va oldingi son": "Следующее и предыдущее число",
  "Qaysi son katta": "Какое число больше",
  "Qaysi biri katta?": "Что больше?",
  "Katta sonlarni taqqoslash": "Сравнение больших чисел",
  "1000 ichida taqqoslash": "Сравнение в пределах 1000",
  "11–20 taqqoslash": "Сравнение 11–20",
  "Qayerda kam?": "Где меньше?",
  "Ortiqchasini top": "Найди лишнее",
  "Hayvonlar orasida eng kattasi": "Самое большое из животных",
  "Narsa qayerda turibdi": "Где находится предмет",
  "Yuqorida — pastda": "Сверху — снизу",
  "O'ngda — chapda": "Справа — слева",
  "Hammasi nechta?": "Сколько всего?",
  "Nechtasi qoldi?": "Сколько осталось?",
  "Rasm bilan qo'shish": "Сложение с картинками",
  "Rasm bilan ayirish": "Вычитание с картинками",
  "Rasm bilan aralash": "Картинки вместе",
  "Belgi bilan qo'shish": "Сложение со знаком",
  "Belgi bilan ayirish": "Вычитание со знаком",
  "Belgilar bilan aralash": "Знаки вместе",
  "Ko'proq qo'shamiz": "Складываем больше",
  "Ko'proq ayiramiz": "Вычитаем больше",
  "Aralash: qo'sh va ayir": "Вместе: сложи и вычти",
  "20 ichida qo'shish": "Сложение в пределах 20",
  "20 ichida ayirish": "Вычитание в пределах 20",
  "1000 ichida qo'shish": "Сложение в пределах 1000",
  "1000 ichida ayirish": "Вычитание в пределах 1000",
  "O'nlikdan o'tib qo'shish": "Сложение с переходом через десяток",
  "O'nlikdan o'tib ayirish": "Вычитание с переходом через десяток",
  "O'nliklar va birliklar": "Десятки и единицы",
  "O'nliklarni qo'shish": "Сложение десятков",
  "Dasta va tayoqcha": "Пучки и палочки",
  "Ikki xonali sonlar": "Двузначные числа",
  "Xonalarni ajratish": "Разряды числа",
  "Sonni xonalaridan yasash": "Составь число из разрядов",
  "Minglar sinfi": "Класс тысяч",
  "Ustun shaklida qo'shish": "Сложение в столбик",
  "Ustun shaklida ayirish": "Вычитание в столбик",
  "Ko'p xonali qo'shish": "Сложение многозначных",
  "Ko'p xonali ayirish": "Вычитание многозначных",
  "Yaxlitlash": "Округление",
  "Yaxlitlash · sonlar nuri": "Округление · числовой луч",
  "Teng guruhlar": "Равные группы",
  "Yig'indidan ko'paytmaga": "От суммы к произведению",
  "Ko'paytirish jadvali": "Таблица умножения",
  "Bo'lish jadvali": "Таблица деления",
  "Teng bo'lish": "Деление на равные части",
  "Ko'paytirish va bo'lish": "Умножение и деление",
  "Ko'paytirish va bo'lish bog'liqligi": "Связь умножения и деления",
  "Qoldiqli bo'lish": "Деление с остатком",
  "Bir xonaliga bo'lish": "Деление на однозначное",
  "Ikki xonaliga bo'lish": "Деление на двузначное",
  "Ko'p xonali × bir xonali": "Многозначное × однозначное",
  "Ko'p xonali ÷ bir xonali": "Многозначное ÷ однозначное",
  "Uch xonali × bir xonali": "Трёхзначное × однозначное",
  "Ikki xonali × ikki xonali": "Двузначное × двузначное",
  "Yumaloq songa ko'paytirish": "Умножение на круглое число",
  "Ko'paytir, keyin qo'sh": "Умножь, потом сложи",
  "Ko'paytir, keyin qo'sh/ayir": "Умножь, потом сложи или вычти",
  "Bo'l, keyin qo'sh": "Раздели, потом сложи",
  "Qavsli ifodalar": "Выражения со скобками",
  "Harfli ifodalar": "Буквенные выражения",
  "Tenglamalar": "Уравнения",
  "Noma'lumni topish": "Найди неизвестное",
  "Aralash va tenglama": "Вместе с уравнением",
  "Aralash harakat masalalari": "Задачи на движение",
  "Aralash sinov 1": "Смешанное испытание 1",
  "Aralash sinov 2": "Смешанное испытание 2",
  "Aralash sinov 3": "Смешанное испытание 3",
  "Ulushni tanish": "Знакомимся с долями",
  "Sonning ulushi": "Доля числа",
  "Ulushlarni taqqoslash": "Сравнение долей",
  "Kasrlarni qo'shish": "Сложение дробей",
  "Kasrlarni ayirish": "Вычитание дробей",
  "Kasrlarni taqqoslash": "Сравнение дробей",
  "Perimetr": "Периметр",
  "Perimetr va shakllar": "Периметр и фигуры",
  "Katakli yuza": "Площадь по клеточкам",
  "Yuzani hisoblash": "Вычисление площади",
  "Yuzadan tomonni topish": "Найди сторону по площади",
  "Yuza birliklari": "Единицы площади",
  "Burchaklar": "Углы",
  "Burchaklarni sanash": "Считаем углы",
  "Santimetr va millimetr": "Сантиметр и миллиметр",
  "Uzunlik birliklari": "Единицы длины",
  "Massa birliklari": "Единицы массы",
  "Uzunlik va massa": "Длина и масса",
  "Vaqt birliklari": "Единицы времени",
  "Vaqt: asr, yil, sutka": "Время: век, год, сутки",
  "Soatni o'qish": "Читаем часы",
  "Tezlikni topish": "Найди скорость",
  "Vaqtni topish": "Найди время",
  "Masofani topish": "Найди расстояние",
  "Jadval va diagramma": "Таблица и диаграмма",
  "Jadval va koordinata": "Таблица и координаты",
  "Rasmli jadval": "Таблица с картинками",
  "Koordinata": "Координаты",
  "Xuddi shunisini top": "Найди такой же",
  "Xuddi shu harfni top": "Найди такую же букву",
  "Qaysi biri A harfi?": "Где буква А?",
  "So'z qaysi harf bilan boshlanadi": "С какой буквы начинается слово",
  "1, 2, 3 raqamlari": "Цифры 1, 2, 3",
  "Bob takrorlash": "Повторение главы",
  '"+" belgisi bilan': "Со знаком «+»",
  '"−" belgisi bilan': "Со знаком «−»",

  /* =============== tanishtirish ekranidagi nomlar =============== */
  "ranglar": "цвета",
  "shakllar": "фигуры",
  "hayvonlar": "животные",
  "mevalar": "фрукты",
  "transport": "транспорт",
  "yo'nalishlar": "направления",
  "kun qismlari": "части дня",
  "ob-havo": "погода",
  "kayfiyatlar": "настроения",
  "doira": "круг",
  "katta fil": "большой слон",
  "A harfi": "буква А",

  /* =============== bob kirishlari: sarlavha =============== */
  "Ranglarni taniymiz": "Узнаём цвета",
  "Shakllarni taniymiz": "Узнаём фигуры",
  "Hayvonlarni taniymiz": "Узнаём животных",
  "Hayvonlar olami": "Мир животных",
  "Mevalarni taniymiz": "Узнаём фрукты",
  "Nima bilan yuramiz": "На чём мы ездим",
  "Sanashni boshlaymiz": "Начинаем считать",
  "Sonlarni taniymiz": "Узнаём числа",
  "To'rt va besh": "Четыре и пять",
  "Beshdan keyin": "После пяти",
  "Yuzgacha sanaymiz": "Считаем до ста",
  "O'nlikdan keyin": "После десятка",
  "Kattaroq sonlar": "Числа побольше",
  "Kattaroq sonlardan ayiramiz": "Вычитаем из больших чисел",
  "Qayerga?": "Куда?",
  "Kun qismlari": "Части дня",
  "Hafta": "Неделя",
  "Bugun havo qanday?": "Какая сегодня погода?",
  "Keyin nima keladi?": "Что будет дальше?",
  "O'qishga tayyorlanamiz": "Готовимся к чтению",
  "Hammasini sinaymiz!": "Проверим всё!",
  "100 ichida qo'shamiz": "Складываем в пределах 100",
  "100 ichida ayiramiz": "Вычитаем в пределах 100",
  "Qo'shamiz va ayiramiz": "Складываем и вычитаем",
  "Ikkalasi aralash": "Вместе и то, и другое",
  "Ustun shaklida hisoblaymiz": "Считаем в столбик",
  "Ko'paytirish nima?": "Что такое умножение?",
  "Ko'paytiramiz": "Умножаем",
  "Bir xonaliga ko'paytiramiz": "Умножаем на однозначное",
  "Bo'lamiz": "Делим",
  "Qaysi amal avval?": "Какое действие первым?",
  "Ifodalarni hisoblaymiz": "Вычисляем выражения",
  "Noma'lumni topamiz": "Находим неизвестное",
  "Butunning bo'laklari": "Части целого",
  "Teng bo'laklarga bo'lamiz": "Делим на равные части",
  "Kasrlar bilan ishlash": "Работаем с дробями",
  "O'lchaymiz": "Измеряем",
  "O'lchovlar": "Измерения",
  "O'lchov birliklari": "Единицы измерения",
  "Perimetr va yuza": "Периметр и площадь",
  "Yuza va perimetr": "Площадь и периметр",
  "Shakllar va perimetr": "Фигуры и периметр",
  "Ma'lumot bilan ishlash": "Работаем с данными",
  "Harakat masalalari": "Задачи на движение",
  "Katta sonlar olami": "Мир больших чисел",
  "Uch xonali sonlar": "Трёхзначные числа",
  "2-sinfni takrorlaymiz": "Повторяем 2 класс",
  "3-sinfni takrorlaymiz": "Повторяем 3 класс",

  /* =============== bob kirishlari: izoh =============== */
  "Qizil, sariq, ko'k, yashil. O'qish kerak emas — rangni tanlaysan.":
    "Красный, жёлтый, синий, зелёный. Читать не нужно — просто выбери цвет.",
  "Qizil, sariq, ko'k, yashil, binafsha, qora, oq.":
    "Красный, жёлтый, синий, зелёный, фиолетовый, чёрный, белый.",
  "Doira, uchburchak, kvadrat, yulduz.": "Круг, треугольник, квадрат, звезда.",
  "Doira, uchburchak, kvadrat. Burchaklarini sanaymiz.":
    "Круг, треугольник, квадрат. Считаем углы.",
  "It, mushuk, quyon, fil. Xuddi shunisini topamiz.":
    "Собака, кот, заяц, слон. Найдём такого же.",
  "It, mushuk, arslon, fil — va ularning ovozi.":
    "Собака, кот, лев, слон — и их голоса.",
  "Olma, banan, uzum, tarvuz — nomi va rangi.":
    "Яблоко, банан, виноград, арбуз — название и цвет.",
  "Mashina, samolyot, poyezd, kema.": "Машина, самолёт, поезд, корабль.",
  "Uchtagacha sanaymiz — bu yoshda shuning o'zi katta ish.":
    "Считаем до трёх — в этом возрасте это уже большое дело.",
  "Beshgacha sanash, raqamlar va sonlar qatori.":
    "Счёт до пяти, цифры и числовой ряд.",
  "Olti, yetti, sakkiz, to'qqiz, o'n.": "Шесть, семь, восемь, девять, десять.",
  "Avval 5 tagacha, keyin 10 tagacha sanaymiz.":
    "Сначала до 5, потом до 10 предметов.",
  "Katta–kichik, uzun–qisqa, baland–past.":
    "Большой — маленький, длинный — короткий, высокий — низкий.",
  "Ikki guruhni taqqoslaymiz — qo'shishdan oldingi qadam.":
    "Сравниваем две группы — шаг перед сложением.",
  "Ikki guruh birlashadi. Avval rasm bilan, keyin belgi bilan.":
    "Две группы соединяются. Сначала с картинками, потом со знаком.",
  "Bir qismi ketadi — nechtasi qoldi?": "Часть уходит — сколько осталось?",
  "Endi belgiga qarab ish qilamiz: qo'shishmi yoki ayirish?":
    "Теперь смотрим на знак: складываем или вычитаем?",
  "Endi o'ngacha qo'shamiz.": "Теперь складываем до десяти.",
  "O'ngacha sonlardan ayirish.": "Вычитаем из чисел до десяти.",
  "10 ichida qo'shish, ayirish va ikkalasi aralash.":
    "Сложение и вычитание в пределах 10 — и всё вместе.",
  "Yuqoriga, pastga, chapga, o'ngga.": "Вверх, вниз, влево, вправо.",
  "Yuqorida, pastda, o'ngda, chapda, o'rtada.":
    "Сверху, снизу, справа, слева, в середине.",
  "Ertalab, tush, kech, tun.": "Утро, день, вечер, ночь.",
  "Quyoshli, yomg'irli, qorli, bulutli.": "Солнечно, дождливо, снежно, облачно.",
  "Dushanbadan yakshanbagacha. Bu darsni kattalar bilan o'ynash qulay.":
    "С понедельника по воскресенье. Этот урок удобно проходить со взрослым.",
  "Naqsh, guruhlash, kayfiyat — matematik mantiqning boshlanishi.":
    "Узор, группировка, настроение — начало математической логики.",
  "Harfni o'qimaymiz — tanib olamiz va so'zning boshini topamiz.":
    "Букву не читаем — узнаём её и находим начало слова.",
  "Ranglar, shakllar, hayvonlar, sanash, qo'shish va ayirish.":
    "Цвета, фигуры, животные, счёт, сложение и вычитание.",
  "Sonlar nuri, katta va kichik son, sonlar tarkibi.":
    "Числовой луч, большие и малые числа, состав числа.",
  "11–20: bitta dasta va yakka tayoqchalar.":
    "11–20: один пучок и отдельные палочки.",
  "O'nliklar va birliklar, 100 ichida qo'shish-ayirish.":
    "Десятки и единицы, сложение и вычитание в пределах 100.",
  "Ranglar, hayvonlar, sanash, 10 va 20 ichida amallar, 100 gacha sonlar.":
    "Цвета, животные, счёт, действия в пределах 10 и 20, числа до 100.",
  "O'nlikdan o'tib qo'shishni va ustun shaklini o'rganamiz.":
    "Учимся складывать с переходом через десяток и считать в столбик.",
  "O'nlikni buzib ayirishni va ustun shaklini o'rganamiz.":
    "Учимся вычитать с разбиением десятка и считать в столбик.",
  "Bir xil qo'shiluvchilar yig'indisi — bu ko'paytma.":
    "Сумма одинаковых слагаемых — это произведение.",
  "Bo'lish — teng guruhlarga ajratish. Ko'paytirish bilan bog'liq.":
    "Деление — разбиение на равные группы. Оно связано с умножением.",
  "Avval ko'paytirish, keyin qo'shish. Qavs bo'lsa — avval qavs.":
    "Сначала умножение, потом сложение. Есть скобки — сначала скобки.",
  "Avval ko'paytirish va bo'lish, keyin qo'shish va ayirish. Qavs bo'lsa — avval qavs!":
    "Сначала умножение и деление, потом сложение и вычитание. Есть скобки — сначала скобки!",
  "Yarmi, uchdan biri, choragi — butunni teng bo'lamiz.":
    "Половина, треть, четверть — делим целое на равные части.",
  "Butunni teng bo'laklarga bo'lamiz: yarmi, uchdan biri, choragi.":
    "Делим целое на равные части: половина, треть, четверть.",
  "Bir xil maxrajli kasrlarni qo'shamiz va ayiramiz, kasrlarni taqqoslaymiz.":
    "Складываем и вычитаем дроби с одинаковым знаменателем, сравниваем дроби.",
  "Santimetr va millimetr, soat va vaqt birliklari.":
    "Сантиметр и миллиметр, часы и единицы времени.",
  "Millimetr, santimetr, metr, kilometr; gramm va kilogramm; soat va vaqt birliklari.":
    "Миллиметр, сантиметр, метр, километр; грамм и килограмм; часы и единицы времени.",
  "Uzunlik, massa va yuza birliklari; vaqt: asr, yil, sutka, soat.":
    "Единицы длины, массы и площади; время: век, год, сутки, час.",
  "Jadvaldan eng ko'pini topamiz va sanaymiz.":
    "Находим в таблице самое большое и считаем.",
  "Jadval, diagramma va koordinata katakchalari bilan ishlaymiz.":
    "Работаем с таблицей, диаграммой и координатной сеткой.",
  "Tenglama, harfli ifoda, jadval va koordinata.":
    "Уравнение, буквенное выражение, таблица и координаты.",
  "Tenglamalarda noma'lumni topamiz, harfli ifodalar, jadval va koordinata bilan ishlaymiz.":
    "Находим неизвестное в уравнениях, работаем с буквенными выражениями, таблицей и координатами.",
  "Shakllarni taniymiz, perimetrni hisoblaymiz va katakli daftarda yuzani topamiz.":
    "Узнаём фигуры, считаем периметр и находим площадь в клетчатой тетради.",
  "Shakllarni taniymiz, burchaklarini sanaymiz, perimetr va yuzani topamiz.":
    "Узнаём фигуры, считаем углы, находим периметр и площадь.",
  "To'g'ri to'rtburchak yuzasi va perimetri, tomonni topish, shakllar va burchaklar.":
    "Площадь и периметр прямоугольника, поиск стороны, фигуры и углы.",
  "Butun yil o'rganganingiz: 1000 ichida amallar, ko'paytirish, kasr, perimetr, tenglama.":
    "Всё за год: действия в пределах 1000, умножение, дроби, периметр, уравнения.",
  "Butun yil: qo'shish-ayirish, ko'paytirish-bo'lish, shakllar, ulush, vaqt.":
    "Весь год: сложение и вычитание, умножение и деление, фигуры, доли, время.",
  "Butun yil: million gacha sonlar, ko'p xonali amallar, kasr, tezlik, yuza, tenglama.":
    "Весь год: числа до миллиона, действия с многозначными, дроби, скорость, площадь, уравнения.",
  "100 ichida qo'shish-ayirishni va ko'paytirish jadvalini yodga olamiz.":
    "Вспоминаем сложение и вычитание в пределах 100 и таблицу умножения.",
  "1000 ichida qo'shish-ayirish, ko'paytirish va amallar tartibini yodga olamiz.":
    "Вспоминаем сложение и вычитание в пределах 1000, умножение и порядок действий.",
  "Uch xonali sonlarni ustun shaklida — xonama-xona qo'shamiz va ayiramiz.":
    "Складываем и вычитаем трёхзначные числа в столбик — разряд за разрядом.",
  "To'rt xonali sonlarni ustun shaklida qo'shamiz va ayiramiz.":
    "Складываем и вычитаем четырёхзначные числа в столбик.",
  "Yuzlik, o'nlik va birlikdan sonlar yasaymiz, taqqoslaymiz va yaxlitlaymiz.":
    "Составляем числа из сотен, десятков и единиц, сравниваем и округляем.",
  "Minglar sinfi va birliklar sinfi. Ko'p xonali sonlarni yasaymiz, taqqoslaymiz, yaxlitlaymiz.":
    "Класс тысяч и класс единиц. Составляем, сравниваем и округляем многозначные числа.",
  "Ko'p xonali sonni bir xonali songa ko'paytiramiz va bo'lamiz, qoldiqni topamiz.":
    "Умножаем и делим многозначное число на однозначное, находим остаток.",
  "Ko'p xonali sonni bir xonaliga, yumaloq songa va ikki xonali sonlarga ko'paytiramiz.":
    "Умножаем многозначное число на однозначное, на круглое и на двузначное.",
  "Ko'p xonali sonlarni bir xonali va ikki xonali songa bo'lamiz, qoldiqni topamiz.":
    "Делим многозначные числа на однозначное и двузначное, находим остаток.",
  "Masofa = tezlik × vaqt. Shu formuladan tezlik va vaqtni ham topamiz.":
    "Расстояние = скорость × время. По этой формуле находим и скорость, и время.",
  "Qavs, ko'paytirish-bo'lish, qo'shish-ayirish tartibi. Harfli ifodalar va tenglamalar.":
    "Скобки, умножение и деление, потом сложение и вычитание. Буквенные выражения и уравнения.",

  /* =============== kurs nomlari va izohlari =============== */
  "Maktabgacha": "Дошкольный курс",
  "1-sinf Matematika": "Математика 1 класс",
  "2-sinf Matematika": "Математика 2 класс",
  "3-sinf Matematika": "Математика 3 класс",
  "4-sinf Matematika": "Математика 4 класс",
  "4–6 yosh · ranglar, shakllar, naqsh, sanash, harflar":
    "4–6 лет · цвета, фигуры, узоры, счёт, буквы",
  "Ranglar, hayvonlar, sanash — o'qish shart emas":
    "Цвета, животные, счёт — читать не обязательно",
  "Ko'paytirish, bo'lish, perimetr, ulush, soat":
    "Умножение, деление, периметр, доли, часы",
  "1000 ichida amallar, qoldiqli bo'lish, ulushlar":
    "Действия в пределах 1000, деление с остатком, доли",
  "Million gacha sonlar, kasrlar, tezlik-vaqt-masofa":
    "Числа до миллиона, дроби, скорость-время-расстояние",

  /* =============== kirish belgilaridagi so'zlar =============== */
  "sm": "см",
  "mm": "мм",
  "kg": "кг",
  "soat": "ч",
  "o'nlik": "десяток",
};

/** "1-bob. Ranglar" ni ikkiga ajratadigan qolip. */
const BOB = /^(\d+)-bob\.\s*/;

/**
 * Kurs dasturidan kelgan matnni tilga o'giradi.
 *
 * O'zbekchada hech narsa qilmaydi — shu sabab uni HAR JOYDA chaqirish
 * xavfsiz va arzon.
 */
export function kursMatn(s: string): string {
  if (til() !== "ru" || !s) return s;

  const m = BOB.exec(s);
  if (m) {
    const qolgan = s.slice(m[0].length);
    return `Глава ${m[1]}. ${RU[qolgan] ?? qolgan}`;
  }

  return RU[s] ?? s;
}

/** Sinf nomi: 0 → "Maktabgacha" / "Дошкольный курс". */
export const sinfMatn = (grade: number): string =>
  grade === 0
    ? (til() === "ru" ? "Дошкольный курс" : "Maktabgacha")
    : (til() === "ru" ? `${grade} класс` : `${grade}-sinf`);
