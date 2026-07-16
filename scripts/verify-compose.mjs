import { execFileSync } from 'node:child_process';

const expectedServices = new Set([
  'api-gateway',
  'auth-postgres',
  'auth-service',
  'catalog-postgres',
  'catalog-service',
  'commerce-postgres',
  'commerce-service',
  'library-postgres',
  'library-service',
  'memcached',
  'rabbitmq',
  'redis',
  'web',
]);

const postgresServices = [
  'auth-postgres',
  'catalog-postgres',
  'commerce-postgres',
  'library-postgres',
];
const domainServices = ['auth-service', 'catalog-service', 'commerce-service', 'library-service'];

const output = execFileSync('docker', ['compose', 'config', '--format', 'json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});
const config = JSON.parse(output);
const actualServices = new Set(Object.keys(config.services));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  actualServices.size === expectedServices.size,
  'Compose must define exactly 13 M1.1 services'
);
for (const service of expectedServices) {
  assert(actualServices.has(service), `Missing Compose service: ${service}`);
}

for (const [name, service] of Object.entries(config.services)) {
  const hasPublishedPorts = Array.isArray(service.ports) && service.ports.length > 0;
  assert(
    !hasPublishedPorts || name === 'api-gateway' || name === 'web',
    `${name} must not publish host ports`
  );
  assert(service.healthcheck, `${name} must define a health check`);
}

const postgresVolumes = new Set();
for (const name of postgresServices) {
  const service = config.services[name];
  const dataVolume = service.volumes.find((volume) => volume.target === '/var/lib/postgresql/data');
  assert(dataVolume?.type === 'volume', `${name} must use a named data volume`);
  postgresVolumes.add(dataVolume.source);
  assert(!service.ports, `${name} must remain private`);
}
assert(postgresVolumes.size === 4, 'Each PostgreSQL service must use a distinct volume');

const databaseUrls = new Set();
for (const name of domainServices) {
  const service = config.services[name];
  const key = `${name.split('-')[0].toUpperCase()}_DB_URL`;
  const databaseUrl = service.environment[key];
  assert(databaseUrl, `${name} must receive only its service database URL`);
  assert(
    !databaseUrl.includes('hathor_admin'),
    `${name} must not receive a database admin credential`
  );
  databaseUrls.add(databaseUrl);
}
assert(databaseUrls.size === 4, 'Domain services must use distinct database credentials and hosts');
assert(config.networks.backend.internal === true, 'The backend network must be internal');

console.log('Compose topology satisfies the M1.1 static acceptance checks.');
