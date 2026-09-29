/**
 * MAVZU NAZARIYASI — 7–11-sinf darslari uchun qisqa tushuntirish.
 *
 * ─────────────────────── NEGA KERAK ───────────────────────
 *
 * Imtihon natijasida "Qayerda ball yo'qotildi" ro'yxati turadi va
 * ilgari undagi mavzu bosilganda o'quvchi to'g'ridan-to'g'ri DARSGA
 * tushardi — ya'ni yana o'sha misollarga. Qoidani bilmagani uchun
 * xato qilgan odamga yana misol berish yordam bermaydi: u yana
 * taxmin qiladi. Bundan tashqari dars yopiq bo'lsa (8-sinf kursini
 * hali boshlamagan abituriyent), manzil kurs xaritasiga qaytarardi.
 *
 * Endi mavzu sahifasi (`screens/Mavzu.tsx`) avval QOIDANI ko'rsatadi,
 * keyin yechilgan namunani, oxirida mashqni.
 *
 * ─────────────────────── TUZILISHI ───────────────────────
 *
 *   q   qoida — bir-ikki gap, darslik tilida emas, odam tilida
 *   f   formulalar — sonli namuna bilan bo'lsa yaxshiroq
 *   e   "e'tibor ber" — shu mavzuda eng ko'p qilinadigan xato
 *
 * KALIT — darsning o'zbekcha nomi (`Lesson.n`), indeks emas. Indeks
 * dastur qayta tartiblanganda boshqa darsga ko'chib ketardi; nom esa
 * darsning o'zi bilan yuradi. Ikki kursda bir xil nomli dars (masalan
 * "Kvadrat tengsizlik" 9- va 10-sinfda) bitta tushuntirishni oladi —
 * mavzu bir xil.
 *
 * Takrorlash va yakuniy sinov darslarida nazariya YO'Q: ular bir
 * nechta darsning aralashmasi, sahifada esa har bir dars alohida
 * tushuntirilgan.
 */

/** Ikki tildagi matn: [o'zbekcha, ruscha]. */
export type Juft = [string, string];

export interface Nazariya {
  q: Juft;
  /** Formula tilga bog'liq emas — satr; ichida so'z bo'lsa — juftlik. */
  f?: (string | Juft)[];
  e?: Juft;
}

const PIFAGOR = "c² = a² + b²";
const KV_ILDIZ = "x₁,₂ = (−b ± √D) / 2a";
const JADVAL: Juft[] = [
  ["sin: 30° → 1/2,  45° → √2/2,  60° → √3/2", "sin: 30° → 1/2,  45° → √2/2,  60° → √3/2"],
  ["cos: 30° → √3/2,  45° → √2/2,  60° → 1/2", "cos: 30° → √3/2,  45° → √2/2,  60° → 1/2"],
  ["tg: 30° → √3/3,  45° → 1,  60° → √3", "tg: 30° → √3/3,  45° → 1,  60° → √3"],
];

export const NAZARIYA: Record<string, Nazariya> = {
  /* ═══════════════════════ 7-sinf algebra ═══════════════════════ */
  "Sonli ifodalar": {
    q: ["Amallar tartibi: avval qavs ichi, keyin daraja, keyin ko'paytirish va bo'lish, eng oxirida qo'shish va ayirish. Bir xil darajadagi amallar chapdan o'ngga bajariladi.",
      "Порядок действий: сначала скобки, затем степень, затем умножение и деление, в конце сложение и вычитание. Действия одного уровня выполняются слева направо."],
    f: ["( )  →  aⁿ  →  · :  →  + −", "10 + 6 · 7 = 10 + 42 = 52"],
    e: ["10 + 6 · 7 ni 16 · 7 deb hisoblash — eng ko'p uchraydigan xato. Ko'paytirish qo'shishdan oldin.",
      "Считать 10 + 6 · 7 как 16 · 7 — самая частая ошибка. Умножение выполняется раньше сложения."],
  },
  "Algebraik ifodalar": {
    q: ["Harf o'rniga berilgan sonni qo'yamiz va oddiy sonli ifodani hisoblaymiz. 8x — bu 8 · x degani.",
      "Подставляем вместо буквы данное число и считаем обычное числовое выражение. 8x означает 8 · x."],
    f: ["8x + 8,  x = 4   →   8 · 4 + 8 = 40"],
    e: ["Sonni qo'ygandan keyin ham amallar tartibi saqlanadi: avval ko'paytirish, keyin qo'shish.",
      "После подстановки порядок действий сохраняется: сначала умножение, потом сложение."],
  },
  "Tengliklar va formulalar": {
    q: ["Formula — kattaliklar orasidagi bog'lanish. Ma'lum qiymatlarni formulaga qo'yib, noma'lumini hisoblaymiz.",
      "Формула — связь между величинами. Подставляем известные значения и вычисляем неизвестное."],
    f: ["P = 2(a + b)", "S = a²", "S = v · t"],
    e: ["P = 2(a + b) da avval qavs ichidagi yig'indi, keyin 2 ga ko'paytirish.",
      "В P = 2(a + b) сначала сумма в скобках, потом умножение на 2."],
  },
  "Qavslarni ochish": {
    q: ["Qavs oldidagi son qavs ichidagi HAR BIR hadga ko'paytiriladi. Qavs oldida minus bo'lsa, ichidagi har bir hadning ishorasi teskarisiga o'zgaradi.",
      "Число перед скобкой умножается на КАЖДОЕ слагаемое в скобке. Если перед скобкой минус, знак каждого слагаемого меняется на противоположный."],
    f: ["a(b + c) = ab + ac", "−(b − c) = −b + c", "2 − (10 − 5) = 2 − 10 + 5 = −3"],
    e: ["Minusli qavsda ikkinchi hadning ishorasini ham almashtirishni unutmang.",
      "В скобке с минусом не забудьте поменять знак и у второго слагаемого."],
  },
  "Tenglama va uning ildizlari": {
    q: ["Tenglamaning ildizi — x o'rniga qo'yilganda tenglikni to'g'ri qiladigan son. Tekshirish uchun sonni qo'yib, ikki tomonni solishtiring.",
      "Корень уравнения — число, при подстановке которого вместо x равенство становится верным. Для проверки подставьте и сравните обе части."],
    f: ["2x − 10 = 12,   x = 11:   22 − 10 = 12"],
    e: ["Testda variantlarni birma-bir qo'yib tekshirish ko'pincha eng tez usul.",
      "В тесте часто быстрее всего подставить варианты по очереди."],
  },
  "Tenglamalarni yechish": {
    q: ["Noma'lumli hadlarni bir tomonga, sonlarni ikkinchi tomonga o'tkazing — o'tgan had ishorasini o'zgartiradi. Oxirida x oldidagi songa bo'ling.",
      "Перенесите слагаемые с неизвестным в одну часть, числа — в другую; при переносе знак меняется. В конце разделите на коэффициент при x."],
    f: ["ax + b = cx + d   ⇒   (a − c)x = d − b", "3x − 11 = x − 27  ⇒  2x = −16  ⇒  x = −8"],
    e: ["Tomonga o'tkazganda ishorani almashtirish esdan chiqadi: −11 o'ng tomonda +11 bo'ladi.",
      "Часто забывают сменить знак при переносе: −11 справа становится +11."],
  },
  "Masalalarni tenglama bilan yechish": {
    q: ["Noma'lum kattalikni x deb belgilang, qolganlarini x orqali ifodalang va shartdan tenglama tuzing.",
      "Обозначьте неизвестное через x, выразите остальные величины через x и составьте уравнение по условию."],
    f: ["x + (x + 7) = 33   ⇒   2x = 26   ⇒   x = 13"],
    e: ["Javobni masala shartiga qo'yib tekshiring: 13 va 20, yig'indisi 33.",
      "Проверьте ответ по условию: 13 и 20, сумма 33."],
  },
  "Natural ko'rsatkichli daraja": {
    q: ["aⁿ — a sonini o'ziga n marta ko'paytirish.", "aⁿ — произведение n множителей, равных a."],
    f: ["aⁿ = a · a · … · a", "7³ = 7 · 7 · 7 = 343"],
    e: ["7³ ni 7 · 3 = 21 deb hisoblamang — daraja ko'paytirish emas.",
      "Не путайте 7³ с 7 · 3 = 21 — степень не умножение."],
  },
  "Darajaning xossalari": {
    q: ["Asoslari bir xil bo'lsa: ko'paytirishda ko'rsatkichlar qo'shiladi, bo'lishda ayiriladi, darajani darajaga ko'targanda ko'paytiriladi.",
      "При одинаковых основаниях: при умножении показатели складываются, при делении вычитаются, при возведении степени в степень перемножаются."],
    f: ["aᵐ · aⁿ = aᵐ⁺ⁿ", "aᵐ : aⁿ = aᵐ⁻ⁿ", "(aᵐ)ⁿ = aᵐⁿ"],
    e: ["(x⁶)³ = x¹⁸, lekin x⁶ · x³ = x⁹ — ikkalasini adashtirmang.",
      "(x⁶)³ = x¹⁸, но x⁶ · x³ = x⁹ — не путайте."],
  },
  "Birhadlarni ko'paytirish": {
    q: ["Koeffitsiyentlar o'zaro ko'paytiriladi, bir xil harflarning ko'rsatkichlari qo'shiladi.",
      "Коэффициенты перемножаются, показатели одинаковых букв складываются."],
    f: ["6x³ · 3x⁴ = 18x⁷"],
    e: ["Ko'rsatkichlar ko'paytirilmaydi: x³ · x⁴ = x⁷, x¹² emas.",
      "Показатели не перемножаются: x³ · x⁴ = x⁷, а не x¹²."],
  },
  "O'xshash hadlarni ixchamlash": {
    q: ["Harfiy qismi bir xil hadlar o'xshash. Ularning koeffitsiyentlari qo'shiladi, harfiy qismi o'zgarmaydi.",
      "Подобные слагаемые имеют одинаковую буквенную часть. Их коэффициенты складываются, буквенная часть не меняется."],
    f: ["10x + 5y + 6x = 16x + 5y"],
    e: ["x va y o'xshash emas — ularni qo'shib bo'lmaydi.", "x и y не подобны — их нельзя сложить."],
  },
  "Ko'phadlarni qo'shish va ayirish": {
    q: ["Qavslarni ochib, o'xshash hadlarni ixchamlang. Ayirishda ikkinchi qavs ichidagi BARCHA ishoralar almashadi.",
      "Раскройте скобки и приведите подобные. При вычитании меняются ВСЕ знаки во второй скобке."],
    f: ["(5x + 9) + (4x + 6) = 9x + 15", "(a + b) − (c − d) = a + b − c + d"],
    e: ["Ayirishda faqat birinchi hadning emas, har bir hadning ishorasi o'zgaradi.",
      "При вычитании меняется знак каждого слагаемого, а не только первого."],
  },
  "Ko'phadni birhadga ko'paytirish": {
    q: ["Birhad ko'phadning har bir hadiga ko'paytiriladi.", "Одночлен умножается на каждый член многочлена."],
    f: ["a(b + c) = ab + ac", "2x(3x − 3) = 6x² − 6x"],
    e: ["x · x = x², 2x emas.", "x · x = x², а не 2x."],
  },
  "Ko'phadni ko'phadga ko'paytirish": {
    q: ["Birinchi ko'phadning har bir hadini ikkinchisining har bir hadiga ko'paytiring, so'ng o'xshash hadlarni ixchamlang.",
      "Умножьте каждый член первого многочлена на каждый член второго, затем приведите подобные."],
    f: ["(a + b)(c + d) = ac + ad + bc + bd", "(x + 9)(x − 2) = x² + 7x − 18"],
    e: ["Ishoralarga e'tibor: 9 · (−2) = −18.", "Следите за знаками: 9 · (−2) = −18."],
  },
  "Birhadga bo'lish": {
    q: ["Ko'phadning har bir hadi birhadga alohida bo'linadi: koeffitsiyentlar bo'linadi, ko'rsatkichlar ayiriladi.",
      "Каждый член многочлена делится на одночлен отдельно: коэффициенты делятся, показатели вычитаются."],
    f: ["(9x³ + 18x) : 3x = 3x² + 6"],
    e: ["18x : 3x = 6 — x butunlay qisqaradi.", "18x : 3x = 6 — x сокращается полностью."],
  },
  "Umumiy ko'paytuvchini chiqarish": {
    q: ["Hamma hadlar bo'linadigan eng katta sonni (va harfni) qavs oldiga chiqaring, qavs ichida bo'linmalar qoladi.",
      "Вынесите за скобку наибольшее число (и букву), на которое делятся все члены; в скобке остаются частные."],
    f: ["ab + ac = a(b + c)", "56x + 21 = 7(8x + 3)"],
    e: ["Tekshirish: qavsni qayta oching — boshlang'ich ifoda chiqishi kerak.",
      "Проверка: раскройте скобку обратно — должно получиться исходное выражение."],
  },
  "Yig'indi va ayirmaning kvadrati": {
    q: ["Birinchisining kvadrati, ikkilangan ko'paytma, ikkinchisining kvadrati.",
      "Квадрат первого, удвоенное произведение, квадрат второго."],
    f: ["(a + b)² = a² + 2ab + b²", "(a − b)² = a² − 2ab + b²"],
    e: ["(x + 9)² ≠ x² + 81: o'rtadagi 2 · x · 9 = 18x hadini unutmang.",
      "(x + 9)² ≠ x² + 81: не забудьте средний член 2 · x · 9 = 18x."],
  },
  "Kvadratlar ayirmasi": {
    q: ["Ikki kvadratning ayirmasi — ayirma va yig'indining ko'paytmasi.",
      "Разность квадратов равна произведению разности и суммы."],
    f: ["a² − b² = (a − b)(a + b)", "x² − 49 = (x − 7)(x + 7)"],
    e: ["Kvadratlar YIG'INDISI a² + b² bu usul bilan ajralmaydi.",
      "СУММА квадратов a² + b² так не раскладывается."],
  },
  "Usullarni birgalikda qo'llash": {
    q: ["Avval umumiy ko'paytuvchini chiqaring, keyin qavs ichiga qisqa ko'paytirish formulasini qo'llang.",
      "Сначала вынесите общий множитель, затем примените к скобке формулу сокращённого умножения."],
    f: ["4x² − 16 = 4(x² − 4) = 4(x − 2)(x + 2)"],
    e: ["Ajratishni oxirigacha yetkazing: qavs ichida yana ajraladigan ifoda qolmasin.",
      "Доводите разложение до конца: в скобках не должно остаться раскладываемого выражения."],
  },
  "Kasrlarni qisqartirish": {
    q: ["Surat va maxrajni bir xil songa yoki ifodaga bo'lamiz. Darajalarda ko'rsatkichlar ayiriladi.",
      "Делим числитель и знаменатель на одно и то же число или выражение. У степеней показатели вычитаются."],
    f: ["20x² / 5x = 4x", "ac / bc = a / b"],
    e: ["Faqat KO'PAYTUVCHI qisqaradi: (x + 2)/2 dagi 2 larni qisqartirib bo'lmaydi.",
      "Сокращается только МНОЖИТЕЛЬ: в (x + 2)/2 двойки сокращать нельзя."],
  },
  "Qo'shish va ayirish": {
    q: ["Maxrajlar bir xil bo'lsa, suratlar qo'shiladi (ayiriladi), maxraj o'zgarmaydi.",
      "При одинаковых знаменателях числители складываются (вычитаются), знаменатель остаётся."],
    f: ["a/c + b/c = (a + b)/c"],
    e: ["Maxrajlar qo'shilmaydi: 4/3 + 9/3 = 13/3, 13/6 emas.",
      "Знаменатели не складываются: 4/3 + 9/3 = 13/3, а не 13/6."],
  },
  "Ko'paytirish va bo'lish": {
    q: ["Ko'paytirishda surat suratga, maxraj maxrajga ko'paytiriladi. Bo'lishda ikkinchi kasr ag'dariladi va ko'paytiriladi.",
      "При умножении числитель умножается на числитель, знаменатель на знаменатель. При делении вторую дробь переворачивают и умножают."],
    f: ["a/b · c/d = ac / bd", "a/b : c/d = a/b · d/c"],
    e: ["Javobni oxirida qisqartiring: 6/6 · 2/6 = 12/36 = 1/3.",
      "В конце сократите ответ: 6/6 · 2/6 = 12/36 = 1/3."],
  },
  "Birgalikda bajariladigan amallar": {
    q: ["Oldingi uch darsning aralashmasi: qisqartirish, bir xil maxrajli qo'shish va ko'paytirish.",
      "Смесь трёх предыдущих уроков: сокращение, сложение с одинаковым знаменателем и умножение."],
    f: ["a/c + b/c = (a + b)/c", "a/b · c/d = ac / bd"],
    e: ["Har doim oxirida kasrni qisqartiring.", "Всегда сокращайте дробь в конце."],
  },
  "Kombinatorikaning asosiy qoidasi": {
    q: ["Bir tanlov a usulda, ikkinchisi b usulda bajarilsa, ikkalasini birga a · b usulda bajarish mumkin.",
      "Если один выбор делается a способами, а второй — b способами, то оба вместе — a · b способами."],
    f: ["N = a · b · c", ["2 ko'ylak, 5 shim, 2 shlyapa → 2 · 5 · 2 = 20", "2 рубашки, 5 брюк, 2 шляпы → 2 · 5 · 2 = 20"]],
    e: ["Sonlar qo'shilmaydi, ko'paytiriladi.", "Числа не складываются, а перемножаются."],
  },
  "O'rin almashtirish": {
    q: ["n ta turli narsani qatorga n! usulda terish mumkin.", "n различных предметов можно расставить в ряд n! способами."],
    f: ["Pₙ = n! = 1 · 2 · … · n", "5! = 120,   6! = 720"],
    e: ["0! = 1 deb qabul qilingan.", "По определению 0! = 1."],
  },

  /* ═══════════════════════ 7-sinf geometriya ═══════════════════════ */
  "Kesma va uning uzunligi": {
    q: ["B nuqta AC kesmada yotsa, butun kesma ikki bo'lagining yig'indisiga teng.",
      "Если точка B лежит на отрезке AC, весь отрезок равен сумме двух частей."],
    f: ["AC = AB + BC"],
  },
  "Aylana va doira": {
    q: ["Diametr markazdan o'tadi va ikki radiusga teng.", "Диаметр проходит через центр и равен двум радиусам."],
    f: ["d = 2r", "r = d / 2"],
  },
  "Kesmalarni taqqoslash": {
    q: ["Butun kesma va bir bo'lagi ma'lum bo'lsa, ikkinchi bo'lak ayirma bilan topiladi.",
      "Если известны весь отрезок и одна часть, вторая часть находится вычитанием."],
    f: ["BC = AC − AB"],
  },
  "Burchak turlari": {
    q: ["O'tkir burchak 90° dan kichik, to'g'ri burchak 90°, o'tmas burchak 90° va 180° orasida, yoyiq burchak 180°.",
      "Острый угол меньше 90°, прямой — 90°, тупой — между 90° и 180°, развёрнутый — 180°."],
    e: ["Aniq 90° — to'g'ri burchak: u o'tkir ham, o'tmas ham emas.",
      "Ровно 90° — прямой угол: он не острый и не тупой."],
  },
  "Bissektrisa": {
    q: ["Bissektrisa burchakni ikki teng burchakka bo'ladi.", "Биссектриса делит угол на два равных угла."],
    f: ["∠AOM = ∠MOB = ∠AOB / 2"],
  },
  "Qo'shni burchaklar": {
    q: ["Qo'shni burchaklarning bitta tomoni umumiy, qolgan ikkitasi bitta to'g'ri chiziq hosil qiladi. Yig'indisi 180°.",
      "У смежных углов одна сторона общая, а две другие образуют прямую. Их сумма 180°."],
    f: ["∠1 + ∠2 = 180°"],
  },
  "Vertikal burchaklar": {
    q: ["Ikki to'g'ri chiziq kesishganda qarama-qarshi yotgan burchaklar vertikal va ular teng.",
      "При пересечении двух прямых противоположные углы вертикальные, и они равны."],
    f: ["∠1 = ∠3"],
    e: ["Vertikal burchak TENG, qo'shni burchak esa 180° gacha to'ldiradi.",
      "Вертикальный угол РАВЕН, а смежный дополняет до 180°."],
  },
  "Uchburchak turlari": {
    q: ["Uchala tomoni teng — teng tomonli, ikkitasi teng — teng yonli, hammasi har xil — turli tomonli.",
      "Все три стороны равны — равносторонний, две равны — равнобедренный, все разные — разносторонний."],
    e: ["Teng tomonli uchburchak teng yonli ham, lekin javobda aniqrog'i — teng tomonli.",
      "Равносторонний треугольник также равнобедренный, но точнее ответ — равносторонний."],
  },
  "Ko'pburchak burchaklari": {
    q: ["n burchakli qavariq ko'pburchak ichki burchaklarining yig'indisi:",
      "Сумма внутренних углов выпуклого n-угольника:"],
    f: ["S = (n − 2) · 180°", "n = 4:  2 · 180° = 360°"],
  },
  "Tenglik alomatlari": {
    q: ["Ikki uchburchak teng, agar: uch tomoni teng (TTT); ikki tomoni va ular orasidagi burchak teng (TBT); bir tomoni va unga yopishgan ikki burchak teng (BTB).",
      "Треугольники равны, если равны: три стороны (ССС); две стороны и угол между ними (СУС); сторона и два прилежащих угла (УСУ)."],
    e: ["TBT da burchak aynan o'sha ikki tomon ORASIDA bo'lishi shart.",
      "В СУС угол должен лежать именно МЕЖДУ этими сторонами."],
  },
  "Teng yonli uchburchak": {
    q: ["Asosidagi ikki burchak teng. Uchala burchak yig'indisi 180°.",
      "Углы при основании равны. Сумма трёх углов 180°."],
    f: [["uchidagi = 180° − 2 · asosidagi", "при вершине = 180° − 2 · при основании"],
      ["asosidagi = (180° − uchidagi) / 2", "при основании = (180° − при вершине) / 2"]],
  },
  "Kesuvchi hosil qilgan burchaklar": {
    q: ["Parallel to'g'ri chiziqlarni kesuvchi kesganda: ichki almashinuvchi va mos burchaklar teng, ichki bir tomonli burchaklar yig'indisi 180°.",
      "При пересечении параллельных прямых секущей: накрест лежащие и соответственные углы равны, сумма односторонних углов 180°."],
    f: [["almashinuvchi:  ∠1 = ∠2", "накрест лежащие:  ∠1 = ∠2"], ["bir tomonli:  ∠1 + ∠2 = 180°", "односторонние:  ∠1 + ∠2 = 180°"]],
  },
  "Parallellik alomatlari": {
    q: ["Ichki almashinuvchi (yoki mos) burchaklar teng bo'lsa, yoki ichki bir tomonli burchaklar yig'indisi 180° bo'lsa, to'g'ri chiziqlar parallel.",
      "Прямые параллельны, если накрест лежащие (или соответственные) углы равны или сумма односторонних углов равна 180°."],
    f: [["almashinuvchi:  ∠1 = ∠2", "накрест лежащие:  ∠1 = ∠2"], ["bir tomonli:  ∠1 + ∠2 = 180°", "односторонние:  ∠1 + ∠2 = 180°"]],
  },
  "Ichki burchaklar yig'indisi": {
    q: ["Har qanday uchburchakda uchala burchak yig'indisi 180°.", "В любом треугольнике сумма углов равна 180°."],
    f: ["∠A + ∠B + ∠C = 180°", "∠C = 180° − ∠A − ∠B"],
  },
  "Tashqi burchak": {
    q: ["Tashqi burchak unga qo'shni bo'lmagan ikki ichki burchak yig'indisiga teng.",
      "Внешний угол равен сумме двух внутренних углов, не смежных с ним."],
    f: [["tashqi ∠C = ∠A + ∠B", "внешний ∠C = ∠A + ∠B"]],
  },
  "To'g'ri burchakli uchburchak": {
    q: ["To'g'ri burchakli uchburchakda ikki o'tkir burchak yig'indisi 90°.", "В прямоугольном треугольнике сумма острых углов 90°."],
    f: ["∠A + ∠B = 90°"],
  },
  "Uchburchak tengsizligi": {
    q: ["Har bir tomon qolgan ikkitasining yig'indisidan kichik bo'lishi kerak. Eng katta tomonni tekshirish yetarli.",
      "Каждая сторона меньше суммы двух других. Достаточно проверить самую большую сторону."],
    f: ["c < a + b", "2, 2, 7:   2 + 2 = 4 < 7"],
    e: ["Tenglik ham yaramaydi: a + b = c bo'lsa uchburchak chiqmaydi.",
      "Равенство тоже не подходит: при a + b = c треугольника нет."],
  },

  /* ═══════════════════════ 8-sinf algebra ═══════════════════════ */
  "Umumiy maxrajga keltirish": {
    q: ["Maxrajlarning EKUKini toping, har bir kasrni qo'shimcha ko'paytuvchiga kengaytiring, so'ng suratlarni qo'shing.",
      "Найдите НОК знаменателей, домножьте каждую дробь на дополнительный множитель и сложите числители."],
    f: ["a/b + c/d = (ad + cb) / bd", "1/4 + 4/6 = 3/12 + 8/12 = 11/12"],
    e: ["Kengaytirishda surat ham, maxraj ham bir xil songa ko'paytiriladi.",
      "При домножении числитель и знаменатель умножаются на одно и то же число."],
  },
  "y = k/x funksiya": {
    q: ["Teskari proporsionallik: x necha marta ortsa, y shuncha marta kamayadi. Qiymatini topish uchun k ni x ga bo'lamiz.",
      "Обратная пропорциональность: во сколько раз растёт x, во столько раз уменьшается y. Значение — это k, делённое на x."],
    f: ["y = k / x", "x · y = k"],
    e: ["x = 0 da funksiya aniqlanmagan; grafigi — giperbola.", "При x = 0 функция не определена; график — гипербола."],
  },
  "Kvadrat ildiz": {
    q: ["√a — kvadrati a ga teng bo'lgan manfiy bo'lmagan son.", "√a — неотрицательное число, квадрат которого равен a."],
    f: ["√a = b   ⇔   b² = a,  b ≥ 0", "11² = 121,  12² = 144,  13² = 169,  14² = 196,  15² = 225", "16² = 256,  17² = 289,  18² = 324,  19² = 361,  20² = 400"],
    e: ["√25 = 5, −5 emas: arifmetik ildiz hech qachon manfiy bo'lmaydi.",
      "√25 = 5, а не −5: арифметический корень не бывает отрицательным."],
  },
  "Ildizning xossalari": {
    q: ["Ko'paytma va bo'linmaning ildizi ildizlarning ko'paytmasi va bo'linmasiga teng.",
      "Корень из произведения и частного равен произведению и частному корней."],
    f: ["√(ab) = √a · √b", "√(a/b) = √a / √b", "(√a)² = a"],
    e: ["Yig'indida bunday qoida yo'q: √(a + b) ≠ √a + √b.", "Для суммы такого правила нет: √(a + b) ≠ √a + √b."],
  },
  "Ratsional ko'rsatkichli daraja": {
    q: ["Kasr ko'rsatkichning maxraji — ildiz darajasi, surati — daraja.",
      "Знаменатель дробного показателя — степень корня, числитель — степень."],
    f: ["a^(1/n) = ⁿ√a", "a^(m/n) = ⁿ√(aᵐ)", "64^(1/3) = ∛64 = 4"],
  },
  "Sonli tengsizliklar": {
    q: ["a > b degani a − b musbat. Istalgan sonning kvadrati manfiy emas; ikki manfiy sonning ko'paytmasi musbat.",
      "a > b означает, что a − b положительно. Квадрат любого числа неотрицателен; произведение двух отрицательных положительно."],
    f: ["a > b   ⇔   a − b > 0", "a² ≥ 0", "(−2) · (−3) = 6 > 0"],
  },
  "Bir noma'lumli tengsizlik": {
    q: ["Tenglama kabi yechiladi, bitta farqi bor: ikki tomonni MANFIY songa ko'paytirsangiz yoki bo'lsangiz, belgi teskari o'giriladi.",
      "Решается как уравнение, с одним отличием: при умножении или делении на ОТРИЦАТЕЛЬНОЕ число знак неравенства меняется."],
    f: ["4x − 15 > 17   ⇒   4x > 32   ⇒   x > 8", "−2x > 6   ⇒   x < −3"],
  },
  "Sonli oraliqlar": {
    q: ["Qat'iy tengsizlik (<, >) — dumaloq qavs, uchi kirmaydi. Noqat'iy (≤, ≥) — kvadrat qavs, uchi kiradi.",
      "Строгое неравенство (<, >) — круглая скобка, конец не входит. Нестрогое (≤, ≥) — квадратная скобка, конец входит."],
    f: ["−2 < x < 3   →   (−2; 3)", "−2 ≤ x ≤ 3   →   [−2; 3]"],
  },
  "Sonning moduli": {
    q: ["Modul — sonning noldan masofasi, u hech qachon manfiy bo'lmaydi.",
      "Модуль — расстояние от числа до нуля, он никогда не бывает отрицательным."],
    f: ["|−19| = 19,   |6| = 6", "|x| = a  (a > 0)   ⇒   x = a  yoki  x = −a"],
    e: ["|x| = 14 ning IKKITA yechimi bor: 14 va −14.", "У |x| = 14 ДВА решения: 14 и −14."],
  },
  "Taqribiy hisoblash va yaxlitlash": {
    q: ["Yaxlitlanadigan xonadan keyingi raqamga qaraladi: 5 yoki undan katta bo'lsa xona 1 ga oshadi, kichik bo'lsa o'zgarmaydi.",
      "Смотрим на следующую цифру: если она 5 или больше, разряд увеличивается на 1, если меньше — не меняется."],
    f: ["62,46 ≈ 62,5", "64,64 ≈ 64,6"],
  },
  "Chala kvadrat tenglamalar": {
    q: ["b = 0 yoki c = 0 bo'lsa, diskriminant kerak emas.", "Если b = 0 или c = 0, дискриминант не нужен."],
    f: ["x² − a = 0   ⇒   x = ±√a", "x² + bx = 0   ⇒   x(x + b) = 0   ⇒   x = 0,  x = −b"],
    e: ["x² = 81 ning ikkita ildizi bor: 9 va −9. x² − 11x = 0 da x = 0 ni yo'qotmang.",
      "У x² = 81 два корня: 9 и −9. В x² − 11x = 0 не теряйте корень x = 0."],
  },
  "Diskriminant": {
    q: ["ax² + bx + c = 0 tenglamada diskriminant ildizlar sonini aytadi.", "Дискриминант уравнения ax² + bx + c = 0 показывает число корней."],
    f: ["D = b² − 4ac"],
    e: ["b manfiy bo'lsa ham b² musbat: b = −3 da b² = 9.", "Даже при отрицательном b квадрат положителен: при b = −3 b² = 9."],
  },
  "Nechta ildiz bor": {
    q: ["D > 0 — ikkita ildiz, D = 0 — bitta ildiz, D < 0 — haqiqiy ildiz yo'q.",
      "D > 0 — два корня, D = 0 — один корень, D < 0 — действительных корней нет."],
    f: ["D = b² − 4ac"],
  },
  "Ildizlarni topish": {
    q: ["Diskriminantni hisoblang va ildizlar formulasiga qo'ying.", "Вычислите дискриминант и подставьте в формулу корней."],
    f: ["D = b² − 4ac", KV_ILDIZ],
    e: ["Ildizlarni Viyet bilan tekshiring: yig'indisi −b/a, ko'paytmasi c/a.",
      "Проверьте корни по Виету: сумма −b/a, произведение c/a."],
  },
  "Viyet teoremasi": {
    q: ["Keltirilgan tenglamada ildizlar yig'indisi teskari ishorali ikkinchi koeffitsiyentga, ko'paytmasi ozod hadga teng.",
      "В приведённом уравнении сумма корней равна второму коэффициенту с обратным знаком, произведение — свободному члену."],
    f: ["x² + px + q = 0:    x₁ + x₂ = −p,    x₁ · x₂ = q"],
    e: ["Yig'indida ishora teskari: x² − 3x − 18 = 0 da x₁ + x₂ = 3.",
      "В сумме знак обратный: для x² − 3x − 18 = 0 x₁ + x₂ = 3."],
  },
  "Kvadrat uchhadni ajratish": {
    q: ["Avval ildizlarni toping (Viyet bilan tez), keyin formulaga qo'ying.",
      "Сначала найдите корни (быстро — по Виету), затем подставьте в формулу."],
    f: ["ax² + bx + c = a(x − x₁)(x − x₂)", "x² − 10x + 16:  x₁ = 8,  x₂ = 2   →   (x − 8)(x − 2)"],
  },
  "Bikvadrat tenglama": {
    q: ["x² = t almashtirishi bilan oddiy kvadrat tenglamaga keltiriladi. t ning har bir musbat qiymatidan ikkita x chiqadi.",
      "Заменой x² = t сводится к квадратному уравнению. Каждое положительное t даёт два значения x."],
    f: ["ax⁴ + bx² + c = 0,   t = x²", "x = ±√t"],
    e: ["t manfiy chiqsa, undan x chiqmaydi.", "Если t отрицательно, оно не даёт корней x."],
  },
  "O'rta arifmetik qiymat": {
    q: ["Hamma sonlarning yig'indisi ularning soniga bo'linadi.", "Сумма всех чисел делится на их количество."],
    f: ["x̄ = (x₁ + x₂ + … + xₙ) / n"],
  },
  "Moda": {
    q: ["Qatorda eng ko'p takrorlangan son.", "Число, которое встречается в ряду чаще всего."],
    f: ["8, 10, 8, 9, 7, 8   →   moda = 8"],
  },
  "Mediana": {
    q: ["Sonlarni o'sish tartibida tering. Soni toq bo'lsa — o'rtadagisi, juft bo'lsa — o'rtadagi ikkitasining o'rtachasi.",
      "Расположите числа по возрастанию. При нечётном количестве — среднее число, при чётном — среднее двух средних."],
    f: ["16, 17, 1, 17, 18   →   1, 16, 17, 17, 18   →   17"],
    e: ["Avval saralashni unutmang — berilgan tartibdagi o'rtadagi son mediana emas.",
      "Не забудьте сначала упорядочить — середина исходного ряда не медиана."],
  },
  "Kombinatorik masalalar": {
    q: ["Bir tanlov a usulda, ikkinchisi b usulda bajarilsa, ikkalasini birga a · b usulda bajarish mumkin.",
      "Если один выбор делается a способами, а второй — b способами, то оба вместе — a · b способами."],
    f: ["N = a · b · c", "Pₙ = n!", "Cₙᵏ = n! / (k!(n − k)!)"],
    e: ["Sonlar qo'shilmaydi, ko'paytiriladi.", "Числа не складываются, а перемножаются."],
  },

  /* ═══════════════════════ 8-sinf geometriya ═══════════════════════ */
  "Parallelogramm burchaklari": {
    q: ["Qarama-qarshi burchaklar teng, yonma-yon burchaklar yig'indisi 180°.",
      "Противолежащие углы равны, сумма соседних углов 180°."],
    f: ["∠A = ∠C,   ∠B = ∠D", "∠A + ∠B = 180°"],
  },
  "Parallelogramm perimetri": {
    q: ["Qarama-qarshi tomonlar teng, shuning uchun ikki qo'shni tomon yig'indisining ikki barobari.",
      "Противоположные стороны равны, поэтому периметр — удвоенная сумма двух соседних сторон."],
    f: ["P = 2(a + b)"],
  },
  "Romb va kvadrat": {
    q: ["Rombning hamma tomoni teng, diagonallari perpendikulyar. Kvadrat — to'g'ri burchakli romb.",
      "У ромба все стороны равны, диагонали перпендикулярны. Квадрат — ромб с прямыми углами."],
    f: [["S(romb) = d₁ · d₂ / 2", "S(ромб) = d₁ · d₂ / 2"], ["S(kvadrat) = a²,   P = 4a", "S(квадрат) = a²,   P = 4a"]],
    e: ["Romb yuzida 2 ga bo'lishni unutmang.", "Не забудьте разделить на 2 в площади ромба."],
  },
  "Trapetsiya": {
    q: ["Trapetsiyaning faqat ikki tomoni — asoslari — parallel. Yuzi asoslar yig'indisining yarmi bilan balandlik ko'paytmasi.",
      "У трапеции параллельны только две стороны — основания. Площадь — полусумма оснований на высоту."],
    f: ["S = (a + b) · h / 2"],
  },
  "O'rta chiziq. Fales teoremasi": {
    q: ["Trapetsiyaning o'rta chizig'i asoslarga parallel va ular yig'indisining yarmiga teng. Uchburchakning o'rta chizig'i asosning yarmiga teng.",
      "Средняя линия трапеции параллельна основаниям и равна их полусумме. Средняя линия треугольника равна половине основания."],
    f: ["m = (a + b) / 2", ["uchburchakda:  m = a / 2", "в треугольнике:  m = a / 2"]],
  },
  "Pifagor teoremasi": {
    q: ["To'g'ri burchakli uchburchakda gipotenuzaning kvadrati katetlar kvadratlarining yig'indisiga teng.",
      "В прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов."],
    f: [PIFAGOR, "a = √(c² − b²)"],
    e: ["Mashhur uchliklarni yodlang: 3-4-5, 5-12-13, 8-15-17, 7-24-25.",
      "Запомните известные тройки: 3-4-5, 5-12-13, 8-15-17, 7-24-25."],
  },
  "Sinus, kosinus, tangens": {
    q: ["To'g'ri burchakli uchburchakda: sinus — qarshi katet / gipotenuza, kosinus — yopishgan katet / gipotenuza, tangens — qarshi katet / yopishgan katet.",
      "В прямоугольном треугольнике: синус — противолежащий катет / гипотенуза, косинус — прилежащий катет / гипотенуза, тангенс — противолежащий / прилежащий."],
    f: ["sin α = a / c,   cos α = b / c,   tg α = a / b", ...JADVAL],
  },
  "30°, 45°, 60° burchaklar": {
    q: ["Bu uch burchakning qiymatlari jadvalini yod bilish kerak.", "Значения для этих трёх углов нужно знать наизусть."],
    f: JADVAL,
    e: ["sin 30° = cos 60°: burchaklar 90° gacha to'ldirsa, sinus va kosinus o'rin almashadi.",
      "sin 30° = cos 60°: у углов, дополняющих друг друга до 90°, синус и косинус меняются местами."],
  },
  "To'g'ri burchakli uchburchakni yechish": {
    q: ["Ikki tomon ma'lum bo'lsa — Pifagor; bir tomon va o'tkir burchak ma'lum bo'lsa — sin, cos, tg.",
      "Известны две стороны — теорема Пифагора; сторона и острый угол — sin, cos, tg."],
    f: [PIFAGOR, "a = c · sin α,   b = c · cos α"],
  },
  "Kesma o'rtasining koordinatalari": {
    q: ["O'rtaning har bir koordinatasi uchlar koordinatalarining o'rtachasi.", "Каждая координата середины — среднее координат концов."],
    f: ["x = (x₁ + x₂) / 2,   y = (y₁ + y₂) / 2"],
  },
  "Ikki nuqta orasidagi masofa": {
    q: ["Pifagor teoremasining koordinatadagi ko'rinishi.", "Теорема Пифагора в координатах."],
    f: ["d = √((x₂ − x₁)² + (y₂ − y₁)²)"],
    e: ["Kvadratga ko'targanda ishora yo'qoladi: (−6 − 14)² = 400.", "При возведении в квадрат знак исчезает: (−6 − 14)² = 400."],
  },
  "Vektor uzunligi": {
    q: ["Vektor uzunligi uning koordinatalari kvadratlari yig'indisining ildizi.", "Длина вектора — корень из суммы квадратов его координат."],
    f: ["|a⃗| = √(x² + y²)", "a⃗(6; 8):   √(36 + 64) = 10"],
  },
  "Vektorlarni qo'shish": {
    q: ["Vektorlar qo'shilganda mos koordinatalari qo'shiladi.", "При сложении векторов складываются соответствующие координаты."],
    f: ["a⃗ + b⃗ = (x₁ + x₂; y₁ + y₂)", "k · a⃗ = (kx; ky)"],
  },
  "Skalyar ko'paytma": {
    q: ["Mos koordinatalar ko'paytmalarining yig'indisi. Natija — vektor emas, son.",
      "Сумма произведений соответствующих координат. Результат — число, а не вектор."],
    f: ["a⃗ · b⃗ = x₁x₂ + y₁y₂", "a⃗ ⊥ b⃗   ⇔   a⃗ · b⃗ = 0"],
  },
  "To'rtburchak va uchburchak yuzi": {
    q: ["Hamma yuz formulalari to'g'ri to'rtburchakdan kelib chiqadi: uchburchak — xuddi shu asos va balandlikdagi parallelogrammning yarmi.",
      "Все формулы площади выводятся из прямоугольника: треугольник — половина параллелограмма с тем же основанием и высотой."],
    f: [["to'g'ri to'rtburchak:  S = a · b", "прямоугольник:  S = a · b"], ["parallelogramm:  S = a · h", "параллелограмм:  S = a · h"], ["uchburchak:  S = a · h / 2", "треугольник:  S = a · h / 2"]],
  },
  "Romb va trapetsiya yuzi": {
    q: ["Rombda diagonallar ko'paytmasining yarmi, trapetsiyada asoslar yig'indisining yarmi balandlikka ko'paytiriladi.",
      "У ромба — половина произведения диагоналей, у трапеции — полусумма оснований на высоту."],
    f: [["romb:  S = d₁ · d₂ / 2", "ромб:  S = d₁ · d₂ / 2"], ["trapetsiya:  S = (a + b) · h / 2", "трапеция:  S = (a + b) · h / 2"]],
  },
  "Yuzga doir masalalar": {
    q: ["Avval shaklni aniqlang, keyin uning formulasini qo'llang.", "Сначала определите фигуру, затем примените её формулу."],
    f: [["to'g'ri to'rtburchak:  S = a · b", "прямоугольник:  S = a · b"], ["uchburchak:  S = a · h / 2", "треугольник:  S = a · h / 2"],
      ["romb:  S = d₁ · d₂ / 2", "ромб:  S = d₁ · d₂ / 2"], ["trapetsiya:  S = (a + b) · h / 2", "трапеция:  S = (a + b) · h / 2"]],
  },
  "Ichki chizilgan burchak": {
    q: ["Ichki chizilgan burchak o'zi tiralgan yoyning yarmiga teng; markaziy burchak esa yoyning o'ziga teng.",
      "Вписанный угол равен половине дуги, на которую опирается; центральный угол равен самой дуге."],
    f: [["ichki chizilgan = yoy / 2", "вписанный = дуга / 2"], ["markaziy = yoy", "центральный = дуга"]],
  },
  "Diametrga tiralgan burchak": {
    q: ["Diametrga tiralgan ichki chizilgan burchak doim 90°.", "Вписанный угол, опирающийся на диаметр, всегда 90°."],
    f: ["∠C = 90°"],
    e: ["Savoldagi boshqa burchak — chalg'itish: C dagi burchak baribir 90°.",
      "Другой угол в условии — отвлекающий: угол при C всё равно 90°."],
  },

  /* ═══════════════════════ 9-sinf algebra ═══════════════════════ */
  "Tarmoqlar yo'nalishi": {
    q: ["y = ax² + bx + c da a > 0 bo'lsa tarmoqlar yuqoriga, a < 0 bo'lsa pastga qaraydi.",
      "В y = ax² + bx + c при a > 0 ветви направлены вверх, при a < 0 — вниз."],
    f: ["a > 0  →  ∪,     a < 0  →  ∩"],
  },
  "Parabola uchi": {
    q: ["Uchining abssissasi formuladan, ordinatasi esa shu x ni funksiyaga qo'yib topiladi.",
      "Абсцисса вершины находится по формуле, ордината — подстановкой этого x в функцию."],
    f: ["x₀ = −b / 2a", "y₀ = y(x₀)"],
    e: ["Ishoraga e'tibor: y = x² − 2x + 9 da x₀ = −(−2)/2 = 1.", "Следите за знаком: для y = x² − 2x + 9 x₀ = −(−2)/2 = 1."],
  },
  "Kvadrat funksiya va grafigi": {
    q: ["Grafik — parabola: a > 0 da tarmoqlar yuqoriga, a < 0 da pastga. Uchining abssissasi formuladan topiladi.",
      "График — парабола: при a > 0 ветви вверх, при a < 0 вниз. Абсцисса вершины — по формуле."],
    f: ["x₀ = −b / 2a", "y₀ = y(x₀)"],
  },
  "Funksiya qiymati": {
    q: ["x o'rniga berilgan sonni qo'ying; manfiy sonni qavsga oling.", "Подставьте число вместо x; отрицательное число берите в скобки."],
    f: ["y = x² − 3x − 4,   x = −3:   9 + 9 − 4 = 14"],
    e: ["(−3)² = 9, lekin −3² = −9 — qavs muhim.", "(−3)² = 9, но −3² = −9 — скобки важны."],
  },
  "Funksiyaning nollari": {
    q: ["Nollar — y = 0 bo'ladigan x lar, ya'ni kvadrat tenglamaning ildizlari.", "Нули — значения x, при которых y = 0, то есть корни квадратного уравнения."],
    f: ["ax² + bx + c = 0", "x₁ + x₂ = −b/a,   x₁ · x₂ = c/a"],
  },
  "Kvadrat tengsizlik": {
    q: ["Ildizlarni toping. a > 0 bo'lsa, ifoda ildizlar ORASIDA manfiy, tashqarida musbat.",
      "Найдите корни. При a > 0 выражение отрицательно МЕЖДУ корнями и положительно снаружи."],
    f: ["x² + 4x − 5 < 0   ⇒   −5 < x < 1", ["> 0 bo'lsa:   x < x₁  yoki  x > x₂", "если > 0:   x < x₁  или  x > x₂"]],
    e: ["\"< 0\" — ildizlar orasi, \"> 0\" — tashqarisi. Adashtirish eng ko'p ball yo'qotadi.",
      "\"< 0\" — между корнями, \"> 0\" — снаружи. Путаница здесь стоит больше всего баллов."],
  },
  "Aniqlanish sohasi": {
    q: ["Maxraj nolga teng bo'lmasligi, juft darajali ildiz ostidagi ifoda manfiy bo'lmasligi kerak.",
      "Знаменатель не равен нулю, подкоренное выражение корня чётной степени неотрицательно."],
    f: ["y = 1 / (x + 6):   x ≠ −6", "y = √(x − 2):   x ≥ 2"],
  },
  "Juft va toq funksiyalar": {
    q: ["f(−x) = f(x) bo'lsa juft (grafigi Oy ga simmetrik), f(−x) = −f(x) bo'lsa toq (koordinata boshiga simmetrik).",
      "Если f(−x) = f(x) — чётная (симметрична относительно Oy), если f(−x) = −f(x) — нечётная (симметрична относительно начала координат)."],
    f: [["juft:  x², x⁴, |x|, cos x", "чётные:  x², x⁴, |x|, cos x"], ["toq:  x, x³, sin x, tg x", "нечётные:  x, x³, sin x, tg x"]],
  },
  "Chiziqli sistemalar": {
    q: ["Qo'shish usuli: tenglamalarni qo'shganda yoki ayirganda bitta noma'lum yo'qolsin.",
      "Метод сложения: при сложении или вычитании уравнений одно неизвестное должно исчезнуть."],
    f: ["2x + 5y = 42,   4x − 5y = −6   ⇒   6x = 36   ⇒   x = 6"],
    e: ["Topilgan juftlikni IKKALA tenglamaga qo'yib tekshiring.", "Проверьте найденную пару в ОБОИХ уравнениях."],
  },
  "Sistemalarni yechish usullari": {
    q: ["O'rniga qo'yish: bitta tenglamadan x yoki y ni ifodalab, ikkinchisiga qo'ying. Qo'shish: koeffitsiyentlarni tenglab, tenglamalarni qo'shing yoki ayiring.",
      "Подстановка: выразите x или y из одного уравнения и подставьте в другое. Сложение: уравняйте коэффициенты и сложите или вычтите уравнения."],
    f: ["3x + y = 16  ⇒  y = 16 − 3x"],
    e: ["Topilgan juftlikni IKKALA tenglamaga qo'yib tekshiring.", "Проверьте найденную пару в ОБОИХ уравнениях."],
  },
  "Radian o'lchovi": {
    q: ["π radian — 180°. Radiandan gradusga o'tish uchun π o'rniga 180° qo'yiladi.",
      "π радиан — это 180°. Чтобы перейти от радианов к градусам, вместо π подставляют 180°."],
    f: ["π rad = 180°", "π/6 = 30°,   π/4 = 45°,   π/3 = 60°,   π/2 = 90°"],
  },
  "Choraklar bo'yicha ishoralar": {
    q: ["I chorakda hammasi musbat; II da faqat sinus; III da faqat tangens; IV da faqat kosinus.",
      "В I четверти всё положительно; во II — только синус; в III — только тангенс; в IV — только косинус."],
    f: ["I: 0°–90°   II: 90°–180°   III: 180°–270°   IV: 270°–360°"],
    e: ["tg 345°: 345° IV chorakda, u yerda tangens manfiy.", "tg 345°: 345° в IV четверти, там тангенс отрицателен."],
  },
  "Asosiy trigonometrik ayniyat": {
    q: ["Bitta burchakning sinusi va kosinusi kvadratlari yig'indisi 1 ga teng.", "Сумма квадратов синуса и косинуса одного угла равна 1."],
    f: ["sin²α + cos²α = 1", "cos α = √(1 − sin²α)", "sin α = 3/5   ⇒   cos α = 4/5"],
    e: ["Ildiz ishorasi chorakka qarab tanlanadi: 0° < α < 90° da musbat.", "Знак корня выбирается по четверти: при 0° < α < 90° — плюс."],
  },
  "Keltirish formulalari": {
    q: ["180° ± α va 360° − α da funksiya nomi saqlanadi; 90° ± α va 270° ± α da nom almashadi (sin ↔ cos). Ishora — boshlang'ich funksiyaning shu chorakdagi ishorasi.",
      "Для 180° ± α и 360° − α название функции сохраняется; для 90° ± α и 270° ± α меняется (sin ↔ cos). Знак — знак исходной функции в этой четверти."],
    f: ["sin(180° − α) = sin α", "cos(180° − α) = −cos α", "sin(90° − α) = cos α"],
  },
  "Trigonometrik ayniyatlar": {
    q: ["Asosiy ayniyat va keltirish formulalari — trigonometriyaning hamma misoli shularga tayanadi.",
      "Основное тождество и формулы приведения — на них опираются все задачи по тригонометрии."],
    f: ["sin²α + cos²α = 1", "sin(180° − α) = sin α", "cos(180° − α) = −cos α"],
  },
  "Qo'shish formulalari": {
    q: ["Ikki burchak yig'indisi yoki ayirmasining sinus va kosinusi.", "Синус и косинус суммы и разности двух углов."],
    f: ["sin(α ± β) = sin α cos β ± cos α sin β", "cos(α ± β) = cos α cos β ∓ sin α sin β"],
    e: ["Kosinusda ishora teskari: cos(α + β) da minus.", "У косинуса знак обратный: в cos(α + β) стоит минус."],
  },
  "Ikkilangan burchak": {
    q: ["Qo'shish formulalarida β = α deb olinsa chiqadi.", "Получаются из формул сложения при β = α."],
    f: ["sin 2α = 2 sin α cos α", "cos 2α = cos²α − sin²α = 1 − 2sin²α"],
  },
  "Sonli ketma-ketliklar": {
    q: ["aₙ formulasiga n ning qiymatini qo'yib, istalgan hadni topamiz.", "Подставляя n в формулу aₙ, находим любой член."],
    f: ["aₙ = 5n + 5,   n = 6:   a₆ = 35"],
  },
  "Arifmetik progressiya hadi": {
    q: ["Har bir had oldingisiga d qo'shib hosil qilinadi.", "Каждый член получается прибавлением d к предыдущему."],
    f: ["aₙ = a₁ + (n − 1)d"],
    e: ["(n − 1), n emas: a₁₈ uchun d 17 marta qo'shiladi.", "(n − 1), а не n: для a₁₈ d прибавляется 17 раз."],
  },
  "Arifmetik progressiya yig'indisi": {
    q: ["Birinchi va oxirgi had yig'indisining yarmi hadlar soniga ko'paytiriladi.", "Полусумма первого и последнего членов умножается на их количество."],
    f: ["Sₙ = (a₁ + aₙ) · n / 2", "Sₙ = (2a₁ + (n − 1)d) · n / 2"],
  },
  "Geometrik progressiya hadi": {
    q: ["Har bir had oldingisini q ga ko'paytirib hosil qilinadi.", "Каждый член получается умножением предыдущего на q."],
    f: ["bₙ = b₁ · qⁿ⁻¹"],
    e: ["b₆ = 2 · 3⁵ = 486 — daraja n − 1 = 5, 6 emas.", "b₆ = 2 · 3⁵ = 486 — показатель n − 1 = 5, а не 6."],
  },
  "Geometrik progressiya yig'indisi": {
    q: ["Birinchi n ta had yig'indisi (q ≠ 1).", "Сумма первых n членов (q ≠ 1)."],
    f: ["Sₙ = b₁(qⁿ − 1) / (q − 1)"],
  },
  "Cheksiz kamayuvchi progressiya": {
    q: ["|q| < 1 bo'lsa, hadlar nolga intiladi va yig'indi chekli.", "При |q| < 1 члены стремятся к нулю, и сумма конечна."],
    f: ["S = b₁ / (1 − q),   |q| < 1", "b₁ = 6,  q = 1/3:   6 / (2/3) = 9"],
  },
  "Arifmetik va geometrik progressiyalar": {
    q: ["Arifmetikda har bir hadga d qo'shiladi, geometrikda q ga ko'paytiriladi.", "В арифметической к каждому члену прибавляют d, в геометрической — умножают на q."],
    f: ["aₙ = a₁ + (n − 1)d", "bₙ = b₁ · qⁿ⁻¹"],
  },
  "Hodisaning ehtimolligi": {
    q: ["Qulay hollar sonini barcha teng imkoniyatli hollar soniga bo'lamiz.", "Число благоприятных исходов делим на число всех равновозможных исходов."],
    f: ["P = m / n"],
    e: ["Ehtimollik 0 va 1 orasida; javobni qisqartiring: 8/16 = 1/2.", "Вероятность от 0 до 1; сокращайте ответ: 8/16 = 1/2."],
  },
  "Nisbiy chastota": {
    q: ["n ta tajribada hodisa m marta ro'y bergan bo'lsa, nisbiy chastota m / n.", "Если в n опытах событие произошло m раз, относительная частота равна m / n."],
    f: ["W = m / n", "m = 12,  n = 50:   0,24"],
  },

  /* ═══════════════════════ 9-sinf geometriya ═══════════════════════ */
  "O'xshashlik koeffitsiyenti": {
    q: ["O'xshash shakllarning mos tomonlari nisbati bir xil — shu son k.", "Отношение соответствующих сторон подобных фигур одинаково — это число k."],
    f: ["k = A₁B₁ / AB"],
  },
  "O'xshash uchburchak tomonlari": {
    q: ["Mos tomonlar proporsional: bitta juftdan k ni toping, qolganini k ga ko'paytiring.",
      "Соответствующие стороны пропорциональны: найдите k по одной паре, остальные умножьте на k."],
    f: ["A₁B₁/AB = B₁C₁/BC = A₁C₁/AC = k"],
  },
  "O'xshash shakllar yuzi": {
    q: ["O'xshash shakllar yuzlarining nisbati koeffitsiyentning kvadratiga teng.", "Отношение площадей подобных фигур равно квадрату коэффициента."],
    f: ["S₁ / S₂ = k²"],
    e: ["Tomonlar 4 marta katta — yuz 16 marta, perimetr esa 4 marta.", "Стороны больше в 4 раза — площадь в 16 раз, а периметр в 4 раза."],
  },
  "O'xshashlik alomatlari": {
    q: ["Ikki burchagi teng; yoki ikki tomoni proporsional va ular orasidagi burchak teng; yoki uch tomoni proporsional bo'lsa — uchburchaklar o'xshash.",
      "Треугольники подобны, если равны два угла; или две стороны пропорциональны и углы между ними равны; или три стороны пропорциональны."],
    f: ["A₁B₁/AB = B₁C₁/BC = k"],
  },
  "Yuzni sinus orqali hisoblash": {
    q: ["Ikki tomon va ular orasidagi burchak ma'lum bo'lsa:", "Если известны две стороны и угол между ними:"],
    f: ["S = ½ · a · b · sin C"],
    e: ["sin 150° = sin 30° = 1/2.", "sin 150° = sin 30° = 1/2."],
  },
  "Sinuslar teoremasi": {
    q: ["Tomonlar qarshisidagi burchaklar sinuslariga proporsional.", "Стороны пропорциональны синусам противолежащих углов."],
    f: ["a / sin A = b / sin B = c / sin C = 2R"],
  },
  "Kosinuslar teoremasi": {
    q: ["Pifagor teoremasining istalgan uchburchak uchun umumlashmasi.", "Обобщение теоремы Пифагора на любой треугольник."],
    f: ["c² = a² + b² − 2ab · cos C"],
    e: ["cos 120° = −1/2, shuning uchun minus plyusga aylanadi: 9 + 9 + 9 = 27.",
      "cos 120° = −1/2, поэтому минус превращается в плюс: 9 + 9 + 9 = 27."],
  },
  "Uchburchaklarni yechish": {
    q: ["Tomon va ikki burchak — sinuslar teoremasi; ikki tomon va orasidagi burchak — kosinuslar teoremasi.",
      "Сторона и два угла — теорема синусов; две стороны и угол между ними — теорема косинусов."],
    f: ["a / sin A = b / sin B", "c² = a² + b² − 2ab · cos C"],
  },
  "Sinuslar va kosinuslar teoremasi": {
    q: ["Tomon va ikki burchak — sinuslar teoremasi; ikki tomon va orasidagi burchak — kosinuslar teoremasi.",
      "Сторона и два угла — теорема синусов; две стороны и угол между ними — теорема косинусов."],
    f: ["a / sin A = b / sin B = c / sin C = 2R", "c² = a² + b² − 2ab · cos C"],
  },
  "Muntazam ko'pburchaklar": {
    q: ["Muntazam ko'pburchakning hamma burchaklari teng: ichki burchaklar yig'indisini n ga bo'lamiz.",
      "У правильного многоугольника все углы равны: сумму внутренних углов делим на n."],
    f: ["α = (n − 2) · 180° / n", "n = 8:   6 · 180° / 8 = 135°"],
  },
  "Aylana uzunligi": {
    q: ["Aylana uzunligi radiusga proporsional.", "Длина окружности пропорциональна радиусу."],
    f: ["C = 2πR = πd", "π ≈ 3,14"],
  },
  "Yoy uzunligi": {
    q: ["n° li yoy — butun aylananing n/360 qismi.", "Дуга в n° — это n/360 часть окружности."],
    f: ["l = πRn / 180"],
  },
  "Sektor yuzi": {
    q: ["n° li sektor — butun doiraning n/360 qismi.", "Сектор в n° — это n/360 часть круга."],
    f: ["S = πR²n / 360"],
  },
  "Proporsional kesmalar": {
    q: ["To'g'ri burchakli uchburchakda gipotenuzaga tushirilgan balandlik ikki proyeksiyaning o'rta proporsionali.",
      "В прямоугольном треугольнике высота к гипотенузе — среднее пропорциональное проекций катетов."],
    f: ["h² = p · q", "p = 2,  q = 8:   h = √16 = 4"],
  },

  /* ═══════════════════════ 10-sinf algebra ═══════════════════════ */
  "Murakkab funksiya": {
    q: ["f(g(x)) da avval ichki funksiya g(x) hisoblanadi, natija tashqi f ga qo'yiladi.",
      "В f(g(x)) сначала считается внутренняя функция g(x), результат подставляется во внешнюю f."],
    f: ["g(−4) = 4 · (−4) + 6 = −10,   f(−10) = 100"],
    e: ["Tartib muhim: f(g(x)) va g(f(x)) odatda har xil.", "Порядок важен: f(g(x)) и g(f(x)) обычно различны."],
  },
  "Teskari funksiya": {
    q: ["y = f(x) dan x ni y orqali ifodalang, so'ng x va y ni almashtiring.", "Выразите x через y из y = f(x), затем поменяйте x и y местами."],
    f: ["y = 5x − 3   ⇒   x = (y + 3) / 5   ⇒   y = (x + 3) / 5"],
  },
  "Davriy funksiyalar": {
    q: ["Davr — funksiya qiymatlari takrorlanadigan eng kichik musbat son.", "Период — наименьшее положительное число, через которое значения повторяются."],
    f: ["sin x, cos x:   T = 2π", "tg x:   T = π", "sin kx:   T = 2π / |k|"],
  },
  "Ratsional tenglamalar": {
    q: ["Ikki tomonni maxrajga ko'paytiring, hosil bo'lgan tenglamani yeching va maxrajni nolga aylantiradigan ildizni tashlang.",
      "Умножьте обе части на знаменатель, решите полученное уравнение и отбросьте корни, обращающие знаменатель в ноль."],
    f: ["25 / (x + 2) = 5   ⇒   x + 2 = 5   ⇒   x = 3"],
  },
  "Irratsional tenglamalar": {
    q: ["Ikki tomonni kvadratga ko'taring va javobni ALBATTA tekshiring — kvadratga ko'tarish chet ildiz qo'shishi mumkin.",
      "Возведите обе части в квадрат и ОБЯЗАТЕЛЬНО проверьте ответ — возведение в квадрат может дать посторонние корни."],
    f: ["√(x + 4) = 5   ⇒   x + 4 = 25   ⇒   x = 21"],
  },
  "Ratsional tengsizliklar": {
    q: ["Intervallar usuli: nollarni son o'qiga qo'ying va har bir oraliqda ishorani aniqlang.",
      "Метод интервалов: отметьте нули на прямой и определите знак на каждом промежутке."],
    f: ["(x − a)(x − b) < 0   ⇒   a < x < b   (a < b)"],
  },
  "Ko'rsatkichli tenglamalar": {
    q: ["Ikki tomonni bir xil asosga keltiring, keyin ko'rsatkichlarni tenglang.", "Приведите обе части к одному основанию и приравняйте показатели."],
    f: ["aˣ = aᵇ   ⇒   x = b", "5ˣ = 25 = 5²   ⇒   x = 2"],
  },
  "Logarifm tushunchasi": {
    q: ["logₐ b — a ni qaysi darajaga ko'tarsak b chiqishi.", "logₐ b — показатель степени, в которую надо возвести a, чтобы получить b."],
    f: ["logₐ b = c   ⇔   aᶜ = b", "a > 0,  a ≠ 1,  b > 0", "log₂ 8 = 3"],
  },
  "Logarifm xossalari": {
    q: ["Ko'paytmaning logarifmi — logarifmlar yig'indisi, bo'linmaniki — ayirmasi, darajaniki — ko'rsatkich marta.",
      "Логарифм произведения — сумма логарифмов, частного — разность, степени — показатель, умноженный на логарифм."],
    f: ["logₐ(xy) = logₐx + logₐy", "logₐ(x/y) = logₐx − logₐy", "logₐ(xⁿ) = n · logₐx"],
    e: ["log(a + b) uchun bunday formula yo'q.", "Для log(a + b) такой формулы нет."],
  },
  "Logarifmik tenglamalar": {
    q: ["Logarifm ta'rifidan foydalaning: logarifmdan darajaga o'ting.", "Используйте определение: перейдите от логарифма к степени."],
    f: ["logₐ x = c   ⇒   x = aᶜ", "log₃ x = 3   ⇒   x = 27"],
    e: ["Logarifm ostidagi ifoda musbat bo'lishi shart — javobni tekshiring.", "Выражение под логарифмом должно быть положительным — проверьте ответ."],
  },
  "Ko'rsatkichli tengsizliklar": {
    q: ["Bir xil asosga keltiring. Asos 1 dan katta bo'lsa belgi saqlanadi, 0 va 1 orasida bo'lsa teskari o'giriladi.",
      "Приведите к одному основанию. Если основание больше 1, знак сохраняется; если между 0 и 1 — меняется."],
    f: ["3ˣ > 27 = 3³   ⇒   x > 3", "(1/2)ˣ > (1/2)³   ⇒   x < 3"],
  },
  "Murakkab foiz": {
    q: ["Foiz har yili YANGI summaga hisoblanadi.", "Процент каждый год начисляется на НОВУЮ сумму."],
    f: ["S = S₀ · (1 + p/100)ⁿ", "2 000 000 · 1,2 · 1,2 = 2 880 000"],
    e: ["Oddiy foiz bilan adashtirmang: 20% + 20% ≠ 40%.", "Не путайте с простыми процентами: 20% + 20% ≠ 40%."],
  },
  "Sodda trigonometrik tenglamalar": {
    q: ["Yechim bitta son emas, cheksiz ko'p sonlar oilasi — oxiriga davr qo'shiladi.",
      "Решение — не одно число, а бесконечное семейство: в конце добавляется период."],
    f: ["sin x = 0:  x = πn,   sin x = 1:  x = π/2 + 2πn", "cos x = 0:  x = π/2 + πn,   cos x = 1:  x = 2πn",
      "cos x = a:  x = ±arccos a + 2πn", "tg x = a:  x = arctg a + πn"],
  },
  "Trigonometrik qiymatlar": {
    q: ["30°, 45°, 60° qiymatlari jadvalini yod bilish kerak.", "Значения для 30°, 45°, 60° нужно знать наизусть."],
    f: JADVAL,
  },
  "Yechish usullari": {
    q: ["Tenglamani ayniyatlar yoki almashtirish bilan sodda ko'rinishga keltiring, keyin sodda tenglama formulasini qo'llang.",
      "Приведите уравнение к простейшему с помощью тождеств или замены, затем примените формулу простейшего уравнения."],
    f: ["sin x = 0:  x = πn", "cos x = 0:  x = π/2 + πn", "tg x = a:  x = arctg a + πn"],
  },
  "Ehtimollik ta'riflari": {
    q: ["Klassik ta'rif — qulay hollar / barcha hollar. Mustaqil hodisalarning birga ro'y berish ehtimoli ko'paytiriladi.",
      "Классическое определение — благоприятные / все исходы. Вероятности независимых событий перемножаются."],
    f: ["P = m / n", "P(AB) = P(A) · P(B)", ["4 ta tangada 4 gerb:  (1/2)⁴ = 1/16", "4 монеты, 4 герба:  (1/2)⁴ = 1/16"]],
  },

  /* ═══════════════════════ 10-sinf geometriya ═══════════════════════ */
  "Uchburchak va to'rtburchaklar": {
    q: ["Uchburchak burchaklari yig'indisi 180°, to'rtburchakniki 360°.", "Сумма углов треугольника 180°, четырёхугольника — 360°."],
    f: ["∠A + ∠B + ∠C = 180°", ["parallelogramm:  ∠A + ∠B = 180°", "параллелограмм:  ∠A + ∠B = 180°"]],
  },
  "Yuz va aylana": {
    q: ["Asosiy yuz formulalari va doira.", "Основные формулы площади и круг."],
    f: [["to'g'ri to'rtburchak:  S = a · b", "прямоугольник:  S = a · b"], ["uchburchak:  S = a · h / 2", "треугольник:  S = a · h / 2"], "C = 2πR,   S = πR²"],
  },
  "Fazoda to'g'ri chiziqlar joylashuvi": {
    q: ["Fazoda ikki to'g'ri chiziq: kesishuvchi (bitta umumiy nuqta), parallel (bir tekislikda, umumiy nuqtasi yo'q) yoki ayqash (bir tekislikda yotmaydi).",
      "Две прямые в пространстве: пересекающиеся (одна общая точка), параллельные (в одной плоскости, общих точек нет) или скрещивающиеся (не лежат в одной плоскости)."],
    e: ["Umumiy nuqtasi yo'q — hali parallel degani emas: bir tekislikda yotmasa, ayqash.",
      "Нет общих точек — ещё не значит параллельны: если не в одной плоскости, то скрещиваются."],
  },
  "Ayqash to'g'ri chiziqlar": {
    q: ["Ayqash to'g'ri chiziqlar bir tekislikda yotmaydi va kesishmaydi. Bir tekislikda yotib kesishmasa — parallel, bitta umumiy nuqtasi bo'lsa — kesishuvchi.",
      "Скрещивающиеся прямые не лежат в одной плоскости и не пересекаются. В одной плоскости без общих точек — параллельные, с одной общей точкой — пересекающиеся."],
  },
  "Tekisliklarning o'zaro joylashuvi": {
    q: ["Ikki tekislik yo parallel (umumiy nuqtasi yo'q), yo to'g'ri chiziq bo'ylab kesishadi.",
      "Две плоскости либо параллельны (нет общих точек), либо пересекаются по прямой."],
  },
  "Ko'pyoqlar va ularning elementlari": {
    q: ["n burchakli prizmada yoqlar n + 2, uchlar 2n, qirralar 3n. n burchakli piramidada yoqlar n + 1, uchlar n + 1, qirralar 2n.",
      "У n-угольной призмы граней n + 2, вершин 2n, рёбер 3n. У n-угольной пирамиды граней n + 1, вершин n + 1, рёбер 2n."],
    f: [["uchburchakli prizma:  Y = 5,  U = 6,  Q = 9", "треугольная призма:  Г = 5,  В = 6,  Р = 9"]],
  },
  "Eyler formulasi": {
    q: ["Har qanday qavariq ko'pyoqda uchlar, qirralar va yoqlar soni bog'langan.", "У любого выпуклого многогранника число вершин, рёбер и граней связано."],
    f: [["U − Q + Y = 2   (uchlar − qirralar + yoqlar)", "В − Р + Г = 2   (вершины − рёбра + грани)"]],
  },
  "Fazoda ikki nuqta orasidagi masofa": {
    q: ["Tekislikdagi formulaga uchinchi koordinata qo'shiladi.", "К формуле на плоскости добавляется третья координата."],
    f: ["d = √((x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²)"],
  },
  "Parallelepipedning diagonali": {
    q: ["To'g'ri burchakli parallelepiped diagonalining kvadrati uchala o'lchov kvadratlarining yig'indisi.",
      "Квадрат диагонали прямоугольного параллелепипеда равен сумме квадратов трёх измерений."],
    f: ["d = √(a² + b² + c²)", "2, 3, 6:   √(4 + 9 + 36) = 7"],
  },
  "Fazoviy vektorlar": {
    q: ["Fazoviy vektor uzunligi uchala koordinata kvadratlari yig'indisining ildizi.", "Длина вектора в пространстве — корень из суммы квадратов трёх координат."],
    f: ["|a⃗| = √(x² + y² + z²)", "a⃗(−2; 3; 6):   √49 = 7"],
  },
  "Fazoda vektorlar": {
    q: ["Fazoviy vektor uzunligi uchala koordinata kvadratlari yig'indisining ildizi.", "Длина вектора в пространстве — корень из суммы квадратов трёх координат."],
    f: ["|a⃗| = √(x² + y² + z²)", "a⃗(−1; 2; 2):   √9 = 3"],
  },

  /* ═══════════════════════ 11-sinf ═══════════════════════ */
  "Limit haqida tushuncha": {
    q: ["Uzluksiz funksiyada x → a bo'lganda limit f(a) ga teng — sonni qo'yish yetarli.",
      "Для непрерывной функции предел при x → a равен f(a) — достаточно подставить число."],
    f: ["lim (3x + 4),  x → 4   =   3 · 4 + 4 = 16"],
    e: ["0/0 chiqsa — avval ifodani soddalashtiring (ko'paytuvchilarga ajrating).", "Если получилось 0/0 — сначала упростите выражение (разложите на множители)."],
  },
  "Darajaning hosilasi": {
    q: ["Ko'rsatkich oldinga tushadi, daraja bittaga kamayadi.", "Показатель выносится вперёд, степень уменьшается на единицу."],
    f: ["(xⁿ)′ = n · xⁿ⁻¹", "(8x⁵)′ = 40x⁴"],
  },
  "Ko'phadning hosilasi": {
    q: ["Har bir hadning hosilasi alohida olinadi; o'zgarmas sonning hosilasi 0.", "Производная берётся от каждого члена отдельно; производная константы равна 0."],
    f: ["(u + v)′ = u′ + v′", "(kx)′ = k,   (c)′ = 0", "(5x² + 2x − 7)′ = 10x + 2"],
  },
  "Hosilalar jadvali": {
    q: ["Asosiy funksiyalarning hosilalarini yod bilish kerak.", "Производные основных функций нужно знать наизусть."],
    f: ["(√x)′ = 1 / (2√x)", "(sin x)′ = cos x,   (cos x)′ = −sin x", "(eˣ)′ = eˣ,   (ln x)′ = 1/x"],
  },
  "Nuqtadagi hosila": {
    q: ["Avval hosilani toping, keyin x₀ ni qo'ying.", "Сначала найдите производную, затем подставьте x₀."],
    f: ["y = 2x² + 8x   ⇒   y′ = 4x + 8   ⇒   y′(2) = 16"],
  },
  "Urinmaning burchak koeffitsiyenti": {
    q: ["Urinmaning burchak koeffitsiyenti — urinish nuqtasidagi hosila qiymati.", "Угловой коэффициент касательной — значение производной в точке касания."],
    f: ["k = f′(x₀)", "y = f(x₀) + f′(x₀)(x − x₀)"],
  },
  "Ekstremum nuqtalari": {
    q: ["y′ = 0 bo'ladigan nuqtalarni toping. Hosila ishorasi + dan − ga o'tsa maksimum, − dan + ga o'tsa minimum.",
      "Найдите точки, где y′ = 0. Если знак производной меняется с + на − — максимум, с − на + — минимум."],
    f: ["y′ = 0", ["parabolada:  x₀ = −b / 2a", "у параболы:  x₀ = −b / 2a"]],
  },
  "O'sish va kamayish oraliqlari": {
    q: ["y′ > 0 bo'lgan joyda funksiya o'sadi, y′ < 0 bo'lgan joyda kamayadi.", "Где y′ > 0, функция возрастает; где y′ < 0 — убывает."],
    f: ["y = 2x² + 16x   ⇒   y′ = 4x + 16 > 0   ⇒   x > −4"],
  },
  "Ekstremal masalalar": {
    q: ["Eng katta yoki eng kichik qiymat hosila nolga teng bo'lgan nuqtada (yoki kesma uchlarida) bo'ladi.",
      "Наибольшее или наименьшее значение достигается в точке, где производная равна нулю (или на концах отрезка)."],
    f: ["y′ = 0", ["parabolada:  x₀ = −b / 2a", "у параболы:  x₀ = −b / 2a"]],
  },
  "Boshlang'ich funksiya": {
    q: ["F′(x) = f(x) bo'lsa, F — f ning boshlang'ichi. Oxiriga + C yoziladi.", "Если F′(x) = f(x), то F — первообразная f. В конце пишется + C."],
    f: ["∫xⁿ dx = xⁿ⁺¹ / (n + 1) + C", "∫x dx = x² / 2 + C"],
  },
  "Integrallar jadvali": {
    q: ["Hosilalar jadvalini teskari o'qish.", "Таблица производных, прочитанная наоборот."],
    f: ["∫eˣ dx = eˣ + C", "∫cos x dx = sin x + C,   ∫sin x dx = −cos x + C", "∫dx / x = ln|x| + C"],
  },
  "Aniq integral. Nyuton–Leybnis": {
    q: ["Boshlang'ich funksiyaning yuqori va quyi chegaradagi qiymatlari ayirmasi.", "Разность значений первообразной на верхнем и нижнем пределах."],
    f: ["∫ₐᵇ f(x) dx = F(b) − F(a)", "∫₀³ x² dx = 27/3 − 0 = 9"],
    e: ["Aniq integralda + C yozilmaydi — u ayirishda qisqarib ketadi.", "В определённом интеграле + C не пишут — оно сокращается."],
  },
  "Egri chiziqli trapetsiya yuzi": {
    q: ["y = f(x) grafigi, Ox o'qi va x = a, x = b to'g'ri chiziqlari bilan chegaralangan yuz — aniq integral.",
      "Площадь, ограниченная графиком y = f(x), осью Ox и прямыми x = a, x = b, — определённый интеграл."],
    f: ["S = ∫ₐᵇ f(x) dx", "y = x,  0 … 5:   25/2 = 12,5"],
  },
  "Prizma hajmi": {
    q: ["Asos yuzi balandlikka ko'paytiriladi.", "Площадь основания умножается на высоту."],
    f: ["V = S(asos) · h"],
  },
  "Parallelepiped hajmi va sirti": {
    q: ["Hajm — uchala o'lchov ko'paytmasi, sirt — oltita yoq yuzlarining yig'indisi.", "Объём — произведение трёх измерений, поверхность — сумма площадей шести граней."],
    f: ["V = a · b · c", "S = 2(ab + bc + ac)"],
  },
  "Silindr hajmi": {
    q: ["Silindr ham prizma kabi: asos (doira) yuzi balandlikka ko'paytiriladi.", "Цилиндр как призма: площадь основания (круга) умножается на высоту."],
    f: ["V = πr²h", "r = 10,  h = 4:   3,14 · 100 · 4 = 1256"],
  },
  "Silindr sirti": {
    q: ["Yon sirt yoyilsa — to'g'ri to'rtburchak: aylana uzunligi × balandlik.", "Развёртка боковой поверхности — прямоугольник: длина окружности × высота."],
    f: [["S(yon) = 2πrh", "S(бок) = 2πrh"], ["S(to'la) = 2πr(r + h)", "S(полн) = 2πr(r + h)"]],
  },
  "Piramida hajmi": {
    q: ["Uchi bor jismda hajm shu asos va balandlikdagi prizmaning uchdan biriga teng.", "У тела с вершиной объём равен трети объёма призмы с тем же основанием и высотой."],
    f: ["V = S(asos) · h / 3"],
  },
  "Konus hajmi": {
    q: ["Silindr hajmining uchdan biri.", "Треть объёма цилиндра."],
    f: ["V = πr²h / 3"],
  },
  "Konus yon sirti": {
    q: ["Yon sirt radius va yasovchiga bog'liq; yasovchi Pifagor bilan topiladi.", "Боковая поверхность зависит от радиуса и образующей; образующая — по Пифагору."],
    f: [["S(yon) = πrl", "S(бок) = πrl"], "l = √(r² + h²)"],
  },
  "Shar hajmi": {
    q: ["Shar hajmi radiusning kubiga proporsional.", "Объём шара пропорционален кубу радиуса."],
    f: ["V = 4/3 · πR³"],
  },
  "Sfera sirtining yuzi": {
    q: ["Sfera yuzi to'rtta katta doira yuziga teng.", "Площадь сферы равна площади четырёх больших кругов."],
    f: ["S = 4πR²"],
  },
  "Formulalarni tanish": {
    q: ["Jismlarning hajm formulalari: prizma va silindr — asos × balandlik, piramida va konus — uning uchdan biri.",
      "Формулы объёмов: призма и цилиндр — основание × высота, пирамида и конус — треть от этого."],
    f: [["prizma:  V = S · h", "призма:  V = S · h"], ["silindr:  V = πr²h", "цилиндр:  V = πr²h"], ["piramida:  V = S · h / 3", "пирамида:  V = S · h / 3"],
      ["konus:  V = πr²h / 3", "конус:  V = πr²h / 3"], ["shar:  V = 4/3 · πR³", "шар:  V = 4/3 · πR³"]],
  },
  "Kombinatsiyalar": {
    q: ["n ta narsadan k tasini tartibsiz tanlash usullari soni.", "Число способов выбрать k предметов из n без учёта порядка."],
    f: ["Cₙᵏ = n! / (k!(n − k)!)", "C₅³ = 10"],
    e: ["Tartib muhim bo'lmasa — kombinatsiya, muhim bo'lsa — o'rinlashtirish.", "Порядок не важен — сочетания, важен — размещения."],
  },
  "Nyuton binomi": {
    q: ["(a + b)ⁿ yoyilmasidagi koeffitsiyentlar — kombinatsiyalar (Paskal uchburchagi).", "Коэффициенты разложения (a + b)ⁿ — сочетания (треугольник Паскаля)."],
    f: ["(a + b)ⁿ = Σ Cₙᵏ aⁿ⁻ᵏ bᵏ", ["k-had koeffitsiyenti = Cₙᵏ⁻¹", "коэффициент k-го члена = Cₙᵏ⁻¹"]],
    e: ["4-had uchun k − 1 = 3: C₆³ = 20.", "Для 4-го члена k − 1 = 3: C₆³ = 20."],
  },
  "Ehtimollik": {
    q: ["Qulay hollar sonini barcha teng imkoniyatli hollar soniga bo'lamiz.", "Число благоприятных исходов делим на число всех равновозможных исходов."],
    f: ["P = m / n", ["kubik:  n = 6", "кубик:  n = 6"]],
  },
  "O'rtacha kvadratik chetlanish": {
    q: ["Sonlar o'rtachadan qanchalik tarqoq ekanini ko'rsatadi: dispersiyaning ildizi.", "Показывает, насколько числа разбросаны относительно среднего: корень из дисперсии."],
    f: ["x̄ = Σxᵢ / n", "D = Σ(xᵢ − x̄)² / n", "σ = √D"],
    e: ["8, 10, 10, 12:  x̄ = 10,  D = 8/4 = 2,  σ = √2 ≈ 1,414.", "8, 10, 10, 12:  x̄ = 10,  D = 8/4 = 2,  σ = √2 ≈ 1,414."],
  },
};

/** Darsning nazariyasi (nomi bo'yicha). Yo'q bo'lsa — `undefined`. */
export const nazariya = (darsNomi: string): Nazariya | undefined => NAZARIYA[darsNomi];
