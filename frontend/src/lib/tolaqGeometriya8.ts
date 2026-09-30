/**
 * TO'LIQ DARSLAR — 8-sinf geometriya. Tuzilishi `tolaqGeometriya.ts` dagidek.
 * Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_GEOMETRIYA8: Record<string, Tolaq> = {
  "Parallelogramm burchaklari": {
    t: [
      { h: ["Xossalari", "Свойства"],
        p: ["Parallelogramm — qarama-qarshi tomonlari juft-juft parallel to'rtburchak. Qarama-qarshi burchaklari teng, qo'shni burchaklari yig'indisi 180°, burchaklar yig'indisi 360°. Diagonallar kesishish nuqtasida teng bo'linadi.",
          "Параллелограмм — четырёхугольник с попарно параллельными противоположными сторонами. Противоположные углы равны, соседние в сумме 180°, сумма углов 360°. Диагонали делятся точкой пересечения пополам."] },
    ],
    f: [
      { n: ["Qarama-qarshi", "Противоположные"], f: "∠A = ∠C,   ∠B = ∠D" },
      { n: ["Qo'shni", "Соседние"], f: "∠A + ∠B = 180°" },
    ],
    s: [
      ["Ma'lum burchakning qarama-qarshisi unga teng.", "Противоположный углу равен ему."],
      ["Qo'shnisi 180° − burchak.", "Соседний = 180° − угол."],
      ["Nisbat berilsa: a + b = 180° dan k ni toping.", "Если дано отношение — найдите k из a + b = 180°."],
    ],
    m: [
      { s: ["Parallelogrammda ∠A = 70°. Qolgan burchaklarni toping.", "В параллелограмме ∠A = 70°. Найдите остальные углы."],
        y: ["∠C = ∠A = 70°", "∠B = ∠D = 180° − 70°"], j: "70°, 110°, 70°, 110°" },
      { s: ["Qo'shni burchaklar 2 : 7 nisbatda. Kichigini toping.", "Соседние углы относятся как 2 : 7. Найдите меньший."],
        y: ["2k + 7k = 180°  →  k = 20°", "2 · 20°"], j: "40°" },
      { s: ["Parallelogrammning ikki qarama-qarshi burchagi yig'indisi 200°. Barcha burchaklarini toping.", "Сумма двух противоположных углов параллелограмма 200°. Найдите все углы."],
        y: ["Qarama-qarshi burchaklar teng: har biri 200° / 2 = 100°", "Qo'shni burchaklar: 180° − 100° = 80°"], j: "100°, 80°, 100°, 80°" },
    ],
    x: [
      ["Qarama-qarshi burchaklarni yig'indisi 180° deb olish (ular teng).", "Считать противоположные углы дополняющими до 180° (они равны)."],
      ["Diagonallarni burchak bissektrisasi deb hisoblash (faqat rombda).", "Считать диагонали биссектрисами (только у ромба)."],
    ],
  },

  "Parallelogramm perimetri": {
    t: [
      { h: ["Perimetr", "Периметр"],
        p: ["Parallelogrammda qarama-qarshi tomonlar teng, shuning uchun P = 2(a + b). Yordamchi xossa: parallelogramm burchagining bissektrisasi qarama-qarshi tomonni kesib, TENG YONLI uchburchak hosil qiladi.",
          "У параллелограмма противоположные стороны равны, поэтому P = 2(a + b). Полезное свойство: биссектриса угла параллелограмма отсекает равнобедренный треугольник."] },
    ],
    f: [
      { n: ["Perimetr", "Периметр"], f: "P = 2(a + b)" },
      { n: ["Bissektrisa", "Биссектриса"], f: "AB = BE (E — bissektrisaning BC dagi nuqtasi)" },
    ],
    s: [
      ["Qo'shni tomonlarni a va b bilan belgilang.", "Обозначьте соседние стороны a и b."],
      ["P = 2(a + b) ga qo'ying, yoki b ni toping.", "Подставьте в P = 2(a + b) или найдите b."],
      ["Bissektrisa bo'lsa: bir tomonning bo'laklari teng yonli uchburchakdan kelib chiqadi.", "Есть биссектриса — используйте равнобедренный треугольник."],
    ],
    m: [
      { s: ["a = 7, b = 5. Perimetrni toping.", "a = 7, b = 5. Найдите периметр."],
        y: ["2 · (7 + 5)"], j: "24" },
      { s: ["P = 36, bir tomon ikkinchisidan 4 ga katta. Tomonlarni toping.", "P = 36, одна сторона на 4 больше другой. Найдите стороны."],
        y: ["b, b + 4:  2(2b + 4) = 36  →  b = 7", "b + 4 = 11"], j: "7 va 11" },
      { s: ["A burchak bissektrisasi BC ni E da kesdi: BE = 6, EC = 4. Perimetrni toping.", "Биссектриса угла A пересекает BC в E: BE = 6, EC = 4. Найдите периметр."],
        y: ["∠BAE = ∠EAD = ∠BEA  →  AB = BE = 6", "BC = 6 + 4 = 10", "P = 2(6 + 10)"], j: "32" },
    ],
    x: [
      ["P = a + b deb hisoblash.", "Считать P = a + b."],
      ["Bissektrisa teng yonli uchburchak hosil qilishini unutish.", "Не заметить равнобедренный треугольник от биссектрисы."],
    ],
  },

  "Romb va kvadrat": {
    t: [
      { h: ["Romb", "Ромб"],
        p: ["Romb — hamma tomoni teng parallelogramm. Diagonallari PERPENDIKULYAR, kesishish nuqtasida teng bo'linadi va burchaklarni teng ikkiga bo'ladi. Diagonallari a tomonli to'g'ri burchakli uchburchaklar hosil qiladi: (d₁/2)² + (d₂/2)² = a².",
          "Ромб — параллелограмм с равными сторонами. Диагонали ПЕРПЕНДИКУЛЯРНЫ, делятся пополам и делят углы пополам. Образуют прямоугольные треугольники: (d₁/2)² + (d₂/2)² = a²."] },
      { h: ["Kvadrat", "Квадрат"],
        p: ["Kvadrat — hamma tomoni va burchaklari teng: ham romb, ham to'g'ri to'rtburchak. Diagonallari teng, perpendikulyar, d = a√2.",
          "Квадрат — все стороны и углы равны: и ромб, и прямоугольник. Диагонали равны, перпендикулярны, d = a√2."] },
    ],
    f: [
      { n: ["Romb tomoni", "Сторона ромба"], f: "a² = (d₁/2)² + (d₂/2)²" },
      { n: ["Perimetr", "Периметр"], f: "P = 4a" },
      { n: ["Kvadrat diagonali", "Диагональ квадрата"], f: "d = a√2" },
    ],
    s: [
      ["Diagonallar kesishish nuqtasida to'g'ri burchakli uchburchak ajrating.", "Выделите прямоугольный треугольник из половин диагоналей."],
      ["Pifagor bilan tomonni toping.", "Найдите сторону по Пифагору."],
      ["Kvadratda diagonal ↔ tomon: √2 ga ko'paytiring/bo'ling.", "В квадрате диагональ ↔ сторона: умножайте/делите на √2."],
    ],
    m: [
      { s: ["Romb diagonallari 6 va 8. Tomoni va perimetrini toping.", "Диагонали ромба 6 и 8. Найдите сторону и периметр."],
        y: ["(6/2)² + (8/2)² = 9 + 16 = 25  →  a = 5", "P = 4 · 5"], j: "a = 5,  P = 20" },
      { s: ["Kvadrat tomoni 5. Diagonalini toping.", "Сторона квадрата 5. Найдите диагональ."],
        y: ["d = 5√2"], j: "5√2" },
      { s: ["Kvadrat diagonali 8. Tomoni?", "Диагональ квадрата 8. Найдите сторону."],
        y: ["a = d / √2 = 8/√2 = 4√2"], j: "4√2" },
    ],
    x: [
      ["Romb diagonallarini teng deb olish (teng faqat kvadratda).", "Считать диагонали ромба равными (равны только у квадрата)."],
      ["Yarim diagonallarni butun deb qo'yish Pifagorda.", "Подставлять целые диагонали вместо половин."],
    ],
  },

  "Trapetsiya": {
    t: [
      { h: ["Trapetsiya", "Трапеция"],
        p: ["Faqat ikki tomoni (asoslari) parallel bo'lgan to'rtburchak; qolgan ikki tomon — yon tomonlar. Yon tomondagi burchaklar yig'indisi 180°. Teng yonli trapetsiyada yon tomonlar teng, asosdagi burchaklar teng, diagonallar teng. Balandlikni tushirib, to'g'ri burchakli uchburchak hosil qiling.",
          "Четырёхугольник, у которого параллельны только две стороны (основания); остальные — боковые. Углы при боковой стороне в сумме 180°. В равнобедренной трапеции боковые стороны равны, углы при основании равны, диагонали равны. Опустите высоту и получите прямоугольный треугольник."] },
    ],
    f: [
      { n: ["Yon tomondagi burchaklar", "Углы у боковой стороны"], f: "∠A + ∠D = 180°" },
      { n: ["Teng yonli: balandlik bo'lagi", "Равнобедренная: отрезок"], f: "x = (katta asos − kichik asos) / 2" },
    ],
    s: [
      ["Ikki balandlik tushiring (kichik asosning uchlaridan).", "Опустите две высоты из концов меньшего основания."],
      ["Katta asosdan ortiqcha qismni toping va uni teng ikkiga bo'ling (teng yonli).", "Найдите избыток большего основания, разделите пополам (равнобедренная)."],
      ["Pifagor bilan balandlikni toping.", "Найдите высоту по Пифагору."],
    ],
    m: [
      { s: ["Teng yonli trapetsiya asoslari 10 va 4, yon tomoni 5. Balandligi?", "Равнобедренная трапеция: основания 10 и 4, боковая 5. Высота?"],
        y: ["x = (10 − 4) / 2 = 3", "h² = 5² − 3² = 25 − 9 = 16"], j: "4" },
      { s: ["Trapetsiyaning yon tomondagi bir burchagi 65°. Shu yon tomondagi ikkinchi burchagi?", "Один из углов у боковой стороны трапеции 65°. Другой угол у той же стороны?"],
        y: ["Bir tomonli: 180° − 65°"], j: "115°" },
    ],
    x: [
      ["Yon tomonni balandlik deb olish (u to'g'ri burchakli trapetsiyada ham).", "Принимать боковую сторону за высоту."],
      ["Teng yonli bo'lmagan trapetsiyada asosdagi burchaklarni teng deb hisoblash.", "Считать углы при основании равными у неравнобедренной."],
    ],
  },

  "O'rta chiziq. Fales teoremasi": {
    t: [
      { h: ["O'rta chiziq", "Средняя линия"],
        p: ["Uchburchakning o'rta chizig'i — ikki tomon o'rtalarini tutashtiruvchi kesma: uchinchi tomonga parallel va uning yarmiga teng. Trapetsiyaning o'rta chizig'i — yon tomonlar o'rtalarini tutashtiruvchi kesma: asoslarga parallel va yarim yig'indiga teng.",
          "Средняя линия треугольника соединяет середины двух сторон: параллельна третьей и равна её половине. Средняя линия трапеции соединяет середины боковых сторон: параллельна основаниям и равна их полусумме."] },
      { h: ["Fales teoremasi", "Теорема Фалеса"],
        p: ["Burchak tomonlarini kesuvchi parallel to'g'ri chiziqlar tomonlarda PROPORSIONAL kesmalar ajratadi. Teng kesmalar ajratsa — ikkinchi tomonda ham teng kesmalar hosil bo'ladi.",
          "Параллельные прямые, пересекающие стороны угла, отсекают на них ПРОПОРЦИОНАЛЬНЫЕ отрезки. Если на одной стороне отрезки равны — равны и на другой."] },
    ],
    f: [
      { n: ["Uchburchak", "Треугольник"], f: "m = a / 2" },
      { n: ["Trapetsiya", "Трапеция"], f: "m = (a + b) / 2" },
      { n: ["Fales", "Фалес"], f: "OA / OB = OC / OD" },
    ],
    s: [
      ["Qaysi kesma o'rta chiziq ekanini tekshiring (o'rtalarni tutashtiradimi?).", "Проверьте, соединяет ли отрезок середины."],
      ["Mos formulani qo'llang.", "Примените формулу."],
      ["Fales: nisbatni tuzing va proporsiya yeching.", "Фалес: составьте пропорцию и решите."],
    ],
    m: [
      { s: ["Trapetsiya asoslari 6 va 14. O'rta chizig'i?", "Основания трапеции 6 и 14. Средняя линия?"],
        y: ["(6 + 14) / 2"], j: "10" },
      { s: ["Uchburchak asosi 18. O'rta chizig'i asosga parallel bo'lsa uzunligi?", "Основание треугольника 18. Длина средней линии, параллельной основанию?"],
        y: ["18 / 2"], j: "9" },
      { s: ["Trapetsiya o'rta chizig'i 10, bir asosi 12. Ikkinchisi?", "Средняя линия трапеции 10, одно основание 12. Другое?"],
        y: ["(12 + x) / 2 = 10  →  12 + x = 20"], j: "8" },
    ],
    x: [
      ["O'rta chiziqni yig'indi (yarmisiz) deb olish.", "Считать среднюю линию суммой оснований (без деления пополам)."],
      ["O'rta chiziq bo'lmagan parallel kesmaga o'rta chiziq formulasini qo'llash.", "Применять формулу к параллельному отрезку, не являющемуся средней линией."],
    ],
  },

  "30°, 45°, 60° burchaklar": {
    t: [
      { h: ["Maxsus burchaklar", "Особые углы"],
        p: ["30°, 45°, 60° uchun sinus, kosinus, tangens qiymatlarini yod bilish kerak: ular ko'p masalada uchraydi. 30° va 60° — yarim teng tomonli uchburchakdan; 45° — kvadrat diagonalidan. To'g'ri burchakli uchburchakda: 30° qarshisidagi katet gipotenuzaning yarmi.",
          "Значения sin, cos, tg для 30°, 45°, 60° нужно знать наизусть. 30° и 60° — из половины равностороннего треугольника; 45° — из диагонали квадрата. Катет против 30° равен половине гипотенузы."] },
    ],
    f: [
      { n: ["Sinus", "Синус"], f: "sin 30° = 1/2,   sin 45° = √2/2,   sin 60° = √3/2" },
      { n: ["Kosinus", "Косинус"], f: "cos 30° = √3/2,   cos 45° = √2/2,   cos 60° = 1/2" },
      { n: ["Tangens", "Тангенс"], f: "tg 30° = √3/3,   tg 45° = 1,   tg 60° = √3" },
    ],
    s: [
      ["Burchak maxsusmi (30°, 45°, 60°)? Jadvaldan qiymatni oling.", "Угол особый? Возьмите значение из таблицы."],
      ["Katet = gipotenuza · sin (qarshisidagi) yoki · cos (yopishgan).", "Катет = гипотенуза · sin (противолежащий) или · cos (прилежащий)."],
    ],
    m: [
      { s: ["Gipotenuza 12, ∠A = 60°. A ga qarshi va yopishgan katetlar?", "Гипотенуза 12, ∠A = 60°. Катеты против и прилежащий к A?"],
        y: ["Qarshisida: 12 · sin 60° = 12 · √3/2 = 6√3", "Yopishgan: 12 · cos 60° = 6"], j: "6√3  va  6" },
      { s: ["Teng yonli to'g'ri burchakli uchburchakda katet 5. Gipotenuza?", "Катет равнобедренного прямоугольного треугольника 5. Гипотенуза?"],
        y: ["c = 5 / cos 45° = 5 / (√2/2) = 10/√2 = 5√2"], j: "5√2" },
      { s: ["sin 30° + cos 60° ni hisoblang.", "Вычислите sin 30° + cos 60°."],
        y: ["1/2 + 1/2"], j: "1" },
    ],
    x: [
      ["sin 30° va sin 60° qiymatlarini almashtirish.", "Путать sin 30° и sin 60°."],
      ["tg 45° = √2/2 deb yozish (tg 45° = 1).", "Писать tg 45° = √2/2 (верно 1)."],
    ],
  },

  "To'g'ri burchakli uchburchakni yechish": {
    t: [
      { h: ["Uchburchakni yechish", "Решение треугольника"],
        p: ["To'g'ri burchakli uchburchakni yechish — ikkita ma'lum elementdan (bittasi tomon) qolgan hamma tomon va burchaklarni topish. Vositalar: Pifagor (ikki tomon → uchinchisi), sin/cos/tg (burchak va tomon), o'tkir burchaklar yig'indisi 90°.",
          "Решить прямоугольный треугольник — по двум известным элементам (хотя бы одна сторона) найти остальные стороны и углы. Инструменты: Пифагор (две стороны → третья), sin/cos/tg (угол и сторона), сумма острых углов 90°."] },
    ],
    f: [
      { n: ["Pifagor", "Пифагор"], f: "c² = a² + b²" },
      { n: ["Burchak", "Угол"], f: "tg A = a / b,   sin A = a / c,   cos A = b / c" },
      { n: ["Ikkinchi burchak", "Второй угол"], f: "B = 90° − A" },
    ],
    s: [
      ["Ma'lum elementlarni chizmaga qo'ying.", "Отметьте известное на чертеже."],
      ["Ikki tomon berilsa — Pifagor va tg bilan burchak; burchak+tomon berilsa — sin/cos/tg.", "Две стороны — Пифагор и tg для угла; угол + сторона — sin/cos/tg."],
      ["Ikkinchi o'tkir burchak 90° dan ayirib topiladi.", "Второй острый угол — из 90°."],
    ],
    m: [
      { s: ["Katetlar 5 va 12. Gipotenuza va tg A (A — 5 ga qarshi)?", "Катеты 5 и 12. Гипотенуза и tg A (A против 5)?"],
        y: ["c² = 25 + 144 = 169  →  c = 13", "tg A = 5/12"], j: "c = 13;  tg A = 5/12" },
      { s: ["Gipotenuza 10, ∠A = 30°. Katetlar?", "Гипотенуза 10, ∠A = 30°. Катеты?"],
        y: ["a = 10 · sin 30° = 5", "b = 10 · cos 30° = 5√3"], j: "5 va 5√3" },
      { s: ["Katet 6, unga yopishgan burchak 45°. Ikkinchi katet va gipotenuza?", "Катет 6, прилежащий угол 45°. Второй катет и гипотенуза?"],
        y: ["Uchburchak teng yonli: ikkinchi katet 6", "c = 6√2"], j: "6 va 6√2" },
    ],
    x: [
      ["Qarshisidagi va yopishgan katetni adashtirish.", "Путать противолежащий и прилежащий катеты."],
      ["Bir elementli ma'lumot bilan yechishga urinish (kamida ikki element kerak).", "Пытаться решить по одному элементу."],
    ],
  },

  "Kesma o'rtasining koordinatalari": {
    t: [
      { h: ["O'rta nuqta", "Середина отрезка"],
        p: ["A(x₁; y₁) va B(x₂; y₂) kesma o'rtasi M ning koordinatalari — mos koordinatalarning o'rta arifmetigi. Teskari masalada (o'rta va bir uch ma'lum) ikkinchi uch: x₂ = 2xₘ − x₁.",
          "Координаты середины M отрезка A(x₁; y₁), B(x₂; y₂) — средние арифметические соответствующих координат. Обратно: по середине и одному концу второй конец x₂ = 2xₘ − x₁."] },
    ],
    f: [
      { n: ["O'rta nuqta", "Середина"], f: "M((x₁ + x₂)/2 ; (y₁ + y₂)/2)" },
      { n: ["Ikkinchi uch", "Второй конец"], f: "x₂ = 2xₘ − x₁,   y₂ = 2yₘ − y₁" },
    ],
    s: [
      ["x koordinatalarni qo'shib 2 ga bo'ling.", "Сложите x-координаты и разделите на 2."],
      ["y koordinatalar bilan ham xuddi shunday.", "То же для y."],
    ],
    m: [
      { s: ["A(2; −3), B(8; 5). Kesma o'rtasini toping.", "A(2; −3), B(8; 5). Найдите середину."],
        y: ["x = (2 + 8)/2 = 5", "y = (−3 + 5)/2 = 1"], j: "M(5; 1)" },
      { s: ["M(1; 4) — AB o'rtasi, A(−3; 2). B ni toping.", "M(1; 4) — середина AB, A(−3; 2). Найдите B."],
        y: ["x = 2 · 1 − (−3) = 5", "y = 2 · 4 − 2 = 6"], j: "B(5; 6)" },
    ],
    x: [
      ["Ayirib 2 ga bo'lish (qo'shish kerak).", "Вычитать вместо сложения."],
      ["Ikkinchi uchni topganda faqat bitta koordinatani hisoblash.", "Найти только одну координату второго конца."],
    ],
  },

  "Ikki nuqta orasidagi masofa": {
    t: [
      { h: ["Masofa formulasi", "Формула расстояния"],
        p: ["Ikki nuqta orasidagi masofa — koordinatalar ayirmalari kvadratlari yig'indisining ildizi. Bu Pifagor teoremasi: ayirmalar to'g'ri burchakli uchburchakning kateti. Ayirmalar tartibi muhim emas (kvadratga ko'tariladi).",
          "Расстояние между точками — корень из суммы квадратов разностей координат. Это теорема Пифагора: разности — катеты. Порядок вычитания не важен (возводим в квадрат)."] },
    ],
    f: [
      { n: ["Masofa", "Расстояние"], f: "d = √( (x₂ − x₁)² + (y₂ − y₁)² )" },
    ],
    s: [
      ["Koordinatalar ayirmalarini toping.", "Найдите разности координат."],
      ["Kvadratlarini qo'shing.", "Сложите квадраты."],
      ["Ildiz oling.", "Извлеките корень."],
    ],
    m: [
      { s: ["A(1; 2) va B(4; 6) orasidagi masofa?", "Расстояние между A(1; 2) и B(4; 6)?"],
        y: ["(4 − 1)² + (6 − 2)² = 9 + 16 = 25"], j: "5" },
      { s: ["A(0; 0), B(6; 0), C(3; 4). AC va BC teng ekanini ko'rsating.", "A(0; 0), B(6; 0), C(3; 4). Покажите, что AC = BC."],
        y: ["AC = √(9 + 16) = 5", "BC = √((3 − 6)² + 16) = √25 = 5"], j: "AC = BC = 5 (teng yonli)" },
    ],
    x: [
      ["Ildiz olishni unutib d² ni javob qilib yozish.", "Оставить d² без корня."],
      ["Koordinatalar ayirmasini kvadratga ko'tarmasdan qo'shish.", "Складывать разности без квадратов."],
    ],
  },

  "Vektor uzunligi": {
    t: [
      { h: ["Vektor", "Вектор"],
        p: ["Vektor — yo'nalishli kesma. AB vektor koordinatalari = oxiri koordinatalari − boshi koordinatalari. Uzunlik (modul) |a| = √(x² + y²). Teng vektorlar — uzunligi va yo'nalishi bir xil.",
          "Вектор — направленный отрезок. Координаты AB = координаты конца − координаты начала. Длина (модуль) |a| = √(x² + y²). Равные векторы имеют одинаковую длину и направление."] },
    ],
    f: [
      { n: ["Koordinatalar", "Координаты"], f: "AB = (x_B − x_A ; y_B − y_A)" },
      { n: ["Uzunlik", "Длина"], f: "|a| = √(x² + y²)" },
    ],
    s: [
      ["Boshi va oxiridan vektor koordinatalarini toping.", "Найдите координаты вектора по началу и концу."],
      ["Uzunlikni Pifagor bilan hisoblang.", "Вычислите длину по Пифагору."],
    ],
    m: [
      { s: ["a(3; −4) ning uzunligi?", "Длина вектора a(3; −4)?"],
        y: ["√(9 + 16)"], j: "5" },
      { s: ["A(1; 2), B(4; 6). AB vektor va uning uzunligi?", "A(1; 2), B(4; 6). Вектор AB и его длина?"],
        y: ["AB = (3; 4)", "|AB| = √(9 + 16)"], j: "AB(3; 4),  5" },
    ],
    x: [
      ["Koordinatalarni boshi − oxiri tartibida ayirish (teskari vektor).", "Вычитать «начало − конец» (получится противоположный вектор)."],
    ],
  },

  "Vektorlarni qo'shish": {
    t: [
      { h: ["Amallar", "Действия"],
        p: ["Vektorlar koordinatalari bo'yicha qo'shiladi/ayriladi, songa ko'paytiriladi. Geometrik: uchburchak qoidasi (birinchining oxiriga ikkinchining boshi), parallelogramm qoidasi (umumiy boshdan). a − b = a + (−b).",
          "Векторы складываются/вычитаются покоординатно и умножаются на число. Геометрически: правило треугольника, правило параллелограмма. a − b = a + (−b)."] },
    ],
    f: [
      { n: ["Yig'indi", "Сумма"], f: "a + b = (x₁ + x₂ ; y₁ + y₂)" },
      { n: ["Songa ko'paytirish", "Умножение на число"], f: "k · a = (kx ; ky)" },
    ],
    s: [
      ["Avval songa ko'paytirishni bajaring.", "Сначала умножьте на число."],
      ["Keyin mos koordinatalarni qo'shing/ayiring.", "Затем сложите/вычтите координаты."],
      ["Kerak bo'lsa uzunlikni toping.", "При необходимости найдите длину."],
    ],
    m: [
      { s: ["a(2; 3), b(−1; 4). a + b ni toping.", "a(2; 3), b(−1; 4). Найдите a + b."],
        y: ["(2 + (−1) ; 3 + 4)"], j: "(1; 7)" },
      { s: ["Xuddi shularda 2a − b.", "Для тех же найдите 2a − b."],
        y: ["2a = (4; 6)", "2a − b = (4 − (−1) ; 6 − 4)"], j: "(5; 2)" },
      { s: ["|a + b| ni toping.", "Найдите |a + b|."],
        y: ["a + b = (1; 7)", "√(1 + 49) = √50"], j: "5√2" },
    ],
    x: [
      ["Ayirishda ikkinchi vektor ishorasini almashtirmaslik.", "Не менять знаки координат вычитаемого вектора."],
      ["|a + b| = |a| + |b| deb yozish.", "Писать |a + b| = |a| + |b|."],
    ],
  },

  "Skalyar ko'paytma": {
    t: [
      { h: ["Skalyar ko'paytma", "Скалярное произведение"],
        p: ["Ikki vektorning skalyar ko'paytmasi — SON: koordinatalarda x₁x₂ + y₁y₂, geometrik |a||b|cos φ. Vektorlar perpendikulyar ⇔ skalyar ko'paytma nol. cos φ = a·b / (|a||b|) orqali burchak topiladi. Uzunlik: |a|² = a · a.",
          "Скалярное произведение двух векторов — ЧИСЛО: в координатах x₁x₂ + y₁y₂, геометрически |a||b|cos φ. Векторы перпендикулярны ⇔ произведение равно нулю. Угол: cos φ = a·b / (|a||b|). Длина: |a|² = a · a."] },
    ],
    f: [
      { n: ["Koordinatalarda", "В координатах"], f: "a · b = x₁x₂ + y₁y₂" },
      { n: ["Geometrik", "Геометрически"], f: "a · b = |a| · |b| · cos φ" },
      { n: ["Perpendikulyar", "Перпендикулярность"], f: "a ⊥ b  ⇔  a · b = 0" },
      { n: ["Ayirma uzunligi", "Длина разности"], f: "|a − b|² = |a|² − 2 a·b + |b|²" },
    ],
    s: [
      ["Koordinatalar bo'lsa — mos koordinatalarni ko'paytirib qo'shing.", "Даны координаты — перемножьте и сложите."],
      ["Uzunlik va burchak bo'lsa — |a||b|cos φ.", "Даны длины и угол — |a||b|cos φ."],
      ["Perpendikulyarlik: ko'paytmani 0 ga tenglang.", "Перпендикулярность: приравняйте произведение нулю."],
    ],
    m: [
      { s: ["a(2; 3), b(4; −1). a · b?", "a(2; 3), b(4; −1). a · b?"],
        y: ["2 · 4 + 3 · (−1) = 8 − 3"], j: "5" },
      { s: ["a(2; 3) va b(k; 4) perpendikulyar bo'ladigan k?", "При каком k векторы a(2; 3) и b(k; 4) перпендикулярны?"],
        y: ["2k + 12 = 0"], j: "k = −6" },
      { s: ["|a| = 5, |b| = 4, orasidagi burchak 60°. |5a − b|?", "|a| = 5, |b| = 4, угол между ними 60°. Найдите |5a − b|."],
        y: ["a · b = 5 · 4 · cos 60° = 10", "|5a − b|² = 25 · 25 + 16 − 10 · 10 = 625 + 16 − 100 = 541"], j: "√541" },
    ],
    x: [
      ["Skalyar ko'paytmani vektor deb yozish: natija son.", "Считать результат вектором: это число."],
      ["cos φ ni sin φ bilan almashtirish.", "Подставить sin φ вместо cos φ."],
    ],
  },

  "To'rtburchak va uchburchak yuzi": {
    t: [
      { h: ["Yuz formulalari", "Формулы площади"],
        p: ["To'g'ri to'rtburchak: S = ab. Parallelogramm: asos · unga tushirilgan balandlik. Uchburchak: asos · balandlik / 2 (parallelogrammning yarmi). Balandlik asosga perpendikulyar, yon tomon emas.",
          "Прямоугольник: S = ab. Параллелограмм: основание · высота к нему. Треугольник: основание · высота / 2 (половина параллелограмма). Высота перпендикулярна основанию, а не боковая сторона."] },
    ],
    f: [
      { n: ["To'g'ri to'rtburchak", "Прямоугольник"], f: "S = a · b" },
      { n: ["Parallelogramm", "Параллелограмм"], f: "S = a · h" },
      { n: ["Uchburchak", "Треугольник"], f: "S = a · h / 2" },
      { n: ["Sinus bilan", "Через синус"], f: "S = ½ · a · b · sin C" },
    ],
    s: [
      ["Shakl turi va uning asosi hamda mos balandligini aniqlang.", "Определите фигуру, её основание и соответствующую высоту."],
      ["Formulaga qo'ying.", "Подставьте в формулу."],
      ["Javobni cm² da yozing.", "Ответ запишите в см²."],
    ],
    m: [
      { s: ["Parallelogramm asosi 10, balandligi 15. Yuzi?", "Основание параллелограмма 10, высота 15. Площадь?"],
        y: ["10 · 15"], j: "150" },
      { s: ["Uchburchak asosi 8, balandligi 5. Yuzi?", "Основание треугольника 8, высота 5. Площадь?"],
        y: ["8 · 5 / 2"], j: "20" },
      { s: ["Ikki tomon 6 va 10, orasidagi burchak 30°. Uchburchak yuzi?", "Две стороны 6 и 10, угол между ними 30°. Площадь треугольника?"],
        y: ["S = ½ · 6 · 10 · sin 30° = 30 · ½"], j: "15" },
    ],
    x: [
      ["Uchburchak yuzini 2 ga bo'lishni unutish.", "Забыть делить на 2 у треугольника."],
      ["Yon tomonni balandlik deb olish.", "Брать боковую сторону вместо высоты."],
    ],
  },

  "Romb va trapetsiya yuzi": {
    t: [
      { h: ["Formulalar", "Формулы"],
        p: ["Romb yuzi diagonallar ko'paytmasining yarmi (yoki tomon · balandlik). Trapetsiya yuzi asoslar yarim yig'indisi (o'rta chiziq) · balandlik. Har ikkalasi ham parallelogramm/uchburchakka ajratish orqali chiqadi.",
          "Площадь ромба — половина произведения диагоналей (или сторона · высота). Площадь трапеции — полусумма оснований (средняя линия) · высота. Обе выводятся разбиением на параллелограмм/треугольники."] },
    ],
    f: [
      { n: ["Romb", "Ромб"], f: "S = d₁ · d₂ / 2 = a · h" },
      { n: ["Trapetsiya", "Трапеция"], f: "S = (a + b)/2 · h = m · h" },
    ],
    s: [
      ["Romb: diagonallar berilgan bo'lsa d₁d₂/2; balandlik bo'lsa a·h.", "Ромб: даны диагонали — d₁d₂/2; высота — a·h."],
      ["Trapetsiya: asoslar yig'indisining yarmini balandlikka ko'paytiring.", "Трапеция: полусумму оснований умножьте на высоту."],
    ],
    m: [
      { s: ["Romb diagonallari 10 va 24. Yuzi?", "Диагонали ромба 10 и 24. Площадь?"],
        y: ["10 · 24 / 2"], j: "120" },
      { s: ["Trapetsiya asoslari 6 va 10, balandligi 5. Yuzi?", "Основания трапеции 6 и 10, высота 5. Площадь?"],
        y: ["(6 + 10)/2 · 5 = 8 · 5"], j: "40" },
      { s: ["Romb tomoni 13, diagonallaridan biri 24. Yuzi?", "Сторона ромба 13, одна диагональ 24. Площадь?"],
        y: ["Yarim diagonal 12: ikkinchi yarmi √(13² − 12²) = 5, butun 10", "S = 24 · 10 / 2"], j: "120" },
    ],
    x: [
      ["Trapetsiya yuzini asoslar yig'indisi · balandlik deb (2 ga bo'lmay) hisoblash.", "Не делить на 2 в формуле трапеции."],
      ["Romb yuzida diagonallar ko'paytmasini 2 ga bo'lmaslik.", "Не делить на 2 произведение диагоналей."],
    ],
  },

  "Yuzga doir masalalar": {
    t: [
      { h: ["Yuz xossalari", "Свойства площади"],
        p: ["Teng shakllar yuzlari teng. Butunning yuzi qismlar yuzlarining yig'indisi. Uchburchak medianasi uni yuzlari teng ikki qismga bo'ladi. Balandligi umumiy uchburchaklarning yuzlari asoslar nisbatiga teng. Kvadrat yuzi = diagonal² / 2.",
          "Равные фигуры имеют равные площади. Площадь целого — сумма площадей частей. Медиана делит треугольник на два равновеликих. Площади треугольников с общей высотой относятся как основания. Площадь квадрата = диагональ² / 2."] },
    ],
    f: [
      { n: ["Kvadrat", "Квадрат"], f: "S = a² = d² / 2" },
      { n: ["Mediana", "Медиана"], f: "S(ABD) = S(ACD) = S(ABC) / 2" },
      { n: ["Umumiy balandlik", "Общая высота"], f: "S₁ : S₂ = a₁ : a₂" },
    ],
    s: [
      ["Shaklni ma'lum yuzli bo'laklarga ajrating.", "Разбейте фигуру на части с известной площадью."],
      ["Bir xil balandlikli uchburchaklar uchun asoslar nisbatini ishlating.", "Для треугольников с общей высотой используйте отношение оснований."],
      ["Yig'indi yoki ayirma bilan javobni toping.", "Найдите ответ сложением или вычитанием."],
    ],
    m: [
      { s: ["ABC yuzi 60, D — BC o'rtasi. ABD yuzi?", "S(ABC) = 60, D — середина BC. S(ABD)?"],
        y: ["Mediana teng yuzli ikki qism beradi: 60 / 2"], j: "30" },
      { s: ["Kvadrat diagonali 8. Yuzi?", "Диагональ квадрата 8. Площадь?"],
        y: ["S = d² / 2 = 64 / 2"], j: "32" },
      { s: ["ABC uchburchakda D nuqta AB da yotadi, AD : DB = 2 : 3. ACD yuzi ABC yuzining qanday qismi?", "В треугольнике ABC точка D лежит на AB, AD : DB = 2 : 3. Какую часть площади ABC составляет ACD?"],
        y: ["ACD va ABC uchburchaklar C dan tushirilgan balandlikni umumiy oladi", "Yuzlar asoslarga proporsional: AD : AB = 2 : (2 + 3)"], j: "2/5" },
    ],
    x: [
      ["Yuzlar nisbatini tomonlar nisbati kvadrati bilan aralashtirish (bu o'xshash shakllarda).", "Путать отношение площадей с квадратом отношения сторон (это для подобных)."],
    ],
  },

  "Ichki chizilgan burchak": {
    t: [
      { h: ["Ichki chizilgan burchak", "Вписанный угол"],
        p: ["Uchi aylanada, tomonlari uni kesuvchi burchak — ichki chizilgan. U tiralgan yoyning YARMIGA teng. Bir yoyga tiralgan ichki burchaklar teng; markaziy burchak o'sha yoyga tiralgan ichki burchakdan ikki marta katta.",
          "Вписанный угол — вершина на окружности, стороны её пересекают. Он равен ПОЛОВИНЕ дуги, на которую опирается. Вписанные углы на одну дугу равны; центральный угол вдвое больше вписанного, опирающегося на ту же дугу."] },
    ],
    f: [
      { n: ["Ichki chizilgan", "Вписанный"], f: "∠ABC = ½ · ⌣AC" },
      { n: ["Markaziy", "Центральный"], f: "∠AOC = ⌣AC = 2 · ∠ABC" },
    ],
    s: [
      ["Burchak qaysi yoyga tiralganini aniqlang.", "Определите, на какую дугу опирается угол."],
      ["Ichki burchak = yoyning yarmi; markaziy = yoy.", "Вписанный = половина дуги; центральный = дуга."],
    ],
    m: [
      { s: ["Markaziy burchak 100°. Shu yoyga tiralgan ichki burchak?", "Центральный угол 100°. Вписанный угол на ту же дугу?"],
        y: ["100° / 2"], j: "50°" },
      { s: ["Yoy 70° li. Unga tiralgan ichki burchak?", "Дуга 70°. Вписанный угол на неё?"],
        y: ["70° / 2"], j: "35°" },
      { s: ["Ichki burchak 25°. Yoy?", "Вписанный угол 25°. Дуга?"],
        y: ["25° · 2"], j: "50°" },
    ],
    x: [
      ["Ichki burchakni yoyga teng deb olish (yarmi).", "Считать вписанный угол равным дуге (он — половина)."],
      ["Markaziy va ichki burchaklarni almashtirish.", "Путать центральный и вписанный углы."],
    ],
  },

  "Diametrga tiralgan burchak": {
    t: [
      { h: ["To'g'ri burchak", "Прямой угол"],
        p: ["Diametrga tiralgan ichki burchak doim 90° (yoy 180°, uning yarmi). Aksincha: to'g'ri burchakli uchburchakni o'rab chizilgan aylananing diametri — gipotenuza. Bu ikki xossa ko'plab masalada Pifagor va aylanani bog'laydi.",
          "Вписанный угол, опирающийся на диаметр, всегда прямой (дуга 180°, половина — 90°). Обратно: гипотенуза прямоугольного треугольника — диаметр описанной окружности. Эти свойства связывают Пифагора и окружность."] },
    ],
    f: [
      { n: ["Diametrga tiralgan", "Опирающийся на диаметр"], f: "AB — diametr  ⇒  ∠ACB = 90°" },
      { n: ["Tashqi aylana radiusi", "Радиус описанной"], f: "R = c / 2  (c — gipotenuza)" },
    ],
    s: [
      ["Diametr va uning uchlarini toping.", "Найдите диаметр и его концы."],
      ["Aylanadagi uchinchi nuqtadan hosil burchak 90°.", "Угол при третьей точке окружности — 90°."],
      ["Pifagor bilan tomonlarni toping.", "Найдите стороны по Пифагору."],
    ],
    m: [
      { s: ["AB — diametr, C aylanada, ∠A = 35°. ∠B?", "AB — диаметр, C на окружности, ∠A = 35°. ∠B?"],
        y: ["∠C = 90°", "∠B = 90° − 35°"], j: "55°" },
      { s: ["AB = 10 diametr, AC = 6. BC?", "AB = 10 — диаметр, AC = 6. BC?"],
        y: ["∠C = 90°:  BC² = 10² − 6² = 64"], j: "8" },
      { s: ["Katetlari 6 va 8 uchburchakka tashqi chizilgan aylana radiusi?", "Радиус описанной окружности прямоугольного треугольника с катетами 6 и 8?"],
        y: ["c = 10", "R = c / 2"], j: "5" },
    ],
    x: [
      ["Diametrga tiralmagan burchakni 90° deb hisoblash.", "Считать 90° угол, не опирающийся на диаметр."],
    ],
  },
};
