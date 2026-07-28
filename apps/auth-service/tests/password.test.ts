import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/domain/password.js';

describe('password', () => {
  it('hashPassword produces an Argon2id hash that verifyPassword accepts', async () => {
    const hash = await hashPassword('SecurePass123!');

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword('SecurePass123!', hash)).toBe(true);
  });

  it('verifyPassword rejects a wrong password', async () => {
    const hash = await hashPassword('SecurePass123!');

    expect(await verifyPassword('WrongPassword!', hash)).toBe(false);
  });
});
