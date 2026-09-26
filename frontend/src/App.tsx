/**
 * Marshrutlar.
 *
 * Har bir ekran o'z manziliga ega (yollar.ts ga qarang). Manzildagi qism
 * noto'g'ri bo'lsa — masalan bola havolani qo'lda o'zgartirsa yoki kurs
 * o'chirilgan bo'lsa — bo'sh ekran o'rniga tushunarli sahifa ko'rsatiladi.
 */
import { Suspense, lazy, useEffect, useMemo } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Panel, TepagaQayt, panelKerakmi } from "./components/Panel";
import { Kutish } from "./components/Kutish";
import { NotFound } from "./screens/NotFound";
import { Anketa } from "./components/Anketa";
import { OqishQobiq } from "./components/OqishQobiq";
import { rejimdanChiq, useKichkintoyRejim } from "./lib/kichkintoyRejim";
import { joriyKurs, profilKursi, useProfil } from "./lib/profil";

/* ---------------------------------------------------------------- ekranlar
 *
 * Uchtasi DARHOL yuklanadi — ilova ochilishi bilan shular kerak bo'ladi:
 * kurslar ro'yxati, kurs yo'li va dars. Bola ilovani aynan shu uchtasi
 * uchun ochadi.
 *
 * Qolganlari ALOHIDA fayl bo'lib ajratiladi va faqat o'sha ekran
 * ochilganda yuklanadi. Sabab o'lchangan: hammasi bitta faylda turganda
 * yig'ilgan JS 797 KB edi va telefon uni har ochilishda TO'LIQ o'qib
 * chiqardi — duel, kichkintoylar bo'limi va sozlamalar bilan birga,
 * ularni o'sha kirishda umuman ochmasa ham.
 *
 * Ajratish faqat birinchi ochilishga ta'sir qiladi: keyin har bir bo'lak
 * Service Worker keshida qoladi.
 */
const Bosh = lazy(() => import("./screens/Bosh").then((m) => ({ default: m.Bosh })));
const Dashboard = lazy(() => import("./screens/Dashboard").then((m) => ({ default: m.Dashboard })));
const TestSinf = lazy(() => import("./screens/TestSinf").then((m) => ({ default: m.TestSinf })));
const Home = lazy(() => import("./screens/Home").then((m) => ({ default: m.Home })));
const Lesson = lazy(() => import("./screens/Lesson").then((m) => ({ default: m.Lesson })));
const Dokon = lazy(() => import("./screens/Dokon").then((m) => ({ default: m.Dokon })));
const Nishonlar = lazy(() => import("./screens/Nishonlar").then((m) => ({ default: m.Nishonlar })));
const OtaOna = lazy(() => import("./screens/OtaOna").then((m) => ({ default: m.OtaOna })));
const Men = lazy(() => import("./screens/Men").then((m) => ({ default: m.Men })));
const Profillar = lazy(() => import("./screens/Profillar").then((m) => ({ default: m.Profillar })));
const Reyting = lazy(() => import("./screens/Reyting").then((m) => ({ default: m.Reyting })));
const Sozlamalar = lazy(() => import("./screens/Sozlamalar").then((m) => ({ default: m.Sozlamalar })));
const KodKirish = lazy(() => import("./screens/KodKirish").then((m) => ({ default: m.KodKirish })));
const Oyinlar = lazy(() => import("./screens/Oyinlar").then((m) => ({ default: m.Oyinlar })));
const Maydon = lazy(() => import("./screens/Maydon").then((m) => ({ default: m.Maydon })));
const KunlikSon = lazy(() => import("./screens/KunlikSon").then((m) => ({ default: m.KunlikSon })));
const SonOvi = lazy(() => import("./screens/SonOvi").then((m) => ({ default: m.SonOvi })));
const Imtihon = lazy(() => import("./screens/Imtihon").then((m) => ({ default: m.Imtihon })));
const Sertifikat = lazy(() => import("./screens/Sertifikat").then((m) => ({ default: m.Sertifikat })));
const SertifikatTest = lazy(() => import("./screens/SertifikatTest").then((m) => ({ default: m.SertifikatTest })));
const Sessiya = lazy(() => import("./screens/Sessiya").then((m) => ({ default: m.Sessiya })));
const BlokEkran = lazy(() => import("./screens/Blok").then((m) => ({ default: m.Blok })));
const Duel = lazy(() => import("./screens/Duel").then((m) => ({ default: m.Duel })));
const DuelQabul = lazy(() => import("./screens/Duel").then((m) => ({ default: m.DuelQabul })));
const JamoaOchish = lazy(() => import("./screens/Xona").then((m) => ({ default: m.JamoaOchish })));
const Shaharcha = lazy(() => import("./screens/Shaharcha").then((m) => ({ default: m.Shaharcha })));
const KarvonYoli = lazy(() => import("./screens/KarvonYoli").then((m) => ({ default: m.KarvonYoli })));
const Jadval = lazy(() => import("./screens/Jadval").then((m) => ({ default: m.Jadval })));
const XonaSahifa = lazy(() => import("./screens/Xona").then((m) => ({ default: m.XonaSahifa })));
const OyinDaraja = lazy(() => import("./screens/OyinDaraja").then((m) => ({ default: m.OyinDaraja })));
const Oyin = lazy(() => import("./screens/Oyin").then((m) => ({ default: m.Oyin })));
const OqishTestlar = lazy(() => import("./screens/OqishTestlar").then((m) => ({ default: m.OqishTestlar })));
const OqishXatolar = lazy(() => import("./screens/OqishXatolar").then((m) => ({ default: m.OqishXatolar })));
const Testlar = lazy(() => import("./screens/Testlar").then((m) => ({ default: m.Testlar })));
const Hisobot = lazy(() => import("./screens/Hisobot").then((m) => ({ default: m.Hisobot })));
const Formulalar = lazy(() => import("./screens/Formulalar").then((m) => ({ default: m.Formulalar })));
const Qidiruv = lazy(() => import("./screens/Qidiruv").then((m) => ({ default: m.Qidiruv })));
const ToplamSahifa = lazy(() => import("./screens/ToplamSahifa").then((m) => ({ default: m.ToplamSahifa })));
const Masalalar = lazy(() => import("./screens/Masalalar").then((m) => ({ default: m.Masalalar })));
const Masala = lazy(() => import("./screens/Masala").then((m) => ({ default: m.Masala })));
const MasalaYangi = lazy(() => import("./screens/MasalaYangi").then((m) => ({ default: m.MasalaYangi })));
const MasalaMuallif = lazy(() => import("./screens/MasalaMuallif").then((m) => ({ default: m.MasalaMuallif })));
const Masalalarim = lazy(() => import("./screens/Masalalarim").then((m) => ({ default: m.Masalalarim })));
const Kichkintoy = lazy(() => import("./screens/Kichkintoy").then((m) => ({ default: m.Kichkintoy })));
const KichkintoyMavzu = lazy(() => import("./screens/KichkintoyMavzu").then((m) => ({ default: m.KichkintoyMavzu })));
import { mavzuById } from "./lib/kichkintoy";
import { oyinById } from "./lib/oyin";
import { darajaniOqi } from "./lib/oyin/tur";
import { ochiqmi } from "./lib/oyin/rekord";
import { COURSES, courseById, courseBySlug, maktabKursi } from "./lib/curriculum";
import { useProgress } from "./lib/progress";
import type { LessonResult } from "./lib/progress";
import { isUnlocked, lessonId } from "./lib/types";
import { temaOf, useTema } from "./lib/tema";
import { takrorlashDarsi } from "./lib/takrorlash";
import { oxirgiKurs, oxirginiYoz } from "./lib/oxirgi";
import { darsTugadi as sinovDarsTugadi } from "./lib/sinov";
import { nishonlar as nishonlarniHisobla } from "./lib/nishon";
import {
  indeksniOqi, yolTestlar, yolFormulalar, yolHisobot, yolDaftar, yolDars, yolKichkintoy, yolKichkintoyMavzu, yolKurs, yolKurslar,
  yolDuel, yolDuelKod, yolJamoa, yolXona, yolKunlikSon, yolSonOvi, yolImtihon, yolImtihonVariant, yolSertifikat, yolSertifikatVariant, yolShaharcha, yolJadval, yolKarvon, yolMaydon, yolOyin, yolOyinDaraja, yolOyinlar, yolQidiruv, yolSinov,
  yolMasala, yolMasalaMuallif, yolMasalaYangi, yolMasalalar, yolMasalalarim,
  yolMen, yolBosh, yolToplamlar, yolXatolar, yolTestSinf, yolToplam, yolSessiya, yolSessiyaVariant,
} from "./lib/yollar";
import { blokBormi, sinfOf } from "./lib/blok";
import { sinovBajarilgan, sinovDarsi, sinovniBelgila } from "./lib/kunlikSinov";
import { t } from "./lib/matn";
import { kursMatn } from "./lib/tarjima/kurs";
import { useTirik } from "./lib/tirik";
import { useTahlil } from "./lib/tahlil";
import { oxirgiTur } from "./lib/imtihonTur";

export default function App() {
  // Panel `Routes` dan TASHQARIDA turadi va shu sabab marshrut
  // almashganda qayta yasalmaydi: u joyida qotib turadi, bosilgan tugma
  // esa faqat rangini o'zgartiradi. Har ekranda alohida chizilsa, panel
  // har o'tishda bir lahzaga yo'qolib, qaytadan paydo bo'lardi.
  const { pathname } = useLocation();

  // "Men shu yerdaman" — ilova ochiq turganini serverga bildiradi.
  // ILOVA darajasida, ekranda emas: "onlayn" degani "ilova ochiq"
  // degani, "duel ekranida turibdi" degani emas (`lib/tirik.ts`).
  useTirik();
  // Qaysi ekran ochildi, qaysi tugma bosildi — panelidagi "Tahlil"
  // uchun (`lib/tahlil.ts`).
  useTahlil();
  // Kichkintoy rejimida (`lib/kichkintoyRejim.ts`) bo'lim ekranida ham
  // panel yo'q: 2–5 yoshli bola pastdagi tugmalarni bexosdan bosardi.
  const kichkintoy = useKichkintoyRejim();
  const panel = panelKerakmi(pathname) && !(kichkintoy && pathname.startsWith("/kichkintoy"));

  return (
    <>
      <TepagaQayt />
      <Yollar />
      {panel && <Panel />}
    </>
  );
}

function Yollar() {
  // Ekran alohida fayldan kelayotgan bir necha yuz millisekundda nima
  // ko'rinadi: `Kutish` — ilovaning o'z yuklanish belgisi. Bo'sh ekran
  // qoldirilsa, sekin internetda ilova "o'chib qolgandek" tuyulardi.
  return (
    <Suspense fallback={<Kutish />}>
    <Routes>
      <Route path="/" element={<BoshSahifasi />} />
      {/* Kurslar ro'yxati bosh sahifadan AJRALDI: u "qaysi sinf?"
          degan boshqa savolga javob beradi (`lib/yollar.ts`). */}
      <Route path="/darslar" element={<KurslarSahifasi />} />
      {/* Testlar kursdan tashqarida: o'lchamoqchi bo'lgan odamda
          faqat "nechanchi sinfman" degan savol bor. */}
      {/* O'qish › Testlar yorlig'i. Eski ro'yxat (to'plamlar va sinflar)
          `/testlar/toplamlar` da — yorliqdan bir bosishda. */}
      <Route path="/testlar" element={<TestlarYorliqSahifasi />} />
      <Route path="/testlar/toplamlar" element={<TestSinfSahifasi />} />
      <Route path="/toplam/:id" element={<ToplamSahifasi />} />
      <Route path="/profillar" element={<ProfilSahifasi />} />
      {/* "Men" — pastki paneldagi beshinchi bo'lim (eski Menyu o'rnida). */}
      <Route path="/men" element={<MenSahifasi />} />
      {/* "Siz kimsiz" javobini o'zgartirish. Ilgari `/men` edi. */}
      <Route path="/men/anketa" element={<AnketaSahifasi />} />
      <Route path="/sozlamalar" element={<SozlamaSahifasi />} />
      {/* Botdagi «Saytga kirish» havolasi. Marshrut Tanishuv darvozasidan
          KEYIN turadi, lekin darvoza uni o'zi o'tkazib yuboradi — aks holda
          havola kirish ekraniga tushib, cheksiz halqa bo'lib qolardi. */}
      <Route path="/kirish/:kod" element={<KodKirish />} />
      <Route path="/reyting" element={<ReytingSahifasi />} />
      <Route path="/qidiruv" element={<QidiruvSahifasi />} />
      {/* Masalalar. Harfli manzillar `<id>` dan OLDIN turishi SHART:
          aks holda "yangi" va "menikilar" masala raqami deb o'qilib,
          "topilmadi" sahifasi chiqardi. */}
      <Route path="/masalalar" element={<MasalalarSahifasi />} />
      <Route path="/masalalar/yangi" element={<MasalaYangiSahifasi />} />
      <Route path="/masalalar/menikilar" element={<MasalalarimSahifasi />} />
      <Route path="/masalalar/muallif/:pid" element={<MasalaMuallifSahifasi />} />
      <Route path="/masalalar/:id" element={<MasalaSahifasi />} />
      {/* Kichkintoylar — kursdan tashqarida: bu yerda dars ham,
          tartib ham yo'q (`screens/Kichkintoy.tsx`). */}
      <Route path="/kichkintoy" element={<KichkintoySahifasi />} />
      <Route path="/kichkintoy/:mavzu" element={<KichkintoyMavzuSahifasi />} />
      {/* O'yinlar kursdan tashqarida: ular biror sinfga tegishli emas. */}
      <Route path="/oyinlar" element={<OyinlarSahifasi />} />
      {/* Maydon `:id` dan OLDIN: aks holda "maydon" o'yin id'si
          deb qabul qilinib, "topilmadi" sahifasi chiqardi. */}
      <Route path="/oyinlar/maydon" element={<MaydonSahifasi />} />
      <Route path="/oyinlar/kunlik-son" element={<KunlikSonSahifasi />} />
      <Route path="/oyinlar/son-ovi" element={<SonOviSahifasi />} />
      <Route path="/imtihon" element={<ImtihonSahifasi />} />
      <Route path="/imtihon/:n" element={<ImtihonVariantSahifasi />} />
      <Route path="/sertifikat" element={<SertifikatSahifasi />} />
      <Route path="/sertifikat/:n" element={<SertifikatVariantSahifasi />} />
      <Route path="/sessiya" element={<SessiyaSahifasi />} />
      <Route path="/sessiya/:slug/:n" element={<SessiyaVariantSahifasi />} />
      <Route path="/oyinlar/shaharcha" element={<ShaharchaSahifasi />} />
      <Route path="/oyinlar/shaharcha/:pid" element={<ShaharchaSahifasi />} />
      <Route path="/oyinlar/jadval" element={<JadvalSahifasi />} />
      <Route path="/oyinlar/karvon" element={<KarvonSahifasi />} />
      <Route path="/oyinlar/duel" element={<DuelSahifasi />} />
      <Route path="/duel/:kod" element={<DuelQabulSahifasi />} />
      {/* Jamoaviy o'yinlar. `jamoa/<oyin>` `:id/:daraja` dan OLDIN turadi. */}
      <Route path="/oyinlar/jamoa/:oyin" element={<JamoaOchishSahifasi />} />
      <Route path="/xona/:kod" element={<XonaSahifasi />} />
      <Route path="/oyinlar/:id" element={<OyinDarajaSahifasi />} />
      <Route path="/oyinlar/:id/:daraja" element={<OyinSahifasi />} />
      <Route path="/kurs/:slug" element={<KursSahifasi />} />
      {/* Diqqat: "daftar" bob nomiga o'xshaydi, shuning uchun u
          /:bob/:dars dan OLDIN turishi shart — aks holda marshrut
          uni bob deb qabul qilardi. */}
      <Route path="/kurs/:slug/daftar" element={<DaftarSahifasi />} />
      {/* Kunlik sinov ham dars: shu sabab u `/:bob/:dars` dan OLDIN
          turadi, aks holda marshrut "sinov" ni bob nomi deb o'qirdi. */}
      <Route path="/kurs/:slug/sinov" element={<SinovSahifasi />} />
      <Route path="/kurs/:slug/xatolar" element={<XatolarSahifasi />} />
      <Route path="/kurs/:slug/dokon" element={<DokonSahifasi />} />
      <Route path="/kurs/:slug/nishonlar" element={<NishonSahifasi />} />
      <Route path="/kurs/:slug/ota-ona" element={<OtaOnaSahifasi />} />
      {/* Testlar, hisobot va formulalar ham `/:bob/:dars` dan OLDIN
          turishi shart — aks holda marshrut ularni bob nomi deb o'qirdi. */}
      <Route path="/kurs/:slug/testlar" element={<TestlarSahifasi />} />
      {/* Eski manzil ishlashda davom etsin: u bir kun jonli edi va
          havolasi saqlanib qolgan bo'lishi mumkin. */}
      <Route path="/kurs/:slug/blok" element={<BlokEski />} />
      <Route path="/kurs/:slug/hisobot" element={<HisobotSahifasi />} />
      <Route path="/kurs/:slug/formulalar" element={<FormulalarSahifasi />} />
      <Route path="/kurs/:slug/:bob/:dars" element={<DarsSahifasi />} />
      {/* Eski havola ishlashda davom etsin */}
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

/**
 * "Bugun" — bugungi uch vazifa, zanjir va keyingi dars
 * (`screens/Bosh.tsx`). Kurslar ro'yxati bu yerda EMAS: u `/darslar`
 * da (O'qish tabi).
 */
function BoshSahifasi() {
  const { progressOf } = useProgress();
  const nav = useNavigate();
  const kichkintoy = useKichkintoyRejim();
  useTema("bosh");
  // Kichkintoy rejimida ilova to'g'ridan-to'g'ri bolaning ekranida ochiladi.
  if (kichkintoy) return <Navigate to={yolKichkintoy()} replace />;
  return (
    <Bosh
      progressOf={progressOf}
      onDarslar={() => nav(yolKurslar())}
      onMasalalar={() => nav(yolMasalalar())}
      onTestlar={() => nav(yolTestSinf())}
      // "Davom etish" darsning O'ZIGA olib boradi, kurs xaritasiga
      // emas: qaytib kelgan odam aynan o'sha darsni ochish uchun
      // kelgan va uni yana bir marta bosishga majburlash ortiqcha.
      onDavom={(c, ui, li) => nav(yolDars(c, ui, li))}
      onSinov={(c) => nav(yolSinov(c))}
      onKunlikSon={() => nav(yolKunlikSon())}
      onFormulalar={() => nav(yolFormulalar(
        COURSES.filter((c) => c.grade > 0 && maktabKursi(c)).slice(-1)[0] ?? COURSES[0]))}
      onImtihon={() => nav(yolImtihon())}
      onQidiruv={() => nav(yolQidiruv())}
      onKurs={(c) => nav(yolKurs(c))}
    />
  );
}

/**
 * Testlar — sinf tanlash.
 *
 * Tanlangandan keyin o'sha sinfning testlar bazasiga o'tadi.
 * Ikki fanli sinfda (algebra va geometriya) kirish nuqtasi bitta:
 * testlar ikkalasidan aralash yig'iladi (`lib/blok.ts`).
 */
function TestSinfSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return (
    <TestSinf
      onSinf={(c) => nav(yolTestlar(c))}
      onImtihon={() => nav(yolSertifikat())}
      onToplam={(id) => nav(yolToplam(id))}
      onBack={() => nav(yolTestSinf())}
    />
  );
}

/** Test to'plami — `/toplam/<id>`, kanal postidagi tugma shu yerga olib keladi. */
function ToplamSahifasi() {
  const nav = useNavigate();
  const { id } = useParams();
  useTema("bosh");
  const raqam = Number(id);
  if (!Number.isInteger(raqam) || raqam <= 0) return <Navigate to={yolTestSinf()} replace />;
  return <ToplamSahifa id={raqam} onBack={() => nav(yolToplamlar())} />;
}

/**
 * Kurslar ro'yxati — endi `/darslar` da.
 *
 * Ekranning ishi bittaga qisqardi: "qaysi sinf?". Logo, hisob
 * chiplari, qidiruv va kichkintoylar kartasi bosh sahifaga
 * ko'chdi.
 */
function KurslarSahifasi() {
  const { progressOf } = useProgress();
  const nav = useNavigate();
  useTema("bosh");
  // Anketadagi javob — ro'yxat tartibi shunga qarab o'zgaradi
  // (`screens/Dashboard.tsx` dagi KATTALAR izohi). Ilgari u har
  // ochilishda serverdan so'ralardi; endi qurilmada (`lib/profil.ts`)
  // va javob berilgan zahoti ro'yxat qayta tiziladi.
  const prof = useProfil();
  const kim = prof?.kim ?? "";

  // O'qish tabi: kurs ma'lum bo'lsa (oxirgi ochilgan yoki profil sinfi) —
  // to'g'ri o'sha kursning Darslar yorlig'iga. Ro'yxat faqat hali hech
  // narsa bilinmagan odamga ("qaysi sinf?") qoladi.
  if (courseBySlug(oxirgiKurs()) || profilKursi(prof)) {
    return <Navigate to={yolKurs(joriyKurs(prof, oxirgiKurs()))} replace />;
  }

  // Formulalar va blok testlar eng yuqori sinf kursida to'liq turadi:
  // kattalar uchun aynan o'sha kerak.
  const eng = COURSES.filter((c) => c.grade > 0 && maktabKursi(c)).slice(-1)[0] ?? COURSES[0];
  return (
    <Dashboard
      progressOf={progressOf}
      onOpen={(c) => nav(yolKurs(c))}
      kim={kim}
      onFormulalar={() => nav(yolFormulalar(eng))}
      onTestlar={() => nav(yolImtihon())}
      onMasalalar={() => nav(yolMasalalar())}
      onOyinlar={() => nav(yolOyinlar())}
    />
  );
}

function KursSahifasi() {
  const { slug } = useParams();
  const { progressOf } = useProgress();
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

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;

  return (
    <OqishQobiq yorliq="darslar" kurs={c}>
      <Home units={c.units} progress={progressOf(c)} onStart={(ui, li) => nav(yolDars(c, ui, li))} />
    </OqishQobiq>
  );
}

/**
 * O'qish › Testlar — `/testlar`. Manzilda kurs yo'q (eski havola), shuning
 * uchun kurs oxirgi ochilganidan olinadi (`lib/profil.ts` → joriyKurs).
 */
function TestlarYorliqSahifasi() {
  const nav = useNavigate();
  const prof = useProfil();
  useTema("bosh");
  const c = joriyKurs(prof, oxirgiKurs());
  return (
    <OqishQobiq yorliq="testlar" kurs={c}>
      <OqishTestlar kurs={c}
        onBlok={(boshla) => nav(yolTestlar(c) + (boshla ? "?boshla=toliq" : ""))}
        onImtihon={() => nav(yolImtihon())}
        onToplamlar={() => nav(yolToplamlar())}
        onSessiya={() => nav(yolSessiya())} />
    </OqishQobiq>
  );
}

/** O'qish › Xatolar — daftardagi savollar va "Mashq qilish". */
function XatolarSahifasi() {
  const nav = useNavigate();
  const { c, slug } = useKurs();
  useEffect(() => { if (c) oxirginiYoz(c.slug); }, [c]);
  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  return (
    <OqishQobiq yorliq="xatolar" kurs={c}>
      <OqishXatolar kurs={c} onMashq={() => nav(yolDaftar(c))} />
    </OqishQobiq>
  );
}

function DarsSahifasi() {
  const { slug, bob, dars } = useParams();
  const { progressOf, darsTugadi } = useProgress();
  const nav = useNavigate();

  const c = courseBySlug(slug ?? "");
  useTema(c ? temaOf(c.grade) : "bosh");

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;

  const ui = indeksniOqi(bob, "bob");
  const li = indeksniOqi(dars, "dars");
  const U = ui === null ? undefined : c.units[ui];
  const L = U && li !== null ? U.lessons[li] : undefined;

  if (ui === null || li === null || !U || !L) {
    return <NotFound nima={t("bundayDars")} qaytish={{ matn: kursMatn(c.title), yol: yolKurs(c) }} />;
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
      hisob={{
        jami: progressOf(c).stars,
        oldin: progressOf(c).done[lessonId(ui, li)] ?? 0,
      }}
      onExit={() => nav(yolKurs(c))}
      onFinish={(r: LessonResult) => {
        darsTugadi(c, ui, li, r);
        // Kirmagan bo'lsa — shu yerda kirish taklifi chiqishi mumkin.
        // Ataylab AYNAN shu payt: bola yulduzini endi ko'rdi va taklif
        // yo'qotish emas, yutuqni saqlash bo'lib tuyuladi.
        sinovDarsTugadi(r.stars);
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

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  if (!dars) return <Navigate to={yolKurs(c)} replace />;

  return (
    <Lesson
      unit={dars.unit}
      lesson={dars.lesson}
      takrorlash
      // Daftar O'qish › Xatolar yorlig'idan ochiladi — o'sha yerga qaytadi.
      onExit={() => nav(yolXatolar(c))}
      onFinish={() => nav(yolXatolar(c))}
    />
  );
}


/**
 * Kunlik sinov — faqat bugun ochiq bo'ladigan 6 ta savol.
 *
 * Darsdan uch farqi bor: yo'l xaritasiga yozilmaydi, tangasi ikki
 * barobar va bajarilgani KUN bo'yicha eslab qolinadi
 * (`lib/kunlikSinov.ts`). Bugun allaqachon bajarilgan bo'lsa —
 * manzilni qo'lda ochib bo'lmaydi, kurs sahifasiga qaytadi.
 */
function SinovSahifasi() {
  const nav = useNavigate();
  const { slug } = useParams();
  const { progressOf, sinovTugadi } = useProgress();

  const c = courseBySlug(slug ?? "");
  useTema(c ? temaOf(c.grade) : "bosh");

  // Dars bir marta yig'iladi: har renderda qaytadan yasalsa, savollar
  // almashib turib, bola javob bera olmasdi.
  const dars = useMemo(
    () => (c && !sinovBajarilgan(c.slug) ? sinovDarsi(c.slug, c.units, progressOf(c)) : null),
    // `progressOf` har renderda yangilanadi, lekin sinov BIR MARTA
    // yig'ilishi kerak — shuning uchun u bog'liqlikda emas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c],
  );

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  if (!dars) return <Navigate to={yolKurs(c)} replace />;

  return (
    <Lesson
      unit={dars.unit}
      lesson={dars.lesson}
      takrorlash
      onExit={() => nav(yolKurs(c))}
      onFinish={(r: LessonResult) => {
        sinovniBelgila(c.slug);
        sinovTugadi(c, r);
        nav(yolKurs(c));
      }}
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

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  return (
    <Dokon
      progress={progressOf(c)}
      onSotibOl={(id, narx) => sotibOl(c, id, narx)}
      onKiy={(id) => kiy(c, id)}
      // Do'kon, nishonlar va ota-ona paneli — "Men" bo'limida
      // (`lib/tab.ts`), ya'ni orqaga ham o'sha yerga.
      onBack={() => nav(yolMen())}
    />
  );
}

function NishonSahifasi() {
  const nav = useNavigate();
  const { progressOf, kunlik } = useProgress();
  const { c, slug } = useKurs();

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  const p = progressOf(c);
  return (
    <Nishonlar
      nishonlar={nishonlarniHisobla({
        progress: p, kunlik, units: c.units, savollar: p.savollar ?? 0,
      })}
      onBack={() => nav(yolMen())}
    />
  );
}

function OtaOnaSahifasi() {
  const nav = useNavigate();
  const { c, slug } = useKurs();

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  return (
    <OtaOna onBack={() => nav(yolMen())}
      onDars={(d) => {
        const k = COURSES.find((x) => x.grade === d.grade);
        // Dars yopiq bo'lsa `DarsSahifasi` o'zi kurs xaritasiga qaytaradi.
        if (k) nav(yolDars(k, d.unit, d.lesson));
      }} />
  );
}

/**
 * Blok test, hisobot va formulalar — uchalasi ham SINF bo'yicha
 * ishlaydi, kurs bo'yicha emas: algebra va geometriya bitta sinfning
 * ikki fani va imtihonda ular birga keladi. Kurs kodi 100 dan katta
 * bo'lsa (geometriya), haqiqiy sinf `sinfOf` orqali olinadi.
 */
function TestlarSahifasi() {
  const nav = useNavigate();
  const [qidiruv] = useSearchParams();
  const { c, slug } = useKurs();

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  // Quyi sinflarda testlar bo'limi yo'q — havolani qo'lda yozgan odam
  // kursga qaytariladi.
  if (!blokBormi(sinfOf(c.grade))) return <Navigate to={yolKurs(c)} replace />;
  return (
    <Testlar
      sinf={sinfOf(c.grade)}
      boshlaToliq={qidiruv.get("boshla") === "toliq"}
      // Testlar ekrani O'qish › Testlar yorlig'idan ochiladi.
      onBack={() => nav(yolTestSinf())}
      onHisobot={() => nav(yolHisobot(c))}
    />
  );
}

/** Eski `/blok` manzili — yangisiga o'tkazadi. */
function BlokEski() {
  const { c, slug } = useKurs();
  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  return <Navigate to={yolTestlar(c)} replace />;
}

function HisobotSahifasi() {
  const nav = useNavigate();
  const { c, slug } = useKurs();

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  if (!blokBormi(sinfOf(c.grade))) return <Navigate to={yolKurs(c)} replace />;
  return <Hisobot sinf={sinfOf(c.grade)} onBack={() => nav(yolKurs(c))} onBlok={() => nav(yolTestlar(c))} />;
}

function FormulalarSahifasi() {
  const nav = useNavigate();
  const { c, slug } = useKurs();

  if (!c) return <NotFound nima={t("kursTopilmadi", { slug: slug ?? "" })} />;
  return (
    <OqishQobiq yorliq="formulalar" kurs={c}>
      <Formulalar ichki sinf={sinfOf(c.grade)} onBack={() => nav(yolKurs(c))} />
    </OqishQobiq>
  );
}

function MenSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Men onYol={(yol) => nav(yol)} />;
}

function AnketaSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Anketa qayta onTugadi={() => nav(yolMen())} />;
}

function ProfilSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Profillar onBack={() => nav(yolMen())} />;
}

function SozlamaSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return (
    <Sozlamalar
      onBack={() => nav(yolMen())}
      onProfillar={() => nav("/profillar")}
    />
  );
}

/* ------------------------------------------------------------------ */
/*                           kichkintoylar                            */
/* ------------------------------------------------------------------ */

/**
 * Tema "bolalar" — quyoshli, yumshoq, hamma narsa katta va yumaloq.
 *
 * "Bosh" temasi ATAYLAB emas: u brendning vitrinasi, ancha jiddiy va
 * quyuqroq. Bu bo'limni esa 3 yoshli bola ochadi va u yerda birinchi
 * taassurot "issiq va do'stona" bo'lishi kerak.
 */
function KichkintoySahifasi() {
  const nav = useNavigate();
  useTema("bolalar");
  return (
    <Kichkintoy
      onBack={() => nav(yolKurslar())}
      onMavzu={(id) => nav(yolKichkintoyMavzu(id))}
      onChiq={() => { rejimdanChiq(); nav(yolBosh(), { replace: true }); }}
    />
  );
}

function KichkintoyMavzuSahifasi() {
  const nav = useNavigate();
  const { mavzu } = useParams();
  useTema("bolalar");

  const m = mavzuById(mavzu ?? "");
  if (!m) {
    return <NotFound nima={t("kichkintoyTopilmadi")}
      qaytish={{ matn: t("kichkintoy"), yol: yolKichkintoy() }} />;
  }

  // `key` — mavzu almashganda ekran BUTUNLAY qaytadan yasalsin: aks
  // holda albomdagi indeks eski mavzudan qolib, yangi mavzu o'rtasidan
  // ochilardi.
  return <KichkintoyMavzu key={m.id} m={m} onBack={() => nav(yolKichkintoy())} />;
}

/* ------------------------------------------------------------------ */
/*                             o'yinlar                               */
/* ------------------------------------------------------------------ */

/**
 * O'yinlar bo'limi — kurslardan MUSTAQIL.
 *
 * Tema "bosh" bo'lib qoladi: o'yin bir sinfga tegishli emas va
 * 1-sinfning quyoshli ko'k fonida ochilsa, u "bolalar o'yini" bo'lib
 * ko'rinardi — holbuki uni katta ham o'ynaydi.
 */
function OyinlarSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return (
    <Oyinlar
      onBack={() => nav(yolKurslar())}
      onOyin={(id) => nav(yolOyin(id))}
      onMaydon={() => nav(yolMaydon())}
      onKunlikSon={() => nav(yolKunlikSon())}
      onSonOvi={() => nav(yolSonOvi())}
      onShaharcha={() => nav(yolShaharcha())}
      onKarvon={() => nav(yolKarvon())}
      onJadval={() => nav(yolJadval())}
      onDuel={() => nav(yolDuel())}
      onJamoa={(oyin) => nav(yolJamoa(oyin))}
      onQidiruv={() => nav(yolQidiruv())}
    />
  );
}

/** Jamoaviy o'yin — xona ochish yoki kod bilan kirish. */
function JamoaOchishSahifasi() {
  const nav = useNavigate();
  const { oyin } = useParams();
  useTema("bosh");
  if (oyin !== "kartalar" && oyin !== "royale" && oyin !== "kodlar" && oyin !== "seyf") {
    return <NotFound nima={t("oyinlar")} qaytish={{ matn: t("oyinlarBolim"), yol: yolOyinlar() }} />;
  }
  return <JamoaOchish oyin={oyin} onXona={(kod) => nav(yolXona(kod), { replace: true })}
    onChiq={() => nav(yolOyinlar())} />;
}

/** Xona — kutish, o'yin va natija. Kod havola orqali ham keladi. */
function XonaSahifasi() {
  const nav = useNavigate();
  const { kod } = useParams();
  useTema("bosh");
  // `key` — boshqa xonaga o'tilganda holat butunlay qaytadan boshlansin.
  return <XonaSahifa key={kod} kod={kod ?? ""} onChiq={() => nav(yolOyinlar())}
    onXona={(k) => nav(yolXona(k), { replace: true })} />;
}

/** Tulki shaharchasi — o'ziniki yoki `:pid` bo'lsa mehmonda. */
function ShaharchaSahifasi() {
  const nav = useNavigate();
  const { pid } = useParams();
  useTema("bosh");
  const n = pid ? Number(pid) : undefined;
  return <Shaharcha key={pid ?? "men"} pid={n !== undefined && Number.isFinite(n) ? n : undefined}
    onChiq={() => nav(pid ? yolShaharcha() : yolOyinlar())}
    onMehmon={(p) => nav(yolShaharcha(p))} />;
}

function KarvonSahifasi() {
  const nav = useNavigate();
  return <KarvonYoli onChiq={() => nav(yolOyinlar())} />;
}

function JadvalSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Jadval onChiq={() => nav(yolOyinlar())} />;
}

function KunlikSonSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <KunlikSon onChiq={() => nav(yolOyinlar())} />;
}

function SonOviSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <SonOvi onChiq={() => nav(yolOyinlar())} />;
}

function ImtihonSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  // Hamma eshik (`/imtihon`) shu yerga olib keladi. Oxirgi marta
  // sertifikat tanlangan bo'lsa — to'g'ri o'sha yerga: tayyorlanayotgan
  // odam har safar almashtirgichni bosib o'tirmasin.
  if (oxirgiTur() === "sertifikat") return <Navigate to={yolSertifikat()} replace />;
  return <Imtihon onVariant={(n) => nav(yolImtihonVariant(n))}
    onSertifikat={() => nav(yolSertifikat(), { replace: true })} onChiq={() => nav(yolTestSinf())}
    onTakrorla={(id) => { const c = courseById(id); if (c) nav(yolTestlar(c)); }} />;
}

/** Milliy sertifikat — variantlar ro'yxati (`lib/sertifikat.ts`). */
function SertifikatSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Sertifikat onVariant={(n) => nav(yolSertifikatVariant(n))}
    onDtm={() => nav(yolImtihon(), { replace: true })} onChiq={() => nav(yolTestSinf())} />;
}

function SertifikatVariantSahifasi() {
  const nav = useNavigate();
  const { n } = useParams();
  useTema("bosh");
  const raqam = Number(n);
  if (!Number.isInteger(raqam) || raqam < 1) return <Navigate to={yolSertifikat()} replace />;
  // `key` — boshqa variantga o'tilsa holat butunlay yangidan boshlansin.
  return <SertifikatTest key={raqam} n={raqam} onExit={() => nav(yolSertifikat())} />;
}

/**
 * Bitta DTM varianti — oddiy blok test yurituvchisining o'zi
 * (`screens/Blok.tsx`), faqat savollar variantdan yasaladi va 7–11
 * sinfning hammasidan keladi (`lib/imtihon.ts`).
 */
function ImtihonVariantSahifasi() {
  const nav = useNavigate();
  const { n } = useParams();
  useTema("bosh");
  const raqam = Number(n);
  if (!Number.isInteger(raqam) || raqam < 1) return <Navigate to={yolImtihon()} replace />;
  return (
    <BlokEkran sinf={11} uzunlik="dtm" qamrov={{ tur: "imtihon" }} imtihon={raqam}
      onExit={() => nav(yolImtihon())} />
  );
}

/** Sessiya — talabalar kurslari bo'yicha nazoratga tayyorgarlik. */
function SessiyaSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Sessiya onVariant={(s, n) => nav(yolSessiyaVariant(s, n))} onChiq={() => nav(yolBosh())} />;
}

function SessiyaVariantSahifasi() {
  const nav = useNavigate();
  const { slug, n } = useParams();
  useTema("bosh");
  const raqam = Number(n);
  const c = courseBySlug(slug ?? "");
  if (!c || c.grade < 300 || !Number.isInteger(raqam) || raqam < 1) return <Navigate to={yolSessiya()} replace />;
  return (
    <BlokEkran sinf={sinfOf(c.grade)} uzunlik="dtm" qamrov={{ tur: "hammasi" }}
      sessiya={{ slug: c.slug, n: raqam }} onExit={() => nav(yolSessiya())} />
  );
}

function MaydonSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return <Maydon onChiq={() => nav(yolOyinlar())} />;
}

function DuelSahifasi() {
  const nav = useNavigate();
  const [qidiruv] = useSearchParams();
  useTema("bosh");
  return (
    // `?oyin=tezkor` — o'yin ichidagi "Bellashish" dan kelganda o'sha o'yin
    // tanlangan holda ochiladi: bola uni qaytadan qidirib o'tirmasin.
    <Duel onChiq={() => nav(yolOyinlar())} onOyin={(id) => nav(yolOyin(id))}
      onKod={(kod) => nav(yolDuelKod(kod))} boshOyin={qidiruv.get("oyin") ?? undefined} />
  );
}

/**
 * Chaqiruv havolasi — do'stdan kelgan manzil.
 *
 * Chiqish O'YINLARGA olib boradi, orqaga emas: bu manzilga odam
 * Telegramdan tushadi va uning brauzer tarixida "orqa" degan joy yo'q.
 */
function DuelQabulSahifasi() {
  const nav = useNavigate();
  const { kod } = useParams();
  useTema("bosh");
  return (
    <DuelQabul
      kod={kod ?? ""}
      onChiq={() => nav(yolOyinlar())}
      onDuel={() => nav(yolDuel())}
      onOyin={(id) => nav(yolOyin(id))}
    />
  );
}

function OyinDarajaSahifasi() {
  const nav = useNavigate();
  const { id } = useParams();
  useTema("bosh");

  const o = oyinById(id ?? "");
  if (!o) {
    return <NotFound nima={t("oyinlar")}
      qaytish={{ matn: t("oyinlarBolim"), yol: yolOyinlar() }} />;
  }

  return (
    <OyinDaraja
      oyin={o}
      onBack={() => nav(yolOyinlar())}
      onBoshla={(d) => nav(yolOyinDaraja(o.id, d))}
      onDuel={o.tur === "oqim" ? () => nav(yolDuel(o.id)) : undefined}
    />
  );
}

/**
 * O'yinning o'zi.
 *
 * Ochilmagan daraja manzilni qo'lda o'zgartirib ochilmasin — aks holda
 * qulfning ma'nosi qolmasdi. Bunday holatda daraja tanlash ekraniga
 * qaytariladi: u yerda qulf va uni ochish sharti ko'rinib turadi.
 */
function OyinSahifasi() {
  const nav = useNavigate();
  const { id, daraja } = useParams();
  useTema("bosh");

  const o = oyinById(id ?? "");
  const d = darajaniOqi(daraja);

  if (!o || d === null) {
    return <NotFound nima={t("oyinlar")}
      qaytish={{ matn: t("oyinlarBolim"), yol: yolOyinlar() }} />;
  }
  if (!ochiqmi(o.id, d)) return <Navigate to={yolOyin(o.id)} replace />;

  return (
    <Oyin
      oyin={o} daraja={d}
      onChiq={() => nav(yolOyinlar())}
      onDaraja={() => nav(yolOyin(o.id))}
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
  return <Reyting onBack={() => nav(yolMen())} />;
}

/* ------------------------------------------------------------ masalalar
 *
 * Beshta ekran, bitta bo'lim. Ular ATAYLAB kursdan tashqarida turadi:
 * bir ro'yxatda 1-sinf masalasi ham, 11-sinfniki ham bo'ladi
 * (`lib/yollar.ts` dagi izohga qarang).
 */

function MasalalarSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return (
    <Masalalar
      onOch={(id) => nav(yolMasala(id))}
      onYangi={() => nav(yolMasalaYangi())}
      onMenikilar={() => nav(yolMasalalarim())}
      onBack={() => nav(yolKurslar())}
      onQidiruv={() => nav(yolQidiruv())}
    />
  );
}

function MasalaSahifasi() {
  const { id } = useParams();
  const nav = useNavigate();
  useTema("bosh");
  const raqam = Number(id);
  // Manzildagi qism raqam bo'lmasa — ro'yxatga qaytaramiz. Bo'sh
  // ekran o'rniga odam boradigan joyga tushsin.
  if (!Number.isInteger(raqam) || raqam <= 0) {
    return <Navigate to={yolMasalalar()} replace />;
  }
  return (
    <Masala
      id={raqam}
      onMuallif={(pid) => nav(yolMasalaMuallif(pid))}
      onBack={() => nav(yolMasalalar())}
      // Keyingi masala tarixni ALMASHTIRADI, unga qo'shmaydi: ketma-ket
      // o'nta masala yechgan bola orqaga bosganda o'nta yechilgan
      // masaladan qaytib chiqishga majbur bo'lardi. `replace` bilan
      // orqaga tugmasi har doim ro'yxatga olib boradi.
      onKeyingi={(kid) => nav(yolMasala(kid), { replace: true })}
    />
  );
}

function MasalaYangiSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  // Yuborilgandan keyin "mening masalalarim" ga o'tadi, ro'yxatga
  // emas: yangi masala u yerda hali YO'Q (navbatda turibdi) va odam
  // uni qidirib, "yuborilmadi" degan xulosaga kelardi.
  return (
    <MasalaYangi
      onYuborildi={() => nav(yolMasalalarim())}
      onBack={() => nav(yolMasalalar())}
    />
  );
}

function MasalaMuallifSahifasi() {
  const { pid } = useParams();
  const nav = useNavigate();
  useTema("bosh");
  const raqam = Number(pid);
  if (!Number.isInteger(raqam) || raqam <= 0) {
    return <Navigate to={yolMasalalar()} replace />;
  }
  return (
    <MasalaMuallif
      profilId={raqam}
      onOch={(id) => nav(yolMasala(id))}
      onMenikilar={() => nav(yolMasalalarim())}
      onBack={() => nav(yolMasalalar())}
    />
  );
}

function MasalalarimSahifasi() {
  const nav = useNavigate();
  useTema("bosh");
  return (
    <Masalalarim
      onOch={(id) => nav(yolMasala(id))}
      onYangi={() => nav(yolMasalaYangi())}
      onBack={() => nav(yolMasalalar())}
    />
  );
}

/**
 * Umumiy qidiruv — ilovaning hamma bo'limi bo'ylab.
 *
 * Progress SHU YERDAN beriladi: qidiruv qulflangan darsni ochib
 * yubormasligi kerak va buni bilish uchun unga bolaning progressi
 * kerak bo'ladi (`screens/Qidiruv.tsx`).
 */
function QidiruvSahifasi() {
  const { progressOf } = useProgress();
  const nav = useNavigate();
  useTema("bosh");
  return (
    <Qidiruv
      progressOf={progressOf}
      onOch={(yol) => nav(yol)}
      onBack={() => nav(yolKurslar())}
    />
  );
}
