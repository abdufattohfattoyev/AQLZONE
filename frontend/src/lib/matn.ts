/**
 * Interfeys matnlari — ikki tilda.
 *
 * Bitta joyda turishi ATAYLAB. Ilgari matn komponentlarning ichida
 * yozilgan edi va ikkinchi til qo'shish uchun har bir faylni ochish
 * kerak bo'lardi — o'shanda albatta bir-ikkitasi unutiladi va ekranda
 * ikki til aralashib qoladi. Bu yerda esa yetishmayotgan tarjima
 * DARHOL ko'zga tashlanadi: kalit qatorida bo'sh joy qoladi.
 *
 * Qiymat `[o'zbekcha, ruscha]` juftligi. Ichida `{nom}` ko'rinishidagi
 * o'rin bo'lishi mumkin — `t()` ga obyekt berib to'ldiriladi:
 *
 *     t("nishonHisob", { olingan: 3, jami: 6 })
 *
 * Savol matnlari bu yerda EMAS (`lib/tarjima/savol.ts`), kurs va dars
 * nomlari ham alohida (`lib/tarjima/kurs.ts`): ular boshqa hajmda va
 * boshqa maqsadga xizmat qiladi.
 */
import { til } from "./til";

const S = {
  /* ---------------- umumiy ---------------- */
  ortga: ["Ortga", "Назад"],
  yopish: ["Yopish", "Закрыть"],
  keyingi: ["Keyingi", "Далее"],
  keyinroq: ["Keyinroq", "Позже"],
  bekor: ["Bekor qilish", "Отмена"],
  saqlash: ["Saqlash", "Сохранить"],
  qoshish: ["Qo'shish", "Добавить"],
  davomEtish: ["Davom etish", "Продолжить"],
  boshlash: ["Boshlash", "Начать"],
  yuklanyapti: ["Yuklanyapti…", "Загрузка…"],
  siz: ["siz", "вы"],
  nomalum: ["Noma'lum", "Без имени"],
  dars: ["dars", "урок"],
  darsSoni: ["{n} dars", "{n} ур."],
  yulduzSoni: ["{n} yulduz", "{n} звёзд"],
  bolim: ["bo'lim", "раздел"],
  bolimSoni: ["{n} bo'lim", "разделов: {n}"],
  aloqaYoq: ["Aloqa yo'q — internetni tekshiring", "Нет связи — проверьте интернет"],
  saqlanmadi: ["Saqlanmadi — qaytadan urinib ko'ring", "Не сохранилось — попробуйте снова"],

  /* ---------------- bosh sahifa (Dashboard) ---------------- */
  shior: ["Aql Zone — bilim va o'yin platformasi", "Aql Zone — платформа знаний и игры"],
  kimOynayapti: ["Kim o'ynayapti?", "Кто играет?"],
  reyting: ["Reyting", "Рейтинг"],
  hisobim: ["Hisobim", "Мой профиль"],
  hisobSozlamalari: ["Hisob sozlamalari", "Настройки профиля"],
  oxirgiMarta: ["Oxirgi marta shu yerda edingiz", "В последний раз вы были здесь"],
  maktabgachaBolim: ["Maktabga tayyorgarlik · 4–6 yosh", "Подготовка к школе · 4–6 лет"],
  sinfKurslari: ["Sinf kurslari", "Школьные курсы"],
  kurslarIzoh: [
    "Har bir kurs bolaning yoshiga qarab tuzilgan",
    "Каждый курс составлен по возрасту ребёнка",
  ],

  /* ---------------- kurs sahifasi (Home) ---------------- */
  izohMaktabgacha: ["Maktabga tayyorgarlik", "Подготовка к школе"],
  izohToliqKurs: ["Darslik bo'yicha to'liq kurs", "Полный курс по учебнику"],
  otaOnaPaneli: ["Ota-ona paneli", "Панель для родителей"],
  darsTugallandi: ["{done} / {jami} dars tugallandi", "Уроков пройдено: {done} / {jami}"],
  bobDars: ["{n} dars", "уроков: {n}"],
  bobTugadi: [" · {n} tugadi", " · пройдено: {n}"],
  xatolarDaftari: ["Xatolar daftari", "Тетрадь ошибок"],
  takrorlash: ["Takrorlash", "Повторение"],
  daftarIzoh: [
    "Avval qiynalgan savollaring qaytadi — bu safar yangi sonlar bilan.",
    "Вернутся вопросы, где было трудно — но уже с новыми числами.",
  ],
  daftarKutyapti: [
    "{n} ta savol takrorlashni kutyapti",
    "{n} вопросов ждут повторения",
  ],
  kunlikMaqsad: ["Kunlik maqsad", "Цель на день"],

  /* ---------------- zanjirni tiklash ---------------- */
  zanjirUzildi: ["Zanjiring uzilib qoldi", "Твоя серия прервалась"],
  zanjirTiklaIzoh: [
    "{kunlar} kunlik zanjiringni saqlab qolish mumkin — faqat bugun.",
    "Серию из {kunlar} дн. ещё можно спасти — только сегодня.",
  ],
  zanjirTiklaTugma: ["{narx} tanga — tiklash", "{narx} монет — восстановить"],
  zanjirTangaYoq: [
    "Tanga yetmaydi — sizda {bor} ta",
    "Не хватает монет — у вас {bor}",
  ],
  zanjirTiklandi: ["Zanjiring saqlanib qoldi!", "Серия сохранена!"],

  /* ---------------- qaytganni kutib olish ---------------- */
  qaytishSarlavha: ["Qaytganingizdan xursandmiz!", "Рады снова видеть вас!"],
  qaytishIzoh: [
    "{n} kun ko'rinmadingiz. Yulduzlaringiz joyida — yengil boshlaymiz.",
    "Вас не было {n} дн. Звёзды на месте — начнём с лёгкого.",
  ],

  /* ---------------- kunlik sinov ---------------- */
  sinovSarlavha: ["Bugungi sinov", "Испытание дня"],
  sinovIzoh: ["6 ta savol · tanga ikki barobar", "6 вопросов · монеты вдвое"],
  sinovQolgan: ["{n} soat qoldi", "Осталось {n} ч."],
  sinovBajarildi: ["Bugungi sinov bajarildi", "Испытание дня пройдено"],
  sinovErtaga: ["Ertaga yangisi ochiladi", "Завтра откроется новое"],
  maqsadBajarildi: ["Bugungi maqsad bajarildi!", "Цель на сегодня выполнена!"],
  kun: ["kun", "дн."],

  /* ---------------- pastki panel ---------------- */
  tabBosh: ["Bosh", "Главная"],
  tabDarslar: ["Darslar", "Уроки"],
  tabNishonlar: ["Nishonlar", "Награды"],
  tabDokon: ["Do'kon", "Магазин"],
  tabReyting: ["Reyting", "Рейтинг"],
  // Panelda oltita yozuv bor va eng tor telefon 320px. Ruscha "Родителям"
  // o'sha kenglikda oxirgi harflarini yo'qotardi — "Родители" esa sig'adi
  // va navigatsiya yozuvi sifatida bir xil tushunarli.
  tabOtaOna: ["Ota-ona", "Родители"],

  /* ---------------- dars (Lesson) ---------------- */
  togriJavob: ["To'g'ri! 👏", "Верно! 👏"],
  deyarli: ["Deyarli! Yana urinib ko'r", "Почти! Попробуй ещё"],
  zorIsh: ["Zo'r ish!", "Отличная работа!"],
  natijaSavol: ["SAVOL", "ВОПРОСЫ"],
  natijaTogri: ["TO'G'RI", "ВЕРНО"],
  natijaXato: ["XATO", "ОШИБКИ"],
  natijaAniqlik: ["ANIQLIK", "ТОЧНОСТЬ"],
  xatosizJavob: [
    "Barcha javoblar birinchi urinishda to'g'ri!",
    "Все ответы верны с первой попытки!",
  ],
  yanaOynash: ["Yana o'ynash", "Играть ещё"],
  chiqishSarlavha: ["Darsni tashlab chiqasizmi?", "Выйти из урока?"],
  chiqishIzoh: [
    "Yechilgan {n} ta savol saqlanmaydi — dars boshidan boshlanadi.",
    "Решённые вопросы ({n}) не сохранятся — урок начнётся сначала.",
  ],
  /* Hali bittasi ham yechilmagan, lekin urinilgan holat: son yozish
     ("0 ta savol saqlanmaydi") hech narsani anglatmasdi. */
  chiqishIzohBosh: [
    "Dars faqat oxirigacha yetkazilganda saqlanadi.",
    "Урок сохраняется, только если пройти его до конца.",
  ],
  chiqishDavom: ["Yo'q, davom etaman", "Нет, продолжу"],
  chiqishHa: ["Ha, chiqaman", "Да, выйти"],

  /* ---------------- o'git (Ogit) ---------------- */
  avvalKorsataman: ["Avval ko'rsataman", "Сначала покажу"],
  yanaKorsat: ["Yana ko'rsat", "Показать ещё"],
  boshlaymiz: ["Boshlaymiz!", "Начинаем!"],
  otkazibYuborish: ["O'tkazib yuborish", "Пропустить"],

  /* ---------------- o'git qadamlari ----------------
     `{ta}` — sanoq shakli: o'zbekchada "uchta", ruschada shunchaki "3".
     Ruscha shakl ATAYLAB raqam: "1 предмет", "2 предмета", "5 предметов"
     — otning shakli sonlarga qarab o'zgaradi va qolipda uni to'g'ri
     chiqarib bo'lmaydi. Raqam esa har qanday sonda to'g'ri o'qiladi. */
  ogSanashOraliq: ["{ta}...", "{ta}..."],
  ogSanashOxir: ["Hammasi {ta}!", "Всего {ta}!"],
  ogQoshBor: ["{ta} bor.", "Здесь {ta}."],
  ogQoshYana: [
    'Yana {ta} keldi. Bu "+" belgisi — QO\'SHISH.',
    "Пришло ещё {ta}. Это знак «+» — СЛОЖЕНИЕ.",
  ],
  ogQoshJami: [
    "Endi birga sanaymiz — hammasi {ta} bo'ldi!",
    "Теперь посчитаем вместе — всего стало {ta}!",
  ],
  ogYozilishi: [
    "Yozilishi shunday. Endi o'zing urinib ko'r!",
    "Записывается так. Теперь попробуй сам!",
  ],
  ogAyirBor: ["{ta} bor edi.", "Было {ta}."],
  ogAyirKetdi: [
    '{ta}si ketdi. Bu "−" belgisi — AYIRISH.',
    "Ушло {ta}. Это знак «−» — ВЫЧИТАНИЕ.",
  ],
  ogAyirQoldi: ["{ta} qoldi.", "Осталось {ta}."],
  ogTaqqoslaIkki: ["Ikki tarafga qaraymiz.", "Посмотрим на две стороны."],
  ogTaqqoslaSana: ["Qaysi tarafda ko'p? Sanab ko'ramiz.", "Где больше? Давай посчитаем."],
  ogTaqqoslaNatija: [
    "{kop} — {kam}dan ko'p. Ko'p tarafda {ta} bor.",
    "{kop} больше, чем {kam}.",
  ],
  ogRaqamBu: ["Bu — {son} raqami.", "Это цифра {son}."],
  ogRaqamBildiradi: [
    "{son} raqami {ta} narsani bildiradi.",
    "Цифра {son} — это столько предметов.",
  ],
  ogQatorTartib: ["Sonlar shu tartibda turadi.", "Числа стоят в таком порядке."],
  ogQatorYashirin: [
    "Bittasi yashirinib qoldi. Qo'shnilariga qara!",
    "Одно спряталось. Посмотри на соседей!",
  ],
  ogQatorNatija: [
    "{a} dan keyin {c} keladi, ular orasida — {b}.",
    "После {a} идёт {c}, а между ними — {b}.",
  ],
  ogNaqshBu: ["Bu — naqsh. U takrorlanib boradi.", "Это узор. Он повторяется."],
  ogNaqshQara: [
    "Qara: shu qism qayta-qayta kelyapti.",
    "Смотри: эта часть повторяется снова и снова.",
  ],
  ogNaqshDemak: [
    "Demak keyin nima kelishini topish mumkin!",
    "Значит, можно узнать, что будет дальше!",
  ],
  ogTanishBu: ["Bu — {nom}.", "Это {nom}."],
  ogRoyxatOxir: [
    "Hammasi shu — {nom}. Endi topib ko'ramiz!",
    "Вот и всё — {nom}. Теперь давай находить!",
  ],

  /* ---------------- yo'lboshchi ---------------- */
  yolboshchi: ["Yo'lboshchi", "Экскурсия"],
  turSalom: [
    "Salom! Men Aql. Bu yerda nima qayerda turishini ko'rsatib beraman.",
    "Привет! Я Акл. Покажу, что здесь где находится.",
  ],
  turDavom: [
    "Dars shu tugmadan boshlanadi. Bir bosasan — va o'qish boshlanadi.",
    "Урок начинается с этой кнопки. Одно нажатие — и занятие идёт.",
  ],
  turHisob: [
    "Har bir to'g'ri javob uchun yulduz va tanga olasan.",
    "За каждый верный ответ ты получаешь звезду и монету.",
  ],
  turMaqsad: [
    "Har kuni shuncha savol yechsang, zanjiring uzilmaydi.",
    "Решай столько вопросов каждый день — и твоя серия не прервётся.",
  ],
  turBoblar: [
    "Darslar boblarga bo'lingan. Bobni ochsang, ichida dars yo'li chiqadi.",
    "Уроки собраны в главы. Откроешь главу — увидишь дорожку уроков.",
  ],
  turPanel: [
    "Pastda nishonlaring, do'koning, reyting va ota-ona paneli turadi.",
    "Внизу — награды, магазин, рейтинг и панель для родителей.",
  ],
  turQaytadan: ["Qaytadan ko'rsatish", "Показать заново"],
  turBoshlanadi: ["Kursni ochsangiz boshlanadi", "Начнётся при открытии курса"],
  turIzoh: [
    "Qaysi tugma nima qilishini boshqatdan ko'rsatib beradi",
    "Заново покажет, что делает каждая кнопка",
  ],

  /* ---------------- do'kon ---------------- */
  aqlniBezash: ["Aqlni bezash", "Наряди Акла"],
  tangaIzoh: ["Har to'g'ri javob 2 tanga beradi", "Каждый верный ответ — 2 монеты"],
  buyumniYechish: ["Buyumni yechish", "Снять предмет"],
  kiyilgan: ["kiyilgan", "надето"],
  kiyish: ["kiyish", "надеть"],
  bShlyapa: ["Shlyapa", "Шляпа"],
  bKozoynak: ["Ko'zoynak", "Очки"],
  bToj: ["Toj", "Корона"],
  bSharf: ["Sharf", "Шарф"],
  bGul: ["Gul", "Цветок"],
  bYulduzcha: ["Yulduzcha", "Звёздочка"],
  bKitob: ["Kitob", "Книга"],
  bRaketa: ["Raketa", "Ракета"],

  /* ---------------- nishonlar ---------------- */
  nishonlar: ["Nishonlar", "Награды"],
  nishonHisob: ["{olingan} / {jami} qo'lga kiritildi", "Получено: {olingan} / {jami}"],
  nIlkQadam: ["Ilk qadam", "Первый шаг"],
  nIlkQadamIzoh: ["Birinchi darsni tugat", "Пройди первый урок"],
  nBirHafta: ["Bir hafta", "Целая неделя"],
  nBirHaftaIzoh: ["7 kun ketma-ket mashq qil", "Занимайся 7 дней подряд"],
  nYuzSavol: ["Yuz savol", "Сто вопросов"],
  nYuzSavolIzoh: ["100 ta savol yech", "Реши 100 вопросов"],
  nXatosizBob: ["Xatosiz bob", "Глава без ошибок"],
  nXatosizBobIzoh: [
    "Bir bobning hamma darsini 3 yulduzga yech",
    "Пройди все уроки одной главы на 3 звезды",
  ],
  nOnDars: ["O'n dars", "Десять уроков"],
  nOnDarsIzoh: ["10 ta darsni tugat", "Пройди 10 уроков"],
  nYulduzYiguvchi: ["Yulduz yig'uvchi", "Собиратель звёзд"],
  nYulduzYiguvchiIzoh: ["100 ta yulduz to'pla", "Собери 100 звёзд"],

  /* ---------------- reyting ---------------- */
  reytingLiga: ["Liga", "Лига"],
  reytingJami: ["Jami", "Всего"],
  reytingHafta: ["Shu hafta", "На неделе"],
  ligaIzoh: ["Har hafta yangi guruh, yangi imkoniyat", "Каждую неделю новая группа и новый шанс"],
  qatnashchilar: ["{n} ta qatnashchi", "участников: {n}"],
  yulduzYigib: ["Yulduz yig'ib yuqoriga chiqing", "Собирайте звёзды и поднимайтесь выше"],
  reytingAloqaYoq: [
    "Reyting serverdan olinadi va hozir aloqa yo'q. Darslar baribir ishlayveradi — internet paydo bo'lganda qaytib keling.",
    "Рейтинг приходит с сервера, а связи сейчас нет. Уроки работают и так — вернитесь, когда появится интернет.",
  ],
  haftaBosh: [
    "Bu hafta hali hech kim yulduz yig'magan. Birinchi bo'ling!",
    "На этой неделе ещё никто не собрал звёзд. Будьте первым!",
  ],
  reytingBosh: [
    "Reyting hali bo'sh. Birinchi darsni yeching va ro'yxatni boshlang.",
    "Рейтинг пока пуст. Пройдите первый урок и откройте список.",
  ],
  haftaYulduzsiz: [
    "Bu hafta hali yulduz yig'magansiz — bitta dars yeting va ro'yxatda paydo bo'lasiz",
    "На этой неделе у вас ещё нет звёзд — пройдите урок и появитесь в списке",
  ],
  yulduzsiz: [
    "Hali yulduzingiz yo'q — birinchi darsni yeching",
    "У вас пока нет звёзд — пройдите первый урок",
  ],

  /* ---------------- liga ---------------- */
  ligaAloqaYoq: [
    "Liga serverdan olinadi va hozir aloqa yo'q. Darslar baribir ishlayveradi — internet paydo bo'lganda qaytib keling.",
    "Лига приходит с сервера, а связи сейчас нет. Уроки работают и так — вернитесь, когда появится интернет.",
  ],
  ligaIsmKerak: [
    "Ligada qatnashish uchun ismingizni kiriting — guruhdoshlaringiz sizni shu nom bilan ko'radi. Buni Sozlamalardan qilish mumkin.",
    "Чтобы участвовать в лиге, укажите имя — под ним вас увидят соперники. Это делается в настройках.",
  ],
  ligaKotarildi: ["Yuqori darajaga chiqdingiz!", "Вы поднялись на уровень выше!"],
  ligaTushdi: ["Bu hafta qaytarib olamiz", "На этой неделе всё вернём"],
  ligaYakunlandi: ["O'tgan hafta yakunlandi", "Прошлая неделя завершена"],
  ligaXabarIzoh: [
    "{daraja} ligasida {orin}-o'rin, {yulduz} yulduz.",
    "{orin}-е место в лиге «{daraja}», звёзд: {yulduz}.",
  ],
  ligaSarlavha: ["{daraja} ligasi", "Лига «{daraja}»"],
  ligaBola: ["{n} bola", "детей: {n}"],
  ligaKotariladi: ["{n} kishi yuqoriga chiqadi", "{n} поднимутся выше"],
  ligaTushadi: ["{n} kishi pastga tushadi", "{n} опустятся ниже"],
  ligaBoshGuruh: [
    "Bu hafta guruhda hali hech kim yulduz yig'magan — birinchi darsni yeching va darhol birinchi o'ringa chiqasiz",
    "На этой неделе в группе ещё никто не собрал звёзд — пройдите урок и сразу станете первым",
  ],
  ligaQoida: [
    "Har dushanba guruh yangilanadi. Yulduz yig'masangiz pastga tushmaysiz — dam olgan hafta jazolanmaydi.",
    "Каждый понедельник группа обновляется. Без звёзд вы не опуститесь — неделя отдыха не наказывается.",
  ],
  haftaYakunlanmoqda: ["Hafta yakunlanmoqda", "Неделя завершается"],
  haftaSoat: ["Hafta tugashiga {n} soat qoldi", "До конца недели {n} ч."],
  haftaKun: ["Hafta tugashiga {kun} kun{soat} qoldi", "До конца недели {kun} дн.{soat}"],
  haftaKunSoat: [" {n} soat", " {n} ч."],
  haliBoshlamadi: ["hali boshlamadi", "ещё не начал"],
  darajaBronza: ["Bronza", "Бронза"],
  darajaKumush: ["Kumush", "Серебро"],
  darajaOltin: ["Oltin", "Золото"],
  darajaOlmos: ["Olmos", "Алмаз"],
  darajaToj: ["Toj", "Корона"],

  /* ---------------- ota-ona paneli ---------------- */
  otaOnaIzoh: [
    "Farzandingiz nima qilyapti va qayerda yordam kerak",
    "Чем занимается ребёнок и где нужна помощь",
  ],
  oxirgi7Kun: ["Oxirgi 7 kun", "Последние 7 дней"],
  kDarslar: ["Darslar", "Уроки"],
  kSavollar: ["Savollar", "Вопросы"],
  kAniqlik: ["Aniqlik", "Точность"],
  kVaqt: ["Sarflangan vaqt", "Затрачено времени"],
  daqiqa: ["{n} daqiqa", "{n} мин."],
  soatDaqiqa: ["{soat} soat {daqiqa} daqiqa", "{soat} ч. {daqiqa} мин."],
  engQiyin: ["Eng qiyin kelgan darslar", "Самые трудные уроки"],
  engQiyinIzoh: [
    "Aniqlik bo'yicha — shu mavzularni birga takrorlash foydali",
    "По точности — эти темы полезно повторить вместе",
  ],
  takrorlashKutayotgan: ["Takrorlash kutayotgan mavzular", "Темы, ждущие повторения"],
  xatoSoni: ["{n} xato", "ошибок: {n}"],
  bobRaqam: ["{n}-bob", "глава {n}"],
  sinfBob: ["{sinf}, {n}-bob", "{sinf}, глава {n}"],
  hisobotAloqaYoq: [
    "Hisobot serverdan olinadi va hozir aloqa yo'q. Bola o'ynashda davom etaveradi — ma'lumot keyin sinxronlanadi.",
    "Отчёт приходит с сервера, а связи сейчас нет. Ребёнок продолжит играть — данные синхронизируются позже.",
  ],
  hisobotBosh: [
    "Hali birorta dars tugallanmagan. Birinchi darsdan keyin shu yerda hisobot paydo bo'ladi.",
    "Ни один урок пока не пройден. После первого урока здесь появится отчёт.",
  ],
  haftaKunlari: [
    "Ya,Du,Se,Ch,Pa,Ju,Sh",
    "Вс,Пн,Вт,Ср,Чт,Пт,Сб",
  ],

  /* ---------------- hisob / sozlamalar ---------------- */
  hisob: ["Hisob", "Профиль"],
  hisobEgasi: ["Hisob egasining ismi — odatda ota-ona", "Имя владельца профиля — обычно родителя"],
  tanishibOlaylik: ["Tanishib olaylik", "Давайте познакомимся"],
  royxatIzoh: [
    "Ism va familiyangizni kiriting — reytingda shu nom ko'rinadi",
    "Укажите имя и фамилию — под ними вас увидят в рейтинге",
  ],
  maydonIsm: ["Ism", "Имя"],
  maydonFamiliya: ["Familiya", "Фамилия"],
  joyIsm: ["Masalan: Jasur", "Например: Иван"],
  joyFamiliya: ["Masalan: Toshmatov", "Например: Иванов"],
  saqlanyapti: ["Saqlanyapti…", "Сохраняем…"],
  saqlandi: ["Saqlandi ✓", "Сохранено ✓"],
  hisobAloqaYoq: [
    "Hisob ma'lumoti serverda saqlanadi va hozir aloqa yo'q. Darslar baribir ishlayveradi — internet paydo bo'lganda qaytib keling.",
    "Данные профиля хранятся на сервере, а связи сейчас нет. Уроки работают и так — вернитесь, когда появится интернет.",
  ],
  bolalar: ["Bolalar", "Дети"],
  bolalarIzoh: [
    "Har bir bolaning yulduzlari alohida saqlanadi",
    "Звёзды каждого ребёнка хранятся отдельно",
  ],
  ismsiz: ["Ismsiz", "Без имени"],
  bolalarniBoshqarish: ["Bolalarni boshqarish", "Управление детьми"],
  kirishUsullari: ["Kirish usullari", "Способы входа"],
  kirishUsulIzoh: [
    "Qancha ko'p bo'lsa, progressni tiklash shuncha oson",
    "Чем их больше, тем легче восстановить прогресс",
  ],
  usulTelefon: ["Telefon", "Телефон"],
  usulTelegram: ["Telegram", "Telegram"],
  usulQurilma: ["Qurilma", "Устройство"],
  raqamniYuboring: ["Botga raqamingizni yuboring", "Отправьте номер боту"],
  boglangan: ["bog'langan", "привязан"],
  boglanmagan: ["bog'lanmagan", "не привязан"],
  shuQurilma: ["shu qurilma", "это устройство"],
  telegramTaklif: [
    "Telegram'ni bog'lasangiz, yulduzlaringiz boshqa qurilmada ham ochiladi",
    "Привяжите Telegram — и звёзды откроются на другом устройстве",
  ],
  telegramBoglash: ["Telegram bilan bog'lash", "Привязать Telegram"],
  chiqishSavol: [
    "Chiqasizmi? Yulduzlaringiz serverda qoladi — Telegram orqali qaytib kirsangiz hammasi joyida bo'ladi.",
    "Выйти? Звёзды останутся на сервере — войдёте через Telegram, и всё будет на месте.",
  ],
  haChiqaman: ["Ha, chiqaman", "Да, выйти"],
  hisobdanChiqish: ["Hisobdan chiqish", "Выйти из профиля"],
  xatoIsm: ["Ism", "Имя"],
  xatoFamiliya: ["Familiya", "Фамилия"],

  /* ---------------- til tanlash ---------------- */
  tilSarlavha: ["Til", "Язык"],
  tilIzoh: ["Ilova va darslar tili", "Язык приложения и уроков"],
  tilTanla: ["Tilni tanlang", "Выберите язык"],
  tilTanlaIzoh: [
    "Ilova, darslar va savollar shu tilda bo'ladi. Keyin sozlamalardan almashtirish mumkin.",
    "Приложение, уроки и вопросы будут на этом языке. Позже можно изменить в настройках.",
  ],

  /* ---------------- profillar ---------------- */
  profilAloqaYoq: [
    "Profillar serverda saqlanadi va hozir aloqa yo'q. Internet paydo bo'lganda shu yerga qaytib keling.",
    "Профили хранятся на сервере, а связи сейчас нет. Вернитесь сюда, когда появится интернет.",
  ],
  profilNomer: ["Profil {n}", "Профиль {n}"],
  yangiBola: ["Yangi bola qo'shish", "Добавить ребёнка"],
  joyBolaIsmi: ["Ismi", "Имя"],

  /* ---------------- kirish ---------------- */
  tizimgaKirish: ["Tizimga kirish", "Вход в систему"],
  telegramBilanKirish: ["Telegram bilan kirish", "Войти через Telegram"],
  telegramBilanSaqlash: ["Telegram bilan saqlash", "Сохранить через Telegram"],
  tgMalumotKelmadi: [
    "Telegram ma'lumoti kelmadi. Ilovani yopib, botdagi tugma orqali qaytadan oching.",
    "Данные Telegram не пришли. Закройте приложение и откройте заново кнопкой в боте.",
  ],
  tgSozlanmagan: [
    "Telegram orqali kirish sozlanmagan. Iltimos, keyinroq urinib ko'ring.",
    "Вход через Telegram не настроен. Пожалуйста, попробуйте позже.",
  ],
  botIzoh: [
    "Botda «Saytga kirish» tugmasi chiqadi — uni bossangiz shu yerga qaytasiz va avtomatik kirasiz.",
    "В боте появится кнопка «Войти на сайт» — нажмёте её, вернётесь сюда и войдёте автоматически.",
  ],
  havolaEskirdi: [
    "Havolaning muddati tugagan — u bir soat amal qiladi. Yangisini olish uchun tugmani bosing.",
    "Срок ссылки истёк — она действует один час. Нажмите кнопку, чтобы получить новую.",
  ],
  kirilyapti: ["Kirilyapti…", "Выполняется вход…"],
  birSoniya: ["Bir soniya", "Одну секунду"],
  taklifUchYulduz: ["Zo'r! Uchala yulduzni oldingiz", "Отлично! Вы взяли все три звезды"],
  taklifYulduz: ["{n} yulduz qo'lga kiritildi", "Получено звёзд: {n}"],
  taklifXabar: [
    "Yulduzlaringiz hozir faqat shu brauzerda turibdi. Telegram bilan kirsangiz — ular saqlanadi, boshqa telefonda ham ochiladi va haftalik ligada qatnasha boshlaysiz.",
    "Сейчас звёзды хранятся только в этом браузере. Войдите через Telegram — они сохранятся, откроются на другом телефоне, и вы начнёте играть в недельной лиге.",
  ],

  /* ---------------- kanal ---------------- */
  kanalSarlavha: ["Telegram kanalimizga qo'shiling!", "Подпишитесь на наш Telegram-канал!"],
  kanalIzoh: [
    "Yangi darslar va foydali maslahatlar — birinchi bo'lib bilasiz.",
    "Новые уроки и полезные советы — узнаете первыми.",
  ],
  kanal1: ["Yangi darslar va bo'limlar", "Новые уроки и разделы"],
  kanal1Izoh: ["chiqishi bilan e'lon qilamiz", "объявляем сразу после выхода"],
  kanal2: ["Bolani qiziqtirish sirlari", "Как увлечь ребёнка"],
  kanal2Izoh: ["har hafta bitta amaliy maslahat", "один практичный совет в неделю"],
  kanal3: ["Musobaqa va sovrinlar", "Конкурсы и призы"],
  kanal3Izoh: ["faqat kanalda e'lon qilinadi", "объявляются только в канале"],
  kanal4: ["Yangiliklar", "Новости"],
  kanal4Izoh: ["ilovadagi o'zgarishlardan xabardor bo'lasiz", "будете в курсе изменений"],
  kanalOchish: ["Telegramda ochish", "Открыть в Telegram"],

  /* ---------------- holat / xato ---------------- */
  internetYoq: [
    "Internet yo'q — o'ynashda davom et, progress keyin saqlanadi",
    "Нет интернета — играй дальше, прогресс сохранится позже",
  ],
  yangiVersiya: ["Yangi versiya tayyor — yangilash", "Новая версия готова — обновить"],
  xatoSarlavha: ["Nimadir noto'g'ri ketdi", "Что-то пошло не так"],
  xatoIzoh1: ["Xavotir olma — ", "Не волнуйся — "],
  xatoIzohQalin: ["yulduzlaring va tangalaring joyida", "твои звёзды и монеты на месте"],
  xatoIzoh2: [
    ". Quyidagi tugmani bosib davom etsang bo'ladi.",
    ". Нажми кнопку ниже и продолжай.",
  ],
  qaytaUrinish: ["Qayta urinish", "Попробовать снова"],
  boshigaQaytish: ["Boshiga qaytish", "Вернуться в начало"],
  texnikMalumot: ["Texnik ma'lumot", "Техническая информация"],

  /* ---------------- topilmadi ---------------- */
  buSahifa: ["Bu sahifa", "Эта страница"],
  bundayDars: ["Bunday dars", "Такой урок"],
  kursTopilmadi: ['"{slug}" kursi', 'курс «{slug}»'],
  topilmadi: ["{nima} topilmadi", "{nima} не найдена"],
  topilmadiIzoh: [
    "Manzil noto'g'ri bo'lishi mumkin. Quyidagi tugma orqali davom eting.",
    "Возможно, адрес неверный. Продолжите по кнопке ниже.",
  ],
  kurslargaQaytish: ["Kurslarga qaytish", "Вернуться к курсам"],

  /* ---------------- yo'l xaritasi ---------------- */
  bobTakrorlash: ["Bob takrorlash", "Повторение главы"],

  /* ================= O'YINLAR ================= */

  oyinlar: ["O'yinlar", "Игры"],
  oyinlarIzoh: [
    "Sof matematika — har yosh uchun. Darsdan tashqari, rekord uchun.",
    "Чистая математика — для любого возраста. Не урок, а рекорд.",
  ],
  oyinlarBolim: ["Matematik o'yinlar", "Математические игры"],
  oyinlarTagi: [
    "Har o'yinda uch daraja bor. Yosh — faqat maslahat, xohlagan darajangni tanlaysan.",
    "В каждой игре три уровня. Возраст — лишь подсказка, уровень выбираешь сам.",
  ],
  oyinHaliYoq: ["Hali o'ynalmagan", "Ещё не играли"],

  /* ---------------- duel ---------------- */
  duel: ["Do'st bilan bellashuv", "Дуэль с другом"],
  duelIzoh: [
    "Bir xil savollar · 60 soniya",
    "Одинаковые вопросы · 60 секунд",
  ],
  duelSiz: ["Siz", "Вы"],
  duelChaqirish: ["Chaqiruv yuborish", "Отправить вызов"],
  duelTayyorlanmoqda: ["Tayyorlanmoqda…", "Готовим…"],
  duelSizChaqirdingiz: ["Chaqiruv tayyor!", "Вызов готов!"],
  duelUlashing: [
    "Havolani do'stingizga yuboring — u xuddi shu savollarni yechadi.",
    "Отправьте ссылку другу — он решит те же самые задания.",
  ],
  duelNusxa: ["Havolani nusxalash", "Скопировать ссылку"],
  duelNusxalandi: ["Nusxalandi ✓", "Скопировано ✓"],
  duelUlash: ["Telegramda ulashish", "Поделиться в Telegram"],
  duelUlashMatn: [
    "Meni yutib ko'r-chi 😏",
    "Попробуй меня обыграть 😏",
  ],
  duelChaqiruv: ["{nom} sizni bellashuvga chaqiryapti", "{nom} вызывает вас на дуэль"],
  duelChaqiruvIzoh: [
    "Xuddi shu savollarni yechasiz. 60 soniya.",
    "Вы решите те же самые задания. 60 секунд.",
  ],
  duelQabul: ["Qabul qilaman", "Принимаю"],
  duelYutdingiz: ["Siz yutdingiz!", "Вы победили!"],
  duelYutqazdingiz: ["Bu safar yutqazdingiz", "На этот раз проигрыш"],
  duelDurang: ["Durang!", "Ничья!"],
  duelHisob: ["{meniki} : {raqib}", "{meniki} : {raqib}"],
  duelYana: ["Yana chaqirish", "Вызвать снова"],
  duelOyinlarga: ["O'yinlarga qaytish", "К играм"],
  duelTopilmadi: ["Chaqiruv topilmadi", "Вызов не найден"],
  duelMuddatiOtdi: ["Chaqiruv muddati o'tgan", "Срок вызова истёк"],
  duelOynalgan: ["Bu chaqiruv allaqachon o'ynalgan", "Этот вызов уже сыгран"],
  duelOzingiz: ["Bu sizning chaqiruvingiz", "Это ваш собственный вызов"],
  duelChegara: ["Bugunga chaqiruvlar tugadi", "Вызовы на сегодня закончились"],
  duelXato: ["Aloqa yo'q — qaytadan urinib ko'ring", "Нет связи — попробуйте снова"],
  duelKutyapti: ["Javob kutilmoqda", "Ожидает ответа"],
  duelTarix: ["So'nggi bellashuvlar", "Последние дуэли"],

  /* ---------------- bugungi maydon ---------------- */
  maydon: ["Bugungi maydon", "Сегодняшняя арена"],
  maydonIzoh: [
    "3 bosqich · hammaga bir xil savol",
    "3 этапа · у всех одни и те же задания",
  ],
  maydonQolgan: ["{n} soat qoldi", "осталось {n} ч"],
  maydonBosqich: ["{n}-bosqich / {jami}", "Этап {n} / {jami}"],
  maydonVaqt: ["{n} soniya", "{n} секунд"],
  maydonBoshla: ["Boshlash", "Начать"],
  maydonTugadi: ["Maydon tugadi!", "Арена пройдена!"],
  maydonErtaga: [
    "Ertaga yangi uch bosqich ochiladi. Bugungisi yarim tunda yopiladi.",
    "Завтра откроются три новых этапа. Сегодняшний закрывается в полночь.",
  ],
  maydonChiqish: ["Yopish", "Закрыть"],
  maydonBugunOynadingiz: ["Bugun o'ynadingiz", "Сегодня вы уже играли"],
  maydonNatijangiz: ["Natijangiz: {n} ball", "Ваш результат: {n}"],
  maydonMashq: ["Mashq", "Тренировка"],
  maydonMashqIzoh: [
    "Cheksiz o'ynang — rekordingizni yaxshilang",
    "Играйте сколько угодно — улучшайте рекорд",
  ],

  /* ---------------- darajalar ---------------- */
  daraja: ["Daraja", "Уровень"],
  darajaTanla: ["Darajani tanla", "Выбери уровень"],
  darajaOson: ["Oson", "Лёгкий"],
  darajaOrta: ["O'rta", "Средний"],
  darajaQiyin: ["Qiyin", "Сложный"],
  darajaOsonYosh: ["6–9 yosh · 1–3-sinf", "6–9 лет · 1–3 класс"],
  darajaOrtaYosh: ["10–14 yosh · 4–8-sinf", "10–14 лет · 4–8 класс"],
  darajaQiyinYosh: ["15+ · kattalar", "15+ · взрослым"],
  darajaQulf: [
    "Oldingi darajada yana {n} ball to'plang",
    "Наберите ещё {n} на предыдущем уровне",
  ],
  darajaYoshIzoh: [
    "Yosh — faqat maslahat. Istagan darajangni tanla.",
    "Возраст — только подсказка. Выбирай любой уровень.",
  ],

  /* ---------------- o'yin nomlari ---------------- */
  oyinTezkor: ["Tezkor hisob", "Быстрый счёт"],
  oyinTezkorIzoh: ["To'g'rimi yoki xatomi?", "Верно или нет?"],
  oyinTezkorQoida: [
    "Ifoda chiqadi — to'g'ri bo'lsa ✅, xato bo'lsa ❌ bos. Har xato 3 soniya oladi.",
    "Появится пример — верно ✅, неверно ❌. Каждая ошибка отнимает 3 секунды.",
  ],
  oyinJadval: ["Ko'paytirish jadvali", "Таблица умножения"],
  oyinJadvalIzoh: ["Jadvalni qanchalik tez bilasan?", "Насколько быстро знаешь таблицу?"],
  oyinJadvalQoida: [
    "Ko'paytirish, bo'lish va yashirin ko'paytuvchi. To'g'ri javobni tanla.",
    "Умножение, деление и скрытый множитель. Выбери верный ответ.",
  ],
  oyinBelgi: ["Yashirin amal", "Скрытый знак"],
  oyinBelgiIzoh: ["Qaysi belgi yashiringan?", "Какой знак спрятан?"],
  oyinBelgiQoida: [
    "Amal belgisi o'rnida savol turadi. Qaysi belgi to'g'ri kelishini top.",
    "Вместо знака стоит вопрос. Найди, какой знак подходит.",
  ],
  oyinKetma: ["Ketma-ketlik", "Последовательность"],
  oyinKetmaIzoh: ["Qonuniyatni top", "Найди закономерность"],
  oyinKetmaQoida: [
    "Sonlar qatori berilgan. Keyingisi qaysi son bo'lishini top.",
    "Дан ряд чисел. Найди, какое число будет следующим.",
  ],
  oyinTaxmin: ["Chamalash", "Прикидка"],
  oyinTaxminIzoh: ["Aniq hisoblash shart emas", "Точно считать не нужно"],
  oyinTaxminQoida: [
    "Aniq javob kerak emas — eng yaqin sonni tanla. Bozorda ham shunday qilasan.",
    "Точный ответ не нужен — выбери ближайшее число. На рынке ты делаешь так же.",
  ],
  oyinTarozi: ["Tarozi", "Весы"],
  oyinTaroziIzoh: ["Har meva qanchaga teng?", "Чему равен каждый фрукт?"],
  oyinTaroziQoida: [
    "Tarozi muvozanatda. Berilgan shartlardan mevaning qiymatini top.",
    "Весы в равновесии. По условиям найди значение фрукта.",
  ],
  oyin24: ["24 — sonlar sehri", "24 — магия чисел"],
  oyin24Izoh: ["To'rt raqamdan 24 chiqar", "Получи 24 из четырёх цифр"],
  oyin24Qoida: [
    "Ikki sonni va amalni bos — ular birlashadi. Oxirida 24 qolsin. Har raqam bir marta.",
    "Нажми два числа и знак — они объединятся. В конце должно остаться 24. Каждая цифра один раз.",
  ],
  oyinXotira: ["Sonlar xotirasi", "Память на числа"],
  oyinXotiraIzoh: ["Nechta sonni eslab qolasan?", "Сколько чисел запомнишь?"],
  oyinXotiraQoida: [
    "Sonlar bir lahza ko'rinadi — so'ng ularni tartib bilan tering. Bitta xato — tugadi.",
    "Числа появятся на миг — затем набери их по порядку. Одна ошибка — конец.",
  ],

  /* ---------------- o'yin ekrani ---------------- */
  oyinBall: ["Ball", "Очки"],
  oyinRekordim: ["Rekordim", "Мой рекорд"],
  oyinRekordYoq: ["Rekord yo'q", "Рекорда нет"],
  oyinYangiRekord: ["Yangi rekord!", "Новый рекорд!"],
  oyinTugadi: ["O'yin tugadi", "Игра окончена"],
  oyinQayta: ["Yana o'ynash", "Играть ещё"],
  oyinBoshqaDaraja: ["Boshqa daraja", "Другой уровень"],
  oyinlargaQaytish: ["O'yinlarga qaytish", "Вернуться к играм"],
  oyinTogri: ["To'g'ri", "Верно"],
  oyinXatoTugma: ["Xato", "Неверно"],
  oyinTanga: ["+{n} tanga", "+{n} монет"],
  oyinBonusIzoh: [
    "Kunning birinchi o'yini — tanga ikki barobar",
    "Первая игра за день — монеты вдвое",
  ],
  oyinOldingi: ["Oldingi rekord: {n}", "Прошлый рекорд: {n}"],
  oyinYaqin: ["Rekordgacha {n} ball qoldi", "До рекорда осталось {n}"],

  /* ---------------- zanjir (ketma-ket to'g'ri javob) ---------------- */
  oyinZanjir: ["{n} ketma-ket", "{n} подряд"],
  oyinZanjirBoshlandi: ["Zanjir boshlandi!", "Серия пошла!"],
  oyinRekorddan: ["Rekordingdan oshding!", "Ты обошёл свой рекорд!"],

  /* ---------------- 24 o'yini ---------------- */
  oyin24Nishon: ["24 ni yig'", "Собери 24"],
  oyin24Qaytar: ["Ortga qaytar", "Отменить"],
  oyin24Otkaz: ["Boshqasi", "Другая"],
  oyin24Yechim: ["Yechim: {y}", "Решение: {y}"],
  oyin24Topildi: ["Topding!", "Нашёл!"],
  oyin24Sanoq: ["Yechilgan: {n}", "Решено: {n}"],
  oyin24Sonlar: ["Sonlarni bos", "Нажимай на числа"],
  oyin24Berk: [
    "Bu yo'ldan 24 chiqmaydi — ortga qayt",
    "Отсюда 24 уже не получить — отмени ход",
  ],

  /* ---------------- xotira o'yini ---------------- */
  xotiraPogona: ["{n}-pog'ona", "Ступень {n}"],
  xotiraEsla: ["Eslab qol…", "Запоминай…"],
  xotiraQaytar: ["Endi tering", "Теперь набери"],
  xotiraTeskari: ["TESKARI tartibda tering", "Набери в ОБРАТНОМ порядке"],
  xotiraNatija: ["{n} ta son", "чисел: {n}"],
} satisfies Record<string, [string, string]>;

export type Kalit = keyof typeof S;

/**
 * Matnni tilga qarab beradi va `{nom}` o'rinlarini to'ldiradi.
 *
 * To'ldirilmagan o'rin O'Z HOLIDA qoladi (`{nom}`) — jim yo'qolib
 * ketishdan ko'ra ko'zga tashlangani yaxshi: shunda xato birinchi
 * ochilishda topiladi.
 */
export function t(k: Kalit, p?: Record<string, string | number>): string {
  const juft = S[k] as [string, string];
  let s = til() === "ru" ? juft[1] : juft[0];
  if (p) {
    for (const [nom, qiymat] of Object.entries(p)) {
      s = s.split(`{${nom}}`).join(String(qiymat));
    }
  }
  return s;
}
