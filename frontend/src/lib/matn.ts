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
  /* Bosh sahifadagi h1 — ko'rinmas, lekin ekran o'quvchisi va
     qidiruv robotlari aynan shuni o'qiydi.

     Ilgari "bilim va o'yin platformasi" deb turardi. Bu ilova
     nima ekanini AYTMAYDI: unda 16 ta kurs va 637 ta dars bor va
     hammasi matematika. Bot allaqachon to'g'ri gapirardi
     (`backend/core/matn.py` dagi "salom"), sayt esa yo'q — ya'ni
     bir odam ikki joyda ikki xil tanishtiruv ko'rardi.

     Endi uchalasi (bot, sayt, ilova) bir xil gapiradi va buni
     `scripts/brend.ts` qo'riqlaydi. */
  shior: [
    "Aql Zone — 1–11-sinf matematikasi",
    "Aql Zone — математика 1–11 классов",
  ],
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

  /* ---------------- kichkintoylar bo'limi (2–5 yosh) ----------------
     Bu yerdagi matnlarni BOLA O'QIMAYDI — u hali o'qishni bilmaydi.
     Hammasi ota-onaga qaratilgan: u ekranni ochib beradi, nomini aytib
     turadi va bolani oxirigacha olib boradi. Shuning uchun ular qisqa
     va tushunarli, "o'quv" so'zlarisiz. */
  kichkintoy: ["Kichkintoylar", "Малышам"],
  kichkintoyQisqa: ["Kichkintoylar · 2–5 yosh", "Малышам · 2–5 лет"],
  kichkintoyIzoh: [
    "Mashinalar, hayvonlar, ranglar va raqamlar — ilova nomini o'zi aytib beradi",
    "Машины, животные, цвета и цифры — приложение само называет их вслух",
  ],
  kichkintoyKartaIzoh: [
    "Bosing — rasm kattalashadi va nomi eshitiladi",
    "Нажмите — картинка станет большой и прозвучит название",
  ],
  kichkintoyTagi: [
    "Bu yerda to'g'ri javob yo'q — bola shunchaki ko'radi va eshitadi",
    "Здесь нет правильных ответов — ребёнок просто смотрит и слушает",
  ],
  kichkintoyKorildi: ["{n} / {jami}", "{n} / {jami}"],
  kichkintoyHammasi: ["hammasi ko'rildi", "всё просмотрено"],
  kichkintoyQayta: ["Yana eshitish", "Послушать ещё раз"],
  kichkintoyTovushi: ["tovushi", "звук"],
  kichkintoyOldingi: ["Oldingisi", "Предыдущая"],
  kichkintoyKeyingi: ["Keyingisi", "Следующая"],
  kichkintoyOyin: ["Topib ber", "Найди-ка"],
  kichkintoyOyinIzoh: ["Ovoz aytadi — bola topadi", "Голос называет — ребёнок находит"],
  kichkintoyQaniTop: ["Qani, topib ber", "Ну-ка, найди"],
  kichkintoySanoq: ["{n} / {jami}", "{n} / {jami}"],
  kichkintoyBarakalla: ["Barakalla!", "Молодец!"],
  kichkintoyOyinTugadi: ["Hammasini topding", "Ты нашёл всё"],
  kichkintoyYana: ["Yana o'ynash", "Играть ещё"],
  kichkintoyAlbomga: ["Rasmlarga qaytish", "Вернуться к картинкам"],
  kichkintoyTopilmadi: ["Bunday mavzu yo'q", "Такой темы нет"],

  menyuKichkintoyIzoh: [
    "2–5 yosh · rasm, nom va ovoz",
    "2–5 лет · картинка, название и голос",
  ],

  /* ---------------- ovoz ---------------- */
  ovozYoqish: ["Ovozni yoqish", "Включить звук"],
  ovozOchirish: ["Ovozni o'chirish", "Выключить звук"],
  ovozSarlavha: ["Ovoz", "Звук"],
  ovozIzoh: [
    "Ilova so'z va savollarni ovoz chiqarib o'qiydi. Kichkintoylar bo'limi shusiz ishlamaydi — bola hali o'qiy olmaydi.",
    "Приложение произносит слова и вопросы вслух. Без этого раздел «Малышам» не работает — ребёнок ещё не умеет читать.",
  ],

  /* ---------------- kurs sahifasi (Home) ---------------- */
  izohMaktabgacha: ["Maktabga tayyorgarlik", "Подготовка к школе"],
  izohToliqKurs: ["Darslik bo'yicha to'liq kurs", "Полный курс по учебнику"],
  izohOtmKurs: ["OTM fan dasturi bo'yicha", "По программе вуза"],
  otaOnaPaneli: ["Ota-ona paneli", "Панель для родителей"],
  darsTugallandi: ["{done} / {jami} dars tugallandi", "Уроков пройдено: {done} / {jami}"],
  bobDars: ["{n} dars", "уроков: {n}"],
  bobTugadi: [" · {n} tugadi", " · пройдено: {n}"],
  // Dars yo'lidagi kartaning ikkinchi qatori. Tugallangan darsda uning
  // o'rnida yulduzlar turadi — natija so'zdan kuchliroq gapiradi.
  yolBoshlang: ["O'rganishni boshlang", "Начните обучение"],
  yolOldinda: ["Hali oldinda", "Ещё впереди"],
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
  tabOyinlar: ["O'yinlar", "Игры"],
  tabMenyu: ["Menyu", "Меню"],
  /* Yangi dizayn: pastki panelda besh bo'lim (`lib/tab.ts`). */
  tabBugun: ["Bugun", "Сегодня"],
  tabOqish: ["O'qish", "Учёба"],
  tabOyin: ["O'yin", "Игры"],
  tabMen: ["Men", "Я"],
  tabBolimlar: ["Asosiy bo'limlar", "Основные разделы"],

  /* ---------------- Bugun (`screens/Bosh.tsx`, yangi dizayn) ---------------- */
  bugun_tong: ["Xayrli tong", "Доброе утро"],
  bugun_kun: ["Xayrli kun", "Добрый день"],
  bugun_kech: ["Xayrli kech", "Добрый вечер"],
  /* Vergul bilan ajratilgan ro'yxatlar — `Intl` ning o'zbekchasi eski
     Telegram WebView'da yo'q va "Friday" bo'lib chiqardi. */
  bugunHaftaKunlari: [
    "Yakshanba,Dushanba,Seshanba,Chorshanba,Payshanba,Juma,Shanba",
    "Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота",
  ],
  bugunQisqaKunlar: ["Du,Se,Ch,Pa,Ju,Sh,Ya", "Пн,Вт,Ср,Чт,Пт,Сб,Вс"],
  bugunOylar: [
    "yanvar,fevral,mart,aprel,may,iyun,iyul,avgust,sentabr,oktabr,noyabr,dekabr",
    "января,февраля,марта,апреля,мая,июня,июля,августа,сентября,октября,ноября,декабря",
  ],
  bugunSana: ["{kun} · {n}-{oy}", "{kun} · {n} {oy}"],
  bugunReja: ["Bugungi reja", "План на сегодня"],
  bugunBajarildi: ["bajarildi", "готово"],
  bugunBittaDars: ["Bitta dars", "Один урок"],
  bugunSinov: ["Bugungi sinov", "Тест дня"],
  bugunKunlikSon: ["Kunlik son #{n}", "Число дня #{n}"],
  bugunDaqiqa: ["{n} daq", "{n} мин"],
  bugunSoat: ["{n} soat", "{n} ч"],
  bugunZanjir: ["{n} kun ketma-ket", "{n} дн. подряд"],
  bugunZanjirYoq: ["Zanjirni bugun boshlang", "Начните серию сегодня"],
  bugunRekord: ["Rekord: {n}", "Рекорд: {n}"],
  bugunRekordKun: ["Rekord: {n} kun", "Рекорд: {n} дн."],
  bugunBuHafta: ["Bu hafta", "Эта неделя"],
  bugunHaftaBosh: [
    "Har kuni bitta dars qilsangiz, shu yerda ketma-ket kunlar yig'iladi.",
    "Делайте по одному уроку в день — здесь будут копиться дни подряд.",
  ],
  bugunHaftaDavom: [
    "{n} kun ketma-ket mashq qildingiz. Bugun bitta dars qilsangiz — {m} kun bo'ladi.",
    "Вы занимаетесь {n} дн. подряд. Сделайте сегодня один урок — будет {m}.",
  ],
  bugunHaftaBajarildi: [
    "{n} kun ketma-ket! Ertaga ham bitta dars qilsangiz, zanjir uzilmaydi.",
    "{n} дн. подряд! Сделайте урок и завтра — серия не прервётся.",
  ],
  bugunDarsIzoh: ["Taxminan 5 daqiqa", "Около 5 минут"],
  bugunSinovIzoh: ["{n} ta savol · {d} daqiqa", "{n} вопросов · {d} мин"],
  bugunSinovYopiq: ["Bitta dars qilgach ochiladi", "Откроется после первого урока"],
  bugunSonIzoh: ["Yashirin sonni toping · {soat} qoldi", "Угадайте число · осталось {soat}"],
  bugunAmalBoshlash: ["Boshlash", "Начать"],
  bugunAmalYechish: ["Yechish", "Решить"],
  bugunAmalOynash: ["O'ynash", "Играть"],
  bugunBobYoli: ["Bobda {jami} ta darsdan {n} tasi o'tildi", "В главе пройдено {n} из {jami} уроков"],
  bugunKeyingiDars: ["Keyingi dars", "Следующий урок"],
  bugunBobJoy: ["{bob}-bob · {dars} / {jami}", "Гл. {bob} · {dars} / {jami}"],
  bugunBirinchiQadam: ["Birinchi qadam", "Первый шаг"],
  bugunBoshlash: ["O'rganishni boshlash", "Начать учиться"],
  bugunMaslahat: ["Aql maslahati", "Совет от Aql"],
  /* Aql maslahatlari — kun bo'yicha almashadi (`lib/bugun.ts` → yilKuni).
     Qisqa va bitta misol bilan: bola ularni bir qarashda o'qiydi. */
  maslahat0: [
    "Sonlarni taqqoslashda avval eng katta xonaga qara: 486 va 512 da 4 < 5, demak 512 katta.",
    "Сравнивая числа, смотри сначала на старший разряд: в 486 и 512 4 < 5, значит 512 больше.",
  ],
  maslahat1: [
    "9 ga ko'paytirish oson: 10 ga ko'paytirib, sonning o'zini ayir. 9 × 7 = 70 − 7 = 63.",
    "Умножать на 9 легко: умножь на 10 и вычти само число. 9 × 7 = 70 − 7 = 63.",
  ],
  maslahat2: [
    "Xato qilgan savol daftarga tushadi. Ertaga takrorlasang, uni endi unutmaysan.",
    "Вопрос с ошибкой попадает в тетрадь. Повтори его завтра — и больше не забудешь.",
  ],
  maslahat3: [
    "5 ga ko'paytirish: 10 ga ko'paytirib, ikkiga bo'l. 5 × 18 = 180 : 2 = 90.",
    "Умножить на 5: умножь на 10 и раздели на 2. 5 × 18 = 180 : 2 = 90.",
  ],
  maslahat4: [
    "Kasrlarni qo'shishdan oldin maxrajlarni tenglashtir: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.",
    "Перед сложением дробей приведи знаменатели: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.",
  ],
  maslahat5: [
    "Son 3 ga bo'linadimi? Raqamlarini qo'sh: 123 → 1 + 2 + 3 = 6, demak bo'linadi.",
    "Делится ли число на 3? Сложи цифры: 123 → 1 + 2 + 3 = 6, значит делится.",
  ],
  maslahat6: [
    "Masalani o'qib bo'lgach, nima so'ralganini bir so'z bilan ayt — yechish osonlashadi.",
    "Прочитав задачу, назови одним словом, что спрашивают, — решать станет проще.",
  ],
  maslahat7: [
    "Har kuni 10 daqiqa — haftasiga bir soatdan ko'p. Kichik qadamlar katta natija beradi.",
    "10 минут в день — больше часа в неделю. Маленькие шаги дают большой результат.",
  ],
  maslahat8: [
    "Javobni teskari amal bilan tekshir: 56 : 7 = 8, chunki 8 × 7 = 56.",
    "Проверяй ответ обратным действием: 56 : 7 = 8, потому что 8 × 7 = 56.",
  ],
  maslahat9: [
    "Ikki xonali sonni 11 ga ko'paytirish: raqamlarni yoy, o'rtasiga yig'indisini qo'y. 11 × 36 = 396.",
    "Умножить двузначное число на 11: раздвинь цифры и поставь между ними их сумму. 11 × 36 = 396.",
  ],

  /* ---------------- O'qish qobig'i (`components/OqishQobiq.tsx`) ---------------- */
  oqishFormulalar: ["Formulalar", "Формулы"],
  oqishXatolar: ["Xatolar", "Ошибки"],
  oqishBolimlar: ["O'qish bo'limlari", "Разделы учёбы"],
  oqishSinfTanlash: ["Sinfni tanlang", "Выберите класс"],
  oqishDarsSoni: ["{n} / {jami} dars", "{n} / {jami} ур."],
  oqishBobTugadi: ["{n} / {jami} dars · tugadi", "{n} / {jami} ур. · готово"],
  oqishBoshlash: ["Boshlash", "Начать"],
  /* Testlar yorlig'i (`screens/OqishTestlar.tsx`) */
  oqishBlokTest: ["{n}-sinf blok testi", "Блок-тест {n} класса"],
  oqishAralash: ["{fan} · aralash", "{fan} · вперемешку"],
  oqishIkkiFan: ["Algebra va geometriya", "Алгебра и геометрия"],
  oqishSavol: ["{n} savol", "{n} вопросов"],
  oqishDaqiqa: ["{n} daqiqa", "{n} минут"],
  oqishTestBoshlash: ["Testni boshlash", "Начать тест"],
  oqishBoshqaTestlar: ["Boshqa testlar", "Другие тесты"],
  oqishImtihon: ["Milliy sertifikat va DTM", "Нацсертификат и ДТМ"],
  oqishImtihonIzoh: ["Imtihon formatidagi variantlar, vaqt bilan", "Варианты в формате экзамена, на время"],
  oqishMavzu: ["Mavzu bo'yicha test", "Тест по теме"],
  oqishMavzuIzoh: ["Bitta bobni tanlab tekshiring", "Проверьте одну главу"],
  oqishToplamlar: ["Test to'plamlari", "Сборники тестов"],
  oqishToplamlarIzoh: ["Hamma bir xil savolni yechadi", "Все решают одни и те же вопросы"],
  oqishQuyiSinf: [
    "Blok testlar 5-sinfdan boshlanadi. Hozircha darslar va kunlik sinov bilan mashq qiling.",
    "Блок-тесты начинаются с 5 класса. Пока тренируйтесь на уроках и тесте дня.",
  ],
  /* Xatolar yorlig'i (`screens/OqishXatolar.tsx`) */
  oqishXatoBugun: ["Bugun takrorlash", "Повторить сегодня"],
  oqishXatoSoni: ["{n} ta savol", "{n} вопр."],
  oqishXatoIzoh: [
    "Xato qilgan savollaringiz 1, 3 va 7 kundan keyin qaytadi — shunda esda qoladi.",
    "Вопросы с ошибками возвращаются через 1, 3 и 7 дней — так они запоминаются.",
  ],
  oqishMashq: ["Mashq qilish", "Тренироваться"],
  oqishXatoYoq: ["Bugun takrorlash yo'q", "Сегодня повторять нечего"],
  oqishXatoBosh: [
    "Daftar bo'sh. Darsda xato qilgan savol shu yerga tushadi va keyinroq qaytadi.",
    "Тетрадь пуста. Вопрос с ошибкой попадёт сюда и вернётся позже.",
  ],
  oqishXatoMavzular: ["Daftardagi mavzular", "Темы в тетради"],
  oqishXatoMarta: ["{n} marta xato", "ошибок: {n}"],

  /* ---------------- O'yin tabi (`screens/Oyinlar.tsx`, yangi dizayn) ---------------- */
  tezOyin: ["Tez o'yin", "Блиц"],
  tezOyinIzoh: ["Duel · jonli raqib bilan", "Дуэль вживую"],
  tezOyinTugma: ["O'ynash", "Играть"],
  oyinYakkaSarlavha: ["Yakka o'yinlar", "Одиночные игры"],
  oyinOxirgi: ["oxirgi", "последний"],
  oyinRekord: ["rekord", "рекорд"],
  oyinHaftaOsdi: ["↑ +{n} haftada", "↑ +{n} за неделю"],
  oyinHaftaTushdi: ["↓ −{n} haftada", "↓ −{n} за неделю"],
  oyinGrafikAria: ["{nom}, oxirgi natijalar: {sonlar}. Rekord {rekord}.", "{nom}, последние результаты: {sonlar}. Рекорд {rekord}."],
  oyinOynalmagan: ["Hali o'ynalmagan", "Ещё не играли"],
  oyinBoshqa: ["Boshqa o'yinlar", "Другие игры"],
  oyinDostlar: ["Do'stlar bilan", "С друзьями"],

  /* ---------------- Imtihon: DTM va Milliy sertifikat (yangi dizayn) ---------------- */
  imtTayyorgarlik: ["Imtihonga tayyorgarlik", "Подготовка к экзамену"],
  imtOrtachaSert: ["O'rtacha · oxirgi 5 urinish", "Среднее · последние 5 попыток"],
  imtOrtachaDtm: ["O'rtacha · oxirgi 5 variant", "Среднее · последние 5 вариантов"],
  imtTaxminiy: ["taxminiy", "примерно"],
  imtSertifikatsiz: ["sertifikatsiz", "без сертификата"],
  imtShkalaAria: ["Daraja shkalasi, o'rtacha ball {b}", "Шкала уровней, средний балл {b}"],
  imtDavomSarlavha: ["{n}-variant — davom etish", "Вариант {n} — продолжить"],
  imtDaqQoldi: ["{n} daq qoldi", "осталось {n} мин"],
  imtVaqtTugadi: ["vaqt tugadi", "время вышло"],
  imtJavobSoni: ["{a} / {b} javob", "{a} / {b} ответов"],
  imtSaqlangan: ["Javoblar saqlangan — to'xtagan joyingizdan boshlanadi", "Ответы сохранены — продолжите с того же места"],
  imtDtmTogri: ["/ {n} to'g'ri", "/ {n} верных"],
  imtZaif: ["Ko'p xato qilinayotgan mavzular", "Темы с частыми ошибками"],
  imtZaifXato: ["{mavzu} · {n}", "{mavzu} · {n}"],
  imtZaifTakrorla: ["Shu mavzularni takrorlash", "Повторить эти темы"],
  imtDtmTuzilish: ["{savol} savol · {daqiqa} daqiqa", "{savol} вопросов · {daqiqa} минут"],
  imtDtmPast: [
    "Har variant 7–11-sinf dasturidan aralash. Har savoldan keyin to'g'ri yoki xato darhol ko'rsatiladi.",
    "Каждый вариант — смесь программы 7–11 классов. После каждого вопроса сразу видно, верно или нет.",
  ],
  sertXaritaTest: ["Test · {a}–{b}", "Тест · {a}–{b}"],
  sertXaritaMoslash: ["Moslash · {a}–{b}", "Соотв. · {a}–{b}"],
  sertXaritaOchiq: ["Ochiq · {a}–{b}", "Откр. · {a}–{b}"],
  sertChipTest: ["Test · {b} ball", "Тест · {b} б."],
  sertChipMoslash: ["Moslashtirish · {b} ball", "Соответствие · {b} б."],
  sertChipOchiq: ["Ochiq javob · {b} ball", "Открытый ответ · {b} б."],
  sertUmumiy: ["{a}–{b} uchun umumiy javoblar", "Общие ответы для {a}–{b}"],
  sertHarfTanla: ["Savolga mos javobning harfini tanlang", "Выберите букву подходящего ответа"],
  sertSonYoz: ["Faqat son yozing. Kasrni vergul bilan: 2,5", "Пишите только число. Дробь через запятую: 2,5"],
  sertChiqish: ["Chiqish — javoblar saqlanadi", "Выйти — ответы сохранятся"],
  sertNatijaBosh: ["{n}-variant · {vaqt}", "Вариант {n} · {vaqt}"],
  sertYetmadi: ["{d} darajaga {b} ball yetmadi", "До уровня {d} не хватило {b} б."],
  sertYoqotildi: ["Qayerda ball yo'qotildi", "Где потеряны баллы"],
  sertXatoSoni: ["{n} xato", "ошибок: {n}"],
  sertXatolar: ["Xatolar", "Ошибки"],
  sertSavolRaqam: ["{n}-savol", "Вопрос {n}"],

  /* ---------------- Reyting (yangi dizayn) ---------------- */
  reytingSinfim: ["Sinfim", "Класс"],
  reytingHamma: ["Hamma", "Все"],
  reytingBuHafta: ["Bu hafta", "Неделя"],
  reytingHammasi: ["Hammasi", "Всё время"],
  reytingSiz: ["Siz — {ism}", "Вы — {ism}"],

  /* ---------------- Ota-ona paneli (yangi dizayn) ---------------- */
  otaKunFaol: ["kun faol", "дн. активности"],
  otaDars: ["dars", "уроков"],
  otaTogri: ["to'g'ri", "верно"],
  otaHaftaDaqiqa: ["Oxirgi 7 kun, daqiqa", "Последние 7 дней, минуты"],
  otaYordam: ["Yordam kerak bo'lgan mavzu", "Тема, где нужна помощь"],
  otaYordamIzoh: ["{nom} — {jami} ta savoldan {togri} tasi to'g'ri.", "{nom} — верно {togri} из {jami}."],
  otaDarsniOch: ["Darsni ochish", "Открыть урок"],

  /* ---------------- Qidiruv (yangi dizayn) ---------------- */
  qidiruvBekor: ["Bekor", "Отмена"],
  qidiruvBoshqa: ["Boshqa", "Другое"],
  qidiruvYana: ["Yana {n} ta", "Ещё {n}"],

  /* ---------------- Kichkintoy rejimi (yangi dizayn) ---------------- */
  kichkintoyOtaOna: ["Ota-ona", "Родителям"],
  kichkintoyOtaOnaChiqish: ["Ota-ona uchun: chiqish", "Для родителей: выход"],
  kichkintoyQulfIzoh: ["Ota-ona uchun. Javobni tanlang:", "Для родителей. Выберите ответ:"],
  kichkintoyQulfXato: ["Noto'g'ri — yana urinib ko'ring", "Неверно — попробуйте ещё"],
  kichkintoyRejimi: ["Kichkintoy rejimi", "Режим для малышей"],
  kichkintoyRejimiIzoh: ["2–5 yosh", "2–5 лет"],

  /* ---------------- Men (`screens/Men.tsx`) ---------------- */
  menSarlavha: ["Men", "Я"],
  menMehmon: ["Mehmon", "Гость"],
  menAlmashtir: ["Almashtirish", "Сменить"],
  menYulduz: ["yulduz", "звёзды"],
  menTanga: ["tanga", "монеты"],
  menZanjir: ["zanjir", "серия"],
  menKun: ["{n} kun", "{n} дн."],
  menYutuqlar: ["Yutuqlar", "Достижения"],
  menOtaOnaUchun: ["Ota-ona uchun", "Для родителей"],
  menSozlamalar: ["Sozlamalar", "Настройки"],
  menReytingOrin: ["#{n} o'rin", "#{n} место"],
  menHisobot: ["Haftalik hisobot", "Недельный отчёт"],
  menProfillar: ["Bolalar profillari", "Профили детей"],
  menProfilSoni: ["{n} ta", "{n}"],
  menTelegram: ["Telegram va hisob", "Аккаунт"],
  menKimsiz: ["Siz kimsiz", "Кто вы"],

  /* ---------------- menyu (yon panel) ----------------
     Ilovaning to'liq ro'yxati. Har satrning izohi bor: menyu
     "qayerga borish mumkin" degan savolga emas, "u yerda nima bo'ladi"
     degan savolga javob berishi kerak. */
  menyu: ["Menyu", "Меню"],
  menyuIzoh: [
    "Ilovada nima bor — hammasi shu yerda",
    "Что есть в приложении — всё здесь",
  ],
  menyuTalim: ["Ta'lim", "Учёба"],
  menyuOyinBolim: ["O'yin va bellashuv", "Игры и дуэли"],
  menyuYutuq: ["Yutuq va reyting", "Награды и рейтинг"],
  menyuHisobBolim: ["Hisob va sozlamalar", "Профиль и настройки"],
  // `menyuBarchaOyin` shu yerda edi — sakkizta o'yin chipi menyudan
  // olib tashlangach kerak bo'lmay qoldi (`Menyu.tsx` dagi izohga
  // qarang). O'yinlar ro'yxati o'zining ekranida turibdi.

  /* Izohlar BIR QATORGA sig'ishi kerak.
     Telefonda menyu 360px, satrdagi matnga esa 250px qoladi — bu
     taxminan 40 belgi. Uzunroq izoh ikkinchi qatorga tushadi va har
     satr 56px dan 70px ga o'sadi: o'n to'rtta satrda bu butun bir
     ekran demak, ya'ni menyu ikki barobar uzun suriladi. */
  menyuDarslarIzoh: [
    "Bob-bob yo'l xaritasi, uchta yulduz.",
    "Карта уроков, до трёх звёзд.",
  ],
  menyuSinovIzoh: [
    "Kuniga olti savol, tangasi ikki barobar.",
    "Шесть вопросов в день, монет вдвое.",
  ],
  menyuDaftarIzoh: [
    "Qiynalgan savollar qaytib keladi.",
    "Трудные вопросы возвращаются.",
  ],
  menyuKurslarIzoh: [
    "Maktabgacha, 1–11-sinf, algebra va geometriya.",
    "До школы, 1–11 класс, алгебра и геометрия.",
  ],
  menyuOyinlarIzoh: [
    "Rekord va tanga, uch daraja.",
    "Рекорд и монеты, три уровня.",
  ],
  menyuMaydonIzoh: [
    "Kuniga bir marta, uch bosqich.",
    "Раз в день, три этапа.",
  ],
  menyuDuelIzoh: [
    "Do'st bilan bir xil savollar.",
    "С другом — одни и те же вопросы.",
  ],
  menyuNishonIzoh: [
    "Ochilgan va ochilmagan nishonlar.",
    "Открытые и закрытые награды.",
  ],
  menyuDokonIzoh: [
    "Tangaga ko'rinish sotib olinadi.",
    "За монеты — оформление.",
  ],
  menyuReytingIzoh: [
    "Barcha kurslar bo'yicha jadval.",
    "Общая таблица по всем курсам.",
  ],
  menyuOtaOnaIzoh: [
    "Bola qancha ishladi, nima qiyin.",
    "Сколько занимался, что трудно.",
  ],
  menyuSozlamaIzoh: [
    "Ism, kirish, yangi bola qo'shish.",
    "Имя, вход, добавить ребёнка.",
  ],
  menyuProfilIzoh: [
    "Bir telefonda bir nechta bola.",
    "Несколько детей на телефоне.",
  ],
  /* Til satri qisqaroq: uning o'ng tomonida UZ|RU almashtirgichi
     turadi va matnga qolgan joy boshqa satrlardagidan kam. */
  menyuTilIzoh: [
    "Ilova va bot shu tilda.",
    "Язык приложения и бота.",
  ],

  /* Yorug'lik satri ham qisqa — sababi til satri bilan bir xil. */
  menyuYoruglikIzoh: [
    "Oq, qora yoki telefondagidek.",
    "Светлое, тёмное или как в телефоне.",
  ],

  /* ---------------- menyu: ball qanday yig'iladi ----------------
     Eng ko'p so'raladigan savol. Ilgari javob hech qayerda yozilmagan
     edi: yulduz darsdan, tanga o'yindan kelardi va farqni faqat uzoq
     o'ynagan odam sezardi. */
  /* Endi u karta sarlavhasi va bosilib ochiladi — savol bo'lib
     yozilgani shuning uchun: bosiladigan narsa ekani ko'rinib tursin. */
  menyuBall: ["Ball qanday yig'iladi?", "Как начисляются баллы?"],
  menyuBallYulduz: ["Yulduz", "Звёзды"],
  menyuBallYulduzIzoh: [
    "Faqat darsda beriladi: xatosiz dars — 3 yulduz. Reyting shunga qarab tuziladi.",
    "Только за уроки: урок без ошибок — 3 звезды. По ним и строится рейтинг.",
  ],
  menyuBallTanga: ["Tanga", "Монеты"],
  menyuBallTangaIzoh: [
    "Darsda har to'g'ri javob — 2 tanga, kunlik sinovda 4. O'yinda har 3 balldan 1 tanga, kuniga birinchi o'ynaganda ikki barobar.",
    "В уроке за верный ответ — 2 монеты, в испытании дня — 4. В игре 1 монета за каждые 3 балла, а за первую игру в день — вдвое.",
  ],
  menyuBallZanjir: ["Zanjir", "Серия"],
  menyuBallZanjirIzoh: [
    "Kuniga 10 ta savol yechilsa zanjir uzilmaydi. Uzilib qolsa — tanga bilan tiklanadi.",
    "Решай 10 вопросов в день — серия не прервётся. А если прервалась, её можно восстановить за монеты.",
  ],
  menyuBallRekord: ["Rekord", "Рекорд"],
  menyuBallRekordIzoh: [
    "O'yinda yulduz yo'q: o'yin va daraja bo'yicha eng yaxshi natijang saqlanadi.",
    "В играх звёзд нет: сохраняется лучший результат по каждой игре и уровню.",
  ],

  /* ---------------- dars (Lesson) ---------------- */
  togriJavob: ["To'g'ri! 👏", "Верно! 👏"],
  deyarli: ["Deyarli! Yana urinib ko'r", "Почти! Попробуй ещё"],

  /* ---------------- yechim ----------------
     Faqat yuqori sinflarda ko'rinadi: quyi sinf generatorlari `yechim`
     bermaydi va tugma umuman chizilmaydi. */
  /* ---------------- blok test ----------------
     Faqat 7–11-sinfda ko'rinadi. Matnlar ataylab "imtihon" ohangida:
     bu yerda yulduz ham, tanga ham yo'q — ball bor. */
  blokSarlavha: ["Blok test", "Блок-тест"],
  blokTayyormi: ["{n}-sinf · imtihon sur'atida", "{n} класс · в темпе экзамена"],
  blokIzoh: [
    "Savollar aralash keladi va qaysi mavzudan ekani aytilmaydi — formulani o'zingiz tanlaysiz. Vaqt tugasa test to'xtaydi.",
    "Вопросы идут вперемешку, тема не называется — формулу выбираете сами. Когда время выйдет, тест остановится.",
  ],
  blokDtm: ["DTM sur'atida", "В темпе ДТМ"],
  blokDtmIzoh: ["savoliga 2 daqiqa", "по 2 минуты на вопрос"],
  blokToliq: ["To'liq blok", "Полный блок"],
  blokQisqa: ["Qisqa blok", "Короткий блок"],
  blokOlcham: ["{s} savol · {d} daqiqa", "{s} вопросов · {d} минут"],
  blokBosh: [
    "Bu bo'lim uchun savol topilmadi.",
    "Для этого раздела вопросы не найдены.",
  ],
  /* ---------------- uzun testdan oldingi tasdiq ---------------- */
  tasdiqSarlavha: ["{d} daqiqa vaqting bormi?", "Есть {d} минут?"],
  tasdiqIzoh: [
    "{s} savol, {d} daqiqa. Vaqt to'xtamaydi — imtihondagidek.",
    "{s} вопросов, {d} минут. Время не останавливается — как на экзамене.",
  ],
  tasdiqBoshla: ["Boshlash", "Начать"],
  tasdiqKeyinroq: ["Keyinroq", "Позже"],

  /* ---------------- yarim qolgan test ---------------- */
  blokDavomSarlavha: ["Tugallanmagan test bor", "Есть незавершённый тест"],
  blokDavomIzoh: [
    "{b} savoldan {a} tasiga javob bergansan",
    "Отвечено {a} из {b} вопросов",
  ],
  blokDavomVaqt: ["{n} daqiqa qoldi", "осталось {n} мин"],
  blokDavomTugagan: [
    "Vaqti tugab qolibdi — javoblaring saqlangan.",
    "Время вышло — ответы сохранены.",
  ],
  blokDavomTugma: ["Davom etish", "Продолжить"],
  blokDavomNatija: ["Natijani ko'rish", "Посмотреть результат"],
  blokDavomYangi: ["Yangidan boshlash", "Начать заново"],

  blokDarslarga: ["Darslarga", "К урокам"],
  blokXato: ["Xato", "Ошибка"],
  blokNatija: ["{b} savoldan {a} tasi to'g'ri", "{a} из {b} верно"],
  blokUlgurmadi: ["ULGURMADI", "НЕ УСПЕЛ"],
  blokUlgurmadiN: ["{n} ta ulgurilmadi", "не успел: {n}"],
  blokTahlil: ["Mavzular bo'yicha", "По темам"],
  blokMavzuHolat: ["{a}/{b} to'g'ri", "{a}/{b} верно"],
  blokTakrorlash: ["Takrorlash", "Повторить"],
  blokXatolar: ["Xato qilingan savollar", "Вопросы с ошибками"],
  blokYana: ["Yana topshirish", "Пройти ещё раз"],
  blokChiqish: ["Chiqish", "Выйти"],
  /* ---------------- testlar bazasi ----------------
     Darslardan ALOHIDA bo'lim: u yerda amaliy misol, bu yerda
     o'lchov. Shuning uchun matnlarda ham "o'rganish" emas,
     "tekshirish" ohangi. */
  testlarSarlavha: ["Testlar", "Тесты"],
  testlarIzoh: [
    "Istalgan bobning testini istalgan paytda topshirish mumkin — dars tugatilmagan bo'lsa ham.",
    "Тест любой главы можно пройти в любой момент — даже если урок не завершён.",
  ],
  testlarAralash: ["Butun sinf bo'yicha", "По всему классу"],
  testlarBoblar: ["Bob bo'yicha · {n} ta", "По главам · {n}"],
  testlarBobIzoh: ["{d} dars · {s} savol", "{d} уроков · {s} вопросов"],
  testlarTugma: ["Testlar", "Тесты"],
  testlarTugmaIzoh: ["Bob-bob yoki butun sinf bo'yicha", "По главам или по всему классу"],

  /* Darslar ro'yxatining sarlavhasi — testlardan ajratib turadi. */
  amaliyMisollar: ["Amaliy misollar", "Практические задания"],

  /* Kurs ekranidagi kirish tugmasi. */
  blokTugma: ["Blok test", "Блок-тест"],
  blokTugmaIzoh: ["Vaqtli, aralash mavzu, ball bilan", "На время, темы вперемешку, с баллом"],

  /* Menyudagi bo'lim nomi. Faqat 7–11-sinfda ko'rinadi. */
  menyuImtihon: ["Imtihonga tayyorgarlik", "Подготовка к экзамену"],

  /* ---------------- bosh sahifa: beshta eshik ---------------- */
  boshBolimlar: ["Bo'limlar", "Разделы"],
  boshDavom: ["Davom etish", "Продолжить"],
  boshDavomJoy: ["{bob}-bob · {dars}-dars", "глава {bob} · урок {dars}"],
  /* Har eshikning ostidagi bir qatorlik javob — "u yerda nima
     bo'ladi". Nomning o'zi buni aytmaydi: "Testlar" degan yozuv
     ichkarida nima borligi haqida hech narsa demaydi. */
  boshKichkintoyIzoh: ["Rasm, nom va ovoz", "Картинка, название и голос"],
  boshDarslarIzoh: ["Bob-bob yo'l xaritasi", "Карта по главам"],
  boshMasalalarIzoh: ["O'quvchilar yozgan, siz yechasiz", "Пишут ученики, решаете вы"],
  boshTestlarIzoh: ["Bilimni o'lchash, tartibsiz", "Проверка знаний, без порядка"],
  boshOyinlarIzoh: ["O'yin, maydon, bellashuv", "Игры, арена, дуэль"],
  boshMavzuSoni: ["{n} mavzu", "{n} тем"],
  boshOyinSoni: ["{n} o'yin", "{n} игр"],
  boshSinfOraliq: ["{a}–{b}-sinf", "{a}–{b} класс"],
  /* Kompyuterdagi bosh sahifa — eshiklarning TO'LIQ izohi. Keng
     ekranda bir qatorlik izoh kartaning yarmini bo'sh qoldirardi va
     yangi odam "ichkarida nima bor" degan savolga baribir javob
     olmasdi. Telefonda (va botda) qisqasi qoladi. */
  boshKichkintoyBatafsil: [
    "2–5 yoshli bolalar uchun: mashinalar, hayvonlar, ranglar, raqamlar. Har rasm ovoz bilan aytiladi — o'qishni bilmagan bola ham o'zi ko'radi.",
    "Для детей 2–5 лет: машины, животные, цвета, цифры. Каждая картинка озвучена — смотреть может даже ребёнок, который ещё не читает.",
  ],
  boshDarslarBatafsil: [
    "Maktab dasturi bo'yicha 0–11-sinf. Har bob kichik darslarga bo'lingan: tushuntirish, misol, keyin mashq va yulduz.",
    "Школьная программа 0–11 классов. Каждая глава разбита на короткие уроки: объяснение, пример, затем практика и звёзды.",
  ],
  boshMasalalarBatafsil: [
    "O'quvchilar va ustozlar yozgan masalalar. Yeching, izoh qoldiring yoki o'zingiz masala qo'shing.",
    "Задачи от учеников и учителей. Решайте, комментируйте или добавьте свою.",
  ],
  boshTestlarBatafsil: [
    "Sinf bo'yicha blok testlar va DTM variantlari. Vaqt bilan ishlaysiz, oxirida xatolar tahlili chiqadi.",
    "Блок-тесты по классам и варианты ДТМ. Работаете на время, в конце — разбор ошибок.",
  ],
  boshOyinlarBatafsil: [
    "Tez hisob, mantiq va xotira o'yinlari, bugungi maydon hamda do'stlar bilan bellashuv.",
    "Игры на счёт, логику и память, арена дня и дуэль с друзьями.",
  ],
  boshOchish: ["Ochish", "Открыть"],
  /* Yangi odamning birinchi ekrani — "bu nima?" degan savolga javob
     (`components/Tanishtiruv.tsx`). Qolgan qatorlar yuqoridagi
     `bosh...Batafsil` izohlaridan olinadi. */
  tanishSarlavha: ["Aql Zone", "Aql Zone"],
  tanishIzoh: ["Matematika — 2 yoshdan abituriyentgacha", "Математика — от 2 лет до абитуриента"],
  tanishYosh: ["2–5 yosh", "2–5 лет"],
  boshSalom: ["Xush kelibsiz, {ism}", "Добро пожаловать, {ism}"],
  boshSalomYangi: ["Xush kelibsiz!", "Добро пожаловать!"],
  boshSalomIzoh: [
    "Bugun nimadan boshlaymiz? Quyida hamma bo'lim bir joyda.",
    "С чего начнём сегодня? Все разделы ниже, в одном месте.",
  ],
  /* Botda — qisqa va shaxsiy: Telegram ismni o'zi beradi. */
  botSalom: ["Salom, {ism}!", "Привет, {ism}!"],
  boshQanday: ["Qanday ishlaydi", "Как это работает"],
  boshQadam1: ["Sinfingizni tanlang", "Выберите класс"],
  boshQadam1Izoh: ["Yoki bolangiznikini — har profil alohida", "Или класс ребёнка — у каждого профиля свой"],
  boshQadam2: ["Darsni yeching", "Решайте уроки"],
  boshQadam2Izoh: ["To'g'ri javob — yulduz va tanga", "Правильный ответ — звёзды и монеты"],
  boshQadam3: ["Reytingda ko'tariling", "Поднимайтесь в рейтинге"],
  boshQadam3Izoh: ["Har kuni kichik qadam — katta natija", "Каждый день по шагу — большой результат"],
  qidiruvNom: ["Qidiruv", "Поиск"],

  /* ---------------- testlar: sinf tanlash ---------------- */
  testlar: ["Testlar", "Тесты"],
  testSinfIzoh: [
    "Qaysi sinf bo'yicha o'lchaymiz?",
    "По какому классу проверяем?",
  ],
  testSinfNomi: ["{n}-sinf testlari", "Тесты {n} класса"],
  testSinfQisqa: ["{n}-sinf", "{n} класс"],
  testSinfTanlash: ["Sinf bo'yicha testlar", "Тесты по классам"],
  toplamlar: ["Test to'plamlari", "Тестовые сборники"],
  toplamlarIzoh: [
    "Hamma bir xil savollarni yechadi — natijangiz boshqalar bilan solishtiriladi",
    "У всех одинаковые вопросы — ваш результат сравнят с другими",
  ],
  toplamSavolVaqt: ["{s} savol · {d} daqiqa", "{s} вопр. · {d} мин"],
  toplamIshlaganlar: ["{n} kishi ishladi", "Решили: {n}"],
  toplamHechKim: ["Birinchi bo'ling!", "Будьте первым!"],
  toplamMening: ["Siz: {a}/{b}", "Вы: {a}/{b}"],
  toplamBoshlash: ["Testni boshlash", "Начать тест"],
  toplamQaytaIshlash: ["Yana ishlash", "Пройти ещё раз"],
  toplamOrtacha: ["O'rtacha natija", "Средний результат"],
  toplamSizning: ["Sizning natijangiz", "Ваш результат"],
  toplamQoida: [
    "Savollar hamma uchun bir xil. Jadvalga faqat BIRINCHI urinish yoziladi — shoshmang.",
    "Вопросы у всех одинаковые. В таблицу идёт только ПЕРВАЯ попытка — не спешите.",
  ],
  toplamSolishtirilyapti: ["Boshqalar bilan solishtirilyapti…", "Сравниваем с остальными…"],
  toplamBirinchiSiz: ["Siz bu testni birinchilardan bo'lib ishladingiz!", "Вы одним из первых прошли этот тест!"],
  toplamYaxshiroq: ["Ishlaganlarning {n}% idan yaxshiroq!", "Лучше, чем {n}% участников!"],
  toplamIshladi: ["{n} kishi ishladi · o'rtacha {o} / {s}", "Решили: {n} · в среднем {o} из {s}"],
  toplamQayta: [
    "Bu qayta urinish — jadvalda birinchi natijangiz qoladi: {a}/{b}.",
    "Это повторная попытка — в таблице остаётся первый результат: {a}/{b}.",
  ],
  toplamTopilmadi: ["Test to'plami topilmadi", "Сборник не найден"],
  toplamKanal: ["Kanalga joylash", "Опубликовать в канал"],
  toplamKanalda: ["Kanalda ko'rish", "Открыть в канале"],
  toplamKanalXato: ["Kanalga yuborilmadi", "Не удалось отправить"],

  /* ---------------- masalalar (foydalanuvchi yozgan) ---------------- */
  masalalar: ["Masalalar", "Задачи"],
  masalalarIzoh: [
    "Foydalanuvchilar yozgan masalalar — yeching va o'zingiznikini qo'shing",
    "Задачи от пользователей — решайте и добавляйте свои",
  ],
  masalaBitta: ["Masala", "Задача"],
  masalaYangilar: ["Yangi", "Новые"],
  masalaQiyinlar: ["Eng qiyin", "Самые сложные"],
  masalaZorlar: ["Eng zo'r", "Лучшие"],
  masalaKoplar: ["Ko'p yechilgan", "Часто решают"],
  /* Yangi dizayn: ro'yxat tepasidagi chip — "ko'p yechilgan" saralashi. */
  masalaOmmabop: ["Ommabop", "Топ"],
  masalaMenikilarTugma: ["Menikilar", "Мои"],
  masalaYozish: ["Masala yozish", "Написать задачу"],
  masalaNechaYechdi: ["{n} kishi yechdi", "решили: {n}"],
  masalaYechimQulf: ["Yechim — javob berganingizdan keyin ochiladi", "Решение откроется после вашего ответа"],
  masalaJavobdanKeyin: ["javobdan keyin", "после ответа"],
  masalaIzohlar: ["Izohlar", "Комментарии"],
  masalaIzohQulf: [
    "Izohlarda javob bo'lishi mumkin — ular yechim ochilgandan keyin ko'rinadi.",
    "В комментариях может быть ответ — они видны после того, как откроется решение.",
  ],
  masalaIzohYoq: ["Hali izoh yo'q. Qanday yechdingiz — birinchi bo'lib yozing.", "Комментариев пока нет. Напишите первым, как вы решали."],
  masalaIzohJoy: ["Izohingiz…", "Ваш комментарий…"],
  masalaIzohYubor: ["Yuborish", "Отправить"],
  masalaIzohTekshiruv: ["Tekshirilmoqda", "На проверке"],
  masalaIzohRad: ["Chiqarilmadi", "Не опубликован"],
  masalaIzohIzoh: ["Izoh tekshiruvdan keyin hammaga ko'rinadi.", "Комментарий увидят все после проверки."],
  masalaIzohKop: ["Oldingi izohlaringiz hali tekshirilmoqda — biroz kuting.", "Ваши прошлые комментарии ещё на проверке — подождите немного."],
  masalaIzohXato: ["Yuborilmadi. Internetni tekshirib, qayta urining.", "Не отправлено. Проверьте интернет и попробуйте ещё раз."],
  masalaHammaSinf: ["Hammasi", "Все"],
  // Tanlagich ustidagi yorliqlar. Ular qiymatdan ALOHIDA kerak:
  // uchta tanlagich yonma-yon turganda "Hammasi" ham sinfniki,
  // ham holatniki bo'lishi mumkin.
  masalaSinfYorliq: ["Sinf", "Класс"],
  masalaHolatYorliq: ["Holat", "Статус"],
  /* --- yechilganlik filtri --- */
  masalaHolatHammasi: ["Barchasi", "Все"],
  masalaHolatYechilmagan: ["Yechilmagan", "Нерешённые"],
  masalaHolatYechgan: ["Yechganlarim", "Решённые"],
  masalaYana: ["Yana ko'rsatish", "Показать ещё"],
  /* Sarlavhadagi tugma matni. "Masala qo'shish" u yerga sig'maydi —
     tor telefonda sarlavhani siqib, uni uch nuqtaga aylantirardi. */
  masalaYozQisqa: ["Yozish", "Написать"],
  masalaBoshSarlavha: ["Hali masala yo'q", "Пока нет задач"],
  /* Filtr natijasi bo'sh chiqqanda. "Birinchi bo'lib yozing" bu yerda
     noto'g'ri maslahat: masalalar bor, faqat boshqa sinfda. */
  masalaBoshFiltr: [
    "Bu sinfda hali masala yo'q — boshqasini tanlab ko'ring",
    "В этом классе задач пока нет — выберите другой",
  ],
  masalaYechdi: ["{n}/{jami} yechdi", "решили {n}/{jami}"],
  masalaYechgansiz: ["Yechgansiz", "Решено"],
  vaqtHozir: ["hozir", "сейчас"],
  vaqtDaqiqa: ["{n} daq", "{n} мин"],
  vaqtSoat: ["{n} soat", "{n} ч"],
  vaqtKecha: ["kecha", "вчера"],
  vaqtKun: ["{n} kun", "{n} дн"],
  masalaQaytaUrinish: ["Yecholmagansiz", "Не решено"],
  /* Kartadagi uchinchi holat: hali ochilmagan masala. */
  masalaYechilmagan: ["Yechilmagan", "Не решалась"],
  masalaQiyinlik: ["Qiyinligi", "Сложность"],
  /* Hech kim urinmagan masalada foiz yolg'on chiqadi — 0 urinishdan
     100% "oson" hosil bo'lardi. Shuning uchun nuqta o'rniga shu yozuv. */
  masalaUrinilmagan: ["Hali urinilmagan", "Ещё не решали"],
  masalaYechishTugma: ["Yechish", "Решить"],
  masalaKutmoqda: ["Navbatda", "На проверке"],
  masalaRad: ["Rad etilgan", "Отклонена"],
  /* Muallif uchun: nega masalasi hali ko'rinmayapti. */
  masalaKutmoqdaIzoh: [
    "Masala tekshiruvda. Tasdiqlangach ro'yxatda paydo bo'ladi.",
    "Задача на проверке. После одобрения появится в списке.",
  ],
  masalaTopilmadi: ["Bunday masala topilmadi", "Такая задача не найдена"],

  /* --- ulashish ---
     Matn SAVOL bo'lib yozilgan: guruhga tashlanganda odam havolani
     emas, savolni ko'radi va aynan shu bosishga undaydi. */
  masalaUlash: ["Ulashish", "Поделиться"],

  /* --- kanal (faqat admin ko'radi) --- */
  /* --- masala statistikasi --- */
  /* Hech kim urinmaganda foiz yo'q — 0 dan foiz chiqmaydi. */
  masalaBirinchiIzoh: [
    "Birinchi urinish hisobga olinadi",
    "Считается первая попытка",
  ],

  masalaKanal: ["Kanalga yuborish", "Отправить в канал"],
  masalaKanalSorov: ["Kanalga yuboraymi?", "Отправить в канал?"],
  masalaKanalHa: ["Ha, yubor", "Да, отправить"],
  masalaKanalYoq: ["Yo'q", "Нет"],
  masalaKanalBordi: ["Kanalga yuborildi", "Отправлено в канал"],
  masalaKanalKorish: ["Kanalda ko'rish", "Открыть в канале"],
  masalaKanalXato: ["Yuborilmadi — qaytadan urining", "Не отправилось — попробуйте снова"],
  masalaKanalQayta: ["Qayta yuborish", "Отправить заново"],
  masalaKanalQaytaSorov: [
    "Qayta yuboraymi? Eskisi kanaldan o'chiriladi.",
    "Отправить заново? Старый пост будет удалён.",
  ],
  masalaKanalYoqdi: ["Kanalda topilmadi", "Не найдено в канале"],
  masalaKanalTekshirildi: ["tekshirildi", "проверено"],

  /* --- tanga: animatsiya va sarflash ruxsati --- */
  tangaQoshildi: ["{n} tanga qo'shildi", "Добавлено {n} монет"],
  tangaSarflandi: ["{n} tanga sarflandi", "Потрачено {n} монет"],
  tangaSorovSarlavha: ["Tanga sarflaymizmi?", "Потратить монеты?"],
  tangaYetmadiSarlavha: ["Tanga yetmadi", "Не хватает монет"],
  tangaSorovNarx: ["Narxi", "Цена"],
  tangaSorovBor: ["Hozir bor", "Сейчас есть"],
  tangaSorovQoladi: ["Qoladi", "Останется"],
  tangaSorovYetmaydi: ["Yetmayapti", "Не хватает"],
  tangaSorovHa: ["Ha, sarflayman", "Да, потратить"],
  tangaSorovYoq: ["Kerak emas", "Не нужно"],
  tangaSorovYopish: ["Yopish", "Закрыть"],
  tangaSorovYechim: [
    "Bu masalaning to'liq yechimi ochiladi",
    "Откроется полное решение этой задачи",
  ],

  /* --- test variantlari --- */
  masalaTestBelgi: ["Test", "Тест"],
  masalaVariantTanla: ["Javob variantini tanlang", "Выберите вариант ответа"],
  masalaVariantYoq: ["Variant tanlanmadi", "Вариант не выбран"],
  masalaTuriSavol: ["Javob qanday olinadi?", "Как принимается ответ?"],
  masalaTuriYozma: ["Javob yoziladi", "Ответ пишется"],
  masalaTuriTest: ["Variantlardan tanlanadi", "Выбор из вариантов"],
  masalaVariantlar: ["Variantlar", "Варианты"],
  masalaVariantJoy: ["{n}-variant", "Вариант {n}"],
  masalaVariantQosh: ["Variant qo'shish", "Добавить вариант"],
  masalaVariantTogri: ["To'g'risini belgilang", "Отметьте правильный"],
  masalaVariantKam: [
    "Kamida {n} ta variant yozing",
    "Напишите минимум {n} варианта",
  ],
  masalaVariantTakror: [
    "Variantlar bir xil bo'lmasin",
    "Варианты не должны повторяться",
  ],
  masalaVariantTogriYoq: [
    "To'g'ri variantni belgilang",
    "Отметьте правильный вариант",
  ],
  tekshirVariantSoni: ["{n} ta variant", "{n} варианта"],

  /* --- masala ekrani: qiyinlik va bo'lim sarlavhalari --- */
  qiyinOson: ["Oson", "Лёгкая"],
  qiyinOrta: ["O'rta", "Средняя"],
  qiyinQiyin: ["Qiyin", "Сложная"],
  qiyinJuda: ["Juda qiyin", "Очень сложная"],
  masalaShartSarlavha: ["Masala #{n}", "Задача №{n}"],
  masalaJavobSarlavha: ["Javobingizni yozing", "Напишите свой ответ"],
  masalaYechganFoiz: [
    "{n}% birinchi urinishda topgan",
    "{n}% решили с первой попытки",
  ],
  masalaHechKim: ["Hali hech kim urinmagan", "Ещё никто не пробовал"],
  masalaJamiUrinish: [
    "Jami {n} ta urinish · {y} ta yechgan",
    "Всего {n} попыток · решили {y}",
  ],
  masalaBirinchiBol: ["Birinchi bo'ling", "Будьте первым"],
  masalaShartKor: ["Shartni ko'rish", "Показать условие"],
  // Ochiq shartning sarlavhasi. "Yopish" edi — ochilgan zahoti
  // kartaning birinchi so'zi buyruq bo'lib, chalkash o'qilardi.
  masalaShartYop: ["Shart", "Условие"],
  masalaYechgandingiz: ["Bu masalani yechgansiz", "Вы решили эту задачу"],
  masalaYechimOchilgan: ["Yechim ochilgan", "Решение открыто"],
  masalaMuallifJami: [
    "Muallifning {n} ta masalasi bor",
    "У автора {n} задач"
  ],
  masalaBarchasi: ["Barchasi", "Все"],
  masalalarShior: [
    "Yeching, tanga yig'ing, o'zingiznikini qo'shing",
    "Решайте, копите монеты, добавляйте свои",
  ],
  masalaTopildi: ["{n} ta masala topildi", "Найдено задач: {n}"],
  masalaSaralash: ["Saralash", "Сортировка"],
  /* Tugmaning ekran o'qigich uchun nomi — u BOSILGANDA nima
     bo'lishini aytadi, hozirgi holatni emas. */
  masalaYangidan: ["Teskarisiga: eskisidan boshlab", "Наоборот: от старых"],
  masalaEskidan: ["Teskarisiga: yangisidan boshlab", "Наоборот: от новых"],
  masalaNavbatdagi: ["Navbatdagi masala", "Следующая задача"],
  masalaKorildi: ["{n} kishi ochgan", "Открыли {n} человек"],
  masalaKorildiIzoh: [
    "Bir odam necha marta ochsa ham bir marta sanaladi",
    "Один человек считается один раз, сколько бы раз ни открыл",
  ],

  /* --- admin: kim urinib ko'rgan --- */
  masalaKimlar: ["Kim urinib ko'rgan", "Кто пробовал"],
  toplamKimIshlagan: ["Kim ishlagan", "Кто решал"],
  toplamIshlaganYoq: ["Hali hech kim ishlamagan", "Ещё никто не решал"],
  masalaKimlarOch: ["Ro'yxatni ochish", "Открыть список"],
  masalaKimlarYoq: ["Hali hech kim urinmagan", "Ещё никто не пробовал"],
  masalaKimlarXato: ["Ro'yxat kelmadi", "Список не загрузился"],
  masalaKimBirinchi: ["birinchi urinishda", "с первой попытки"],
  masalaKimYechdi: ["{n}-urinishda", "с {n}-й попытки"],
  masalaKimYecholmagan: ["{n} marta urindi", "{n} попыток"],
  tekshirVariantHarxil: ["Variantlar har xil", "Варианты различаются"],
  tekshirVariantTogri: [
    "To'g'ri javob: {javob}",
    "Правильный ответ: {javob}",
  ],
  masalaUlashMatn: [
    "Bu masalani yecha olasanmi? 🤔",
    "Сможешь решить эту задачу? 🤔",
  ],
  /* To'g'ri javobdan keyin — eng ko'p ulashiladigan payt. */
  masalaUlashTogri: ["Do'stlaringni sinab ko'r", "Проверь друзей"],

  /* --- yechish --- */
  masalaJavobJoy: ["Javobingiz", "Ваш ответ"],
  masalaTekshir: ["Tekshirish", "Проверить"],
  /* Emoji matndan OLINDI: natija bo'lagida u endi alohida belgi
     bo'lib, doiracha ichida turadi (`screens/Masala.tsx`). Matnda
     ham qolsa, ekranda ikkita bayram belgisi chiqardi. */
  masalaTogri: ["To'g'ri!", "Верно!"],
  masalaBahoSarlavha: ["Yechding!", "Решено!"],
  masalaBahoBirinchi: ["Birinchi urinishdayoq — zo'r!", "С первой попытки — отлично!"],
  masalaBahoUrinish: ["{n}-urinishda topding — qoyil!", "Нашёл с {n}-й попытки — молодец!"],
  masalaBahoSavol: ["Masala senga yoqdimi?", "Понравилась задача?"],
  masalaBahoYoqdi: ["Yoqdi", "Нравится"],
  masalaBahoYoqmadi: ["Yoqmadi", "Не нравится"],
  masalaBahoRahmat: ["Rahmat! Bahoing muallifga yetib bordi", "Спасибо! Автор увидит твою оценку"],
  masalaBahoKeyingi: ["Keyingi masalaga o'tamizmi?", "Перейдём к следующей?"],
  masalaBahoYechim: ["Avval yechimni ko'raman", "Сначала посмотрю решение"],
  masalaBahoRoyxat: ["Boshqa masala tanlash", "Выбрать другую задачу"],
  masalaXato: ["Bu safar bo'lmadi", "В этот раз не вышло"],
  /* Xato javobdan keyin — javob ko'rsatilmaydi, qayta urinish taklif
     qilinadi. Ilgari to'g'ri javob darhol chiqib, ikkinchi urinish
     uchun sabab qolmasdi. */
  masalaYanaUrin: [
    "Yana bir bor o'ylab ko'ring — javobni o'zgartirib yuboring",
    "Подумайте ещё раз — измените ответ и отправьте",
  ],
  masalaTangaOldingiz: ["+{n} tanga", "+{n} монет"],
  masalaTangaIzoh: [
    "Birinchi urinishda ko'proq beriladi",
    "За первую попытку дают больше",
  ],
  masalaYechimOch: ["Yechimni ko'rish — {n} tanga", "Открыть решение — {n} монет"],
  masalaYechimBepul: ["Yechimni ko'rish", "Открыть решение"],
  masalaTangaYetmadi: [
    "Tanga yetmadi — yana {n} ta kerak",
    "Не хватает монет — нужно ещё {n}",
  ],
  masalaTogriJavob: ["To'g'ri javob: {javob}", "Правильный ответ: {javob}"],
  /* Javobning O'ZI endi alohida yorliqcha bo'lib turadi, shuning
     uchun nomi ham matndan ajratildi (`screens/Masala.tsx`). */
  masalaTogriJavobNomi: ["To'g'ri javob:", "Правильный ответ:"],
  masalaYechim: ["Yechim", "Решение"],
  /* Yechim yopiqligining SABABI aytiladi. "Yopiq" degan quruq
     yozuv odamni faqat jahlini chiqarardi — u nega yopiqligini va
     qanday ochilishini bilmasdi. */
  masalaYechimYopiq: [
    "Yechim javob berganingizdan keyin ochiladi — xato bo'lsa ham.",
    "Решение откроется после ответа — даже если он неверный.",
  ],
  masalaOzOvoz: ["O'z masalangizga ovoz bera olmaysiz", "Нельзя голосовать за свою задачу"],

  /* --- muallif --- */
  masalaMuallif: ["Muallif", "Автор"],
  masalaMuallifKor: ["Muallifning boshqa masalalari", "Другие задачи автора"],
  masalaSoni: ["masala", "задач"],
  masalaYechilgan: ["yechildi", "решили"],
  masalaMuallifBosh: ["Hali tasdiqlangan masalasi yo'q", "Пока нет одобренных задач"],

  /* --- yozish --- */
  masalaYoz: ["Masala qo'shish", "Добавить задачу"],
  masalaYozIzoh: [
    "O'zingiz o'ylagan masalani yozing — hamma yechadi",
    "Напишите свою задачу — её будут решать все",
  ],
  masalaYozTepa: [
    "Tekshiruvdan o'tgach hammaga ko'rinadi",
    "После проверки её увидят все",
  ],
  /* --- qadamlar --- */
  masalaQadam: ["{n}-qadam · {jami} tadan", "Шаг {n} из {jami}"],
  masalaOrtga: ["Ortga", "Назад"],
  masalaKeyingi: ["Keyingi", "Далее"],

  /* 1-qadam */
  masalaQaysiSinf: ["Masala kimga?", "Для кого задача?"],
  masalaKimgaIzoh: ["Buni siz belgilaysiz", "Это выбираете вы"],
  masalaMaktab: ["Maktab o'quvchisi", "Школьнику"],
  masalaMaktabIzoh: ["Darslik dasturi bo'yicha", "По школьной программе"],
  masalaKattalarIzoh: ["Yosh chegarasi yo'q", "Без ограничения возраста"],
  masalaOlimpiadaIzoh: ["Darslikdan tashqari, hiylali", "Вне учебника, с хитростью"],

  /* 2-qadam */
  masalaQaysiSinfBosh: ["Qaysi sinf?", "Какой класс?"],
  masalaSinfIzoh: ["Surish shart emas — hammasi shu yerda", "Листать не нужно — все здесь"],
  masalaQaysiFan: ["Qaysi fan?", "Какой предмет?"],

  /* 3-qadam */
  masalaMatnBosh: ["Masala", "Задача"],
  masalaShart: ["Shart", "Условие"],

  /* 4-qadam */
  masalaTekshirBosh: ["Tekshirib chiqing", "Проверьте"],
  masalaTekshirIzoh: ["O'zgartirish uchun bosing", "Нажмите, чтобы изменить"],
  masalaOzgartirish: ["o'zgartirish", "изменить"],
  masalaShundayKoradi: ["Yechuvchi shunday ko'radi", "Так увидит решающий"],
  masalaChizmaYoq: ["Chizma — yo'q, shart emas", "Чертёж — нет, не обязателен"],
  masalaChizmaBor: ["Chizma qo'shildi", "Чертёж добавлен"],

  /* --- tekshiruv belgilari ---
     Ular faqat SHAKL haqida gapiradi. Matematikaning to'g'riligini
     bu yerdagi hech narsa tekshirmaydi va yozuvlar buni va'da ham
     qilmaydi (`lib/masalaTekshir.ts` dagi izohga qarang). */
  tekshirUzunlik: ["{n} belgi", "{n} символов"],
  tekshirQisqa: ["Yana {n} ta belgi kerak", "Нужно ещё {n} символов"],
  tekshirSavol: ["Savol bor", "Вопрос есть"],
  tekshirSavolYoq: ["Savol ko'rinmadi — nima topilishi kerak?", "Вопрос не виден — что нужно найти?"],
  tekshirJavobQisqa: ["Qisqa va aniq", "Коротко и ясно"],
  tekshirJavobUzun: ["Uzunroq — bu yechim emasmi?", "Длинновато — это не решение?"],
  tekshirJavobSon: ["Son — tekshirish oson bo'ladi", "Число — проверять проще"],
  tekshirJavobSonsiz: ["Sonsiz javob — yechuvchi topishi qiyin", "Ответ без числа — решающему сложнее"],
  tekshirYechimUzunlik: ["Tushuntirish bor", "Объяснение есть"],
  tekshirYechimQisqa: ["Yana {n} ta belgi kerak", "Нужно ещё {n} символов"],
  tekshirQadam: ["{n} ta qadam", "Шагов: {n}"],
  tekshirQadamYoq: ["Amal ko'rinmadi — qadamlarni yozing", "Действий не видно — распишите шаги"],
  tekshirJavobBor: ["Javob ({javob}) yechimda chiqdi", "Ответ ({javob}) есть в решении"],
  tekshirJavobYoq: [
    "Javob ({javob}) yechimda uchramadi — mos kelyaptimi?",
    "Ответа ({javob}) нет в решении — они совпадают?",
  ],
  masalaKattalar: ["Kattalar uchun", "Для взрослых"],
  masalaOlimpiada: ["Olimpiada", "Олимпиада"],
  masalaKursdanTashqari: ["Maktab dasturidan tashqari", "Вне школьной программы"],
  masalaSinflar: ["Maktab dasturi", "Школьная программа"],

  /* --- rasm --- */
  masalaRasm: ["Chizma yoki rasm", "Чертёж или картинка"],
  /* Ixtiyoriyligi AYTILADI: majburiy deb o'ylagan odam rasm
     topolmasa, masalani umuman yozmay qo'yardi. */
  masalaRasmIzoh: [
    "Ixtiyoriy — geometriya va jadval uchun qulay",
    "Необязательно — удобно для геометрии и таблиц",
  ],
  masalaRasmTanla: ["Rasm tanlash", "Выбрать картинку"],
  masalaRasmOchir: ["Rasmni olib tashlash", "Убрать картинку"],
  masalaRasmKatta: ["Rasm juda katta — 6 MB gacha bo'lsin", "Слишком большая — до 6 МБ"],
  masalaRasmXato: ["Bu fayl rasm emas", "Это не картинка"],
  masalaMatni: ["Masala", "Задача"],
  masalaMatniIzoh: [
    "Masala shartini to'liq yozing…",
    "Напишите условие задачи полностью…",
  ],
  masalaJavobi: ["Javob", "Ответ"],
  masalaJavobiJoy: ["Masalan: 12 yoki 3.5", "Например: 12 или 3.5"],
  /* Javob qanday solishtirilishi AYTILADI: muallif "12 ta olma"
     deb yozib qo'ysa, "12" deb javob bergan bola xato oladi. */
  masalaJavobiIzoh: [
    "Qisqa yozing. Bo'sh joy va harf katta-kichikligi ahamiyatsiz.",
    "Пишите кратко. Пробелы и регистр не важны.",
  ],
  masalaYechimi: ["Yechim", "Решение"],
  masalaYechimiIzoh: [
    "Qadam-baqadam tushuntiring — bu majburiy…",
    "Объясните по шагам — это обязательно…",
  ],
  masalaYanaBelgi: ["Yana {n} ta belgi kerak", "Нужно ещё {n} символов"],
  masalaNavbatIzoh: [
    "Masala darhol ko'rinmaydi: avval tekshiriladi. Tasdiqlangach tanga olasiz va hamma uni yecha boshlaydi.",
    "Задача появится не сразу: сначала проверка. После одобрения вы получите монеты, и её начнут решать.",
  ],
  masalaYubor: ["Yuborish", "Отправить"],
  masalaKunlikChegara: [
    "Bugunga yetarli — ertaga yana yozishingiz mumkin.",
    "На сегодня достаточно — завтра можно снова.",
  ],

  /* --- o'z masalalarim --- */
  masalaMenikilar: ["Mening masalalarim", "Мои задачи"],
  /* Sarlavha qatorida to'liq nom sig'maydi va uch nuqtaga aylanardi. */
  masalaMenikilarQisqa: ["Mening", "Мои"],
  masalaMenikilarBosh: [
    "Hali masala yozmagansiz. Birinchisini qo'shib ko'ring!",
    "Вы ещё не писали задач. Попробуйте добавить первую!",
  ],
  masalaBugungi: ["Bugun: {n}/{jami}", "Сегодня: {n}/{jami}"],

  /* ---------------- umumiy qidiruv ---------------- */
  qidiruvSarlavha: ["Qidiruv", "Поиск"],
  qidiruvTugma: ["Qidirish", "Поиск"],
  qidiruvJoy: ["Dars, formula, o'yin…", "Урок, формула, игра…"],
  /* Izohda ATAYLAB SONLAR turibdi. "Nimani qidirsam bo'ladi?" degan
     savolga "hamma narsani" deb javob berish hech narsa demaydi;
     "637 dars" esa ilovaning hajmini bir qarashda ko'rsatadi va
     odam qidirishga jur'at qiladi. Son qo'lda yozilmaydi —
     `Qidiruv.tsx` uni indeksdan oladi. */
  qidiruvIzoh: [
    "{n} ta joy bo'ylab: darslar, boblar, formulalar, o'yinlar.",
    "По {n} записям: уроки, главы, формулы, игры.",
  ],
  qidiruvNatija: ["{n} ta natija", "Найдено: {n}"],
  qidiruvTopilmadi: [
    "«{nima}» bo'yicha hech narsa topilmadi",
    "По запросу «{nima}» ничего не найдено",
  ],
  /* Qulflangan dars bosilganda kurs xaritasi ochiladi. Yorliq shuni
     OLDINDAN aytadi — aks holda ekran sakragandek tuyulardi.

     QISQA bo'lishi shart: u har qatorda takrorlanadi va yangi
     hisobda deyarli HAMMA dars qulflangan bo'ladi. Uzun jumla
     bo'lganda ro'yxat bir xil gapning yigirma nusxasiga aylanardi. */
  qidiruvQulf: ["qulf", "закрыт"],
  qidiruvDars: ["dars", "урок"],
  qidiruvBob: ["bob", "глава"],
  qidiruvKurs: ["kurs", "курс"],
  qidiruvFormula: ["formula", "формула"],
  qidiruvOyin: ["o'yin", "игра"],
  qidiruvKichkintoy: ["kichkintoy", "малышам"],
  qidiruvBolim: ["bo'lim", "раздел"],

  /* ---------------- formulalar varaqasi ---------------- */
  formulaSarlavha: ["Formulalar", "Формулы"],
  formulaIzoh: [
    "Esdan chiqqanda shu yerga qarang — qidiruvga chiqib ketish shart emas.",
    "Забыли формулу — посмотрите здесь, выходить в поиск не нужно.",
  ],
  formulaQidiruv: ["Qidirish: sinus, yuza, hosila…", "Поиск: синус, площадь, производная…"],
  formulaTopilmadi: ["Bunday formula topilmadi", "Такая формула не найдена"],
  formulaSinf: ["{n}-sinf", "{n} класс"],
  formulaTugma: ["Formulalar", "Формулы"],
  /* Izoh ATAYLAB umumiy: ro'yxat 5-sinfdagi perimetrdan
     11-sinfdagi integralgacha yetadi va aniq misol keltirilsa,
     u sinflarning yarmiga to'g'ri kelmasdi. */
  formulaTugmaIzoh: ["Kerakli formulalar bir joyda", "Нужные формулы в одном месте"],

  /* ---------------- o'z hisoboti ----------------
     Ota-ona panelidan farqli: bu yerda uchinchi shaxs yo'q. Matnlar
     o'quvchining O'ZIGA qaratilgan va maqtov emas, o'lchov beradi. */
  hisobotSarlavha: ["Mening natijam", "Мой результат"],
  hisobotOrtacha: ["O'RTACHA", "СРЕДНИЙ"],
  hisobotEng: ["ENG YAXSHI", "ЛУЧШИЙ"],
  hisobotTest: ["TEST", "ТЕСТОВ"],
  hisobotOsdi: ["Ball {n}% ga o'sdi", "Балл вырос на {n}%"],
  hisobotTushdi: ["Ball {n}% ga tushdi", "Балл упал на {n}%"],
  hisobotTekis: ["Ball o'zgarmadi", "Балл не изменился"],
  hisobotOsishIzoh: [
    "Oxirgi 5 ta test avvalgi 5 tasi bilan taqqoslandi.",
    "Последние 5 тестов сравнены с предыдущими 5.",
  ],
  hisobotGrafik: ["Ball qanday o'zgardi", "Как менялся балл"],
  hisobotOxirgi: ["Oxirgi {n} ta test", "Последние {n} тестов"],
  hisobotTarix: ["Topshirilgan testlar", "Пройденные тесты"],
  hisobotQator: ["{b} savoldan {a} tasi", "{a} из {b}"],
  hisobotJamiVaqt: ["Testlarga jami {v} sarflandi", "На тесты потрачено {v}"],
  hisobotDaqiqa: ["{n} daqiqa", "{n} мин"],
  hisobotSekund: ["{n} soniya", "{n} сек"],
  hisobotYangiTest: ["Yangi test topshirish", "Пройти новый тест"],
  /* Nomi `hisobotBosh` EMAS: shu nomli kalit allaqachon ota-ona
     panelida bor va u boshqa gapni aytadi. */
  natijamBosh: [
    "Hali bitta ham blok test topshirilmagan. Birinchisidan keyin shu yerda ball, o'sish grafigi va butun tarix paydo bo'ladi.",
    "Пока не пройдено ни одного блок-теста. После первого здесь появятся балл, график роста и вся история.",
  ],
  hisobotTugma: ["Mening natijam", "Мой результат"],
  hisobotTugmaIzoh: ["Ball, o'sish grafigi, testlar tarixi", "Балл, график роста, история тестов"],

  yechimSarlavha: ["Qanday yechiladi", "Как решается"],
  yechimniKor: ["Yechimni ko'rish", "Посмотреть решение"],
  yechimJavob: ["To'g'ri javob", "Верный ответ"],
  yechimTushundim: ["Tushundim", "Понятно"],
  yop: ["Yopish", "Закрыть"],
  zorIsh: ["Zo'r ish!", "Отличная работа!"],
  yulduzJami: ["Jami yulduzing", "Всего звёзд"],
  yulduzYangi: ["yangi", "новая"],
  yulduzQoshildi: ["+{n} yulduz qo'shildi!", "+{n} звезды добавлено!"],
  yulduzOldinEdi: [
    "Oldin {oldin} ta edi — endi {yangi} ta!",
    "Было {oldin} — стало {yangi}!",
  ],
  yulduzRekord: [
    "Bu darsdagi rekording {n} ta. Undan ko'p olsang, qo'shiladi!",
    "Твой рекорд здесь — {n}. Набери больше, и они добавятся!",
  ],
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
  turYorliqlar: [
    "Testlar, formulalar va xatolar daftari shu yerda — bir bosishda.",
    "Тесты, формулы и тетрадь ошибок — здесь, в одно касание.",
  ],
  turBoblar: [
    "Darslar boblarga bo'lingan. Bobni ochsang, ichidagi darslar chiqadi.",
    "Уроки собраны в главы. Откроешь главу — увидишь её уроки.",
  ],
  turPanel: [
    "Pastda besh bo'lim. Nishonlar, do'kon, reyting va ota-ona paneli — \"Men\" da.",
    "Внизу пять разделов. Награды, магазин, рейтинг и панель родителей — в «Я».",
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

  /* --- kamyob qavat: tanga yetarli emas, shart ham kerak --- */
  bOlov: ["Olov", "Огонь"],
  bBilim: ["Bilim shohi", "Король знаний"],
  bKubok: ["Kubok", "Кубок"],
  bKometa: ["Kometa", "Комета"],
  bOlmos: ["Olmos", "Алмаз"],
  bAjdar: ["Ajdar", "Дракон"],
  kamyob: ["Kamyob", "Редкое"],
  shartYulduz: ["{n} yulduz kerak", "Нужно {n} звёзд"],
  shartZanjir: ["{n} kunlik zanjir kerak", "Нужна серия {n} дней"],
  /* Bezak endi boshqalarga ham ko'rinadi — do'konning butun ma'nosi
     shunda. Ilgari uni faqat bolaning o'zi ko'rardi. */
  bezakIzoh: [
    "Kiygan buyumingiz reytingda va masalalarda ko'rinadi",
    "Надетый предмет виден в рейтинге и в задачах",
  ],

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
  otaHisobot: ["Haftalik hisobot Telegram'ga", "Отчёт за неделю в Telegram"],
  otaHisobotVaqt: ["Har yakshanba 20:00", "Каждое воскресенье в 20:00"],
  otaHisobotTelegramsiz: ["Avval Telegram'ni ulang — Sozlamalar", "Сначала подключите Telegram — Настройки"],
  reytingDostlar: ["Do'stlar", "Друзья"],
  reytingDostYoq: [
    "Bu yerda duel o'ynagan do'stlaringiz chiqadi. Do'stingizni chaqiring — kim ko'proq yulduz yig'ishini ko'rasiz.",
    "Здесь появятся друзья, с которыми вы играли дуэль. Позовите друга — и увидите, кто соберёт больше звёзд.",
  ],
  reytingDostChaqir: ["Do'stni duelga chaqirish", "Позвать друга на дуэль"],
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

  /* Oylarning qisqa nomi.
     Nega `Intl` ishlatilmaydi: `uz-UZ` lokali brauzerlarda to'liq
     emas va `{ month: "short" }` o'zbekcha nom o'rniga "M08" degan
     kodni qaytaradi. Ro'yxat kichik, tarjimasi esa aniq. */
  oyQisqa: [
    "yan,fev,mar,apr,may,iyn,iyl,avg,sen,okt,noy,dek",
    "янв,фев,мар,апр,май,июн,июл,авг,сен,окт,ноя,дек",
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

  /* ---------------- yorug'lik: oq va qora ---------------- */
  yoruglikSarlavha: ["Ko'rinish", "Оформление"],
  yoruglikIzoh: [
    "Oq yoki qora. «Avtomatik» telefon sozlamasiga ergashadi.",
    "Светлое или тёмное. «Авто» следует настройке телефона.",
  ],
  yoruglikAvto: ["Avtomatik", "Авто"],
  yoruglikOq: ["Oq", "Светлое"],
  yoruglikQora: ["Qora", "Тёмное"],
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
    "Telegram ma'lumoti kelmadi. Ilovani yopib, botga /start yozing va yashil «🎓 Ilovani ochish» tugmasini bosing.",
    "Данные Telegram не пришли. Закройте приложение, отправьте боту /start и нажмите зелёную кнопку «🎓 Открыть приложение».",
  ],
  tgSozlanmagan: [
    "Telegram orqali kirish sozlanmagan. Iltimos, keyinroq urinib ko'ring.",
    "Вход через Telegram не настроен. Пожалуйста, попробуйте позже.",
  ],
  /* Botdagi tugma nomi o'zgardi: "Saytga kirish" olib tashlandi va
     endi ilova Telegram ICHIDA ochiladi. Matn ham shunga moslashdi —
     aks holda odam bo'lmagan tugmani qidirardi. */
  // AYNAN «Ilovani ochish» tugmasi aytiladi, klaviaturadagi «Darslar»
  // emas. Ikkalasi ham ilovani ochadi, lekin Telegram pastdagi
  // klaviaturadan ochilgan ilovaga hisob ma'lumotini BERMAYDI — ya'ni
  // eski maslahat odamni aynan shu ekranga qaytarardi.
  botIzoh: [
    "Botga /start yozing va yashil «🎓 Ilovani ochish» tugmasini bosing — ilova shu yerda ochiladi va avtomatik kirasiz.",
    "Отправьте боту /start и нажмите зелёную кнопку «🎓 Открыть приложение» — приложение откроется здесь, вход произойдёт автоматически.",
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
  kanalMajburiyIzoh: ["Ilovadan foydalanish uchun kanalga a'zo bo'ling, keyin «A'zo bo'ldim» ni bosing.", "Чтобы пользоваться приложением, подпишитесь на канал и нажмите «Я подписался»."],
  kanalAzoBoldim: ["A'zo bo'ldim", "Я подписался"],
  kanalTekshirilmoqda: ["Tekshirilmoqda…", "Проверяем…"],
  kanalHaliYoq: ["Hali a'zo emassiz. Kanalga qo'shiling va qayta bosing.", "Вы ещё не подписаны. Подпишитесь и нажмите снова."],

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
  bundayOyin: ["Bunday o'yin", "Такая игра"],
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

  /* ---------------- duel shartlari (chaqirgan tanlaydi) ---------------- */
  duelShartlar: ["Shartlarni tanlang", "Выберите условия"],
  duelOyinTanla: ["O'yin", "Игра"],
  duelSavollarSoni: ["Savollar", "Вопросы"],
  duelVaqtSoni: ["Vaqt", "Время"],
  duelSoniya: ["{n} s", "{n} с"],
  duelShartIzoh: [
    "Ikkalangiz bir xil savollarni, bir xil tartibda olasiz.",
    "Вы оба получите одинаковые вопросы в одном порядке.",
  ],
  /* 2026-09-26: soddalashgan chaqiruv ekrani — kim bilan, o'yin, tugma. */
  duelKimBilan: ["Kim bilan?", "С кем?"],
  duelHavolaBilan: ["Havola", "Ссылка"],
  duelHavolaIzoh: [
    "Havolani istalgan do'stingizga yuborasiz",
    "Отправите ссылку любому другу",
  ],
  duelOdamniChaqir: ["{ism}ni chaqirish", "Позвать: {ism}"],
  duelJonliBilan: ["{ism} bilan jonli", "Вживую: {ism}"],
  duelSozlamaQator: [
    "{savollar} savol · {vaqt} s",
    "{savollar} вопр. · {vaqt} с",
  ],
  duelOzgartirish: ["O'zgartirish", "Изменить"],
  duelYopish: ["Yopish", "Свернуть"],
  duelShartYakun: [
    "{oyin} · {savollar} savol · {vaqt} s",
    "{oyin} · вопросов: {savollar} · {vaqt} с",
  ],

  /* ---------------- duel: Telegram talab qilinadi ---------------- */
  duelTgKerak: ["Bellashuv Telegram orqali", "Дуэль — через Telegram"],
  duelTgIzoh: [
    "Bellashuvda ismingiz raqibingizga ko'rinadi va natija ikkalangizda saqlanadi — shuning uchun u Telegram hisobi bilan o'ynaladi.",
    "В дуэли соперник видит ваше имя, а результат сохраняется у обоих — поэтому она играется с аккаунтом Telegram.",
  ],
  duelTgTugma: ["Telegramda ochish", "Открыть в Telegram"],
  duelTgTagIzoh: [
    "Tugma bellashuvni Telegramda to'g'ridan-to'g'ri ochadi.",
    "Кнопка откроет дуэль прямо в Telegram.",
  ],
  duelTgChaqiruv: [
    "Sizni bellashuvga chaqirishdi. Ochish uchun Telegram kerak.",
    "Вас вызвали на дуэль. Чтобы открыть, нужен Telegram.",
  ],
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
  /* Onlayn ro'yxat: do'sti yo'q bola ham raqib topsin. */
  duelOnlayn: ["Hozir ilovada — {n} ta", "Сейчас в приложении — {n}"],
  duelChaqir: ["Chaqirish", "Позвать"],
  /* Hech kim onlayn bo'lmaganda sarlavha o'zgaradi: "hozir ilovada
     — 0 ta" degan yozuv bo'limni buzuq ko'rsatardi. */
  duelKimChaqirish: ["Kimni chaqirsa bo'ladi", "Кого можно позвать"],
  duelHozir: ["hozir ilovada", "сейчас в приложении"],
  duelDaqiqaOldin: ["{n} daqiqa oldin", "{n} мин назад"],
  duelSoatOldin: ["{n} soat oldin", "{n} ч назад"],
  duelHechKim: [
    "Hozircha hech kim yo'q. Chaqiruv yasab, havolasini do'stingizga yuboring — u istalgan vaqtda ochadi.",
    "Пока никого нет. Создайте вызов и отправьте ссылку другу — он откроет её в любое время.",
  ],
  /* O'yinlar ekranidagi duel banneri va kartalardagi "• 2". */
  duelBanner: ["Duel — raqib toping", "Дуэль — найдите соперника"],
  /* Telefonda banner tor — izoh bir qatorga sig'adigan qisqa. */
  duelBannerIzoh: ["{n} ta o'yinda jonli bellashuv", "Живая дуэль в {n} играх"],
  duelBannerOyinda: ["{n} kishi hozir o'yinlarda", "{n} чел. сейчас в играх"],
  duelBannerOnlayn: ["{n} kishi hozir ilovada", "{n} чел. в приложении"],
  duelBannerHechKim: ["Do'stingizni chaqiring", "Позовите друга"],
  duelKirish: ["Kirish", "Войти"],
  oyinKartaDuel: ["duel", "дуэль"],
  oyinKartaHozir: ["{n} kishi hozir o'ynayapti", "Сейчас играют: {n}"],
  /* Odamning holati — chaqirish tugmasi shunga qarab o'zgaradi. */
  duelHolatBosh: ["hozir bo'sh", "сейчас свободен"],
  duelHolatOyinda: ["{oyin} o'ynayapti", "играет: {oyin}"],
  duelHolatOyindaIzoh: ["o'yini tugagach ko'radi", "увидит после игры"],
  duelHolatDuelda: ["duelda bellashyapti", "сейчас в дуэли"],
  duelHolatOqiyapti: ["dars qilyapti", "занимается"],
  duelBand: ["Band", "Занят"],
  /* O'yin ichidan duelga: "shu o'yinda hozir 2 kishi". */
  oyinShuOyinda: ["Shu o'yinda hozir {n} kishi", "Сейчас в этой игре: {n}"],
  oyinOnlaynBor: ["Hozir ilovada {n} kishi", "Сейчас в приложении: {n}"],
  oyinBellashIzoh: ["Shu o'yinda do'stingiz bilan bellashing", "Сразитесь с другом в этой игре"],
  oyinBellashish: ["Bellashish", "Сразиться"],
  duelChaqiruvKetdi: [
    "Chaqiruv Telegramga yuborildi — javobini kutyapmiz",
    "Вызов отправлен в Telegram — ждём ответа",
  ],
  duelTayyorman: ["Men tayyorman", "Я готов"],
  duelTayyorBelgi: ["tayyor", "готов"],
  duelLobbiKutyapti: ["kutyapti", "ждёт"],
  duelUlanmagan: ["hali yo'q", "ещё нет"],
  duelDostKutilmoqda: ["Do'stingiz", "Ваш друг"],
  duelRaqibKutilmoqda: ["Raqib tayyor bo'lishini kutamiz…", "Ждём готовности соперника…"],
  duelBoshlanmoqda: ["Boshlanmoqda!", "Начинаем!"],
  duelKutmayman: ["Kutmayman — hozir o'ynayman", "Не жду — сыграю сейчас"],
  duelQadam1: ["1. Do'stingizga havola yuboring", "1. Отправьте другу ссылку"],
  duelQadam1Izoh: [
    "U havolani ochsa, shu yerda paydo bo'ladi.",
    "Как только он откроет ссылку — появится здесь.",
  ],
  duelQadam2: ["2. Ikkalangiz tayyor bo'ling", "2. Оба нажмите «Готов»"],
  duelQadam2Izoh: [
    "Ikkalangiz bosgach, o'yin birga boshlanadi.",
    "Когда оба нажмёте — игра начнётся одновременно.",
  ],
  duelRaqibTugatmoqda: ["Raqib hali o'ynayapti…", "Соперник ещё играет…"],
  duelRaqibBali: ["Uning bali: {n}", "Его результат: {n}"],
  duelRaqib: ["Raqib", "Соперник"],
  duelJavobBerish: ["⚔️ Javob berish", "⚔️ Ответить"],
  duelMashqQil: ["Shu o'yinni mashq qilish", "Потренироваться в этой игре"],
  duelXatolar: ["Bu duelda {n} ta xato qildingiz", "В этой дуэли {n} ошибок"],
  duelTarixBosh: ["Hali bellashuv bo'lmagan", "Дуэлей пока не было"],
  duelTarixYutdi: ["yutdingiz", "победа"],
  duelTarixYutqazdi: ["yutqazdingiz", "поражение"],
  duelTarixKutyapti: ["javob kutilmoqda", "ждёт ответа"],

  /* ---------------- yana o'ynash va umumiy hisob ----------------
     "Qasos" degan so'z ATAYLAB ishlatilmaydi: bu bolalar ilovasi va
     yutqazgan bolaga qaytishning sababi o'ch olish emas, o'yinning
     o'zi bo'lishi kerak. Shuning uchun taklif ochiq va do'stona
     ohangda — "Yana o'ynaymizmi?" */
  duelYanaSoray: ["Yana o'ynaymizmi?", "Сыграем ещё?"],
  duelYanaKutilmoqda: ["Javobini kutyapmiz…", "Ждём его ответа…"],
  duelYanaTaklif: [
    "{nom} yana o'ynashni taklif qilyapti",
    "{nom} предлагает сыграть ещё",
  ],
  duelYanaRozi: ["Roziman — boshladik!", "Согласен — начали!"],
  duelYanaBoshlanmoqda: ["Yangi bellashuv boshlanmoqda…", "Новая дуэль начинается…"],
  duelYanaKetdi: ["Raqibingiz chiqib ketdi", "Соперник вышел"],
  duelUmumiyHisob: ["Umumiy hisob", "Общий счёт"],
  duelHisobNom: ["{nom} bilan {men} : {raqib}", "С {nom}: {men} : {raqib}"],
  duelHisobDurang: ["{n} durang", "ничьих: {n}"],

  /* ---- har kimga o'z darajasi, navbat, zanjir, jonli taklif ---- */
  duelDarajaSarlavha: ["Sizning darajangiz", "Ваш уровень"],
  duelDarajaIzoh: [
    "Har kim o'z darajasida yechadi — yoshdan qat'iy nazar teng o'yin",
    "Каждый решает на своём уровне — честная игра в любом возрасте",
  ],
  duelDarajalar: ["Siz: {men} · {nom}: {u}", "Вы: {men} · {nom}: {u}"],
  duelZanjir: ["🔥 {n} kun", "🔥 {n} дн."],
  duelZanjirXavf: ["Bugun o'ynang — zanjir uziladi", "Сыграйте сегодня — серия прервётся"],
  duelNavbatSarlavha: ["Sizni kutyapti", "Вас ждут"],
  duelDostlar: ["Do'stlaringiz", "Ваши друзья"],
  duelDostHisob: ["Hisob {men}:{raqib}", "Счёт {men}:{raqib}"],
  duelOynash: ["O'ynash", "Играть"],
  duelJonliChaqir: ["Jonli", "Вживую"],
  duelJavobKutilmoqda: ["Javob kutilmoqda", "Ждём ответа"],
  duelKutyaptiBelgi: ["Sizni {n} kishi kutyapti", "Вас ждут: {n}"],
  duelTaklifKutilmoqda: ["{nom} javobini kutyapmiz · {n} s", "Ждём ответа: {nom} · {n} с"],
  duelTaklifRad: ["{nom} hozir o'ynay olmaydi", "{nom} сейчас не может играть"],
  duelTaklifOtdi: ["{nom} javob bermadi", "Нет ответа: {nom}"],
  duelTaklifYolgiz: [
    "O'zingiz o'ynang — natijangiz unga chaqiruv bo'lib boradi",
    "Сыграйте сами — результат придёт ему вызовом",
  ],
  duelTaklifKeldi: ["{nom} sizni bellashuvga chaqiryapti", "{nom} зовёт вас на дуэль"],
  duelTaklifIzoh: [
    "Har kim o'z darajasida yechadi. Ko'p ball to'plagan yutadi.",
    "Каждый решает на своём уровне. Побеждает тот, у кого больше очков.",
  ],
  duelTaklifQabul: ["Qabul qilish · {n}", "Принять · {n}"],
  duelTaklifEskirdi: ["Taklif eskirdi", "Приглашение устарело"],
  /* 2026-09-26: daraja so'ralmaydi, bekor qilish qo'shildi. */
  duelTaklifAdolat: ["Har kim o'z sinfiga mos misol oladi", "Каждый получает задания по своему классу"],
  duelTaklifRadEt: ["Rad etish", "Отказаться"],
  duelTaklifBekorQildi: ["{nom} taklifni bekor qildi", "{nom} отменил(а) приглашение"],
  duelBekorQilish: ["Bekor qilish", "Отменить"],
  duelOzimOynayman: ["O'zim o'ynayman", "Сыграю сам"],
  duelBoshqaOdam: ["Boshqa odamni chaqirish", "Позвать другого"],
  duelKutyapmizSarlavha: ["{nom} javobini kutyapmiz", "Ждём ответа: {nom}"],
  duelTaklif_notanish: ["Avval u bilan bitta oddiy duel o'ynang", "Сначала сыграйте с ним обычную дуэль"],
  duelTaklif_oflayn: ["Hozir ilovada emas", "Сейчас не в приложении"],
  duelTaklif_soatiga: ["Bir soatdan keyin qayta chaqiring", "Позовите снова через час"],
  duelTaklif_bugun_rad: ["Bugun unga boshqa taklif yuborib bo'lmaydi", "Сегодня больше звать нельзя"],
  duelTaklif_yopiq: ["Jonli takliflarni o'chirib qo'ygan", "Отключил(а) приглашения"],
  duelTaklif_band: ["Hozir boshqa taklifga javob beryapti", "Сейчас отвечает на другое приглашение"],
  duelTaklifSozlama: ["Jonli bellashuv takliflari", "Приглашения на дуэль"],
  duelTaklifSozlamaIzoh: [
    "Ilovada turganingizda do'stlaringiz sizni jonli o'yinga chaqira oladi. Faqat oldin birga o'ynaganlar, soatiga bittadan.",
    "Когда вы в приложении, друзья могут позвать вас на дуэль. Только те, с кем вы уже играли, не чаще раза в час.",
  ],
  duelTaklifOchirish: ["Takliflarni o'chirish", "Отключить приглашения"],
  duelTaklifYoqish: ["Takliflarni yoqish", "Включить приглашения"],

  /* ---------------- jamoaviy o'yinlar ---------------- */
  oyinYakka: ["Yakka", "Одиночные"],
  oyinJamoaviy: ["Jamoaviy", "Командные"],
  jamoaviyIzoh: [
    "Do'stlar, oila yoki sinf bilan — xona kodi orqali",
    "С друзьями, семьёй или классом — по коду комнаты",
  ],
  oyinKartalar: ["Son kartalari", "Числовые карты"],
  oyinKartalarIzoh: ["Kartalardan nishon son yig'ing", "Соберите число-цель из карт"],
  oyinKartalarQoida: [
    "Navbat bilan yuriladi. Bitta son kartasidan boshlab amallarni ketma-ket qo'llang va nishon songa yeting. Qanchalik yaqin — shuncha kuchli zarba. Jon tugasa yoki 10 yurish o'tsa, ko'p jon qolgani yutadi.",
    "Ходите по очереди. Начните с карты-числа, применяйте действия по порядку и дойдите до числа-цели. Чем точнее — тем сильнее удар. Побеждает тот, у кого больше жизней.",
  ],
  oyinRoyale: ["Hisob Royale", "Счёт Рояль"],
  oyinRoyaleIzoh: ["Oxirgi qolgan yutadi", "Побеждает последний"],
  oyinRoyaleQoida: [
    "Har kimda 3 yurak va o'z darajasidagi savollar. Xato yoki vaqt tugasa — yurak ketadi. 3 ta ketma-ket to'g'ri javob raqibga hujum yuboradi: uning vaqti qisqaradi. Oxirgi qolgan yutadi.",
    "У каждого 3 сердца и вопросы своего уровня. Ошибка или конец времени — минус сердце. 3 верных подряд — атака: у соперника меньше времени. Побеждает последний.",
  ],
  oyinKodlar: ["Son kodlari", "Числовые коды"],
  oyinKodlarIzoh: ["Ikki jamoa, sardor son aytadi", "Две команды, капитан называет число"],
  oyinKodlarQoida: [
    "Ikki jamoa. Kartalar rangini faqat sardorlar ko'radi. Sardor son va nechta karta ekanini aytadi — jamoa natijasi shu songa teng kartalarni ochadi. Raqib kartasi navbatni beradi, bomba — mag'lubiyat. O'z kartalarini birinchi ochgan jamoa yutadi.",
    "Две команды. Цвета карт видят только капитаны. Капитан называет число и сколько карт — команда открывает карты с таким результатом. Карта соперника передаёт ход, бомба — поражение.",
  ],
  oyinSeyf: ["Seyf", "Сейф"],
  oyinSeyfIzoh: ["Kodni toping, xoinni fosh qiling", "Найдите код и разоблачите предателя"],
  oyinSeyfQoida: [
    "Har kimda seyf kodining bitta bo'lagi bor. Bittangiz xoin — u o'z bo'lagini o'zgartirib aytadi. Bo'laklarni solishtirib, ziddiyatni toping, kodni yozing va xoinga ovoz bering.",
    "У каждого кусочек кода сейфа. Один из вас — предатель, он меняет свой кусочек. Сравните кусочки, найдите противоречие, введите код и проголосуйте.",
  ],
  sfMuhokama: ["Muhokama", "Обсуждение"],
  sfOvoz: ["Ovoz berish", "Голосование"],
  sfHisobchi: ["Siz — Hisobchi", "Вы — Счетовод"],
  sfHisobchiIzoh: ["Bo'laklarni solishtiring, kodni toping va xoinni fosh qiling", "Сравните кусочки, найдите код и разоблачите предателя"],
  sfXoin: ["Siz — Xoin", "Вы — Предатель"],
  sfXoinIzoh: ["Bo'lagingizni o'zgartirib ayting va fosh bo'lmang", "Измените свой кусочек и не попадитесь"],
  sfSirKod: ["Haqiqiy kod: {kod} — faqat siz bilasiz", "Настоящий код: {kod} — знаете только вы"],
  sfBolagingiz: ["Sizning bo'lagingiz", "Ваш кусочек"],
  sfAytish: ["Bo'lagimni aytish", "Сказать свой кусочек"],
  sfNimaAytasiz: ["Nima deysiz? Bittasini tanlang", "Что скажете? Выберите"],
  sfHaqiqat: ["haqiqat", "правда"],
  sfAytilgan: ["Aytilgan bo'laklar", "Названные кусочки"],
  sfHaliHechKim: ["Hali hech kim aytmadi", "Пока никто не сказал"],
  sfOvozgaTayyor: ["Ovozga tayyorman", "Готов голосовать"],
  sfTayyorSoni: ["{n}/{m} tayyor", "{n}/{m} готовы"],
  sfKodYozing: ["Seyf kodi nechchi?", "Какой код сейфа?"],
  sfKimXoin: ["Kim xoin?", "Кто предатель?"],
  sfBilmayman: ["Bilmayman", "Не знаю"],
  sfQulflash: ["Javobni qulflash", "Зафиксировать ответ"],
  sfJavobBerdi: ["{n}/{m} javob berdi", "Ответили: {n}/{m}"],
  sfKutilmoqda: ["Boshqalar kutilmoqda…", "Ждём остальных…"],
  sfOchildi: ["Seyf ochildi! Kod {kod}", "Сейф открыт! Код {kod}"],
  sfYopiqQoldi: ["Seyf yopiq qoldi. Kod {kod} edi", "Сейф не открылся. Код был {kod}"],
  sfXoinEdi: ["Xoin — {nom}", "Предатель — {nom}"],
  sfTopildi: ["fosh bo'ldi", "разоблачён"],
  sfYashirindi: ["yashirinib qoldi", "не раскрыт"],
  sfYolgon: ["yolg'on aytdi", "соврал(а)"],
  orgS1T: ["Har kimda bitta bo'lak", "У каждого кусочек"],
  orgS1M: ["Seyf kodi bo'laklardan hisoblanadi. Yolg'iz hech kim yecha olmaydi", "Код сейфа складывается из кусочков. В одиночку не решить"],
  orgS2T: ["Bittangiz — xoin", "Один из вас — предатель"],
  orgS2M: ["Xoin o'z bo'lagini o'zgartirib aytadi va jamoani chalg'itadi", "Предатель меняет свой кусочек и путает команду"],
  orgS3T: ["Ziddiyatni toping", "Найдите противоречие"],
  orgS3M: ["7 × 11 = 77 — toq. Lekin «kod juft» degan bo'lak bor — kimdir yolg'on aytyapti!", "7 × 11 = 77 — нечётное. Но есть кусочек «код чётный» — кто-то врёт!"],
  orgS4M: ["Kim yolg'on aytyapti?", "Кто врёт?"],
  xonaKishi: ["{min}–{max} kishi", "{min}–{max} игроков"],
  /* ---- o'yinni o'rgatish (birinchi kirishda) ---- */
  orgQanday: ["Qanday o'ynaladi?", "Как играть?"],
  orgKeyingi: ["Keyingisi", "Дальше"],
  orgOtkazish: ["O'tkazib yuborish", "Пропустить"],
  orgSinab: ["Endi o'zingiz sinab ko'ring", "Теперь попробуйте сами"],
  orgZor: ["Zo'r! Tushundingiz 🎉", "Отлично! Вы поняли 🎉"],
  orgQayta: ["Yana urinib ko'ring", "Попробуйте ещё"],
  orgOynaymiz: ["Tushundim — o'ynaymiz!", "Понятно — играем!"],
  orgTekshir: ["Tekshirish", "Проверить"],
  orgK1T: ["Nishon son", "Число-цель"],
  orgK1M: ["Har yurishda bitta son beriladi — shu songa yetish kerak", "В каждом ходу дано число — до него нужно дойти"],
  orgK2T: ["Kartalardan zanjir yasang", "Соберите цепочку из карт"],
  orgK2M: ["Avval son, keyin amallar. Har amal oldingi natijaga qo'shiladi", "Сначала число, потом действия. Каждое действие — к предыдущему результату"],
  orgK3T: ["Aniq topsangiz — kuchli zarba", "Точно — сильный удар"],
  orgK3M: ["Aniq topsangiz raqib 25 jon yo'qotadi, yaqin bo'lsa kamroq. Ko'p jon qolgan yutadi", "Точно — соперник теряет 25 жизней, близко — меньше. Побеждает у кого больше жизней"],
  orgK4M: ["12 ni yig'ing: kartalarni tartib bilan bosing", "Соберите 12: нажимайте карты по порядку"],
  orgR1T: ["3 ta yurak", "3 сердца"],
  orgR1M: ["Xato javob yoki vaqt tugashi — bitta yurak ketadi", "Ошибка или конец времени — минус одно сердце"],
  orgR2T: ["3 ta ketma-ket to'g'ri — hujum", "3 верных подряд — атака"],
  orgR2M: ["Raqibingizning keyingi savoliga vaqt kamayadi", "У соперника станет меньше времени на вопрос"],
  orgR3T: ["Oxirgi qolgan yutadi", "Побеждает последний"],
  orgR3M: ["Har kim o'z darajasidagi savolni oladi — bola ham, katta ham teng o'ynaydi", "Каждый получает вопросы своего уровня — дети и взрослые играют на равных"],
  orgR4M: ["Tez javob bering!", "Отвечайте быстрее!"],
  orgD1T: ["Ikki jamoa", "Две команды"],
  orgD1M: ["Ko'klar va Oltinlar. Har jamoada bitta sardor bor", "Синие и Золотые. В каждой команде есть капитан"],
  orgD2T: ["Sardor son aytadi", "Капитан называет число"],
  orgD2M: ["Rangni faqat sardor ko'radi. «12 · 2» — natijasi 12 bo'lgan 2 ta kartani toping", "Цвета видит только капитан. «12 · 2» — найдите 2 карты с результатом 12"],
  orgD3T: ["Bombadan ehtiyot bo'ling", "Осторожно, бомба"],
  orgD3M: ["Raqib kartasi navbatni beradi, bomba — mag'lubiyat. O'z kartalarini birinchi ochgan jamoa yutadi", "Карта соперника — ход переходит, бомба — поражение. Побеждает команда, первой открывшая свои карты"],
  orgD4M: ["Maslahat: 12 · 2. Ikkita to'g'ri kartani tanlang", "Подсказка: 12 · 2. Выберите две верные карты"],
  xonaKanal: ["Kanal uchun havola", "Ссылка для канала"],
  xonaKanalIzoh: [
    "Havolani kanalga tashlang. Kirib «Tayyorman» bosganlar bilan o'yin vaqt kelganda o'zi boshlanadi, bo'sh joyga robot qo'shiladi.",
    "Опубликуйте ссылку в канале. Игра начнётся сама с теми, кто нажал «Готов»; пустые места займут роботы.",
  ],
  xonaKanalDaqiqa: ["{n} daqiqada", "через {n} мин"],
  xonaKanalYarat: ["Havola yaratish", "Создать ссылку"],
  xonaBoshlanadi: ["Boshlanishiga", "До начала"],
  xonaOchiqIzoh: [
    "Vaqt tugaganda «Tayyorman» bosganlar bilan o'yin boshlanadi",
    "Когда время выйдет, игра начнётся с теми, кто нажал «Готов»",
  ],
  xonaPostMatn: [
    "🎲 {oyin} — {n} daqiqada boshlanadi!\n\nKirib «Tayyorman» ni bosing, o'yin o'zi boshlanadi.\n👉 {havola}",
    "🎲 {oyin} — начало через {n} мин!\n\nЗаходите и нажмите «Готов», игра начнётся сама.\n👉 {havola}",
  ],
  xonaPostNusxa: ["Kanal uchun matnni nusxalash", "Скопировать текст для канала"],
  xonaNusxalandi: ["Nusxalandi ✓", "Скопировано ✓"],
  xonaKanalgaUlash: ["Telegramda ulashish", "Поделиться в Telegram"],
  xonaBekor: ["Hech kim tayyor bo'lmadi", "Никто не успел приготовиться"],
  xonaBekorIzoh: ["Xonani qaytadan ochib, havolani yana tashlashingiz mumkin", "Можно открыть комнату снова"],
  xonaQaytaOchish: ["Qaytadan boshlash", "Запустить снова"],
  xonaOchish: ["Xona ochish", "Создать комнату"],
  xonaKodBilan: ["Kod bilan kirish", "Войти по коду"],
  xonaKodJoy: ["4 xonali kod", "Код из 4 цифр"],
  xonaKirish: ["Kirish", "Войти"],
  xonaQoida: ["Qanday o'ynaladi", "Как играть"],
  xonaXatoUmumiy: ["Aloqa bilan muammo — qayta urinib ko'ring", "Проблема со связью — попробуйте ещё раз"],
  xonaXato_topilmadi: ["Bunday xona topilmadi", "Комната не найдена"],
  xonaXato_boshlangan: ["O'yin allaqachon boshlangan", "Игра уже началась"],
  xonaXato_tola: ["Xona to'la", "Комната заполнена"],
  xonaXato_navbat_emas: ["Hozir sizning navbatingiz emas", "Сейчас не ваш ход"],
  xonaXato_bolinmaydi: ["Bu son qoldiqsiz bo'linmaydi", "Число не делится без остатка"],
  xonaXato_tartib: ["Avval son kartasi, keyin amallar", "Сначала число, потом действия"],
  xonaXato_kam: ["Kamida bitta son va bitta amal kerak", "Нужно число и хотя бы одно действие"],
  xonaXato_kechikdi: ["Vaqt tugadi", "Время вышло"],
  xonaXato_tez: ["Biroz kuting", "Подождите немного"],
  xonaKod: ["Xona kodi", "Код комнаты"],
  xonaKutishIzoh: [
    "Hamma «Tayyorman» bossa, o'yin o'zi boshlanadi",
    "Когда все нажмут «Готов», игра начнётся сама",
  ],
  xonaTayyorman: ["Tayyorman", "Готов"],
  xonaTayyorEmas: ["Hali tayyor emasman", "Ещё не готов"],
  xonaTayyor: ["tayyor", "готов"],
  xonaKutilmoqda: ["kutilmoqda…", "ожидаем…"],
  xonaKishiKerak: ["Yana {n} kishi kerak", "Нужно ещё {n}"],
  xonaHammaKutilmoqda: ["Hamma tayyor bo'lishi kutilmoqda", "Ждём, пока все будут готовы"],
  xonaRobotQosh: ["Bo'sh joylarga robot qo'shish", "Добавить роботов"],
  xonaRobotIzoh: ["Robotlar ochiq belgilanadi va reytingga ta'sir qilmaydi", "Роботы отмечены и не влияют на рейтинг"],
  xonaDostChaqir: ["Do'stlarni chaqirish", "Позвать друзей"],
  xonaUlashMatn: ["Aql Zone'da birga o'ynaymiz! Xona kodi: {kod}", "Играем вместе в Aql Zone! Код комнаты: {kod}"],
  xonaChiqish: ["Xonadan chiqish", "Выйти из комнаты"],
  xonaEgasi: ["xona egasi", "хозяин"],
  xonaRobot: ["robot", "робот"],
  xonaSiz: ["Siz", "Вы"],
  xonaGaplar: ["Tayyor gaplar", "Быстрые фразы"],
  gap_zor: ["Zo'r!", "Класс!"],
  gap_tekshir: ["Tekshirib ko'ring", "Проверьте"],
  gap_ishonaman: ["Ishonaman", "Верю"],
  gap_xato: ["Menimcha xato", "По-моему, ошибка"],
  gap_menemas: ["Men emasman", "Это не я"],
  gap_xavfli: ["Xavfli!", "Опасно!"],
  gap_tez: ["Tezroq!", "Быстрее!"],
  gap_yana: ["Yana o'ynaymiz!", "Сыграем ещё!"],
  xonaGoliblar: ["G'oliblar", "Победители"],
  xonaMaglublar: ["Mag'lublar", "Проигравшие"],
  xonaDurang: ["Durang!", "Ничья!"],
  xonaYutdingiz: ["Yutdingiz!", "Вы победили!"],
  xonaYutqazdingiz: ["Bu safar yutqazdingiz", "В этот раз не повезло"],
  xonaMaglubIzoh: ["Mag'lub ham ochko oladi — keyingisida albatta!", "Очки получают все — в следующий раз получится!"],
  xonaYana: ["Yana o'ynaymizmi?", "Сыграем ещё?"],
  xonaOyinlarga: ["O'yinlarga", "К играм"],
  xonaJoy: ["{n}-o'rin", "{n}-е место"],
  xonaSovga: ["Kolleksiyaga yangi karta: {nom}", "Новая карта в коллекции: {nom}"],
  kJon: ["jon", "жизни"],
  kNishon: ["Nishon son", "Число-цель"],
  kNavbatSiz: ["Sizning navbatingiz", "Ваш ход"],
  kNavbatRaqib: ["{nom} o'ylayapti…", "{nom} думает…"],
  kYurish: ["{n}/{m} yurish", "ход {n}/{m}"],
  kTanlang: ["Avval son, keyin amal kartalarini bosing", "Нажмите число, затем действия"],
  kZarba: ["Zarba berish", "Атаковать"],
  kTozala: ["Tozalash", "Сбросить"],
  kOxirgi: ["{nom}: {ifoda} = {natija} (nishon {nishon}) · −{zarba}", "{nom}: {ifoda} = {natija} (цель {nishon}) · −{zarba}"],
  kOtkazdi: ["{nom} yurishni o'tkazib yubordi", "{nom} пропустил ход"],
  kMaxsus: ["Maxsus karta", "Особая карта"],
  kMaxsusIshlat: ["Ishlatish", "Использовать"],
  kM_ikki: ["Ikki barobar", "Удвоение"],
  kM_ikkiIzoh: ["Keyingi zarbangiz ×2", "Ваш следующий удар ×2"],
  kM_qalqon: ["Qalqon", "Щит"],
  kM_qalqonIzoh: ["Keyingi kelgan zarba yarim", "Следующий удар по вам вдвое слабее"],
  kM_almashtir: ["Almashtirish", "Замена"],
  kM_almashtirIzoh: ["Yangi kartalar va nishon", "Новые карты и цель"],
  kKolleksiya: ["Kolleksiya", "Коллекция"],
  rTirik: ["Tirik: {n}", "В игре: {n}"],
  rHujumKeldi: ["{nom} sizga hujum qildi — vaqt qisqardi", "{nom} атаковал вас — меньше времени"],
  rHujumKetdi: ["Hujum yuborildi → {nom}", "Атака отправлена → {nom}"],
  rChiqdingiz: ["Siz chiqdingiz — {n}-o'rin", "Вы выбыли — {n}-е место"],
  rTomosha: ["Qolganlar o'ynayapti…", "Остальные ещё играют…"],
  rZanjir: ["Yana {n} ta to'g'ri — hujum", "Ещё {n} верных — атака"],
  kdKok: ["Ko'klar", "Синие"],
  // Ikkinchi jamoa OLTIN, qizil emas: qizil ilovada faqat "xato" degani
  // (dizayn qoidasi), jamoa rangi esa xato emas.
  kdQizil: ["Oltinlar", "Золотые"],
  kdSardor: ["sardor", "капитан"],
  kdSizSardor: ["Siz sardorsiz — ranglarni faqat siz ko'rasiz", "Вы капитан — цвета видите только вы"],
  kdMaslahatBering: ["Jamoangizga son va nechta karta ekanini ayting", "Назовите число и сколько карт"],
  kdSon: ["Son", "Число"],
  kdSoni: ["Nechta", "Сколько"],
  kdYuborish: ["Maslahatni yuborish", "Отправить подсказку"],
  kdKutSardor: ["{nom} maslahat o'ylayapti…", "{nom} придумывает подсказку…"],
  kdMaslahat: ["Maslahat: {son} · {soni} ta", "Подсказка: {son} · {soni}"],
  kdQolganOchish: ["Yana {n} ta ochish mumkin", "Можно открыть ещё {n}"],
  kdTugatish: ["Navbatni tugatish", "Закончить ход"],
  kdRaqibNavbati: ["Raqib jamoa o'ynayapti", "Ходит команда соперника"],
  kdTopish: ["Natijasi {son} ga teng kartalarni oching", "Откройте карты с результатом {son}"],
  kdBomba: ["bomba", "бомба"],
  kdQoldi: ["{n} ta qoldi", "осталось {n}"],
  kdBombaSabab: ["Bomba ochildi!", "Открыта бомба!"],
  kdJamoangiz: ["Jamoangiz: {j}", "Ваша команда: {j}"],
  kdBelgiIzoh: ["Bir marta bosish — belgilash, ikkinchi — ochish", "Первое нажатие — отметить, второе — открыть"],

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
  /* ---------------- kunlik son (Wordle uslubi) ---------------- */
  kunlikSon: ["Kunlik son", "Число дня"],
  kunlikSonIzoh: ["Yashirin tenglikni 6 urinishda toping", "Найдите скрытое равенство за 6 попыток"],
  kunlikSonYechildi: ["Bugun yechildi ✓", "Сегодня решено ✓"],
  kunlikSonRaqam: ["#{n} · {daraja}", "#{n} · {daraja}"],
  ksTekshir: ["Tekshirish", "Проверить"],
  ksXato_uzunlik: ["Barcha katakchalarni to'ldiring", "Заполните все клетки"],
  ksXato_tenglik: ["Bitta «=» belgisi bo'lishi kerak", "Нужен ровно один знак «=»"],
  ksXato_notogri: ["Bu to'g'ri ifoda emas", "Это неверное выражение"],
  ksXato_teng_emas: ["Ikki tomon teng emas — hisoblab ko'ring", "Стороны не равны — проверьте"],
  ksTopdingiz: ["Topdingiz! {n}/6", "Угадали! {n}/6"],
  ksTopilmadi: ["Bugun chiqmadi", "Сегодня не получилось"],
  ksJavob: ["Javob: {j}", "Ответ: {j}"],
  ksErtaga: ["Ertaga yangi jumboq", "Завтра новая загадка"],
  kkSarlavha: ["Bugungi son #{n}", "Число дня #{n}"],
  kkIzoh: ["Olti urinish, ikki daqiqa — hamma bugun shu jumboqni yechyapti",
    "Шесть попыток, две минуты — сегодня её решают все"],
  kkZanjirXavf: ["Zanjiringiz {n} kun — bugun yechilmasa uziladi", "Серия {n} дн. — сегодня она прервётся"],
  kkBajarildi: ["Bugungi son yechildi", "Число дня решено"],
  kkZanjirDavom: ["Zanjir {n} kun. Ertaga yangi jumboq", "Серия {n} дн. Завтра новая загадка"],
  kkErtaga: ["Ertaga yangi jumboq chiqadi", "Завтра выйдет новая загадка"],
  ksUlash: ["Natijani ulashish", "Поделиться результатом"],
  ksUlashKetdi: ["Kartochka Telegramga yuborildi", "Карточка отправлена в Telegram"],
  ksUlashIzoh: ["Botdagi rasmni sinf guruhiga yo'naltiring", "Перешлите картинку из бота в группу класса"],
  ksJoy: ["Bugun {y} kishi yechdi · siz {j}-o'rinda", "Сегодня решили {y} · вы на {j}-м месте"],
  ksYechgan: ["Bugun {y} kishi yechdi", "Сегодня решили {y}"],
  ksTezlar: ["Bugun eng tez yechganlar", "Самые быстрые сегодня"],
  ksUrinishQisqa: ["{n}/6", "{n}/6"],
  ksZanjir: ["Zanjir: {n} kun", "Серия: {n} дн."],
  ksOynalgan: ["O'ynalgan: {n}", "Сыграно: {n}"],
  ksQoidalar: ["Qoidalar", "Правила"],
  boshKattalarBoshla: ["Masalalardan boshlang", "Начните с задач"],
  boshKattalarIzoh: ["Qiyin masalalar, yechimi va muhokamasi bilan", "Сложные задачи с решением"],
  savolKim: ["Kim uchun qidiryapsiz?", "Для кого ищете?"],
  savolIzoh: ["Bitta bosish — ro'yxat sizga moslanadi", "Одно нажатие — список подстроится"],
  savolOquvchi: ["O'zim o'quvchiman", "Я школьник"],
  savolOtaOna: ["Farzandim uchun", "Для ребёнка"],
  savolTalaba: ["Talaba yoki kattaman", "Студент или взрослый"],
  savolUstoz: ["O'qituvchiman", "Я учитель"],
  imtihonTitul: ["DTM — matematika", "ДТМ — математика"],
  imtihonIzoh: ["{savol} savol · {daqiqa} daqiqa · 7–11 sinf dasturi",
    "{savol} вопросов · {daqiqa} минут · программа 7–11 классов"],
  imtihonDaraja: ["Oxirgi urinishlaringiz o'rtachasi · jami {n} ta variant",
    "Среднее последних попыток · всего {n} вариантов"],
  imtihonBoshlang: ["Birinchi variantdan boshlang", "Начните с первого варианта"],
  imtihonBoshlangIzoh: ["Bir soat ajrating: haqiqiy imtihon sur'ati, oxirida — qaysi mavzuda xato qilganingiz",
    "Выделите час: темп настоящего экзамена, в конце — в каких темах ошибки"],
  imtihonVariantlar: ["Variantlar", "Варианты"],
  imtihonVariant: ["{n}-variant", "Вариант {n}"],
  imtihonIshlanmagan: ["Hali ishlanmagan", "Ещё не решён"],
  imtihonOxirgilar: ["Oxirgi urinishlar", "Последние попытки"],
  imtihonPastIzoh: ["Har variant har safar bir xil — natijangiz o'sganini ko'rish uchun qayta ishlang",
    "Вариант всегда один и тот же — перерешайте, чтобы увидеть рост"],
  daqiqaQisqa: ["daq", "мин"],
  /* Milliy sertifikat (`lib/sertifikat.ts`). "Nacsertifikat" — ruscha
     so'zlashuvdagi qisqa nomi, tugmaga to'liq nomi sig'maydi. */
  imtihonTurDtm: ["DTM", "ДТМ"],
  imtihonTurSert: ["Milliy sertifikat", "Нацсертификат"],
  sertTitul: ["Milliy sertifikat — matematika", "Нацсертификат — математика"],
  sertIzoh: ["{savol} topshiriq · {soat} soat · {ball} ball", "{savol} заданий · {soat} ч · {ball} баллов"],
  sertBallDan: ["/ 100 ball", "/ 100 баллов"],
  sertBallQisqa: ["{b} ball", "{b} б."],
  sertDaraja: ["Taxminiy daraja: {d}", "Примерный уровень: {d}"],
  sertDarajaYoq: ["Sertifikat chegarasiga yetmadi (~60%)", "Ниже порога сертификата (~60%)"],
  sertBoshlangIzoh: ["3 soat ajrating yoki bo'lib ishlang — javoblar saqlanib boradi",
    "Выделите 3 часа или решайте частями — ответы сохраняются"],
  sertDavom: ["Davom etish", "Продолжить"],
  sertDavomIzoh: ["{v} · {a}/{b} javob · {m} daq qoldi", "{v} · ответов {a}/{b} · осталось {m} мин"],
  sertDavomTugagan: ["{v} · vaqt tugadi — natijani ko'ring", "{v} · время вышло — посмотрите результат"],
  sertPastIzoh: ["Tuzilish rasmiy namunadagidek: 32 ta test, 3 ta moslashtirish, 10 ta ochiq javob. Daraja — taxminiy.",
    "Структура как в официальном образце: 32 теста, 3 на соответствие, 10 с открытым ответом. Уровень — примерный."],
  sertBolimY1: ["Test · {b} ball", "Тест · {b} б."],
  sertBolimY2: ["Moslashtirish · {b} ball", "Соответствие · {b} б."],
  sertBolimO: ["Javobni yozing · a) {a} · b) {b} ball", "Впишите ответ · a) {a} · b) {b} б."],
  sertY2Izoh: ["Savolga mos javobning harfini tanlang", "Выберите букву подходящего ответа"],
  sertJavobJoy: ["Javob", "Ответ"],
  sertIshora: ["Ishorani almashtirish", "Сменить знак"],
  sertOldingi: ["Oldingi", "Назад"],
  sertKeyingi: ["Keyingi", "Далее"],
  sertYakunla: ["Yakunlash", "Завершить"],
  sertYakunSarlavha: ["Variantni yakunlaysizmi?", "Завершить вариант?"],
  sertYakunIzoh: ["{n} ta savolga javob berilmagan", "Без ответа: {n}"],
  sertYakunDavom: ["Savollarga qaytish", "Вернуться к вопросам"],
  sertNatijaTest: ["Test", "Тест"],
  sertNatijaMoslash: ["Moslashtirish", "Соответствие"],
  sertNatijaOchiq: ["Ochiq javob", "Открытые"],
  sertJavobsiz: ["Javobsiz qolgan: {n}", "Без ответа: {n}"],
  sertTogriJavob: ["To'g'ri: {j}", "Верно: {j}"],
  sertSizniki: ["siz: {j}", "вы: {j}"],
  sertQayta: ["Qayta ishlash", "Решить заново"],
  sertVariantlarga: ["Variantlarga qaytish", "К вариантам"],
  sertTestlar: ["Milliy sertifikat va DTM", "Нацсертификат и ДТМ"],
  sertTestlarIzoh: ["Imtihon formatidagi variantlar, vaqt bilan", "Варианты в формате экзамена, на время"],
  /* Ilgari "30 savol, 60 daqiqa" edi — faqat DTM bor edi. Endi eshik
     ikkala imtihonga olib boradi (`components/ImtihonTur.tsx`). */
  kattalarDtm: ["DTM va sertifikat", "ДТМ и сертификат"],
  kattalarDtmIzoh: ["Imtihon variantlari, vaqt va xato tahlili", "Варианты экзамена, время и разбор ошибок"],
  kattalarBolim: ["Talaba va kattalar uchun", "Для студентов и взрослых"],
  kattalarIzoh: ["Sinfga bog'liq emas — formulalar, testlar va hisob mashqi",
    "Без привязки к классу — формулы, тесты и счёт"],
  kattalarFormula: ["Formulalar", "Формулы"],
  kattalarFormulaIzoh: ["Algebra va geometriya — bir joyda", "Алгебра и геометрия — в одном месте"],
  kattalarTest: ["Testlar", "Тесты"],
  kattalarTestIzoh: ["Blok testlar va to'plamlar", "Блочные тесты и наборы"],
  kattalarMasala: ["Masalalar", "Задачи"],
  kattalarMasalaIzoh: ["Qiyin masalalar, yechimi bilan", "Сложные задачи с решением"],
  kattalarOyin: ["Hisob mashqi", "Тренировка счёта"],
  kattalarOyinIzoh: ["Karvon, kunlik son, son ovi", "Караван, число дня, охота за числом"],
  sonOvi: ["Son ovi", "Охота за числом"],
  sonOviIzoh: ["To'rtta kartadan 24 ni chiqaring", "Получите 24 из четырёх карт"],
  sonOviBugun: ["Bugun {n} ta yechildi", "Сегодня решено {n}"],
  soToplam: ["Bugungi to'plam · {n}/{jami}", "Сегодняшний набор · {n}/{jami}"],
  soCheksiz: ["Cheksiz rejim", "Бесконечный режим"],
  soVaqt: ["{n} s", "{n} с"],
  soMaqsad: ["Maqsad", "Цель"],
  soYoriq1: ["Bitta kartani tanlang", "Выберите одну карту"],
  soYoriq2: ["Endi amalni bosing: + − × ÷", "Теперь нажмите знак: + − × ÷"],
  soYoriq3: ["Ikkinchi kartani bosing — ular birlashadi", "Нажмите вторую карту — они объединятся"],
  soTopdingiz: ["Topdingiz! {n} soniyada", "Решено! За {n} секунд"],
  soQoldi: ["Bugungi to'plamda yana {n} ta jumboq bor", "В сегодняшнем наборе ещё {n} загадки"],
  soCheksizIzoh: ["Bugungi to'plam tugadi — endi cheksiz rejim", "Сегодняшний набор пройден — дальше бесконечный режим"],
  soKeyingi: ["Keyingi jumboq", "Следующая загадка"],
  soBekor: ["Bekor", "Отменить"],
  soBoshidan: ["Boshidan", "Сначала"],
  soMaslahat: ["Maslahat", "Подсказка"],
  soQandayT: ["Qanday o'ynaladi", "Как играть"],
  soQanday1: ["To'rtta kartaning HAMMASINI bir martadan ishlatib, {maqsad} ni chiqaring.",
    "Используйте ВСЕ четыре карты по одному разу и получите {maqsad}."],
  soN0: ["Mana to'rtta karta: 4, 6, 2, 3", "Вот четыре карты: 4, 6, 2, 3"],
  soN0Izoh: ["Ikkita kartani tanlab amal bosasiz — ular o'rniga natija turadi. Qavs yozish shart emas.",
    "Выбираете две карты и знак — вместо них встаёт результат. Скобки писать не нужно."],
  soN1Izoh: ["3 va 2 ni tanlab «−» bosdik. Endi qo'lda 4, 6 va 1 qoldi.",
    "Выбрали 3 и 2, нажали «−». Теперь остались 4, 6 и 1."],
  soN2Izoh: ["6 va 4 ni ko'paytirdik — 24 chiqdi. Lekin 1 hali ishlatilmagan.",
    "Умножили 6 на 4 — получили 24. Но 1 ещё не использована."],
  soN3Izoh: ["24 ni 1 ga ko'paytirdik: hamma karta ishlatildi va 24 qoldi. Jumboq yechildi!",
    "Умножили 24 на 1: все карты использованы и осталось 24. Загадка решена!"],
  ksKeyingi: ["Keyingi", "Дальше"],
  ksOtkaz: ["O'tkazib yuborish", "Пропустить"],
  ksN1: ["Yashirin tenglikni topish kerak", "Нужно найти скрытое равенство"],
  ksN1Izoh: ["Mana shu oltita katak — yashirin tenglik. Olti urinish bor. Namunada uni birga topamiz.",
    "Эти шесть клеток — скрытое равенство. Есть шесть попыток. Найдём его вместе."],
  ksN2: ["1-urinish: 9+8=17", "1-я попытка: 9+8=17"],
  ksN2Izoh: ["Istalgan TO'G'RI tenglikni yozamiz. Oxirgi 7 yashil — o'z joyida. = va 1 oltin: ular bor, lekin boshqa joyda. 9, + va 8 bo'z — bunday belgilar yo'q.",
    "Пишем любое ВЕРНОЕ равенство. Последняя 7 зелёная — на своём месте. = и 1 золотые: есть, но не там. 9, + и 8 серые — таких знаков нет."],
  ksN3: ["2-urinish: 14-7=7", "2-я попытка: 14-7=7"],
  ksN3Izoh: ["1, −, = va oxirgi 7 yashil. O'rtadagi 7 esa bo'z: tenglikda bitta 7 bor va u allaqachon topilgan. 4 ham yo'q — boshqa sonni sinaymiz.",
    "1, −, = и последняя 7 зелёные. А 7 в середине серая: семёрка одна и она уже найдена. 4 тоже нет — пробуем другое число."],
  ksN4: ["3-urinish: 12-5=7 — topildi!", "3-я попытка: 12-5=7 — найдено!"],
  ksN4Izoh: ["Hamma katak yashil — tenglik topildi. Kam urinishda topsangiz, kunlik ro'yxatda yuqori turasiz. Ertaga yangi jumboq chiqadi va zanjiringiz o'sadi.",
    "Все клетки зелёные. Чем меньше попыток, тем выше место. Завтра новая загадка и серия растёт."],
  ksYol1: ["Istalgan to'g'ri tenglikni yozing", "Напишите любое верное равенство"],
  ksYol1Izoh: ["Masalan 9+8=17. U to'g'ri bo'lsa bas — yashirin javobni topish keyin",
    "Например 9+8=17. Главное, чтобы равенство было верным"],
  ksYol2: ["Ranglarni o'qing", "Читайте цвета"],
  ksYol2Izoh: ["Yashil — belgi joyida, oltin — bor lekin boshqa joyda, bo'z — yo'q",
    "Зелёный — на месте, золотой — есть, но не там, серый — нет"],
  ksYol3: ["Javobni toping", "Найдите ответ"],
  ksYol3Izoh: ["Olti urinish bor. Har urinish ham to'g'ri tenglik bo'lishi kerak",
    "Шесть попыток. Каждая попытка — тоже верное равенство"],
  ksYol4: ["Zanjirni uzmang", "Не прерывайте серию"],
  ksYol4Izoh: ["Har kuni yechilsa zanjir o'sadi — bir kun qoldirilsa noldan boshlanadi",
    "Решайте каждый день — пропуск обнуляет серию"],
  ksQandayT: ["Qanday o'ynaladi", "Как играть"],
  ksQanday1: ["Yashirin to'g'ri tenglikni toping. Har urinish ham to'g'ri tenglik bo'lishi kerak.", "Найдите скрытое верное равенство. Каждая попытка — тоже верное равенство."],
  ksQanday2: ["Yashil — belgi joyida", "Зелёный — на своём месте"],
  ksQanday3: ["Oltin — belgi bor, lekin boshqa joyda", "Золотой — есть, но в другом месте"],
  ksQanday4: ["Bo'z — bunday belgi yo'q", "Серый — такого знака нет"],
  ksQanday5: ["× va ÷ avval hisoblanadi: 2+3×4 = 14", "× и ÷ считаются первыми: 2+3×4 = 14"],
  ksBoshladik: ["Boshladik!", "Начать!"],
  ksUlashMatn: ["Aql Zone · Kunlik son #{n} ({daraja}) {natija}", "Aql Zone · Число дня #{n} ({daraja}) {natija}"],
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
  /* Ruscha nom ichida YUMSHOQ TIRE (`­`) turibdi.
     U ko'rinmaydi va faqat so'z satrga sig'magan joyda tire bo'lib
     chiqadi. Busiz "Последовательность" menyudagi kichkina chipda
     "Последовательн / ость" bo'lib, o'rtasidan bo'linib ketardi. */
  oyinKetma: ["Ketma-ketlik", "Последова­тельность"],
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

  boshBoshla: ["O'rganishni boshlash", "Начать обучение"],
  boshBoshlaIzoh: ["Sinfingizni tanlang — darslar shu yerdan", "Выберите класс — уроки начинаются здесь"],

  /* ---------------- eslatma taklifi ---------------- */
  eslatmaTaklifMasala: [
    "Har kuni yangi masala chiqadi. Telegramda eslatib turaylikmi?",
    "Каждый день новая задача. Напоминать вам в Telegram?",
  ],
  eslatmaTaklifTest: [
    "Yangi test chiqqanda Telegramda xabar beraylikmi?",
    "Сообщить в Telegram, когда выйдет новый тест?",
  ],
  eslatmaTaklifTugma: ["Ha, eslating", "Да, напоминать"],
  eslatmaTaklifYoq: ["Keyinroq", "Позже"],
  eslatmaTaklifHa: ["Yaxshi! Ertaga yangi masala bilan yozamiz", "Отлично! Напишем завтра с новой задачей"],
  toplamBoshqaTestlar: ["Boshqa testlar", "Другие тесты"],
  kanalTaklifMatn: [
    "Har kuni kechqurun kanalda yangi masala chiqadi. Kanalga qo'shiling — o'tkazib yubormaysiz.",
    "Каждый вечер в канале новая задача. Подпишитесь — не пропустите.",
  ],
  kanalTaklifTugma: ["Kanalga qo'shilish", "Подписаться"],
  kanalTaklifRahmat: ["Rahmat! Ertaga kechqurun kanalda ko'rishamiz", "Спасибо! До завтрашнего вечера в канале"],

  /* ---------------- tanishuv anketasi ---------------- */
  anketaSarlavha: ["Keling, tanishamiz", "Давайте познакомимся"],
  anketaIzoh: [
    "3 ta savol — ilovani sizga moslaymiz",
    "3 вопроса — настроим приложение под вас",
  ],
  anketaKim: ["Siz kimsiz?", "Кто вы?"],
  anketaOquvchi: ["Maktab o'quvchisi", "Школьник"],
  anketaTalaba: ["Talaba", "Студент"],
  anketaOtaOna: ["Ota-ona", "Родитель"],
  anketaUstoz: ["O'qituvchi", "Преподаватель"],
  anketaKattalar: ["Boshqa", "Другое"],
  anketaKurs: ["Nechanchi kursdasiz?", "На каком вы курсе?"],
  anketaKursN: ["{n}-kurs", "{n} курс"],
  anketaMagistr: ["Magistratura", "Магистратура"],
  anketaUstozJoy: ["Qayerda dars berasiz?", "Где вы преподаёте?"],
  anketaUstozBoshlangich: ["Maktab · 1–4-sinf", "Школа · 1–4 класс"],
  anketaUstozOrta: ["Maktab · 5–9-sinf", "Школа · 5–9 класс"],
  anketaUstozYuqori: ["Maktab · 10–11-sinf", "Школа · 10–11 класс"],
  anketaUstozOtm: ["Universitet / institut", "Университет / институт"],
  anketaUstozMarkaz: ["O'quv markazi / repetitor", "Учебный центр / репетитор"],
  anketaSinf: ["Qaysi sinf?", "Какой класс?"],
  anketaSinfOta: ["Farzandingiz nechanchi sinfda?", "В каком классе ваш ребёнок?"],
  anketaSinfUstoz: ["Qaysi sinfga dars berasiz?", "В каком классе преподаёте?"],
  anketaMaktabgacha: ["Maktabgacha", "Дошкольник"],
  anketaViloyat: ["Qayerdansiz?", "Откуда вы?"],
  anketaTayyor: ["Boshlash", "Начать"],
  anketaOtkaz: ["O'tkazib yuborish", "Пропустить"],
  anketaQadam: ["{n} / 3", "{n} / 3"],
  anketaYonalish: ["Yo'nalishingiz qaysi?", "Какое у вас направление?"],
  anketaYonalishIzoh: [
    "Ilova sizga kerakli fanlarni birinchi ko'rsatadi.",
    "Приложение покажет нужные вам предметы первыми.",
  ],
  yonalish_boshlangich: ["Boshlang'ich ta'lim", "Начальное образование"],
  yonalishIzoh_boshlangich: ["1–4-sinf o'qituvchisi bo'laman", "Буду учителем 1–4 классов"],
  yonalish_mat_ustoz: ["Matematika o'qituvchiligi", "Учитель математики"],
  yonalishIzoh_mat_ustoz: ["Maktabda matematika o'qitaman", "Буду преподавать математику в школе"],
  yonalish_texnika: ["Texnika yoki IT", "Техника или IT"],
  yonalishIzoh_texnika: ["Muhandislik, dasturlash", "Инженерия, программирование"],
  yonalish_iqtisod: ["Iqtisodiyot", "Экономика"],
  yonalishIzoh_iqtisod: ["Iqtisod, moliya, menejment", "Экономика, финансы, менеджмент"],
  yonalish_boshqa: ["Boshqa yo'nalish", "Другое направление"],
  yonalishIzoh_boshqa: ["Ro'yxatda yo'q", "Нет в списке"],
  yonalishQisqa_boshlangich: ["boshlang'ich ta'lim", "начальное образование"],
  yonalishQisqa_mat_ustoz: ["matematika o'qituvchiligi", "учитель математики"],
  yonalishQisqa_texnika: ["texnika/IT", "техника/IT"],
  yonalishQisqa_iqtisod: ["iqtisodiyot", "экономика"],
  yonalishQisqa_boshqa: ["boshqa", "другое"],
  /* Ustoz rejimi (`screens/Lesson.tsx`). */
  ustozJavob: ["Javob va yechim", "Ответ и решение"],
  ustozRejimIzoh: ["Ustoz rejimi", "Режим учителя"],
  /* Pedagogika talabasining asosiy tugmasi (bosh sahifa). */
  boshPedagog: ["Boshlang'ich sinf darslari", "Уроки начальных классов"],
  boshPedagogIzoh: [
    "1–4-sinf — javob va yechim bilan, sinfga ko'rsatishga tayyor",
    "1–4 классы — с ответом и решением, готово для показа классу",
  ],
  /* Tanlovlar izoh bilan: "Talaba" yozuvining o'zi universitetmi,
     kollejmi — aytmaydi va odam noto'g'ri tugmani bosardi. */
  anketaOquvchiIzoh: ["1–11-sinf", "1–11 класс"],
  anketaTalabaIzoh: ["Universitet, institut", "Университет, институт"],
  anketaAbiturient: ["Abituriyent", "Абитуриент"],
  anketaAbiturientIzoh: ["DTMga tayyorlanyapman", "Готовлюсь к ДТМ"],
  anketaOtaOnaIzoh: ["Farzandim uchun", "Для ребёнка"],
  anketaUstozIzoh: ["Maktab, OTM yoki markaz", "Школа, вуз или центр"],
  anketaKattalarIzoh: ["O'zim uchun o'rganaman", "Учусь для себя"],
  anketaDaraja: ["Qaysi daraja kerak?", "Какой уровень нужен?"],
  anketaDarajaMaktab: ["Maktab matematikasi", "Школьная математика"],
  anketaDarajaMaktabIzoh: ["Asoslardan boshlab, sinf bo'yicha", "С основ, по классам"],
  anketaDarajaOliy: ["Universitet darajasi", "Уровень вуза"],
  anketaDarajaOliyIzoh: ["Analiz, formulalar, murakkab masalalar", "Анализ, формулы, сложные задачи"],
  anketaMajburIzoh: [
    "Ikki bosish — va ilova sizga moslashadi: kerakli darslar birinchi chiqadi.",
    "Два нажатия — и приложение подстроится: нужное появится первым.",
  ],
  /* Bosh sahifadagi "siz kimsiz" yorlig'i — bosilsa anketa qayta ochiladi. */
  profilOquvchi: ["{n}-sinf o'quvchisi", "Ученик {n} класса"],
  profilOtaOna: ["Ota-ona · {n}-sinf", "Родитель · {n} класс"],
  profilOtaOnaKichik: ["Ota-ona · maktabgacha", "Родитель · дошкольник"],
  profilTalaba: ["Talaba · {n}-kurs", "Студент · {n} курс"],
  profilMagistr: ["Magistrant", "Магистрант"],
  profilAbiturient: ["Abituriyent", "Абитуриент"],
  profilUstoz: ["O'qituvchi", "Преподаватель"],
  profilKattalar: ["O'zim uchun", "Для себя"],
  profilOzgartir: ["O'zgartirish", "Изменить"],
  /* Profilga mos asosiy tugma (bosh sahifa). */
  boshSinfDarslari: ["{n}-sinf darslari", "Уроки {n} класса"],
  boshSinfDarslariIzoh: ["Sizning sinfingiz — birinchi darsdan", "Ваш класс — с первого урока"],
  boshMaktabgachaDarslari: ["Maktabgacha darslar", "Дошкольные уроки"],
  boshAbiturient: ["DTMga tayyorlanish", "Подготовка к ДТМ"],
  boshAbiturientIzoh: ["Haqiqiy variantlar, vaqt bilan, xato tahlili", "Настоящие варианты, на время, разбор ошибок"],
  boshUstoz: ["O'quvchilarga testlar", "Тесты для учеников"],
  boshUstozIzoh: ["Sinf bo'yicha blok testlar va to'plamlar", "Блок-тесты и подборки по классам"],
  darslarSizning: ["Siz uchun", "Для вас"],
  oliyBolim: ["Universitet", "Университет"],
  reytingTalabalar: ["Talabalar", "Студенты"],
  sessiya: ["Sessiyaga tayyorlanish", "Подготовка к сессии"],
  sessiyaIzoh: [
    "Har variant — {savol} savol, {daqiqa} daqiqa. Oxirida baho va xatolar tahlili.",
    "Каждый вариант — {savol} вопросов, {daqiqa} минут. В конце оценка и разбор ошибок.",
  ],
  sessiyaBaho: ["Baho", "Оценка"],
  sessiyaBahoIzoh: [
    "Taxminiy baho: 86% — 5, 71% — 4, 55% — 3. Har oliygohning o'z mezoni bor.",
    "Примерная оценка: 86% — 5, 71% — 4, 55% — 3. У каждого вуза свои критерии.",
  ],
  menyuSessiyaIzoh: ["O'z faningiz bo'yicha, vaqt bilan", "По вашему предмету, на время"],
  menyuOliyFormulaIzoh: ["Limit, hosila, integral, ehtimollik", "Пределы, производные, интегралы, вероятность"],
  menyuTalaba: ["Talaba uchun", "Для студента"],
  testSizning: ["Sizning sinfingiz", "Ваш класс"],

  /* ---------------- xotira o'yini ---------------- */
  xotiraPogona: ["{n}-pog'ona", "Ступень {n}"],
  xotiraEsla: ["Eslab qol…", "Запоминай…"],
  xotiraQaytar: ["Endi tering", "Теперь набери"],
  xotiraTeskari: ["TESKARI tartibda tering", "Набери в ОБРАТНОМ порядке"],
  xotiraNatija: ["{n} ta son", "чисел: {n}"],

  /* ---------------- tajriba va haftalik jadval ---------------- */
  tjD0: ["Yangi o'yinchi", "Новичок"],
  tjD1: ["Qiziquvchan", "Любознательный"],
  tjD2: ["Bilimdon", "Знаток"],
  tjD3: ["Usta", "Мастер"],
  tjD4: ["Chempion", "Чемпион"],
  tjD5: ["Afsona", "Легенда"],
  tjQoshildi: ["+{n} tajriba", "+{n} опыта"],
  tjKeyingi: ["{nom}gacha {n}", "До «{nom}»: {n}"],
  tjEngYuqori: ["Eng yuqori daraja!", "Высший уровень!"],
  tjYangiDaraja: ["Yangi daraja: {nom}!", "Новый уровень: {nom}!"],
  tjMeningDaraja: ["Mening darajam", "Мой уровень"],
  tjOyinGalaba: ["{o} o'yin · {g} g'alaba", "Игр: {o} · Побед: {g}"],
  tjXato: ["Yuklab bo'lmadi. Internetni tekshiring", "Не удалось загрузить. Проверьте интернет"],
  tjJadval: ["Haftalik jadval", "Таблица недели"],
  tjJadvalIzoh: ["Dushanbadan beri to'plangan ochko", "Очки с понедельника"],
  tjHammasi: ["Hammasi", "Все"],
  tjBirga: ["Birga o'ynaganlarim", "С кем играл"],
  tjBoshJadval: ["Bu hafta hali hech kim o'ynamadi. Birinchi bo'ling!", "На этой неделе ещё никто не играл. Будьте первым!"],
  tjBoshBirga: ["Do'stlar yoki oila bilan o'ynang — ular shu yerda chiqadi", "Играйте с друзьями или семьёй — они появятся здесь"],
  tjSizJoy: ["Siz: {n}-o'rin", "Вы: {n}-е место"],
  tjUlash: ["Natijani ulashish", "Поделиться результатом"],
  tjUlashGolib: ["🏆 {oyin} o'yinida g'olib bo'ldim! +{n} ochko. Kel, bellashamiz!", "🏆 Я победил в игре «{oyin}»! +{n} очков. Давай сразимся!"],
  tjUlashOddiy: ["🎲 {oyin} o'ynadim: +{n} ochko. Sen ham qo'shil!", "🎲 Сыграл в «{oyin}»: +{n} очков. Присоединяйся!"],

  /* ---------------- tulki shaharchasi ---------------- */
  karvonTitul: ["Karvon yo'li", "Путь каравана"],
  karvonIzoh: ["Ipak yo'li bo'ylab sarguzasht: to'siqlarni yechib Xivaga yeting", "Приключение по Шёлковому пути: решайте препятствия и дойдите до Хивы"],
  karvonYangi: ["Yangi", "Новое"],
  shTitul: ["Tulki shaharchasi", "Городок Лиса"],
  shIzoh: ["Bino qur, har kuni hosil yig'", "Строй дома, собирай урожай"],
  shHosilBor: ["Hosil tayyor!", "Урожай готов!"],
  shHosilYigish: ["Hosilni yig'ish", "Собрать урожай"],
  shHosilOlindi: ["Bugungi hosil olindi · ertaga yana", "Урожай собран · завтра снова"],
  shHosilSavol: ["Bugun binolar qancha tanga berdi? To'g'ri topsangiz — ikki barobar!", "Сколько монет дали здания? Верный ответ — вдвое больше!"],
  shTekshir: ["Tekshirish", "Проверить"],
  shTogri: ["To'g'ri! +{n} tanga", "Верно! +{n} монет"],
  shNotogri: ["Javob {jami} edi. +{n} tanga", "Ответ был {jami}. +{n} монет"],
  shBoshJoy: ["Bo'sh joy — bino qurish", "Пустое место — построить"],
  shQur: ["Qurish", "Построить"],
  shOshir: ["{n}-darajaga oshirish", "Улучшить до {n} ур."],
  shEngYuqori: ["Eng yuqori daraja", "Максимальный уровень"],
  shKunigaTanga: ["kuniga {n} 🪙", "{n} 🪙 в день"],
  shDaraja: ["{n}-daraja", "{n} ур."],
  shTangaYetmaydi: ["Tanga yetmaydi — o'yin va darslarda yig'ing", "Не хватает монет — собирайте в играх и уроках"],
  shQoshnilar: ["Qo'shnilar", "Соседи"],
  shQoshnilarIzoh: ["Duel va jamoaviy o'yinlardagi sheriklaringiz", "Ваши соперники в дуэлях и командных играх"],
  shQoshniBosh: ["Kim bilandir o'ynang — uning shaharchasiga mehmonga borasiz", "Сыграйте с кем-нибудь — и сможете сходить в гости"],
  shBinolarSoni: ["{n} bino", "зданий: {n}"],
  shMehmon: ["{ism}ning shaharchasi", "Городок: {ism}"],
  shYoqdi: ["Yoqdi", "Нравится"],
  shYoqdiBosildi: ["Yoqdi ✓", "Нравится ✓"],
  shOrtga: ["Shaharchamga qaytish", "Вернуться в свой городок"],
  shJami: ["Jami kuniga", "Всего в день"],
  bn_uy: ["Uy", "Дом"],
  bn_bog: ["Bog'", "Сад"],
  bn_dokon: ["Do'kon", "Магазин"],
  bn_maktab: ["Maktab", "Школа"],
  bn_kutubxona: ["Kutubxona", "Библиотека"],
  bn_park: ["Park", "Парк"],
  bn_fabrika: ["Fabrika", "Фабрика"],
  bn_minora: ["Minora", "Башня"],
  bn_rasadxona: ["Rasadxona", "Обсерватория"],
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
