import { Router, Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireUserAuth, AuthenticatedUserRequest } from '../middleware/auth.js';
import { libraryDb } from '../infrastructure/db/client.js';
import { userLicenses, entitlementAudit } from '../infrastructure/db/schema.js';
import { getPublishedBuild, DependencyUnavailableError } from '../infrastructure/clients/catalog.js';
import { s3Client, R2_BUCKET_NAME } from '../infrastructure/storage/r2Client.js';

const router: Router = Router();

// GET /inventory/check/:gameId (OpenAPI spec: checkLibraryOwnership)
router.get(
  '/check/:gameId',
  requireUserAuth,
  async (req: AuthenticatedUserRequest, res: Response) => {
    const userId = req.user!.id;
    const { gameId } = req.params;

    try {
      const [license] = await libraryDb
        .select({ gameId: userLicenses.gameId })
        .from(userLicenses)
        .where(and(eq(userLicenses.userId, userId), eq(userLicenses.gameId, gameId)))
        .limit(1);

      return res.status(200).json({
        gameId,
        owned: Boolean(license),
      });
    } catch (error) {
      console.error(`Error checking ownership for game ${gameId}:`, error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check game ownership',
        },
      });
    }
  }
);

// GET /inventory/apps (OpenAPI spec: listLibraryGames)
router.get('/apps', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const licenses = await libraryDb
      .select()
      .from(userLicenses)
      .where(eq(userLicenses.userId, userId));

    return res.status(200).json({
      success: true,
      data: {
        items: licenses.map((l) => ({
          gameId: l.gameId,
          sourceOrderId: l.sourceOrderId,
          pricePaidEgp: l.pricePaidEgp,
          currency: l.currency,
          acquiredAt: l.acquiredAt ? l.acquiredAt.toISOString() : new Date().toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching user library apps:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch library games',
      },
    });
  }
});

// POST /inventory/games/:gameId/download (OpenAPI spec: issueDownloadToken / download token endpoint)
router.post(
  '/games/:gameId/download',
  requireUserAuth,
  async (req: AuthenticatedUserRequest, res: Response) => {
    const userId = req.user!.id;
    const { gameId } = req.params;
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!gameId || !UUID_REGEX.test(gameId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid gameId format (must be a valid UUID)',
          correlationId,
        },
      });
    }

    try {
      // 1. Verify caller license entitlement in library_db
      const [license] = await libraryDb
        .select({ gameId: userLicenses.gameId })
        .from(userLicenses)
        .where(and(eq(userLicenses.userId, userId), eq(userLicenses.gameId, gameId)))
        .limit(1);

      if (!license) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'User does not own this game',
            correlationId,
          },
        });
      }

      // 2. Fetch build metadata from catalog-service and ensure publication state is published
      let buildMetadata;
      try {
        buildMetadata = await getPublishedBuild(gameId, correlationId);
      } catch (error: any) {
        if (error.message === 'GAME_SUSPENDED_OR_REVOKED') {
          return res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'Game publication is suspended',
              correlationId,
            },
          });
        }
        throw error;
      }

      if (!buildMetadata) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'No published build found for this game',
            correlationId,
          },
        });
      }

      // 3. Generate presigned URL with short TTL (90 seconds, between 60-120 seconds)
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: buildMetadata.objectKey,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 90,
      });

      const expiresAt = new Date(Date.now() + 90 * 1000);

      // 4. Log download-authorization evidence in entitlement_audit
      await libraryDb.insert(entitlementAudit).values({
        userId,
        gameId,
        action: 'download_authorized',
        actor: 'user',
        correlationId,
      });

      // 5. Return presigned URL, expiration, and recorded SHA-256
      return res.status(200).json({
        url: presignedUrl,
        expiresAt: expiresAt.toISOString(),
        sha256: buildMetadata.sha256,
      });
    } catch (error: any) {
      console.error(`Error generating download token for game ${gameId}:`, error);
      const isUnavailable = error instanceof DependencyUnavailableError;
      return res.status(isUnavailable ? 503 : 500).json({
        error: {
          code: isUnavailable ? 'DEPENDENCY_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to authorize download',
          correlationId,
        },
      });
    }
  }
);

export default router;
