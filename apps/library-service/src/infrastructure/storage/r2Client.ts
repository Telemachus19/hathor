import { S3Client } from '@aws-sdk/client-s3';

const activeEndpoint = process.env.R2_ENDPOINT || 'http://127.0.0.1:9000';
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

export const s3Client = createS3Client(activeEndpoint);
export const R2_BUCKET_NAME = bucketName;
