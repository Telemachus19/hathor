FROM node:20.15-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global pnpm@9.0.0
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++
RUN pnpm install --filter @hathor/ai-service...
RUN pnpm --filter @hathor/ai-service... build

FROM node:20.15-alpine AS runtime
WORKDIR /app
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 5005
CMD ["node", "apps/ai-service/dist/index.js"]
