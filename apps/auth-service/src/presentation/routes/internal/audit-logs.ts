import { Request, Response } from 'express';
import { desc } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { roleChangeAudit } from '../../../infrastructure/db/schema.js';

export async function auditLogsHandler(req: Request, res: Response) {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    
    const logs = await authDb
      .select()
      .from(roleChangeAudit)
      .orderBy(desc(roleChangeAudit.timestamp))
      .limit(limit);

    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp ? log.timestamp.toISOString() : new Date().toISOString(),
      actorId: log.actorId,
      targetId: log.targetId,
      action: 'role_change',
      details: {
        change: log.change,
        authorizationVersion: log.authorizationVersion,
      },
      service: 'auth-service'
    }));

    res.json({ items: formattedLogs });
  } catch (error) {
    console.error('Fetch auth audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}
