FROM node:20.15-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global pnpm@9.0.0

WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++
RUN pnpm install --filter @hathor/web... --frozen-lockfile

ARG VITE_API_URL="http://localhost:5000/api/v1"
ARG VITE_USE_MOCK_AUTH="false"
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USE_MOCK_AUTH=$VITE_USE_MOCK_AUTH

RUN pnpm --filter @hathor/web... build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
