# TripJot Backend API

<p align="center">
  <strong>A modern, production-ready REST API for trip itinerary planning</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM">
</p>

---

## Overview

TripJot Backend is a RESTful API service that powers the TripJot itinerary planning application. It provides comprehensive endpoints for managing trips, activities, and user authentication with a focus on security, performance, and developer experience.

## Features

- 🔐 **Authentication & Authorization** — JWT-based auth with access/refresh token flow
- 🗓️ **Trip Management** — Create, update, delete, and organize travel itineraries
- 📍 **Activity Planning** — Schedule and manage activities within trips
- 👤 **User Management** — User registration, profile management, and preferences
- 📖 **API Documentation** — Auto-generated Swagger/OpenAPI documentation
- 🏥 **Health Checks** — Built-in health monitoring endpoints
- 🐳 **Docker Ready** — Multi-stage Dockerfile for production deployment
- ✅ **Fully Tested** — Unit tests and E2E tests with high coverage

## Tech Stack

| Category        | Technology                               |
| --------------- | ---------------------------------------- |
| Framework       | [NestJS](https://nestjs.com/) v11        |
| Language        | TypeScript 5.7                           |
| Database        | PostgreSQL                               |
| ORM             | [Drizzle ORM](https://orm.drizzle.team/) |
| Authentication  | JWT (Access + Refresh tokens)            |
| Validation      | class-validator, class-transformer       |
| API Docs        | Swagger / OpenAPI                        |
| Testing         | Jest, Supertest, Testcontainers          |
| Package Manager | pnpm                                     |

## Prerequisites

- **Node.js** >= 22
- **pnpm** >= 9 (or use `corepack enable`)
- **PostgreSQL** >= 14
- **Docker** (optional, for containerized deployment)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd itinerary-planner-be
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

| Variable                 | Description                  | Example                                         |
| ------------------------ | ---------------------------- | ----------------------------------------------- |
| `NODE_ENV`               | Environment mode             | `development`                                   |
| `PORT`                   | Server port                  | `3000`                                          |
| `DATABASE_URL`           | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/tripjot` |
| `JWT_SECRET`             | Secret for access tokens     | `your_jwt_secret_key`                           |
| `JWT_EXPIRES_IN`         | Access token TTL (seconds)   | `3600`                                          |
| `JWT_REFRESH_SECRET`     | Secret for refresh tokens    | `your_jwt_refresh_secret`                       |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL            | `7d`                                            |
| `FRONTEND_URL`           | Frontend app URL (CORS)      | `http://localhost:5173`                         |

### 4. Run Database Migrations

```bash
pnpm drizzle-kit push
```

### 5. Start the Development Server

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000`.

## API Documentation

Once the server is running, access the interactive Swagger documentation at:

```
http://localhost:3000/api
```

## Available Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `pnpm run start:dev`  | Start development server with hot-reload |
| `pnpm run start:prod` | Start production server                  |
| `pnpm run build`      | Build for production                     |
| `pnpm run lint`       | Run ESLint with auto-fix                 |
| `pnpm run format`     | Format code with Prettier                |
| `pnpm run test`       | Run unit tests                           |
| `pnpm run test:cov`   | Run tests with coverage report           |
| `pnpm run test:e2e`   | Run end-to-end tests                     |
| `pnpm run validate`   | Run lint, tests, and build (CI pipeline) |

## Project Structure

```
src/
├── config/           # Configuration module
├── decorators/       # Custom decorators
├── filters/          # Exception filters
├── guards/           # Auth guards
├── middlewares/      # Custom middleware
├── modules/
│   ├── activities/   # Activity management
│   ├── auth/         # Authentication & authorization
│   ├── health/       # Health check endpoints
│   ├── trips/        # Trip management
│   └── users/        # User management
├── types/            # TypeScript type definitions
├── app.module.ts     # Root application module
├── database.module.ts# Database connection module
└── main.ts           # Application entry point
```

## Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t tripjot-api .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/tripjot" \
  -e JWT_SECRET="your_secret" \
  -e JWT_REFRESH_SECRET="your_refresh_secret" \
  tripjot-api
```

Or use Docker Compose (recommended for local development with PostgreSQL).

## Testing

The project uses Jest for testing with Testcontainers for E2E tests.

```bash
# Run all unit tests
pnpm run test

# Run unit tests with coverage
pnpm run test:cov

# Run E2E tests (requires Docker)
pnpm run test:e2e
```

## CI/CD

This project includes GitHub Actions workflows for:

- **Linting** — Code style and quality checks
- **Unit Tests** — Automated testing with coverage
- **E2E Tests** — Integration tests with Testcontainers
- **Docker Build** — Container image building and publishing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
