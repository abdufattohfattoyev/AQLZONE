/**
 * TO'LIQ DARSLAR — 9-sinf geometriya. Tuzilishi `tolaqGeometriya.ts` dagidek.
 * Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_GEOMETRIYA9: Record<string, Tolaq> = {
  "O'xshashlik koeffitsiyenti": {
    t: [
      { h: ["O'xshash shakllar", "Подобные фигуры"],
        p: ["Shakllar o'xshash: mos burchaklari teng, mos tomonlari proporsional. Tomonlar nisbati — o'xshashlik koeffitsiyenti k. Perimetrlar nisbati ham k, yuzlar nisbati k², hajmlar nisbati k³.",
          "Фигуры подобны: соответственные углы равны, стороны пропорциональны. Отношение сторон — коэффициент подобия k. Периметры относятся как k, площади как k², объёмы как k³."] },
    ],
    f: [
      { n: ["Koeffitsiyent", "Коэффициент"], f: "k = A₁B₁ / AB" },
      { n: ["Perimetr", "Периметр"], f: "P₁ / P = k" },
      { n: ["Yuz", "Площадь"], f: "S₁ / S = k²" },
    ],
    s: [
      ["Mos tomonlarni aniqlang (teng burchaklar qarshisidagi).", "Определите соответственные стороны (против равных углов)."],
      ["k = kattaning kichikka nisbatini yozing.", "Найдите k как отношение сторон."],
      ["Perimetrga k, yuzga k² qo'llang.", "Периметр — k, площадь — k²."],
    ],
    m: [
      { s: ["Mos tomonlar 6 va 9. k va perimetrlar nisbati?", "Соответственные стороны 6 и 9. Найдите k и отношение периметров."],
        y: ["k = 9/6 = 3/2 (kattasi 9 ga tegishli uchburchak uchun)", "Perimetrlar ham 3 : 2"], j: "k = 3/2;  3 : 2" },
      { s: ["k = 3, kichik uchburchak yuzi 5. Kattasining yuzi?", "k = 3, площадь меньшего 5. Площадь большего?"],
        y: ["S₁ = 5 · 3² = 5 · 9"], j: "45" },
    ],
    x: [
      ["Yuzlar nisbatini k deb olish (k² bo'ladi).", "Считать отношение площадей равным k (нужно k²)."],
      ["Mos bo'lmagan tomonlarni nisbatga qo'yish.", "Брать несоответственные стороны."],
    ],
  },

  "O'xshash uchburchak tomonlari": {
    t: [
      { h: ["Proporsiya", "Пропорция"],
        p: ["O'xshash uchburchaklarda mos tomonlar nisbati bir xil: AB/A₁B₁ = BC/B₁C₁ = AC/A₁C₁. Noma'lum tomon proporsiyadan topiladi: o'rtadagi hadlar ko'paytmasi = chetdagilar ko'paytmasi. Mos tomonlarni teng burchaklar qarshisidan tanlang.",
          "В подобных треугольниках отношения соответственных сторон равны: AB/A₁B₁ = BC/B₁C₁ = AC/A₁C₁. Неизвестную сторону находят из пропорции. Соответственные стороны выбирайте против равных углов."] },
    ],
    f: [
      { n: ["Proporsiya", "Пропорция"], f: "a / a₁ = b / b₁ = c / c₁ = k" },
      { n: ["Asosiy xossa", "Основное свойство"], f: "a / b = c / d  ⇒  a · d = b · c" },
    ],
    s: [
      ["O'xshash uchburchaklarni va teng burchaklarni toping.", "Найдите подобные треугольники и равные углы."],
      ["Mos tomonlar juftligini yozing.", "Запишите пары соответственных сторон."],
      ["Proporsiya tuzing va noma'lumni toping.", "Составьте пропорцию и найдите неизвестное."],
    ],
    m: [
      { s: ["△ABC ~ △DEF, AB = 4, DE = 6, BC = 10. EF ni toping.", "△ABC ~ △DEF, AB = 4, DE = 6, BC = 10. Найдите EF."],
        y: ["AB/DE = BC/EF  →  4/6 = 10/EF", "EF = 10 · 6 / 4"], j: "15" },
      { s: ["Uchburchak tomonlari 3, 4, 5. O'xshashining eng katta tomoni 15. Kichik tomoni?", "Стороны треугольника 3, 4, 5. Наибольшая сторона подобного 15. Наименьшая?"],
        y: ["k = 15/5 = 3", "3 · 3"], j: "9" },
    ],
    x: [
      ["Proporsiyada kichikni kattaga va kattani kichikka aralash qo'yish.", "Смешивать порядок в пропорции."],
    ],
  },

  "O'xshash shakllar yuzi": {
    t: [
      { h: ["Yuzlar nisbati", "Отношение площадей"],
        p: ["O'xshash shakllar yuzlarining nisbati o'xshashlik koeffitsiyenti kvadratiga teng. Shuning uchun tomonlar 2 marta ortsa yuz 4 marta ortadi. Teskari masalada k = √(S₁/S).",
          "Отношение площадей подобных фигур равно квадрату коэффициента подобия. Стороны вдвое больше — площадь вчетверо. Обратно: k = √(S₁/S)."] },
    ],
    f: [
      { n: ["Yuzlar", "Площади"], f: "S₁ / S = k²" },
      { n: ["Teskari", "Обратно"], f: "k = √(S₁ / S)" },
    ],
    s: [
      ["k ni toping (tomonlardan yoki yuzlardan).", "Найдите k (по сторонам или площадям)."],
      ["Yuzni k² ga ko'paytiring yoki bo'ling.", "Умножьте или разделите площадь на k²."],
    ],
    m: [
      { s: ["Uchburchaklar tomonlari nisbati 2 : 3. Yuzlar nisbati?", "Стороны треугольников относятся как 2 : 3. Отношение площадей?"],
        y: ["(2/3)²"], j: "4 : 9" },
      { s: ["Yuzlari 18 va 50 bo'lgan o'xshash shakllar o'xshashlik koeffitsiyenti?", "Площади подобных фигур 18 и 50. Коэффициент подобия?"],
        y: ["k² = 50/18 = 25/9", "k = 5/3"], j: "5/3" },
    ],
    x: [
      ["Yuzlar nisbatini tomonlar nisbati bilan bir xil deb hisoblash.", "Считать отношение площадей равным отношению сторон."],
    ],
  },

  "O'xshashlik alomatlari": {
    t: [
      { h: ["Uchta alomat", "Три признака"],
        p: ["I: ikki burchak mos ravishda teng. II: ikki tomon proporsional va ular orasidagi burchaklar teng. III: uch tomon proporsional. Ikki burchak yetarli, chunki uchinchisi 180° dan kelib chiqadi. Yordamchi: uchburchakning o'rta chizig'i uni o'xshash uchburchakka ajratadi (k = 1/2); asosga parallel to'g'ri chiziq ham o'xshash uchburchak kesadi.",
          "I: два угла соответственно равны. II: две стороны пропорциональны и углы между ними равны. III: три стороны пропорциональны. Достаточно двух углов — третий из 180°. Полезно: средняя линия отсекает подобный треугольник (k = 1/2); прямая, параллельная стороне, тоже."] },
    ],
    f: [
      { n: ["I alomat", "I признак"], f: "∠A = ∠A₁,  ∠B = ∠B₁  ⇒  △ABC ~ △A₁B₁C₁" },
      { n: ["III alomat", "III признак"], f: "AB/A₁B₁ = BC/B₁C₁ = AC/A₁C₁" },
    ],
    s: [
      ["Teng burchaklarni toping (parallel chiziqlar, vertikal, umumiy).", "Найдите равные углы (параллельные, вертикальные, общий)."],
      ["Mos alomatni tanlang.", "Выберите признак."],
      ["O'xshashlikdan proporsiya yozing.", "Из подобия запишите пропорцию."],
    ],
    m: [
      { s: ["DE ∥ BC (D — AB da, E — AC da). △ADE va △ABC o'xshashmi?", "DE ∥ BC (D на AB, E на AC). Подобны ли △ADE и △ABC?"],
        y: ["∠A — umumiy", "∠ADE = ∠ABC (mos burchaklar)"], j: "Ha (I alomat)" },
      { s: ["3, 4, 5 va 6, 8, 10 uchburchaklar o'xshashmi?", "Подобны ли треугольники 3, 4, 5 и 6, 8, 10?"],
        y: ["6/3 = 8/4 = 10/5 = 2"], j: "Ha (III alomat), k = 2" },
    ],
    x: [
      ["O'xshash bilan tengni aralashtirish: o'xshash uchburchaklarning tomonlari teng bo'lishi shart emas.", "Путать подобие с равенством: стороны не обязаны быть равными."],
    ],
  },

  "Yuzni sinus orqali hisoblash": {
    t: [
      { h: ["Formula", "Формула"],
        p: ["Uchburchakning yuzi — ikki tomon va ular orasidagi burchak sinusi ko'paytmasining yarmi. Balandlik topish shart emas. Parallelogramm yuzi — shu ko'paytmaning to'liq qiymati (a · b · sin α). 90° da sin = 1 — odatdagi ½ ab.",
          "Площадь треугольника — половина произведения двух сторон на синус угла между ними. Высоту искать не нужно. Площадь параллелограмма — a · b · sin α. При 90° sin = 1 — привычное ½ ab."] },
    ],
    f: [
      { n: ["Uchburchak", "Треугольник"], f: "S = ½ · a · b · sin C" },
      { n: ["Parallelogramm", "Параллелограмм"], f: "S = a · b · sin α" },
      { n: ["Tashqi aylana bilan", "С описанной окружностью"], f: "S = abc / (4R)" },
    ],
    s: [
      ["Ikki tomon va ORASIDAGI burchakni toping.", "Найдите две стороны и угол МЕЖДУ ними."],
      ["sin qiymatini qo'ying va hisoblang.", "Подставьте sin и вычислите."],
    ],
    m: [
      { s: ["a = 6, b = 10, C = 30°. Uchburchak yuzi?", "a = 6, b = 10, C = 30°. Площадь треугольника?"],
        y: ["½ · 6 · 10 · sin 30° = 30 · ½"], j: "15" },
      { s: ["Parallelogramm tomonlari 5 va 8, burchagi 60°. Yuzi?", "Стороны параллелограмма 5 и 8, угол 60°. Площадь?"],
        y: ["5 · 8 · sin 60° = 40 · √3/2"], j: "20√3" },
    ],
    x: [
      ["Burchak tomonlar ORASIDA bo'lmaganda ishlatish.", "Применять угол, не заключённый между сторонами."],
      ["Uchburchak yuzida ½ ni unutish.", "Забыть ½ для треугольника."],
    ],
  },

  "Sinuslar teoremasi": {
    t: [
      { h: ["Teorema", "Теорема"],
        p: ["Uchburchakning tomoni qarshisidagi burchak sinusiga nisbati hamma tomon uchun bir xil va tashqi chizilgan aylananing diametriga (2R) teng. Ikki burchak va bir tomon berilsa yoki tomon va qarshisidagi burchak bo'lsa ishlatiladi.",
          "Отношение стороны к синусу противолежащего угла одинаково для всех сторон и равно диаметру описанной окружности (2R). Применяют при двух углах и стороне или стороне и противолежащем угле."] },
    ],
    f: [
      { n: ["Sinuslar teoremasi", "Теорема синусов"], f: "a / sin A = b / sin B = c / sin C = 2R" },
    ],
    s: [
      ["«Tomon — qarshisidagi burchak» juftligini toping.", "Найдите пару «сторона — противолежащий угол»."],
      ["Proporsiya tuzing va noma'lumni toping.", "Составьте пропорцию, найдите неизвестное."],
      ["Uchinchi burchak = 180° − qolgan ikkitasi.", "Третий угол = 180° − два других."],
    ],
    m: [
      { s: ["b = 10, ∠A = 30°, ∠B = 45°. a?", "b = 10, ∠A = 30°, ∠B = 45°. a?"],
        y: ["a = b · sin A / sin B = 10 · ½ / (√2/2) = 10/√2"], j: "5√2" },
      { s: ["a = 6, ∠A = 30°. Tashqi aylana radiusi?", "a = 6, ∠A = 30°. Радиус описанной окружности?"],
        y: ["2R = a / sin A = 6 / ½ = 12"], j: "R = 6" },
    ],
    x: [
      ["Tomonni o'ziga qarshi bo'lmagan burchak sinusiga bo'lish.", "Делить сторону на синус не противолежащего угла."],
      ["R o'rniga 2R ni radius deb olish.", "Принимать 2R за радиус."],
    ],
  },

  "Kosinuslar teoremasi": {
    t: [
      { h: ["Teorema", "Теорема"],
        p: ["Tomon kvadrati — qolgan ikki tomon kvadratlari yig'indisidan ularning ikkilangan ko'paytmasining orasidagi burchak kosinusiga ko'paytmasini ayirish. Pifagorning umumlashmasi: 90° da cos = 0. Ikki tomon va orasidagi burchak berilsa, uchinchi tomon; uch tomon berilsa, burchak topiladi.",
          "Квадрат стороны равен сумме квадратов двух других минус удвоенное произведение их на косинус угла между ними. Обобщение Пифагора: при 90° cos = 0. Даны две стороны и угол между ними — находим третью; даны три стороны — угол."] },
    ],
    f: [
      { n: ["Tomon", "Сторона"], f: "c² = a² + b² − 2ab · cos C" },
      { n: ["Burchak", "Угол"], f: "cos C = (a² + b² − c²) / (2ab)" },
    ],
    s: [
      ["Qaysi elementlar berilganini aniqlang.", "Определите, какие элементы известны."],
      ["Formulaga qo'ying (minus 2ab cos C ni unutmang).", "Подставьте (не потеряйте −2ab cos C)."],
      ["Tomon uchun ildiz oling; burchak uchun kosinus ishorasidan turini aniqlang.", "Для стороны извлеките корень; для угла определите вид по знаку косинуса."],
    ],
    m: [
      { s: ["a = 7, b = 8, C = 60°. c?", "a = 7, b = 8, C = 60°. c?"],
        y: ["c² = 49 + 64 − 2 · 7 · 8 · ½ = 113 − 56 = 57"], j: "√57" },
      { s: ["a = 3, b = 5, c = 7. Eng katta burchak?", "a = 3, b = 5, c = 7. Наибольший угол?"],
        y: ["cos C = (9 + 25 − 49) / 30 = −15/30 = −½"], j: "120°" },
    ],
    x: [
      ["−2ab cos C dagi minusni tushirish.", "Потерять минус в −2ab cos C."],
      ["Burchak tomonlar orasida bo'lmaganda ishlatish.", "Брать угол не между сторонами."],
    ],
  },

  "Uchburchaklarni yechish": {
    t: [
      { h: ["Yechish rejasi", "План решения"],
        p: ["Uchburchakni yechish — berilganlar bo'yicha qolgan tomon va burchaklarni topish. Berilganlarga qarab teorema tanlanadi: ikki burchak+tomon — sinuslar; ikki tomon+orasidagi burchak — kosinuslar; uch tomon — kosinuslar; tomon+qarshisidagi burchak+yana bir element — sinuslar (ikki yechim bo'lishi mumkin).",
          "Решить треугольник — найти остальные стороны и углы. Выбор теоремы: два угла + сторона — синусы; две стороны + угол между ними — косинусы; три стороны — косинусы; сторона + противолежащий угол + ещё элемент — синусы (возможны два решения)."] },
    ],
    f: [
      { n: ["Burchaklar", "Углы"], f: "A + B + C = 180°" },
      { n: ["Sinuslar", "Синусы"], f: "a / sin A = b / sin B" },
      { n: ["Kosinuslar", "Косинусы"], f: "c² = a² + b² − 2ab cos C" },
    ],
    s: [
      ["Berilganlarni jadvalga yozing va teorema tanlang.", "Запишите данные и выберите теорему."],
      ["Tomonni toping (kosinus yoki sinus).", "Найдите сторону."],
      ["Burchakni toping; sin bo'yicha topilganda 180° − α variantini tekshiring.", "Найдите угол; при нахождении по sin проверьте вариант 180° − α."],
    ],
    m: [
      { s: ["a = 5, b = 7, C = 60°. c va S?", "a = 5, b = 7, C = 60°. Найдите c и S."],
        y: ["c² = 25 + 49 − 2 · 5 · 7 · ½ = 39", "S = ½ · 5 · 7 · sin 60° = 35√3 / 4"], j: "c = √39;  S = 35√3/4" },
      { s: ["a = 10, ∠A = 30°, ∠B = 105°. b va c?", "a = 10, ∠A = 30°, ∠B = 105°. b и c?"],
        y: ["∠C = 45°", "b = 10 sin 105° / sin 30° = 20 sin 105°", "c = 10 sin 45° / sin 30° = 10√2"], j: "c = 10√2,  b = 20 sin 105° ≈ 19,3" },
    ],
    x: [
      ["Sinus bo'yicha burchakni topib, o'tmas variantni unutish.", "Найти угол по синусу и не проверить тупой вариант."],
    ],
  },

  "Muntazam ko'pburchaklar": {
    t: [
      { h: ["Muntazam ko'pburchak", "Правильный многоугольник"],
        p: ["Hamma tomonlari va burchaklari teng qavariq ko'pburchak. Ichki burchagi (n − 2) · 180°/n. Unga ichki va tashqi aylana chizish mumkin, markazlari umumiy. Tomon a va tashqi aylana radiusi R: a = 2R sin(180°/n); ichki aylana radiusi r = R cos(180°/n).",
          "Выпуклый многоугольник с равными сторонами и углами. Внутренний угол (n − 2) · 180°/n. В него можно вписать и около него описать окружности с общим центром. Сторона a = 2R sin(180°/n); радиус вписанной r = R cos(180°/n)."] },
    ],
    f: [
      { n: ["Ichki burchak", "Внутренний угол"], f: "α = (n − 2) · 180° / n" },
      { n: ["Tomon", "Сторона"], f: "a = 2R · sin(180°/n)" },
      { n: ["Ichki aylana", "Вписанная"], f: "r = R · cos(180°/n)" },
    ],
    s: [
      ["n ni aniqlang.", "Определите n."],
      ["Markaziy burchak 360°/n; tomon — teng yonli uchburchakdan.", "Центральный угол 360°/n; сторону находят из равнобедренного треугольника."],
      ["Formulalar bo'yicha R, r yoki a ni almashtiring.", "Свяжите R, r, a формулами."],
    ],
    m: [
      { s: ["Muntazam oltiburchak tomoni 6. Tashqi aylana radiusi?", "Сторона правильного шестиугольника 6. Радиус описанной окружности?"],
        y: ["a = 2R sin 30° = R"], j: "6" },
      { s: ["Muntazam sakkizburchak bir burchagi?", "Угол правильного восьмиугольника?"],
        y: ["(8 − 2) · 180° / 8 = 1080° / 8"], j: "135°" },
      { s: ["Kvadratning ichki aylana radiusi 3. Tomoni va tashqi aylana radiusi?", "Радиус вписанной окружности квадрата 3. Сторона и радиус описанной?"],
        y: ["a = 2r = 6", "R = a√2 / 2 = 3√2"], j: "6  va  3√2" },
    ],
    x: [
      ["Oltiburchakda tomon = R ekanini bilmaslik (30° dan).", "Не знать, что у шестиугольника a = R."],
      ["Markaziy burchakni ichki burchak bilan almashtirish.", "Путать центральный и внутренний углы."],
    ],
  },

  "Aylana uzunligi": {
    t: [
      { h: ["Aylana uzunligi", "Длина окружности"],
        p: ["Aylana uzunligi diametriga nisbatan doimiy son — π ≈ 3,14. Radius r bo'lsa C = 2πr. Doira yuzi S = πr². Ikkalasi radiusga bog'liq: r ikki marta ortsa C ikki marta, S to'rt marta ortadi.",
          "Отношение длины окружности к диаметру — постоянное число π ≈ 3,14. При радиусе r: C = 2πr. Площадь круга S = πr². При увеличении r вдвое C растёт вдвое, S — вчетверо."] },
    ],
    f: [
      { n: ["Uzunlik", "Длина"], f: "C = 2πr = πd" },
      { n: ["Yuz", "Площадь"], f: "S = πr²" },
    ],
    s: [
      ["r yoki d ni aniqlang.", "Определите r или d."],
      ["Kerakli formulaga qo'ying; π ni qoldiring (yoki taxminan 3,14).", "Подставьте в формулу; π оставьте (или 3,14)."],
    ],
    m: [
      { s: ["r = 5 bo'lsa C va S?", "r = 5: найдите C и S."],
        y: ["C = 2π · 5 = 10π", "S = π · 25"], j: "C = 10π,  S = 25π" },
      { s: ["Aylana uzunligi 18π. Radiusi?", "Длина окружности 18π. Радиус?"],
        y: ["2πr = 18π  →  r = 9"], j: "9" },
    ],
    x: [
      ["S = 2πr, C = πr² deb almashtirish.", "Перепутать формулы C и S."],
    ],
  },

  "Yoy uzunligi": {
    t: [
      { h: ["Yoy", "Дуга"],
        p: ["Markaziy burchagi n° bo'lgan yoy — aylananing n/360 qismi. Uzunligi l = πrn/180 (yoki radianda l = rα).",
          "Дуга с центральным углом n° составляет n/360 окружности. Длина l = πrn/180 (или l = rα в радианах)."] },
    ],
    f: [
      { n: ["Gradusda", "В градусах"], f: "l = π r n / 180" },
      { n: ["Radianda", "В радианах"], f: "l = r · α" },
    ],
    s: [
      ["Yoy aylananing qaysi qismini tashkil qilishini toping (n/360).", "Найдите долю окружности (n/360)."],
      ["Butun aylana uzunligini shu qismga ko'paytiring.", "Умножьте длину окружности на эту долю."],
    ],
    m: [
      { s: ["r = 6, markaziy burchak 60°. Yoy uzunligi?", "r = 6, центральный угол 60°. Длина дуги?"],
        y: ["l = π · 6 · 60 / 180"], j: "2π" },
      { s: ["Yoy uzunligi 5π, r = 10. Markaziy burchagi?", "Длина дуги 5π, r = 10. Центральный угол?"],
        y: ["π · 10 · n / 180 = 5π  →  n = 90"], j: "90°" },
    ],
    x: [
      ["180 o'rniga 360 ga bo'lish.", "Делить на 360 вместо 180 в формуле πrn/180."],
    ],
  },

  "Sektor yuzi": {
    t: [
      { h: ["Sektor", "Сектор"],
        p: ["Sektor — ikki radius va yoy bilan chegaralangan doira qismi. Markaziy burchagi n° bo'lsa yuzi doira yuzining n/360 qismi: S = πr²n/360. Yoy uzunligi orqali: S = ½ · l · r.",
          "Сектор — часть круга между двумя радиусами и дугой. При центральном угле n° площадь — n/360 площади круга: S = πr²n/360. Через длину дуги: S = ½ · l · r."] },
    ],
    f: [
      { n: ["Gradusda", "В градусах"], f: "S = π r² n / 360" },
      { n: ["Yoy orqali", "Через дугу"], f: "S = ½ · l · r" },
    ],
    s: [
      ["Sektor doiraning qaysi qismini tashkil qiladi?", "Какую часть круга занимает сектор?"],
      ["Doira yuzini shu qismga ko'paytiring.", "Умножьте площадь круга на эту долю."],
    ],
    m: [
      { s: ["r = 6, burchak 60°. Sektor yuzi?", "r = 6, угол 60°. Площадь сектора?"],
        y: ["π · 36 · 60 / 360"], j: "6π" },
      { s: ["Yoy uzunligi 4π, r = 6. Sektor yuzi?", "Длина дуги 4π, r = 6. Площадь сектора?"],
        y: ["½ · 4π · 6"], j: "12π" },
    ],
    x: [
      ["Sektor yuzini doira yuzi bilan aralashtirish.", "Путать площадь сектора и всего круга."],
    ],
  },

  "Proporsional kesmalar": {
    t: [
      { h: ["Metrik munosabatlar", "Метрические соотношения"],
        p: ["To'g'ri burchakli uchburchakda gipotenuzaga tushirilgan balandlik h gipotenuzani a₁ va b₁ ga bo'ladi: h² = a₁ · b₁ (o'rta proporsional). Katet — gipotenuza va o'z proyeksiyasining o'rta proporsionali: a² = c · a₁. Aylanada kesishuvchi vatarlar: AE · EB = CE · ED.",
          "В прямоугольном треугольнике высота h к гипотенузе делит её на a₁ и b₁: h² = a₁ · b₁. Катет — среднее пропорциональное гипотенузы и своей проекции: a² = c · a₁. Пересекающиеся хорды: AE · EB = CE · ED."] },
    ],
    f: [
      { n: ["Balandlik", "Высота"], f: "h² = a₁ · b₁" },
      { n: ["Katet", "Катет"], f: "a² = c · a₁,   b² = c · b₁" },
      { n: ["Vatarlar", "Хорды"], f: "AE · EB = CE · ED" },
    ],
    s: [
      ["To'g'ri burchakli uchburchakda balandlikni tushiring va kesmalarni belgilang.", "Проведите высоту и обозначьте отрезки."],
      ["Mos o'rta proporsional formulani tanlang.", "Выберите формулу среднего пропорционального."],
    ],
    m: [
      { s: ["Balandlik gipotenuzani 4 va 9 ga bo'ldi. Balandlik?", "Высота делит гипотенузу на 4 и 9. Найдите высоту."],
        y: ["h² = 4 · 9 = 36"], j: "6" },
      { s: ["Gipotenuza 10, katetning proyeksiyasi 4. Katet?", "Гипотенуза 10, проекция катета 4. Катет?"],
        y: ["a² = 10 · 4 = 40"], j: "2√10" },
      { s: ["Aylanada vatarlar E da kesishdi: AE = 3, EB = 8, CE = 4. ED?", "Хорды пересеклись в E: AE = 3, EB = 8, CE = 4. ED?"],
        y: ["3 · 8 = 4 · ED"], j: "6" },
    ],
    x: [
      ["h² = a₁ + b₁ deb yozish (ko'paytma).", "Писать h² = a₁ + b₁ (нужно произведение)."],
    ],
  },
};
