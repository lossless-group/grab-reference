#!/bin/bash

# Exit on error
set -e

# Create root project directory structure
mkdir -p apps/web/src/components
mkdir -p packages/{backend,shared}
mkdir -p packages/backend/{citation-service,search-service}
mkdir -p packages/shared/{types,utils,api-handlers}
mkdir -p docker

# Create Prisma schema first
mkdir -p packages/backend/citation-service/prisma && cat > packages/backend/citation-service/prisma/schema.prisma << 'EOF'
// This is your Prisma schema file
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Define your initial models here
model Citation {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String
  url       String
}
EOF

# Create backend service package.json first as it's a dependency
cat > packages/backend/citation-service/package.json << EOL
{
  "name": "@citation-manager/citation-service",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node --enable-source-maps ./dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prebuild": "pnpm prisma:generate",
    "predev": "pnpm prisma:generate",
    "prepare": "pnpm prisma:generate"
  },
  "dependencies": {
    "@prisma/client": "^6.4.1",
    "fastify": "^4.25.2",
    "zod": "^3.22.4",
    "prisma": "^6.4.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
EOL

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
    "dev": "pnpm --filter @citation-manager/web dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "db:generate": "pnpm --filter @citation-manager/citation-service prisma:generate",
    "db:migrate": "pnpm --filter @citation-manager/citation-service prisma:migrate",
    "docker:build": "docker build -t citation-manager .",
    "docker:run": "docker run -p 3000:3000 -p 8080:8080 citation-manager"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "prettier": "^3.1.1",
    "eslint": "^8.56.0"
  },
  "packageManager": "pnpm@10.4.1+sha512.c753b6c3ad7afa13af388fa6d808035a008e30ea9993f58c6663e2bc5ff21679aa834db094987129aa4d488b86df57f7b634981b2f827cdcacc698cc0cfb88af"
}
EOL

# Create web app package.json
cat > apps/web/package.json << EOL
{
  "name": "@citation-manager/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@stylexjs/stylex": "^0.3.0",
    "skip": "^0.0.13",
    "@citation-manager/shared": "workspace:*"
  },
  "devDependencies": {
    "@stylexjs/babel-plugin": "^0.3.0",
    "@babel/core": "^7.23.7",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
EOL

# Create necessary TypeScript configuration files
cat > apps/web/tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

cat > apps/web/tsconfig.node.json << EOL
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOL

# Create initial React components
cat > apps/web/src/App.tsx << EOL
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--background-color, #f0f2f5)'
  },
  text: {
    fontSize: '2rem',
    color: '#1a1a1a',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }
});

const App: React.FC = () => {
  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.text)}>Grab a citations</h1>
    </div>
  );
};

export default App;
EOL

cat > apps/web/src/main.tsx << EOL
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL

# Create Vite configuration
cat > apps/web/vite.config.ts << EOL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@stylexjs/babel-plugin', {
            dev: true,
            runtime: true,
            genConditionalClasses: true,
            styleResolution: 'application-order',
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir: __dirname,
            },
          }],
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 3000,
    host: true
  }
})
EOL

# Create HTML entry point
cat > apps/web/index.html << EOL
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GrabCite</title>
    <style>
      :root {
        --background-color: #f0f2f5;
      }
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: system-ui, -apple-system, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL

# Create .gitignore
cat > .gitignore << EOL
# Dependencies
node_modules
.pnpm-store
.npm
.pnpm-debug.log

# Build outputs
dist
build
lib
.next
out
coverage

# Environment files
.env
.env.local
.env.*.local
.env.development
.env.test
.env.production

# Editor directories
.vscode
.idea
.vs
*.sublime-*
*.swp
*.swo

# System files
.DS_Store
Thumbs.db
*.pem
.directory

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# TypeScript
*.tsbuildinfo
tsconfig.tsbuildinfo

# Testing
coverage
.nyc_output

# Docker
.docker
docker-compose.override.yml

# Database
*.sqlite
*.sqlite3
*.db

# Prisma
prisma/*.db
migrations/

# Temporary files
*.tmp
*.temp
.cache

# OS generated files
._*
.Spotlight-V100
.Trashes
ehthumbs.db
desktop.ini
EOL

# Make the script executable
chmod +x setup.sh