#!/bin/sh
# Konteyner har ishga tushganda migratsiyalar qo'llanadi.
#
# Nega shu yerda: joylash bir buyruq bo'lishi kerak. Migratsiyani qo'lda
# eslab yuritish — ertami-kechmi unutiladigan qadam, va u unutilganda
# sayt "ustun yo'q" degan 500 bilan yiqiladi.
#
# Bot konteyneri ham shu obrazdan ishga tushadi. `migrate` ikki marta
# chaqirilishi xavfsiz: qo'llanadigan narsa qolmasa Django hech narsa
# qilmaydi.
set -e

python manage.py migrate --noinput

exec "$@"
