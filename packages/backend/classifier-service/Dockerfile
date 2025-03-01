FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config and root package files
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy service package files
COPY packages/backend/classifier-service/package.json ./packages/backend/classifier-service/
COPY packages/backend/classifier-service/tsconfig.json ./packages/backend/classifier-service/
COPY packages/shared/prisma ./packages/shared/prisma/

# Install dependencies
RUN pnpm install

# Copy source code
COPY packages/backend/classifier-service/src ./packages/backend/classifier-service/src/

# Set working directory to classifier service
WORKDIR /app/packages/backend/classifier-service

# Create a minimal package.json in the packages directory for Prisma
RUN mkdir -p /app/packages
RUN echo '{"name":"prisma-placeholder","version":"0.1.0","private":true}' > /app/packages/package.json

# Generate Prisma client
RUN pnpm prisma generate --schema=/app/packages/shared/prisma/schema.prisma

# Build TypeScript
RUN pnpm run build

EXPOSE 8080

CMD ["node", "dist/index.js"] 