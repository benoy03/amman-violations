# ==============================================================================
# 🏛️ أمانة عمّان الكبرى — مديرية الرقابة الآلية والتحكم (قسم المخالفات)
# 🐳 Dockerfile for 24/7 Production Deployment
# ==============================================================================
FROM node:20-bookworm-slim

# تثبيت أدوات البناء الأساسية لدعم better-sqlite3 على أي معالج
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# نسخ ملفات الحزم لتسريع عملية البناء (Caching)
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# تثبيت الحزم
# تثبيت حزم الخادم
RUN npm --prefix server install
# تثبيت حزم الواجهة بالكامل (بما فيها أدوات vite و tailwindcss للبناء)
RUN npm --prefix client install --include=dev

# نسخ كود الواجهة وبناؤها
COPY client/ ./client/
RUN npm --prefix client run build

# نسخ كود الخادم وقاعدة البيانات
COPY server/ ./server/

# إعداد المجلدات والصلاحيات
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads /app/server/src/config

# متغيرات التشغيل النهائية
ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/app/server/src/config/database.sqlite
ENV UPLOADS_DIR=/app/uploads

EXPOSE 5000

CMD ["node", "server/src/server.js"]
