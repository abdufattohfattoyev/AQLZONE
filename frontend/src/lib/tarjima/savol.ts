/**
 * Savol matnlari — ikki tilda.
 *
 * Bu yerda faqat SAVOL bor: prompt (Aql nima deyishi), ifoda matni va
 * so'z bo'lgan javob variantlari. Interfeys matnlari `lib/matn.ts` da.
 * Ikkisi ataylab ajratilgan: savol matni dars mazmuni bilan birga
 * o'zgaradi, interfeys esa dizayn bilan.
 *
 * RUSCHA MATNLARDA KELISHIK TUZOG'I bor va u yerda ataylab chetlab
 * o'tilgan. O'zbekchada "olmani top" qo'shimcha bilan yasaladi, ruschada
 * esa ot kelishikka kiradi ("найди яблоко", "найди клубнику") va jinsga
 * qarab sifat ham o'zgaradi. Shu sabab ruscha savollar BOSH KELISHIKda
 * turadigan qolipga solingan: "Где красное яблоко?", "Как говорит
 * собака?", "Сколько их?". Ma'no bir xil, grammatikasi esa har qanday
 * so'z bilan to'g'ri chiqadi.
 */
import { til } from "../til";

const S = {
  /* ---------------- ranglar ---------------- */
  rangTop: ["Shu rangni top!", "Найди этот цвет!"],
  rangQaysi: ["Qaysi biri {nom}?", "Где {nom} цвет?"],
  narsaRang: ["{nom} qanday rangda?", "Какого цвета {nom}?"],
  rangliMeva: ["{sifat} {nom}ni top!", "Где {sifat} {nom}?"],

  /* ---------------- shakllar va naqsh ---------------- */
  shaklTop: ["Xuddi shu shaklni top!", "Найди такую же фигуру!"],
  shaklQaysi: ["Qaysi biri {nom}?", "Где {nom}?"],
  naqshKeyin: ["Keyin nima keladi?", "Что будет дальше?"],

  /* ---------------- guruhlash ---------------- */
  guruhQaysi: ["Qaysi biri {nom}?", "Что из этого — {nom}?"],
  boshqacha: ["Qaysi biri boshqacha?", "Что здесь лишнее?"],
  yem: ["{nom} nimani yeydi?", "Что ест {nom}?"],
  kayfiyat: ["Qaysi biri {nom}?", "Кто из них {nom}?"],

  /* ---------------- hayvon, meva, transport ---------------- */
  hayvonQaysi: ["Qaysi biri {nom}?", "Где {nom}?"],
  ovozKim: ['Kim "{ovoz}" deydi?', "Кто говорит «{ovoz}»?"],
  ovozQanday: ["{nom} qanday ovoz chiqaradi?", "Как говорит {nom}?"],
  mevaQaysi: ["Qaysi biri {nom}?", "Где {nom}?"],
  transportQaysi: ["Qaysi biri {nom}?", "Где {nom}?"],
  transportJoy: ["Qaysi biri {qayer} yuradi?", "Что передвигается {qayer}?"],

  /* ---------------- o'lcham va yo'nalish ---------------- */
  olcham: ["Qaysi biri {sifat}?", "Что {sifat}?"],
  yonalish: ["Qaysi strelka {nom} qaragan?", "Какая стрелка смотрит {nom}?"],

  /* ---------------- vaqt: kun, hafta, ob-havo ---------------- */
  kunQaysi: ["Qaysi biri {nom}?", "Где {nom}?"],
  kunKeyin: ["{nom}dan keyin nima bo'ladi?", "Что бывает после {nom}?"],
  haftaKeyin: ["{kun}dan keyin qaysi kun keladi?", "Какой день идёт после {kun}?"],
  obHavoQaysi: ["Qaysi biri {nom} kun?", "Какой день {nom}?"],
  obHavoKiyim: ["Bunday kunda nima kerak?", "Что нужно в такой день?"],

  /* ---------------- sanash ---------------- */
  nechta: ["Nechta {nom}?", "Сколько их?"],
  qayerdaKop: ["Qayerda ko'p? Nechta?", "Где больше? Сколько?"],
  qayerdaKam: ["Qayerda kam? Nechta?", "Где меньше? Сколько?"],
  hammasiNechta: ["Hammasi nechta?", "Сколько всего?"],
  tushibQolgan: ["Qaysi son tushib qolgan?", "Какое число пропущено?"],
  nechtaQoldi: ["Nechtasi qoldi?", "Сколько осталось?"],
  qoshBuyruq: ["{a} ga {b} ni qo'sh!", "Прибавь {b} к {a}!"],
  ayirBuyruq: ["{a} dan {b} ni ayir!", "Вычти {b} из {a}!"],
  keyingiSon: ["{n} dan keyin qaysi son keladi?", "Какое число идёт после {n}?"],
  oldingiSon: ["{n} dan oldin qaysi son turadi?", "Какое число стоит перед {n}?"],
  keyingiNima: ["{n} dan keyin nima keladi?", "Что идёт после {n}?"],
  oldingiNima: ["{n} dan oldin nima turadi?", "Что стоит перед {n}?"],

  /* ---------------- raqam va harf ---------------- */
  raqamQaysi: ["Qaysi biri {n} raqami?", "Где цифра {n}?"],
  harfQaysi: ["Qaysi biri {h} harfi?", "Где буква {h}?"],
  harfTop: ["Xuddi shu harfni top!", "Найди такую же букву!"],
  boshHarf: ['"{nom}" qaysi harf bilan boshlanadi?', "С какой буквы начинается «{nom}»?"],

  /* ---------------- 1-sinf ---------------- */
  shunisiTop: ["Xuddi shunisini top!", "Найди такой же!"],
  engKatta: ["Qaysi hayvon eng katta?", "Какое животное самое большое?"],
  engKichik: ["Qaysi hayvon eng kichik?", "Какое животное самое маленькое?"],
  narsaQayerda: ["{nom} qayerda?", "Где {nom}?"],
  qaysiSonKatta: ["Qaysi son katta?", "Какое число больше?"],
  yetmayotgan: ["Yetmayotgan sonni top!", "Найди пропущенное число!"],
  qosh: ["Qo'sh!", "Сложи!"],
  ayir: ["Ayir!", "Вычти!"],
  onlikTold: [
    "Avval 10 gacha to'ldir, qolganini qo'sh!",
    "Сначала дополни до 10, потом прибавь остальное!",
  ],
  onlikTush: [
    "Avval 10 gacha tush, keyin qolganini ayir!",
    "Сначала спустись до 10, потом вычти остальное!",
  ],
  // Ruscha shakl ATAYLAB "Пучков: 1" ko'rinishida: son o'zgarganda otning
  // shakli ham o'zgaradi ("1 пучок", "2 пучка", "5 пучков") va uni
  // qolipda to'g'ri chiqarib bo'lmaydi.
  dasta: ["{t} ta dasta va {u} ta tayoqcha. Nechta?", "Пучков: {t}, палочек: {u}. Сколько всего?"],
  onlikQosh: [
    "O'nliklarni qo'shamiz: 3 o'nlik + 4 o'nlik = 7 o'nlik!",
    "Складываем десятки: 3 дес. + 4 дес. = 7 дес.!",
  ],
  onlikAyir: [
    "O'nliklarni ayiramiz: 7 o'nlik − 2 o'nlik = 5 o'nlik!",
    "Вычитаем десятки: 7 дес. − 2 дес. = 5 дес.!",
  ],
  onlikBirlikQosh: [
    "O'nlikni o'nlikka, birlikni birlikka qo'sh!",
    "Десятки к десяткам, единицы к единицам!",
  ],
  onlikBirlikAyir: [
    "O'nlikdan o'nlikni, birlikdan birlikni ayir!",
    "Из десятков вычти десятки, из единиц — единицы!",
  ],

  /* ---------------- ko'paytirish va bo'lish ---------------- */
  kopaytir: ["Ko'paytirib, to'g'ri javobni tanla!", "Умножь и выбери верный ответ!"],
  bol: ["Bo'lib, to'g'ri javobni tanla!", "Раздели и выбери верный ответ!"],
  kopaytmaBolinma: [
    "Ko'paytmani bilsang — bo'linmani ham topasan!",
    "Знаешь произведение — найдёшь и частное!",
  ],
  yigindiKopaytma: [
    "Bir xil qo'shiluvchilar yig'indisini ko'paytmaga aylantiramiz!",
    "Превращаем сумму одинаковых слагаемых в произведение!",
  ],
  guruhlarJami: [
    "{g} ta guruh, har birida {k} ta {nom}. Hammasi bo'lib nechta?",
    "Групп: {g}, в каждой по {k}. Сколько всего?",
  ],
  tengGuruh: [
    "{jami} ta {nom}ni {g} ta teng guruhga bo'ldik. Har birida nechtadan?",
    "Предметов: {jami}. Разделили на равные группы: {g}. Сколько в каждой?",
  ],
  kopXonaliKopaytir: [
    "Ko'p xonali sonni bir xonaliga ko'paytir!",
    "Умножь многозначное число на однозначное!",
  ],
  kopXonaliBol: [
    "Ko'p xonali sonni bir xonaliga bo'l!",
    "Раздели многозначное число на однозначное!",
  ],
  qoldiqTop: [
    "Qoldiqni top! Qoldiq har doim bo'luvchidan kichik.",
    "Найди остаток! Остаток всегда меньше делителя.",
  ],
  ikkiXonaliKopaytir: [
    "Ikki xonali sonlarni ustun shaklida ko'paytir!",
    "Умножь двузначные числа в столбик!",
  ],
  uchXonaliKopaytir: [
    "Uch xonali sonni bir xonaliga ko'paytir!",
    "Умножь трёхзначное число на однозначное!",
  ],
  yumaloqKopaytir: [
    "Yumaloq songa ko'paytirish: nollarni keyin qo'shamiz!",
    "Умножение на круглое число: нули дописываем потом!",
  ],
  ikkiXonaliBol: ["Ikki xonali songa bo'l!", "Раздели на двузначное число!"],

  /* ---------------- ustun va o'nlikdan o'tish ---------------- */
  ustunQosh: ["Ustun shaklida qo'shamiz. Javobni tanla!", "Складываем в столбик. Выбери ответ!"],
  ustunAyir: ["Ustun shaklida ayiramiz. Javobni tanla!", "Вычитаем в столбик. Выбери ответ!"],
  onlikdanOtibQosh: [
    "O'nlikdan o'tib qo'sh! Avval o'nlikkacha to'ldir.",
    "Сложи с переходом через десяток! Сначала дополни до десятка.",
  ],
  onlikdanOtibAyir: [
    "O'nlikdan o'tib ayir! Bitta o'nlikni buzamiz.",
    "Вычти с переходом через десяток! Разбиваем один десяток.",
  ],

  /* ---------------- xonalar va yaxlitlash ---------------- */
  xonaAjrat: ["Sonni xona qo'shiluvchilariga ajrat!", "Разложи число на разрядные слагаемые!"],
  xonadanYasa: ["Xona qo'shiluvchilaridan sonni yasa!", "Составь число из разрядных слагаемых!"],
  xonalardanYasa: ["Sonni xonalaridan yasa!", "Составь число из разрядов!"],
  uchXonaliAjrat: [
    "Uch xonali sonning xonalarini ajratib ko'r!",
    "Разбери трёхзначное число по разрядам!",
  ],
  onlarRaqami: ["O'nlar xonasidagi raqamni top!", "Найди цифру в разряде десятков!"],
  birlarRaqami: ["Birlar xonasidagi raqamni top!", "Найди цифру в разряде единиц!"],
  minglarSinfi: ["Minglar sinfini ajratib ko'r!", "Выдели класс тысяч!"],
  kattasiniTanla: ["Qaysi son katta? Kattasini tanla!", "Какое число больше? Выбери большее!"],
  xonalarSolishtir: [
    "Qaysi son katta? Xonalar sonini solishtir!",
    "Какое число больше? Сравни количество разрядов!",
  ],
  onlikkachaYaxlit: ["Sonni o'nlikkacha yaxlitla!", "Округли число до десятков!"],
  yuzlikkachaYaxlit: ["Sonni yuzlikkacha yaxlitla!", "Округли число до сотен!"],
  minglikkachaYaxlit: ["Minglikkacha yaxlitla!", "Округли до тысяч!"],
  yuzlikkachaYaxlit2: ["Yuzlikkacha yaxlitla!", "Округли до сотен!"],
  nurTushib: [
    "Sonlar nurida tushib qolgan sonni top!",
    "Найди пропущенное число на числовом луче!",
  ],

  /* ---------------- ifoda va tenglama ---------------- */
  qavsAvval: ["Avval qavs ichini hisoblaymiz!", "Сначала считаем в скобках!"],
  kopaytKeyinQosh: ["Avval ko'paytiramiz, keyin qo'shamiz!", "Сначала умножаем, потом складываем!"],
  kopaytKeyinQoshAyir: [
    "Avval ko'paytir, keyin qo'sh yoki ayir!",
    "Сначала умножь, потом сложи или вычти!",
  ],
  bolKeyinQosh: ["Avval bo'lamiz, keyin qo'shamiz!", "Сначала делим, потом складываем!"],
  amallarTartibi: [
    "Amallar tartibiga rioya qil: qavs → ×÷ → +−",
    "Соблюдай порядок действий: скобки → ×÷ → +−",
  ],
  harfQoy: ["{L} o'rniga {v} ni qo'yib hisobla!", "Подставь {v} вместо {L} и посчитай!"],
  nomalumKopaytuvchi: ["Noma'lum ko'paytuvchini top: x = ?", "Найди неизвестный множитель: x = ?"],
  nomalumQoshiluvchi: ["Noma'lum qo'shiluvchini top: x = ?", "Найди неизвестное слагаемое: x = ?"],
  nomalumKamayuvchi: ["Noma'lum kamayuvchini top: x = ?", "Найди неизвестное уменьшаемое: x = ?"],

  /* ---------------- ulush va kasr ---------------- */
  ulushNima: [
    "Shaklning bo'yalgan qismi — bu uning nimasi?",
    "Закрашенная часть фигуры — это её что?",
  ],
  ulushBol: ["{tot} ni {p} ta teng bo'lakka bo'lamiz!", "Делим {tot} на {p} равные части!"],
  ulushKatta: [
    "Qaysi ulush katta? Maxraj kichik bo'lsa — ulush katta!",
    "Какая доля больше? Чем меньше знаменатель — тем больше доля!",
  ],
  kasrQosh: ["Maxrajlar teng — suratlarni qo'shamiz!", "Знаменатели равны — складываем числители!"],
  kasrAyir: [
    "Suratlarni ayiramiz, maxraj o'zgarmaydi!",
    "Вычитаем числители, знаменатель не меняется!",
  ],

  /* ---------------- geometriya ---------------- */
  perimKvadrat: [
    "Kvadratning perimetrini top! (P = barcha tomonlar yig'indisi)",
    "Найди периметр квадрата! (P = сумма всех сторон)",
  ],
  perimTortburchak: [
    "To'g'ri to'rtburchakning perimetrini top! (P = barcha tomonlar yig'indisi)",
    "Найди периметр прямоугольника! (P = сумма всех сторон)",
  ],
  katakSana: [
    "Shakl nechta katakdan iborat? Sanab top!",
    "Из скольких клеток состоит фигура? Посчитай!",
  ],
  shaklNomiSavol: ["Bu qanday shakl? To'g'ri nomni tanla!", "Что это за фигура? Выбери верное название!"],
  burchakSoni: ["Bu shaklning nechta burchagi bor?", "Сколько углов у этой фигуры?"],
  yuzaF: ["To'g'ri to'rtburchak yuzasi: S = a × b", "Площадь прямоугольника: S = a × b"],
  tomonF: ["Tomonni topish: b = S ÷ a", "Найти сторону: b = S ÷ a"],

  /* ---------------- o'lchov birliklari ---------------- */
  smMm: ["1 sm = 10 mm. Hisobla!", "1 см = 10 мм. Посчитай!"],
  mmSm: ["10 mm = 1 sm. Hisobla!", "10 мм = 1 см. Посчитай!"],
  uzunlikBirlik: ["Uzunlik birliklarini eslaymiz!", "Вспоминаем единицы длины!"],
  massaBirlik: ["Massa birliklarini eslaymiz!", "Вспоминаем единицы массы!"],
  kattalikBirlik: ["Kattalik birliklarini eslaymiz!", "Вспоминаем единицы величин!"],
  vaqtBirlik: ["Vaqt birliklarini eslaymiz!", "Вспоминаем единицы времени!"],
  soatNecha: ["Soat nechani ko'rsatyapti?", "Сколько времени на часах?"],

  /* ---------------- harakat ---------------- */
  masofaF: ["Masofa = tezlik × vaqt", "Расстояние = скорость × время"],
  tezlikF: ["Tezlik = masofa ÷ vaqt", "Скорость = расстояние ÷ время"],
  vaqtF: ["Vaqt = masofa ÷ tezlik", "Время = расстояние ÷ скорость"],

  /* ---------------- jadval va koordinata ---------------- */
  katakQaysi: ["{nom} qaysi katakda joylashgan?", "В какой клетке {nom}?"],
  jadvalKop: [
    "Jadvalda eng ko'p nima bor? Nechta {nom} bor?",
    "Чего в таблице больше всего? Сколько их?",
  ],

  /* =============== ifoda matnlari (`text`) =============== */
  txtVa: ["va", "и"],
  txtOnlikkacha: ["(o'nlikkacha)", "(до десятков)"],
  txtYuzlikkacha: ["(yuzlikkacha)", "(до сотен)"],
  txtMinglikkacha: ["(minglikkacha)", "(до тысяч)"],
  txtQoldiq: ["qoldiq", "остаток"],
  txtQismi: ["{tot} ning {t} qismi = ?", "{t} от {tot} = ?"],
  txtXonaUch: ["{h} yuzlik {t} o'nlik {u} birlik = ?", "{h} сот. {t} дес. {u} ед. = ?"],
  txtXonaTort: [
    "{th} minglik {h} yuzlik {t} o'nlik {u} birlik = ?",
    "{th} тыс. {h} сот. {t} дес. {u} ед. = ?",
  ],
  txtYuzlikSoni: ["{n} sonida nechta yuzlik bor?", "Сколько сотен в числе {n}?"],
  txtOnlarXona: [
    "{n} sonining o'nlar xonasida qaysi raqam turibdi?",
    "Какая цифра в разряде десятков числа {n}?",
  ],
  txtBirlarXona: [
    "{n} sonining birlar xonasida qaysi raqam turibdi?",
    "Какая цифра в разряде единиц числа {n}?",
  ],
  txtMinglikSoni: ["{n} sonida nechta minglik bor?", "Сколько тысяч в числе {n}?"],
  txtTomonlari: [
    "Tomonlari {w} sm va {h} sm.   S = ?  (sm²)",
    "Стороны {w} см и {h} см.   S = ?  (см²)",
  ],
  txtYuzaTomon: [
    "S = {s} sm², a = {w} sm.   b = ?  (sm)",
    "S = {s} см², a = {w} см.   b = ?  (см)",
  ],
  txtTezlikS: ["v = {v} km/soat,   t = {t} soat.   s = ?", "v = {v} км/ч,   t = {t} ч.   s = ?"],
  txtTezlikV: ["s = {s} km,   t = {t} soat.   v = ?", "s = {s} км,   t = {t} ч.   v = ?"],
  txtTezlikT: ["s = {s} km,   v = {v} km/soat.   t = ?", "s = {s} км,   v = {v} км/ч.   t = ?"],
  txtSmMm: ["{n} sm = ? mm", "{n} см = ? мм"],
  txtMmSm: ["{n} mm = ? sm", "{n} мм = ? см"],

  /* --- birliklar jadvali: ifoda matnining o'zi --- */
  uSoatMinut: ["1 soat = ? minut", "1 ч = ? мин"],
  uSutkaSoat: ["1 sutka = ? soat", "1 сутки = ? ч"],
  uHaftaKun: ["1 hafta = ? kun", "1 неделя = ? дн."],
  uYilOy: ["1 yil = ? oy", "1 год = ? мес."],
  uYarimSoat: ["yarim soat = ? minut", "полчаса = ? мин"],
  uAsrYil: ["1 asr = ? yil", "1 век = ? лет"],
  uMinutSekund: ["1 minut = ? sekund", "1 мин = ? сек"],
  uMSm: ["1 m = ? sm", "1 м = ? см"],
  uDmSm: ["1 dm = ? sm", "1 дм = ? см"],
  uKmM: ["1 km = ? m", "1 км = ? м"],
  uMDm: ["1 m = ? dm", "1 м = ? дм"],
  uSmMm: ["1 sm = ? mm", "1 см = ? мм"],
  uKgG: ["1 kg = ? g", "1 кг = ? г"],
  uTKg: ["1 t = ? kg", "1 т = ? кг"],
  uSentnerKg: ["1 s (sentner) = ? kg", "1 ц (центнер) = ? кг"],
  uDm2Sm2: ["1 dm² = ? sm²", "1 дм² = ? см²"],
  uM2Dm2: ["1 m² = ? dm²", "1 м² = ? дм²"],
  uArM2: ["1 ar = ? m²", "1 ар = ? м²"],

  /* =============== so'z bo'lgan javob variantlari =============== */
  jYarmi: ["yarmi", "половина"],
  jUchdanBiri: ["uchdan biri", "треть"],
  jChoragi: ["choragi", "четверть"],
  jYuqorida: ["yuqorida", "сверху"],
  jPastda: ["pastda", "снизу"],
  jChapda: ["chapda", "слева"],
  jOngda: ["o'ngda", "справа"],
  jOrtada: ["o'rtada", "в середине"],
} satisfies Record<string, [string, string]>;

export type SavolKalit = keyof typeof S;

/** Savol matnini tilga qarab beradi va `{nom}` o'rinlarini to'ldiradi. */
export function p(k: SavolKalit, par?: Record<string, string | number>): string {
  const juft = S[k] as [string, string];
  let s = til() === "ru" ? juft[1] : juft[0];
  if (par) {
    for (const [nom, qiymat] of Object.entries(par)) {
      s = s.split(`{${nom}}`).join(String(qiymat));
    }
  }
  return s;
}
