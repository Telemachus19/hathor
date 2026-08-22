FROM node:24-bookworm-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global pnpm@9.0.0
WORKDIR /app
COPY . .
RUN pnpm install --filter @hathor/library-service... --frozen-lockfile
RUN pnpm --filter @hathor/library-service... build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 5004
CMD ["node", "apps/library-service/dist/index.js"]
