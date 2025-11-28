# HerCircle Shield Backend Dockerfile

FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
