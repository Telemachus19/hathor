import { z } from 'zod';

export const gamePageThemeSchema = z.object({
  theme_preset: z.string().optional(),
  colors: z.object({
    background: z.string(),
    surface_card: z.string(),
    primary_accent: z.string(),
    text_primary: z.string(),
    text_secondary: z.string().optional(),
  }),
  typography: z.object({
    font_family: z.string(),
  }),
  banner: z
    .object({
      image_url: z.string().optional(),
      overlay_opacity: z.number().optional(),
    })
    .optional(),
});

export type GamePageTheme = z.infer<typeof gamePageThemeSchema>;

export const gameStatusSchema = z.enum(['draft', 'published', 'archived']);
export type GameStatus = z.infer<typeof gameStatusSchema>;

export const gameSchema = z.object({
  id: z.string().uuid(),
  creatorId: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  shortDescription: z.string(),
  fullDescription: z.string(),
  priceEgp: z.number().min(0),
  discountPercent: z.number().min(0).max(100).default(0),
  bannerUrl: z.string().url().nullable().optional(),
  screenshots: z.array(z.string()).default([]),
  trailerUrl: z.string().url().nullable().optional(),
  downloadUrl: z.string().url().nullable().optional(),
  systemRequirements: z.record(z.any()).default({}),
  pageTheme: gamePageThemeSchema.optional(),
  status: gameStatusSchema.default('published'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Game = z.infer<typeof gameSchema>;

export const createGameInputSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  shortDescription: z.string(),
  fullDescription: z.string(),
  priceEgp: z.number().min(0),
  discountPercent: z.number().min(0).max(100).optional(),
  bannerUrl: z.string().url().optional(),
  screenshots: z.array(z.string()).optional(),
  trailerUrl: z.string().url().optional(),
  systemRequirements: z.record(z.any()).optional(),
  pageTheme: gamePageThemeSchema.optional(),
});

export type CreateGameInput = z.infer<typeof createGameInputSchema>;
