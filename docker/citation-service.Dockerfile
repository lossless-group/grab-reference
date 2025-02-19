FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config and package files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/backend/citation-service/package.json ./packages/backend/citation-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy service source code
COPY packages/backend/citation-service ./packages/backend/citation-service

# Generate Prisma client and build
RUN cd packages/backend/citation-service && \
    pnpm prisma generate && \
    pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and necessary files
COPY --from=builder /app/packages/backend/citation-service/dist ./dist
COPY --from=builder /app/packages/backend/citation-service/node_modules ./node_modules
COPY --from=builder /app/packages/backend/citation-service/package.json .

EXPOSE 8080

CMD ["pnpm", "start"] 