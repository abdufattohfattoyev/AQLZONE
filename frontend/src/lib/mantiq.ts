/**
 * MANTIQ VA FIKRLASH — 2–4-sinf uchun alohida bo'lim (`screens/Mantiq.tsx`).
 *
 * ─────────────────────── NEGA ───────────────────────
 *
 * Oddiy darslar HISOBLASHNI o'rgatadi: 345 + 278. Prezident maktabi,
 * olimpiada va "IQ" savollari esa FIKRLASHNI so'raydi: "qatorda
 * nechta bola bor, agar Aziz oldindan 7-, orqadan 5-o'rinda bo'lsa?"
 * — bu yerda hisob bir amal, qiyini usulni topish. Bunday masalalar
 * maktab darsligida tarqoq uchraydi va bola ularni alohida mashq
 * qilmasa, imtihonda birinchi marta ko'radi.
 *
 * ─────────────────────── QANDAY ───────────────────────
 *
 * Har mavzu — bitta usul (o'ntadan oshiq xil masala emas): "1 ni ayir",
 * "oraliqlar daraxtdan bitta kam", "eng yomon holatni o'yla". Mavzu
 * ochilganda avval USUL ko'rsatiladi (`DarsKirish`: tushuncha → jonli
 * namuna → ikki sinov savol), keyin oltita savol.
 *
 * ─────────────────────── NEGA KURS EMAS ───────────────────────
 *
 * Kurs kodi (`Course.grade`) ilovaning o'nlab joyiga bog'langan:
 * masalalar sinfi, test bloklari, ota-ona hisoboti, server jadvallari.
 * Mantiq ularning birortasiga to'g'ri kelmaydi (u sinf emas) va kurs
 * qilib qo'shilsa, ulardan birini jimgina buzardi. Shuning uchun u
 * o'z ro'yxati va o'z yulduzlari bilan alohida turadi; tanga va zanjir
 * esa umumiy hisobga tushadi (`progress.tsx` → oyinTugadi).
 *
 * Savollar qabul imtihoni yasovchilaridan (`lib/qabulSavol.ts`) —
 * ular `scripts/qabul.ts` da yuzlab marta sinalgan.
 */
import type { Gen } from "./activity";
import type { Lesson, Unit } from "./types";
import { YASOVCHI } from "./qabulSavol";
import { til } from "./til";

const L = (uz: string, ru: string): string => (til() === "ru" ? ru : uz);

export interface MantiqMavzu {
  id: string;
  nom: string;
  /** Kartadagi bir qatorlik izoh — nima haqida. */
  izoh: string;
  /** Usul: sarlavha, ko'rgazma va tushuntirish (`Unit.intro`). */
  usul: { t: string; v: string[]; d: string };
  gen: Gen;
}

/**
 * Mavzular — OSONDAN QIYINGA. Tartib muhim: bosh sahifadagi "keyingi
 * mavzu" birinchi yulduzsiz mavzuni oladi.
 */
export function mantiqMavzular(): MantiqMavzu[] {
  const Y = YASOVCHI;
  return [
    {
      id: "qator", gen: Y.qatordaJoy,
      nom: L("Qatordagi joy", "Место в ряду"),
      izoh: L("Oldindan va orqadan sanash", "Счёт спереди и сзади"),
      usul: {
        t: L("Bola ikki marta sanaladi", "Ребёнка считают дважды"),
        v: ["7", "+", "5", "−", "1", "=", "11"],
        d: L("Oldindan 7-o'rin va orqadan 5-o'rin qo'shilsa, bola o'zi ikki marta sanaladi. Shuning uchun 1 ni ayiramiz.",
          "Если сложить 7-е место спереди и 5-е сзади, ребёнок посчитан дважды. Поэтому вычитаем 1."),
      },
    },
    {
      id: "oraliq", gen: Y.ustunlar,
      nom: L("Daraxtlar va oraliqlar", "Деревья и промежутки"),
      izoh: L("Oraliqlar bittaga kam", "Промежутков на один меньше"),
      usul: {
        t: L("Oraliqlar daraxtdan bitta kam", "Промежутков на один меньше, чем деревьев"),
        v: ["🌳", "—", "🌳", "—", "🌳"],
        d: L("3 ta daraxt orasida 2 ta oraliq bor. Masofa = (daraxtlar − 1) × oraliq.",
          "Между 3 деревьями 2 промежутка. Расстояние = (деревья − 1) × промежуток."),
      },
    },
    {
      id: "qonuniyat", gen: Y.ketmaKetlik,
      nom: L("Qonuniyatni top", "Найди закономерность"),
      izoh: L("Keyingi son qaysi?", "Какое число следующее?"),
      usul: {
        t: L("Qo'shni sonlar orasiga qara", "Смотри между соседними числами"),
        v: ["2", "→", "4", "→", "7", "→", "11"],
        d: L("Har ikki qo'shni son orasidagi farqni yozing: +2, +3, +4. Farqlarning o'zi ham qonuniyatga bo'ysunadi.",
          "Запишите разницу между соседними числами: +2, +3, +4. Сами разницы тоже подчиняются правилу."),
      },
    },
    {
      id: "tartib", gen: Y.tartib,
      nom: L("Kim baland?", "Кто выше?"),
      izoh: L("Gaplardan tartib tuzish", "Порядок из утверждений"),
      usul: {
        t: L("Hammasini bitta chiziqqa tiz", "Выстрой всех в одну линию"),
        v: ["A", ">", "B", ">", "C"],
        d: L("Har gapni belgi bilan yozing: \"A Bdan baland\" — A > B. Keyin hammasini bitta qatorga terib chiqing.",
          "Запишите каждое утверждение знаком: «A выше B» — A > B. Затем выстройте всех в один ряд."),
      },
    },
    {
      id: "kalendar", gen: Y.haftaKuni,
      nom: L("Kalendar", "Календарь"),
      izoh: L("N kundan keyin qaysi kun?", "Какой день через N дней?"),
      usul: {
        t: L("Har 7 kunda hafta qaytadi", "Каждые 7 дней неделя повторяется"),
        v: ["15", "=", "7", "·", "2", "+", "1"],
        d: L("Butun haftalarni tashlab yuboring — ular kunni o'zgartirmaydi. Faqat qoldiq kunlarni sanang.",
          "Отбросьте целые недели — они не меняют день. Считайте только оставшиеся дни."),
      },
    },
    {
      id: "oyoq", gen: Y.oyoqlar,
      nom: L("Boshlar va oyoqlar", "Головы и ноги"),
      izoh: L("Tovuqlar va quyonlar", "Куры и кролики"),
      usul: {
        t: L("Avval hammasi tovuq deb o'yla", "Сначала представь, что все — куры"),
        v: ["🐔", "2", "·", "🐰", "4"],
        d: L("Hammasi tovuq bo'lsa, oyoqlar 2 × boshlar bo'lardi. Ortiqcha oyoqlar — quyonlarniki: har quyonda 2 tadan ortiq.",
          "Если бы все были курами, ног было бы 2 × голов. Лишние ноги — у кроликов: у каждого на 2 больше."),
      },
    },
    {
      id: "tarozi", gen: Y.tarozi,
      nom: L("Tarozi", "Весы"),
      izoh: L("Teng og'irliklarni almashtirish", "Замена равных весов"),
      usul: {
        t: L("Teng narsani teng narsaga almashtir", "Заменяй равное равным"),
        v: ["🍎🍎", "=", "🍐🍐🍐"],
        d: L("Avval bitta narsaning og'irligini toping, keyin kerakli sonini ko'paytiring.",
          "Сначала найдите вес одного предмета, затем умножьте на нужное количество."),
      },
    },
    {
      id: "kvadrat", gen: Y.sehrliKvadrat,
      nom: L("Sehrli kvadrat", "Магический квадрат"),
      izoh: L("Yig'indilar teng", "Суммы равны"),
      usul: {
        t: L("To'la qatordan yig'indini top", "Найди сумму по полной строке"),
        v: ["2", "7", "6", "=", "15"],
        d: L("Avval hamma soni ma'lum qator yoki ustunni qo'shing — bu yig'indi hamma joyda bir xil. Keyin yetishmaganini toping.",
          "Сначала сложите строку или столбец, где известны все числа, — эта сумма везде одна. Затем найдите недостающее."),
      },
    },
    {
      id: "yosh", gen: Y.yosh,
      nom: L("Yosh masalalari", "Задачи на возраст"),
      izoh: L("Yosh farqi o'zgarmaydi", "Разница в возрасте не меняется"),
      usul: {
        t: L("Farq doim bir xil", "Разница всегда одинакова"),
        v: ["36", "−", "9", "=", "27"],
        d: L("Har yili hammaning yoshi 1 ga oshadi, shuning uchun ota va o'g'il orasidagi farq hech qachon o'zgarmaydi.",
          "Каждый год все становятся на 1 год старше, поэтому разница между отцом и сыном никогда не меняется."),
      },
    },
    {
      id: "raqam", gen: Y.sahifalar,
      nom: L("Raqamlar sanog'i", "Счёт цифр"),
      izoh: L("Sahifalarga nechta raqam?", "Сколько цифр на страницах?"),
      usul: {
        t: L("Bir, ikki va uch xonalilarni alohida sana", "Считай одно-, дву- и трёхзначные отдельно"),
        v: ["1–9", "·", "1", "+", "10–99", "·", "2"],
        d: L("1 dan 9 gacha — 9 ta bir xonali son. 10 dan 99 gacha — 90 ta, har birida 2 ta raqam. Keyin uch xonalilar.",
          "От 1 до 9 — 9 однозначных чисел. От 10 до 99 — 90 чисел по 2 цифры. Затем трёхзначные."),
      },
    },
    {
      id: "usul", gen: Y.kodlash,
      nom: L("Nechta usul?", "Сколько способов?"),
      izoh: L("Kodlar va o'yinlar", "Коды и партии"),
      usul: {
        t: L("Har o'ringa nechta tanlov bor?", "Сколько вариантов на каждое место?"),
        v: ["3", "·", "3", "·", "2", "=", "18"],
        d: L("Har bir o'ringa nechta raqam qo'yish mumkinligini yozing va ularni ko'paytiring. Nol boshda turolmaydi.",
          "Запишите, сколько цифр можно поставить на каждое место, и перемножьте. Ноль не может стоять первым."),
      },
    },
    {
      id: "kafolat", gen: Y.kafolat,
      nom: L("Eng kamida nechta?", "Наименьшее число"),
      izoh: L("Eng yomon holatni o'yla", "Представь худший случай"),
      usul: {
        t: L("Eng omadsiz holatni o'ylang", "Представьте самый неудачный случай"),
        v: ["🔴🔴🔵🔵", "+", "🟢🟢"],
        d: L("Avval boshqa rangdagi hamma sharlar chiqib ketadi deb faraz qiling. Shundan keyin kerakli shar albatta chiqadi.",
          "Сначала представьте, что вынули все шары других цветов. После этого нужный шар точно попадётся."),
      },
    },
    {
      id: "amal", gen: Y.kiritilganAmal,
      nom: L("Yangi amal", "Новое действие"),
      izoh: L("a ★ b qoidasi", "Правило a ★ b"),
      usul: {
        t: L("Qoidaga sonlarni qo'y", "Подставь числа в правило"),
        v: ["a ★ b", "=", "2a − b"],
        d: L("Qavs ichidagisini birinchi hisoblang: a o'rniga birinchi sonni, b o'rniga ikkinchisini qo'ying.",
          "Сначала вычислите в скобках: вместо a — первое число, вместо b — второе."),
      },
    },
    {
      id: "shakl", gen: Y.murakkabShakl,
      nom: L("Qirqilgan shakl", "Вырезанная фигура"),
      izoh: L("Perimetr o'zgaradimi?", "Меняется ли периметр?"),
      usul: {
        t: L("Burchakni qirqish perimetrni o'zgartirmaydi", "Вырезанный угол не меняет периметр"),
        v: ["P", "=", "2 · (a + b)"],
        d: L("Qirqilgan burchakning ikki tomonini tashqariga \"surib\" qo'ysangiz, yana to'liq to'rtburchak hosil bo'ladi. O'rtadagi o'yiq esa ikki devor qo'shadi.",
          "Если «выдвинуть» стороны вырезанного угла наружу, снова получится прямоугольник. А вырез посередине добавляет две стенки."),
      },
    },
  ];
}

export const mantiqMavzu = (id: string): MantiqMavzu | undefined => mantiqMavzular().find((m) => m.id === id);

/** Mavzu dars ekraniga (`screens/Lesson.tsx`) beriladigan bob va dars. */
export function mantiqDars(m: MantiqMavzu): { unit: Unit; lesson: Lesson } {
  const lesson: Lesson = { n: m.nom, ic: "puzzle", gens: [m.gen] };
  return { unit: { u: m.nom, ic: "puzzle", color: "blue", intro: m.usul, lessons: [lesson] }, lesson };
}

/** Kurs o'rnida ishlatiladigan id — darsga kirish shu bilan ochiladi (`DarsKirish`). */
export const MANTIQ_ID = "mantiq";

/* ------------------------------------------------------------ yulduzlar */

const KALIT = "azapp_mantiq_v1";

export function mantiqYulduzlar(): Record<string, number> {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "{}") as unknown;
    return x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, number>) : {};
  } catch { return {}; }
}

/** Natija yoziladi — faqat oshsa (dars qayta o'ynalganda yulduz kamaymaydi). */
export function mantiqYoz(id: string, yulduz: number): void {
  const x = mantiqYulduzlar();
  x[id] = Math.max(x[id] ?? 0, yulduz);
  try { localStorage.setItem(KALIT, JSON.stringify(x)); } catch { /* eslanmaydi, xolos */ }
}
