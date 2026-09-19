/**
 * Karvon yo'li — Ipak yo'li bo'ylab matematik sarguzasht.
 *
 * O'yinning o'zi alohida sahifa (`public/oyin/karvon.html`): u o'z
 * sahnasi, xaritasi va bozori bilan to'liq ekranni egallaydi va ilova
 * uslubidan ataylab farq qiladi (tungi cho'l, terrakota va oltin).
 * Bu ekran uni ramka ichida ochadi va ikki narsani bog'laydi:
 *
 *   - kim o'ynayapti: profil raqami (saqlanish profilga bog'lanadi —
 *     aka-uka bitta telefonda bir-birining karvonini surib yubormaydi),
 *     ism va ulashish uchun bot nomi;
 *   - o'yindan kelgan xabarlar: "chiqish" va "ulashish" (Telegram
 *     ichida havolani ilova ochishi kerak — ramka o'zi ocholmaydi);
 *   - "kim qayerda": o'yin joriy bekatini yuboradi, ilova uni serverga
 *     yozadi va hammaga ochiq ro'yxatni qaytaradi (avatar belgisi bilan).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { botNomi, joriyProfil, karvonHolat, karvonRoyxat, karvonSorov } from "../lib/api";
import { avatarBelgi } from "../lib/dokon";
import { havolaniOch, tgWebApp, useOrqaga } from "../lib/qobiq";

/** O'yin so'rashi mumkin bo'lgan yo'llar. GET — `men`, qolgani POST. */
const RUXSAT = new Set(["men", "bekat", "javob", "otkaz", "maslahat", "qayta"]);

export function KarvonYoli({ onChiq }: { onChiq: () => void }) {
  useOrqaga(onChiq);
  const [bot, setBot] = useState<string | null>(null);
  const ramka = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let bekor = false;
    botNomi().then((b) => { if (!bekor) setBot(b || ""); }).catch(() => { if (!bekor) setBot(""); });
    return () => { bekor = true; };
  }, []);

  useEffect(() => {
    const qabul = (e: MessageEvent) => {
      if (e.origin !== location.origin || !e.data || e.data.karvon !== 1) return;
      if (e.data.tur === "chiqish") onChiq();
      else if (e.data.tur === "ulash" && typeof e.data.url === "string"
               && e.data.url.startsWith("https://t.me/share/url")) havolaniOch(e.data.url);
      else if (e.data.tur === "holat") {
        void karvonHolat(Number(e.data.bekat) || 0, Number(e.data.yulduz) || 0, Number(e.data.daraja) || 2).catch(() => {});
      } else if (e.data.tur === "api" && typeof e.data.yol === "string" && RUXSAT.has(e.data.yol)) {
        // To'siq, javob, maslahat — o'yin tokenni bilmaydi, so'rovni ilova yuboradi.
        const id = e.data.id;
        const javob = (xabar: Record<string, unknown>) =>
          ramka.current?.contentWindow?.postMessage({ karvon: 1, tur: "api-javob", id, ...xabar }, location.origin);
        karvonSorov(e.data.yol, e.data.body)
          .then((data) => javob({ ok: true, data }))
          .catch((x: { sabab?: string }) => javob({ ok: false, sabab: x?.sabab || "aloqa" }));
      } else if (e.data.tur === "royxat-sora") {
        karvonRoyxat().then((r) => {
          const qatorlar = r.qatorlar.map((q) => ({ ...q, belgi: avatarBelgi(q.avatar) }));
          ramka.current?.contentWindow?.postMessage({ karvon: 1, tur: "royxat", ...r, qatorlar }, location.origin);
        }).catch(() => {});
      }
    };
    window.addEventListener("message", qabul);
    return () => window.removeEventListener("message", qabul);
  }, [onChiq]);

  const manzil = useMemo(() => {
    if (bot === null) return "";
    const ism = (tgWebApp()?.initDataUnsafe?.user as { first_name?: string } | undefined)?.first_name ?? "";
    const p = new URLSearchParams({ ichki: "1", pid: joriyProfil() ?? "0", bot, ism });
    return `/oyin/karvon.html?${p.toString()}`;
  }, [bot]);

  return (
    <div className="fixed inset-0 z-[60] bg-[#120F0D]">
      {manzil && (
        <iframe
          ref={ramka}
          src={manzil}
          title="Karvon yo'li"
          className="block h-full w-full border-0"
          allow="autoplay; vibrate"
        />
      )}
    </div>
  );
}
