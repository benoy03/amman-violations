# ==============================================================================
# 🏛️ أمانة عمّان الكبرى — مديرية الرقابة الآلية والتحكم (قسم المخالفات)
# 🐳 Dockerfile for 24/7 Production Deployment
# ==============================================================================
FROM node:20-bookworm-slim

WORKDIR /app

# إعداد المتغيرات الأساسية
ENV NODE_ENV=production
ENV PORT=5000
# مسار تخزين البيانات والصور على قرص دائم
ENV DB_PATH=/data/database.sqlite
ENV UPLOADS_DIR=/data/uploads

# نسخ تعريفات الحزم لتسريع الـ caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# تثبيت الحزم للواجهة الخلفية
RUN npm --prefix server install --omit=dev

# تثبيت حزم الواجهة الأمامية وبناؤها
RUN npm --prefix client install
COPY client/ ./client/
RUN npm --prefix client run build

# نسخ كود الخادم وملفات النظام
COPY server/ ./server/

# إنشاء مجلد البيانات الدائمة مع أذونات الكتابة
RUN mkdir -p /data/uploads && chmod -R 777 /data

EXPOSE 5000

# تشغيل الخادم
CMD ["node", "server/src/server.js"]
