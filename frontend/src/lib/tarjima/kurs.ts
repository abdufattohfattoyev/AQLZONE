/**
 * Kurs, bob va dars nomlarining ruscha tarjimasi.
 *
 * Lug'at KALITI — o'zbekcha matnning o'zi, tarjima esa qiymat. Nega
 * shunday: `lib/curriculum/` da yettita fayl, 90 dan ortiq bob va 400 dan
 * ortiq dars bor. Har biriga ikki tilli obyekt qo'ysak, o'sha yettita
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

  /* =============== 5–6-sinf: boblar =============== */
  "Takrorlash: 4-sinf materiali": "Повторение: материал 4 класса",
  "Takrorlash: 5-sinf materiali": "Повторение: материал 5 класса",
  "Natural sonlar va nol": "Натуральные числа и нуль",
  "Natural sonlarni qo'shish va ayirish": "Сложение и вычитание натуральных чисел",
  "Natural sonlarni ko'paytirish va bo'lish": "Умножение и деление натуральных чисел",
  "To'rt amal va daraja": "Четыре действия и степень",
  "Matnli masalalarni yechish": "Решение текстовых задач",
  "Burchaklar va siniq chiziq": "Углы и ломаная",
  "Yuza va yuz o'lchov birliklari": "Площадь и единицы площади",
  "Oddiy kasrlar": "Обыкновенные дроби",
  "Aralash sonlar": "Смешанные числа",
  "Fazoviy shakllar va hajm": "Пространственные фигуры и объём",
  "O'nli kasrlar": "Десятичные дроби",
  "O'nli kasrlarni ko'paytirish va bo'lish": "Умножение и деление десятичных дробей",
  "Foizlar": "Проценты",
  "Ma'lumotlar tahlili": "Анализ данных",
  "Sonlarning bo'linish belgilari": "Признаки делимости чисел",
  "EKUB va EKUK": "НОД и НОК",
  "Kasrning asosiy xossasi": "Основное свойство дроби",
  "Har xil maxrajli kasrlarni qo'shish va ayirish":
    "Сложение и вычитание дробей с разными знаменателями",
  "Oddiy kasrlarni ko'paytirish": "Умножение обыкновенных дробей",
  "Oddiy kasrlarni bo'lish": "Деление обыкновенных дробей",
  "Nisbat va proporsiya": "Отношение и пропорция",
  "Musbat va manfiy sonlar": "Положительные и отрицательные числа",
  "Butun sonlarni qo'shish va ayirish": "Сложение и вычитание целых чисел",
  "Butun sonlarni ko'paytirish va bo'lish": "Умножение и деление целых чисел",
  "Tenglamalarni yechish": "Решение уравнений",
  "Ma'lumotlar va kombinatorika": "Данные и комбинаторика",
  "Geometrik material": "Геометрический материал",

  /* =============== 5–6-sinf: darslar =============== */
  "Ko'p xonali qo'shish va ayirish": "Сложение и вычитание многозначных чисел",
  "Kasr va kattaliklar": "Дроби и величины",
  "Natural sonlar qatori": "Ряд натуральных чисел",
  "Shkalalar va sonlar nuri": "Шкалы и числовой луч",
  "Natural sonlarni taqqoslash": "Сравнение натуральных чисел",
  "Natural sonlarni yaxlitlash": "Округление натуральных чисел",
  "Natural sonlarni qo'shish": "Сложение натуральных чисел",
  "Natural sonlarni ayirish": "Вычитание натуральных чисел",
  "Sonli va harfli ifodalar": "Числовые и буквенные выражения",
  "Matematik masala va tenglamalar": "Математические задачи и уравнения",
  "Natural sonlarni ko'paytirish": "Умножение натуральных чисел",
  "Natural sonlarni bo'lish": "Деление натуральных чисел",
  "Qulay va tezkor hisoblash": "Удобные и быстрые вычисления",
  "Ifodalarni soddalashtirish": "Упрощение выражений",
  "To'rt amalga doir hisoblash": "Вычисления на четыре действия",
  "Sonning kvadrati va kubi": "Квадрат и куб числа",
  "Daraja va amallar tartibi": "Степень и порядок действий",
  "Qismlarga doir masalalar": "Задачи на части",
  "Geometrik mazmundagi masalalar": "Задачи геометрического содержания",
  "Harakatga doir masalalar": "Задачи на движение",
  "Ikki jism harakatiga doir masalalar": "Задачи на движение двух тел",
  "Iqtisodiy mazmundagi masalalar": "Задачи экономического содержания",
  "Bajarilgan ishga doir masalalar": "Задачи на выполненную работу",
  "Burchaklar va ularning turlari": "Углы и их виды",
  "Burchaklarni o'lchash va qo'shish": "Измерение и сложение углов",
  "Siniq chiziq va uning uzunligi": "Ломаная и её длина",
  "Ko'pburchak perimetri": "Периметр многоугольника",
  "To'g'ri to'rtburchakning yuzi": "Площадь прямоугольника",
  "Murakkab shakllarning yuzi": "Площадь составных фигур",
  "Yuz o'lchov birliklari": "Единицы измерения площади",
  "Ulushlar va oddiy kasrlar": "Доли и обыкновенные дроби",
  "To'g'ri va noto'g'ri kasrlar": "Правильные и неправильные дроби",
  "Bir xil maxrajli kasrlarni qo'shish va ayirish":
    "Сложение и вычитание дробей с одинаковыми знаменателями",
  "Bo'lish va kasrlar": "Деление и дроби",
  "Aralash sonlarni qo'shish va ayirish": "Сложение и вычитание смешанных чисел",
  "Kasrlarga doir masalalar": "Задачи на дроби",
  "Fazoviy shakllar. Ko'pyoqlar": "Пространственные фигуры. Многогранники",
  "Parallelepiped va kub": "Параллелепипед и куб",
  "Parallelepiped va kub hajmi": "Объём параллелепипеда и куба",
  "O'nli kasrlarni taqqoslash": "Сравнение десятичных дробей",
  "O'nli kasrlarni qo'shish va ayirish": "Сложение и вычитание десятичных дробей",
  "Taqribiy qiymat va yaxlitlash": "Приближённое значение и округление",
  "Natural songa ko'paytirish": "Умножение на натуральное число",
  "Natural songa bo'lish": "Деление на натуральное число",
  "O'nli kasrlarni ko'paytirish": "Умножение десятичных дробей",
  "O'nli kasrni o'nli kasrga bo'lish": "Деление десятичной дроби на десятичную",
  "Foiz tushunchasi": "Понятие процента",
  "Sonning foizini topish": "Нахождение процента от числа",
  "Necha foiz ekanini topish": "Нахождение процентного отношения",
  "O'rta arifmetik": "Среднее арифметическое",
  "Ma'lumotlar qatori va uning tahlili": "Ряд данных и его анализ",
  "Natural sonlar bilan amallar": "Действия с натуральными числами",
  "Foiz va o'rta arifmetik": "Проценты и среднее арифметическое",
  "Sonning bo'luvchilari va karralilari": "Делители и кратные числа",
  "10 ga, 5 ga va 2 ga bo'linish belgilari": "Признаки делимости на 10, 5 и 2",
  "9 ga va 3 ga bo'linish belgilari": "Признаки делимости на 9 и 3",
  "Tub va murakkab sonlar": "Простые и составные числа",
  "Tub ko'paytuvchilarga ajratish": "Разложение на простые множители",
  "Eng katta umumiy bo'luvchi": "Наибольший общий делитель",
  "O'zaro tub sonlar": "Взаимно простые числа",
  "Eng kichik umumiy karrali": "Наименьшее общее кратное",
  "Kasrlarni qisqartirish": "Сокращение дробей",
  "Kasrlarni umumiy maxrajga keltirish": "Приведение дробей к общему знаменателю",
  "Har xil maxrajli kasrlarni taqqoslash": "Сравнение дробей с разными знаменателями",
  "Har xil maxrajli kasrlarni qo'shish": "Сложение дробей с разными знаменателями",
  "Har xil maxrajli kasrlarni ayirish": "Вычитание дробей с разными знаменателями",
  "Aralash sonlarni qo'shish": "Сложение смешанных чисел",
  "Aralash sonlarni ayirish": "Вычитание смешанных чисел",
  "Aralash sonlarni ko'paytirish": "Умножение смешанных чисел",
  "Sonning qismini topish": "Нахождение части числа",
  "Ko'paytirishning taqsimot qonuni": "Распределительный закон умножения",
  "O'zaro teskari sonlar": "Взаимно обратные числа",
  "Qismiga ko'ra sonning o'zini topish": "Нахождение числа по его части",
  "Nisbat tushunchasi": "Понятие отношения",
  "Proporsiyaning asosiy xossasi": "Основное свойство пропорции",
  "To'g'ri proporsional miqdorlar": "Прямо пропорциональные величины",
  "Teskari proporsional miqdorlar": "Обратно пропорциональные величины",
  "Masshtab": "Масштаб",
  "Koordinata to'g'ri chizig'i": "Координатная прямая",
  "Qarama-qarshi sonlar va modul": "Противоположные числа и модуль",
  "Sonlarni taqqoslash": "Сравнение чисел",
  "Bir xil ishorali sonlarni qo'shish": "Сложение чисел с одинаковыми знаками",
  "Har xil ishorali sonlarni qo'shish": "Сложение чисел с разными знаками",
  "Sonlarni ayirish": "Вычитание чисел",
  "Sonlarni ko'paytirish": "Умножение чисел",
  "Sonlarni bo'lish": "Деление чисел",
  "Daraja va kvadrat ildiz": "Степень и квадратный корень",
  "Qavslarni ochish qoidasi": "Правило раскрытия скобок",
  "Koeffitsiyent": "Коэффициент",
  "Chiziqli tenglamalarni yechish": "Решение линейных уравнений",
  "Kasr koeffitsiyentli tenglamalar": "Уравнения с дробными коэффициентами",
  "Jadvallar va diagrammalar": "Таблицы и диаграммы",
  "Kombinatorika elementlari": "Элементы комбинаторики",
  "Uchburchak va uning turlari": "Треугольник и его виды",
  "Uchburchak perimetri va burchaklari": "Периметр и углы треугольника",
  "Uchburchakning yuzi": "Площадь треугольника",
  "Katakli qog'ozda yuzlarni hisoblash": "Вычисление площадей на клетчатой бумаге",
  "Aylana uzunligi va doira yuzi": "Длина окружности и площадь круга",

  /* =============== 5–6-sinf: bob kirishlari =============== */
  "4-sinfni yodga olamiz": "Вспоминаем 4 класс",
  "5-sinfni yodga olamiz": "Вспоминаем 5 класс",
  "Natural sonlar olami": "Мир натуральных чисел",
  "Katta sonlar bilan": "С большими числами",
  "Ko'paytiramiz va bo'lamiz": "Умножаем и делим",
  "Daraja bilan tanishamiz": "Знакомимся со степенью",
  "Masala yechamiz": "Решаем задачи",
  "Burchaklar olami": "Мир углов",
  "Yuzani hisoblaymiz": "Вычисляем площадь",
  "Kasrlar bilan tanishamiz": "Знакомимся с дробями",
  "Butun va kasr birga": "Целое и дробь вместе",
  "Uch o'lchovli olam": "Трёхмерный мир",
  "Verguldan keyin": "После запятой",
  "Vergulni to'g'ri qo'yamiz": "Ставим запятую верно",
  "Yuzdan bir qism": "Сотая часть",
  "Ma'lumot bilan ishlaymiz": "Работаем с данными",
  "Qaysi songa bo'linadi?": "На какое число делится?",
  "Umumiy bo'luvchi va karrali": "Общий делитель и кратное",
  "Kasrni o'zgartiramiz": "Изменяем дробь",
  "Umumiy maxrajga keltiramiz": "Приводим к общему знаменателю",
  "Kasrni kasrga": "Дробь на дробь",
  "Teskari songa ko'paytiramiz": "Умножаем на обратное число",
  "Noldan pastga": "Ниже нуля",
  "Ishoralar bilan ishlaymiz": "Работаем со знаками",
  "Ishoralar qoidasi": "Правило знаков",
  "x ni topamiz": "Находим x",
  "Ma'lumotni o'qiymiz": "Читаем данные",
  "Uchburchak va doira": "Треугольник и круг",
  "EKUB": "НОД",
  "EKUK": "НОК",

  /* =============== 5–6-sinf: bob izohlari =============== */
  "Ko'p xonali amallar, amallar tartibi, kasr va kattaliklarni takrorlaymiz.":
    "Повторяем действия с многозначными числами, порядок действий, дроби и величины.",
  "Natural sonlar qatori, shkalalar va sonlar nuri, taqqoslash va yaxlitlash.":
    "Ряд натуральных чисел, шкалы и числовой луч, сравнение и округление.",
  "Besh xonali sonlarni qo'shamiz va ayiramiz, harfli ifoda va tenglamalarni yechamiz.":
    "Складываем и вычитаем пятизначные числа, решаем буквенные выражения и уравнения.",
  "Uch xonalini ikki xonaliga ko'paytirish, bo'lish, qoldiqli bo'lish va qulay hisoblash.":
    "Умножение трёхзначного на двузначное, деление, деление с остатком и удобные вычисления.",
  "To'rt amalga doir hisoblash algoritmi, sonning kvadrati, kubi va darajasi.":
    "Алгоритм вычислений на четыре действия, квадрат, куб и степень числа.",
  "Qismlarga, geometriyaga, harakatga, savdoga va bajarilgan ishga doir masalalar.":
    "Задачи на части, геометрию, движение, куплю-продажу и выполненную работу.",
  "Burchak turlari, burchaklarni qo'shish, siniq chiziq va ko'pburchak perimetri.":
    "Виды углов, сложение углов, ломаная и периметр многоугольника.",
  "To'g'ri to'rtburchak yuzi, murakkab shakllar yuzi va yuz o'lchov birliklari.":
    "Площадь прямоугольника, площадь составных фигур и единицы измерения площади.",
  "Ulush va kasr, kasrlarni taqqoslash, to'g'ri va noto'g'ri kasrlar, qo'shish va ayirish.":
    "Доли и дроби, сравнение дробей, правильные и неправильные дроби, сложение и вычитание.",
  "Noto'g'ri kasrni aralash songa aylantiramiz, aralash sonlarni qo'shamiz va ayiramiz.":
    "Переводим неправильную дробь в смешанное число, складываем и вычитаем смешанные числа.",
  "Ko'pyoqlar, to'g'ri burchakli parallelepiped va kub, ularning hajmi.":
    "Многогранники, прямоугольный параллелепипед и куб, их объём.",
  "O'nli kasrni o'qish va yozish, taqqoslash, qo'shish-ayirish va yaxlitlash.":
    "Чтение и запись десятичной дроби, сравнение, сложение-вычитание и округление.",
  "O'nli kasrni natural songa va o'nli kasrga ko'paytirish hamda bo'lish.":
    "Умножение и деление десятичной дроби на натуральное число и на десятичную дробь.",
  "Foiz — sonning yuzdan bir qismi. Sonning foizini va necha foiz ekanini topamiz.":
    "Процент — сотая часть числа. Находим процент от числа и процентное отношение.",
  "Ma'lumotlar qatorining o'rta arifmetigi, eng katta va eng kichik qiymat.":
    "Среднее арифметическое ряда данных, наибольшее и наименьшее значение.",
  "Butun yil: natural sonlar, daraja, masalalar, kasr, o'nli kasr, foiz, hajm va yuza.":
    "Весь год: натуральные числа, степень, задачи, дроби, десятичные дроби, проценты, объём и площадь.",
  "Natural sonlar bilan amallar, oddiy va o'nli kasrlar, foiz va o'rta arifmetik.":
    "Действия с натуральными числами, обыкновенные и десятичные дроби, проценты и среднее арифметическое.",
  "Bo'luvchi va karrali, 2 ga, 3 ga, 5 ga, 9 ga va 10 ga bo'linish belgilari.":
    "Делители и кратные, признаки делимости на 2, 3, 5, 9 и 10.",
  "Eng katta umumiy bo'luvchi, o'zaro tub sonlar va eng kichik umumiy karrali.":
    "Наибольший общий делитель, взаимно простые числа и наименьшее общее кратное.",
  "Kasrning asosiy xossasi, qisqartirish, umumiy maxrajga keltirish va taqqoslash.":
    "Основное свойство дроби, сокращение, приведение к общему знаменателю и сравнение.",
  "Har xil maxrajli kasrlarni va aralash sonlarni qo'shamiz hamda ayiramiz.":
    "Складываем и вычитаем дроби с разными знаменателями и смешанные числа.",
  "Oddiy kasrlarni va aralash sonlarni ko'paytirish, sonning qismini topish.":
    "Умножение обыкновенных дробей и смешанных чисел, нахождение части числа.",
  "O'zaro teskari sonlar, kasrlarni bo'lish va qismiga ko'ra sonning o'zini topish.":
    "Взаимно обратные числа, деление дробей и нахождение числа по его части.",
  "Nisbat, proporsiyaning asosiy xossasi, to'g'ri va teskari proporsional miqdorlar, masshtab.":
    "Отношение, основное свойство пропорции, прямо и обратно пропорциональные величины, масштаб.",
  "Musbat va manfiy sonlar, koordinata to'g'ri chizig'i, qarama-qarshi sonlar va modul.":
    "Положительные и отрицательные числа, координатная прямая, противоположные числа и модуль.",
  "Bir xil va har xil ishorali sonlarni qo'shamiz, so'ng ayirishni o'rganamiz.":
    "Складываем числа с одинаковыми и разными знаками, затем учимся вычитать.",
  "Ishoralar bir xil bo'lsa — musbat, har xil bo'lsa — manfiy. Daraja va kvadrat ildiz.":
    "Знаки одинаковые — плюс, разные — минус. Степень и квадратный корень.",
  "Qavslarni ochish qoidasi, koeffitsiyent va bir noma'lumli chiziqli tenglamalar.":
    "Правило раскрытия скобок, коэффициент и линейные уравнения с одним неизвестным.",
  "Jadval va diagrammalar, ma'lumotlar tahlili hamda kombinatorikaning ko'paytirish qoidasi.":
    "Таблицы и диаграммы, анализ данных и правило умножения в комбинаторике.",
  "Uchburchak turlari, burchaklari va yuzi, katakli qog'ozda yuza, aylana va doira.":
    "Виды треугольников, их углы и площадь, площадь на клетчатой бумаге, окружность и круг.",
  "Butun yil: bo'linish belgilari, kasrlar, proporsiya, manfiy sonlar, tenglama va geometriya.":
    "Весь год: признаки делимости, дроби, пропорция, отрицательные числа, уравнения и геометрия.",

  /* =============== kurs nomlari va izohlari =============== */
  "Maktabgacha": "Дошкольный курс",
  "1-sinf Matematika": "Математика 1 класс",
  "2-sinf Matematika": "Математика 2 класс",
  "3-sinf Matematika": "Математика 3 класс",
  "4-sinf Matematika": "Математика 4 класс",
  "5-sinf Matematika": "Математика 5 класс",
  "6-sinf Matematika": "Математика 6 класс",
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
  "Daraja, oddiy va o'nli kasrlar, foiz, hajm":
    "Степень, обыкновенные и десятичные дроби, проценты, объём",
  "Bo'linish belgilari, proporsiya, manfiy sonlar, tenglama":
    "Признаки делимости, пропорция, отрицательные числа, уравнения",

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

/**
 * Kurs kodining odam o'qiy oladigan nomi.
 *
 * Kod tuzilishi `curriculum/index.ts` dagi `Course.grade` izohida
 * tushuntirilgan: 100 dan katta kod — geometriya. Ochish SHU YERDA,
 * bitta joyda: server ham, ota-ona hisoboti ham, boshqaruv paneli ham
 * kursni faqat shu son bilan biladi.
 */
export const sinfMatn = (grade: number): string => {
  const ru = til() === "ru";
  if (grade === 0) return ru ? "Дошкольный курс" : "Maktabgacha";
  if (grade >= 100) {
    const sinf = grade - 100;
    return ru ? `${sinf} класс, геометрия` : `${sinf}-sinf geometriya`;
  }
  if (grade >= 7 && grade <= 10) return ru ? `${grade} класс, алгебра` : `${grade}-sinf algebra`;
  return ru ? `${grade} класс` : `${grade}-sinf`;
};
