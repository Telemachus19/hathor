import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Type, Film, LayoutGrid, Minus,
  ChevronUp, ChevronDown, Trash2, Plus, Copy,
  Monitor, Tablet, Smartphone, Save,
  X,
  AlignLeft, AlignCenter, AlignRight,
  Hash, Zap, Check,
  Upload, Layers, Settings, RotateCcw, RotateCw,
  Image as ImageIcon, Award, MessageSquare, MonitorCheck,
  BarChart2, Users, ShoppingBag, Info, LucideIcon,
  Download, ShoppingCart,
  FileJson, Droplet, Eye
} from "lucide-react";
import { HathorLogo } from "../../assets";
import { GameDetailsPage } from "../game-details/GameDetailsPage";
import {
  GameDetailsHeader,
  GameOwnershipBanner,
  GameDetailsHero,
  GameAbout,
  GameSystemReqs,
  GameReviews,
  GameSidebarCta,
  GameSidebarInfo,
  GameSidebarRatings,
  GameSidebarCommunity,
  MoreLikeThis,
  GameCarousel,
  GameFeatures,
  GameTwoCol,
  GameCtaBlock,
  HeadingRenderer,
  TextRenderer,
  ImageRenderer,
  ButtonRenderer,
  DividerRenderer,
  SpacerRenderer,
} from "../game-details/components";
import styles from "./DesignerPage.module.css";

// ── Exact Design tokens matching landing-page & game-details reference 1:1 ────
const BG = "#212631"; // Dark slate navy background from reference
const SURFACE = "#181c24"; // Card surface background
const BORDER = "#353c4d"; // Border color from reference
const HATHOR_ORANGE = "#f26b21"; // Exact vibrant orange from "A KINGDOM IN RUIN" reference image snippet!
const GOLD_ACCENT = "#f4b183"; // Secondary gold accent
const GREEN_ACCENT = "#38d39f"; // Exact mint green accent
const TEXT_PRIMARY = "#e6edf3";
const TEXT_MUTED = "#a4b0be";

// ── Font & weight options ──────────────────────────────────────────────────────
const FONTS = [
  { label: "Cinzel", value: "'Cinzel', serif" },
  { label: "Raleway", value: "'Raleway', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "Monospace", value: "monospace" },
];

const WEIGHTS = [
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "SemiBold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "ExtraBold (800)", value: "800" },
  { label: "Black (900)", value: "900" },
];

// ── HSV Color Conversion Helpers for Classic 2D Rectangular Picker ───────────
function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const i = Math.floor((h / 60) % 6);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return { h: 18, s: 86, v: 95 };
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type ElementType =
  | "heading" | "text" | "image" | "button" | "divider" | "spacer"
  | "game-header" | "ownership-banner" | "about-game" | "system-reqs" | "user-reviews"
  | "sidebar-cta" | "sidebar-info" | "sidebar-ratings" | "sidebar-community"
  | "carousel" | "features" | "two-col" | "recommendations" | "game-hero" | "cta";

export interface GridElement {
  id: string;
  type: ElementType;
  text?: string;
  font?: string;
  size?: number;
  weight?: string;
  color?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: string;
  textTransform?: "uppercase" | "capitalize" | "lowercase" | "none";

  // Width & sizing
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
  btnIcon?: "download" | "library" | "cart" | "check" | "thumbs-up" | "star" | "none";
  btnPaddingV?: number;
  btnPaddingH?: number;
  btnRadius?: number;

  // Game Hero
  heroImages?: string[]; heroHeight?: number;

  // Game Header props
  gameCategory?: string; gameTitle?: string; gameSubtitle?: string;
  gameRatingScore?: number; gameReviewCount?: string; gameDev?: string;
  gameReleaseDate?: string; gameTags?: string[]; gameDesc?: string;

  // Ownership Banner props
  ownershipStatus?: string; ownershipSub?: string;
  ownershipBtn1?: string; ownershipBtn2?: string;

  // About Game props
  aboutTitle?: string;
  aboutSections?: { title: string; text: string; img?: string }[];

  // System Reqs props
  reqsMin?: { os: string; cpu: string; ram: string; gpu: string; storage: string };
  reqsRec?: { os: string; cpu: string; ram: string; gpu: string; storage: string };

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

  // Sidebar CTA props
  sidebarOwned?: boolean; sidebarPrice?: string; sidebarDiscount?: number;

  // Sidebar Info props
  sideDev?: string; sidePub?: string; sideDate?: string; sideGenre?: string; sidePlatforms?: string[];

  // Sidebar Ratings props
  sideRatings?: { stars: number; pct: number }[];

  // Sidebar Community props
  sideOwners?: string; sidePositive?: string;

  // Recommendations props
  recsTitle?: string; recsItems?: RecItem[]; recsCount?: number; recsCardBg?: string; recsCardBorder?: string;

  // Text props
  textContent?: string; textFont?: string; textSize?: number; textWeight?: string; textColor?: string; textAlign?: string; textLineHeight?: number; textMaxWidth?: number;

  // Carousel & Hero
  carouselImages?: string[]; carouselHeight?: number; carouselRadius?: number; showThumbnails?: boolean;

  // Features
  featuresTitle?: string; featuresTitleFont?: string; featuresTitleColor?: string; featuresCols?: number; featuresItems?: FeatureItem[];

  // Two-col
  twoColRatio?: string; twoColGap?: number; twoColLeftType?: "text" | "image"; twoColLeftText?: string; twoColLeftFont?: string; twoColLeftSize?: number; twoColLeftWeight?: string; twoColLeftColor?: string; twoColLeftAlign?: string; twoColLeftImg?: string; twoColRightType?: "text" | "image"; twoColRightText?: string; twoColRightFont?: string; twoColRightSize?: number; twoColRightWeight?: string; twoColRightColor?: string; twoColRightAlign?: string; twoColRightImg?: string;

  // Divider / Spacer
  dividerColor?: string;
  dividerThickness?: number;
  spacerHeight?: number;

  // CTA Block props
  ctaTitle?: string; ctaSubtitle?: string; ctaPrice?: string; ctaBtnText?: string; ctaBtnColor?: string; ctaBtnTextColor?: string; ctaTitleFont?: string; ctaTitleColor?: string; ctaSubtitleColor?: string; ctaAlign?: string;
}

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

type SectionType =
  | "game-hero"
  | "game-header"
  | "ownership-banner"
  | "about-game"
  | "system-reqs"
  | "user-reviews"
  | "sidebar-cta"
  | "sidebar-info"
  | "sidebar-ratings"
  | "sidebar-community"
  | "recommendations"
  | "heading"
  | "text"
  | "image"
  | "button"
  | "carousel"
  | "features"
  | "two-col"
  | "grid"
  | "divider"
  | "spacer"
  | "cta";

type Device = "desktop" | "tablet" | "mobile";

interface FeatureItem { icon: string; title: string; desc: string; color: string; }

export interface PageSettings {
  bg: string;
  bgImage?: string;
  bgSize?: string;
  bgPosition?: string;
  bgRepeat?: string;
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
  bgImage: "",
  bgSize: "cover",
  bgPosition: "center center",
  bgRepeat: "no-repeat",
  bgOverlay: "transparent",
  bgOverlayOpacity: 0,
  titleFont: "'Cinzel', serif",
  textFont: "'Raleway', sans-serif",
  accentColor: HATHOR_ORANGE,
  padTop: 0,
  padBottom: 40,
  padLeft: 0,
  padRight: 0,
};

interface Section {
  id: string; type: SectionType;
  bg: string; bgImage?: string; bgSize?: string; bgPosition?: string; bgRepeat?: string; bgOverlay?: string; bgOverlayOpacity?: number; overlay: number;
  pt: number; pb: number; ph: number; pl?: number; pr?: number; mb?: number; radius: number;
  borderTopColor?: string;
  // Game Hero
  heroImages?: string[]; heroHeight?: number; showThumbnails?: boolean;
  // Game Header
  gameCategory?: string; gameTitle?: string; gameSubtitle?: string;
  gameRatingScore?: number; gameReviewCount?: string; gameDev?: string;
  gameReleaseDate?: string; gameTags?: string[]; gameDesc?: string;
  // Ownership Banner
  ownershipStatus?: string; ownershipSub?: string;
  ownershipBtn1?: string; ownershipBtn2?: string;
  // About Game
  aboutTitle?: string;
  aboutSections?: { title: string; text: string; img?: string }[];
  // System Reqs
  reqsMin?: { os: string; cpu: string; ram: string; gpu: string; storage: string };
  reqsRec?: { os: string; cpu: string; ram: string; gpu: string; storage: string };
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
  sidebarPrice?: string; sidebarDiscount?: number; sidebarOwned?: boolean;
  // Sidebar Info
  sideDev?: string; sidePub?: string; sideDate?: string;
  sideGenre?: string; sidePlatforms?: string[];
  // Sidebar Ratings
  sideRatings?: { stars: number; pct: number }[];
  // Sidebar Community
  sideOwners?: string; sidePositive?: string;
  // Recommendations
  recsTitle?: string; recsItems?: RecItem[]; recsCount?: number; recsCardBg?: string; recsCardBorder?: string;
  // Text
  textContent?: string; textFont?: string; textSize?: number;
  textWeight?: string; textColor?: string; textAlign?: string;
  textLineHeight?: number; textMaxWidth?: number;
  // Image
  imageSrc?: string; imageAlt?: string; imageRadius?: number;
  imageMaxWidth?: number; imageShadow?: boolean;
  // Carousel
  carouselImages?: string[]; carouselHeight?: number; carouselRadius?: number;
  // Features
  featuresTitle?: string; featuresTitleFont?: string; featuresTitleColor?: string;
  featuresCols?: number; featuresItems?: FeatureItem[];
  // Two-col
  twoColRatio?: string; twoColGap?: number;
  twoColLeftType?: "text" | "image"; twoColLeftText?: string; twoColLeftFont?: string;
  twoColLeftSize?: number; twoColLeftWeight?: string; twoColLeftColor?: string;
  twoColLeftAlign?: string; twoColLeftImg?: string;
  twoColRightType?: "text" | "image"; twoColRightText?: string; twoColRightFont?: string;
  twoColRightSize?: number; twoColRightWeight?: string; twoColRightColor?: string;
  twoColRightAlign?: string; twoColRightImg?: string;
  // Custom Grid
  gridCols?: GridColumn[];
  gridGap?: number;
  gridTemplate?: string;
  // Divider
  dividerColor?: string; dividerStyle?: string; dividerThickness?: number; dividerWidth?: number;
  // Spacer
  spacerHeight?: number;
  // CTA
  ctaTitle?: string; ctaSubtitle?: string; ctaPrice?: string;
  ctaBtnText?: string; ctaBtnColor?: string; ctaBtnTextColor?: string;
  ctaTitleFont?: string; ctaTitleColor?: string; ctaSubtitleColor?: string; ctaAlign?: string;
}

// ── ID generator ──────────────────────────────────────────────────────────────
let _seq = 1000;
function uid() { return `sec_${Date.now()}_${++_seq}`; }

// ── Default element factory ────────────────────────────────────────────────────
function createGridElement(type: ElementType): GridElement {
  const id = uid();
  switch (type) {
    case "game-header": return {
      id, type,
      gameCategory: "ACTION RPG", gameTitle: "ELDEN THRONE", gameSubtitle: "SHATTERED LANDS EDITION",
      gameRatingScore: 9.4, gameReviewCount: "14.2k Reviews", gameDev: "Omegabyte Studios", gameReleaseDate: "March 15, 2025",
      gameTags: ["OPEN WORLD", "SOULSLIKE", "DARK FANTASY", "SINGLE PLAYER", "RPG", "ATMOSPHERIC"],
      gameDesc: "A vast open-world experience set in ELDEN THRONE. Forge your path, face relentless enemies, and uncover ancient secrets behind the kingdom's collapse."
    };
    case "ownership-banner": return {
      id, type,
      ownershipStatus: "YOU OWN THIS GAME", ownershipSub: "Purchased Jun 10, 2025 • Available in your library",
      ownershipBtn1: "DOWNLOAD", ownershipBtn2: "GO TO LIBRARY"
    };
    case "about-game": return {
      id, type, aboutTitle: "ABOUT THIS GAME",
      aboutSections: [
        { title: "A KINGDOM IN RUIN", text: "The First Realm has fallen. Once proud bastions of civilization now lie buried beneath ash and shadow. As an Elden-seeker, your journey will take you across vast broken continents to claim ancient relics." },
        { title: "OPEN WORLD, OPEN CONSEQUENCE", text: "Explore interconnected dungeons, forgotten ruins, and dynamic storm zones. Every decision alters local factions and shapes the world's ultimate fate.", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" },
        { title: "COMBAT BUILT ON PATIENCE", text: "Master 200+ unique weapons across 8 battle disciplines. Timed parries, stamina management, and positional spellcasting demand precision in every skirmish." },
        { title: "A LORE YOU UNCOVER, NOT RECEIVE", text: "The story of Elden Throne is not delivered in cutscenes. It lives in item descriptions, in the architecture of collapsed halls, in the dialogue fragments of NPCs who trust you only after you have earned it.", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop" }
      ]
    };
    case "system-reqs": return {
      id, type,
      reqsMin: { os: "Windows 10 (64-bit)", cpu: "Intel Core i5-8400 / AMD Ryzen 5 2600", ram: "12 GB RAM", gpu: "NVIDIA GeForce GTX 1070 (8GB) / AMD Radeon RX 590", storage: "85 GB Available Space" },
      reqsRec: { os: "Windows 11 (64-bit)", cpu: "Intel Core i7-12700K / AMD Ryzen 7 7800X3D", ram: "16 GB RAM", gpu: "NVIDIA GeForce RTX 4070 (12GB) / AMD Radeon RX 7800 XT", storage: "85 GB NVMe SSD" }
    };
    case "user-reviews": return {
      id, type,
      reviewHeader: "USER REVIEWS",
      reviewCardBg: "#181c24",
      reviewCardBorder: BORDER,
      reviewCardRadius: 4,
      reviewNameColor: TEXT_PRIMARY,
      reviewNameFont: "'Cinzel', serif",
      reviewBodyColor: TEXT_MUTED,
      reviewBodyFont: "'Raleway', sans-serif",
      reviewStarColor: HATHOR_ORANGE,
      reviewBadgeBg: "rgba(46, 204, 113, 0.06)",
      reviewBadgeColor: "#2ecc71",
    };
    case "sidebar-cta": return { id, type, sidebarOwned: true, sidebarPrice: "299.99", sidebarDiscount: 10 };
    case "sidebar-info": return { id, type, sideDev: "Irongate Studios", sidePub: "Obsidian Arc", sideDate: "March 12, 2025", sideGenre: "Action RPG", sidePlatforms: ["Windows, macOS"] };
    case "sidebar-ratings": return { id, type, sideRatings: [{ stars: 5, pct: 82 }, { stars: 4, pct: 12 }, { stars: 3, pct: 4 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 }] };
    case "sidebar-community": return { id, type, sideOwners: "250,000+", sidePositive: "94%" };
    case "heading": return { id, type, text: "Heading Text", font: "'Cinzel', serif", size: 22, weight: "700", color: "#ffffff", align: "left", letterSpacing: "0.04em", textTransform: "uppercase" };
    case "text": return { id, type, text: "Add paragraph text here. Customize text, fonts, colors, and line height.", font: "'Raleway', sans-serif", size: 14, weight: "400", color: TEXT_MUTED, align: "left", lineHeight: 1.65, textTransform: "none" };
    case "image": return { id, type, imageSrc: `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop`, imageAlt: "Game screenshot", imageMaxWidth: 100, imageRadius: 4 };
    case "button": return { id, type, btnText: "DOWNLOAD NOW", btnBg: GREEN_ACCENT, btnColor: "#0e1116", btnIcon: "download", fullWidth: true, align: "center", btnRadius: 3, btnPaddingV: 12, btnPaddingH: 16, letterSpacing: "0.12em" };
    case "carousel": return {
      id, type,
      carouselImages: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop"
      ],
      carouselHeight: 320,
      showThumbnails: true
    };
    case "features": return {
      id, type,
      featuresTitle: "KEY FEATURES",
      featuresCols: 3,
      featuresItems: [
        { icon: "⚔️", title: "SOULSLIKE COMBAT", desc: "Master stamina and dodges.", color: HATHOR_ORANGE },
        { icon: "🗺️", title: "VAST WORLD", desc: "Explore dungeons and zones.", color: HATHOR_ORANGE },
        { icon: "🔥", title: "EPIC BOSSES", desc: "Skirmishes with guardians.", color: HATHOR_ORANGE }
      ]
    };
    case "recommendations": return { id, type, recsTitle: "MORE LIKE THIS", recsCount: 4 };
    case "game-hero": return {
      id, type,
      heroImages: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"
      ],
      heroHeight: 360,
      showThumbnails: true
    };
    case "two-col": return {
      id, type,
      twoColRatio: "1:1",
      twoColGap: 24,
      twoColLeftText: "Discover ancient lore buried beneath the ashes.",
      twoColLeftFont: "'Raleway', sans-serif",
      twoColLeftSize: 14,
      twoColLeftColor: TEXT_MUTED,
      twoColRightImg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"
    };
    case "cta": return {
      id, type,
      ctaTitle: "PRE-ORDER NOW",
      ctaSubtitle: "Get exclusive pre-order armor set.",
      ctaBtnText: "BUY NOW",
      ctaBtnColor: HATHOR_ORANGE,
      ctaBtnTextColor: "#ffffff"
    };
    case "divider": return { id, type, dividerColor: BORDER, dividerThickness: 1 };
    case "spacer": return { id, type, spacerHeight: 30 };
    default: return { id, type };
  }
}

// ── Default section factory ────────────────────────────────────────────────────
function createSection(type: SectionType): Section {
  const base = { id: uid(), bg: "transparent", bgImage: "", overlay: 0, pt: 0, pb: 0, ph: 0, radius: 0 };
  switch (type) {
    case "game-hero": return {
      ...base, type, pt: 0, pb: 0, ph: 0, bg: "transparent",
      heroImages: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
      ],
      heroHeight: 480,
    };
    case "text": return {
      ...base, type, pt: 32, pb: 32, ph: 32,
      textContent: "Add paragraph text here. Customize fonts, sizes, colors, alignment, and max width in the Properties inspector.",
      textFont: "'Raleway', sans-serif", textSize: 16, textWeight: "400", textColor: TEXT_MUTED, textAlign: "left", textLineHeight: 1.65, textMaxWidth: 700
    };
    case "image": return {
      ...base, type, pt: 32, pb: 32, ph: 32,
      imageSrc: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
      imageAlt: "Game screenshot", imageMaxWidth: 100, imageRadius: 4, imageShadow: true
    };
    case "features": return {
      ...base, type, pt: 40, pb: 60, ph: 32,
      featuresTitle: "KEY FEATURES", featuresTitleFont: "'Cinzel', serif", featuresTitleColor: "#ffffff", featuresCols: 3,
      featuresItems: [
        { icon: "⚔️", title: "UNFORGIVING COMBAT", desc: "Master 200+ weapons and stamina management.", color: HATHOR_ORANGE },
        { icon: "🗺️", title: "VAST OPEN WORLD", desc: "Explore interconnected dungeons and storm zones.", color: HATHOR_ORANGE },
        { icon: "🔥", title: "EPIC BOSS BATTLES", desc: "Face legendary guardians in multi-phase skirmishes.", color: HATHOR_ORANGE }
      ]
    };
    case "cta": return {
      ...base, type, pt: 48, pb: 48, ph: 32,
      ctaTitle: "PRE-ORDER ELDEN THRONE", ctaSubtitle: "Get exclusive pre-order armor set and digital soundtrack.",
      ctaPrice: "299.99 EGP", ctaBtnText: "BUY NOW", ctaBtnColor: HATHOR_ORANGE, ctaBtnTextColor: "#ffffff",
      ctaTitleFont: "'Cinzel', serif", ctaTitleColor: "#ffffff", ctaSubtitleColor: TEXT_MUTED, ctaAlign: "center"
    };
    case "two-col": return {
      ...base, type, pt: 40, pb: 40, ph: 32,
      twoColRatio: "1:1", twoColGap: 40,
      twoColLeftText: "Discover ancient lore buried beneath the ashes of fallen sanctuaries in an interconnected world.",
      twoColLeftFont: "'Raleway', sans-serif", twoColLeftSize: 15, twoColLeftWeight: "400", twoColLeftColor: TEXT_MUTED,
      twoColRightImg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"
    };
    case "divider": return { ...base, type, pt: 20, pb: 20, ph: 32, dividerColor: BORDER, dividerThickness: 1, dividerWidth: 100 };
    case "spacer": return { ...base, type, pt: 0, pb: 0, ph: 0, spacerHeight: 40 };
    case "user-reviews": return {
      ...base, type, pt: 0, pb: 40, ph: 0, bg: "transparent",
      reviewHeader: "USER REVIEWS",
      reviewCardBg: SURFACE, reviewCardBorder: BORDER, reviewCardRadius: 4,
      reviewNameColor: TEXT_PRIMARY, reviewNameFont: "'Cinzel', serif",
      reviewBodyColor: TEXT_MUTED, reviewBodyFont: "'Raleway', sans-serif",
      reviewStarColor: HATHOR_ORANGE, reviewBadgeBg: "rgba(46, 204, 113, 0.06)", reviewBadgeColor: "#2ecc71",
    };
    case "recommendations": return {
      ...base, type, pt: 32, pb: 48, ph: 0, bg: "transparent",
      recsTitle: "MORE LIKE THIS", recsCount: 4, recsCardBg: SURFACE, recsCardBorder: BORDER
    };
    case "grid": return {
      ...base, type, bg: "transparent", pt: 40, pb: 60, ph: 40, gridGap: 40, gridTemplate: "2:1",
      gridCols: [
        { id: uid(), bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0, elements: [] },
        { id: uid(), bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0, elements: [] },
      ]
    };
    default: return { ...base, type };
  }
}

// ── Preset initial page ──
const INITIAL: Section[] = [
  {
    id: "sec_game_hero", type: "game-hero",
    bg: "transparent", bgImage: "", overlay: 0, pt: 0, pb: 0, ph: 0, radius: 0,
    heroImages: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
    ],
    heroHeight: 480,
  },
  {
    id: "sec_main_layout", type: "grid",
    bg: "transparent", bgImage: "", overlay: 0, pt: 32, pb: 48, ph: 32, radius: 0,
    gridGap: 40,
    gridTemplate: "2:1",
    gridCols: [
      {
        id: "col_left", bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0,
        elements: [
          createGridElement("game-header"),
          createGridElement("ownership-banner"),
          createGridElement("about-game"),
          createGridElement("system-reqs"),
          createGridElement("user-reviews"),
        ]
      },
      {
        id: "col_right", bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0,
        elements: [
          createGridElement("sidebar-cta"),
          createGridElement("sidebar-info"),
          createGridElement("sidebar-ratings"),
          createGridElement("sidebar-community"),
        ]
      }
    ]
  },
  {
    id: "sec_recs_bottom", type: "recommendations",
    bg: "transparent", bgImage: "", overlay: 0, pt: 32, pb: 48, ph: 32, radius: 0,
    recsTitle: "MORE LIKE THIS",
    recsCount: 4,
    recsCardBg: SURFACE,
    recsCardBorder: BORDER
  }
];

// ── Palette config ────────────────────────────────────────────────────────────
const PALETTE: { group: string; items: { type: SectionType | ElementType; label: string; desc: string; Icon: LucideIcon }[] }[] = [
  {
    group: "Game Details Components",
    items: [
      { type: "game-hero", label: "Media Showcase", desc: "Top hero slider & thumbnail strip", Icon: Film },
      { type: "game-header", label: "Game Header", desc: "Title, rating, dev, tags & synopsis", Icon: Award },
      { type: "system-reqs", label: "System Reqs", desc: "Min vs Recommended specifications", Icon: MonitorCheck },
      { type: "about-game", label: "About Section", desc: "Game lore, features & screenshots", Icon: Info },
      { type: "ownership-banner", label: "Ownership Bar", desc: "Owned status & buy/download actions", Icon: ShoppingBag },
      { type: "user-reviews", label: "User Reviews", desc: "Reviews list & star ratings", Icon: MessageSquare },
      { type: "recommendations", label: "More Like This", desc: "Recommended similar games grid", Icon: LayoutGrid },
    ],
  },
  {
    group: "Sidebar Components",
    items: [
      { type: "sidebar-cta", label: "Sidebar Purchase Card", desc: "Price, discount & Add to Cart", Icon: ShoppingCart },
      { type: "sidebar-info", label: "Sidebar Game Info", desc: "Dev, publisher, date & platforms", Icon: Info },
      { type: "sidebar-ratings", label: "Sidebar Ratings", desc: "5-star rating progress bars", Icon: BarChart2 },
      { type: "sidebar-community", label: "Sidebar Community", desc: "Players count & positive rating %", Icon: Users },
    ],
  },
  {
    group: "Layout & Grids",
    items: [
      { type: "grid", label: "Multi-Column Layout", desc: "Custom 1, 2, 3, or 4 column grid", Icon: LayoutGrid },
      { type: "two-col", label: "Two Columns Preset", desc: "Preset side-by-side content", Icon: Layers },
    ],
  },
  {
    group: "Media & Content",
    items: [
      { type: "text", label: "Text Block", desc: "Paragraph or heading text", Icon: Type },
      { type: "image", label: "Image Block", desc: "Single image / screenshot", Icon: ImageIcon },
      { type: "features", label: "Features Grid", desc: "Icon feature cards", Icon: LayoutGrid },
      { type: "cta", label: "CTA Block", desc: "Price & buy banner", Icon: Zap },
      { type: "divider", label: "Divider", desc: "Horizontal divider line", Icon: Minus },
      { type: "spacer", label: "Spacer", desc: "Vertical spacing block", Icon: Hash },
    ],
  },
];

const BLOCK_META: Record<string, { label: string; Icon: LucideIcon }> = {
  "game-hero": { label: "Media Showcase Hero", Icon: Film },
  "game-header": { label: "Game Header", Icon: Award },
  "ownership-banner": { label: "Ownership Bar", Icon: ShoppingBag },
  "about-game": { label: "About Game", Icon: Info },
  "system-reqs": { label: "System Reqs", Icon: MonitorCheck },
  "user-reviews": { label: "User Reviews", Icon: MessageSquare },
  "sidebar-cta": { label: "Sidebar Purchase Card", Icon: ShoppingCart },
  "sidebar-info": { label: "Sidebar Game Info", Icon: Info },
  "sidebar-ratings": { label: "Sidebar Ratings", Icon: BarChart2 },
  "sidebar-community": { label: "Sidebar Community", Icon: Users },
  recommendations: { label: "More Like This", Icon: LayoutGrid },
  text: { label: "Text Block", Icon: Type },
  image: { label: "Image Block", Icon: ImageIcon },
  carousel: { label: "Carousel Showcase", Icon: Film },
  features: { label: "Features Grid", Icon: LayoutGrid },
  "two-col": { label: "Two Columns Preset", Icon: Layers },
  grid: { label: "Multi-Column Layout", Icon: LayoutGrid },
  divider: { label: "Divider", Icon: Minus },
  spacer: { label: "Spacer", Icon: Hash },
  cta: { label: "CTA Block", Icon: Zap },
};

// ── Property control helpers ───────────────────────────────────────────────────
function PropSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.propSection}>
      <p className={styles.propSectionTitle}>{title}</p>
      <div className={styles.propSectionContent}>{children}</div>
    </div>
  );
}
function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.propRow}>
      <p className={styles.propLabel}>{label}</p>
      {children}
    </div>
  );
}

// ── Solid & Gradient Color Selector Component ─────────────────────────────────
function ColorField({ value, onChange, placeholder = "#000000 or transparent" }: { value: string; onChange: (v: string, skipHistory?: boolean) => void; placeholder?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"solid" | "gradient">(value && value.includes("gradient") ? "gradient" : "solid");
  const isTransparent = !value || value === "transparent";

  const popoverRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Gradient state
  const [gradAngle, setGradAngle] = useState(135);
  const [gradColor1, setGradColor1] = useState(HATHOR_ORANGE);
  const [gradColor2, setGradColor2] = useState("#141820");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const initialHsv = hexToHsv(value && value.startsWith("#") ? value : HATHOR_ORANGE);
  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);

  useEffect(() => {
    if (value && value.startsWith("#")) {
      const hsv = hexToHsv(value);
      setHue(hsv.h);
      setSat(hsv.s);
      setVal(hsv.v);
      setMode("solid");
    } else if (value && value.includes("gradient")) {
      setMode("gradient");
    }
  }, [value]);

  const pureHueHex = hsvToHex(hue, 100, 100);

  const handleRectPointer = (e: React.MouseEvent<HTMLDivElement> | MouseEvent, skipHistory = true) => {
    if (!rectRef.current) return;
    const rect = rectRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const newSat = Math.round((x / rect.width) * 100);
    const newVal = Math.round((1 - y / rect.height) * 100);

    setSat(newSat);
    setVal(newVal);
    onChange(hsvToHex(hue, newSat, newVal), skipHistory);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    handleRectPointer(e, true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        handleRectPointer(moveEvent, true);
      }
    };
    const handleMouseUp = (upEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        handleRectPointer(upEvent, false);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const updateCustomGradient = (angle: number, c1: string, c2: string, skipHistory = false) => {
    setGradAngle(angle);
    setGradColor1(c1);
    setGradColor2(c2);
    onChange(`linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`, skipHistory);
  };

  const PRESETS = [
    "transparent",
    HATHOR_ORANGE, GOLD_ACCENT, GREEN_ACCENT, "#2ecc71",
    "#3498db", "#9b59b6", "#e74c3c", BG,
    SURFACE, "#0a0d14", "#222831", "#e6edf3",
    "#ffffff"
  ];

  const GRADIENTS = [
    { label: "Hathor Orange", val: `linear-gradient(135deg, ${HATHOR_ORANGE}, #f4b183)` },
    { label: "Dark Obsidian", val: "linear-gradient(135deg, #212631, #0a0d14)" },
    { label: "Mint Cyber", val: "linear-gradient(135deg, #38d39f, #2ecc71)" },
    { label: "Golden Fire", val: `linear-gradient(135deg, #f4b183, ${HATHOR_ORANGE})` },
    { label: "Deep Emerald", val: "linear-gradient(180deg, #141820 0%, #2ecc71 100%)" },
    { label: "Neon Violet", val: "linear-gradient(135deg, #9b59b6, #3498db)" },
  ];

  return (
    <div className={styles.colorField} style={{ position: "relative" }} ref={popoverRef}>
      <button
        type="button"
        title="Click to open Hathor color/gradient selector"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 24, height: 24, borderRadius: 4,
          background: isTransparent ? "repeating-conic-gradient(#2a303c 0% 25%, #161a22 0% 50%) 50% / 8px 8px" : value,
          border: isOpen ? `1px solid ${HATHOR_ORANGE}` : "1px solid rgba(255, 255, 255, 0.25)",
          cursor: "pointer", position: "relative", overflow: "hidden",
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isOpen ? `0 0 10px ${HATHOR_ORANGE}` : "0 2px 6px rgba(0,0,0,0.4)",
          transition: "all 0.15s ease",
          outline: "none"
        }}
      />
      <input
        type="text"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className={styles.colorInput}
        placeholder={placeholder}
      />

      {/* Popover Modal */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          zIndex: 99999,
          width: 260,
          background: "#1C2028",
          border: `1px solid rgba(242, 107, 33, 0.55)`,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9)",
          borderRadius: 6,
          padding: 14,
          fontFamily: "'Inter', sans-serif"
        }} onClick={e => e.stopPropagation()}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, borderBottom: "1px solid #393E46", paddingBottom: 6 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 800, color: HATHOR_ORANGE, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              COLOR SELECTOR
            </span>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "#8C9AAA", cursor: "pointer", display: "flex", padding: 2 }}>
              <X size={14} />
            </button>
          </div>

          {/* Explicit Transparent Button */}
          <button
            type="button"
            onClick={() => { onChange("transparent", false); setIsOpen(false); }}
            style={{
              width: "100%",
              padding: "7px 10px",
              marginBottom: 10,
              borderRadius: 4,
              background: "repeating-conic-gradient(#2a303c 0% 25%, #161a22 0% 50%) 50% / 10px 10px",
              border: isTransparent ? `2px solid ${HATHOR_ORANGE}` : "1px solid rgba(255,255,255,0.2)",
              color: "#ffffff",
              fontSize: 10,
              fontFamily: "monospace",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              outline: "none"
            }}
          >
            <Droplet size={12} /> CLEAR / SET TO TRANSPARENT
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "#141820", padding: 3, borderRadius: 4, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setMode("solid")}
              style={{
                background: mode === "solid" ? HATHOR_ORANGE : "transparent",
                color: mode === "solid" ? "#ffffff" : "#8C9AAA",
                border: "none", borderRadius: 3, padding: "5px 0", fontSize: 10,
                fontFamily: "monospace", fontWeight: 800, cursor: "pointer", transition: "all 0.15s ease"
              }}
            >
              SOLID COLOR
            </button>
            <button
              type="button"
              onClick={() => setMode("gradient")}
              style={{
                background: mode === "gradient" ? HATHOR_ORANGE : "transparent",
                color: mode === "gradient" ? "#ffffff" : "#8C9AAA",
                border: "none", borderRadius: 3, padding: "5px 0", fontSize: 10,
                fontFamily: "monospace", fontWeight: 800, cursor: "pointer", transition: "all 0.15s ease"
              }}
            >
              GRADIENT
            </button>
          </div>

          {mode === "solid" && (
            <>
              <div
                ref={rectRef}
                onMouseDown={handleMouseDown}
                style={{
                  position: "relative",
                  width: "100%",
                  height: 130,
                  borderRadius: 4,
                  cursor: "crosshair",
                  overflow: "hidden",
                  marginBottom: 10,
                  background: `linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, ${pureHueHex})`,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${sat}%`,
                    top: `${100 - val}%`,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "2px solid #ffffff",
                    boxShadow: "0 0 4px rgba(0,0,0,0.8)",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "monospace", color: "#8C9AAA", marginBottom: 3 }}>
                  <span>HUE RAINBOW</span>
                  <span style={{ color: HATHOR_ORANGE }}>{hue}°</span>
                </div>
                <input
                  type="range" min={0} max={360} value={hue}
                  onChange={e => {
                    const newHue = Number(e.target.value);
                    setHue(newHue);
                    onChange(hsvToHex(newHue, sat, val), true);
                  }}
                  onMouseUp={() => onChange(hsvToHex(hue, sat, val), false)}
                  onTouchEnd={() => onChange(hsvToHex(hue, sat, val), false)}
                  style={{
                    width: "100%", height: 8, borderRadius: 4, appearance: "none", outline: "none", cursor: "pointer",
                    background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 9, fontFamily: "monospace", color: "#8C9AAA", marginBottom: 4, textTransform: "uppercase" }}>
                  Theme Swatches
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx} type="button" onClick={() => { onChange(p, false); if (p === "transparent") setIsOpen(false); }}
                      style={{
                        width: "100%", aspectRatio: "1", borderRadius: 3,
                        background: p === "transparent" ? "repeating-conic-gradient(#2a303c 0% 25%, #161a22 0% 50%) 50% / 6px 6px" : p,
                        border: (value === p || (p === "transparent" && isTransparent)) ? `2px solid ${HATHOR_ORANGE}` : "1px solid rgba(255,255,255,0.15)",
                        cursor: "pointer", outline: "none", padding: 0
                      }}
                      title={p === "transparent" ? "Transparent" : p}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === "gradient" && (
            <>
              <div style={{
                height: 48, borderRadius: 4, background: value || `linear-gradient(135deg, ${HATHOR_ORANGE}, #f4b183)`,
                border: "1px solid rgba(255,255,255,0.15)", marginBottom: 12, boxShadow: "inset 0 0 8px rgba(0,0,0,0.5)"
              }} />

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "monospace", color: "#8C9AAA", marginBottom: 4 }}>
                  <span>GRADIENT ANGLE</span>
                  <span style={{ color: HATHOR_ORANGE }}>{gradAngle}°</span>
                </div>
                <input
                  type="range" min={0} max={360} step={5} value={gradAngle}
                  onChange={e => updateCustomGradient(Number(e.target.value), gradColor1, gradColor2, true)}
                  onMouseUp={() => updateCustomGradient(gradAngle, gradColor1, gradColor2, false)}
                  onTouchEnd={() => updateCustomGradient(gradAngle, gradColor1, gradColor2, false)}
                  style={{
                    width: "100%", height: 8, borderRadius: 4, appearance: "none", outline: "none", cursor: "pointer",
                    background: `linear-gradient(to right, #393E46, ${HATHOR_ORANGE})`
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 9, fontFamily: "monospace", color: "#8C9AAA", marginBottom: 3 }}>START COLOR</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#141820", border: "1px solid #393E46", padding: 4, borderRadius: 3 }}>
                    <input type="color" value={gradColor1.startsWith("#") ? gradColor1 : HATHOR_ORANGE} onChange={e => updateCustomGradient(gradAngle, e.target.value, gradColor2)} style={{ width: 18, height: 18, border: "none", padding: 0, background: "transparent", cursor: "pointer" }} />
                    <input type="text" value={gradColor1} onChange={e => updateCustomGradient(gradAngle, e.target.value, gradColor2)} style={{ width: "100%", background: "transparent", border: "none", color: TEXT_PRIMARY, fontSize: 9, fontFamily: "monospace", outline: "none" }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontFamily: "monospace", color: "#8C9AAA", marginBottom: 3 }}>END COLOR</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#141820", border: "1px solid #393E46", padding: 4, borderRadius: 3 }}>
                    <input type="color" value={gradColor2.startsWith("#") ? gradColor2 : "#141820"} onChange={e => updateCustomGradient(gradAngle, gradColor1, e.target.value)} style={{ width: 18, height: 18, border: "none", padding: 0, background: "transparent", cursor: "pointer" }} />
                    <input type="text" value={gradColor2} onChange={e => updateCustomGradient(gradAngle, gradColor1, e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: TEXT_PRIMARY, fontSize: 9, fontFamily: "monospace", outline: "none" }} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontFamily: "monospace", color: "#8C9AAA", marginBottom: 6, textTransform: "uppercase" }}>
                  Gradient Presets
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {GRADIENTS.map((g, idx) => (
                    <button
                      key={idx} type="button" onClick={() => onChange(g.val)}
                      style={{
                        background: g.val, border: value === g.val ? `1px solid ${HATHOR_ORANGE}` : "1px solid #393E46",
                        color: "#ffffff", padding: "6px 8px", borderRadius: 3, fontSize: 9, fontFamily: "monospace",
                        fontWeight: 700, cursor: "pointer", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", outline: "none"
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: 10, paddingTop: 6, borderTop: "1px solid #393E46", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 2, background: value || "transparent", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontFamily: "monospace", color: HATHOR_ORANGE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {value || "#000000"}
            </span>
          </div>

        </div>
      )}
    </div>
  );
}

function NumField({ value, onChange, min = 0, max = 9999, step = 1, unit }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string;
}) {
  const [localVal, setLocalVal] = useState<string>(String(value ?? 0));

  useEffect(() => {
    setLocalVal(String(value ?? 0));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalVal(raw);
    if (raw === "" || raw === "-") return;
    const num = Number(raw);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    }
  };

  const handleBlur = () => {
    if (localVal === "" || localVal === "-" || isNaN(Number(localVal))) {
      setLocalVal(String(value ?? min));
    } else {
      const num = Math.min(max, Math.max(min, Number(localVal)));
      setLocalVal(String(num));
      onChange(num);
    }
  };

  return (
    <div className={styles.numField}>
      <button
        type="button"
        onClick={() => {
          const current = Number(localVal) || value || 0;
          const next = Math.max(min, +(current - step).toFixed(2));
          setLocalVal(String(next));
          onChange(next);
        }}
        className={styles.numBtn}
      >
        −
      </button>
      <input
        type="number"
        value={localVal}
        onChange={handleChange}
        onBlur={handleBlur}
        className={styles.numInput}
        min={min}
        max={max}
        step={step}
      />
      {unit && <span className={styles.unitSpan}>{unit}</span>}
      <button
        type="button"
        onClick={() => {
          const current = Number(localVal) || value || 0;
          const next = Math.min(max, +(current + step).toFixed(2));
          setLocalVal(String(next));
          onChange(next);
        }}
        className={styles.numBtn}
      >
        +
      </button>
    </div>
  );
}
function TxtInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className={styles.txtInput}>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function TxtArea({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className={styles.txtArea}>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} />
    </div>
  );
}
function SelField({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[];
}) {
  return (
    <div className={styles.selField}>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: SURFACE, color: TEXT_PRIMARY }}>{o.label}</option>)}
      </select>
    </div>
  );
}
function AlignField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.alignGroup}>
      {(["left", "center", "right"] as const).map(a => {
        const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
        const isActive = value === a;
        return (
          <button key={a} onClick={() => onChange(a)}
            className={`${styles.alignBtn} ${isActive ? styles.alignBtnActive : ""}`}>
            <Icon size={11} />
          </button>
        );
      })}
    </div>
  );
}

function MediaManagerList({ items = [], onChange, label = "Media Items" }: { items: any[]; onChange: (items: any[]) => void; label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
      <p className={styles.propLabel}>{label} ({items.length})</p>
      {items.map((item: any, i: number) => {
        const isObj = typeof item === "object";
        const type = isObj ? (item.type || (isMediaVideo(item) ? "video" : "image")) : (isMediaVideo(item) ? "video" : "image");
        const url = getMediaUrl(item);
        const poster = getMediaPoster(item);

        return (
          <div key={i} style={{ border: `1px solid ${BORDER}`, padding: 8, background: "rgba(20, 24, 32, 0.6)", borderRadius: 4, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: HATHOR_ORANGE, display: "flex", alignItems: "center", gap: 4 }}>
                {type === "video" ? <Film size={11} /> : <ImageIcon size={11} />}
                Item #{i + 1} ({type.toUpperCase()})
              </span>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))}
                style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER}`, background: "transparent", color: TEXT_MUTED, cursor: "pointer", borderRadius: 2 }}>
                <X size={10} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <SelField
                value={type}
                onChange={t => {
                  const copy = [...items];
                  copy[i] = { type: t, url, poster };
                  onChange(copy);
                }}
                options={[{ label: "Image", value: "image" }, { label: "Video (MP4 / YT)", value: "video" }]}
              />
              <TxtInput
                value={url}
                onChange={u => {
                  const copy = [...items];
                  copy[i] = { type, url: u, poster };
                  onChange(copy);
                }}
                placeholder={type === "video" ? "https://...mp4 or YouTube" : "https://...jpg"}
              />
            </div>

            {type === "video" && (
              <TxtInput
                value={poster}
                onChange={p => {
                  const copy = [...items];
                  copy[i] = { type: "video", url, poster: p };
                  onChange(copy);
                }}
                placeholder="Optional Thumbnail Poster Image URL"
              />
            )}
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <button
          onClick={() => onChange([...items, { type: "image", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" }])}
          style={{ padding: 6, border: `1px dashed ${BORDER}`, background: "transparent", color: TEXT_MUTED, fontSize: 10, cursor: "pointer", borderRadius: 3 }}
        >
          + Add Image
        </button>
        <button
          onClick={() => onChange([...items, { type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop" }])}
          style={{ padding: 6, border: `1px dashed ${HATHOR_ORANGE}`, background: "rgba(242, 107, 33, 0.08)", color: HATHOR_ORANGE, fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}
        >
          + Add Video
        </button>
      </div>
    </div>
  );
}

function AlignmentGridPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = value || "center center";

  const gridOptions = [
    { label: "Top Left", value: "top left", alignY: "flex-start", alignX: "flex-start" },
    { label: "Top Center", value: "top center", alignY: "flex-start", alignX: "center" },
    { label: "Top Right", value: "top right", alignY: "flex-start", alignX: "flex-end" },
    { label: "Left Center", value: "left center", alignY: "center", alignX: "flex-start" },
    { label: "Center Center", value: "center center", alignY: "center", alignX: "center" },
    { label: "Right Center", value: "right center", alignY: "center", alignX: "flex-end" },
    { label: "Bottom Left", value: "bottom left", alignY: "flex-end", alignX: "flex-start" },
    { label: "Bottom Center", value: "bottom center", alignY: "flex-end", alignX: "center" },
    { label: "Bottom Right", value: "bottom right", alignY: "flex-end", alignX: "flex-end" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 6,
        background: "#141820",
        padding: 8,
        borderRadius: 6,
        border: "1px solid #2e3544"
      }}>
        {gridOptions.map(opt => {
          const isSelected = current.toLowerCase() === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              title={opt.label}
              style={{
                height: 36,
                borderRadius: 4,
                border: isSelected ? `2px solid ${HATHOR_ORANGE}` : "1px solid rgba(255,255,255,0.12)",
                background: isSelected ? "rgba(242, 107, 33, 0.22)" : "#1c212c",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
                padding: 4,
                outline: "none"
              }}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: 2,
                border: isSelected ? `1px solid ${HATHOR_ORANGE}` : "1px solid rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: opt.alignY as any,
                justifyContent: opt.alignX as any,
                padding: 2,
                boxSizing: "border-box"
              }}>
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: 1,
                  background: isSelected ? HATHOR_ORANGE : "rgba(255,255,255,0.7)"
                }} />
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "monospace", color: TEXT_MUTED }}>
        <span>Active Alignment:</span>
        <span style={{ color: HATHOR_ORANGE, fontWeight: 700, textTransform: "capitalize" }}>{current}</span>
      </div>
    </div>
  );
}

function isMediaVideo(item: any): boolean {
  if (!item) return false;
  if (typeof item === "object") {
    if (item.type === "video") return true;
    const url = item.url || item.src || "";
    return !!(url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com"));
  }
  if (typeof item === "string") {
    return !!(item.match(/\.(mp4|webm|ogg|mov)$/i) || item.includes("youtube.com") || item.includes("youtu.be") || item.includes("vimeo.com"));
  }
  return false;
}

function getMediaUrl(item: any): string {
  if (!item) return "";
  if (typeof item === "object") return item.url || item.src || "";
  return String(item);
}

function getMediaPoster(item: any): string {
  if (typeof item === "object" && item.poster) return item.poster;
  return "";
}



// ── Perfect Pixel Grid Renderer with Equal Stretching ─────────────────────────
function GridRenderer({ s, device, selectedColIdx, selectedElementId, onSelectChild, pageSettings }: {
  s: Section; device: Device; selectedColIdx?: number | null; selectedElementId?: string | null; onSelectChild?: (colIdx: number, elementId: string) => void; pageSettings?: PageSettings;
}) {
  const ratioMap: Record<string, string> = {
    "1": "1fr",
    "1:1": "1fr 1fr",
    "1:2": "1fr 2fr",
    "2:1": "1fr 340px",
    "1:1:1": "1fr 1fr 1fr",
    "1:2:1": "1fr 2fr 1fr",
    "2:1:1": "2fr 1fr 1fr",
    "1:1:2": "1fr 1fr 2fr",
    "1:1:1:1": "1fr 1fr 1fr 1fr",
  };

  const cols = s.gridCols || [];

  let template = ratioMap[s.gridTemplate || "2:1"] || `repeat(${cols.length || 1}, 1fr)`;
  if (device === "mobile") {
    template = "1fr";
  } else if (device === "tablet") {
    if (s.gridTemplate === "2:1" || s.gridTemplate === "1:2") template = "1fr 1fr";
    else if (s.gridTemplate === "1:1:1:1") template = "1fr 1fr";
  }

  const responsiveGap = device === "mobile" ? Math.min(s.gridGap || 40, 20) : (s.gridGap || 40);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: template,
      gap: responsiveGap,
      alignItems: "stretch",
      width: "100%",
      boxSizing: "border-box",
      transition: "all 0.25s ease"
    }}>
      {cols.map((col, cIdx) => {
        const isColSelected = selectedColIdx === cIdx;
        return (
          <div key={col.id}
            className={`${styles.gridColWrapper} ${isColSelected ? styles.gridColSelected : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectChild) onSelectChild(cIdx, "");
            }}
            style={{
              background: col.bg || "transparent",
              paddingTop: col.pt || 0, paddingBottom: col.pb || 0,
              paddingLeft: col.pl ?? col.ph ?? 0, paddingRight: col.pr ?? col.ph ?? 0,
              borderRadius: col.radius || 0,
              borderTop: col.borderTopColor ? `2px solid ${col.borderTopColor}` : "none",
              display: "flex", flexDirection: "column", gap: 16,
              height: "100%", minHeight: 80, minWidth: 0, boxSizing: "border-box"
            }}>
            {col.elements.length === 0 ? (
              <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "20px 12px", border: `1px dashed ${BORDER}`, borderRadius: 4,
                color: TEXT_MUTED, fontSize: 11, fontFamily: "monospace", width: "100%", boxSizing: "border-box"
              }}>
                Empty Column
              </div>
            ) : (
              col.elements.map(el => {
                const isElSelected = isColSelected && selectedElementId === el.id;
                return (
                  <div key={el.id}
                    className={`${styles.childElementWrapper} ${isElSelected ? styles.childElementSelected : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectChild) onSelectChild(cIdx, el.id);
                    }}
                    style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
                    {isElSelected && <span className={styles.childElementTag}>{el.type}</span>}

                    {el.type === "game-hero" && <GameDetailsHero s={el} device={device} />}
                    {el.type === "game-header" && <GameDetailsHeader s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "ownership-banner" && <GameOwnershipBanner s={el} device={device} />}
                    {el.type === "about-game" && <GameAbout s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "system-reqs" && <GameSystemReqs s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "user-reviews" && <GameReviews s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "sidebar-cta" && <GameSidebarCta s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "sidebar-info" && <GameSidebarInfo s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "sidebar-ratings" && <GameSidebarRatings s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "sidebar-community" && <GameSidebarCommunity s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "recommendations" && <MoreLikeThis s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "carousel" && <GameCarousel s={el as any} device={device} pageSettings={pageSettings} />}
                    {el.type === "features" && <GameFeatures s={el as any} device={device} pageSettings={pageSettings} />}
                    {el.type === "two-col" && <GameTwoCol s={el as any} device={device} pageSettings={pageSettings} />}
                    {el.type === "cta" && <GameCtaBlock s={el as any} device={device} pageSettings={pageSettings} />}

                    {el.type === "heading" && <HeadingRenderer s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "text" && <TextRenderer s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "image" && <ImageRenderer s={el} />}
                    {el.type === "button" && <ButtonRenderer s={el} />}
                    {el.type === "divider" && <DividerRenderer s={el} />}
                    {el.type === "spacer" && <SpacerRenderer s={el} />}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── Section wrapper with selection chrome ─────────────────────────────────────
function SectionWrapper({ section: s, device, pageSettings, selected, selectedColIdx, selectedElementId, isFirst, isLast, onSelect, onSelectChild, onMoveUp, onMoveDown, onDuplicate, onDelete }: {
  section: Section; device: Device; pageSettings?: PageSettings; selected: boolean;
  selectedColIdx?: number | null;
  selectedElementId?: string | null;
  isFirst: boolean; isLast: boolean;
  onSelect: () => void;
  onSelectChild?: (colIdx: number, elementId: string) => void;
  onMoveUp: () => void; onMoveDown: () => void;
  onDuplicate: () => void; onDelete: () => void;
}) {
  const responsivePt = device === "mobile" ? Math.min(s.pt, 20) : s.pt;
  const responsivePb = device === "mobile" ? Math.min(s.pb, 24) : s.pb;
  const leftPad = s.pl ?? s.ph ?? 0;
  const rightPad = s.pr ?? s.ph ?? 0;
  const responsivePl = device === "mobile" ? Math.min(leftPad, 16) : device === "tablet" ? Math.min(leftPad, 24) : leftPad;
  const responsivePr = device === "mobile" ? Math.min(rightPad, 16) : device === "tablet" ? Math.min(rightPad, 24) : rightPad;

  return (
    <div
      className={`${styles.sectionWrapper} ${selected ? styles.sectionSelected : ""}`}
      style={{
        backgroundColor: s.bg || "transparent",
        backgroundImage: s.bgImage ? `url("${s.bgImage}")` : undefined,
        backgroundSize: s.bgSize || "cover",
        backgroundPosition: s.bgPosition || "center center",
        backgroundRepeat: s.bgRepeat || "no-repeat",
        borderTop: s.borderTopColor ? `2px solid ${s.borderTopColor}` : "none",
        marginBottom: s.mb ?? 32,
        position: "relative",
      }}
    >
      {/* Background Image Overlay Tint */}
      {s.bgImage && (s.bgOverlay || s.bgOverlayOpacity !== undefined) && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: s.bgOverlay || "rgba(0,0,0,0.5)",
            opacity: s.bgOverlayOpacity ?? 0.5,
            pointerEvents: "none",
            zIndex: 0
          }}
        />
      )}

      {/* Floating Outer Section Handle Badge */}
      <div className={styles.sectionHandleBadge} onClick={e => { e.stopPropagation(); onSelect(); }}>
        <Layers size={11} />
        <span>Section: {BLOCK_META[s.type]?.label}</span>
      </div>

      <div style={{ position: "relative", zIndex: 1, paddingTop: responsivePt, paddingBottom: responsivePb, paddingLeft: responsivePl, paddingRight: responsivePr, borderRadius: s.radius, boxSizing: "border-box" }}>
        {s.type === "game-hero" && <GameDetailsHero s={s} device={device} />}
        {s.type === "game-header" && <GameDetailsHeader s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "ownership-banner" && <GameOwnershipBanner s={s} device={device} />}
        {s.type === "about-game" && <GameAbout s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "system-reqs" && <GameSystemReqs s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "user-reviews" && <GameReviews s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "sidebar-cta" && <GameSidebarCta s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "sidebar-info" && <GameSidebarInfo s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "sidebar-ratings" && <GameSidebarRatings s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "sidebar-community" && <GameSidebarCommunity s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "recommendations" && <MoreLikeThis s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "heading" && <HeadingRenderer s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "text" && <TextRenderer s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "image" && <ImageRenderer s={s} />}
        {s.type === "button" && <ButtonRenderer s={s} />}
        {s.type === "carousel" && <GameCarousel s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "features" && <GameFeatures s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "two-col" && <GameTwoCol s={s} device={device} pageSettings={pageSettings} />}
        {s.type === "grid" && <GridRenderer s={s} device={device} selectedColIdx={selectedColIdx} selectedElementId={selectedElementId} onSelectChild={onSelectChild} pageSettings={pageSettings} />}
        {s.type === "divider" && <DividerRenderer s={s} />}
        {s.type === "spacer" && <SpacerRenderer s={s} />}
        {s.type === "cta" && <GameCtaBlock s={s} device={device} pageSettings={pageSettings} />}
      </div>

      {/* Controls toolbar */}
      {selected && (
        <div className={styles.sectionToolbar}>
          <button onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst} className={styles.sectionToolBtn} title="Move up"><ChevronUp size={12} /></button>
          <button onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={isLast} className={styles.sectionToolBtn} title="Move down"><ChevronDown size={12} /></button>
          <button onClick={e => { e.stopPropagation(); onDuplicate(); }} className={styles.sectionToolBtn} title="Duplicate"><Copy size={12} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className={styles.sectionToolBtn} title="Delete"><Trash2 size={12} /></button>
        </div>
      )}
    </div>
  );
}

function PaletteGridCard({ item, onAdd, onAddGridWithCols }: { item: any; onAdd: (type: SectionType | ElementType) => void; onAddGridWithCols: (template: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: "relative" }}
    >
      <button onClick={() => onAdd(item.type)} className={styles.paletteCard} style={{ width: "100%" }}>
        <div className={styles.paletteIconWrap}>
          <item.Icon size={14} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className={styles.paletteCardLabel}>{item.label}</p>
          <p className={styles.paletteCardDesc}>{item.desc}</p>
        </div>
        <Plus size={12} style={{ color: TEXT_MUTED, opacity: 0.5, flexShrink: 0 }} />
      </button>

      {/* Hover Quick Column Count Selector Overlay */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#161a22",
            border: `1px solid ${HATHOR_ORANGE}`,
            borderRadius: 6,
            padding: "5px 8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
            zIndex: 10,
            boxShadow: "0 6px 20px rgba(0,0,0,0.6)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: HATHOR_ORANGE, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Select Column Count
            </span>
            <span style={{ fontSize: 8, color: TEXT_MUTED }}>Click to insert</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
            {[
              { label: "2 Cols", template: "1:1", bars: [1, 1] },
              { label: "3 Cols", template: "1:1:1", bars: [1, 1, 1] },
              { label: "4 Cols", template: "1:1:1:1", bars: [1, 1, 1, 1] },
            ].map(colOpt => (
              <button
                key={colOpt.template}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGridWithCols(colOpt.template);
                }}
                style={{
                  background: "#202532",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 4,
                  padding: "4px 2px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  transition: "all 0.15s ease",
                  color: TEXT_PRIMARY
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = HATHOR_ORANGE;
                  e.currentTarget.style.background = "rgba(242, 107, 33, 0.18)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.background = "#202532";
                }}
                title={`Insert ${colOpt.label}`}
              >
                <div style={{ display: "flex", width: "80%", height: 8, gap: 2, background: "#101319", padding: 1, borderRadius: 2, boxSizing: "border-box" }}>
                  {colOpt.bars.map((_, bIdx) => (
                    <div key={bIdx} style={{ flex: 1, background: HATHOR_ORANGE, borderRadius: 1 }} />
                  ))}
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace" }}>{colOpt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Block Palette ──────────────────────────────────────────────────────────────
function BlockPalette({ onAdd, onAddGridWithCols }: { onAdd: (type: SectionType | ElementType) => void; onAddGridWithCols: (template: string) => void }) {
  return (
    <div className={styles.leftSidebar}>
      <div className={styles.paletteHeader}>
        Add Block
      </div>
      <div>
        {PALETTE.map(group => (
          <div key={group.group}>
            <p className={styles.groupTitle}>{group.group}</p>
            <div className={styles.groupGrid}>
              {group.items.map(item => item.type === "grid" ? (
                <PaletteGridCard key={item.type} item={item} onAdd={onAdd} onAddGridWithCols={onAddGridWithCols} />
              ) : (
                <button key={item.type} onClick={() => onAdd(item.type)} className={styles.paletteCard}>
                  <div className={styles.paletteIconWrap}>
                    <item.Icon size={14} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className={styles.paletteCardLabel}>{item.label}</p>
                    <p className={styles.paletteCardDesc}>{item.desc}</p>
                  </div>
                  <Plus size={12} style={{ color: TEXT_MUTED, opacity: 0.5, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Properties Panel (Universal for Top-Level Sections & Grid Elements) ───────
function PropertiesPanel({ section, selectedColIdx, selectedElementId: propElementId, onChange, pageSettings, onPageSettingsChange }: {
  section: Section | null;
  selectedColIdx?: number | null;
  selectedElementId?: string | null;
  onChange: (id: string, updates: Partial<Section>, skipHistory?: boolean) => void;
  pageSettings?: PageSettings;
  onPageSettingsChange?: (ps: PageSettings) => void;
}) {
  const [gridColIdx, setGridColIdx] = useState<number>(selectedColIdx ?? 0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(propElementId ?? null);

  useEffect(() => {
    if (selectedColIdx !== undefined && selectedColIdx !== null) {
      setGridColIdx(selectedColIdx);
    }
    if (propElementId !== undefined) {
      setSelectedElementId(propElementId);
    }
  }, [selectedColIdx, propElementId, section?.id]);

  if (!section) {
    const ps = pageSettings || DEFAULT_PAGE_SETTINGS;
    const uPage = (updates: Partial<PageSettings>) => {
      if (onPageSettingsChange) {
        onPageSettingsChange({ ...ps, ...updates });
      }
    };

    return (
      <div className={styles.rightSidebar}>
        <div className={styles.propsHeader}>
          <Monitor size={14} style={{ color: HATHOR_ORANGE }} />
          <span>Page Body & Global Canvas</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Page Body Background */}
          <PropSection title="Page Body Background">
            <PropRow label="Background Color / Free Gradient">
              <ColorField
                value={ps.bg}
                onChange={v => uPage({ bg: v })}
                placeholder="e.g. #0e1116 or linear-gradient(...)"
              />
            </PropRow>

            <PropRow label="Background Image URL">
              <TxtInput
                value={ps.bgImage || ""}
                onChange={v => uPage({ bgImage: v })}
                placeholder="https://..."
              />
            </PropRow>

            {ps.bgImage && (
              <>
                <PropRow label="Background Fit / Scaling">
                  <SelField
                    value={ps.bgSize || "cover"}
                    onChange={v => uPage({ bgSize: v })}
                    options={[
                      { label: "Cover (Scale to Fill)", value: "cover" },
                      { label: "Contain (Scale to Fit)", value: "contain" },
                      { label: "Stretch (100% 100%)", value: "100% 100%" },
                      { label: "Auto (Original Size)", value: "auto" },
                    ]}
                  />
                </PropRow>

                <PropRow label="Background Alignment (3x3 Grid)">
                  <AlignmentGridPicker
                    value={ps.bgPosition || "center center"}
                    onChange={v => uPage({ bgPosition: v })}
                  />
                </PropRow>

                <PropRow label="Repeat Mode">
                  <SelField
                    value={ps.bgRepeat || "no-repeat"}
                    onChange={v => uPage({ bgRepeat: v })}
                    options={[
                      { label: "No Repeat", value: "no-repeat" },
                      { label: "Tile (Repeat X & Y)", value: "repeat" },
                      { label: "Repeat Horizontally (X)", value: "repeat-x" },
                      { label: "Repeat Vertically (Y)", value: "repeat-y" },
                    ]}
                  />
                </PropRow>

                <PropRow label="Overlay Tint Color">
                  <ColorField
                    value={ps.bgOverlay || "transparent"}
                    onChange={v => uPage({ bgOverlay: v })}
                    placeholder="e.g. rgba(0,0,0,0.5) or linear-gradient(...)"
                  />
                </PropRow>

                <PropRow label="Overlay Opacity (%)">
                  <NumField
                    value={Math.round((ps.bgOverlayOpacity ?? 0) * 100)}
                    onChange={v => uPage({ bgOverlayOpacity: v / 100 })}
                    unit="%"
                    min={0}
                    max={100}
                  />
                </PropRow>
              </>
            )}
          </PropSection>

          {/* Typography Defaults */}
          <PropSection title="Default Typography">
            <PropRow label="Default Heading Font">
              <SelField
                value={ps.titleFont || "'Cinzel', serif"}
                onChange={v => uPage({ titleFont: v })}
                options={FONTS}
              />
            </PropRow>
            <PropRow label="Default Body Font">
              <SelField
                value={ps.textFont || "'Raleway', sans-serif"}
                onChange={v => uPage({ textFont: v })}
                options={FONTS}
              />
            </PropRow>
          </PropSection>

          {/* Global Theme Accent */}
          <PropSection title="Global Theme Accent">
            <PropRow label="Primary Accent Color">
              <ColorField
                value={ps.accentColor || HATHOR_ORANGE}
                onChange={v => uPage({ accentColor: v })}
              />
            </PropRow>
          </PropSection>

          {/* Canvas Container Padding */}
          <PropSection title="Canvas Container Padding">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Pad Top">
                <NumField
                  value={ps.padTop ?? 0}
                  onChange={v => uPage({ padTop: v })}
                  unit="px"
                  max={400}
                />
              </PropRow>
              <PropRow label="Pad Bottom">
                <NumField
                  value={ps.padBottom ?? 40}
                  onChange={v => uPage({ padBottom: v })}
                  unit="px"
                  max={400}
                />
              </PropRow>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Pad Left">
                <NumField
                  value={ps.padLeft ?? 0}
                  onChange={v => uPage({ padLeft: v })}
                  unit="px"
                  max={400}
                />
              </PropRow>
              <PropRow label="Pad Right">
                <NumField
                  value={ps.padRight ?? 0}
                  onChange={v => uPage({ padRight: v })}
                  unit="px"
                  max={400}
                />
              </PropRow>
            </div>
          </PropSection>
        </div>
      </div>
    );
  }

  const s = section;
  const u = (updates: Partial<Section>, skipHistory?: boolean) => onChange(s.id, updates, skipHistory);
  const Icon = BLOCK_META[s.type]?.Icon || Settings;
  const cols = s.gridCols || [];
  const activeCol = cols[gridColIdx] || cols[0];

  const activeElement = (s.type === "grid" && selectedElementId)
    ? (activeCol?.elements || []).find(e => e.id === selectedElementId) || null
    : null;

  const addGridElement = (type: ElementType) => {
    if (!activeCol) return;
    const newEl = createGridElement(type);
    const updatedCols = cols.map((c, idx) => idx === gridColIdx ? { ...c, elements: [...c.elements, newEl] } : c);
    u({ gridCols: updatedCols });
    setSelectedElementId(newEl.id);
  };

  const updateGridElement = (elId: string, updates: Partial<GridElement>, skipHistory?: boolean) => {
    if (!activeCol) return;
    const updatedCols = cols.map((c, idx) => idx === gridColIdx ? {
      ...c,
      elements: c.elements.map(e => e.id === elId ? { ...e, ...updates } : e)
    } : c);
    u({ gridCols: updatedCols }, skipHistory);
  };

  const moveGridElement = (elIdx: number, dir: -1 | 1) => {
    if (!activeCol) return;
    const newIdx = elIdx + dir;
    if (newIdx < 0 || newIdx >= activeCol.elements.length) return;
    const els = [...activeCol.elements];
    [els[elIdx], els[newIdx]] = [els[newIdx], els[elIdx]];
    const updatedCols = cols.map((c, idx) => idx === gridColIdx ? { ...c, elements: els } : c);
    u({ gridCols: updatedCols });
  };

  const deleteGridElement = (elId: string) => {
    if (!activeCol) return;
    const updatedCols = cols.map((c, idx) => idx === gridColIdx ? {
      ...c,
      elements: c.elements.filter(e => e.id !== elId)
    } : c);
    u({ gridCols: updatedCols });
    if (selectedElementId === elId) setSelectedElementId(null);
  };

  const setGridTemplateRatio = (templateStr: string) => {
    const colCountMap: Record<string, number> = {
      "1": 1,
      "1:1": 2, "1:2": 2, "2:1": 2,
      "1:1:1": 3, "1:2:1": 3, "2:1:1": 3, "1:1:2": 3,
      "1:1:1:1": 4
    };
    const reqCols = colCountMap[templateStr] || templateStr.split(":").length || 2;
    let newCols = [...cols];
    while (newCols.length < reqCols) {
      newCols.push({ id: uid(), bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0, elements: [] });
    }
    if (newCols.length > reqCols) {
      newCols = newCols.slice(0, reqCols);
    }
    // Normalize template columns cleanly
    u({ gridTemplate: templateStr, gridCols: newCols });
    if (gridColIdx >= reqCols) setGridColIdx(0);
  };

  const targetObj: any = activeElement || s;
  const isEditingGridElement = !!activeElement;

  const updateTarget = (updates: any, skipHistory?: boolean) => {
    if (isEditingGridElement && activeElement) {
      updateGridElement(activeElement.id, updates, skipHistory);
    } else {
      u(updates, skipHistory);
    }
  };

  return (
    <div className={styles.rightSidebar}>
      <div className={styles.propsHeader}>
        <Icon size={14} style={{ color: HATHOR_ORANGE }} />
        <span>{isEditingGridElement ? `Element: ${activeElement?.type}` : BLOCK_META[s.type]?.label}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Section Container Styling */}
        {!isEditingGridElement && (
          <PropSection title="Section Container Styling">
            <PropRow label="Background Color / Free Gradient">
              <ColorField value={s.bg} onChange={v => u({ bg: v })} placeholder="e.g. transparent, #212631 or linear-gradient(...)" />
            </PropRow>
            <PropRow label="Top Accent Line Color"><ColorField value={s.borderTopColor || ""} onChange={v => u({ borderTopColor: v })} placeholder="#f26b21" /></PropRow>

            <PropRow label="Background Image URL">
              <TxtInput value={s.bgImage || ""} onChange={v => u({ bgImage: v })} placeholder="https://..." />
            </PropRow>

            {s.bgImage && (
              <>
                <PropRow label="Background Fit / Scaling">
                  <SelField
                    value={s.bgSize || "cover"}
                    onChange={v => u({ bgSize: v })}
                    options={[
                      { label: "Cover (Scale to Fill)", value: "cover" },
                      { label: "Contain (Scale to Fit)", value: "contain" },
                      { label: "Stretch (100% 100%)", value: "100% 100%" },
                      { label: "Auto (Original Size)", value: "auto" },
                    ]}
                  />
                </PropRow>

                <PropRow label="Background Alignment (3x3 Grid)">
                  <AlignmentGridPicker
                    value={s.bgPosition || "center center"}
                    onChange={v => u({ bgPosition: v })}
                  />
                </PropRow>

                <PropRow label="Repeat Mode">
                  <SelField
                    value={s.bgRepeat || "no-repeat"}
                    onChange={v => u({ bgRepeat: v })}
                    options={[
                      { label: "No Repeat", value: "no-repeat" },
                      { label: "Tile (Repeat X & Y)", value: "repeat" },
                      { label: "Repeat Horizontally (X)", value: "repeat-x" },
                      { label: "Repeat Vertically (Y)", value: "repeat-y" },
                    ]}
                  />
                </PropRow>

                <PropRow label="Overlay Tint Color">
                  <ColorField
                    value={s.bgOverlay || "transparent"}
                    onChange={v => u({ bgOverlay: v })}
                    placeholder="e.g. rgba(0,0,0,0.5) or linear-gradient(...)"
                  />
                </PropRow>

                <PropRow label="Overlay Opacity (%)">
                  <NumField
                    value={Math.round((s.bgOverlayOpacity ?? 0.5) * 100)}
                    onChange={v => u({ bgOverlayOpacity: v / 100 })}
                    unit="%"
                    min={0}
                    max={100}
                  />
                </PropRow>
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Pad Top"><NumField value={s.pt} onChange={v => u({ pt: v })} unit="px" max={400} /></PropRow>
              <PropRow label="Pad Bottom"><NumField value={s.pb} onChange={v => u({ pb: v })} unit="px" max={400} /></PropRow>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Pad Left"><NumField value={s.pl ?? s.ph ?? 0} onChange={v => u({ pl: v, ph: v })} unit="px" max={400} /></PropRow>
              <PropRow label="Pad Right"><NumField value={s.pr ?? s.ph ?? 0} onChange={v => u({ pr: v, ph: v })} unit="px" max={400} /></PropRow>
            </div>
          </PropSection>
        )}

        {/* ── TEXT BLOCK (Top level section or grid element) ── */}
        {targetObj.type === "text" && (
          <PropSection title="Text Content & Typography">
            <PropRow label="Text Content"><TxtArea value={targetObj.textContent || targetObj.text || ""} onChange={v => updateTarget({ textContent: v, text: v })} rows={4} /></PropRow>
            <PropRow label="Font Family"><SelField value={targetObj.textFont || targetObj.font || "'Raleway', sans-serif"} onChange={v => updateTarget({ textFont: v, font: v })} options={FONTS} /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Size"><NumField value={targetObj.textSize || targetObj.size || 14} onChange={v => updateTarget({ textSize: v, size: v })} unit="px" min={10} max={100} /></PropRow>
              <PropRow label="Weight"><SelField value={targetObj.textWeight || targetObj.weight || "400"} onChange={v => updateTarget({ textWeight: v, weight: v })} options={WEIGHTS} /></PropRow>
            </div>
            <PropRow label="Text Color"><ColorField value={targetObj.textColor || targetObj.color || TEXT_MUTED} onChange={v => updateTarget({ textColor: v, color: v })} /></PropRow>
            <PropRow label="Max Width"><NumField value={targetObj.textMaxWidth || 700} onChange={v => updateTarget({ textMaxWidth: v })} unit="px" min={200} max={1400} step={20} /></PropRow>
            <PropRow label="Alignment"><AlignField value={targetObj.textAlign || targetObj.align || "left"} onChange={v => updateTarget({ textAlign: v, align: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── IMAGE BLOCK (Top level section or grid element) ── */}
        {targetObj.type === "image" && (
          <PropSection title="Image Properties">
            <PropRow label="Image URL"><TxtInput value={targetObj.imageSrc || ""} onChange={v => updateTarget({ imageSrc: v })} placeholder="https://…" /></PropRow>
            <PropRow label="Alt Text"><TxtInput value={targetObj.imageAlt || ""} onChange={v => updateTarget({ imageAlt: v })} placeholder="Description" /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Max Width (%)"><NumField value={targetObj.imageMaxWidth || 100} onChange={v => updateTarget({ imageMaxWidth: v })} unit="%" min={10} max={100} /></PropRow>
              <PropRow label="Radius"><NumField value={targetObj.imageRadius || 4} onChange={v => updateTarget({ imageRadius: v })} unit="px" max={40} /></PropRow>
            </div>
          </PropSection>
        )}

        {/* ── FEATURES GRID ── */}
        {targetObj.type === "features" && (
          <PropSection title="Features Grid Settings">
            <PropRow label="Grid Header Title"><TxtInput value={targetObj.featuresTitle || ""} onChange={v => updateTarget({ featuresTitle: v })} placeholder="KEY FEATURES" /></PropRow>
            <PropRow label="Columns Count">
              <SelField value={String(targetObj.featuresCols || 3)} onChange={v => updateTarget({ featuresCols: Number(v) })}
                options={[{ label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }]} />
            </PropRow>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <p className={styles.propLabel}>Feature Cards ({(targetObj.featuresItems || []).length})</p>
              {(targetObj.featuresItems || []).map((item: any, i: number) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, padding: 8, background: "rgba(20, 24, 32, 0.6)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: HATHOR_ORANGE }}>Card #{i + 1}</span>
                    <button onClick={() => updateTarget({ featuresItems: (targetObj.featuresItems || []).filter((_: any, j: number) => j !== i) })}
                      style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER}`, background: "transparent", color: TEXT_MUTED, cursor: "pointer" }}>
                      <X size={10} />
                    </button>
                  </div>
                  <TxtInput value={item.title} onChange={v => {
                    const items = [...(targetObj.featuresItems || [])]; items[i] = { ...items[i], title: v };
                    updateTarget({ featuresItems: items });
                  }} placeholder="Feature Title" />
                  <TxtArea value={item.desc} onChange={v => {
                    const items = [...(targetObj.featuresItems || [])]; items[i] = { ...items[i], desc: v };
                    updateTarget({ featuresItems: items });
                  }} rows={2} placeholder="Feature Description" />
                </div>
              ))}
              <button onClick={() => updateTarget({ featuresItems: [...(targetObj.featuresItems || []), { title: "NEW FEATURE", desc: "Feature description goes here.", icon: "zap" }] })}
                style={{ width: "100%", padding: 6, border: `1px dashed ${BORDER}`, background: "transparent", color: TEXT_MUTED, fontSize: 10, cursor: "pointer" }}>
                + Add Feature Card
              </button>
            </div>
          </PropSection>
        )}

        {/* ── TWO COLUMNS PRESET ── */}
        {targetObj.type === "two-col" && (
          <PropSection title="Two Columns Settings">
            <PropRow label="Column Width Ratio">
              <SelField value={targetObj.twoColRatio || "1:1"} onChange={v => updateTarget({ twoColRatio: v as any })}
                options={[{ label: "50% / 50% Equal", value: "1:1" }, { label: "60% / 40% Left Heavy", value: "3:2" }, { label: "40% / 60% Right Heavy", value: "2:3" }]} />
            </PropRow>
            <PropRow label="Left Side Text"><TxtArea value={targetObj.twoColLeftText || ""} onChange={v => updateTarget({ twoColLeftText: v })} rows={5} /></PropRow>
            <PropRow label="Right Side Image URL"><TxtInput value={targetObj.twoColRightImg || ""} onChange={v => updateTarget({ twoColRightImg: v })} placeholder="https://…" /></PropRow>
          </PropSection>
        )}

        {/* ── CAROUSEL SHOWCASE ── */}
        {targetObj.type === "carousel" && (
          <PropSection title="Media Carousel Settings">
            <PropRow label="Carousel Height"><NumField value={targetObj.carouselHeight || 420} onChange={v => updateTarget({ carouselHeight: v })} unit="px" min={200} max={800} step={20} /></PropRow>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
              <span className={styles.propLabel}>Thumbnail Bar</span>
              <button onClick={() => updateTarget({ showThumbnails: !(targetObj.showThumbnails ?? true) })}
                style={{ padding: "6px 12px", border: `1px solid ${(targetObj.showThumbnails ?? true) ? GREEN_ACCENT : BORDER}`, color: (targetObj.showThumbnails ?? true) ? GREEN_ACCENT : TEXT_MUTED, background: (targetObj.showThumbnails ?? true) ? "rgba(56, 211, 159, 0.12)" : "transparent", fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>
                {(targetObj.showThumbnails ?? true) ? "VISIBLE" : "HIDDEN"}
              </button>
            </div>
            <MediaManagerList
              items={targetObj.carouselImages || targetObj.mediaItems || []}
              onChange={items => updateTarget({ carouselImages: items, mediaItems: items })}
              label="Carousel Media (Images & Videos)"
            />
          </PropSection>
        )}

        {/* ── GAME HERO ── */}
        {targetObj.type === "game-hero" && (
          <PropSection title="Hero Media Showcase Settings">
            <PropRow label="Hero Slider Height"><NumField value={targetObj.heroHeight || 480} onChange={v => updateTarget({ heroHeight: v })} unit="px" min={250} max={900} step={20} /></PropRow>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
              <span className={styles.propLabel}>Bottom Shadow Overlay</span>
              <button onClick={() => updateTarget({ heroShadowEnabled: !(targetObj.heroShadowEnabled ?? true) })}
                style={{ padding: "6px 12px", border: `1px solid ${(targetObj.heroShadowEnabled ?? true) ? GREEN_ACCENT : BORDER}`, color: (targetObj.heroShadowEnabled ?? true) ? GREEN_ACCENT : TEXT_MUTED, background: (targetObj.heroShadowEnabled ?? true) ? "rgba(56, 211, 159, 0.12)" : "transparent", fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>
                {(targetObj.heroShadowEnabled ?? true) ? "ENABLED" : "DISABLED"}
              </button>
            </div>
            {(targetObj.heroShadowEnabled ?? true) && (
              <PropRow label="Shadow Color">
                <ColorField value={targetObj.heroShadowColor || "#212631"} onChange={v => updateTarget({ heroShadowColor: v })} />
              </PropRow>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
              <span className={styles.propLabel}>Thumbnail Navigation Strip</span>
              <button onClick={() => updateTarget({ showThumbnails: !(targetObj.showThumbnails ?? true) })}
                style={{ padding: "6px 12px", border: `1px solid ${(targetObj.showThumbnails ?? true) ? GREEN_ACCENT : BORDER}`, color: (targetObj.showThumbnails ?? true) ? GREEN_ACCENT : TEXT_MUTED, background: (targetObj.showThumbnails ?? true) ? "rgba(56, 211, 159, 0.12)" : "transparent", fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>
                {(targetObj.showThumbnails ?? true) ? "VISIBLE" : "HIDDEN"}
              </button>
            </div>
            <MediaManagerList
              items={targetObj.heroImages || targetObj.mediaItems || []}
              onChange={items => updateTarget({ heroImages: items, mediaItems: items })}
              label="Hero Showcase Media (Images & Videos)"
            />
          </PropSection>
        )}

        {/* ── GAME HEADER ── */}
        {targetObj.type === "game-header" && (
          <PropSection title="Game Header Settings">
            <PropRow label="Category / Genre Badge"><TxtInput value={targetObj.gameCategory || ""} onChange={v => updateTarget({ gameCategory: v })} placeholder="ACTION RPG" /></PropRow>
            <PropRow label="Game Title"><TxtInput value={targetObj.gameTitle || ""} onChange={v => updateTarget({ gameTitle: v })} /></PropRow>
            <PropRow label="Subtitle / Tagline"><TxtInput value={targetObj.gameSubtitle || ""} onChange={v => updateTarget({ gameSubtitle: v })} placeholder="Optional tagline..." /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Rating Score"><NumField value={targetObj.gameRatingScore || 9.4} onChange={v => updateTarget({ gameRatingScore: v })} min={0} max={10} step={0.1} /></PropRow>
              <PropRow label="Review Count"><TxtInput value={targetObj.gameReviewCount || "14.2k Reviews"} onChange={v => updateTarget({ gameReviewCount: v })} /></PropRow>
            </div>
            <PropRow label="Developer Name"><TxtInput value={targetObj.gameDev || ""} onChange={v => updateTarget({ gameDev: v })} /></PropRow>
            <PropRow label="Release Date"><TxtInput value={targetObj.gameReleaseDate || ""} onChange={v => updateTarget({ gameReleaseDate: v })} /></PropRow>
            <PropRow label="Tags (comma separated)">
              <TxtInput value={(targetObj.gameTags || []).join(", ")} onChange={v => updateTarget({ gameTags: v.split(",").map((t: string) => t.trim()).filter(Boolean) })} placeholder="OPEN WORLD, SOULSLIKE, DARK FANTASY" />
            </PropRow>
            <PropRow label="Synopsis Description"><TxtArea value={targetObj.gameDesc || ""} onChange={v => updateTarget({ gameDesc: v })} rows={4} /></PropRow>
          </PropSection>
        )}

        {/* ── ABOUT GAME ── */}
        {targetObj.type === "about-game" && (
          <PropSection title="About Game Sections">
            <PropRow label="Section Title"><TxtInput value={targetObj.aboutTitle || ""} onChange={v => updateTarget({ aboutTitle: v })} /></PropRow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {(targetObj.aboutSections || []).map((sec: any, i: number) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, padding: 10, background: "rgba(20, 24, 32, 0.6)", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: HATHOR_ORANGE }}>Section #{i + 1}</span>
                    <button onClick={() => updateTarget({ aboutSections: (targetObj.aboutSections || []).filter((_: any, j: number) => j !== i) })}
                      style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER}`, background: "transparent", color: TEXT_MUTED, cursor: "pointer" }}>
                      <X size={10} />
                    </button>
                  </div>
                  <TxtInput value={sec.title} onChange={v => {
                    const secs = [...(targetObj.aboutSections || [])]; secs[i] = { ...secs[i], title: v };
                    updateTarget({ aboutSections: secs });
                  }} placeholder="Subheading Title" />
                  <TxtArea value={sec.text} onChange={v => {
                    const secs = [...(targetObj.aboutSections || [])]; secs[i] = { ...secs[i], text: v };
                    updateTarget({ aboutSections: secs });
                  }} rows={3} placeholder="Lore text description..." />
                  <TxtInput value={sec.img || ""} onChange={v => {
                    const secs = [...(targetObj.aboutSections || [])]; secs[i] = { ...secs[i], img: v };
                    updateTarget({ aboutSections: secs });
                  }} placeholder="Screenshot Image URL (optional)" />
                </div>
              ))}
              <button onClick={() => updateTarget({ aboutSections: [...(targetObj.aboutSections || []), { title: "NEW SECTION", text: "Write section description here...", img: "" }] })}
                style={{ width: "100%", padding: 6, border: `1px dashed ${BORDER}`, background: "transparent", color: TEXT_MUTED, fontSize: 10, cursor: "pointer" }}>
                + Add Game Lore Section
              </button>
            </div>
          </PropSection>
        )}

        {/* ── SYSTEM REQS ── */}
        {targetObj.type === "system-reqs" && (
          <PropSection title="System Requirements Settings">
            <p style={{ fontSize: 10, color: TEXT_MUTED, marginBottom: 10 }}>Configure minimum vs recommended specifications for hardware compatibility.</p>

            <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE }}>Recommended Specifications</p>
            <PropRow label="OS"><TxtInput value={(targetObj.reqsRec || {}).os || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || {}), os: v } })} /></PropRow>
            <PropRow label="CPU"><TxtInput value={(targetObj.reqsRec || {}).cpu || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || {}), cpu: v } })} /></PropRow>
            <PropRow label="RAM"><TxtInput value={(targetObj.reqsRec || {}).ram || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || {}), ram: v } })} /></PropRow>
            <PropRow label="GPU"><TxtInput value={(targetObj.reqsRec || {}).gpu || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || {}), gpu: v } })} /></PropRow>
            <PropRow label="Storage"><TxtInput value={(targetObj.reqsRec || {}).storage || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || {}), storage: v } })} /></PropRow>

            <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}>Minimum Specifications</p>
            <PropRow label="OS"><TxtInput value={(targetObj.reqsMin || {}).os || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || {}), os: v } })} /></PropRow>
            <PropRow label="CPU"><TxtInput value={(targetObj.reqsMin || {}).cpu || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || {}), cpu: v } })} /></PropRow>
            <PropRow label="RAM"><TxtInput value={(targetObj.reqsMin || {}).ram || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || {}), ram: v } })} /></PropRow>
            <PropRow label="GPU"><TxtInput value={(targetObj.reqsMin || {}).gpu || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || {}), gpu: v } })} /></PropRow>
            <PropRow label="Storage"><TxtInput value={(targetObj.reqsMin || {}).storage || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || {}), storage: v } })} /></PropRow>
          </PropSection>
        )}

        {/* ── USER REVIEWS ── */}
        {targetObj.type === "user-reviews" && (
          <PropSection title="User Reviews Settings">
            <PropRow label="Section Header Title"><TxtInput value={targetObj.reviewHeader || ""} onChange={v => updateTarget({ reviewHeader: v })} placeholder="PLAYER REVIEWS" /></PropRow>
            <PropRow label="Card Background / Free Gradient"><ColorField value={targetObj.reviewCardBg || SURFACE} onChange={v => updateTarget({ reviewCardBg: v })} placeholder="e.g. #181c24 or linear-gradient(...)" /></PropRow>
            <PropRow label="Card Border Color"><ColorField value={targetObj.reviewCardBorder || BORDER} onChange={v => updateTarget({ reviewCardBorder: v })} /></PropRow>
            <PropRow label="Card Radius"><NumField value={targetObj.reviewCardRadius ?? 4} onChange={v => updateTarget({ reviewCardRadius: v })} unit="px" max={40} /></PropRow>

            <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}>Typography & Accents</p>
            <PropRow label="Reviewer Name Font"><SelField value={targetObj.reviewNameFont || "'Cinzel', serif"} onChange={v => updateTarget({ reviewNameFont: v })} options={FONTS} /></PropRow>
            <PropRow label="Reviewer Name Color"><ColorField value={targetObj.reviewNameColor || TEXT_PRIMARY} onChange={v => updateTarget({ reviewNameColor: v })} /></PropRow>
            <PropRow label="Body Text Color"><ColorField value={targetObj.reviewBodyColor || TEXT_MUTED} onChange={v => updateTarget({ reviewBodyColor: v })} /></PropRow>
            <PropRow label="Body Text Font"><SelField value={targetObj.reviewBodyFont || "'Raleway', sans-serif"} onChange={v => updateTarget({ reviewBodyFont: v })} options={FONTS} /></PropRow>
            <PropRow label="Star Accent Color"><ColorField value={targetObj.reviewStarColor || HATHOR_ORANGE} onChange={v => updateTarget({ reviewStarColor: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── OWNERSHIP BANNER ── */}
        {targetObj.type === "ownership-banner" && (
          <PropSection title="Ownership Banner Settings">
            <PropRow label="Status Title"><TxtInput value={targetObj.ownershipStatus || "YOU OWN THIS GAME"} onChange={v => updateTarget({ ownershipStatus: v })} /></PropRow>
            <PropRow label="Subtext"><TxtInput value={targetObj.ownershipSub || "Purchased Jun 10, 2025 · Available in your library"} onChange={v => updateTarget({ ownershipSub: v })} /></PropRow>
            <PropRow label="Primary Button Text"><TxtInput value={targetObj.ownershipBtn1 || "DOWNLOAD"} onChange={v => updateTarget({ ownershipBtn1: v })} /></PropRow>
            <PropRow label="Primary Button Color"><ColorField value={targetObj.ownershipBtn1Bg || GREEN_ACCENT} onChange={v => updateTarget({ ownershipBtn1Bg: v })} /></PropRow>
            <PropRow label="Secondary Button Text"><TxtInput value={targetObj.ownershipBtn2 || "GO TO LIBRARY"} onChange={v => updateTarget({ ownershipBtn2: v })} /></PropRow>
            <PropRow label="Banner Background"><ColorField value={targetObj.ownershipBg || SURFACE} onChange={v => updateTarget({ ownershipBg: v })} /></PropRow>
            <PropRow label="Banner Border Color"><ColorField value={targetObj.ownershipBorder || "rgba(56, 211, 159, 0.4)"} onChange={v => updateTarget({ ownershipBorder: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── SIDEBAR CTA / PURCHASE ── */}
        {targetObj.type === "sidebar-cta" && (
          <PropSection title="Sidebar Action Settings">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", marginBottom: 8 }}>
              <span className={styles.propLabel}>Ownership View Mode</span>
              <button onClick={() => updateTarget({ sidebarOwned: !(targetObj.sidebarOwned ?? true) })}
                style={{ padding: "6px 12px", border: `1px solid ${(targetObj.sidebarOwned ?? true) ? GREEN_ACCENT : HATHOR_ORANGE}`, color: (targetObj.sidebarOwned ?? true) ? GREEN_ACCENT : HATHOR_ORANGE, background: (targetObj.sidebarOwned ?? true) ? "rgba(56, 211, 159, 0.12)" : "rgba(242, 107, 33, 0.12)", fontSize: 10, fontWeight: 800, cursor: "pointer", borderRadius: 3 }}>
                {(targetObj.sidebarOwned ?? true) ? "OWNED MODE" : "STORE / BUY MODE"}
              </button>
            </div>
            {(targetObj.sidebarOwned ?? true) ? (
              <>
                <PropRow label="Header Title"><TxtInput value={targetObj.ownedTitle || "OWNED"} onChange={v => updateTarget({ ownedTitle: v })} /></PropRow>
                <PropRow label="Subtext"><TxtInput value={targetObj.ownedSubtext || "In your library"} onChange={v => updateTarget({ ownedSubtext: v })} /></PropRow>
                <PropRow label="Primary Button Text"><TxtInput value={targetObj.ownedPrimaryBtnText || "DOWNLOAD NOW"} onChange={v => updateTarget({ ownedPrimaryBtnText: v })} /></PropRow>
                <PropRow label="Primary Button Color"><ColorField value={targetObj.ownedPrimaryBtnBg || GREEN_ACCENT} onChange={v => updateTarget({ ownedPrimaryBtnBg: v })} /></PropRow>
                <PropRow label="Secondary Button Text"><TxtInput value={targetObj.ctaSecondaryBtnText || "VIEW IN LIBRARY"} onChange={v => updateTarget({ ctaSecondaryBtnText: v })} /></PropRow>
              </>
            ) : (
              <>
                <PropRow label="Price"><TxtInput value={targetObj.sidebarPrice || "299.99"} onChange={v => updateTarget({ sidebarPrice: v })} placeholder="299.99" /></PropRow>
                <PropRow label="Discount %"><NumField value={targetObj.sidebarDiscount ?? 10} onChange={v => updateTarget({ sidebarDiscount: v })} min={0} max={100} unit="%" /></PropRow>
                <PropRow label="Button Text"><TxtInput value={targetObj.unownedPrimaryBtnText || "ADD TO CART"} onChange={v => updateTarget({ unownedPrimaryBtnText: v })} /></PropRow>
                <PropRow label="Button Color"><ColorField value={targetObj.unownedPrimaryBtnBg || HATHOR_ORANGE} onChange={v => updateTarget({ unownedPrimaryBtnBg: v })} /></PropRow>
              </>
            )}
            <PropRow label="Card Background"><ColorField value={targetObj.sideCardBg || SURFACE} onChange={v => updateTarget({ sideCardBg: v })} /></PropRow>
            <PropRow label="Card Border Color"><ColorField value={targetObj.sideCardBorder || BORDER} onChange={v => updateTarget({ sideCardBorder: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── SIDEBAR GAME DETAILS INFO ── */}
        {targetObj.type === "sidebar-info" && (
          <PropSection title="Sidebar Game Details Settings">
            <PropRow label="Card Header Title"><TxtInput value={targetObj.infoTitle || "GAME DETAILS"} onChange={v => updateTarget({ infoTitle: v })} /></PropRow>
            <PropRow label="Developer"><TxtInput value={targetObj.sideDev || "Omegabyte Studios"} onChange={v => updateTarget({ sideDev: v })} /></PropRow>
            <PropRow label="Publisher"><TxtInput value={targetObj.sidePub || "Redline Inc"} onChange={v => updateTarget({ sidePub: v })} /></PropRow>
            <PropRow label="Release Date"><TxtInput value={targetObj.sideDate || "March 15, 2025"} onChange={v => updateTarget({ sideDate: v })} /></PropRow>
            <PropRow label="Genre"><TxtInput value={targetObj.sideGenre || "Action RPG"} onChange={v => updateTarget({ sideGenre: v })} /></PropRow>
            <PropRow label="Platforms"><TxtInput value={Array.isArray(targetObj.sidePlatforms) ? targetObj.sidePlatforms.join(", ") : (targetObj.sidePlatforms || "Windows, macOS")} onChange={v => updateTarget({ sidePlatforms: v.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></PropRow>
            <PropRow label="Header Color"><ColorField value={targetObj.infoTitleColor || HATHOR_ORANGE} onChange={v => updateTarget({ infoTitleColor: v })} /></PropRow>
            <PropRow label="Card Background"><ColorField value={targetObj.infoCardBg || SURFACE} onChange={v => updateTarget({ infoCardBg: v })} /></PropRow>
            <PropRow label="Card Border Color"><ColorField value={targetObj.infoCardBorder || BORDER} onChange={v => updateTarget({ infoCardBorder: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── SIDEBAR RATINGS ── */}
        {targetObj.type === "sidebar-ratings" && (
          <PropSection title="Sidebar Ratings Breakdown Settings">
            <PropRow label="Card Header Title"><TxtInput value={targetObj.ratingsTitle || "RATING BREAKDOWN"} onChange={v => updateTarget({ ratingsTitle: v })} /></PropRow>
            <PropRow label="Progress Bar Color"><ColorField value={targetObj.ratingsFillColor || HATHOR_ORANGE} onChange={v => updateTarget({ ratingsFillColor: v })} /></PropRow>
            <PropRow label="Card Background"><ColorField value={targetObj.ratingsCardBg || SURFACE} onChange={v => updateTarget({ ratingsCardBg: v })} /></PropRow>
            <PropRow label="Card Border Color"><ColorField value={targetObj.ratingsCardBorder || BORDER} onChange={v => updateTarget({ ratingsCardBorder: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── SIDEBAR COMMUNITY ── */}
        {targetObj.type === "sidebar-community" && (
          <PropSection title="Sidebar Community Stats Settings">
            <PropRow label="Card Header Title"><TxtInput value={targetObj.communityTitle || "COMMUNITY"} onChange={v => updateTarget({ communityTitle: v })} /></PropRow>
            <PropRow label="Players Count"><TxtInput value={targetObj.sideOwners || "250,000+"} onChange={v => updateTarget({ sideOwners: v })} /></PropRow>
            <PropRow label="Avg. Gameplay"><TxtInput value={targetObj.sideGameplay || "52 hrs"} onChange={v => updateTarget({ sideGameplay: v })} /></PropRow>
            <PropRow label="Positive Rating %"><TxtInput value={targetObj.sidePositive || "94%"} onChange={v => updateTarget({ sidePositive: v })} /></PropRow>
            <PropRow label="Card Background"><ColorField value={targetObj.communityCardBg || SURFACE} onChange={v => updateTarget({ communityCardBg: v })} /></PropRow>
            <PropRow label="Card Border Color"><ColorField value={targetObj.communityCardBorder || BORDER} onChange={v => updateTarget({ communityCardBorder: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {targetObj.type === "recommendations" && (
          <PropSection title="More Like This Settings">
            <PropRow label="Section Title"><TxtInput value={targetObj.recsTitle || "MORE LIKE THIS"} onChange={v => updateTarget({ recsTitle: v })} /></PropRow>
            <PropRow label="Card Background / Free Gradient"><ColorField value={targetObj.recsCardBg || SURFACE} onChange={v => updateTarget({ recsCardBg: v })} placeholder="e.g. #181c24 or linear-gradient(...)" /></PropRow>
            <PropRow label="Card Border Color"><ColorField value={targetObj.recsCardBorder || BORDER} onChange={v => updateTarget({ recsCardBorder: v })} /></PropRow>
          </PropSection>
        )}

        {/* Custom Grid / Multi-Column Layout Section Editing */}
        {!isEditingGridElement && s.type === "grid" && (
          <>
            <PropSection title="Grid Layout Controls">
              {/* Column Count Selector & Visual Layout Focus Icons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
                <PropRow label="Column Count">
                  <SelField
                    value={String(cols.length)}
                    onChange={v => {
                      const reqCols = Number(v);
                      const defaultTemplates: Record<number, string> = {
                        1: "1",
                        2: "2:1",
                        3: "2:1:1",
                        4: "1:1:1:1"
                      };
                      setGridTemplateRatio(defaultTemplates[reqCols] || "2:1");
                    }}
                    options={[
                      { label: "2 Columns", value: "2" },
                      { label: "3 Columns", value: "3" },
                      { label: "4 Columns", value: "4" },
                    ]}
                  />
                </PropRow>

                {/* Visual Ratio Options for current column count */}
                <div>
                  <p className={styles.propLabel} style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: HATHOR_ORANGE }}>
                    Layout Focus & Width Distribution ({cols.length} Columns)
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length === 3 ? 4 : cols.length === 2 ? 3 : 1}, 1fr)`, gap: 6 }}>
                    {((optionsMap: Record<number, { label: string; value: string; flexes: number[] }[]>) => {
                      const currentOpts = optionsMap[cols.length] || [];
                      return currentOpts.map(opt => {
                        const isActive = (s.gridTemplate || "2:1") === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setGridTemplateRatio(opt.value)}
                            title={opt.label}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "6px 4px",
                              gap: 4,
                              background: isActive ? "rgba(242, 107, 33, 0.14)" : SURFACE,
                              border: isActive ? `1px solid ${HATHOR_ORANGE}` : `1px solid ${BORDER}`,
                              borderRadius: 4,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              outline: "none"
                            }}
                          >
                            <div style={{ display: "flex", width: "100%", height: 14, gap: 3, background: "#101319", padding: 2, borderRadius: 3, boxSizing: "border-box" }}>
                              {opt.flexes.map((flexVal, fIdx) => (
                                <div
                                  key={fIdx}
                                  style={{
                                    flex: flexVal,
                                    background: isActive ? HATHOR_ORANGE : (flexVal > 1 ? "#5A6578" : "#323846"),
                                    borderRadius: 2,
                                    transition: "all 0.15s ease"
                                  }}
                                />
                              ))}
                            </div>
                            <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: isActive ? 800 : 600, color: isActive ? HATHOR_ORANGE : TEXT_MUTED }}>
                              {opt.label}
                            </span>
                          </button>
                        );
                      });
                    })({
                      1: [{ label: "1:1 Full Width", value: "1", flexes: [1] }],
                      2: [
                        { label: "2:1 Left Heavy", value: "2:1", flexes: [2, 1] },
                        { label: "1:1 Equal", value: "1:1", flexes: [1, 1] },
                        { label: "1:2 Right Heavy", value: "1:2", flexes: [1, 2] }
                      ],
                      3: [
                        { label: "2:1:1 Left Heavy", value: "2:1:1", flexes: [2, 1, 1] },
                        { label: "1:2:1 Center Heavy", value: "1:2:1", flexes: [1, 2, 1] },
                        { label: "1:1:1 Equal", value: "1:1:1", flexes: [1, 1, 1] },
                        { label: "1:1:2 Right Heavy", value: "1:1:2", flexes: [1, 1, 2] }
                      ],
                      4: [{ label: "1:1:1:1 Equal", value: "1:1:1:1", flexes: [1, 1, 1, 1] }]
                    })}
                  </div>
                </div>

                <PropRow label="Grid Gap"><NumField value={s.gridGap || 40} onChange={v => u({ gridGap: v })} unit="px" min={0} max={120} /></PropRow>
              </div>
            </PropSection>

            {/* Column Inspector */}
            <PropSection title="Column Controls">
              <PropRow label="Select Column">
                <div className={styles.gridColTabs}>
                  {cols.map((_, i) => (
                    <button key={i} onClick={() => { setGridColIdx(i); setSelectedElementId(null); }}
                      className={`${styles.gridColTab} ${gridColIdx === i ? styles.gridColTabActive : ""}`}>
                      Col {i + 1}
                    </button>
                  ))}
                </div>
              </PropRow>

              {activeCol && (
                <>
                  <div style={{ marginTop: 8, marginBottom: 16 }}>
                    <p className={styles.propLabel} style={{ marginBottom: 8 }}>Insert Element into Col {gridColIdx + 1}</p>
                    <div className={styles.addElementGrid}>
                      <button onClick={() => addGridElement("heading")} className={styles.addElementBtn}>
                        <Type size={12} /> + Heading
                      </button>
                      <button onClick={() => addGridElement("text")} className={styles.addElementBtn}>
                        <Type size={12} /> + Text
                      </button>
                      <button onClick={() => addGridElement("image")} className={styles.addElementBtn}>
                        <ImageIcon size={12} /> + Image
                      </button>
                      <button onClick={() => addGridElement("button")} className={styles.addElementBtn}>
                        <Zap size={12} /> + Button
                      </button>
                      <button onClick={() => addGridElement("game-header")} className={styles.addElementBtn}>
                        <Award size={12} /> + Game Header
                      </button>
                      <button onClick={() => addGridElement("system-reqs")} className={styles.addElementBtn}>
                        <MonitorCheck size={12} /> + System Reqs
                      </button>
                      <button onClick={() => addGridElement("sidebar-cta")} className={styles.addElementBtn}>
                        <ShoppingCart size={12} /> + Sidebar Purchase Card
                      </button>
                      <button onClick={() => addGridElement("sidebar-info")} className={styles.addElementBtn}>
                        <Info size={12} /> + Sidebar Info Card
                      </button>
                      <button onClick={() => addGridElement("sidebar-ratings")} className={styles.addElementBtn}>
                        <BarChart2 size={12} /> + Rating Bars Card
                      </button>
                      <button onClick={() => addGridElement("sidebar-community")} className={styles.addElementBtn}>
                        <Users size={12} /> + Community Card
                      </button>
                      <button onClick={() => addGridElement("carousel")} className={styles.addElementBtn}>
                        <Film size={12} /> + Carousel
                      </button>
                      <button onClick={() => addGridElement("features")} className={styles.addElementBtn}>
                        <LayoutGrid size={12} /> + Features Grid
                      </button>
                      <button onClick={() => addGridElement("about-game")} className={styles.addElementBtn}>
                        <Info size={12} /> + About Section
                      </button>
                      <button onClick={() => addGridElement("recommendations")} className={styles.addElementBtn}>
                        <LayoutGrid size={12} /> + More Like This
                      </button>
                    </div>
                  </div>

                  <PropRow label="Column Background / Free Gradient">
                    <ColorField value={activeCol.bg || "transparent"} onChange={v => {
                      const updatedCols = cols.map((c, idx) => idx === gridColIdx ? { ...c, bg: v } : c);
                      u({ gridCols: updatedCols });
                    }} placeholder="e.g. linear-gradient(...) or #181c24" />
                  </PropRow>

                  <PropRow label="Column Top Accent Line Color">
                    <ColorField value={activeCol.borderTopColor || ""} onChange={v => {
                      const updatedCols = cols.map((c, idx) => idx === gridColIdx ? { ...c, borderTopColor: v } : c);
                      u({ gridCols: updatedCols });
                    }} placeholder="#f26b21" />
                  </PropRow>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                    <PropRow label="Col Pad Left"><NumField value={activeCol.pl ?? activeCol.ph ?? 0} onChange={v => {
                      const updatedCols = cols.map((c, idx) => idx === gridColIdx ? { ...c, pl: v, ph: v } : c);
                      u({ gridCols: updatedCols });
                    }} unit="px" max={200} /></PropRow>
                    <PropRow label="Col Pad Right"><NumField value={activeCol.pr ?? activeCol.ph ?? 0} onChange={v => {
                      const updatedCols = cols.map((c, idx) => idx === gridColIdx ? { ...c, pr: v, ph: v } : c);
                      u({ gridCols: updatedCols });
                    }} unit="px" max={200} /></PropRow>
                  </div>

                  {/* Column Elements List */}
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    <p className={styles.propLabel}>Elements in Col {gridColIdx + 1} ({activeCol.elements.length})</p>
                    {activeCol.elements.length === 0 ? (
                      <p style={{ fontSize: 10, color: TEXT_MUTED, fontStyle: "italic" }}>No elements added to this column yet.</p>
                    ) : (
                      activeCol.elements.map((el, i) => (
                        <div key={el.id} onClick={() => setSelectedElementId(el.id)}
                          className={`${styles.elementCard} ${selectedElementId === el.id ? styles.elementCardActive : ""}`}>
                          <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{i + 1}. {el.type}</span>
                          <div className={styles.elementControls} onClick={e => e.stopPropagation()}>
                            <button onClick={() => moveGridElement(i, -1)} disabled={i === 0} className={styles.elementBtn} title="Move up">
                              <ChevronUp size={12} />
                            </button>
                            <button onClick={() => moveGridElement(i, 1)} disabled={i === activeCol.elements.length - 1} className={styles.elementBtn} title="Move down">
                              <ChevronDown size={12} />
                            </button>
                            <button onClick={() => deleteGridElement(el.id)} className={styles.elementBtn} title="Delete">
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </PropSection>
          </>
        )}

        {/* Basic Element Editing inside Column */}
        {isEditingGridElement && (activeElement?.type === "heading" || activeElement?.type === "text" || activeElement?.type === "button" || activeElement?.type === "image" || activeElement?.type === "divider" || activeElement?.type === "spacer") && (
          <PropSection title={`Edit ${activeElement.type.toUpperCase()}`}>

            {(activeElement.type === "heading" || activeElement.type === "text") && <>
              <PropRow label="Content"><TxtArea value={activeElement.text || ""} onChange={v => updateGridElement(activeElement.id, { text: v })} rows={3} /></PropRow>
              <PropRow label="Font Family"><SelField value={activeElement.font || "'Cinzel', serif"} onChange={v => updateGridElement(activeElement.id, { font: v })} options={FONTS} /></PropRow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PropRow label="Size"><NumField value={activeElement.size || 18} onChange={v => updateGridElement(activeElement.id, { size: v })} unit="px" min={10} max={100} /></PropRow>
                <PropRow label="Weight"><SelField value={activeElement.weight || "400"} onChange={v => updateGridElement(activeElement.id, { weight: v })} options={WEIGHTS} /></PropRow>
              </div>
              <PropRow label="Color"><ColorField value={activeElement.color || "#ffffff"} onChange={v => updateGridElement(activeElement.id, { color: v })} /></PropRow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PropRow label="Letter Spacing"><TxtInput value={activeElement.letterSpacing || "normal"} onChange={v => updateGridElement(activeElement.id, { letterSpacing: v })} placeholder="0.04em" /></PropRow>
                <PropRow label="Transform">
                  <SelField value={activeElement.textTransform || "uppercase"} onChange={v => updateGridElement(activeElement.id, { textTransform: v as any })}
                    options={[{ label: "UPPERCASE", value: "uppercase" }, { label: "Normal", value: "none" }, { label: "Capitalize", value: "capitalize" }]} />
                </PropRow>
              </div>
              <PropRow label="Alignment"><AlignField value={activeElement.align || "left"} onChange={v => updateGridElement(activeElement.id, { align: v as any })} /></PropRow>
            </>}

            {/* BUTTON CONTROLS */}
            {activeElement.type === "button" && <>
              <PropRow label="Button Text"><TxtInput value={activeElement.btnText || ""} onChange={v => updateGridElement(activeElement.id, { btnText: v })} /></PropRow>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                <span className={styles.propLabel}>Width Mode</span>
                <button onClick={() => updateGridElement(activeElement.id, { fullWidth: !activeElement.fullWidth })}
                  style={{ padding: "6px 12px", border: `1px solid ${activeElement.fullWidth ? GREEN_ACCENT : BORDER}`, color: activeElement.fullWidth ? GREEN_ACCENT : TEXT_MUTED, background: activeElement.fullWidth ? "rgba(56, 211, 159, 0.12)" : "transparent", fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>
                  {activeElement.fullWidth ? "Full Width (100%)" : "Auto / Fit Content"}
                </button>
              </div>

              <PropRow label="Leading Icon">
                <SelField value={activeElement.btnIcon || "none"} onChange={v => updateGridElement(activeElement.id, { btnIcon: v as any })}
                  options={[
                    { label: "None", value: "none" },
                    { label: "Download Icon", value: "download" },
                    { label: "Library Icon", value: "library" },
                    { label: "Cart Icon", value: "cart" },
                    { label: "Checkmark Icon", value: "check" },
                    { label: "Thumbs Up Icon", value: "thumbs-up" },
                  ]} />
              </PropRow>

              <PropRow label="Background Color / Free Gradient">
                <ColorField value={activeElement.btnGradient || activeElement.btnBg || GREEN_ACCENT} onChange={v => updateGridElement(activeElement.id, { btnGradient: v, btnBg: v })} placeholder="e.g. linear-gradient(135deg, #38d39f, #2ecc71) or #38d39f" />
              </PropRow>

              <PropRow label="Text Color"><ColorField value={activeElement.btnColor || "#0e1116"} onChange={v => updateGridElement(activeElement.id, { btnColor: v })} /></PropRow>
              <PropRow label="Border Color"><ColorField value={activeElement.btnBorderColor || ""} onChange={v => updateGridElement(activeElement.id, { btnBorderColor: v })} /></PropRow>

              <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}>Hover Interaction</p>
              <PropRow label="Hover Background / Free Gradient"><ColorField value={activeElement.btnHoverBg || ""} onChange={v => updateGridElement(activeElement.id, { btnHoverBg: v })} placeholder="e.g. #2ecc71 or linear-gradient(...)" /></PropRow>
              <PropRow label="Hover Text Color"><ColorField value={activeElement.btnHoverColor || ""} onChange={v => updateGridElement(activeElement.id, { btnHoverColor: v })} /></PropRow>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PropRow label="Pad Vertical"><NumField value={activeElement.btnPaddingV ?? 12} onChange={v => updateGridElement(activeElement.id, { btnPaddingV: v })} unit="px" max={40} /></PropRow>
                <PropRow label="Pad Horizontal"><NumField value={activeElement.btnPaddingH ?? 20} onChange={v => updateGridElement(activeElement.id, { btnPaddingH: v })} unit="px" max={60} /></PropRow>
              </div>
              <PropRow label="Border Radius"><NumField value={activeElement.btnRadius ?? 3} onChange={v => updateGridElement(activeElement.id, { btnRadius: v })} unit="px" max={40} /></PropRow>
              <PropRow label="Alignment"><AlignField value={activeElement.align || "left"} onChange={v => updateGridElement(activeElement.id, { align: v as any })} /></PropRow>
            </>}

            {activeElement.type === "image" && <>
              <PropRow label="Image URL"><TxtInput value={activeElement.imageSrc || ""} onChange={v => updateGridElement(activeElement.id, { imageSrc: v })} placeholder="https://…" /></PropRow>
              <PropRow label="Alt Text"><TxtInput value={activeElement.imageAlt || ""} onChange={v => updateGridElement(activeElement.id, { imageAlt: v })} placeholder="Description" /></PropRow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PropRow label="Max Width (%)"><NumField value={activeElement.imageMaxWidth || 100} onChange={v => updateGridElement(activeElement.id, { imageMaxWidth: v })} unit="%" min={10} max={100} /></PropRow>
                <PropRow label="Radius"><NumField value={activeElement.imageRadius || 0} onChange={v => updateGridElement(activeElement.id, { imageRadius: v })} unit="px" max={40} /></PropRow>
              </div>
              <PropRow label="Alignment"><AlignField value={activeElement.align || "center"} onChange={v => updateGridElement(activeElement.id, { align: v as any })} /></PropRow>
            </>}

            {activeElement.type === "divider" && <>
              <PropRow label="Color"><ColorField value={activeElement.dividerColor || BORDER} onChange={v => updateGridElement(activeElement.id, { dividerColor: v })} /></PropRow>
              <PropRow label="Thickness"><NumField value={activeElement.dividerThickness || 1} onChange={v => updateGridElement(activeElement.id, { dividerThickness: v })} unit="px" min={1} max={12} /></PropRow>
            </>}

            {activeElement.type === "spacer" && <>
              <PropRow label="Height"><NumField value={activeElement.spacerHeight || 30} onChange={v => updateGridElement(activeElement.id, { spacerHeight: v })} unit="px" min={4} max={200} step={4} /></PropRow>
            </>}
          </PropSection>
        )}

      </div>
    </div>
  );
}

// ── JSON Schema Serializer / Exporter for Default & Custom Themes ────────────
const COMPONENT_NAME_MAP: Record<string, string> = {
  "game-hero": "GameHero",
  "game-header": "GameHeader",
  "ownership-banner": "OwnershipBanner",
  "about-game": "AboutGame",
  "system-reqs": "SystemReqs",
  "user-reviews": "UserReviews",
  "sidebar-cta": "SidebarCTA",
  "sidebar-info": "SidebarInfo",
  "sidebar-ratings": "SidebarRatings",
  "sidebar-community": "SidebarCommunity",
  "recommendations": "Recommendations",
  "grid": "CustomGrid",
  "text": "TextBlock",
  "image": "ImageBlock",
  "carousel": "CarouselShowcase",
  "features": "FeaturesGrid",
  "two-col": "TwoColumns",
  "divider": "Divider",
  "spacer": "Spacer",
  "cta": "CTABlock",
  "heading": "HeadingBlock",
  "button": "ButtonBlock"
};

function getComponentStyles(s: any): Record<string, any> {
  const stylesObj: Record<string, any> = {
    section: {
      background: s.bg || "transparent",
      paddingTop: `${s.pt || 0}px`,
      paddingBottom: `${s.pb || 0}px`,
      paddingLeft: `${s.ph || 0}px`,
      paddingRight: `${s.ph || 0}px`,
      borderRadius: `${s.radius || 0}px`,
      ...(s.borderTopColor ? { borderTopColor: s.borderTopColor } : {})
    }
  };

  if (s.type === "sidebar-cta") {
    stylesObj.card = { background: s.sideCardBg || SURFACE, borderColor: s.sideCardBorder || BORDER, borderTopColor: s.sideAccentColor || HATHOR_ORANGE };
    stylesObj.headerTitle = { fontFamily: s.sideHeaderFont || "'Cinzel', serif", color: s.sideHeaderColor || (s.sidebarOwned ? GREEN_ACCENT : HATHOR_ORANGE) };
    stylesObj.bodyText = { color: s.sideBodyColor || TEXT_MUTED };
    stylesObj.primaryBtn = { background: s.ctaPrimaryBtnBg || (s.sidebarOwned ? GREEN_ACCENT : HATHOR_ORANGE), color: s.ctaPrimaryBtnTextColor || (s.sidebarOwned ? "#0e1116" : "#ffffff"), borderRadius: `${s.ctaBtnRadius ?? 3}px` };
    stylesObj.secondaryBtn = { background: s.ctaSecondaryBtnBg || "transparent", color: s.ctaSecondaryBtnTextColor || GREEN_ACCENT, borderColor: s.ctaSecondaryBtnBorder || "rgba(56, 211, 159, 0.35)" };
  } else if (s.type === "sidebar-info") {
    stylesObj.card = { background: s.infoCardBg || SURFACE, borderColor: s.infoCardBorder || BORDER };
    stylesObj.headerTitle = { fontFamily: s.infoTitleFont || "'Cinzel', serif", color: s.infoTitleColor || HATHOR_ORANGE };
    stylesObj.labels = { color: s.infoLabelColor || TEXT_MUTED, fontFamily: s.infoLabelFont || "monospace" };
    stylesObj.values = { color: s.infoValueColor || TEXT_PRIMARY, fontFamily: s.infoValueFont || "monospace" };
  } else if (s.type === "sidebar-ratings") {
    stylesObj.card = { background: s.ratingsCardBg || SURFACE, borderColor: s.ratingsCardBorder || BORDER };
    stylesObj.headerTitle = { fontFamily: s.ratingsTitleFont || "'Cinzel', serif", color: s.ratingsTitleColor || HATHOR_ORANGE };
    stylesObj.labels = { color: s.ratingsLabelColor || TEXT_MUTED, fontFamily: s.ratingsLabelFont || "monospace" };
    stylesObj.progressBar = { background: s.ratingsFillColor || HATHOR_ORANGE };
    stylesObj.progressTrack = { background: s.ratingsTrackColor || "rgba(0,0,0,0.3)" };
    stylesObj.percentage = { color: s.ratingsPctColor || TEXT_PRIMARY };
  } else if (s.type === "sidebar-community") {
    stylesObj.card = { background: s.communityCardBg || SURFACE, borderColor: s.communityCardBorder || BORDER };
    stylesObj.headerTitle = { fontFamily: s.communityTitleFont || "'Cinzel', serif", color: s.communityTitleColor || HATHOR_ORANGE };
    stylesObj.labels = { color: s.communityLabelColor || TEXT_MUTED, fontFamily: s.communityLabelFont || "monospace" };
    stylesObj.playersValue = { color: s.communityPlayersColor || TEXT_PRIMARY };
    stylesObj.positiveRatingValue = { color: s.communityPositiveColor || GREEN_ACCENT };
  } else if (s.type === "ownership-banner") {
    stylesObj.banner = { background: s.ownershipBg || "#181c24", borderColor: s.ownershipBorder || "rgba(56, 211, 159, 0.35)" };
    stylesObj.statusTitle = { fontFamily: s.ownershipTitleFont || "'Cinzel', serif", color: s.ownershipTitleColor || GREEN_ACCENT };
    stylesObj.subtext = { color: s.ownershipSubColor || TEXT_MUTED };
    stylesObj.downloadBtn = { background: s.ownershipBtn1Bg || GREEN_ACCENT, color: s.ownershipBtn1Color || "#0e1116" };
    stylesObj.libraryBtn = { background: s.ownershipBtn2Bg || "transparent", color: s.ownershipBtn2Color || GREEN_ACCENT };
  } else if (s.type === "about-game") {
    stylesObj.headerTitle = { fontFamily: s.aboutTitleFont || "'Cinzel', serif", color: s.aboutTitleColor || TEXT_PRIMARY };
    stylesObj.subheading = { fontFamily: s.aboutSubheadingFont || "'Cinzel', serif", color: s.aboutSubheadingColor || HATHOR_ORANGE };
    stylesObj.bodyText = { fontFamily: s.aboutBodyFont || "'Raleway', sans-serif", color: s.aboutBodyColor || TEXT_MUTED };
  } else if (s.type === "system-reqs") {
    stylesObj.headerTitle = { fontFamily: s.reqsTitleFont || "'Cinzel', serif", color: s.reqsTitleColor || TEXT_PRIMARY };
    stylesObj.activeTab = { background: s.reqsTabActiveBg || "rgba(242, 107, 33, 0.22)", color: s.reqsTabActiveColor || HATHOR_ORANGE };
    stylesObj.specCard = { background: s.reqsCardBg || SURFACE, borderColor: s.reqsCardBorder || BORDER };
    stylesObj.specLabel = { color: s.reqsLabelColor || HATHOR_ORANGE };
    stylesObj.specValue = { color: s.reqsValueColor || TEXT_PRIMARY, fontFamily: s.reqsValueFont || "'Cinzel', serif" };
  } else if (s.type === "user-reviews") {
    stylesObj.reviewCard = { background: s.reviewCardBg || SURFACE, borderColor: s.reviewCardBorder || BORDER, borderRadius: `${s.reviewCardRadius ?? 4}px` };
    stylesObj.reviewerName = { color: s.reviewNameColor || TEXT_PRIMARY, fontFamily: s.reviewNameFont || "'Cinzel', serif" };
    stylesObj.reviewBody = { color: s.reviewBodyColor || TEXT_MUTED, fontFamily: s.reviewBodyFont || "'Raleway', sans-serif" };
    stylesObj.starAccent = { color: s.reviewStarColor || HATHOR_ORANGE };
    stylesObj.badge = { background: s.reviewBadgeBg || "rgba(46, 204, 113, 0.06)", color: s.reviewBadgeColor || "#2ecc71" };
  } else if (s.type === "recommendations") {
    stylesObj.recsCard = { background: s.recsCardBg || SURFACE, borderColor: s.recsCardBorder || BORDER };
  } else if (s.type === "heading" || s.type === "text") {
    stylesObj.typography = {
      fontFamily: s.textFont || s.font || "'Raleway', sans-serif",
      fontSize: `${s.textSize || s.size || 14}px`,
      fontWeight: s.textWeight || s.weight || "400",
      color: s.textColor || s.color || TEXT_MUTED,
      textAlign: s.textAlign || s.align || "left"
    };
  } else if (s.type === "button") {
    stylesObj.buttonElement = {
      background: s.btnGradient || s.btnBg || GREEN_ACCENT,
      color: s.btnColor || "#0e1116",
      borderColor: s.btnBorderColor || "transparent",
      borderRadius: `${s.btnRadius ?? 3}px`
    };
  }

  return stylesObj;
}

function getComponentChildren(s: any): Record<string, any> {
  switch (s.type) {
    case "game-hero":
      return { heroImages: s.heroImages || [], heroHeight: s.heroHeight || 480, showThumbnails: s.showThumbnails ?? true };
    case "game-header":
      return { gameCategory: s.gameCategory, gameTitle: s.gameTitle, gameSubtitle: s.gameSubtitle, gameRatingScore: s.gameRatingScore, gameReviewCount: s.gameReviewCount, gameDev: s.gameDev, gameReleaseDate: s.gameReleaseDate, gameTags: s.gameTags, gameDesc: s.gameDesc };
    case "ownership-banner":
      return { ownershipStatus: s.ownershipStatus, ownershipSub: s.ownershipSub, ownershipBtn1: s.ownershipBtn1, ownershipBtn2: s.ownershipBtn2 };
    case "about-game":
      return { aboutTitle: s.aboutTitle, aboutSections: s.aboutSections };
    case "system-reqs":
      return { reqsMin: s.reqsMin, reqsRec: s.reqsRec };
    case "user-reviews":
      return { reviewHeader: s.reviewHeader };
    case "sidebar-cta":
      return { sidebarPrice: s.sidebarPrice, sidebarDiscount: s.sidebarDiscount, sidebarOwned: s.sidebarOwned };
    case "sidebar-info":
      return { sideDev: s.sideDev, sidePub: s.sidePub, sideDate: s.sideDate, sideGenre: s.sideGenre, sidePlatforms: s.sidePlatforms };
    case "sidebar-ratings":
      return { sideRatings: s.sideRatings };
    case "sidebar-community":
      return { sideOwners: s.sideOwners, sidePositive: s.sidePositive };
    case "recommendations":
      return { recsTitle: s.recsTitle, recsCount: s.recsCount };
    case "text":
    case "heading":
      return { text: s.textContent || s.text };
    case "image":
      return { imageSrc: s.imageSrc, imageAlt: s.imageAlt, imageMaxWidth: s.imageMaxWidth, imageRadius: s.imageRadius };
    case "carousel":
      return { carouselImages: s.carouselImages, carouselHeight: s.carouselHeight, showThumbnails: s.showThumbnails ?? true };
    case "features":
      return { featuresTitle: s.featuresTitle, featuresCols: s.featuresCols, featuresItems: s.featuresItems };
    case "two-col":
      return { twoColRatio: s.twoColRatio, twoColGap: s.twoColGap, twoColLeftText: s.twoColLeftText, twoColRightImg: s.twoColRightImg };
    case "cta":
      return { ctaTitle: s.ctaTitle, ctaSubtitle: s.ctaSubtitle, ctaPrice: s.ctaPrice, ctaBtnText: s.ctaBtnText };
    case "divider":
      return { dividerColor: s.dividerColor, dividerThickness: s.dividerThickness, dividerWidth: s.dividerWidth };
    case "spacer":
      return { spacerHeight: s.spacerHeight };
    case "button":
      return { btnText: s.btnText, btnIcon: s.btnIcon, fullWidth: s.fullWidth };
    default:
      return {};
  }
}

export function generateDefaultLayoutJSON(sections: Section[]): Record<string, any> {
  const layoutObj: Record<string, any> = {};

  const heroSec = sections.find(s => s.type === "game-hero");
  if (heroSec) {
    layoutObj.media = heroSec.heroImages || [];
    layoutObj.heroHeight = heroSec.heroHeight || 480;
    layoutObj.showThumbnails = heroSec.showThumbnails ?? true;
  }

  let headerProps: any = sections.find(s => s.type === "game-header");
  if (!headerProps) {
    for (const sec of sections) {
      if (sec.type === "grid" && sec.gridCols) {
        for (const col of sec.gridCols) {
          const found = col.elements.find(e => e.type === "game-header");
          if (found) { headerProps = found; break; }
        }
      }
    }
  }
  if (headerProps) {
    layoutObj.gameHeader = {
      category: headerProps.gameCategory || "ACTION RPG",
      title: headerProps.gameTitle || "ELDEN THRONE",
      subtitle: headerProps.gameSubtitle || "",
      ratingScore: headerProps.gameRatingScore || 9.4,
      reviewCount: headerProps.gameReviewCount || "14.2k Reviews",
      dev: headerProps.gameDev || "Omegabyte Studios",
      releaseDate: headerProps.gameReleaseDate || "March 15, 2025",
      tags: headerProps.gameTags || [],
      desc: headerProps.gameDesc || ""
    };
  }

  let aboutProps: any = sections.find(s => s.type === "about-game");
  if (!aboutProps) {
    for (const sec of sections) {
      if (sec.type === "grid" && sec.gridCols) {
        for (const col of sec.gridCols) {
          const found = col.elements.find(e => e.type === "about-game");
          if (found) { aboutProps = found; break; }
        }
      }
    }
  }
  if (aboutProps) {
    layoutObj.gameAbout = {
      title: aboutProps.aboutTitle || "ABOUT THIS GAME",
      sections: aboutProps.aboutSections || []
    };
  }

  let reqsProps: any = sections.find(s => s.type === "system-reqs");
  if (!reqsProps) {
    for (const sec of sections) {
      if (sec.type === "grid" && sec.gridCols) {
        for (const col of sec.gridCols) {
          const found = col.elements.find(e => e.type === "system-reqs");
          if (found) { reqsProps = found; break; }
        }
      }
    }
  }
  if (reqsProps) {
    layoutObj.systemReqs = {
      min: reqsProps.reqsMin || {},
      rec: reqsProps.reqsRec || {}
    };
  }

  const recsSec = sections.find(s => s.type === "recommendations");
  if (recsSec) {
    layoutObj.recommendations = {
      title: recsSec.recsTitle || "MORE LIKE THIS",
      count: recsSec.recsCount || 4,
      cardBg: recsSec.recsCardBg || SURFACE,
      cardBorder: recsSec.recsCardBorder || BORDER
    };
  }

  return layoutObj;
}

function generateCustomLayoutJSON(sections: Section[]): Record<string, any> {
  const layoutObj: Record<string, any> = {};

  sections.forEach((s, idx) => {
    const key = s.id || `section_${idx + 1}`;
    layoutObj[key] = mapSectionToCustomExport(s);
  });

  return layoutObj;
}

function mapSectionToCustomExport(s: Section): any {
  const componentName = COMPONENT_NAME_MAP[s.type] || s.type;

  if (s.type === "grid") {
    return {
      component: componentName,
      style: getComponentStyles(s),
      children: {
        gridGap: s.gridGap || 40,
        gridTemplate: s.gridTemplate || "2:1",
        gridCols: (s.gridCols || []).map(col => ({
          id: col.id,
          style: {
            column: {
              background: col.bg || "transparent",
              ...(col.borderTopColor ? { borderTopColor: col.borderTopColor } : {})
            }
          },
          children: (col.elements || []).reduce((acc: Record<string, any>, el, elIdx) => {
            const elKey = el.id || `element_${elIdx + 1}`;
            acc[elKey] = mapSectionToCustomExport(el as any);
            return acc;
          }, {})
        }))
      }
    };
  }

  return {
    component: componentName,
    style: getComponentStyles(s),
    children: getComponentChildren(s)
  };
}

function cleanForComparison(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(cleanForComparison);
  const copy: Record<string, any> = {};
  for (const k of Object.keys(obj).sort()) {
    if (k === "id") continue; // Ignore auto-generated IDs
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
    theme: "custom",
    pageBody: pageSettings || DEFAULT_PAGE_SETTINGS,
    layout: generateCustomLayoutJSON(sections)
  };
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function DesignerPage() {
  const [state, setState] = useState({ sections: INITIAL, history: [INITIAL], historyIdx: 0 });
  const [pageSettings, setPageSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedColIdx, setSelectedColIdx] = useState<number | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(true);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const [device, setDevice] = useState<Device>("desktop");
  const [gameTitle, setGameTitle] = useState("ELDEN THRONE");
  const [toast, setToast] = useState<string | null>(null);

  const { sections, history, historyIdx } = state;

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2200); }

  function mutateSections(newSections: Section[], skipHistory = false) {
    setState(prev => {
      if (skipHistory) {
        const newHistory = [...prev.history];
        newHistory[prev.historyIdx] = newSections;
        return {
          ...prev,
          sections: newSections,
          history: newHistory,
        };
      }
      return {
        sections: newSections,
        history: [...prev.history.slice(0, prev.historyIdx + 1), newSections],
        historyIdx: prev.historyIdx + 1,
      };
    });
  }
  function undo() {
    setState(prev => {
      if (prev.historyIdx <= 0) return prev;
      const idx = prev.historyIdx - 1;
      return { sections: prev.history[idx], history: prev.history, historyIdx: idx };
    });
  }
  function redo() {
    setState(prev => {
      if (prev.historyIdx >= prev.history.length - 1) return prev;
      const idx = prev.historyIdx + 1;
      return { sections: prev.history[idx], history: prev.history, historyIdx: idx };
    });
  }

  // Smart Add Handler: Inserts block directly into active Grid Column if a Column is selected!
  function addSection(type: SectionType | ElementType) {
    const activeSection = sections.find(s => s.id === selectedId);

    // If currently editing inside a Custom Grid Column, insert element directly into that Column!
    if (activeSection && activeSection.type === "grid" && selectedColIdx !== null && selectedColIdx !== undefined) {
      if (type === "grid") {
        showToast("Cannot nest a Multi-Column Layout inside another Column");
        return;
      }

      const newEl = createGridElement(type as ElementType);
      const updatedCols = (activeSection.gridCols || []).map((c, idx) =>
        idx === selectedColIdx ? { ...c, elements: [...c.elements, newEl] } : c
      );

      updateSection(activeSection.id, { gridCols: updatedCols });
      setSelectedElementId(newEl.id);
      showToast(`Inserted into Col ${selectedColIdx + 1}: ${BLOCK_META[type]?.label || type}`);
      return;
    }

    // Otherwise append top-level section as usual
    const s = createSection(type as SectionType);
    mutateSections([...sections, s]);
    setSelectedId(s.id);
    setSelectedColIdx(null);
    setSelectedElementId(null);
    showToast(`Added Section: ${BLOCK_META[type]?.label || type}`);
  }

  function addGridSection(template: string = "1:1") {
    const colCountMap: Record<string, number> = {
      "1": 1,
      "1:1": 2, "1:2": 2, "2:1": 2,
      "1:1:1": 3, "1:2:1": 3, "2:1:1": 3, "1:1:2": 3,
      "1:1:1:1": 4
    };
    const reqCols = colCountMap[template] || 2;
    const gridCols = Array.from({ length: reqCols }, () => ({
      id: uid(), bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0, elements: []
    }));

    const newGrid: Section = {
      id: uid(),
      type: "grid",
      bg: "transparent",
      bgImage: "",
      overlay: 0,
      pt: 32,
      pb: 48,
      ph: 32,
      pl: 32,
      pr: 32,
      radius: 0,
      gridTemplate: template,
      gridGap: 40,
      gridCols: gridCols
    };

    mutateSections([...sections, newGrid]);
    setSelectedId(newGrid.id);
    setSelectedColIdx(0);
    setSelectedElementId(null);
    showToast(`Added ${reqCols}-Column Layout (${template})`);
  }

  function updateSection(id: string, updates: Partial<Section>, skipHistory = false) {
    mutateSections(sections.map(s => s.id === id ? { ...s, ...updates } : s), skipHistory);
  }
  function moveUp(i: number) {
    if (i <= 0) return;
    const arr = [...sections]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    mutateSections(arr);
  }
  function moveDown(i: number) {
    if (i >= sections.length - 1) return;
    const arr = [...sections]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    mutateSections(arr);
  }
  function duplicateSection(i: number) {
    const duped = { ...sections[i], id: uid() };
    const arr = [...sections]; arr.splice(i + 1, 0, duped);
    mutateSections(arr);
    setSelectedId(duped.id);
    setSelectedColIdx(null);
    setSelectedElementId(null);
    showToast("Block duplicated");
  }
  function deleteSection(i: number) {
    mutateSections(sections.filter((_, j) => j !== i));
    setSelectedId(null);
    setSelectedColIdx(null);
    setSelectedElementId(null);
  }

  const selectedSection = sections.find(s => s.id === selectedId) ?? null;
  const deviceMax = device === "mobile" ? 375 : device === "tablet" ? 768 : undefined;
  const isCustom = isCustomTheme(sections);

  return (
    <div className={styles.designerContainer}>

      {/* Choice Modal Overlay */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2 className={styles.modalTitle}>Choose Your Starting Canvas</h2>
            <p className={styles.modalSub}>Select how you would like to start building your store page</p>

            <div className={styles.modalOptionsGrid}>
              <div className={styles.modalOptionCard} onClick={() => {
                setState({ sections: INITIAL, history: [INITIAL], historyIdx: 0 });
                setSelectedId(null);
                setSelectedColIdx(null);
                setSelectedElementId(null);
                setShowModal(false);
                showToast("Loaded Default Game Details Layout");
              }}>
                <div className={styles.modalIconWrap} style={{ background: "rgba(242, 107, 33, 0.18)", color: HATHOR_ORANGE }}>
                  <LayoutGrid size={28} />
                </div>
                <h3>Default Game Layout</h3>
                <p>Start with the pre-built Elden Throne store page layout featuring media showcase carousel, two-column content, system specs, reviews, and recommendations.</p>
                <button className={styles.modalBtnPrimary}>Load Default Layout</button>
              </div>

              <div className={styles.modalOptionCard} onClick={() => {
                setState({ sections: [], history: [[]], historyIdx: 0 });
                setSelectedId(null);
                setSelectedColIdx(null);
                setSelectedElementId(null);
                setShowModal(false);
                showToast("Started with Blank Canvas");
              }}>
                <div className={styles.modalIconWrap} style={{ background: "rgba(56, 211, 159, 0.15)", color: GREEN_ACCENT }}>
                  <Layers size={28} />
                </div>
                <h3>Blank Slate</h3>
                <p>Start with an empty canvas and build your page block-by-block using custom grids, heroes, text, media, and game components.</p>
                <button className={styles.modalBtnSecondary}>Start From Scratch</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish & JSON Export Modal */}
      {showPublishModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPublishModal(false)}>
          <div className={styles.modalCard} style={{ maxWidth: 740, width: "92%", textAlign: "left" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: `1px solid ${BORDER}`, paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileJson size={22} style={{ color: HATHOR_ORANGE }} />
                <h2 className={styles.modalTitle} style={{ margin: 0, fontSize: 18 }}>Store Page JSON Output</h2>
              </div>
              <button onClick={() => setShowPublishModal(false)} style={{ background: "transparent", border: "none", color: TEXT_MUTED, cursor: "pointer", display: "flex", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <p className={styles.modalSub} style={{ marginBottom: 14 }}>
              This JSON schema is saved to <code style={{ color: HATHOR_ORANGE, fontFamily: "monospace" }}>pageTheme</code> in the database to render the published store page.
            </p>

            {/* Automatic Theme Mode Badge */}
            {isCustom ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(242, 107, 33, 0.12)", border: "1px solid rgba(242, 107, 33, 0.4)", padding: "10px 14px", borderRadius: 6, marginBottom: 16, color: HATHOR_ORANGE, fontSize: 11, fontFamily: "monospace", fontWeight: 800 }}>
                <Layers size={15} />
                <span>THEME MODE: "custom" — Custom components or styling modifications detected</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(56, 211, 159, 0.12)", border: "1px solid rgba(56, 211, 159, 0.4)", padding: "10px 14px", borderRadius: 6, marginBottom: 16, color: GREEN_ACCENT, fontSize: 11, fontFamily: "monospace", fontWeight: 800 }}>
                <Check size={15} />
                <span>THEME MODE: "default" — Standard unmodified layout & styling</span>
              </div>
            )}

            {/* Formatted JSON Code Container */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <pre style={{
                background: "#0d1017",
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                padding: 16,
                maxHeight: 340,
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: 11,
                lineHeight: 1.5,
                color: GREEN_ACCENT,
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}>
                {JSON.stringify(generatePageJSON(sections, pageSettings), null, 2)}
              </pre>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  const jsonStr = JSON.stringify(generatePageJSON(sections, pageSettings), null, 2);
                  navigator.clipboard.writeText(jsonStr);
                  showToast("JSON schema copied to clipboard!");
                }}
                style={{
                  background: "transparent",
                  border: `1px solid ${BORDER}`,
                  color: TEXT_PRIMARY,
                  padding: "10px 16px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Copy size={13} /> COPY JSON
              </button>

              <button
                onClick={() => {
                  const jsonStr = JSON.stringify(generatePageJSON(sections), null, 2);
                  const blob = new Blob([jsonStr], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${gameTitle.toLowerCase().replace(/\s+/g, '-')}-pageTheme.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast("Downloaded pageTheme.json file!");
                }}
                style={{
                  background: "transparent",
                  border: `1px solid ${GREEN_ACCENT}`,
                  color: GREEN_ACCENT,
                  padding: "10px 16px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Download size={13} /> DOWNLOAD .JSON
              </button>

              <button
                onClick={() => {
                  setShowPublishModal(false);
                  showToast(`Page Published to Database (${isCustom ? 'theme: custom' : 'theme: default'})!`);
                }}
                style={{
                  background: HATHOR_ORANGE,
                  border: "none",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 900,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Upload size={13} /> PUBLISH TO CATALOG
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Live Game Details Page Full-screen Preview Modal */}
      {showPreviewModal && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999999, background: "#0a0c10",
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <div style={{
            height: 50, background: "#141820", borderBottom: `1px solid ${BORDER}`,
            padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: GREEN_ACCENT, fontWeight: 800, fontSize: 12, fontFamily: "monospace" }}>
                <Eye size={14} /> LIVE GAME DETAILS PAGE PREVIEW
              </div>
              <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: "monospace", borderLeft: `1px solid ${BORDER}`, paddingLeft: 12 }}>
                {isCustom ? 'Theme Mode: "custom"' : 'Theme Mode: "default"'}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 10, color: HATHOR_ORANGE, fontWeight: 700, fontFamily: "monospace" }}>
                Rendering Store Page JSON Schema
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  background: HATHOR_ORANGE, border: "none", color: "#fff",
                  padding: "6px 14px", borderRadius: 4, fontWeight: 800, fontSize: 11,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                }}
              >
                <X size={14} /> CLOSE PREVIEW
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            <GameDetailsPage themeConfig={generatePageJSON(sections, pageSettings)} />
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          <Check size={12} style={{ color: GREEN_ACCENT }} />
          <span>{toast}</span>
        </div>
      )}

      {/* ── Top toolbar ── */}
      <div className={styles.topToolbar}>
        <HathorLogo height={20} width="auto" className={styles.logo} />
        <div className={styles.toolbarDivider} />
        <span className={styles.titleTag}>Store Page Designer</span>
        <div className={styles.toolbarDivider} />
        <input
          value={gameTitle} onChange={e => setGameTitle(e.target.value)}
          className={styles.gameTitleInput}
        />
        <div className={styles.toolbarSpacer} />

        {/* Template Selector Button */}
        <button onClick={() => setShowModal(true)} className={styles.saveDraftBtn} style={{ background: "transparent", border: "1px solid #353c4d", color: TEXT_MUTED }}>
          <LayoutGrid size={11} /> Templates
        </button>

        <div className={styles.toolbarDivider} />

        {/* Device preview toggle */}
        <div className={styles.deviceToggleGroup}>
          {(["desktop", "tablet", "mobile"] as Device[]).map(d => {
            const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
            const isActive = device === d;
            return (
              <button key={d} onClick={() => setDevice(d)}
                className={`${styles.deviceBtn} ${isActive ? styles.deviceBtnActive : ""}`}
                title={d.charAt(0).toUpperCase() + d.slice(1)}>
                <Icon size={13} />
              </button>
            );
          })}
        </div>

        <div className={styles.toolbarDivider} />

        {/* Undo / Redo */}
        <button onClick={undo} disabled={historyIdx <= 0} className={styles.iconActionBtn} title="Undo">
          <RotateCcw size={13} />
        </button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1} className={styles.iconActionBtn} title="Redo">
          <RotateCw size={13} />
        </button>

        <div className={styles.toolbarDivider} />

        {/* Actions */}
        <button onClick={() => setShowPreviewModal(true)} className={styles.saveDraftBtn} style={{ background: "rgba(56, 211, 159, 0.14)", border: `1px solid ${GREEN_ACCENT}`, color: GREEN_ACCENT, fontWeight: 800 }}>
          <Eye size={12} /> Preview Game Page
        </button>
        <button onClick={() => {
          showToast("Draft saved as JSON");
          console.log("Draft pageTheme JSON:", generatePageJSON(sections, pageSettings));
        }} className={styles.saveDraftBtn}>
          <Save size={11} /> Save Draft
        </button>
        <button onClick={() => setShowPublishModal(true)} className={styles.saveDraftBtn} style={{ background: "transparent", border: `1px solid ${HATHOR_ORANGE}`, color: HATHOR_ORANGE }}>
          <FileJson size={11} /> View JSON
        </button>
        <button onClick={() => setShowPublishModal(true)} className={styles.publishBtn}>
          <Upload size={11} /> Publish
        </button>
      </div>

      {/* ── Body ── */}
      <div className={styles.editorBody}>

        {/* Left — block palette */}
        <BlockPalette onAdd={addSection} onAddGridWithCols={addGridSection} />

        {/* Center — canvas */}
        <div
          className={styles.canvasArea}
          style={{
            backgroundColor: (pageSettings.bg && pageSettings.bg !== "transparent") ? pageSettings.bg : BG,
            backgroundImage: pageSettings.bgImage ? `url("${pageSettings.bgImage}")` : undefined,
            backgroundSize: pageSettings.bgSize || "cover",
            backgroundPosition: pageSettings.bgPosition || "center center",
            backgroundRepeat: pageSettings.bgRepeat || "no-repeat",
            position: "relative",
            transition: "all 0.2s ease"
          }}
          onClick={() => { setSelectedId(null); setSelectedColIdx(null); setSelectedElementId(null); }}
        >
          {/* Outer Canvas Background Overlay Tint */}
          {pageSettings.bgImage && (pageSettings.bgOverlay || pageSettings.bgOverlayOpacity !== undefined) && (
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: pageSettings.bgOverlay || "rgba(0,0,0,0.5)",
                opacity: pageSettings.bgOverlayOpacity ?? 0,
                pointerEvents: "none",
                zIndex: 0
              }}
            />
          )}

          {/* Page frame */}
          <div
            className={styles.canvasWrapper}
            style={{
              maxWidth: deviceMax,
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "transparent",
              paddingTop: pageSettings.padTop ?? 0,
              paddingBottom: pageSettings.padBottom ?? 40,
              paddingLeft: pageSettings.padLeft ?? 0,
              paddingRight: pageSettings.padRight ?? 0,
              position: "relative",
              zIndex: 1,
              transition: "all 0.2s ease"
            }}
            onClick={e => e.stopPropagation()}
          >
            {sections.length === 0 ? (
              <div className={styles.emptyCanvas}>
                <Layers size={40} style={{ opacity: 0.15 }} />
                <p style={{ fontWeight: 700 }}>Your page is empty</p>
                <p style={{ fontSize: 10, opacity: 0.5 }}>Click a block in the left panel or click Templates to load a pre-built layout</p>
                <button onClick={() => setShowModal(true)} className={styles.modalBtnPrimary} style={{ width: "auto", padding: "8px 16px", marginTop: 8 }}>
                  Choose Template
                </button>
              </div>
            ) : sections.map((s, i) => (
              <SectionWrapper
                key={s.id} section={s} device={device}
                pageSettings={pageSettings}
                selected={s.id === selectedId}
                selectedColIdx={s.id === selectedId ? selectedColIdx : null}
                selectedElementId={s.id === selectedId ? selectedElementId : null}
                isFirst={i === 0} isLast={i === sections.length - 1}
                onSelect={() => {
                  setSelectedId(s.id);
                  setSelectedColIdx(null);
                  setSelectedElementId(null);
                }}
                onSelectChild={(colIdx, elementId) => {
                  setSelectedId(s.id);
                  setSelectedColIdx(colIdx);
                  setSelectedElementId(elementId || null);
                }}
                onMoveUp={() => moveUp(i)}
                onMoveDown={() => moveDown(i)}
                onDuplicate={() => duplicateSection(i)}
                onDelete={() => deleteSection(i)}
              />
            ))}
          </div>
        </div>

        {/* Right — properties */}
        <PropertiesPanel
          section={selectedSection}
          selectedColIdx={selectedColIdx}
          selectedElementId={selectedElementId}
          onChange={updateSection}
          pageSettings={pageSettings}
          onPageSettingsChange={setPageSettings}
        />
      </div>
    </div>
  );
}
