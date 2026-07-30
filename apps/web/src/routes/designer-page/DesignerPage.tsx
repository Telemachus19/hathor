import React, { useState } from "react";
import {
  Type, Film, LayoutGrid, Minus,
  ChevronUp, ChevronDown, Trash2, Plus, Copy,
  Monitor, Tablet, Smartphone, Save,
  X, ChevronLeft, ChevronRight,
  AlignLeft, AlignCenter, AlignRight,
  Hash, Star, Zap, Check,
  Upload, Layers, Settings, RotateCcw, RotateCw,
  Image as ImageIcon,
  LucideIcon
} from "lucide-react";
import { HathorLogo } from "../../assets";
import styles from "./DesignerPage.module.css";

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG = "#222831";
const SURFACE = "#1C2028";
const BORDER = "#393E46";
const ORANGE = "#FD7014";
const TEXT = "#EEEEEE";
const MUTED = "#8C9AAA";

// ── Font & weight options for the designer ─────────────────────────────────────
const FONTS = [
  { label: "Cinzel", value: "'Cinzel', serif" },
  { label: "Cinzel Decorative", value: "'Cinzel Decorative', serif" },
  { label: "Raleway", value: "'Raleway', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "Oswald", value: "'Oswald', sans-serif" },
  { label: "Lora", value: "'Lora', serif" },
];

const WEIGHTS = [
  { label: "Thin (100)", value: "100" },
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "SemiBold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "ExtraBold (800)", value: "800" },
  { label: "Black (900)", value: "900" },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type SectionType = "hero" | "text" | "image" | "carousel" | "features" | "two-col" | "divider" | "spacer" | "cta";
type Device = "desktop" | "tablet" | "mobile";

interface FeatureItem { icon: string; title: string; desc: string; color: string; }

interface Section {
  id: string; type: SectionType;
  bg: string; bgImage: string; overlay: number;
  pt: number; pb: number; ph: number; radius: number;
  // Hero
  heroTitle?: string; heroSubtitle?: string; heroCtaText?: string;
  heroCtaBg?: string; heroCtaColor?: string; heroTitleFont?: string;
  heroTitleSize?: number; heroTitleWeight?: string; heroTitleColor?: string;
  heroSubtitleColor?: string; heroAlign?: string;
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
let _seq = 100;
function uid() { return `sec_${Date.now()}_${++_seq}`; }

// ── Default section factory ────────────────────────────────────────────────────
function createSection(type: SectionType): Section {
  const base = { id: uid(), bg: "#0d0d14", bgImage: "", overlay: 0, pt: 64, pb: 64, ph: 32, radius: 0 };
  switch (type) {
    case "hero": return {
      ...base, type, bg: "#0a0a12", pt: 120, pb: 120, ph: 48,
      heroTitle: "Your Game Title", heroSubtitle: "Your epic tagline goes here.",
      heroCtaText: "Add to Cart — $29.99", heroCtaBg: "#FD7014", heroCtaColor: "#ffffff",
      heroTitleFont: "'Cinzel', serif", heroTitleSize: 56, heroTitleWeight: "900",
      heroTitleColor: "#ffffff", heroSubtitleColor: "#cccccc", heroAlign: "center",
    };
    case "text": return {
      ...base, type,
      textContent: "Add your description here. Tell players about your game's story, gameplay, or features.",
      textFont: "'Raleway', sans-serif", textSize: 16, textWeight: "400",
      textColor: "#CCCCCC", textAlign: "center", textLineHeight: 1.8, textMaxWidth: 680,
    };
    case "image": return {
      ...base, type,
      imageSrc: `https://picsum.photos/seed/${uid()}/900/500`, imageAlt: "Game screenshot",
      imageRadius: 0, imageMaxWidth: 100, imageShadow: false,
    };
    case "carousel": return {
      ...base, type, pt: 0, pb: 0, ph: 0,
      carouselImages: [
        `https://picsum.photos/seed/${uid()}/900/450`,
        `https://picsum.photos/seed/${uid()}/900/450`,
        `https://picsum.photos/seed/${uid()}/900/450`,
      ],
      carouselHeight: 420, carouselRadius: 0,
    };
    case "features": return {
      ...base, type,
      featuresTitle: "Key Features", featuresTitleFont: "'Cinzel', serif",
      featuresTitleColor: "#ffffff", featuresCols: 3,
      featuresItems: [
        { icon: "🎮", title: "Feature One", desc: "Describe your first key feature here.", color: "#FD7014" },
        { icon: "⚡", title: "Feature Two", desc: "Describe your second key feature here.", color: "#4caf80" },
        { icon: "🌟", title: "Feature Three", desc: "Describe your third key feature here.", color: "#3b9eda" },
      ],
    };
    case "two-col": return {
      ...base, type, twoColRatio: "1:1", twoColGap: 48,
      twoColLeftType: "text",
      twoColLeftText: "Add your left column text here.\n\nYou can include system requirements, lore, or feature details.",
      twoColLeftFont: "'Raleway', sans-serif", twoColLeftSize: 14,
      twoColLeftWeight: "400", twoColLeftColor: "#CCCCCC", twoColLeftAlign: "left",
      twoColRightType: "image", twoColRightImg: `https://picsum.photos/seed/${uid()}/600/400`,
    };
    case "divider": return {
      ...base, type, pt: 16, pb: 16,
      dividerColor: "#393E46", dividerStyle: "solid", dividerThickness: 1, dividerWidth: 80,
    };
    case "spacer": return { ...base, type, pt: 0, pb: 0, bg: "transparent", spacerHeight: 60 };
    case "cta": return {
      ...base, type, bg: "#0d0d14", pt: 100, pb: 100,
      ctaTitle: "Get the Game", ctaSubtitle: "Available on Windows, macOS and Linux.",
      ctaPrice: "$29.99", ctaBtnText: "Add to Cart",
      ctaBtnColor: "#FD7014", ctaBtnTextColor: "#ffffff",
      ctaTitleFont: "'Cinzel', serif", ctaTitleColor: "#ffffff",
      ctaSubtitleColor: "#AAAAAA", ctaAlign: "center",
    };
    default: return { ...base, type };
  }
}

// ── Preset initial page ────────────────────────────────────────────────────────
const INITIAL: Section[] = [
  {
    id: "s1", type: "hero",
    bg: "#0a0a12", bgImage: "https://picsum.photos/seed/darkfantasy77/1400/700",
    overlay: 55, pt: 140, pb: 140, ph: 48, radius: 0,
    heroTitle: "ELDEN THRONE", heroSubtitle: "Forge your legend across a shattered world of gods and ruin.",
    heroCtaText: "Add to Cart — $59.99", heroCtaBg: "#FD7014", heroCtaColor: "#ffffff",
    heroTitleFont: "'Cinzel', serif", heroTitleSize: 60, heroTitleWeight: "900",
    heroTitleColor: "#ffffff", heroSubtitleColor: "#cccccc", heroAlign: "center",
  },
  {
    id: "s2", type: "text",
    bg: "#0f0f18", bgImage: "", overlay: 0, pt: 72, pb: 72, ph: 48, radius: 0,
    textContent: "In a world broken by the fall of the First Gods, you rise as an Elden-seeker — a warrior unbound by fate. Traverse vast dungeons, battle ancient colossi, and forge alliances with forgotten civilizations across 60+ interconnected zones.",
    textFont: "'Raleway', sans-serif", textSize: 17, textWeight: "400",
    textColor: "#BBBBBB", textAlign: "center", textLineHeight: 1.85, textMaxWidth: 700,
  },
  {
    id: "s3", type: "carousel",
    bg: "#080810", bgImage: "", overlay: 0, pt: 0, pb: 0, ph: 0, radius: 0,
    carouselImages: [
      "https://picsum.photos/seed/screen-a1/1000/500",
      "https://picsum.photos/seed/screen-b2/1000/500",
      "https://picsum.photos/seed/screen-c3/1000/500",
      "https://picsum.photos/seed/screen-d4/1000/500",
    ],
    carouselHeight: 460, carouselRadius: 0,
  },
  {
    id: "s4", type: "features",
    bg: "#0f0f18", bgImage: "", overlay: 0, pt: 88, pb: 88, ph: 48, radius: 0,
    featuresTitle: "Core Features", featuresTitleFont: "'Cinzel', serif",
    featuresTitleColor: "#ffffff", featuresCols: 3,
    featuresItems: [
      { icon: "⚔️", title: "Epic Combat", desc: "Master 200+ unique weapons across 8 battle disciplines. Every fight is a test of skill.", color: "#FD7014" },
      { icon: "🌍", title: "Vast Open World", desc: "Explore 60+ zones spanning deserts, tundra, and underwater caverns.", color: "#4caf80" },
      { icon: "🧙", title: "Deep Progression", desc: "Build your legend through 500+ skill nodes and legendary equipment sets.", color: "#3b9eda" },
    ],
  },
  {
    id: "s5", type: "two-col",
    bg: "#080810", bgImage: "", overlay: 0, pt: 88, pb: 88, ph: 48, radius: 0,
    twoColRatio: "1:1", twoColGap: 56,
    twoColLeftType: "text",
    twoColLeftText: "System Requirements\n\nMinimum:\nOS: Windows 10 64-bit\nCPU: Intel Core i5-8400\nRAM: 12 GB\nGPU: NVIDIA GTX 1060 6GB\nStorage: 80 GB SSD\n\nRecommended:\nOS: Windows 11 64-bit\nCPU: Intel Core i7-10700K\nRAM: 16 GB\nGPU: NVIDIA RTX 3070\nStorage: 80 GB NVMe SSD",
    twoColLeftFont: "'Space Grotesk', sans-serif", twoColLeftSize: 13,
    twoColLeftWeight: "400", twoColLeftColor: "#AAAAAA", twoColLeftAlign: "left",
    twoColRightType: "image", twoColRightImg: "https://picsum.photos/seed/game-art9/600/500",
  },
  {
    id: "s6", type: "cta",
    bg: "#0a0a12", bgImage: "https://picsum.photos/seed/cta-dark5/1400/500",
    overlay: 78, pt: 100, pb: 100, ph: 48, radius: 0,
    ctaTitle: "Begin Your Legend",
    ctaSubtitle: "Available now on Windows, macOS and Linux.",
    ctaPrice: "$59.99", ctaBtnText: "Add to Cart",
    ctaBtnColor: "#FD7014", ctaBtnTextColor: "#ffffff",
    ctaTitleFont: "'Cinzel', serif", ctaTitleColor: "#ffffff",
    ctaSubtitleColor: "#AAAAAA", ctaAlign: "center",
  },
];

// ── Palette config ────────────────────────────────────────────────────────────
const PALETTE: { group: string; items: { type: SectionType; label: string; desc: string; Icon: LucideIcon }[] }[] = [
  {
    group: "Sections",
    items: [
      { type: "hero", label: "Hero Banner", desc: "Title, subtitle & CTA", Icon: Star },
      { type: "cta", label: "CTA Block", desc: "Price & buy button", Icon: Zap },
    ],
  },
  {
    group: "Content",
    items: [
      { type: "text", label: "Text", desc: "Paragraph or heading", Icon: Type },
      { type: "image", label: "Image", desc: "Single image block", Icon: ImageIcon },
      { type: "carousel", label: "Carousel", desc: "Image slideshow", Icon: Film },
      { type: "features", label: "Features Grid", desc: "Icon cards", Icon: LayoutGrid },
      { type: "two-col", label: "Two Columns", desc: "Side-by-side layout", Icon: Layers },
    ],
  },
  {
    group: "Extras",
    items: [
      { type: "divider", label: "Divider", desc: "Horizontal rule", Icon: Minus },
      { type: "spacer", label: "Spacer", desc: "Vertical space", Icon: Hash },
    ],
  },
];

const BLOCK_META: Record<SectionType, { label: string; Icon: LucideIcon }> = {
  hero: { label: "Hero Banner", Icon: Star },
  text: { label: "Text Block", Icon: Type },
  image: { label: "Image", Icon: ImageIcon },
  carousel: { label: "Carousel", Icon: Film },
  features: { label: "Features Grid", Icon: LayoutGrid },
  "two-col": { label: "Two Columns", Icon: Layers },
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
function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.colorField}>
      <div className={styles.colorSwatch} style={{ background: value }} />
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className={styles.colorInput} placeholder="#000000" />
    </div>
  );
}
function NumField({ value, onChange, min = 0, max = 9999, step = 1, unit }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string;
}) {
  return (
    <div className={styles.numField}>
      <button onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
        className={styles.numBtn}>−</button>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
        className={styles.numInput} min={min} max={max} step={step} />
      {unit && <span className={styles.unitSpan}>{unit}</span>}
      <button onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
        className={styles.numBtn}>+</button>
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
        {options.map(o => <option key={o.value} value={o.value} style={{ background: SURFACE, color: TEXT }}>{o.label}</option>)}
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
function SliderField({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className={styles.propRow}>
      <div className={styles.sliderHeader}>
        <span className={styles.propLabel}>{label}</span>
        <span className={styles.sliderValue}>{value}%</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))}
        className={styles.sliderInput} />
    </div>
  );
}

// ── Section renderers (live canvas preview) ────────────────────────────────────
function HeroRenderer({ s }: { s: Section }) {
  return (
    <div style={{ textAlign: (s.heroAlign || "center") as React.CSSProperties["textAlign"], maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontFamily: s.heroTitleFont, fontSize: s.heroTitleSize, fontWeight: s.heroTitleWeight as React.CSSProperties["fontWeight"],
        color: s.heroTitleColor, marginBottom: 20, lineHeight: 1.08, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {s.heroTitle || "Hero Title"}
      </h1>
      <p style={{ color: s.heroSubtitleColor, fontSize: 18, marginBottom: 36, lineHeight: 1.65, maxWidth: 560, margin: "0 auto 36px" }}>
        {s.heroSubtitle || "Your subtitle here"}
      </p>
      <button style={{ background: s.heroCtaBg, color: s.heroCtaColor, padding: "14px 40px",
        fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
        {s.heroCtaText || "Add to Cart"}
      </button>
    </div>
  );
}
function TextRenderer({ s }: { s: Section }) {
  return (
    <div style={{ maxWidth: s.textMaxWidth || 700, margin: "0 auto" }}>
      <p style={{ fontFamily: s.textFont, fontSize: s.textSize, fontWeight: s.textWeight as React.CSSProperties["fontWeight"],
        color: s.textColor, textAlign: (s.textAlign || "left") as React.CSSProperties["textAlign"],
        lineHeight: s.textLineHeight, whiteSpace: "pre-wrap" }}>
        {s.textContent || "Your text content"}
      </p>
    </div>
  );
}
function ImageRenderer({ s }: { s: Section }) {
  return (
    <div style={{ textAlign: "center" }}>
      <img src={s.imageSrc || "https://picsum.photos/900/500"} alt={s.imageAlt || ""}
        style={{ maxWidth: `${s.imageMaxWidth ?? 100}%`, width: "100%", display: "inline-block",
          borderRadius: s.imageRadius, boxShadow: s.imageShadow ? "0 24px 60px rgba(0,0,0,0.55)" : "none" }} />
    </div>
  );
}
function CarouselRenderer({ s }: { s: Section }) {
  const [idx, setIdx] = useState(0);
  const imgs = s.carouselImages || [];
  return (
    <div style={{ position: "relative", height: s.carouselHeight || 420, overflow: "hidden", borderRadius: s.carouselRadius, background: "#0a0a0f" }}>
      {imgs.length > 0 ? (
        <>
          <img src={imgs[idx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }} />
          {imgs.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }}
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }}
                style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <ChevronRight size={20} />
              </button>
              <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                {imgs.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                    style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? ORANGE : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", transition: "all 0.25s" }} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: MUTED }}>
          <Film size={40} style={{ opacity: 0.25 }} />
          <span style={{ fontSize: 12, fontFamily: "monospace", opacity: 0.4 }}>No images added</span>
        </div>
      )}
    </div>
  );
}
function FeaturesRenderer({ s }: { s: Section }) {
  const items = s.featuresItems || [];
  const cols = s.featuresCols || 3;
  return (
    <div>
      {s.featuresTitle && (
        <h2 style={{ fontFamily: s.featuresTitleFont, color: s.featuresTitleColor, fontSize: 32,
          fontWeight: 900, textAlign: "center", marginBottom: 56, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {s.featuresTitle}
        </h2>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 40 }}>
        {items.map((item, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>{item.icon}</div>
            <h3 style={{ color: item.color, fontSize: 14, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {item.title}
            </h3>
            <p style={{ color: "#999", fontSize: 13, lineHeight: 1.65 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
function TwoColRenderer({ s }: { s: Section }) {
  const ratioMap: Record<string, string> = { "1:1": "1fr 1fr", "1:2": "1fr 2fr", "2:1": "2fr 1fr" };
  function Side({ type, text, img, font, size, weight, color, align }: {
    type?: string; text?: string; img?: string;
    font?: string; size?: number; weight?: string; color?: string; align?: string;
  }) {
    if (type === "image") return <img src={img || "https://picsum.photos/600/400"} alt="" style={{ width: "100%", borderRadius: 4 }} />;
    return (
      <p style={{ fontFamily: font, fontSize: size, fontWeight: weight as React.CSSProperties["fontWeight"],
        color: color || "#CCCCCC", textAlign: (align || "left") as React.CSSProperties["textAlign"],
        lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
        {text || "Column text"}
      </p>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: ratioMap[s.twoColRatio || "1:1"] || "1fr 1fr", gap: s.twoColGap || 48, alignItems: "center" }}>
      <Side type={s.twoColLeftType} text={s.twoColLeftText} img={s.twoColLeftImg} font={s.twoColLeftFont} size={s.twoColLeftSize} weight={s.twoColLeftWeight} color={s.twoColLeftColor} align={s.twoColLeftAlign} />
      <Side type={s.twoColRightType} text={s.twoColRightText} img={s.twoColRightImg} font={s.twoColRightFont} size={s.twoColRightSize} weight={s.twoColRightWeight} color={s.twoColRightColor} align={s.twoColRightAlign} />
    </div>
  );
}
function DividerRenderer({ s }: { s: Section }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: `${s.dividerWidth || 80}%`, height: s.dividerThickness || 1, background: s.dividerColor || "#393E46" }} />
    </div>
  );
}
function SpacerRenderer({ s }: { s: Section }) {
  return (
    <div style={{ height: s.spacerHeight || 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", height: 1, borderTop: "1px dashed rgba(255,255,255,0.06)" }} />
    </div>
  );
}
function CTARenderer({ s }: { s: Section }) {
  return (
    <div style={{ textAlign: (s.ctaAlign || "center") as React.CSSProperties["textAlign"], maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ fontFamily: s.ctaTitleFont, color: s.ctaTitleColor, fontSize: 38, fontWeight: 900,
        marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {s.ctaTitle || "Get the Game"}
      </h2>
      <p style={{ color: s.ctaSubtitleColor, fontSize: 15, marginBottom: 36, lineHeight: 1.5 }}>{s.ctaSubtitle}</p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        justifyContent: s.ctaAlign === "center" ? "center" : "flex-start" }}>
        {s.ctaPrice && (
          <span style={{ color: ORANGE, fontSize: 36, fontWeight: 900, fontFamily: "'Cinzel', serif" }}>{s.ctaPrice}</span>
        )}
        <button style={{ background: s.ctaBtnColor, color: s.ctaBtnTextColor, padding: "14px 40px",
          fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
          {s.ctaBtnText || "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ── Section wrapper with selection chrome ─────────────────────────────────────
function SectionWrapper({ section: s, selected, isFirst, isLast, onSelect, onMoveUp, onMoveDown, onDuplicate, onDelete }: {
  section: Section; selected: boolean; isFirst: boolean; isLast: boolean;
  onSelect: () => void; onMoveUp: () => void; onMoveDown: () => void;
  onDuplicate: () => void; onDelete: () => void;
}) {
  const bgStyle: React.CSSProperties = s.bgImage
    ? { backgroundImage: `url(${s.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : {};

  return (
    <div onClick={e => { e.stopPropagation(); onSelect(); }}
      className={`${styles.sectionWrapper} ${selected ? styles.sectionSelected : ""}`}
      style={{ background: s.bg, ...bgStyle }}>
      {/* bg overlay */}
      {s.bgImage && s.overlay > 0 && (
        <div style={{ position: "absolute", inset: 0, background: s.bg || "#000", opacity: s.overlay / 100, pointerEvents: "none" }} />
      )}
      {/* Spacer dashed background */}
      {s.type === "spacer" && !s.bgImage && (
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.02) 0,rgba(255,255,255,0.02) 1px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }} />
      )}
      {/* Content */}
      <div style={{ position: "relative", paddingTop: s.pt, paddingBottom: s.pb, paddingLeft: s.ph, paddingRight: s.ph, borderRadius: s.radius }}>
        {s.type === "hero" && <HeroRenderer s={s} />}
        {s.type === "text" && <TextRenderer s={s} />}
        {s.type === "image" && <ImageRenderer s={s} />}
        {s.type === "carousel" && <CarouselRenderer s={s} />}
        {s.type === "features" && <FeaturesRenderer s={s} />}
        {s.type === "two-col" && <TwoColRenderer s={s} />}
        {s.type === "divider" && <DividerRenderer s={s} />}
        {s.type === "spacer" && <SpacerRenderer s={s} />}
        {s.type === "cta" && <CTARenderer s={s} />}
      </div>
      {/* Selection label */}
      {selected && (
        <div className={styles.sectionTag}>
          {BLOCK_META[s.type]?.label}
        </div>
      )}
      {/* Controls toolbar */}
      {selected && (
        <div className={styles.sectionToolbar}>
          <button onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst}
            className={styles.sectionToolBtn} title="Move up">
            <ChevronUp size={12} />
          </button>
          <button onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={isLast}
            className={styles.sectionToolBtn} title="Move down">
            <ChevronDown size={12} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDuplicate(); }}
            className={styles.sectionToolBtn} title="Duplicate">
            <Copy size={12} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className={styles.sectionToolBtn} title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Block Palette ──────────────────────────────────────────────────────────────
function BlockPalette({ onAdd }: { onAdd: (type: SectionType) => void }) {
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
                <button key={item.type} onClick={() => onAdd(item.type)}
                  className={styles.paletteCard}>
                  <div className={styles.paletteIconWrap}>
                    <item.Icon size={14} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className={styles.paletteCardLabel}>{item.label}</p>
                    <p className={styles.paletteCardDesc}>{item.desc}</p>
                  </div>
                  <Plus size={12} style={{ color: MUTED, opacity: 0.5, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Properties Panel ──────────────────────────────────────────────────────────
function PropertiesPanel({ section, onChange }: {
  section: Section | null;
  onChange: (id: string, updates: Partial<Section>) => void;
}) {
  const [twoColSide, setTwoColSide] = useState<"left" | "right">("left");

  if (!section) {
    return (
      <div className={styles.rightSidebar}>
        <div className={styles.propsHeader}>
          Properties
        </div>
        <div className={styles.emptyProps}>
          <Settings size={32} style={{ color: MUTED, opacity: 0.2 }} />
          <p style={{ fontWeight: 700, color: TEXT }}>No block selected</p>
          <p style={{ fontSize: 10, color: MUTED }}>Click any block on the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const u = (updates: Partial<Section>) => onChange(section.id, updates);
  const s = section;
  const { Icon } = BLOCK_META[s.type] || { Icon: Settings };

  return (
    <div className={styles.rightSidebar}>
      {/* Panel header */}
      <div className={styles.propsHeader}>
        <Icon size={14} style={{ color: ORANGE }} />
        <span>{BLOCK_META[s.type]?.label}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Background (all types) ── */}
        <PropSection title="Background">
          <PropRow label="Color">
            <ColorField value={s.bg} onChange={v => u({ bg: v })} />
          </PropRow>
          <PropRow label="Image URL">
            <TxtInput value={s.bgImage} onChange={v => u({ bgImage: v })} placeholder="https://…" />
          </PropRow>
          {s.bgImage && <SliderField value={s.overlay} onChange={v => u({ overlay: v })} label="Overlay Opacity" />}
        </PropSection>

        {/* ── Spacing (all types) ── */}
        <PropSection title="Spacing">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <PropRow label="Pad Top"><NumField value={s.pt} onChange={v => u({ pt: v })} unit="px" max={400} /></PropRow>
            <PropRow label="Pad Bottom"><NumField value={s.pb} onChange={v => u({ pb: v })} unit="px" max={400} /></PropRow>
          </div>
          <PropRow label="Pad Horizontal"><NumField value={s.ph} onChange={v => u({ ph: v })} unit="px" max={300} /></PropRow>
          <PropRow label="Border Radius"><NumField value={s.radius} onChange={v => u({ radius: v })} unit="px" max={80} /></PropRow>
        </PropSection>

        {/* ── HERO content ── */}
        {s.type === "hero" && <>
          <PropSection title="Content">
            <PropRow label="Title"><TxtArea value={s.heroTitle || ""} onChange={v => u({ heroTitle: v })} rows={2} /></PropRow>
            <PropRow label="Subtitle"><TxtArea value={s.heroSubtitle || ""} onChange={v => u({ heroSubtitle: v })} rows={3} /></PropRow>
            <PropRow label="Button Text"><TxtInput value={s.heroCtaText || ""} onChange={v => u({ heroCtaText: v })} /></PropRow>
            <PropRow label="Button Background"><ColorField value={s.heroCtaBg || "#FD7014"} onChange={v => u({ heroCtaBg: v })} /></PropRow>
            <PropRow label="Button Text Color"><ColorField value={s.heroCtaColor || "#ffffff"} onChange={v => u({ heroCtaColor: v })} /></PropRow>
          </PropSection>
          <PropSection title="Typography">
            <PropRow label="Title Font"><SelField value={s.heroTitleFont || "'Cinzel', serif"} onChange={v => u({ heroTitleFont: v })} options={FONTS} /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Size"><NumField value={s.heroTitleSize || 56} onChange={v => u({ heroTitleSize: v })} unit="px" min={12} max={120} /></PropRow>
              <PropRow label="Weight"><SelField value={s.heroTitleWeight || "900"} onChange={v => u({ heroTitleWeight: v })} options={WEIGHTS} /></PropRow>
            </div>
            <PropRow label="Title Color"><ColorField value={s.heroTitleColor || "#ffffff"} onChange={v => u({ heroTitleColor: v })} /></PropRow>
            <PropRow label="Subtitle Color"><ColorField value={s.heroSubtitleColor || "#cccccc"} onChange={v => u({ heroSubtitleColor: v })} /></PropRow>
            <PropRow label="Alignment"><AlignField value={s.heroAlign || "center"} onChange={v => u({ heroAlign: v })} /></PropRow>
          </PropSection>
        </>}

        {/* ── TEXT content ── */}
        {s.type === "text" && <>
          <PropSection title="Content">
            <PropRow label="Text"><TxtArea value={s.textContent || ""} onChange={v => u({ textContent: v })} rows={6} /></PropRow>
            <PropRow label="Max Width"><NumField value={s.textMaxWidth || 700} onChange={v => u({ textMaxWidth: v })} unit="px" min={200} max={1400} step={20} /></PropRow>
          </PropSection>
          <PropSection title="Typography">
            <PropRow label="Font Family"><SelField value={s.textFont || "'Raleway', sans-serif"} onChange={v => u({ textFont: v })} options={FONTS} /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Size"><NumField value={s.textSize || 16} onChange={v => u({ textSize: v })} unit="px" min={10} max={72} /></PropRow>
              <PropRow label="Weight"><SelField value={s.textWeight || "400"} onChange={v => u({ textWeight: v })} options={WEIGHTS} /></PropRow>
            </div>
            <PropRow label="Color"><ColorField value={s.textColor || "#CCCCCC"} onChange={v => u({ textColor: v })} /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Align"><AlignField value={s.textAlign || "left"} onChange={v => u({ textAlign: v })} /></PropRow>
              <PropRow label="Line Height"><NumField value={s.textLineHeight || 1.8} onChange={v => u({ textLineHeight: v })} min={1} max={3} step={0.1} /></PropRow>
            </div>
          </PropSection>
        </>}

        {/* ── IMAGE content ── */}
        {s.type === "image" && (
          <PropSection title="Content">
            <PropRow label="Image URL"><TxtInput value={s.imageSrc || ""} onChange={v => u({ imageSrc: v })} placeholder="https://…" /></PropRow>
            <PropRow label="Alt Text"><TxtInput value={s.imageAlt || ""} onChange={v => u({ imageAlt: v })} placeholder="Screenshot description" /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Max Width (%)"><NumField value={s.imageMaxWidth ?? 100} onChange={v => u({ imageMaxWidth: v })} unit="%" min={10} max={100} /></PropRow>
              <PropRow label="Border Radius"><NumField value={s.imageRadius || 0} onChange={v => u({ imageRadius: v })} unit="px" max={60} /></PropRow>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
              <span className={styles.propLabel}>Drop Shadow</span>
              <button onClick={() => u({ imageShadow: !s.imageShadow })}
                style={{ padding: "4px 10px", border: `1px solid ${s.imageShadow ? ORANGE : BORDER}`, color: s.imageShadow ? ORANGE : MUTED, background: s.imageShadow ? "rgba(253, 112, 20, 0.12)" : "transparent", fontSize: 10, cursor: "pointer" }}>
                {s.imageShadow ? "On" : "Off"}
              </button>
            </div>
          </PropSection>
        )}

        {/* ── CAROUSEL content ── */}
        {s.type === "carousel" && (
          <PropSection title="Content">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Height"><NumField value={s.carouselHeight || 420} onChange={v => u({ carouselHeight: v })} unit="px" min={200} max={800} step={10} /></PropRow>
              <PropRow label="Radius"><NumField value={s.carouselRadius || 0} onChange={v => u({ carouselRadius: v })} unit="px" max={40} /></PropRow>
            </div>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <p className={styles.propLabel}>Images — {(s.carouselImages || []).length}</p>
              {(s.carouselImages || []).map((img, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 36, height: 24, flexShrink: 0, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <input value={img} onChange={e => {
                    const imgs = [...(s.carouselImages || [])]; imgs[i] = e.target.value;
                    u({ carouselImages: imgs });
                  }} style={{ flex: 1, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 10, padding: "4px 6px", outline: "none" }} placeholder="Image URL" />
                  <button onClick={() => u({ carouselImages: (s.carouselImages || []).filter((_, j) => j !== i) })}
                    style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer" }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button onClick={() => u({ carouselImages: [...(s.carouselImages || []), `https://picsum.photos/seed/${uid()}/900/450`] })}
                style={{ width: "100%", padding: "6px", border: `1px dashed ${BORDER}`, background: "transparent", color: MUTED, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Plus size={10} /> Add Image
              </button>
            </div>
          </PropSection>
        )}

        {/* ── FEATURES content ── */}
        {s.type === "features" && (
          <PropSection title="Content">
            <PropRow label="Section Title"><TxtInput value={s.featuresTitle || ""} onChange={v => u({ featuresTitle: v })} placeholder="Key Features" /></PropRow>
            <PropRow label="Title Font"><SelField value={s.featuresTitleFont || "'Cinzel', serif"} onChange={v => u({ featuresTitleFont: v })} options={FONTS} /></PropRow>
            <PropRow label="Title Color"><ColorField value={s.featuresTitleColor || "#ffffff"} onChange={v => u({ featuresTitleColor: v })} /></PropRow>
            <PropRow label="Columns">
              <div style={{ display: "flex", border: `1px solid ${BORDER}` }}>
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => u({ featuresCols: n })}
                    style={{ flex: 1, padding: "6px 0", fontSize: 10, background: (s.featuresCols || 3) === n ? "rgba(253, 112, 20, 0.15)" : "transparent", color: (s.featuresCols || 3) === n ? ORANGE : MUTED, border: "none", borderRight: n < 4 ? `1px solid ${BORDER}` : undefined, cursor: "pointer" }}>
                    {n}
                  </button>
                ))}
              </div>
            </PropRow>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
              {(s.featuresItems || []).map((item, i) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, padding: 10, background: "rgba(34, 40, 49, 0.5)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, color: MUTED, textTransform: "uppercase" }}>Feature {i + 1}</span>
                    <button onClick={() => u({ featuresItems: (s.featuresItems || []).filter((_, j) => j !== i) })}
                      style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer" }}>
                      <X size={10} />
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={item.icon} onChange={e => {
                      const items = [...(s.featuresItems || [])]; items[i] = { ...items[i], icon: e.target.value };
                      u({ featuresItems: items });
                    }} style={{ width: 36, border: `1px solid ${BORDER}`, background: BG, color: TEXT, textAlign: "center", fontSize: 14, outline: "none" }} placeholder="🎮" />
                    <input value={item.title} onChange={e => {
                      const items = [...(s.featuresItems || [])]; items[i] = { ...items[i], title: e.target.value };
                      u({ featuresItems: items });
                    }} style={{ flex: 1, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 10, padding: "4px 6px", outline: "none" }} placeholder="Feature title" />
                  </div>
                  <textarea value={item.desc} onChange={e => {
                    const items = [...(s.featuresItems || [])]; items[i] = { ...items[i], desc: e.target.value };
                    u({ featuresItems: items });
                  }} rows={2} style={{ width: "100%", border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 10, padding: "4px 6px", outline: "none", resize: "none" }} placeholder="Description" />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, color: MUTED }}>Accent Color</span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${BORDER}`, background: BG, padding: "2px 6px" }}>
                      <div style={{ width: 14, height: 14, background: item.color, border: `1px solid ${BORDER}` }} />
                      <input value={item.color} onChange={e => {
                        const items = [...(s.featuresItems || [])]; items[i] = { ...items[i], color: e.target.value };
                        u({ featuresItems: items });
                      }} style={{ flex: 1, background: "transparent", border: "none", color: TEXT, fontSize: 9, outline: "none" }} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => u({ featuresItems: [...(s.featuresItems || []), { icon: "⭐", title: "New Feature", desc: "Describe this feature.", color: ORANGE }] })}
                style={{ width: "100%", padding: "6px", border: `1px dashed ${BORDER}`, background: "transparent", color: MUTED, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Plus size={10} /> Add Feature
              </button>
            </div>
          </PropSection>
        )}

        {/* ── TWO-COL layout + content ── */}
        {s.type === "two-col" && <>
          <PropSection title="Layout">
            <PropRow label="Column Ratio">
              <SelField value={s.twoColRatio || "1:1"} onChange={v => u({ twoColRatio: v })}
                options={[{ label: "Equal (1:1)", value: "1:1" }, { label: "Left heavy (2:1)", value: "2:1" }, { label: "Right heavy (1:2)", value: "1:2" }]} />
            </PropRow>
            <PropRow label="Gap Between Columns"><NumField value={s.twoColGap || 48} onChange={v => u({ twoColGap: v })} unit="px" min={0} max={120} /></PropRow>
          </PropSection>
          <PropSection title="Column Content">
            <div style={{ display: "flex", border: `1px solid ${BORDER}`, marginBottom: 12 }}>
              {(["left", "right"] as const).map(side => (
                <button key={side} onClick={() => setTwoColSide(side)}
                  style={{ flex: 1, padding: "6px 0", fontSize: 9, textTransform: "uppercase", background: twoColSide === side ? "rgba(253, 112, 20, 0.15)" : "transparent", color: twoColSide === side ? ORANGE : MUTED, border: "none", borderRight: side === "left" ? `1px solid ${BORDER}` : undefined, cursor: "pointer" }}>
                  {side === "left" ? "← Left" : "Right →"}
                </button>
              ))}
            </div>
            {twoColSide === "left" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <PropRow label="Type">
                  <SelField value={s.twoColLeftType || "text"} onChange={v => u({ twoColLeftType: v as "text" | "image" })} options={[{ label: "Text", value: "text" }, { label: "Image", value: "image" }]} />
                </PropRow>
                {(s.twoColLeftType || "text") === "text" ? <>
                  <PropRow label="Content"><TxtArea value={s.twoColLeftText || ""} onChange={v => u({ twoColLeftText: v })} rows={5} /></PropRow>
                  <PropRow label="Font"><SelField value={s.twoColLeftFont || "'Raleway', sans-serif"} onChange={v => u({ twoColLeftFont: v })} options={FONTS} /></PropRow>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <PropRow label="Size"><NumField value={s.twoColLeftSize || 14} onChange={v => u({ twoColLeftSize: v })} unit="px" min={10} max={48} /></PropRow>
                    <PropRow label="Weight"><SelField value={s.twoColLeftWeight || "400"} onChange={v => u({ twoColLeftWeight: v })} options={WEIGHTS} /></PropRow>
                  </div>
                  <PropRow label="Color"><ColorField value={s.twoColLeftColor || "#CCCCCC"} onChange={v => u({ twoColLeftColor: v })} /></PropRow>
                  <PropRow label="Alignment"><AlignField value={s.twoColLeftAlign || "left"} onChange={v => u({ twoColLeftAlign: v })} /></PropRow>
                </> : (
                  <PropRow label="Image URL"><TxtInput value={s.twoColLeftImg || ""} onChange={v => u({ twoColLeftImg: v })} placeholder="https://…" /></PropRow>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <PropRow label="Type">
                  <SelField value={s.twoColRightType || "image"} onChange={v => u({ twoColRightType: v as "text" | "image" })} options={[{ label: "Text", value: "text" }, { label: "Image", value: "image" }]} />
                </PropRow>
                {(s.twoColRightType || "image") === "text" ? <>
                  <PropRow label="Content"><TxtArea value={s.twoColRightText || ""} onChange={v => u({ twoColRightText: v })} rows={5} /></PropRow>
                  <PropRow label="Font"><SelField value={s.twoColRightFont || "'Raleway', sans-serif"} onChange={v => u({ twoColRightFont: v })} options={FONTS} /></PropRow>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <PropRow label="Size"><NumField value={s.twoColRightSize || 14} onChange={v => u({ twoColRightSize: v })} unit="px" min={10} max={48} /></PropRow>
                    <PropRow label="Weight"><SelField value={s.twoColRightWeight || "400"} onChange={v => u({ twoColRightWeight: v })} options={WEIGHTS} /></PropRow>
                  </div>
                  <PropRow label="Color"><ColorField value={s.twoColRightColor || "#CCCCCC"} onChange={v => u({ twoColRightColor: v })} /></PropRow>
                  <PropRow label="Alignment"><AlignField value={s.twoColRightAlign || "left"} onChange={v => u({ twoColRightAlign: v })} /></PropRow>
                </> : (
                  <PropRow label="Image URL"><TxtInput value={s.twoColRightImg || ""} onChange={v => u({ twoColRightImg: v })} placeholder="https://…" /></PropRow>
                )}
              </div>
            )}
          </PropSection>
        </>}

        {/* ── DIVIDER ── */}
        {s.type === "divider" && (
          <PropSection title="Divider Style">
            <PropRow label="Color"><ColorField value={s.dividerColor || "#393E46"} onChange={v => u({ dividerColor: v })} /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropRow label="Thickness"><NumField value={s.dividerThickness || 1} onChange={v => u({ dividerThickness: v })} unit="px" min={1} max={12} /></PropRow>
              <PropRow label="Width"><NumField value={s.dividerWidth || 80} onChange={v => u({ dividerWidth: v })} unit="%" min={10} max={100} /></PropRow>
            </div>
          </PropSection>
        )}

        {/* ── SPACER ── */}
        {s.type === "spacer" && (
          <PropSection title="Spacer">
            <PropRow label="Height"><NumField value={s.spacerHeight || 60} onChange={v => u({ spacerHeight: v })} unit="px" min={8} max={400} step={8} /></PropRow>
          </PropSection>
        )}

        {/* ── CTA content ── */}
        {s.type === "cta" && <>
          <PropSection title="Content">
            <PropRow label="Title"><TxtArea value={s.ctaTitle || ""} onChange={v => u({ ctaTitle: v })} rows={2} /></PropRow>
            <PropRow label="Subtitle"><TxtArea value={s.ctaSubtitle || ""} onChange={v => u({ ctaSubtitle: v })} rows={2} /></PropRow>
            <PropRow label="Price"><TxtInput value={s.ctaPrice || ""} onChange={v => u({ ctaPrice: v })} placeholder="$29.99" /></PropRow>
            <PropRow label="Button Text"><TxtInput value={s.ctaBtnText || ""} onChange={v => u({ ctaBtnText: v })} /></PropRow>
            <PropRow label="Button Color"><ColorField value={s.ctaBtnColor || "#FD7014"} onChange={v => u({ ctaBtnColor: v })} /></PropRow>
            <PropRow label="Button Text Color"><ColorField value={s.ctaBtnTextColor || "#ffffff"} onChange={v => u({ ctaBtnTextColor: v })} /></PropRow>
          </PropSection>
          <PropSection title="Typography">
            <PropRow label="Title Font"><SelField value={s.ctaTitleFont || "'Cinzel', serif"} onChange={v => u({ ctaTitleFont: v })} options={FONTS} /></PropRow>
            <PropRow label="Title Color"><ColorField value={s.ctaTitleColor || "#ffffff"} onChange={v => u({ ctaTitleColor: v })} /></PropRow>
            <PropRow label="Subtitle Color"><ColorField value={s.ctaSubtitleColor || "#AAAAAA"} onChange={v => u({ ctaSubtitleColor: v })} /></PropRow>
            <PropRow label="Alignment"><AlignField value={s.ctaAlign || "center"} onChange={v => u({ ctaAlign: v })} /></PropRow>
          </PropSection>
        </>}

      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function DesignerPage() {
  const [state, setState] = useState({ sections: INITIAL, history: [INITIAL], historyIdx: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [gameTitle, setGameTitle] = useState("Elden Throne");
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
  function addSection(type: SectionType) {
    const s = createSection(type);
    mutateSections([...sections, s]);
    setSelectedId(s.id);
    showToast(`Added: ${BLOCK_META[type]?.label}`);
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
    showToast("Block duplicated");
  }
  function deleteSection(i: number) {
    mutateSections(sections.filter((_, j) => j !== i));
    setSelectedId(null);
  }

  const selectedSection = sections.find(s => s.id === selectedId) ?? null;
  const deviceMax = device === "mobile" ? 375 : device === "tablet" ? 768 : undefined;

  return (
    <div className={styles.designerContainer}>

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          <Check size={12} style={{ color: "#4caf80" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* ── Top toolbar ── */}
      <div className={styles.topToolbar}>
        <HathorLogo height={20} width="auto" className={styles.logo} />
        <div className={styles.toolbarDivider} />
        <span className={styles.titleTag}>Page Designer</span>
        <div className={styles.toolbarDivider} />
        <input
          value={gameTitle} onChange={e => setGameTitle(e.target.value)}
          className={styles.gameTitleInput}
        />
        <div className={styles.toolbarSpacer} />

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
        <button onClick={undo} disabled={historyIdx <= 0}
          className={styles.iconActionBtn}
          title="Undo">
          <RotateCcw size={13} />
        </button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1}
          className={styles.iconActionBtn}
          title="Redo">
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
        <div className={styles.canvasArea} onClick={() => setSelectedId(null)}>
          {/* Page frame */}
          <div className={styles.canvasWrapper} style={{ maxWidth: deviceMax }} onClick={e => e.stopPropagation()}>
            {sections.length === 0 ? (
              <div className={styles.emptyCanvas}>
                <Layers size={40} style={{ opacity: 0.15 }} />
                <p style={{ fontWeight: 700 }}>Your page is empty</p>
                <p style={{ fontSize: 10, opacity: 0.5 }}>Click a block in the left panel to add it to your page</p>
              </div>
            ) : sections.map((s, i) => (
              <SectionWrapper
                key={s.id} section={s}
                selected={s.id === selectedId}
                isFirst={i === 0} isLast={i === sections.length - 1}
                onSelect={() => setSelectedId(s.id)}
                onMoveUp={() => moveUp(i)}
                onMoveDown={() => moveDown(i)}
                onDuplicate={() => duplicateSection(i)}
                onDelete={() => deleteSection(i)}
              />
            ))}
          </div>
        </div>

        {/* Right — properties */}
        <PropertiesPanel section={selectedSection} onChange={updateSection} />
      </div>
    </div>
  );
}
