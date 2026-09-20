/**
 * KUNLIK SON KARTASI — bosh sahifaning eng tepasida.
 *
 * ─────────────── NEGA ENG TEPADA ───────────────
 *
 * Ilova ichida odat yaratadigan yagona mexanika — kunlik jumboq: u har
 * kuni yangi, hammada bir xil va zanjiri bor. Lekin u o'yinlar ro'yxati
 * ichida yashiringani uchun 30 kun ichida atigi besh marta ochilgan,
 * shu davrda ilovaga kelgan har o'ntadan sakkiztasi esa ertasiga
 * qaytmagan.
 *
 * Shuning uchun karta birinchi ekranda, "davom etish" dan ham
 * YUQORIDA turadi: u ikki daqiqalik va uni ertaga yana bajarish
 * kerak, ya'ni qaytib kelishga sabab beradi.
 *
 * ─────────────── ZANJIR SERVERDAN ───────────────
 *
 * Zanjir (`kunlikHolat`) serverda hisoblanadi: telefon xotirasidagi
 * "7 kun" ilovani o'chirgan yoki telefon almashtirgan bolada
 * yo'qolardi — aynan o'sha payt u ilovani tashlab ketadi.
 *
 * Aloqa bo'lmasa karta baribir ko'rinadi: qurilmadagi belgi
 * (`kunlikSonBugun`) bugun yechilgan-yechilmaganini biladi, zanjir esa
 * shunchaki ko'rsatilmaydi. Karta umuman yo'qolib qolgandan ko'ra
 * shunisi yaxshi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { EmojiBelgi } from "../lib/hajmli";
import { kunlikHolat } from "../lib/api";
import type { KunlikHolat } from "../lib/api";
import { jumboqRaqami } from "../lib/oyin/kunlikSon";
import { kunKaliti } from "../lib/zanjir";
import { kunlikSonBugun } from "../screens/KunlikSon";
import { t } from "../lib/matn";

export function KunlikKarta({ onOch }: { onOch: () => void }) {
  const [holat, setHolat] = useState<KunlikHolat | null>(null);
  const [qurilmada] = useState(() => kunlikSonBugun());

  useEffect(() => {
    let tirik = true;
    void (async () => {
      try {
        const h = await kunlikHolat();
        if (tirik) setHolat(h);
      } catch { /* aloqa yo'q — qurilmadagi belgi bilan ishlaymiz */ }
    })();
    return () => { tirik = false; };
  }, []);

  const bajarildi = holat?.bajarildi ?? qurilmada;
  const raqam = holat?.raqam ?? jumboqRaqami(kunKaliti());
  const zanjir = holat?.zanjir ?? 0;

  return (
    <button type="button" onClick={onOch} data-tahlil="Bosh: kunlik son"
      className={`tugma-3d flex w-full items-center gap-3 rounded-clay p-3.5 text-left shadow-clay
                  ${bajarildi ? "bg-karta text-ink" : "bg-brand-gold text-white"}`}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl
                        ${bajarildi ? "bg-brand-gold/20" : "bg-white/25"}`}>
        {bajarildi ? <EmojiBelgi e="✅" olcham={22} /> : <span className="font-display text-[18px]">#{raqam}</span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] leading-tight">
          {bajarildi ? t("kkBajarildi") : t("kkSarlavha", { n: raqam })}
        </span>
        <span className={`mt-0.5 block truncate text-[12px] leading-snug
                          ${bajarildi ? "text-ink-soft" : "text-white/90"}`}>
          {bajarildi
            ? (zanjir > 0 ? t("kkZanjirDavom", { n: zanjir }) : t("kkErtaga"))
            : (zanjir > 0 ? t("kkZanjirXavf", { n: zanjir }) : t("kkIzoh"))}
        </span>
      </span>
      {zanjir > 0 && (
        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 font-display text-[12.5px]
                          ${bajarildi ? "bg-brand-gold/15 text-brand-gold" : "bg-white/25 text-white"}`}>
          <EmojiBelgi e="🔥" olcham={14} />{zanjir}
        </span>
      )}
      <Icon name="chevron" size={18} className={`shrink-0 ${bajarildi ? "text-ink-soft" : "text-white/85"}`} />
    </button>
  );
}
