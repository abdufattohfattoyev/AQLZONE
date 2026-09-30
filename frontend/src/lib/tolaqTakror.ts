/**
 * TO'LIQ DARSLAR — kurs oxiridagi takrorlash darslari. Har biri kursning eng
 * muhim formulalarini bir joyga yig'adi va takrorlash rejasini beradi.
 */
import type { Tolaq } from "./nazariya";

const reja = (uz: string, ru: string): [string, string] => [uz, ru];

/** Hamma takrorlash darsida bir xil uch qadam. */
const QADAMLAR: [string, string][] = [
  reja("Natijadagi xatolarga qarab zaif bobni aniqlang.", "По ошибкам в результате определите слабую главу."),
  reja("O'sha bobning darsini oching, qoida va misolni o'qing.", "Откройте урок этой главы, прочтите правило и пример."),
  reja("Shu bobdan 10 savollik mashq bajaring.", "Выполните тренировку из 10 вопросов по этой главе."),
];

export const TOLAQ_TAKROR: Record<string, Tolaq> = {
  "algebra7|7-sinf algebra kursini takrorlash": {
    t: [{ h: ["Nimalarni takrorlaymiz", "Что повторяем"],
      p: ["Ifodalar, chiziqli tenglamalar, daraja va ko'phadlar, ko'paytuvchilarga ajratish, algebraik kasrlar, kombinatorika. Har bir bob keyingi sinfning poydevori: ayniqsa qisqa ko'paytirish formulalari va kasrlar.",
        "Выражения, линейные уравнения, степени и многочлены, разложение на множители, алгебраические дроби, комбинаторика. Каждая глава — основа следующего класса: особенно формулы сокращённого умножения и дроби."] }],
    f: [
      { n: ["Kvadratlar", "Квадраты"], f: "(a ± b)² = a² ± 2ab + b²" },
      { n: ["Kvadratlar ayirmasi", "Разность квадратов"], f: "a² − b² = (a − b)(a + b)" },
      { n: ["Daraja", "Степень"], f: "aᵐ · aⁿ = aᵐ⁺ⁿ,   (aᵐ)ⁿ = aᵐⁿ" },
    ],
    s: QADAMLAR,
    m: [{ s: ["(x + 3)² − (x − 3)² ni soddalashtiring.", "Упростите (x + 3)² − (x − 3)²."],
      y: ["(x² + 6x + 9) − (x² − 6x + 9)", "12x"], j: "12x" }],
    x: [reja("Formulani yod olib, ishorani xato yozish.", "Помнить формулу, но ошибаться в знаках.")],
  },

  "geometriya7|Hisoblashga doir masalalar": {
    t: [{ h: ["Hisoblash masalalari", "Задачи на вычисление"],
      p: ["Burchak va uchburchak masalalari uch qadamda yechiladi: chizma, ma'lum xossani tanlash (180°, tenglik, parallellik), tenglama tuzish. Har qadamda javobni shartga tekshiring.",
        "Задачи на углы и треугольники решаются в три шага: чертёж, выбор свойства (180°, равенство, параллельность), уравнение. На каждом шаге сверяйте с условием."] }],
    f: [
      { n: ["Uchburchak", "Треугольник"], f: "∠A + ∠B + ∠C = 180°" },
      { n: ["Qo'shni burchaklar", "Смежные углы"], f: "α + β = 180°" },
    ],
    s: [reja("Chizma chizing.", "Сделайте чертёж."), reja("Xossani tanlang.", "Выберите свойство."), reja("Tenglama tuzing va tekshiring.", "Составьте уравнение и проверьте.")],
    m: [{ s: ["Uchburchak burchaklari 2 : 3 : 4. Kattasi?", "Углы треугольника 2 : 3 : 4. Наибольший?"], y: ["9k = 180°  →  k = 20°", "4k = 80°"], j: "80°" }],
    x: [reja("Qo'shni burchaklarni 90° ga to'ldirish.", "Дополнять смежные углы до 90°.")],
  },

  "geometriya7|Yakuniy sinov": {
    t: [{ h: ["Yakuniy sinovga tayyorgarlik", "Подготовка к итоговой работе"],
      p: ["Sinov 7-sinf geometriyasining hamma bobini qamraydi: kesma, burchak, uchburchak, parallellik, burchaklar yig'indisi. Avval xato qilgan boblarni takrorlang, keyin sinovni ishlang.",
        "Работа охватывает все главы геометрии 7 класса. Сначала повторите главы с ошибками, затем решайте."] }],
    f: [
      { n: ["Uchburchak burchaklari", "Углы треугольника"], f: "180°" },
      { n: ["Tashqi burchak", "Внешний угол"], f: "∠tashqi = ∠A + ∠B" },
    ],
    s: [reja("Boblarni tartib bilan ko'zdan kechiring.", "Просмотрите главы по порядку."), reja("Formulalarni yozib chiqing.", "Выпишите формулы."), reja("Vaqtni belgilab sinovni ishlang.", "Решайте с засеканием времени.")],
    m: [{ s: ["Teng yonli uchburchakda uchidagi burchak 50°. Asosidagisi?", "Угол при вершине равнобедренного треугольника 50°. При основании?"], y: ["(180° − 50°) / 2"], j: "65°" }],
    x: [reja("Chizmasiz yechishga urinish.", "Решать без чертежа.")],
  },

  "algebra8|8-sinf algebra kursini takrorlash": {
    t: [{ h: ["Nimalarni takrorlaymiz", "Что повторяем"],
      p: ["Algebraik kasrlar, kvadrat ildiz, tengsizliklar va modul, kvadrat tenglamalar, ma'lumotlar tahlili. Eng ko'p xato: diskriminant hisobi, ildiz xossalari va tengsizlikda ishora.",
        "Алгебраические дроби, корни, неравенства и модуль, квадратные уравнения, анализ данных. Чаще всего ошибаются в дискриминанте, свойствах корней и знаке неравенства."] }],
    f: [
      { n: ["Kvadrat tenglama", "Квадратное уравнение"], f: "x = (−b ± √D) / (2a),   D = b² − 4ac" },
      { n: ["Viyet", "Виета"], f: "x₁ + x₂ = −b/a,   x₁x₂ = c/a" },
      { n: ["Modul", "Модуль"], f: "|x| < c  ⇔  −c < x < c" },
    ],
    s: QADAMLAR,
    m: [{ s: ["x² − 5x + 6 = 0 ildizlari yig'indisi va ko'paytmasi?", "Сумма и произведение корней x² − 5x + 6 = 0?"], y: ["Viyet: 5 va 6"], j: "5 va 6" }],
    x: [reja("Manfiyga bo'lganda tengsizlik ishorasini almashtirmaslik.", "Не менять знак неравенства при делении на отрицательное.")],
  },

  "geometriya8|8-sinf geometriya kursini takrorlash": {
    t: [{ h: ["Nimalarni takrorlaymiz", "Что повторяем"],
      p: ["To'rtburchaklar, to'g'ri burchakli uchburchak va Pifagor, koordinatalar va vektorlar, yuzlar, aylana. Eng muhim: Pifagor, masofa formulasi, yuz formulalari, ichki chizilgan burchak.",
        "Четырёхугольники, прямоугольный треугольник и Пифагор, координаты и векторы, площади, окружность. Главное: Пифагор, формула расстояния, площади, вписанный угол."] }],
    f: [
      { n: ["Pifagor", "Пифагор"], f: "c² = a² + b²" },
      { n: ["Masofa", "Расстояние"], f: "d = √((x₂−x₁)² + (y₂−y₁)²)" },
      { n: ["Ichki chizilgan burchak", "Вписанный угол"], f: "∠ = ½ · yoy" },
    ],
    s: QADAMLAR,
    m: [{ s: ["A(0; 0), B(6; 8) orasidagi masofa?", "Расстояние между A(0; 0) и B(6; 8)?"], y: ["√(36 + 64)"], j: "10" }],
    x: [reja("Diametr va radiusni aralashtirish.", "Путать диаметр и радиус.")],
  },

  "algebra9|9-sinf algebra kursini takrorlash": {
    t: [{ h: ["Nimalarni takrorlaymiz", "Что повторяем"],
      p: ["Kvadrat funksiya, tenglamalar sistemalari, trigonometriya, progressiyalar, ehtimollik. Formulalar ko'p, shuning uchun har bobning 2–3 asosiy formulasini yozib, misol bilan mustahkamlang.",
        "Квадратичная функция, системы, тригонометрия, прогрессии, вероятность. Формул много — выпишите по 2–3 главные для каждой главы и закрепите примером."] }],
    f: [
      { n: ["Uch", "Вершина"], f: "x₀ = −b/(2a)" },
      { n: ["Arifmetik progressiya", "Арифметическая прогрессия"], f: "aₙ = a₁ + (n − 1)d" },
      { n: ["Geometrik progressiya", "Геометрическая прогрессия"], f: "bₙ = b₁ · qⁿ⁻¹" },
      { n: ["Ayniyat", "Тождество"], f: "sin²α + cos²α = 1" },
    ],
    s: QADAMLAR,
    m: [{ s: ["a₁ = 2, d = 3. S₅?", "a₁ = 2, d = 3. S₅?"], y: ["(2 · 2 + 4 · 3)/2 · 5 = 8 · 5"], j: "40" }],
    x: [reja("Progressiyada n − 1 ni unutish.", "Забыть n − 1 в формуле члена.")],
  },

  "geometriya9|9-sinf geometriya kursini takrorlash": {
    t: [{ h: ["Nimalarni takrorlaymiz", "Что повторяем"],
      p: ["O'xshashlik, sinuslar va kosinuslar teoremalari, aylana uzunligi va doira yuzi, metrik munosabatlar. Yuz nisbati k², teoremani tanlash qoidasi va yoy/sektor formulalari asosiy.",
        "Подобие, теоремы синусов и косинусов, длина окружности и площадь круга, метрические соотношения. Главное: площади относятся как k², выбор теоремы, формулы дуги и сектора."] }],
    f: [
      { n: ["Yuzlar", "Площади"], f: "S₁ / S = k²" },
      { n: ["Kosinuslar teoremasi", "Теорема косинусов"], f: "c² = a² + b² − 2ab cos C" },
      { n: ["Yoy", "Дуга"], f: "l = π r n / 180" },
    ],
    s: QADAMLAR,
    m: [{ s: ["k = 2, kichik shakl yuzi 3. Kattasi?", "k = 2, площадь меньшей 3. Большей?"], y: ["3 · 2²"], j: "12" }],
    x: [reja("k ni k² bilan almashtirish.", "Путать k и k².")],
  },

  "algebra10|10-sinf kursini takrorlash": {
    t: [{ h: ["Nimalarni takrorlaymiz", "Что повторяем"],
      p: ["Funksiyalar, ratsional va irratsional tenglamalar, ko'rsatkichli va logarifmik, trigonometrik tenglamalar, ehtimollar. Eng ko'p xato: ODZ ni tekshirmaslik va tengsizlik ishorasini asosga qarab qo'ymaslik.",
        "Функции, рациональные и иррациональные уравнения, показательные и логарифмические, тригонометрические уравнения, вероятность. Частые ошибки: не проверить ОДЗ и не учесть основание при знаке неравенства."] }],
    f: [
      { n: ["Logarifm", "Логарифм"], f: "log_a(bc) = log_a b + log_a c" },
      { n: ["sin x = a", "sin x = a"], f: "x = (−1)ᵏ arcsin a + πk" },
      { n: ["Ko'rsatkichli tenglama", "Показательное уравнение"], f: "aᶠ = aᵍ  ⇒  f = g" },
    ],
    s: QADAMLAR,
    m: [{ s: ["log₂ 8 + log₃ 9 ni hisoblang.", "Вычислите log₂ 8 + log₃ 9."], y: ["3 + 2"], j: "5" }],
    x: [reja("Logarifm ODZ sini tekshirmaslik.", "Не проверить ОДЗ логарифма.")],
  },

  "geometriya10|Takrorlashga doir masalalar": {
    t: [{ h: ["Takrorlash masalalari", "Задачи на повторение"],
      p: ["Planimetriya va stereometriyaning asosiy g'oyalari: chizma, mos formula, Pifagor. Fazoviy masalada avval tekis kesim chiziladi, so'ng planimetriya qo'llanadi.",
        "Основные идеи планиметрии и стереометрии: чертёж, формула, Пифагор. В пространственной задаче сначала выделяют плоское сечение, затем применяют планиметрию."] }],
    f: [
      { n: ["Diagonal", "Диагональ"], f: "d² = a² + b² + c²" },
      { n: ["Eyler", "Эйлер"], f: "U − Q + Y = 2" },
      { n: ["Masofa", "Расстояние"], f: "d = √(Δx² + Δy² + Δz²)" },
    ],
    s: [reja("Chizma chizing.", "Сделайте чертёж."), reja("Tekis kesimni ajrating.", "Выделите плоское сечение."), reja("Formulani qo'llang.", "Примените формулу.")],
    m: [{ s: ["Kub qirrasi 4. Diagonali?", "Ребро куба 4. Диагональ?"], y: ["4√3"], j: "4√3" }],
    x: [reja("Fazoviy masalani chizmasiz yechish.", "Решать пространственную задачу без чертежа.")],
  },

  "matematika11|Yakuniy takrorlash": {
    t: [{ h: ["Nimalarni takrorlaymiz", "Что повторяем"],
      p: ["Hosila va uning tatbiqlari, integral, prizma va silindr, piramida, konus, shar, ehtimollik. Hosila formulalari, ekstremum qoidasi, hajm formulalari — eng muhim.",
        "Производная и её применение, интеграл, призма и цилиндр, пирамида, конус, шар, вероятность. Главное: формулы производных, правило экстремума, формулы объёмов."] }],
    f: [
      { n: ["Hosila", "Производная"], f: "(xⁿ)′ = n xⁿ⁻¹" },
      { n: ["Nyuton–Leybnis", "Ньютон–Лейбниц"], f: "∫ₐᵇ f = F(b) − F(a)" },
      { n: ["Hajmlar", "Объёмы"], f: "V = S·H;  ⅓ S·H;  4/3 πR³" },
    ],
    s: QADAMLAR,
    m: [{ s: ["f(x) = x³ − 3x. f′(2)?", "f(x) = x³ − 3x. f′(2)?"], y: ["3x² − 3 = 12 − 3"], j: "9" }],
    x: [reja("Hosila va boshlang'ich funksiyani aralashtirish.", "Путать производную и первообразную.")],
  },
};
