import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { createHash } from 'node:crypto';

let activeEndpoint = process.env.R2_ENDPOINT || 'http://minio:9000';
const bucketName = process.env.R2_BUCKET_NAME || 'hathor-builds';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'hathor_r2_admin';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'hathor_r2_secret_key_2026';
const region = process.env.R2_REGION || 'auto';

export function createS3Client(targetEndpoint: string): S3Client {
  return new S3Client({
    endpoint: targetEndpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export let r2Client = createS3Client(activeEndpoint);

export const R2_BUCKET_NAME = bucketName;

async function sendWithFallback<T>(commandFn: (client: S3Client) => Promise<T>): Promise<T> {
  try {
    return await commandFn(r2Client);
  } catch (err: any) {
    if (err?.code === 'ECONNREFUSED' && activeEndpoint.includes('127.0.0.1')) {
      activeEndpoint = 'http://minio:9000';
      r2Client = createS3Client(activeEndpoint);
      return await commandFn(r2Client);
    }
    throw err;
  }
}

export async function ensureR2Bucket(): Promise<void> {
  try {
    await sendWithFallback((c) => c.send(new HeadBucketCommand({ Bucket: bucketName })));
  } catch {
    try {
      await sendWithFallback((c) => c.send(new CreateBucketCommand({ Bucket: bucketName })));
    } catch (createErr) {
      console.warn(`Bucket creation warning for ${bucketName}:`, createErr);
    }
  }

  try {
    await sendWithFallback((c) =>
      c.send(
        new PutBucketCorsCommand({
          Bucket: bucketName,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'HEAD'],
                AllowedOrigins: ['*'],
                ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
              },
            ],
          },
        })
      )
    );
  } catch (corsErr: any) {
    if (corsErr?.Code !== 'NotImplemented' && corsErr?.$metadata?.httpStatusCode !== 501) {
      console.warn(`CORS configuration warning for ${bucketName}:`, corsErr);
    }
  }
}

export function computeSha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export interface UploadBuildOptions {
  objectKey: string;
  buffer: Buffer;
  contentType?: string;
}

export async function uploadGameBuildPackage({
  objectKey,
  buffer,
  contentType = 'application/zip',
}: UploadBuildOptions): Promise<{ checksumSha256: string; sizeBytes: number; objectKey: string }> {
  await ensureR2Bucket();

  const checksumSha256 = computeSha256(buffer);
  const sizeBytes = buffer.length;

  await sendWithFallback((c) =>
    c.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          'sha256-checksum': checksumSha256,
        },
      })
    )
  );

  return { checksumSha256, sizeBytes, objectKey };
}

export async function checkBuildObjectExists(objectKey: string): Promise<boolean> {
  try {
    await sendWithFallback((c) =>
      c.send(new HeadObjectCommand({ Bucket: bucketName, Key: objectKey }))
    );
    return true;
  } catch {
    return false;
  }
}
