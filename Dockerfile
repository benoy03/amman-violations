# ==============================================================================
# 🏛️ أمانة عمّان الكبرى — مديرية الرقابة الآلية والتحكم (قسم المخالفات)
# 🐳 Dockerfile for Fly.io Production Deployment
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

# /data is the persistent volume mount point (set by fly.toml)
# Create fallback dirs in case volume isn't mounted (local testing)
RUN mkdir -p /data/uploads && chmod -R 777 /data

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/data/database.sqlite
ENV UPLOADS_DIR=/data/uploads

EXPOSE 5000

CMD ["node", "server/src/server.js"]
