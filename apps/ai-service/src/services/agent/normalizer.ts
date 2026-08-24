/**
 * Normalizes section types and scrubs misplaced media arrays to guarantee ThemeDocument compliance.
 */
export function normalizeThemeSections(theme: any): any {
  if (!theme || typeof theme !== 'object') return theme;

  // 1. Unwrap nested theme envelopes (e.g. from tool calls, LLM wrappers, or alternate keys)
  let targetTheme = theme;
  if (
    theme.theme &&
    typeof theme.theme === 'object' &&
    (Array.isArray(theme.theme.sections) ||
      (typeof theme.theme.sections === 'object' && theme.theme.sections !== null) ||
      theme.theme.pageSettings)
  ) {
    targetTheme = theme.theme;
  } else if (
    theme.proposedTheme &&
    typeof theme.proposedTheme === 'object' &&
    (Array.isArray(theme.proposedTheme.sections) ||
      (typeof theme.proposedTheme.sections === 'object' && theme.proposedTheme.sections !== null) ||
      theme.proposedTheme.pageSettings)
  ) {
    targetTheme = theme.proposedTheme;
  } else if (
    theme.layout &&
    typeof theme.layout === 'object' &&
    (Array.isArray(theme.layout.sections) ||
      (typeof theme.layout.sections === 'object' && theme.layout.sections !== null) ||
      theme.layout.pageSettings)
  ) {
    targetTheme = theme.layout;
  } else if (
    theme.parameters?.theme &&
    typeof theme.parameters.theme === 'object' &&
    (Array.isArray(theme.parameters.theme.sections) ||
      (typeof theme.parameters.theme.sections === 'object' &&
        theme.parameters.theme.sections !== null) ||
      theme.parameters.theme.pageSettings)
  ) {
    targetTheme = theme.parameters.theme;
  } else if (
    theme.arguments?.theme &&
    typeof theme.arguments.theme === 'object' &&
    (Array.isArray(theme.arguments.theme.sections) ||
      (typeof theme.arguments.theme.sections === 'object' &&
        theme.arguments.theme.sections !== null) ||
      theme.arguments.theme.pageSettings)
  ) {
    targetTheme = theme.arguments.theme;
  } else if (
    theme.args?.theme &&
    typeof theme.args.theme === 'object' &&
    (Array.isArray(theme.args.theme.sections) ||
      (typeof theme.args.theme.sections === 'object' && theme.args.theme.sections !== null) ||
      theme.args.theme.pageSettings)
  ) {
    targetTheme = theme.args.theme;
  } else if (
    theme.data?.theme &&
    typeof theme.data.theme === 'object' &&
    (Array.isArray(theme.data.theme.sections) || theme.data.theme.pageSettings)
  ) {
    targetTheme = theme.data.theme;
  }

  const aliasType = (t: string): string => {
    const low = (t || '').toLowerCase().trim();
    if (low === 'hero' || low === 'carousel' || low === 'game-hero' || low === 'mediacarousel') {
      return 'media-carousel';
    }
    if (low === 'header' || low === 'gameheader') return 'game-header';
    if (low === 'reviews' || low === 'review') return 'user-reviews';
    if (low === 'specs' || low === 'spec' || low === 'systemreqs') return 'system-reqs';
    if (low === 'ratings' || low === 'rating') return 'sidebar-ratings';
    if (low === 'info') return 'sidebar-info';
    if (low === 'about') return 'about-game';
    if (low === 'recs' || low === 'more_like_this' || low === 'more-like-this') {
      return 'recommendations';
    }
    return t;
  };

  const sanitizeSection = (sec: any, idx: number): any => {
    if (!sec || typeof sec !== 'object') return sec;
    const s = { ...sec };

    if (!s.id) {
      s.id = `section-${idx + 1}-${Math.random().toString(36).substring(2, 7)}`;
    }

    s.type = aliasType(s.type);

    // Clean misplaced media arrays from non-carousel components
    if (s.type === 'media-carousel') {
      const imgs = s.heroImages || s.carouselImages || s.mediaItems || s.images || [];
      s.heroImages = imgs;
      s.carouselImages = imgs;
      delete s.mediaItems;
    } else {
      delete s.heroImages;
      delete s.carouselImages;
      delete s.mediaItems;
    }

    // Clean misplaced review arrays from non-review components
    if (s.type !== 'user-reviews') {
      delete s.reviews;
      delete s.reviewList;
      delete s.userReviews;
    }

    // Clean misplaced catalog text fields (catalog fields are fetched dynamically from database)
    delete s.gameTitle;
    delete s.gameDev;
    delete s.gameDesc;
    delete s.gameTags;
    delete s.reqsMin;
    delete s.reqsRec;
    delete s.sideDev;
    delete s.sidePub;
    delete s.sideDate;
    delete s.sideGenre;
    delete s.sidePlatforms;

    // Handle nested columns in grid
    if (s.type === 'grid' && Array.isArray(s.gridCols)) {
      s.gridCols = s.gridCols.map((col: any, cIdx: number) => {
        if (!col || typeof col !== 'object') return col;
        const colId = col.id || `col-${cIdx + 1}-${Math.random().toString(36).substring(2, 7)}`;
        let rawElements: any[] = [];
        if (Array.isArray(col.elements)) {
          rawElements = col.elements;
        } else if (typeof col.elements === 'object' && col.elements !== null) {
          rawElements = Object.values(col.elements);
        }
        const sanitizedElements = rawElements.map((el: any, eIdx: number) =>
          sanitizeSection(el, eIdx)
        );
        return {
          ...col,
          id: colId,
          elements: sanitizedElements,
        };
      });
    }

    return s;
  };

  // Find raw sections, prioritizing populated arrays or dictionaries
  let rawSections: any[] = [];
  const extractArray = (cand: any): any[] => {
    if (Array.isArray(cand)) return cand;
    if (cand && typeof cand === 'object' && Object.keys(cand).length > 0) {
      // Check if it's an indexed map { "0": {...}, "1": {...} }
      return Object.values(cand);
    }
    return [];
  };

  if (targetTheme.sections) {
    rawSections = extractArray(targetTheme.sections);
  } else if (theme.sections) {
    rawSections = extractArray(theme.sections);
  } else if (Array.isArray(targetTheme)) {
    rawSections = targetTheme;
  } else if (Array.isArray(theme)) {
    rawSections = theme;
  }

  const sanitizedSections = rawSections.map((sec: any, idx: number) => sanitizeSection(sec, idx));
  const pageSettings =
    targetTheme.pageSettings || theme.pageSettings || targetTheme.settings || theme.settings || {};

  return {
    pageSettings,
    sections: sanitizedSections,
  };
}
