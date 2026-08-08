/**
 * 7–11-sinf savol matnlari — ikki tilda.
 *
 * `savol.ts` dan alohida turadi va sabab hajmda: u yerda 1–6-sinfning
 * 300 dan ortiq kaliti bor, bu yerga esa yana shuncha qo'shiladi. Bitta
 * faylda ikkalasi ham turgan bo'lsa, yangi dars qo'shmoqchi bo'lgan odam
 * ming qatorlik lug'atdan kerakli joyni qidirib o'tirardi.
 *
 * Kalitlar TIPLANGAN (`OliyKalit`), ya'ni generatorlarda yo'q kalit
 * yozilsa TypeScript darhol xato beradi — tarjimasi unutilgan savol
 * ishga tushmaydi.
 *
 * Ruscha matnlar bosh kelishikdagi qolipga solingan: matematik atamalar
 * (hosila, integral, progressiya) rus tilida ham xalqaro, shuning uchun
 * bu yerda `savol.ts` dagi kelishik muammosi deyarli yo'q.
 */
import { til } from "../til";

const O = {
  /* ================= 7-sinf algebra ================= */
  ifodaQiymati: ["Ifodaning qiymatini toping", "Найдите значение выражения"],
  soddalashtir: ["Ifodani soddalashtiring", "Упростите выражение"],
  qavsOching: ["Qavslarni oching", "Раскройте скобки"],
  formulaQiymat: ["Formula bo'yicha hisoblang", "Вычислите по формуле"],
  tenglamaYech: ["Tenglamani yeching", "Решите уравнение"],
  ildiziQaysi: ["Qaysi son tenglamaning ildizi?", "Какое число — корень уравнения?"],
  masalaTenglama: ["Masalani tenglama bilan yeching", "Решите задачу уравнением"],
  darajaHisobla: ["Darajani hisoblang", "Вычислите степень"],
  darajaXossa: ["Daraja xossasini qo'llang", "Примените свойство степени"],
  birhadStandart: ["Birhadni standart shaklga keltiring", "Приведите одночлен к стандартному виду"],
  birhadKopaytir: ["Birhadlarni ko'paytiring", "Умножьте одночлены"],
  oxshashHad: ["O'xshash hadlarni ixchamlang", "Приведите подобные слагаемые"],
  kophadQosh: ["Ko'phadlarni qo'shing", "Сложите многочлены"],
  kophadAyir: ["Ko'phadlarni ayiring", "Вычтите многочлены"],
  kophadKopaytir: ["Ko'paytiring", "Умножьте"],
  kophadBol: ["Bo'ling", "Разделите"],
  umumiyKopaytuvchi: ["Umumiy ko'paytuvchini qavsdan chiqaring", "Вынесите общий множитель за скобки"],
  guruhlash: ["Guruhlash usuli bilan ajrating", "Разложите способом группировки"],
  yigindiKvadrat: ["Formulani qo'llang", "Примените формулу"],
  kvadratlarAyirmasi: ["Kvadratlar ayirmasi formulasini qo'llang", "Примените формулу разности квадратов"],
  kopaytuvchiAjrat: ["Ko'paytuvchilarga ajrating", "Разложите на множители"],
  kasrQisqartir: ["Kasrni qisqartiring", "Сократите дробь"],
  kasrAmal: ["Amalni bajaring", "Выполните действие"],
  kombinatorikaQoida: ["Nechta usulda bo'ladi?", "Сколькими способами?"],
  orinAlmashtirish: ["Nechta o'rin almashtirish bor?", "Сколько перестановок?"],

  /* ================= 8-sinf algebra ================= */
  ildizHisobla: ["Ildizni hisoblang", "Вычислите корень"],
  ildizXossa: ["Ildiz xossasini qo'llang", "Примените свойство корня"],
  ratsionalDaraja: ["Ratsional ko'rsatkichli darajani hisoblang", "Вычислите степень с рациональным показателем"],
  tengsizlikYech: ["Tengsizlikni yeching", "Решите неравенство"],
  tengsizlikTogri: ["Qaysi tengsizlik to'g'ri?", "Какое неравенство верно?"],
  oraliqQaysi: ["Yechim qaysi oraliqda?", "В каком промежутке решение?"],
  modulHisobla: ["Modulni hisoblang", "Вычислите модуль"],
  modulTenglama: ["Modulli tenglamani yeching", "Решите уравнение с модулем"],
  yaxlitla: ["Sonni yaxlitlang", "Округлите число"],
  kvadratIldizlari: ["Kvadrat tenglamaning ildizlarini toping", "Найдите корни квадратного уравнения"],
  diskriminant: ["Diskriminantni toping", "Найдите дискриминант"],
  nechtaIldiz: ["Tenglamaning nechta ildizi bor?", "Сколько корней у уравнения?"],
  viyet: ["Viyet teoremasini qo'llang", "Примените теорему Виета"],
  uchhadAjrat: ["Kvadrat uchhadni ko'paytuvchilarga ajrating", "Разложите квадратный трёхчлен на множители"],
  bikvadrat: ["Bikvadrat tenglamani yeching", "Решите биквадратное уравнение"],
  ortaQiymat: ["O'rta arifmetik qiymatni toping", "Найдите среднее арифметическое"],
  moda: ["Modani toping", "Найдите моду"],
  mediana: ["Medianani toping", "Найдите медиану"],
  teskariProp: ["y = k/x funksiya qiymatini toping", "Найдите значение функции y = k/x"],

  /* ================= 9-sinf algebra ================= */
  parabolaUchi: ["Parabola uchining abssissasini toping", "Найдите абсциссу вершины параболы"],
  parabolaYonalish: ["Parabola tarmoqlari qayerga yo'nalgan?", "Куда направлены ветви параболы?"],
  funksiyaQiymat: ["Funksiya qiymatini toping", "Найдите значение функции"],
  funksiyaNoli: ["Funksiyaning nollarini toping", "Найдите нули функции"],
  aniqlanishSoha: ["Aniqlanish sohasini toping", "Найдите область определения"],
  juftToq: ["Funksiya juftmi yoki toqmi?", "Функция чётная или нечётная?"],
  kvadratTengsizlik: ["Kvadrat tengsizlikni yeching", "Решите квадратное неравенство"],
  sistemaYech: ["Sistemani yeching", "Решите систему"],
  radian: ["Gradusni radianga o'giring", "Переведите градусы в радианы"],
  gradus: ["Radianni gradusga o'giring", "Переведите радианы в градусы"],
  trigQiymat: ["Qiymatni toping", "Найдите значение"],
  trigIshora: ["Ishorasi qanday?", "Какой знак?"],
  trigAyniyat: ["Ayniyatni qo'llang", "Примените тождество"],
  keltirish: ["Keltirish formulasini qo'llang", "Примените формулу приведения"],
  qoshishFormula: ["Qo'shish formulasini qo'llang", "Примените формулу сложения"],
  ikkilangan: ["Ikkilangan burchak formulasini qo'llang", "Примените формулу двойного угла"],
  ketmaKetlikHad: ["Ketma-ketlikning hadini toping", "Найдите член последовательности"],
  arifProgHad: ["Arifmetik progressiyaning hadini toping", "Найдите член арифметической прогрессии"],
  arifProgYigindi: ["Arifmetik progressiya yig'indisini toping", "Найдите сумму арифметической прогрессии"],
  geoProgHad: ["Geometrik progressiyaning hadini toping", "Найдите член геометрической прогрессии"],
  geoProgYigindi: ["Geometrik progressiya yig'indisini toping", "Найдите сумму геометрической прогрессии"],
  cheksizYigindi: ["Cheksiz kamayuvchi progressiya yig'indisini toping", "Найдите сумму бесконечно убывающей прогрессии"],
  ehtimollik: ["Hodisaning ehtimolligini toping", "Найдите вероятность события"],

  /* ================= 10-sinf algebra va analiz ================= */
  funksiyaTuri: ["Bu qanday funksiya?", "Что это за функция?"],
  murakkabFunksiya: ["Murakkab funksiya qiymatini toping", "Найдите значение сложной функции"],
  teskariFunksiya: ["Teskari funksiyani toping", "Найдите обратную функцию"],
  davr: ["Funksiyaning davrini toping", "Найдите период функции"],
  ratsionalTenglama: ["Ratsional tenglamani yeching", "Решите рациональное уравнение"],
  irratsionalTenglama: ["Irratsional tenglamani yeching", "Решите иррациональное уравнение"],
  korsatkichliTenglama: ["Ko'rsatkichli tenglamani yeching", "Решите показательное уравнение"],
  logarifmHisobla: ["Logarifmni hisoblang", "Вычислите логарифм"],
  logarifmXossa: ["Logarifm xossasini qo'llang", "Примените свойство логарифма"],
  logarifmikTenglama: ["Logarifmik tenglamani yeching", "Решите логарифмическое уравнение"],
  korsatkichliTengsizlik: ["Ko'rsatkichli tengsizlikni yeching", "Решите показательное неравенство"],
  trigTenglama: ["Trigonometrik tenglamani yeching", "Решите тригонометрическое уравнение"],
  murakkabFoiz: ["Murakkab foiz formulasi bo'yicha hisoblang", "Вычислите по формуле сложных процентов"],
  hodisaEhtimoli: ["Ehtimollikni toping", "Найдите вероятность"],

  /* ================= 11-sinf ================= */
  limit: ["Limitni hisoblang", "Вычислите предел"],
  hosila: ["Hosilani toping", "Найдите производную"],
  hosilaNuqtada: ["Nuqtadagi hosila qiymatini toping", "Найдите значение производной в точке"],
  urinmaBurchak: ["Urinmaning burchak koeffitsiyentini toping", "Найдите угловой коэффициент касательной"],
  ekstremum: ["Ekstremum nuqtasini toping", "Найдите точку экстремума"],
  osishOraliq: ["Funksiya qayerda o'sadi?", "Где функция возрастает?"],
  boshlangichFunksiya: ["Boshlang'ich funksiyani toping", "Найдите первообразную"],
  aniqmasIntegral: ["Aniqmas integralni toping", "Найдите неопределённый интеграл"],
  aniqIntegral: ["Aniq integralni hisoblang", "Вычислите определённый интеграл"],
  yuzaIntegral: ["Egri chiziqli trapetsiya yuzini toping", "Найдите площадь криволинейной трапеции"],
  nyutonBinom: ["Nyuton binomi koeffitsiyentini toping", "Найдите коэффициент бинома Ньютона"],
  kombinatsiya: ["Nechta usulda tanlash mumkin?", "Сколькими способами можно выбрать?"],
  ortachaChetlanish: ["O'rtacha kvadratik chetlanishni toping", "Найдите среднее квадратическое отклонение"],

  /* ================= geometriya: 7-sinf ================= */
  kesmaUzunlik: ["Kesma uzunligini toping", "Найдите длину отрезка"],
  burchakHisobla: ["Burchakni toping", "Найдите угол"],
  qoshniBurchak: ["Qo'shni burchakni toping", "Найдите смежный угол"],
  burchakTuri: ["Burchak turini aniqlang", "Определите вид угла"],
  uchburchakTuri2: ["Uchburchak turini aniqlang", "Определите вид треугольника"],
  uchburchakBurchak3: ["Uchinchi burchakni toping", "Найдите третий угол"],
  tashqiBurchak: ["Tashqi burchakni toping", "Найдите внешний угол"],
  tenglikAlomati: ["Qaysi tenglik alomati qo'llanadi?", "Какой признак равенства применяется?"],
  parallelBurchak: ["Parallel to'g'ri chiziqlar va kesuvchi", "Параллельные прямые и секущая"],
  uchburchakTengsizlik: ["Uchburchak yasash mumkinmi?", "Можно ли построить треугольник?"],
  kopburchakBurchak: ["Ko'pburchak ichki burchaklari yig'indisini toping", "Найдите сумму внутренних углов многоугольника"],

  /* ================= geometriya: 8-sinf ================= */
  parallelogrammBurchak: ["Parallelogramm burchagini toping", "Найдите угол параллелограмма"],
  parallelogrammPerim: ["Parallelogramm perimetrini toping", "Найдите периметр параллелограмма"],
  rombYuza: ["Romb yuzini toping", "Найдите площадь ромба"],
  trapetsiyaYuza: ["Trapetsiya yuzini toping", "Найдите площадь трапеции"],
  ortaChiziq: ["O'rta chiziqni toping", "Найдите среднюю линию"],
  pifagor: ["Pifagor teoremasi bo'yicha toping", "Найдите по теореме Пифагора"],
  trigNisbat: ["Nisbatni toping", "Найдите отношение"],
  yuzaHisobla: ["Yuzni toping", "Найдите площадь"],
  masofa2: ["Ikki nuqta orasidagi masofani toping", "Найдите расстояние между двумя точками"],
  ortaNuqta: ["Kesma o'rtasining koordinatalarini toping", "Найдите координаты середины отрезка"],
  vektorAmal: ["Vektorlar ustida amalni bajaring", "Выполните действие над векторами"],
  vektorUzunlik: ["Vektor uzunligini toping", "Найдите длину вектора"],
  skalyar: ["Skalyar ko'paytmani toping", "Найдите скалярное произведение"],
  aylanaBurchak: ["Aylanadagi burchakni toping", "Найдите угол в окружности"],

  /* ================= geometriya: 9-sinf ================= */
  oxshashlikKoef: ["O'xshashlik koeffitsiyentini toping", "Найдите коэффициент подобия"],
  oxshashTomon: ["O'xshash uchburchakning tomonini toping", "Найдите сторону подобного треугольника"],
  oxshashYuza: ["O'xshash shakllar yuzlari nisbatini toping", "Найдите отношение площадей подобных фигур"],
  sinuslarTeorema: ["Sinuslar teoremasini qo'llang", "Примените теорему синусов"],
  kosinuslarTeorema: ["Kosinuslar teoremasini qo'llang", "Примените теорему косинусов"],
  uchburchakYuzaSin: ["Uchburchak yuzini sinus orqali toping", "Найдите площадь треугольника через синус"],
  muntazamKopburchak: ["Muntazam ko'pburchak burchagini toping", "Найдите угол правильного многоугольника"],
  aylanaUzunlik2: ["Aylana uzunligini toping", "Найдите длину окружности"],
  yoyUzunlik: ["Yoy uzunligini toping", "Найдите длину дуги"],
  sektorYuza: ["Sektor yuzini toping", "Найдите площадь сектора"],
  proporsionalKesma: ["Proporsional kesmani toping", "Найдите пропорциональный отрезок"],

  /* ================= stereometriya: 10–11-sinf ================= */
  fazoJoylashuv: ["Fazoda qanday joylashgan?", "Как расположены в пространстве?"],
  kopyoqElement: ["Ko'pyoq elementlari sonini toping", "Найдите число элементов многогранника"],
  eylerFormula: ["Eyler formulasini qo'llang", "Примените формулу Эйлера"],
  diagonalFazo: ["Fazoviy diagonalni toping", "Найдите диагональ"],
  prizmaHajm: ["Prizma hajmini toping", "Найдите объём призмы"],
  prizmaSirt: ["Prizma sirtini toping", "Найдите площадь поверхности призмы"],
  silindrHajm: ["Silindr hajmini toping", "Найдите объём цилиндра"],
  silindrSirt: ["Silindr sirtini toping", "Найдите площадь поверхности цилиндра"],
  piramidaHajm: ["Piramida hajmini toping", "Найдите объём пирамиды"],
  konusHajm: ["Konus hajmini toping", "Найдите объём конуса"],
  konusSirt: ["Konus yon sirtini toping", "Найдите площадь боковой поверхности конуса"],
  sharHajm: ["Shar hajmini toping", "Найдите объём шара"],
  sferaYuza: ["Sfera sirtining yuzini toping", "Найдите площадь поверхности сферы"],
  fazoMasofa: ["Fazoda ikki nuqta orasidagi masofani toping", "Найдите расстояние между точками в пространстве"],
  fazoVektor: ["Fazoviy vektor uzunligini toping", "Найдите длину вектора в пространстве"],

  /* ================= javob variantlari (so'z bo'lganlar) ================= */
  jYuqoriga: ["yuqoriga", "вверх"],
  jPastga: ["pastga", "вниз"],
  jJuft: ["juft", "чётная"],
  jToq: ["toq", "нечётная"],
  jNaJuftNaToq: ["na juft, na toq", "ни чётная, ни нечётная"],
  jMusbat: ["musbat", "положительный"],
  jManfiy: ["manfiy", "отрицательный"],
  jNol: ["nol", "нуль"],
  jIkkita: ["ikkita", "два"],
  jBitta: ["bitta", "один"],
  jYoq: ["ildizi yo'q", "корней нет"],
  jMumkin: ["mumkin", "можно"],
  jMumkinEmas: ["mumkin emas", "нельзя"],
  jParallel: ["parallel", "параллельны"],
  jKesishuvchi: ["kesishuvchi", "пересекаются"],
  jAyqash: ["ayqash", "скрещиваются"],
  jUstMaUst: ["ustma-ust tushadi", "совпадают"],
  jTBT: ["TBT — tomon-burchak-tomon", "СУС — сторона-угол-сторона"],
  jBTB: ["BTB — burchak-tomon-burchak", "УСУ — угол-сторона-угол"],
  jTTT: ["TTT — tomon-tomon-tomon", "ССС — сторона-сторона-сторона"],
  jOtkir: ["o'tkir", "острый"],
  jOtmas: ["o'tmas", "тупой"],
  jTogri90: ["to'g'ri", "прямой"],
  jYoyiq: ["yoyiq", "развёрнутый"],
  jTeng: ["teng", "равны"],
  jQoshimcha: ["yig'indisi 180°", "сумма 180°"],
  jTengTomonli: ["teng tomonli", "равносторонний"],
  jTengYonli: ["teng yonli", "равнобедренный"],
  jTurliTomonli: ["turli tomonli", "разносторонний"],

  /* ================= savol matnining o'zi ================= */
  txtBerilgan: ["Berilgan: {x}", "Дано: {x}"],
  txtTopish: ["{x} = ?", "{x} = ?"],
  txtUchburchakABC: ["ABC uchburchakda ∠A = {a}°, ∠B = {b}°", "В треугольнике ABC ∠A = {a}°, ∠B = {b}°"],
  txtKatetlar: ["Katetlar: {a} va {b}. Gipotenuza = ?", "Катеты: {a} и {b}. Гипотенуза = ?"],
  txtGipotenuza: ["Gipotenuza {c}, kateti {a}. Ikkinchi katet = ?", "Гипотенуза {c}, катет {a}. Второй катет = ?"],
  txtProgressiya: ["a₁ = {a}, d = {d}. a{n} = ?", "a₁ = {a}, d = {d}. a{n} = ?"],
  txtGeoProg: ["b₁ = {a}, q = {q}. b{n} = ?", "b₁ = {a}, q = {q}. b{n} = ?"],
  txtTanga: ["{n} ta tangadan {k} tasi — gerb. Ehtimollik = ?", "Из {n} монет {k} — герб. Вероятность = ?"],
  txtQutida: [
    "Qutida {a} ta oq, {b} ta qora shar. Oq chiqish ehtimoli = ?",
    "В коробке {a} белых и {b} чёрных шаров. Вероятность белого = ?",
  ],
  txtNechtaUsul: ["{a} ta ko'ylak, {b} ta shim, {c} ta shlyapa", "{a} рубашек, {b} брюк, {c} шляп"],
  txtTomonlar: ["Tomonlari: {a}, {b}, {c}", "Стороны: {a}, {b}, {c}"],
  txtOlchamlar: ["a = {a}, b = {b}, c = {c}", "a = {a}, b = {b}, c = {c}"],
  txtRadiusBalandlik: ["r = {r}, h = {h}", "r = {r}, h = {h}"],
  txtRadiusR: ["R = {r}", "R = {r}"],
  txtNuqtalar: ["A({x1}; {y1}),  B({x2}; {y2})", "A({x1}; {y1}),  B({x2}; {y2})"],
  txtVektorlar: ["a⃗({x1}; {y1}),  b⃗({x2}; {y2})", "a⃗({x1}; {y1}),  b⃗({x2}; {y2})"],
  txtFoiz: ["{s} so'm, yiliga {f}%, {n} yil", "{s} сум, {f}% в год, {n} лет"],
  txtQator: ["{q}", "{q}"],
} satisfies Record<string, [string, string]>;

export type OliyKalit = keyof typeof O;

/** Savol matnini tilga qarab beradi va `{nom}` o'rinlarini to'ldiradi. */
export function po(k: OliyKalit, par?: Record<string, string | number>): string {
  const juft = O[k] as [string, string];
  let s = til() === "ru" ? juft[1] : juft[0];
  if (par) {
    for (const [nom, qiymat] of Object.entries(par)) {
      s = s.split(`{${nom}}`).join(String(qiymat));
    }
  }
  return s;
}
