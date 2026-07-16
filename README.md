# Hathor

Hathor is a pnpm/Turborepo workspace containing an API gateway, four independently deployable domain services, and a web application.

## Workspace

```text
apps/
  api-gateway/
  auth-service/
  catalog-service/
  commerce-service/
  library-service/
  web/
packages/
  contracts/       Transport-only HTTP and event types
```

Each domain service owns its database client, Drizzle schema, migration configuration, and seed data. Cross-service identifiers are opaque UUIDs; services must not import another service's schema or connect to another service's database.

## Local Topology

The default Compose project starts 13 services:

- Web and API gateway, bound only to `127.0.0.1`.
- Auth, catalog, commerce, and library services on the private backend network.
- One PostgreSQL container and named volume per domain service.
- RabbitMQ, Redis, and Memcached on the private backend network.

PostgreSQL, RabbitMQ, Redis, Memcached, and domain application ports are not published to the host.

## Setup

An ignored `.env` is required. Use `.env.example` as the variable inventory and assign unique local values. Passwords used inside database URLs must be URL-safe.

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm verify:topology
docker compose up --build --wait
corepack pnpm db:migrate
corepack pnpm db:seed
```

The public local endpoints are:

- Web: `http://localhost:3000`
- Gateway: `http://localhost:5000`
- Gateway liveness: `http://localhost:5000/health/live`
- Gateway readiness: `http://localhost:5000/health/ready`

Inspect status without exposing private ports:

```powershell
docker compose ps
docker compose exec auth-service node -e "fetch('http://127.0.0.1:5001/health/ready').then(async r => console.log(r.status, await r.text()))"
docker compose exec catalog-service node -e "fetch('http://127.0.0.1:5002/health/ready').then(async r => console.log(r.status, await r.text()))"
docker compose exec commerce-service node -e "fetch('http://127.0.0.1:5003/health/ready').then(async r => console.log(r.status, await r.text()))"
docker compose exec library-service node -e "fetch('http://127.0.0.1:5004/health/ready').then(async r => console.log(r.status, await r.text()))"
```

Stop containers while retaining service data with `docker compose down`. Remove local data only when an intentional clean reset is needed with `docker compose down --volumes`.

## Validation

```powershell
corepack pnpm typecheck
corepack pnpm build
corepack pnpm verify:topology
```

`verify:topology` checks the expected service set, private port policy, health checks, backend network isolation, distinct database URLs, and four independent PostgreSQL volumes.
