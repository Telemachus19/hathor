export interface SystemReqSpec {
  os: string[];
  cpu: string;
  gpu: string;
  ram: string;
  storageNum: string;
  storageSuffix: 'GB' | 'MB';
}

export interface GameInfoDraft {
  id: string;
  status: 'draft' | 'published';
  title: string;
  shortDesc: string;
  priceEgp: string;
  genre: string;
  tags: string[];
  bannerUrl: string;
  trailerUrl: string;
  minReq: SystemReqSpec;
  recReq: SystemReqSpec;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'hathor_game_info_draft_current';
const DRAFTS_LIST_KEY = 'hathor_game_info_drafts';

export const EMPTY_GAME_DRAFT: GameInfoDraft = {
  id: 'draft_new_game',
  status: 'draft',
  title: '',
  shortDesc: '',
  priceEgp: '',
  genre: '',
  tags: [],
  bannerUrl: '',
  trailerUrl: '',
  minReq: {
    os: [],
    cpu: '',
    gpu: '',
    ram: '',
    storageNum: '',
    storageSuffix: 'GB',
  },
  recReq: {
    os: [],
    cpu: '',
    gpu: '',
    ram: '',
    storageNum: '',
    storageSuffix: 'GB',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Save draft game info into local storage cache.
 */
export function saveGameInfoDraft(partial: Partial<GameInfoDraft>): GameInfoDraft {
  try {
    const existing = getGameInfoDraft() || EMPTY_GAME_DRAFT;
    const updated: GameInfoDraft = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also update in list of drafts
    const allDrafts = getAllGameDrafts();
    const idx = allDrafts.findIndex((d) => d.id === updated.id);
    if (idx >= 0) {
      allDrafts[idx] = updated;
    } else {
      allDrafts.push(updated);
    }
    localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(allDrafts));

    return updated;
  } catch (e) {
    console.error('Error saving game info draft:', e);
    return EMPTY_GAME_DRAFT;
  }
}

/**
 * Retrieves current active draft game info from cache, returning empty template if none exists.
 */
export function getGameInfoDraft(): GameInfoDraft {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading game info draft:', e);
  }
  return EMPTY_GAME_DRAFT;
}

/**
 * Retrieves all stored game drafts.
 */
export function getAllGameDrafts(): GameInfoDraft[] {
  try {
    const cached = localStorage.getItem(DRAFTS_LIST_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading game drafts list:', e);
  }
  return [EMPTY_GAME_DRAFT];
}

/**
 * Clears current draft cache.
 */
export function clearGameInfoDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing game info draft:', e);
  }
}
