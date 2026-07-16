FROM node:20.15-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global pnpm@9.0.0

WORKDIR /app
COPY . .
RUN pnpm install \
  --filter @hathor/auth-service... \
  --filter @hathor/catalog-service... \
  --filter @hathor/commerce-service... \
  --filter @hathor/library-service... \
  --frozen-lockfile

USER node
