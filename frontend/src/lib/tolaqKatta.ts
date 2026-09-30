/**
 * TO'LIQ DARSLAR — 10–11-sinf: qolgan algebra, geometriya va matematika darslari.
 * Tuzilishi `tolaqGeometriya.ts` dagidek. Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_KATTA: Record<string, Tolaq> = {
  /* ═══════════════════════ 10-sinf algebra ═══════════════════════ */

  "Kvadrat funksiya va grafigi": {
    t: [
      { h: ["Parabola qanday chiziladi", "Как строить параболу"],
        p: ["y = ax² + bx + c grafigi — parabola. Uni chizish uchun to'rt nuqta yetarli: uchi (−b/2a; f(−b/2a)), Oy bilan kesishish (0; c), nollari (D ≥ 0 bo'lsa) va simmetrik nuqta. Qiymatlar to'plami: a > 0 da [y₀; +∞), a < 0 da (−∞; y₀]. Uchgacha funksiya bir tomonga, undan keyin ikkinchi tomonga monoton.",
          "График y = ax² + bx + c — парабола. Достаточно четырёх точек: вершина (−b/2a; f(−b/2a)), пересечение с Oy (0; c), нули (при D ≥ 0) и симметричная точка. Область значений: [y₀; +∞) при a > 0 и (−∞; y₀] при a < 0. До вершины функция монотонна в одну сторону, после — в другую."] },
    ],
    f: [
      { n: ["Uch", "Вершина"], f: "x₀ = −b/(2a),   y₀ = f(x₀)" },
      { n: ["Uch shakli", "Вершинная форма"], f: "y = a(x − x₀)² + y₀" },
      { n: ["Nollar", "Нули"], f: "x₁,₂ = (−b ± √D) / (2a)" },
    ],
    s: [
      ["a ning ishorasidan tarmoqlar yo'nalishini aniqlang.", "По знаку a определите направление ветвей."],
      ["Uchni, Oy bilan kesishishni va nollarni toping.", "Найдите вершину, пересечение с Oy и нули."],
      ["Nuqtalarni tutashtirib parabolani chizing; qiymatlar to'plamini uchdan o'qing.", "Соедините точки; область значений читайте по вершине."],
    ],
    m: [
      { s: ["y = x² − 6x + 5 ni tekshiring: uch, nollar, Oy, qiymatlar to'plami.", "Исследуйте y = x² − 6x + 5: вершина, нули, Oy, область значений."],
        y: ["x₀ = 3,  y₀ = 9 − 18 + 5 = −4  →  uch (3; −4)", "Nollar: x² − 6x + 5 = 0  →  1 va 5", "Oy: y(0) = 5"], j: "uch (3; −4);  nollar 1, 5;  Oy: 5;  E(y) = [−4; +∞)" },
      { s: ["y = −x² + 4x ning eng katta qiymati?", "Наибольшее значение y = −x² + 4x?"],
        y: ["a < 0 — eng katta qiymat uchda", "x₀ = 2,  y₀ = −4 + 8"], j: "4" },
    ],
    x: [
      ["Qiymatlar to'plamini aniqlanish sohasi bilan aralashtirish.", "Путать область значений с областью определения."],
      ["a < 0 da eng kichik qiymat qidirish (u yo'q).", "Искать наименьшее при a < 0 (его нет)."],
    ],
  },

  "Trigonometrik ayniyatlar": {
    t: [
      { h: ["Asosiy ayniyatlar", "Основные тождества"],
        p: ["Ayniyat — o'zgaruvchining barcha ruxsat etilgan qiymatlarida to'g'ri tenglik. Asosiylari: sin²α + cos²α = 1, tg α · ctg α = 1, 1 + tg²α = 1/cos²α, 1 + ctg²α = 1/sin²α. Ayniyatni isbotlash — bir tomonni ikkinchisiga aylantirish.",
          "Тождество — равенство, верное при всех допустимых значениях переменной. Основные: sin²α + cos²α = 1, tg α · ctg α = 1, 1 + tg²α = 1/cos²α, 1 + ctg²α = 1/sin²α. Доказать тождество — преобразовать одну часть в другую."] },
    ],
    f: [
      { n: ["Asosiy", "Основное"], f: "sin²α + cos²α = 1" },
      { n: ["Tangens–kotangens", "Тангенс–котангенс"], f: "tg α · ctg α = 1" },
      { n: ["Hosilaviy", "Следствия"], f: "1 + tg²α = 1/cos²α,   1 + ctg²α = 1/sin²α" },
    ],
    s: [
      ["Hammasini sin va cos orqali yozing.", "Выразите всё через sin и cos."],
      ["Umumiy maxrajga keltiring.", "Приведите к общему знаменателю."],
      ["sin² + cos² = 1 ni qo'llab soddalashtiring.", "Примените sin² + cos² = 1 и упростите."],
    ],
    m: [
      { s: ["sin α/(1 + cos α) + (1 + cos α)/sin α = 2/sin α ni isbotlang.", "Докажите sin α/(1 + cos α) + (1 + cos α)/sin α = 2/sin α."],
        y: ["Umumiy maxraj: (sin²α + (1 + cos α)²) / (sin α (1 + cos α))", "Suratda: sin²α + 1 + 2cos α + cos²α = 2 + 2cos α = 2(1 + cos α)", "(1 + cos α) qisqaradi"], j: "2 / sin α" },
      { s: ["(sin α + cos α)² − 2 sin α cos α ni soddalashtiring.", "Упростите (sin α + cos α)² − 2 sin α cos α."],
        y: ["sin²α + 2 sin α cos α + cos²α − 2 sin α cos α"], j: "1" },
      { s: ["tg α · cos α ni soddalashtiring.", "Упростите tg α · cos α."],
        y: ["(sin α / cos α) · cos α"], j: "sin α" },
    ],
    x: [
      ["Isbotda ikkala tomonni birdan o'zgartirish: bir tomonni o'zgartiring.", "Преобразовывать обе части сразу вместо одной."],
      ["Maxrajni nolga aylantiradigan burchaklarni e'tiborsiz qoldirish.", "Забыть про углы, обращающие знаменатель в нуль."],
    ],
  },

  "Arifmetik va geometrik progressiyalar": {
    t: [
      { h: ["Ikki progressiya", "Две прогрессии"],
        p: ["Arifmetik: qo'shish (d), aₙ = a₁ + (n − 1)d, Sₙ = (a₁ + aₙ)/2 · n. Geometrik: ko'paytirish (q), bₙ = b₁ qⁿ⁻¹, Sₙ = b₁(qⁿ − 1)/(q − 1). Aralash masalada uchta sonning o'rtasini a, ayirmani d deb: a − d, a, a + d.",
          "Арифметическая: сложение (d), aₙ = a₁ + (n − 1)d, Sₙ = (a₁ + aₙ)/2 · n. Геометрическая: умножение (q), bₙ = b₁ qⁿ⁻¹, Sₙ = b₁(qⁿ − 1)/(q − 1). В смешанной задаче три числа берут как a − d, a, a + d."] },
    ],
    f: [
      { n: ["Arifmetik", "Арифметическая"], f: "aₙ = a₁ + (n − 1)d,   Sₙ = (2a₁ + (n − 1)d)/2 · n" },
      { n: ["Geometrik", "Геометрическая"], f: "bₙ = b₁ · qⁿ⁻¹,   Sₙ = b₁ (qⁿ − 1)/(q − 1)" },
      { n: ["Uch had", "Три члена"], f: "a − d,  a,  a + d   (yig'indi 3a)" },
    ],
    s: [
      ["Progressiya turini aniqlang (ayirma yoki nisbat).", "Определите вид (разность или отношение)."],
      ["Ikki berilgandan b₁ (a₁) va q (d) ni toping.", "По двум данным найдите b₁ (a₁) и q (d)."],
      ["Formulaga qo'yib so'ralganni toping.", "Подставьте и найдите нужное."],
    ],
    m: [
      { s: ["a₂ = 5, a₆ = 13. a₁, d va S₁₀?", "a₂ = 5, a₆ = 13. Найдите a₁, d и S₁₀."],
        y: ["4d = 13 − 5 = 8  →  d = 2,  a₁ = 3", "a₁₀ = 3 + 18 = 21", "S₁₀ = (3 + 21)/2 · 10"], j: "a₁ = 3, d = 2, S₁₀ = 120" },
      { s: ["b₂ = 6, b₅ = 48. b₁, q va S₄?", "b₂ = 6, b₅ = 48. Найдите b₁, q и S₄."],
        y: ["q³ = 48 / 6 = 8  →  q = 2,  b₁ = 3", "S₄ = 3 · (16 − 1) / 1"], j: "b₁ = 3, q = 2, S₄ = 45" },
      { s: ["Arifmetik progressiyaning uch hadi yig'indisi 15. Ularga mos ravishda 1, 3, 9 qo'shilsa geometrik progressiya chiqadi. Sonlarni toping.", "Три члена арифметической прогрессии в сумме 15. Если прибавить 1, 3, 9, получится геометрическая. Найдите числа."],
        y: ["Sonlar 5 − d, 5, 5 + d", "6 − d,  8,  14 + d — geometrik: 8² = (6 − d)(14 + d)", "84 − 8d − d² = 64  →  d² + 8d − 20 = 0  →  d = 2  yoki  d = −10"], j: "3, 5, 7  yoki  15, 5, −5" },
    ],
    x: [
      ["n − 1 o'rniga n qo'yish.", "Подставлять n вместо n − 1."],
      ["Geometrik progressiyada q = 1 holini alohida qaramaslik.", "Не выделять случай q = 1."],
    ],
  },

  "Teskari funksiya": {
    t: [
      { h: ["Teskari funksiya", "Обратная функция"],
        p: ["Har bir qiymatni bir marta qabul qiluvchi (monoton) f funksiya uchun x ni y orqali ifodalab, teskari g funksiyani topamiz. Grafiklari y = x to'g'ri chizig'iga nisbatan SIMMETRIK; aniqlanish sohasi va qiymatlar to'plami o'rin almashadi. f(g(x)) = x.",
          "Для монотонной f (каждое значение принимается один раз) выражаем x через y — получаем обратную g. Графики симметричны относительно y = x; область определения и область значений меняются местами. f(g(x)) = x."] },
    ],
    f: [
      { n: ["Sohalar", "Области"], f: "D(g) = E(f),   E(g) = D(f)" },
      { n: ["Simmetriya", "Симметрия"], f: "grafiklar y = x ga nisbatan simmetrik" },
    ],
    s: [
      ["Funksiya monotonligini tekshiring (teskarisi bormi?).", "Проверьте монотонность (есть ли обратная)."],
      ["y = f(x) dan x ni y orqali ifodalang.", "Из y = f(x) выразите x через y."],
      ["x va y ni almashtirib yozing.", "Поменяйте обозначения x и y."],
    ],
    m: [
      { s: ["y = 2x + 3 ning teskarisini toping.", "Найдите обратную к y = 2x + 3."],
        y: ["x = (y − 3)/2", "x va y ni almashtiramiz"], j: "y = (x − 3)/2" },
      { s: ["y = x² (x ≥ 0) ning teskarisi?", "Обратная к y = x² (x ≥ 0)?"],
        y: ["x = √y (x ≥ 0 bo'lgani uchun)"], j: "y = √x" },
      { s: ["y = (x + 1)/(x − 2) ning teskarisi?", "Обратная к y = (x + 1)/(x − 2)?"],
        y: ["y(x − 2) = x + 1  →  xy − 2y = x + 1  →  x(y − 1) = 2y + 1", "x = (2y + 1)/(y − 1)"], j: "y = (2x + 1)/(x − 1)" },
    ],
    x: [
      ["Monoton bo'lmagan funksiyaga (y = x² barcha x da) teskari izlash.", "Искать обратную у немонотонной функции (y = x² на всей оси)."],
      ["Teskari funksiyani 1/f(x) bilan aralashtirish.", "Путать обратную функцию с 1/f(x)."],
    ],
  },

  "Davriy funksiyalar": {
    t: [
      { h: ["Davr", "Период"],
        p: ["f(x + T) = f(x) bo'lgan eng kichik musbat T — funksiya davri. sin va cos uchun 2π, tg va ctg uchun π. Argument k ga ko'paytirilsa davr |k| marta kichrayadi: sin kx, cos kx davri 2π/|k|; tg kx davri π/|k|. Modul davrni yarmiga tushirishi mumkin: |sin x| davri π.",
          "Наименьшее T > 0, для которого f(x + T) = f(x), — период. У sin и cos — 2π, у tg и ctg — π. При множителе k у аргумента период делится на |k|: у sin kx, cos kx — 2π/|k|; у tg kx — π/|k|. Модуль может уменьшить период вдвое: у |sin x| период π."] },
    ],
    f: [
      { n: ["Sinus/kosinus", "Синус/косинус"], f: "T = 2π / |k|  (sin kx, cos kx)" },
      { n: ["Tangens", "Тангенс"], f: "T = π / |k|  (tg kx, ctg kx)" },
    ],
    s: [
      ["Funksiya turini aniqlang (sin, cos, tg).", "Определите вид функции (sin, cos, tg)."],
      ["k ni toping va mos formulani qo'ying.", "Найдите k и подставьте в формулу."],
    ],
    m: [
      { s: ["y = sin 3x davri?", "Период y = sin 3x?"],
        y: ["2π / 3"], j: "2π/3" },
      { s: ["y = cos(x/2) davri?", "Период y = cos(x/2)?"],
        y: ["k = 1/2:  2π / (1/2)"], j: "4π" },
      { s: ["y = tg 2x davri?", "Период y = tg 2x?"],
        y: ["π / 2"], j: "π/2" },
    ],
    x: [
      ["tg kx davrini 2π/k deb olish (π/k).", "Считать период tg kx равным 2π/k (верно π/k)."],
      ["Davrni k ga ko'paytirish (bo'lish kerak).", "Умножать период на k вместо деления."],
    ],
  },

  "Ratsional tenglamalar": {
    t: [
      { h: ["Kasrli tenglama", "Дробно-рациональное уравнение"],
        p: ["Noma'lum maxrajda bo'lgan tenglama. Yechish: aniqlanish sohasini (maxraj ≠ 0) yozamiz, umumiy maxrajga keltirib, suratni nolga tenglaymiz, topilgan ildizlarni aniqlanish sohasiga tekshiramiz — maxrajni nolga aylantirganlari BEGONA ildiz. Murakkab holda almashtirish (t = x/3 − 4/x kabi) qulay.",
          "Уравнение с неизвестным в знаменателе. Решение: запишите ОДЗ (знаменатель ≠ 0), приведите к общему знаменателю, приравняйте числитель к нулю, проверьте корни по ОДЗ — обращающие знаменатель в нуль ПОСТОРОННИЕ. В сложных случаях удобна замена (t = x/3 − 4/x и т. п.)."] },
    ],
    f: [
      { n: ["Kasr nolga teng", "Дробь равна нулю"], f: "P(x)/Q(x) = 0  ⇔  P(x) = 0  va  Q(x) ≠ 0" },
      { n: ["Proporsiya", "Пропорция"], f: "a/b = c/d  ⇔  ad = bc  (b, d ≠ 0)" },
    ],
    s: [
      ["ODZ ni yozing.", "Запишите ОДЗ."],
      ["Umumiy maxrajga keltiring, suratni 0 ga tenglang.", "Приведите к общему знаменателю, приравняйте числитель к 0."],
      ["Ildizlarni ODZ ga tekshiring.", "Проверьте корни по ОДЗ."],
    ],
    m: [
      { s: ["(x² − 1)/(x − 1) = 0 ni yeching.", "Решите (x² − 1)/(x − 1) = 0."],
        y: ["ODZ: x ≠ 1", "x² − 1 = 0  →  x = ±1", "x = 1 ODZ ga kirmaydi"], j: "x = −1" },
      { s: ["3/(x − 1) = 2/(x − 2) ni yeching.", "Решите 3/(x − 1) = 2/(x − 2)."],
        y: ["ODZ: x ≠ 1, x ≠ 2", "3(x − 2) = 2(x − 1)  →  3x − 6 = 2x − 2"], j: "x = 4" },
      { s: ["x²/3 + 48/x² = 10(x/3 − 4/x) ildizlari yig'indisi?", "Сумма корней x²/3 + 48/x² = 10(x/3 − 4/x)?"],
        y: ["t = x/3 − 4/x:  t² = x²/9 − 8/3 + 16/x²  →  x²/3 + 48/x² = 3t² + 8",
          "3t² + 8 = 10t  →  t = 2  yoki  t = 4/3",
          "x/3 − 4/x = 2  →  x² − 6x − 12 = 0:  yig'indi 6",
          "x/3 − 4/x = 4/3  →  x² − 4x − 12 = 0:  yig'indi 4"], j: "10" },
    ],
    x: [
      ["Ildizlarni ODZ ga tekshirmaslik.", "Не проверять корни по ОДЗ."],
      ["Maxrajga qisqartirib, ildizni yo'qotish.", "Сократить на выражение с x и потерять корень."],
    ],
  },

  "Logarifm tushunchasi": {
    t: [
      { h: ["Ta'rif", "Определение"],
        p: ["a > 0, a ≠ 1, b > 0 bo'lsa, log_a b — a ni qanday darajaga ko'tarsak b chiqishini ko'rsatuvchi son: log_a b = c ⇔ aᶜ = b. Maxsus: lg b — o'nli (asos 10), ln b — natural (asos e). Asosiy logarifmik ayniyat: a^(log_a b) = b.",
          "При a > 0, a ≠ 1, b > 0 число log_a b — показатель степени, в которую надо возвести a, чтобы получить b: log_a b = c ⇔ aᶜ = b. Особые: lg — десятичный, ln — натуральный. Основное логарифмическое тождество: a^(log_a b) = b."] },
    ],
    f: [
      { n: ["Ta'rif", "Определение"], f: "log_a b = c  ⇔  aᶜ = b" },
      { n: ["Ayniyat", "Тождество"], f: "a^(log_a b) = b" },
      { n: ["Maxsus", "Особые"], f: "log_a 1 = 0,   log_a a = 1" },
    ],
    s: [
      ["Logarifmni «asos qanday darajada b bo'ladi» deb o'qing.", "Читайте логарифм как «в какую степень возвести основание»."],
      ["b ni asos darajasi ko'rinishida yozing.", "Представьте b степенью основания."],
      ["Noma'lum asos yoki son bo'lsa ta'rifdan tenglama tuzing.", "Если неизвестно основание или число — составьте уравнение по определению."],
    ],
    m: [
      { s: ["log₂ 8 va log₃(1/9) ni toping.", "Найдите log₂ 8 и log₃(1/9)."],
        y: ["2³ = 8  →  3", "3⁻² = 1/9  →  −2"], j: "3  va  −2" },
      { s: ["log₂ x = 5 ni yeching.", "Решите log₂ x = 5."],
        y: ["x = 2⁵"], j: "32" },
      { s: ["log_x 16 = 4 ni yeching.", "Решите log_x 16 = 4."],
        y: ["x⁴ = 16, x > 0, x ≠ 1"], j: "x = 2" },
    ],
    x: [
      ["Manfiy son yoki nol logarifmini izlash: mavjud emas.", "Искать логарифм отрицательного числа или нуля."],
      ["Asos 1 bo'lishi mumkin deb o'ylash.", "Допускать основание 1."],
    ],
  },

  "Ko'rsatkichli tengsizliklar": {
    t: [
      { h: ["Ishora qoidasi", "Правило знака"],
        p: ["aᶠ⁽ˣ⁾ > aᵍ⁽ˣ⁾ tengsizlikda: a > 1 bo'lsa (funksiya o'suvchi) ko'rsatkichlar tengsizligi ishorasi SAQLANADI: f > g. 0 < a < 1 bo'lsa (kamayuvchi) ishora TESKARI: f < g. Murakkab holda t = aˣ > 0 almashtirilib, t bo'yicha tengsizlik yechiladi.",
          "В неравенстве aᶠ⁽ˣ⁾ > aᵍ⁽ˣ⁾: при a > 1 (функция возрастает) знак для показателей СОХРАНЯЕТСЯ: f > g. При 0 < a < 1 (убывает) знак МЕНЯЕТСЯ: f < g. В сложных случаях замена t = aˣ > 0."] },
    ],
    f: [
      { n: ["a > 1", "a > 1"], f: "aᶠ > aᵍ  ⇔  f > g" },
      { n: ["0 < a < 1", "0 < a < 1"], f: "aᶠ > aᵍ  ⇔  f < g" },
    ],
    s: [
      ["Ikkala tomonni bir asosga keltiring.", "Приведите обе части к одному основанию."],
      ["Asos 1 dan kattami yoki kichikmi — ishorani shunga qarab qo'ying.", "Определите, больше ли основание 1, и выберите знак."],
      ["Chiziqli/kvadrat tengsizlikni yeching.", "Решите полученное неравенство."],
    ],
    m: [
      { s: ["2ˣ > 8 ni yeching.", "Решите 2ˣ > 8."],
        y: ["8 = 2³, asos 2 > 1: x > 3"], j: "(3; +∞)" },
      { s: ["(1/2)ˣ > 4 ni yeching.", "Решите (1/2)ˣ > 4."],
        y: ["4 = (1/2)⁻², asos < 1 — ishora teskari: x < −2"], j: "(−∞; −2)" },
      { s: ["4ˣ − 5 · 2ˣ + 4 < 0 ni yeching.", "Решите 4ˣ − 5 · 2ˣ + 4 < 0."],
        y: ["t = 2ˣ > 0:  t² − 5t + 4 < 0  →  1 < t < 4", "1 < 2ˣ < 4  →  0 < x < 2"], j: "(0; 2)" },
    ],
    x: [
      ["Asos 1 dan kichik bo'lganda ishorani almashtirmaslik.", "Не менять знак при основании меньше 1."],
      ["t ≤ 0 ni ham yechim deb hisoblash: aˣ > 0.", "Учитывать t ≤ 0: aˣ > 0."],
    ],
  },

  "Murakkab foiz": {
    t: [
      { h: ["Foiz ustiga foiz", "Проценты на проценты"],
        p: ["Har davrda o'sish (yoki kamayish) oldingi davr natijasiga nisbatan foiz bilan hisoblansa — murakkab foiz. Boshlang'ich P, yillik r% da n yildan keyin: A = P · (1 + r/100)ⁿ. Kamayishda (1 − r/100)ⁿ. Oddiy foizdan farqi: har yil foiz yangi (kattalashgan) summadan olinadi.",
          "Если рост (или убыль) каждый период считается от результата предыдущего, это сложные проценты. Начальная сумма P, r% годовых, через n лет: A = P · (1 + r/100)ⁿ. При убыли (1 − r/100)ⁿ. От простых отличаются тем, что процент каждый год берётся от увеличенной суммы."] },
    ],
    f: [
      { n: ["O'sish", "Рост"], f: "A = P · (1 + r/100)ⁿ" },
      { n: ["Kamayish", "Убыль"], f: "A = P · (1 − r/100)ⁿ" },
      { n: ["Oddiy foiz", "Простые проценты"], f: "A = P · (1 + r·n/100)" },
    ],
    s: [
      ["P, r va n ni aniqlang.", "Определите P, r и n."],
      ["O'sish koeffitsiyentini yozing: 1 + r/100 (10% → 1,1).", "Запишите коэффициент: 1 + r/100 (10% → 1,1)."],
      ["Darajaga ko'taring va P ga ko'paytiring.", "Возведите в степень и умножьте на P."],
    ],
    m: [
      { s: ["1000 so'm yiliga 10% bilan 3 yilga qo'yildi. Oxirida qancha?", "1000 положили под 10% годовых на 3 года. Сколько в конце?"],
        y: ["1000 · 1,1³ = 1000 · 1,331"], j: "1331" },
      { s: ["20 000 so'm 2 yilga 8% dan. Natija?", "20 000 под 8% на 2 года. Итог?"],
        y: ["20 000 · 1,08² = 20 000 · 1,1664"], j: "23 328" },
      { s: ["Narx har yil 10% arzonlashadi. 5000 so'mlik mahsulot 2 yildan keyin?", "Цена падает на 10% в год. Товар в 5000 через 2 года?"],
        y: ["5000 · 0,9² = 5000 · 0,81"], j: "4050" },
    ],
    x: [
      ["10% o'sishni 2 yilda 20% deb hisoblash: 21%.", "Считать 10% в год за 2 года равными 20%: получится 21%."],
      ["Kamayishda 1 + r/100 ishlatish.", "Использовать 1 + r/100 при убыли."],
    ],
  },

  "Trigonometrik qiymatlar": {
    t: [
      { h: ["Arkfunksiyalar", "Арк-функции"],
        p: ["arcsin a — sinusi a bo'lgan burchak, lekin [−π/2; π/2] oralig'ida; arccos a — kosinusi a bo'lgan, [0; π] da; arctg a — tangensi a bo'lgan, (−π/2; π/2) da. Oraliq muhim: shu sababli qiymat yagona. arcsin(−a) = −arcsin a; arccos(−a) = π − arccos a.",
          "arcsin a — угол, синус которого a, из [−π/2; π/2]; arccos a — косинус которого a, из [0; π]; arctg a — тангенс которого a, из (−π/2; π/2). Промежуток важен: значение единственно. arcsin(−a) = −arcsin a; arccos(−a) = π − arccos a."] },
    ],
    f: [
      { n: ["arcsin", "arcsin"], f: "arcsin a ∈ [−π/2; π/2]" },
      { n: ["arccos", "arccos"], f: "arccos a ∈ [0; π]" },
      { n: ["Manfiy argument", "Отрицательный аргумент"], f: "arcsin(−a) = −arcsin a,   arccos(−a) = π − arccos a" },
    ],
    s: [
      ["a jadvaldagi qiymatlardan birimi? (½, √2/2, √3/2, 1 …)", "Значение табличное? (½, √2/2, √3/2, 1 …)"],
      ["Burchakni topib, oraliqqa tushishini tekshiring.", "Найдите угол и проверьте промежуток."],
      ["Aralash ifodada kichik uchburchak chizib toping: sin(arccos 3/5).", "В смешанном выражении нарисуйте треугольник: sin(arccos 3/5)."],
    ],
    m: [
      { s: ["arcsin(1/2) va arccos(−1/2) ni toping.", "Найдите arcsin(1/2) и arccos(−1/2)."],
        y: ["arcsin ½ = π/6", "arccos(−½) = π − π/3 = 2π/3"], j: "π/6  va  2π/3" },
      { s: ["arcsin(−√3/2) va arctg 1?", "arcsin(−√3/2) и arctg 1?"],
        y: ["−arcsin(√3/2) = −π/3", "tg π/4 = 1"], j: "−π/3  va  π/4" },
      { s: ["sin(arccos 3/5) ni hisoblang.", "Вычислите sin(arccos 3/5)."],
        y: ["cos α = 3/5, α ∈ [0; π] → sin α ≥ 0", "sin α = √(1 − 9/25) = 4/5"], j: "4/5" },
    ],
    x: [
      ["arccos(−a) = −arccos a deb yozish (π − arccos a).", "Писать arccos(−a) = −arccos a (верно π − arccos a)."],
      ["arcsin qiymatini oraliqdan tashqarida javob qilish.", "Давать значение arcsin вне промежутка."],
    ],
  },

  "Yechish usullari": {
    t: [
      { h: ["Trigonometrik tenglama usullari", "Способы решения"],
        p: ["Asosiy usullar: 1) ko'paytuvchilarga ajratish va har birini nolga tenglash; 2) almashtirish (t = sin x va shu kabi) — kvadrat tenglamaga keltirish; 3) formulalar bilan bir xil argument va bir xil funksiyaga keltirish (ikkilangan burchak, yig'indi → ko'paytma); 4) bir jinsli tenglamani cos ᵏx ga bo'lish. Har bir almashtirishda |t| ≤ 1 cheklovini yodda tuting.",
          "Основные способы: 1) разложение на множители; 2) замена (t = sin x и т. п.) с сведением к квадратному; 3) формулы — к одному аргументу и одной функции (двойной угол, сумма → произведение); 4) однородное уравнение делят на cosᵏ x. При замене помните |t| ≤ 1."] },
    ],
    f: [
      { n: ["sin a = 0 va boshqalar", "Частные случаи"], f: "sin x = 0: πk;   cos x = 0: π/2 + πk;   sin x = 1: π/2 + 2πk" },
      { n: ["Yig'indi → ko'paytma", "Сумма → произведение"], f: "sin A − sin B = 2 cos((A+B)/2) sin((A−B)/2)" },
    ],
    s: [
      ["Tenglamani bir funksiya, bir argumentga keltiring.", "Приведите к одной функции и одному аргументу."],
      ["Almashtirish qiling yoki ko'paytuvchilarga ajrating.", "Сделайте замену или разложите на множители."],
      ["Har bir oddiy tenglamani yeching, javobni birlashtiring.", "Решите каждое простое уравнение, объедините ответы."],
    ],
    m: [
      { s: ["2sin²x − sin x − 1 = 0 ni yeching.", "Решите 2sin²x − sin x − 1 = 0."],
        y: ["t = sin x:  2t² − t − 1 = 0  →  t = 1  yoki  t = −1/2",
          "sin x = 1:  x = π/2 + 2πk",
          "sin x = −1/2:  x = (−1)ᵏ⁺¹ · π/6 + πk"], j: "x = π/2 + 2πk;  x = (−1)ᵏ⁺¹ π/6 + πk" },
      { s: ["sin 2x = cos x ni yeching.", "Решите sin 2x = cos x."],
        y: ["2 sin x cos x − cos x = 0  →  cos x (2 sin x − 1) = 0",
          "cos x = 0:  x = π/2 + πk",
          "sin x = 1/2:  x = (−1)ᵏ π/6 + πk"], j: "x = π/2 + πk;  x = (−1)ᵏ π/6 + πk" },
    ],
    x: [
      ["cos x ga bo'lib, cos x = 0 dan kelgan ildizlarni yo'qotish.", "Разделить на cos x и потерять корни cos x = 0."],
      ["t = sin x da |t| > 1 ildizni tashlamaslik.", "Не отбросить корень с |t| > 1 при t = sin x."],
    ],
  },

  "Ehtimollik ta'riflari": {
    t: [
      { h: ["Klassik ta'rif va amallar", "Классическое определение и действия"],
        p: ["Teng imkoniyatli n natijadan m tasi qulay bo'lsa P = m/n. Qarama-qarshi: P(Ā) = 1 − P(A). Yig'indi: P(A ∪ B) = P(A) + P(B) − P(A ∩ B) (birga bo'lmaydigan hodisalarda oxirgi had 0). Bog'liqmas hodisalar: P(A ∩ B) = P(A) · P(B).",
          "Из n равновозможных исходов m благоприятных: P = m/n. Противоположное: P(Ā) = 1 − P(A). Сумма: P(A ∪ B) = P(A) + P(B) − P(A ∩ B) (для несовместных последнее слагаемое 0). Независимые: P(A ∩ B) = P(A) · P(B)."] },
    ],
    f: [
      { n: ["Klassik", "Классическая"], f: "P(A) = m / n" },
      { n: ["Yig'indi", "Сумма"], f: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)" },
      { n: ["Bog'liqmas", "Независимые"], f: "P(A ∩ B) = P(A) · P(B)" },
    ],
    s: [
      ["Teng imkoniyatli natijalar to'plamini aniqlang (n).", "Определите множество равновозможных исходов (n)."],
      ["Qulaylarni sanang (m).", "Посчитайте благоприятные (m)."],
      ["«yoki» — qo'shish (kesishmani ayirib), «va» — ko'paytirish (bog'liqmasda).", "«или» — сложение (минус пересечение), «и» — умножение (для независимых)."],
    ],
    m: [
      { s: ["Kubik tashlanganda 5 yoki 6 tushish ehtimoli?", "Вероятность выпадения 5 или 6 на кубике?"],
        y: ["m = 2, n = 6"], j: "1/3" },
      { s: ["Ikki kubik tashlandi. Yig'indi 7 bo'lish ehtimoli?", "Бросили два кубика. Вероятность суммы 7?"],
        y: ["n = 36;  qulay: (1;6), (2;5), (3;4), (4;3), (5;2), (6;1) — 6 ta"], j: "1/6" },
      { s: ["P(A) = 0,5, P(B) = 0,4, P(A ∩ B) = 0,2. P(A ∪ B)?", "P(A) = 0,5, P(B) = 0,4, P(A ∩ B) = 0,2. P(A ∪ B)?"],
        y: ["0,5 + 0,4 − 0,2"], j: "0,7" },
    ],
    x: [
      ["Kesishmani ayirmasdan qo'shish.", "Складывать без вычитания пересечения."],
      ["Bog'liq hodisalar uchun oddiy ko'paytirish.", "Перемножать вероятности зависимых событий."],
    ],
  },

  "algebra10|Kombinatorik masalalar": {
    t: [
      { h: ["Formulalar", "Формулы"],
        p: ["Tartib muhim — o'rinlashtirish A(n; k); tartib muhim emas — guruhlash C(n; k); hamma elementni tartiblash — n!. Qaytarib tanlashda (takrorlash bilan) n ta variantdan k marta tanlash nᵏ. Guruhlashning xossalari: C(n; k) = C(n; n − k), C(n; 0) = 1.",
          "Порядок важен — размещения A(n; k); не важен — сочетания C(n; k); все элементы — n!. С возвращением k выборов из n вариантов — nᵏ. Свойства сочетаний: C(n; k) = C(n; n − k), C(n; 0) = 1."] },
    ],
    f: [
      { n: ["O'rinlashtirish", "Размещения"], f: "A(n; k) = n! / (n − k)!" },
      { n: ["Guruhlash", "Сочетания"], f: "C(n; k) = n! / (k!(n − k)!)" },
      { n: ["Takror bilan", "С повторением"], f: "nᵏ" },
    ],
    s: [
      ["Tartib muhimmi? Takrorlanadimi?", "Важен ли порядок? Есть ли повторы?"],
      ["Formulani tanlang, qisqartirib hisoblang.", "Выберите формулу, сокращайте при счёте."],
    ],
    m: [
      { s: ["8 kishidan 3 kishilik komissiya necha usulda?", "Сколько способов выбрать комиссию из 3 человек из 8?"],
        y: ["C(8; 3) = 8 · 7 · 6 / 6"], j: "56" },
      { s: ["3 ta xatni 4 ta qutiga (har bir xat istalgan qutiga) necha usulda tashlash mumkin?", "Сколькими способами можно бросить 3 письма в 4 ящика (каждое в любой)?"],
        y: ["4³"], j: "64" },
      { s: ["C(n; 2) = 45 da n?", "При каком n C(n; 2) = 45?"],
        y: ["n(n − 1)/2 = 45  →  n² − n − 90 = 0  →  n = 10"], j: "10" },
    ],
    x: [
      ["A va C ni almashtirish.", "Путать A и C."],
      ["Takrorlanuvchi tanlovda faktorial ishlatish.", "Использовать факториалы при выборе с возвращением."],
    ],
  },

  /* ═══════════════════════ 10-sinf geometriya ═══════════════════════ */

  "Fazoda to'g'ri chiziqlar joylashuvi": {
    t: [
      { h: ["Fazo aksiomalari", "Аксиомы пространства"],
        p: ["Bir to'g'ri chiziqda yotmaydigan uch nuqta orqali yagona tekislik o'tadi. To'g'ri chiziq va undan tashqaridagi nuqta orqali ham yagona tekislik o'tadi. Ikki tekislik umumiy nuqtaga ega bo'lsa, to'g'ri chiziq bo'ylab kesishadi.",
          "Через три точки, не лежащие на одной прямой, проходит единственная плоскость. Через прямую и точку вне неё — тоже единственная. Если две плоскости имеют общую точку, они пересекаются по прямой."] },
      { h: ["Ikki to'g'ri chiziq", "Две прямые"],
        p: ["Kesishuvchi — bitta umumiy nuqta; parallel — bir tekislikda, umumiy nuqtasi yo'q; ayqash — bir tekislikda yotmaydi. Ikkalasi ham uchinchisiga parallel bo'lsa, o'zaro parallel.",
          "Пересекающиеся — одна общая точка; параллельные — в одной плоскости без общих точек; скрещивающиеся — не лежат в одной плоскости. Две прямые, параллельные третьей, параллельны."] },
    ],
    f: [
      { n: ["Tekislik aniqlanishi", "Задание плоскости"], f: "3 nuqta  |  chiziq + nuqta  |  2 kesishuvchi chiziq  |  2 parallel chiziq" },
    ],
    s: [
      ["Ikki chiziq bir tekislikda yotadimi — tekshiring.", "Проверьте, лежат ли прямые в одной плоскости."],
      ["Yotsa: kesishuvchi yoki parallel; yotmasa: ayqash.", "Лежат — пересекаются или параллельны; нет — скрещиваются."],
    ],
    m: [
      { s: ["Kubda AB va CC₁ to'g'ri chiziqlar qanday joylashgan?", "Как расположены прямые AB и CC₁ куба?"],
        y: ["Ular bir tekislikda yotmaydi va kesishmaydi"], j: "Ayqash" },
      { s: ["Kubda AB va DC to'g'ri chiziqlar?", "Прямые AB и DC куба?"],
        y: ["Ikkalasi ABCD yog'ida, umumiy nuqtasi yo'q"], j: "Parallel" },
    ],
    x: [
      ["Umumiy nuqtasi yo'q chiziqlarni parallel deb hisoblash: ayqash ham bo'lishi mumkin.", "Считать параллельными любые прямые без общих точек: они могут скрещиваться."],
    ],
  },

  "Ko'pyoqlar va ularning elementlari": {
    t: [
      { h: ["Ko'pyoq", "Многогранник"],
        p: ["Ko'pyoq — ko'pburchak yoqlardan tuzilgan jism. Elementlari: yoq (ko'pburchak), qirra (yoqlarning umumiy tomoni), uch. Prizma: ikki teng parallel asos va yon yoqlar. Piramida: bitta asos va uchi umumiy uchburchak yoqlar. n burchakli prizmada 2n uch, 3n qirra, n + 2 yoq; n burchakli piramidada n + 1 uch, 2n qirra, n + 1 yoq.",
          "Многогранник — тело, ограниченное многоугольниками. Элементы: грань, ребро (общая сторона граней), вершина. Призма: два равных параллельных основания и боковые грани. Пирамида: основание и треугольные грани с общей вершиной. У n-угольной призмы 2n вершин, 3n рёбер, n + 2 граней; у n-угольной пирамиды n + 1 вершина, 2n рёбер, n + 1 грань."] },
    ],
    f: [
      { n: ["n-burchakli prizma", "n-угольная призма"], f: "U = 2n,   Q = 3n,   Y = n + 2" },
      { n: ["n-burchakli piramida", "n-угольная пирамида"], f: "U = n + 1,   Q = 2n,   Y = n + 1" },
    ],
    s: [
      ["Asosidagi ko'pburchak burchaklari sonini (n) aniqlang.", "Определите число сторон основания (n)."],
      ["Jism turi bo'yicha formulani qo'llang.", "Примените формулу для вида тела."],
    ],
    m: [
      { s: ["Uchburchakli prizmada nechta uch, qirra va yoq bor?", "Сколько вершин, рёбер и граней у треугольной призмы?"],
        y: ["n = 3:  U = 6,  Q = 9,  Y = 5"], j: "6, 9, 5" },
      { s: ["To'rtburchakli piramidaning uch, qirra, yoqlari?", "Вершины, рёбра и грани четырёхугольной пирамиды?"],
        y: ["n = 4:  U = 5,  Q = 8,  Y = 5"], j: "5, 8, 5" },
    ],
    x: [
      ["Piramidada uchni hisobga olmay U = n deb yozish.", "Забыть вершину пирамиды: U = n + 1."],
    ],
  },

  "Eyler formulasi": {
    t: [
      { h: ["Eyler formulasi", "Формула Эйлера"],
        p: ["Har qanday qavariq ko'pyoqda uchlar soni minus qirralar soni plus yoqlar soni doim 2 ga teng. Ikki kattalik ma'lum bo'lsa uchinchisi topiladi. Tekshirish usuli: hamma qavariq ko'pyoqda U − Q + Y = 2.",
          "Для любого выпуклого многогранника число вершин минус число рёбер плюс число граней всегда равно 2. По двум величинам находят третью."] },
    ],
    f: [
      { n: ["Eyler", "Эйлер"], f: "U − Q + Y = 2" },
    ],
    s: [
      ["Ma'lum ikkita kattalikni yozing.", "Запишите две известные величины."],
      ["Formulaga qo'yib uchinchisini toping.", "Подставьте и найдите третью."],
    ],
    m: [
      { s: ["Kub: 8 uch, 12 qirra, 6 yoq. Eyler formulasi bajariladimi?", "Куб: 8 вершин, 12 рёбер, 6 граней. Выполняется ли формула Эйлера?"],
        y: ["8 − 12 + 6"], j: "2 ✓" },
      { s: ["Ko'pyoqda 12 qirra va 6 yoq bor. Uchlari soni?", "У многогранника 12 рёбер и 6 граней. Число вершин?"],
        y: ["U − 12 + 6 = 2  →  U = 8"], j: "8" },
      { s: ["Oktaedr: 8 yoq, 12 qirra. Uchlari?", "Октаэдр: 8 граней, 12 рёбер. Вершины?"],
        y: ["U = 2 + 12 − 8"], j: "6" },
    ],
    x: [
      ["Formulani 2 o'rniga 1 ga tenglash.", "Считать результат равным 1."],
    ],
  },

  "Ayqash to'g'ri chiziqlar": {
    t: [
      { h: ["Ayqash chiziqlar", "Скрещивающиеся прямые"],
        p: ["Ayqash chiziqlar bir tekislikda yotmaydi va kesishmaydi. Alomat: bir chiziq tekislikda yotsa, ikkinchisi shu tekislikni unga tegishli bo'lmagan nuqtada kesib o'tsa, ular ayqash. Ayqash chiziqlar orasidagi burchak — ularga parallel kesishuvchi chiziqlar orasidagi burchak.",
          "Скрещивающиеся прямые не лежат в одной плоскости и не пересекаются. Признак: одна прямая лежит в плоскости, а другая пересекает плоскость в точке вне первой. Угол между скрещивающимися — угол между пересекающимися прямыми, им параллельными."] },
    ],
    f: [
      { n: ["Burchak", "Угол"], f: "∠(a, b) = ∠(a₁, b),  a₁ ∥ a,  a₁ ∩ b" },
    ],
    s: [
      ["Ayqashligini alomat bilan tekshiring.", "Проверьте скрещиваемость по признаку."],
      ["Burchakni topish uchun biri o'ziga parallel ko'chiriladi.", "Для угла перенесите одну прямую параллельно."],
    ],
    m: [
      { s: ["Kubda AB va CC₁ orasidagi burchak?", "Угол между AB и CC₁ в кубе?"],
        y: ["CC₁ ∥ AA₁, ∠(AB, AA₁) = ∠BAA₁"], j: "90°" },
      { s: ["Kubda A₁B va AD orasidagi burchak?", "Угол между A₁B и AD в кубе?"],
        y: ["AD ∥ A₁D₁ va A₁B ⊥ AD (AD ⊥ ABB₁A₁ yog'iga)"], j: "90°" },
    ],
    x: [
      ["Ayqash chiziqlarni «kesishuvchi» deb atash.", "Называть скрещивающиеся прямые пересекающимися."],
    ],
  },

  "Tekisliklarning o'zaro joylashuvi": {
    t: [
      { h: ["Ikki tekislik", "Две плоскости"],
        p: ["Ikki tekislik yoki parallel (umumiy nuqta yo'q) yoki to'g'ri chiziq bo'ylab kesishadi. Parallellik alomati: bir tekislikdagi ikki kesishuvchi chiziq ikkinchi tekislikka parallel bo'lsa, tekisliklar parallel. Ikki parallel tekislikni uchinchi tekislik parallel to'g'ri chiziqlar bo'ylab kesadi.",
          "Две плоскости либо параллельны (нет общих точек), либо пересекаются по прямой. Признак: две пересекающиеся прямые одной плоскости параллельны другой — плоскости параллельны. Третья плоскость пересекает параллельные плоскости по параллельным прямым."] },
    ],
    f: [
      { n: ["Alomat", "Признак"], f: "a, b ⊂ α,  a ∩ b,  a ∥ β,  b ∥ β  ⇒  α ∥ β" },
    ],
    s: [
      ["Umumiy nuqta bormi? Yo'q — parallel, bor — to'g'ri chiziq bo'ylab kesishadi.", "Есть ли общая точка? Нет — параллельны, есть — пересекаются по прямой."],
      ["Alomatni ishlating: ikki kesishuvchi parallel chiziq.", "Используйте признак: две пересекающиеся параллельные прямые."],
    ],
    m: [
      { s: ["Kubning qarama-qarshi yoqlari qanday joylashgan?", "Как расположены противоположные грани куба?"],
        y: ["Umumiy nuqtasi yo'q"], j: "Parallel" },
      { s: ["ABCD va ABB₁A₁ yoqlari qanday?", "Как расположены грани ABCD и ABB₁A₁?"],
        y: ["Umumiy AB qirrasi bor"], j: "AB to'g'ri chizig'i bo'ylab kesishadi" },
    ],
    x: [
      ["Bitta chiziq parallel bo'lsa tekisliklar parallel deb hisoblash: ikkita kesishuvchi kerak.", "Считать плоскости параллельными по одной прямой: нужны две пересекающиеся."],
    ],
  },

  "Fazoda ikki nuqta orasidagi masofa": {
    t: [
      { h: ["Masofa formulasi", "Формула расстояния"],
        p: ["Tekislikdagi formulaning davomi: uchinchi koordinata qo'shiladi. Bu Pifagorni ikki marta qo'llashdan chiqadi. Sfera tenglamasi ham shundan: markazdan R masofadagi nuqtalar.",
          "Продолжение плоской формулы: добавляется третья координата (двукратное применение Пифагора). Отсюда и уравнение сферы: точки на расстоянии R от центра."] },
    ],
    f: [
      { n: ["Masofa", "Расстояние"], f: "d = √( (x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)² )" },
      { n: ["Sfera", "Сфера"], f: "(x − a)² + (y − b)² + (z − c)² = R²" },
    ],
    s: [
      ["Uch ayirmani toping.", "Найдите три разности."],
      ["Kvadratlarini qo'shib ildiz oling.", "Сложите квадраты и извлеките корень."],
    ],
    m: [
      { s: ["A(1; 2; 3) va B(4; 6; 15) orasidagi masofa?", "Расстояние между A(1; 2; 3) и B(4; 6; 15)?"],
        y: ["Ayirmalar: 3, 4, 12", "9 + 16 + 144 = 169"], j: "13" },
      { s: ["O(0; 0; 0) dan B(2; 3; 6) gacha?", "От O(0; 0; 0) до B(2; 3; 6)?"],
        y: ["4 + 9 + 36 = 49"], j: "7" },
    ],
    x: [
      ["Uchinchi koordinatani unutish.", "Забыть третью координату."],
    ],
  },

  "Parallelepipedning diagonali": {
    t: [
      { h: ["Diagonal", "Диагональ"],
        p: ["To'g'ri burchakli parallelepipedning diagonali kvadrati uch o'lchami kvadratlari yig'indisiga teng. Kubda d = a√3. Isbot: avval asosning diagonali (a² + b²), keyin yon qirra bilan yana Pifagor.",
          "Квадрат диагонали прямоугольного параллелепипеда равен сумме квадратов трёх измерений. У куба d = a√3. Вывод: сначала диагональ основания (a² + b²), затем Пифагор с боковым ребром."] },
    ],
    f: [
      { n: ["Parallelepiped", "Параллелепипед"], f: "d² = a² + b² + c²" },
      { n: ["Kub", "Куб"], f: "d = a√3" },
    ],
    s: [
      ["Uch o'lchamni toping.", "Найдите три измерения."],
      ["Kvadratlarini qo'shib ildiz oling.", "Сложите квадраты, извлеките корень."],
    ],
    m: [
      { s: ["Parallelepiped o'lchamlari 3, 4, 12. Diagonali?", "Измерения 3, 4, 12. Диагональ?"],
        y: ["9 + 16 + 144 = 169"], j: "13" },
      { s: ["Kub qirrasi 5. Diagonali?", "Ребро куба 5. Диагональ?"],
        y: ["5√3"], j: "5√3" },
      { s: ["Kub diagonali 6√3. Qirrasi?", "Диагональ куба 6√3. Ребро?"],
        y: ["a√3 = 6√3"], j: "6" },
    ],
    x: [
      ["Asos diagonalini fazoviy diagonal bilan aralashtirish.", "Путать диагональ основания с пространственной диагональю."],
    ],
  },

  "Fazoviy vektorlar": {
    t: [
      { h: ["Fazoda vektorlar", "Векторы в пространстве"],
        p: ["Vektor uch koordinatali: a(x; y; z). Uzunligi |a| = √(x² + y² + z²). Qo'shish, songa ko'paytirish koordinatalar bo'yicha. Skalyar ko'paytma a·b = x₁x₂ + y₁y₂ + z₁z₂ = |a||b| cos φ; perpendikulyar ⇔ 0. Kollinear: koordinatalari proporsional.",
          "Вектор имеет три координаты a(x; y; z). Длина |a| = √(x² + y² + z²). Сложение и умножение на число покоординатно. Скалярное произведение a·b = x₁x₂ + y₁y₂ + z₁z₂ = |a||b| cos φ; перпендикулярны ⇔ 0. Коллинеарны: координаты пропорциональны."] },
    ],
    f: [
      { n: ["Uzunlik", "Длина"], f: "|a| = √(x² + y² + z²)" },
      { n: ["Skalyar ko'paytma", "Скалярное произведение"], f: "a · b = x₁x₂ + y₁y₂ + z₁z₂" },
      { n: ["Burchak", "Угол"], f: "cos φ = a · b / (|a| |b|)" },
    ],
    s: [
      ["Koordinatalarni ayirib (oxiri − boshi) vektor hosil qiling.", "Получите вектор: координаты конца − начала."],
      ["Kerakli amalni bajaring: uzunlik, skalyar ko'paytma yoki burchak.", "Выполните нужное: длина, скалярное произведение или угол."],
    ],
    m: [
      { s: ["a(1; 2; 2) ning uzunligi?", "Длина a(1; 2; 2)?"],
        y: ["√(1 + 4 + 4)"], j: "3" },
      { s: ["a(1; 2; 3), b(2; −1; 0). Perpendikulyarmi?", "a(1; 2; 3), b(2; −1; 0). Перпендикулярны ли?"],
        y: ["a · b = 2 − 2 + 0 = 0"], j: "Ha" },
      { s: ["a(1; 0; 1), b(0; 1; 1). Ular orasidagi burchak?", "Угол между a(1; 0; 1) и b(0; 1; 1)?"],
        y: ["a · b = 1;  |a| = |b| = √2", "cos φ = 1/2"], j: "60°" },
    ],
    x: [
      ["Uch koordinatadan birini tashlab ketish.", "Пропустить одну из трёх координат."],
    ],
  },

  /* ═══════════════════════ 11-sinf ═══════════════════════ */

  "Limit haqida tushuncha": {
    t: [
      { h: ["Limit", "Предел"],
        p: ["x a ga yaqinlashganda f(x) qiymatlari biror L songa yaqinlashsa, L — f(x) ning a dagi limiti. Limit funksiyaning a nuqtadagi qiymatiga bog'liq emas. Xossalar: yig'indi, ko'paytma, bo'linma limiti — limitlarning yig'indisi, ko'paytmasi, bo'linmasi. 0/0 ko'rinishida ifodani soddalashtirish (qisqartirish) kerak. Hosila aynan limit orqali ta'riflanadi.",
          "Если при x → a значения f(x) приближаются к числу L, то L — предел f(x) при x → a. Он не зависит от значения функции в самой точке a. Свойства: предел суммы, произведения, частного равен сумме, произведению, частному пределов. При неопределённости 0/0 выражение упрощают. Производная определяется через предел."] },
    ],
    f: [
      { n: ["Limit", "Предел"], f: "lim(x→a) f(x) = L" },
      { n: ["Mashhur limitlar", "Известные пределы"], f: "lim(x→∞) 1/x = 0,   lim(x→0) sin x / x = 1" },
    ],
    s: [
      ["To'g'ridan-to'g'ri x = a ni qo'yib ko'ring.", "Подставьте x = a."],
      ["0/0 chiqsa — surat va maxrajni ko'paytuvchilarga ajratib qisqartiring.", "Получили 0/0 — разложите и сократите."],
      ["So'ng yana qo'ying.", "Снова подставьте."],
    ],
    m: [
      { s: ["lim(x→3) (x² − 9)/(x − 3) ni toping.", "Найдите lim(x→3) (x² − 9)/(x − 3)."],
        y: ["To'g'ridan-to'g'ri 0/0. Ajratamiz: (x − 3)(x + 3)/(x − 3) = x + 3", "x → 3:  3 + 3"], j: "6" },
      { s: ["lim(x→∞) (3n + 1)/(n + 2) ni toping.", "Найдите lim(n→∞) (3n + 1)/(n + 2)."],
        y: ["n ga bo'lamiz: (3 + 1/n)/(1 + 2/n)", "1/n → 0"], j: "3" },
    ],
    x: [
      ["0/0 ni «0» yoki «yo'q» deb javob berish.", "Отвечать «0» или «не существует» при 0/0."],
    ],
  },

  "Darajaning hosilasi": {
    t: [
      { h: ["Daraja hosilasi", "Производная степени"],
        p: ["(xⁿ)′ = n xⁿ⁻¹ — n har qanday haqiqiy son bo'lishi mumkin. Ildiz va kasr ham daraja: √x = x^(1/2), 1/x = x⁻¹. O'zgarmas hosilasi 0, o'zgarmas ko'paytuvchi tashqariga chiqadi: (kf)′ = k f′.",
          "(xⁿ)′ = n xⁿ⁻¹ — n любое действительное. Корни и дроби — тоже степени: √x = x^(1/2), 1/x = x⁻¹. Производная константы 0, постоянный множитель выносится: (kf)′ = k f′."] },
    ],
    f: [
      { n: ["Daraja", "Степень"], f: "(xⁿ)′ = n · xⁿ⁻¹" },
      { n: ["Ildiz", "Корень"], f: "(√x)′ = 1 / (2√x)" },
      { n: ["Teskari", "Обратная"], f: "(1/x)′ = −1 / x²" },
    ],
    s: [
      ["Funksiyani xⁿ ko'rinishida yozing (ildiz, kasrni darajaga).", "Запишите как xⁿ (корень и дробь — степени)."],
      ["n ni oldinga chiqaring, darajani 1 ga kamaytiring.", "Опустите n вперёд, показатель уменьшите на 1."],
    ],
    m: [
      { s: ["(x⁵)′ ni toping.", "Найдите (x⁵)′."],
        y: ["5 · x⁴"], j: "5x⁴" },
      { s: ["(1/x)′ va (√x)′ ni toping.", "Найдите (1/x)′ и (√x)′."],
        y: ["1/x = x⁻¹:  −1 · x⁻² = −1/x²", "√x = x^(1/2):  ½ · x^(−1/2) = 1/(2√x)"], j: "−1/x²  va  1/(2√x)" },
      { s: ["(3x⁴)′ ni toping.", "Найдите (3x⁴)′."],
        y: ["3 · 4x³"], j: "12x³" },
    ],
    x: [
      ["Ko'rsatkichni kamaytirmay yozish: (x⁵)′ = 5x⁵ emas.", "Не уменьшить показатель: (x⁵)′ ≠ 5x⁵."],
    ],
  },

  "Ko'phadning hosilasi": {
    t: [
      { h: ["Hadma-had", "Почленно"],
        p: ["Yig'indi hosilasi hosilalar yig'indisi: ko'phadni har bir hadidan alohida hosila olamiz. Ko'paytma ko'rinishida berilsa — avval qavslarni ochish yoki (uv)′ = u′v + uv′ dan foydalanish.",
          "Производная суммы равна сумме производных: дифференцируем многочлен почленно. Если задан произведением — раскройте скобки или примените (uv)′ = u′v + uv′."] },
    ],
    f: [
      { n: ["Yig'indi", "Сумма"], f: "(u ± v)′ = u′ ± v′" },
      { n: ["Ko'phad", "Многочлен"], f: "(aₙxⁿ + … + a₁x + a₀)′ = n aₙ xⁿ⁻¹ + … + a₁" },
    ],
    s: [
      ["Har bir hadning hosilasini alohida toping.", "Найдите производную каждого члена."],
      ["Ishoralarni saqlang; o'zgarmas had 0 bo'ladi.", "Сохраняйте знаки; константа даёт 0."],
    ],
    m: [
      { s: ["(3x⁴ − 2x² + 5x − 7)′ ni toping.", "Найдите (3x⁴ − 2x² + 5x − 7)′."],
        y: ["12x³ − 4x + 5 − 0"], j: "12x³ − 4x + 5" },
      { s: ["f(x) = (x² + 1)(x − 2). f′(x)?", "f(x) = (x² + 1)(x − 2). f′(x)?"],
        y: ["Ochamiz: x³ − 2x² + x − 2", "3x² − 4x + 1"], j: "3x² − 4x + 1" },
    ],
    x: [
      ["O'zgarmasning hosilasini 1 yoki o'zgarmasning o'zi deb yozish.", "Считать производную константы равной 1 или ей самой."],
    ],
  },

  "Nuqtadagi hosila": {
    t: [
      { h: ["f′(x₀)", "f′(x₀)"],
        p: ["Nuqtadagi hosila — hosila formulasiga x₀ ni qo'yish. Ma'nosi: funksiyaning shu nuqtadagi tezligi va grafikka o'tkazilgan urinma qiyaligi. Yo'l s(t) bo'lsa, tezlik v(t) = s′(t), tezlanish a(t) = v′(t).",
          "Производная в точке — подстановка x₀ в формулу производной. Смысл: скорость изменения функции и угловой коэффициент касательной. Если путь s(t), то скорость v(t) = s′(t), ускорение a(t) = v′(t)."] },
    ],
    f: [
      { n: ["Tezlik", "Скорость"], f: "v(t) = s′(t)" },
      { n: ["Tezlanish", "Ускорение"], f: "a(t) = v′(t) = s″(t)" },
    ],
    s: [
      ["Hosilani toping.", "Найдите производную."],
      ["Nuqtani qo'ying.", "Подставьте точку."],
    ],
    m: [
      { s: ["f(x) = x² − 3x. f′(2)?", "f(x) = x² − 3x. f′(2)?"],
        y: ["f′(x) = 2x − 3", "f′(2) = 4 − 3"], j: "1" },
      { s: ["s(t) = t³ − 2t. t = 2 da tezlik?", "s(t) = t³ − 2t. Скорость при t = 2?"],
        y: ["v = 3t² − 2", "v(2) = 12 − 2"], j: "10" },
      { s: ["f(x) = x³ − 3x. f′(x) = 0 bo'ladigan nuqtalar?", "f(x) = x³ − 3x. Где f′(x) = 0?"],
        y: ["3x² − 3 = 0"], j: "x = ±1" },
    ],
    x: [
      ["Hosila o'rniga funksiya qiymatini qo'yish: f(2) ≠ f′(2).", "Подставлять в f вместо f′: f(2) ≠ f′(2)."],
    ],
  },

  "Urinmaning burchak koeffitsiyenti": {
    t: [
      { h: ["Urinma", "Касательная"],
        p: ["x₀ nuqtadagi urinmaning burchak koeffitsiyenti k = f′(x₀) = tg α (α — Ox o'qiga og'ish burchagi). Urinma tenglamasi: y = f(x₀) + f′(x₀)(x − x₀). Parallel to'g'ri chiziqlarda k teng, perpendikulyarda k₁ · k₂ = −1.",
          "Угловой коэффициент касательной в точке x₀ равен f′(x₀) = tg α. Уравнение касательной: y = f(x₀) + f′(x₀)(x − x₀). У параллельных прямых k равны, у перпендикулярных k₁ · k₂ = −1."] },
    ],
    f: [
      { n: ["Qiyalik", "Наклон"], f: "k = f′(x₀) = tg α" },
      { n: ["Urinma tenglamasi", "Уравнение касательной"], f: "y = f(x₀) + f′(x₀) · (x − x₀)" },
    ],
    s: [
      ["f(x₀) va f′(x₀) ni toping.", "Найдите f(x₀) и f′(x₀)."],
      ["Urinma tenglamasiga qo'ying va ixchamlang.", "Подставьте в уравнение и упростите."],
    ],
    m: [
      { s: ["y = x² ga x₀ = 1 da urinma tenglamasi?", "Уравнение касательной к y = x² в x₀ = 1?"],
        y: ["f(1) = 1;  f′(x) = 2x  →  f′(1) = 2", "y = 1 + 2(x − 1)"], j: "y = 2x − 1" },
      { s: ["y = x³ ning urinmasi y = 3x + 1 ga parallel bo'ladigan nuqtalar?", "В каких точках касательная к y = x³ параллельна y = 3x + 1?"],
        y: ["f′(x) = 3x² = 3  →  x = ±1"], j: "x = 1 va x = −1" },
      { s: ["y = x² da x₀ = 2 dagi urinma qiyaligi va burchak?", "Наклон касательной к y = x² в x₀ = 2?"],
        y: ["k = 2 · 2 = 4", "tg α = 4"], j: "k = 4" },
    ],
    x: [
      ["Urinma tenglamasida f(x₀) ni qo'shishni unutish.", "Забыть слагаемое f(x₀) в уравнении касательной."],
      ["k = f(x₀) deb olish (k = f′(x₀)).", "Брать k = f(x₀) вместо f′(x₀)."],
    ],
  },

  "O'sish va kamayish oraliqlari": {
    t: [
      { h: ["Monotonlik", "Монотонность"],
        p: ["f′(x) > 0 bo'lgan oraliqda funksiya o'sadi, f′(x) < 0 da kamayadi. Oraliqlar chegarasi — f′ = 0 yoki mavjud bo'lmagan nuqtalar. f′ ishorasi oraliqlar usuli bilan aniqlanadi.",
          "Где f′(x) > 0, функция возрастает; где f′(x) < 0 — убывает. Границы промежутков — точки, где f′ = 0 или не существует. Знак f′ определяют методом интервалов."] },
    ],
    f: [
      { n: ["O'sish", "Возрастание"], f: "f′(x) > 0  ⇒  f o'sadi" },
      { n: ["Kamayish", "Убывание"], f: "f′(x) < 0  ⇒  f kamayadi" },
    ],
    s: [
      ["f′(x) ni toping va f′ = 0 ni yeching.", "Найдите f′ и решите f′ = 0."],
      ["Nollarni o'qqa qo'ying, oraliqlarda ishorani aniqlang.", "Отметьте нули, определите знак на промежутках."],
      ["Musbat — o'sish, manfiy — kamayish oralig'ini yozing.", "Запишите промежутки возрастания и убывания."],
    ],
    m: [
      { s: ["f(x) = x³ − 3x ning o'sish va kamayish oraliqlari?", "Промежутки монотонности f(x) = x³ − 3x?"],
        y: ["f′ = 3x² − 3 = 3(x − 1)(x + 1)", "f′ > 0: x < −1 yoki x > 1;  f′ < 0: −1 < x < 1"], j: "o'sadi (−∞; −1] va [1; +∞);  kamayadi [−1; 1]" },
      { s: ["f(x) = x² − 4x qayerda o'sadi?", "Где возрастает f(x) = x² − 4x?"],
        y: ["f′ = 2x − 4 > 0  →  x > 2"], j: "[2; +∞)" },
    ],
    x: [
      ["f o'sishini f > 0 deb aralashtirish: gap f′ haqida.", "Путать возрастание f с положительностью f: речь о f′."],
    ],
  },

  "Ekstremal masalalar": {
    t: [
      { h: ["Eng katta va eng kichik qiymat", "Наибольшее и наименьшее значения"],
        p: ["Kesmada uzluksiz funksiyaning eng katta va eng kichik qiymati kritik nuqtalarda (f′ = 0, kesma ichida) yoki kesma uchlarida bo'ladi. Shu nuqtalardagi qiymatlar solishtiriladi. Amaliy masalada: kattalikni bitta o'zgaruvchi orqali yozing, f′ = 0 ni yeching, mantiqiy tanlang.",
          "Наибольшее и наименьшее значения непрерывной на отрезке функции достигаются в критических точках (f′ = 0 внутри) или на концах. Значения в этих точках сравнивают. В прикладной задаче выразите величину через одну переменную, решите f′ = 0."] },
    ],
    f: [
      { n: ["Algoritm", "Алгоритм"], f: "f′ = 0  →  kritik nuqtalar  →  f(kritik), f(a), f(b)  →  eng katta/kichik" },
    ],
    s: [
      ["f′ ni toping, f′ = 0 ni yeching; kesmaga tushganlarini oling.", "Найдите f′ = 0; оставьте точки внутри отрезка."],
      ["Kritik nuqtalar va uchlarda f ni hisoblang.", "Вычислите f в критических точках и на концах."],
      ["Eng kattasi/kichigini tanlang.", "Выберите наибольшее/наименьшее."],
    ],
    m: [
      { s: ["f(x) = x³ − 3x ning [0; 2] dagi eng katta va eng kichik qiymati?", "Наибольшее и наименьшее f(x) = x³ − 3x на [0; 2]?"],
        y: ["f′ = 3x² − 3 = 0  →  x = 1 ∈ [0; 2]", "f(0) = 0,  f(1) = −2,  f(2) = 8 − 6 = 2"], j: "eng katta 2 (x = 2), eng kichik −2 (x = 1)" },
      { s: ["Yig'indisi 20 bo'lgan ikki son ko'paytmasi eng katta bo'ladigan sonlar?", "Два числа с суммой 20 имеют наибольшее произведение. Какие?"],
        y: ["x va 20 − x:  f = x(20 − x) = 20x − x²", "f′ = 20 − 2x = 0  →  x = 10"], j: "10 va 10 (ko'paytma 100)" },
      { s: ["Perimetri 40 bo'lgan to'g'ri to'rtburchakning eng katta yuzi?", "Наибольшая площадь прямоугольника периметра 40?"],
        y: ["Tomonlar x va 20 − x:  S = x(20 − x)", "Maksimum x = 10 da (kvadrat): S = 100"], j: "100" },
    ],
    x: [
      ["Kesma uchlarini tekshirmaslik.", "Не проверить концы отрезка."],
      ["Kritik nuqtani kesmadan tashqarida bo'lsa ham olish.", "Брать критическую точку вне отрезка."],
    ],
  },

  "Integrallar jadvali": {
    t: [
      { h: ["Integrallash qoidalari", "Правила интегрирования"],
        p: ["Yig'indi integrali integrallar yig'indisi, o'zgarmas ko'paytuvchi tashqariga chiqadi. Argument chiziqli (kx + b) bo'lsa, natijani 1/k ga ko'paytiring. Har doim + C. Tekshirish: javobning hosilasi berilgan funksiyani berishi kerak.",
          "Интеграл суммы — сумма интегралов, постоянный множитель выносится. Если аргумент линейный (kx + b), результат умножают на 1/k. Всегда + C. Проверка: производная ответа даёт подынтегральную функцию."] },
    ],
    f: [
      { n: ["Daraja", "Степень"], f: "∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C" },
      { n: ["Chiziqli argument", "Линейный аргумент"], f: "∫ (kx + b)ⁿ dx = (kx + b)ⁿ⁺¹ / (k(n + 1)) + C" },
      { n: ["Trigonometrik", "Тригонометрия"], f: "∫ sin kx dx = −cos kx / k + C,   ∫ cos kx dx = sin kx / k + C" },
      { n: ["Boshqalar", "Другие"], f: "∫ eˣ dx = eˣ + C,   ∫ dx/x = ln|x| + C" },
    ],
    s: [
      ["Funksiyani jadvaldagi bo'laklarga ajrating.", "Разбейте на табличные слагаемые."],
      ["Chiziqli argument bo'lsa 1/k ni qo'ying.", "При линейном аргументе добавьте 1/k."],
      ["Hosila olib tekshiring.", "Проверьте дифференцированием."],
    ],
    m: [
      { s: ["∫ (2x + 3)⁴ dx ni toping.", "Найдите ∫ (2x + 3)⁴ dx."],
        y: ["k = 2, n = 4:  (2x + 3)⁵ / (2 · 5)"], j: "(2x + 3)⁵/10 + C" },
      { s: ["∫ sin 2x dx ni toping.", "Найдите ∫ sin 2x dx."],
        y: ["−cos 2x / 2"], j: "−½ cos 2x + C" },
      { s: ["∫ (x² + 1/x²) dx ni toping.", "Найдите ∫ (x² + 1/x²) dx."],
        y: ["∫ x² dx = x³/3", "∫ x⁻² dx = −x⁻¹"], j: "x³/3 − 1/x + C" },
    ],
    x: [
      ["1/k ni tushirib qoldirish.", "Забыть 1/k."],
      ["∫ dx/x ni x⁰/0 ko'rinishida yozishga urinish (u ln|x|).", "Пытаться применить степенную формулу к 1/x (это ln|x|)."],
    ],
  },

  "matematika11|Fazoda vektorlar": {
    t: [
      { h: ["Fazoviy vektorlar", "Векторы в пространстве"],
        p: ["Fazoda vektor uch koordinata bilan beriladi. Amallar tekislikdagidek, faqat z ham hisobga olinadi. Skalyar ko'paytma: x₁x₂ + y₁y₂ + z₁z₂. Vektorlar orasidagi burchak kosinusi shu ko'paytmani uzunliklar ko'paytmasiga bo'lishdan chiqadi.",
          "Вектор в пространстве задаётся тремя координатами. Действия как на плоскости, с учётом z. Скалярное произведение: x₁x₂ + y₁y₂ + z₁z₂. Косинус угла — это произведение, делённое на произведение длин."] },
    ],
    f: [
      { n: ["Uzunlik", "Длина"], f: "|a| = √(x² + y² + z²)" },
      { n: ["Burchak", "Угол"], f: "cos φ = (a · b) / (|a| · |b|)" },
    ],
    s: [
      ["Koordinatalarni toping.", "Найдите координаты."],
      ["Amalni bajaring.", "Выполните действие."],
    ],
    m: [
      { s: ["A(1; 0; 2), B(3; 4; 6). AB vektor va uning uzunligi?", "A(1; 0; 2), B(3; 4; 6). Вектор AB и его длина?"],
        y: ["AB = (2; 4; 4)", "|AB| = √(4 + 16 + 16) = √36"], j: "AB(2; 4; 4),  6" },
    ],
    x: [
      ["Uchinchi koordinatani unutish.", "Забыть третью координату."],
    ],
  },

  "Prizma hajmi": {
    t: [
      { h: ["Prizma", "Призма"],
        p: ["Prizma hajmi — asos yuzi × balandlik. To'g'ri prizmada yon qirra balandlikka teng, yon sirti — asos perimetri × balandlik. To'liq sirt = yon sirt + ikki asos yuzi.",
          "Объём призмы — площадь основания × высота. У прямой призмы боковое ребро равно высоте, боковая поверхность — периметр основания × высота. Полная = боковая + две площади основания."] },
    ],
    f: [
      { n: ["Hajm", "Объём"], f: "V = S_asos · H" },
      { n: ["Yon sirt (to'g'ri)", "Боковая (прямая)"], f: "S_yon = P_asos · H" },
      { n: ["Muntazam uchburchak asos", "Правильный треугольник"], f: "S = a²√3 / 4" },
    ],
    s: [
      ["Asos yuzini toping.", "Найдите площадь основания."],
      ["Balandlikka ko'paytiring.", "Умножьте на высоту."],
    ],
    m: [
      { s: ["Asosi 6 × 4 to'g'ri to'rtburchak, balandligi 5. Hajmi?", "Основание — прямоугольник 6 × 4, высота 5. Объём?"],
        y: ["S = 24", "V = 24 · 5"], j: "120" },
      { s: ["Muntazam uchburchakli prizma: asos tomoni 2, balandligi 3. Hajmi va yon sirti?", "Правильная треугольная призма: сторона основания 2, высота 3. Объём и боковая поверхность?"],
        y: ["S = 4√3/4 = √3;  V = 3√3", "P = 6;  S_yon = 6 · 3"], j: "V = 3√3,  S_yon = 18" },
    ],
    x: [
      ["Yon sirt bilan hajmni aralashtirish.", "Путать боковую поверхность и объём."],
    ],
  },

  "Parallelepiped hajmi va sirti": {
    t: [
      { h: ["To'g'ri burchakli parallelepiped", "Прямоугольный параллелепипед"],
        p: ["Uch o'lcham a, b, c bo'lsa hajm V = abc, to'liq sirt S = 2(ab + bc + ac), diagonal d = √(a² + b² + c²). Kub — a = b = c: V = a³, S = 6a².",
          "При измерениях a, b, c: объём V = abc, полная поверхность S = 2(ab + bc + ac), диагональ d = √(a² + b² + c²). Куб: V = a³, S = 6a²."] },
    ],
    f: [
      { n: ["Hajm", "Объём"], f: "V = a · b · c" },
      { n: ["Sirt", "Поверхность"], f: "S = 2(ab + bc + ca)" },
      { n: ["Kub", "Куб"], f: "V = a³,   S = 6a²" },
    ],
    s: [
      ["Uch o'lchamni yozing.", "Запишите три измерения."],
      ["Formulaga qo'ying.", "Подставьте в формулу."],
    ],
    m: [
      { s: ["2 × 3 × 4 parallelepiped hajmi va sirti?", "Объём и поверхность параллелепипеда 2 × 3 × 4?"],
        y: ["V = 24", "S = 2(6 + 12 + 8) = 52"], j: "V = 24,  S = 52" },
      { s: ["Kub qirrasi 3. Hajmi va sirti?", "Ребро куба 3. Объём и поверхность?"],
        y: ["27;  6 · 9"], j: "V = 27,  S = 54" },
    ],
    x: [
      ["Sirtda 2 ko'paytuvchisini unutish.", "Забыть множитель 2 в поверхности."],
    ],
  },

  "Silindr sirti": {
    t: [
      { h: ["Yon va to'liq sirt", "Боковая и полная поверхность"],
        p: ["Silindrning yon sirti ochilsa to'g'ri to'rtburchak bo'ladi: bir tomoni asos aylanasi (2πR), ikkinchisi balandlik H. Demak S_yon = 2πRH. To'liq sirt yon sirt va ikki asos (2πR²): S = 2πR(R + H).",
          "Боковая поверхность цилиндра — развёртка-прямоугольник: одна сторона — длина окружности основания 2πR, другая — высота H. Значит S_бок = 2πRH. Полная: боковая плюс два основания (2πR²): S = 2πR(R + H)."] },
    ],
    f: [
      { n: ["Yon sirt", "Боковая"], f: "S_yon = 2πRH" },
      { n: ["To'liq sirt", "Полная"], f: "S = 2πR(R + H)" },
    ],
    s: [
      ["R va H ni aniqlang.", "Определите R и H."],
      ["Yon yoki to'liq sirt formulasini tanlang.", "Выберите формулу боковой или полной."],
    ],
    m: [
      { s: ["R = 3, H = 5. Yon va to'liq sirt?", "R = 3, H = 5. Боковая и полная поверхность?"],
        y: ["S_yon = 2π · 3 · 5 = 30π", "S = 2π · 3 · (3 + 5) = 48π"], j: "30π;  48π" },
      { s: ["Yoyilmasi kvadrat bo'lgan silindr: H = 2πR. Yon sirti R = 1 da?", "Развёртка цилиндра — квадрат (H = 2πR). Боковая поверхность при R = 1?"],
        y: ["H = 2π;  S = 2π · 1 · 2π"], j: "4π²" },
    ],
    x: [
      ["To'liq sirtda asoslarni unutish.", "Забыть основания в полной поверхности."],
    ],
  },

  "Konus hajmi": {
    t: [
      { h: ["Konus", "Конус"],
        p: ["Konus hajmi — o'sha asosli va balandlikli silindr hajmining uchdan biri. Yasovchi l, balandlik H va asos radiusi R to'g'ri burchakli uchburchak tashkil qiladi: l² = R² + H².",
          "Объём конуса — треть объёма цилиндра с тем же основанием и высотой. Образующая l, высота H и радиус R образуют прямоугольный треугольник: l² = R² + H²."] },
    ],
    f: [
      { n: ["Hajm", "Объём"], f: "V = ⅓ π R² H" },
      { n: ["Yasovchi", "Образующая"], f: "l² = R² + H²" },
    ],
    s: [
      ["R va H ni toping (kerak bo'lsa yasovchidan Pifagor bilan).", "Найдите R и H (при необходимости по образующей)."],
      ["V = ⅓πR²H ga qo'ying.", "Подставьте в V = ⅓πR²H."],
    ],
    m: [
      { s: ["R = 3, H = 4. Hajm va yasovchi?", "R = 3, H = 4. Объём и образующая?"],
        y: ["V = ⅓ · π · 9 · 4 = 12π", "l = √(9 + 16) = 5"], j: "V = 12π,  l = 5" },
      { s: ["Yasovchi 13, R = 5. Hajmi?", "Образующая 13, R = 5. Объём?"],
        y: ["H = √(169 − 25) = 12", "V = ⅓ π · 25 · 12"], j: "100π" },
    ],
    x: [
      ["⅓ ni unutish.", "Забыть ⅓."],
    ],
  },

  "Konus yon sirti": {
    t: [
      { h: ["Yon sirt", "Боковая поверхность"],
        p: ["Konusning yon sirti ochilganda sektor bo'ladi: radiusi yasovchi l, yoyi asos aylanasi 2πR. Shuning uchun S_yon = πRl, to'liq S = πR(R + l).",
          "Развёртка боковой поверхности конуса — сектор с радиусом l и дугой 2πR. Поэтому S_бок = πRl, полная S = πR(R + l)."] },
    ],
    f: [
      { n: ["Yon sirt", "Боковая"], f: "S_yon = π R l" },
      { n: ["To'liq sirt", "Полная"], f: "S = π R (R + l)" },
    ],
    s: [
      ["Yasovchi l ni toping (l² = R² + H²).", "Найдите образующую l."],
      ["Formulaga qo'ying.", "Подставьте."],
    ],
    m: [
      { s: ["R = 3, l = 5. Yon va to'liq sirt?", "R = 3, l = 5. Боковая и полная?"],
        y: ["S_yon = π · 3 · 5 = 15π", "S = π · 3 · (3 + 5) = 24π"], j: "15π;  24π" },
      { s: ["R = 6, H = 8. Yon sirti?", "R = 6, H = 8. Боковая поверхность?"],
        y: ["l = √(36 + 64) = 10", "π · 6 · 10"], j: "60π" },
    ],
    x: [
      ["l ni H bilan almashtirish.", "Подставить H вместо l."],
    ],
  },

  "Shar hajmi": {
    t: [
      { h: ["Shar", "Шар"],
        p: ["Shar — markazdan R dan uzoq bo'lmagan nuqtalar to'plami. Hajmi V = 4/3 π R³. Diametr bilan: V = π d³/6. Radius ikki marta ortsa hajm sakkiz marta ortadi.",
          "Шар — множество точек, удалённых от центра не более чем на R. Объём V = 4/3 π R³. Через диаметр: V = π d³/6. При увеличении радиуса вдвое объём растёт в восемь раз."] },
    ],
    f: [
      { n: ["Hajm", "Объём"], f: "V = 4/3 · π · R³" },
    ],
    s: [
      ["Radiusni toping (diametr berilsa yarmi).", "Найдите радиус (у диаметра половина)."],
      ["R³ ni hisoblab, 4π/3 ga ko'paytiring.", "Найдите R³ и умножьте на 4π/3."],
    ],
    m: [
      { s: ["R = 3. Sharning hajmi?", "R = 3. Объём шара?"],
        y: ["4/3 · π · 27"], j: "36π" },
      { s: ["Diametri 12. Hajmi?", "Диаметр 12. Объём?"],
        y: ["R = 6", "4/3 · π · 216"], j: "288π" },
    ],
    x: [
      ["R ni kvadratga ko'tarish (kub kerak).", "Возводить R в квадрат вместо куба."],
    ],
  },

  "Sfera sirtining yuzi": {
    t: [
      { h: ["Sfera", "Сфера"],
        p: ["Sfera — shar sirti. Yuzi S = 4πR² — katta doira yuzining to'rt barobari. Sfera va shar radiusi bir xil bo'lsa: sirt 4πR², hajm 4/3 πR³.",
          "Сфера — поверхность шара. Площадь S = 4πR² — четыре площади большого круга. При одном радиусе: поверхность 4πR², объём 4/3 πR³."] },
    ],
    f: [
      { n: ["Sfera yuzi", "Площадь сферы"], f: "S = 4 π R²" },
      { n: ["Katta doira", "Большой круг"], f: "S = π R²" },
    ],
    s: [
      ["R ni aniqlang.", "Найдите R."],
      ["S = 4πR² ga qo'ying.", "Подставьте в S = 4πR²."],
    ],
    m: [
      { s: ["R = 5. Sfera yuzi?", "R = 5. Площадь сферы?"],
        y: ["4π · 25"], j: "100π" },
      { s: ["Sfera yuzi 36π. Radiusi?", "Площадь сферы 36π. Радиус?"],
        y: ["4πR² = 36π  →  R² = 9"], j: "3" },
    ],
    x: [
      ["4 ni unutib πR² yozish (bu doira).", "Забыть 4: πR² — это круг."],
    ],
  },

  "Formulalarni tanish": {
    t: [
      { h: ["Jismlar jadvali", "Таблица тел"],
        p: ["Jismlarning formulalarini birlashtirib eslang: hajmlar — prizma va silindr S·H; piramida va konus ⅓·S·H; shar 4/3πR³. Sirtlar: silindr yon 2πRH, konus yon πRl, sfera 4πR². Savolda jism nomi va o'lchamlar berilsa mos formulani tanlash kerak.",
          "Соберите формулы тел: объёмы — призма и цилиндр S·H; пирамида и конус ⅓·S·H; шар 4/3πR³. Поверхности: цилиндр бок. 2πRH, конус бок. πRl, сфера 4πR². По названию тела и размерам выбирайте формулу."] },
    ],
    f: [
      { n: ["Prizma, silindr", "Призма, цилиндр"], f: "V = S · H" },
      { n: ["Piramida, konus", "Пирамида, конус"], f: "V = ⅓ · S · H" },
      { n: ["Shar", "Шар"], f: "V = 4/3 πR³,   S = 4πR²" },
    ],
    s: [
      ["Jism nomini aniqlang.", "Определите тело."],
      ["Hajm yoki sirt so'ralganini ajrating.", "Различите объём и поверхность."],
    ],
    m: [
      { s: ["Qaysi jismning hajmi ⅓ S H?", "У каких тел объём ⅓ S H?"],
        y: ["Uchli jismlar: piramida va konus"], j: "Piramida va konus" },
      { s: ["R = 3 shar va R = 3, H = 6 konus hajmlari nisbati?", "Отношение объёмов шара R = 3 и конуса R = 3, H = 6?"],
        y: ["Shar: 36π", "Konus: ⅓ π · 9 · 6 = 18π"], j: "2 : 1" },
    ],
    x: [
      ["Piramida hajmida ⅓ ni tashlash.", "Опустить ⅓ в объёме пирамиды."],
    ],
  },

  "Kombinatsiyalar": {
    t: [
      { h: ["Kombinatsiyalar", "Сочетания"],
        p: ["n elementdan k tasini tartibsiz tanlash: C(n; k) = n!/(k!(n − k)!). Xossalar: C(n; k) = C(n; n − k); C(n; 0) = C(n; n) = 1; C(n; k) + C(n; k + 1) = C(n + 1; k + 1). Barcha tanlashlar soni 2ⁿ.",
          "Выбор k элементов из n без учёта порядка: C(n; k) = n!/(k!(n − k)!). Свойства: C(n; k) = C(n; n − k); C(n; 0) = C(n; n) = 1; C(n; k) + C(n; k + 1) = C(n + 1; k + 1). Всех подмножеств 2ⁿ."] },
    ],
    f: [
      { n: ["C(n; k)", "C(n; k)"], f: "C(n; k) = n! / (k! · (n − k)!)" },
      { n: ["Simmetriya", "Симметрия"], f: "C(n; k) = C(n; n − k)" },
      { n: ["Qism to'plamlar", "Подмножества"], f: "2ⁿ" },
    ],
    s: [
      ["n va k ni aniqlang.", "Определите n и k."],
      ["k > n/2 bo'lsa simmetriyadan foydalaning.", "Если k > n/2 — применяйте симметрию."],
    ],
    m: [
      { s: ["C(10; 3) ni hisoblang.", "Вычислите C(10; 3)."],
        y: ["10 · 9 · 8 / (3 · 2 · 1) = 720 / 6"], j: "120" },
      { s: ["C(8; 2) + C(8; 3) ni hisoblang.", "Вычислите C(8; 2) + C(8; 3)."],
        y: ["C(9; 3) = 9 · 8 · 7 / 6"], j: "84" },
      { s: ["Nechta qism to'plam bor: A = {1; 2; 3; 5; 6; 7; 8; 9; 10} ∩ B = {3; 5; 6; 7; 8; 10; 11} ning?", "Сколько подмножеств у A ∩ B, где A = {1; 2; 3; 5; 6; 7; 8; 9; 10}, B = {3; 5; 6; 7; 8; 10; 11}?"],
        y: ["A ∩ B = {3; 5; 6; 7; 8; 10} — 6 element", "2⁶"], j: "64" },
    ],
    x: [
      ["C(n; k) ni tartibli deb hisoblash (A(n; k) bilan almashtirish).", "Считать C упорядоченным выбором (путать с A)."],
    ],
  },

  "Nyuton binomi": {
    t: [
      { h: ["Binom formulasi", "Формула бинома"],
        p: ["(a + b)ⁿ yoyilmasi: koeffitsiyentlar — C(n; k) (Paskal uchburchagi qatori). Hadlar soni n + 1. Umumiy had: Tₖ₊₁ = C(n; k) · aⁿ⁻ᵏ · bᵏ. Ayirmada b ning ishorasi bilan almashinuvchi ishora.",
          "Разложение (a + b)ⁿ: коэффициенты — C(n; k) (строка треугольника Паскаля). Членов n + 1. Общий член Tₖ₊₁ = C(n; k) · aⁿ⁻ᵏ · bᵏ. Для разности знаки чередуются."] },
    ],
    f: [
      { n: ["Binom", "Бином"], f: "(a + b)ⁿ = Σ C(n; k) · aⁿ⁻ᵏ · bᵏ" },
      { n: ["Umumiy had", "Общий член"], f: "Tₖ₊₁ = C(n; k) · aⁿ⁻ᵏ · bᵏ" },
      { n: ["Paskal", "Паскаль"], f: "1 · 1 1 · 1 2 1 · 1 3 3 1 · 1 4 6 4 1 · 1 5 10 10 5 1" },
    ],
    s: [
      ["Paskal qatoridan yoki C(n; k) dan koeffitsiyentlarni oling.", "Возьмите коэффициенты из Паскаля или C(n; k)."],
      ["a ning darajasi kamayib, b ning darajasi ortib boradi.", "Степень a убывает, b — растёт."],
    ],
    m: [
      { s: ["(x + 2)³ ni yoying.", "Разложите (x + 2)³."],
        y: ["1 · x³ + 3 · x² · 2 + 3 · x · 4 + 1 · 8"], j: "x³ + 6x² + 12x + 8" },
      { s: ["(1 + x)⁵ da x² oldidagi koeffitsiyent?", "Коэффициент при x² в (1 + x)⁵?"],
        y: ["C(5; 2) = 10"], j: "10" },
      { s: ["(a − b)⁴ ni yoying.", "Разложите (a − b)⁴."],
        y: ["Koeffitsiyentlar 1, 4, 6, 4, 1; ishoralar +, −, +, −, +"], j: "a⁴ − 4a³b + 6a²b² − 4ab³ + b⁴" },
    ],
    x: [
      ["Ayirmada ishoralarni almashtirmaslik.", "Не чередовать знаки в разности."],
    ],
  },

  "Ehtimollik": {
    t: [
      { h: ["Ehtimollik hisobi", "Вычисление вероятности"],
        p: ["P(A) = m/n — klassik ta'rif. «Kamida bitta» hodisa — qarama-qarshi hodisadan (hech biri) 1 ga to'ldirish. Ketma-ket tajribalarda ko'paytirish, birga bo'lmaydigan hodisalarda qo'shish. Shartli ehtimollik P(B | A) = P(A ∩ B)/P(A).",
          "P(A) = m/n — классическое определение. «Хотя бы один» — через противоположное (ни одного). В последовательных опытах перемножаем, для несовместных складываем. Условная вероятность P(B | A) = P(A ∩ B)/P(A)."] },
    ],
    f: [
      { n: ["Klassik", "Классическая"], f: "P = m / n" },
      { n: ["Kamida bitta", "Хотя бы один"], f: "P = 1 − P(hech biri)" },
      { n: ["Shartli", "Условная"], f: "P(B | A) = P(A ∩ B) / P(A)" },
    ],
    s: [
      ["Hodisani aniq ta'riflang: nima qulay?", "Чётко сформулируйте событие: что благоприятно?"],
      ["m va n ni kombinatorika bilan hisoblang.", "Найдите m и n комбинаторикой."],
      ["«Kamida» bo'lsa — qarama-qarshisi.", "«Хотя бы» — через противоположное."],
    ],
    m: [
      { s: ["Qopchada 8 moviy va 8 qizil shar. Ikkita shar ketma-ket olindi. Ikkalasi moviy bo'lish ehtimoli?", "В мешке 8 синих и 8 красных шаров. Вынули два подряд. Вероятность, что оба синие?"],
        y: ["8/16 · 7/15 = 56/240"], j: "7/30" },
      { s: ["Tanga 3 marta tashlandi. Kamida bitta gerb tushish ehtimoli?", "Монету бросили 3 раза. Вероятность хотя бы одного герба?"],
        y: ["Hech biri gerb bo'lmasligi: (1/2)³ = 1/8", "1 − 1/8"], j: "7/8" },
    ],
    x: [
      ["Qaytarmasdan olganda maxrajni kamaytirmaslik.", "Не уменьшить знаменатель при выборе без возврата."],
    ],
  },

  "O'rtacha kvadratik chetlanish": {
    t: [
      { h: ["Tarqoqlik o'lchovi", "Мера разброса"],
        p: ["O'rtacha qiymat ma'lumotlar qanchalik tarqoqligini aytmaydi. Dispersiya — o'rtachadan chetlanishlar kvadratlarining o'rtachasi; o'rtacha kvadratik chetlanish σ = √D — ma'lumot bilan bir xil birlikda. σ qancha kichik bo'lsa, qiymatlar o'rtacha atrofida shunchalik zich.",
          "Среднее не показывает разброс данных. Дисперсия — среднее квадратов отклонений от среднего; стандартное отклонение σ = √D имеет ту же единицу, что и данные. Чем меньше σ, тем плотнее значения вокруг среднего."] },
    ],
    f: [
      { n: ["O'rtacha", "Среднее"], f: "x̄ = (x₁ + … + xₙ) / n" },
      { n: ["Dispersiya", "Дисперсия"], f: "D = ( (x₁ − x̄)² + … + (xₙ − x̄)² ) / n" },
      { n: ["Chetlanish", "Отклонение"], f: "σ = √D" },
    ],
    s: [
      ["O'rtachani toping.", "Найдите среднее."],
      ["Har bir chetlanishni kvadratga ko'taring, o'rtachasini oling (D).", "Возведите отклонения в квадрат, найдите среднее (D)."],
      ["Ildiz oling (σ).", "Извлеките корень (σ)."],
    ],
    m: [
      { s: ["1, 3, 5, 7 ning dispersiyasi va σ?", "Дисперсия и σ для 1, 3, 5, 7?"],
        y: ["x̄ = 4", "Chetlanishlar kvadratlari: 9, 1, 1, 9  →  D = 20/4 = 5", "σ = √5"], j: "D = 5,  σ = √5" },
      { s: ["2, 4, 6 ning dispersiyasi?", "Дисперсия 2, 4, 6?"],
        y: ["x̄ = 4;  (4 + 0 + 4)/3"], j: "8/3" },
    ],
    x: [
      ["Kvadratga ko'tarmasdan chetlanishlarni qo'shish (yig'indi nol bo'ladi).", "Складывать отклонения без квадратов (сумма нуль)."],
      ["Ildizni olmasdan D ni σ deb yozish.", "Оставить D вместо σ."],
    ],
  },
};
