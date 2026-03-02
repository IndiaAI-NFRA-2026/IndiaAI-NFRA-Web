FROM node:20-alpine AS base
RUN apk add --no-cache g++ git libc6-compat make python3
WORKDIR /app

# Enable yarn via corepack (use yarn 1.x to match lockfile version)
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nextjs

COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
