# ==============================================================================
# 🏛️ أمانة عمّان الكبرى — مديرية الرقابة الآلية والتحكم (قسم المخالفات)
# 🐳 Dockerfile for 24/7 Production Deployment
# ==============================================================================
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/app/server/src/config/database.sqlite
ENV UPLOADS_DIR=/app/uploads

# نسخ ملفات الحزم لتسريع البناء
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# تثبيت الحزم
RUN npm --prefix server install --omit=dev
RUN npm --prefix client install

# بناء الواجهة
COPY client/ ./client/
RUN npm --prefix client run build

# نسخ ملفات الخادم وقاعدة البيانات
COPY server/ ./server/

# منح صلاحيات الكتابة لقاعدة البيانات والصور
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads /app/server/src/config

EXPOSE 5000

CMD ["node", "server/src/server.js"]
