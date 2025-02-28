FROM node:20-alpine AS builder
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

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

# Add entrypoint script
COPY packages/backend/citation-service/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
