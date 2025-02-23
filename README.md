

## Getting Started

This project uses pnpm as the package manager and includes both a web frontend and backend services.

### Prerequisites

- Node.js (v20 or later)
- pnpm (v10 or later)
- Docker and Docker Compose (for running the database and services)

### Initial Setup


1. Run the setup script to create the project structure and configuration files:
Use bash and run
`chmod +x setup.sh`
then 
`bash ./setup.sh`

2. Install dependencies:
`pnpm install`


3. Set up the database:

    1. Start the PostgreSQL database
    `docker-compose up -d postgres`
    2. Generate the Prisma client
    `pnpm primsa:generate`
    3. Run database migrations
    `pnpm prisma:migrate`

### Running the Application
Run just the web app: 
`pnpm dev:web`
Run just the API:
`pnpm dev:api`

Start both frontend and backend:
`pnpm dev`

The "Hello World" React app should be visible at http://localhost:3000. Let me know if you still can't access it!