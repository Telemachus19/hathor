import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users, roleChangeAudit } from '../../../infrastructure/db/schema.js';
import { AuthenticatedRequest } from '../../middlewares/auth.js';

export async function changeRolesHandler(req: AuthenticatedRequest, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { userId } = req.params;
  const { roles } = req.body;

  // 1. Authorization: Only admins can change roles
  if (!req.user || !req.user.roles.includes('admin')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Only administrators are allowed to modify user roles',
        correlationId,
      },
    });
  }

  // 2. Validate userId path parameter (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid user ID format. Must be a valid UUID.',
        correlationId,
      },
    });
  }

  // 3. Validate roles input structure
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Roles must be a non-empty array of strings',
        correlationId,
      },
    });
  }

  // Validate allowed roles enum values
  const allowedRoles = ['gamer', 'creator', 'admin'];
  const isValidRoles = roles.every((role) => typeof role === 'string' && allowedRoles.includes(role));
  if (!isValidRoles) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid roles provided. Allowed roles: gamer, creator, admin',
        correlationId,
      },
    });
  }

  try {
    const updatedUser = await authDb.transaction(async (tx) => {
      // 4. Fetch target user
      const [targetUser] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!targetUser) {
        throw new Error('USER_NOT_FOUND');
      }

      const nextAuthVersion = targetUser.authorizationVersion + 1;

      // 5. Update user's roles and increment authorization_version
      const [updated] = await tx
        .update(users)
        .set({
          roles,
          authorizationVersion: nextAuthVersion,
        })
        .where(eq(users.id, userId))
        .returning();

      // 6. Write immutable record to role_change_audit
      const changeDesc = `Roles updated from [${targetUser.roles.join(', ')}] to [${roles.join(', ')}]`;
      await tx.insert(roleChangeAudit).values({
        actorId: req.user!.id,
        targetId: userId,
        change: changeDesc,
        authorizationVersion: nextAuthVersion,
        correlationId,
      });

      return updated;
    });

    return res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      roles: updatedUser.roles,
    });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: `User with ID ${userId} was not found`,
          correlationId,
        },
      });
    }

    console.error('Role change error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during role modification',
        correlationId,
      },
    });
  }
}
