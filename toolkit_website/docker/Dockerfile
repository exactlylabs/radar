# Dockerfile Took from https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps

RUN apt update && apt install libc6-dev -y
WORKDIR /app


COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder

ARG SMTP_AUTH_USER
ARG SMTP_AUTH_PASSWORD
ARG ENVIRONMENT

ENV SMTP_AUTH_USER=$SMTP_AUTH_USER
ENV SMTP_AUTH_PASSWORD=$SMTP_AUTH_PASSWORD
ENV NODE_ENV production
ENV NEXT_PUBLIC_APP_ENV ${ENVIRONMENT}
ENV REACT_APP_ENV ${ENVIRONMENT}

RUN apt update && apt install libc6-dev -y

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PRIVATE_STANDALONE true

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app


ARG SMTP_AUTH_USER
ARG SMTP_AUTH_PASSWORD
ARG ENVIRONMENT

ENV SMTP_AUTH_USER=$SMTP_AUTH_USER
ENV SMTP_AUTH_PASSWORD=$SMTP_AUTH_PASSWORD
ENV NODE_ENV production
ENV NEXT_PUBLIC_APP_ENV ${ENVIRONMENT}
ENV REACT_APP_ENV ${ENVIRONMENT}

# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
