# syntax=docker/dockerfile:1

FROM node:20-alpine AS dependencies
WORKDIR /app

# Install production dependencies (no lock file provided)
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

FROM node:20-alpine AS production
WORKDIR /app

# System tools for healthcheck
RUN apk add --no-cache wget

# Bring in node_modules first for better layer caching
COPY --from=dependencies /app/node_modules ./node_modules

# Copy app source
COPY . .

# Prepare writable dirs and drop privileges
RUN mkdir -p /app/uploads /app/logs && \
    chown -R node:node /app
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
