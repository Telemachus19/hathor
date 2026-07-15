FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @hathor/auth-service build

EXPOSE 5001
CMD ["node", "apps/auth-service/dist/index.js"]
