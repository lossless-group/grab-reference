FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/citation-service/package.json ./packages/backend/citation-service/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client and build
RUN cd packages/backend/citation-service && \
    pnpm prisma generate && \
    pnpm build

EXPOSE 8080

CMD ["pnpm", "--filter", "@citation-manager/citation-service", "start"] 