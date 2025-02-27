FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy all package files first
COPY pnpm-*.yaml ./
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies at workspace root
RUN pnpm install

# Explicitly install vite and plugins in web directory
RUN cd apps/web && pnpm install --include=dev

# Copy the rest of the code
COPY . .

# Build shared packages first
RUN pnpm --filter "@citation-manager/shared" build

# Build the web application
RUN cd apps/web && pnpm build

# Set working directory to web app
WORKDIR /app/apps/web

# Start production server
CMD ["pnpm", "start"] 