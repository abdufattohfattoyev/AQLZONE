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
 *     ichida havolani ilova ochishi kerak — ramka o'zi ocholmaydi).
 */
import { useEffect, useMemo, useState } from "react";
import { botNomi, joriyProfil } from "../lib/api";
import { havolaniOch, tgWebApp, useOrqaga } from "../lib/qobiq";

export function KarvonYoli({ onChiq }: { onChiq: () => void }) {
  useOrqaga(onChiq);
  const [bot, setBot] = useState<string | null>(null);

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
          src={manzil}
          title="Karvon yo'li"
          className="block h-full w-full border-0"
          allow="autoplay; vibrate"
        />
      )}
    </div>
  );
}
