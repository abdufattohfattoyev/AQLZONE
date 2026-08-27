import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Capacitor bilan APK/iOS ga o'ralganda sahifa file:// dan yuklanadi:
  // u yerda ham yo'llar nisbiy, ham marshrut hash bo'lishi shart (main.tsx).
  //     VITE_ROUTER=hash npm run build
  const apk = env.VITE_ROUTER === 'hash'

  return {
    plugins: [react(), tailwindcss()],
    // Veb'da manzil /kurs/1-sinf/2-bob/3-dars bo'lishi mumkin. Nisbiy base
    // bunday chuqurlikda asset yo'llarini buzadi — shuning uchun ildizdan.
    base: apk ? './' : '/',
    server: {
      // 5180 — odatiy port. `PORT` berilgan bo'lsa u ustun turadi: bir
      // vaqtda ikkita ishlab chiqish serveri kerak bo'lganda (masalan
      // ikki muharrir oynasi) ikkinchisi band portga urilib to'xtardi.
      port: Number(env.PORT) || 5180,
      // Backend /api/v1 da ishlaydi — ishlab chiqishda shu yerga uzatamiz.
      //
      // Manzil o'zgaruvchidan olinadi, chunki backend har doim ham 8787 da
      // turmaydi (port band bo'lishi mumkin, `.claude/launch.json` boshqa
      // portni ishlatishi mumkin). Qattiq yozib qo'yilganda mos kelmagan
      // holat JIM o'tadi: `/api` javob bermaydi, ilova esa buni "internet
      // yo'q" deb qabul qilib, hech qanday xato ko'rsatmaydi.
      //     VITE_API=http://localhost:8788 npm run dev
      proxy: {
        '/api': { target: env.VITE_API || 'http://localhost:8787', changeOrigin: true },
        // Foydalanuvchi yuborgan rasmlar ham backenddan keladi
        // (`/media/...`). Busiz ishlab chiqishda rasm o'rniga
        // `index.html` qaytardi va rasm buzuq bo'lib ko'rinardi —
        // ishlab chiqarishda esa hammasi joyida bo'lardi, ya'ni
        // nosozlik faqat mahalliy mashinada chiqardi.
        '/media': { target: env.VITE_API || 'http://localhost:8787', changeOrigin: true },
      },
    },
  }
})
