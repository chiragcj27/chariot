# Stage 1: Builder
FROM node:18-bullseye AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ build-essential && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy workspace config files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Install pnpm globally and clear cache
RUN npm install -g pnpm && npm cache clean --force

# Copy packages and API
COPY packages ./packages
COPY apps/api ./apps/api

# Environment for Puppeteer - skip download to save time
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    CHROMIUM_SKIP_DOWNLOAD=true

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build all packages first, then the API
RUN pnpm build

# Clean up node_modules from builder to save space
RUN find node_modules -name "*.test.*" -o -name "*.spec.*" -o -name "*.map" | xargs rm -rf
RUN find . -type d -name ".cache" -o -name ".git" | xargs rm -rf


# Stage 2: Runtime
FROM node:18-bullseye

# Install only essential runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Environment variables for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NODE_ENV=production

# Working directory
WORKDIR /app

# Copy necessary workspace files
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Install pnpm and only production dependencies (smaller footprint)
RUN npm install -g pnpm && npm cache clean --force && \
    pnpm install --frozen-lockfile --prod && \
    pnpm store prune

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Create non-root user for security
RUN groupadd -r nodejs || true && \
    useradd -r -g nodejs nodejs || true && \
    chown -R nodejs:nodejs /app

USER nodejs

# Set API working dir
WORKDIR /app/apps/api

# Expose app port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', res => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# Start app
CMD ["node", "dist/index.js"]
  