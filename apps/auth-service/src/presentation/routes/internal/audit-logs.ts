import { Request, Response } from 'express';
import { desc } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { roleChangeAudit } from '../../../infrastructure/db/schema.js';

export async function auditLogsHandler(req: Request, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || '';
  const credentialHeader = req.headers['x-hathor-service-credential'] as string;
  const expectedCatalogSecret =
    process.env.CATALOG_SERVICE_SECRET || 'catalog-service-secret-phrase';

  if (!credentialHeader || credentialHeader !== `catalog-service:${expectedCatalogSecret}`) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid or missing service credential',
        correlationId,
      },
    });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);

    const logs = await authDb
      .select()
      .from(roleChangeAudit)
      .orderBy(desc(roleChangeAudit.timestamp))
      .limit(limit);

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp ? log.timestamp.toISOString() : new Date().toISOString(),
      actorId: log.actorId,
      targetId: log.targetId,
      action: 'role_change',
      details: {
        change: log.change,
        authorizationVersion: log.authorizationVersion,
      },
      service: 'auth-service',
    }));

    res.json({ items: formattedLogs });
  } catch (error) {
    console.error('Fetch auth audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}
