/**
 * TO'LIQ DARSLAR — 10–11-sinf: funksiyalar, tenglamalar, hosila, integral, hajm.
 * Tuzilishi `tolaqGeometriya.ts` dagidek. Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_ANALIZ: Record<string, Tolaq> = {
  "Ko'rsatkichli tenglamalar": {
    t: [
      { h: ["G'oya", "Идея"],
        p: ["Ko'rsatkichli funksiya aˣ (a > 0, a ≠ 1) har qiymatni faqat bir marta qabul qiladi, shuning uchun asoslar bir xil bo'lsa ko'rsatkichlarni tenglaymiz. Asoslar har xil bo'lsa — bir asosga keltiramiz yoki t = aˣ almashtirish qilamiz. Muhim: aˣ doim MUSBAT, shuning uchun t > 0.",
          "Показательная функция aˣ (a > 0, a ≠ 1) принимает каждое значение один раз, поэтому при равных основаниях приравниваем показатели. Если основания разные — приводим к одному или делаем замену t = aˣ. Важно: aˣ всегда ПОЛОЖИТЕЛЬНО, значит t > 0."] },
    ],
    f: [
      { n: ["Bir asos", "Одно основание"], f: "aᶠ⁽ˣ⁾ = aᵍ⁽ˣ⁾  ⇒  f(x) = g(x)" },
      { n: ["Darajalar", "Степени"], f: "aᵐ · aⁿ = aᵐ⁺ⁿ,   aᵐ / aⁿ = aᵐ⁻ⁿ,   (aᵐ)ⁿ = aᵐⁿ" },
      { n: ["Almashtirish", "Замена"], f: "t = aˣ,   t > 0" },
    ],
    s: [
      ["Hamma darajani bir asosga keltiring (4 = 2², 9 = 3², 1/2 = 2⁻¹).", "Приведите все степени к одному основанию (4 = 2², 9 = 3², 1/2 = 2⁻¹)."],
      ["aˣ⁺ᵏ = aˣ · aᵏ deb ajrating va t = aˣ deb yozing.", "Разложите aˣ⁺ᵏ = aˣ · aᵏ и введите t = aˣ."],
      ["t ni toping, t ≤ 0 larni tashlang, so'ng x ni toping.", "Найдите t, отбросьте t ≤ 0, затем найдите x."],
    ],
    m: [
      { s: ["2ˣ⁺¹ = 32 ni yeching.", "Решите 2ˣ⁺¹ = 32."],
        y: ["32 = 2⁵  →  x + 1 = 5"], j: "x = 4" },
      { s: ["4ˣ − 3 · 2ˣ + 2 = 0 ni yeching.", "Решите 4ˣ − 3 · 2ˣ + 2 = 0."],
        y: ["t = 2ˣ > 0:  t² − 3t + 2 = 0  →  t = 1  yoki  t = 2", "2ˣ = 1 → x = 0;   2ˣ = 2 → x = 1"], j: "x = 0,  x = 1" },
      { s: ["3³ˣ − 2 · 3²ˣ + 9 · 3ˣ⁻² = 0 ildizlari yig'indisini toping.", "Найдите сумму корней 3³ˣ − 2 · 3²ˣ + 9 · 3ˣ⁻² = 0."],
        y: ["9 · 3ˣ⁻² = 3² · 3ˣ / 3² = 3ˣ", "t = 3ˣ:  t³ − 2t² + t = 0  →  t(t − 1)² = 0", "t > 0 ⇒ t = 1  →  3ˣ = 1"], j: "x = 0" },
    ],
    x: [
      ["t > 0 shartini unutish: 2ˣ = −3 hech qachon bo'lmaydi.", "Забыть t > 0: 2ˣ = −3 невозможно."],
      ["Asoslar har xil turib ko'rsatkichlarni tenglash.", "Приравнивать показатели при разных основаниях."],
    ],
  },

  "Logarifm xossalari": {
    t: [
      { h: ["Logarifm nima", "Что такое логарифм"],
        p: ["log_a b — a ni qanday darajaga ko'tarsak b chiqadi. Shart: a > 0, a ≠ 1, b > 0. Ko'paytma yig'indiga, bo'linma ayirmaga, daraja ko'paytmaga aylanadi.",
          "log_a b — показатель степени, в которую нужно возвести a, чтобы получить b. Условия: a > 0, a ≠ 1, b > 0. Произведение превращается в сумму, частное — в разность, степень — в множитель."] },
    ],
    f: [
      { n: ["Ta'rif", "Определение"], f: "a^(log_a b) = b" },
      { n: ["Ko'paytma", "Произведение"], f: "log_a(bc) = log_a b + log_a c" },
      { n: ["Bo'linma", "Частное"], f: "log_a(b/c) = log_a b − log_a c" },
      { n: ["Daraja", "Степень"], f: "log_a bᵏ = k · log_a b" },
      { n: ["Asosni o'zgartirish", "Смена основания"], f: "log_a b = log_c b / log_c a" },
      { n: ["Maxsus qiymatlar", "Особые значения"], f: "log_a a = 1,   log_a 1 = 0" },
    ],
    s: [
      ["Sonlarni asos darajasi ko'rinishida yozing (8 = 2³, 27 = 3³).", "Запишите числа как степени основания (8 = 2³, 27 = 3³)."],
      ["Yig'indi/ayirmani bitta logarifmga yig'ing yoki aksincha.", "Соберите сумму/разность в один логарифм или наоборот."],
      ["Asos har xil bo'lsa — umumiy asosga o'ting.", "Если основания разные — перейдите к общему."],
    ],
    m: [
      { s: ["log₂ 12 − log₂ 3 ni hisoblang.", "Вычислите log₂ 12 − log₂ 3."],
        y: ["= log₂(12 / 3) = log₂ 4"], j: "2" },
      { s: ["log₉ 27 ni hisoblang.", "Вычислите log₉ 27."],
        y: ["27 = 3³,  9 = 3²", "log_{3²} 3³ = (3/2) · log₃ 3"], j: "3/2" },
      { s: ["2^(log₂ 5 + 1) ni hisoblang.", "Вычислите 2^(log₂ 5 + 1)."],
        y: ["= 2^(log₂ 5) · 2¹ = 5 · 2"], j: "10" },
    ],
    x: [
      ["log(b + c) ni log b + log c deb yozish — bunday qoida yo'q.", "Писать log(b + c) = log b + log c — такого правила нет."],
      ["Ifoda ichi musbat ekanini tekshirmaslik: log₂(−4) mavjud emas.", "Не проверять положительность аргумента: log₂(−4) не существует."],
    ],
  },

  "Logarifmik tenglamalar": {
    t: [
      { h: ["Aniqlanish sohasi birinchi", "Сначала ОДЗ"],
        p: ["Logarifm ichidagi ifoda va asos shartlarini birinchi yozing (ifoda > 0). Yechim oxirida topilgan ildizlar shu shartga tekshiriladi — logarifm xossalari sohani kengaytirib, begona ildiz hosil qilishi mumkin.",
          "Сначала запишите условия: аргумент > 0, основание > 0 и ≠ 1. Найденные корни проверяют по ним — свойства логарифмов могут расширять область и давать посторонние корни."] },
    ],
    f: [
      { n: ["Ta'rif bo'yicha", "По определению"], f: "log_a f(x) = c  ⇒  f(x) = aᶜ" },
      { n: ["Ikki logarifm", "Два логарифма"], f: "log_a f = log_a g  ⇒  f = g  (f > 0, g > 0)" },
      { n: ["Almashtirish", "Замена"], f: "t = log_a x" },
    ],
    s: [
      ["ODZ ni yozing: har bir logarifm ostidagi ifoda > 0.", "Запишите ОДЗ: выражение под каждым логарифмом > 0."],
      ["Logarifmlarni bittaga yig'ing va potensirlang (logarifmni oling).", "Соберите логарифмы в один и потенцируйте."],
      ["Tenglamani yeching, ildizlarni ODZ ga tekshiring.", "Решите уравнение и проверьте корни по ОДЗ."],
    ],
    m: [
      { s: ["log₂(x − 1) = 3 ni yeching.", "Решите log₂(x − 1) = 3."],
        y: ["ODZ: x > 1", "x − 1 = 2³ = 8  →  x = 9  (9 > 1 ✓)"], j: "x = 9" },
      { s: ["log₃ x + log₃(x + 2) = 1 ni yeching.", "Решите log₃ x + log₃(x + 2) = 1."],
        y: ["ODZ: x > 0", "log₃ x(x + 2) = 1  →  x² + 2x = 3  →  x² + 2x − 3 = 0", "x = 1  yoki  x = −3;   x = −3 ODZ ga kirmaydi"], j: "x = 1" },
      { s: ["lg²x − 3 lg x + 2 = 0 ni yeching.", "Решите lg²x − 3 lg x + 2 = 0."],
        y: ["t = lg x:  t² − 3t + 2 = 0  →  t = 1  yoki  t = 2", "x = 10¹ = 10;   x = 10² = 100"], j: "x = 10,  x = 100" },
    ],
    x: [
      ["ODZ ni tekshirmasdan ikkala ildizni javob qilish.", "Записать оба корня, не проверив ОДЗ."],
      ["log₃ x + log₃(x + 2) ni log₃(2x + 2) deb yozish — bu qo'shish emas, ko'paytirish.", "Заменять log₃ x + log₃(x + 2) на log₃(2x + 2) — под логарифмом ПРОИЗВЕДЕНИЕ."],
    ],
  },

  "Irratsional tenglamalar": {
    t: [
      { h: ["Ildizli tenglama", "Иррациональное уравнение"],
        p: ["Noma'lum ildiz ostida turadi. Yechish: ildizni yakkalab, ikkala tomonni kvadratga ko'taramiz. Kvadratga ko'tarish begona ildiz qo'shishi mumkin, shuning uchun HAR DOIM tekshiriladi. Ildiz qiymati manfiy emas: √f = g bo'lsa g ≥ 0.",
          "Неизвестное стоит под корнем. Уединяем корень и возводим обе части в квадрат. Возведение может дать посторонние корни, поэтому ВСЕГДА делаем проверку. Значение корня неотрицательно: если √f = g, то g ≥ 0."] },
      { h: ["Irratsional tengsizlik", "Иррациональное неравенство"],
        p: ["√f < g ko'rinishida uchta shart birga: f ≥ 0, g > 0, f < g². √f > g da esa ikki hol: g < 0 bo'lsa f ≥ 0 yetarli; g ≥ 0 bo'lsa f > g².",
          "Для √f < g одновременно: f ≥ 0, g > 0, f < g². Для √f > g два случая: g < 0 — достаточно f ≥ 0; g ≥ 0 — тогда f > g²."] },
    ],
    f: [
      { n: ["Tenglama", "Уравнение"], f: "√f = g  ⇔  f = g²,  g ≥ 0" },
      { n: ["Tengsizlik", "Неравенство"], f: "√f < g  ⇔  f ≥ 0,  g > 0,  f < g²" },
    ],
    s: [
      ["Ildizni bir tomonga yakkalang.", "Уедините корень."],
      ["Kvadratga ko'taring va hosil bo'lgan tenglamani yeching.", "Возведите в квадрат и решите получившееся уравнение."],
      ["g ≥ 0 shartini tekshiring — begona ildizni tashlang.", "Проверьте условие g ≥ 0 — отбросьте посторонние корни."],
    ],
    m: [
      { s: ["√(x + 3) = x − 3 ni yeching.", "Решите √(x + 3) = x − 3."],
        y: ["x + 3 = (x − 3)²  →  x² − 7x + 6 = 0  →  x = 1  yoki  x = 6", "Shart x − 3 ≥ 0:  x = 1 mos emas", "Tekshiruv: √9 = 3 = 6 − 3 ✓"], j: "x = 6" },
      { s: ["√(2x − 1) = 3 ni yeching.", "Решите √(2x − 1) = 3."],
        y: ["2x − 1 = 9  →  x = 5", "Tekshiruv: √9 = 3 ✓"], j: "x = 5" },
      { s: ["√(x + 18) < 2 − x ni yeching.", "Решите √(x + 18) < 2 − x."],
        y: ["x + 18 ≥ 0  →  x ≥ −18", "2 − x > 0  →  x < 2", "x + 18 < (2 − x)²  →  x² − 5x − 14 > 0  →  (x − 7)(x + 2) > 0  →  x < −2  yoki  x > 7",
          "Uchala shartni kesishtiramiz"], j: "[−18; −2)" },
    ],
    x: [
      ["Tekshirmasdan javob yozish: 1 ildiz x − 3 < 0 ni buzadi.", "Не проверить: корень 1 нарушает x − 3 ≥ 0."],
      ["Tengsizlikda faqat f < g² ni yozib, f ≥ 0 va g > 0 ni unutish.", "В неравенстве записать только f < g², забыв f ≥ 0 и g > 0."],
    ],
  },

  "Ratsional tengsizliklar": {
    t: [
      { h: ["Oraliqlar usuli", "Метод интервалов"],
        p: ["Hamma hadni bir tomonga o'tkazib, kasrni bitta kasrga keltiramiz va suratni ham, maxrajni ham ko'paytuvchilarga ajratamiz. Har bir ko'paytuvchining nol nuqtasini son o'qiga qo'yamiz; oraliqlarda ishora navbatma-navbat almashadi (juft karrali ildizda almashmaydi).",
          "Переносим всё в одну часть, приводим к одной дроби и раскладываем числитель и знаменатель на множители. Нули каждого множителя отмечаем на оси; на промежутках знак чередуется (при корне чётной кратности не меняется)."] },
      { h: ["Muhim qoida", "Важное правило"],
        p: ["Ikkala tomonni maxrajga ko'paytirib bo'lmaydi — uning ishorasi noma'lum. Maxrajning nollari HECH QACHON yechimga kirmaydi (dumaloq qavs).",
          "Нельзя умножать обе части на знаменатель — его знак неизвестен. Нули знаменателя НИКОГДА не входят в решение (круглые скобки)."] },
    ],
    f: [
      { n: ["Umumiy ko'rinish", "Общий вид"], f: "P(x) / Q(x) > 0  ⇔  P(x) · Q(x) > 0,  Q ≠ 0" },
    ],
    s: [
      ["Hammasini bir tomonga o'tkazing: kasr > 0 yoki < 0.", "Перенесите всё в одну часть: дробь > 0 или < 0."],
      ["Umumiy maxrajga keltiring va surat, maxrajni ko'paytuvchilarga ajrating.", "Приведите к общему знаменателю, разложите числитель и знаменатель."],
      ["Nollarni o'qqa qo'ying, eng o'ng oraliqdan ishoralarni yozing.", "Отметьте нули на оси, расставьте знаки, начиная с правого промежутка."],
      ["Kerakli ishorali oraliqlarni tanlang (maxraj nollari — ochiq qavs).", "Выберите промежутки нужного знака (нули знаменателя — круглые скобки)."],
    ],
    m: [
      { s: ["(x − 1)/(x + 2) > 0 ni yeching.", "Решите (x − 1)/(x + 2) > 0."],
        y: ["Nollar: x = 1 (surat), x = −2 (maxraj)", "Ishoralar (o'ngdan): +, −, +"], j: "x < −2  yoki  x > 1" },
      { s: ["(5x + 3)/(x² + x − 2) > 1 ning butun yechimlari yig'indisini toping.", "Найдите сумму целых решений (5x + 3)/(x² + x − 2) > 1."],
        y: ["(5x + 3 − x² − x + 2) / (x² + x − 2) > 0  →  (−x² + 4x + 5) / (x² + x − 2) > 0",
          "(x − 5)(x + 1) / ((x + 2)(x − 1)) < 0",
          "Nollar: −2, −1, 1, 5;  ishora −  oraliqlari: (−2; −1) va (1; 5)",
          "Butun sonlar: 2, 3, 4"], j: "9" },
    ],
    x: [
      ["Kasrni maxrajga ko'paytirib, tengsizlik ishorasini saqlash.", "Умножить на знаменатель, не учитывая его знак."],
      ["Maxraj nolini yechimga kiritish (kvadrat qavs).", "Включить нуль знаменателя в решение (квадратная скобка)."],
    ],
  },

  "Sodda trigonometrik tenglamalar": {
    t: [
      { h: ["Uch asosiy tenglama", "Три основных уравнения"],
        p: ["sin x = a va cos x = a uchun |a| ≤ 1 bo'lishi shart, aks holda yechim yo'q. Davr tufayli yechimlar cheksiz: har doim + πk yoki + 2πk qo'shiladi (k — butun son). Murakkab tenglama ko'paytuvchilarga ajratilib, har biri nolga tenglanadi.",
          "Для sin x = a и cos x = a нужно |a| ≤ 1, иначе решений нет. Из-за периодичности решений бесконечно: всегда добавляется πk или 2πk (k — целое). Сложное уравнение раскладывают на множители и приравнивают каждый к нулю."] },
    ],
    f: [
      { n: ["sin x = a", "sin x = a"], f: "x = (−1)ᵏ · arcsin a + πk" },
      { n: ["cos x = a", "cos x = a"], f: "x = ± arccos a + 2πk" },
      { n: ["tg x = a", "tg x = a"], f: "x = arctg a + πk" },
      { n: ["Maxsus hollar", "Особые случаи"], f: "sin x = 0: x = πk;   cos x = 0: x = π/2 + πk" },
      { n: ["Ko'paytmaga aylantirish", "Разность синусов"], f: "sin A − sin B = 2 cos((A+B)/2) · sin((A−B)/2)" },
    ],
    s: [
      ["Tenglamani sin(…) = a ko'rinishiga keltiring.", "Приведите уравнение к виду sin(…) = a."],
      ["|a| ≤ 1 ni tekshiring; mos formuladan foydalaning.", "Проверьте |a| ≤ 1; используйте подходящую формулу."],
      ["Burchak x emas, 2x yoki x/2 bo'lsa, oxirida x ni ajrating.", "Если под функцией 2x или x/2 — в конце выразите x."],
      ["Berilgan kesmadagi ildizlarni k ning butun qiymatlari bilan sanang.", "Ищите корни на отрезке, перебирая целые k."],
    ],
    m: [
      { s: ["sin x = 1/2 ni yeching.", "Решите sin x = 1/2."],
        y: ["arcsin(1/2) = π/6"], j: "x = (−1)ᵏ · π/6 + πk" },
      { s: ["cos 2x = 0 ni yeching.", "Решите cos 2x = 0."],
        y: ["2x = π/2 + πk", "x = π/4 + πk/2"], j: "x = π/4 + πk/2" },
      { s: ["sin 7x · cos x = sin 6x ni yeching; eng kichik musbat ildizni toping.", "Решите sin 7x · cos x = sin 6x; найдите наименьший положительный корень."],
        y: ["sin 7x · cos x = ½(sin 8x + sin 6x)  →  ½ sin 8x + ½ sin 6x = sin 6x",
          "sin 8x = sin 6x  →  sin 8x − sin 6x = 2 cos 7x · sin x = 0",
          "sin x = 0: x = πk;   cos 7x = 0: 7x = π/2 + πk  →  x = π/14 + πk/7",
          "Eng kichik musbat: π/14 ≈ 0,224  (π dan kichik)"], j: "π/14" },
    ],
    x: [
      ["cos x = a da ± ni unutish: ikkala ishora ham ildiz.", "Забыть ± в cos x = a: оба знака дают корни."],
      ["Davrni unutish: +πk (sin, tg) yoki +2πk (cos) qo'shilishi shart.", "Забыть период: нужно +πk (sin, tg) или +2πk (cos)."],
    ],
  },

  "Murakkab funksiya": {
    t: [
      { h: ["Kompozitsiya", "Композиция"],
        p: ["f(g(x)) — avval ichki g ni hisoblab, natijani f ga qo'yish. Tartib muhim: f(g(x)) va g(f(x)) odatda har xil. Ichki funksiya qiymatlari tashqisining aniqlanish sohasiga tushishi kerak.",
          "f(g(x)) — сначала считаем внутреннюю g, результат подставляем в f. Порядок важен: f(g(x)) и g(f(x)) обычно разные. Значения внутренней должны попадать в область определения внешней."] },
    ],
    f: [
      { n: ["Kompozitsiya", "Композиция"], f: "(f ∘ g)(x) = f(g(x))" },
      { n: ["Hosila (11-sinf)", "Производная (11 класс)"], f: "(f(g(x)))′ = f′(g(x)) · g′(x)" },
    ],
    s: [
      ["Ichki funksiya g(x) ni ifoda sifatida yozing.", "Запишите внутреннюю g(x) как выражение."],
      ["f dagi x o'rniga QAVS ichida g(x) ni qo'ying.", "Подставьте g(x) в скобках вместо x в f."],
      ["Qavslarni oching va ixchamlang.", "Раскройте скобки и упростите."],
    ],
    m: [
      { s: ["f(x) = x² − 1, g(x) = 3 − 2x. f(g(x)) ni toping.", "f(x) = x² − 1, g(x) = 3 − 2x. Найдите f(g(x))."],
        y: ["f(g(x)) = (3 − 2x)² − 1", "= 9 − 12x + 4x² − 1"], j: "4x² − 12x + 8" },
      { s: ["Xuddi shularda g(f(x)) ni toping.", "Для тех же функций найдите g(f(x))."],
        y: ["g(f(x)) = 3 − 2(x² − 1) = 3 − 2x² + 2"], j: "5 − 2x²" },
    ],
    x: [
      ["Qavsni unutish: (3 − 2x)² ni 3 − 2x² deb yozish.", "Забыть скобки: писать (3 − 2x)² как 3 − 2x²."],
      ["f(g(x)) bilan g(f(x)) ni bir xil deb olish.", "Считать f(g(x)) и g(f(x)) одинаковыми."],
    ],
  },

  "Juft va toq funksiyalar": {
    t: [
      { h: ["Ta'rif", "Определение"],
        p: ["Avval aniqlanish sohasi 0 ga nisbatan simmetrik bo'lishi shart. Keyin f(−x) ni hisoblaymiz: f(x) bilan bir xil chiqsa — juft (grafik Oy o'qiga simmetrik), −f(x) chiqsa — toq (koordinata boshiga simmetrik), aks holda na juft, na toq.",
          "Сначала область определения должна быть симметрична относительно 0. Затем считаем f(−x): совпало с f(x) — чётная (график симметричен относительно Oy), с −f(x) — нечётная (симметричен относительно начала), иначе ни та, ни другая."] },
    ],
    f: [
      { n: ["Juft", "Чётная"], f: "f(−x) = f(x)" },
      { n: ["Toq", "Нечётная"], f: "f(−x) = −f(x)" },
      { n: ["Ko'paytma qoidasi", "Правило произведения"], f: "juft·juft = juft,  toq·toq = juft,  juft·toq = toq" },
      { n: ["Namunalar", "Примеры"], f: "juft: x², x⁴, cos x, |x|;   toq: x, x³, sin x, tg x" },
    ],
    s: [
      ["Aniqlanish sohasi simmetrikmi? (√x sohasi [0; ∞) — simmetrik emas.)", "Симметрична ли область? (у √x область [0; ∞) — не симметрична.)"],
      ["f(−x) ni hisoblang: x o'rniga (−x) qo'ying.", "Вычислите f(−x): подставьте (−x) вместо x."],
      ["f(x) yoki −f(x) bilan solishtiring.", "Сравните с f(x) или −f(x)."],
    ],
    m: [
      { s: ["y = sin x · (1 + x²) juftmi yoki toqmi?", "Чётна или нечётна y = sin x · (1 + x²)?"],
        y: ["sin(−x) = −sin x,   1 + (−x)² = 1 + x²", "f(−x) = −sin x · (1 + x²) = −f(x)"], j: "Toq" },
      { s: ["y = x⁴ + x² juftmi?", "Чётна ли y = x⁴ + x²?"],
        y: ["f(−x) = (−x)⁴ + (−x)² = x⁴ + x² = f(x)"], j: "Juft" },
      { s: ["y = x² + x juftmi yoki toqmi?", "Чётна или нечётна y = x² + x?"],
        y: ["f(−x) = x² − x", "f(x) ga ham, −f(x) = −x² − x ga ham teng emas"], j: "Na juft, na toq" },
    ],
    x: [
      ["Sohani tekshirmay: y = √x + x⁴ ning sohasi simmetrik emas, demak juft ham, toq ham emas.", "Не проверить область: у y = √x + x⁴ она несимметрична — функция ни чётная, ни нечётная."],
      ["Yig'indida bitta toq had yetarli deb o'ylash — hamma hadlar toq bo'lishi kerak.", "Считать, что достаточно одного нечётного слагаемого — нужны все нечётные."],
    ],
  },

  "Hosilalar jadvali": {
    t: [
      { h: ["Hosila nima", "Что такое производная"],
        p: ["Hosila funksiyaning o'zgarish tezligi: grafikka o'tkazilgan urinmaning qiyaligi. Hosilani formulalar jadvali va uch qoida bilan topamiz: yig'indi, ko'paytma, bo'linma va murakkab funksiya.",
          "Производная — скорость изменения функции: угловой коэффициент касательной к графику. Её находят по таблице и четырём правилам: сумма, произведение, частное и сложная функция."] },
    ],
    f: [
      { n: ["Daraja", "Степень"], f: "(xⁿ)′ = n · xⁿ⁻¹,   (C)′ = 0,   (x)′ = 1" },
      { n: ["Trigonometrik", "Тригонометрия"], f: "(sin x)′ = cos x,   (cos x)′ = −sin x,   (tg x)′ = 1/cos²x" },
      { n: ["Ko'rsatkichli va logarifm", "Показательная и логарифм"], f: "(eˣ)′ = eˣ,   (aˣ)′ = aˣ ln a,   (ln x)′ = 1/x" },
      { n: ["Ko'paytma", "Произведение"], f: "(u · v)′ = u′v + u v′" },
      { n: ["Bo'linma", "Частное"], f: "(u / v)′ = (u′v − u v′) / v²" },
      { n: ["Murakkab funksiya", "Сложная функция"], f: "(f(g(x)))′ = f′(g(x)) · g′(x)" },
    ],
    s: [
      ["Funksiya qanday amal bilan tuzilganini aniqlang: yig'indi, ko'paytma, bo'linma, ichma-ich.", "Определите структуру функции: сумма, произведение, частное, вложенность."],
      ["Mos qoidani qo'llang va har bir bo'lakning hosilasini jadvaldan oling.", "Примените правило и возьмите производную каждой части из таблицы."],
      ["Ichki funksiya bo'lsa — uning hosilasiga ham ko'paytiring.", "Если есть внутренняя функция — умножьте на её производную."],
    ],
    m: [
      { s: ["f(t) = t⁴ − 2t² + 1 bo'lsa, f′(1) ni hisoblang.", "Если f(t) = t⁴ − 2t² + 1, найдите f′(1)."],
        y: ["f′(t) = 4t³ − 4t", "f′(1) = 4 − 4"], j: "0" },
      { s: ["f(x) = x²⁰²¹ − cos x ning hosilasini toping.", "Найдите производную f(x) = x²⁰²¹ − cos x."],
        y: ["(x²⁰²¹)′ = 2021 · x²⁰²⁰,   (−cos x)′ = +sin x"], j: "2021x²⁰²⁰ + sin x" },
      { s: ["y = x² · sin x ning hosilasini toping.", "Найдите производную y = x² · sin x."],
        y: ["u = x², v = sin x:  u′ = 2x,  v′ = cos x", "y′ = 2x · sin x + x² · cos x"], j: "2x sin x + x² cos x" },
      { s: ["y = sin 3x ning hosilasini toping.", "Найдите производную y = sin 3x."],
        y: ["Tashqi: sin, ichki: 3x (hosilasi 3)", "y′ = cos 3x · 3"], j: "3 cos 3x" },
    ],
    x: [
      ["(uv)′ = u′v′ deb yozish — to'g'risi u′v + uv′.", "Писать (uv)′ = u′v′ — верно u′v + uv′."],
      ["cos x hosilasida minusni tushirish: (cos x)′ = −sin x.", "Терять минус: (cos x)′ = −sin x."],
      ["Murakkab funksiyada ichki funksiya hosilasiga ko'paytirmaslik.", "Не умножать на производную внутренней функции."],
    ],
  },

  "Ekstremum nuqtalari": {
    t: [
      { h: ["Ekstremum", "Экстремум"],
        p: ["Ekstremum — funksiya qiymati atrofdagilardan katta (maksimum) yoki kichik (minimum) bo'lgan nuqta. Bunday nuqta faqat f′(x) = 0 yoki hosila mavjud bo'lmagan joyda bo'lishi mumkin — bular kritik nuqtalar. Lekin har bir kritik nuqta ekstremum emas: hosila ishora ALMASHTIRISHI shart.",
          "Экстремум — точка, где значение больше (максимум) или меньше (минимум) значений вокруг. Возможен лишь там, где f′(x) = 0 или производной нет — это критические точки. Но не каждая критическая точка — экстремум: производная должна МЕНЯТЬ знак."] },
      { h: ["Grafikdan ekstremum sanash", "Считать экстремумы по графику"],
        p: ["Agar y = f′(x) grafigi berilsa: f′ ning nol nuqtalarida ishorasi + dan − ga o'tsa — maksimum, − dan + ga o'tsa — minimum. Ishora almashmay grafik o'qqa faqat tegib o'tsa — ekstremum yo'q.",
          "Если дан график y = f′(x): в нулях f′ смена знака с + на − — максимум, с − на + — минимум. Если график лишь касается оси без смены знака — экстремума нет."] },
    ],
    f: [
      { n: ["Maksimum", "Максимум"], f: "f′: +  →  −" },
      { n: ["Minimum", "Минимум"], f: "f′: −  →  +" },
      { n: ["Kritik nuqta", "Критическая точка"], f: "f′(x) = 0" },
    ],
    s: [
      ["f′(x) ni toping va f′(x) = 0 ni yeching.", "Найдите f′(x) и решите f′(x) = 0."],
      ["Kritik nuqtalarni o'qqa qo'yib, oraliqlarda f′ ishorasini aniqlang.", "Отметьте критические точки и определите знак f′ на промежутках."],
      ["Ishora almashishiga qarab max/min ni ajrating; qiymatni f(x) dan toping.", "По смене знака определите max/min; значение найдите из f(x)."],
    ],
    m: [
      { s: ["f(x) = x³ − 3x ning ekstremumlarini toping.", "Найдите экстремумы f(x) = x³ − 3x."],
        y: ["f′(x) = 3x² − 3 = 0  →  x = −1,  x = 1",
          "Ishoralar: (−∞; −1): +,  (−1; 1): −,  (1; ∞): +",
          "x = −1: + → −  maksimum,  f(−1) = 2",
          "x = 1: − → +  minimum,  f(1) = −2"], j: "max x = −1 (2),  min x = 1 (−2)" },
      { s: ["y = f′(x) grafigi o'qni x = −5 (− → +), −1 (+ → −), 2 (− → +), 8 (+ → −), 11 (− → +) da kesib o'tadi. f ning maksimum va minimum nuqtalari nechta?",
            "График y = f′(x) пересекает ось в x = −5 (− → +), −1 (+ → −), 2 (− → +), 8 (+ → −), 11 (− → +). Сколько точек максимума и минимума у f?"],
        y: ["+ → −: −1 va 8", "− → +: −5, 2 va 11"], j: "2 ta maksimum,  3 ta minimum" },
    ],
    x: [
      ["f′(x) = 0 bo'lgan har bir nuqtani ekstremum deb olish: y = x³ da f′(0) = 0, lekin ekstremum yo'q.", "Считать экстремумом любую точку с f′ = 0: у y = x³ f′(0) = 0, но экстремума нет."],
      ["Maksimum bilan eng katta qiymatni aralashtirish: maksimum — faqat atrofdagilarga nisbatan.", "Путать максимум и наибольшее значение: максимум — лишь среди соседних."],
    ],
  },

  "Boshlang'ich funksiya": {
    t: [
      { h: ["Hosilaning teskarisi", "Обратное к производной"],
        p: ["F(x) funksiya f(x) uchun boshlang'ich funksiya, agar F′(x) = f(x) bo'lsa. Bunday funksiyalar cheksiz ko'p, ular o'zgarmas C bilan farq qiladi — shu sabab javobga doim + C yoziladi. Tekshirish oson: javobning hosilasini oling.",
          "F(x) — первообразная f(x), если F′(x) = f(x). Их бесконечно много, они отличаются на постоянную C — поэтому ответ всегда с + C. Проверка проста: возьмите производную ответа."] },
    ],
    f: [
      { n: ["Daraja", "Степень"], f: "∫ xⁿ dx = xⁿ⁺¹ / (n + 1) + C   (n ≠ −1)" },
      { n: ["Trigonometrik", "Тригонометрия"], f: "∫ cos x dx = sin x + C,   ∫ sin x dx = −cos x + C" },
      { n: ["Kvadrat maxrajli", "Со квадратом в знаменателе"], f: "∫ dx/cos²x = tg x + C,   ∫ dx/sin²x = −ctg x + C" },
      { n: ["Boshqalar", "Другие"], f: "∫ eˣ dx = eˣ + C,   ∫ dx/x = ln|x| + C" },
      { n: ["Ichki chiziqli", "Линейная замена"], f: "∫ f(kx + b) dx = (1/k) · F(kx + b) + C" },
    ],
    s: [
      ["Funksiyani jadvalga mos bo'laklarga ajrating (hadma-had).", "Разбейте функцию на табличные слагаемые."],
      ["Har bir bo'lakka formulani qo'llang, o'zgarmas ko'paytuvchini tashqariga chiqaring.", "К каждому слагаемому примените формулу, вынесите постоянный множитель."],
      ["+ C ni yozing; javobning hosilasini olib tekshiring.", "Допишите + C; проверьте, взяв производную."],
    ],
    m: [
      { s: ["∫ (3x² − 4x + 5) dx ni toping.", "Найдите ∫ (3x² − 4x + 5) dx."],
        y: ["∫ 3x² dx = x³,   ∫ (−4x) dx = −2x²,   ∫ 5 dx = 5x"], j: "x³ − 2x² + 5x + C" },
      { s: ["f(x) = 1/(1 − cos(−x + 8π)) ning boshlang'ich funksiyasini toping.", "Найдите первообразную f(x) = 1/(1 − cos(−x + 8π))."],
        y: ["cos(−x + 8π) = cos x  (juft va davr 2π)", "1 − cos x = 2 sin²(x/2)  →  f = 1 / (2 sin²(x/2))",
          "∫ dx / sin²(x/2) = −2 ctg(x/2)  →  yarmi: −ctg(x/2)",
          "Tekshiruv: (−ctg(x/2))′ = (1/sin²(x/2)) · ½ ✓"], j: "−ctg(x/2) + C" },
      { s: ["f(x) = 2x, F(0) = 1 bo'lgan boshlang'ich funksiyani toping.", "Найдите первообразную f(x) = 2x, если F(0) = 1."],
        y: ["F(x) = x² + C", "F(0) = C = 1"], j: "F(x) = x² + 1" },
    ],
    x: [
      ["+ C ni tashlab ketish.", "Забыть + C."],
      ["∫ f(kx + b) da 1/k ni unutish: ∫ cos 3x dx = (1/3) sin 3x.", "Забыть 1/k: ∫ cos 3x dx = (1/3) sin 3x."],
      ["∫ xⁿ dx da n + 1 ga bo'lishni unutish.", "Забыть делить на n + 1 в ∫ xⁿ dx."],
    ],
  },

  "Aniq integral. Nyuton–Leybnis": {
    t: [
      { h: ["Formula", "Формула"],
        p: ["Aniq integral — son. U boshlang'ich funksiyaning yuqori chegaradagi qiymatidan quyi chegaradagi qiymatini ayirib topiladi. Bunda + C tushib qoladi, chunki ayirmada yo'qoladi.",
          "Определённый интеграл — число: значение первообразной на верхнем пределе минус на нижнем. Постоянная C сокращается при вычитании."] },
    ],
    f: [
      { n: ["Nyuton–Leybnis", "Ньютон–Лейбниц"], f: "∫ₐᵇ f(x) dx = F(b) − F(a)" },
      { n: ["Chegaralarni almashtirish", "Перестановка пределов"], f: "∫ₐᵇ = −∫ᵇₐ" },
      { n: ["Bo'lish", "Разбиение"], f: "∫ₐᵇ = ∫ₐᶜ + ∫ᶜᵇ" },
    ],
    s: [
      ["Boshlang'ich funksiya F(x) ni toping (C kerak emas).", "Найдите первообразную F(x) (C не нужна)."],
      ["Yuqori chegarani qo'ying: F(b); pastkisini: F(a).", "Подставьте верхний предел F(b) и нижний F(a)."],
      ["F(b) − F(a) ni hisoblang — tartibni buzmang.", "Вычислите F(b) − F(a) — порядок важен."],
    ],
    m: [
      { s: ["∫₀² x² dx ni hisoblang.", "Вычислите ∫₀² x² dx."],
        y: ["F(x) = x³/3", "F(2) − F(0) = 8/3 − 0"], j: "8/3" },
      { s: ["∫₀^π sin x dx ni hisoblang.", "Вычислите ∫₀^π sin x dx."],
        y: ["F(x) = −cos x", "F(π) − F(0) = −cos π − (−cos 0) = 1 + 1"], j: "2" },
      { s: ["∫₁⁴ (2x + 1) dx ni hisoblang.", "Вычислите ∫₁⁴ (2x + 1) dx."],
        y: ["F(x) = x² + x", "F(4) − F(1) = (16 + 4) − (1 + 1) = 20 − 2"], j: "18" },
    ],
    x: [
      ["F(a) − F(b) tartibida ayirish — javob ishorasi teskari bo'ladi.", "Вычитать F(a) − F(b) — ответ получит обратный знак."],
      ["Quyi chegarada 0 qo'yib, F(0) ni har doim 0 deb olish: F(0) = 0 emas bo'lishi mumkin (masalan cos).", "Считать F(0) всегда нулём: у −cos x значение F(0) = −1."],
    ],
  },

  "Egri chiziqli trapetsiya yuzi": {
    t: [
      { h: ["Integral — yuz", "Интеграл — площадь"],
        p: ["f(x) ≥ 0 bo'lsa, [a; b] da grafik ostidagi yuz aniq integralga teng. Ikki egri chiziq orasidagi yuz — yuqoridagidan pastkisini ayirib integrallash. Chegaralar — chiziqlarning kesishish nuqtalari.",
          "Если f(x) ≥ 0, площадь под графиком на [a; b] равна определённому интегралу. Площадь между двумя кривыми — интеграл от (верхняя − нижняя). Пределы — точки пересечения кривых."] },
    ],
    f: [
      { n: ["Grafik ostida", "Под графиком"], f: "S = ∫ₐᵇ f(x) dx   (f ≥ 0)" },
      { n: ["Ikki chiziq orasida", "Между кривыми"], f: "S = ∫ₐᵇ ( f(x) − g(x) ) dx,   f ≥ g" },
    ],
    s: [
      ["Chizma chizing; qaysi chiziq yuqorida ekanini aniqlang.", "Сделайте эскиз; определите, какая кривая выше."],
      ["f(x) = g(x) ni yechib, chegaralar a va b ni toping.", "Решите f(x) = g(x) — это пределы a и b."],
      ["∫(yuqori − pastki) ni hisoblang; natija musbat bo'lishi kerak.", "Вычислите ∫(верхняя − нижняя); результат должен быть положительным."],
    ],
    m: [
      { s: ["y = x², x = 0, x = 3 va Ox orasidagi yuzni toping.", "Найдите площадь под y = x² на [0; 3]."],
        y: ["S = ∫₀³ x² dx = 27/3 − 0"], j: "9" },
      { s: ["f(x) = 2√x va g(x) = 2x grafiklari bilan chegaralangan yuzni toping.", "Найдите площадь фигуры, ограниченной графиками f(x) = 2√x и g(x) = 2x."],
        y: ["2√x = 2x  →  √x = x  →  x = 0  yoki  x = 1  (2 ta umumiy nuqta)",
          "[0; 1] da √x ≥ x, demak f yuqorida",
          "S = ∫₀¹ (2√x − 2x) dx = [ (4/3)x^(3/2) − x² ]₀¹ = 4/3 − 1"], j: "1/3" },
      { s: ["y = 4 − x² va Ox o'qi orasidagi yuzni toping.", "Найдите площадь между y = 4 − x² и осью Ox."],
        y: ["4 − x² = 0  →  x = ±2", "S = ∫₋₂² (4 − x²) dx = [4x − x³/3]₋₂²", "= (8 − 8/3) − (−8 + 8/3) = 16 − 16/3"], j: "32/3" },
    ],
    x: [
      ["Yuqori va pastki chiziqni almashtirish — natija manfiy chiqadi.", "Перепутать верхнюю и нижнюю кривые — получится отрицательная площадь."],
      ["Kesishish nuqtalarini topmay, chegarani taxmin qilish.", "Брать пределы «на глаз», не решив f = g."],
    ],
  },

  "Silindr hajmi": {
    t: [
      { h: ["Silindr", "Цилиндр"],
        p: ["Silindr hajmi — asos yuzi ko'paytirilgan balandlik. Yon sirti ochilsa to'g'ri to'rtburchak bo'ladi (eni 2πR, bo'yi H). Hisoblashda birliklarni bir xil qiling: 1 m³ = 1000 dm³.",
          "Объём цилиндра — площадь основания на высоту. Боковая поверхность разворачивается в прямоугольник (2πR × H). Приводите единицы к одной: 1 м³ = 1000 дм³."] },
      { h: ["Silindrga chizilgan prizma", "Призма в цилиндре"],
        p: ["Silindr ichiga eng katta hajmli to'g'ri to'rtburchakli ustun chizilsa, uning asosi kvadrat bo'ladi: asos diagonali = silindr diametri. R radiusli doiraga chizilgan kvadratning yuzi 2R².",
          "Наибольшая прямоугольная призма в цилиндре имеет квадратное основание: диагональ основания = диаметр цилиндра. Квадрат, вписанный в круг радиуса R, имеет площадь 2R²."] },
    ],
    f: [
      { n: ["Hajm", "Объём"], f: "V = π R² H" },
      { n: ["Yon sirt", "Боковая поверхность"], f: "S_yon = 2π R H" },
      { n: ["To'liq sirt", "Полная поверхность"], f: "S = 2π R (R + H)" },
    ],
    s: [
      ["R va H ni bir xil birlikda yozing.", "Запишите R и H в одной единице."],
      ["Kerakli formulani qo'ying: hajm, yon yoki to'liq sirt.", "Подставьте нужную формулу: объём, боковая или полная поверхность."],
      ["Javob birligini tekshiring: hajm — kub birlik, sirt — kvadrat.", "Проверьте единицу ответа: объём — кубическая, поверхность — квадратная."],
    ],
    m: [
      { s: ["R = 3 cm, H = 10 cm. Hajmni toping.", "R = 3 см, H = 10 см. Найдите объём."],
        y: ["V = π · 3² · 10 = 90π"], j: "90π cm³" },
      { s: ["Uzunligi 6 m, asosining radiusi 5 dm bo'lgan yog'ochdan eng katta hajmli ustun yasaldi. Ustun asosining yuzi, hajmi va chiqindi foizini toping (π ≈ 3).",
            "Из бревна длиной 6 м и радиусом основания 5 дм вытесан столб наибольшего объёма. Найдите площадь основания столба, его объём и процент отходов (π ≈ 3)."],
        y: ["Asos — kvadrat, diagonali 10 dm:  S = d² / 2 = 50 dm²",
          "H = 6 m = 60 dm:  V = 50 · 60 = 3000 dm³ = 3 m³",
          "Silindr asosi: π R² = 3 · 25 = 75 dm²",
          "Chiqindi: (75 − 50) / 75 = 1/3 ≈ 33⅓ %"], j: "50 dm²;  3 m³;  33⅓ %" },
    ],
    x: [
      ["m va dm ni aralashtirish: 6 m = 60 dm, 6 dm emas.", "Смешивать м и дм: 6 м = 60 дм."],
      ["Diametrni radius o'rniga qo'yish: R = d / 2.", "Подставлять диаметр вместо радиуса: R = d / 2."],
    ],
  },

  "Piramida hajmi": {
    t: [
      { h: ["Piramida", "Пирамида"],
        p: ["Piramida hajmi — asos yuzi va balandlik ko'paytmasining UCHDAN BIRI (xuddi shu asosli va balandlikli prizmaning 1/3 qismi). Muntazam piramidada balandlik asosning markaziga tushadi. Balandlik bilan apofema (yon yoq balandligi) bir narsa emas.",
          "Объём пирамиды — ОДНА ТРЕТЬ произведения площади основания на высоту (треть призмы с тем же основанием и высотой). У правильной пирамиды высота падает в центр основания. Высота и апофема — разные величины."] },
    ],
    f: [
      { n: ["Hajm", "Объём"], f: "V = ⅓ · S_asos · H" },
      { n: ["Muntazam to'rtburchakli", "Правильная четырёхугольная"], f: "H² = l² − (d/2)²,   d — asos diagonali,  l — yon qirra" },
    ],
    s: [
      ["Asos yuzini toping (kvadrat a², muntazam uchburchak a²√3/4).", "Найдите площадь основания (квадрат a², правильный треугольник a²√3/4)."],
      ["Balandlikni to'g'ri burchakli uchburchakdan Pifagor bilan toping.", "Найдите высоту из прямоугольного треугольника по Пифагору."],
      ["V = ⅓ S H — ⅓ ni unutmang.", "V = ⅓ S H — не забудьте ⅓."],
    ],
    m: [
      { s: ["Asosi tomoni 6 bo'lgan kvadrat, balandligi 4 bo'lgan piramida hajmini toping.", "Основание — квадрат со стороной 6, высота 4. Найдите объём."],
        y: ["S = 6² = 36", "V = ⅓ · 36 · 4 = 48"], j: "48" },
      { s: ["Muntazam to'rtburchakli piramidada asos tomoni 6, yon qirra 5. Hajmini toping.", "В правильной четырёхугольной пирамиде сторона основания 6, боковое ребро 5. Найдите объём."],
        y: ["d = 6√2,  d/2 = 3√2,  (d/2)² = 18", "H² = 25 − 18 = 7  →  H = √7",
          "V = ⅓ · 36 · √7 = 12√7"], j: "12√7" },
    ],
    x: [
      ["⅓ ni tashlab, prizma hajmini yozish.", "Опустить ⅓ и написать объём призмы."],
      ["Apofemani balandlik deb olish.", "Принять апофему за высоту."],
    ],
  },
};
