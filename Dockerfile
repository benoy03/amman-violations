# ==============================================================================
# 🏛️ أمانة عمّان الكبرى — مديرية الرقابة الآلية والتحكم (قسم المخالفات)
# 🐳 Dockerfile for Railway / Fly.io Production Deployment
# ==============================================================================
FROM node:20-bookworm-slim

# Build tools required for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests first for layer caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
RUN npm --prefix server install

# Install client dependencies (including dev tools for Vite build)
RUN npm --prefix client install --include=dev

# Build the frontend
COPY client/ ./client/
RUN npm --prefix client run build

# Copy server source
COPY server/ ./server/

# Create data directory for SQLite database and uploads
RUN mkdir -p /app/data/uploads && chmod -R 777 /app/data

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/app/data/database.sqlite
ENV UPLOADS_DIR=/app/data/uploads

EXPOSE 5000

CMD ["node", "server/src/server.js"]
