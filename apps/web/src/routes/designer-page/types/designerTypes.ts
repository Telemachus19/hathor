import { getGameInfoDraft } from '../../game-info-form/gameInfoCache';

// ── Exact Design tokens matching landing-page & game-details reference 1:1 ────
export const BG = '#212631'; // Dark slate navy background from reference
export const SURFACE = '#181c24'; // Card surface background
export const BORDER = '#353c4d'; // Border color from reference
export const HATHOR_ORANGE = '#f26b21'; // Exact vibrant orange from "A KINGDOM IN RUIN" reference image snippet!
export const GOLD_ACCENT = '#f4b183'; // Secondary gold accent
export const GREEN_ACCENT = '#38d39f'; // Exact mint green accent
export const TEXT_PRIMARY = '#e6edf3';
export const TEXT_MUTED = '#a4b0be';

// ── Font & weight options ──────────────────────────────────────────────────────
export const FONTS = [
  { label: 'Cinzel', value: "'Cinzel', serif" },
  { label: 'Raleway', value: "'Raleway', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'Monospace', value: 'monospace' },
];

export const WEIGHTS = [
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'SemiBold (600)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'ExtraBold (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
];

// ── Types ─────────────────────────────────────────────────────────────────────
export type ElementType =
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'game-header'
  | 'ownership-banner'
  | 'about-game'
  | 'system-reqs'
  | 'user-reviews'
  | 'sidebar-cta'
  | 'sidebar-info'
  | 'sidebar-ratings'
  | 'sidebar-community'
  | 'carousel'
  | 'media-carousel'
  | 'features'
  | 'two-col'
  | 'recommendations'
  | 'game-hero'
  | 'cta';

export interface Section {
  id: string;
  type: SectionType;
  bg: string;
  bgImage?: string;
  bgSize?: string;
  bgPosition?: string;
  bgRepeat?: string;
  bgAttachment?: string;
  bgOverlay?: string;
  bgOverlayOpacity?: number;
  overlay: number;
  pt: number;
  pb: number;
  ph: number;
  pl?: number;
  pr?: number;
  mb?: number;
  radius: number;
  borderTopColor?: string;
  // Typography & general block props
  text?: string;
  font?: string;
  size?: number;
  weight?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: string;
  textTransform?: 'uppercase' | 'capitalize' | 'lowercase' | 'none';
  fullWidth?: boolean;
  // Image properties
  imageSrc?: string;
  imageAlt?: string;
  imageMaxWidth?: number;
  imageRadius?: number;
  imageShadow?: boolean;
  // Button properties
  btnText?: string;
  btnBg?: string;
  btnGradient?: string;
  btnColor?: string;
  btnHoverBg?: string;
  btnHoverColor?: string;
  btnBorderColor?: string;
  btnIcon?: 'download' | 'library' | 'cart' | 'check' | 'thumbs-up' | 'star' | 'none';
  btnPaddingV?: number;
  btnPaddingH?: number;
  btnRadius?: number;
  // Game Hero
  heroImages?: string[];
  heroHeight?: number;
  showThumbnails?: boolean;
  heroShadowEnabled?: boolean;
  heroShadowColor?: string;
  // Game Header
  gameCategory?: string;
  gameTitle?: string;
  gameSubtitle?: string;
  gameRatingScore?: number;
  gameReviewCount?: string;
  gameDev?: string;
  gameReleaseDate?: string;
  gameTags?: string[];
  gameDesc?: string;
  ratingScoreFont?: string;
  ratingScoreColor?: string;
  headerRatingColor?: string;
  reviewCountFont?: string;
  reviewCountColor?: string;
  headerReviewCountColor?: string;
  devFont?: string;
  devColor?: string;
  headerDevColor?: string;
  dateFont?: string;
  dateColor?: string;
  headerDateColor?: string;
  titleFont?: string;
  titleColor?: string;
  subtitleFont?: string;
  subtitleColor?: string;
  tagBg?: string;
  tagColor?: string;
  tagBorder?: string;
  descColor?: string;
  descBorderColor?: string;
  headerBg?: string;
  headerBorder?: string;
  headerRadius?: number;
  headerPadTop?: number;
  headerPadBottom?: number;
  headerPadLeft?: number;
  headerPadRight?: number;
  badgeColor?: string;
  starColor?: string;
  accentColor?: string;
  // Ownership Banner
  ownershipStatus?: string;
  ownershipSub?: string;
  ownershipBtn1?: string;
  ownershipBtn2?: string;
  ownershipBtn1Bg?: string;
  ownershipBg?: string;
  ownershipBorder?: string;
  ownershipTitleFont?: string;
  ownershipTitleColor?: string;
  ownershipSubColor?: string;
  ownershipBtn1Color?: string;
  ownershipBtn2Bg?: string;
  ownershipBtn2Color?: string;
  // About Game
  aboutTitle?: string;
  aboutSections?: { title: string; text: string; img?: string }[];
  aboutTitleFont?: string;
  aboutTitleColor?: string;
  subTitleColor?: string;
  aboutSubheadingFont?: string;
  aboutSubheadingColor?: string;
  aboutBodyFont?: string;
  aboutBodyColor?: string;
  aboutBg?: string;
  aboutBorder?: string;
  aboutRadius?: number;
  borderColor?: string;
  // System Reqs
  reqsMin?: { os: string; cpu: string; ram: string; gpu: string; storage: string };
  reqsRec?: { os: string; cpu: string; ram: string; gpu: string; storage: string };
  reqsTitle?: string;
  reqsTitleFont?: string;
  reqsTitleColor?: string;
  reqsTabActiveBg?: string;
  reqsTabActiveColor?: string;
  reqsCardBg?: string;
  reqsCardBorder?: string;
  reqsLabelColor?: string;
  reqsValueColor?: string;
  reqsValueFont?: string;
  reqsAccentColor?: string;
  labelColor?: string;
  valueColor?: string;
  // User Reviews props & styling
  reviewHeader?: string;
  reviewCardBg?: string;
  reviewCardBorder?: string;
  reviewCardRadius?: number;
  reviewNameColor?: string;
  reviewNameFont?: string;
  reviewBodyColor?: string;
  reviewBodyFont?: string;
  reviewStarColor?: string;
  reviewBadgeBg?: string;
  reviewBadgeColor?: string;
  // Sidebar CTA
  sidebarPrice?: string;
  sidebarDiscount?: number;
  sidebarOwned?: boolean;
  sidebarOriginalPrice?: string;
  ownedTitle?: string;
  ownedTitleColor?: string;
  ownedHeaderColor?: string;
  ownedSubtext?: string;
  ownedSubtextColor?: string;
  sideBodyColor?: string;
  ownedPrimaryBtnText?: string;
  ownedPrimaryBtnBg?: string;
  ownedPrimaryBtnTextColor?: string;
  primaryBtnBg?: string;
  primaryBtnTextColor?: string;
  unownedPrimaryBtnText?: string;
  unownedPrimaryBtnBg?: string;
  unownedPrimaryBtnTextColor?: string;
  ctaSecondaryBtnText?: string;
  ctaSecondaryBtnTextColor?: string;
  ctaSecondaryBtnBorder?: string;
  ctaSecondaryBtnBg?: string;
  sidePriceColor?: string;
  priceColor?: string;
  originalPriceColor?: string;
  discountBg?: string;
  discountTextColor?: string;
  sideAccentColor?: string;
  sideCardBg?: string;
  sideCardBorder?: string;
  ctaBtnRadius?: number;
  sideHeaderFont?: string;
  sideHeaderColor?: string;
  ctaPrimaryBtnBg?: string;
  ctaPrimaryBtnTextColor?: string;
  // Sidebar Info
  sideDev?: string;
  sidePub?: string;
  sideDate?: string;
  sideGenre?: string;
  sidePlatforms?: string[];
  infoTitle?: string;
  infoTitleColor?: string;
  infoLabelColor?: string;
  infoValueColor?: string;
  infoTextColor?: string;
  infoCardBg?: string;
  infoCardBorder?: string;
  infoLabelFont?: string;
  infoValueFont?: string;
  // Sidebar Ratings
  sideRatings?: { stars: number; pct: number }[];
  ratingsTitle?: string;
  ratingsTitleColor?: string;
  ratingsLabelColor?: string;
  ratingsValueColor?: string;
  ratingsTextColor?: string;
  ratingsFillColor?: string;
  ratingsTrackColor?: string;
  ratingsPctColor?: string;
  ratingsCardBg?: string;
  ratingsCardBorder?: string;
  ratingsTitleFont?: string;
  ratingsLabelFont?: string;
  // Sidebar Community
  sideOwners?: string;
  sidePositive?: string;
  communityTitle?: string;
  communityTitleColor?: string;
  commTitleColor?: string;
  communityLabelColor?: string;
  commLabelColor?: string;
  communityValueColor?: string;
  commValueColor?: string;
  communityRatingColor?: string;
  commRatingColor?: string;
  communityPlayersColor?: string;
  communityPositiveColor?: string;
  communityCardBg?: string;
  communityCardBorder?: string;
  communityTitleFont?: string;
  communityLabelFont?: string;
  // Recommendations
  recsTitle?: string;
  recsTitleFont?: string;
  recsTitleColor?: string;
  recsItems?: RecItem[];
  recsCount?: number;
  recsCardBg?: string;
  recsCardBorder?: string;
  recsCardRadius?: number;
  recsCardTitleFont?: string;
  recsCardTitleColor?: string;
  recsPriceFont?: string;
  recsPriceColor?: string;
  recsDiscountBg?: string;
  recsDiscountTextColor?: string;
  recsBg?: string;
  itemTitleFont?: string;
  itemTitleColor?: string;
  itemDescColor?: string;
  cardBg?: string;
  cardBorder?: string;
  cardRadius?: number;
  // Text
  textContent?: string;
  textFont?: string;
  textSize?: number;
  textWeight?: string;
  textColor?: string;
  textAlign?: string;
  textLineHeight?: number;
  textMaxWidth?: number;
  // Media Items
  mediaItems?: any[];
  // Carousel
  carouselImages?: string[];
  carouselHeight?: number;
  carouselRadius?: number;
  // Features
  featuresTitle?: string;
  featuresTitleFont?: string;
  featuresTitleColor?: string;
  featuresCols?: number;
  featuresItems?: FeatureItem[];
  featureItemTitleColor?: string;
  featureItemDescColor?: string;
  featuresCardBg?: string;
  featuresCardBorder?: string;
  // Two-col
  twoColRatio?: string;
  twoColGap?: number;
  twoColLeftType?: 'text' | 'image';
  twoColLeftText?: string;
  twoColLeftFont?: string;
  twoColLeftSize?: number;
  twoColLeftWeight?: string;
  twoColLeftColor?: string;
  twoColLeftAlign?: string;
  twoColLeftImg?: string;
  twoColRightType?: 'text' | 'image';
  twoColRightText?: string;
  twoColRightFont?: string;
  twoColRightSize?: number;
  twoColRightWeight?: string;
  twoColRightColor?: string;
  twoColRightAlign?: string;
  twoColRightImg?: string;
  // Custom Grid
  gridCols?: GridColumn[];
  gridGap?: number;
  gridTemplate?: string;
  // Divider
  dividerColor?: string;
  dividerStyle?: string;
  dividerThickness?: number;
  dividerWidth?: number;
  // Spacer
  spacerHeight?: number;
  // CTA
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrice?: string;
  ctaBtnText?: string;
  ctaBtnColor?: string;
  ctaBtnTextColor?: string;
  ctaTitleFont?: string;
  ctaTitleColor?: string;
  ctaSubtitleColor?: string;
  ctaAlign?: string;
  ctaBg?: string;
  ctaBorder?: string;
}

export type GridElement = Partial<Omit<Section, 'gridCols'>> & { id: string; type: ElementType };

export interface GridColumn {
  id: string;
  bg?: string;
  pt?: number;
  pb?: number;
  ph?: number;
  pl?: number;
  pr?: number;
  radius?: number;
  borderTopColor?: string;
  elements: GridElement[];
}

export interface RecItem {
  id: string;
  title: string;
  discount?: string;
  genre?: string;
  price: string;
  image: string;
}

export type SectionType =
  | 'game-hero'
  | 'media-carousel'
  | 'game-header'
  | 'ownership-banner'
  | 'about-game'
  | 'system-reqs'
  | 'user-reviews'
  | 'sidebar-cta'
  | 'sidebar-info'
  | 'sidebar-ratings'
  | 'sidebar-community'
  | 'recommendations'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'carousel'
  | 'features'
  | 'two-col'
  | 'grid'
  | 'divider'
  | 'spacer'
  | 'cta';

export type Device = 'desktop' | 'tablet' | 'mobile';

export interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

export interface PageSettings {
  bg: string;
  device?: Device;
  bgImage?: string;
  bgSize?: string;
  bgPosition?: string;
  bgRepeat?: string;
  bgAttachment?: string;
  bgOverlay?: string;
  bgOverlayOpacity?: number;
  titleFont?: string;
  textFont?: string;
  accentColor?: string;
  padTop?: number;
  padBottom?: number;
  padLeft?: number;
  padRight?: number;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  bg: BG,
  bgImage: '',
  bgSize: 'cover',
  bgPosition: 'center center',
  bgRepeat: 'no-repeat',
  bgAttachment: 'scroll',
  bgOverlay: 'transparent',
  bgOverlayOpacity: 0,
  titleFont: "'Cinzel', serif",
  textFont: "'Raleway', sans-serif",
  accentColor: HATHOR_ORANGE,
  padTop: 0,
  padBottom: 40,
  padLeft: 0,
  padRight: 0,
};

// ── ID generator ──────────────────────────────────────────────────────────────
let _seq = 1000;
export function uid() {
  return `sec_${Date.now()}_${++_seq}`;
}

// ── Default element factory ────────────────────────────────────────────────────
export function createGridElement(type: ElementType): GridElement {
  const id = uid();
  const draft = getGameInfoDraft();
  switch (type) {
    case 'game-header':
      return {
        id,
        type,
        pt: 0,
        pb: 0,
        pl: 0,
        pr: 0,
        gameCategory: (draft.genre || 'GENRE').toUpperCase(),
        gameTitle: (draft.title || 'YOUR GAME TITLE').toUpperCase(),
        gameSubtitle: '',
        gameRatingScore: 9.4,
        gameReviewCount: '14.2k Reviews',
        gameDev: 'Developer Name',
        gameReleaseDate: 'Coming Soon',
        gameTags: draft.tags && draft.tags.length > 0 ? draft.tags : ['TAG 1', 'TAG 2'],
        gameDesc:
          draft.shortDesc ||
          'A short description of your game will appear here once entered in the Game Information form.',
      };
    case 'ownership-banner':
      return {
        id,
        type,
        pt: 12,
        pb: 12,
        pl: 16,
        pr: 16,
        ownershipStatus: 'YOU OWN THIS GAME',
        ownershipSub: 'Purchased recently • Available in your library',
        ownershipBtn1: 'DOWNLOAD',
        ownershipBtn2: 'GO TO LIBRARY',
      };
    case 'about-game':
      return {
        id,
        type,
        aboutTitle: 'ABOUT THIS GAME',
        pt: 0,
        pb: 0,
        pl: 0,
        pr: 0,
        aboutSections: [
          {
            title: 'SECTION TITLE',
            text: draft.shortDesc || 'Add a description for this section.',
          },
        ],
      };
    case 'system-reqs':
      return {
        id,
        type,
        pt: 0,
        pb: 0,
        pl: 0,
        pr: 0,
        reqsMin: {
          os:
            draft.minReq.os && draft.minReq.os.length > 0
              ? draft.minReq.os.join(', ')
              : 'Windows 10 (64-bit)',
          cpu: draft.minReq.cpu || 'Intel Core i5 / AMD Ryzen 5',
          ram: draft.minReq.ram
            ? draft.minReq.ram.toUpperCase().includes('GB')
              ? draft.minReq.ram
              : `${draft.minReq.ram} GB`
            : '8 GB',
          gpu: draft.minReq.gpu || 'NVIDIA GTX 1060 / AMD RX 580',
          storage: draft.minReq.storageNum
            ? `${draft.minReq.storageNum} ${draft.minReq.storageSuffix}`
            : '50 GB',
        },
        reqsRec: {
          os:
            draft.recReq.os && draft.recReq.os.length > 0
              ? draft.recReq.os.join(', ')
              : 'Windows 11 (64-bit)',
          cpu: draft.recReq.cpu || 'Intel Core i7 / AMD Ryzen 7',
          ram: draft.recReq.ram
            ? draft.recReq.ram.toUpperCase().includes('GB')
              ? draft.recReq.ram
              : `${draft.recReq.ram} GB`
            : '16 GB',
          gpu: draft.recReq.gpu || 'NVIDIA RTX 3070 / AMD RX 6700 XT',
          storage: draft.recReq.storageNum
            ? `${draft.recReq.storageNum} ${draft.recReq.storageSuffix}`
            : '50 GB',
        },
      };
    case 'user-reviews':
      return {
        id,
        type,
        pt: 0,
        pb: 0,
        pl: 0,
        pr: 0,
        reviewHeader: 'USER REVIEWS',
        reviewCardBg: '#181c24',
        reviewCardBorder: BORDER,
        reviewCardRadius: 4,
        reviewNameColor: TEXT_PRIMARY,
        reviewNameFont: "'Cinzel', serif",
        reviewBodyColor: TEXT_MUTED,
        reviewBodyFont: "'Raleway', sans-serif",
        reviewStarColor: HATHOR_ORANGE,
        reviewBadgeBg: 'rgba(46, 204, 113, 0.06)',
        reviewBadgeColor: '#2ecc71',
      };
    case 'sidebar-cta':
      return {
        id,
        type,
        sidebarOwned: true,
        sidebarPrice: draft.priceEgp || '0.00',
        sidebarDiscount: 0,
      };
    case 'sidebar-info':
      return {
        id,
        type,
        sideDev: 'Developer Name',
        sidePub: 'Publisher Name',
        sideDate: 'Coming Soon',
        sideGenre: draft.genre || 'Genre',
        sidePlatforms: ['Windows'],
      };
    case 'sidebar-ratings':
      return {
        id,
        type,
        sideRatings: [
          { stars: 5, pct: 0 },
          { stars: 4, pct: 0 },
          { stars: 3, pct: 0 },
          { stars: 2, pct: 0 },
          { stars: 1, pct: 0 },
        ],
      };
    case 'sidebar-community':
      return { id, type, sideOwners: '0', sidePositive: '0%' };
    case 'heading':
      return {
        id,
        type,
        text: 'Heading Text',
        font: "'Cinzel', serif",
        size: 22,
        weight: '700',
        color: '#ffffff',
        align: 'left',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      };
    case 'text':
      return {
        id,
        type,
        text: 'Add paragraph text here. Customize text, fonts, colors, and line height.',
        font: "'Raleway', sans-serif",
        size: 14,
        weight: '400',
        color: TEXT_MUTED,
        align: 'left',
        lineHeight: 1.65,
        textTransform: 'none',
      };
    case 'image':
      return {
        id,
        type,
        imageSrc: `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop`,
        imageAlt: 'Game screenshot',
        imageMaxWidth: 100,
        imageRadius: 4,
      };
    case 'button':
      return {
        id,
        type,
        btnText: 'DOWNLOAD NOW',
        btnBg: GREEN_ACCENT,
        btnColor: '#0e1116',
        btnIcon: 'download',
        fullWidth: true,
        align: 'center',
        btnRadius: 3,
        btnPaddingV: 12,
        btnPaddingH: 16,
        letterSpacing: '0.12em',
      };
    case 'carousel':
      return {
        id,
        type,
        carouselImages: [],
        carouselHeight: 320,
        showThumbnails: true,
      };
    case 'features':
      return {
        id,
        type,
        featuresTitle: 'KEY FEATURES',
        featuresCols: 3,
        featuresItems: [
          {
            icon: '🎮',
            title: 'FEATURE ONE',
            desc: 'Describe a key feature.',
            color: HATHOR_ORANGE,
          },
          {
            icon: '🌍',
            title: 'FEATURE TWO',
            desc: 'Describe another feature.',
            color: HATHOR_ORANGE,
          },
          {
            icon: '⚡',
            title: 'FEATURE THREE',
            desc: 'Describe a third feature.',
            color: HATHOR_ORANGE,
          },
        ],
      };
    case 'recommendations':
      return { id, type, recsTitle: 'MORE LIKE THIS', recsCount: 4 };
    case 'game-hero':
      return {
        id,
        type,
        heroImages: [],
        heroHeight: 360,
        showThumbnails: true,
      };
    case 'two-col':
      return {
        id,
        type,
        twoColRatio: '1:1',
        twoColGap: 24,
        twoColLeftText: 'Add text content here.',
        twoColLeftFont: "'Raleway', sans-serif",
        twoColLeftSize: 14,
        twoColLeftColor: TEXT_MUTED,
        twoColRightImg: '',
      };
    case 'cta':
      return {
        id,
        type,
        ctaTitle: 'CALL TO ACTION',
        ctaSubtitle: 'Add a compelling call to action subtitle.',
        ctaBtnText: 'BUY NOW',
        ctaBtnColor: HATHOR_ORANGE,
        ctaBtnTextColor: '#ffffff',
      };
    case 'divider':
      return { id, type, dividerColor: BORDER, dividerThickness: 1 };
    case 'spacer':
      return { id, type, spacerHeight: 30 };
    default:
      return { id, type };
  }
}

// ── Default section factory ────────────────────────────────────────────────────
export function createSection(type: SectionType): Section {
  const base = {
    id: uid(),
    bg: 'transparent',
    bgImage: '',
    overlay: 0,
    pt: 0,
    pb: 0,
    ph: 0,
    radius: 0,
  };
  switch (type) {
    case 'game-hero':
    case 'media-carousel':
      return {
        ...base,
        type: 'media-carousel',
        pt: 0,
        pb: 0,
        ph: 0,
        bg: 'transparent',
        heroImages: [],
        carouselImages: [],
        heroHeight: 480,
        carouselHeight: 480,
        showThumbnails: true,
      };
    case 'text':
      return {
        ...base,
        type,
        pt: 24,
        pb: 24,
        ph: 0,
        textContent:
          'Add paragraph text here. Customize fonts, sizes, colors, alignment, and max width in the Properties inspector.',
        textFont: "'Raleway', sans-serif",
        textSize: 16,
        textWeight: '400',
        textColor: TEXT_MUTED,
        textAlign: 'left',
        textLineHeight: 1.65,
        textMaxWidth: 700,
      };
    case 'image':
      return {
        ...base,
        type,
        pt: 24,
        pb: 24,
        ph: 0,
        imageSrc:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        imageAlt: 'Game screenshot',
        imageMaxWidth: 100,
        imageRadius: 4,
        imageShadow: true,
      };
    case 'features':
      return {
        ...base,
        type,
        pt: 24,
        pb: 32,
        ph: 0,
        featuresTitle: 'KEY FEATURES',
        featuresTitleFont: "'Cinzel', serif",
        featuresTitleColor: '#ffffff',
        featuresCols: 3,
        featuresItems: [
          {
            icon: '🎮',
            title: 'FEATURE ONE',
            desc: 'Describe a key feature.',
            color: HATHOR_ORANGE,
          },
          {
            icon: '🌍',
            title: 'FEATURE TWO',
            desc: 'Describe another feature.',
            color: HATHOR_ORANGE,
          },
          {
            icon: '⚡',
            title: 'FEATURE THREE',
            desc: 'Describe a third feature.',
            color: HATHOR_ORANGE,
          },
        ],
      };
    case 'cta':
      return {
        ...base,
        type,
        pt: 32,
        pb: 32,
        ph: 0,
        ctaTitle: 'CALL TO ACTION',
        ctaSubtitle: 'Add a compelling call to action subtitle.',
        ctaPrice: '0.00 EGP',
        ctaBtnText: 'BUY NOW',
        ctaBtnColor: HATHOR_ORANGE,
        ctaBtnTextColor: '#ffffff',
        ctaTitleFont: "'Cinzel', serif",
        ctaTitleColor: '#ffffff',
        ctaSubtitleColor: TEXT_MUTED,
        ctaAlign: 'center',
      };
    case 'two-col':
      return {
        ...base,
        type,
        pt: 24,
        pb: 24,
        ph: 0,
        twoColRatio: '1:1',
        twoColGap: 32,
        twoColLeftText: 'Add text content here.',
        twoColLeftFont: "'Raleway', sans-serif",
        twoColLeftSize: 15,
        twoColLeftWeight: '400',
        twoColLeftColor: TEXT_MUTED,
        twoColRightImg:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
      };
    case 'divider':
      return {
        ...base,
        type,
        pt: 16,
        pb: 16,
        ph: 0,
        dividerColor: BORDER,
        dividerThickness: 1,
        dividerWidth: 100,
      };
    case 'spacer':
      return { ...base, type, pt: 0, pb: 0, ph: 0, spacerHeight: 32 };
    case 'user-reviews':
      return {
        ...base,
        type,
        pt: 0,
        pb: 32,
        ph: 0,
        bg: 'transparent',
        reviewHeader: 'USER REVIEWS',
        reviewCardBg: SURFACE,
        reviewCardBorder: BORDER,
        reviewCardRadius: 4,
        reviewNameColor: TEXT_PRIMARY,
        reviewNameFont: "'Cinzel', serif",
        reviewBodyColor: TEXT_MUTED,
        reviewBodyFont: "'Raleway', sans-serif",
        reviewStarColor: HATHOR_ORANGE,
        reviewBadgeBg: 'rgba(46, 204, 113, 0.06)',
        reviewBadgeColor: '#2ecc71',
      };
    case 'recommendations':
      return {
        ...base,
        type,
        pt: 24,
        pb: 32,
        ph: 0,
        bg: 'transparent',
        recsTitle: 'MORE LIKE THIS',
        recsCount: 4,
        recsCardBg: SURFACE,
        recsCardBorder: BORDER,
      };
    case 'grid':
      return {
        ...base,
        type,
        bg: 'transparent',
        pt: 24,
        pb: 32,
        ph: 0,
        gridGap: 32,
        gridTemplate: '2:1',
        gridCols: [
          { id: uid(), bg: 'transparent', pt: 0, pb: 0, ph: 0, radius: 0, elements: [] },
          { id: uid(), bg: 'transparent', pt: 0, pb: 0, ph: 0, radius: 0, elements: [] },
        ],
      };
    default:
      return { ...base, type };
  }
}
