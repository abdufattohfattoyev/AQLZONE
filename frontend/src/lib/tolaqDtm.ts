/**
 * TO'LIQ DARSLAR — DTM uchun qo'shilgan boblar (2026-10-15):
 * 7-sinf "Bo'linish va qoldiqlar", 9-sinf "Parametrli tenglamalar",
 * 11-sinf "Kesik konus va kesik piramida" (`lib/oliy/dtmQoshimcha.ts`);
 * 2026-10-24 — 9-sinf geometriya "Uchburchak va aylanalar", "Aylana:
 * vatar, urinma, tenglama" (`lib/oliy/dtmGeometriya.ts`).
 *
 * Kalitlar KURS bilan ("algebra7|..."): "Qoldiqli bo'lish" 3-sinfda ham
 * bor va u yerda bolalar uchun boshqa matn kerak. Misollardagi hamma son
 * qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_DTM: Record<string, Tolaq> = {
  /* ======================= 7-sinf: bo'linish va qoldiqlar ======================= */
  "algebra7|Qoldiqli bo'lish": {
    t: [
      { h: ["Bo'lish teoremasi", "Теорема о делении с остатком"],
        p: ["Har qanday natural a va b uchun yagona q va r topiladi: a = b · q + r, bunda 0 ≤ r < b. q — to'liqsiz bo'linma, r — qoldiq. r = 0 bo'lsa a soni b ga qoldiqsiz bo'linadi. Qoldiq hech qachon bo'luvchidan katta yoki unga teng bo'lmaydi.",
          "Для любых натуральных a и b существуют единственные q и r: a = b · q + r, где 0 ≤ r < b. q — неполное частное, r — остаток. При r = 0 число a делится на b нацело. Остаток никогда не бывает больше или равен делителю."] },
    ],
    f: [
      { n: ["Qoldiqli bo'lish", "Деление с остатком"], f: "a = b · q + r,   0 ≤ r < b" },
      { n: ["Qoldiqni topish", "Нахождение остатка"], f: "r = a − b · q" },
    ],
    s: [
      ["a ichida b eng ko'pi bilan necha marta borligini toping — bu q.", "Найдите, сколько раз b целиком помещается в a, — это q."],
      ["b · q ni a dan ayiring — farq qoldiq r.", "Вычтите b · q из a — разность и есть остаток r."],
      ["Tekshiring: 0 ≤ r < b.", "Проверьте: 0 ≤ r < b."],
    ],
    m: [
      { s: ["340 ni 7 ga bo'lgandagi qoldiqni toping.", "Найдите остаток от деления 340 на 7."],
        y: ["7 · 48 = 336", "340 − 336 = 4"], j: "4" },
      { s: ["Qaysi son 9 ga bo'lganda bo'linma 12, qoldiq 5 beradi?", "Какое число при делении на 9 даёт частное 12 и остаток 5?"],
        y: ["a = 9 · 12 + 5"], j: "113" },
    ],
    x: [
      ["Bo'linmani qoldiq deb yozish.", "Записывать частное вместо остатка."],
      ["Qoldiqni bo'luvchidan katta qoldirish: 340 = 7 · 47 + 11 — bo'lish tugamagan.", "Оставлять остаток больше делителя: 340 = 7 · 47 + 11 — деление не закончено."],
    ],
  },

  "algebra7|Qoldiqlar ustida amallar": {
    t: [
      { h: ["Qoldiqlar bilan hisoblash", "Вычисления с остатками"],
        p: ["Agar a ni m ga bo'lganda qoldiq r₁, b ni — r₂ bo'lsa, a + b ning qoldig'i r₁ + r₂ ning qoldig'iga, a · b niki esa r₁ · r₂ ning qoldig'iga teng. Ya'ni katta sonlarni qoldiqlari bilan almashtirish mumkin. Oxirida natijani yana m ga bo'lib, haqiqiy qoldiqni olish kerak.",
          "Если a при делении на m даёт остаток r₁, а b — r₂, то остаток a + b равен остатку r₁ + r₂, а остаток a · b — остатку r₁ · r₂. То есть большие числа можно заменять их остатками. В конце результат нужно снова разделить на m."] },
    ],
    f: [
      { n: ["Yig'indi", "Сумма"], f: "(a + b) mod m = (r₁ + r₂) mod m" },
      { n: ["Ko'paytma", "Произведение"], f: "(a · b) mod m = (r₁ · r₂) mod m" },
      { n: ["Daraja", "Степень"], f: "aⁿ mod m = r₁ⁿ mod m" },
    ],
    s: [
      ["Har sonning qoldig'ini yozing.", "Запишите остаток каждого числа."],
      ["Amalni qoldiqlar ustida bajaring.", "Выполните действие над остатками."],
      ["Natijani m ga bo'lib, oxirgi qoldiqni oling.", "Разделите результат на m и возьмите итоговый остаток."],
    ],
    m: [
      { s: ["a ni 9 ga bo'lganda qoldiq 5, b ni — 8. a + b ni 9 ga bo'lgandagi qoldiq?", "a при делении на 9 даёт остаток 5, b — 8. Каков остаток a + b при делении на 9?"],
        y: ["5 + 8 = 13", "13 = 9 · 1 + 4"], j: "4" },
      { s: ["a ni 7 ga bo'lganda qoldiq 3, b ni — 5. a · b ni 7 ga bo'lgandagi qoldiq?", "a при делении на 7 даёт остаток 3, b — 5. Каков остаток a · b при делении на 7?"],
        y: ["3 · 5 = 15", "15 = 7 · 2 + 1"], j: "1" },
    ],
    x: [
      ["r₁ + r₂ ni javob deb yozish va uni yana m ga bo'lmaslik.", "Записывать r₁ + r₂ как ответ, не деля его снова на m."],
      ["Ko'paytma o'rniga qoldiqlarni qo'shish.", "Складывать остатки вместо умножения."],
    ],
  },

  "algebra7|Darajaning oxirgi raqami": {
    t: [
      { h: ["Oxirgi raqamlar davri", "Цикл последних цифр"],
        p: ["Darajaning oxirgi raqami faqat asosning oxirgi raqamiga bog'liq: 37⁵ va 7⁵ bir xil raqam bilan tugaydi. Daraja oshgan sari oxirgi raqamlar ko'pi bilan 4 qadamda takrorlanadi. Shuning uchun n ni 4 ga bo'lgandagi qoldiq k ni topib, davrning k-hadini olamiz; k = 0 bo'lsa — 4-hadini.",
          "Последняя цифра степени зависит только от последней цифры основания: 37⁵ и 7⁵ оканчиваются одинаково. С ростом показателя последние цифры повторяются не более чем через 4 шага. Поэтому находим остаток k от деления n на 4 и берём k-й член цикла; при k = 0 — 4-й."] },
    ],
    f: [
      { n: ["2 ning davri", "Цикл 2"], f: "2, 4, 8, 6" },
      { n: ["3 ning davri", "Цикл 3"], f: "3, 9, 7, 1" },
      { n: ["7 ning davri", "Цикл 7"], f: "7, 9, 3, 1" },
      { n: ["8 ning davri", "Цикл 8"], f: "8, 4, 2, 6" },
      { n: ["4 va 9", "4 и 9"], f: "4, 6  ·  9, 1" },
      { n: ["O'zgarmaydiganlar", "Не меняются"], f: "0 → 0,   1 → 1,   5 → 5,   6 → 6" },
    ],
    s: [
      ["Asosning oxirgi raqamini oling.", "Возьмите последнюю цифру основания."],
      ["Uning davrini yozing (4 ta had).", "Выпишите её цикл (4 члена)."],
      ["n = 4q + k ko'rinishida yozing (k = 1, 2, 3, 4).", "Запишите n = 4q + k (k = 1, 2, 3, 4)."],
      ["Davrning k-hadi — javob.", "k-й член цикла — ответ."],
    ],
    m: [
      { s: "7⁸³", y: ["7: 7, 9, 3, 1", "83 = 4 · 20 + 3"], j: "3" },
      { s: "32⁶⁴", y: ["2: 2, 4, 8, 6", "64 = 4 · 15 + 4"], j: "6" },
    ],
    x: [
      ["n 4 ga bo'linsa javobni 1 deb olish: 2⁶⁴ → 6, 1 emas.", "При n, кратном 4, брать ответ 1: 2⁶⁴ → 6, а не 1."],
      ["Butun asos bilan ishlash: 32 ning emas, 2 ning davri kerak.", "Работать со всем основанием: нужен цикл 2, а не 32."],
    ],
  },

  "algebra7|Bo'luvchilar soni": {
    t: [
      { h: ["Bo'luvchilarni sanamasdan topish", "Число делителей без перебора"],
        p: ["N = pᵃ · qᵇ · … (p, q — tub) bo'lsa, har bir bo'luvchi pˣ · qʸ ko'rinishida, bunda x 0 dan a gacha (a + 1 ta tanlov), y 0 dan b gacha (b + 1 ta tanlov). Ko'paytirish qoidasi bo'yicha bo'luvchilar soni (a + 1)(b + 1)… ga teng. Bu son 1 ni ham, N ning o'zini ham o'z ichiga oladi.",
          "Если N = pᵃ · qᵇ · … (p, q — простые), каждый делитель имеет вид pˣ · qʸ, где x от 0 до a (a + 1 вариант), y от 0 до b (b + 1 вариант). По правилу умножения число делителей равно (a + 1)(b + 1)… В него входят и 1, и само N."] },
    ],
    f: [
      { n: ["Bo'luvchilar soni", "Число делителей"], f: "τ(pᵃqᵇrᶜ) = (a + 1)(b + 1)(c + 1)" },
      { n: ["Tub son", "Простое число"], f: "τ(p) = 2" },
      { n: ["To'la kvadrat", "Полный квадрат"], f: "τ(n²) — toq / нечётно" },
    ],
    s: [
      ["Sonni tub ko'paytuvchilarga ajrating.", "Разложите число на простые множители."],
      ["Har ko'rsatkichga 1 qo'shing.", "К каждому показателю прибавьте 1."],
      ["Hosil bo'lgan sonlarni ko'paytiring.", "Перемножьте полученные числа."],
    ],
    m: [
      { s: "360", y: ["360 = 2³ · 3² · 5", "(3 + 1)(2 + 1)(1 + 1)"], j: "24" },
      { s: "72", y: ["72 = 2³ · 3²", "(3 + 1)(2 + 1)"], j: "12" },
    ],
    x: [
      ["Ko'rsatkichlarning o'zini ko'paytirish: 3 · 2 = 6.", "Перемножать сами показатели: 3 · 2 = 6."],
      ["Ko'paytuvchilarga to'liq ajratmaslik: 72 = 8 · 9 da 8 ham, 9 ham tub emas.", "Раскладывать не до конца: в 72 = 8 · 9 ни 8, ни 9 не простые."],
    ],
  },

  "algebra7|Bo'luvchilar yig'indisi": {
    t: [
      { h: ["Bo'luvchilar yig'indisi formulasi", "Формула суммы делителей"],
        p: ["N = pᵃ · qᵇ bo'lsa, (1 + p + … + pᵃ)(1 + q + … + qᵇ) ko'paytmani ochganda N ning har bir bo'luvchisi aynan bir marta chiqadi. Shuning uchun bu ko'paytma barcha natural bo'luvchilar yig'indisiga teng — 1 va N ham kiradi.",
          "Если N = pᵃ · qᵇ, то при раскрытии произведения (1 + p + … + pᵃ)(1 + q + … + qᵇ) каждый делитель N встречается ровно один раз. Поэтому это произведение равно сумме всех натуральных делителей — включая 1 и N."] },
    ],
    f: [
      { n: ["Bo'luvchilar yig'indisi", "Сумма делителей"], f: "σ(pᵃqᵇ) = (1 + p + … + pᵃ)(1 + q + … + qᵇ)" },
      { n: ["Bitta tub son darajasi", "Степень простого"], f: "1 + p + … + pᵃ = (pᵃ⁺¹ − 1) / (p − 1)" },
    ],
    s: [
      ["Sonni tub ko'paytuvchilarga ajrating.", "Разложите число на простые множители."],
      ["Har tub son uchun 1 dan eng katta darajasigacha yig'indini yozing.", "Для каждого простого запишите сумму степеней от 1 до наибольшей."],
      ["Yig'indilarni ko'paytiring.", "Перемножьте суммы."],
    ],
    m: [
      { s: "12", y: ["12 = 2² · 3", "(1 + 2 + 4)(1 + 3) = 7 · 4"], j: "28" },
      { s: "18", y: ["18 = 2 · 3²", "(1 + 2)(1 + 3 + 9) = 3 · 13"], j: "39" },
    ],
    x: [
      ["Yig'indilarni ko'paytirish o'rniga qo'shish: 7 + 4 = 11.", "Складывать суммы вместо умножения: 7 + 4 = 11."],
      ["N ning o'zini qo'shmaslik (bu \"xos bo'luvchilar\" yig'indisi bo'lib qoladi).", "Не включать само N (получится сумма собственных делителей)."],
    ],
  },

  /* ======================= 9-sinf: parametrli tenglamalar ======================= */
  "algebra9|Ildizlar soni va parametr": {
    t: [
      { h: ["Parametr nima", "Что такое параметр"],
        p: ["Parametr — harf bilan yozilgan, lekin noma'lum emas, balki \"istalgan son bo'lishi mumkin\" bo'lgan koeffitsient. x² + 6x + a = 0 — bitta tenglama emas, a ning har qiymati uchun alohida tenglama. Savol odatda: qaysi a da tenglama nechta ildizga ega? Javobni diskriminant beradi.",
          "Параметр — коэффициент, записанный буквой: это не неизвестное, а «любое число». x² + 6x + a = 0 — не одно уравнение, а отдельное для каждого a. Обычный вопрос: при каких a уравнение имеет столько-то корней? Ответ даёт дискриминант."] },
    ],
    f: [
      { n: ["Diskriminant", "Дискриминант"], f: "D = b² − 4ac" },
      { n: ["Juft b da", "При чётном b"], f: "D/4 = k² − ac,   b = 2k" },
      { n: ["Ildizlar soni", "Число корней"], f: "D > 0 — 2,   D = 0 — 1,   D < 0 — 0" },
    ],
    s: [
      ["Diskriminantni a orqali yozing.", "Запишите дискриминант через a."],
      ["Shartga mos tenglik yoki tengsizlikni tuzing (D = 0, D > 0, D < 0).", "Составьте нужное условие (D = 0, D > 0, D < 0)."],
      ["Uni a ga nisbatan yeching.", "Решите его относительно a."],
    ],
    m: [
      { s: ["x² + 6x + a = 0 yagona ildizga ega bo'ladigan a?", "При каком a уравнение x² + 6x + a = 0 имеет единственный корень?"],
        y: ["D/4 = 9 − a = 0"], j: "a = 9" },
      { s: ["x² − 4x + a = 0 ildizga ega bo'lmaydigan a?", "При каких a уравнение x² − 4x + a = 0 не имеет корней?"],
        y: ["D/4 = 4 − a < 0"], j: "a > 4" },
    ],
    x: [
      ["D < 0 va D > 0 ni adashtirish: \"ildiz yo'q\" — D < 0.", "Путать D < 0 и D > 0: «корней нет» — это D < 0."],
      ["D/4 da k ni b deb olish: b = 6 da k = 3.", "В D/4 брать k = b: при b = 6 k = 3."],
    ],
  },

  "algebra9|Bosh koeffitsientda parametr": {
    t: [
      { h: ["a = 0 holati", "Случай старшего коэффициента 0"],
        p: ["Parametr x² oldida tursa, u nol bo'lganda tenglama kvadrat bo'lmay qoladi — chiziqli tenglamaga aylanadi va diskriminant formulasi ishlamaydi. Shuning uchun yechim doim ikki qismdan iborat: avval bosh koeffitsient nol bo'lgan holat, keyin nol bo'lmagan holatda diskriminant.",
          "Если параметр стоит при x², то при его нулевом значении уравнение перестаёт быть квадратным — становится линейным, и формула дискриминанта не работает. Поэтому решение всегда из двух частей: сначала случай нулевого старшего коэффициента, затем — дискриминант."] },
    ],
    f: [
      { n: ["1-qadam", "Шаг 1"], f: "a − m = 0  →  chiziqli / линейное" },
      { n: ["2-qadam", "Шаг 2"], f: "a − m ≠ 0  →  D" },
    ],
    s: [
      ["Bosh koeffitsientni nolga tenglang va hosil bo'lgan chiziqli tenglamani tekshiring.", "Приравняйте старший коэффициент к нулю и проверьте линейное уравнение."],
      ["Qolgan holatda diskriminant shartini yeching.", "В остальных случаях решите условие на дискриминант."],
      ["Ikkala natijani birlashtiring.", "Объедините оба результата."],
    ],
    m: [
      { s: ["(a − 3)x² + 2x + 1 = 0 yagona ildizga ega bo'ladigan a?", "При каких a уравнение (a − 3)x² + 2x + 1 = 0 имеет единственный корень?"],
        y: [["a = 3:  2x + 1 = 0 — bitta ildiz", "a = 3:  2x + 1 = 0 — один корень"], "a ≠ 3:  D/4 = 1 − (a − 3) = 0  →  a = 4"], j: "a = 3;  a = 4" },
    ],
    x: [
      ["Faqat D = 0 ni yechib, a = m holatini unutish.", "Решать только D = 0 и забывать случай a = m."],
      ["a = m da ham diskriminant formulasini qo'llash.", "Применять формулу дискриминанта и при a = m."],
    ],
  },

  "algebra9|Parametr va Viyet teoremasi": {
    t: [
      { h: ["Ildiz berilgan bo'lsa", "Если известен корень"],
        p: ["Keltirilgan x² + px + q = 0 tenglamada x₁ + x₂ = −p va x₁ · x₂ = q. Bitta ildiz ma'lum bo'lsa, ikkinchisini ko'paytmadan (yoki yig'indidan) topamiz, so'ng noma'lum koeffitsientni ikkinchi formuladan. Boshqa yo'l: ildizni tenglamaga qo'yib, p ni to'g'ridan-to'g'ri topish.",
          "Для приведённого x² + px + q = 0 выполняется x₁ + x₂ = −p и x₁ · x₂ = q. Зная один корень, второй находим из произведения (или суммы), а неизвестный коэффициент — из другой формулы. Другой путь: подставить корень в уравнение и найти p напрямую."] },
    ],
    f: [
      { n: ["Yig'indi", "Сумма"], f: "x₁ + x₂ = −p" },
      { n: ["Ko'paytma", "Произведение"], f: "x₁ · x₂ = q" },
      { n: ["Ildizni qo'yish", "Подстановка корня"], f: "x₁² + p · x₁ + q = 0" },
    ],
    s: [
      ["Ma'lum koeffitsient orqali ikkinchi ildizni toping.", "Найдите второй корень через известный коэффициент."],
      ["Noma'lum koeffitsientni ikkinchi formuladan toping.", "Найдите неизвестный коэффициент из второй формулы."],
    ],
    m: [
      { s: "x² + px + 12 = 0,   x₁ = 3", y: ["x₂ = 12 / 3 = 4", "p = −(3 + 4)"], j: "p = −7" },
      { s: "x² − 5x + q = 0,   x₁ = 2", y: ["x₂ = 5 − 2 = 3", "q = 2 · 3"], j: "q = 6" },
    ],
    x: [
      ["Yig'indida minusni unutish: p = x₁ + x₂.", "Забывать минус: p = x₁ + x₂."],
      ["Ikkinchi ildizni javob deb yozish.", "Записывать второй корень как ответ."],
    ],
  },

  "algebra9|Chiziqli tenglamada parametr": {
    t: [
      { h: ["kx = b tenglamani tekshirish", "Исследование уравнения kx = b"],
        p: ["kx = b ko'rinishidagi tenglamada uch holat bor. k ≠ 0 bo'lsa — yagona yechim x = b/k. k = 0 va b = 0 bo'lsa — 0 · x = 0, har qanday x yechim (cheksiz ko'p). k = 0, b ≠ 0 bo'lsa — 0 · x = b, yechim yo'q. Parametrli masalada k va b ni a orqali yozib, shu holatlarni tekshiramiz.",
          "У уравнения kx = b три случая. k ≠ 0 — единственное решение x = b/k. k = 0 и b = 0 — 0 · x = 0, подходит любое x (бесконечно много). k = 0, b ≠ 0 — 0 · x = b, решений нет. В задаче с параметром записываем k и b через a и проверяем эти случаи."] },
    ],
    f: [
      { n: ["Yagona yechim", "Единственное решение"], f: "k ≠ 0" },
      { n: ["Cheksiz ko'p", "Бесконечно много"], f: "k = 0,  b = 0" },
      { n: ["Yechim yo'q", "Нет решений"], f: "k = 0,  b ≠ 0" },
    ],
    s: [
      ["x oldidagi koeffitsientni nolga tenglang.", "Приравняйте коэффициент при x к нулю."],
      ["Topilgan a da o'ng tomonni hisoblang.", "Вычислите правую часть при найденном a."],
      ["O'ng tomon nol bo'lsa — cheksiz ko'p, aks holda — yechim yo'q.", "Правая часть 0 — бесконечно много, иначе — решений нет."],
    ],
    m: [
      { s: ["(a − 3)x = a² − 9 cheksiz ko'p yechimga ega bo'ladigan a?", "При каком a уравнение (a − 3)x = a² − 9 имеет бесконечно много решений?"],
        y: ["a − 3 = 0  →  a = 3", "a² − 9 = 0 ✓"], j: "a = 3" },
      { s: ["(a − 2)x = a + 5 yechimga ega bo'lmaydigan a?", "При каком a уравнение (a − 2)x = a + 5 не имеет решений?"],
        y: ["a − 2 = 0  →  a = 2", "a + 5 = 7 ≠ 0"], j: "a = 2" },
    ],
    x: [
      ["a = −3 ni ham javobga qo'shish: u yerda −6x = 0 — bitta yechim.", "Включать a = −3: там −6x = 0 — одно решение."],
      ["O'ng tomonni tekshirmasdan \"cheksiz ko'p\" deyish.", "Говорить «бесконечно много», не проверив правую часть."],
    ],
  },

  "algebra9|Ildizlar ishorasi va parametr": {
    t: [
      { h: ["Ildizlar ishorasi Viyet orqali", "Знаки корней через Виета"],
        p: ["Ildizlarni topmasdan ularning ishorasini bilish mumkin. Ko'paytma x₁x₂ > 0 — ishoralar bir xil; yig'indi x₁ + x₂ > 0 bo'lsa ikkalasi musbat. Ildizlar bo'lishi uchun D > 0 (har xil) ham kerak. Uchala shart birga yoziladi va kesishmasi javob.",
          "Знаки корней можно узнать, не находя их. Произведение x₁x₂ > 0 — знаки одинаковы; если сумма x₁ + x₂ > 0, оба положительны. Чтобы корни существовали и различались, нужно D > 0. Все три условия записываются вместе, ответ — их пересечение."] },
    ],
    f: [
      { n: ["Ikkala musbat", "Оба положительны"], f: "D > 0,   x₁x₂ > 0,   x₁ + x₂ > 0" },
      { n: ["Ikkala manfiy", "Оба отрицательны"], f: "D > 0,   x₁x₂ > 0,   x₁ + x₂ < 0" },
      { n: ["Har xil ishorali", "Разных знаков"], f: "x₁x₂ < 0" },
    ],
    s: [
      ["D, x₁x₂ va x₁ + x₂ ni a orqali yozing.", "Запишите D, x₁x₂ и x₁ + x₂ через a."],
      ["Har bir shartni yeching.", "Решите каждое условие."],
      ["Yechimlarning kesishmasini oling.", "Возьмите пересечение решений."],
    ],
    m: [
      { s: ["x² − 6x + a = 0 ikkita har xil musbat ildizga ega bo'ladigan a?", "При каких a уравнение x² − 6x + a = 0 имеет два различных положительных корня?"],
        y: ["D/4 = 9 − a > 0  →  a < 9", "x₁x₂ = a > 0", "x₁ + x₂ = 6 > 0"], j: "0 < a < 9" },
    ],
    x: [
      ["Faqat D > 0 ni yozish — a manfiy bo'lsa bitta ildiz manfiy.", "Писать только D > 0 — при отрицательном a один корень отрицателен."],
      ["Kesishma o'rniga birlashma olish.", "Брать объединение вместо пересечения."],
    ],
  },

  /* ======================= 11-sinf: kesik konus va kesik piramida ======================= */
  "matematika11|Kesik konus yasovchisi": {
    t: [
      { h: ["Kesik konus", "Усечённый конус"],
        p: ["Konusni asosiga parallel tekislik bilan kesib, uchini olib tashlasak, kesik konus qoladi: ikkita doira asos (radiuslari R va r), balandlik h va yasovchi l. O'q bo'yicha kesimi — teng yonli trapetsiya. Uning yon tomonidan balandlik tushirsak, katetlari h va R − r bo'lgan to'g'ri burchakli uchburchak hosil bo'ladi.",
          "Если конус пересечь плоскостью, параллельной основанию, и убрать вершину, останется усечённый конус: два круглых основания (радиусы R и r), высота h и образующая l. Осевое сечение — равнобедренная трапеция. Опустив высоту, получаем прямоугольный треугольник с катетами h и R − r."] },
    ],
    f: [
      { n: ["Yasovchi", "Образующая"], f: "l² = h² + (R − r)²" },
      { n: ["Balandlik", "Высота"], f: "h² = l² − (R − r)²" },
    ],
    s: [
      ["R − r ni toping.", "Найдите R − r."],
      ["Pifagor teoremasini qo'llang.", "Примените теорему Пифагора."],
    ],
    m: [
      { s: "R = 7,  r = 4,  h = 4", y: ["R − r = 3", "l² = 16 + 9 = 25"], j: "5" },
      { s: "R = 10,  r = 5,  l = 13", y: ["R − r = 5", "h² = 169 − 25 = 144"], j: "h = 12" },
    ],
    x: [
      ["R − r o'rniga R + r olish.", "Брать R + r вместо R − r."],
      ["Yasovchini balandlik bilan adashtirish.", "Путать образующую с высотой."],
    ],
  },

  "matematika11|Kesik konus yon sirti": {
    t: [
      { h: ["Yon sirt", "Боковая поверхность"],
        p: ["Kesik konusning yon sirti — katta konus yon sirtidan kichik konus yon sirtini ayirganda qoladigan halqa. Natija sodda formula beradi: S = πl(R + r). Bu yerda balandlik emas, yasovchi qatnashadi. To'liq sirt uchun ikkala asos yuzi πR² va πr² ham qo'shiladi.",
          "Боковая поверхность усечённого конуса — кольцо, оставшееся после вычитания боковой поверхности малого конуса из большого. Получается простая формула: S = πl(R + r). Участвует образующая, а не высота. Для полной поверхности добавляют площади оснований πR² и πr²."] },
    ],
    f: [
      { n: ["Yon sirt", "Боковая поверхность"], f: "S = πl(R + r)" },
      { n: ["To'liq sirt", "Полная поверхность"], f: "S = π(l(R + r) + R² + r²)" },
    ],
    s: [
      ["Yasovchi berilmagan bo'lsa, uni l² = h² + (R − r)² dan toping.", "Если образующая не дана, найдите её из l² = h² + (R − r)²."],
      ["S = πl(R + r) ga qo'ying.", "Подставьте в S = πl(R + r)."],
    ],
    m: [
      { s: "R = 7,  r = 4,  h = 4", y: ["l = 5", "S = π · 5 · 11"], j: "55π" },
      { s: "R = 6,  r = 3,  l = 5", y: ["S = π · 5 · 9"], j: "45π" },
    ],
    x: [
      ["l o'rniga h ni qo'yish.", "Подставлять h вместо l."],
      ["R + r o'rniga R − r olish.", "Брать R − r вместо R + r."],
    ],
  },

  "matematika11|Kesik konus hajmi": {
    t: [
      { h: ["Hajm formulasi", "Формула объёма"],
        p: ["Kesik konus hajmi katta va kichik konus hajmlari ayirmasiga teng. Hisob V = πh(R² + Rr + r²)/3 formulaga olib keladi. Unda uchta had bor: ikkala asos va o'rtadagi Rr. r = 0 bo'lsa formula oddiy konus hajmiga, r = R bo'lsa silindr hajmiga aylanadi — bu eslab qolish uchun yaxshi tekshiruv.",
          "Объём усечённого конуса равен разности объёмов большого и малого конусов. Получается V = πh(R² + Rr + r²)/3. В формуле три слагаемых: оба основания и среднее Rr. При r = 0 она превращается в объём конуса, при r = R — в объём цилиндра; это удобная проверка."] },
    ],
    f: [
      { n: ["Kesik konus", "Усечённый конус"], f: "V = πh(R² + Rr + r²) / 3" },
      { n: ["r = 0 — konus", "r = 0 — конус"], f: "V = πR²h / 3" },
      { n: ["r = R — silindr", "r = R — цилиндр"], f: "V = πR²h" },
    ],
    s: [
      ["R², Rr va r² ni hisoblang.", "Вычислите R², Rr и r²."],
      ["Ularni qo'shib, h ga ko'paytiring va 3 ga bo'ling.", "Сложите, умножьте на h и разделите на 3."],
    ],
    m: [
      { s: "R = 4,  r = 2,  h = 3", y: ["16 + 8 + 4 = 28", "V = π · 3 · 28 / 3"], j: "28π" },
      { s: "R = 5,  r = 2,  h = 6", y: ["25 + 10 + 4 = 39", "V = π · 6 · 39 / 3"], j: "78π" },
    ],
    x: [
      ["Rr hadini tushirib qoldirish.", "Терять слагаемое Rr."],
      ["3 ga bo'lishni unutish.", "Забывать делить на 3."],
    ],
  },

  "matematika11|Kesik piramida hajmi": {
    t: [
      { h: ["Kesik piramida", "Усечённая пирамида"],
        p: ["Piramidani asosga parallel tekislik bilan kesganda kesik piramida qoladi. Asoslari o'xshash ko'pburchaklar, yuzalari S₁ va S₂. Hajm V = h(S₁ + S₂ + √(S₁S₂))/3 — kesik konusdagi kabi uch had, o'rtadagisi asos yuzalarining o'rta geometrigi. Muntazam to'rtburchakli kesik piramidada S₁ = a², S₂ = b², √(S₁S₂) = ab.",
          "Пересекая пирамиду плоскостью, параллельной основанию, получаем усечённую пирамиду. Основания — подобные многоугольники с площадями S₁ и S₂. Объём V = h(S₁ + S₂ + √(S₁S₂))/3 — как у усечённого конуса, три слагаемых, среднее — среднее геометрическое площадей. Для правильной четырёхугольной: S₁ = a², S₂ = b², √(S₁S₂) = ab."] },
    ],
    f: [
      { n: ["Kesik piramida", "Усечённая пирамида"], f: "V = h(S₁ + S₂ + √(S₁S₂)) / 3" },
      { n: ["Kvadrat asoslar", "Квадратные основания"], f: "V = h(a² + ab + b²) / 3" },
    ],
    s: [
      ["Asoslar yuzalarini toping.", "Найдите площади оснований."],
      ["√(S₁S₂) ni hisoblang.", "Вычислите √(S₁S₂)."],
      ["Uchta hadni qo'shib, h ga ko'paytiring va 3 ga bo'ling.", "Сложите три слагаемых, умножьте на h и разделите на 3."],
    ],
    m: [
      { s: ["Asos tomonlari 4 va 2, h = 6", "Стороны оснований 4 и 2, h = 6"],
        y: ["16 + 4 + 8 = 28", "V = 6 · 28 / 3"], j: "56" },
      { s: ["Asos tomonlari 6 va 3, h = 3", "Стороны оснований 6 и 3, h = 3"],
        y: ["36 + 9 + 18 = 63", "V = 3 · 63 / 3"], j: "63" },
    ],
    x: [
      ["√(S₁S₂) hadini tushirish.", "Терять слагаемое √(S₁S₂)."],
      ["(S₁ + S₂)/2 · h — prizma kabi hisoblash.", "Считать как призму: (S₁ + S₂)/2 · h."],
    ],
  },

  /* ============ 9-sinf geometriya: uchburchak va aylanalar (2026-10-24) ============ */
  "geometriya9|Bissektrisa xossasi": {
    t: [
      { h: ["Bissektrisa tomonni qanday bo'ladi", "Как биссектриса делит сторону"],
        p: ["AD — A burchak bissektrisasi bo'lsa, u BC tomonni teng emas, yonidagi tomonlarga proporsional bo'ladi: BD : DC = AB : AC. Kattaroq tomonga yopishgan bo'lak ham kattaroq. Shuning uchun BD = BC · AB / (AB + AC).",
          "Если AD — биссектриса угла A, она делит BC не пополам, а пропорционально прилежащим сторонам: BD : DC = AB : AC. К большей стороне прилегает больший отрезок. Поэтому BD = BC · AB / (AB + AC)."] },
    ],
    f: [
      { n: ["Bissektrisa xossasi", "Свойство биссектрисы"], f: "BD : DC = AB : AC" },
      { n: ["Bo'lak", "Отрезок"], f: "BD = BC · AB / (AB + AC)" },
    ],
    s: [
      ["Qaysi bo'lak qaysi tomonga yopishganini aniqlang: BD — AB ga.", "Определите, какой отрезок к какой стороне прилегает: BD — к AB."],
      ["BC ni AB : AC nisbatda bo'ling.", "Разделите BC в отношении AB : AC."],
    ],
    m: [
      { s: ["AB = 6, AC = 9, BC = 10. BD = ?", "AB = 6, AC = 9, BC = 10. BD = ?"], y: ["BD : DC = 6 : 9", "BD = 10 · 6 / 15"], j: "4" },
      { s: ["AB = 8, AC = 12, BC = 15. BD = ?", "AB = 8, AC = 12, BC = 15. BD = ?"], y: ["BD = 15 · 8 / 20"], j: "6" },
    ],
    x: [
      ["Bissektrisa tomonni teng bo'ladi deb o'ylash — bu mediana.", "Думать, что биссектриса делит сторону пополам, — это медиана."],
      ["Nisbatni teskari olish: BD = BC · AC / (AB + AC).", "Переворачивать отношение: BD = BC · AC / (AB + AC)."],
    ],
  },

  "geometriya9|Uchburchak medianasi": {
    t: [
      { h: ["Mediana uzunligi", "Длина медианы"],
        p: ["AM mediana BC tomonning o'rtasiga tushadi. Uning uzunligi mₐ = ½√(2b² + 2c² − a²), bunda a — mediana tushgan tomon. Formula parallelogrammdan kelib chiqadi: uchburchakni M nuqtaga nisbatan aks ettirsak, diagonallari 2mₐ va a bo'lgan parallelogramm hosil bo'ladi.",
          "Медиана AM приходит в середину стороны BC. Её длина mₐ = ½√(2b² + 2c² − a²), где a — сторона, к которой проведена медиана. Формула следует из параллелограмма: отразив треугольник относительно M, получим параллелограмм с диагоналями 2mₐ и a."] },
      { h: ["Medianalar kesishishi", "Пересечение медиан"],
        p: ["Uchala mediana bitta G nuqtada kesishadi va u har bir medianani uchidan boshlab 2 : 1 nisbatda bo'ladi. Ya'ni AG medianining 2/3 qismi, GM — 1/3 qismi.",
          "Три медианы пересекаются в одной точке G, которая делит каждую в отношении 2 : 1, считая от вершины. То есть AG — 2/3 медианы, GM — 1/3."] },
    ],
    f: [
      { n: ["Mediana", "Медиана"], f: "mₐ = ½ · √(2b² + 2c² − a²)" },
      { n: ["Kesishish nuqtasi", "Точка пересечения"], f: "AG = ⅔ · AM,   GM = ⅓ · AM" },
      { n: ["Gipotenuzaga mediana", "Медиана к гипотенузе"], f: "m = c / 2" },
    ],
    s: [
      ["Mediana qaysi tomonga tushganini aniqlang — u a.", "Определите сторону, к которой проведена медиана, — это a."],
      ["2b² + 2c² − a² ni hisoblab, ildiz chiqaring.", "Вычислите 2b² + 2c² − a² и извлеките корень."],
      ["Natijani 2 ga bo'ling.", "Разделите результат на 2."],
    ],
    m: [
      { s: ["BC = 10, AC = AB = 13. AM = ?", "BC = 10, AC = AB = 13. AM = ?"], y: ["2 · 169 + 2 · 169 − 100 = 576", "AM = ½ · 24"], j: "12" },
      { s: ["AM = 18, G — medianalar kesishgan nuqta. AG = ?", "AM = 18, G — точка пересечения медиан. AG = ?"], y: ["AG = ⅔ · 18"], j: "12" },
    ],
    x: [
      ["2 ga bo'lishni unutish.", "Забывать делить на 2."],
      ["a ni yon tomonlardan biri deb olish — a doim mediana tushgan tomon.", "Брать за a боковую сторону — a всегда сторона, к которой проведена медиана."],
      ["Kesishishda 1 : 1 deb o'ylash.", "Считать, что медианы делятся 1 : 1."],
    ],
  },

  "geometriya9|Ichki chizilgan aylana": {
    t: [
      { h: ["Uchburchakka ichki chizilgan aylana", "Окружность, вписанная в треугольник"],
        p: ["Markazi — bissektrisalar kesishgan nuqta, aylana uchala tomonga urinadi. Uchburchakni markazdan uchlarga tortilgan kesmalar bilan uchta bo'lakka bo'lsak, har birining balandligi r. Yuzlar yig'indisi S = r · (a + b + c)/2 = r · p, bundan r = S / p.",
          "Центр — точка пересечения биссектрис, окружность касается всех трёх сторон. Разрезав треугольник отрезками из центра к вершинам на три части, получим высоты r у каждой. Сумма площадей S = r · (a + b + c)/2 = r · p, отсюда r = S / p."] },
    ],
    f: [
      { n: ["Umumiy formula", "Общая формула"], f: "r = S / p,   p = (a + b + c) / 2" },
      { n: ["Geron formulasi", "Формула Герона"], f: "S = √(p(p − a)(p − b)(p − c))" },
      { n: ["To'g'ri burchakli", "Прямоугольный"], f: "r = (a + b − c) / 2" },
    ],
    s: [
      ["Yarim perimetr p ni toping.", "Найдите полупериметр p."],
      ["Yuzni toping (Geron yoki katetlar orqali).", "Найдите площадь (по Герону или через катеты)."],
      ["r = S / p.", "r = S / p."],
    ],
    m: [
      { s: ["Tomonlar 13, 14, 15. r = ?", "Стороны 13, 14, 15. r = ?"], y: ["p = 21", "S = √(21 · 8 · 7 · 6) = 84", "r = 84 / 21"], j: "4" },
      { s: ["Katetlar 6 va 8. r = ?", "Катеты 6 и 8. r = ?"], y: ["c = 10", "r = (6 + 8 − 10) / 2"], j: "2" },
    ],
    x: [
      ["To'liq perimetrga bo'lish.", "Делить на весь периметр."],
      ["Ichki radius bilan tashqi radiusni (c/2) adashtirish.", "Путать вписанный радиус с описанным (c/2)."],
    ],
  },

  "geometriya9|Tashqi chizilgan aylana": {
    t: [
      { h: ["Uchburchakka tashqi chizilgan aylana", "Окружность, описанная около треугольника"],
        p: ["Aylana uchburchakning uchala uchidan o'tadi, markazi — tomonlarga o'tkazilgan o'rta perpendikulyarlar kesishgan nuqta. To'g'ri burchakli uchburchakda gipotenuza diametr bo'ladi (diametrga tiralgan burchak 90°), shuning uchun R = c/2. Umumiy holda sinuslar teoremasi: a / sin A = 2R.",
          "Окружность проходит через все три вершины, центр — точка пересечения серединных перпендикуляров. В прямоугольном треугольнике гипотенуза — диаметр (вписанный угол, опирающийся на диаметр, равен 90°), поэтому R = c/2. В общем случае — теорема синусов: a / sin A = 2R."] },
    ],
    f: [
      { n: ["To'g'ri burchakli", "Прямоугольный"], f: "R = c / 2" },
      { n: ["Sinuslar teoremasi", "Теорема синусов"], f: "a / sin A = 2R" },
      { n: ["Yuz orqali", "Через площадь"], f: "R = abc / (4S)" },
    ],
    s: [
      ["To'g'ri burchakli bo'lsa — gipotenuzani toping va 2 ga bo'ling.", "Если прямоугольный — найдите гипотенузу и разделите на 2."],
      ["Tomon va qarshisidagi burchak berilsa — a / sin A = 2R.", "Если дана сторона и противолежащий угол — a / sin A = 2R."],
    ],
    m: [
      { s: ["Katetlar 6 va 8. R = ?", "Катеты 6 и 8. R = ?"], y: ["c = √(36 + 64) = 10", "R = 10 / 2"], j: "5" },
      { s: ["BC = 7, ∠A = 30°. R = ?", "BC = 7, ∠A = 30°. R = ?"], y: ["2R = 7 / sin 30° = 14"], j: "7" },
    ],
    x: [
      ["2R ni javob deb yozish.", "Записывать 2R как ответ."],
      ["Burchakni tomonga qarshi emas, yonidagi burchakdan olish.", "Брать прилежащий угол вместо противолежащего."],
    ],
  },

  "geometriya9|Kesishuvchi vatarlar": {
    t: [
      { h: ["Vatarlar teoremasi", "Теорема о хордах"],
        p: ["AB va CD vatarlar E nuqtada kesishsa, AE · EB = CE · ED. Sababi: ACE va DBE uchburchaklar o'xshash — bitta yoyga tiralgan ichki chizilgan burchaklar teng, vertikal burchaklar ham teng.",
          "Если хорды AB и CD пересекаются в точке E, то AE · EB = CE · ED. Причина: треугольники ACE и DBE подобны — вписанные углы, опирающиеся на одну дугу, равны, вертикальные углы тоже."] },
    ],
    f: [{ n: ["Vatarlar", "Хорды"], f: "AE · EB = CE · ED" }],
    s: [
      ["Har bir vatarning ikki bo'lagini ajrating.", "Выделите два отрезка каждой хорды."],
      ["Ko'paytmalarni tenglang va noma'lumni toping.", "Приравняйте произведения и найдите неизвестное."],
    ],
    m: [
      { s: "AE = 4,  EB = 6,  CE = 3", y: ["4 · 6 = 3 · ED", "ED = 24 / 3"], j: "8" },
      { s: "AE = 5,  EB = 8,  CE = 10", y: ["ED = 40 / 10"], j: "4" },
    ],
    x: [
      ["Bo'laklarni qo'shish: AE + EB = CE + ED.", "Складывать отрезки: AE + EB = CE + ED."],
      ["Bitta vatarning bo'lagini ikkinchisiniki bilan juftlash.", "Объединять в пару отрезки разных хорд."],
    ],
  },

  "geometriya9|Urinma va kesuvchi": {
    t: [
      { h: ["Urinma va kesuvchi teoremasi", "Теорема о касательной и секущей"],
        p: ["Aylanadan tashqaridagi M nuqtadan MT urinma va aylanani A, B nuqtalarda kesuvchi o'tkazilgan (A yaqinroq). U holda MT² = MA · MB. Bu yerda MB — butun kesuvchi, MA — uning tashqi qismi. Bitta nuqtadan o'tkazilgan ikki urinma esa teng.",
          "Из точки M вне окружности проведены касательная MT и секущая, пересекающая окружность в A и B (A ближе). Тогда MT² = MA · MB. Здесь MB — вся секущая, MA — её внешняя часть. Две касательные из одной точки равны."] },
    ],
    f: [
      { n: ["Urinma va kesuvchi", "Касательная и секущая"], f: "MT² = MA · MB" },
      { n: ["Ikki kesuvchi", "Две секущие"], f: "MA · MB = MC · MD" },
      { n: ["Ikki urinma", "Две касательные"], f: "MT₁ = MT₂" },
    ],
    s: [
      ["Butun kesuvchini toping: MB = MA + AB.", "Найдите всю секущую: MB = MA + AB."],
      ["MT² = MA · MB dan noma'lumni toping.", "Из MT² = MA · MB найдите неизвестное."],
    ],
    m: [
      { s: "MA = 4,  AB = 5", y: ["MB = 9", "MT² = 4 · 9 = 36"], j: "MT = 6" },
      { s: "MT = 12,  MA = 8", y: ["MB = 144 / 8 = 18", "AB = 18 − 8"], j: "AB = 10" },
    ],
    x: [
      ["MA · AB olish — ichki vatar emas, butun kesuvchi kerak.", "Брать MA · AB — нужна вся секущая, а не хорда."],
      ["MB ni topib, AB ga o'tmaslik.", "Найти MB и не перейти к AB."],
    ],
  },

  "geometriya9|Trapetsiya va aylana": {
    t: [
      { h: ["Ichki aylana chizilgan to'rtburchak", "Описанный четырёхугольник"],
        p: ["To'rtburchakka aylana ichki chizilishi uchun qarama-qarshi tomonlar yig'indilari teng bo'lishi kerak: AB + CD = BC + AD. Sababi — bitta uchdan o'tkazilgan ikki urinma kesmasi teng. Trapetsiyada bu asoslar yig'indisi yon tomonlar yig'indisiga teng degani.",
          "В четырёхугольник можно вписать окружность, только если суммы противоположных сторон равны: AB + CD = BC + AD. Причина — отрезки касательных из одной вершины равны. Для трапеции это значит: сумма оснований равна сумме боковых сторон."] },
      { h: ["Teng yonli trapetsiya", "Равнобедренная трапеция"],
        p: ["Asoslari a va b bo'lgan teng yonli trapetsiyaga aylana ichki chizilsa, yon tomon c = (a + b)/2. Balandlik tushirsak, h² = c² − ((b − a)/2)² = ab, ya'ni h = √(ab). Balandlik — aylana diametri, r = h/2. Tashqi aylana esa faqat teng yonli trapetsiyaga chiziladi.",
          "Если в равнобедренную трапецию с основаниями a и b вписана окружность, боковая сторона c = (a + b)/2. Опустив высоту: h² = c² − ((b − a)/2)² = ab, то есть h = √(ab). Высота — диаметр окружности, r = h/2. Описать окружность можно только около равнобедренной трапеции."] },
    ],
    f: [
      { n: ["Ichki aylana sharti", "Условие вписанной окружности"], f: "a + b = c + d" },
      { n: ["Yon tomon", "Боковая сторона"], f: "c = (a + b) / 2" },
      { n: ["Balandlik va radius", "Высота и радиус"], f: "h = 2r = √(ab)" },
    ],
    s: [
      ["Qarama-qarshi tomonlar yig'indilarini tenglang.", "Приравняйте суммы противоположных сторон."],
      ["Teng yonli trapetsiyada h = √(ab), r = h/2.", "В равнобедренной трапеции h = √(ab), r = h/2."],
    ],
    m: [
      { s: ["Asoslar 2 va 8. Yon tomon va r?", "Основания 2 и 8. Боковая сторона и r?"], y: ["c = (2 + 8) / 2 = 5", "h = √16 = 4"], j: "c = 5,  r = 2" },
      { s: ["AB = 7, BC = 9, CD = 10. AD = ?", "AB = 7, BC = 9, CD = 10. AD = ?"], y: ["AB + CD = BC + AD", "AD = 17 − 9"], j: "8" },
    ],
    x: [
      ["Radius o'rniga balandlikni yozish.", "Записывать высоту вместо радиуса."],
      ["Qo'shni tomonlarni juftlash: AB + BC = CD + AD.", "Объединять соседние стороны: AB + BC = CD + AD."],
    ],
  },

  "geometriya9|Aylana tenglamasi": {
    t: [
      { h: ["Aylana — teng masofadagi nuqtalar", "Окружность — точки на равном расстоянии"],
        p: ["Markazi M(a; b), radiusi R bo'lgan aylananing har bir (x; y) nuqtasi M dan R masofada: (x − a)² + (y − b)² = R². Tenglama ochilgan ko'rinishda (x² + y² + Dx + Ey + F = 0) berilsa, x va y bo'yicha to'liq kvadrat ajratib, yana shu ko'rinishga keltiramiz.",
          "Каждая точка (x; y) окружности с центром M(a; b) и радиусом R находится на расстоянии R от M: (x − a)² + (y − b)² = R². Если уравнение дано в раскрытом виде (x² + y² + Dx + Ey + F = 0), выделяем полные квадраты по x и по y и приводим к этому виду."] },
    ],
    f: [
      { n: ["Kanonik ko'rinish", "Каноническое уравнение"], f: "(x − a)² + (y − b)² = R²" },
      { n: ["To'liq kvadrat", "Полный квадрат"], f: "x² − 4x = (x − 2)² − 4" },
      { n: ["Umumiy ko'rinishdan", "Из общего вида"], f: "R² = (D/2)² + (E/2)² − F" },
    ],
    s: [
      ["x li hadlarni va y li hadlarni guruhlang.", "Сгруппируйте члены с x и с y."],
      ["Har biridan to'liq kvadrat ajrating, ortiqcha sonni o'ngga o'tkazing.", "Выделите полные квадраты, лишнее число перенесите вправо."],
      ["Markaz — qavs ichidagi sonlar teskari ishora bilan, R — o'ng tomonning ildizi.", "Центр — числа в скобках с обратным знаком, R — корень из правой части."],
    ],
    m: [
      { s: "(x − 2)² + (y + 3)² = 25", y: ["a = 2,  b = −3", "R = √25"], j: "M(2; −3),  R = 5" },
      { s: "x² + y² − 4x + 6y − 12 = 0", y: ["(x − 2)² − 4 + (y + 3)² − 9 − 12 = 0", "(x − 2)² + (y + 3)² = 25"], j: "R = 5" },
    ],
    x: [
      ["Markaz ishorasini qavsdagidek qoldirish: (x + 3)² → a = −3, 3 emas.", "Оставлять знак как в скобке: (x + 3)² → a = −3, а не 3."],
      ["R² ni radius deb yozish.", "Записывать R² как радиус."],
      ["To'liq kvadrat ajratganda qo'shilgan sonni o'ng tomonga o'tkazmaslik.", "Не переносить вправо число, добавленное при выделении квадрата."],
    ],
  },
};
