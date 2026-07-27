import { generateKeyPairSync, createHash } from 'node:crypto';

export interface KeyPair {
  publicKeyPem: string;
  privateKeyPem: string;
  kid: string;
}

let cachedKeyPair: KeyPair | null = null;

export function getKeyPair(): KeyPair {
  if (cachedKeyPair) {
    return cachedKeyPair;
  }

  const envPrivateKey = process.env.JWT_PRIVATE_KEY;
  const envPublicKey = process.env.JWT_PUBLIC_KEY;

  let privateKeyPem: string;
  let publicKeyPem: string;

  if (envPrivateKey && envPublicKey) {
    privateKeyPem = envPrivateKey.replace(/\\n/g, '\n');
    publicKeyPem = envPublicKey.replace(/\\n/g, '\n');
  } else {
    // Generate secure 2048-bit RSA key pair dynamically
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    privateKeyPem = privateKey;
    publicKeyPem = publicKey;
  }

  // Generate a deterministic key identifier (kid) from the public key SHA-256 hash
  const kid = createHash('sha256').update(publicKeyPem).digest('hex');

  cachedKeyPair = {
    publicKeyPem,
    privateKeyPem,
    kid,
  };

  return cachedKeyPair;
}
