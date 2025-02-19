FROM node:20-alpine as builder
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root package files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy service package files
COPY packages/backend/citation-service/package.json ./packages/backend/citation-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy configuration files and source code
COPY packages/backend/citation-service/tsconfig.json ./packages/backend/citation-service/
COPY packages/backend/citation-service/prisma ./packages/backend/citation-service/prisma/
COPY packages/backend/citation-service/src ./packages/backend/citation-service/src/

# Generate Prisma client and build
RUN cd packages/backend/citation-service && \
    pnpm prisma generate && \
    pnpm build

FROM node:20-alpine as runner
RUN apk add --no-cache openssl

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/packages/backend/citation-service/dist ./dist
COPY --from=builder /app/packages/backend/citation-service/node_modules ./node_modules
COPY --from=builder /app/packages/backend/citation-service/prisma ./prisma

EXPOSE 8080
CMD ["node", "dist/index.js"]
