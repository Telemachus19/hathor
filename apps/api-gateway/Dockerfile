FROM node:20.15-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global pnpm@9.0.0
WORKDIR /app
COPY . .
RUN pnpm install --filter @hathor/api-gateway... --frozen-lockfile
RUN pnpm --filter @hathor/api-gateway build

FROM node:20.15-alpine AS runtime
WORKDIR /app
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 5000
CMD ["node", "apps/api-gateway/dist/index.js"]
