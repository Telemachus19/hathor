import { describe, expect, it, vi, beforeEach } from 'vitest';
import { runBootstrap } from '../src/commands/bootstrap-admin.js';

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockInsertChain = {
  values: vi.fn().mockResolvedValue([]),
};

const mockUpdateChain = {
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue([]),
};

const mockTx = {
  select: vi.fn(() => mockSelectChain),
  update: vi.fn(() => mockUpdateChain),
  insert: vi.fn(() => mockInsertChain),
};

const mockDb = {
  select: vi.fn(() => mockSelectChain),
  transaction: vi.fn((callback) => callback(mockTx)),
};

describe('One-Time Admin Bootstrap core logic', () => {
  const ENV_SECRET = 'SuperSecret123!';
  const TARGET_EMAIL = 'gamer@example.com';
  const TARGET_ID = 'gamer-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully bootstraps initial admin role when secret matches, target is found, and no other admin exists', async () => {
    // 1. First select (check if any admin exists) -> returns empty list (no admin exists yet)
    mockSelectChain.limit.mockResolvedValueOnce([]);

    // 2. Second select (find target user by email) -> returns target user
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: TARGET_ID,
        email: TARGET_EMAIL,
        roles: ['gamer'],
        authorizationVersion: 2,
      },
    ]);

    const result = await runBootstrap({
      email: TARGET_EMAIL,
      secret: ENV_SECRET,
      envSecret: ENV_SECRET,
      db: mockDb,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Successfully bootstrapped');

    // Verify transaction DB statements
    expect(mockDb.transaction).toHaveBeenCalled();
    expect(mockTx.select).toHaveBeenCalledTimes(2); // check exists + check target user
    expect(mockTx.update).toHaveBeenCalled(); // Target user update
    expect(mockUpdateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        roles: ['gamer', 'admin'],
        authorizationVersion: 3, // 2 + 1
      })
    );
    expect(mockTx.insert).toHaveBeenCalled(); // Audit trail insert
  });

  it('fails if INITIAL_ADMIN_BOOTSTRAP_SECRET is not configured in the environment', async () => {
    const result = await runBootstrap({
      email: TARGET_EMAIL,
      secret: ENV_SECRET,
      envSecret: undefined, // not set!
      db: mockDb,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('is not configured');
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  it('fails if provided secret does not match environment bootstrap secret', async () => {
    const result = await runBootstrap({
      email: TARGET_EMAIL,
      secret: 'wrong-secret-value',
      envSecret: ENV_SECRET,
      db: mockDb,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid bootstrap secret');
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  it('fails and locks subsequent runs if an admin user already exists in the database', async () => {
    // Mock check if any admin exists -> returns an existing admin user
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'existing-admin-uuid',
        email: 'admin@example.com',
        roles: ['gamer', 'admin'],
      },
    ]);

    const result = await runBootstrap({
      email: TARGET_EMAIL,
      secret: ENV_SECRET,
      envSecret: ENV_SECRET,
      db: mockDb,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Bootstrap lock: An admin user already exists');
    expect(mockDb.transaction).toHaveBeenCalled();
    expect(mockTx.select).toHaveBeenCalledTimes(1); // aborted after first check
    expect(mockTx.update).not.toHaveBeenCalled();
    expect(mockTx.insert).not.toHaveBeenCalled();
  });

  it('fails if target user by email does not exist', async () => {
    // 1. First select (check if any admin exists) -> returns empty list (no admin exists yet)
    mockSelectChain.limit.mockResolvedValueOnce([]);

    // 2. Second select (find target user by email) -> returns empty list (user not found)
    mockSelectChain.limit.mockResolvedValueOnce([]);

    const result = await runBootstrap({
      email: 'nonexistent@example.com',
      secret: ENV_SECRET,
      envSecret: ENV_SECRET,
      db: mockDb,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('was not found');
    expect(mockDb.transaction).toHaveBeenCalled();
    expect(mockTx.select).toHaveBeenCalledTimes(2); // checked both
    expect(mockTx.update).not.toHaveBeenCalled();
    expect(mockTx.insert).not.toHaveBeenCalled();
  });

  it('fails if target user is already an admin', async () => {
    // 1. First select (check if any admin exists) -> returns empty list (no admin exists yet)
    mockSelectChain.limit.mockResolvedValueOnce([]);

    // 2. Second select (find target user by email) -> returns target user who is already admin
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: TARGET_ID,
        email: TARGET_EMAIL,
        roles: ['gamer', 'admin'],
        authorizationVersion: 2,
      },
    ]);

    const result = await runBootstrap({
      email: TARGET_EMAIL,
      secret: ENV_SECRET,
      envSecret: ENV_SECRET,
      db: mockDb,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('is already an admin');
    expect(mockDb.transaction).toHaveBeenCalled();
    expect(mockTx.select).toHaveBeenCalledTimes(2); // checked both
    expect(mockTx.update).not.toHaveBeenCalled();
    expect(mockTx.insert).not.toHaveBeenCalled();
  });
});
