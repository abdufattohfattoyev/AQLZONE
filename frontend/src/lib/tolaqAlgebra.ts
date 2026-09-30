/**
 * TO'LIQ DARSLAR — algebra (8–10-sinf). Tuzilishi `tolaqGeometriya.ts` dagidek.
 * Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_ALGEBRA: Record<string, Tolaq> = {
  "Diskriminant": {
    t: [
      { h: ["Kvadrat tenglama", "Квадратное уравнение"],
        p: ["ax² + bx + c = 0 (a ≠ 0). Ildizlar soni diskriminantga bog'liq: D = b² − 4ac. D musbat — ikki ildiz, D nol — bitta ildiz, D manfiy — haqiqiy ildiz yo'q.",
          "ax² + bx + c = 0 (a ≠ 0). Число корней определяет дискриминант D = b² − 4ac. D > 0 — два корня, D = 0 — один, D < 0 — действительных корней нет."] },
    ],
    f: [
      { n: ["Diskriminant", "Дискриминант"], f: "D = b² − 4ac" },
      { n: ["D > 0", "D > 0"], f: "x₁,₂ = (−b ± √D) / (2a)" },
      { n: ["D = 0", "D = 0"], f: "x = −b / (2a)" },
    ],
    s: [
      ["Tenglamani ax² + bx + c = 0 ko'rinishiga keltiring va a, b, c ni ISHORASI bilan yozing.", "Приведите к виду ax² + bx + c = 0 и выпишите a, b, c С ЗНАКАМИ."],
      ["D = b² − 4ac ni hisoblang.", "Вычислите D = b² − 4ac."],
      ["D ning ishorasiga qarab ildizlar sonini ayting, so'ng formulaga qo'ying.", "По знаку D определите число корней и подставьте в формулу."],
    ],
    m: [
      { s: ["x² − 5x + 6 = 0 ni yeching.", "Решите x² − 5x + 6 = 0."],
        y: ["a = 1, b = −5, c = 6", "D = 25 − 24 = 1", "x = (5 ± 1) / 2"], j: "x = 3,  x = 2" },
      { s: ["2x² + 3x + 5 = 0 nechta ildizga ega?", "Сколько корней у 2x² + 3x + 5 = 0?"],
        y: ["D = 9 − 4 · 2 · 5 = 9 − 40 = −31 < 0"], j: "Ildiz yo'q" },
      { s: ["x² + px + 9 = 0 tenglama bitta ildizga ega bo'ladigan p ni toping.", "При каком p уравнение x² + px + 9 = 0 имеет один корень?"],
        y: ["Bitta ildiz  ⇔  D = 0", "D = p² − 36 = 0"], j: "p = 6  yoki  p = −6" },
    ],
    x: [
      ["b manfiy bo'lganda −b ni −(−5) = 5 deb olmaslik.", "Ошибка со знаком: −b при b = −5 равно 5."],
      ["c manfiy bo'lsa −4ac musbat bo'ladi: x² − 3x − 4 da D = 9 + 16.", "Если c < 0, то −4ac положительно: для x² − 3x − 4 D = 9 + 16."],
      ["Ildizni √D ga bo'lib, 2a ga bo'lishni unutish.", "Забывать делить весь числитель на 2a."],
    ],
  },

  "Viyet teoremasi": {
    t: [
      { h: ["Ildizlar va koeffitsiyentlar", "Корни и коэффициенты"],
        p: ["Ildizlarni topmasdan ham ularning yig'indisi va ko'paytmasini bilish mumkin. Bu bir nechta masalani juda qisqa yechadi: ildizlarning kvadratlari yig'indisi, teskarilari yig'indisi, berilgan ildizli tenglama tuzish.",
          "Не находя корни, можно узнать их сумму и произведение. Это сильно сокращает решение: сумма квадратов корней, сумма обратных, составление уравнения по корням."] },
    ],
    f: [
      { n: ["ax² + bx + c = 0", "ax² + bx + c = 0"], f: "x₁ + x₂ = −b / a,   x₁ · x₂ = c / a" },
      { n: ["Keltirilgan x² + px + q = 0", "Приведённое x² + px + q = 0"], f: "x₁ + x₂ = −p,   x₁ · x₂ = q" },
      { n: ["Kvadratlar yig'indisi", "Сумма квадратов"], f: "x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂" },
      { n: ["Teskarilar yig'indisi", "Сумма обратных"], f: "1/x₁ + 1/x₂ = (x₁ + x₂) / (x₁x₂)" },
    ],
    s: [
      ["a, b, c ni ishorasi bilan yozing va D ≥ 0 ekanini tekshiring.", "Выпишите a, b, c со знаками и проверьте, что D ≥ 0."],
      ["Yig'indi −b/a va ko'paytma c/a ni hisoblang.", "Найдите сумму −b/a и произведение c/a."],
      ["So'ralgan ifodani shu ikkitasi orqali ifodalang (kvadratlar yig'indisi, teskarilar…).", "Выразите нужное через эти две величины (сумма квадратов, обратных…)."],
    ],
    m: [
      { s: ["2x² − 5x − 3 = 0 ning ildizlari x₁, x₂. 1/x₁ + 1/x₂ ni toping.", "Корни 2x² − 5x − 3 = 0 — x₁, x₂. Найдите 1/x₁ + 1/x₂."],
        y: ["x₁ + x₂ = 5/2,   x₁x₂ = −3/2", "1/x₁ + 1/x₂ = (5/2) / (−3/2)"], j: "−5/3" },
      { s: ["x² − 4x + 1 = 0 ning ildizlari kvadratlari yig'indisini toping.", "Найдите сумму квадратов корней x² − 4x + 1 = 0."],
        y: ["x₁ + x₂ = 4,   x₁x₂ = 1", "x₁² + x₂² = 4² − 2 · 1 = 16 − 2"], j: "14" },
      { s: ["Ildizlari 3 va −2 bo'lgan keltirilgan tenglamani tuzing.", "Составьте приведённое уравнение с корнями 3 и −2."],
        y: ["p = −(3 + (−2)) = −1,   q = 3 · (−2) = −6"], j: "x² − x − 6 = 0" },
    ],
    x: [
      ["Yig'indini b/a deb olish — minus bilan: −b/a.", "Брать сумму как b/a — нужно −b/a."],
      ["a ≠ 1 bo'lganda c va b ni a ga bo'lishni unutish.", "При a ≠ 1 забывать делить на a."],
      ["D < 0 bo'lsa haqiqiy ildiz yo'q — Viyetni qo'llab bo'lmaydi.", "При D < 0 действительных корней нет — Виета применять нельзя."],
    ],
  },

  "Bikvadrat tenglama": {
    t: [
      { h: ["Almashtirish usuli", "Метод замены"],
        p: ["ax⁴ + bx² + c = 0 ko'rinishida faqat juft darajalar bor. t = x² almashtirish uni kvadrat tenglamaga aylantiradi. t = x² ≥ 0 bo'lgani uchun manfiy t ildizlari tashlanadi.",
          "В уравнении ax⁴ + bx² + c = 0 только чётные степени. Замена t = x² превращает его в квадратное. Так как t = x² ≥ 0, отрицательные корни t отбрасываются."] },
    ],
    f: [
      { n: ["Almashtirish", "Замена"], f: "t = x²,   t ≥ 0" },
      { n: ["Qaytish", "Возврат"], f: "x = ±√t" },
    ],
    s: [
      ["t = x² deb almashtiring.", "Сделайте замену t = x²."],
      ["at² + bt + c = 0 ni yeching.", "Решите at² + bt + c = 0."],
      ["Faqat t ≥ 0 larni qoldiring; har biridan x = ±√t oling.", "Оставьте только t ≥ 0; для каждого возьмите x = ±√t."],
    ],
    m: [
      { s: ["x⁴ − 5x² + 4 = 0 ni yeching.", "Решите x⁴ − 5x² + 4 = 0."],
        y: ["t = x²:  t² − 5t + 4 = 0  →  t = 1  yoki  t = 4", "x² = 1 → x = ±1;   x² = 4 → x = ±2"], j: "±1,  ±2" },
      { s: ["x⁴ + x² − 12 = 0 ni yeching.", "Решите x⁴ + x² − 12 = 0."],
        y: ["t² + t − 12 = 0  →  t = 3  yoki  t = −4", "t = −4 < 0 — tashlanadi", "x² = 3"], j: "x = ±√3" },
    ],
    x: [
      ["Manfiy t ni tashlamay, x = √(−4) yozish.", "Не отбросить отрицательное t и писать x = √(−4)."],
      ["t topilgach to'xtab qolish — x ni topish kerak, har bir t dan ikkita x.", "Остановиться на t — нужно найти x, из каждого t по два значения."],
    ],
  },

  "Asosiy trigonometrik ayniyat": {
    t: [
      { h: ["Ayniyat", "Тождество"],
        p: ["Birlik aylanada nuqta koordinatalari (cos α; sin α) va Pifagor teoremasi sin²α + cos²α = 1 ni beradi. Bu ayniyat har qanday α da to'g'ri. Undan bittasi ma'lum bo'lsa boshqasini topamiz, faqat ISHORANI chorak belgilaydi.",
          "Координаты точки единичной окружности (cos α; sin α) и теорема Пифагора дают sin²α + cos²α = 1 при любом α. Зная одно значение, находим другое, а ЗНАК определяет четверть."] },
      { h: ["Choraklar bo'yicha ishoralar", "Знаки по четвертям"],
        p: ["I chorak: hammasi +. II: faqat sin +. III: faqat tg va ctg +. IV: faqat cos +.",
          "I четверть: все +. II: только sin +. III: только tg и ctg +. IV: только cos +."] },
    ],
    f: [
      { n: ["Asosiy ayniyat", "Основное тождество"], f: "sin²α + cos²α = 1" },
      { n: ["Tangens", "Тангенс"], f: "tg α = sin α / cos α" },
      { n: ["Hosilaviy", "Следствие"], f: "1 + tg²α = 1 / cos²α" },
      { n: ["To'rtinchi daraja", "Четвёртая степень"], f: "sin⁴α + cos⁴α = 1 − 2sin²α·cos²α" },
    ],
    s: [
      ["Ma'lum qiymatni ayniyatga qo'yib, ikkinchisining KVADRATINI toping.", "Подставьте известное значение и найдите КВАДРАТ второго."],
      ["Ildiz oling va ishorani chorakka qarab tanlang.", "Извлеките корень, знак выберите по четверти."],
      ["Ifodani soddalashtirishda 1 − sin² = cos² almashtirishidan foydalaning.", "При упрощении используйте 1 − sin² = cos²."],
    ],
    m: [
      { s: ["sin α = 3/5, α — o'tkir. cos α ni toping.", "sin α = 3/5, α — острый. Найдите cos α."],
        y: ["cos²α = 1 − 9/25 = 16/25", "I chorakda cos > 0"], j: "4/5" },
      { s: ["cos α = −5/13, α — II chorakda. tg α ni toping.", "cos α = −5/13, α во II четверти. Найдите tg α."],
        y: ["sin²α = 1 − 25/169 = 144/169", "II chorakda sin > 0:  sin α = 12/13", "tg α = (12/13) / (−5/13)"], j: "−12/5" },
      { s: ["sin⁴α + cos⁴α ni sin 2α orqali yozing.", "Выразите sin⁴α + cos⁴α через sin 2α."],
        y: ["= (sin²α + cos²α)² − 2sin²α·cos²α = 1 − 2sin²α·cos²α",
          "sin α·cos α = ½ sin 2α  →  2sin²α·cos²α = ½ sin² 2α"], j: "1 − ½ sin² 2α" },
    ],
    x: [
      ["Ildiz olganda ishorani chorakka qaramay doim + olish.", "Брать корень всегда со знаком + без учёта четверти."],
      ["sin²α ni sin(α²) deb o'qish — bu (sin α)².", "Читать sin²α как sin(α²) — это (sin α)²."],
    ],
  },

  "Ikkilangan burchak": {
    t: [
      { h: ["Formulalar", "Формулы"],
        p: ["Ikkilangan burchak formulalari qo'shish formulalarining α = β holidir. cos 2α uchta ko'rinishga ega — masalaga qulayini tanlang. Ular darajani pasaytirishda ham ishlatiladi.",
          "Формулы двойного угла — частный случай формул сложения при α = β. У cos 2α три вида — выбирайте удобный. Они же понижают степень."] },
    ],
    f: [
      { n: ["Sinus", "Синус"], f: "sin 2α = 2 sin α · cos α" },
      { n: ["Kosinus", "Косинус"], f: "cos 2α = cos²α − sin²α = 2cos²α − 1 = 1 − 2sin²α" },
      { n: ["Tangens", "Тангенс"], f: "tg 2α = 2tg α / (1 − tg²α)" },
      { n: ["Darajani pasaytirish", "Понижение степени"], f: "sin²α = (1 − cos 2α)/2,   cos²α = (1 + cos 2α)/2" },
    ],
    s: [
      ["Ifodada 2α yoki α² ko'rinsa — ikkilangan burchak formulasini eslang.", "Видите 2α или α² — вспомните формулу двойного угла."],
      ["Ma'lum funksiya bo'yicha mos ko'rinishni tanlang (faqat sin berilsa — 1 − 2sin²α).", "Выберите вид по известной функции (дан только sin — берите 1 − 2sin²α)."],
    ],
    m: [
      { s: ["sin α = 3/5 (o'tkir). sin 2α va cos 2α ni toping.", "sin α = 3/5 (острый). Найдите sin 2α и cos 2α."],
        y: ["cos α = 4/5", "sin 2α = 2 · 3/5 · 4/5 = 24/25", "cos 2α = 1 − 2 · 9/25 = 7/25"], j: "24/25;  7/25" },
      { s: ["sin 15° · cos 15° ni hisoblang.", "Вычислите sin 15° · cos 15°."],
        y: ["sin α cos α = ½ sin 2α", "= ½ sin 30° = ½ · ½"], j: "1/4" },
    ],
    x: [
      ["sin 2α = 2 sin α deb yozish (cos α ko'paytuvchisi tushib qoladi).", "Писать sin 2α = 2 sin α (теряется множитель cos α)."],
      ["cos 2α = 2cos α deb olish — noto'g'ri.", "Считать cos 2α = 2cos α — неверно."],
    ],
  },

  "Arifmetik progressiya hadi": {
    t: [
      { h: ["Arifmetik progressiya", "Арифметическая прогрессия"],
        p: ["Har bir had oldingisiga bir xil son d (ayirma) qo'shib hosil bo'ladi. d > 0 — o'sadi, d < 0 — kamayadi. Har bir had o'zining ikki qo'shnisining o'rta arifmetigi. Hadlar raqamlari yig'indisi teng bo'lsa, hadlar yig'indisi ham teng: aₘ + aₖ = aₚ + a_q (m + k = p + q).",
          "Каждый член получается прибавлением одного и того же числа d (разности). d > 0 — растёт, d < 0 — убывает. Каждый член — среднее арифметическое соседних. Если сумма номеров равна, равна и сумма членов: aₘ + aₖ = aₚ + a_q (m + k = p + q)."] },
    ],
    f: [
      { n: ["n-had", "n-й член"], f: "aₙ = a₁ + (n − 1) · d" },
      { n: ["Ayirma", "Разность"], f: "d = a₂ − a₁ = aₙ₊₁ − aₙ" },
      { n: ["Xossa", "Свойство"], f: "aₙ = (aₙ₋₁ + aₙ₊₁) / 2" },
      { n: ["Indeks yig'indisi", "Сумма индексов"], f: "m + k = p + q  ⇒  aₘ + aₖ = aₚ + a_q" },
    ],
    s: [
      ["a₁ va d ni toping (yoki berilganlardan tenglama tuzing).", "Найдите a₁ и d (или составьте уравнения по данным)."],
      ["aₙ = a₁ + (n − 1)d ga qo'ying. Diqqat: (n − 1), n emas.", "Подставьте в aₙ = a₁ + (n − 1)d. Внимание: (n − 1), а не n."],
      ["Raqam yig'indisi teng bo'lsa, hadlarni to'g'ridan-to'g'ri qo'shib qisqa yo'l toping.", "Если суммы номеров равны, используйте свойство — это короче."],
    ],
    m: [
      { s: ["a₁ = 5, d = 3. a₁₀ ni toping.", "a₁ = 5, d = 3. Найдите a₁₀."],
        y: ["a₁₀ = 5 + (10 − 1) · 3 = 5 + 27"], j: "32" },
      { s: ["2, 5, 8, … progressiyaning qaysi hadi 50 ga teng?", "Какой член прогрессии 2, 5, 8, … равен 50?"],
        y: ["d = 3;  2 + (n − 1) · 3 = 50", "(n − 1) · 3 = 48  →  n − 1 = 16"], j: "n = 17" },
      { s: ["a₁₀ + a₁₂ = 25 va a₂₀ + a₂₂ = 45 bo'lsa, a₁₁ + a₂₁ ni toping.", "Если a₁₀ + a₁₂ = 25 и a₂₀ + a₂₂ = 45, найдите a₁₁ + a₂₁."],
        y: ["10 + 12 = 11 + 11  →  a₁₀ + a₁₂ = 2a₁₁ = 25", "20 + 22 = 21 + 21  →  2a₂₁ = 45", "a₁₁ + a₂₁ = (25 + 45) / 2"], j: "35" },
    ],
    x: [
      ["aₙ = a₁ + nd deb yozish — to'g'risi (n − 1)d.", "Писать aₙ = a₁ + nd — верно (n − 1)d."],
      ["Kamayuvchi progressiyada d ning minusini tushirib qoldirish.", "Терять минус у d в убывающей прогрессии."],
    ],
  },

  "Arifmetik progressiya yig'indisi": {
    t: [
      { h: ["Yig'indi formulasi", "Формула суммы"],
        p: ["Birinchi n ta had yig'indisi — birinchi va oxirgi hadning o'rta arifmetigini hadlar soniga ko'paytirish. Gauss 1 + 2 + … + 100 ni shunday topgan: 100 ta juftlik, har biri 101 → 5050.",
          "Сумма первых n членов — среднее первого и последнего, умноженное на число членов. Так Гаусс нашёл 1 + 2 + … + 100: 50 пар по 101 → 5050."] },
    ],
    f: [
      { n: ["Birinchi ko'rinish", "Первый вид"], f: "Sₙ = (a₁ + aₙ) / 2 · n" },
      { n: ["Ikkinchi ko'rinish", "Второй вид"], f: "Sₙ = (2a₁ + (n − 1)d) / 2 · n" },
      { n: ["Natural sonlar yig'indisi", "Сумма натуральных"], f: "1 + 2 + … + n = n(n + 1) / 2" },
    ],
    s: [
      ["Oxirgi had ma'lummi? Ha — birinchi ko'rinish; yo'q — ikkinchi (d bilan).", "Известен последний член? Да — первый вид; нет — второй (с d)."],
      ["Sonlarni qo'ying, avval qavs ichini, keyin ko'paytirishni bajaring.", "Подставьте числа: сначала скобки, потом умножение."],
    ],
    m: [
      { s: ["1 + 2 + … + 100 ni toping.", "Найдите 1 + 2 + … + 100."],
        y: ["S₁₀₀ = 100 · 101 / 2"], j: "5050" },
      { s: ["a₁ = 4, d = 3. Dastlabki 10 had yig'indisini toping.", "a₁ = 4, d = 3. Найдите сумму первых 10 членов."],
        y: ["S₁₀ = (2 · 4 + 9 · 3) / 2 · 10 = (8 + 27) · 5"], j: "175" },
      { s: ["a₁ = −3, d = 2. S₂₀ ni toping.", "a₁ = −3, d = 2. Найдите S₂₀."],
        y: ["S₂₀ = (2 · (−3) + 19 · 2) / 2 · 20 = (−6 + 38) · 10"], j: "320" },
    ],
    x: [
      ["Yig'indini (a₁ + aₙ) · n deb 2 ga bo'lishni unutish.", "Забыть делить на 2: (a₁ + aₙ)/2 · n."],
      ["Ikkinchi ko'rinishda n − 1 o'rniga n qo'yish.", "Во втором виде подставлять n вместо n − 1."],
    ],
  },

  "Geometrik progressiya hadi": {
    t: [
      { h: ["Geometrik progressiya", "Геометрическая прогрессия"],
        p: ["Har bir had oldingisini bir xil q songa (maxraj) ko'paytirib hosil bo'ladi. q > 1 — o'sadi, 0 < q < 1 — kamayadi, q < 0 — ishoralar almashadi. Har bir hadning kvadrati qo'shnilari ko'paytmasiga teng.",
          "Каждый член получается умножением предыдущего на q (знаменатель). q > 1 — растёт, 0 < q < 1 — убывает, q < 0 — знаки чередуются. Квадрат члена равен произведению соседних."] },
    ],
    f: [
      { n: ["n-had", "n-й член"], f: "bₙ = b₁ · qⁿ⁻¹" },
      { n: ["Maxraj", "Знаменатель"], f: "q = b₂ / b₁ = bₙ₊₁ / bₙ" },
      { n: ["Xossa", "Свойство"], f: "bₙ² = bₙ₋₁ · bₙ₊₁" },
    ],
    s: [
      ["q ni ikki qo'shni haddan toping (kattasini kichigiga bo'ling).", "Найдите q как отношение соседних членов."],
      ["bₙ = b₁ · qⁿ⁻¹ ga qo'ying — daraja n − 1.", "Подставьте в bₙ = b₁ · qⁿ⁻¹ — показатель n − 1."],
    ],
    m: [
      { s: ["b₁ = 3, q = 2. b₅ ni toping.", "b₁ = 3, q = 2. Найдите b₅."],
        y: ["b₅ = 3 · 2⁴ = 3 · 16"], j: "48" },
      { s: ["2, 6, 18, … progressiyaning b₆ sini toping.", "Найдите b₆ прогрессии 2, 6, 18, …"],
        y: ["q = 6 / 2 = 3", "b₆ = 2 · 3⁵ = 2 · 243"], j: "486" },
      { s: ["x, 6, 24 geometrik progressiya. x ni toping.", "x, 6, 24 — геометрическая прогрессия. Найдите x."],
        y: ["6² = x · 24  →  x = 36 / 24"], j: "1,5" },
    ],
    x: [
      ["b₁ · qⁿ deb yozish — daraja n − 1.", "Писать b₁ · qⁿ — показатель n − 1."],
      ["Maxrajni ayirma bilan adashtirish: q — bo'linma, d emas.", "Путать знаменатель с разностью: q — частное."],
    ],
  },

  "Geometrik progressiya yig'indisi": {
    t: [
      { h: ["Yig'indi", "Сумма"],
        p: ["q ≠ 1 bo'lsa birinchi n had yig'indisi formula bilan topiladi; q = 1 bo'lsa hamma had teng va S = n · b₁. Ikki shart bo'yicha masalada (masalan b₃ va S₃ berilgan) noma'lumlar b₁ va q — ikkita tenglama tuziladi, ko'pincha ikki yechim chiqadi.",
          "При q ≠ 1 сумма первых n членов находится по формуле; при q = 1 все члены равны и S = n · b₁. В задачах с двумя условиями (например, даны b₃ и S₃) неизвестны b₁ и q — составляют два уравнения, часто получается два решения."] },
    ],
    f: [
      { n: ["Yig'indi", "Сумма"], f: "Sₙ = b₁ · (qⁿ − 1) / (q − 1)" },
      { n: ["q < 1 bo'lsa qulay", "Удобно при q < 1"], f: "Sₙ = b₁ · (1 − qⁿ) / (1 − q)" },
      { n: ["Uch had", "Три члена"], f: "S₃ = b₁(1 + q + q²)" },
    ],
    s: [
      ["b₁ va q ni aniqlang; kerak bo'lsa ikki tenglama tuzing.", "Найдите b₁ и q; при необходимости составьте два уравнения."],
      ["Formulaga qo'ying; q = 1 alohida holat ekanini unutmang.", "Подставьте в формулу; помните, что q = 1 — отдельный случай."],
    ],
    m: [
      { s: ["b₁ = 1, q = 2. S₈ ni toping.", "b₁ = 1, q = 2. Найдите S₈."],
        y: ["S₈ = 1 · (2⁸ − 1) / (2 − 1) = 256 − 1"], j: "255" },
      { s: ["b₃ = 18 va S₃ = 26 bo'lsa, b₁ ni toping.", "Если b₃ = 18 и S₃ = 26, найдите b₁."],
        y: [["b₁ + b₂ = S₃ − b₃ = 8 va b₁q² = 18, b₁(1 + q) = 8.", "b₁ + b₂ = S₃ − b₃ = 8; b₁q² = 18, b₁(1 + q) = 8."],
          "Bo'lamiz: q² / (1 + q) = 18 / 8  →  4q² − 9q − 9 = 0",
          "q = 3  yoki  q = −3/4",
          "q = 3:  b₁ = 8 / 4 = 2;   q = −3/4:  b₁ = 8 / (1/4) = 32"], j: "2  yoki  32" },
    ],
    x: [
      ["Ikki yechimli tenglamada birini tashlab yuborish — ikkalasi ham tekshirilsin.", "Отбросить одно из двух решений — проверяйте оба."],
      ["qⁿ − 1 o'rniga qⁿ − q yozish.", "Писать qⁿ − q вместо qⁿ − 1."],
    ],
  },

  "Hodisaning ehtimolligi": {
    t: [
      { h: ["Ehtimollik", "Вероятность"],
        p: ["Hodisa ehtimolligi — qulay natijalar sonining barcha teng imkoniyatli natijalar soniga nisbati. U 0 dan 1 gacha. Qarama-qarshi hodisa: P(Ā) = 1 − P(A). Ketma-ket tanlashda (qaytarmasdan) har qadamda jami ham, qulay ham kamayadi.",
          "Вероятность — отношение числа благоприятных исходов к числу всех равновозможных. Она от 0 до 1. Противоположное событие: P(Ā) = 1 − P(A). При последовательном выборе (без возврата) на каждом шаге уменьшаются и все, и благоприятные исходы."] },
    ],
    f: [
      { n: ["Klassik ta'rif", "Классическое определение"], f: "P = m / n" },
      { n: ["Qarama-qarshi", "Противоположное"], f: "P(Ā) = 1 − P(A)" },
      { n: ["Ketma-ket (qaytarmasdan)", "Подряд (без возврата)"], f: "P(A va B) = P(A) · P(B | A)" },
      { n: ["Kombinatsiyalar", "Сочетания"], f: "C(n; k) = n! / (k! · (n − k)!)" },
    ],
    s: [
      ["Barcha natijalar sonini (n) va qulay natijalar sonini (m) toping.", "Найдите число всех исходов (n) и благоприятных (m)."],
      ["«Kamida bitta» so'ralsa — qarama-qarshisini hisoblab 1 dan ayiring.", "Если «хотя бы один» — считайте противоположное и вычтите из 1."],
      ["Ketma-ket olishda har qadamdagi ehtimolni ko'paytiring.", "При последовательных выборах перемножайте вероятности шагов."],
    ],
    m: [
      { s: ["Qopchada 8 moviy va 8 qizil shar. Ketma-ket olingan ikki sharning ikkalasi ham moviy bo'lish ehtimoli?", "В мешке 8 синих и 8 красных шаров. Вероятность, что оба вынутых подряд шара синие?"],
        y: ["Birinchisi moviy: 8/16", "Ikkinchisi moviy (7 ta qoldi, jami 15): 7/15", "8/16 · 7/15 = 56/240"], j: "7/30" },
      { s: ["Kubik tashlanganda juft ochko chiqish ehtimoli?", "Вероятность выпадения чётного числа очков на кубике?"],
        y: ["Juftlar: 2, 4, 6 — m = 3;  n = 6"], j: "1/2" },
      { s: ["10 ta chipta ichida 3 tasi yutuqli. 2 ta olinsa, kamida bittasi yutuqli bo'lish ehtimoli?", "Из 10 билетов 3 выигрышных. Вероятность, что среди двух хотя бы один выигрышный?"],
        y: ["Qarama-qarshi: ikkalasi yutuqsiz", "C(7;2) / C(10;2) = 21 / 45", "1 − 21/45 = 24/45"], j: "8/15" },
    ],
    x: [
      ["Qaytarmasdan olganda maxrajni 15 emas 16 qoldirish.", "Оставить в знаменателе 16 вместо 15 при выборе без возврата."],
      ["Ehtimollikni 1 dan katta chiqarish — bu doim xato belgisi.", "Получить вероятность больше 1 — верный признак ошибки."],
    ],
  },
};
