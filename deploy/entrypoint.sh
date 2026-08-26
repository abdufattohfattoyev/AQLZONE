#!/bin/sh
# Konteyner ishga tushganda baza tayyorlanadi.
#
# Nega shu yerda: joylash BIR buyruq bo'lishi kerak. Migratsiyani
# qo'lda eslab yuritish — ertami-kechmi unutiladigan qadam, va u
# unutilganda sayt "ustun yo'q" degan 500 bilan yiqiladi.
#
# ─────────────── NEGA FAQAT BITTASI MIGRATSIYA QILADI ───────────────
#
# Ilgari ikkala konteyner ham (`web` va `bot`) shu yerda `migrate`
# chaqirardi va izohda "ikki marta chaqirish xavfsiz" deb yozilgan
# edi. Bu KETMA-KET chaqirilganda to'g'ri, lekin ular ketma-ket
# ishga tushmaydi: `docker compose up` ikkalasini birdaniga
# ko'taradi, `depends_on` esa faqat konteyner BOSHLANISHINI kutadi,
# migratsiya tugashini emas.
#
# Natijada yangi migratsiya joylanganda ikkalasi bir vaqtda o'sha
# jadvalni yasashga urinadi va biri yiqiladi:
#
#     django.db.utils.OperationalError: table "masala" already exists
#
# Bot `restart: unless-stopped` tufayli qayta ko'tarilib, ikkinchi
# urinishda ishlab ketadi — ya'ni nosozlik JIM o'tadi va faqat
# jurnalga qaraganda ko'rinadi. Lekin har migratsiyali joylashda
# bot bir necha soniyaga o'lik qoladi, va bir kun kelib u
# migratsiyaning O'RTASIDA yiqilishi ham mumkin.
#
# Endi rol aniq: `web` migratsiya qiladi, `bot` esa tugashini
# KUTADI. Kutish `migrate --check` bilan — u qo'llanmagan migratsiya
# qolmaganda nol qaytaradi.
set -e

ROL="${AZ_ROL:-web}"

if [ "$ROL" = "web" ]; then
  python manage.py migrate --noinput
else
  # Cheksiz kutmaymiz: `web` umuman ko'tarilmasa, bot ham abadiy
  # jim turib qolardi va buni hech kim sezmasdi. Yiqilgani esa
  # ko'rinadi — konteyner qayta ishga tushadi va jurnalga yozadi.
  KUTISH=0
  while ! python manage.py migrate --check >/dev/null 2>&1; do
    KUTISH=$((KUTISH + 2))
    if [ "$KUTISH" -gt 120 ]; then
      echo "migratsiya 2 daqiqada tugamadi — web konteynerni tekshiring" >&2
      exit 1
    fi
    echo "baza tayyor emas, kutyapmiz… (${KUTISH}s)"
    sleep 2
  done
fi

exec "$@"
