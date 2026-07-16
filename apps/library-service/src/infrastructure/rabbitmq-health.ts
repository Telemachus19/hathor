import net from 'node:net';

export function checkRabbitMq(urlValue: string, timeoutMs = 1000): Promise<void> {
  const url = new URL(urlValue);
  const port = Number(url.port || 5672);

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: url.hostname, port });
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (error) reject(error);
      else resolve();
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish());
    socket.once('timeout', () => finish(new Error('RabbitMQ readiness check timed out')));
    socket.once('error', (error) => finish(error));
  });
}
