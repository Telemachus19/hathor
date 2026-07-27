import { Request, Response } from 'express';
import { createPublicKey } from 'node:crypto';
import { getKeyPair } from '../../../infrastructure/keys/key-manager.js';

export function jwksHandler(_req: Request, res: Response) {
  const { publicKeyPem, kid } = getKeyPair();
  const keyObject = createPublicKey(publicKeyPem);
  const jwk = keyObject.export({ format: 'jwk' });

  return res.status(200).json({
    keys: [
      {
        kty: jwk.kty,
        use: 'sig',
        alg: 'RS256',
        kid,
        n: jwk.n,
        e: jwk.e,
      },
    ],
  });
}
