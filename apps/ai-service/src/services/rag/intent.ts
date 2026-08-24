/**
 * Standard stop words & conversational filler set
 */
export const STOP_WORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'aren',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'cannot',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'let',
  'me',
  'more',
  'most',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'with',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  // Conversational & gaming boilerplate fillers
  'game',
  'games',
  'gaming',
  'gamer',
  'play',
  'played',
  'playing',
  'player',
  'recommend',
  'recommendation',
  'recommendations',
  'suggest',
  'suggestion',
  'suggestions',
  'looking',
  'look',
  'looks',
  'find',
  'show',
  'give',
  'tell',
  'want',
  'wanted',
  'wants',
  'like',
  'liked',
  'likes',
  'something',
  'good',
  'best',
  'nice',
  'cool',
  'please',
  'hi',
  'hello',
  'hey',
  'yo',
  'sup',
  'thanks',
  'thank',
  'buy',
  'bought',
  'get',
  'got',
  'help',
  'assist',
  'assistant',
  'hathor',
]);

/**
 * Extracts meaningful keyword tokens from text, omitting stopwords and short tokens.
 */
export function extractMeaningfulKeywords(text: string): string[] {
  const normalized = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return tokens.filter((t) => !STOP_WORDS.has(t) && t.length > 2);
}

/**
 * Checks if the user is asking for recommendations based on their own library/history.
 */
export function isLibraryRecommendationIntent(text?: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes('what i play') ||
    t.includes('like i play') ||
    t.includes('games i play') ||
    t.includes('my library') ||
    t.includes('my games') ||
    t.includes('games i own') ||
    t.includes('what i own') ||
    t.includes('based on my') ||
    t.includes('like my games')
  );
}

/**
 * Checks if a message is purely a casual greeting or conversational query without game discovery intent.
 */
export function isCasualGreetingOrChat(text?: string): boolean {
  if (!text) return false;
  const clean = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '');
  const greetings = [
    'hi',
    'hello',
    'hey',
    'yo',
    'sup',
    'greetings',
    'good morning',
    'good evening',
    'good afternoon',
    'how are you',
    'who are you',
    'what are you',
    'what can you do',
    'help',
    'test',
    'thank you',
    'thanks',
  ];
  return greetings.includes(clean);
}
