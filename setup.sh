#!/bin/bash

# Create root project directory structure
mkdir -p apps/web/src/components
mkdir -p packages/{backend,shared}
mkdir -p packages/backend/{citation-service,crawler-service,search-service}
mkdir -p packages/shared/{types,utils}

# Create pnpm workspace config
cat > pnpm-workspace.yaml << EOL
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/backend/*'
  - 'packages/shared/*'

supportedRange: ">=19.0.0"

peerDependencyRules:
  allowAny:
    - react
    - react-dom
    - stylex
    - skip

packageExtensions:
  '@stylexjs/stylex@*':
    peerDependencies:
      react: '>=19.0.0'
EOL

# Create root package.json
cat > package.json << EOL
{
  "name": "citation-manager",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "pnpm -r dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "docker:build": "docker build -t citation-manager .",
    "docker:run": "docker run -p 3000:3000 -p 8080:8080 citation-manager"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "prettier": "^3.1.1",
    "eslint": "^8.56.0"
  }
}
EOL

# Create web app package.json
cat > apps/web/package.json << EOL
{
  "name": "@citation-manager/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@stylexjs/stylex": "^0.5.1",
    "skip": "^1.1.0",
    "@citation-manager/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
EOL

# Create Dockerfile
cat > Dockerfile << EOL
# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config and package files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/backend/*/package.json ./packages/backend/
COPY packages/shared/*/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

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
EOL

# Create backend service package.json
cat > packages/backend/citation-service/package.json << EOL
{
  "name": "@citation-manager/citation-service",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@prisma/client": "^5.8.1",
    "fastify": "^4.25.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "prisma": "^5.8.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
EOL

# Make the script executable
chmod +x setup.sh 