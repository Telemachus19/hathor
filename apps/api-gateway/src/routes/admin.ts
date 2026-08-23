import { Router, Request, Response } from 'express';

export const adminRouter: Router = Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';

adminRouter.get('/audit-logs', async (req: Request, res: Response) => {
  const correlationId = req.correlationId || 'unknown';
  const limit = req.query.limit || 50;

  try {
    const [authRes, catalogRes] = await Promise.all([
      fetch(`${AUTH_SERVICE_URL}/internal/v1/auth/audit-logs?limit=${limit}`, {
        headers: { 'x-correlation-id': correlationId },
      }).catch((err) => {
        console.error('Failed to fetch auth audit logs:', err);
        return { ok: false, json: async () => ({ items: [] }) };
      }),
      fetch(`${CATALOG_SERVICE_URL}/internal/v1/catalog/audit-logs?limit=${limit}`, {
        headers: { 'x-correlation-id': correlationId },
      }).catch((err) => {
        console.error('Failed to fetch catalog audit logs:', err);
        return { ok: false, json: async () => ({ items: [] }) };
      }),
    ]);

    const authData = authRes.ok ? await (authRes as any).json() : { items: [] };
    const catalogData = catalogRes.ok ? await (catalogRes as any).json() : { items: [] };

    // Map auth logs to match CatalogAuditLog schema
    const mappedAuthLogs = (authData.items || []).map((log: any) => ({
      id: log.id,
      actorId: log.actorId,
      targetType: 'user', // Mapping auth target to user
      targetId: log.targetId,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp,
    }));

    const mappedCatalogLogs = (catalogData.items || []).map((log: any) => ({
      id: log.id,
      actorId: log.actorId,
      targetType: log.targetType || 'game',
      targetId: log.targetId,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp,
    }));

    const allLogs = [...mappedAuthLogs, ...mappedCatalogLogs];

    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply the combined limit
    const finalLogs = allLogs.slice(0, Number(limit));

    res.json({ items: finalLogs });
  } catch (error) {
    console.error('Audit logs aggregation error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to aggregate audit logs' },
    });
  }
});
