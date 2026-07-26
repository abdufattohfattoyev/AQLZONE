# Aql Zone — ishlab chiqarish uchun bitta obraz.
#
# Ikki bosqich, chunki Node FAQAT yig'ish paytida kerak: React ilova
# statik fayllarga aylanadi va shundan keyin Node'ning ishi tugaydi.
# Uni yakuniy obrazda qoldirsak, obraz bir necha yuz megabaytga
# shishardi va serverda hech qachon ishlatilmaydigan npm turardi.
#
# Yakuniy obraz Django'ni ham, yig'ilgan React'ni ham O'ZI beradi
# (`core/spa.py`), shuning uchun alohida statik server kerak emas.

# ---------------------------------------------------------- 1. frontend
FROM node:22-alpine AS front
WORKDIR /app

# Avval faqat manifest — kod o'zgarganda `npm ci` qayta ishlamasin.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ----------------------------------------------------------- 2. backend
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=front /app/dist /frontend/dist

# Yig'ilgan React shu yerda turadi; baza esa volume'da — konteyner
# qayta qurilganda progress yo'qolmasligi kerak.
ENV FRONTEND_DIST=/frontend/dist \
    DB_FILE=/data/az-data.sqlite3

COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "aqlzone.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60"]
