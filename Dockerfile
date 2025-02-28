# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy .npmrc file to allow Prisma builds
COPY .npmrc ./

# Copy workspace config and package files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/backend/*/package.json ./packages/backend/
COPY packages/shared/*/package.json ./packages/shared/

# Install dependencies with build scripts enabled
RUN pnpm install --frozen-lockfile --include-dev

# Copy source code
COPY . .

# Build applications
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

# Expose ports
EXPOSE 3000
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]
