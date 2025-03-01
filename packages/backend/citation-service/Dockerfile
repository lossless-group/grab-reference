FROM node:20-alpine AS builder
RUN apk add --no-cache openssl

# Robust pnpm installation that handles all cases
RUN if command -v pnpm >/dev/null 2>&1; then \
    echo "pnpm is already installed, version: $(pnpm --version)"; \
    else \
    echo "Installing pnpm via npm..."; \
    npm install -g pnpm@latest-10 --force; \
    fi

WORKDIR /app

# Copy .npmrc file to allow Prisma builds
COPY .npmrc ./

# Copy root package files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy service package files
COPY packages/backend/citation-service/package.json ./packages/backend/citation-service/
COPY packages/backend/citation-service/prisma ./packages/backend/citation-service/prisma/
COPY packages/backend/citation-service/.env ./packages/backend/citation-service/

# Install dependencies with Prisma build scripts enabled
RUN pnpm install

# Copy source code
COPY packages/backend/citation-service/tsconfig.json ./packages/backend/citation-service/
COPY packages/backend/citation-service/src ./packages/backend/citation-service/src/

# Generate Prisma client explicitly
RUN cd packages/backend/citation-service && pnpm prisma generate

# Build
WORKDIR /app/packages/backend/citation-service
RUN pnpm build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl netcat-openbsd

# Robust pnpm installation that handles all cases
RUN if command -v pnpm >/dev/null 2>&1; then \
    echo "pnpm is already installed, version: $(pnpm --version)"; \
    else \
    echo "Installing pnpm via npm..."; \
    npm install -g pnpm@latest --force; \
    fi

WORKDIR /app/packages/backend/citation-service

# Copy package files and dependencies
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/pnpm-lock.yaml /app/
COPY --from=builder /app/pnpm-workspace.yaml /app/
COPY --from=builder /app/packages/backend/citation-service/package.json ./
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/backend/citation-service/node_modules ./node_modules

# Copy built files and other assets
COPY --from=builder /app/packages/backend/citation-service/dist ./dist
COPY --from=builder /app/packages/backend/citation-service/prisma ./prisma
COPY --from=builder /app/packages/backend/citation-service/.env ./.env

# Create simpler entrypoint script focused on DB push rather than migrations
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Print environment for debugging (excluding secrets)' >> /entrypoint.sh && \
    echo 'echo "Database Host: ${DB_HOST:-postgres}"' >> /entrypoint.sh && \
    echo 'echo "Database Port: ${DB_PORT:-5432}"' >> /entrypoint.sh && \
    echo 'echo "Working directory: $(pwd)"' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Wait for PostgreSQL to be ready' >> /entrypoint.sh && \
    echo 'echo "Waiting for PostgreSQL to be ready..."' >> /entrypoint.sh && \
    echo 'timeout=60' >> /entrypoint.sh && \
    echo 'while ! nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432} >/dev/null 2>&1; do' >> /entrypoint.sh && \
    echo '  timeout=$(($timeout - 1))' >> /entrypoint.sh && \
    echo '  if [ $timeout -eq 0 ]; then' >> /entrypoint.sh && \
    echo '    echo "Timed out waiting for PostgreSQL to be ready"' >> /entrypoint.sh && \
    echo '    exit 1' >> /entrypoint.sh && \
    echo '  fi' >> /entrypoint.sh && \
    echo '  echo "PostgreSQL not ready yet, waiting..."' >> /entrypoint.sh && \
    echo '  sleep 1' >> /entrypoint.sh && \
    echo 'done' >> /entrypoint.sh && \
    echo 'echo "PostgreSQL is ready!"' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Generate Prisma client (if needed)' >> /entrypoint.sh && \
    echo 'echo "Generating Prisma client..."' >> /entrypoint.sh && \
    echo 'npx prisma generate --schema=./prisma/schema.prisma' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Create database tables directly from schema' >> /entrypoint.sh && \
    echo 'echo "Creating database tables from schema..."' >> /entrypoint.sh && \
    echo 'npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Start the application' >> /entrypoint.sh && \
    echo 'echo "Starting application..."' >> /entrypoint.sh && \
    echo 'exec node dist/index.js' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
