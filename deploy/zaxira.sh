#!/bin/sh
# Bazaning kunlik zaxira nusxasi (`docker-compose.yml` dagi `zaxira`).
#
# Har ZAXIRA_SOAT soatda `pg_dump` qiladi va /zaxira ichiga
# `az-YYYY-MM-DD_HHMM.sql.gz` yozadi. ZAXIRA_KUN kundan eski
# nusxalar o'chiriladi — aks holda disk sekin-asta to'lib, oxiri
# bazaning O'ZI yozolmay qolardi.
#
# Fayl avval `.tmp` nomi bilan yoziladi va faqat pg_dump muvaffaqiyatli
# tugagach qayta nomlanadi: yarim yozilgan nusxa "zaxira bor" degan
# yolg'on ishonch berardi.
#
# Tiklash:
#   gunzip -c zaxira/az-....sql.gz | docker exec -i aqlzone_db psql -U aqlzone aqlzone
set -u

SOAT="${ZAXIRA_SOAT:-24}"
KUN="${ZAXIRA_KUN:-14}"
PAPKA="${ZAXIRA_PAPKA:-/zaxira}"

while true; do
  nom="$PAPKA/az-$(date +%F_%H%M).sql.gz"
  # Siqishni pg_dump O'ZI qiladi (`-Z`): `pg_dump | gzip` da xatoni
  # gzip yashirardi — quvurning natijasi oxirgi buyruqniki.
  if pg_dump --no-owner -Z 6 -f "$nom.tmp"; then
    mv "$nom.tmp" "$nom"
    echo "zaxira: $nom ($(du -h "$nom" | cut -f1))"
  else
    rm -f "$nom.tmp"
    echo "zaxira: XATO — pg_dump yiqildi" >&2
  fi
  find "$PAPKA" -name 'az-*.sql.gz' -mtime "+$KUN" -delete
  sleep "$((SOAT * 3600))"
done
