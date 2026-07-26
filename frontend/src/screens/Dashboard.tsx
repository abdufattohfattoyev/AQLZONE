import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";
import { Reveal } from "../components/Reveal";
import { getHisob, joriyProfil, profilSoni } from "../lib/api";
import type { Hisob } from "../lib/api";
import { COURSES, lessonCount } from "../lib/curriculum";
import { UNIT_COLORS } from "../lib/types";
import type { Course } from "../lib/curriculum";
import type { Progress } from "../lib/types";

interface Props {
  progressOf: (c: Course) => Progress;
  onOpen: (c: Course) => void;
  /** Profil tanlash ekrani. Tugma faqat ikkinchi bola qo'shilganda chiqadi. */
  onProfillar: () => void;
  /** Hisob sozlamalari — ism, familiya, kirish usullari. */
  onSozlama: () => void;
  /** Reyting — barcha kurslar bo'yicha umumiy. */
  onReyting: () => void;
}

/** Ro'yxat navbat bilan chiqsin — ekran "jonli" ochilgandek ko'rinadi. */
const kech = (ms: number) => ({ "--az-kech": `${ms}ms` }) as CSSProperties;

/**
 * Joriy bolaning profili.
 *
 * Tanlangani bo'lmasa BIRINCHISI olinadi — server ham aynan shunday
 * qiladi. Ikkalasi bir xil qoidaga bo'ysunmasa, ekranda bir bolaning
 * nomi, progressda esa boshqasiniki turardi.
 */
function joriyBola(h: Hisob | null) {
  const ro = h?.profillar ?? [];
  const id = joriyProfil();
  return ro.find((p) => String(p.id) === id) ?? ro[0] ?? null;
}

export function Dashboard({ progressOf, onOpen, onProfillar, onSozlama, onReyting }: Props) {
  // Sinxron o'qiladi (localStorage) — tugma sakrab chiqmasligi uchun.
  const kopBola = profilSoni() > 1;
  const [hisob, setHisob] = useState<Hisob | null>(null);

  // Ism serverdan keladi. Kelmaguncha tugmada "Hisobim" turadi — o'lchami
  // deyarli bir xil, shuning uchun ism paydo bo'lganda qator sakramaydi.
  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => { if (!bekor) setHisob(h); });
    return () => { bekor = true; };
  }, []);

  const bola = joriyBola(hisob);
  const jamiDars = COURSES.reduce((n, c) => n + lessonCount(c), 0);
  const jamiYulduz = COURSES.reduce((n, c) => n + progressOf(c).stars, 0);
  const maktabgacha = COURSES.filter((c) => c.grade === 0);
  const sinflar = COURSES.filter((c) => c.grade > 0);

  return (
    /* Kenglik ekranga qarab o'sadi. Telefonda bitta ustun — kartalar katta va
       bosish oson. Planshetdan boshlab kurslar yonma-yon turadi, aks holda
       katta ekranda ro'yxat ingichka tasma bo'lib cho'zilib ketardi. */
    <div className="mx-auto w-full max-w-[430px] px-4 pt-7 pb-16 sm:max-w-[700px] sm:px-6 lg:max-w-[1020px]">
      {/* ---- brend ---- */}
      <header className="az-kirish text-center">
        {/* Bosh ekranda brend TO'LIQ ko'rinadi: belgi + yozuv + shior.
            Yozuv logoning ichida bo'lgani uchun sarlavha takrorlanmaydi —
            h1 faqat ekran o'quvchisi va qidiruv uchun ko'rinmas holda qoladi.

            O'lcham CSS'da: `size` faqat SVG nisbatini beradi, kenglikni esa
            klass boshqaradi — 320px li telefonda 272px qat'iy kenglik
            chetlarga tegib ketardi. */}
        <Logo size={272} variant="toliq"
          className="mx-auto h-auto w-[min(272px,74vw)] drop-shadow-[0_8px_16px_rgb(30_50_110/0.18)]
                     sm:w-[300px]" />
        <h1 className="sr-only">Aql Zone — bilim va o'yin platformasi</h1>

        <div className="mt-4 flex justify-center gap-2">
          <Belgi ic="star" matn={`${jamiYulduz} yulduz`} />
          <Belgi ic="map" matn={`${jamiDars} dars`} />
        </div>

        <div className="mt-3 flex justify-center gap-2">
          {/* Profil almashtirish faqat IKKI va undan ko'p bola bo'lganda
              ma'noli. Bitta bolali oilada bu tugma hech narsa qilmaydi va
              faqat "bu nima?" degan savol tug'diradi. Bola qo'shish
              "Hisobim" ichida turadi va ikkinchisi qo'shilishi bilan bu
              tugma o'zi paydo bo'ladi. */}
          {kopBola && (
            <button type="button" onClick={onProfillar}
              className="clay-press flex items-center gap-1.5 rounded-full bg-karta/70
                         px-3.5 py-1.5 text-[12.5px] text-ink-soft backdrop-blur-sm">
              <Icon name="parent" size={15} />
              Kim o'ynayapti?
            </button>
          )}
          {/* Reyting kursga bog'liq emas — barcha kurslar yulduzi birga
              hisoblanadi, shuning uchun tugma bosh sahifada turadi. */}
          <button type="button" onClick={onReyting} title="Reyting"
            className="clay-press flex items-center gap-1.5 rounded-full bg-karta/70
                       px-3.5 py-1.5 text-[12.5px] text-ink-soft backdrop-blur-sm">
            <Icon name="trophy" size={15} className="text-brand-gold" />
            Reyting
          </button>
          {/* Hisob tugmasi — ism bilan.
              Kimning hisobida ekanini ko'rsatish shu yerda muhim: bir
              telefonda ota-ona ham, bola ham ochadi va "bu kimning
              yulduzlari?" degan savol doim tug'iladi. Ism kelmaguncha
              eski matn turadi. */}
          <button type="button" onClick={onSozlama} title="Hisob sozlamalari"
            className="clay-press flex max-w-[190px] items-center gap-1.5 rounded-full bg-karta/70
                       px-3.5 py-1.5 text-[12.5px] text-ink-soft backdrop-blur-sm">
            {bola ? (
              <span className="grid size-[18px] shrink-0 place-items-center rounded-full
                               bg-track text-[11px] leading-none">
                {bola.avatar || "🦊"}
              </span>
            ) : (
              <Icon name="pencil" size={15} />
            )}
            <span className="truncate">{hisob?.toliqIsm || "Hisobim"}</span>
          </button>
        </div>
      </header>

      {/* Maktabgacha kurs alohida sarlavha ostida turadi: u sinf emas va
          ota-ona "bolam hali maktabga bormaydi" deganda aynan shu yerni
          izlaydi. Bitta ro'yxatda turganda u "0-sinf" dek ko'rinardi. */}
      {maktabgacha.length > 0 && (
        <>
          <Sarlavha kech={kech(60)}>Maktabga tayyorgarlik · 4–6 yosh</Sarlavha>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {maktabgacha.map((c, i) => (
              <KursKarta key={c.id} c={c} i={i} progressOf={progressOf} onOpen={onOpen} />
            ))}
          </div>
        </>
      )}

      <Sarlavha kech={kech(90)}>Sinf kurslari</Sarlavha>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sinflar.map((c, i) => (
          <KursKarta key={c.id} c={c} i={i + maktabgacha.length} progressOf={progressOf} onOpen={onOpen} />
        ))}
      </div>

      <p className="az-kirish mt-8 text-center text-[12px] text-ink-soft/80" style={kech(460)}>
        Har bir kurs bolaning yoshiga qarab tuzilgan
      </p>
    </div>
  );
}

function Sarlavha({ children, kech }: { children: React.ReactNode; kech: CSSProperties }) {
  return (
    <h2 className="az-kirish mt-8 mb-2.5 ml-1.5 text-[12px] tracking-widest text-ink-soft uppercase"
      style={kech}>
      {children}
    </h2>
  );
}

/**
 * Bitta kurs kartasi.
 *
 * `i` — ro'yxatdagi o'rni. Faqat animatsiya kechikishi uchun kerak, shuning
 * uchun ikkita ro'yxat bo'lganda ikkinchisi birinchisining davomi sifatida
 * sanaladi: kartalar yuqoridan pastga navbat bilan chiqadi.
 */
function KursKarta({ c, i, progressOf, onOpen }: {
  c: Course; i: number;
  progressOf: (c: Course) => Progress;
  onOpen: (c: Course) => void;
}) {
  const p = progressOf(c);
  const total = lessonCount(c);
  const done = Object.keys(p.done).length;
  const foiz = Math.round((done / total) * 100);
  const color = UNIT_COLORS[c.color];

  return (
    /* `h-full` ikkalasida ham: yonma-yon turgan kartalarning matni turli
       uzunlikda, `h-full` bo'lmasa qatordagi kartalar har xil balandlikda
       chiqib, ro'yxat tishli ko'rinardi. */
    <Reveal kech={i * 90} className="h-full">
      <button type="button" onClick={() => onOpen(c)}
        /* `az-yaltir` ataylab yo'q: u `overflow: hidden` talab qiladi va
           kartadan chiqib turgan "tugadi" belgisini kesib qo'yardi. */
        className="tugma-3d flex h-full w-full items-center gap-4 rounded-clay bg-karta/95 p-4
                   text-left shadow-clay backdrop-blur-sm"
        style={kech(110 + i * 70)}>
        <span className={`relative grid size-16 shrink-0 place-items-center overflow-visible rounded-[20px] text-white ${color.bg}`}>
          <Icon name={c.ic} size={34} />
          {/* Ichki yorug'lik — tekis rangni hajmli qiladi */}
          <span className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-b from-white/35 to-transparent" />
          {foiz === 100 && (
            <span className="absolute -right-1.5 -bottom-1.5 grid size-6 place-items-center rounded-full
                             bg-brand-green text-white ring-3 ring-karta">
              <Icon name="check" size={14} />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-[17px] leading-tight">{c.title}</span>
            {done > 0 && (
              <span className="ml-auto shrink-0 font-display text-[13px] text-ink-dim">{foiz}%</span>
            )}
          </span>
          <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-dim">{c.desc}</span>

          <span className="mt-2 flex items-center gap-2">
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-track">
              <span className="block h-full rounded-full bg-gradient-to-r from-brand-green to-brand-green-d
                               transition-[width] duration-500"
                style={{ width: `${foiz}%` }} />
            </span>
            <span className="text-[11.5px] whitespace-nowrap text-ink-dim">{done}/{total}</span>
          </span>
        </span>

        <Icon name="chevron" size={20} className="shrink-0 text-ink-dim" />
      </button>
    </Reveal>
  );
}

function Belgi({ ic, matn }: { ic: "star" | "map"; matn: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-karta/70 px-3 py-1.5 text-[12.5px]
                     text-ink-soft backdrop-blur-sm">
      <Icon name={ic} size={15} className={ic === "star" ? "text-brand-gold" : "text-brand-blue-d"} />
      {matn}
    </span>
  );
}
