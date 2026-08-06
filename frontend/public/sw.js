/*
 * Aql Zone — offline qatlami.
 *
 * Nega kerak: savollar QURILMADA yasaladi va progress `localStorage` da
 * turadi. Ya'ni ilova ishlashi uchun internet umuman shart emas — faqat
 * fayllarni yuklab olish kerak. Shu sabab internet uzilganda oq ekran
 * ko'rsatish oddiy nuqson edi, xususiyat yetishmasligi emas.
 *
 * Strategiya ikkita, chunki fayllar ikki xil:
 *
 *   /assets/xxx-HASH.js   — nomida xesh bor, mazmuni HECH QACHON o'zgarmaydi.
 *                           Keshdan beriladi, tarmoqqa umuman chiqilmaydi.
 *
 *   navigatsiya (sahifa)  — avval tarmoq, bo'lmasa kesh. Shu tartib muhim:
 *                           yangi versiya chiqqanda bola uni darhol oladi,
 *                           internet yo'q bo'lsa esa eskisi ochiladi.
 *
 * API so'rovlari (/api/) ATAYLAB keshlanmaydi: eskirgan progressni
 * qaytarish — progressni yo'qotishdan ham yomonroq, chunki mijoz uni
 * to'g'ri deb qabul qilib, ustiga yozib yuboradi.
 *
 * BITTA ISTISNO — /api/v1/ovoz. U ma'lumot emas, FAYL beradi: berilgan
 * matnning talaffuzi hech qachon o'zgarmaydi (manzildagi matn o'zgarsa,
 * boshqa fayl bo'ladi). Ya'ni "eskirgan javob" degan xavf bu yerda
 * umuman yo'q. Keshlash esa kichkintoylar bo'limi uchun hal qiluvchi:
 * usiz har bosishda tarmoqqa chiqilardi va internetsiz telefonda butun
 * bo'lim jim qolardi.
 */

// v3: /api/v1/ovoz keshlanadigan bo'ldi. Raqam oshmasa eski kesh
// qoidalari bilan ishlab, ovoz fayllari saqlanmasdi.
const VERSIYA = "az-v3";
const QOBIQ = `${VERSIYA}-qobiq`;

/** Ilova ochilishi uchun eng zarur fayllar. */
const BOSHLANGICH = ["/", "/manifest.webmanifest", "/favicon.svg", "/logo-maskable.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const kesh = await caches.open(QOBIQ);
      // `reload` — o'rnatish paytida brauzer keshidagi eski nusxa olinmasin.
      await Promise.allSettled(
        BOSHLANGICH.map((u) => kesh.add(new Request(u, { cache: "reload" })))
      );
      // Kutib turmaymiz: yangi versiya darhol tayyor bo'lsin. Boshqaruvni
      // olish esa foydalanuvchi tasdig'idan keyin (SKIP_WAITING xabari).
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      // Eski versiyalarning keshini tozalaymiz, aks holda telefon xotirasi
      // har yangilanishda o'sib boraveradi.
      const nomlar = await caches.keys();
      await Promise.all(
        nomlar.filter((n) => !n.startsWith(VERSIYA)).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

/** Foydalanuvchi "yangilash" ni bosdi — navbatdagi versiya ishga tushsin. */
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const s = e.request;

  // Faqat o'zimizning GET so'rovlarimiz. POST/PUT hech qachon keshlanmaydi.
  if (s.method !== "GET") return;

  const url = new URL(s.url);
  if (url.origin !== self.location.origin) return;
  // Ovoz — yagona keshlanadigan API manzili (yuqoridagi izohga qarang).
  // Qolgan hamma /api/ so'rovi tarmoqqa, to'g'ridan-to'g'ri ketadi.
  const ovozmi = url.pathname === "/api/v1/ovoz";
  if (url.pathname.startsWith("/api/") && !ovozmi) return;

  // --- Sahifa so'rovi: avval tarmoq ---
  if (s.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const javob = await fetch(s);
          const kesh = await caches.open(QOBIQ);
          // SPA'da har qanday manzil bir xil index.html ni beradi, shuning
          // uchun uni "/" nomi bilan saqlaymiz: keyin /kurs/1-sinf ni
          // offline ochganda ham shu javob topiladi.
          kesh.put("/", javob.clone());
          return javob;
        } catch {
          const kesh = await caches.open(QOBIQ);
          return (
            (await kesh.match("/")) ??
            new Response(
              "<h1>Internet yo'q</h1><p>Ilovani bir marta internet bilan oching.</p>",
              { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 }
            )
          );
        }
      })()
    );
    return;
  }

  // --- Qolgan fayllar: avval kesh ---
  e.respondWith(
    (async () => {
      const kesh = await caches.open(QOBIQ);
      const bor = await kesh.match(s);
      if (bor) return bor;

      const javob = await fetch(s);
      // FAQAT 200. `javob.ok` 204 ni ham "muvaffaqiyat" deb biladi, ovoz
      // endpointi esa aynan 204 bilan "bu so'zning ovozi yo'q" deydi
      // (masalan server hali yasamagan). Uni keshlab qo'ysak, o'sha so'z
      // shu qurilmada ABADIY jim qolardi — hatto ovoz keyin yasalganda
      // ham. 404 va 500 ham xuddi shu sababdan saqlanmaydi.
      if (javob.status === 200 && javob.type === "basic") kesh.put(s, javob.clone());
      return javob;
    })()
  );
});
