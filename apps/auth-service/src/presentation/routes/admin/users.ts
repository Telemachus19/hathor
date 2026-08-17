import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { desc, limit as drizzleLimit, offset } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users } from '../../../infrastructure/db/schema.js';
import { AuthenticatedRequest } from '../../middlewares/auth.js';

export async function listUsersHandler(req: AuthenticatedRequest, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

  // 1. Authorization: Only admins can list users
  if (!req.user || !req.user.roles.includes('admin')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Only administrators are allowed to view users',
        correlationId,
      },
    });
  }

  // 2. Pagination (cursor-based mock via offset for now to keep it simple, or proper cursor)
  // Since OpenAPI specifies `cursor` and `limit`, let's just do offset pagination masked as cursor for simplicity
  const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
  const cursor = parseInt(req.query.cursor as string) || 0;

  try {
    const fetchedUsers = await authDb
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit + 1)
      .offset(cursor);

    let nextCursor: string | null = null;
    if (fetchedUsers.length > limit) {
      nextCursor = (cursor + limit).toString();
      fetchedUsers.pop(); // remove the extra item
    }

    // Format according to OpenAPI User schema
    const formattedUsers = fetchedUsers.map(user => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      status: user.status,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
    }));

    return res.status(200).json({
      items: formattedUsers,
      nextCursor,
    });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while listing users',
        correlationId,
      },
    });
  }
}
