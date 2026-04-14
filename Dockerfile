FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm i
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
COPY --from=builder /app/migrate.mjs ./migrate.mjs
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/server/db/migrations ./server/db/migrations
COPY --from=builder /app/server/db/schema.ts ./server/db/schema.ts
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]