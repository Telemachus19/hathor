import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = process.cwd();
const defPath = path.join(rootDir, 'docker/rabbitmq/definitions.json');
const asyncApiPath = path.join(
  rootDir,
  'packages/contracts/asyncapi/domain-events.asyncapi.yaml'
);

console.log('Verifying RabbitMQ declarative topology definitions...');

if (!fs.existsSync(defPath)) {
  throw new Error(`RabbitMQ definitions file missing at ${defPath}`);
}

const defs = JSON.parse(fs.readFileSync(defPath, 'utf8'));

// 1. Verify Exchanges
const requiredExchanges = [
  { name: 'hathor.domain.events', type: 'topic', durable: true },
  { name: 'hathor.dlx', type: 'topic', durable: true },
  { name: 'hathor.retry', type: 'topic', durable: true },
];

for (const reqEx of requiredExchanges) {
  const found = defs.exchanges?.find((e) => e.name === reqEx.name);
  if (!found) {
    throw new Error(`Missing exchange: ${reqEx.name}`);
  }
  if (found.type !== reqEx.type) {
    throw new Error(`Exchange ${reqEx.name} expected type ${reqEx.type}, got ${found.type}`);
  }
  if (found.durable !== reqEx.durable) {
    throw new Error(`Exchange ${reqEx.name} expected durable=${reqEx.durable}`);
  }
}
console.log('✓ All required exchanges verified (hathor.domain.events, hathor.dlx, hathor.retry)');

// 2. Verify Queues & Dead Letter / Retry Arguments
const requiredQueues = [
  {
    name: 'library.order-paid.queue',
    durable: true,
    dlx: 'hathor.retry',
  },
  {
    name: 'library.order-paid-retry.queue',
    durable: true,
    ttl: 5000,
    dlx: 'hathor.domain.events',
  },
  {
    name: 'hathor.dlq',
    durable: true,
  },
];

for (const reqQ of requiredQueues) {
  const found = defs.queues?.find((q) => q.name === reqQ.name);
  if (!found) {
    throw new Error(`Missing queue: ${reqQ.name}`);
  }
  if (found.durable !== reqQ.durable) {
    throw new Error(`Queue ${reqQ.name} expected durable=${reqQ.durable}`);
  }
  if (reqQ.dlx && found.arguments?.['x-dead-letter-exchange'] !== reqQ.dlx) {
    throw new Error(
      `Queue ${reqQ.name} expected x-dead-letter-exchange ${reqQ.dlx}, got ${found.arguments?.['x-dead-letter-exchange']}`
    );
  }
  if (reqQ.ttl && found.arguments?.['x-message-ttl'] !== reqQ.ttl) {
    throw new Error(
      `Queue ${reqQ.name} expected x-message-ttl ${reqQ.ttl}, got ${found.arguments?.['x-message-ttl']}`
    );
  }
}
console.log('✓ All required queues verified with retry TTLs & Dead Letter Exchanges');

// 3. Verify Bindings
const requiredBindings = [
  {
    source: 'hathor.domain.events',
    destination: 'library.order-paid.queue',
    routing_key: 'commerce.order.paid.v1',
  },
  {
    source: 'hathor.retry',
    destination: 'library.order-paid-retry.queue',
    routing_key: 'library.order-paid.retry',
  },
  {
    source: 'hathor.dlx',
    destination: 'hathor.dlq',
    routing_key: '#',
  },
];

for (const reqB of requiredBindings) {
  const found = defs.bindings?.find(
    (b) =>
      b.source === reqB.source &&
      b.destination === reqB.destination &&
      b.routing_key === reqB.routing_key
  );
  if (!found) {
    throw new Error(
      `Missing binding: ${reqB.source} -> ${reqB.destination} (${reqB.routing_key})`
    );
  }
}
console.log('✓ All exchange & queue bindings verified against topology specification');

// 4. Verify AsyncAPI Spec Alignment
if (fs.existsSync(asyncApiPath)) {
  const asyncApiDoc = yaml.load(fs.readFileSync(asyncApiPath, 'utf8'));
  const channelKey = 'hathor.domain.events/commerce.order.paid.v1';
  const channel = asyncApiDoc?.channels?.[channelKey];

  if (!channel) {
    throw new Error(`AsyncAPI missing channel ${channelKey}`);
  }

  const exchangeName =
    channel?.bindings?.amqp?.exchange?.name ||
    channel?.publish?.bindings?.amqp?.exchange?.name;
  if (exchangeName !== 'hathor.domain.events') {
    throw new Error(`AsyncAPI exchange mismatch: expected hathor.domain.events, got ${exchangeName}`);
  }
  console.log('✓ AsyncAPI domain-events contract alignment confirmed');
}

console.log('\nRabbitMQ topology, exchanges, queues, DLQs, and persistent configs verified successfully!');
