# Base stage
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Install build dependencies for native modules (like bcrypt)
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml ./
# Install ALL dependencies (including devDependencies) for building
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm run build

# Prune dev dependencies to keep the image small
RUN pnpm prune --prod --ignore-scripts

# Runner stage
FROM node:22-alpine AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy only the necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
