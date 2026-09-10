# SQLite → Postgres ko'chishi

Ishlab turgan bazani ko'chirish. Har qadamda tekshiruv bor va
**orqaga qaytish yo'li ochiq qoladi**: eski SQLite fayli tegilmaydi.

Ko'chish `git pull` bilan O'ZI bo'lmaydi va bu ataylab. Yangi kod
`DB_HOST` berilgan bo'lsagina Postgres'ga ulanadi; berilmasa
avvalgidek SQLite'da ishlayveradi. Ya'ni kodni joylash va bazani
ko'chirish — ikki alohida qadam va ikkinchisi qo'lda boshlanadi.

---

## 0. Tartib muhim

`.env` ga `DB_PASSWORD` yozilmasdan turib yangi `docker-compose.yml`
bilan `up` qilinsa, Compose xato bilan to'xtaydi va **sayt
ko'tarilmaydi**:

```
DB_PASSWORD .env da sozlanmagan
```

Bu himoya ataylab: parolsiz Postgres ochiq baza demak. Lekin shu
sababdan **avval `.env`, keyin `pull`**.

---

## 1. Zaxira

```bash
cd ~/aqlzone
SANA=$(date +%F-%H%M)

# 1a. SQLite faylining o'zi — eng ishonchli zaxira.
docker cp aqlzone:/data/az-data.sqlite3 ~/az-zaxira-$SANA.sqlite3

# 1b. JSON dump — ko'chishning o'zi shu fayldan yuklanadi.
docker exec -i aqlzone python manage.py dumpdata \
  --natural-foreign --natural-primary \
  --exclude contenttypes --exclude sessions \
  --indent 0 > ~/az-dump-$SANA.json

ls -lh ~/az-zaxira-$SANA.sqlite3 ~/az-dump-$SANA.json
```

`--exclude contenttypes` **majburiy**: `migrate` bu jadvalni o'zi
to'ldiradi va dumpdagi satrlar unga urishib, `loaddata` ni
"duplicate key" bilan yiqitardi. Loyihada `ContentType` ga
havola qiladigan maydon yo'q (`GenericForeignKey` ishlatilmagan),
shuning uchun tashlab yuborish xavfsiz.

---

## 2. Parol va `.env`

```bash
cd ~/aqlzone
PAROL=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

cat >> .env <<EOF

# ---- Postgres (SQLite dan ko'chirilgan $SANA) ----
DB_HOST=db
DB_PORT=5432
DB_NAME=aqlzone
DB_USER=aqlzone
DB_PASSWORD=$PAROL
EOF

echo "PAROLNI SAQLAB QO'YING: $PAROL"
```

Parolni yo'qotish bazani yo'qotish demak — `pgdata` volume ichidagi
ma'lumot o'sha parol bilan yaratilgan foydalanuvchiga bog'langan.

---

## 3. Kodni joylash va bazani ko'tarish

```bash
cd ~/aqlzone
git pull --ff-only
docker compose config >/dev/null   # YAML va o'zgaruvchilar to'g'rimi
docker compose up -d --build db
docker compose ps db               # "healthy" bo'lishini kuting
```

---

## 4. Sxema va ma'lumot

```bash
# 4a. Bo'sh Postgres'ga sxema.
docker compose run --rm --no-deps aqlzone python manage.py migrate --noinput

# 4b. Ma'lumot.
docker compose run --rm --no-deps -v ~/az-dump-$SANA.json:/tmp/dump.json \
  aqlzone python manage.py loaddata /tmp/dump.json
```

`loaddata` oxirida ketma-ketliklarni (`sequence`) o'zi tiklaydi.
Busiz keyingi `INSERT` birinchi raqamdan boshlab, "duplicate key"
bilan yiqilardi — bu Postgres'ga ko'chishning eng ko'p uchraydigan
xatosi.

---

## 5. Tekshiruv — **ko'chirishdan OLDIN**

Ikki bazadagi satrlar sonini solishtiramiz. Farq bo'lsa keyingi
qadamga o'tmang.

```bash
docker compose run --rm --no-deps aqlzone python manage.py shell -c "
from django.apps import apps
for M in sorted(apps.get_app_config('core').get_models(), key=lambda m: m.__name__):
    print(f'{M.__name__:22} {M.objects.count()}')
"
```

Xuddi shu buyruqni eski bazada ham yuriting (`DB_HOST` siz) va
sonlarni solishtiring.

---

## 6. To'liq o'tish

```bash
docker compose up -d --build
docker compose ps
curl -s -o /dev/null -w "%{http_code}\n" https://aql-zone.uz/
```

---

## Orqaga qaytish

Bir daqiqalik ish va **ma'lumot yo'qolmaydi** — SQLite fayli
`data` volume ichida tegilmasdan turibdi:

```bash
cd ~/aqlzone
sed -i '/^DB_HOST=/d' .env      # faqat shu qator yetadi
docker compose up -d --build
```

`DB_HOST` yo'qolishi bilan Django yana SQLite'ga qaytadi.
Postgres konteyneri turaveradi, lekin ishlatilmaydi.

Ko'chishdan keyingi yozuvlar (agar bo'lgan bo'lsa) SQLite'da
bo'lmaydi — shuning uchun qaytish qancha tez qilinsa, shuncha kam
narsa yo'qoladi.

---

## Keyin nima o'zgaradi

* `manage.py` buyruqlari o'zgarmaydi — cron ham o'sha holicha.
* Zaxira endi boshqacha olinadi:

  ```bash
  docker exec aqlzone_db pg_dump -U aqlzone aqlzone | gzip > ~/az-$(date +%F).sql.gz
  ```

* Sinovlar hamon SQLite'da ketadi (`settings.py` dagi izohga
  qarang). Postgres'da bir marta yuritish uchun:

  ```bash
  docker compose run --rm aqlzone python manage.py test core
  ```
