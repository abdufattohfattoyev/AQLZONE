/**
 * TO'LIQ DARSLAR — 9-sinf algebra. Tuzilishi `tolaqGeometriya.ts` dagidek.
 * Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_ALGEBRA9: Record<string, Tolaq> = {
  "Tarmoqlar yo'nalishi": {
    t: [
      { h: ["Kvadrat funksiya", "Квадратичная функция"],
        p: ["y = ax² + bx + c (a ≠ 0) grafigi — parabola. a > 0 bo'lsa tarmoqlari YUQORIGA (uchi — eng kichik qiymat), a < 0 bo'lsa PASTGA (uchi — eng katta qiymat). |a| qancha katta bo'lsa, parabola shuncha tor. c — Oy o'qi bilan kesishish nuqtasining ordinatasi.",
          "График y = ax² + bx + c (a ≠ 0) — парабола. При a > 0 ветви ВВЕРХ (вершина — наименьшее значение), при a < 0 ВНИЗ (вершина — наибольшее). Чем больше |a|, тем уже парабола. c — ордината точки пересечения с Oy."] },
    ],
    f: [
      { n: ["Yuqoriga", "Вверх"], f: "a > 0  →  ∪" },
      { n: ["Pastga", "Вниз"], f: "a < 0  →  ∩" },
      { n: ["Oy bilan kesishish", "Пересечение с Oy"], f: "x = 0:  y = c" },
    ],
    s: [
      ["a ning ishorasini aniqlang (x² oldidagi son).", "Определите знак a (число перед x²)."],
      ["a > 0 — min, a < 0 — max ekanini yozing.", "a > 0 — минимум, a < 0 — максимум."],
    ],
    m: [
      { s: ["y = −2x² + 3x + 1 parabolasining tarmoqlari qayoqqa qaragan?", "Куда направлены ветви параболы y = −2x² + 3x + 1?"],
        y: ["a = −2 < 0"], j: "Pastga" },
      { s: ["y = 3 − x² parabolasi eng katta qiymatga egami?", "Есть ли у параболы y = 3 − x² наибольшее значение?"],
        y: ["a = −1 < 0 — tarmoqlar pastga, uch — eng baland nuqta", "x = 0 da y = 3"], j: "Ha, eng katta qiymat 3" },
    ],
    x: [
      ["a ni ishorasiz olish: y = 3 − x² da a = −1.", "Брать a без знака: у y = 3 − x² a = −1."],
      ["Uchning ordinatasini har doim eng kichik deb hisoblash.", "Считать вершину всегда минимумом."],
    ],
  },

  "Parabola uchi": {
    t: [
      { h: ["Uch koordinatalari", "Координаты вершины"],
        p: ["Uchning abssissasi x₀ = −b/(2a); ordinatasi — funksiyaning shu nuqtadagi qiymati y₀ = f(x₀). x = x₀ to'g'ri chizig'i simmetriya o'qi: parabola undan ikki tomonga bir xil. Parametr topishda: uch berilsa, x₀ = −b/(2a) va y₀ = f(x₀) tenglamalar tuziladi.",
          "Абсцисса вершины x₀ = −b/(2a); ордината — значение функции y₀ = f(x₀). Прямая x = x₀ — ось симметрии. Если дана вершина, для нахождения параметров составляют уравнения x₀ = −b/(2a) и y₀ = f(x₀)."] },
    ],
    f: [
      { n: ["Uchning abssissasi", "Абсцисса вершины"], f: "x₀ = −b / (2a)" },
      { n: ["Uchning ordinatasi", "Ордината вершины"], f: "y₀ = f(x₀) = c − b² / (4a)" },
      { n: ["Simmetriya o'qi", "Ось симметрии"], f: "x = x₀" },
    ],
    s: [
      ["a, b, c ni yozing.", "Выпишите a, b, c."],
      ["x₀ = −b/(2a) ni toping.", "Найдите x₀ = −b/(2a)."],
      ["x₀ ni funksiyaga qo'yib y₀ ni toping.", "Подставьте x₀ в функцию и найдите y₀."],
    ],
    m: [
      { s: ["y = x² − 4x + 3 ning uchini toping.", "Найдите вершину y = x² − 4x + 3."],
        y: ["x₀ = 4 / 2 = 2", "y₀ = 4 − 8 + 3 = −1"], j: "(2; −1)" },
      { s: ["y = −x² + x + 6 ning uchini toping.", "Найдите вершину y = −x² + x + 6."],
        y: ["x₀ = −1 / (2 · (−1)) = 1/2", "y₀ = −1/4 + 1/2 + 6 = 6¼"], j: "(1/2; 25/4)" },
      { s: ["f(x) = ax² + bx + 6 ning uchi (1/2; 25/4). a va b ni toping.", "Вершина f(x) = ax² + bx + 6 — (1/2; 25/4). Найдите a и b."],
        y: ["−b / (2a) = 1/2  →  b = −a", "f(1/2) = a/4 − a/2 + 6 = 6 − a/4 = 25/4  →  a = −1", "b = 1"], j: "a = −1,  b = 1" },
    ],
    x: [
      ["x₀ = b/(2a) deb yozish (minus tushib qoladi).", "Писать x₀ = b/(2a) (теряется минус)."],
      ["Ordinatani topmay, uchni faqat x₀ bilan yozish.", "Записать вершину, найдя только абсциссу."],
    ],
  },

  "Funksiya qiymati": {
    t: [
      { h: ["f(x) qiymati", "Значение f(x)"],
        p: ["f(a) — funksiya ifodasida x o'rniga a ni qo'yib hisoblash (manfiy sonni qavsda). Teskari savol: f(x) = c bo'lsa x nechaga teng — bu tenglama yechiladi. Grafikda f(a) — x = a dagi balandlik.",
          "f(a) — подставить a вместо x в выражение (отрицательное — в скобках). Обратный вопрос: при каком x значение f(x) = c — это уравнение. На графике f(a) — высота при x = a."] },
    ],
    f: [
      { n: ["Qiymat", "Значение"], f: "f(a) — x o'rniga a" },
      { n: ["Teskari", "Обратно"], f: "f(x) = c  ⇒  tenglama" },
    ],
    s: [
      ["x ni qavs ichida qo'ying.", "Подставьте x в скобках."],
      ["Amallar tartibi bilan hisoblang.", "Вычислите по порядку действий."],
      ["Teskari savolda tenglama tuzib yeching.", "В обратной задаче решите уравнение."],
    ],
    m: [
      { s: ["f(x) = 2x² − 3x + 1. f(−2) ni toping.", "f(x) = 2x² − 3x + 1. Найдите f(−2)."],
        y: ["2 · (−2)² − 3 · (−2) + 1 = 8 + 6 + 1"], j: "15" },
      { s: ["f(x) = x² − 2x. f(x) = 3 bo'ladigan x?", "f(x) = x² − 2x. При каких x f(x) = 3?"],
        y: ["x² − 2x − 3 = 0  →  (x − 3)(x + 1) = 0"], j: "x = 3  yoki  x = −1" },
    ],
    x: [
      ["Manfiy sonni qavssiz qo'yish: (−2)² ≠ −2².", "Подставлять отрицательное без скобок: (−2)² ≠ −2²."],
    ],
  },

  "Funksiyaning nollari": {
    t: [
      { h: ["Nol nuqtalar", "Нули функции"],
        p: ["Funksiya noli — f(x) = 0 bo'ladigan x. Grafikda bu Ox o'qi bilan kesishish (yoki tegish) nuqtalari. Kvadrat funksiyaning nollari soni diskriminantga bog'liq: D > 0 — ikki, D = 0 — bitta (uch Ox da), D < 0 — nol yo'q. Nollar orasida funksiya ishorasi o'zgaradi.",
          "Нуль функции — значение x, при котором f(x) = 0. На графике — точки пересечения (или касания) с осью Ox. Число нулей квадратичной функции зависит от D: D > 0 — два, D = 0 — один (вершина на Ox), D < 0 — нет. Между нулями знак функции меняется."] },
    ],
    f: [
      { n: ["Nollar", "Нули"], f: "f(x) = 0" },
      { n: ["Viyet", "Виета"], f: "x₁ + x₂ = −b/a,   x₁ · x₂ = c/a" },
    ],
    s: [
      ["f(x) = 0 tenglamani yeching.", "Решите f(x) = 0."],
      ["Ildizlar — nollar; ildiz yo'q bo'lsa nol ham yo'q.", "Корни — нули; нет корней — нет нулей."],
    ],
    m: [
      { s: ["y = x² − 4x + 3 ning nollari?", "Нули y = x² − 4x + 3?"],
        y: ["D = 16 − 12 = 4", "x = (4 ± 2) / 2"], j: "1 va 3" },
      { s: ["y = x² + 1 ning nollari?", "Нули y = x² + 1?"],
        y: ["x² = −1 — haqiqiy yechim yo'q"], j: "Nol yo'q" },
      { s: ["y = x² − 6x + 5 nollari yig'indisi?", "Сумма нулей y = x² − 6x + 5?"],
        y: ["Viyet: −b/a = 6"], j: "6" },
    ],
    x: [
      ["Nolni Oy bilan kesishish nuqtasi bilan aralashtirish.", "Путать нуль функции с пересечением Oy."],
    ],
  },

  "Kvadrat tengsizlik": {
    t: [
      { h: ["Parabola bo'yicha", "По параболе"],
        p: ["ax² + bx + c > 0 (yoki < 0) ni yechish uchun parabolani xayolan chizamiz: nollari (ildizlari) va tarmoqlar yo'nalishi (a ning ishorasi) yetarli. a > 0 da funksiya nollardan TASHQARIDA musbat, ICHIDA manfiy; a < 0 da teskarisi. Nol yo'q bo'lsa (D < 0) ishora hamma joyda a ning ishorasidek.",
          "Чтобы решить ax² + bx + c > 0 (или < 0), представьте параболу: нужны корни и направление ветвей (знак a). При a > 0 функция положительна ВНЕ корней, отрицательна МЕЖДУ ними; при a < 0 наоборот. Без корней (D < 0) знак везде совпадает со знаком a."] },
    ],
    f: [
      { n: ["a > 0, x₁ < x₂", "a > 0, x₁ < x₂"], f: "f > 0:  x < x₁  yoki  x > x₂;    f < 0:  x₁ < x < x₂" },
      { n: ["D < 0", "D < 0"], f: "a > 0 bo'lsa f > 0 hamma x da" },
    ],
    s: [
      ["Hamma narsani bir tomonga o'tkazing (o'ng tomon 0).", "Перенесите всё в одну часть (справа 0)."],
      ["Ildizlarni toping va a ning ishorasini aniqlang.", "Найдите корни и знак a."],
      ["Parabola eskizi bo'yicha kerakli oraliqni yozing (qat'iy bo'lsa ochiq qavs).", "По эскизу параболы запишите нужный промежуток (строгое — круглые скобки)."],
    ],
    m: [
      { s: ["x² − 5x + 6 > 0 ni yeching.", "Решите x² − 5x + 6 > 0."],
        y: ["Ildizlar 2 va 3, a = 1 > 0", "Musbat — ildizlardan tashqarida"], j: "(−∞; 2) ∪ (3; +∞)" },
      { s: ["x² − 4 < 0 ni yeching.", "Решите x² − 4 < 0."],
        y: ["Ildizlar −2 va 2; manfiy — ichida"], j: "(−2; 2)" },
      { s: ["−x² + 2x + 3 ≥ 0 ni yeching.", "Решите −x² + 2x + 3 ≥ 0."],
        y: ["x² − 2x − 3 ≤ 0 (−1 ga ko'paytirdik, ishora teskari)", "Ildizlar −1 va 3; ichida ≤ 0"], j: "[−1; 3]" },
    ],
    x: [
      ["Ichi/tashqarisini adashtirish: a > 0 da > 0 — tashqarida.", "Путать «между/вне»: при a > 0 неравенство > 0 — вне корней."],
      ["−1 ga ko'paytirganda ishorani almashtirmaslik.", "Не сменить знак неравенства при умножении на −1."],
    ],
  },

  "Aniqlanish sohasi": {
    t: [
      { h: ["Qaysi x mumkin", "Какие x допустимы"],
        p: ["Aniqlanish sohasi — funksiya ma'noga ega bo'ladigan barcha x. Cheklovlar: kasrda maxraj ≠ 0; juft darajali ildiz ostidagi ifoda ≥ 0; ildiz maxrajda bo'lsa > 0; logarifm ostidagi ifoda > 0. Bir necha cheklov bo'lsa — hammasi BIR VAQTDA bajariladi (kesishma).",
          "Область определения — все x, при которых функция имеет смысл. Ограничения: знаменатель ≠ 0; выражение под корнем чётной степени ≥ 0; корень в знаменателе — > 0; под логарифмом > 0. Если ограничений несколько — выполняются ОДНОВРЕМЕННО (пересечение)."] },
    ],
    f: [
      { n: ["Kasr", "Дробь"], f: "1/f(x):  f(x) ≠ 0" },
      { n: ["Ildiz", "Корень"], f: "√f(x):  f(x) ≥ 0" },
      { n: ["Ildiz maxrajda", "Корень в знаменателе"], f: "1/√f(x):  f(x) > 0" },
    ],
    s: [
      ["Funksiyada qaysi cheklovlar borligini aniqlang.", "Определите, какие ограничения есть."],
      ["Har biri uchun tengsizlik yoki tenglik tuzing.", "Составьте для каждого неравенство или условие."],
      ["Hammasini kesishtiring va oraliq sifatida yozing.", "Пересеките условия и запишите промежутком."],
    ],
    m: [
      { s: ["y = 1/(x − 3) ning aniqlanish sohasi?", "Область определения y = 1/(x − 3)?"],
        y: ["x − 3 ≠ 0"], j: "x ≠ 3" },
      { s: ["y = √(x + 2) ning aniqlanish sohasi?", "Область определения y = √(x + 2)?"],
        y: ["x + 2 ≥ 0"], j: "[−2; +∞)" },
      { s: ["y = √(x − 1)/(x − 4) ning sohasi?", "Область определения y = √(x − 1)/(x − 4)?"],
        y: ["x − 1 ≥ 0  →  x ≥ 1;   x − 4 ≠ 0  →  x ≠ 4"], j: "[1; 4) ∪ (4; +∞)" },
    ],
    x: [
      ["Ildiz ostida > 0 deb yozish (≥ 0 bo'lishi kerak).", "Писать > 0 под корнем (нужно ≥ 0)."],
      ["Ikkinchi cheklovni unutish (masalan maxraj).", "Забыть второе ограничение (например, знаменатель)."],
    ],
  },

  "Chiziqli sistemalar": {
    t: [
      { h: ["Ikki noma'lumli sistema", "Система с двумя неизвестными"],
        p: ["Ikki tenglamani bir vaqtda qanoatlantiradigan (x; y) juftligi — sistema yechimi. Geometrik: ikki to'g'ri chiziq. Kesishsa — bitta yechim; parallel bo'lsa — yechim yo'q; ustma-ust tushsa — cheksiz ko'p yechim. Koeffitsiyentlar: a₁/a₂ ≠ b₁/b₂ — bitta yechim; a₁/a₂ = b₁/b₂ ≠ c₁/c₂ — yo'q.",
          "Пара (x; y), удовлетворяющая обоим уравнениям, — решение системы. Геометрически — две прямые. Пересекаются — одно решение; параллельны — нет решений; совпадают — бесконечно много. Если a₁/a₂ ≠ b₁/b₂ — одно решение; a₁/a₂ = b₁/b₂ ≠ c₁/c₂ — нет."] },
    ],
    f: [
      { n: ["Sistema", "Система"], f: "{ a₁x + b₁y = c₁ ;  a₂x + b₂y = c₂ }" },
      { n: ["Bitta yechim", "Одно решение"], f: "a₁/a₂ ≠ b₁/b₂" },
    ],
    s: [
      ["Koeffitsiyentlar nisbatini tekshirib, yechimlar sonini aniqlang.", "По отношению коэффициентов определите число решений."],
      ["Mos usulni tanlang (o'rniga qo'yish yoki qo'shish).", "Выберите способ (подстановка или сложение)."],
      ["Topilgan juftlikni ikkala tenglamaga qo'yib tekshiring.", "Проверьте найденную пару в обоих уравнениях."],
    ],
    m: [
      { s: ["{ x + y = 5;  x − y = 1 } ni yeching.", "Решите { x + y = 5;  x − y = 1 }."],
        y: ["Qo'shamiz: 2x = 6  →  x = 3", "y = 5 − 3 = 2"], j: "(3; 2)" },
      { s: ["{ 2x + 3y = 7;  4x + 6y = 10 } nechta yechimga ega?", "Сколько решений у { 2x + 3y = 7;  4x + 6y = 10 }?"],
        y: ["2/4 = 3/6 = 1/2, lekin 7/10 ≠ 1/2", "Chiziqlar parallel"], j: "Yechim yo'q" },
    ],
    x: [
      ["Juftlikni faqat bitta tenglamaga qo'yib tekshirish.", "Проверять пару только в одном уравнении."],
      ["x va y ni almashtirib yozish: (x; y) tartibi muhim.", "Перепутать порядок в паре (x; y)."],
    ],
  },

  "Sistemalarni yechish usullari": {
    t: [
      { h: ["Uch usul", "Три способа"],
        p: ["O'rniga qo'yish: bir noma'lumni ikkinchisi orqali ifodalab, boshqa tenglamaga qo'yamiz. Qo'shish: tenglamalarni mos songa ko'paytirib, qo'shamiz — bir noma'lum yo'qoladi. Grafik: ikki chiziq kesishish nuqtasi (taxminiy). Ikkinchi darajali sistemada (x + y va xy berilgan) Viyet teskarisidan foydalaniladi.",
          "Подстановка: выражаем одно неизвестное через другое и подставляем. Сложение: умножаем уравнения на числа и складываем — одно неизвестное исчезает. Графический: пересечение линий (приближённо). Если даны x + y и xy — применяют теорему, обратную Виету."] },
    ],
    f: [
      { n: ["O'rniga qo'yish", "Подстановка"], f: "y = 2x − 1  →  3x + (2x − 1) = 9" },
      { n: ["Viyet teskarisi", "Обратная Виета"], f: "x + y = p,  xy = q  ⇒  t² − pt + q = 0" },
    ],
    s: [
      ["Qulay usulni tanlang: koeffitsiyent 1 bo'lsa — o'rniga qo'yish, qarama-qarshi bo'lsa — qo'shish.", "Выберите способ: коэффициент 1 — подстановка, противоположные — сложение."],
      ["Bir noma'lumni toping, ikkinchisini unga qo'yib toping.", "Найдите одно неизвестное, затем другое."],
      ["Ikkala tenglamaga qo'yib tekshiring.", "Проверьте подстановкой в оба уравнения."],
    ],
    m: [
      { s: ["{ y = 2x − 1;  3x + y = 9 } ni yeching.", "Решите { y = 2x − 1;  3x + y = 9 }."],
        y: ["3x + 2x − 1 = 9  →  5x = 10  →  x = 2", "y = 2 · 2 − 1 = 3"], j: "(2; 3)" },
      { s: ["{ 3x + 2y = 12;  5x − 2y = 4 } ni yeching.", "Решите { 3x + 2y = 12;  5x − 2y = 4 }."],
        y: ["Qo'shamiz: 8x = 16  →  x = 2", "3 · 2 + 2y = 12  →  y = 3"], j: "(2; 3)" },
      { s: ["{ x + y = 7;  xy = 12 } ni yeching.", "Решите { x + y = 7;  xy = 12 }."],
        y: ["x va y — t² − 7t + 12 = 0 ning ildizlari", "t = 3, t = 4"], j: "(3; 4) va (4; 3)" },
    ],
    x: [
      ["Qo'shishda ikkinchi tenglamani ko'paytirganda BARCHA hadlarni ko'paytirmaslik.", "Умножить не все члены уравнения при сложении."],
      ["Ikkinchi darajali sistemada faqat bitta juftlik yozish.", "Записать только одну пару для симметричной системы."],
    ],
  },

  "Radian o'lchovi": {
    t: [
      { h: ["Radian", "Радиан"],
        p: ["1 radian — uzunligi radiusga teng yoyga tiralgan markaziy burchak (≈ 57,3°). To'liq aylana 2π rad = 360°, shuning uchun π rad = 180°. Yoy uzunligi l = r · α (α radianda). Gradusdan radianga o'tish: α · π/180; radiandan gradusga: α · 180/π.",
          "1 радиан — центральный угол, опирающийся на дугу длиной в радиус (≈ 57,3°). Полная окружность 2π рад = 360°, значит π рад = 180°. Длина дуги l = r · α (α в радианах). Из градусов в радианы: α · π/180; обратно: α · 180/π."] },
    ],
    f: [
      { n: ["Bog'lanish", "Связь"], f: "π rad = 180°" },
      { n: ["Yoy uzunligi", "Длина дуги"], f: "l = r · α" },
      { n: ["Jadval", "Таблица"], f: "30° = π/6,  45° = π/4,  60° = π/3,  90° = π/2,  180° = π" },
    ],
    s: [
      ["Kerakli yo'nalishni tanlang: ° → rad yoki rad → °.", "Выберите направление: ° → рад или рад → °."],
      ["Mos ko'paytuvchiga ko'paytiring.", "Умножьте на нужный множитель."],
    ],
    m: [
      { s: ["60° ni radianda yozing.", "Запишите 60° в радианах."],
        y: ["60 · π / 180"], j: "π/3" },
      { s: ["3π/4 ni gradusda yozing.", "Запишите 3π/4 в градусах."],
        y: ["(3π/4) · 180/π = 3 · 45"], j: "135°" },
      { s: ["Radiusi 4, markaziy burchagi π/2 bo'lgan yoy uzunligi?", "Длина дуги радиуса 4 при центральном угле π/2?"],
        y: ["l = 4 · π/2"], j: "2π" },
    ],
    x: [
      ["π = 90° deb olish: π = 180°.", "Считать π = 90°: π = 180°."],
      ["Yoy formulasida burchakni gradusda qoldirish.", "Оставить угол в градусах в формуле дуги."],
    ],
  },

  "algebra9|Sinus, kosinus, tangens": {
    t: [
      { h: ["Birlik aylana", "Единичная окружность"],
        p: ["Radiusi 1 aylanada α burchakka mos nuqta (x; y) bo'lsa: cos α = x, sin α = y, tg α = sin α / cos α (cos α ≠ 0). Shuning uchun sin va cos [−1; 1] oralig'ida. Maxsus burchaklar qiymatlarini jadvaldan bilish kerak.",
          "Для точки (x; y) единичной окружности, соответствующей углу α: cos α = x, sin α = y, tg α = sin α / cos α (cos α ≠ 0). Поэтому sin и cos лежат в [−1; 1]. Значения особых углов нужно знать по таблице."] },
    ],
    f: [
      { n: ["Ta'rif", "Определение"], f: "cos α = x,   sin α = y,   tg α = y / x" },
      { n: ["Jadval", "Таблица"], f: "α: 0°, 30°, 45°, 60°, 90°  →  sin: 0, ½, √2/2, √3/2, 1" },
      { n: ["Jadval (cos)", "Таблица (cos)"], f: "cos: 1, √3/2, √2/2, ½, 0" },
    ],
    s: [
      ["Burchakni jadvaldagi maxsus burchakka keltiring.", "Приведите угол к табличному."],
      ["Qiymatni qo'ying va hisoblang.", "Подставьте значение и вычислите."],
    ],
    m: [
      { s: ["cos π/3 + sin π/2 ni hisoblang.", "Вычислите cos π/3 + sin π/2."],
        y: ["cos 60° = 1/2;  sin 90° = 1"], j: "3/2" },
      { s: ["sin²30° + cos²60° ni hisoblang.", "Вычислите sin²30° + cos²60°."],
        y: ["(1/2)² + (1/2)² = 1/4 + 1/4"], j: "1/2" },
      { s: ["tg 45° · sin 60° ni hisoblang.", "Вычислите tg 45° · sin 60°."],
        y: ["1 · √3/2"], j: "√3/2" },
    ],
    x: [
      ["sin va cos qiymatlarini almashtirish (30° va 60°).", "Путать sin и cos для 30° и 60°."],
      ["tg 90° ni hisoblashga urinish: aniqlanmagan (cos 90° = 0).", "Считать tg 90°: не определён (cos 90° = 0)."],
    ],
  },

  "Choraklar bo'yicha ishoralar": {
    t: [
      { h: ["Ishora qoidasi", "Правило знаков"],
        p: ["Aylana to'rt chorakka bo'linadi. I chorak (0°–90°): sin, cos, tg hammasi +. II (90°–180°): faqat sin +. III (180°–270°): faqat tg va ctg +. IV (270°–360°): faqat cos +. Eslatma: «Hamma — Sinus — Tangens — Kosinus». Manfiy burchak soat mili yo'nalishida sanaladi.",
          "Окружность делится на четверти. I (0°–90°): sin, cos, tg все +. II (90°–180°): только sin +. III (180°–270°): только tg и ctg +. IV (270°–360°): только cos +. Отрицательный угол отсчитывается по часовой стрелке."] },
    ],
    f: [
      { n: ["Ishoralar", "Знаки"], f: "I: + + +    II: sin +    III: tg, ctg +    IV: cos +" },
      { n: ["Chorak chegaralari", "Границы четвертей"], f: "90° = π/2,  180° = π,  270° = 3π/2,  360° = 2π" },
    ],
    s: [
      ["Burchak qaysi chorakda ekanini aniqlang (360° ga keltiring).", "Определите четверть (приведите к 0°–360°)."],
      ["Funksiya ishorasini qoidadan oling.", "Определите знак по правилу."],
    ],
    m: [
      { s: ["sin 200° va cos 300° ning ishorasi?", "Знаки sin 200° и cos 300°?"],
        y: ["200° — III chorak: sin −", "300° — IV chorak: cos +"], j: "sin 200° < 0,  cos 300° > 0" },
      { s: ["tg 120° ning ishorasi?", "Знак tg 120°?"],
        y: ["120° — II chorak: sin +, cos −  →  tg −"], j: "manfiy" },
      { s: ["sin(−30°) ning ishorasi?", "Знак sin(−30°)?"],
        y: ["−30° = 330° — IV chorak: sin −"], j: "manfiy" },
    ],
    x: [
      ["II chorakda hamma funksiyani musbat deb olish.", "Считать все функции положительными во II четверти."],
      ["Manfiy burchakni chorakka noto'g'ri joylash.", "Неверно определить четверть отрицательного угла."],
    ],
  },

  "Keltirish formulalari": {
    t: [
      { h: ["Ikki qoida", "Два правила"],
        p: ["Katta burchakni o'tkir burchak orqali yozish uchun ikki qoida: 1) burchak 90° ± α yoki 270° ± α bo'lsa funksiya NOMI o'zgaradi (sin ↔ cos, tg ↔ ctg); 180° ± α yoki 360° − α bo'lsa nomi o'zgarmaydi. 2) Ishora — asl funksiyaning shu chorakdagi ishorasi (α ni o'tkir deb hisoblab).",
          "Чтобы записать большой угол через острый, два правила: 1) при 90° ± α или 270° ± α название функции МЕНЯЕТСЯ (sin ↔ cos, tg ↔ ctg); при 180° ± α или 360° − α не меняется. 2) Знак — знак исходной функции в этой четверти (считая α острым)."] },
    ],
    f: [
      { n: ["180° − α", "180° − α"], f: "sin(180° − α) = sin α,   cos(180° − α) = −cos α" },
      { n: ["180° + α", "180° + α"], f: "sin(180° + α) = −sin α,   tg(180° + α) = tg α" },
      { n: ["90° ± α", "90° ± α"], f: "sin(90° + α) = cos α,   cos(90° + α) = −sin α" },
      { n: ["360° − α", "360° − α"], f: "sin(360° − α) = −sin α,   cos(360° − α) = cos α" },
    ],
    s: [
      ["Burchakni 90° yoki 180° ± α ko'rinishida yozing.", "Запишите угол как 90° или 180° ± α."],
      ["Nom o'zgaradimi? (90°/270° — ha, 180°/360° — yo'q.)", "Меняется ли название? (90°/270° — да, 180°/360° — нет.)"],
      ["Ishorani chorakdan aniqlang.", "Знак определите по четверти."],
    ],
    m: [
      { s: ["sin 150° ni hisoblang.", "Вычислите sin 150°."],
        y: ["150° = 180° − 30°, nom o'zgarmaydi, II chorakda sin +", "sin 30°"], j: "1/2" },
      { s: ["cos 120° ni hisoblang.", "Вычислите cos 120°."],
        y: ["120° = 180° − 60°, II chorakda cos −", "−cos 60°"], j: "−1/2" },
      { s: ["tg 225° ni hisoblang.", "Вычислите tg 225°."],
        y: ["225° = 180° + 45°, III chorakda tg +", "tg 45°"], j: "1" },
      { s: ["cos(90° + α) ni soddalashtiring.", "Упростите cos(90° + α)."],
        y: ["Nom o'zgaradi: cos → sin", "II chorakda cos manfiy"], j: "−sin α" },
    ],
    x: [
      ["90° da nomni o'zgartirmaslik (yoki 180° da o'zgartirish).", "Не менять название при 90° (или менять при 180°)."],
      ["Ishorani α ning o'zidan emas, chorakdan olish kerakligini unutish.", "Определять знак по α, а не по четверти всего угла."],
    ],
  },

  "Qo'shish formulalari": {
    t: [
      { h: ["Yig'indi va ayirma formulalari", "Формулы сложения"],
        p: ["Ikki burchak yig'indisi yoki ayirmasining sinus va kosinusi alohida burchaklar funksiyalari orqali ifodalanadi. Ulardan yig'indi-ko'paytma formulalari kelib chiqadi: cos A + cos B = 2 cos((A + B)/2) cos((A − B)/2) va sin A − sin B = 2 cos((A + B)/2) sin((A − B)/2).",
          "Синус и косинус суммы или разности выражаются через функции слагаемых. Отсюда формулы суммы в произведение: cos A + cos B = 2 cos((A + B)/2) cos((A − B)/2) и sin A − sin B = 2 cos((A + B)/2) sin((A − B)/2)."] },
    ],
    f: [
      { n: ["Sinus", "Синус"], f: "sin(α ± β) = sin α cos β ± cos α sin β" },
      { n: ["Kosinus", "Косинус"], f: "cos(α ± β) = cos α cos β ∓ sin α sin β" },
      { n: ["Yig'indi → ko'paytma", "Сумма → произведение"], f: "cos A + cos B = 2 cos((A+B)/2) · cos((A−B)/2)" },
      { n: ["Ayirma → ko'paytma", "Разность → произведение"], f: "sin A − sin B = 2 cos((A+B)/2) · sin((A−B)/2)" },
    ],
    s: [
      ["Burchakni ikki maxsus burchak yig'indisi yoki ayirmasi qilib yozing (75° = 45° + 30°).", "Разложите угол в сумму/разность табличных (75° = 45° + 30°)."],
      ["Formulani qo'llang; kosinusda o'rta ishora TESKARI.", "Примените формулу; у косинуса средний знак ПРОТИВОПОЛОЖЕН."],
      ["Suratni ko'paytmaga aylantirib, qisqartiring.", "Преобразуйте в произведение и сократите."],
    ],
    m: [
      { s: ["sin 75° ni hisoblang.", "Вычислите sin 75°."],
        y: ["sin(45° + 30°) = sin 45° cos 30° + cos 45° sin 30°", "= (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4"], j: "(√6 + √2)/4" },
      { s: ["(cos 3α + cos α)/(sin 3α − sin α) ni soddalashtiring.", "Упростите (cos 3α + cos α)/(sin 3α − sin α)."],
        y: ["cos 3α + cos α = 2 cos 2α · cos α", "sin 3α − sin α = 2 cos 2α · sin α", "Qisqartiramiz: cos α / sin α"], j: "ctg α" },
      { s: ["cos 15° ni hisoblang.", "Вычислите cos 15°."],
        y: ["cos(45° − 30°) = cos 45° cos 30° + sin 45° sin 30°"], j: "(√6 + √2)/4" },
    ],
    x: [
      ["cos(α + β) = cos α cos β + sin α sin β deb yozish (minus kerak).", "Писать cos(α + β) с плюсом (нужен минус)."],
      ["sin(α + β) = sin α + sin β deb yozish.", "Считать sin(α + β) = sin α + sin β."],
    ],
  },

  "Sonli ketma-ketliklar": {
    t: [
      { h: ["Ketma-ketlik", "Последовательность"],
        p: ["Ketma-ketlik — tartib raqamli sonlar: a₁, a₂, …, aₙ, …. Berilish usullari: n-had formulasi (aₙ = n² + 1) yoki rekurrent (a₁ ni va aₙ₊₁ ni aₙ orqali ifodalovchi qoida). Monotonlik: aₙ₊₁ > aₙ — o'suvchi, aₙ₊₁ < aₙ — kamayuvchi.",
          "Последовательность — числа с номерами: a₁, a₂, …, aₙ, …. Способы задания: формула n-го члена (aₙ = n² + 1) или рекуррентно (a₁ и правило для aₙ₊₁ через aₙ). Монотонность: aₙ₊₁ > aₙ — возрастает, aₙ₊₁ < aₙ — убывает."] },
    ],
    f: [
      { n: ["n-had formulasi", "Формула n-го члена"], f: "aₙ = f(n)" },
      { n: ["Rekurrent", "Рекуррентно"], f: "a₁ = c,   aₙ₊₁ = g(aₙ)" },
      { n: ["Monotonlik", "Монотонность"], f: "aₙ₊₁ − aₙ > 0  →  o'suvchi" },
    ],
    s: [
      ["n o'rniga 1, 2, 3, … ni qo'ying.", "Подставьте n = 1, 2, 3, …."],
      ["Rekurrentda har bir hadni oldingisidan hisoblang.", "В рекуррентной находите каждый член из предыдущего."],
      ["Monotonlikni aₙ₊₁ − aₙ ishorasidan aniqlang.", "Монотонность — по знаку aₙ₊₁ − aₙ."],
    ],
    m: [
      { s: ["aₙ = n² + 1 ning dastlabki 3 hadi?", "Первые три члена aₙ = n² + 1?"],
        y: ["a₁ = 2,  a₂ = 5,  a₃ = 10"], j: "2, 5, 10" },
      { s: ["a₁ = 2, aₙ₊₁ = aₙ + 3. a₄ = ?", "a₁ = 2, aₙ₊₁ = aₙ + 3. Найдите a₄."],
        y: ["a₂ = 5,  a₃ = 8,  a₄ = 11"], j: "11" },
      { s: ["aₙ = 10 − 2n o'suvchimi?", "Возрастает ли aₙ = 10 − 2n?"],
        y: ["aₙ₊₁ − aₙ = (10 − 2n − 2) − (10 − 2n) = −2 < 0"], j: "Yo'q, kamayuvchi" },
    ],
    x: [
      ["Dastlabki haddan (n = 0) boshlash: raqamlash 1 dan.", "Начинать с n = 0: нумерация с 1."],
    ],
  },

  "Cheksiz kamayuvchi progressiya": {
    t: [
      { h: ["Cheksiz yig'indi", "Бесконечная сумма"],
        p: ["Geometrik progressiyada |q| < 1 bo'lsa hadlar nolga intiladi va cheksiz sonli hadlarning yig'indisi chekli son bo'ladi: S = b₁/(1 − q). Bu davriy o'nli kasrni oddiy kasrga aylantirishda ham ishlatiladi.",
          "Если |q| < 1, члены геометрической прогрессии стремятся к нулю и сумма бесконечно многих членов — конечное число: S = b₁/(1 − q). Так же периодическую дробь превращают в обыкновенную."] },
    ],
    f: [
      { n: ["Shart", "Условие"], f: "|q| < 1" },
      { n: ["Yig'indi", "Сумма"], f: "S = b₁ / (1 − q)" },
    ],
    s: [
      ["|q| < 1 ekanini tekshiring.", "Проверьте |q| < 1."],
      ["b₁ va q ni aniqlang.", "Найдите b₁ и q."],
      ["S = b₁/(1 − q) ga qo'ying.", "Подставьте в S = b₁/(1 − q)."],
    ],
    m: [
      { s: ["8, 4, 2, 1, … cheksiz yig'indisi?", "Сумма бесконечной прогрессии 8, 4, 2, 1, …?"],
        y: ["b₁ = 8, q = 1/2", "S = 8 / (1 − 1/2) = 8 / (1/2)"], j: "16" },
      { s: ["0,(3) = 0,333… ni oddiy kasr qiling.", "Обратите 0,(3) = 0,333… в обыкновенную дробь."],
        y: ["0,3 + 0,03 + 0,003 + …:  b₁ = 0,3, q = 0,1", "S = 0,3 / 0,9"], j: "1/3" },
      { s: ["b₁ = 9, q = −1/3. S = ?", "b₁ = 9, q = −1/3. S = ?"],
        y: ["S = 9 / (1 + 1/3) = 9 / (4/3)"], j: "27/4" },
    ],
    x: [
      ["|q| ≥ 1 da formulani qo'llash (yig'indi cheksiz).", "Применять формулу при |q| ≥ 1."],
      ["Manfiy q da 1 − q ni 1 + q deb hisoblashni unutish (minus ishora).", "Ошибиться с 1 − q при отрицательном q."],
    ],
  },

  "Nisbiy chastota": {
    t: [
      { h: ["Chastota", "Частота"],
        p: ["Tajribada hodisa m marta ro'y bergan, tajriba n marta o'tkazilgan bo'lsa, nisbiy chastota W = m/n. Tajribalar soni ko'paygan sari nisbiy chastota hodisaning ehtimoliga yaqinlashadi. Ehtimol oldindan hisoblanadi, chastota tajribadan topiladi.",
          "Если событие наступило m раз в n опытах, относительная частота W = m/n. С ростом числа опытов она приближается к вероятности. Вероятность вычисляют заранее, частоту находят из опыта."] },
    ],
    f: [
      { n: ["Nisbiy chastota", "Относительная частота"], f: "W(A) = m / n" },
      { n: ["Chegaralar", "Границы"], f: "0 ≤ W ≤ 1" },
    ],
    s: [
      ["m (hodisa soni) va n (tajriba soni) ni aniqlang.", "Найдите m (событий) и n (опытов)."],
      ["m ni n ga bo'ling; foizda yozish mumkin.", "Разделите m на n; можно в процентах."],
    ],
    m: [
      { s: ["Tanga 200 marta tashlandi, gerb 88 marta tushdi. Nisbiy chastota?", "Монету бросили 200 раз, герб выпал 88 раз. Относительная частота?"],
        y: ["88 / 200"], j: "0,44" },
      { s: ["50 ta sinovda hodisa 12 marta ro'y berdi. Chastota foizda?", "В 50 испытаниях событие произошло 12 раз. Частота в процентах?"],
        y: ["12 / 50 = 0,24"], j: "24%" },
    ],
    x: [
      ["Chastotani ehtimolga aynan teng deb hisoblash: u faqat yaqin.", "Считать частоту точно равной вероятности: она лишь близка."],
      ["n ga bo'lish o'rniga m ga bo'lish.", "Делить на m вместо n."],
    ],
  },
};
