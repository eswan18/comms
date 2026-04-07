# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /build/dist ./dist

RUN adduser -D -u 1000 appuser
USER appuser

EXPOSE 8080

CMD ["node", "dist/index.js"]
