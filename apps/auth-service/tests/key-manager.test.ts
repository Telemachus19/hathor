import { describe, expect, it } from 'vitest';
import { getKeyPair } from '../src/infrastructure/keys/key-manager.js';

describe('Key Manager', () => {
  it('should load/generate a valid RSA keypair with a deterministic kid', () => {
    const keyPair1 = getKeyPair();

    expect(keyPair1.privateKeyPem).toContain('-----BEGIN PRIVATE KEY-----');
    expect(keyPair1.publicKeyPem).toContain('-----BEGIN PUBLIC KEY-----');
    expect(keyPair1.kid).toBeDefined();
    expect(typeof keyPair1.kid).toBe('string');

    // Repeated call should return cached key pair
    const keyPair2 = getKeyPair();
    expect(keyPair2.publicKeyPem).toBe(keyPair1.publicKeyPem);
    expect(keyPair2.privateKeyPem).toBe(keyPair1.privateKeyPem);
    expect(keyPair2.kid).toBe(keyPair1.kid);
  });
});
