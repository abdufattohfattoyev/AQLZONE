/**
 * TO'LIQ DARSLAR — 7-sinf algebra. Tuzilishi `tolaqGeometriya.ts` dagidek.
 * Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_ALGEBRA7: Record<string, Tolaq> = {
  "algebra7|Sonli ifodalar": {
    t: [
      { h: ["Amallar tartibi", "Порядок действий"],
        p: ["Sonli ifoda — sonlar va amal belgilaridan iborat yozuv. Tartib har doim bir xil: 1) qavs ichi, 2) daraja, 3) ko'paytirish va bo'lish, 4) qo'shish va ayirish. Bir xil bosqichdagi amallar CHAPDAN O'NGGA bajariladi.",
          "Числовое выражение — запись из чисел и знаков действий. Порядок один: 1) скобки, 2) степень, 3) умножение и деление, 4) сложение и вычитание. Действия одного уровня выполняются СЛЕВА НАПРАВО."] },
    ],
    f: [
      { n: ["Tartib", "Порядок"], f: "( )  →  aⁿ  →  · :  →  + −" },
      { n: ["Chapdan o'ngga", "Слева направо"], f: "48 : 6 · 2 = 8 · 2 = 16" },
    ],
    s: [
      ["Ifodada qavs, daraja va amallarni belgilab chiqing.", "Отметьте в выражении скобки, степени и действия."],
      ["Eng yuqori bosqichdagi amaldan boshlang; har qadamda ifodani qayta yozing.", "Начинайте с высшего уровня; на каждом шаге переписывайте выражение."],
      ["Javobni teskari amal yoki taxminiy hisob bilan tekshiring.", "Проверьте ответ обратным действием или прикидкой."],
    ],
    m: [
      { s: ["10 + 6 · 7 ni hisoblang.", "Вычислите 10 + 6 · 7."],
        y: ["Avval ko'paytirish: 6 · 7 = 42", "10 + 42"], j: "52" },
      { s: ["2 + 3² · 4 ni hisoblang.", "Вычислите 2 + 3² · 4."],
        y: ["Daraja: 3² = 9", "Ko'paytirish: 9 · 4 = 36", "2 + 36"], j: "38" },
      { s: ["(12 − 4) · 3 − 20 : 5 ni hisoblang.", "Вычислите (12 − 4) · 3 − 20 : 5."],
        y: ["Qavs: 8 · 3 − 20 : 5", "24 − 4"], j: "20" },
    ],
    x: [
      ["10 + 6 · 7 ni 16 · 7 deb hisoblash: ko'paytirish qo'shishdan oldin.", "Считать 10 + 6 · 7 как 16 · 7: умножение раньше сложения."],
      ["48 : 6 · 2 ni 48 : 12 deb olish: bir xil bosqichda chapdan o'ngga.", "Считать 48 : 6 · 2 как 48 : 12: на одном уровне слева направо."],
    ],
  },

  "Algebraik ifodalar": {
    t: [
      { h: ["Harfli ifoda", "Буквенное выражение"],
        p: ["Algebraik ifodada sonlar bilan birga harflar (o'zgaruvchilar) bo'ladi. Uning qiymatini topish uchun harf o'rniga berilgan sonni QAVS ichida qo'yamiz, so'ng amallar tartibi bilan hisoblaymiz. Manfiy son qo'yilganda qavs xatoning oldini oladi.",
          "В алгебраическом выражении, кроме чисел, есть буквы (переменные). Чтобы найти значение, подставляем число вместо буквы В СКОБКАХ и считаем по порядку действий. Скобки особенно важны для отрицательных чисел."] },
    ],
    f: [
      { n: ["Ko'paytma yozuvi", "Запись произведения"], f: "3 · a = 3a,   a · b = ab" },
      { n: ["Manfiy son qo'yish", "Подстановка отрицательного"], f: "a² da a = −3:  (−3)² = 9" },
    ],
    s: [
      ["Har bir harf o'rniga uning qiymatini qavs ichida qo'ying.", "Подставьте вместо каждой буквы её значение в скобках."],
      ["Amallar tartibi bilan hisoblang.", "Вычислите по порядку действий."],
    ],
    m: [
      { s: ["3a + 2b ning qiymatini a = 2, b = −1 da toping.", "Найдите значение 3a + 2b при a = 2, b = −1."],
        y: ["3 · 2 + 2 · (−1)", "6 − 2"], j: "4" },
      { s: ["a² − 2a ni a = −3 da hisoblang.", "Вычислите a² − 2a при a = −3."],
        y: ["(−3)² − 2 · (−3)", "9 + 6"], j: "15" },
      { s: ["2(x + 3) − x ni x = 5 da hisoblang.", "Вычислите 2(x + 3) − x при x = 5."],
        y: ["2 · (5 + 3) − 5 = 16 − 5"], j: "11" },
    ],
    x: [
      ["Manfiy sonni qavssiz qo'yish: a² da a = −3 bo'lsa −3² = −9 chiqib qoladi (to'g'risi +9).", "Подставлять отрицательное без скобок: при a = −3 получится −3² = −9 (верно +9)."],
      ["3a ni 3 + a deb o'qish: yozuvdagi harf oldidagi son — ko'paytirish.", "Читать 3a как 3 + a: число перед буквой — умножение."],
    ],
  },

  "Tengliklar va formulalar": {
    t: [
      { h: ["Formula", "Формула"],
        p: ["Formula — kattaliklar orasidagi bog'lanishning harfli yozuvi: P = 2(a + b), S = vt. Formuladan har bir harfni ifodalash mumkin: xuddi tenglamadagidek, ikki tomon ustida bir xil amal bajariladi.",
          "Формула — буквенная запись связи между величинами: P = 2(a + b), S = vt. Из формулы можно выразить любую букву: как в уравнении, с обеими частями делают одно и то же."] },
    ],
    f: [
      { n: ["Yo'l", "Путь"], f: "S = v · t,   v = S / t,   t = S / v" },
      { n: ["To'g'ri to'rtburchak perimetri", "Периметр прямоугольника"], f: "P = 2(a + b)" },
      { n: ["Yuz", "Площадь"], f: "S = a · b" },
    ],
    s: [
      ["Kerakli harfni yakkalang: unga aloqasiz hadlarni qarshi tomonga o'tkazing.", "Уедините нужную букву: остальное перенесите в другую часть."],
      ["Ko'paytuvchidan qutulish uchun ikki tomonni bo'ling.", "Чтобы избавиться от множителя, разделите обе части."],
      ["Sonlarni oxirida qo'ying.", "Числа подставляйте в самом конце."],
    ],
    m: [
      { s: ["S = vt formuladan t ni ifodalang va v = 60, S = 150 da hisoblang.", "Выразите t из S = vt и вычислите при v = 60, S = 150."],
        y: ["t = S / v", "t = 150 / 60"], j: "2,5" },
      { s: ["P = 2(a + b), P = 30, a = 7. b ni toping.", "P = 2(a + b), P = 30, a = 7. Найдите b."],
        y: ["a + b = P / 2 = 15", "b = 15 − 7"], j: "8" },
    ],
    x: [
      ["Ifodalashda faqat bir tomonni o'zgartirish: ikkala tomonda ham amal bajariladi.", "Менять только одну часть: действие делают с обеими."],
      ["Sonni erta qo'yib, formulani buzish: avval harf, keyin son.", "Подставлять числа слишком рано: сначала выразить, потом считать."],
    ],
  },

  "Qavslarni ochish": {
    t: [
      { h: ["Qoidalar", "Правила"],
        p: ["Qavs oldida «+» bo'lsa, qavs ichidagi hadlar ishorasi O'ZGARMAYDI. Qavs oldida «−» bo'lsa, HAR BIR had ishorasi teskarisiga o'zgaradi. Qavs oldida son bo'lsa, u qavs ichidagi HAR BIR hadga ko'paytiriladi.",
          "Если перед скобкой «+», знаки внутри НЕ меняются. Если «−» — знак КАЖДОГО слагаемого меняется на противоположный. Если перед скобкой число, оно умножается на КАЖДОЕ слагаемое."] },
    ],
    f: [
      { n: ["Plyus", "Плюс"], f: "a + (b − c) = a + b − c" },
      { n: ["Minus", "Минус"], f: "a − (b − c) = a − b + c" },
      { n: ["Taqsimot", "Распределительный закон"], f: "k(a + b) = ka + kb" },
    ],
    s: [
      ["Qavs oldidagi belgiga qarang: +, − yoki son.", "Посмотрите на знак или число перед скобкой."],
      ["Belgiga mos qoidani HAR BIR hadga qo'llang.", "Примените правило к КАЖДОМУ слагаемому."],
      ["O'xshash hadlarni ixchamlang.", "Приведите подобные слагаемые."],
    ],
    m: [
      { s: ["5 − (3 − x) ni soddalashtiring.", "Упростите 5 − (3 − x)."],
        y: ["5 − 3 + x"], j: "2 + x" },
      { s: ["2(3x − 4) ni oching.", "Раскройте 2(3x − 4)."],
        y: ["2 · 3x − 2 · 4"], j: "6x − 8" },
      { s: ["−(a − b) + (2a + b) ni soddalashtiring.", "Упростите −(a − b) + (2a + b)."],
        y: ["−a + b + 2a + b", "(−a + 2a) + (b + b)"], j: "a + 2b" },
    ],
    x: [
      ["Minus oldida faqat birinchi hadning ishorasini o'zgartirish.", "Менять знак только у первого слагаемого после минуса."],
      ["Songa ko'paytirganda qavs ichidagi ikkinchi hadni unutish: 2(3x − 4) = 6x − 4 emas.", "Забыть умножить второе слагаемое: 2(3x − 4) ≠ 6x − 4."],
    ],
  },

  "Tenglama va uning ildizlari": {
    t: [
      { h: ["Tenglama va ildiz", "Уравнение и корень"],
        p: ["Tenglama — noma'lum qatnashgan tenglik. Tenglamani to'g'ri tenglikka aylantiradigan son — uning ILDIZI. Tenglamani yechish — barcha ildizlarini topish yoki ildiz yo'qligini ko'rsatish. Ildizni har doim o'rniga qo'yib tekshirish mumkin.",
          "Уравнение — равенство с неизвестным. Число, обращающее уравнение в верное равенство, — его КОРЕНЬ. Решить уравнение — найти все корни или показать, что их нет. Корень всегда можно проверить подстановкой."] },
    ],
    f: [
      { n: ["Tekshirish", "Проверка"], f: "x = 5 ildizmi?  3 · 5 − 1 = 14  va  x + 9 = 14  ✓" },
    ],
    s: [
      ["Berilgan sonni tenglamadagi x o'rniga qo'ying.", "Подставьте число вместо x."],
      ["Ikki tomonni alohida hisoblang.", "Вычислите обе части отдельно."],
      ["Teng bo'lsa — ildiz, bo'lmasa — ildiz emas.", "Равны — корень, нет — не корень."],
    ],
    m: [
      { s: ["3 soni 3x − 1 = 8 ning ildizimi?", "Является ли 3 корнем 3x − 1 = 8?"],
        y: ["Chap tomon: 3 · 3 − 1 = 8", "O'ng tomon: 8"], j: "Ha, 8 = 8" },
      { s: ["x + 7 = 12 ni yeching.", "Решите x + 7 = 12."],
        y: ["x = 12 − 7"], j: "5" },
    ],
    x: [
      ["Tekshirishda faqat bir tomonni hisoblash.", "При проверке считать только одну часть."],
      ["«Ildiz» va «tenglama» so'zlarini aralashtirish: ildiz — son, tenglama — yozuv.", "Путать «корень» и «уравнение»: корень — число."],
    ],
  },

  "Tenglamalarni yechish": {
    t: [
      { h: ["Tenglama xossalari", "Свойства уравнений"],
        p: ["Tenglamaning ikkala tomoniga bir xil sonni qo'shish yoki ayirish ildizni o'zgartirmaydi. Hadni bir tomondan ikkinchisiga ISHORASINI o'zgartirib o'tkazish shundan kelib chiqadi. Ikkala tomonni NOLDAN FARQLI songa ko'paytirish yoki bo'lish ham mumkin.",
          "Прибавление или вычитание одного числа из обеих частей не меняет корни. Отсюда правило переноса слагаемого с ПРОТИВОПОЛОЖНЫМ знаком. Обе части можно умножать или делить на число, НЕ РАВНОЕ НУЛЮ."] },
      { h: ["Ildiz soni", "Число корней"],
        p: ["ax = b da a ≠ 0 bo'lsa, bitta ildiz x = b/a. a = 0 bo'lib, b ≠ 0 bo'lsa — ildiz yo'q; a = 0 va b = 0 bo'lsa — istalgan son ildiz.",
          "В ax = b при a ≠ 0 один корень x = b/a. Если a = 0 и b ≠ 0 — корней нет; если a = 0 и b = 0 — корень любое число."] },
    ],
    f: [
      { n: ["Ko'chirish", "Перенос"], f: "a + x = b  ⇒  x = b − a" },
      { n: ["Bo'lish", "Деление"], f: "a · x = b  ⇒  x = b / a  (a ≠ 0)" },
    ],
    s: [
      ["Qavslarni oching, o'xshash hadlarni ixchamlang.", "Раскройте скобки, приведите подобные."],
      ["Noma'lumli hadlarni chapga, sonlarni o'ngga o'tkazing (ishora o'zgaradi).", "Слагаемые с x — влево, числа — вправо (со сменой знака)."],
      ["x oldidagi koeffitsiyentga bo'ling; javobni tekshiring.", "Разделите на коэффициент при x; сделайте проверку."],
    ],
    m: [
      { s: ["3x + 5 = 20 ni yeching.", "Решите 3x + 5 = 20."],
        y: ["3x = 20 − 5 = 15", "x = 15 / 3"], j: "5" },
      { s: ["2(x − 3) = x + 4 ni yeching.", "Решите 2(x − 3) = x + 4."],
        y: ["2x − 6 = x + 4", "2x − x = 4 + 6"], j: "10" },
      { s: ["x/4 + 2 = 5 ni yeching.", "Решите x/4 + 2 = 5."],
        y: ["x/4 = 3", "x = 3 · 4"], j: "12" },
    ],
    x: [
      ["Hadni o'tkazganda ishorani o'zgartirmaslik.", "Не менять знак при переносе."],
      ["Qavs oldidagi songa faqat birinchi hadni ko'paytirish.", "Умножить число перед скобкой только на первое слагаемое."],
    ],
  },

  "Masalalarni tenglama bilan yechish": {
    t: [
      { h: ["Uch qadam", "Три шага"],
        p: ["Matnli masala tenglama tuzish orqali yechiladi: noma'lumni x deb belgilang, masala shartini tenglama sifatida yozing, tenglamani yeching va javobni masala savoliga moslab yozing. Har doim javobni shartga qarshi tekshiring.",
          "Текстовая задача решается через уравнение: обозначьте неизвестное за x, запишите условие уравнением, решите его и запишите ответ на вопрос задачи. Всегда проверяйте ответ по условию."] },
    ],
    f: [
      { n: ["Ketma-ket sonlar", "Последовательные числа"], f: "x,  x + 1,  x + 2" },
      { n: ["Bir son ikkinchisidan a ga katta", "Одно на a больше другого"], f: "x  va  x + a" },
      { n: ["Marta ko'p", "В k раз больше"], f: "x  va  k · x" },
    ],
    s: [
      ["Kichik miqdorni x deb oling; qolganlarini x orqali ifodalang.", "Возьмите за x меньшую величину; остальные выразите через x."],
      ["Shartdagi tenglikni tenglama qilib yozing (yig'indi, farq, marta).", "Запишите равенство из условия (сумма, разность, кратность)."],
      ["Yeching va so'ralgan miqdorni toping (x ning o'zi emas bo'lishi mumkin).", "Решите и найдите то, что спрашивают (это может быть не x)."],
    ],
    m: [
      { s: ["Ikki sonning yig'indisi 48, biri ikkinchisidan 6 ga katta. Sonlarni toping.", "Сумма двух чисел 48, одно на 6 больше другого. Найдите числа."],
        y: ["Kichigi x, kattasi x + 6", "x + (x + 6) = 48  →  2x = 42  →  x = 21", "Kattasi: 21 + 6 = 27"], j: "21 va 27" },
      { s: ["Uchta ketma-ket natural son yig'indisi 72. Sonlarni toping.", "Сумма трёх последовательных натуральных чисел 72. Найдите их."],
        y: ["x + (x + 1) + (x + 2) = 72", "3x + 3 = 72  →  x = 23"], j: "23, 24, 25" },
      { s: ["Do'kon 3 kunda 175 kg kartoshka sotdi: 2-kun 3-kundan 1,5 marta ko'p, 1-kun 2-kundan 2,4 marta kam. 1-kun necha kg?", "Магазин за 3 дня продал 175 кг картофеля: во 2-й день в 1,5 раза больше, чем в 3-й, в 1-й в 2,4 раза меньше, чем во 2-й. Сколько кг в 1-й день?"],
        y: ["3-kun x kg;  2-kun 1,5x;  1-kun 1,5x / 2,4 = 0,625x", "x + 1,5x + 0,625x = 175  →  3,125x = 175  →  x = 56", "1-kun: 0,625 · 56"], j: "35 kg" },
    ],
    x: [
      ["x ni topib to'xtash: savol boshqa miqdor haqida bo'lishi mumkin.", "Остановиться на x: вопрос может быть о другой величине."],
      ["«2 marta kam» ni «2 ga kam» bilan almashtirish.", "Путать «в 2 раза меньше» и «на 2 меньше»."],
    ],
  },

  "Natural ko'rsatkichli daraja": {
    t: [
      { h: ["Daraja", "Степень"],
        p: ["aⁿ — a ni o'ziga n marta ko'paytirish. a — asos, n — ko'rsatkich. Maxsus qiymatlar: a¹ = a, a⁰ = 1 (a ≠ 0). Manfiy asos: juft ko'rsatkichda natija musbat, toq ko'rsatkichda manfiy. Qavs muhim: (−3)² = 9, lekin −3² = −9.",
          "aⁿ — произведение n множителей, равных a. a — основание, n — показатель. Особые значения: a¹ = a, a⁰ = 1 (a ≠ 0). У отрицательного основания чётная степень положительна, нечётная отрицательна. Скобки важны: (−3)² = 9, но −3² = −9."] },
    ],
    f: [
      { n: ["Ta'rif", "Определение"], f: "aⁿ = a · a · … · a  (n ta)" },
      { n: ["Maxsus", "Особые"], f: "a¹ = a,   a⁰ = 1,   1ⁿ = 1,   0ⁿ = 0" },
      { n: ["Ba'zi qiymatlar", "Полезные значения"], f: "2⁵ = 32,  2¹⁰ = 1024,  3⁴ = 81,  5³ = 125" },
    ],
    s: [
      ["Asos va ko'rsatkichni ajrating.", "Определите основание и показатель."],
      ["Asosni ko'rsatkich marta o'ziga ko'paytiring.", "Умножьте основание само на себя показатель раз."],
      ["Manfiy asosda ishorani ko'rsatkich juft/toqligidan aniqlang.", "У отрицательного основания знак определите по чётности показателя."],
    ],
    m: [
      { s: ["2⁵ ni hisoblang.", "Вычислите 2⁵."],
        y: ["2 · 2 · 2 · 2 · 2 = 4 · 2 · 2 · 2 = 32"], j: "32" },
      { s: ["(−3)² va −3² ni solishtiring.", "Сравните (−3)² и −3²."],
        y: ["(−3)² = (−3) · (−3) = 9", "−3² = −(3 · 3) = −9"], j: "9 va −9" },
      { s: ["(−2)³ ni hisoblang.", "Вычислите (−2)³."],
        y: ["(−2) · (−2) · (−2) = 4 · (−2)"], j: "−8" },
    ],
    x: [
      ["2³ ni 2 · 3 = 6 deb hisoblash: 2 · 2 · 2 = 8.", "Считать 2³ как 2 · 3 = 6: на самом деле 2 · 2 · 2 = 8."],
      ["−3² ni +9 deb olish.", "Считать −3² равным +9."],
    ],
  },

  "Darajaning xossalari": {
    t: [
      { h: ["Beshta xossa", "Пять свойств"],
        p: ["Bir xil asosli darajalarni ko'paytirganda ko'rsatkichlar QO'SHILADI, bo'lganda AYIRILADI, darajani darajaga ko'targanda ko'rsatkichlar KO'PAYTIRILADI. Ko'paytmaning va bo'linmaning darajasi har bir ko'paytuvchining darajasiga teng.",
          "При умножении степеней с одинаковым основанием показатели СКЛАДЫВАЮТСЯ, при делении ВЫЧИТАЮТСЯ, при возведении степени в степень ПЕРЕМНОЖАЮТСЯ. Степень произведения и частного равна произведению степеней сомножителей."] },
    ],
    f: [
      { n: ["Ko'paytirish", "Умножение"], f: "aᵐ · aⁿ = aᵐ⁺ⁿ" },
      { n: ["Bo'lish", "Деление"], f: "aᵐ : aⁿ = aᵐ⁻ⁿ" },
      { n: ["Darajaga ko'tarish", "Возведение в степень"], f: "(aᵐ)ⁿ = aᵐⁿ" },
      { n: ["Ko'paytma", "Произведение"], f: "(ab)ⁿ = aⁿ · bⁿ" },
      { n: ["Bo'linma", "Частное"], f: "(a/b)ⁿ = aⁿ / bⁿ" },
    ],
    s: [
      ["Asoslar bir xilmi? Bo'lmasa, bir asosga keltiring (4 = 2², 9 = 3²).", "Одинаковы ли основания? Если нет — приведите (4 = 2², 9 = 3²)."],
      ["Amalga mos xossani tanlang: ko'paytirish — qo'shish, bo'lish — ayirish.", "Выберите свойство: умножение — сложить, деление — вычесть."],
      ["Oxirida qiymatni hisoblang.", "В конце вычислите значение."],
    ],
    m: [
      { s: ["2⁷ · 2³ : 2⁵ ni hisoblang.", "Вычислите 2⁷ · 2³ : 2⁵."],
        y: ["2⁷⁺³ = 2¹⁰", "2¹⁰ : 2⁵ = 2⁵"], j: "32" },
      { s: ["(3²)³ ni hisoblang.", "Вычислите (3²)³."],
        y: ["3²ˣ³ = 3⁶ = 729"], j: "729" },
      { s: ["4³ · 25³ ni hisoblang.", "Вычислите 4³ · 25³."],
        y: ["(4 · 25)³ = 100³"], j: "1 000 000" },
    ],
    x: [
      ["2³ · 2⁴ ni 2¹² deb yozish: ko'rsatkichlar qo'shiladi (2⁷).", "Писать 2³ · 2⁴ = 2¹²: показатели складываются (2⁷)."],
      ["Asoslar har xil bo'lganda xossani qo'llash: 2³ · 3² = 6⁵ emas.", "Применять свойство при разных основаниях: 2³ · 3² ≠ 6⁵."],
    ],
  },

  "Birhadlarni ko'paytirish": {
    t: [
      { h: ["Birhad", "Одночлен"],
        p: ["Birhad — son, harf va ularning darajalari ko'paytmasi (3a²b). Birhadlarni ko'paytirish: koeffitsiyentlar alohida ko'paytiriladi, bir xil harflarning ko'rsatkichlari qo'shiladi. Standart ko'rinish: avval koeffitsiyent, keyin harflar alifbo tartibida.",
          "Одночлен — произведение числа, букв и их степеней (3a²b). При умножении одночленов коэффициенты перемножаются, показатели одинаковых букв складываются. Стандартный вид: сначала коэффициент, затем буквы по алфавиту."] },
    ],
    f: [
      { n: ["Koeffitsiyentlar", "Коэффициенты"], f: "(k · a^m)(l · a^n) = (kl) · a^(m+n)" },
      { n: ["Birhadni darajaga", "Степень одночлена"], f: "(kaⁿ)ᵐ = kᵐ · aⁿᵐ" },
    ],
    s: [
      ["Koeffitsiyentlarni ishorasi bilan ko'paytiring.", "Перемножьте коэффициенты со знаком."],
      ["Har bir harf uchun ko'rsatkichlarni qo'shing (harf yolg'iz bo'lsa ko'rsatkichi 1).", "Для каждой буквы сложите показатели (у одиночной буквы показатель 1)."],
      ["Natijani standart ko'rinishda yozing.", "Запишите результат в стандартном виде."],
    ],
    m: [
      { s: ["3a²b · 4ab³ ni ko'paytiring.", "Перемножьте 3a²b · 4ab³."],
        y: ["3 · 4 = 12", "a: 2 + 1 = 3;  b: 1 + 3 = 4"], j: "12a³b⁴" },
      { s: ["(−2x²)³ ni hisoblang.", "Вычислите (−2x²)³."],
        y: ["(−2)³ = −8", "(x²)³ = x⁶"], j: "−8x⁶" },
      { s: ["5x · (−x²y) · 2y ni ko'paytiring.", "Перемножьте 5x · (−x²y) · 2y."],
        y: ["5 · (−1) · 2 = −10", "x: 1 + 2 = 3;  y: 1 + 1 = 2"], j: "−10x³y²" },
    ],
    x: [
      ["Ko'rsatkichlarni ko'paytirish: a² · a³ = a⁵, a⁶ emas.", "Перемножать показатели: a² · a³ = a⁵, а не a⁶."],
      ["Darajaga ko'targanda koeffitsiyentni ham darajaga ko'tarishni unutish.", "Забыть возвести в степень и коэффициент."],
    ],
  },

  "O'xshash hadlarni ixchamlash": {
    t: [
      { h: ["O'xshash hadlar", "Подобные слагаемые"],
        p: ["Harf qismi bir xil bo'lgan hadlar o'xshash. Ularni qo'shganda faqat KOEFFITSIYENTLAR qo'shiladi, harf qismi o'zgarmaydi. Harf qismi har xil hadlar (a va a², a va b) qo'shilmaydi.",
          "Слагаемые с одинаковой буквенной частью подобны. При сложении складываются только КОЭФФИЦИЕНТЫ, буквенная часть остаётся. Слагаемые с разной буквенной частью (a и a², a и b) не складываются."] },
    ],
    f: [
      { n: ["Qoida", "Правило"], f: "ka + la = (k + l)a" },
      { n: ["O'xshash emas", "Не подобные"], f: "3a + 2a² — ixchamlanmaydi" },
    ],
    s: [
      ["Bir xil harf qismli hadlarni ajrating (bir xil belgi bilan chizib chiqing).", "Выделите слагаемые с одинаковой буквенной частью."],
      ["Koeffitsiyentlarni ishorasi bilan qo'shing.", "Сложите коэффициенты со знаками."],
    ],
    m: [
      { s: ["5a + 3b − 2a + b ni ixchamlang.", "Приведите подобные 5a + 3b − 2a + b."],
        y: ["a: 5 − 2 = 3;  b: 3 + 1 = 4"], j: "3a + 4b" },
      { s: ["3x² − x + 2x² + 4x ni ixchamlang.", "Приведите подобные 3x² − x + 2x² + 4x."],
        y: ["x²: 3 + 2 = 5;  x: −1 + 4 = 3"], j: "5x² + 3x" },
      { s: ["7xy − 7xy ni ixchamlang.", "Приведите подобные 7xy − 7xy."],
        y: ["7 − 7 = 0"], j: "0" },
    ],
    x: [
      ["x va x² ni o'xshash deb qo'shish.", "Складывать x и x² как подобные."],
      ["b oldidagi 1 koeffitsiyentini unutish: b + 3b = 4b.", "Забыть коэффициент 1: b + 3b = 4b."],
    ],
  },

  "Ko'phadlarni qo'shish va ayirish": {
    t: [
      { h: ["Ko'phad", "Многочлен"],
        p: ["Ko'phad — birhadlar yig'indisi. Ko'phadlarni qo'shish va ayirish qavslarni ochish va o'xshash hadlarni ixchamlashdan iborat. Ayirishda ikkinchi ko'phad qavsi oldida «−» bo'ladi — hamma ishora teskari.",
          "Многочлен — сумма одночленов. Сложение и вычитание многочленов — раскрытие скобок и приведение подобных. При вычитании перед вторым многочленом стоит «−», поэтому все знаки меняются."] },
    ],
    f: [
      { n: ["Qo'shish", "Сложение"], f: "(A) + (B) = A + B" },
      { n: ["Ayirish", "Вычитание"], f: "(A) − (B) = A − B'  (B' — B ning hamma ishorasi teskari)" },
    ],
    s: [
      ["Ayirishda ikkinchi ko'phadni qavs ichida yozing va oldiga minus qo'ying.", "При вычитании возьмите второй многочлен в скобки со знаком минус."],
      ["Qavslarni oching (ayirishda ishoralar almashadi).", "Раскройте скобки (при вычитании знаки меняются)."],
      ["O'xshash hadlarni ixchamlang.", "Приведите подобные."],
    ],
    m: [
      { s: ["(3x² + 2x − 1) + (x² − 5x + 4) ni hisoblang.", "Вычислите (3x² + 2x − 1) + (x² − 5x + 4)."],
        y: ["3x² + 2x − 1 + x² − 5x + 4", "x²: 4;  x: −3;  son: 3"], j: "4x² − 3x + 3" },
      { s: ["(5a − 2b) − (2a − 7b) ni hisoblang.", "Вычислите (5a − 2b) − (2a − 7b)."],
        y: ["5a − 2b − 2a + 7b", "a: 3;  b: 5"], j: "3a + 5b" },
      { s: ["(x² + x) − (x² − x) ni hisoblang.", "Вычислите (x² + x) − (x² − x)."],
        y: ["x² + x − x² + x"], j: "2x" },
    ],
    x: [
      ["Ayirishda faqat birinchi hadning ishorasini o'zgartirish.", "При вычитании менять знак лишь у первого слагаемого."],
      ["O'xshash hadlarni ixchamlamay javob qoldirish.", "Оставить ответ без приведения подобных."],
    ],
  },

  "Ko'phadni birhadga ko'paytirish": {
    t: [
      { h: ["Taqsimot qonuni", "Распределительный закон"],
        p: ["Birhad ko'phadning HAR BIR hadiga ko'paytiriladi va natijalar qo'shiladi. Har bir ko'paytmada ishoralar qoidasi (minus · minus = plyus) va daraja qo'shish qoidasi ishlaydi.",
          "Одночлен умножается на КАЖДЫЙ член многочлена, результаты складываются. В каждом произведении работают правило знаков и сложение показателей."] },
    ],
    f: [
      { n: ["Taqsimot", "Распределение"], f: "a(b + c) = ab + ac" },
      { n: ["Ishoralar", "Знаки"], f: "(−)(−) = +,   (−)(+) = −" },
    ],
    s: [
      ["Birhadni qavs ichidagi har bir hadga ko'paytiring.", "Умножьте одночлен на каждое слагаемое в скобках."],
      ["Har safar ishorani va darajani tekshiring.", "Каждый раз проверяйте знак и степень."],
      ["O'xshash hadlarni ixchamlang.", "Приведите подобные."],
    ],
    m: [
      { s: ["2a(3a − 4b) ni oching.", "Раскройте 2a(3a − 4b)."],
        y: ["2a · 3a = 6a²", "2a · (−4b) = −8ab"], j: "6a² − 8ab" },
      { s: ["−x(x² − 2x + 3) ni oching.", "Раскройте −x(x² − 2x + 3)."],
        y: ["−x · x² = −x³", "−x · (−2x) = +2x²", "−x · 3 = −3x"], j: "−x³ + 2x² − 3x" },
      { s: ["3x(x − 2) − x(3x + 1) ni soddalashtiring.", "Упростите 3x(x − 2) − x(3x + 1)."],
        y: ["3x² − 6x − 3x² − x", "x²: 0;  x: −7"], j: "−7x" },
    ],
    x: [
      ["Ikkinchi hadni ko'paytirishni unutish.", "Забыть умножить второе слагаемое."],
      ["Minus birhadda ichki ishoralarni almashtirmaslik.", "Не менять знаки внутри при минусе перед одночленом."],
    ],
  },

  "Ko'phadni ko'phadga ko'paytirish": {
    t: [
      { h: ["Har biri har biriga", "Каждый на каждый"],
        p: ["Birinchi ko'phadning har bir hadi ikkinchisining har bir hadiga ko'paytiriladi. Agar qavslarda 2 va 3 had bo'lsa, 6 ta ko'paytma chiqadi. Oxirida o'xshash hadlar ixchamlanadi.",
          "Каждый член первого многочлена умножается на каждый член второго. Если в скобках 2 и 3 члена, получится 6 произведений. В конце приводятся подобные."] },
    ],
    f: [
      { n: ["Ikki ikkihad", "Два двучлена"], f: "(a + b)(c + d) = ac + ad + bc + bd" },
      { n: ["Kub farqi", "Разность кубов"], f: "(a − b)(a² + ab + b²) = a³ − b³" },
    ],
    s: [
      ["Birinchi qavsdagi har bir hadni ikkinchi qavsning barcha hadlariga ko'paytiring.", "Умножьте каждое слагаемое первой скобки на все слагаемые второй."],
      ["Ishoralarni diqqat bilan yozing.", "Аккуратно расставьте знаки."],
      ["O'xshash hadlarni ixchamlang; ular odatda o'rtada bo'ladi.", "Приведите подобные; обычно они в середине."],
    ],
    m: [
      { s: ["(x + 3)(x − 5) ni oching.", "Раскройте (x + 3)(x − 5)."],
        y: ["x · x = x²;  x · (−5) = −5x;  3 · x = 3x;  3 · (−5) = −15", "−5x + 3x = −2x"], j: "x² − 2x − 15" },
      { s: ["(2a − 1)(a + 4) ni oching.", "Раскройте (2a − 1)(a + 4)."],
        y: ["2a² + 8a − a − 4"], j: "2a² + 7a − 4" },
      { s: ["(x − 2)(x² + 2x + 4) ni oching.", "Раскройте (x − 2)(x² + 2x + 4)."],
        y: ["x³ + 2x² + 4x − 2x² − 4x − 8"], j: "x³ − 8" },
    ],
    x: [
      ["Ko'paytmalardan birini tashlab ketish (2 × 2 = 4 ta bo'lishi kerak).", "Пропустить одно из произведений (для 2×2 должно быть 4)."],
      ["Minusli hadlarda ishorani xato yozish: (−5)·3 = −15.", "Ошибиться со знаками: (−5)·3 = −15."],
    ],
  },

  "Birhadga bo'lish": {
    t: [
      { h: ["Ko'phadni birhadga bo'lish", "Деление многочлена на одночлен"],
        p: ["Ko'phadning har bir hadi birhadga alohida bo'linadi: (a + b) : c = a/c + b/c. Koeffitsiyentlar bo'linadi, bir xil harflarning ko'rsatkichlari ayiriladi. Bo'luvchi nol bo'lmasligi shart.",
          "Каждый член многочлена делится на одночлен отдельно: (a + b) : c = a/c + b/c. Коэффициенты делятся, показатели одинаковых букв вычитаются. Делитель не равен нулю."] },
    ],
    f: [
      { n: ["Bo'lish", "Деление"], f: "(a + b) : c = a/c + b/c" },
      { n: ["Daraja", "Степень"], f: "aᵐ : aⁿ = aᵐ⁻ⁿ" },
    ],
    s: [
      ["Ko'phadning har bir hadini birhadga bo'ling.", "Разделите каждый член многочлена на одночлен."],
      ["Koeffitsiyentlarni bo'ling, harflar ko'rsatkichini ayiring.", "Разделите коэффициенты, вычтите показатели букв."],
      ["Natijani tekshiring: bo'linmani birhadga ko'paytirsangiz ko'phad chiqishi kerak.", "Проверьте: частное на одночлен даёт исходный многочлен."],
    ],
    m: [
      { s: ["(12a³ − 8a²) : 4a ni bajaring.", "Выполните (12a³ − 8a²) : 4a."],
        y: ["12a³ : 4a = 3a²", "8a² : 4a = 2a"], j: "3a² − 2a" },
      { s: ["(6x²y − 9xy²) : 3xy ni bajaring.", "Выполните (6x²y − 9xy²) : 3xy."],
        y: ["6x²y : 3xy = 2x", "9xy² : 3xy = 3y"], j: "2x − 3y" },
    ],
    x: [
      ["Faqat birinchi hadni bo'lish.", "Разделить только первый член."],
      ["a³ : a ni a³ ⁺ ¹ deb yozish: ko'rsatkichlar ayiriladi (a²).", "Писать a³ : a = a⁴: показатели вычитаются (a²)."],
    ],
  },

  "Umumiy ko'paytuvchini chiqarish": {
    t: [
      { h: ["Ko'paytuvchilarga ajratish", "Разложение на множители"],
        p: ["Ko'phadni ko'paytma shaklida yozish — ko'paytuvchilarga ajratish. Eng birinchi usul: hamma hadda bor umumiy ko'paytuvchini (sonlarning EKUBi va eng kichik darajali harf) qavs oldiga chiqarish. Qavs ichida qolgan hadlarni topish uchun har bir hadni umumiy ko'paytuvchiga bo'lamiz.",
          "Разложить многочлен на множители — записать его произведением. Первый способ: вынести за скобку общий множитель (НОД коэффициентов и буквы с наименьшей степенью). В скобках остаётся результат деления каждого члена на общий множитель."] },
    ],
    f: [
      { n: ["Qavsdan chiqarish", "Вынесение за скобку"], f: "ab + ac = a(b + c)" },
      { n: ["Umumiy qavs", "Общая скобка"], f: "a(b + c) + d(b + c) = (b + c)(a + d)" },
    ],
    s: [
      ["Koeffitsiyentlarning EKUBini va umumiy harflarni toping.", "Найдите НОД коэффициентов и общие буквы."],
      ["Uni qavs oldiga chiqaring; qavs ichini bo'lish bilan toping.", "Вынесите его; в скобках запишите частные."],
      ["Qavsni ochib tekshiring.", "Проверьте раскрытием скобок."],
    ],
    m: [
      { s: ["6x² − 9x ni ko'paytuvchilarga ajrating.", "Разложите на множители 6x² − 9x."],
        y: ["EKUB(6; 9) = 3;  umumiy harf x", "6x² : 3x = 2x;  9x : 3x = 3"], j: "3x(2x − 3)" },
      { s: ["12ab − 18a² ni ajrating.", "Разложите 12ab − 18a²."],
        y: ["EKUB = 6, umumiy harf a  →  6a", "12ab : 6a = 2b;  18a² : 6a = 3a"], j: "6a(2b − 3a)" },
      { s: ["35 · 17 + 35 · 13 ni qulay hisoblang.", "Удобно вычислите 35 · 17 + 35 · 13."],
        y: ["35(17 + 13) = 35 · 30"], j: "1050" },
    ],
    x: [
      ["Bir hadni qavs ichida qoldirmaslik: agar hadning hammasi chiqib ketsa, qavsda 1 qoladi.", "Потерять единицу: если член вынесен целиком, в скобках остаётся 1."],
      ["Faqat sonni chiqarib, harfni chiqarmaslik (yoki aksincha).", "Вынести только число без буквы (или наоборот)."],
    ],
  },

  "Yig'indi va ayirmaning kvadrati": {
    t: [
      { h: ["Qisqa ko'paytirish formulalari", "Формулы сокращённого умножения"],
        p: ["Ikki hadning yig'indisi yoki ayirmasining kvadrati: birinchining kvadrati, IKKILANGAN ko'paytma va ikkinchining kvadrati. Formulani o'ngdan chapga ham ishlatamiz: uch had to'liq kvadrat bo'lsa, ikki hadning kvadratiga yig'iladi.",
          "Квадрат суммы или разности двух выражений: квадрат первого, УДВОЕННОЕ произведение и квадрат второго. Формулу используем и справа налево: трёхчлен, являющийся полным квадратом, сворачивается."] },
    ],
    f: [
      { n: ["Yig'indi kvadrati", "Квадрат суммы"], f: "(a + b)² = a² + 2ab + b²" },
      { n: ["Ayirma kvadrati", "Квадрат разности"], f: "(a − b)² = a² − 2ab + b²" },
    ],
    s: [
      ["a va b ni aniqlang (ishora bilan).", "Определите a и b (со знаком)."],
      ["a², 2ab, b² ni alohida hisoblang.", "Найдите a², 2ab, b² по отдельности."],
      ["Ishorani o'rta had oldiga qo'ying: yig'indida +, ayirmada −.", "Знак ставится перед средним членом: у суммы +, у разности −."],
    ],
    m: [
      { s: ["(x + 4)² ni oching.", "Раскройте (x + 4)²."],
        y: ["x² + 2 · x · 4 + 4²"], j: "x² + 8x + 16" },
      { s: ["(3a − 2)² ni oching.", "Раскройте (3a − 2)²."],
        y: ["(3a)² − 2 · 3a · 2 + 2²"], j: "9a² − 12a + 4" },
      { s: ["99² ni qulay hisoblang.", "Удобно вычислите 99²."],
        y: ["(100 − 1)² = 10000 − 200 + 1"], j: "9801" },
      { s: ["x² + 10x + 25 ni ko'paytuvchilarga ajrating.", "Разложите x² + 10x + 25."],
        y: ["x² + 2 · x · 5 + 5²"], j: "(x + 5)²" },
    ],
    x: [
      ["(a + b)² = a² + b² deb yozish: o'rta had 2ab yo'qolib qoladi.", "Писать (a + b)² = a² + b²: теряется 2ab."],
      ["(a − b)² da o'rta had ishorasini musbat qoldirish.", "Оставлять средний член положительным в (a − b)²."],
    ],
  },

  "Kvadratlar ayirmasi": {
    t: [
      { h: ["Ayirma va yig'indi ko'paytmasi", "Разность и сумма"],
        p: ["Ikki ifoda kvadratlarining ayirmasi ularning ayirmasi va yig'indisining ko'paytmasiga teng. Bu formula tez hisoblash va ko'paytuvchilarga ajratishning eng kuchli usullaridan biri.",
          "Разность квадратов двух выражений равна произведению их разности и суммы. Формула сильно ускоряет вычисления и разложение на множители."] },
    ],
    f: [
      { n: ["Formula", "Формула"], f: "a² − b² = (a − b)(a + b)" },
      { n: ["Kvadratlar", "Квадраты"], f: "4a² = (2a)²,   25b² = (5b)²,   49 = 7²" },
    ],
    s: [
      ["Ikkala had ham kvadrat ekanini tekshiring va ildizlarini toping.", "Убедитесь, что оба члена — квадраты, найдите их корни."],
      ["(a − b)(a + b) ko'rinishida yozing.", "Запишите в виде (a − b)(a + b)."],
    ],
    m: [
      { s: ["x² − 49 ni ajrating.", "Разложите x² − 49."],
        y: ["x² − 7²"], j: "(x − 7)(x + 7)" },
      { s: ["4a² − 25b² ni ajrating.", "Разложите 4a² − 25b²."],
        y: ["(2a)² − (5b)²"], j: "(2a − 5b)(2a + 5b)" },
      { s: ["101² − 99² ni qulay hisoblang.", "Удобно вычислите 101² − 99²."],
        y: ["(101 − 99)(101 + 99) = 2 · 200"], j: "400" },
    ],
    x: [
      ["Kvadratlar YIG'INDISINI ajratishga urinish: a² + b² ko'paytuvchilarga ajralmaydi.", "Пытаться разложить СУММУ квадратов: a² + b² не раскладывается."],
      ["4a² ni 4a ning ildizi deb olish: √(4a²) = 2a.", "Извлекать корень из 4a² как 4a: √(4a²) = 2a."],
    ],
  },

  "Usullarni birgalikda qo'llash": {
    t: [
      { h: ["Tartib", "Порядок"],
        p: ["Ko'phadni to'liq ajratish uchun usullar ketma-ket qo'llanadi: 1) avval umumiy ko'paytuvchini qavsdan chiqaring; 2) qavs ichida formula (kvadratlar ayirmasi, to'liq kvadrat) qidiring; 3) formula bo'lmasa, guruhlash usuli. Ajratish tugagan hisoblanadi, agar hech bir ko'paytuvchi yana ajralmasa.",
          "Чтобы разложить полностью, применяйте способы по порядку: 1) вынесите общий множитель; 2) в скобках ищите формулу (разность квадратов, полный квадрат); 3) нет формулы — группировка. Разложение закончено, когда ни один множитель не раскладывается дальше."] },
    ],
    f: [
      { n: ["Guruhlash", "Группировка"], f: "ax + ay + bx + by = a(x + y) + b(x + y) = (a + b)(x + y)" },
      { n: ["Ikki usul", "Два способа"], f: "3x³ − 12x = 3x(x² − 4) = 3x(x − 2)(x + 2)" },
    ],
    s: [
      ["Umumiy ko'paytuvchini chiqaring.", "Вынесите общий множитель."],
      ["Qavs ichida a² − b² yoki (a ± b)² ni izlang.", "В скобках ищите a² − b² или (a ± b)²."],
      ["Formula bo'lmasa — hadlarni juftlab guruhlang.", "Нет формулы — сгруппируйте члены парами."],
      ["Har bir ko'paytuvchi yana ajralmasligini tekshiring.", "Проверьте, что множители дальше не раскладываются."],
    ],
    m: [
      { s: ["3x³ − 12x ni to'liq ajrating.", "Разложите полностью 3x³ − 12x."],
        y: ["3x dan chiqaramiz: 3x(x² − 4)", "x² − 4 = (x − 2)(x + 2)"], j: "3x(x − 2)(x + 2)" },
      { s: ["ax + ay + bx + by ni ajrating.", "Разложите ax + ay + bx + by."],
        y: ["(ax + ay) + (bx + by) = a(x + y) + b(x + y)"], j: "(a + b)(x + y)" },
      { s: ["x² − y² + x + y ni ajrating.", "Разложите x² − y² + x + y."],
        y: ["(x − y)(x + y) + (x + y)", "(x + y) chiqaramiz"], j: "(x + y)(x − y + 1)" },
    ],
    x: [
      ["Umumiy ko'paytuvchini chiqarmasdan formulani izlash.", "Искать формулу, не вынеся общий множитель."],
      ["Yarim ajratib to'xtash: 3x(x² − 4) hali oxiri emas.", "Остановиться на полпути: 3x(x² − 4) ещё не конец."],
    ],
  },

  "algebra7|Kasrlarni qisqartirish": {
    t: [
      { h: ["Algebraik kasr", "Алгебраическая дробь"],
        p: ["Surat va maxrajida ifoda bo'lgan kasr — algebraik kasr. Uni qisqartirish uchun surat va maxrajni ko'paytuvchilarga ajratamiz va umumiy ko'paytuvchini bekor qilamiz. QISQARTIRISH FAQAT KO'PAYTUVCHIGA bo'ladi, hadga emas. Maxraj nolga teng bo'lmasligi shart.",
          "Дробь, у которой в числителе и знаменателе выражения — алгебраическая. Чтобы сократить, раскладываем числитель и знаменатель на множители и сокращаем общий множитель. СОКРАЩАТЬ МОЖНО ТОЛЬКО МНОЖИТЕЛИ, не слагаемые. Знаменатель не равен нулю."] },
    ],
    f: [
      { n: ["Asosiy xossa", "Основное свойство"], f: "(a · c) / (b · c) = a / b   (c ≠ 0)" },
      { n: ["Formulalar", "Формулы"], f: "x² − y² = (x − y)(x + y)" },
    ],
    s: [
      ["Surat va maxrajni ko'paytuvchilarga ajrating.", "Разложите числитель и знаменатель на множители."],
      ["Bir xil ko'paytuvchilarni bekor qiling.", "Сократите одинаковые множители."],
      ["Qolganini yozing va nolga aylantiruvchi qiymatlarni aytib o'ting (x ≠ …).", "Запишите остаток и укажите запрещённые значения (x ≠ …)."],
    ],
    m: [
      { s: ["12a²b / (18ab²) ni qisqartiring.", "Сократите 12a²b / (18ab²)."],
        y: ["EKUB(12; 18) = 6;  a²/a = a;  b/b² = 1/b"], j: "2a / (3b)" },
      { s: ["(x² − 9)/(x + 3) ni qisqartiring.", "Сократите (x² − 9)/(x + 3)."],
        y: ["x² − 9 = (x − 3)(x + 3)", "(x + 3) ni bekor qilamiz"], j: "x − 3  (x ≠ −3)" },
      { s: ["(5x + 10)/(x² − 4) ni qisqartiring.", "Сократите (5x + 10)/(x² − 4)."],
        y: ["5x + 10 = 5(x + 2);  x² − 4 = (x − 2)(x + 2)"], j: "5 / (x − 2)" },
    ],
    x: [
      ["Hadni bekor qilish: (x + 3)/3 ni x/1 deb yozish mumkin emas.", "Сокращать слагаемое: (x + 3)/3 нельзя записать как x."],
      ["Maxrajni nolga aylantiruvchi qiymatni ko'rsatmaslik.", "Не указать значения, обращающие знаменатель в нуль."],
    ],
  },

  "algebra7|Qo'shish va ayirish": {
    t: [
      { h: ["Bir xil maxraj", "Одинаковые знаменатели"],
        p: ["Maxrajlari bir xil kasrlar: suratlar qo'shiladi/ayriladi, maxraj o'zgarmaydi. Maxrajlar har xil bo'lsa — avval UMUMIY MAXRAJGA keltiramiz: har bir kasrni yetishmaydigan ko'paytuvchiga ko'paytiramiz (surat va maxrajni).",
          "При одинаковых знаменателях складываются/вычитаются числители, знаменатель остаётся. При разных — сначала приводим к ОБЩЕМУ ЗНАМЕНАТЕЛЮ: домножаем числитель и знаменатель каждой дроби на недостающий множитель."] },
    ],
    f: [
      { n: ["Bir xil maxraj", "Один знаменатель"], f: "a/c ± b/c = (a ± b)/c" },
      { n: ["Har xil maxraj", "Разные знаменатели"], f: "a/b ± c/d = (ad ± bc)/(bd)" },
    ],
    s: [
      ["Maxrajlarni ko'paytuvchilarga ajrating va eng kichik umumiy maxrajni toping.", "Разложите знаменатели и найдите наименьший общий."],
      ["Har bir kasrni qo'shimcha ko'paytuvchiga ko'paytiring.", "Домножьте каждую дробь на дополнительный множитель."],
      ["Suratlarni qo'shing/ayiring (minus oldida qavsni oching), natijani qisqartiring.", "Сложите/вычтите числители (со скобками при минусе), сократите."],
    ],
    m: [
      { s: ["3/(2a) + 5/(3a) ni hisoblang.", "Вычислите 3/(2a) + 5/(3a)."],
        y: ["Umumiy maxraj 6a:  9/(6a) + 10/(6a)"], j: "19 / (6a)" },
      { s: ["x/(x − 1) − 1/(x − 1) ni hisoblang.", "Вычислите x/(x − 1) − 1/(x − 1)."],
        y: ["(x − 1)/(x − 1)"], j: "1  (x ≠ 1)" },
      { s: ["1/x + 1/y ni hisoblang.", "Вычислите 1/x + 1/y."],
        y: ["Umumiy maxraj xy:  y/(xy) + x/(xy)"], j: "(x + y) / (xy)" },
    ],
    x: [
      ["Maxrajlarni ham qo'shish: 1/2 + 1/3 ≠ 2/5.", "Складывать и знаменатели: 1/2 + 1/3 ≠ 2/5."],
      ["Ayirishda suratdagi minus oldida qavs qo'ymaslik.", "При вычитании не ставить скобки вокруг числителя."],
    ],
  },

  "algebra7|Ko'paytirish va bo'lish": {
    t: [
      { h: ["Ko'paytirish va bo'lish", "Умножение и деление"],
        p: ["Kasrlarni ko'paytirishda suratlar suratlarga, maxrajlar maxrajlarga ko'paytiriladi; oldin qisqartirish osonlashtiradi. Bo'lishda ikkinchi kasr AGDARILIB ko'paytiriladi. Bo'linuvchi kasrning surat va maxraji ko'paytuvchilarga ajratilsa, hamma narsa qisqaradi.",
          "При умножении дробей числители умножаются на числители, знаменатели — на знаменатели; заранее сокращайте. При делении вторая дробь ПЕРЕВОРАЧИВАЕТСЯ и умножается. Разложите числители и знаменатели на множители — многое сократится."] },
    ],
    f: [
      { n: ["Ko'paytirish", "Умножение"], f: "(a/b) · (c/d) = (ac)/(bd)" },
      { n: ["Bo'lish", "Деление"], f: "(a/b) : (c/d) = (a/b) · (d/c) = (ad)/(bc)" },
    ],
    s: [
      ["Bo'lishni agdarilgan kasrga ko'paytirishga aylantiring.", "Замените деление умножением на перевёрнутую дробь."],
      ["Surat va maxrajlarni ko'paytuvchilarga ajrating.", "Разложите числители и знаменатели на множители."],
      ["Umumiy ko'paytuvchilarni bekor qilib, qolganini ko'paytiring.", "Сократите общие множители, перемножьте остаток."],
    ],
    m: [
      { s: ["(6x / 5y) · (10y² / 3x) ni hisoblang.", "Вычислите (6x / 5y) · (10y² / 3x)."],
        y: ["(6x · 10y²) / (5y · 3x) = 60xy² / 15xy"], j: "4y" },
      { s: ["((x² − 1)/x) · (x/(x + 1)) ni hisoblang.", "Вычислите ((x² − 1)/x) · (x/(x + 1))."],
        y: ["x² − 1 = (x − 1)(x + 1)", "x va (x + 1) bekor bo'ladi"], j: "x − 1" },
      { s: ["(a²/b) : (a/b²) ni hisoblang.", "Вычислите (a²/b) : (a/b²)."],
        y: ["(a²/b) · (b²/a) = a²b² / (ab)"], j: "ab" },
    ],
    x: [
      ["Bo'lishda kasrni agdarmasdan ko'paytirish.", "Умножить на вторую дробь, не перевернув."],
      ["Ajratmasdan hadlarni qisqartirish.", "Сокращать слагаемые, не разложив на множители."],
    ],
  },

  "Birgalikda bajariladigan amallar": {
    t: [
      { h: ["Tartib va ajratish", "Порядок и разложение"],
        p: ["Bir ifodada qo'shish, ko'paytirish va bo'lish aralash bo'lsa, amallar tartibi saqlanadi: avval qavs, keyin ko'paytirish/bo'lish, so'ng qo'shish/ayirish. Har bir bosqichda kasrlarni ko'paytuvchilarga ajratib qisqartirish natijani ixcham qiladi.",
          "Если в выражении смешаны сложение, умножение и деление, сохраняется порядок: скобки, умножение/деление, сложение/вычитание. На каждом шаге разложение на множители и сокращение упрощает ответ."] },
    ],
    f: [
      { n: ["Umumiy ko'rinish", "Схема"], f: "( a/b + c/d ) · e/f  →  avval qavs, so'ng ko'paytirish" },
    ],
    s: [
      ["Qavs ichidagi amalni bajaring (umumiy maxraj).", "Выполните действие в скобках (общий знаменатель)."],
      ["Suratni ko'paytuvchilarga ajrating.", "Разложите числитель на множители."],
      ["Ko'paytirish/bo'lishni bajaring va qisqartiring.", "Выполните умножение/деление и сократите."],
    ],
    m: [
      { s: ["(1/x + 1/y) · (xy / (x + y)) ni hisoblang.", "Вычислите (1/x + 1/y) · (xy / (x + y))."],
        y: ["1/x + 1/y = (x + y)/(xy)", "(x + y)/(xy) · xy/(x + y)"], j: "1" },
      { s: ["(a/(a − b) − b/(a − b)) : 2 ni hisoblang.", "Вычислите (a/(a − b) − b/(a − b)) : 2."],
        y: ["(a − b)/(a − b) = 1", "1 : 2"], j: "1/2" },
    ],
    x: [
      ["Qavsdan oldin ko'paytirishni bajarish.", "Выполнять умножение раньше скобок."],
      ["Qisqartirishda qavs ichidagi hadni bekor qilish.", "Сокращать слагаемое внутри скобок."],
    ],
  },

  "Kombinatorikaning asosiy qoidasi": {
    t: [
      { h: ["Ko'paytirish qoidasi", "Правило умножения"],
        p: ["Agar birinchi tanlovni m usulda, uni tanlagach ikkinchisini n usulda qilish mumkin bo'lsa, ikkalasini birga m · n usulda tanlash mumkin. Qadamlar ko'p bo'lsa — hammasini ko'paytiramiz. Shartlar bir-birini kamaytirsa (takrorlanmasa), keyingi qadamda variantlar bittaga kamayadi.",
          "Если первый выбор можно сделать m способами, а после него второй — n способами, то оба вместе — m · n способов. Шагов больше — перемножаем все. Если выбор без повторений, на каждом шаге вариантов на один меньше."] },
    ],
    f: [
      { n: ["Ko'paytirish qoidasi", "Правило умножения"], f: "N = m · n · k · …" },
    ],
    s: [
      ["Tanlovni qadamlarga bo'ling.", "Разбейте выбор на шаги."],
      ["Har qadamda nechta variant borligini yozing (takrorlanmasa kamayib boradi).", "Запишите число вариантов на каждом шаге (без повторений — убывает)."],
      ["Variantlar sonlarini ko'paytiring.", "Перемножьте числа вариантов."],
    ],
    m: [
      { s: ["3 xil ko'ylak va 4 xil shimdan necha xil kiyim to'plami tuzish mumkin?", "Сколько комплектов можно составить из 3 рубашек и 4 брюк?"],
        y: ["Ko'ylak: 3 usul;  shim: 4 usul", "3 · 4"], j: "12" },
      { s: ["1, 2, 3 raqamlaridan (takrorlamasdan) necha xil uch xonali son yasash mumkin?", "Сколько трёхзначных чисел из цифр 1, 2, 3 без повторений?"],
        y: ["Birinchi raqam: 3 usul;  ikkinchi: 2;  uchinchi: 1", "3 · 2 · 1"], j: "6" },
      { s: ["Kodda 2 ta raqam (0–9) takrorlanishi mumkin. Nechta kod bor?", "Код из двух цифр (0–9), повторения допустимы. Сколько кодов?"],
        y: ["10 · 10"], j: "100" },
    ],
    x: [
      ["Qadamlar sonini qo'shish: variantlar ko'paytiriladi.", "Складывать варианты вместо умножения."],
      ["Takrorlanmasa keyingi qadamda variantlar kamayishini unutish.", "Забыть, что без повторений вариантов становится меньше."],
    ],
  },

  "O'rin almashtirish": {
    t: [
      { h: ["Faktorial", "Факториал"],
        p: ["n ta turli elementni qatorga necha xil tartibda joylashtirish mumkin? Birinchi o'ringa n usul, ikkinchisiga n − 1, … oxirgisiga 1 usul. Natija n! (n faktorial) = 1 · 2 · … · n. Kelishuv: 0! = 1.",
          "Сколькими способами можно расставить n различных элементов в ряд? На первое место n способов, на второе n − 1, … на последнее 1. Итого n! (n факториал) = 1 · 2 · … · n. Договорённость: 0! = 1."] },
    ],
    f: [
      { n: ["Faktorial", "Факториал"], f: "Pₙ = n! = 1 · 2 · 3 · … · n" },
      { n: ["Qiymatlar", "Значения"], f: "3! = 6,  4! = 24,  5! = 120,  6! = 720" },
      { n: ["Nisbat", "Отношение"], f: "n! = n · (n − 1)!" },
    ],
    s: [
      ["Nechta turli element borligini sanang (n).", "Посчитайте различные элементы (n)."],
      ["n! ni hisoblang.", "Вычислите n!."],
      ["Ba'zi elementlar joyi qat'iy bo'lsa — qolganlarini almashtiring.", "Если положение некоторых задано — переставляйте остальные."],
    ],
    m: [
      { s: ["4 kishi qatorda necha xil tartibda tura oladi?", "Сколькими способами 4 человека могут встать в ряд?"],
        y: ["4! = 4 · 3 · 2 · 1"], j: "24" },
      { s: ["5 ta turli kitobni javonga necha xil qo'yish mumkin?", "Сколькими способами можно расставить 5 разных книг на полке?"],
        y: ["5! = 120"], j: "120" },
      { s: ["6! / 4! ni hisoblang.", "Вычислите 6! / 4!."],
        y: ["6! / 4! = 6 · 5"], j: "30" },
    ],
    x: [
      ["n! ni n · n deb hisoblash.", "Считать n! как n · n."],
      ["0! = 0 deb olish: 0! = 1.", "Считать 0! = 0: на самом деле 0! = 1."],
    ],
  },
};
