/**
 * FORMULALAR VARAQASI — 7–11-sinf uchun ma'lumotnoma.
 *
 * ─────────────────────── NEGA KERAK ───────────────────────
 *
 * Masala yechayotgan o'quvchi formulani unutganda telefonini oladi va
 * qidiruvga yozadi. O'sha lahzada u ilovadan CHIQIB ketadi — va
 * qidiruv natijasidagi reklama, tavsiya qilingan video, xabar bilan
 * birga darsga qaytmaydi.
 *
 * Bu ekran o'sha chiqishni ortiqcha qiladi. U yangi bilim bermaydi:
 * hammasi allaqachon darslarda bor. Uning yagona vazifasi —
 * ESLATISH, va shuning uchun u imkon qadar zich, izohsiz, faqat
 * formula.
 *
 * ─────────────── NEGA TARJIMA QILINMAYDI ───────────────
 *
 * Formulaning o'zi tilga bog'liq emas: `(a + b)² = a² + 2ab + b²`
 * ikkala tilda ham shunday yoziladi. Tarjima faqat NOMLARDA kerak
 * ("Yig'indi kvadrati" / "Квадрат суммы"), shuning uchun har yozuvda
 * ikki nom va bitta formula turadi.
 *
 * ─────────────── TARTIB SINFDAN KELIB CHIQADI ───────────────
 *
 * Bo'limlar `sinf` bilan belgilangan va ekran avval O'QUVCHINING
 * sinfiga tegishlisini ochadi. Qolganlari ham ko'rinadi, lekin
 * yopiq: 9-sinf o'quvchisiga integral kerak emas, ammo 7-sinfdagi
 * qisqa ko'paytirish formulasi undan har kuni so'raladi.
 */

import type { IconName } from "./icons";

/** Bitta yozuv: nomi ikki tilda, formulasi bitta. */
export interface Formula {
  nom: string;
  ru: string;
  f: string;
}

export interface Bolim {
  nom: string;
  ru: string;
  /** Qaysi sinfda o'tiladi — ochiq holda ko'rsatish uchun. */
  sinf: number;
  ikon: IconName;
  lar: Formula[];
}

export const FORMULALAR: Bolim[] = [
  {
    nom: "Qisqa ko'paytirish", ru: "Сокращённое умножение", sinf: 7, ikon: "times",
    lar: [
      { nom: "Yig'indi kvadrati", ru: "Квадрат суммы", f: "(a + b)² = a² + 2ab + b²" },
      { nom: "Ayirma kvadrati", ru: "Квадрат разности", f: "(a − b)² = a² − 2ab + b²" },
      { nom: "Kvadratlar ayirmasi", ru: "Разность квадратов", f: "a² − b² = (a − b)(a + b)" },
      { nom: "Yig'indi kubi", ru: "Куб суммы", f: "(a + b)³ = a³ + 3a²b + 3ab² + b³" },
      { nom: "Kublar yig'indisi", ru: "Сумма кубов", f: "a³ + b³ = (a + b)(a² − ab + b²)" },
      { nom: "Kublar ayirmasi", ru: "Разность кубов", f: "a³ − b³ = (a − b)(a² + ab + b²)" },
    ],
  },
  {
    nom: "Daraja va ildiz", ru: "Степени и корни", sinf: 7, ikon: "power",
    lar: [
      { nom: "Ko'paytma", ru: "Произведение", f: "aᵐ · aⁿ = aᵐ⁺ⁿ" },
      { nom: "Bo'linma", ru: "Частное", f: "aᵐ : aⁿ = aᵐ⁻ⁿ" },
      { nom: "Darajaning darajasi", ru: "Степень степени", f: "(aᵐ)ⁿ = aᵐⁿ" },
      { nom: "Manfiy ko'rsatkich", ru: "Отрицательный показатель", f: "a⁻ⁿ = 1 / aⁿ" },
      { nom: "Ratsional ko'rsatkich", ru: "Рациональный показатель", f: "a^(m/n) = ⁿ√(aᵐ)" },
      { nom: "Ildiz ko'paytmasi", ru: "Корень произведения", f: "√(ab) = √a · √b" },
    ],
  },
  {
    nom: "Kvadrat tenglama", ru: "Квадратное уравнение", sinf: 8, ikon: "chart",
    lar: [
      { nom: "Diskriminant", ru: "Дискриминант", f: "D = b² − 4ac" },
      { nom: "Ildizlar", ru: "Корни", f: "x = (−b ± √D) / 2a" },
      { nom: "Viyet teoremasi", ru: "Теорема Виета", f: "x₁ + x₂ = −b/a,   x₁ · x₂ = c/a" },
      { nom: "Uchhadni ajratish", ru: "Разложение трёхчлена", f: "ax² + bx + c = a(x − x₁)(x − x₂)" },
      { nom: "Parabola uchi", ru: "Вершина параболы", f: "x₀ = −b / 2a" },
    ],
  },
  {
    nom: "Planimetriya", ru: "Планиметрия", sinf: 8, ikon: "shape",
    lar: [
      { nom: "Pifagor teoremasi", ru: "Теорема Пифагора", f: "a² + b² = c²" },
      { nom: "Uchburchak yuzi", ru: "Площадь треугольника", f: "S = a · h / 2" },
      { nom: "Uchburchak yuzi (sinus)", ru: "Площадь через синус", f: "S = ½ · a · b · sin C" },
      { nom: "Geron formulasi", ru: "Формула Герона", f: "S = √(p(p−a)(p−b)(p−c)),  p = P/2" },
      { nom: "Parallelogramm yuzi", ru: "Площадь параллелограмма", f: "S = a · h" },
      { nom: "Trapetsiya yuzi", ru: "Площадь трапеции", f: "S = (a + b) · h / 2" },
      { nom: "Romb yuzi", ru: "Площадь ромба", f: "S = d₁ · d₂ / 2" },
      { nom: "Trapetsiya o'rta chizig'i", ru: "Средняя линия трапеции", f: "m = (a + b) / 2" },
      { nom: "Ko'pburchak burchaklari", ru: "Углы многоугольника", f: "S = (n − 2) · 180°" },
      { nom: "Aylana uzunligi", ru: "Длина окружности", f: "C = 2πr" },
      { nom: "Doira yuzi", ru: "Площадь круга", f: "S = πr²" },
      { nom: "Yoy uzunligi", ru: "Длина дуги", f: "l = πrn / 180" },
      { nom: "Sektor yuzi", ru: "Площадь сектора", f: "S = πr²n / 360" },
    ],
  },
  {
    nom: "Trigonometriya", ru: "Тригонометрия", sinf: 9, ikon: "angle",
    lar: [
      { nom: "Asosiy ayniyat", ru: "Основное тождество", f: "sin²α + cos²α = 1" },
      { nom: "Tangens", ru: "Тангенс", f: "tg α = sin α / cos α" },
      { nom: "Qo'shish (sinus)", ru: "Сложение (синус)", f: "sin(α ± β) = sin α cos β ± cos α sin β" },
      { nom: "Qo'shish (kosinus)", ru: "Сложение (косинус)", f: "cos(α ± β) = cos α cos β ∓ sin α sin β" },
      { nom: "Ikkilangan burchak", ru: "Двойной угол", f: "sin 2α = 2 sin α cos α" },
      { nom: "Ikkilangan burchak", ru: "Двойной угол", f: "cos 2α = cos²α − sin²α" },
      { nom: "Jadval qiymatlari", ru: "Табличные значения", f: "sin: 0 · ½ · √2/2 · √3/2 · 1" },
      { nom: "Jadval qiymatlari", ru: "Табличные значения", f: "cos: 1 · √3/2 · √2/2 · ½ · 0" },
      { nom: "Radian", ru: "Радианы", f: "180° = π,   1 rad = 180°/π" },
      { nom: "Sinuslar teoremasi", ru: "Теорема синусов", f: "a/sin A = b/sin B = c/sin C = 2R" },
      { nom: "Kosinuslar teoremasi", ru: "Теорема косинусов", f: "c² = a² + b² − 2ab · cos C" },
    ],
  },
  {
    nom: "Progressiyalar", ru: "Прогрессии", sinf: 9, ikon: "order",
    lar: [
      { nom: "Arifmetik: n-had", ru: "Арифметическая: n-й член", f: "aₙ = a₁ + (n − 1)d" },
      { nom: "Arifmetik: yig'indi", ru: "Арифметическая: сумма", f: "Sₙ = (a₁ + aₙ) · n / 2" },
      { nom: "Geometrik: n-had", ru: "Геометрическая: n-й член", f: "bₙ = b₁ · qⁿ⁻¹" },
      { nom: "Geometrik: yig'indi", ru: "Геометрическая: сумма", f: "Sₙ = b₁(qⁿ − 1) / (q − 1)" },
      { nom: "Cheksiz kamayuvchi", ru: "Бесконечно убывающая", f: "S = b₁ / (1 − q),   |q| < 1" },
    ],
  },
  {
    nom: "Logarifm va ko'rsatkich", ru: "Логарифмы и степени", sinf: 10, ikon: "percent",
    lar: [
      { nom: "Ta'rif", ru: "Определение", f: "logₐ b = c  ⇔  aᶜ = b" },
      { nom: "Ko'paytma", ru: "Произведение", f: "logₐ(xy) = logₐx + logₐy" },
      { nom: "Bo'linma", ru: "Частное", f: "logₐ(x/y) = logₐx − logₐy" },
      { nom: "Daraja", ru: "Степень", f: "logₐ(xⁿ) = n · logₐx" },
      { nom: "Asosni almashtirish", ru: "Переход к новому основанию", f: "logₐb = log꜀b / log꜀a" },
      { nom: "Murakkab foiz", ru: "Сложный процент", f: "S = S₀(1 + p/100)ⁿ" },
    ],
  },
  {
    nom: "Stereometriya", ru: "Стереометрия", sinf: 10, ikon: "cube",
    lar: [
      { nom: "Eyler formulasi", ru: "Формула Эйлера", f: "U − Q + Y = 2" },
      { nom: "Parallelepiped hajmi", ru: "Объём параллелепипеда", f: "V = a · b · c" },
      { nom: "Parallelepiped sirti", ru: "Поверхность параллелепипеда", f: "S = 2(ab + bc + ac)" },
      { nom: "Fazoviy diagonal", ru: "Диагональ", f: "d = √(a² + b² + c²)" },
      { nom: "Prizma hajmi", ru: "Объём призмы", f: "V = S · h" },
      { nom: "Piramida hajmi", ru: "Объём пирамиды", f: "V = S · h / 3" },
      { nom: "Silindr hajmi", ru: "Объём цилиндра", f: "V = πr²h" },
      { nom: "Silindr yon sirti", ru: "Боковая поверхность цилиндра", f: "S = 2πrh" },
      { nom: "Konus hajmi", ru: "Объём конуса", f: "V = πr²h / 3" },
      { nom: "Konus yon sirti", ru: "Боковая поверхность конуса", f: "S = πrl" },
      { nom: "Shar hajmi", ru: "Объём шара", f: "V = 4/3 · πr³" },
      { nom: "Sfera yuzi", ru: "Площадь сферы", f: "S = 4πr²" },
    ],
  },
  {
    nom: "Hosila va integral", ru: "Производная и интеграл", sinf: 11, ikon: "chart",
    lar: [
      { nom: "Daraja", ru: "Степень", f: "(xⁿ)′ = n · xⁿ⁻¹" },
      { nom: "Ko'paytma", ru: "Произведение", f: "(uv)′ = u′v + uv′" },
      { nom: "Bo'linma", ru: "Частное", f: "(u/v)′ = (u′v − uv′) / v²" },
      { nom: "Murakkab funksiya", ru: "Сложная функция", f: "(f(g))′ = f′(g) · g′" },
      { nom: "Jadval", ru: "Таблица", f: "(sin x)′ = cos x,   (cos x)′ = −sin x" },
      { nom: "Jadval", ru: "Таблица", f: "(eˣ)′ = eˣ,   (ln x)′ = 1/x" },
      { nom: "Urinma", ru: "Касательная", f: "y = f(x₀) + f′(x₀)(x − x₀)" },
      { nom: "Boshlang'ich", ru: "Первообразная", f: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C" },
      { nom: "Nyuton–Leybnits", ru: "Ньютон–Лейбниц", f: "∫ₐᵇ f(x) dx = F(b) − F(a)" },
    ],
  },
  {
    nom: "Ehtimollik va statistika", ru: "Вероятность и статистика", sinf: 11, ikon: "pie",
    lar: [
      { nom: "Klassik ta'rif", ru: "Классическое определение", f: "P = m / n" },
      { nom: "O'rin almashtirish", ru: "Перестановки", f: "Pₙ = n!" },
      { nom: "O'rinlashtirish", ru: "Размещения", f: "Aₙᵏ = n! / (n − k)!" },
      { nom: "Kombinatsiya", ru: "Сочетания", f: "Cₙᵏ = n! / (k!(n − k)!)" },
      { nom: "O'rta arifmetik", ru: "Среднее арифметическое", f: "x̄ = (x₁ + … + xₙ) / n" },
      { nom: "Dispersiya", ru: "Дисперсия", f: "D = Σ(xᵢ − x̄)² / n" },
      { nom: "Chetlanish", ru: "Отклонение", f: "σ = √D" },
    ],
  },
];
