import React, { useState, useEffect, useRef } from "react";
import {
  Type, Film, LayoutGrid, Minus,
  ChevronUp, ChevronDown, Trash2, Plus, Copy,
  Monitor, Tablet, Smartphone, Save,
  X, ChevronLeft, ChevronRight,
  AlignLeft, AlignCenter, AlignRight,
  Hash, Zap, Check,
  Upload, Layers, Settings, RotateCcw, RotateCw,
  Image as ImageIcon, Award, MessageSquare, MonitorCheck,
  BarChart2, Users, ShoppingBag, Info, LucideIcon,
  Download, Library, ThumbsUp, ShoppingCart, Maximize2,
  Database
} from "lucide-react";
import { HathorLogo } from "../../assets";
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
  | "sidebar-cta" | "sidebar-info" | "sidebar-ratings" | "sidebar-community";

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

  // Carousel
  carouselImages?: string[]; carouselHeight?: number; carouselRadius?: number;

  // Features
  featuresTitle?: string; featuresTitleFont?: string; featuresTitleColor?: string; featuresCols?: number; featuresItems?: FeatureItem[];

  // Two-col
  twoColRatio?: string; twoColGap?: number; twoColLeftType?: "text" | "image"; twoColLeftText?: string; twoColLeftFont?: string; twoColLeftSize?: number; twoColLeftWeight?: string; twoColLeftColor?: string; twoColLeftAlign?: string; twoColLeftImg?: string; twoColRightType?: "text" | "image"; twoColRightText?: string; twoColRightFont?: string; twoColRightSize?: number; twoColRightWeight?: string; twoColRightColor?: string; twoColRightAlign?: string; twoColRightImg?: string;

  // Divider / Spacer
  dividerColor?: string;
  dividerThickness?: number;
  spacerHeight?: number;
}

export interface GridColumn {
  id: string;
  bg?: string;
  pt?: number;
  pb?: number;
  ph?: number;
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
  | "text"
  | "image"
  | "carousel"
  | "features"
  | "two-col"
  | "grid"
  | "divider"
  | "spacer"
  | "cta";

type Device = "desktop" | "tablet" | "mobile";

interface FeatureItem { icon: string; title: string; desc: string; color: string; }

interface Section {
  id: string; type: SectionType;
  bg: string; bgImage: string; overlay: number;
  pt: number; pb: number; ph: number; radius: number;
  borderTopColor?: string;
  // Game Hero
  heroImages?: string[]; heroHeight?: number;
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

// ── Representative Dynamic Recommendation Mock Items ─────────────────────────
const DYNAMIC_RECS_PREVIEW: RecItem[] = [
  { id: "db_rec_1", title: "SHATTERED REALM", discount: "-20%", genre: "ACTION RPG", price: "349.00 EGP", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop" },
  { id: "db_rec_2", title: "CRIMSON ACCORD", genre: "DARK FANTASY", price: "524.99 EGP", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop" },
  { id: "db_rec_3", title: "ASHEN TALE", genre: "SOULSLIKE", price: "529.99 EGP", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop" },
  { id: "db_rec_4", title: "MOON REQUIEM", discount: "-50%", genre: "GOTHIC", price: "169.99 EGP", image: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop" },
];

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
    case "divider": return { id, type, dividerColor: BORDER, dividerThickness: 1 };
    case "spacer": return { id, type, spacerHeight: 30 };
    default: return { id, type };
  }
}

// ── Default section factory ────────────────────────────────────────────────────
function createSection(type: SectionType): Section {
  const base = { id: uid(), bg: BG, bgImage: "", overlay: 0, pt: 0, pb: 0, ph: 0, radius: 0 };
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
      ...base, type, bg: BG, pt: 40, pb: 60, ph: 40, gridGap: 40, gridTemplate: "2:1",
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
    bg: BG, bgImage: "", overlay: 0, pt: 0, pb: 0, ph: 0, radius: 0,
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
    bg: BG, bgImage: "", overlay: 0, pt: 32, pb: 48, ph: 32, radius: 0,
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
    bg: BG, bgImage: "", overlay: 0, pt: 32, pb: 48, ph: 32, radius: 0,
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
      { type: "game-header", label: "Game Header", desc: "Title, rating, dev, tags & synopsis (Designer Input)", Icon: Award },
      { type: "system-reqs", label: "System Reqs", desc: "Min vs Recommended specs (Designer Input)", Icon: MonitorCheck },
      { type: "about-game", label: "About Section", desc: "Game lore, features & screenshots (Designer Input)", Icon: Info },
      { type: "ownership-banner", label: "Ownership Bar (DB)", desc: "Owned status & buy/download actions", Icon: ShoppingBag },
      { type: "user-reviews", label: "User Reviews (DB)", desc: "Dynamic reviews list & styling", Icon: MessageSquare },
      { type: "recommendations", label: "More Like This (DB)", desc: "Dynamic game recommendations", Icon: LayoutGrid },
    ],
  },
  {
    group: "Game Sidebar Cards",
    items: [
      { type: "sidebar-cta", label: "Sidebar Buy/Owned (DB)", desc: "Owned status / price & Add to Cart", Icon: ShoppingCart },
      { type: "sidebar-info", label: "Sidebar Details (DB)", desc: "Dev, publisher, date & platforms", Icon: Info },
      { type: "sidebar-ratings", label: "Sidebar Ratings (DB)", desc: "5-star rating progress bars", Icon: BarChart2 },
      { type: "sidebar-community", label: "Sidebar Community (DB)", desc: "Players & positive rating %", Icon: Users },
    ],
  },
  {
    group: "Layout & Grids",
    items: [
      { type: "grid", label: "Custom Grid", desc: "Rows, cols & free elements", Icon: LayoutGrid },
      { type: "two-col", label: "Two Columns", desc: "Preset side-by-side", Icon: Layers },
    ],
  },
  {
    group: "Media & Content",
    items: [
      { type: "text", label: "Text Block", desc: "Paragraph or heading", Icon: Type },
      { type: "image", label: "Image Block", desc: "Single image / screenshot", Icon: ImageIcon },
      { type: "features", label: "Features Grid", desc: "Icon feature cards", Icon: LayoutGrid },
      { type: "cta", label: "CTA Block", desc: "Price & buy card", Icon: Zap },
      { type: "divider", label: "Divider", desc: "Horizontal rule", Icon: Minus },
      { type: "spacer", label: "Spacer", desc: "Vertical spacing", Icon: Hash },
    ],
  },
];

const BLOCK_META: Record<string, { label: string; Icon: LucideIcon }> = {
  "game-hero": { label: "Media Showcase Hero", Icon: Film },
  "game-header": { label: "Game Header", Icon: Award },
  "ownership-banner": { label: "Ownership Bar (DB)", Icon: ShoppingBag },
  "about-game": { label: "About Game", Icon: Info },
  "system-reqs": { label: "System Reqs", Icon: MonitorCheck },
  "user-reviews": { label: "User Reviews (DB)", Icon: MessageSquare },
  "sidebar-cta": { label: "Sidebar CTA Card (DB)", Icon: ShoppingCart },
  "sidebar-info": { label: "Sidebar Game Info (DB)", Icon: Info },
  "sidebar-ratings": { label: "Sidebar Ratings (DB)", Icon: BarChart2 },
  "sidebar-community": { label: "Sidebar Community (DB)", Icon: Users },
  recommendations: { label: "More Like This (DB Widget)", Icon: LayoutGrid },
  text: { label: "Text Block", Icon: Type },
  image: { label: "Image Block", Icon: ImageIcon },
  carousel: { label: "Carousel Showcase", Icon: Film },
  features: { label: "Features Grid", Icon: LayoutGrid },
  "two-col": { label: "Two Columns", Icon: Layers },
  grid: { label: "Custom Grid", Icon: LayoutGrid },
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
function ColorField({ value, onChange, placeholder = "#000000 or transparent" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"solid" | "gradient">(value && value.includes("gradient") ? "gradient" : "solid");

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

  const handleRectPointer = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!rectRef.current) return;
    const rect = rectRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const newSat = Math.round((x / rect.width) * 100);
    const newVal = Math.round((1 - y / rect.height) * 100);

    setSat(newSat);
    setVal(newVal);
    onChange(hsvToHex(hue, newSat, newVal));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    handleRectPointer(e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        handleRectPointer(moveEvent);
      }
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const updateCustomGradient = (angle: number, c1: string, c2: string) => {
    setGradAngle(angle);
    setGradColor1(c1);
    setGradColor2(c2);
    onChange(`linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`);
  };

  const PRESETS = [
    HATHOR_ORANGE, GOLD_ACCENT, GREEN_ACCENT, "#2ecc71",
    "#3498db", "#9b59b6", "#e74c3c", BG,
    SURFACE, "#0a0d14", "#222831", "#e6edf3",
    "#a4b0be", "#ffffff"
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
          background: value || "transparent",
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
                    onChange(hsvToHex(newHue, sat, val));
                  }}
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
                      key={idx} type="button" onClick={() => onChange(p)}
                      style={{
                        width: "100%", aspectRatio: "1", borderRadius: 3, background: p,
                        border: value === p ? `2px solid ${HATHOR_ORANGE}` : "1px solid rgba(255,255,255,0.15)",
                        cursor: "pointer", outline: "none", padding: 0
                      }}
                      title={p}
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
                  onChange={e => updateCustomGradient(Number(e.target.value), gradColor1, gradColor2)}
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
  return (
    <div className={styles.numField}>
      <button onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} className={styles.numBtn}>−</button>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className={styles.numInput} min={min} max={max} step={step} />
      {unit && <span className={styles.unitSpan}>{unit}</span>}
      <button onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))} className={styles.numBtn}>+</button>
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
function TxtArea({ value, onChange, rows = 4 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className={styles.txtArea}>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} />
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

// ── Responsive Live Canvas Component Renderers ─────────────────────────────────

function GameHeroRenderer({ s, device }: { s: any; device: Device }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightbox, setIsLightbox] = useState(false);
  const imgs = s.heroImages || [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
  ];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx(i => (i > 0 ? i - 1 : imgs.length - 1));
  };
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx(i => (i < imgs.length - 1 ? i + 1 : 0));
  };

  const responsiveHeroHeight = device === "mobile" ? Math.min(s.heroHeight || 480, 260) : device === "tablet" ? Math.min(s.heroHeight || 480, 360) : (s.heroHeight || 480);
  const thumbWidth = device === "mobile" ? 110 : device === "tablet" ? 140 : 180;
  const thumbHeight = device === "mobile" ? 60 : device === "tablet" ? 80 : 100;
  const showThumbnails = s.showThumbnails ?? true;

  return (
    <div style={{ width: "100%", background: BG, position: "relative" }}>
      <div style={{ position: "relative", width: "100%", height: responsiveHeroHeight, overflow: "hidden", cursor: "pointer", transition: "height 0.25s ease" }}
        onClick={() => setIsLightbox(true)}>
        <img src={imgs[activeIdx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(33, 38, 49, 0.2) 0%, rgba(33, 38, 49, 0.5) 60%, #212631 100%)", pointerEvents: "none" }} />

        <div style={{ position: "absolute", bottom: device === "mobile" ? 10 : 20, right: device === "mobile" ? 12 : 24, background: "rgba(14, 17, 22, 0.8)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: device === "mobile" ? 6 : 10, borderRadius: 4, display: "flex", backdropFilter: "blur(4px)" }}>
          <Maximize2 size={device === "mobile" ? 12 : 16} />
        </div>

        <button onClick={handlePrev} style={{ position: "absolute", left: device === "mobile" ? 8 : 24, top: "50%", transform: "translateY(-50%)", width: device === "mobile" ? 32 : 44, height: device === "mobile" ? 32 : 44, background: "rgba(33, 38, 49, 0.75)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 2 }}>
          <ChevronLeft size={device === "mobile" ? 16 : 20} />
        </button>
        <button onClick={handleNext} style={{ position: "absolute", right: device === "mobile" ? 8 : 24, top: "50%", transform: "translateY(-50%)", width: device === "mobile" ? 32 : 44, height: device === "mobile" ? 32 : 44, background: "rgba(33, 38, 49, 0.75)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 2 }}>
          <ChevronRight size={device === "mobile" ? 16 : 20} />
        </button>
      </div>

      {showThumbnails && (
        <div style={{ maxWidth: 1280, margin: device === "mobile" ? "-1.5rem auto 0" : "-3rem auto 0", position: "relative", zIndex: 5, padding: device === "mobile" ? "0 12px" : "0 24px" }}>
          <div style={{ display: "flex", gap: device === "mobile" ? 8 : 16, overflowX: "auto", paddingBottom: 8 }}>
            {imgs.map((img: string, idx: number) => (
              <button key={idx} onClick={e => { e.stopPropagation(); setActiveIdx(idx); }}
                style={{ width: thumbWidth, height: thumbHeight, flexShrink: 0, borderRadius: 4, overflow: "hidden", border: idx === activeIdx ? `2px solid ${HATHOR_ORANGE}` : "2px solid transparent", opacity: idx === activeIdx ? 1 : 0.7, cursor: "pointer", background: SURFACE, padding: 0 }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {isLightbox && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }} onClick={() => setIsLightbox(false)}>
          <div style={{ position: "absolute", top: 24, left: 32, right: 32, display: "flex", justifyContent: "space-between", color: "#fff" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14 }}>SCREENSHOT {activeIdx + 1} OF {imgs.length}</span>
            <button onClick={() => setIsLightbox(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: 8, cursor: "pointer", borderRadius: 4 }}>
              <X size={16} />
            </button>
          </div>
          <button onClick={handlePrev} style={{ position: "absolute", left: 32, top: "50%", transform: "translateY(-50%)", background: "rgba(20,24,32,0.8)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 50, height: 50, borderRadius: 4, cursor: "pointer" }}>
            <ChevronLeft size={24} />
          </button>
          <img src={imgs[activeIdx]} alt="" style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 4 }} onClick={e => e.stopPropagation()} />
          <button onClick={handleNext} style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)", background: "rgba(20,24,32,0.8)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 50, height: 50, borderRadius: 4, cursor: "pointer" }}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

function GameHeaderRenderer({ s, device }: { s: any; device: Device }) {
  const tags = s.gameTags || ["OPEN WORLD", "SOULSLIKE", "DARK FANTASY", "SINGLE PLAYER", "RPG", "ATMOSPHERIC"];
  const titleSize = device === "mobile" ? 24 : device === "tablet" ? 32 : 40;

  return (
    <div style={{ marginBottom: device === "mobile" ? 20 : 32, width: "100%", boxSizing: "border-box" }}>
      {s.gameCategory && (
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: device === "mobile" ? 10 : 12, fontWeight: 700, color: HATHOR_ORANGE, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ display: "inline-block", width: 12, height: 2, background: HATHOR_ORANGE }} />
          <span>{s.gameCategory}</span>
          <span style={{ display: "inline-block", width: 12, height: 2, background: HATHOR_ORANGE }} />
        </div>
      )}
      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: titleSize, fontWeight: 900, color: "#ffffff", letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1.15, margin: "0 0 8px 0", wordBreak: "break-word", overflowWrap: "anywhere", transition: "font-size 0.2s ease" }}>
        {s.gameTitle || "ELDEN THRONE"}
      </h1>
      {s.gameSubtitle && (
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: device === "mobile" ? 11 : 13, fontWeight: 800, color: HATHOR_ORANGE, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12, wordBreak: "break-word" }}>
          {s.gameSubtitle}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: device === "mobile" ? 8 : 14, fontSize: device === "mobile" ? 11 : 13, color: TEXT_MUTED, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ color: HATHOR_ORANGE, letterSpacing: "0.1em" }}>★★★★★</span>
        <span style={{ fontWeight: 800, color: "#ffffff" }}>{(s.gameRatingScore || 9.4).toFixed(1)}</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>({s.gameReviewCount || "14.2k Reviews"})</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span style={{ color: TEXT_PRIMARY }}>{s.gameDev || "Omegabyte Studios"}</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span style={{ color: TEXT_PRIMARY }}>{s.gameReleaseDate || "March 15, 2025"}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {tags.map((t: string, i: number) => (
          <span key={i} style={{ background: "rgba(255, 255, 255, 0.05)", border: `1px solid ${BORDER}`, color: TEXT_MUTED, fontSize: device === "mobile" ? 9 : 11, fontWeight: 600, padding: "3px 10px", borderRadius: 3, textTransform: "uppercase" }}>
            {t}
          </span>
        ))}
      </div>
      <p style={{ fontSize: device === "mobile" ? 13 : 15, lineHeight: 1.65, color: TEXT_MUTED, margin: 0, borderLeft: `3px solid ${HATHOR_ORANGE}`, paddingLeft: 16, wordBreak: "break-word" }}>
        {s.gameDesc}
      </p>
    </div>
  );
}

function OwnershipBannerRenderer({ s, device }: { s: any; device: Device }) {
  const isMobile = device === "mobile";
  return (
    <div style={{
      background: "#181c24", border: "1px solid rgba(56, 211, 159, 0.35)", borderRadius: 4,
      padding: isMobile ? 14 : "18px 20px", marginBottom: 24,
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-between", gap: 16, width: "100%", boxSizing: "border-box"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 220px", minWidth: 0 }}>
        <div style={{ width: 36, height: 36, border: "1px solid rgba(56, 211, 159, 0.4)", background: "rgba(56, 211, 159, 0.05)", color: GREEN_ACCENT, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2, flexShrink: 0 }}>
          <Check size={18} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: isMobile ? 13 : 14, fontWeight: 800, color: GREEN_ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2, wordBreak: "break-word" }}>
            {s.ownershipStatus || "YOU OWN THIS GAME"}
          </div>
          <div style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "monospace", wordBreak: "break-word" }}>{s.ownershipSub || "Purchased Jun 10, 2025 • Available in your library"}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 180px", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button style={{ flex: "1 1 90px", background: "transparent", border: "1px solid rgba(56, 211, 159, 0.35)", color: GREEN_ACCENT, padding: "10px 12px", borderRadius: 3, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", boxSizing: "border-box" }}>
          <Library size={13} /> {s.ownershipBtn2 || "LIBRARY"}
        </button>
        <button style={{ flex: "1 1 100px", background: GREEN_ACCENT, border: `1px solid ${GREEN_ACCENT}`, color: "#0e1116", padding: "10px 14px", borderRadius: 3, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", boxSizing: "border-box" }}>
          <Download size={13} /> {s.ownershipBtn1 || "DOWNLOAD"}
        </button>
      </div>
    </div>
  );
}

function AboutGameRenderer({ s, device }: { s: any; device: Device }) {
  const sections = s.aboutSections || [];
  return (
    <div style={{ marginBottom: 40, width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: device === "mobile" ? 15 : 18, fontWeight: 900, color: TEXT_PRIMARY, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0, whiteSpace: "nowrap" }}>
          {s.aboutTitle || "ABOUT THIS GAME"}
        </h2>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {sections.map((sec: any, i: number) => (
          <div key={i}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: device === "mobile" ? 14 : 16, fontWeight: 800, color: HATHOR_ORANGE, marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase", wordBreak: "break-word" }}>
              {sec.title}
            </h3>
            <p style={{ color: TEXT_MUTED, fontFamily: "'Raleway', sans-serif", fontSize: device === "mobile" ? 13 : 14, lineHeight: 1.65, margin: 0, wordBreak: "break-word" }}>
              {sec.text}
            </p>
            {sec.img && (
              <img src={sec.img} alt="" style={{ width: "100%", borderRadius: 4, marginTop: 12, border: `1px solid ${BORDER}` }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemReqsRenderer({ s, device }: { s: any; device: Device }) {
  const [activeTab, setActiveTab] = useState<"rec" | "min">("rec");
  const data = activeTab === "rec" ? (s.reqsRec || { os: "Windows 11 (64-bit)", cpu: "Intel Core i7-12700K / AMD Ryzen 7 7800X3D", ram: "16 GB RAM", gpu: "NVIDIA GeForce RTX 4070 (12GB) / AMD Radeon RX 7800 XT", storage: "85 GB NVMe SSD" }) : (s.reqsMin || { os: "Windows 10 (64-bit)", cpu: "Intel Core i5-8400 / AMD Ryzen 5 2600", ram: "12 GB RAM", gpu: "NVIDIA GeForce GTX 1070 (8GB) / AMD Radeon RX 590", storage: "85 GB Available Space" });

  const isMobile = device === "mobile";

  return (
    <div style={{ marginBottom: 40, width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: isMobile ? 15 : 18, fontWeight: 900, color: TEXT_PRIMARY, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0, whiteSpace: "nowrap" }}>
          SYSTEM REQUIREMENTS
        </h2>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <div style={{ display: "inline-flex", border: `1px solid ${BORDER}`, borderRadius: 2, overflow: "hidden", marginBottom: 20 }}>
        <button onClick={() => setActiveTab("rec")}
          style={{ background: activeTab === "rec" ? "rgba(242, 107, 33, 0.22)" : "rgba(0,0,0,0.25)", color: activeTab === "rec" ? HATHOR_ORANGE : TEXT_MUTED, fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", padding: isMobile ? "7px 14px" : "9px 20px", border: "none", cursor: "pointer" }}>
          RECOMMENDED
        </button>
        <button onClick={() => setActiveTab("min")}
          style={{ background: activeTab === "min" ? "rgba(242, 107, 33, 0.22)" : "rgba(0,0,0,0.25)", color: activeTab === "min" ? HATHOR_ORANGE : TEXT_MUTED, fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", padding: isMobile ? "7px 14px" : "9px 20px", border: "none", borderLeft: `1px solid ${BORDER}`, cursor: "pointer" }}>
          MINIMUM
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: HATHOR_ORANGE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontFamily: "monospace" }}>OS</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 800, color: TEXT_PRIMARY, wordBreak: "break-word" }}>{data.os}</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: HATHOR_ORANGE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontFamily: "monospace" }}>CPU</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 800, color: TEXT_PRIMARY, wordBreak: "break-word" }}>{data.cpu}</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: HATHOR_ORANGE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontFamily: "monospace" }}>RAM</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 800, color: TEXT_PRIMARY, wordBreak: "break-word" }}>{data.ram}</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: HATHOR_ORANGE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontFamily: "monospace" }}>GPU</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 800, color: TEXT_PRIMARY, wordBreak: "break-word" }}>{data.gpu}</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px", gridColumn: isMobile ? "span 1" : "span 2" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: HATHOR_ORANGE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontFamily: "monospace" }}>STORAGE</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 800, color: TEXT_PRIMARY, wordBreak: "break-word" }}>{data.storage}</div>
        </div>
      </div>
    </div>
  );
}

function UserReviewsRenderer({ s, device }: { s: any; device: Device }) {
  const cardBg = s.reviewCardBg || SURFACE;
  const cardBorder = s.reviewCardBorder || BORDER;
  const cardRadius = s.reviewCardRadius ?? 4;
  const nameColor = s.reviewNameColor || TEXT_PRIMARY;
  const nameFont = s.reviewNameFont || "'Cinzel', serif";
  const bodyColor = s.reviewBodyColor || TEXT_MUTED;
  const bodyFont = s.reviewBodyFont || "'Raleway', sans-serif";
  const starColor = s.reviewStarColor || HATHOR_ORANGE;
  const badgeBg = s.reviewBadgeBg || "rgba(46, 204, 113, 0.06)";
  const badgeColor = s.reviewBadgeColor || "#2ecc71";

  const isMobile = device === "mobile";

  return (
    <div style={{ marginBottom: 40, width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: isMobile ? 15 : 18, fontWeight: 900, color: TEXT_PRIMARY, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
            {s.reviewHeader || "USER REVIEWS"}
          </h2>
          <span style={{ border: "1px solid rgba(242, 107, 33, 0.4)", background: "rgba(242, 107, 33, 0.1)", color: HATHOR_ORANGE, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 3, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5 }}>
            <Database size={10} /> [DB Component]
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: starColor, fontSize: 13, letterSpacing: "0.1em" }}>★★★★★</span>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: TEXT_PRIMARY }}>9.4</span>
        </div>
      </div>

      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: cardRadius, padding: isMobile ? 16 : 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, background: "rgba(0,0,0,0.3)", border: `1px solid ${cardBorder}`, color: starColor, fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
              USER
            </div>
            <div>
              <div style={{ fontFamily: nameFont, fontWeight: 700, fontSize: 14, color: nameColor, letterSpacing: "0.05em" }}>Sample Reviewer Name</div>
              <div style={{ color: starColor, fontSize: 12, marginTop: 2 }}>★★★★★ <span style={{ color: nameColor, fontSize: 11, fontWeight: 700 }}>9.5</span></div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: isMobile ? "center" : "flex-end", justifyContent: "space-between", width: isMobile ? "100%" : "auto" }}>
            <div style={{ border: `1px solid ${badgeColor}`, background: badgeBg, color: badgeColor, fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <ThumbsUp size={11} /> Recommended
            </div>
            <span style={{ fontSize: 10, color: TEXT_MUTED, marginTop: isMobile ? 0 : 4 }}>Sample Date</span>
          </div>
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: isMobile ? 13 : 14, lineHeight: 1.65, color: bodyColor, margin: "16px 0 14px", paddingBottom: 12, borderBottom: `1px solid ${cardBorder}` }}>
          "This component dynamically fetches user reviews from the database upon page publishing. You can configure its card background, border, typography, star accents, and recommended badge colors in the Properties Inspector."
        </div>
        <div style={{ fontSize: 11, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 6 }}>
          <ThumbsUp size={11} /> 42 people found this review helpful
        </div>
      </div>
    </div>
  );
}

function SidebarCtaRenderer({ s, device }: { s: any; device: Device }) {
  const isOwned = s.sidebarOwned ?? true;
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${HATHOR_ORANGE}`, borderRadius: 4, padding: device === "mobile" ? 16 : 24, marginBottom: 24, width: "100%", boxSizing: "border-box" }}>
      {isOwned ? (
        <>
          <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: device === "mobile" ? 22 : 26, fontWeight: 900, color: GREEN_ACCENT, letterSpacing: "0.06em", margin: "0 0 4px 0" }}>OWNED</h4>
          <span style={{ fontSize: 11, color: TEXT_MUTED, display: "block", marginBottom: 16, fontFamily: "monospace" }}>In your library</span>
          <button style={{ width: "100%", background: GREEN_ACCENT, border: `1px solid ${GREEN_ACCENT}`, color: "#0e1116", padding: "12px 16px", borderRadius: 3, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10, boxSizing: "border-box" }}>
            <Download size={14} /> DOWNLOAD NOW
          </button>
          <button style={{ width: "100%", background: "transparent", border: "1px solid rgba(56, 211, 159, 0.35)", color: GREEN_ACCENT, padding: "12px 16px", borderRadius: 3, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxSizing: "border-box" }}>
            <Library size={14} /> VIEW IN LIBRARY
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 900, color: HATHOR_ORANGE }}>{s.sidebarPrice || "299.99"} EGP</span>
            {(s.sidebarDiscount || 0) > 0 && (
              <span style={{ border: `1px solid ${HATHOR_ORANGE}`, background: "rgba(18,21,29,0.85)", color: HATHOR_ORANGE, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 2 }}>
                -{s.sidebarDiscount}%
              </span>
            )}
          </div>
          <button style={{ width: "100%", background: HATHOR_ORANGE, border: "none", color: "#ffffff", padding: "12px 16px", borderRadius: 3, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxSizing: "border-box" }}>
            <ShoppingCart size={14} /> ADD TO CART
          </button>
        </>
      )}
    </div>
  );
}

function SidebarInfoRenderer({ s, device }: { s: any; device: Device }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: device === "mobile" ? 16 : 24, marginBottom: 24, width: "100%", boxSizing: "border-box" }}>
      <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 900, color: HATHOR_ORANGE, letterSpacing: "0.12em", borderBottom: `1px solid ${BORDER}`, paddingBottom: 10, margin: "0 0 14px 0" }}>
        GAME DETAILS
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: TEXT_MUTED, fontFamily: "monospace" }}>Developer</span>
          <span style={{ color: TEXT_PRIMARY, fontWeight: 700, fontFamily: "monospace" }}>{s.sideDev || "Irongate Studios"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: TEXT_MUTED, fontFamily: "monospace" }}>Publisher</span>
          <span style={{ color: TEXT_PRIMARY, fontWeight: 700, fontFamily: "monospace" }}>{s.sidePub || "Obsidian Arc"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: TEXT_MUTED, fontFamily: "monospace" }}>Release Date</span>
          <span style={{ color: TEXT_PRIMARY, fontWeight: 700, fontFamily: "monospace" }}>{s.sideDate || "March 12, 2025"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: TEXT_MUTED, fontFamily: "monospace" }}>Genre</span>
          <span style={{ color: TEXT_PRIMARY, fontWeight: 700, fontFamily: "monospace" }}>{s.sideGenre || "Action RPG"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: TEXT_MUTED, fontFamily: "monospace" }}>Platforms</span>
          <span style={{ color: TEXT_PRIMARY, fontWeight: 700, fontFamily: "monospace" }}>{(s.sidePlatforms || ["Windows, macOS"]).join(", ")}</span>
        </div>
      </div>
    </div>
  );
}

function SidebarRatingsRenderer({ s, device }: { s: any; device: Device }) {
  const list = s.sideRatings || [
    { stars: 5, pct: 82 }, { stars: 4, pct: 12 }, { stars: 3, pct: 4 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 }
  ];
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: device === "mobile" ? 16 : 24, marginBottom: 24, width: "100%", boxSizing: "border-box" }}>
      <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 900, color: HATHOR_ORANGE, letterSpacing: "0.12em", borderBottom: `1px solid ${BORDER}`, paddingBottom: 10, margin: "0 0 14px 0" }}>
        RATING BREAKDOWN
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((item: any) => (
          <div key={item.stars} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: TEXT_MUTED, fontFamily: "monospace" }}>
            <span style={{ width: 40 }}>{item.stars} Star</span>
            <div style={{ flex: 1, height: 6, background: "rgba(0,0,0,0.3)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${item.pct}%`, background: HATHOR_ORANGE, borderRadius: 3 }} />
            </div>
            <span style={{ width: 30, textAlign: "right", color: TEXT_PRIMARY, fontWeight: 600 }}>{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarCommunityRenderer({ s, device }: { s: any; device: Device }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: device === "mobile" ? 16 : 24, width: "100%", boxSizing: "border-box" }}>
      <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 900, color: HATHOR_ORANGE, letterSpacing: "0.12em", borderBottom: `1px solid ${BORDER}`, paddingBottom: 10, margin: "0 0 14px 0" }}>
        COMMUNITY
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12, fontFamily: "monospace" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: TEXT_MUTED }}>Players</span>
          <span style={{ color: TEXT_PRIMARY, fontWeight: 800 }}>{s.sideOwners || "250,000+"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: TEXT_MUTED }}>Positive Rating</span>
          <span style={{ color: GREEN_ACCENT, fontWeight: 800 }}>{s.sidePositive || "94%"}</span>
        </div>
      </div>
    </div>
  );
}

function RecommendationsRenderer({ s, device }: { s: any; device: Device }) {
  const count = s.recsCount || 4;
  const items = DYNAMIC_RECS_PREVIEW.slice(0, count);
  const cardBg = s.recsCardBg || SURFACE;
  const cardBorder = s.recsCardBorder || BORDER;

  const gridColsCss = device === "mobile" ? "repeat(auto-fit, minmax(130px, 1fr))" : device === "tablet" ? "repeat(auto-fit, minmax(170px, 1fr))" : `repeat(${items.length}, 1fr)`;

  return (
    <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 28, width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: device === "mobile" ? 14 : 16, fontWeight: 900, color: HATHOR_ORANGE, letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <span style={{ display: "inline-block", width: 10, height: 2, background: HATHOR_ORANGE }} />
            <span>{s.recsTitle || "MORE LIKE THIS"}</span>
          </h2>
          <span style={{ border: "1px solid rgba(242, 107, 33, 0.4)", background: "rgba(242, 107, 33, 0.1)", color: HATHOR_ORANGE, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 }}>
            <Database size={10} /> [DB Widget]
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: HATHOR_ORANGE, letterSpacing: "0.1em", cursor: "pointer" }}>SEE ALL &gt;</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: gridColsCss, gap: device === "mobile" ? 12 : 20 }}>
        {items.map((item: any) => (
          <div key={item.id} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ position: "relative", width: "100%", height: device === "mobile" ? 100 : 140 }}>
              <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {item.discount && (
                <div style={{ position: "absolute", top: 6, left: 6, background: HATHOR_ORANGE, color: "#ffffff", fontSize: 9, fontWeight: 800, fontFamily: "monospace", padding: "2px 5px", borderRadius: 2 }}>
                  {item.discount}
                </div>
              )}
            </div>
            <div style={{ padding: device === "mobile" ? 10 : 16 }}>
              {item.genre && <div style={{ fontSize: 8, fontFamily: "monospace", color: TEXT_MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>{item.genre}</div>}
              <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: device === "mobile" ? 12 : 14, fontWeight: 700, color: TEXT_PRIMARY, margin: "0 0 8px 0" }}>{item.title}</h4>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", fontWeight: 800, color: GREEN_ACCENT }}>
                <span>{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextRenderer({ s, device }: { s: any; device: Device }) {
  return (
    <div style={{ maxWidth: s.textMaxWidth || 700, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <p style={{ fontFamily: s.textFont || "'Raleway', sans-serif", fontSize: device === "mobile" ? Math.min(s.textSize || 14, 14) : (s.textSize || 14),
        fontWeight: s.textWeight as React.CSSProperties["fontWeight"],
        color: s.textColor || TEXT_MUTED, textAlign: (s.textAlign || "left") as React.CSSProperties["textAlign"],
        lineHeight: s.textLineHeight || 1.65, whiteSpace: "pre-wrap", margin: 0, wordBreak: "break-word" }}>
        {s.textContent || s.text || "Your text content..."}
      </p>
    </div>
  );
}
function ImageRenderer({ s }: { s: any }) {
  return (
    <div style={{ textAlign: "center", width: "100%", boxSizing: "border-box" }}>
      <img src={s.imageSrc || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"} alt={s.imageAlt || ""}
        style={{ maxWidth: `${s.imageMaxWidth ?? 100}%`, width: "100%", display: "inline-block",
          borderRadius: s.imageRadius || 4, boxShadow: s.imageShadow ? "0 24px 60px rgba(0,0,0,0.55)" : "none" }} />
    </div>
  );
}
function CarouselRenderer({ s, device }: { s: any; device: Device }) {
  const [idx, setIdx] = useState(0);
  const imgs = s.carouselImages || [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
  ];
  const h = device === "mobile" ? 240 : device === "tablet" ? 360 : (s.carouselHeight || 480);
  const showThumbnails = s.showThumbnails ?? true;

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{ position: "relative", height: h, overflow: "hidden", borderRadius: s.carouselRadius || 4, background: "#0a0a0f", transition: "height 0.25s ease", width: "100%" }}>
        {imgs.length > 0 ? (
          <>
            <img src={imgs[idx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {imgs.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </>
        ) : null}
      </div>

      {showThumbnails && imgs.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto" }}>
          {imgs.map((img: string, i: number) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: 100, height: 60, borderRadius: 3, overflow: "hidden", border: i === idx ? `2px solid ${HATHOR_ORANGE}` : "2px solid transparent", opacity: i === idx ? 1 : 0.6, cursor: "pointer", padding: 0, flexShrink: 0 }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function FeaturesRenderer({ s, device }: { s: any; device: Device }) {
  const items = s.featuresItems || [];
  const cols = device === "mobile" ? 1 : device === "tablet" ? 2 : (s.featuresCols || 3);

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      {s.featuresTitle && (
        <h2 style={{ fontFamily: s.featuresTitleFont || "'Cinzel', serif", color: s.featuresTitleColor || "#ffffff", fontSize: device === "mobile" ? 22 : 32,
          fontWeight: 900, textAlign: "center", marginBottom: 36, letterSpacing: "0.05em", textTransform: "uppercase", wordBreak: "break-word" }}>
          {s.featuresTitle}
        </h2>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: device === "mobile" ? 24 : 40 }}>
        {items.map((item: any, i: number) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
            <h3 style={{ color: item.color || HATHOR_ORANGE, fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", wordBreak: "break-word" }}>
              {item.title}
            </h3>
            <p style={{ color: TEXT_MUTED, fontSize: 12, lineHeight: 1.65, wordBreak: "break-word" }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
function TwoColRenderer({ s, device }: { s: any; device: Device }) {
  const ratioMap: Record<string, string> = { "1:1": "1fr 1fr", "1:2": "1fr 2fr", "2:1": "2fr 1fr" };
  const cols = device === "mobile" ? "1fr" : ratioMap[s.twoColRatio || "1:1"] || "1fr 1fr";

  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: device === "mobile" ? 20 : (s.twoColGap || 40), alignItems: "center", width: "100%", boxSizing: "border-box" }}>
      <p style={{ fontFamily: s.twoColLeftFont || "'Raleway', sans-serif", fontSize: s.twoColLeftSize || 15, fontWeight: s.twoColLeftWeight as React.CSSProperties["fontWeight"], color: s.twoColLeftColor || TEXT_MUTED, lineHeight: 1.65, wordBreak: "break-word" }}>
        {s.twoColLeftText || "Column text"}
      </p>
      <img src={s.twoColRightImg || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"} alt="" style={{ width: "100%", borderRadius: 4 }} />
    </div>
  );
}

// ── Perfect Pixel Grid Renderer with Equal Stretching ─────────────────────────
function GridRenderer({ s, device, selectedColIdx, selectedElementId, onSelectChild }: {
  s: Section;
  device: Device;
  selectedColIdx?: number | null;
  selectedElementId?: string | null;
  onSelectChild?: (colIdx: number, elementId: string) => void;
}) {
  const ratioMap: Record<string, string> = {
    "1": "1fr",
    "1:1": "1fr 1fr",
    "1:2": "1fr 2fr",
    "2:1": "1fr 340px",
    "1:1:1": "1fr 1fr 1fr",
    "1:2:1": "1fr 2fr 1fr",
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
              paddingLeft: col.ph || 0, paddingRight: col.ph || 0,
              borderRadius: col.radius || 0,
              borderTop: col.borderTopColor ? `2px solid ${col.borderTopColor}` : "none",
              display: "flex", flexDirection: "column", gap: 16,
              height: "100%", minHeight: 80, minWidth: 0, boxSizing: "border-box" // minWidth: 0 prevents flex overflow!
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

                    {el.type === "game-header" && <GameHeaderRenderer s={el} device={device} />}
                    {el.type === "ownership-banner" && <OwnershipBannerRenderer s={el} device={device} />}
                    {el.type === "about-game" && <AboutGameRenderer s={el} device={device} />}
                    {el.type === "system-reqs" && <SystemReqsRenderer s={el} device={device} />}
                    {el.type === "user-reviews" && <UserReviewsRenderer s={el} device={device} />}
                    {el.type === "sidebar-cta" && <SidebarCtaRenderer s={el} device={device} />}
                    {el.type === "sidebar-info" && <SidebarInfoRenderer s={el} device={device} />}
                    {el.type === "sidebar-ratings" && <SidebarRatingsRenderer s={el} device={device} />}
                    {el.type === "sidebar-community" && <SidebarCommunityRenderer s={el} device={device} />}

                    {el.type === "heading" && (
                      <h3 style={{
                        fontFamily: el.font || "'Cinzel', serif",
                        fontSize: device === "mobile" ? Math.min(el.size || 24, 20) : (el.size || 24),
                        fontWeight: (el.weight as any) || "700",
                        color: el.color || "#ffffff",
                        textAlign: el.align || "left",
                        letterSpacing: el.letterSpacing || "0.04em",
                        textTransform: (el.textTransform as any) || "uppercase",
                        lineHeight: el.lineHeight || 1.2,
                        margin: 0, wordBreak: "break-word"
                      }}>
                        {el.text || "Heading"}
                      </h3>
                    )}

                    {el.type === "text" && (
                      <p style={{
                        fontFamily: el.font || "'Raleway', sans-serif",
                        fontSize: device === "mobile" ? 13 : (el.size || 14),
                        fontWeight: (el.weight as any) || "400",
                        color: el.color || TEXT_MUTED,
                        textAlign: el.align || "left",
                        letterSpacing: el.letterSpacing || "normal",
                        textTransform: (el.textTransform as any) || "none",
                        lineHeight: el.lineHeight || 1.65,
                        whiteSpace: "pre-wrap",
                        margin: 0, wordBreak: "break-word"
                      }}>
                        {el.text || "Text content..."}
                      </p>
                    )}

                    {el.type === "image" && (
                      <div style={{ textAlign: el.align || "center", width: "100%" }}>
                        <img src={el.imageSrc || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"} alt={el.imageAlt || ""} style={{ maxWidth: `${el.imageMaxWidth || 100}%`, width: "100%", borderRadius: el.imageRadius || 4, display: "inline-block" }} />
                      </div>
                    )}

                    {el.type === "button" && (
                      <div style={{ textAlign: el.align || "left", width: (el.fullWidth || device === "mobile") ? "100%" : "auto" }}>
                        <button
                          style={{
                            width: (el.fullWidth || device === "mobile") ? "100%" : "auto",
                            background: el.btnGradient || el.btnBg || GREEN_ACCENT,
                            color: el.btnColor || "#0e1116",
                            padding: `${el.btnPaddingV ?? 12}px ${el.btnPaddingH ?? 20}px`,
                            fontSize: el.size || 11,
                            fontWeight: (el.weight as any) || "900",
                            fontFamily: el.font || "monospace",
                            letterSpacing: el.letterSpacing || "0.12em",
                            textTransform: (el.textTransform as any) || "uppercase",
                            border: el.btnBorderColor ? `1px solid ${el.btnBorderColor}` : "none",
                            borderRadius: el.btnRadius ?? 3,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            boxSizing: "border-box",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={e => {
                            if (el.btnHoverBg) e.currentTarget.style.background = el.btnHoverBg;
                            if (el.btnHoverColor) e.currentTarget.style.color = el.btnHoverColor;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = el.btnGradient || el.btnBg || GREEN_ACCENT;
                            e.currentTarget.style.color = el.btnColor || "#0e1116";
                          }}
                        >
                          {el.btnIcon === "download" && <Download size={14} />}
                          {el.btnIcon === "library" && <Library size={14} />}
                          {el.btnIcon === "cart" && <ShoppingCart size={14} />}
                          {el.btnIcon === "check" && <Check size={14} />}
                          {el.btnIcon === "thumbs-up" && <ThumbsUp size={14} />}
                          <span>{el.btnText || "Button"}</span>
                        </button>
                      </div>
                    )}

                    {el.type === "divider" && (
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "100%", height: el.dividerThickness || 1, background: el.dividerColor || BORDER }} />
                      </div>
                    )}

                    {el.type === "spacer" && (
                      <div style={{ height: device === "mobile" ? Math.min(el.spacerHeight || 30, 16) : (el.spacerHeight || 30) }} />
                    )}
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

function DividerRenderer({ s }: { s: Section }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
      <div style={{ width: `${s.dividerWidth || 100}%`, height: s.dividerThickness || 1, background: s.dividerColor || BORDER }} />
    </div>
  );
}
function SpacerRenderer({ s, device }: { s: Section; device: Device }) {
  const h = device === "mobile" ? Math.min(s.spacerHeight || 40, 20) : (s.spacerHeight || 40);
  return (
    <div style={{ height: h, width: "100%" }} />
  );
}
function CTARenderer({ s, device }: { s: Section; device: Device }) {
  return (
    <div style={{ textAlign: (s.ctaAlign || "center") as React.CSSProperties["textAlign"], maxWidth: 600, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <h2 style={{ fontFamily: s.ctaTitleFont || "'Cinzel', serif", color: s.ctaTitleColor || "#ffffff", fontSize: device === "mobile" ? 24 : 36, fontWeight: 900, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", wordBreak: "break-word" }}>
        {s.ctaTitle || "Get the Game"}
      </h2>
      <p style={{ color: s.ctaSubtitleColor || TEXT_MUTED, fontSize: device === "mobile" ? 13 : 15, marginBottom: 24, wordBreak: "break-word" }}>{s.ctaSubtitle}</p>
      <button style={{ width: device === "mobile" ? "100%" : "auto", background: s.ctaBtnColor || HATHOR_ORANGE, color: s.ctaBtnTextColor || "#ffffff", padding: "14px 40px", fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 3 }}>
        {s.ctaBtnText || "Add to Cart"}
      </button>
    </div>
  );
}

// ── Section wrapper with selection chrome ─────────────────────────────────────
function SectionWrapper({ section: s, device, selected, selectedColIdx, selectedElementId, isFirst, isLast, onSelect, onSelectChild, onMoveUp, onMoveDown, onDuplicate, onDelete }: {
  section: Section; device: Device; selected: boolean;
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
  const responsivePh = device === "mobile" ? 16 : device === "tablet" ? 24 : s.ph;

  return (
    <div className={`${styles.sectionWrapper} ${selected ? styles.sectionSelected : ""}`} style={{ background: s.bg, borderTop: s.borderTopColor ? `2px solid ${s.borderTopColor}` : "none" }}>
      {/* Floating Outer Section Handle Badge */}
      <div className={styles.sectionHandleBadge} onClick={e => { e.stopPropagation(); onSelect(); }}>
        <Layers size={11} />
        <span>Section: {BLOCK_META[s.type]?.label}</span>
      </div>

      <div style={{ position: "relative", paddingTop: responsivePt, paddingBottom: responsivePb, paddingLeft: responsivePh, paddingRight: responsivePh, borderRadius: s.radius, boxSizing: "border-box" }}>
        {s.type === "game-hero" && <GameHeroRenderer s={s} device={device} />}
        {s.type === "game-header" && <GameHeaderRenderer s={s} device={device} />}
        {s.type === "ownership-banner" && <OwnershipBannerRenderer s={s} device={device} />}
        {s.type === "about-game" && <AboutGameRenderer s={s} device={device} />}
        {s.type === "system-reqs" && <SystemReqsRenderer s={s} device={device} />}
        {s.type === "user-reviews" && <UserReviewsRenderer s={s} device={device} />}
        {s.type === "sidebar-cta" && <SidebarCtaRenderer s={s} device={device} />}
        {s.type === "sidebar-info" && <SidebarInfoRenderer s={s} device={device} />}
        {s.type === "sidebar-ratings" && <SidebarRatingsRenderer s={s} device={device} />}
        {s.type === "sidebar-community" && <SidebarCommunityRenderer s={s} device={device} />}
        {s.type === "recommendations" && <RecommendationsRenderer s={s} device={device} />}
        {s.type === "text" && <TextRenderer s={s} device={device} />}
        {s.type === "image" && <ImageRenderer s={s} />}
        {s.type === "carousel" && <CarouselRenderer s={s} device={device} />}
        {s.type === "features" && <FeaturesRenderer s={s} device={device} />}
        {s.type === "two-col" && <TwoColRenderer s={s} device={device} />}
        {s.type === "grid" && <GridRenderer s={s} device={device} selectedColIdx={selectedColIdx} selectedElementId={selectedElementId} onSelectChild={onSelectChild} />}
        {s.type === "divider" && <DividerRenderer s={s} />}
        {s.type === "spacer" && <SpacerRenderer s={s} device={device} />}
        {s.type === "cta" && <CTARenderer s={s} device={device} />}
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

// ── Block Palette ──────────────────────────────────────────────────────────────
function BlockPalette({ onAdd }: { onAdd: (type: SectionType | ElementType) => void }) {
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
              {group.items.map(item => (
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
function PropertiesPanel({ section, selectedColIdx, selectedElementId: propElementId, onChange }: {
  section: Section | null;
  selectedColIdx?: number | null;
  selectedElementId?: string | null;
  onChange: (id: string, updates: Partial<Section>) => void;
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
    return (
      <div className={styles.rightSidebar}>
        <div className={styles.propsHeader}>
          Properties
        </div>
        <div className={styles.emptyProps}>
          <Settings size={32} style={{ color: TEXT_MUTED, opacity: 0.2 }} />
          <p style={{ fontWeight: 700, color: TEXT_PRIMARY }}>No block selected</p>
          <p style={{ fontSize: 10, color: TEXT_MUTED }}>Click any element or block on the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const u = (updates: Partial<Section>) => onChange(section.id, updates);
  const s = section;
  const { Icon } = BLOCK_META[s.type] || { Icon: Settings };

  const cols = s.gridCols || [];
  const activeCol = cols[gridColIdx] || cols[0] || null;
  const activeElement = activeCol?.elements.find(el => el.id === selectedElementId) || null;

  const addGridElement = (type: ElementType) => {
    if (!activeCol) return;
    const newEl = createGridElement(type);
    const updatedCols = cols.map((c, idx) => idx === gridColIdx ? { ...c, elements: [...c.elements, newEl] } : c);
    u({ gridCols: updatedCols });
    setSelectedElementId(newEl.id);
  };

  const updateGridElement = (elId: string, updates: Partial<GridElement>) => {
    if (!activeCol) return;
    const updatedCols = cols.map((c, idx) => idx === gridColIdx ? {
      ...c,
      elements: c.elements.map(e => e.id === elId ? { ...e, ...updates } : e)
    } : c);
    u({ gridCols: updatedCols });
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
    const colCountMap: Record<string, number> = { "1": 1, "1:1": 2, "1:2": 2, "2:1": 2, "1:1:1": 3, "1:2:1": 3, "1:1:1:1": 4 };
    const reqCols = colCountMap[templateStr] || 2;
    let newCols = [...cols];
    while (newCols.length < reqCols) {
      newCols.push({ id: uid(), bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0, elements: [] });
    }
    if (newCols.length > reqCols) {
      newCols = newCols.slice(0, reqCols);
    }
    // Normalize padding across all columns to 0 for pixel-perfect alignment!
    newCols = newCols.map(c => ({ ...c, pt: 0, pb: 0, ph: 0, radius: 0 }));
    u({ gridTemplate: templateStr, gridCols: newCols });
    if (gridColIdx >= reqCols) setGridColIdx(0);
  };

  const targetObj: any = activeElement || s;
  const isEditingGridElement = !!activeElement;

  const updateTarget = (updates: any) => {
    if (isEditingGridElement && activeElement) {
      updateGridElement(activeElement.id, updates);
    } else {
      u(updates);
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
              <ColorField value={s.bg} onChange={v => u({ bg: v })} placeholder="e.g. #212631 or linear-gradient(...)" />
            </PropRow>
            <PropRow label="Top Accent Line Color"><ColorField value={s.borderTopColor || ""} onChange={v => u({ borderTopColor: v })} placeholder="#f26b21" /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Pad Top"><NumField value={s.pt} onChange={v => u({ pt: v })} unit="px" max={400} /></PropRow>
              <PropRow label="Pad Bottom"><NumField value={s.pb} onChange={v => u({ pb: v })} unit="px" max={400} /></PropRow>
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
            <PropRow label="Title Font"><SelField value={targetObj.featuresTitleFont || "'Cinzel', serif"} onChange={v => updateTarget({ featuresTitleFont: v })} options={FONTS} /></PropRow>
            <PropRow label="Title Color"><ColorField value={targetObj.featuresTitleColor || "#ffffff"} onChange={v => updateTarget({ featuresTitleColor: v })} /></PropRow>
            <PropRow label="Columns Count">
              <SelField value={String(targetObj.featuresCols || 3)} onChange={v => updateTarget({ featuresCols: Number(v) })}
                options={[{ label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }]} />
            </PropRow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              <p className={styles.propLabel}>Feature Cards ({(targetObj.featuresItems || []).length})</p>
              {(targetObj.featuresItems || []).map((item: any, i: number) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, padding: 10, background: SURFACE, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: TEXT_MUTED }}>Card {i + 1}</span>
                    <button onClick={() => updateTarget({ featuresItems: (targetObj.featuresItems || []).filter((_: any, j: number) => j !== i) })} style={{ background: "transparent", border: "none", color: TEXT_MUTED, cursor: "pointer" }}>
                      <X size={10} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: 6 }}>
                    <input value={item.icon} onChange={e => {
                      const arr = [...(targetObj.featuresItems || [])]; arr[i] = { ...arr[i], icon: e.target.value };
                      updateTarget({ featuresItems: arr });
                    }} style={{ border: `1px solid ${BORDER}`, background: BG, color: TEXT_PRIMARY, fontSize: 12, padding: 4, outline: "none", textAlign: "center" }} placeholder="Icon" />
                    <input value={item.title} onChange={e => {
                      const arr = [...(targetObj.featuresItems || [])]; arr[i] = { ...arr[i], title: e.target.value };
                      updateTarget({ featuresItems: arr });
                    }} style={{ border: `1px solid ${BORDER}`, background: BG, color: TEXT_PRIMARY, fontSize: 10, padding: 4, outline: "none" }} placeholder="Title" />
                  </div>
                  <textarea value={item.desc} onChange={e => {
                    const arr = [...(targetObj.featuresItems || [])]; arr[i] = { ...arr[i], desc: e.target.value };
                    updateTarget({ featuresItems: arr });
                  }} rows={2} style={{ border: `1px solid ${BORDER}`, background: BG, color: TEXT_PRIMARY, fontSize: 10, padding: 4, outline: "none", resize: "none" }} placeholder="Description" />
                </div>
              ))}
              <button onClick={() => updateTarget({ featuresItems: [...(targetObj.featuresItems || []), { icon: "⚡", title: "NEW FEATURE", desc: "Feature description.", color: HATHOR_ORANGE }] })} style={{ padding: 6, border: `1px dashed ${BORDER}`, background: "transparent", color: TEXT_MUTED, fontSize: 10, cursor: "pointer" }}>
                + Add Feature Card
              </button>
            </div>
          </PropSection>
        )}

        {/* ── CTA BLOCK ── */}
        {targetObj.type === "cta" && (
          <PropSection title="CTA Block Settings">
            <PropRow label="Title"><TxtInput value={targetObj.ctaTitle || ""} onChange={v => updateTarget({ ctaTitle: v })} /></PropRow>
            <PropRow label="Subtitle"><TxtInput value={targetObj.ctaSubtitle || ""} onChange={v => updateTarget({ ctaSubtitle: v })} /></PropRow>
            <PropRow label="Button Text"><TxtInput value={targetObj.ctaBtnText || ""} onChange={v => updateTarget({ ctaBtnText: v })} /></PropRow>
            <PropRow label="Button Color / Free Gradient"><ColorField value={targetObj.ctaBtnColor || HATHOR_ORANGE} onChange={v => updateTarget({ ctaBtnColor: v })} /></PropRow>
            <PropRow label="Alignment"><AlignField value={targetObj.ctaAlign || "center"} onChange={v => updateTarget({ ctaAlign: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── TWO COLUMNS ── */}
        {targetObj.type === "two-col" && (
          <PropSection title="Two Column Settings">
            <PropRow label="Column Ratio">
              <SelField value={targetObj.twoColRatio || "1:1"} onChange={v => updateTarget({ twoColRatio: v })}
                options={[{ label: "1:1 Equal", value: "1:1" }, { label: "1:2 Right Heavy", value: "1:2" }, { label: "2:1 Left Heavy", value: "2:1" }]} />
            </PropRow>
            <PropRow label="Gap"><NumField value={targetObj.twoColGap || 40} onChange={v => updateTarget({ twoColGap: v })} unit="px" min={0} max={100} /></PropRow>
            <PropRow label="Left Column Text"><TxtArea value={targetObj.twoColLeftText || ""} onChange={v => updateTarget({ twoColLeftText: v })} rows={3} /></PropRow>
            <PropRow label="Right Column Image URL"><TxtInput value={targetObj.twoColRightImg || ""} onChange={v => updateTarget({ twoColRightImg: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── DIVIDER ── */}
        {targetObj.type === "divider" && (
          <PropSection title="Divider Settings">
            <PropRow label="Line Color"><ColorField value={targetObj.dividerColor || BORDER} onChange={v => updateTarget({ dividerColor: v })} /></PropRow>
            <PropRow label="Thickness"><NumField value={targetObj.dividerThickness || 1} onChange={v => updateTarget({ dividerThickness: v })} unit="px" min={1} max={12} /></PropRow>
            <PropRow label="Width (%)"><NumField value={targetObj.dividerWidth || 100} onChange={v => updateTarget({ dividerWidth: v })} unit="%" min={10} max={100} /></PropRow>
          </PropSection>
        )}

        {/* ── SPACER ── */}
        {targetObj.type === "spacer" && (
          <PropSection title="Spacer Settings">
            <PropRow label="Height"><NumField value={targetObj.spacerHeight || 40} onChange={v => updateTarget({ spacerHeight: v })} unit="px" min={4} max={200} step={4} /></PropRow>
          </PropSection>
        )}

        {/* ── GAME HERO ── */}
        {targetObj.type === "game-hero" && (
          <PropSection title="Media Showcase Settings">
            <PropRow label="Banner Height"><NumField value={targetObj.heroHeight || 480} onChange={v => updateTarget({ heroHeight: v })} unit="px" min={200} max={800} step={20} /></PropRow>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", marginBottom: 8 }}>
              <span className={styles.propLabel}>Preview Images (Thumbnails)</span>
              <button onClick={() => updateTarget({ showThumbnails: !(targetObj.showThumbnails ?? true) })}
                style={{ padding: "6px 12px", border: `1px solid ${(targetObj.showThumbnails ?? true) ? GREEN_ACCENT : BORDER}`, color: (targetObj.showThumbnails ?? true) ? GREEN_ACCENT : TEXT_MUTED, background: (targetObj.showThumbnails ?? true) ? "rgba(56, 211, 159, 0.12)" : "transparent", fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>
                {(targetObj.showThumbnails ?? true) ? "VISIBLE" : "HIDDEN"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <p className={styles.propLabel}>Showcase Images ({(targetObj.heroImages || []).length})</p>
              {(targetObj.heroImages || []).map((img: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <img src={img} alt="" style={{ width: 36, height: 24, objectFit: "cover", borderRadius: 2, border: `1px solid ${BORDER}` }} />
                  <input value={img} onChange={e => {
                    const imgs = [...(targetObj.heroImages || [])]; imgs[i] = e.target.value;
                    updateTarget({ heroImages: imgs });
                  }} style={{ flex: 1, border: `1px solid ${BORDER}`, background: BG, color: TEXT_PRIMARY, fontSize: 10, padding: "4px 6px", outline: "none" }} placeholder="Image URL" />
                  <button onClick={() => updateTarget({ heroImages: (targetObj.heroImages || []).filter((_: any, j: number) => j !== i) })}
                    style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER}`, background: "transparent", color: TEXT_MUTED, cursor: "pointer" }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button onClick={() => updateTarget({ heroImages: [...(targetObj.heroImages || []), "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"] })}
                style={{ width: "100%", padding: 6, border: `1px dashed ${BORDER}`, background: "transparent", color: TEXT_MUTED, fontSize: 10, cursor: "pointer" }}>
                + Add Image
              </button>
            </div>
          </PropSection>
        )}

        {/* ── CAROUSEL ── */}
        {targetObj.type === "carousel" && (
          <PropSection title="Carousel Showcase Settings">
            <PropRow label="Banner Height"><NumField value={targetObj.carouselHeight || 480} onChange={v => updateTarget({ carouselHeight: v })} unit="px" min={200} max={800} step={20} /></PropRow>
            <PropRow label="Border Radius"><NumField value={targetObj.carouselRadius || 4} onChange={v => updateTarget({ carouselRadius: v })} unit="px" max={40} /></PropRow>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", marginBottom: 8 }}>
              <span className={styles.propLabel}>Preview Images (Thumbnails)</span>
              <button onClick={() => updateTarget({ showThumbnails: !(targetObj.showThumbnails ?? true) })}
                style={{ padding: "6px 12px", border: `1px solid ${(targetObj.showThumbnails ?? true) ? GREEN_ACCENT : BORDER}`, color: (targetObj.showThumbnails ?? true) ? GREEN_ACCENT : TEXT_MUTED, background: (targetObj.showThumbnails ?? true) ? "rgba(56, 211, 159, 0.12)" : "transparent", fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>
                {(targetObj.showThumbnails ?? true) ? "VISIBLE" : "HIDDEN"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <p className={styles.propLabel}>Carousel Images ({(targetObj.carouselImages || []).length})</p>
              {(targetObj.carouselImages || []).map((img: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <img src={img} alt="" style={{ width: 36, height: 24, objectFit: "cover", borderRadius: 2, border: `1px solid ${BORDER}` }} />
                  <input value={img} onChange={e => {
                    const imgs = [...(targetObj.carouselImages || [])]; imgs[i] = e.target.value;
                    updateTarget({ carouselImages: imgs });
                  }} style={{ flex: 1, border: `1px solid ${BORDER}`, background: BG, color: TEXT_PRIMARY, fontSize: 10, padding: "4px 6px", outline: "none" }} placeholder="Image URL" />
                  <button onClick={() => updateTarget({ carouselImages: (targetObj.carouselImages || []).filter((_: any, j: number) => j !== i) })}
                    style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER}`, background: "transparent", color: TEXT_MUTED, cursor: "pointer" }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button onClick={() => updateTarget({ carouselImages: [...(targetObj.carouselImages || []), "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"] })}
                style={{ width: "100%", padding: 6, border: `1px dashed ${BORDER}`, background: "transparent", color: TEXT_MUTED, fontSize: 10, cursor: "pointer" }}>
                + Add Image
              </button>
            </div>
          </PropSection>
        )}

        {/* ── GAME HEADER ── */}
        {targetObj.type === "game-header" && (
          <PropSection title="Game Header Info (Designer Input)">
            <PropRow label="Category Tag"><TxtInput value={targetObj.gameCategory || ""} onChange={v => updateTarget({ gameCategory: v })} placeholder="ACTION RPG" /></PropRow>
            <PropRow label="Game Title"><TxtInput value={targetObj.gameTitle || ""} onChange={v => updateTarget({ gameTitle: v })} placeholder="ELDEN THRONE" /></PropRow>
            <PropRow label="Edition Subtitle"><TxtInput value={targetObj.gameSubtitle || ""} onChange={v => updateTarget({ gameSubtitle: v })} placeholder="ELDEN THRONE EDITION" /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Rating Score"><NumField value={targetObj.gameRatingScore || 9.4} onChange={v => updateTarget({ gameRatingScore: v })} min={1} max={10} step={0.1} /></PropRow>
              <PropRow label="Reviews Count"><TxtInput value={targetObj.gameReviewCount || ""} onChange={v => updateTarget({ gameReviewCount: v })} placeholder="14.2k Reviews" /></PropRow>
            </div>
            <PropRow label="Developer"><TxtInput value={targetObj.gameDev || ""} onChange={v => updateTarget({ gameDev: v })} placeholder="Omegabyte Studios" /></PropRow>
            <PropRow label="Release Date"><TxtInput value={targetObj.gameReleaseDate || ""} onChange={v => updateTarget({ gameReleaseDate: v })} placeholder="March 15, 2025" /></PropRow>
            <PropRow label="Tags (comma separated)">
              <TxtInput value={(targetObj.gameTags || []).join(", ")} onChange={v => updateTarget({ gameTags: v.split(",").map((t: string) => t.trim()).filter(Boolean) })} placeholder="OPEN WORLD, SOULSLIKE, DARK FANTASY" />
            </PropRow>
            <PropRow label="Synopsis Description"><TxtArea value={targetObj.gameDesc || ""} onChange={v => updateTarget({ gameDesc: v })} rows={4} /></PropRow>
          </PropSection>
        )}

        {/* ── OWNERSHIP BANNER ── */}
        {targetObj.type === "ownership-banner" && (
          <PropSection title="Ownership Bar Info">
            <div style={{ background: "rgba(56, 211, 159, 0.08)", border: "1px solid rgba(56, 211, 159, 0.3)", padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 10, color: GREEN_ACCENT, display: "flex", alignItems: "center", gap: 6 }}>
              <Database size={13} />
              <span>Ownership status & purchase history are dynamically queried for each user.</span>
            </div>
            <PropRow label="Status Text"><TxtInput value={targetObj.ownershipStatus || ""} onChange={v => updateTarget({ ownershipStatus: v })} /></PropRow>
            <PropRow label="Subtext"><TxtInput value={targetObj.ownershipSub || ""} onChange={v => updateTarget({ ownershipSub: v })} /></PropRow>
            <PropRow label="Download Button Text"><TxtInput value={targetObj.ownershipBtn1 || ""} onChange={v => updateTarget({ ownershipBtn1: v })} /></PropRow>
            <PropRow label="Library Button Text"><TxtInput value={targetObj.ownershipBtn2 || ""} onChange={v => updateTarget({ ownershipBtn2: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── ABOUT GAME ── */}
        {targetObj.type === "about-game" && (
          <PropSection title="About Game Sections (Author Content)">
            <p style={{ fontSize: 10, color: TEXT_MUTED, marginBottom: 10 }}>You can manually add, edit, or remove game lore sections and feature screenshots below.</p>
            <PropRow label="Section Title"><TxtInput value={targetObj.aboutTitle || ""} onChange={v => updateTarget({ aboutTitle: v })} /></PropRow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {(targetObj.aboutSections || []).map((sec: any, i: number) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, padding: 10, background: "rgba(20, 24, 32, 0.6)", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: TEXT_MUTED }}>Section {i + 1}</span>
                    <button onClick={() => updateTarget({ aboutSections: (targetObj.aboutSections || []).filter((_: any, j: number) => j !== i) })} style={{ background: "transparent", border: "none", color: TEXT_MUTED, cursor: "pointer" }}>
                      <X size={10} />
                    </button>
                  </div>
                  <input value={sec.title} onChange={e => {
                    const arr = [...(targetObj.aboutSections || [])]; arr[i] = { ...arr[i], title: e.target.value };
                    updateTarget({ aboutSections: arr });
                  }} style={{ border: `1px solid ${BORDER}`, background: BG, color: TEXT_PRIMARY, fontSize: 10, padding: 4, outline: "none" }} placeholder="Subheading" />
                  <textarea value={sec.text} onChange={e => {
                    const arr = [...(targetObj.aboutSections || [])]; arr[i] = { ...arr[i], text: e.target.value };
                    updateTarget({ aboutSections: arr });
                  }} rows={3} style={{ border: `1px solid ${BORDER}`, background: BG, color: TEXT_PRIMARY, fontSize: 10, padding: 4, outline: "none", resize: "none" }} placeholder="Paragraph text" />
                  <input value={sec.img || ""} onChange={e => {
                    const arr = [...(targetObj.aboutSections || [])]; arr[i] = { ...arr[i], img: e.target.value };
                    updateTarget({ aboutSections: arr });
                  }} style={{ border: `1px solid ${BORDER}`, background: BG, color: TEXT_PRIMARY, fontSize: 10, padding: 4, outline: "none" }} placeholder="Image URL (optional)" />
                </div>
              ))}
              <button onClick={() => updateTarget({ aboutSections: [...(targetObj.aboutSections || []), { title: "NEW SUBSECTION", text: "Add description text here." }] })} style={{ padding: 6, border: `1px dashed ${BORDER}`, background: "transparent", color: TEXT_MUTED, fontSize: 10, cursor: "pointer" }}>
                + Add Subsection
              </button>
            </div>
          </PropSection>
        )}

        {/* ── SYSTEM REQS ── */}
        {targetObj.type === "system-reqs" && (
          <PropSection title="System Requirements Specs (Designer Input)">
            <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE }}>Recommended Specs</p>
            <PropRow label="OS"><TxtInput value={targetObj.reqsRec?.os || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), os: v } })} placeholder="Windows 11 (64-bit)" /></PropRow>
            <PropRow label="CPU"><TxtInput value={targetObj.reqsRec?.cpu || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), cpu: v } })} placeholder="Intel Core i7-12700K" /></PropRow>
            <PropRow label="RAM"><TxtInput value={targetObj.reqsRec?.ram || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), ram: v } })} placeholder="16 GB RAM" /></PropRow>
            <PropRow label="GPU"><TxtInput value={targetObj.reqsRec?.gpu || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), gpu: v } })} placeholder="NVIDIA GeForce RTX 4070" /></PropRow>
            <PropRow label="Storage"><TxtInput value={targetObj.reqsRec?.storage || ""} onChange={v => updateTarget({ reqsRec: { ...(targetObj.reqsRec || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), storage: v } })} placeholder="85 GB NVMe SSD" /></PropRow>

            <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}>Minimum Specs</p>
            <PropRow label="OS"><TxtInput value={targetObj.reqsMin?.os || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), os: v } })} placeholder="Windows 10 (64-bit)" /></PropRow>
            <PropRow label="CPU"><TxtInput value={targetObj.reqsMin?.cpu || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), cpu: v } })} placeholder="Intel Core i5-8400" /></PropRow>
            <PropRow label="RAM"><TxtInput value={targetObj.reqsMin?.ram || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), ram: v } })} placeholder="12 GB RAM" /></PropRow>
            <PropRow label="GPU"><TxtInput value={targetObj.reqsMin?.gpu || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), gpu: v } })} placeholder="NVIDIA GeForce GTX 1070" /></PropRow>
            <PropRow label="Storage"><TxtInput value={targetObj.reqsMin?.storage || ""} onChange={v => updateTarget({ reqsMin: { ...(targetObj.reqsMin || { os: "", cpu: "", ram: "", gpu: "", storage: "" }), storage: v } })} placeholder="85 GB Available Space" /></PropRow>
          </PropSection>
        )}

        {/* ── USER REVIEWS ── */}
        {targetObj.type === "user-reviews" && (
          <PropSection title="User Reviews Component (DB Widget)">
            <div style={{ background: "rgba(242, 107, 33, 0.08)", border: "1px solid rgba(242, 107, 33, 0.3)", padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 10, color: HATHOR_ORANGE, display: "flex", alignItems: "center", gap: 6 }}>
              <Database size={13} />
              <span>User reviews are fetched dynamically from the database. Customize styling below.</span>
            </div>
            <PropRow label="Header Title"><TxtInput value={targetObj.reviewHeader || "USER REVIEWS"} onChange={v => updateTarget({ reviewHeader: v })} /></PropRow>
            <PropRow label="Card Background / Free Gradient"><ColorField value={targetObj.reviewCardBg || SURFACE} onChange={v => updateTarget({ reviewCardBg: v })} placeholder="e.g. #181c24 or linear-gradient(...)" /></PropRow>
            <PropRow label="Card Border Color"><ColorField value={targetObj.reviewCardBorder || BORDER} onChange={v => updateTarget({ reviewCardBorder: v })} /></PropRow>
            <PropRow label="Card Border Radius"><NumField value={targetObj.reviewCardRadius ?? 4} onChange={v => updateTarget({ reviewCardRadius: v })} unit="px" max={30} /></PropRow>
            <PropRow label="Reviewer Name Color"><ColorField value={targetObj.reviewNameColor || TEXT_PRIMARY} onChange={v => updateTarget({ reviewNameColor: v })} /></PropRow>
            <PropRow label="Reviewer Name Font"><SelField value={targetObj.reviewNameFont || "'Cinzel', serif"} onChange={v => updateTarget({ reviewNameFont: v })} options={FONTS} /></PropRow>
            <PropRow label="Body Text Color"><ColorField value={targetObj.reviewBodyColor || TEXT_MUTED} onChange={v => updateTarget({ reviewBodyColor: v })} /></PropRow>
            <PropRow label="Body Text Font"><SelField value={targetObj.reviewBodyFont || "'Raleway', sans-serif"} onChange={v => updateTarget({ reviewBodyFont: v })} options={FONTS} /></PropRow>
            <PropRow label="Star Accent Color"><ColorField value={targetObj.reviewStarColor || HATHOR_ORANGE} onChange={v => updateTarget({ reviewStarColor: v })} /></PropRow>

            <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}>Recommended Badge Style</p>
            <PropRow label="Badge Background"><ColorField value={targetObj.reviewBadgeBg || "rgba(46, 204, 113, 0.06)"} onChange={v => updateTarget({ reviewBadgeBg: v })} /></PropRow>
            <PropRow label="Badge Text Color"><ColorField value={targetObj.reviewBadgeColor || "#2ecc71"} onChange={v => updateTarget({ reviewBadgeColor: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── SIDEBAR CTA ── */}
        {targetObj.type === "sidebar-cta" && (
          <PropSection title="Sidebar CTA Card (DB)">
            <div style={{ background: "rgba(242, 107, 33, 0.08)", border: "1px solid rgba(242, 107, 33, 0.3)", padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 10, color: HATHOR_ORANGE, display: "flex", alignItems: "center", gap: 6 }}>
              <Database size={13} />
              <span>Price, discount, and ownership status are fetched dynamically per user.</span>
            </div>
            <PropRow label="Price Override"><TxtInput value={targetObj.sidebarPrice || "299.99"} onChange={v => updateTarget({ sidebarPrice: v })} /></PropRow>
            <PropRow label="Discount % Override"><NumField value={targetObj.sidebarDiscount || 0} onChange={v => updateTarget({ sidebarDiscount: v })} min={0} max={100} /></PropRow>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
              <span className={styles.propLabel}>Preview State</span>
              <button onClick={() => updateTarget({ sidebarOwned: !targetObj.sidebarOwned })}
                style={{ padding: "4px 10px", border: `1px solid ${targetObj.sidebarOwned ? GREEN_ACCENT : HATHOR_ORANGE}`, color: targetObj.sidebarOwned ? GREEN_ACCENT : HATHOR_ORANGE, background: "transparent", fontSize: 10, cursor: "pointer" }}>
                {targetObj.sidebarOwned ? "OWNED" : "UNOWNED (BUY)"}
              </button>
            </div>
          </PropSection>
        )}

        {/* ── SIDEBAR INFO ── */}
        {targetObj.type === "sidebar-info" && (
          <PropSection title="Sidebar Game Metadata (DB)">
            <div style={{ background: "rgba(242, 107, 33, 0.08)", border: "1px solid rgba(242, 107, 33, 0.3)", padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 10, color: HATHOR_ORANGE, display: "flex", alignItems: "center", gap: 6 }}>
              <Database size={13} />
              <span>Developer, publisher, release date, and genre are loaded from the database.</span>
            </div>
            <PropRow label="Developer Override"><TxtInput value={targetObj.sideDev || ""} onChange={v => updateTarget({ sideDev: v })} /></PropRow>
            <PropRow label="Publisher Override"><TxtInput value={targetObj.sidePub || ""} onChange={v => updateTarget({ sidePub: v })} /></PropRow>
            <PropRow label="Release Date Override"><TxtInput value={targetObj.sideDate || ""} onChange={v => updateTarget({ sideDate: v })} /></PropRow>
            <PropRow label="Genre Override"><TxtInput value={targetObj.sideGenre || ""} onChange={v => updateTarget({ sideGenre: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {targetObj.type === "recommendations" && (
          <PropSection title="More Like This (DB Widget)">
            <div style={{ background: "rgba(242, 107, 33, 0.08)", border: "1px solid rgba(242, 107, 33, 0.3)", padding: 10, borderRadius: 4, marginBottom: 14, fontSize: 11, color: HATHOR_ORANGE, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800 }}>
                <Database size={14} /> <span>DYNAMIC DATABASE WIDGET</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: TEXT_MUTED, lineHeight: 1.4 }}>
                Recommended games are automatically queried and fetched from the database based on the current game's genre and tags upon publishing.
              </p>
            </div>

            <PropRow label="Section Title"><TxtInput value={targetObj.recsTitle || "MORE LIKE THIS"} onChange={v => updateTarget({ recsTitle: v })} /></PropRow>
            <PropRow label="Max Games to Fetch">
              <SelField value={String(targetObj.recsCount || 4)} onChange={v => updateTarget({ recsCount: Number(v) })}
                options={[
                  { label: "3 Games", value: "3" },
                  { label: "4 Games (Standard)", value: "4" },
                  { label: "6 Games", value: "6" },
                ]} />
            </PropRow>
            <PropRow label="Card Background / Free Gradient"><ColorField value={targetObj.recsCardBg || SURFACE} onChange={v => updateTarget({ recsCardBg: v })} placeholder="e.g. #181c24 or linear-gradient(...)" /></PropRow>
            <PropRow label="Card Border Color"><ColorField value={targetObj.recsCardBorder || BORDER} onChange={v => updateTarget({ recsCardBorder: v })} /></PropRow>
          </PropSection>
        )}

        {/* ── CUSTOM GRID SECTION ── */}
        {s.type === "grid" && !isEditingGridElement && <>
          <PropSection title="Grid Layout">
            <PropRow label="Column Template">
              <SelField value={s.gridTemplate || "2:1"} onChange={v => setGridTemplateRatio(v)}
                options={[
                  { label: "1 Column (Single)", value: "1" },
                  { label: "2 Columns (1:1 Equal)", value: "1:1" },
                  { label: "2 Columns (1:2 Right Heavy)", value: "1:2" },
                  { label: "2 Columns (2:1 Main Content + Sidebar)", value: "2:1" },
                  { label: "3 Columns (1:1:1 Equal)", value: "1:1:1" },
                  { label: "3 Columns (1:2:1 Center Heavy)", value: "1:2:1" },
                  { label: "4 Columns (1:1:1:1 Equal)", value: "1:1:1:1" }
                ]} />
            </PropRow>
            <PropRow label="Grid Gap"><NumField value={s.gridGap || 40} onChange={v => u({ gridGap: v })} unit="px" min={0} max={120} /></PropRow>
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

            {activeCol && <>
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

              <div style={{ marginTop: 12 }}>
                <p className={styles.propLabel} style={{ marginBottom: 6 }}>Insert Element into Col {gridColIdx + 1}</p>
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
                    <ShoppingCart size={12} /> + Sidebar CTA Card (DB)
                  </button>
                  <button onClick={() => addGridElement("sidebar-info")} className={styles.addElementBtn}>
                    <Info size={12} /> + Sidebar Info Card (DB)
                  </button>
                  <button onClick={() => addGridElement("sidebar-ratings")} className={styles.addElementBtn}>
                    <BarChart2 size={12} /> + Rating Bars Card (DB)
                  </button>
                  <button onClick={() => addGridElement("sidebar-community")} className={styles.addElementBtn}>
                    <Users size={12} /> + Community Card (DB)
                  </button>
                  <button onClick={() => addGridElement("user-reviews")} className={styles.addElementBtn}>
                    <MessageSquare size={12} /> + User Reviews (DB)
                  </button>
                </div>
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
            </>}
          </PropSection>
        </>}

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

// ── Main App ──────────────────────────────────────────────────────────────────
export default function DesignerPage() {
  const [state, setState] = useState({ sections: INITIAL, history: [INITIAL], historyIdx: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedColIdx, setSelectedColIdx] = useState<number | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(true);

  const [device, setDevice] = useState<Device>("desktop");
  const [gameTitle, setGameTitle] = useState("ELDEN THRONE");
  const [toast, setToast] = useState<string | null>(null);

  const { sections, history, historyIdx } = state;

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2200); }

  function mutateSections(newSections: Section[]) {
    setState(prev => ({
      sections: newSections,
      history: [...prev.history.slice(0, prev.historyIdx + 1), newSections],
      historyIdx: prev.historyIdx + 1,
    }));
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
      const isElemType = !["grid", "two-col", "game-hero", "recommendations"].includes(type);
      const elemType: ElementType = isElemType ? (type as ElementType) : "text";

      const newEl = createGridElement(elemType);
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

  function updateSection(id: string, updates: Partial<Section>) {
    mutateSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
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
        <button onClick={() => showToast("Draft saved")} className={styles.saveDraftBtn}>
          <Save size={11} /> Save Draft
        </button>
        <button onClick={() => showToast("Page published!")} className={styles.publishBtn}>
          <Upload size={11} /> Publish
        </button>
      </div>

      {/* ── Body ── */}
      <div className={styles.editorBody}>

        {/* Left — block palette */}
        <BlockPalette onAdd={addSection} />

        {/* Center — canvas */}
        <div className={styles.canvasArea} onClick={() => { setSelectedId(null); setSelectedColIdx(null); setSelectedElementId(null); }}>
          {/* Page frame */}
          <div className={styles.canvasWrapper} style={{ maxWidth: deviceMax, background: BG, width: "100%" }} onClick={e => e.stopPropagation()}>
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
        />
      </div>
    </div>
  );
}
