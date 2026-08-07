import amqp, { ChannelModel, ConfirmChannel } from 'amqplib';

export interface PublishOptions {
  headers?: Record<string, unknown>;
  correlationId?: string;
  persistent?: boolean;
}

export class OutboxPublisher {
  private connectionUrl: string;
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private connecting = false;

  constructor(connectionUrl: string) {
    this.connectionUrl = connectionUrl;
  }

  public async connect(): Promise<void> {
    if (this.channel) return;
    if (this.connecting) {
      while (this.connecting) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (this.channel) return;
    }

    this.connecting = true;
    try {
      const connection = await amqp.connect(this.connectionUrl);
      const channel = await connection.createConfirmChannel();

      this.connection = connection;
      this.channel = channel;

      connection.on('error', (err) => {
        console.error('[OutboxPublisher] RabbitMQ Connection error:', err);
        this.reset();
      });

      connection.on('close', () => {
        console.warn('[OutboxPublisher] RabbitMQ Connection closed');
        this.reset();
      });

      channel.on('error', (err) => {
        console.error('[OutboxPublisher] ConfirmChannel error:', err);
        this.reset();
      });

      channel.on('close', () => {
        console.warn('[OutboxPublisher] ConfirmChannel closed');
        this.reset();
      });
    } finally {
      this.connecting = false;
    }
  }

  private reset(): void {
    this.channel = null;
    this.connection = null;
  }

  /**
   * Publishes message with publisher confirms enabled.
   * Returns a Promise that resolves when broker acknowledges receipt (ACK),
   * or rejects if NACKed or connection error occurs.
   */
  public async publishWithConfirm(
    exchange: string,
    routingKey: string,
    payload: unknown,
    options: PublishOptions = {}
  ): Promise<void> {
    await this.connect();

    if (!this.channel) {
      throw new Error('[OutboxPublisher] RabbitMQ ConfirmChannel is not established');
    }

    const content = Buffer.from(JSON.stringify(payload));
    const publishOpts = {
      persistent: options.persistent ?? true,
      correlationId: options.correlationId,
      headers: options.headers,
    };

    return new Promise<void>((resolve, reject) => {
      if (!this.channel) {
        return reject(new Error('[OutboxPublisher] Channel unavailable before publish'));
      }

      this.channel.publish(exchange, routingKey, content, publishOpts, (err, _ok) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * Checks current RabbitMQ queue message depth.
   * Returns messageCount if queue exists, or null on error.
   */
  public async getQueueDepth(queueName: string): Promise<number | null> {
    try {
      await this.connect();
      if (!this.channel) return null;
      const res = await this.channel.checkQueue(queueName);
      return res.messageCount;
    } catch {
      return null;
    }
  }

  public async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (err) {
      console.error('[OutboxPublisher] Error closing RabbitMQ connections:', err);
    } finally {
      this.reset();
    }
  }
}
