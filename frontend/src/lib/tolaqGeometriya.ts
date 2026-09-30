/**
 * TO'LIQ DARSLAR — geometriya (`lib/nazariya.ts` dagi `Tolaq`).
 * Kalit — darsning o'zbekcha nomi (`Lesson.n`), xuddi `NAZARIYA` dagidek.
 *
 * Har bir dars bir xil tartibda: tushuncha → formulalar → qanday yechiladi →
 * qo'lda yechilgan misollar → ko'p uchraydigan xatolar. Misollardagi
 * hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_GEOMETRIYA: Record<string, Tolaq> = {
  "Uchburchak va to'rtburchaklar": {
    t: [
      { h: ["Uchburchak", "Треугольник"],
        p: ["Uchburchak burchaklari yig'indisi doim 180°. Tashqi burchak o'zi bilan qo'shni bo'lmagan ikki ichki burchak yig'indisiga teng. Katta tomon qarshisida katta burchak yotadi. Har bir tomon qolgan ikkitasining yig'indisidan kichik.",
          "Сумма углов треугольника всегда 180°. Внешний угол равен сумме двух внутренних, не смежных с ним. Против большей стороны лежит больший угол. Каждая сторона меньше суммы двух других."] },
      { h: ["Teng yonli va teng tomonli", "Равнобедренный и равносторонний"],
        p: ["Teng yonli uchburchakda asosidagi burchaklar teng, asosga tushirilgan balandlik bir vaqtda mediana va bissektrisa bo'ladi. Teng tomonli uchburchakda hamma burchak 60°.",
          "В равнобедренном треугольнике углы при основании равны, а высота к основанию — одновременно медиана и биссектриса. В равностороннем все углы по 60°."] },
      { h: ["To'g'ri burchakli uchburchak", "Прямоугольный треугольник"],
        p: ["Pifagor: c² = a² + b². Gipotenuzaga tushirilgan mediana gipotenuzaning yarmiga teng. 30° burchak qarshisidagi katet gipotenuzaning yarmiga teng.",
          "Пифагор: c² = a² + b². Медиана к гипотенузе равна её половине. Катет против угла 30° равен половине гипотенузы."] },
      { h: ["To'rtburchaklar", "Четырёхугольники"],
        p: ["To'rtburchak burchaklari yig'indisi 360°. Parallelogrammda qarama-qarshi tomonlar va burchaklar teng, diagonallar kesishish nuqtasida teng bo'linadi. Rombda hamma tomon teng, diagonallar perpendikulyar va burchaklarni teng ikkiga bo'ladi. To'g'ri to'rtburchakda diagonallar teng. Kvadrat — ham romb, ham to'g'ri to'rtburchak. Trapetsiyaning o'rta chizig'i asoslarga parallel va ularning yarim yig'indisiga teng.",
          "Сумма углов четырёхугольника 360°. В параллелограмме противоположные стороны и углы равны, диагонали делятся точкой пересечения пополам. У ромба все стороны равны, диагонали перпендикулярны и делят углы пополам. У прямоугольника диагонали равны. Квадрат — и ромб, и прямоугольник. Средняя линия трапеции параллельна основаниям и равна их полусумме."] },
    ],
    f: [
      { n: ["Uchburchak burchaklari", "Углы треугольника"], f: "∠A + ∠B + ∠C = 180°" },
      { n: ["n-burchak burchaklari yig'indisi", "Сумма углов n-угольника"], f: "(n − 2) · 180°" },
      { n: ["Tashqi burchak", "Внешний угол"], f: "∠tashqi = ∠B + ∠C" },
      { n: ["Pifagor teoremasi", "Теорема Пифагора"], f: "c² = a² + b²" },
      { n: ["Trapetsiya o'rta chizig'i", "Средняя линия трапеции"], f: "m = (a + b) / 2" },
      { n: ["Parallelogramm burchaklari", "Углы параллелограмма"], f: "∠A + ∠B = 180°" },
    ],
    s: [
      ["Chizma chizing va berilganlarni unga yozing.", "Сделайте чертёж и отметьте на нём данные."],
      ["Shakl turini aniqlang: teng yonlimi, to'g'ri burchaklimi, parallelogrammmi — va uning xossalarini yozib oling.", "Определите вид фигуры: равнобедренный, прямоугольный, параллелограмм — и выпишите её свойства."],
      ["Noma'lumni x deb belgilang va burchaklar yoki tomonlar bo'yicha tenglama tuzing.", "Обозначьте неизвестное за x и составьте уравнение по углам или сторонам."],
      ["Tenglamani yeching va javobni tekshiring: burchak 0° dan 180° gacha, tomon musbat bo'lishi kerak.", "Решите уравнение и проверьте ответ: угол в пределах 0°–180°, сторона положительна."],
    ],
    m: [
      { s: ["ABC uchburchakda ∠A = 57°, ∠B = 61°. ∠C ni toping.", "В треугольнике ABC ∠A = 57°, ∠B = 61°. Найдите ∠C."],
        y: ["∠A + ∠B + ∠C = 180°", "∠C = 180° − 57° − 61°"], j: "62°" },
      { s: ["ABC teng yonli (AB = BC) uchburchakning BD medianasi 4 cm. ABD uchburchak perimetri 12 cm bo'lsa, ABC perimetrini toping.",
            "В равнобедренном треугольнике ABC (AB = BC) медиана BD = 4 см. Периметр ABD равен 12 см. Найдите периметр ABC."],
        y: [["Teng yonli uchburchakda asosga tushirilgan mediana — balandlik ham: AD = DC.", "В равнобедренном треугольнике медиана к основанию — и высота: AD = DC."],
          "P(ABD) = AB + AD + BD = 12  →  AB + AD = 12 − 4 = 8",
          "P(ABC) = AB + BC + AC = 2AB + 2AD = 2(AB + AD) = 2 · 8"], j: "16 cm" },
      { s: ["To'g'ri to'rtburchakning diagonali 13 cm, bir tomoni 5 cm. Yuzini toping.", "Диагональ прямоугольника 13 см, одна сторона 5 см. Найдите площадь."],
        y: [["Diagonal to'g'ri burchakli uchburchakning gipotenuzasi.", "Диагональ — гипотенуза прямоугольного треугольника."],
          "b² = 13² − 5² = 169 − 25 = 144  →  b = 12", "S = 5 · 12"], j: "60 cm²" },
    ],
    x: [
      ["Tashqi burchakni yonidagi ichki burchak bilan almashtirish: tashqi burchak = ikki uzoq ichki burchak yig'indisi.", "Путать внешний угол с соседним внутренним: внешний = сумма двух несмежных внутренних."],
      ["Parallelogrammda diagonallarni teng deb hisoblash — ular faqat to'g'ri to'rtburchakda teng.", "Считать диагонали параллелограмма равными — они равны только у прямоугольника."],
      ["Perimetr bilan yuzni aralashtirish: perimetr — tomonlar yig'indisi (cm), yuz — cm².", "Путать периметр и площадь: периметр — сумма сторон (см), площадь — см²."],
    ],
  },

  "Yuz va aylana": {
    t: [
      { h: ["Yuz", "Площадь"],
        p: ["Yuz — shakl ichidagi joy, cm² da o'lchanadi. Balandlik doim asosga PERPENDIKULYAR o'tkaziladi — yon tomon balandlik emas. Uchburchak yuzi parallelogramm yuzining yarmi, chunki parallelogrammni diagonal ikki teng uchburchakka bo'ladi.",
          "Площадь — «сколько места» занимает фигура, измеряется в см². Высота всегда проводится ПЕРПЕНДИКУЛЯРНО основанию — боковая сторона высотой не является. Площадь треугольника — половина площади параллелограмма, ведь диагональ делит его на два равных треугольника."] },
      { h: ["Aylana va doira", "Окружность и круг"],
        p: ["Aylana — chiziq, doira — uning ichi. Markaziy burchak tiralgan yoyga teng. Ichki chizilgan burchak esa yoyning YARMIGA teng, shuning uchun diametrga tiralgan burchak 90°. Urinma urinish nuqtasidagi radiusga perpendikulyar, bir nuqtadan o'tkazilgan ikki urinma kesmasi teng.",
          "Окружность — линия, круг — то, что внутри. Центральный угол равен дуге, на которую опирается. Вписанный угол равен ПОЛОВИНЕ дуги, поэтому угол на диаметре — 90°. Касательная перпендикулярна радиусу в точке касания, отрезки касательных из одной точки равны."] },
      { h: ["Ichki va tashqi chizilgan aylana", "Вписанная и описанная окружности"],
        p: ["Uchburchakka ichki chizilgan aylana markazi — bissektrisalar kesishuvi, tashqi chizilgani markazi — tomonlarning o'rta perpendikulyarlari kesishuvi. To'g'ri burchakli uchburchakda tashqi aylana markazi gipotenuza o'rtasida. Kvadratga tashqi chizilgan aylananing diametri kvadrat diagonaliga teng.",
          "Центр вписанной окружности — точка пересечения биссектрис, описанной — серединных перпендикуляров. В прямоугольном треугольнике центр описанной окружности — середина гипотенузы. Диаметр окружности, описанной около квадрата, равен его диагонали."] },
    ],
    f: [
      { n: ["To'g'ri to'rtburchak", "Прямоугольник"], f: "S = a · b" },
      { n: ["Parallelogramm", "Параллелограмм"], f: "S = a · h" },
      { n: ["Uchburchak", "Треугольник"], f: "S = a · h / 2 = ½ ab · sin C" },
      { n: ["Geron formulasi", "Формула Герона"], f: "S = √( p(p−a)(p−b)(p−c) ),  p = (a+b+c)/2" },
      { n: ["Trapetsiya", "Трапеция"], f: "S = (a + b) / 2 · h" },
      { n: ["Romb", "Ромб"], f: "S = d₁ · d₂ / 2" },
      { n: ["Aylana uzunligi va doira yuzi", "Длина окружности и площадь круга"], f: "C = 2πR,   S = πR²" },
      { n: ["Uchburchakka chizilgan aylanalar", "Окружности треугольника"], f: "r = S / p,   R = abc / (4S)" },
      { n: ["Muntazam uchburchak", "Правильный треугольник"], f: "S = a²√3 / 4" },
    ],
    s: [
      ["Shakl turini aniqlang va mos formulani tanlang.", "Определите вид фигуры и выберите формулу."],
      ["Balandlikni asosga perpendikulyar qilib oling; berilmagan bo'lsa Pifagor yoki sinus bilan toping.", "Возьмите высоту, перпендикулярную основанию; если она не дана — найдите по Пифагору или через синус."],
      ["Barcha uzunliklarni bir xil birlikda yozing (m ↔ dm ↔ cm).", "Приведите все длины к одной единице (м ↔ дм ↔ см)."],
      ["Javobni birlik² bilan yozing va mantiqqa tekshiring: bo'lak butundan katta bo'lmaydi.", "Запишите ответ с единицей² и проверьте здравый смысл: часть не бывает больше целого."],
    ],
    m: [
      { s: ["Parallelogrammning asosi a = 10, balandligi h = 15. Yuzini toping.", "Основание параллелограмма a = 10, высота h = 15. Найдите площадь."],
        y: ["S = a · h", "S = 10 · 15"], j: "150" },
      { s: ["Uchburchak tomonlari 13, 14, 15. Yuzini va ichki chizilgan aylana radiusini toping.", "Стороны треугольника 13, 14, 15. Найдите площадь и радиус вписанной окружности."],
        y: ["p = (13 + 14 + 15) / 2 = 21",
          "S = √(21 · 8 · 7 · 6) = √7056 = 84",
          "r = S / p = 84 / 21"], j: "S = 84,  r = 4" },
      { s: ["Radiusi 5 bo'lgan aylanaga kvadrat ichki chizilgan. Kvadrat yuzini va doiraning kvadratdan tashqaridagi qismini toping.",
            "В окружность радиуса 5 вписан квадрат. Найдите площадь квадрата и часть круга вне квадрата."],
        y: [["Kvadrat diagonali = diametr = 10.", "Диагональ квадрата = диаметр = 10."],
          "S(kvadrat) = d² / 2 = 100 / 2 = 50",
          "S(doira) = π · 5² = 25π",
          "25π − 50"], j: "50  va  25π − 50" },
    ],
    x: [
      ["Parallelogrammda yon tomonni balandlik deb olish — balandlik perpendikulyar bo'lishi shart.", "Брать боковую сторону параллелограмма за высоту — высота обязана быть перпендикуляром."],
      ["Geron formulasida p ni to'liq perimetr qilib qo'yish — p yarim perimetr.", "В формуле Герона брать p как весь периметр — p это полупериметр."],
      ["Diametr bilan radiusni aralashtirish: S = πR² da R — radius, diametr emas.", "Путать диаметр и радиус: в S = πR² берётся радиус, а не диаметр."],
    ],
  },

  "Sinuslar va kosinuslar teoremasi": {
    t: [
      { h: ["Sinuslar teoremasi", "Теорема синусов"],
        p: ["Tomonning qarshisidagi burchak sinusiga nisbati uchala tomon uchun bir xil va tashqi chizilgan aylana diametriga teng. Qachon ishlatamiz: ikki burchak va bir tomon berilganda, yoki tomon va uning qarshisidagi burchak berilganda.",
          "Отношение стороны к синусу противолежащего угла одинаково для всех сторон и равно диаметру описанной окружности. Применяем, когда даны два угла и сторона либо сторона и противолежащий угол."] },
      { h: ["Kosinuslar teoremasi", "Теорема косинусов"],
        p: ["Pifagor teoremasining umumlashmasi: to'g'ri burchak bo'lmasa ham ishlaydi. Qachon ishlatamiz: ikki tomon va ular orasidagi burchak berilganda (uchinchi tomon), yoki uch tomon berilganda (burchak).",
          "Обобщение теоремы Пифагора: работает и без прямого угла. Применяем, когда даны две стороны и угол между ними (третья сторона) или три стороны (угол)."] },
      { h: ["Burchak turini tomonlardan bilish", "Вид угла по сторонам"],
        p: ["Kosinus ishorasi burchak turini aytadi: cos C > 0 — o'tkir, cos C = 0 — to'g'ri, cos C < 0 — o'tmas. Ya'ni eng katta tomon kvadrati qolgan ikkitasi kvadratlari yig'indisidan katta bo'lsa, uchburchak o'tmas burchakli.",
          "Знак косинуса показывает вид угла: cos C > 0 — острый, 0 — прямой, < 0 — тупой. Если квадрат большей стороны больше суммы квадратов двух других — треугольник тупоугольный."] },
    ],
    f: [
      { n: ["Sinuslar teoremasi", "Теорема синусов"], f: "a / sin A = b / sin B = c / sin C = 2R" },
      { n: ["Kosinuslar teoremasi", "Теорема косинусов"], f: "c² = a² + b² − 2ab · cos C" },
      { n: ["Burchakni topish", "Нахождение угла"], f: "cos C = (a² + b² − c²) / (2ab)" },
      { n: ["Yuz", "Площадь"], f: "S = ½ · a · b · sin C" },
    ],
    s: [
      ["Berilganlarni yozing: nimalar ma'lum, nima kerak.", "Выпишите данные: что известно и что нужно найти."],
      ["Tomon va uning QARSHISIDAGI burchak juftligi bor bo'lsa — sinuslar; ikki tomon va orasidagi burchak, yoki uch tomon bo'lsa — kosinuslar.", "Есть пара «сторона — противолежащий угол» — синусов; две стороны и угол между ними или три стороны — косинусов."],
      ["Tenglamani tuzing va noma'lumni toping (kosinusda oxirida ildiz oling).", "Составьте уравнение и найдите неизвестное (в косинусах в конце извлеките корень)."],
      ["Sinus bo'yicha burchak topilganda o'tkir va o'tmas variantni tekshiring: sin α = sin(180° − α).", "Найдя угол по синусу, проверьте острый и тупой вариант: sin α = sin(180° − α)."],
    ],
    m: [
      { s: ["a = 7, b = 8, ∠C = 60°. c ni toping.", "a = 7, b = 8, ∠C = 60°. Найдите c."],
        y: ["c² = 7² + 8² − 2 · 7 · 8 · cos 60°", "c² = 49 + 64 − 112 · ½ = 113 − 56 = 57"], j: "c = √57" },
      { s: ["b = 10, ∠A = 30°, ∠B = 45°. a ni toping.", "b = 10, ∠A = 30°, ∠B = 45°. Найдите a."],
        y: ["a / sin 30° = b / sin 45°", "a = 10 · sin 30° / sin 45° = 10 · (1/2) / (√2/2)", "a = 10 / √2 = 5√2"], j: "5√2" },
      { s: ["Tomonlari 3, 5, 7 bo'lgan uchburchakning eng katta burchagini toping.", "Найдите наибольший угол треугольника со сторонами 3, 5, 7."],
        y: [["Eng katta burchak eng katta tomon (7) qarshisida.", "Наибольший угол лежит против наибольшей стороны (7)."],
          "cos C = (3² + 5² − 7²) / (2 · 3 · 5) = (9 + 25 − 49) / 30 = −15 / 30 = −½",
          "cos C = −½  →  C = 120°"], j: "120°" },
    ],
    x: [
      ["Sinuslar teoremasida tomonni o'ziga qarshi EMAS burchakka juftlab yozish.", "В теореме синусов ставить сторону в пару не с противолежащим углом."],
      ["Kosinuslar teoremasida −2ab cos C ning minusini tashlab ketish (yoki cos ni unutish).", "Терять минус в −2ab cos C (или забывать сам cos)."],
      ["cos manfiy chiqqanda xato deb o'ylash — u o'tmas burchak (90° dan katta) degani.", "Считать ошибкой отрицательный cos — это просто тупой угол (больше 90°)."],
    ],
  },

  "Pifagor teoremasi": {
    t: [
      { h: ["Teorema", "Теорема"],
        p: ["To'g'ri burchakli uchburchakda gipotenuza (to'g'ri burchak qarshisidagi, eng uzun tomon) kvadrati katetlar kvadratlari yig'indisiga teng. Teskarisi ham to'g'ri: tomonlar c² = a² + b² ni qanoatlantirsa, uchburchak to'g'ri burchakli.",
          "В прямоугольном треугольнике квадрат гипотенузы (стороны против прямого угла, самой длинной) равен сумме квадратов катетов. Верно и обратное: если c² = a² + b², треугольник прямоугольный."] },
      { h: ["Pifagor uchliklari", "Пифагоровы тройки"],
        p: ["Butun sonli tomonlar: 3-4-5, 5-12-13, 8-15-17, 7-24-25. Ularning hammasini bir xil songa ko'paytirsa ham to'g'ri burchakli qoladi (6-8-10, 9-12-15). Bularni yod bilsangiz, ildiz hisoblamay javob topasiz.",
          "Целые тройки: 3-4-5, 5-12-13, 8-15-17, 7-24-25. Умножив все числа на одно число, получим новую тройку (6-8-10, 9-12-15). Зная их, ответ находят без вычисления корня."] },
      { h: ["Foydali natijalar", "Полезные следствия"],
        p: ["Kvadratning diagonali a√2. Teng tomonli uchburchakning balandligi a√3 / 2. To'g'ri to'rtburchak diagonali d = √(a² + b²).",
          "Диагональ квадрата a√2. Высота равностороннего треугольника a√3 / 2. Диагональ прямоугольника d = √(a² + b²)."] },
    ],
    f: [
      { n: ["Pifagor", "Пифагор"], f: "c² = a² + b²" },
      { n: ["Katetni topish", "Нахождение катета"], f: "a = √(c² − b²)" },
      { n: ["Kvadrat diagonali", "Диагональ квадрата"], f: "d = a√2" },
      { n: ["Teng tomonli uchburchak balandligi", "Высота правильного треугольника"], f: "h = a√3 / 2" },
    ],
    s: [
      ["To'g'ri burchakni toping: gipotenuza uning qarshisida.", "Найдите прямой угол: гипотенуза лежит против него."],
      ["Noma'lum gipotenuzami yoki katetmi — aniqlang.", "Определите, что неизвестно: гипотенуза или катет."],
      ["Gipotenuza bo'lsa — kvadratlarni QO'SHING, katet bo'lsa — AYIRING.", "Гипотенуза — квадраты СКЛАДЫВАЕМ, катет — ВЫЧИТАЕМ."],
      ["Oxirida kvadrat ildiz oling.", "В конце извлеките квадратный корень."],
    ],
    m: [
      { s: ["Katetlari 6 va 8 bo'lgan uchburchak gipotenuzasini toping.", "Найдите гипотенузу при катетах 6 и 8."],
        y: ["c² = 6² + 8² = 36 + 64 = 100"], j: "10" },
      { s: ["Gipotenuza 13, bir katet 5. Ikkinchi katetni toping.", "Гипотенуза 13, катет 5. Найдите второй катет."],
        y: ["b² = 13² − 5² = 169 − 25 = 144"], j: "12" },
      { s: ["Tomonlari 9, 12, 15 bo'lgan uchburchak to'g'ri burchaklimi?", "Является ли треугольник со сторонами 9, 12, 15 прямоугольным?"],
        y: [["Eng uzun tomon 15 — gipotenuza bo'lishi mumkin.", "Самая длинная сторона 15 — возможная гипотенуза."], "9² + 12² = 81 + 144 = 225 = 15²"], j: "Ha" },
    ],
    x: [
      ["Gipotenuzani katet o'rniga qo'yish: u doim eng uzun tomon.", "Подставлять гипотенузу вместо катета: она всегда самая длинная."],
      ["Ildiz olishni unutib c² ni javob qilib yozish.", "Забыть извлечь корень и записать c² как ответ."],
      ["Katetni topganda kvadratlarni qo'shish (ayirish kerak).", "При нахождении катета складывать квадраты (нужно вычитать)."],
    ],
  },

  "geometriya8|Sinus, kosinus, tangens": {
    t: [
      { h: ["To'g'ri burchakli uchburchakda", "В прямоугольном треугольнике"],
        p: ["O'tkir burchak A uchun: sin A = qarshisidagi katet / gipotenuza; cos A = yopishgan katet / gipotenuza; tg A = qarshisidagi katet / yopishgan katet. Ular faqat burchakka bog'liq, uchburchak kattaligiga emas.",
          "Для острого угла A: sin A = противолежащий катет / гипотенуза; cos A = прилежащий катет / гипотенуза; tg A = противолежащий / прилежащий. Они зависят только от угла, а не от размера треугольника."] },
      { h: ["Asosiy ayniyatlar", "Основные тождества"],
        p: ["sin² A + cos² A = 1 va tg A = sin A / cos A. Shu ikkitadan bittasi ma'lum bo'lsa, qolganlarini topish mumkin.",
          "sin² A + cos² A = 1 и tg A = sin A / cos A. Зная одно значение, можно найти остальные."] },
    ],
    f: [
      { n: ["Sinus", "Синус"], f: "sin A = qarshisidagi / gipotenuza" },
      { n: ["Kosinus", "Косинус"], f: "cos A = yopishgan / gipotenuza" },
      { n: ["Tangens", "Тангенс"], f: "tg A = qarshisidagi / yopishgan" },
      { n: ["Ayniyat", "Тождество"], f: "sin²A + cos²A = 1" },
      { n: ["30°, 45°, 60°", "30°, 45°, 60°"], f: "sin: ½ · √2/2 · √3/2     cos: √3/2 · √2/2 · ½" },
    ],
    s: [
      ["Burchakni belgilang, keyin unga NISBATAN qarshisidagi va yopishgan katetni ajrating.", "Отметьте угол и относительно НЕГО определите противолежащий и прилежащий катеты."],
      ["Qaysi tomon ma'lum va qaysi kerak — shunga mos nisbatni tanlang.", "Выберите отношение, в котором участвуют известная и искомая стороны."],
      ["Tenglama tuzing va noma'lumni toping.", "Составьте уравнение и найдите неизвестное."],
    ],
    m: [
      { s: ["Katetlari 3 va 4, gipotenuzasi 5. A burchak 3 ga qarshi. sin A, cos A, tg A ni toping.", "Катеты 3 и 4, гипотенуза 5, угол A лежит против катета 3. Найдите sin A, cos A, tg A."],
        y: ["sin A = 3 / 5", "cos A = 4 / 5", "tg A = 3 / 4"], j: "0,6;  0,8;  0,75" },
      { s: ["Gipotenuza 10, ∠A = 30°. A qarshisidagi katetni toping.", "Гипотенуза 10, ∠A = 30°. Найдите катет против A."],
        y: ["Qarshisidagi katet = gipotenuza · sin A", "= 10 · sin 30° = 10 · ½"], j: "5" },
      { s: ["sin A = 0,6 (A — o'tkir). cos A ni toping.", "sin A = 0,6 (A — острый). Найдите cos A."],
        y: ["cos² A = 1 − sin² A = 1 − 0,36 = 0,64", "cos A = 0,8 (o'tkir burchakda musbat)"], j: "0,8" },
    ],
    x: [
      ["Sinus va kosinusni almashtirish: qarshisidagi katet — sinus, yopishgani — kosinus.", "Путать синус и косинус: противолежащий катет — синус, прилежащий — косинус."],
      ["Burchakni o'zgartirganda qarshisidagi va yopishgan katetni qayta aniqlamaslik.", "Не пересматривать «противолежащий/прилежащий» при смене угла."],
    ],
  },
};
