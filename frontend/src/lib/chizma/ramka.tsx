/**
 * RAMKA — chizmalarning umumiy bo'yoq to'plami.
 *
 * ─────────── NEGA GRADIENT KERAK ───────────
 *
 * Tekis rangdagi shakl bolaga CHIZMA bo'lib ko'rinadi. Yuqorisi
 * yorug', pastki qismi to'q bo'lgan shakl esa NARSA bo'lib ko'rinadi —
 * chunki dunyoda yorug'lik tepadan tushadi va ko'z buni tug'ilganidan
 * biladi. Farq kichkintoy uchun hal qiluvchi: u haqiqiy mashinani
 * ko'chada ko'rgan va ekrandagisini o'sha bilan bog'lashi kerak.
 *
 * ─────────── NEGA `useId` ───────────
 *
 * SVG gradienti `url(#nom)` bilan chaqiriladi va bu nom BUTUN HUJJAT
 * bo'ylab yagona bo'lishi kerak. Ekranda esa bir vaqtda uchta chizma
 * turadi (o'yindagi uch variant) va albomda kartalar almashib turadi.
 *
 * Qat'iy nom yozilsa, brauzer hammasini BIRINCHI topilganiga
 * bog'laydi. Birinchisi ekrandan ketishi bilan (albomda karta
 * almashganda) qolganlarining bo'yog'i yo'qoladi — shakl qop-qora
 * bo'lib qoladi. Buni faqat jonli qurilmada ko'rish mumkin, ya'ni
 * nosozlik ishlab chiqarishga chiqib ketardi.
 *
 * `useId` esa har bir chizmaga o'z nomini beradi.
 */
import { createContext, useContext } from "react";
import type { JSX, ReactNode } from "react";

const Uid = createContext("az");

/**
 * Bo'yoq nomini shu chizmaning `url(#…)` iga aylantiradi.
 *
 * Chizmalar ichida shunday ishlatiladi:
 *
 *     const g = useBoyoq();
 *     <path fill={g("qizil")} … />
 */
export function useBoyoq(): (nom: string) => string {
  const uid = useContext(Uid);
  return (nom) => `url(#${uid}-${nom})`;
}

/** Bitta chizma uchun bo'yoqlar va ularning nomini beruvchi kontekst. */
export function Boyoqlar({ uid, children }: { uid: string; children: ReactNode }): JSX.Element {
  return (
    <Uid.Provider value={uid}>
      <defs>
        {/* ---- kuzov ranglari ----
            Har biri bir xil qoida bilan yasalgan: tepasi asosiy
            rangdan ~14% yorug', pastki uchdan biri ~18% to'q. Shu
            nisbat butun to'plamda saqlanadi, shuning uchun o'n ikkita
            mashina bir rassom qo'lidan chiqqandek ko'rinadi. */}
        <Tik uid={uid} nom="qizil" tepa="#ff6a5d" ort="#ee4a41" past="#c2352d" />
        <Tik uid={uid} nom="sariq" tepa="#ffd25c" ort="#fcc419" past="#d19b06" />
        <Tik uid={uid} nom="kok" tepa="#5aa0f5" ort="#3d8ef2" past="#2b6fc4" />
        <Tik uid={uid} nom="yashil" tepa="#5fcf85" ort="#3fb865" past="#2f8f4d" />
        <Tik uid={uid} nom="oq" tepa="#ffffff" ort="#f4f7fc" past="#dbe2ee" />
        <Tik uid={uid} nom="kulrang" tepa="#c3cbd8" ort="#aeb7c6" past="#8d97a8" />
        <Tik uid={uid} nom="siyoh" tepa="#42536f" ort="#2f3d5c" past="#1f2b45" />
        <Tik uid={uid} nom="jigar" tepa="#c99a6b" ort="#b8804f" past="#8a5a34" />
        <Tik uid={uid} nom="oltin" tepa="#ffcf5c" ort="#f5b301" past="#c2761a" />

        {/* Oyna — pastdan yuqoriga, ya'ni kuzovga TESKARI. Haqiqiy
            oynada ham shunday: u osmonni aks ettiradi, kuzov esa
            yorug'likni qaytaradi. */}
        <linearGradient id={`${uid}-oyna`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#93cbe9" />
          <stop offset="1" stopColor="#dff1fb" />
        </linearGradient>

        {/* Metall — g'ildirak diski va bufer uchun. */}
        <linearGradient id={`${uid}-metall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6ebf2" />
          <stop offset="0.5" stopColor="#b9c0cc" />
          <stop offset="1" stopColor="#8d93a3" />
        </linearGradient>

        {/* Yerdagi soya — chetiga qarab so'nadi. Qat'iy chekkali
            ellips "qora dog'" bo'lib ko'rinardi. */}
        <radialGradient id={`${uid}-soya`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.65" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        {/* Ustidan tushadigan yorug'lik — yaltiroq yuza hissi. */}
        <linearGradient id={`${uid}-yaltir`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {children}
    </Uid.Provider>
  );
}

/** Tik (yuqoridan pastga) uch bosqichli gradient. */
function Tik({ uid, nom, tepa, ort, past }: {
  uid: string; nom: string; tepa: string; ort: string; past: string;
}) {
  return (
    <linearGradient id={`${uid}-${nom}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={tepa} />
      <stop offset="0.55" stopColor={ort} />
      <stop offset="1" stopColor={past} />
    </linearGradient>
  );
}

/**
 * Yerdagi soya — hamma chizmada bir xil.
 *
 * `rx` va `cy` berilishi mumkin: hayvon boshi mashinadan torroq joy
 * egallaydi va soyasi ham shunga mos bo'lishi kerak.
 */
export function Soya({ cy = 104, rx = 38 }: { cy?: number; rx?: number }) {
  const g = useBoyoq();
  return <ellipse cx="60" cy={cy} rx={rx} ry={rx * 0.16} fill={g("soya")} />;
}
