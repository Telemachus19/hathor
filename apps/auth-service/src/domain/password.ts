import { argon2id, hash, verify, type HashOptions } from 'argon2';

const ARGON2ID_OPTIONS: HashOptions = {
  type: argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2ID_OPTIONS);
}

export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  try {
    return await verify(storedHash, plain);
  } catch {
    return false;
  }
}
