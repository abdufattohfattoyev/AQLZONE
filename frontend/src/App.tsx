/**
 * Marshrutlar.
 *
 * Har bir ekran o'z manziliga ega (yollar.ts ga qarang). Manzildagi qism
 * noto'g'ri bo'lsa — masalan bola havolani qo'lda o'zgartirsa yoki kurs
 * o'chirilgan bo'lsa — bo'sh ekran o'rniga tushunarli sahifa ko'rsatiladi.
 */
import { useEffect, useMemo } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Dashboard } from "./screens/Dashboard";
import { Home } from "./screens/Home";
import { Lesson } from "./screens/Lesson";
import { Dokon } from "./screens/Dokon";
import { Nishonlar } from "./screens/Nishonlar";
import { OtaOna } from "./screens/OtaOna";
import { Profillar } from "./screens/Profillar";
import { Reyting } from "./screens/Reyting";
import { Sozlamalar } from "./screens/Sozlamalar";
import { KodKirish } from "./screens/KodKirish";
import { NotFound } from "./screens/NotFound";
import { courseBySlug } from "./lib/curriculum";
import { KUNLIK_MAQSAD, useProgress } from "./lib/progress";
import type { LessonResult } from "./lib/progress";
import { isUnlocked } from "./lib/types";
import { temaOf, useTema } from "./lib/tema";
import { takrorlashDarsi } from "./lib/takrorlash";
import { oxirginiYoz } from "./lib/oxirgi";
import { nishonlar as nishonlarniHisobla } from "./lib/nishon";
import {
  indeksniOqi, yolDaftar, yolDars, yolDokon, yolKurs, yolKurslar, yolNishon,
  yolOtaOna, yolReyting, yolSozlama,
} from "./lib/yollar";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<KurslarSahifasi />} />
      <Route path="/profillar" element={<ProfilSahifasi />} />
      <Route path="/sozlamalar" element={<SozlamaSahifasi />} />
      {/* Botdagi «Saytga kirish» havolasi. Marshrut Tanishuv darvozasidan
          KEYIN turadi, lekin darvoza uni o'zi o'tkazib yuboradi — aks holda
          havola kirish ekraniga tushib, cheksiz halqa bo'lib qolardi. */}
      <Route path="/kirish/:kod" element={<KodKirish />} />
      <Route path="/reyting" element={<ReytingSahifasi />} />
      <Route path="/kurs/:slug" element={<KursSahifasi />} />
      {/* Diqqat: "daftar" bob nomiga o'xshaydi, shuning uchun u
          /:bob/:dars dan OLDIN turishi shart — aks holda marshrut
          uni bob deb qabul qilardi. */}
      <Route path="/kurs/:slug/daftar" element={<DaftarSahifasi />} />
      <Route path="/kurs/:slug/dokon" element={<DokonSahifasi />} />
      <Route path="/kurs/:slug/nishonlar" element={<NishonSahifasi />} />
      <Route path="/kurs/:slug/ota-ona" element={<OtaOnaSahifasi />} />
      <Route path="/kurs/:slug/:bob/:dars" element={<DarsSahifasi />} />
      {/* Eski havola ishlashda davom etsin */}
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function KurslarSahifasi() {
  const { progressOf } = useProgress();
  const nav = useNavigate();
  // Bosh sahifa — brendning kirish eshigi, o'z temasi bor.
  useTema("bosh");
  return (
    <Dashboard
      progressOf={progressOf}
      onOpen={(c) => nav(yolKurs(c))}
      onDavom={(c, ui, li) => nav(yolDars(c, ui, li))}
      onProfillar={() => nav("/profillar")}
      onSozlama={() => nav(yolSozlama())}
      onReyting={() => nav(yolReyting())}
    />
  );
}

function KursSahifasi() {
  const { slug } = useParams();
  const { progressOf, kunlik } = useProgress();
  const nav = useNavigate();

  const c = courseBySlug(slug ?? "");
  // Diqqat: hooklar shartdan OLDIN chaqirilishi kerak, aks holda kurs
  // topilmagan holatda hooklar tartibi buziladi.
  useTema(c ? temaOf(c.grade) : "bosh");

  // Bosh sahifadagi "Oxirgi marta shu yerda edingiz" kartasi shu yozuvga
  // suyanadi. Aynan SHU YERDA yoziladi — ya'ni kurs ochilganda, dars
  // tugaganda emas: bola darsni yarim tashlab ketsa ham, ertaga o'sha
  // kursga qaytishni xohlaydi.
  useEffect(() => { if (c) oxirginiYoz(c.slug); }, [c]);

  if (!c) return <NotFound nima={`"${slug}" kursi`} />;

  return (
    <Home
      slug={c.slug}
      title={c.title}
      izoh={c.grade === 0 ? "Maktabga tayyorgarlik" : "Darslik bo'yicha to'liq kurs"}
      units={c.units}
      progress={progressOf(c)}
      kunlik={kunlik}
      maqsad={KUNLIK_MAQSAD}
      onBack={() => nav(yolKurslar())}
      onStart={(ui, li) => nav(yolDars(c, ui, li))}
      onDaftar={() => nav(yolDaftar(c))}
      onDokon={() => nav(yolDokon(c))}
      onNishon={() => nav(yolNishon(c))}
      onOtaOna={() => nav(yolOtaOna(c))}
      onReyting={() => nav(yolReyting())}
    />
  );
}

function DarsSahifasi() {
  const { slug, bob, dars } = useParams();
  const { progressOf, darsTugadi } = useProgress();
  const nav = useNavigate();

  const c = courseBySlug(slug ?? "");
  useTema(c ? temaOf(c.grade) : "bosh");

  if (!c) return <NotFound nima={`"${slug}" kursi`} />;

  const ui = indeksniOqi(bob, "bob");
  const li = indeksniOqi(dars, "dars");
  const U = ui === null ? undefined : c.units[ui];
  const L = U && li !== null ? U.lessons[li] : undefined;

  if (ui === null || li === null || !U || !L) {
    return <NotFound nima="Bunday dars" qaytish={{ matn: c.title, yol: yolKurs(c) }} />;
  }

  // Yopiq darsni manzilni qo'lda o'zgartirib ochib bo'lmasin —
  // aks holda darslar tartibi butunlay ma'nosiz bo'lib qolardi.
  if (!isUnlocked(c.units, progressOf(c), ui, li)) return <Navigate to={yolKurs(c)} replace />;

  return (
    <Lesson
      key={`${c.id}-${ui}-${li}`}
      unit={U}
      lesson={L}
      joy={{ kurs: c.slug, ui, li }}
      onExit={() => nav(yolKurs(c))}
      onFinish={(r: LessonResult) => {
        darsTugadi(c, ui, li, r);
        nav(yolKurs(c));
      }}
    />
  );
}

/**
 * Xatolar daftari — takrorlash darsi.
 *
 * Bu dars hech qanday yulduz bermaydi va progressga yozilmaydi: uning
 * maqsadi yangi natija emas, eski xatoni tuzatish. Yulduz bersa, bola
 * takrorlashni yulduz yig'ish usuli sifatida ishlatib, yangi darslarga
 * o'tmay qo'yardi.
 */
function DaftarSahifasi() {
  const nav = useNavigate();
  const { slug } = useParams();

  const c = courseBySlug(slug ?? "");
  useTema(c ? temaOf(c.grade) : "bosh");

  // Dars bir marta yig'iladi: har renderda qaytadan yasalsa, savollar
  // almashib turib, bola javob bera olmasdi.
  const dars = useMemo(() => (c ? takrorlashDarsi(c.slug) : null), [c]);

  if (!c) return <NotFound nima={`"${slug}" kursi`} />;
  if (!dars) return <Navigate to={yolKurs(c)} replace />;

  return (
    <Lesson
      unit={dars.unit}
      lesson={dars.lesson}
      takrorlash
      onExit={() => nav(yolKurs(c))}
      onFinish={() => nav(yolKurs(c))}
    />
  );
}


/**
 * Kurs ichidagi yordamchi ekranlar bir xil qolipda: kursni topamiz,
 * temasini qo'yamiz, topilmasa tushunarli sahifa ko'rsatamiz.
 * Shu takrorni bitta hookka yig'amiz.
 */
function useKurs() {
  const { slug } = useParams();
  const c = courseBySlug(slug ?? "");
  useTema(c ? temaOf(c.grade) : "bosh");
  return { c, slug };
}

function DokonSahifasi() {
  const nav = useNavigate();
  const { progressOf, sotibOl, kiy } = useProgress();
  const { c, slug } = useKurs();

  if (!c) return <NotFound nima={`"${slug}" kursi`} />;
  return (
    <Dokon
      progress={progressOf(c)}
      onSotibOl={(id, narx) => sotibOl(c, id, narx)}
      onKiy={(id) => kiy(c, id)}
      onBack={() => nav(yolKurs(c))}
    />
  );
}

function NishonSahifasi() {
  const nav = useNavigate();
  const { progressOf, kunlik } = useProgress();
  const { c, slug } = useKurs();

  if (!c) return <NotFound nima={`"${slug}" kursi`} />;
  const p = progressOf(c);
  return (
    <Nishonlar
      nishonlar={nishonlarniHisobla({
        progress: p, kunlik, units: c.units, savollar: p.savollar ?? 0,
      })}
      onBack={() => nav(yolKurs(c))}
    />
  );
}

function OtaOnaSahifasi() {
  const nav = useNavigate();
  const { c, slug } = useKurs();

  if (!c) return <NotFound nima={`"${slug}" kursi`} />;
  return <OtaOna onBack={() => nav(yolKurs(c))} />;
}

function ProfilSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Profillar onBack={() => nav(yolKurslar())} />;
}

function SozlamaSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return (
    <Sozlamalar
      onBack={() => nav(yolKurslar())}
      onProfillar={() => nav("/profillar")}
    />
  );
}

/**
 * Reyting kursga bog'liq emas: bola qaysi sinfda o'ynasa ham, yulduzlari
 * bitta hisobda yig'iladi. Shuning uchun manzil ham kursdan tashqarida.
 */
function ReytingSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Reyting onBack={() => nav(yolKurslar())} />;
}
