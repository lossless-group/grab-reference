FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install

# Copy source code and types
COPY src ./src/

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN pnpm prisma generate

# Build TypeScript
RUN pnpm run build

EXPOSE 8080

CMD ["node", "dist/index.js"] 