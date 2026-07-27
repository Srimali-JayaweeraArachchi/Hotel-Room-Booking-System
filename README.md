# Hotel Room Booking System

Initial full-stack project setup for the EC8208 Software Architecture prototype.

## Technology stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL 8
- Local infrastructure: Docker Compose
- Architecture: Layered (presentation, business, and data-access layers)

The six business modules described in the architecture report are intentionally not
implemented yet. This initial setup only provides the application shells, shared
configuration, a database connection, and a health-check endpoint.

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- Docker Desktop with Docker Compose

## First-time setup

```powershell
npm install
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
docker compose up -d db
npm run dev
```

Open the frontend at `http://localhost:5173`. The backend API runs at
`http://localhost:5000`, and its health endpoint is
`http://localhost:5000/api/health`.

## Common commands

```powershell
npm run dev             # Run client and server together
npm run dev:client      # Run only the React application
npm run dev:server      # Run only the Express API
npm run build           # Create the frontend production build
npm run lint            # Check client and server source
npm run format          # Format source and configuration files
npm run db:up           # Start MySQL
npm run db:down         # Stop MySQL
npm run db:logs         # Follow MySQL logs
```

## Project structure

```text
.
|-- client/                    React presentation layer
|   `-- src/
|       |-- api/               API client configuration
|       |-- assets/            Static assets
|       |-- components/        Shared UI components
|       |-- features/          Future feature-level UI code
|       |-- layouts/           Page layouts
|       |-- pages/             Route-level pages
|       `-- styles/            Global styles
|-- server/                    Express application
|   `-- src/
|       |-- config/            Environment and database configuration
|       |-- controllers/       HTTP request handlers
|       |-- middleware/        Cross-cutting HTTP middleware
|       |-- repositories/      Data-access layer
|       |-- routes/            API route definitions
|       |-- services/          Business-logic layer
|       `-- utils/             Shared backend utilities
|-- database/
|   `-- init/                  MySQL initialization scripts
|-- docs/                      Project documentation
`-- docker-compose.yml         Local MySQL service
```
