import { z } from 'zod';

export const userRoleSchema = z.enum(['gamer', 'creator', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  roles: z.array(userRoleSchema).default(['gamer']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(100),
  roles: z.array(userRoleSchema).optional(),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;
