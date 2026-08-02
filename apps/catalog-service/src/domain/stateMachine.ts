export type GameStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'suspended';

export const VALID_GAME_STATUSES: GameStatus[] = [
  'draft',
  'pending_review',
  'published',
  'rejected',
  'suspended',
];

const ALLOWED_TRANSITIONS: Record<GameStatus, GameStatus[]> = {
  draft: ['pending_review'],
  pending_review: ['published', 'rejected', 'draft'],
  published: ['suspended'],
  suspended: ['published', 'rejected', 'draft'],
  rejected: ['draft', 'pending_review'],
};

const CREATOR_ALLOWED_TARGET_STATUSES: GameStatus[] = ['pending_review', 'draft'];

/**
 * Validates if the requested status transition is allowed by the publication state machine.
 */
export function isValidTransition(priorStatus: string, nextStatus: string): boolean {
  const allowedNext = ALLOWED_TRANSITIONS[priorStatus as GameStatus];
  if (!allowedNext) {
    return false;
  }
  return allowedNext.includes(nextStatus as GameStatus);
}

/**
 * Checks whether a creator is allowed to request a target status transition.
 */
export function isCreatorAllowedTargetStatus(targetStatus: string): boolean {
  return CREATOR_ALLOWED_TARGET_STATUSES.includes(targetStatus as GameStatus);
}
