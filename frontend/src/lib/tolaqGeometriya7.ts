/**
 * TO'LIQ DARSLAR — 7-sinf geometriya. Tuzilishi `tolaqGeometriya.ts` dagidek.
 * Misollardagi hamma son qo'lda tekshirilgan.
 */
import type { Tolaq } from "./nazariya";

export const TOLAQ_GEOMETRIYA7: Record<string, Tolaq> = {
  "Kesma va uning uzunligi": {
    t: [
      { h: ["Kesma", "Отрезок"],
        p: ["Kesma — to'g'ri chiziqning ikki nuqta (uchlari) orasidagi qismi. Uning uzunligi — shu ikki nuqta orasidagi masofa. Agar C nuqta AB kesmada yotsa, AB = AC + CB. Kesma o'rtasi uni ikkita teng qismga bo'ladi.",
          "Отрезок — часть прямой между двумя точками (концами). Его длина — расстояние между ними. Если точка C лежит на отрезке AB, то AB = AC + CB. Середина делит отрезок на две равные части."] },
    ],
    f: [
      { n: ["Kesma qismlari", "Части отрезка"], f: "AB = AC + CB" },
      { n: ["O'rtasi", "Середина"], f: "M — AB o'rtasi  ⇒  AM = MB = AB / 2" },
    ],
    s: [
      ["Chizma chizing va nuqtalarni tartib bilan joylashtiring.", "Сделайте чертёж, расставьте точки по порядку."],
      ["Butun kesma = uning qismlari yig'indisi.", "Целый отрезок = сумма частей."],
      ["Noma'lumni x bilan belgilab tenglama tuzing.", "Обозначьте неизвестное за x и составьте уравнение."],
    ],
    m: [
      { s: ["C nuqta AB kesmada yotadi, AC = 7 cm, CB = 5 cm. AB ni toping.", "Точка C на отрезке AB, AC = 7 см, CB = 5 см. Найдите AB."],
        y: ["AB = AC + CB = 7 + 5"], j: "12 cm" },
      { s: ["AB = 20 cm, M — o'rtasi. AM ni toping.", "AB = 20 см, M — середина. Найдите AM."],
        y: ["AM = AB / 2 = 20 / 2"], j: "10 cm" },
      { s: ["AB = 15 cm, C nuqta AB da, AC CB dan 3 cm ga katta. AC ni toping.", "AB = 15 см, C на AB, AC на 3 см больше CB. Найдите AC."],
        y: ["CB = x, AC = x + 3;  x + x + 3 = 15  →  x = 6", "AC = 6 + 3"], j: "9 cm" },
    ],
    x: [
      ["Nuqta kesmada yotmasa AB = AC + CB o'rinli emas.", "Применять AB = AC + CB, когда C не лежит на AB."],
      ["Kesma va to'g'ri chiziqni aralashtirish: kesma chegaralangan.", "Путать отрезок и прямую: отрезок ограничен."],
    ],
  },

  "Aylana va doira": {
    t: [
      { h: ["Aylana va doira", "Окружность и круг"],
        p: ["Aylana — markazdan bir xil uzoqlikdagi nuqtalar to'plami; doira — aylana va uning ichki qismi. Radius — markazdan aylanadagi nuqtagacha, diametr — markaz orqali o'tuvchi vatar: d = 2r. Vatar — aylananing ikki nuqtasini tutashtiruvchi kesma; diametr eng uzun vatar.",
          "Окружность — множество точек, равноудалённых от центра; круг — окружность вместе с внутренней частью. Радиус — от центра до точки окружности, диаметр — хорда через центр: d = 2r. Хорда — отрезок между двумя точками окружности; диаметр — самая длинная хорда."] },
    ],
    f: [
      { n: ["Diametr", "Диаметр"], f: "d = 2r" },
      { n: ["Aylana uzunligi", "Длина окружности"], f: "C = 2πr" },
    ],
    s: [
      ["Berilgan o'lchov radius yoki diametr ekanini aniqlang.", "Определите, дан радиус или диаметр."],
      ["Kerak bo'lsa d = 2r orqali almashtiring.", "При необходимости перейдите через d = 2r."],
    ],
    m: [
      { s: ["Diametri 14 cm bo'lgan aylananing radiusi qancha?", "Чему равен радиус окружности с диаметром 14 см?"],
        y: ["r = d / 2 = 14 / 2"], j: "7 cm" },
      { s: ["Aylanada eng uzun vatar 18 cm. Radiusni toping.", "Наибольшая хорда окружности 18 см. Найдите радиус."],
        y: ["Eng uzun vatar — diametr: d = 18", "r = 9"], j: "9 cm" },
    ],
    x: [
      ["Radiusni diametr o'rniga ishlatish.", "Использовать радиус вместо диаметра."],
      ["Aylana va doirani aralashtirish: aylana — chiziq, doira — yuza.", "Путать окружность (линия) и круг (площадь)."],
    ],
  },

  "Kesmalarni taqqoslash": {
    t: [
      { h: ["Taqqoslash", "Сравнение"],
        p: ["Ikki kesmani taqqoslash — ularni bir uchini mos qo'yib, ikkinchi uchi qayerga tushishini ko'rish yoki uzunliklarini bir xil birlikda solishtirish. Uzunliklar teng bo'lsa kesmalar teng. Uzunlikni o'lchagandan keyin birliklarni (mm, cm, dm, m) bir xilga keltirish shart.",
          "Сравнить два отрезка — наложить их так, чтобы концы совпали, или сравнить длины в одних единицах. Равные длины — равные отрезки. Перед сравнением приведите длины к одной единице (мм, см, дм, м)."] },
    ],
    f: [
      { n: ["Birliklar", "Единицы"], f: "1 m = 10 dm = 100 cm = 1000 mm" },
    ],
    s: [
      ["Uzunliklarni bir birlikka keltiring.", "Приведите длины к одной единице."],
      ["Sonlarni solishtiring: kattasi — uzunroq kesma.", "Сравните числа: большее — более длинный отрезок."],
    ],
    m: [
      { s: ["AB = 3 dm 5 cm va CD = 32 cm. Qaysi kesma uzunroq?", "AB = 3 дм 5 см и CD = 32 см. Какой отрезок длиннее?"],
        y: ["AB = 35 cm;  CD = 32 cm", "35 > 32"], j: "AB" },
      { s: ["Ikki kesma yig'indisi 1 m, biri 40 cm. Ikkinchisi necha cm?", "Сумма двух отрезков 1 м, один 40 см. Сколько см второй?"],
        y: ["1 m = 100 cm", "100 − 40"], j: "60 cm" },
    ],
    x: [
      ["Birliklarni aralashtirib, sonlarni to'g'ridan-to'g'ri taqqoslash.", "Сравнивать числа в разных единицах."],
    ],
  },

  "Burchak turlari": {
    t: [
      { h: ["Burchak va uning turlari", "Угол и его виды"],
        p: ["Burchak — bir nuqtadan chiquvchi ikki nur. Gradus bilan o'lchanadi. O'tkir burchak — 0° dan 90° gacha; to'g'ri — 90°; o'tmas — 90° dan 180° gacha; yoyiq — 180°; to'liq burchak — 360°. Transportir bilan o'lchaganda nolni nurga mos qo'ying.",
          "Угол — два луча из одной точки. Измеряется в градусах. Острый угол — от 0° до 90°; прямой — 90°; тупой — от 90° до 180°; развёрнутый — 180°; полный — 360°. При измерении транспортиром совместите ноль с лучом."] },
    ],
    f: [
      { n: ["O'tkir", "Острый"], f: "0° < α < 90°" },
      { n: ["To'g'ri", "Прямой"], f: "α = 90°" },
      { n: ["O'tmas", "Тупой"], f: "90° < α < 180°" },
      { n: ["Yoyiq", "Развёрнутый"], f: "α = 180°" },
    ],
    s: [
      ["Burchakning gradus o'lchovini aniqlang.", "Определите градусную меру угла."],
      ["90° va 180° bilan solishtirib turini ayting.", "Сравните с 90° и 180°, назовите вид."],
    ],
    m: [
      { s: ["Burchaklar: 35°, 90°, 120°, 180°. Har birining turi?", "Углы: 35°, 90°, 120°, 180°. Назовите вид каждого."],
        y: ["35° < 90° — o'tkir", "90° — to'g'ri", "120° (90° dan katta, 180° dan kichik) — o'tmas", "180° — yoyiq"], j: "o'tkir, to'g'ri, o'tmas, yoyiq" },
      { s: ["Soat 3:00 da soat va minut millari orasidagi burchak?", "Какой угол между стрелками часов в 3:00?"],
        y: ["Bir soat = 30°;  3 soat = 90°"], j: "90° (to'g'ri)" },
    ],
    x: [
      ["O'tmas burchakni o'tkir deb atash: 90° chegara.", "Называть тупой угол острым: граница — 90°."],
      ["Transportirning boshqa shkalasini o'qish (ikki shkala bor).", "Читать не ту шкалу транспортира."],
    ],
  },

  "Bissektrisa": {
    t: [
      { h: ["Bissektrisa", "Биссектриса"],
        p: ["Burchak bissektrisasi — uchidan chiqib, burchakni ikkita TENG burchakka bo'luvchi nur. Bissektrisadagi har bir nuqta burchak tomonlaridan bir xil uzoqlikda. Shuning uchun burchak α bo'lsa, bissektrisa hosil qilgan har bir burchak α/2 ga teng.",
          "Биссектриса угла — луч из вершины, делящий угол на два РАВНЫХ угла. Каждая её точка одинаково удалена от сторон угла. Если угол α, то каждый из образованных углов равен α/2."] },
    ],
    f: [
      { n: ["Bissektrisa", "Биссектриса"], f: "∠AOC = ∠COB = ∠AOB / 2" },
    ],
    s: [
      ["Burchak kattaligini aniqlang.", "Найдите величину угла."],
      ["Ikkiga bo'ling — har bir hosil burchak shunga teng.", "Разделите на два — таковы образованные углы."],
      ["Teskari masalada: bo'lak ma'lum bo'lsa, butun burchak = bo'lak · 2.", "В обратной задаче: целый угол = часть · 2."],
    ],
    m: [
      { s: ["∠AOB = 80°, OC — bissektrisa. ∠AOC ni toping.", "∠AOB = 80°, OC — биссектриса. Найдите ∠AOC."],
        y: ["∠AOC = 80° / 2"], j: "40°" },
      { s: ["Bissektrisa burchakni 35° li ikki qismga bo'ldi. Burchak necha gradus?", "Биссектриса разделила угол на два по 35°. Чему равен угол?"],
        y: ["35° · 2"], j: "70°" },
    ],
    x: [
      ["Bissektrisa bilan medianani aralashtirish: bissektrisa burchakni, mediana kesmani teng bo'ladi.", "Путать биссектрису и медиану: биссектриса делит угол, медиана — сторону."],
    ],
  },

  "Qo'shni burchaklar": {
    t: [
      { h: ["Qo'shni burchaklar", "Смежные углы"],
        p: ["Bir tomoni umumiy, qolgan ikki tomoni bitta to'g'ri chiziqni tashkil etuvchi burchaklar qo'shni deyiladi. Ularning yig'indisi doim 180°. Shuning uchun bittasini bilsangiz, ikkinchisini topasiz.",
          "Смежные углы имеют общую сторону, а две другие стороны образуют прямую. Их сумма всегда 180°. Зная один, находим другой."] },
    ],
    f: [
      { n: ["Yig'indi", "Сумма"], f: "α + β = 180°" },
    ],
    s: [
      ["Ikkala burchak bir to'g'ri chiziq ustida ekanini tekshiring.", "Убедитесь, что стороны лежат на одной прямой."],
      ["β = 180° − α.", "β = 180° − α."],
      ["Farq yoki nisbat berilsa — tenglama tuzing.", "Если дана разность или отношение — составьте уравнение."],
    ],
    m: [
      { s: ["Qo'shni burchaklardan biri 65°. Ikkinchisini toping.", "Один из смежных углов 65°. Найдите другой."],
        y: ["180° − 65°"], j: "115°" },
      { s: ["Qo'shni burchaklar ayirmasi 20°. Kichigini toping.", "Разность смежных углов 20°. Найдите меньший."],
        y: ["x + (x + 20°) = 180°  →  2x = 160°"], j: "80°" },
      { s: ["Qo'shni burchaklar 2 : 7 nisbatda. Kattasini toping.", "Смежные углы относятся как 2 : 7. Найдите больший."],
        y: ["2k + 7k = 180°  →  k = 20°", "7 · 20°"], j: "140°" },
    ],
    x: [
      ["Yig'indini 90° deb olish: qo'shni burchaklar — 180°.", "Считать сумму 90°: смежные углы дают 180°."],
    ],
  },

  "Vertikal burchaklar": {
    t: [
      { h: ["Vertikal burchaklar", "Вертикальные углы"],
        p: ["Ikki to'g'ri chiziq kesishganda hosil bo'lgan qarama-qarshi (umumiy tomoni yo'q) burchaklar vertikal deyiladi. Vertikal burchaklar TENG. Kesishishda 4 ta burchak: ikkita teng juft va ular bir-biriga qo'shni (yig'indisi 180°).",
          "Углы, образованные при пересечении двух прямых и не имеющие общей стороны, — вертикальные. Вертикальные углы РАВНЫ. При пересечении 4 угла: две равные пары, соседние из них смежные (сумма 180°)."] },
    ],
    f: [
      { n: ["Vertikal", "Вертикальные"], f: "∠1 = ∠3,   ∠2 = ∠4" },
      { n: ["Qo'shni", "Смежные"], f: "∠1 + ∠2 = 180°" },
    ],
    s: [
      ["Bitta burchak ma'lum bo'lsa, vertikali unga teng.", "Вертикальный угол равен данному."],
      ["Qo'shni burchaklar 180° ga to'ldiradi.", "Смежные дополняют до 180°."],
    ],
    m: [
      { s: ["Ikki to'g'ri chiziq kesishganda bir burchak 50°. Qolgan uchtasini toping.", "При пересечении двух прямых один угол 50°. Найдите остальные три."],
        y: ["Vertikali: 50°", "Qo'shnilari: 180° − 50° = 130° (ikkitasi)"], j: "50°, 130°, 130°" },
      { s: ["Vertikal burchaklar yig'indisi 140°. Ularning qo'shnisi necha gradus?", "Сумма вертикальных углов 140°. Чему равен смежный с ними угол?"],
        y: ["Har biri 140° / 2 = 70°", "180° − 70°"], j: "110°" },
    ],
    x: [
      ["Qo'shni burchakni vertikal deb olish.", "Считать смежный угол вертикальным."],
    ],
  },

  "Uchburchak turlari": {
    t: [
      { h: ["Tomonlariga ko'ra", "По сторонам"],
        p: ["Turli tomonli — hamma tomon har xil; teng yonli — ikki tomon teng (yon tomonlar), uchinchisi asos; teng tomonli — uchala tomon teng.",
          "Разносторонний — все стороны разные; равнобедренный — две стороны равны (боковые), третья — основание; равносторонний — все три равны."] },
      { h: ["Burchaklariga ko'ra", "По углам"],
        p: ["O'tkir burchakli — hamma burchak 90° dan kichik; to'g'ri burchakli — bitta burchak 90°; o'tmas burchakli — bitta burchak 90° dan katta. Uchburchakda ko'pi bilan bitta to'g'ri yoki o'tmas burchak bo'ladi.",
          "Остроугольный — все углы меньше 90°; прямоугольный — один угол 90°; тупоугольный — один угол больше 90°. В треугольнике не больше одного прямого или тупого угла."] },
    ],
    f: [
      { n: ["Teng tomonli", "Равносторонний"], f: "a = b = c,   ∠A = ∠B = ∠C = 60°" },
      { n: ["Teng yonli", "Равнобедренный"], f: "AB = BC  ⇒  ∠A = ∠C" },
    ],
    s: [
      ["Tomonlarni solishtiring: nechta teng?", "Сравните стороны: сколько равных?"],
      ["Burchaklarni 90° bilan solishtiring.", "Сравните углы с 90°."],
      ["Ikkala belgi bo'yicha to'liq nom bering (masalan, teng yonli to'g'ri burchakli).", "Назовите по обоим признакам (например, равнобедренный прямоугольный)."],
    ],
    m: [
      { s: ["Tomonlari 5, 5, 8 cm. Uchburchak turini ayting.", "Стороны 5, 5, 8 см. Определите вид."],
        y: ["Ikki tomon teng (5 = 5)"], j: "Teng yonli (asosi 8 cm)" },
      { s: ["Burchaklari 40°, 50°, 90°. Turi?", "Углы 40°, 50°, 90°. Вид?"],
        y: ["Bitta burchak 90°"], j: "To'g'ri burchakli" },
      { s: ["Teng tomonli uchburchak perimetri 27 cm. Tomoni?", "Периметр равностороннего треугольника 27 см. Сторона?"],
        y: ["27 : 3"], j: "9 cm" },
    ],
    x: [
      ["Teng tomonli uchburchakni teng yonlidan farqlamaslik: teng tomonli ham teng yonli, ammo teskarisi emas.", "Считать любой равнобедренный равносторонним."],
    ],
  },

  "Ko'pburchak burchaklari": {
    t: [
      { h: ["Ichki burchaklar yig'indisi", "Сумма внутренних углов"],
        p: ["n burchakli qavariq ko'pburchakni bitta uchidan chiqqan diagonallar (n − 2) ta uchburchakka bo'ladi. Shuning uchun ichki burchaklar yig'indisi (n − 2) · 180°. Tashqi burchaklar yig'indisi n ga bog'liq emas: doim 360°.",
          "Выпуклый n-угольник диагоналями из одной вершины делится на (n − 2) треугольника. Поэтому сумма внутренних углов (n − 2) · 180°. Сумма внешних углов не зависит от n и всегда 360°."] },
    ],
    f: [
      { n: ["Ichki burchaklar yig'indisi", "Сумма внутренних"], f: "S = (n − 2) · 180°" },
      { n: ["Muntazam ko'pburchak burchagi", "Угол правильного n-угольника"], f: "α = (n − 2) · 180° / n" },
      { n: ["Tashqi burchaklar", "Внешние углы"], f: "360°" },
    ],
    s: [
      ["Tomonlar soni n ni aniqlang.", "Определите число сторон n."],
      ["(n − 2) · 180° ni hisoblang.", "Вычислите (n − 2) · 180°."],
      ["Muntazam bo'lsa n ga bo'ling.", "Для правильного разделите на n."],
    ],
    m: [
      { s: ["Beshburchakning ichki burchaklari yig'indisi?", "Сумма внутренних углов пятиугольника?"],
        y: ["(5 − 2) · 180° = 3 · 180°"], j: "540°" },
      { s: ["Muntazam oltiburchakning bir burchagi?", "Угол правильного шестиугольника?"],
        y: ["(6 − 2) · 180° / 6 = 720° / 6"], j: "120°" },
      { s: ["Necha burchakli ko'pburchakda ichki burchaklar yig'indisi 1080°?", "У какого многоугольника сумма внутренних углов 1080°?"],
        y: ["(n − 2) · 180° = 1080°  →  n − 2 = 6"], j: "n = 8" },
    ],
    x: [
      ["(n − 2) o'rniga n · 180° deb yozish.", "Писать n · 180° вместо (n − 2) · 180°."],
    ],
  },

  "Tenglik alomatlari": {
    t: [
      { h: ["Uchburchaklar tengligi", "Равенство треугольников"],
        p: ["Ikki uchburchak teng, agar biri ikkinchisiga ustma-ust tushsa. Buni uchta alomat bilan tekshiramiz. I: ikki tomon va ular orasidagi burchak teng. II: tomon va unga yopishgan ikki burchak teng. III: uchala tomon teng. Teng uchburchaklarda mos tomonlar va burchaklar teng.",
          "Два треугольника равны, если один можно наложить на другой. Проверяем тремя признаками. I: две стороны и угол между ними. II: сторона и два прилежащих угла. III: три стороны. У равных треугольников соответствующие стороны и углы равны."] },
    ],
    f: [
      { n: ["I alomat (TBT)", "I признак (СУС)"], f: "2 tomon + orasidagi burchak" },
      { n: ["II alomat (BTB)", "II признак (УСУ)"], f: "tomon + ikki yopishgan burchak" },
      { n: ["III alomat (TTT)", "III признак (ССС)"], f: "uchala tomon" },
    ],
    s: [
      ["Ikkala uchburchakda nimalar teng ekanini yozing (umumiy tomon bo'lishi mumkin).", "Выпишите, что равно (общая сторона тоже даёт равенство)."],
      ["Qaysi alomatga mos kelishini aniqlang; burchak ORASIDA bo'lishi shart.", "Определите признак; угол должен быть ЗАКЛЮЧЁН между сторонами."],
      ["Tenglikdan mos elementlar tengligini xulosa qiling.", "Из равенства выведите равенство соответствующих элементов."],
    ],
    m: [
      { s: ["AB = DE = 5, AC = DF = 7, ∠A = ∠D = 40°. ABC va DEF teng bo'ladimi?", "AB = DE = 5, AC = DF = 7, ∠A = ∠D = 40°. Равны ли ABC и DEF?"],
        y: ["Ikki tomon va ular orasidagi burchak teng"], j: "Ha (I alomat)" },
      { s: ["Uchburchaklarda 3 cm, 4 cm, 6 cm va 6 cm, 3 cm, 4 cm tomonlar. Tengmi?", "Стороны 3, 4, 6 см и 6, 3, 4 см. Равны ли треугольники?"],
        y: ["Tomonlar to'plami bir xil"], j: "Ha (III alomat)" },
    ],
    x: [
      ["Ikki tomon va ORASIDA bo'lmagan burchakka tayanish: bu alomat emas.", "Опираться на угол, не заключённый между сторонами: это не признак."],
      ["Uchta burchak teng bo'lsa uchburchaklar teng deb o'ylash: ular faqat o'xshash.", "Считать равными треугольники с равными углами: они лишь подобны."],
    ],
  },

  "Teng yonli uchburchak": {
    t: [
      { h: ["Xossalari", "Свойства"],
        p: ["Teng yonli uchburchakda asosidagi burchaklar teng. Asosga tushirilgan mediana, bissektrisa va balandlik ustma-ust tushadi. Aksincha, ikki burchak teng bo'lsa, uchburchak teng yonli. Teng tomonli uchburchakda hamma burchak 60°.",
          "В равнобедренном треугольнике углы при основании равны. Медиана, биссектриса и высота к основанию совпадают. Обратно: два равных угла — треугольник равнобедренный. У равностороннего все углы 60°."] },
    ],
    f: [
      { n: ["Asosidagi burchaklar", "Углы при основании"], f: "AB = BC  ⇒  ∠A = ∠C" },
      { n: ["Uchidagi burchak", "Угол при вершине"], f: "∠B = 180° − 2∠A" },
    ],
    s: [
      ["Asos va yon tomonlarni belgilang.", "Отметьте основание и боковые стороны."],
      ["Asosidagi burchaklar teng; uchidagini 180° dan ayirib toping.", "Углы при основании равны; угол при вершине — из 180°."],
      ["Asosga mediana — balandlik: to'g'ri burchakli uchburchaklarga ajrating.", "Медиана к основанию — высота: получите прямоугольные треугольники."],
    ],
    m: [
      { s: ["Teng yonli uchburchakda uchidagi burchak 40°. Asosidagi burchakni toping.", "У равнобедренного треугольника угол при вершине 40°. Найдите угол при основании."],
        y: ["(180° − 40°) / 2 = 140° / 2"], j: "70°" },
      { s: ["Asosidagi burchak 50°. Uchidagi burchak?", "Угол при основании 50°. Угол при вершине?"],
        y: ["180° − 2 · 50°"], j: "80°" },
      { s: ["Yon tomon 10, asos 12. Asosga tushirilgan balandlikni toping.", "Боковая сторона 10, основание 12. Найдите высоту к основанию."],
        y: ["Balandlik asosni teng bo'ladi: 6", "h² = 10² − 6² = 100 − 36 = 64"], j: "8" },
    ],
    x: [
      ["Uchidagi burchakni asosidagilardan biri deb olish.", "Считать угол при вершине углом при основании."],
    ],
  },

  "Kesuvchi hosil qilgan burchaklar": {
    t: [
      { h: ["Ikki to'g'ri chiziq va kesuvchi", "Две прямые и секущая"],
        p: ["Ikki to'g'ri chiziqni uchinchisi kesganda 8 ta burchak hosil bo'ladi: ichki almashinuvchi, mos, ichki bir tomonli. To'g'ri chiziqlar PARALLEL bo'lsa: almashinuvchi burchaklar teng, mos burchaklar teng, ichki bir tomonli burchaklar yig'indisi 180°.",
          "Секущая образует с двумя прямыми 8 углов: накрест лежащие, соответственные, односторонние. Если прямые ПАРАЛЛЕЛЬНЫ: накрест лежащие равны, соответственные равны, односторонние в сумме 180°."] },
    ],
    f: [
      { n: ["Almashinuvchi", "Накрест лежащие"], f: "a ∥ b  ⇒  ∠3 = ∠5" },
      { n: ["Mos", "Соответственные"], f: "a ∥ b  ⇒  ∠1 = ∠5" },
      { n: ["Ichki bir tomonli", "Односторонние"], f: "a ∥ b  ⇒  ∠4 + ∠5 = 180°" },
    ],
    s: [
      ["Parallellik berilganini aniqlang.", "Убедитесь, что прямые параллельны."],
      ["Burchaklar juftini turiga ko'ra tanlang: almashinuvchi, mos yoki bir tomonli.", "Определите тип пары: накрест, соответственные или односторонние."],
      ["Mos xossani qo'llab noma'lum burchakni toping.", "Примените свойство и найдите угол."],
    ],
    m: [
      { s: ["a ∥ b, kesuvchi hosil qilgan mos burchaklardan biri 70°. Ikkinchisi?", "a ∥ b, один из соответственных углов 70°. Чему равен другой?"],
        y: ["Mos burchaklar teng"], j: "70°" },
      { s: ["a ∥ b, ichki bir tomonli burchaklardan biri 115°. Ikkinchisi?", "a ∥ b, один из односторонних углов 115°. Найдите другой."],
        y: ["180° − 115°"], j: "65°" },
    ],
    x: [
      ["Chiziqlar parallel bo'lmasa xossalarni qo'llash.", "Применять свойства без параллельности."],
      ["Bir tomonli burchaklarni teng deb olish: ularning yig'indisi 180°.", "Считать односторонние равными: они дают 180°."],
    ],
  },

  "Parallellik alomatlari": {
    t: [
      { h: ["Parallellik alomatlari", "Признаки параллельности"],
        p: ["Ikki to'g'ri chiziqni kesuvchi kesganda: almashinuvchi burchaklar teng, YOKI mos burchaklar teng, YOKI ichki bir tomonli burchaklar yig'indisi 180° bo'lsa — chiziqlar parallel. Bu alomatlar teskari xossalarga o'xshash, lekin sabab-oqibat teskari: alomatdan parallellik xulosa qilinadi.",
          "Если при пересечении двух прямых секущей: накрест лежащие углы равны, ИЛИ соответственные равны, ИЛИ сумма односторонних 180°, — прямые параллельны. Это обращение свойств: из признака следует параллельность."] },
      { h: ["Parallel chiziqlar aksiomasi", "Аксиома параллельных"],
        p: ["Berilgan chiziqdan tashqaridagi nuqta orqali unga parallel faqat bitta to'g'ri chiziq o'tkazish mumkin. Ikki chiziq uchinchisiga parallel bo'lsa, ular o'zaro parallel.",
          "Через точку вне прямой можно провести единственную параллельную ей прямую. Две прямые, параллельные третьей, параллельны между собой."] },
    ],
    f: [
      { n: ["Almashinuvchi teng", "Накрест лежащие равны"], f: "∠3 = ∠5  ⇒  a ∥ b" },
      { n: ["Bir tomonli 180°", "Односторонние 180°"], f: "∠4 + ∠5 = 180°  ⇒  a ∥ b" },
    ],
    s: [
      ["Kesuvchini toping va burchaklar juftini aniqlang.", "Найдите секущую и определите пару углов."],
      ["Burchaklar tengligini yoki yig'indisini tekshiring.", "Проверьте равенство или сумму."],
      ["Mos alomat bajarilsa — chiziqlar parallel.", "Если признак выполнен — прямые параллельны."],
    ],
    m: [
      { s: ["Kesuvchi hosil qilgan ichki almashinuvchi burchaklar 60° va 60°. a va b parallelmi?", "Накрест лежащие углы 60° и 60°. Параллельны ли a и b?"],
        y: ["Almashinuvchi burchaklar teng"], j: "Ha" },
      { s: ["Ichki bir tomonli burchaklar 100° va 70°. Parallelmi?", "Односторонние углы 100° и 70°. Параллельны ли прямые?"],
        y: ["100° + 70° = 170° ≠ 180°"], j: "Yo'q" },
    ],
    x: [
      ["Bir tomonli burchaklar teng bo'lsa parallel deb o'ylash: yig'indi 180° bo'lishi kerak.", "Считать признаком равенство односторонних: нужна сумма 180°."],
    ],
  },

  "Ichki burchaklar yig'indisi": {
    t: [
      { h: ["Teorema", "Теорема"],
        p: ["Uchburchak ichki burchaklari yig'indisi 180°. Isboti: uchi orqali qarshi tomonga parallel chizilsa, hosil bo'lgan almashinuvchi burchaklar uchburchak burchaklariga teng bo'lib, yoyiq burchak (180°) hosil qiladi. To'g'ri burchakli uchburchakda ikki o'tkir burchak yig'indisi 90°.",
          "Сумма внутренних углов треугольника 180°. Доказательство: через вершину проводим прямую, параллельную противоположной стороне; накрест лежащие углы дают развёрнутый угол 180°. В прямоугольном треугольнике два острых угла в сумме 90°."] },
    ],
    f: [
      { n: ["Uchburchak", "Треугольник"], f: "∠A + ∠B + ∠C = 180°" },
      { n: ["To'g'ri burchakli", "Прямоугольный"], f: "∠A + ∠B = 90°" },
    ],
    s: [
      ["Ma'lum burchaklarni qo'shing.", "Сложите известные углы."],
      ["Uchinchisi = 180° − yig'indi.", "Третий = 180° − сумма."],
      ["Nisbat berilsa — k koeffitsiyent orqali tenglama.", "Если дано отношение — уравнение через коэффициент k."],
    ],
    m: [
      { s: ["∠A = 57°, ∠B = 61°. ∠C?", "∠A = 57°, ∠B = 61°. ∠C?"],
        y: ["180° − 57° − 61°"], j: "62°" },
      { s: ["Burchaklar 2 : 3 : 4 nisbatda. Eng kattasi?", "Углы относятся как 2 : 3 : 4. Найдите наибольший."],
        y: ["2k + 3k + 4k = 180°  →  k = 20°", "4 · 20°"], j: "80°" },
      { s: ["To'g'ri burchakli uchburchakda bir o'tkir burchak 35°. Ikkinchisi?", "В прямоугольном треугольнике один острый угол 35°. Другой?"],
        y: ["90° − 35°"], j: "55°" },
    ],
    x: [
      ["Uchburchak burchaklari yig'indisini 360° deb olish (bu to'rtburchak).", "Считать сумму углов треугольника 360° (это четырёхугольник)."],
    ],
  },

  "Tashqi burchak": {
    t: [
      { h: ["Tashqi burchak", "Внешний угол"],
        p: ["Uchburchak tomonini davom ettirganda hosil bo'lgan, ichki burchakka qo'shni burchak — tashqi burchak. U o'ziga qo'shni bo'lmagan ikki ichki burchak yig'indisiga teng. Va u yonidagi ichki burchakni 180° ga to'ldiradi.",
          "Угол, смежный с внутренним углом треугольника, образованный продолжением стороны, — внешний. Он равен сумме двух внутренних, не смежных с ним, и дополняет смежный внутренний до 180°."] },
    ],
    f: [
      { n: ["Tashqi burchak", "Внешний угол"], f: "∠tashqi = ∠A + ∠B" },
      { n: ["Qo'shni ichki bilan", "С внутренним"], f: "∠tashqi + ∠C = 180°" },
    ],
    s: [
      ["Tashqi burchakka qo'shni ichki burchakni belgilang.", "Определите смежный внутренний угол."],
      ["Qolgan ikki ichki burchak yig'indisi = tashqi burchak.", "Сумма двух других внутренних = внешний."],
    ],
    m: [
      { s: ["Uchburchakning ikki burchagi 50° va 60°. Uchinchi uchdagi tashqi burchak?", "Два угла треугольника 50° и 60°. Внешний угол при третьей вершине?"],
        y: ["50° + 60°"], j: "110°" },
      { s: ["Tashqi burchak 130°, unga qo'shni bo'lmagan burchaklardan biri 80°. Ikkinchisi?", "Внешний угол 130°, один из несмежных 80°. Другой?"],
        y: ["130° − 80°"], j: "50°" },
    ],
    x: [
      ["Tashqi burchakni yonidagi ichki burchak bilan almashtirish.", "Приравнивать внешний угол смежному внутреннему."],
    ],
  },

  "To'g'ri burchakli uchburchak": {
    t: [
      { h: ["Xossalari", "Свойства"],
        p: ["To'g'ri burchakli uchburchakda ikki o'tkir burchak yig'indisi 90°. To'g'ri burchak qarshisidagi tomon — gipotenuza (eng uzun). 30° burchak qarshisidagi katet gipotenuzaning yarmiga teng. Gipotenuzaga tushirilgan mediana gipotenuzaning yarmiga teng.",
          "В прямоугольном треугольнике сумма острых углов 90°. Сторона против прямого угла — гипотенуза (наибольшая). Катет против угла 30° равен половине гипотенузы. Медиана к гипотенузе равна её половине."] },
    ],
    f: [
      { n: ["O'tkir burchaklar", "Острые углы"], f: "∠A + ∠B = 90°" },
      { n: ["30° qarshisidagi katet", "Катет против 30°"], f: "a = c / 2" },
      { n: ["Mediana", "Медиана"], f: "m = c / 2" },
    ],
    s: [
      ["To'g'ri burchak va gipotenuzani toping.", "Найдите прямой угол и гипотенузу."],
      ["30° bor bo'lsa — yarim qoidasi. Aks holda Pifagor.", "Есть 30° — правило половины; иначе Пифагор."],
    ],
    m: [
      { s: ["To'g'ri burchakli uchburchakda gipotenuza 16, bir burchak 30°. 30° qarshisidagi katet?", "Гипотенуза 16, один угол 30°. Катет против 30°?"],
        y: ["16 / 2"], j: "8" },
      { s: ["Gipotenuzaga tushirilgan mediana 7 cm. Gipotenuza?", "Медиана к гипотенузе 7 см. Гипотенуза?"],
        y: ["c = 2 · 7"], j: "14 cm" },
      { s: ["Bir o'tkir burchak 25°. Ikkinchisi?", "Один острый угол 25°. Другой?"],
        y: ["90° − 25°"], j: "65°" },
    ],
    x: [
      ["Katet qarshisidagi 30° qoidasini gipotenuzaga tatbiq etish.", "Применять правило 30° не к тому катету."],
    ],
  },

  "Uchburchak tengsizligi": {
    t: [
      { h: ["Qoida", "Правило"],
        p: ["Uchburchakning har bir tomoni qolgan ikki tomon yig'indisidan KICHIK va ayirmasidan KATTA. Uch kesmadan uchburchak yasash mumkinmi — tekshirish uchun eng katta tomonni qolgan ikkitasining yig'indisi bilan solishtirish yetarli. Katta tomon qarshisida katta burchak yotadi.",
          "Каждая сторона треугольника МЕНЬШЕ суммы и БОЛЬШЕ разности двух других. Чтобы проверить, существует ли треугольник, достаточно сравнить наибольшую сторону с суммой двух других. Против большей стороны лежит больший угол."] },
    ],
    f: [
      { n: ["Tengsizlik", "Неравенство"], f: "|b − c| < a < b + c" },
      { n: ["Tekshirish", "Проверка"], f: "eng katta < qolgan ikkitasi yig'indisi" },
    ],
    s: [
      ["Uch tomonni o'sish tartibida yozing.", "Запишите три стороны по возрастанию."],
      ["Eng katta tomonni qolgan ikkitasining yig'indisi bilan solishtiring.", "Сравните наибольшую с суммой двух других."],
      ["Uchinchi tomon oralig'ini so'rasa: ayirma < x < yig'indi.", "Диапазон третьей стороны: разность < x < сумма."],
    ],
    m: [
      { s: ["3, 4, 8 cm kesmalardan uchburchak yasash mumkinmi?", "Можно ли построить треугольник из отрезков 3, 4, 8 см?"],
        y: ["Eng katta: 8;  3 + 4 = 7", "8 > 7"], j: "Yo'q" },
      { s: ["Ikki tomon 5 va 9. Uchinchi tomon qanday bo'lishi mumkin?", "Две стороны 5 и 9. Какой может быть третья?"],
        y: ["9 − 5 < x < 9 + 5"], j: "4 < x < 14" },
      { s: ["Teng yonli uchburchakning tomonlari 4 va 9. Perimetr?", "Равнобедренный треугольник со сторонами 4 и 9. Периметр?"],
        y: ["Yon tomon 4 bo'lsa: 4 + 4 = 8 < 9 — yo'q", "Yon tomon 9: 9 + 9 + 4"], j: "22" },
    ],
    x: [
      ["Teng yonli uchburchakda yon tomonni tekshirmasdan tanlash.", "Не проверить неравенство при выборе боковой стороны."],
      ["Tengsizlikni teng ishorasi bilan yozish: tomon yig'indiga TENG bo'lsa, uchburchak yo'q.", "Допускать равенство: если сторона равна сумме, треугольника нет."],
    ],
  },
};
