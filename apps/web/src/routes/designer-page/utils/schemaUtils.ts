import {
  Section,
  PageSettings,
  DEFAULT_PAGE_SETTINGS,
  SURFACE,
  BORDER,
  HATHOR_ORANGE,
  GREEN_ACCENT,
  TEXT_PRIMARY,
  TEXT_MUTED,
  createGridElement,
} from '../types/designerTypes';
import { getGameInfoDraft } from '../../game-info-form/gameInfoCache';

// ── Preset initial page ──
export const INITIAL: Section[] = [
  {
    id: 'sec_game_hero',
    type: 'media-carousel',
    bg: 'transparent',
    bgImage: '',
    overlay: 0,
    pt: 0,
    pb: 0,
    ph: 0,
    radius: 0,
    heroImages: [],
    carouselImages: [],
    heroHeight: 480,
    carouselHeight: 480,
    showThumbnails: true,
  },
  {
    id: 'sec_main_layout',
    type: 'grid',
    bg: 'transparent',
    bgImage: '',
    overlay: 0,
    pt: 24,
    pb: 32,
    ph: 0,
    radius: 0,
    gridGap: 32,
    gridTemplate: '2:1',
    gridCols: [
      {
        id: 'col_left',
        bg: 'transparent',
        pt: 0,
        pb: 0,
        ph: 0,
        radius: 0,
        elements: [
          createGridElement('game-header'),
          createGridElement('ownership-banner'),
          createGridElement('about-game'),
          createGridElement('system-reqs'),
          createGridElement('user-reviews'),
        ],
      },
      {
        id: 'col_right',
        bg: 'transparent',
        pt: 0,
        pb: 0,
        ph: 0,
        radius: 0,
        elements: [
          createGridElement('sidebar-cta'),
          createGridElement('sidebar-info'),
          createGridElement('sidebar-ratings'),
          createGridElement('sidebar-community'),
        ],
      },
    ],
  },
  {
    id: 'sec_recs_bottom',
    type: 'recommendations',
    bg: 'transparent',
    bgImage: '',
    overlay: 0,
    pt: 24,
    pb: 32,
    ph: 0,
    radius: 0,
    recsTitle: 'MORE LIKE THIS',
    recsCount: 4,
    recsCardBg: SURFACE,
    recsCardBorder: BORDER,
  },
];

const COMPONENT_NAME_MAP: Record<string, string> = {
  'game-hero': 'GameHero',
  'game-header': 'GameHeader',
  'ownership-banner': 'OwnershipBanner',
  'about-game': 'AboutGame',
  'system-reqs': 'SystemReqs',
  'user-reviews': 'UserReviews',
  'sidebar-cta': 'SidebarCTA',
  'sidebar-info': 'SidebarInfo',
  'sidebar-ratings': 'SidebarRatings',
  'sidebar-community': 'SidebarCommunity',
  recommendations: 'Recommendations',
  grid: 'CustomGrid',
  text: 'TextBlock',
  image: 'ImageBlock',
  carousel: 'CarouselShowcase',
  features: 'FeaturesGrid',
  'two-col': 'TwoColumns',
  divider: 'Divider',
  spacer: 'Spacer',
  cta: 'CTABlock',
  heading: 'HeadingBlock',
  button: 'ButtonBlock',
};

function getComponentStyles(s: any): Record<string, any> {
  const stylesObj: Record<string, any> = {
    section: {
      background: s.bg || 'transparent',
      backgroundImage: s.bgImage ? `url("${s.bgImage}")` : undefined,
      backgroundSize: s.bgSize || 'cover',
      backgroundPosition: s.bgPosition || 'center center',
      backgroundRepeat: s.bgRepeat || 'no-repeat',
      backgroundAttachment: s.bgAttachment || (s.bgSize === '100% auto' ? 'scroll' : undefined),
      bgOverlay: s.bgOverlay,
      bgOverlayOpacity: s.bgOverlayOpacity,
      paddingTop: `${s.pt || 0}px`,
      paddingBottom: `${s.pb || 0}px`,
      paddingLeft: `${s.ph || 0}px`,
      paddingRight: `${s.ph || 0}px`,
      borderRadius: `${s.radius || 0}px`,
      ...(s.borderTopColor ? { borderTopColor: s.borderTopColor } : {}),
    },
  };

  if (s.type === 'sidebar-cta') {
    stylesObj.card = {
      background: s.sideCardBg || SURFACE,
      borderColor: s.sideCardBorder || BORDER,
      borderTopColor: s.sideAccentColor || HATHOR_ORANGE,
    };
    stylesObj.headerTitle = {
      fontFamily: s.sideHeaderFont || "'Cinzel', serif",
      color: s.sideHeaderColor || (s.sidebarOwned ? GREEN_ACCENT : HATHOR_ORANGE),
    };
    stylesObj.bodyText = { color: s.sideBodyColor || TEXT_MUTED };
    stylesObj.primaryBtn = {
      background: s.ctaPrimaryBtnBg || (s.sidebarOwned ? GREEN_ACCENT : HATHOR_ORANGE),
      color: s.ctaPrimaryBtnTextColor || (s.sidebarOwned ? '#0e1116' : '#ffffff'),
      borderRadius: `${s.ctaBtnRadius ?? 3}px`,
    };
    stylesObj.secondaryBtn = {
      background: s.ctaSecondaryBtnBg || 'transparent',
      color: s.ctaSecondaryBtnTextColor || GREEN_ACCENT,
      borderColor: s.ctaSecondaryBtnBorder || 'rgba(56, 211, 159, 0.35)',
    };
  } else if (s.type === 'sidebar-info') {
    stylesObj.card = {
      background: s.infoCardBg || SURFACE,
      borderColor: s.infoCardBorder || BORDER,
    };
    stylesObj.headerTitle = {
      fontFamily: s.infoTitleFont || "'Cinzel', serif",
      color: s.infoTitleColor || HATHOR_ORANGE,
    };
    stylesObj.labels = {
      color: s.infoLabelColor || TEXT_MUTED,
      fontFamily: s.infoLabelFont || 'monospace',
    };
    stylesObj.values = {
      color: s.infoValueColor || TEXT_PRIMARY,
      fontFamily: s.infoValueFont || 'monospace',
    };
  } else if (s.type === 'sidebar-ratings') {
    stylesObj.card = {
      background: s.ratingsCardBg || SURFACE,
      borderColor: s.ratingsCardBorder || BORDER,
    };
    stylesObj.headerTitle = {
      fontFamily: s.ratingsTitleFont || "'Cinzel', serif",
      color: s.ratingsTitleColor || HATHOR_ORANGE,
    };
    stylesObj.labels = {
      color: s.ratingsLabelColor || TEXT_MUTED,
      fontFamily: s.ratingsLabelFont || 'monospace',
    };
    stylesObj.progressBar = { background: s.ratingsFillColor || HATHOR_ORANGE };
    stylesObj.progressTrack = { background: s.ratingsTrackColor || 'rgba(0,0,0,0.3)' };
    stylesObj.percentage = { color: s.ratingsPctColor || TEXT_PRIMARY };
  } else if (s.type === 'sidebar-community') {
    stylesObj.card = {
      background: s.communityCardBg || SURFACE,
      borderColor: s.communityCardBorder || BORDER,
    };
    stylesObj.headerTitle = {
      fontFamily: s.communityTitleFont || "'Cinzel', serif",
      color: s.communityTitleColor || HATHOR_ORANGE,
    };
    stylesObj.labels = {
      color: s.communityLabelColor || TEXT_MUTED,
      fontFamily: s.communityLabelFont || 'monospace',
    };
    stylesObj.playersValue = { color: s.communityPlayersColor || TEXT_PRIMARY };
    stylesObj.positiveRatingValue = { color: s.communityPositiveColor || GREEN_ACCENT };
  } else if (s.type === 'ownership-banner') {
    stylesObj.banner = {
      background: s.ownershipBg || '#181c24',
      borderColor: s.ownershipBorder || 'rgba(56, 211, 159, 0.35)',
    };
    stylesObj.statusTitle = {
      fontFamily: s.ownershipTitleFont || "'Cinzel', serif",
      color: s.ownershipTitleColor || GREEN_ACCENT,
    };
    stylesObj.subtext = { color: s.ownershipSubColor || TEXT_MUTED };
    stylesObj.downloadBtn = {
      background: s.ownershipBtn1Bg || GREEN_ACCENT,
      color: s.ownershipBtn1Color || '#0e1116',
    };
    stylesObj.libraryBtn = {
      background: s.ownershipBtn2Bg || 'transparent',
      color: s.ownershipBtn2Color || GREEN_ACCENT,
    };
  } else if (s.type === 'about-game') {
    stylesObj.headerTitle = {
      fontFamily: s.aboutTitleFont || "'Cinzel', serif",
      color: s.aboutTitleColor || TEXT_PRIMARY,
    };
    stylesObj.subheading = {
      fontFamily: s.aboutSubheadingFont || "'Cinzel', serif",
      color: s.aboutSubheadingColor || HATHOR_ORANGE,
    };
    stylesObj.bodyText = {
      fontFamily: s.aboutBodyFont || "'Raleway', sans-serif",
      color: s.aboutBodyColor || TEXT_MUTED,
    };
  } else if (s.type === 'system-reqs') {
    stylesObj.headerTitle = {
      fontFamily: s.reqsTitleFont || "'Cinzel', serif",
      color: s.reqsTitleColor || TEXT_PRIMARY,
    };
    stylesObj.activeTab = {
      background: s.reqsTabActiveBg || 'rgba(242, 107, 33, 0.22)',
      color: s.reqsTabActiveColor || HATHOR_ORANGE,
    };
    stylesObj.specCard = {
      background: s.reqsCardBg || SURFACE,
      borderColor: s.reqsCardBorder || BORDER,
    };
    stylesObj.specLabel = { color: s.reqsLabelColor || HATHOR_ORANGE };
    stylesObj.specValue = {
      color: s.reqsValueColor || TEXT_PRIMARY,
      fontFamily: s.reqsValueFont || "'Cinzel', serif",
    };
  } else if (s.type === 'user-reviews') {
    stylesObj.reviewCard = {
      background: s.reviewCardBg || SURFACE,
      borderColor: s.reviewCardBorder || BORDER,
      borderRadius: `${s.reviewCardRadius ?? 4}px`,
    };
    stylesObj.reviewerName = {
      color: s.reviewNameColor || TEXT_PRIMARY,
      fontFamily: s.reviewNameFont || "'Cinzel', serif",
    };
    stylesObj.reviewBody = {
      color: s.reviewBodyColor || TEXT_MUTED,
      fontFamily: s.reviewBodyFont || "'Raleway', sans-serif",
    };
    stylesObj.starAccent = { color: s.reviewStarColor || HATHOR_ORANGE };
    stylesObj.badge = {
      background: s.reviewBadgeBg || 'rgba(46, 204, 113, 0.06)',
      color: s.reviewBadgeColor || '#2ecc71',
    };
  } else if (s.type === 'recommendations') {
    stylesObj.recsCard = {
      background: s.recsCardBg || SURFACE,
      borderColor: s.recsCardBorder || BORDER,
    };
  } else if (s.type === 'heading' || s.type === 'text') {
    stylesObj.typography = {
      fontFamily: s.textFont || s.font || "'Raleway', sans-serif",
      fontSize: `${s.textSize || s.size || 14}px`,
      fontWeight: s.textWeight || s.weight || '400',
      color: s.textColor || s.color || TEXT_MUTED,
      textAlign: s.textAlign || s.align || 'left',
    };
  } else if (s.type === 'button') {
    stylesObj.buttonElement = {
      background: s.btnGradient || s.btnBg || GREEN_ACCENT,
      color: s.btnColor || '#0e1116',
      borderColor: s.btnBorderColor || 'transparent',
      borderRadius: `${s.btnRadius ?? 3}px`,
    };
  }

  return stylesObj;
}

function getComponentChildren(s: any): Record<string, any> {
  const { id, style, children, gridCols, ...restProps } = s;
  return restProps;
}

function mapSectionToCustomExport(s: Section): any {
  const componentName = COMPONENT_NAME_MAP[s.type] || s.type;

  if (s.type === 'grid') {
    return {
      component: componentName,
      style: getComponentStyles(s),
      children: {
        gridGap: s.gridGap || 40,
        gridTemplate: s.gridTemplate || '2:1',
        gridCols: (s.gridCols || []).map((col) => ({
          id: col.id,
          style: {
            column: {
              background: col.bg || 'transparent',
              ...(col.borderTopColor ? { borderTopColor: col.borderTopColor } : {}),
            },
          },
          children: (col.elements || []).reduce((acc: Record<string, any>, el, elIdx) => {
            const elKey = el.id || `element_${elIdx + 1}`;
            acc[elKey] = mapSectionToCustomExport(el as any);
            return acc;
          }, {}),
        })),
      },
    };
  }

  return {
    component: componentName,
    style: getComponentStyles(s),
    children: getComponentChildren(s),
  };
}

function generateCustomLayoutJSON(sections: Section[]): Record<string, any> {
  const layoutObj: Record<string, any> = {};

  sections.forEach((s, idx) => {
    const key = s.id || `section_${idx + 1}`;
    layoutObj[key] = mapSectionToCustomExport(s);
  });

  return layoutObj;
}

function cleanForComparison(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanForComparison);
  const copy: Record<string, any> = {};
  for (const k of Object.keys(obj).sort()) {
    if (k === 'id') continue; // Ignore auto-generated IDs
    copy[k] = cleanForComparison(obj[k]);
  }
  return copy;
}

export function isCustomTheme(sections: Section[]): boolean {
  if (!sections || sections.length === 0) return true; // Blank slate is custom
  if (sections.length !== INITIAL.length) return true; // Section count changed

  const cleanCurrent = cleanForComparison(sections);
  const cleanInit = cleanForComparison(INITIAL);

  return JSON.stringify(cleanCurrent) !== JSON.stringify(cleanInit);
}

export function generatePageJSON(sections: Section[], pageSettings?: PageSettings) {
  return {
    theme: 'custom',
    pageBody: pageSettings || DEFAULT_PAGE_SETTINGS,
    layout: generateCustomLayoutJSON(sections),
  };
}

export function syncSectionsWithDraft(sections: Section[]): Section[] {
  const draft = getGameInfoDraft();
  if (!draft) return sections;

  return sections.map((sec) => {
    if (sec.type === 'grid' && sec.gridCols) {
      return {
        ...sec,
        gridCols: sec.gridCols.map((col) => ({
          ...col,
          elements: col.elements.map((el) => {
            if (el.type === 'game-header') {
              return {
                ...el,
                gameCategory: (draft.genre || el.gameCategory || 'GENRE').toUpperCase(),
                gameTitle: (draft.title || el.gameTitle || 'YOUR GAME TITLE').toUpperCase(),
                gameTags:
                  draft.tags && draft.tags.length > 0
                    ? draft.tags
                    : el.gameTags || ['TAG 1', 'TAG 2'],
                gameDesc: draft.shortDesc || el.gameDesc,
              };
            }
            if (el.type === 'sidebar-info') {
              return {
                ...el,
                sideGenre: draft.genre || el.sideGenre,
              };
            }
            if (el.type === 'system-reqs') {
              const reqEl = el as any;
              return {
                ...el,
                reqsMin: {
                  os:
                    draft.minReq.os && draft.minReq.os.length > 0
                      ? draft.minReq.os.join(', ')
                      : reqEl.reqsMin?.os || 'Windows 10 (64-bit)',
                  cpu: draft.minReq.cpu || reqEl.reqsMin?.cpu || 'Intel Core i5-8400',
                  ram: draft.minReq.ram
                    ? draft.minReq.ram.toUpperCase().includes('GB')
                      ? draft.minReq.ram
                      : `${draft.minReq.ram} GB`
                    : reqEl.reqsMin?.ram || '12 GB',
                  gpu: draft.minReq.gpu || reqEl.reqsMin?.gpu || 'NVIDIA GTX 1070',
                  storage: draft.minReq.storageNum
                    ? `${draft.minReq.storageNum} ${draft.minReq.storageSuffix}`
                    : reqEl.reqsMin?.storage?.replace(/NVMe SSD|Available Space/gi, '').trim() ||
                      '85 GB',
                },
                reqsRec: {
                  os:
                    draft.recReq.os && draft.recReq.os.length > 0
                      ? draft.recReq.os.join(', ')
                      : reqEl.reqsRec?.os || 'Windows 11 (64-bit)',
                  cpu: draft.recReq.cpu || reqEl.reqsRec?.cpu || 'Intel Core i7-12700K',
                  ram: draft.recReq.ram
                    ? draft.recReq.ram.toUpperCase().includes('GB')
                      ? draft.recReq.ram
                      : `${draft.recReq.ram} GB`
                    : reqEl.reqsRec?.ram || '16 GB',
                  gpu: draft.recReq.gpu || reqEl.reqsRec?.gpu || 'NVIDIA RTX 4070',
                  storage: draft.recReq.storageNum
                    ? `${draft.recReq.storageNum} ${draft.recReq.storageSuffix}`
                    : reqEl.reqsRec?.storage?.replace(/NVMe SSD|Available Space/gi, '').trim() ||
                      '85 GB',
                },
              };
            }
            return el;
          }),
        })),
      };
    }
    return sec;
  });
}
