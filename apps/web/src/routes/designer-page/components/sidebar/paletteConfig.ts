import {
  Type,
  Film,
  LayoutGrid,
  Minus,
  Image as ImageIcon,
  Award,
  MessageSquare,
  MonitorCheck,
  BarChart2,
  Users,
  ShoppingBag,
  Info,
  LucideIcon,
  ShoppingCart,
  Zap,
  Layers,
  Hash,
} from 'lucide-react';
import { SectionType, ElementType } from '../../types/designerTypes';

export const PALETTE: {
  group: string;
  items: { type: SectionType | ElementType; label: string; desc: string; Icon: LucideIcon }[];
}[] = [
  {
    group: 'Game Details Components',
    items: [
      {
        type: 'game-hero',
        label: 'Media Showcase',
        desc: 'Top hero slider & thumbnail strip',
        Icon: Film,
      },
      {
        type: 'game-header',
        label: 'Game Header',
        desc: 'Title, rating, dev, tags & synopsis',
        Icon: Award,
      },
      {
        type: 'system-reqs',
        label: 'System Reqs',
        desc: 'Min vs Recommended specifications',
        Icon: MonitorCheck,
      },
      {
        type: 'about-game',
        label: 'About Section',
        desc: 'Game lore, features & screenshots',
        Icon: Info,
      },
      {
        type: 'ownership-banner',
        label: 'Ownership Bar',
        desc: 'Owned status & buy/download actions',
        Icon: ShoppingBag,
      },
      {
        type: 'user-reviews',
        label: 'User Reviews',
        desc: 'Reviews list & star ratings',
        Icon: MessageSquare,
      },
      {
        type: 'recommendations',
        label: 'More Like This',
        desc: 'Recommended similar games grid',
        Icon: LayoutGrid,
      },
    ],
  },
  {
    group: 'Sidebar Components',
    items: [
      {
        type: 'sidebar-cta',
        label: 'Sidebar Purchase Card',
        desc: 'Price, discount & Add to Cart',
        Icon: ShoppingCart,
      },
      {
        type: 'sidebar-info',
        label: 'Sidebar Game Info',
        desc: 'Dev, publisher, date & platforms',
        Icon: Info,
      },
      {
        type: 'sidebar-ratings',
        label: 'Sidebar Ratings',
        desc: '5-star rating progress bars',
        Icon: BarChart2,
      },
      {
        type: 'sidebar-community',
        label: 'Sidebar Community',
        desc: 'Players count & positive rating %',
        Icon: Users,
      },
    ],
  },
  {
    group: 'Layout & Grids',
    items: [
      {
        type: 'grid',
        label: 'Multi-Column Layout',
        desc: 'Custom 1, 2, 3, or 4 column grid',
        Icon: LayoutGrid,
      },
      {
        type: 'two-col',
        label: 'Two Columns Preset',
        desc: 'Preset side-by-side content',
        Icon: Layers,
      },
    ],
  },
  {
    group: 'Media & Content',
    items: [
      { type: 'text', label: 'Text Block', desc: 'Paragraph or heading text', Icon: Type },
      { type: 'image', label: 'Image Block', desc: 'Single image / screenshot', Icon: ImageIcon },
      { type: 'features', label: 'Features Grid', desc: 'Icon feature cards', Icon: LayoutGrid },
      { type: 'cta', label: 'CTA Block', desc: 'Price & buy banner', Icon: Zap },
      { type: 'divider', label: 'Divider', desc: 'Horizontal divider line', Icon: Minus },
      { type: 'spacer', label: 'Spacer', desc: 'Vertical spacing block', Icon: Hash },
    ],
  },
];

export const BLOCK_META: Record<string, { label: string; Icon: LucideIcon }> = {
  'game-hero': { label: 'Media Showcase Hero', Icon: Film },
  'media-carousel': { label: 'Media Showcase', Icon: Film },
  'game-header': { label: 'Game Header', Icon: Award },
  'ownership-banner': { label: 'Ownership Bar', Icon: ShoppingBag },
  'about-game': { label: 'About Game', Icon: Info },
  'system-reqs': { label: 'System Reqs', Icon: MonitorCheck },
  'user-reviews': { label: 'User Reviews', Icon: MessageSquare },
  'sidebar-cta': { label: 'Sidebar Purchase Card', Icon: ShoppingCart },
  'sidebar-info': { label: 'Sidebar Game Info', Icon: Info },
  'sidebar-ratings': { label: 'Sidebar Ratings', Icon: BarChart2 },
  'sidebar-community': { label: 'Sidebar Community', Icon: Users },
  recommendations: { label: 'More Like This', Icon: LayoutGrid },
  text: { label: 'Text Block', Icon: Type },
  image: { label: 'Image Block', Icon: ImageIcon },
  carousel: { label: 'Carousel Showcase', Icon: Film },
  features: { label: 'Features Grid', Icon: LayoutGrid },
  'two-col': { label: 'Two Columns Preset', Icon: Layers },
  grid: { label: 'Multi-Column Layout', Icon: LayoutGrid },
  divider: { label: 'Divider', Icon: Minus },
  spacer: { label: 'Spacer', Icon: Hash },
  cta: { label: 'CTA Block', Icon: Zap },
};
