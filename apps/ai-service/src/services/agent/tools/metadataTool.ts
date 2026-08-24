import type { GameMetadataResult } from '../types.js';

export async function fetchGameMetadata(
  gameId: string,
  catalogServiceUrl: string,
  authToken?: string
): Promise<GameMetadataResult> {
  const fallbackDraft: GameMetadataResult = {
    title: 'UNTITLED GAME DRAFT',
    genre: 'Action RPG',
    shortDescription: 'An immersive new indie game experience.',
    tags: ['Indie', 'Action', 'Atmospheric'],
    bannerUrl: '',
    screenshots: [],
  };

  if (!gameId || gameId === 'draft' || gameId === 'draft_new_game') {
    return fallbackDraft;
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    // Try fetching from creator endpoint first (with auth), or fallback to store endpoint
    let res = await fetch(`${catalogServiceUrl}/creator/games/${encodeURIComponent(gameId)}`, {
      headers,
    });
    if (!res.ok) {
      res = await fetch(`${catalogServiceUrl}/store/games/${encodeURIComponent(gameId)}`, {
        headers,
      });
    }

    if (res.ok) {
      const data: any = await res.json();
      const game = data.data || data.game || data;
      return {
        id: game.id,
        title: game.title || 'UNTITLED GAME DRAFT',
        genre: game.genreName || game.genre?.name || game.category || 'Action RPG',
        shortDescription:
          game.shortDescription || game.description || 'An immersive new indie game experience.',
        fullDescription: game.fullDescription || '',
        priceEgp: game.priceEgp,
        bannerUrl: game.bannerUrl || game.coverUrl || '',
        screenshots: Array.isArray(game.screenshots) ? game.screenshots : [],
        tags: Array.isArray(game.tags)
          ? game.tags.map((t: any) => (typeof t === 'string' ? t : t.name))
          : ['Indie', 'Action', 'Atmospheric'],
      };
    }

    return fallbackDraft;
  } catch (err: any) {
    console.warn(`[AI Theme Agent] Could not fetch game metadata for ${gameId}:`, err.message);
    return fallbackDraft;
  }
}
