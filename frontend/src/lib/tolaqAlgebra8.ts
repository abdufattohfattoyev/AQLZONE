/**
 * TO'LIQ DARSLAR — 8-sinf algebra. Tuzilishi `tolaqGeometriya.ts` dagidek.
 * Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_ALGEBRA8: Record<string, Tolaq> = {
  "algebra8|Kasrlarni qisqartirish": {
    t: [
      { h: ["Ratsional kasr", "Рациональная дробь"],
        p: ["Surat va maxraji ko'phad bo'lgan kasr. Qisqartirish: ikkalasini ko'paytuvchilarga ajratamiz (umumiy ko'paytuvchi, kvadratlar ayirmasi, kvadrat uchhad) va bir xil ko'paytuvchilarni bekor qilamiz. Qisqartirish faqat KO'PAYTUVCHIGA, hadga emas. Maxraj nolga aylanadigan qiymatlar doim istisno.",
          "Дробь, у которой числитель и знаменатель — многочлены. Сокращаем, разложив их на множители (общий множитель, разность квадратов, квадратный трёхчлен) и убрав одинаковые множители. Сокращают только МНОЖИТЕЛИ, не слагаемые. Значения, обращающие знаменатель в нуль, всегда исключаются."] },
    ],
    f: [
      { n: ["Asosiy xossa", "Основное свойство"], f: "(P · Q) / (R · Q) = P / R,   Q ≠ 0" },
      { n: ["Kvadrat uchhad", "Квадратный трёхчлен"], f: "ax² + bx + c = a(x − x₁)(x − x₂)" },
    ],
    s: [
      ["Surat va maxrajni to'liq ko'paytuvchilarga ajrating.", "Полностью разложите числитель и знаменатель."],
      ["Umumiy ko'paytuvchilarni bekor qiling.", "Сократите общие множители."],
      ["Ruxsat etilmagan qiymatlarni yozing (maxraj ≠ 0).", "Запишите запрещённые значения (знаменатель ≠ 0)."],
    ],
    m: [
      { s: ["(x² − 5x + 6)/(x² − 4) ni qisqartiring.", "Сократите (x² − 5x + 6)/(x² − 4)."],
        y: ["x² − 5x + 6 = (x − 2)(x − 3)", "x² − 4 = (x − 2)(x + 2)", "(x − 2) ni bekor qilamiz"], j: "(x − 3)/(x + 2),  x ≠ ±2" },
      { s: ["(a² − b²)/(a² − ab) ni qisqartiring.", "Сократите (a² − b²)/(a² − ab)."],
        y: ["a² − b² = (a − b)(a + b)", "a² − ab = a(a − b)"], j: "(a + b)/a" },
      { s: ["(2x + 6)/(x² + 3x) ni qisqartiring.", "Сократите (2x + 6)/(x² + 3x)."],
        y: ["2(x + 3) / (x(x + 3))"], j: "2/x" },
    ],
    x: [
      ["(x + 3)/3 ni qisqartirib x ga aylantirish.", "Сокращать слагаемое: (x + 3)/3 ≠ x."],
      ["Bekor qilingan (x − 2) ning x ≠ 2 cheklovini unutish.", "Забыть ограничение x ≠ 2 для сокращённого множителя."],
    ],
  },

  "Umumiy maxrajga keltirish": {
    t: [
      { h: ["Umumiy maxraj", "Общий знаменатель"],
        p: ["Har xil maxrajli kasrlarni qo'shish uchun ularni bir xil maxrajga keltiramiz. Avval maxrajlarni ko'paytuvchilarga ajratamiz; umumiy maxraj — barcha ko'paytuvchilarning eng katta darajalari ko'paytmasi. Har bir kasr yetishmaydigan ko'paytuvchiga (qo'shimcha ko'paytuvchi) ko'paytiriladi.",
          "Чтобы складывать дроби с разными знаменателями, приводим их к общему. Разложите знаменатели на множители; общий знаменатель — произведение всех множителей в наибольших степенях. Каждую дробь домножаем на недостающий множитель."] },
    ],
    f: [
      { n: ["Umumiy maxraj", "Общий знаменатель"], f: "x² − 1 = (x − 1)(x + 1)" },
      { n: ["Qo'shimcha ko'paytuvchi", "Дополнительный множитель"], f: "1/(x + 1) = (x − 1)/((x − 1)(x + 1))" },
    ],
    s: [
      ["Maxrajlarni ko'paytuvchilarga ajrating.", "Разложите знаменатели."],
      ["Umumiy maxrajni tuzing va har bir kasr uchun qo'shimcha ko'paytuvchini toping.", "Составьте общий знаменатель и найдите доп. множители."],
      ["Suratlarni qo'shing, natijani qisqartiring.", "Сложите числители, сократите."],
    ],
    m: [
      { s: ["2/(x² − 1) + 1/(x + 1) ni hisoblang.", "Вычислите 2/(x² − 1) + 1/(x + 1)."],
        y: ["Umumiy maxraj: (x − 1)(x + 1)", "2/((x − 1)(x + 1)) + (x − 1)/((x − 1)(x + 1)) = (2 + x − 1)/((x − 1)(x + 1))", "(x + 1)/((x − 1)(x + 1))"], j: "1/(x − 1)" },
      { s: ["1/(a − b) − 1/(a + b) ni hisoblang.", "Вычислите 1/(a − b) − 1/(a + b)."],
        y: ["((a + b) − (a − b)) / ((a − b)(a + b))", "= 2b / (a² − b²)"], j: "2b / (a² − b²)" },
    ],
    x: [
      ["Maxrajlarni oddiy ko'paytirib, keraksiz katta maxraj hosil qilish.", "Просто перемножать знаменатели, получая лишнюю громоздкость."],
      ["Ayirishda suratdagi qavsni ochib ishorani almashtirmaslik.", "При вычитании не менять знаки при раскрытии скобок."],
    ],
  },

  "algebra8|Ko'paytirish va bo'lish": {
    t: [
      { h: ["Ko'phadli kasrlar", "Дроби с многочленами"],
        p: ["Ko'paytirishda surat va maxrajlarni ko'paytuvchilarga ajratib, bekor qiling. Bo'lishda ikkinchi kasrni agdarib ko'paytiring. Oxirida qisqarmagan ko'paytuvchilar qoladi va cheklovlar (maxraj ≠ 0) yoziladi.",
          "При умножении разложите числители и знаменатели и сократите. При делении умножьте на перевёрнутую дробь. В конце остаются несократимые множители и ограничения (знаменатель ≠ 0)."] },
    ],
    f: [
      { n: ["Bo'lish", "Деление"], f: "(P/Q) : (R/S) = (P · S) / (Q · R)" },
    ],
    s: [
      ["Bo'lishni agdarilgan kasrga ko'paytirishga aylantiring.", "Замените деление умножением на перевёрнутую."],
      ["Hammasini ko'paytuvchilarga ajrating.", "Разложите всё на множители."],
      ["Bekor qiling va cheklovlarni yozing.", "Сократите и запишите ограничения."],
    ],
    m: [
      { s: ["(x² − 4)/(x + 3) · (x + 3)/(x − 2) ni hisoblang.", "Вычислите (x² − 4)/(x + 3) · (x + 3)/(x − 2)."],
        y: ["(x − 2)(x + 2)/(x + 3) · (x + 3)/(x − 2)"], j: "x + 2" },
      { s: ["(a² − 9)/(2a) : (a + 3)/(4a²) ni hisoblang.", "Вычислите (a² − 9)/(2a) : (a + 3)/(4a²)."],
        y: ["(a − 3)(a + 3)/(2a) · 4a²/(a + 3)", "= 4a²(a − 3) / (2a)"], j: "2a(a − 3)" },
    ],
    x: [
      ["Bo'lishda agdarmaslik.", "Не перевернуть при делении."],
      ["Ko'paytmadagi hadni qisqartirish.", "Сокращать слагаемые вместо множителей."],
    ],
  },

  "y = k/x funksiya": {
    t: [
      { h: ["Teskari proporsionallik", "Обратная пропорциональность"],
        p: ["y = k/x (k ≠ 0) — x ortsa y kamayadi (k > 0 da). Grafigi — giperbola, x = 0 da aniqlanmagan (x ≠ 0, y ≠ 0). k > 0 bo'lsa I va III chorakda, k < 0 bo'lsa II va IV chorakda. Grafik koordinata o'qlariga yaqinlashadi, lekin kesishmaydi. Funksiya toq.",
          "y = k/x (k ≠ 0): при k > 0 с ростом x значение y убывает. График — гипербола, x ≠ 0, y ≠ 0. При k > 0 — в I и III четвертях, при k < 0 — во II и IV. График приближается к осям, но не пересекает их. Функция нечётная."] },
    ],
    f: [
      { n: ["Funksiya", "Функция"], f: "y = k / x,   k = x · y" },
      { n: ["Sohasi", "Область"], f: "x ≠ 0,   y ≠ 0" },
    ],
    s: [
      ["k ni nuqtadan toping: k = x · y.", "Найдите k из точки: k = x · y."],
      ["k ning ishorasiga ko'ra choraklarni aniqlang.", "По знаку k определите четверти."],
      ["Qiymat topish uchun x ni qo'ying.", "Для значения подставьте x."],
    ],
    m: [
      { s: ["y = 6/x da x = 2 bo'lsa y?", "y = 6/x, x = 2. Найдите y."],
        y: ["y = 6 / 2"], j: "3" },
      { s: ["Grafik (3; 4) nuqtadan o'tadi. Funksiyani yozing.", "График проходит через (3; 4). Запишите функцию."],
        y: ["k = 3 · 4 = 12"], j: "y = 12/x" },
      { s: ["y = −8/x da y = 2 bo'lsa x?", "y = −8/x, y = 2. Найдите x."],
        y: ["2 = −8/x  →  x = −8/2"], j: "−4" },
    ],
    x: [
      ["Giperbolani o'qlar bilan kesishadi deb o'ylash.", "Считать, что гипербола пересекает оси."],
      ["k manfiyda chorakni adashtirish: II va IV.", "Ошибиться с четвертями при k < 0: это II и IV."],
    ],
  },

  "Kvadrat ildiz": {
    t: [
      { h: ["Arifmetik kvadrat ildiz", "Арифметический квадратный корень"],
        p: ["a ≥ 0 sonning kvadrat ildizi √a — kvadrati a ga teng MANFIY BO'LMAGAN son. Demak √a ≥ 0, va manfiy sondan ildiz haqiqiy sonlarda yo'q. (√a)² = a, lekin √(a²) = |a|.",
          "Арифметический корень √a (a ≥ 0) — неотрицательное число, квадрат которого равен a. Значит √a ≥ 0, а из отрицательного числа действительного корня нет. (√a)² = a, но √(a²) = |a|."] },
    ],
    f: [
      { n: ["Ta'rif", "Определение"], f: "√a = b  ⇔  b ≥ 0,  b² = a" },
      { n: ["Ikki ko'rinish", "Два свойства"], f: "(√a)² = a  (a ≥ 0),   √(a²) = |a|" },
      { n: ["Kvadratlar", "Квадраты"], f: "1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144" },
    ],
    s: [
      ["Ildiz ostidagi son mukammal kvadratmi? Bo'lmasa taxminiy oraliqni toping.", "Является ли подкоренное точным квадратом? Иначе найдите промежуток."],
      ["√(x²) uchrasa — modul yozing.", "Встретили √(x²) — пишите модуль."],
    ],
    m: [
      { s: ["√49 + √0,09 ni hisoblang.", "Вычислите √49 + √0,09."],
        y: ["√49 = 7,  √0,09 = 0,3"], j: "7,3" },
      { s: ["x = −5 da √(x²) ni hisoblang.", "Вычислите √(x²) при x = −5."],
        y: ["√((−5)²) = √25 = 5 = |−5|"], j: "5" },
      { s: ["√50 qaysi ikki butun son orasida?", "Между какими целыми лежит √50?"],
        y: ["49 < 50 < 64  →  7 < √50 < 8"], j: "7 va 8 orasida" },
    ],
    x: [
      ["√(x²) = x deb yozish (manfiy x da xato).", "Писать √(x²) = x (неверно при x < 0)."],
      ["√(a + b) = √a + √b deb olish.", "Считать √(a + b) = √a + √b."],
    ],
  },

  "Ildizning xossalari": {
    t: [
      { h: ["Xossalar", "Свойства"],
        p: ["Ko'paytma ildizi — ildizlar ko'paytmasi, bo'linma ildizi — ildizlar bo'linmasi (a ≥ 0, b > 0). Ildizni soddalashtirish: ildiz ostidan to'liq kvadrat ko'paytuvchini chiqaramiz. Maxrajdagi ildizdan qutulish: surat va maxrajni qo'shma ifodaga ko'paytiramiz.",
          "Корень произведения равен произведению корней, корень частного — частному корней (a ≥ 0, b > 0). Упрощение: выносим из-под корня полный квадрат. Избавление от иррациональности в знаменателе: умножаем на сопряжённое."] },
    ],
    f: [
      { n: ["Ko'paytma", "Произведение"], f: "√(ab) = √a · √b" },
      { n: ["Bo'linma", "Частное"], f: "√(a/b) = √a / √b" },
      { n: ["Qo'shma", "Сопряжённое"], f: "(√a − √b)(√a + √b) = a − b" },
    ],
    s: [
      ["Ildiz ostini to'liq kvadratli ko'paytuvchilarga ajrating.", "Разложите подкоренное на множители с полным квадратом."],
      ["Kvadratni ildizdan tashqariga chiqaring.", "Вынесите квадрат из-под корня."],
      ["Maxrajda ildiz bo'lsa — qo'shmaga ko'paytiring.", "Корень в знаменателе — умножьте на сопряжённое."],
    ],
    m: [
      { s: ["√72 ni soddalashtiring.", "Упростите √72."],
        y: ["72 = 36 · 2", "√36 · √2 = 6√2"], j: "6√2" },
      { s: ["1/(√3 − 1) ning maxrajini ildizsiz qiling.", "Избавьтесь от иррациональности в 1/(√3 − 1)."],
        y: ["Surat va maxrajni (√3 + 1) ga ko'paytiramiz", "(√3 + 1) / ((√3)² − 1²) = (√3 + 1) / 2"], j: "(√3 + 1)/2" },
      { s: ["(√7 − √3)(√7 + √3) ni hisoblang.", "Вычислите (√7 − √3)(√7 + √3)."],
        y: ["7 − 3"], j: "4" },
    ],
    x: [
      ["√(a + b) ni ajratib yozish: yig'indidan ildiz olinmaydi.", "Раскладывать корень из суммы: так нельзя."],
      ["Ildiz ostiga chiqarishda ishorani unutish.", "Забыть знак при внесении под корень."],
    ],
  },

  "Ratsional ko'rsatkichli daraja": {
    t: [
      { h: ["Kasr va manfiy ko'rsatkich", "Дробный и отрицательный показатель"],
        p: ["Kasr ko'rsatkich — ildiz: a^(m/n) = ⁿ√(aᵐ). Manfiy ko'rsatkich — teskari son: a⁻ⁿ = 1/aⁿ. Ular natural ko'rsatkichli daraja xossalarini saqlaydi.",
          "Дробный показатель — корень: a^(m/n) = ⁿ√(aᵐ). Отрицательный — обратное число: a⁻ⁿ = 1/aⁿ. Все свойства степеней сохраняются."] },
    ],
    f: [
      { n: ["Kasr ko'rsatkich", "Дробный показатель"], f: "a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ" },
      { n: ["Manfiy ko'rsatkich", "Отрицательный показатель"], f: "a⁻ⁿ = 1 / aⁿ" },
    ],
    s: [
      ["Asosni daraja ko'rinishiga keltiring (8 = 2³, 16 = 2⁴).", "Представьте основание степенью (8 = 2³, 16 = 2⁴)."],
      ["Ko'rsatkichlarni ko'paytiring va soddalashtiring.", "Перемножьте показатели и упростите."],
    ],
    m: [
      { s: ["8^(2/3) ni hisoblang.", "Вычислите 8^(2/3)."],
        y: ["8 = 2³:  (2³)^(2/3) = 2²"], j: "4" },
      { s: ["16^(3/4) ni hisoblang.", "Вычислите 16^(3/4)."],
        y: ["16 = 2⁴:  (2⁴)^(3/4) = 2³"], j: "8" },
      { s: ["2⁻³ + 27^(−1/3) ni hisoblang.", "Вычислите 2⁻³ + 27^(−1/3)."],
        y: ["2⁻³ = 1/8", "27^(−1/3) = 1 / 27^(1/3) = 1/3"], j: "1/8 + 1/3 = 11/24" },
    ],
    x: [
      ["Manfiy ko'rsatkichni manfiy natija deb olish: 2⁻³ = −8 emas, 1/8.", "Считать 2⁻³ = −8: на самом деле 1/8."],
      ["a^(m/n) da m va n ni almashtirish.", "Перепутать m и n: числитель — степень, знаменатель — корень."],
    ],
  },

  "Sonli tengsizliklar": {
    t: [
      { h: ["Solishtirish", "Сравнение"],
        p: ["a > b bo'lishi uchun a − b > 0 shart. Tengsizlikning ikki tomoniga bir xil son qo'shsak, ishora saqlanadi; MUSBAT songa ko'paytirsak/bo'lsak saqlanadi; MANFIY songa ko'paytirsak/bo'lsak ishora TESKARISIGA o'zgaradi. Bir xil ishorali tengsizliklarni qo'shish mumkin.",
          "a > b означает a − b > 0. При прибавлении одного числа к обеим частям знак сохраняется; при умножении/делении на ПОЛОЖИТЕЛЬНОЕ сохраняется; на ОТРИЦАТЕЛЬНОЕ — меняется на противоположный. Неравенства одного знака можно складывать."] },
    ],
    f: [
      { n: ["Musbatga ko'paytirish", "Умножение на положительное"], f: "a < b,  c > 0  ⇒  ac < bc" },
      { n: ["Manfiyga ko'paytirish", "Умножение на отрицательное"], f: "a < b,  c < 0  ⇒  ac > bc" },
      { n: ["Qo'shish", "Сложение"], f: "a < b,  c < d  ⇒  a + c < b + d" },
    ],
    s: [
      ["Ikkala tomonda nima qilinayotganini aniqlang.", "Определите действие над обеими частями."],
      ["Manfiy songa ko'paytirsangiz ishorani almashtiring.", "При умножении на отрицательное смените знак."],
    ],
    m: [
      { s: ["a < b bo'lsa, −3a va −3b ni solishtiring.", "Если a < b, сравните −3a и −3b."],
        y: ["Manfiy songa ko'paytirdik — ishora teskari"], j: "−3a > −3b" },
      { s: ["2 < x < 5 bo'lsa, x + 1 va 3x qaysi oraliqda?", "Если 2 < x < 5, в каких пределах x + 1 и 3x?"],
        y: ["x + 1: 3 < x + 1 < 6", "3x: 6 < 3x < 15"], j: "(3; 6) va (6; 15)" },
    ],
    x: [
      ["Manfiy songa bo'lganda ishorani almashtirmaslik.", "Не сменить знак при делении на отрицательное."],
      ["Tengsizliklarni ayirib bo'lmasligini unutish: ayirmaga aylantirib qo'shing.", "Вычитать неравенства: так нельзя."],
    ],
  },

  "Bir noma'lumli tengsizlik": {
    t: [
      { h: ["Chiziqli tengsizlik", "Линейное неравенство"],
        p: ["Tengsizlik tenglamadek yechiladi: noma'lumni bir tomonga, sonlarni ikkinchisiga (ishora o'zgaradi). Oxirida x oldidagi koeffitsiyentga bo'lamiz: manfiy bo'lsa — tengsizlik ishorasi TESKARI. Javob — oraliq. Ikki shart (sistema) bo'lsa — oraliqlarning kesishmasi.",
          "Решается как уравнение: неизвестное влево, числа вправо (со сменой знака). В конце делим на коэффициент при x: если он отрицателен — знак неравенства МЕНЯЕТСЯ. Ответ — промежуток. Для системы — пересечение промежутков."] },
    ],
    f: [
      { n: ["Musbat koeffitsiyent", "Положительный коэффициент"], f: "ax > b  (a > 0)  ⇒  x > b / a" },
      { n: ["Manfiy koeffitsiyent", "Отрицательный коэффициент"], f: "ax > b  (a < 0)  ⇒  x < b / a" },
    ],
    s: [
      ["Qavslarni oching, o'xshashlarni ixchamlang.", "Раскройте скобки, приведите подобные."],
      ["x li hadlarni chapga, sonlarni o'ngga o'tkazing.", "Слагаемые с x влево, числа вправо."],
      ["Koeffitsiyentga bo'ling (manfiy bo'lsa ishorani almashtiring). Oraliq sifatida yozing.", "Разделите (при отрицательном смените знак). Запишите промежутком."],
    ],
    m: [
      { s: ["3x − 5 > 10 ni yeching.", "Решите 3x − 5 > 10."],
        y: ["3x > 15  →  x > 5"], j: "(5; +∞)" },
      { s: ["−2x + 4 ≤ 10 ni yeching.", "Решите −2x + 4 ≤ 10."],
        y: ["−2x ≤ 6", "−2 ga bo'lamiz, ishora teskari:  x ≥ −3"], j: "[−3; +∞)" },
      { s: ["{ x > 1;  x < 4 } sistemasini yeching.", "Решите систему { x > 1;  x < 4 }."],
        y: ["Kesishma: 1 dan katta va 4 dan kichik"], j: "(1; 4)" },
    ],
    x: [
      ["Manfiyga bo'lganda ishorani almashtirmaslik.", "Не менять знак при делении на отрицательное."],
      ["Qat'iy va noqat'iy tengsizlik qavslarini adashtirish: > — (…), ≥ — […].", "Путать скобки: > — круглая, ≥ — квадратная."],
    ],
  },

  "Sonli oraliqlar": {
    t: [
      { h: ["Oraliq turlari", "Виды промежутков"],
        p: ["Oraliq (interval) (a; b) — a va b kirmaydi; kesma [a; b] — ikkala uch kiradi; yarim ochiq (a; b], [a; b). Cheksizlik ∞ har doim dumaloq qavs bilan. Ikki oraliq KESISHMASI — ikkalasiga tegishli sonlar; BIRLASHMASI — kamida bittasiga tegishlilar.",
          "Интервал (a; b) — концы не входят; отрезок [a; b] — оба входят; полуинтервалы (a; b], [a; b). Бесконечность ∞ всегда с круглой скобкой. Пересечение — числа, лежащие в обоих; объединение — хотя бы в одном."] },
    ],
    f: [
      { n: ["Tengsizlik → oraliq", "Неравенство → промежуток"], f: "a < x < b  ⇔  (a; b);   a ≤ x ≤ b  ⇔  [a; b]" },
      { n: ["Nurlar", "Лучи"], f: "x > a  ⇔  (a; +∞);   x ≤ a  ⇔  (−∞; a]" },
    ],
    s: [
      ["Son o'qi chizing va har bir oraliqni bo'yang.", "Нарисуйте числовую ось и закрасьте промежутки."],
      ["Kesishma uchun umumiy bo'yalgan qismni oling.", "Для пересечения возьмите общую часть."],
      ["Chegara nuqtalari kirsa — kvadrat qavs.", "Входит граница — квадратная скобка."],
    ],
    m: [
      { s: ["(−2; 3] ∩ [0; 5) ni toping.", "Найдите (−2; 3] ∩ [0; 5)."],
        y: ["Chap chegara: eng kattasi 0 (kiradi)", "O'ng chegara: eng kichigi 3 (kiradi)"], j: "[0; 3]" },
      { s: ["(−∞; 1) ∪ (1; +∞) qaysi sonni o'z ichiga olmaydi?", "Какое число не входит в (−∞; 1) ∪ (1; +∞)?"],
        y: ["1 ikkala oraliqqa ham kirmaydi"], j: "1" },
    ],
    x: [
      ["Cheksizlikni kvadrat qavsda yozish.", "Ставить квадратную скобку у бесконечности."],
      ["Kesishma o'rniga birlashma yozish.", "Писать объединение вместо пересечения."],
    ],
  },

  "Sonning moduli": {
    t: [
      { h: ["Modul", "Модуль"],
        p: ["|a| — a sonining nolga bo'lgan masofasi: manfiy emas. |a| = a (a ≥ 0), |a| = −a (a < 0). Geometrik: |x − a| — x va a orasidagi masofa. |x| = c (c > 0) tenglama ikki ildizli; |x| < c tengsizlik −c < x < c; |x| > c tengsizlik x < −c yoki x > c.",
          "|a| — расстояние от числа a до нуля: неотрицательно. |a| = a при a ≥ 0, |a| = −a при a < 0. Геометрически |x − a| — расстояние между x и a. Уравнение |x| = c (c > 0) имеет два корня; |x| < c ⇔ −c < x < c; |x| > c ⇔ x < −c или x > c."] },
    ],
    f: [
      { n: ["Ta'rif", "Определение"], f: "|a| = a (a ≥ 0);   |a| = −a (a < 0)" },
      { n: ["Tenglama", "Уравнение"], f: "|f| = c  ⇒  f = c  yoki  f = −c" },
      { n: ["Tengsizlik", "Неравенство"], f: "|f| < c  ⇔  −c < f < c" },
    ],
    s: [
      ["Modulni yakkalang.", "Уедините модуль."],
      ["c ning ishorasiga qarang: c < 0 bo'lsa |f| = c yechimsiz.", "Смотрите на знак c: при c < 0 уравнение |f| = c решений не имеет."],
      ["Ikki holga bo'ling va har birini yeching.", "Разбейте на два случая и решите каждый."],
    ],
    m: [
      { s: ["|x − 2| = 5 ni yeching.", "Решите |x − 2| = 5."],
        y: ["x − 2 = 5  →  x = 7", "x − 2 = −5  →  x = −3"], j: "x = 7  yoki  x = −3" },
      { s: ["|x| < 3 ni yeching.", "Решите |x| < 3."],
        y: ["−3 < x < 3"], j: "(−3; 3)" },
      { s: ["|2x − 1| ≤ 5 ni yeching.", "Решите |2x − 1| ≤ 5."],
        y: ["−5 ≤ 2x − 1 ≤ 5", "−4 ≤ 2x ≤ 6", "−2 ≤ x ≤ 3"], j: "[−2; 3]" },
    ],
    x: [
      ["|x| = −2 ga ildiz izlash: modul manfiy bo'lmaydi.", "Искать корни |x| = −2: модуль неотрицателен."],
      ["|x| > 3 ni −3 < x < 3 deb yozish: to'g'risi x < −3 yoki x > 3.", "Писать |x| > 3 как −3 < x < 3: верно x < −3 или x > 3."],
    ],
  },

  "Taqribiy hisoblash va yaxlitlash": {
    t: [
      { h: ["Yaxlitlash", "Округление"],
        p: ["Yaxlitlashda tashlab yuboriladigan birinchi raqam 5 yoki undan katta bo'lsa, oldingi raqam bittaga ORTADI; 5 dan kichik bo'lsa o'zgarmaydi. Taqribiy qiymatning absolyut xatosi = |aniq − taqribiy|; nisbiy xato = absolyut xato / |aniq qiymat| (foizda ham).",
          "При округлении, если первая отбрасываемая цифра 5 или больше, предыдущая цифра УВЕЛИЧИВАЕТСЯ на 1; если меньше 5 — не меняется. Абсолютная погрешность = |точное − приближённое|; относительная = абсолютная / |точное| (можно в процентах)."] },
    ],
    f: [
      { n: ["Absolyut xato", "Абсолютная погрешность"], f: "Δ = | a − a* |" },
      { n: ["Nisbiy xato", "Относительная погрешность"], f: "δ = Δ / |a| · 100%" },
    ],
    s: [
      ["Qaysi xonagacha yaxlitlash kerakligini aniqlang.", "Определите разряд округления."],
      ["Keyingi raqamga qarang: ≥ 5 — oshiring, < 5 — qoldiring.", "Смотрите на следующую цифру: ≥ 5 — округлить вверх, < 5 — оставить."],
      ["Xato kerak bo'lsa Δ ni, keyin δ ni hisoblang.", "Если нужна погрешность, вычислите Δ, затем δ."],
    ],
    m: [
      { s: ["3,847 ni yuzliklargacha yaxlitlang.", "Округлите 3,847 до сотых."],
        y: ["Keyingi raqam 7 ≥ 5, demak 4 → 5"], j: "3,85" },
      { s: ["12,5 ni butun songacha yaxlitlang.", "Округлите 12,5 до целых."],
        y: ["Keyingi raqam 5 ≥ 5"], j: "13" },
      { s: ["π = 3,1416 ning taqribiy qiymati 3,14. Absolyut xatosi?", "π = 3,1416, приближение 3,14. Абсолютная погрешность?"],
        y: ["Δ = |3,1416 − 3,14|"], j: "0,0016" },
    ],
    x: [
      ["Yaxlitlashda keyingi ikki raqamga qarab ketish: faqat birinchi tashlanadigan raqam hal qiladi.", "Смотреть на несколько цифр: решает только первая отбрасываемая."],
      ["Xatoni 100% ga bo'lmaslik yoki aniq qiymatga bo'lishni unutish.", "Забыть делить на точное значение при относительной погрешности."],
    ],
  },

  "Chala kvadrat tenglamalar": {
    t: [
      { h: ["Ikki xil chala tenglama", "Два вида неполных"],
        p: ["c = 0 bo'lsa ax² + bx = 0 — x ni qavsdan chiqaramiz: x(ax + b) = 0, ildizlar 0 va −b/a. b = 0 bo'lsa ax² + c = 0 — x² = −c/a: −c/a > 0 bo'lsa ikki qarama-qarshi ildiz ±√(−c/a), manfiy bo'lsa haqiqiy ildiz yo'q. Diskriminant shart emas.",
          "Если c = 0: ax² + bx = 0 — выносим x: x(ax + b) = 0, корни 0 и −b/a. Если b = 0: ax² + c = 0 — x² = −c/a: при −c/a > 0 два противоположных корня ±√(−c/a), при отрицательном действительных корней нет. Дискриминант не нужен."] },
    ],
    f: [
      { n: ["c = 0", "c = 0"], f: "ax² + bx = 0  ⇒  x = 0,  x = −b/a" },
      { n: ["b = 0", "b = 0"], f: "ax² + c = 0  ⇒  x = ±√(−c/a)" },
    ],
    s: [
      ["Qaysi hadi yo'qligini aniqlang (b yoki c).", "Определите, какого члена нет (b или c)."],
      ["c = 0 — qavsdan x ni chiqaring; b = 0 — x² ni yakkalang.", "c = 0 — вынесите x; b = 0 — выразите x²."],
      ["Ildizlarni tekshiring; x² manfiy bo'lsa — ildiz yo'q.", "Проверьте: если x² отрицательно — корней нет."],
    ],
    m: [
      { s: ["3x² − 12x = 0 ni yeching.", "Решите 3x² − 12x = 0."],
        y: ["3x(x − 4) = 0"], j: "x = 0,  x = 4" },
      { s: ["x² − 16 = 0 ni yeching.", "Решите x² − 16 = 0."],
        y: ["x² = 16"], j: "x = ±4" },
      { s: ["2x² + 8 = 0 ni yeching.", "Решите 2x² + 8 = 0."],
        y: ["x² = −4 < 0"], j: "Haqiqiy ildiz yo'q" },
    ],
    x: [
      ["3x² − 12x = 0 ni x ga bo'lib, x = 0 ildizni yo'qotish.", "Разделить на x и потерять корень x = 0."],
      ["x² = 16 dan faqat +4 olish.", "Взять только +4 из x² = 16."],
    ],
  },

  "Nechta ildiz bor": {
    t: [
      { h: ["Diskriminant bo'yicha", "По дискриминанту"],
        p: ["Ildizlar soni D = b² − 4ac ning ishorasiga bog'liq: D > 0 — ikkita, D = 0 — bitta, D < 0 — haqiqiy ildiz yo'q. Parametrli masalalarda D ga shartni qo'yib parametrni topamiz. Eslatma: koeffitsiyent a = 0 bo'lib qolsa, tenglama kvadrat emas — alohida qaraladi.",
          "Число корней определяется знаком D = b² − 4ac: D > 0 — два, D = 0 — один, D < 0 — нет действительных. В задачах с параметром накладываем условие на D. Замечание: если a = 0, уравнение не квадратное — рассматривается отдельно."] },
    ],
    f: [
      { n: ["Ikki ildiz", "Два корня"], f: "D > 0" },
      { n: ["Bitta ildiz", "Один корень"], f: "D = 0" },
      { n: ["Ildiz yo'q", "Нет корней"], f: "D < 0" },
    ],
    s: [
      ["a, b, c ni yozing.", "Выпишите a, b, c."],
      ["D ni parametr orqali ifodalang.", "Выразите D через параметр."],
      ["D ga kerakli shartni qo'ying va tenglama/tengsizlikni yeching.", "Поставьте условие на D и решите."],
    ],
    m: [
      { s: ["x² − 6x + 9 = 0 nechta ildizga ega?", "Сколько корней у x² − 6x + 9 = 0?"],
        y: ["D = 36 − 36 = 0"], j: "1 ta (x = 3)" },
      { s: ["x² + x + 1 = 0 nechta ildizga ega?", "Сколько корней у x² + x + 1 = 0?"],
        y: ["D = 1 − 4 = −3 < 0"], j: "Ildiz yo'q" },
      { s: ["kx² + 4x + 1 = 0 qaysi k da bitta ildizga ega?", "При каком k уравнение kx² + 4x + 1 = 0 имеет один корень?"],
        y: ["k ≠ 0:  D = 16 − 4k = 0  →  k = 4", "k = 0: 4x + 1 = 0 — ham bitta ildiz (x = −1/4)"], j: "k = 4  (va k = 0)" },
    ],
    x: [
      ["a = 0 holini unutish.", "Забыть случай a = 0."],
      ["D = 0 da «ildiz yo'q» deyish: bitta (ikki karrali) ildiz bor.", "Говорить «нет корней» при D = 0: есть один корень."],
    ],
  },

  "Ildizlarni topish": {
    t: [
      { h: ["Formula", "Формула"],
        p: ["D ≥ 0 bo'lsa ildizlar x = (−b ± √D)/(2a). Agar b juft bo'lsa (b = 2k), qisqa formula: x = (−k ± √(k² − ac))/a. Natija butun bo'lmasa — ildizli yoki kasr javob qoldiriladi.",
          "При D ≥ 0 корни x = (−b ± √D)/(2a). Если b чётно (b = 2k), удобнее x = (−k ± √(k² − ac))/a. Если результат нецелый — ответ оставляют с корнем или дробью."] },
    ],
    f: [
      { n: ["Umumiy", "Общая"], f: "x₁,₂ = (−b ± √D) / (2a)" },
      { n: ["Juft b = 2k", "Чётное b = 2k"], f: "x₁,₂ = (−k ± √(k² − ac)) / a" },
    ],
    s: [
      ["Tenglamani ax² + bx + c = 0 ko'rinishiga keltiring.", "Приведите к виду ax² + bx + c = 0."],
      ["D ni hisoblang.", "Найдите D."],
      ["Formulaga qo'ying va ikkala ildizni yozing (+ va −).", "Подставьте и запишите оба корня (+ и −)."],
    ],
    m: [
      { s: ["x² − 7x + 10 = 0 ni yeching.", "Решите x² − 7x + 10 = 0."],
        y: ["D = 49 − 40 = 9", "x = (7 ± 3) / 2"], j: "x = 5,  x = 2" },
      { s: ["2x² + x − 3 = 0 ni yeching.", "Решите 2x² + x − 3 = 0."],
        y: ["D = 1 + 24 = 25", "x = (−1 ± 5) / 4"], j: "x = 1,  x = −3/2" },
      { s: ["x² − 2x − 1 = 0 ni yeching.", "Решите x² − 2x − 1 = 0."],
        y: ["D = 4 + 4 = 8,  √D = 2√2", "x = (2 ± 2√2) / 2"], j: "x = 1 ± √2" },
    ],
    x: [
      ["−b ni b deb olish (b manfiy bo'lganda).", "Брать b вместо −b (при отрицательном b)."],
      ["Ikkinchi ildizni yozmay qolish.", "Записать только один корень."],
    ],
  },

  "Kvadrat uchhadni ajratish": {
    t: [
      { h: ["Ko'paytuvchilarga ajratish", "Разложение на множители"],
        p: ["Agar ax² + bx + c ning ildizlari x₁ va x₂ bo'lsa, u a(x − x₁)(x − x₂) ga ajraladi. D < 0 bo'lsa ajralmaydi. Ajratish kasrlarni qisqartirishda va tengsizliklarni yechishda kerak. To'liq kvadrat ajratish: x² + px = (x + p/2)² − p²/4.",
          "Если корни ax² + bx + c равны x₁ и x₂, то выражение раскладывается: a(x − x₁)(x − x₂). При D < 0 не раскладывается. Нужно для сокращения дробей и решения неравенств. Выделение полного квадрата: x² + px = (x + p/2)² − p²/4."] },
    ],
    f: [
      { n: ["Ajratish", "Разложение"], f: "ax² + bx + c = a(x − x₁)(x − x₂)" },
      { n: ["To'liq kvadrat", "Полный квадрат"], f: "x² + px = (x + p/2)² − p²/4" },
    ],
    s: [
      ["ax² + bx + c = 0 ni yechib, x₁ va x₂ ni toping.", "Решите ax² + bx + c = 0, найдите x₁, x₂."],
      ["a(x − x₁)(x − x₂) shaklida yozing (a ni unutmang).", "Запишите a(x − x₁)(x − x₂) (не забудьте a)."],
    ],
    m: [
      { s: ["x² − 5x + 6 ni ajrating.", "Разложите x² − 5x + 6."],
        y: ["Ildizlar: 2 va 3"], j: "(x − 2)(x − 3)" },
      { s: ["2x² + x − 3 ni ajrating.", "Разложите 2x² + x − 3."],
        y: ["Ildizlar: 1 va −3/2", "2(x − 1)(x + 3/2)"], j: "(x − 1)(2x + 3)" },
      { s: ["(x² − 4x + 3)/(x² − 1) ni qisqartiring.", "Сократите (x² − 4x + 3)/(x² − 1)."],
        y: ["x² − 4x + 3 = (x − 1)(x − 3);  x² − 1 = (x − 1)(x + 1)"], j: "(x − 3)/(x + 1)" },
    ],
    x: [
      ["Ajratishda oldingi koeffitsiyent a ni tushirib qoldirish.", "Забыть множитель a."],
      ["Ildiz ishorasini teskari yozish: ildiz 2 bo'lsa (x − 2).", "Перепутать знак: корню 2 отвечает (x − 2)."],
    ],
  },

  "O'rta arifmetik qiymat": {
    t: [
      { h: ["O'rta arifmetik", "Среднее арифметическое"],
        p: ["Sonlar yig'indisini ularning soniga bo'lish. U «tenglashtirilgan» qiymat: hamma son shunday bo'lsa yig'indi o'zgarmasdi. Bitta juda katta yoki kichik son o'rtachani kuchli o'zgartiradi. Yig'indi = o'rtacha · soni — teskari masalalarda kerak.",
          "Сумма чисел, делённая на их количество. Это «выровненное» значение. Одно очень большое или малое число сильно меняет среднее. Сумма = среднее · количество — пригодится в обратных задачах."] },
    ],
    f: [
      { n: ["O'rtacha", "Среднее"], f: "x̄ = (x₁ + x₂ + … + xₙ) / n" },
      { n: ["Yig'indi", "Сумма"], f: "x₁ + … + xₙ = x̄ · n" },
    ],
    s: [
      ["Hamma sonni qo'shing.", "Сложите все числа."],
      ["Sonlar soniga bo'ling.", "Разделите на их количество."],
    ],
    m: [
      { s: ["4, 6, 8, 10, 12 ning o'rtachasi?", "Среднее чисел 4, 6, 8, 10, 12?"],
        y: ["(4 + 6 + 8 + 10 + 12) / 5 = 40 / 5"], j: "8" },
      { s: ["Uch sonning o'rtachasi 7. To'rtinchi son qo'shilgach o'rtacha 8 bo'ldi. To'rtinchi son?", "Среднее трёх чисел 7. После добавления четвёртого стало 8. Найдите его."],
        y: ["Yig'indi: 3 · 7 = 21;  4 · 8 = 32", "32 − 21"], j: "11" },
    ],
    x: [
      ["Sonlar soniga bo'lishda noto'g'ri n olish.", "Делить не на то количество."],
      ["O'rtachani har doim ko'p uchraydigan qiymat deb o'ylash: bu moda.", "Считать среднее самым частым значением: это мода."],
    ],
  },

  "Moda": {
    t: [
      { h: ["Moda", "Мода"],
        p: ["Ma'lumotlar qatorida eng ko'p uchraydigan qiymat. Bir nechta moda bo'lishi mumkin (agar bir necha son bir xil ko'p uchrasa), hech biri takrorlanmasa — moda yo'q. Modani topish uchun har bir sonni sanaymiz.",
          "Значение, встречающееся в ряду данных чаще всего. Мод может быть несколько (если несколько чисел встречаются одинаково часто); если повторов нет — моды нет. Для нахождения считаем частоту каждого значения."] },
    ],
    f: [
      { n: ["Moda", "Мода"], f: "eng katta chastotali qiymat" },
    ],
    s: [
      ["Har bir qiymat necha marta uchrashini sanang (jadval).", "Посчитайте, сколько раз встречается каждое значение."],
      ["Eng katta chastotali qiymat — moda.", "Наибольшая частота — мода."],
    ],
    m: [
      { s: ["3, 5, 5, 7, 5, 9, 7 ning modasi?", "Мода ряда 3, 5, 5, 7, 5, 9, 7?"],
        y: ["5 — 3 marta, 7 — 2 marta, 3 va 9 — 1 martadan"], j: "5" },
      { s: ["2, 2, 3, 3, 4 ning modasi?", "Мода ряда 2, 2, 3, 3, 4?"],
        y: ["2 va 3 ikkitadan uchraydi"], j: "2 va 3" },
    ],
    x: [
      ["Modani chastotaning o'zi bilan aralashtirish: moda — qiymat, chastota — soni.", "Путать моду с частотой: мода — значение."],
    ],
  },

  "Mediana": {
    t: [
      { h: ["Mediana", "Медиана"],
        p: ["Tartiblangan (o'sish yoki kamayish) qatorning o'rtasidagi qiymat. Element soni toq bo'lsa — aynan o'rtadagi; juft bo'lsa — o'rtadagi ikkitasining o'rta arifmetigi. Mediana chetdagi juda katta yoki kichik qiymatlarga sezgir emas.",
          "Значение посередине упорядоченного ряда. При нечётном числе элементов — средний; при чётном — среднее арифметическое двух средних. Медиана устойчива к очень большим или малым значениям."] },
    ],
    f: [
      { n: ["Toq n", "Нечётное n"], f: "Me = x₍(n+1)/2₎" },
      { n: ["Juft n", "Чётное n"], f: "Me = (x₍n/2₎ + x₍n/2+1₎) / 2" },
    ],
    s: [
      ["Qatorni o'sish tartibida yozing.", "Запишите ряд по возрастанию."],
      ["O'rtadagi element(lar)ni toping.", "Найдите средний элемент (элементы)."],
      ["Juft bo'lsa ikkitasining o'rtachasini oling.", "Если чётное — возьмите среднее двух."],
    ],
    m: [
      { s: ["7, 1, 5, 3, 9 ning medianasi?", "Медиана ряда 7, 1, 5, 3, 9?"],
        y: ["Tartib: 1, 3, 5, 7, 9", "O'rtada: 5"], j: "5" },
      { s: ["2, 8, 4, 10 ning medianasi?", "Медиана ряда 2, 8, 4, 10?"],
        y: ["Tartib: 2, 4, 8, 10", "(4 + 8) / 2"], j: "6" },
      { s: ["1, 2, 3, 4, 100 ning o'rtachasi va medianasi?", "Среднее и медиана ряда 1, 2, 3, 4, 100?"],
        y: ["O'rtacha: 110 / 5 = 22", "Mediana: 3"], j: "22 va 3" },
    ],
    x: [
      ["Tartiblamasdan o'rtadagi sonni olish.", "Брать средний, не упорядочив ряд."],
      ["Juft sonda faqat bitta o'rtadagini olish.", "При чётном числе взять лишь один средний."],
    ],
  },

  "algebra8|Kombinatorik masalalar": {
    t: [
      { h: ["Tanlash usullari", "Способы выбора"],
        p: ["Tartib muhimmi? Muhim bo'lsa — O'RINLASHTIRISH: A(n; k) = n!/(n − k)!. Muhim bo'lmasa (faqat kim tanlangani) — GURUHLASH: C(n; k) = n!/(k!(n − k)!). O'rin almashtirish — hamma n ta elementni tartiblash: n!.",
          "Важен ли порядок? Если важен — РАЗМЕЩЕНИЯ: A(n; k) = n!/(n − k)!. Если не важен (лишь состав) — СОЧЕТАНИЯ: C(n; k) = n!/(k!(n − k)!). Перестановки — расстановка всех n элементов: n!."] },
    ],
    f: [
      { n: ["O'rinlashtirish", "Размещения"], f: "A(n; k) = n! / (n − k)!" },
      { n: ["Guruhlash", "Сочетания"], f: "C(n; k) = n! / (k! · (n − k)!)" },
      { n: ["O'rin almashtirish", "Перестановки"], f: "Pₙ = n!" },
    ],
    s: [
      ["Savol: tartib muhimmi? (rais/kotib — muhim, komissiya — muhim emas).", "Вопрос: важен ли порядок? (председатель/секретарь — важен, комиссия — нет)."],
      ["Mos formulani tanlang.", "Выберите формулу."],
      ["Qisqartirib hisoblang.", "Считайте, сокращая."],
    ],
    m: [
      { s: ["10 kishidan rais, kotib va xazinachi necha xil tanlanadi?", "Сколькими способами выбрать из 10 человек председателя, секретаря и казначея?"],
        y: ["Tartib muhim: A(10; 3) = 10 · 9 · 8"], j: "720" },
      { s: ["6 xodimdan ixtiyoriy 2 tasini necha xil tanlash mumkin?", "Сколькими способами выбрать 2 из 6 сотрудников?"],
        y: ["Tartib muhim emas: C(6; 2) = 6 · 5 / 2"], j: "15" },
      { s: ["5 kitobdan 2 tasini olish usullari?", "Способов выбрать 2 книги из 5?"],
        y: ["C(5; 2) = 5 · 4 / 2"], j: "10" },
    ],
    x: [
      ["Tartib muhim masalada C ni ishlatish (yoki aksincha).", "Применять C, когда порядок важен (или наоборот)."],
      ["Faktoriallarni qisqartirmay katta sonlar hisoblash.", "Считать факториалы целиком вместо сокращения."],
    ],
  },
};
