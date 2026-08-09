/**
 * YECHIM QADAMLARINING IZOHLARI — ikki tilda.
 *
 * ─────────────────── NEGA LUG'AT, HAR SAFAR MATN EMAS ───────────────────
 *
 * Yechim ikki qismdan iborat: NIMA QILINYAPTI (so'z) va NATIJA (ifoda).
 * Ikkinchisi tilga bog'liq emas — "x² − 5x + 6 = 0" ikkala tilda ham bir
 * xil yoziladi. Birinchisi esa tarjima talab qiladi.
 *
 * Agar har bir generator o'z izohini matn ko'rinishida yozganda, 154 ta
 * generator × 2 til = 300 dan ortiq qo'lda yozilgan gap chiqardi va
 * ularning yarmi bir xil bo'lardi ("Hisoblaymiz", "Javob"). Bu yerda esa
 * qirq chog'li ibora butun 7–11-sinfni qoplaydi.
 *
 * Kalitlar TIPLANGAN: generatorda yo'q kalit yozilsa TypeScript darhol
 * xato beradi va tarjimasi unutilgan qadam ishga tushmaydi.
 *
 * ─────────────────── IZOH QISQA BO'LISHI SHART ───────────────────
 *
 * Bu yerdagi gaplar telefon ekranida, bitta qatorga sig'ishi kerak.
 * Uzun izoh yechimni darslik matniga aylantiradi va o'quvchi uni o'qimay
 * o'tkazib yuboradi — u yerda faqat SO'NGGI qatorni, javobni qidiradi.
 */
import { til } from "../til";

const Y = {
  /* ---------------- umumiy ---------------- */
  formula: ["Formula", "Формула"],
  qoy: ["Qiymatlarni qo'yamiz", "Подставляем значения"],
  hisobla: ["Hisoblaymiz", "Вычисляем"],
  javob: ["Javob", "Ответ"],
  tartib: ["Avval ko'paytirish, keyin qo'shish", "Сначала умножение, потом сложение"],
  soddalash: ["Soddalashtiramiz", "Упрощаем"],
  tekshir: ["Tekshiramiz", "Проверяем"],
  belgila: ["Noma'lumni belgilaymiz", "Обозначаем неизвестное"],
  shart: ["Shartdan tenglama tuzamiz", "Составляем уравнение по условию"],

  /* ---------------- algebraik ifodalar ---------------- */
  qavsOch: ["Qavslarni ochamiz", "Раскрываем скобки"],
  qavsMinus: ["Qavs oldida minus — hamma had ishorasi almashadi",
    "Перед скобкой минус — все знаки меняются"],
  oxshash: ["O'xshash hadlarni ixchamlaymiz", "Приводим подобные слагаемые"],
  darajaQosh: ["Asoslar bir xil — ko'rsatkichlar qo'shiladi",
    "Основания равны — показатели складываются"],
  darajaAyir: ["Bo'lishda ko'rsatkichlar ayriladi", "При делении показатели вычитаются"],
  darajaKopaytir: ["Darajani darajaga ko'tarishda ko'rsatkichlar ko'paytiriladi",
    "При возведении степени в степень показатели умножаются"],
  umumiy: ["Umumiy ko'paytuvchini qavsdan chiqaramiz", "Выносим общий множитель за скобки"],
  guruhla: ["Hadlarni juft-juft guruhlaymiz", "Группируем слагаемые попарно"],
  qisqaFormula: ["Qisqa ko'paytirish formulasi", "Формула сокращённого умножения"],
  ortaHad: ["O'rta had — ikki hadning ko'paytmasi ikkilangan",
    "Средний член — удвоенное произведение"],
  ajrat: ["Ko'paytuvchilarga ajratamiz", "Раскладываем на множители"],
  qisqartir: ["Bir xil ko'paytuvchini qisqartiramiz", "Сокращаем одинаковый множитель"],
  umumiyMaxraj: ["Umumiy maxrajga keltiramiz", "Приводим к общему знаменателю"],
  maxrajShart: ["Maxraj nolga teng bo'lmasligi kerak", "Знаменатель не должен быть нулём"],

  /* ---------------- tenglamalar ---------------- */
  kochir: ["Noma'lumni bir tomonga, sonni ikkinchisiga o'tkazamiz",
    "Переносим неизвестное в одну сторону, число — в другую"],
  ikkalaBol: ["Ikkala tomonni koeffitsiyentga bo'lamiz", "Делим обе части на коэффициент"],
  diskriminant: ["Diskriminant: D = b² − 4ac", "Дискриминант: D = b² − 4ac"],
  ildizFormula: ["Ildizlar: x = (−b ± √D) / 2a", "Корни: x = (−b ± √D) / 2a"],
  viet: ["Viyet teoremasi: x₁+x₂ = −b/a,  x₁·x₂ = c/a",
    "Теорема Виета: x₁+x₂ = −b/a,  x₁·x₂ = c/a"],
  dManfiy: ["D < 0 — haqiqiy ildiz yo'q", "D < 0 — действительных корней нет"],
  kopaytmaNol: ["Ko'paytma nolga teng — demak, ko'paytuvchilardan biri nol",
    "Произведение равно нулю — значит, один из множителей нуль"],
  tengsizlikIshora: ["Manfiy songa bo'lganda tengsizlik ishorasi almashadi",
    "При делении на отрицательное число знак неравенства меняется"],
  oraliq: ["Ildizlar orasidagi oraliqni tekshiramiz", "Проверяем промежуток между корнями"],
  sistemaQoy: ["Bir tenglamadan ifodalab, ikkinchisiga qo'yamiz",
    "Выражаем из одного уравнения и подставляем во второе"],

  /* ---------------- ildiz va daraja ---------------- */
  ildizXossa: ["Ildiz ko'paytmadan ajraladi: √(ab) = √a · √b",
    "Корень из произведения: √(ab) = √a · √b"],
  toliqKvadrat: ["Ildiz ostidan to'liq kvadratni chiqaramiz",
    "Выносим полный квадрат из-под корня"],
  ratsional: ["Ratsional ko'rsatkich: a^(m/n) = ⁿ√(aᵐ)", "Рациональный показатель: a^(m/n) = ⁿ√(aᵐ)"],

  /* ---------------- logarifm ---------------- */
  logTarif: ["Ta'rif: logₐb = c  ⇔  aᶜ = b", "Определение: logₐb = c  ⇔  aᶜ = b"],
  logQosh: ["Logarifmlar yig'indisi — ko'paytmaning logarifmi",
    "Сумма логарифмов — логарифм произведения"],
  logDaraja: ["Daraja ko'rsatkichi logarifm oldiga chiqadi",
    "Показатель степени выносится перед логарифмом"],

  /* ---------------- trigonometriya ---------------- */
  trigAyniyat: ["Asosiy ayniyat: sin²α + cos²α = 1", "Основное тождество: sin²α + cos²α = 1"],
  chorak: ["Burchak qaysi chorakda — ishora shundan aniqlanadi",
    "В какой четверти угол — оттуда и знак"],
  keltirish: ["Keltirish formulasi", "Формула приведения"],
  /* Keltirishda ikki savol bor va ikkalasi bir vaqtda esdan chiqadi:
     funksiya NOMI almashadimi va ISHORA qanday. Shuning uchun qoida
     alohida qadam bo'lib turadi. */
  keltirishNom: ["90° va 270° da nom almashadi, 180° va 360° da qoladi",
    "При 90° и 270° название меняется, при 180° и 360° — остаётся"],
  qoshishFormula: ["Qo'shish formulasi", "Формула сложения"],
  ikkilangan: ["Ikkilangan burchak formulasi", "Формула двойного угла"],
  radian: ["Radian: 180° = π", "Радианы: 180° = π"],
  jadvalQiymat: ["Jadval qiymati", "Табличное значение"],

  /* ---------------- progressiya ---------------- */
  arifHad: ["Arifmetik progressiya: aₙ = a₁ + (n−1)d", "Арифметическая прогрессия: aₙ = a₁ + (n−1)d"],
  arifYigindi: ["Yig'indi: Sₙ = (a₁ + aₙ)·n / 2", "Сумма: Sₙ = (a₁ + aₙ)·n / 2"],
  geoHad: ["Geometrik progressiya: bₙ = b₁·qⁿ⁻¹", "Геометрическая прогрессия: bₙ = b₁·qⁿ⁻¹"],
  geoYigindi: ["Yig'indi: Sₙ = b₁(qⁿ − 1) / (q − 1)", "Сумма: Sₙ = b₁(qⁿ − 1) / (q − 1)"],
  cheksiz: ["Cheksiz yig'indi: S = b₁ / (1 − q),  |q| < 1",
    "Бесконечная сумма: S = b₁ / (1 − q),  |q| < 1"],
  farqTop: ["Ayirmani topamiz: d = a₂ − a₁", "Находим разность: d = a₂ − a₁"],
  maxrajTop: ["Maxrajni topamiz: q = b₂ / b₁", "Находим знаменатель: q = b₂ / b₁"],

  /* ---------------- geometriya ---------------- */
  pifagor: ["Pifagor teoremasi: a² + b² = c²", "Теорема Пифагора: a² + b² = c²"],
  burchakYigindi: ["Uchburchak burchaklari yig'indisi — 180°", "Сумма углов треугольника — 180°"],
  tortburchakYigindi: ["To'rtburchak burchaklari yig'indisi — 360°", "Сумма углов четырёхугольника — 360°"],
  yuzaFormula: ["Yuza formulasi", "Формула площади"],
  perimetrFormula: ["Perimetr formulasi", "Формула периметра"],
  oxshashlik: ["O'xshash uchburchaklarda tomonlar nisbati teng",
    "У подобных треугольников отношения сторон равны"],
  oxshashYuza: ["Yuzalar nisbati — o'xshashlik koeffitsiyentining kvadrati",
    "Отношение площадей — квадрат коэффициента подобия"],
  markaziyBurchak: ["Markaziy burchak yoyga teng, ichki chizilgani — yarmi",
    "Центральный угол равен дуге, вписанный — половине"],
  aylanaUzunlik: ["Aylana uzunligi: C = 2πr", "Длина окружности: C = 2πr"],
  doiraYuza: ["Doira yuzi: S = πr²", "Площадь круга: S = πr²"],
  hajmFormula: ["Hajm formulasi", "Формула объёма"],
  yonYuza: ["Yon sirt formulasi", "Формула боковой поверхности"],
  sinuslar: ["Sinuslar teoremasi: a/sinA = b/sinB", "Теорема синусов: a/sinA = b/sinB"],
  kosinuslar: ["Kosinuslar teoremasi: c² = a² + b² − 2ab·cosC",
    "Теорема косинусов: c² = a² + b² − 2ab·cosC"],
  vektorAmal: ["Vektorlar koordinatasi bo'yicha qo'shiladi", "Векторы складываются покоординатно"],
  vektorUzunlik: ["Vektor uzunligi: |a| = √(x² + y²)", "Длина вектора: |a| = √(x² + y²)"],
  skalyar: ["Skalyar ko'paytma: a·b = x₁x₂ + y₁y₂", "Скалярное произведение: a·b = x₁x₂ + y₁y₂"],
  masofa: ["Ikki nuqta orasidagi masofa: √((x₂−x₁)² + (y₂−y₁)²)",
    "Расстояние между точками: √((x₂−x₁)² + (y₂−y₁)²)"],
  ortasi: ["O'rta nuqta — koordinatalar o'rta arifmetigi",
    "Середина — среднее арифметическое координат"],

  /* ---------------- funksiya va analiz ---------------- */
  hosilaJadval: ["Hosila jadvali: (xⁿ)' = n·xⁿ⁻¹", "Таблица производных: (xⁿ)' = n·xⁿ⁻¹"],
  hosilaYigindi: ["Yig'indining hosilasi — hosilalar yig'indisi",
    "Производная суммы — сумма производных"],
  hosilaKopaytma: ["Ko'paytma hosilasi: (uv)' = u'v + uv'", "Производная произведения: (uv)' = u'v + uv'"],
  murakkab: ["Murakkab funksiya: (f(g))' = f'(g)·g'", "Сложная функция: (f(g))' = f'(g)·g'"],
  kritik: ["Kritik nuqta — hosila nolga teng bo'lgan joy",
    "Критическая точка — где производная равна нулю"],
  osish: ["Hosila musbat bo'lsa funksiya o'sadi", "Если производная положительна — функция возрастает"],
  urinma: ["Urinma burchak koeffitsiyenti — shu nuqtadagi hosila",
    "Угловой коэффициент касательной — производная в точке"],
  integralJadval: ["Integral jadvali: ∫xⁿdx = xⁿ⁺¹/(n+1) + C",
    "Таблица интегралов: ∫xⁿdx = xⁿ⁺¹/(n+1) + C"],
  nyuton: ["Nyuton–Leybnits: ∫ₐᵇ f = F(b) − F(a)", "Ньютон–Лейбниц: ∫ₐᵇ f = F(b) − F(a)"],
  parabolaUchi: ["Parabola uchi: x₀ = −b / 2a", "Вершина параболы: x₀ = −b / 2a"],
  tarmoq: ["a > 0 — tarmoqlar yuqoriga, a < 0 — pastga",
    "a > 0 — ветви вверх, a < 0 — вниз"],
  aniqlanish: ["Aniqlanish sohasi — ifoda ma'noga ega bo'ladigan qiymatlar",
    "Область определения — где выражение имеет смысл"],
  juftlik: ["f(−x) = f(x) — juft,  f(−x) = −f(x) — toq",
    "f(−x) = f(x) — чётная,  f(−x) = −f(x) — нечётная"],

  /* ---------------- ehtimollik va statistika ---------------- */
  ehtimol: ["Ehtimollik = qulay hollar / jami hollar",
    "Вероятность = благоприятные исходы / все исходы"],
  ortacha: ["O'rta arifmetik = yig'indi / soni", "Среднее арифметическое = сумма / количество"],
  moda: ["Moda — eng ko'p uchragan qiymat", "Мода — наиболее частое значение"],
  mediana: ["Mediana — tartiblangan qatorning o'rtasi", "Медиана — середина упорядоченного ряда"],
  kombinatorika: ["Ko'paytirish qoidasi: har bir tanlov qolganiga ko'paytiriladi",
    "Правило умножения: каждый выбор умножается на остальные"],
  orinAlmash: ["O'rin almashtirishlar soni: n!", "Число перестановок: n!"],
} as const;

export type YechimKalit = keyof typeof Y;

/** Qadam izohi — joriy tilda. */
export const yo = (k: YechimKalit): string => Y[k][til() === "ru" ? 1 : 0];
