import fs from 'node:fs';
import path from 'node:path';
import { catalogDb, catalogPool } from './client.js';
import { games, genres, tags, gameTags, gameBuilds } from './schema.js';
import { uploadGameBuildPackage } from '../storage/r2Client.js';
import { eq, sql } from 'drizzle-orm';

const DEMO_CREATOR_ID = '00000000-0000-0000-0000-000000000001';

function getSeededZipBuffer(): Buffer {
  const candidatePaths = [
    path.resolve(process.cwd(), 'Desktop Goose v0.31.zip'),
    path.resolve(process.cwd(), '../../Desktop Goose v0.31.zip'),
    path.resolve(process.cwd(), '../Desktop Goose v0.31.zip'),
    'd:\\computer-science\\iti\\hathor\\Desktop Goose v0.31.zip',
    '/app/Desktop Goose v0.31.zip',
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      console.log(`Found seeded ZIP package at: ${p}`);
      return fs.readFileSync(p);
    }
  }

  console.log('Using default mock ZIP buffer for build package seeding...');
  return Buffer.from([
    0x50, 0x4b, 0x03, 0x04, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x67, 0x61,
    0x6d, 0x65, 0x2e, 0x62, 0x69, 0x6e, 0x50, 0x4b, 0x01, 0x02, 0x1e, 0x03, 0x0a, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xb8, 0x81, 0x00, 0x00, 0x00, 0x00,
    0x67, 0x61, 0x6d, 0x65, 0x2e, 0x62, 0x69, 0x6e, 0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x36, 0x00, 0x00, 0x00, 0x26, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset Theme Generators adhering strictly to ThemeDocument.json
// ─────────────────────────────────────────────────────────────────────────────

function createDefaultTheme(title: string, desc: string, aboutImg?: string) {
  return {
    theme: 'default',
    pageSettings: {
      bg: 'transparent',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Cinzel', serif",
      textFont: "'Raleway', sans-serif",
      accentColor: '#fd7014',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    pageBody: {
      bg: 'transparent',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Cinzel', serif",
      textFont: "'Raleway', sans-serif",
      accentColor: '#fd7014',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    sections: [],
    layout: {
      gameAbout: {
        sections: [
          {
            title: title.toUpperCase(),
            description: desc,
            ...(aboutImg ? { imageUrl: aboutImg } : {}),
          },
        ],
      },
    },
  };
}

function createCyberpunkTheme() {
  return {
    theme: 'custom',
    pageSettings: {
      bg: '#090d16',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Space Grotesk', sans-serif",
      textFont: "'Inter', sans-serif",
      accentColor: '#00f0ff',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    pageBody: {
      bg: '#090d16',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Space Grotesk', sans-serif",
      textFont: "'Inter', sans-serif",
      accentColor: '#00f0ff',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    sections: [
      {
        id: 'sec_cyber_hero',
        type: 'media-carousel',
        heroImages: [
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselImages: [
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselHeight: 500,
        showThumbnails: true,
        heroShadowColor: '#090d16',
        heroShadowEnabled: true,
      },
      {
        id: 'sec_cyber_grid',
        type: 'grid',
        gridGap: 32,
        gridTemplate: '2:1',
        pt: 24,
        pb: 32,
        gridCols: [
          {
            id: 'col_main_cyber',
            elements: [
              {
                id: 'el_cyber_header',
                type: 'game-header',
                headerBg: 'linear-gradient(180deg, #101726 0%, #0d121f 100%)',
                headerBorder: 'rgba(0, 240, 255, 0.3)',
                headerRadius: 8,
                titleColor: '#00f0ff',
                titleFont: "'Space Grotesk', sans-serif",
                subtitleColor: '#ec4899',
                descColor: '#94a3b8',
                tagBg: 'rgba(0, 240, 255, 0.12)',
                tagBorder: 'rgba(0, 240, 255, 0.4)',
                tagColor: '#00f0ff',
                starColor: '#00f0ff',
              },
              {
                id: 'el_cyber_about',
                type: 'about-game',
                aboutBg: '#101726',
                aboutBorder: 'rgba(0, 240, 255, 0.25)',
                aboutRadius: 8,
                aboutTitle: 'NEO-CAIRO SYNDICATE WARFARE',
                titleColor: '#00f0ff',
                titleFont: "'Space Grotesk', sans-serif",
                subTitleColor: '#ec4899',
                textColor: '#94a3b8',
                aboutSections: [
                  {
                    title: 'NEURAL AUGMENTATIONS & COMBAT RIGS',
                    text: 'Overclock your synaptic reflexes and splice military combat subroutines to master high-velocity blade parries and smart projectile targeting.',
                    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
                  },
                  {
                    title: 'SUBTERRANEAN SYNDICATE HEISTS',
                    text: 'Infiltrate corporate mega-towers, bypass biometric sensor grids, and extract forbidden AI cores before strike teams breach the facility.',
                    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
                  },
                ],
              },
              {
                id: 'el_cyber_reqs',
                type: 'system-reqs',
                reqsCardBg: '#101726',
                reqsCardBorder: 'rgba(0, 240, 255, 0.25)',
                titleColor: '#00f0ff',
                reqsTitle: 'CYBERDECK HARDWARE SPECS',
                titleFont: "'Space Grotesk', sans-serif",
                accentColor: '#00f0ff',
                labelColor: '#64748b',
                valueColor: '#f8fafc',
              },
              {
                id: 'el_cyber_reviews',
                type: 'user-reviews',
                reviewCardBg: '#101726',
                reviewCardBorder: 'rgba(0, 240, 255, 0.25)',
                reviewCardRadius: 8,
                reviewHeader: 'STREET OPERATIVE LOGS',
                reviewNameFont: "'Space Grotesk', sans-serif",
                reviewNameColor: '#00f0ff',
                reviewBodyColor: '#94a3b8',
                reviewStarColor: '#00f0ff',
              },
            ],
          },
          {
            id: 'col_side_cyber',
            elements: [
              {
                id: 'el_cyber_cta',
                type: 'sidebar-cta',
                sideCardBg: '#101726',
                sideCardBorder: 'rgba(0, 240, 255, 0.35)',
                unownedPrimaryBtnBg: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
                unownedPrimaryBtnText: 'JACK IN NOW',
                ownedPrimaryBtnBg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                ownedPrimaryBtnText: 'RESUME LINK',
              },
              {
                id: 'el_cyber_info',
                type: 'sidebar-info',
                infoCardBg: '#101726',
                infoCardBorder: 'rgba(0, 240, 255, 0.25)',
                infoTitle: 'SYNDICATE INTEL',
                infoTitleColor: '#00f0ff',
                infoLabelColor: '#64748b',
                infoValueColor: '#f8fafc',
              },
              {
                id: 'el_cyber_ratings',
                type: 'sidebar-ratings',
                ratingsCardBg: '#101726',
                ratingsCardBorder: 'rgba(0, 240, 255, 0.25)',
                ratingsTitle: 'NETWORK VERDICTS',
                ratingsTitleColor: '#00f0ff',
                ratingsFillColor: '#00f0ff',
                ratingsLabelColor: '#64748b',
                ratingsValueColor: '#f8fafc',
              },
              {
                id: 'el_cyber_comm',
                type: 'sidebar-community',
                communityCardBg: '#101726',
                communityCardBorder: 'rgba(0, 240, 255, 0.25)',
                communityTitle: 'ACTIVE NETRUNNERS',
                communityTitleColor: '#00f0ff',
                communityLabelColor: '#64748b',
                communityValueColor: '#f8fafc',
                communityRatingColor: '#00f0ff',
              },
            ],
          },
        ],
      },
      {
        id: 'sec_cyber_features',
        type: 'features',
        featuresTitle: 'AUGMENTATION MODULES',
        featuresTitleColor: '#00f0ff',
        featuresCardBg: '#101726',
        featuresCardBorder: 'rgba(0, 240, 255, 0.3)',
        featuresCols: 4,
        featuresItems: [
          {
            icon: '⚡',
            title: 'Neural Overclock',
            desc: 'Boost tactical processing speed by 300% during critical gunfights.',
            color: '#00f0ff',
          },
          {
            icon: '👁️',
            title: 'Optical Threat Radar',
            desc: 'Detect enemy movement through reinforced titanium walls.',
            color: '#ec4899',
          },
          {
            icon: '🛡️',
            title: 'Subdermal Plating',
            desc: 'Deflect high-caliber ballistic rounds with kinetic dispersion.',
            color: '#38bdf8',
          },
          {
            icon: '💾',
            title: 'ICE Breaker Protocol',
            desc: 'Hijack enemy robotic drones and weapon turrets remotely.',
            color: '#a855f7',
          },
        ],
      },
      {
        id: 'sec_cyber_cta_bottom',
        type: 'cta',
        ctaTitle: 'JOIN THE METROPOLITAN REBELLION',
        ctaSubtitle: 'Equip your cyberdeck and reclaim the neon underworld.',
        ctaBg: 'linear-gradient(135deg, #101726 0%, #172033 50%, #0d121f 100%)',
        ctaBorder: 'rgba(0, 240, 255, 0.35)',
        ctaTitleColor: '#00f0ff',
        ctaSubtitleColor: '#94a3b8',
        ctaBtnColor: '#00f0ff',
        ctaBtnTextColor: '#090d16',
        ctaBtnText: 'DEPLOY OPERATIVE',
        ctaPrice: 'ELITE ACCESS',
      },
      {
        id: 'sec_cyber_recs',
        type: 'recommendations',
        recsTitle: 'MORE CYBERNETIC TITLES',
        recsCardBg: '#101726',
        recsCardBorder: 'rgba(0, 240, 255, 0.25)',
      },
    ],
    layout: {},
  };
}

function createEgyptianTheme() {
  return {
    theme: 'custom',
    pageSettings: {
      bg: '#18120b',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Cinzel', serif",
      textFont: "'Raleway', sans-serif",
      accentColor: '#d4af37',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    pageBody: {
      bg: '#18120b',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Cinzel', serif",
      textFont: "'Raleway', sans-serif",
      accentColor: '#d4af37',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    sections: [
      {
        id: 'sec_egypt_hero',
        type: 'media-carousel',
        heroImages: [
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselImages: [
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselHeight: 520,
        showThumbnails: true,
        heroShadowColor: '#18120b',
        heroShadowEnabled: true,
      },
      {
        id: 'sec_egypt_grid',
        type: 'grid',
        gridGap: 32,
        gridTemplate: '2:1',
        pt: 24,
        pb: 32,
        gridCols: [
          {
            id: 'col_main_egypt',
            elements: [
              {
                id: 'el_egypt_header',
                type: 'game-header',
                headerBg: 'linear-gradient(180deg, #241a10 0%, #1d150d 100%)',
                headerBorder: 'rgba(212, 175, 55, 0.3)',
                headerRadius: 6,
                titleColor: '#d4af37',
                titleFont: "'Cinzel', serif",
                subtitleColor: '#f59e0b',
                descColor: '#d1bda5',
                tagBg: 'rgba(212, 175, 55, 0.12)',
                tagBorder: 'rgba(212, 175, 55, 0.4)',
                tagColor: '#d4af37',
                starColor: '#d4af37',
              },
              {
                id: 'el_egypt_about',
                type: 'about-game',
                aboutBg: '#241a10',
                aboutBorder: 'rgba(212, 175, 55, 0.25)',
                aboutRadius: 6,
                aboutTitle: 'DYNASTIES OF THE NILE VALLEY',
                titleColor: '#d4af37',
                titleFont: "'Cinzel', serif",
                subTitleColor: '#f59e0b',
                textColor: '#d1bda5',
                aboutSections: [
                  {
                    title: 'STRATEGIC DESERT EXPEDITIONS',
                    text: 'Deploy royal chariots, seasoned Nubian archers, and sacred obelisk siege engines to conquer rival provinces along the sacred waters.',
                    img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
                  },
                  {
                    title: 'DIVINE FAVOR OF RA & OSIRIS',
                    text: 'Consecrate majestic golden temples to receive miraculous weather boons, bountiful Nile harvests, and divine tactical interventions.',
                    img: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
                  },
                ],
              },
              {
                id: 'el_egypt_reqs',
                type: 'system-reqs',
                reqsCardBg: '#241a10',
                reqsCardBorder: 'rgba(212, 175, 55, 0.25)',
                titleColor: '#d4af37',
                reqsTitle: 'TABLETS OF SYSTEM SPECIFICATIONS',
                titleFont: "'Cinzel', serif",
                accentColor: '#d4af37',
                labelColor: '#a8947f',
                valueColor: '#fffbeb',
              },
              {
                id: 'el_egypt_reviews',
                type: 'user-reviews',
                reviewCardBg: '#241a10',
                reviewCardBorder: 'rgba(212, 175, 55, 0.25)',
                reviewCardRadius: 6,
                reviewHeader: 'TESTIMONIALS OF THE SCRIBES',
                reviewNameFont: "'Cinzel', serif",
                reviewNameColor: '#d4af37',
                reviewBodyColor: '#d1bda5',
                reviewStarColor: '#d4af37',
              },
            ],
          },
          {
            id: 'col_side_egypt',
            elements: [
              {
                id: 'el_egypt_cta',
                type: 'sidebar-cta',
                sideCardBg: '#241a10',
                sideCardBorder: 'rgba(212, 175, 55, 0.35)',
                unownedPrimaryBtnBg: 'linear-gradient(135deg, #d4af37 0%, #b45309 100%)',
                unownedPrimaryBtnText: 'CLAIM THE CROWN',
                ownedPrimaryBtnBg: 'linear-gradient(135deg, #a16207 0%, #78350f 100%)',
                ownedPrimaryBtnText: 'ENTER THE TEMPLE',
              },
              {
                id: 'el_egypt_info',
                type: 'sidebar-info',
                infoCardBg: '#241a10',
                infoCardBorder: 'rgba(212, 175, 55, 0.25)',
                infoTitle: 'ROYAL ARCHIVES',
                infoTitleColor: '#d4af37',
                infoLabelColor: '#a8947f',
                infoValueColor: '#fffbeb',
              },
              {
                id: 'el_egypt_ratings',
                type: 'sidebar-ratings',
                ratingsCardBg: '#241a10',
                ratingsCardBorder: 'rgba(212, 175, 55, 0.25)',
                ratingsTitle: 'ORACLE VERDICTS',
                ratingsTitleColor: '#d4af37',
                ratingsFillColor: '#d4af37',
                ratingsLabelColor: '#a8947f',
                ratingsValueColor: '#fffbeb',
              },
              {
                id: 'el_egypt_comm',
                type: 'sidebar-community',
                communityCardBg: '#241a10',
                communityCardBorder: 'rgba(212, 175, 55, 0.25)',
                communityTitle: 'PHARAONIC GUILDS',
                communityTitleColor: '#d4af37',
                communityLabelColor: '#a8947f',
                communityValueColor: '#fffbeb',
                communityRatingColor: '#d4af37',
              },
            ],
          },
        ],
      },
      {
        id: 'sec_egypt_features',
        type: 'features',
        featuresTitle: 'PILLARS OF EMPIRE',
        featuresTitleColor: '#d4af37',
        featuresCardBg: '#241a10',
        featuresCardBorder: 'rgba(212, 175, 55, 0.3)',
        featuresCols: 4,
        featuresItems: [
          {
            icon: '🏛️',
            title: 'Monument Construction',
            desc: 'Erect pyramids and sphinxes to magnify cultural dominance.',
            color: '#d4af37',
          },
          {
            icon: '🏺',
            title: 'Papyrus Diplomacy',
            desc: 'Forge trade treaties and pacts across Mediterranean city-states.',
            color: '#f59e0b',
          },
          {
            icon: '⚔️',
            title: 'Hex-Grid Tactics',
            desc: 'Outflank rival pharaohs with tactical terrain elevation mechanics.',
            color: '#d97706',
          },
          {
            icon: '🌾',
            title: 'Nile Inundation',
            desc: 'Manage seasonal flood cycles for unprecedented empire wealth.',
            color: '#ca8a04',
          },
        ],
      },
      {
        id: 'sec_egypt_cta_bottom',
        type: 'cta',
        ctaTitle: 'FORGE AN ETERNAL DYNASTY',
        ctaSubtitle: 'Ascend the throne and lead your empire across thousands of years.',
        ctaBg: 'linear-gradient(135deg, #241a10 0%, #2e2114 50%, #1d150d 100%)',
        ctaBorder: 'rgba(212, 175, 55, 0.35)',
        ctaTitleColor: '#d4af37',
        ctaSubtitleColor: '#d1bda5',
        ctaBtnColor: '#d4af37',
        ctaBtnTextColor: '#18120b',
        ctaBtnText: 'COMMAND THE LEGIONS',
        ctaPrice: 'ROYAL EDITION',
      },
      {
        id: 'sec_egypt_recs',
        type: 'recommendations',
        recsTitle: 'MORE ANCIENT STRATEGY SAGA',
        recsCardBg: '#241a10',
        recsCardBorder: 'rgba(212, 175, 55, 0.25)',
      },
    ],
    layout: {},
  };
}

function createDarkFantasyTheme() {
  return {
    theme: 'custom',
    pageSettings: {
      bg: '#0c0a10',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Cinzel', serif",
      textFont: "'Raleway', sans-serif",
      accentColor: '#e11d48',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    pageBody: {
      bg: '#0c0a10',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Cinzel', serif",
      textFont: "'Raleway', sans-serif",
      accentColor: '#e11d48',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    sections: [
      {
        id: 'sec_gothic_hero',
        type: 'media-carousel',
        heroImages: [
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselImages: [
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselHeight: 500,
        showThumbnails: true,
        heroShadowColor: '#0c0a10',
        heroShadowEnabled: true,
      },
      {
        id: 'sec_gothic_grid',
        type: 'grid',
        gridGap: 32,
        gridTemplate: '2:1',
        pt: 24,
        pb: 32,
        gridCols: [
          {
            id: 'col_main_gothic',
            elements: [
              {
                id: 'el_gothic_header',
                type: 'game-header',
                headerBg: 'linear-gradient(180deg, #16121d 0%, #110d18 100%)',
                headerBorder: 'rgba(225, 29, 72, 0.3)',
                headerRadius: 4,
                titleColor: '#f43f5e',
                titleFont: "'Cinzel', serif",
                subtitleColor: '#fb7185',
                descColor: '#cbd5e1',
                tagBg: 'rgba(225, 29, 72, 0.12)',
                tagBorder: 'rgba(225, 29, 72, 0.4)',
                tagColor: '#fb7185',
                starColor: '#f43f5e',
              },
              {
                id: 'el_gothic_about',
                type: 'about-game',
                aboutBg: '#16121d',
                aboutBorder: 'rgba(225, 29, 72, 0.25)',
                aboutRadius: 4,
                aboutTitle: 'TALES FROM THE SHADOW CITADEL',
                titleColor: '#f43f5e',
                titleFont: "'Cinzel', serif",
                subTitleColor: '#fb7185',
                textColor: '#cbd5e1',
                aboutSections: [
                  {
                    title: 'PUNISHING DARK COMBAT',
                    text: 'Master visceral melee parries, high-risk blood magic spells, and relentless counter-attacks against corrupted gothic horrors.',
                    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
                  },
                ],
              },
              {
                id: 'el_gothic_reqs',
                type: 'system-reqs',
                reqsCardBg: '#16121d',
                reqsCardBorder: 'rgba(225, 29, 72, 0.25)',
                titleColor: '#f43f5e',
                reqsTitle: 'TRIAL OF SYSTEM HARDWARE',
                titleFont: "'Cinzel', serif",
                accentColor: '#e11d48',
                labelColor: '#94a3b8',
                valueColor: '#f8fafc',
              },
              {
                id: 'el_gothic_reviews',
                type: 'user-reviews',
                reviewCardBg: '#16121d',
                reviewCardBorder: 'rgba(225, 29, 72, 0.25)',
                reviewCardRadius: 4,
                reviewHeader: 'WHISPERS OF FALLEN WARRIORS',
                reviewNameFont: "'Cinzel', serif",
                reviewNameColor: '#f43f5e',
                reviewBodyColor: '#cbd5e1',
                reviewStarColor: '#f43f5e',
              },
            ],
          },
          {
            id: 'col_side_gothic',
            elements: [
              {
                id: 'el_gothic_cta',
                type: 'sidebar-cta',
                sideCardBg: '#16121d',
                sideCardBorder: 'rgba(225, 29, 72, 0.35)',
                unownedPrimaryBtnBg: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
                unownedPrimaryBtnText: 'EMBRACE THE DARKNESS',
                ownedPrimaryBtnBg: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)',
                ownedPrimaryBtnText: 'RETURN TO CITADEL',
              },
              {
                id: 'el_gothic_info',
                type: 'sidebar-info',
                infoCardBg: '#16121d',
                infoCardBorder: 'rgba(225, 29, 72, 0.25)',
                infoTitle: 'CITADEL CHRONICLES',
                infoTitleColor: '#f43f5e',
                infoLabelColor: '#94a3b8',
                infoValueColor: '#f8fafc',
              },
              {
                id: 'el_gothic_ratings',
                type: 'sidebar-ratings',
                ratingsCardBg: '#16121d',
                ratingsCardBorder: 'rgba(225, 29, 72, 0.25)',
                ratingsTitle: 'SANITY METRICS',
                ratingsTitleColor: '#f43f5e',
                ratingsFillColor: '#e11d48',
                ratingsLabelColor: '#94a3b8',
                ratingsValueColor: '#f8fafc',
              },
              {
                id: 'el_gothic_comm',
                type: 'sidebar-community',
                communityCardBg: '#16121d',
                communityCardBorder: 'rgba(225, 29, 72, 0.25)',
                communityTitle: 'COVEN SANCTUM',
                communityTitleColor: '#f43f5e',
                communityLabelColor: '#94a3b8',
                communityValueColor: '#f8fafc',
                communityRatingColor: '#e11d48',
              },
            ],
          },
        ],
      },
      {
        id: 'sec_gothic_features',
        type: 'features',
        featuresTitle: 'FORBIDDEN DISCIPLINES',
        featuresTitleColor: '#f43f5e',
        featuresCardBg: '#16121d',
        featuresCardBorder: 'rgba(225, 29, 72, 0.3)',
        featuresCols: 4,
        featuresItems: [
          {
            icon: '🩸',
            title: 'Blood Siphon',
            desc: 'Convert inflicted damage into vitality to sustain intense combat flow.',
            color: '#e11d48',
          },
          {
            icon: '🗡️',
            title: 'Cursed Blades',
            desc: 'Forge weapons tempered in the abyss that shatter beast armor.',
            color: '#f43f5e',
          },
          {
            icon: '🕯️',
            title: 'Sanctuary Runes',
            desc: 'Establish consecrated bonfires to replenish holy flask charges.',
            color: '#fb7185',
          },
          {
            icon: '💀',
            title: 'Soul Severance',
            desc: 'Extract demonic essences to unlock forgotten dark arts.',
            color: '#be123c',
          },
        ],
      },
      {
        id: 'sec_gothic_cta_bottom',
        type: 'cta',
        ctaTitle: 'CONQUER THE CORRUPTED ABYSS',
        ctaSubtitle: 'Take up your blade and challenge towering nightmare leviathans.',
        ctaBg: 'linear-gradient(135deg, #16121d 0%, #20182b 50%, #110d18 100%)',
        ctaBorder: 'rgba(225, 29, 72, 0.35)',
        ctaTitleColor: '#f43f5e',
        ctaSubtitleColor: '#cbd5e1',
        ctaBtnColor: '#e11d48',
        ctaBtnTextColor: '#ffffff',
        ctaBtnText: 'ENTER THE ABYSS',
        ctaPrice: 'DARK DELUXE',
      },
      {
        id: 'sec_gothic_recs',
        type: 'recommendations',
        recsTitle: 'MORE DARK FANTASY CRUCIBLES',
        recsCardBg: '#16121d',
        recsCardBorder: 'rgba(225, 29, 72, 0.25)',
      },
    ],
    layout: {},
  };
}

function createSciFiTheme() {
  return {
    theme: 'custom',
    pageSettings: {
      bg: '#070b19',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Space Grotesk', sans-serif",
      textFont: "'Inter', sans-serif",
      accentColor: '#06b6d4',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    pageBody: {
      bg: '#070b19',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Space Grotesk', sans-serif",
      textFont: "'Inter', sans-serif",
      accentColor: '#06b6d4',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    sections: [
      {
        id: 'sec_scifi_hero',
        type: 'media-carousel',
        heroImages: [
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselImages: [
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselHeight: 480,
        showThumbnails: true,
        heroShadowColor: '#070b19',
        heroShadowEnabled: true,
      },
      {
        id: 'sec_scifi_grid',
        type: 'grid',
        gridGap: 32,
        gridTemplate: '2:1',
        pt: 24,
        pb: 32,
        gridCols: [
          {
            id: 'col_main_scifi',
            elements: [
              {
                id: 'el_scifi_header',
                type: 'game-header',
                headerBg: 'linear-gradient(180deg, #0e1630 0%, #0a1024 100%)',
                headerBorder: 'rgba(6, 182, 212, 0.3)',
                headerRadius: 8,
                titleColor: '#06b6d4',
                titleFont: "'Space Grotesk', sans-serif",
                subtitleColor: '#38bdf8',
                descColor: '#94a3b8',
                tagBg: 'rgba(6, 182, 212, 0.12)',
                tagBorder: 'rgba(6, 182, 212, 0.4)',
                tagColor: '#06b6d4',
                starColor: '#06b6d4',
              },
              {
                id: 'el_scifi_about',
                type: 'about-game',
                aboutBg: '#0e1630',
                aboutBorder: 'rgba(6, 182, 212, 0.25)',
                aboutRadius: 8,
                aboutTitle: 'INTERSTELLAR COLONIZATION MISSION',
                titleColor: '#06b6d4',
                titleFont: "'Space Grotesk', sans-serif",
                subTitleColor: '#38bdf8',
                textColor: '#94a3b8',
                aboutSections: [
                  {
                    title: 'ORBITAL SPACE STATION LOGISTICS',
                    text: 'Construct massive ring habitats, optimize plasma reactor fuel cycles, and establish interstellar trade hyperlanes across solar systems.',
                    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
                  },
                ],
              },
              {
                id: 'el_scifi_reqs',
                type: 'system-reqs',
                reqsCardBg: '#0e1630',
                reqsCardBorder: 'rgba(6, 182, 212, 0.25)',
                titleColor: '#06b6d4',
                reqsTitle: 'ORBITAL SIMULATION HARDWARE',
                titleFont: "'Space Grotesk', sans-serif",
                accentColor: '#06b6d4',
                labelColor: '#64748b',
                valueColor: '#f8fafc',
              },
              {
                id: 'el_scifi_reviews',
                type: 'user-reviews',
                reviewCardBg: '#0e1630',
                reviewCardBorder: 'rgba(6, 182, 212, 0.25)',
                reviewCardRadius: 8,
                reviewHeader: 'STATION COMMANDER TRANSMISSIONS',
                reviewNameFont: "'Space Grotesk', sans-serif",
                reviewNameColor: '#06b6d4',
                reviewBodyColor: '#94a3b8',
                reviewStarColor: '#06b6d4',
              },
            ],
          },
          {
            id: 'col_side_scifi',
            elements: [
              {
                id: 'el_scifi_cta',
                type: 'sidebar-cta',
                sideCardBg: '#0e1630',
                sideCardBorder: 'rgba(6, 182, 212, 0.35)',
                unownedPrimaryBtnBg: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                unownedPrimaryBtnText: 'INITIALIZE ORBIT',
                ownedPrimaryBtnBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                ownedPrimaryBtnText: 'CONNECT TELEMETRY',
              },
              {
                id: 'el_scifi_info',
                type: 'sidebar-info',
                infoCardBg: '#0e1630',
                infoCardBorder: 'rgba(6, 182, 212, 0.25)',
                infoTitle: 'FLIGHT TELEMETRY',
                infoTitleColor: '#06b6d4',
                infoLabelColor: '#64748b',
                infoValueColor: '#f8fafc',
              },
              {
                id: 'el_scifi_ratings',
                type: 'sidebar-ratings',
                ratingsCardBg: '#0e1630',
                ratingsCardBorder: 'rgba(6, 182, 212, 0.25)',
                ratingsTitle: 'COLONY SURVEYS',
                ratingsTitleColor: '#06b6d4',
                ratingsFillColor: '#06b6d4',
                ratingsLabelColor: '#64748b',
                ratingsValueColor: '#f8fafc',
              },
              {
                id: 'el_scifi_comm',
                type: 'sidebar-community',
                communityCardBg: '#0e1630',
                communityCardBorder: 'rgba(6, 182, 212, 0.25)',
                communityTitle: 'DEEP SPACE NETWORK',
                communityTitleColor: '#06b6d4',
                communityLabelColor: '#64748b',
                communityValueColor: '#f8fafc',
                communityRatingColor: '#06b6d4',
              },
            ],
          },
        ],
      },
      {
        id: 'sec_scifi_features',
        type: 'features',
        featuresTitle: 'ORBITAL INFRASTRUCTURE',
        featuresTitleColor: '#06b6d4',
        featuresCardBg: '#0e1630',
        featuresCardBorder: 'rgba(6, 182, 212, 0.3)',
        featuresCols: 4,
        featuresItems: [
          {
            icon: '🚀',
            title: 'Warp Gate Relay',
            desc: 'Connect distant star systems for seamless intergalactic transit.',
            color: '#06b6d4',
          },
          {
            icon: '🛰️',
            title: 'Orbital Mining Arrays',
            desc: 'Extract rare isotope fuels from high-density asteroid belts.',
            color: '#38bdf8',
          },
          {
            icon: '🧬',
            title: 'Bio-Dome Habitats',
            desc: 'Cultivate oxygen-rich atmospheres on frozen sub-surface moons.',
            color: '#22d3ee',
          },
          {
            icon: '⚡',
            title: 'Fusion Power Grids',
            desc: 'Generate gigawatts of clean energy using planetary magnetospheres.',
            color: '#60a5fa',
          },
        ],
      },
      {
        id: 'sec_scifi_cta_bottom',
        type: 'cta',
        ctaTitle: 'COMMENCE YOUR DEEP SPACE VOYAGE',
        ctaSubtitle: 'Command the greatest interstellar expedition in human history.',
        ctaBg: 'linear-gradient(135deg, #0e1630 0%, #16234d 50%, #0a1024 100%)',
        ctaBorder: 'rgba(6, 182, 212, 0.35)',
        ctaTitleColor: '#06b6d4',
        ctaSubtitleColor: '#94a3b8',
        ctaBtnColor: '#06b6d4',
        ctaBtnTextColor: '#070b19',
        ctaBtnText: 'LAUNCH EXPEDITION',
        ctaPrice: 'COMMAND ACCESS',
      },
      {
        id: 'sec_scifi_recs',
        type: 'recommendations',
        recsTitle: 'MORE INTERSTELLAR EXPEDITIONS',
        recsCardBg: '#0e1630',
        recsCardBorder: 'rgba(6, 182, 212, 0.25)',
      },
    ],
    layout: {},
  };
}

function createRetroPixelTheme() {
  return {
    theme: 'custom',
    pageSettings: {
      bg: '#140b24',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: 'monospace',
      textFont: 'monospace',
      accentColor: '#22c55e',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    pageBody: {
      bg: '#140b24',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: 'monospace',
      textFont: 'monospace',
      accentColor: '#22c55e',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    sections: [
      {
        id: 'sec_retro_hero',
        type: 'media-carousel',
        heroImages: [
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselImages: [
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselHeight: 460,
        showThumbnails: true,
        heroShadowColor: '#140b24',
        heroShadowEnabled: true,
      },
      {
        id: 'sec_retro_grid',
        type: 'grid',
        gridGap: 32,
        gridTemplate: '2:1',
        pt: 24,
        pb: 32,
        gridCols: [
          {
            id: 'col_main_retro',
            elements: [
              {
                id: 'el_retro_header',
                type: 'game-header',
                headerBg: 'linear-gradient(180deg, #1f1138 0%, #180d2c 100%)',
                headerBorder: 'rgba(34, 197, 94, 0.35)',
                headerRadius: 0,
                titleColor: '#22c55e',
                titleFont: 'monospace',
                subtitleColor: '#4ade80',
                descColor: '#cbd5e1',
                tagBg: 'rgba(34, 197, 94, 0.12)',
                tagBorder: 'rgba(34, 197, 94, 0.4)',
                tagColor: '#22c55e',
                starColor: '#22c55e',
              },
              {
                id: 'el_retro_about',
                type: 'about-game',
                aboutBg: '#1f1138',
                aboutBorder: 'rgba(34, 197, 94, 0.25)',
                aboutRadius: 0,
                aboutTitle: '>> PROCEDURAL 8-BIT DUNGEON GUIDE',
                titleColor: '#22c55e',
                titleFont: 'monospace',
                subTitleColor: '#4ade80',
                textColor: '#cbd5e1',
                aboutSections: [
                  {
                    title: 'CLASSIC ROGUELIKE ACTION',
                    text: 'Explore procedurally generated dungeon chambers filled with traps, cursed mimic chests, and rare 16-bit weapons.',
                    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
                  },
                ],
              },
              {
                id: 'el_retro_reqs',
                type: 'system-reqs',
                reqsCardBg: '#1f1138',
                reqsCardBorder: 'rgba(34, 197, 94, 0.25)',
                titleColor: '#22c55e',
                reqsTitle: '>> ARCADE HARDWARE REQUIREMENTS',
                titleFont: 'monospace',
                accentColor: '#22c55e',
                labelColor: '#94a3b8',
                valueColor: '#f8fafc',
              },
              {
                id: 'el_retro_reviews',
                type: 'user-reviews',
                reviewCardBg: '#1f1138',
                reviewCardBorder: 'rgba(34, 197, 94, 0.25)',
                reviewCardRadius: 0,
                reviewHeader: '>> PLAYER HIGHSCORES & LOGS',
                reviewNameFont: 'monospace',
                reviewNameColor: '#22c55e',
                reviewBodyColor: '#cbd5e1',
                reviewStarColor: '#22c55e',
              },
            ],
          },
          {
            id: 'col_side_retro',
            elements: [
              {
                id: 'el_retro_cta',
                type: 'sidebar-cta',
                sideCardBg: '#1f1138',
                sideCardBorder: 'rgba(34, 197, 94, 0.35)',
                unownedPrimaryBtnBg: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                unownedPrimaryBtnText: 'INSERT COIN / PLAY',
                ownedPrimaryBtnBg: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
                ownedPrimaryBtnText: 'CONTINUE RUN',
              },
              {
                id: 'el_retro_info',
                type: 'sidebar-info',
                infoCardBg: '#1f1138',
                infoCardBorder: 'rgba(34, 197, 94, 0.25)',
                infoTitle: 'CARTRIDGE INTEL',
                infoTitleColor: '#22c55e',
                infoLabelColor: '#94a3b8',
                infoValueColor: '#f8fafc',
              },
              {
                id: 'el_retro_ratings',
                type: 'sidebar-ratings',
                ratingsCardBg: '#1f1138',
                ratingsCardBorder: 'rgba(34, 197, 94, 0.25)',
                ratingsTitle: 'CRIT SCORE',
                ratingsTitleColor: '#22c55e',
                ratingsFillColor: '#22c55e',
                ratingsLabelColor: '#94a3b8',
                ratingsValueColor: '#f8fafc',
              },
              {
                id: 'el_retro_comm',
                type: 'sidebar-community',
                communityCardBg: '#1f1138',
                communityCardBorder: 'rgba(34, 197, 94, 0.25)',
                communityTitle: 'SPEEDRUN LOBBY',
                communityTitleColor: '#22c55e',
                communityLabelColor: '#94a3b8',
                communityValueColor: '#f8fafc',
                communityRatingColor: '#22c55e',
              },
            ],
          },
        ],
      },
      {
        id: 'sec_retro_features',
        type: 'features',
        featuresTitle: '>> RETRO MECHANICS',
        featuresTitleColor: '#22c55e',
        featuresCardBg: '#1f1138',
        featuresCardBorder: 'rgba(34, 197, 94, 0.3)',
        featuresCols: 4,
        featuresItems: [
          {
            icon: '👾',
            title: 'Over 100 Monsters',
            desc: 'Encounter unique retro enemies and handcrafted pixel bosses.',
            color: '#22c55e',
          },
          {
            icon: '🗝️',
            title: 'Secret Vaults',
            desc: 'Solve block-pushing puzzles to unearth hidden legendary loot.',
            color: '#4ade80',
          },
          {
            icon: '🧪',
            title: 'Alchemical Brewing',
            desc: 'Mix mystery potions with unpredictable wild magic effects.',
            color: '#86efac',
          },
          {
            icon: '🏆',
            title: 'Permadeath Mode',
            desc: 'Risk everything on unforgiving high-stakes dungeon runs.',
            color: '#16a34a',
          },
        ],
      },
      {
        id: 'sec_retro_cta_bottom',
        type: 'cta',
        ctaTitle: 'START YOUR 8-BIT QUEST TODAY',
        ctaSubtitle: 'Grab your sword, prepare your potions, and descend into the dungeon.',
        ctaBg: 'linear-gradient(135deg, #1f1138 0%, #2a184c 50%, #180d2c 100%)',
        ctaBorder: 'rgba(34, 197, 94, 0.35)',
        ctaTitleColor: '#22c55e',
        ctaSubtitleColor: '#cbd5e1',
        ctaBtnColor: '#22c55e',
        ctaBtnTextColor: '#140b24',
        ctaBtnText: 'PRESS START',
        ctaPrice: '1-CREDIT',
      },
      {
        id: 'sec_retro_recs',
        type: 'recommendations',
        recsTitle: '>> MORE PIXEL-ART ADVENTURES',
        recsCardBg: '#1f1138',
        recsCardBorder: 'rgba(34, 197, 94, 0.25)',
      },
    ],
    layout: {},
  };
}

function createDragonTheme() {
  return {
    theme: 'custom',
    pageSettings: {
      bg: '#140b0b',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Cinzel', serif",
      textFont: "'Raleway', sans-serif",
      accentColor: '#ef4444',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    pageBody: {
      bg: '#140b0b',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgAttachment: 'scroll',
      bgOverlay: 'transparent',
      bgOverlayOpacity: 0,
      titleFont: "'Cinzel', serif",
      textFont: "'Raleway', sans-serif",
      accentColor: '#ef4444',
      padTop: 0,
      padBottom: 48,
      padLeft: 0,
      padRight: 0,
      containerWidth: 1280,
    },
    sections: [
      {
        id: 'sec_dragon_hero',
        type: 'media-carousel',
        heroImages: [
          'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselImages: [
          'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1600&auto=format&fit=crop',
        ],
        carouselHeight: 520,
        showThumbnails: true,
        heroShadowColor: '#140b0b',
        heroShadowEnabled: true,
      },
      {
        id: 'sec_dragon_grid',
        type: 'grid',
        gridGap: 32,
        gridTemplate: '2:1',
        pt: 24,
        pb: 32,
        gridCols: [
          {
            id: 'col_main_dragon',
            elements: [
              {
                id: 'el_dragon_header',
                type: 'game-header',
                headerBg: 'linear-gradient(180deg, #201010 0%, #180c0c 100%)',
                headerBorder: 'rgba(239, 68, 68, 0.3)',
                headerRadius: 6,
                titleColor: '#ef4444',
                titleFont: "'Cinzel', serif",
                subtitleColor: '#f87171',
                descColor: '#e2e8f0',
                tagBg: 'rgba(239, 68, 68, 0.12)',
                tagBorder: 'rgba(239, 68, 68, 0.4)',
                tagColor: '#ef4444',
                starColor: '#ef4444',
              },
              {
                id: 'el_dragon_about',
                type: 'about-game',
                aboutBg: '#201010',
                aboutBorder: 'rgba(239, 68, 68, 0.25)',
                aboutRadius: 6,
                aboutTitle: 'CHRONICLES OF THE ELDER WYRMS',
                titleColor: '#ef4444',
                titleFont: "'Cinzel', serif",
                subTitleColor: '#f87171',
                textColor: '#e2e8f0',
                aboutSections: [
                  {
                    title: 'COLOSSAL BEAST HUNTING',
                    text: 'Track elder fire drakes across volcanic calderas, sever elemental horns, and harvest reinforced dragonscales to forge invincible armaments.',
                    img: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=800&auto=format&fit=crop',
                  },
                ],
              },
              {
                id: 'el_dragon_reqs',
                type: 'system-reqs',
                reqsCardBg: '#201010',
                reqsCardBorder: 'rgba(239, 68, 68, 0.25)',
                titleColor: '#ef4444',
                reqsTitle: 'FORGE SYSTEM REQUIREMENTS',
                titleFont: "'Cinzel', serif",
                accentColor: '#ef4444',
                labelColor: '#94a3b8',
                valueColor: '#f8fafc',
              },
              {
                id: 'el_dragon_reviews',
                type: 'user-reviews',
                reviewCardBg: '#201010',
                reviewCardBorder: 'rgba(239, 68, 68, 0.25)',
                reviewCardRadius: 6,
                reviewHeader: 'HONOR OF THE HUNTERS GUILD',
                reviewNameFont: "'Cinzel', serif",
                reviewNameColor: '#ef4444',
                reviewBodyColor: '#e2e8f0',
                reviewStarColor: '#ef4444',
              },
            ],
          },
          {
            id: 'col_side_dragon',
            elements: [
              {
                id: 'el_dragon_cta',
                type: 'sidebar-cta',
                sideCardBg: '#201010',
                sideCardBorder: 'rgba(239, 68, 68, 0.35)',
                unownedPrimaryBtnBg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                unownedPrimaryBtnText: 'JOIN THE HUNT',
                ownedPrimaryBtnBg: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
                ownedPrimaryBtnText: 'ENTER THE ARENA',
              },
              {
                id: 'el_dragon_info',
                type: 'sidebar-info',
                infoCardBg: '#201010',
                infoCardBorder: 'rgba(239, 68, 68, 0.25)',
                infoTitle: 'HUNTER INTEL',
                infoTitleColor: '#ef4444',
                infoLabelColor: '#94a3b8',
                infoValueColor: '#f8fafc',
              },
              {
                id: 'el_dragon_ratings',
                type: 'sidebar-ratings',
                ratingsCardBg: '#201010',
                ratingsCardBorder: 'rgba(239, 68, 68, 0.25)',
                ratingsTitle: 'HUNTER RATING',
                ratingsTitleColor: '#ef4444',
                ratingsFillColor: '#ef4444',
                ratingsLabelColor: '#94a3b8',
                ratingsValueColor: '#f8fafc',
              },
              {
                id: 'el_dragon_comm',
                type: 'sidebar-community',
                communityCardBg: '#201010',
                communityCardBorder: 'rgba(239, 68, 68, 0.25)',
                communityTitle: 'HUNTING SQUAD TELEMETRY',
                communityTitleColor: '#ef4444',
                communityLabelColor: '#94a3b8',
                communityValueColor: '#f8fafc',
                communityRatingColor: '#ef4444',
              },
            ],
          },
        ],
      },
      {
        id: 'sec_dragon_features',
        type: 'features',
        featuresTitle: 'LEGENDARY HUNTING ARSENAL',
        featuresTitleColor: '#ef4444',
        featuresCardBg: '#201010',
        featuresCardBorder: 'rgba(239, 68, 68, 0.3)',
        featuresCols: 4,
        featuresItems: [
          {
            icon: '🔥',
            title: 'Dragon-Forged Steel',
            desc: 'Forge colossal greatswords tempered in volcanic elder fire.',
            color: '#ef4444',
          },
          {
            icon: '🛡️',
            title: 'Elemental Resistance',
            desc: 'Weave wyrmscales into battle armor to nullify magma breath.',
            color: '#f87171',
          },
          {
            icon: '🏹',
            title: 'Heavy Ballistas',
            desc: 'Ground airborne dragons with high-tension tethered harpoons.',
            color: '#dc2626',
          },
          {
            icon: '🐾',
            title: 'Tracking Instincts',
            desc: 'Follow scorched claw footprints across changing dynamic biomes.',
            color: '#b91c1c',
          },
        ],
      },
      {
        id: 'sec_dragon_cta_bottom',
        type: 'cta',
        ctaTitle: 'SLAY THE PRIMORDIAL WYRMS',
        ctaSubtitle: 'Embark on the ultimate monster hunting campaign.',
        ctaBg: 'linear-gradient(135deg, #201010 0%, #2e1414 50%, #180c0c 100%)',
        ctaBorder: 'rgba(239, 68, 68, 0.35)',
        ctaTitleColor: '#ef4444',
        ctaSubtitleColor: '#e2e8f0',
        ctaBtnColor: '#ef4444',
        ctaBtnTextColor: '#ffffff',
        ctaBtnText: 'COMMENCE HUNT',
        ctaPrice: 'ELITE HUNTER EDITION',
      },
      {
        id: 'sec_dragon_recs',
        type: 'recommendations',
        recsTitle: 'MORE COLOSSAL MONSTER SAGAS',
        recsCardBg: '#201010',
        recsCardBorder: 'rgba(239, 68, 68, 0.25)',
      },
    ],
    layout: {},
  };
}

async function seed() {
  try {
    const defaultGenres = [
      { name: 'Action', slug: 'action' },
      { name: 'RPG', slug: 'rpg' },
      { name: 'Strategy', slug: 'strategy' },
      { name: 'Adventure', slug: 'adventure' },
      { name: 'Simulation', slug: 'simulation' },
      { name: 'Racing', slug: 'racing' },
      { name: 'Puzzle', slug: 'puzzle' },
      { name: 'Sports', slug: 'sports' },
      { name: 'Horror', slug: 'horror' },
      { name: 'City Builder', slug: 'city-builder' },
    ];

    const defaultTags = [
      { name: 'Indie', slug: 'indie' },
      { name: 'Cyberpunk', slug: 'cyberpunk' },
      { name: 'Open World', slug: 'open-world' },
      { name: 'Singleplayer', slug: 'singleplayer' },
      { name: 'Multiplayer', slug: 'multiplayer' },
      { name: 'Turn-Based', slug: 'turn-based' },
      { name: 'Dark Fantasy', slug: 'dark-fantasy' },
      { name: 'Sci-Fi', slug: 'sci-fi' },
      { name: 'Historical', slug: 'historical' },
      { name: 'Pixel Art', slug: 'pixel-art' },
      { name: 'Sandbox', slug: 'sandbox' },
      { name: 'Crafting', slug: 'crafting' },
      { name: 'Roguelike', slug: 'roguelike' },
      { name: 'Stealth', slug: 'stealth' },
      { name: 'Platformer', slug: 'platformer' },
    ];

    const seededGenres: Record<string, number> = {};
    for (const genre of defaultGenres) {
      const [inserted] = await catalogDb
        .insert(genres)
        .values(genre)
        .onConflictDoNothing({ target: genres.slug })
        .returning();

      if (inserted) {
        seededGenres[genre.slug] = inserted.id;
      } else {
        const existing = await catalogDb.query.genres.findFirst({
          where: eq(genres.slug, genre.slug),
        });
        if (existing) {
          seededGenres[genre.slug] = existing.id;
        }
      }
    }

    const seededTags: Record<string, number> = {};
    for (const tag of defaultTags) {
      const [inserted] = await catalogDb
        .insert(tags)
        .values(tag)
        .onConflictDoNothing({ target: tags.slug })
        .returning();

      if (inserted) {
        seededTags[tag.slug] = inserted.id;
      } else {
        const existing = await catalogDb.query.tags.findFirst({
          where: eq(tags.slug, tag.slug),
        });
        if (existing) {
          seededTags[tag.slug] = existing.id;
        }
      }
    }

    const demoGames = [
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Neon Overdrive',
        slug: 'neon-overdrive',
        shortDescription: 'A high-octane cyberpunk action RPG set in a futuristic metropolis.',
        fullDescription:
          'Explore the illuminated streets of Neo-Cairo in this action-packed RPG featuring deep skill trees, cybernetic augmentations, and intense combat.',
        priceEgp: '299.99',
        discountPercent: 10,
        bannerUrl:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'action',
        pageTheme: createCyberpunkTheme(),
        tagSlugs: ['cyberpunk', 'singleplayer', 'open-world'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Pharaoh Tactics',
        slug: 'pharaoh-tactics',
        shortDescription: 'Turn-based tactical strategy game set in ancient Egypt.',
        fullDescription:
          'Command your armies across the Nile valley, construct grand monuments, and outmaneuver rival kingdoms in rich tactical warfare.',
        priceEgp: '449.50',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'strategy',
        pageTheme: createEgyptianTheme(),
        tagSlugs: ['turn-based', 'historical', 'singleplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Nile Odyssey',
        slug: 'nile-odyssey',
        shortDescription: 'An epic narrative adventure following mythical journeys along the Nile.',
        fullDescription:
          'Uncover forgotten temples, solve ancient riddles, and master mythical abilities in an immersive story-driven campaign.',
        priceEgp: '199.99',
        discountPercent: 15,
        bannerUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'adventure',
        pageTheme: createDefaultTheme(
          'MYTHICAL JOURNEY ACROSS ANCIENT TEMPLE RUINS',
          'Explore sunken tombs along the sacred river banks, decipher hieroglyphic vaults, and unlock legendary artifacts.',
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop'
        ),
        tagSlugs: ['historical', 'singleplayer', 'open-world'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Shadow Realm',
        slug: 'shadow-realm',
        shortDescription: 'Dark fantasy action RPG with challenging boss encounters.',
        fullDescription:
          'Battle through corrupted domains, unleash dark spells, and overcome towering bosses in a punishing dark fantasy world.',
        priceEgp: '349.00',
        discountPercent: 20,
        bannerUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'rpg',
        pageTheme: createDarkFantasyTheme(),
        tagSlugs: ['dark-fantasy', 'singleplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Starlight Horizon',
        slug: 'starlight-horizon',
        shortDescription: 'Deep space exploration and colony building simulator.',
        fullDescription:
          'Build galactic trade routes, manage resource supply chains, and establish thriving orbital colonies in vast star systems.',
        priceEgp: '599.99',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'simulation',
        pageTheme: createSciFiTheme(),
        tagSlugs: ['sci-fi', 'sandbox', 'singleplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Desert Racer X',
        slug: 'desert-racer-x',
        shortDescription: 'High-speed off-road racing across treacherous sand dunes.',
        fullDescription:
          'Customize buggy vehicles, master extreme drift physics, and compete in multiplayer sand dune rallies.',
        priceEgp: '149.99',
        discountPercent: 5,
        bannerUrl:
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'racing',
        pageTheme: createDefaultTheme(
          'TREACHEROUS SAND DUNE RALLIES',
          'Custom-tune dune buggies and conquer shifting desert sands in high-octane multiplayer rally tournaments.',
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop'
        ),
        tagSlugs: ['multiplayer', 'sandbox'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Pixel Dungeon Quest',
        slug: 'pixel-dungeon-quest',
        shortDescription: 'Charming retro pixel-art roguelike dungeon crawler.',
        fullDescription:
          'Explore procedurally generated dungeons, collect hundreds of unique artifacts, and slay whimsical monsters.',
        priceEgp: '79.99',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'rpg',
        pageTheme: createRetroPixelTheme(),
        tagSlugs: ['pixel-art', 'roguelike', 'indie'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Cyber City 2099',
        slug: 'cyber-city-2099',
        shortDescription: 'Gritty open-world detective adventure in a neon-lit metropolis.',
        fullDescription:
          'Investigate corporate espionage, hack security networks, and decide the fate of a sprawling cyberpunk city.',
        priceEgp: '399.99',
        discountPercent: 25,
        bannerUrl:
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'action',
        pageTheme: createCyberpunkTheme(),
        tagSlugs: ['cyberpunk', 'open-world', 'stealth'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Mythic Kingdoms',
        slug: 'mythic-kingdoms',
        shortDescription: 'Grand strategy empire builder with legendary hero units.',
        fullDescription:
          'Expand your realm, engage in deep diplomacy, and lead mythical hero armies into massive real-time battlefields.',
        priceEgp: '499.00',
        discountPercent: 10,
        bannerUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'strategy',
        pageTheme: createDefaultTheme(
          'GRAND EMPIRE DIPLOMACY & CONQUEST',
          'Form royal alliances, forge trade pacts, and deploy mythical heroes across sprawling strategic maps.'
        ),
        tagSlugs: ['dark-fantasy', 'multiplayer', 'turn-based'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Cosmic Voyage',
        slug: 'cosmic-voyage',
        shortDescription: 'Relaxing space travel and planet discovery simulator.',
        fullDescription:
          'Pilot atmospheric starships, catalog alien flora and fauna, and enjoy a meditative journey across uncharted worlds.',
        priceEgp: '249.99',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'adventure',
        pageTheme: createSciFiTheme(),
        tagSlugs: ['sci-fi', 'sandbox', 'indie'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Ancient Legends',
        slug: 'ancient-legends',
        shortDescription: 'Mythological action adventure inspired by ancient folklore.',
        fullDescription:
          'Wield divine weapons, solve mystical environmental puzzles, and battle legendary beasts from ancient lore.',
        priceEgp: '299.00',
        discountPercent: 15,
        bannerUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'adventure',
        pageTheme: createEgyptianTheme(),
        tagSlugs: ['historical', 'dark-fantasy', 'singleplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Velocity Drift',
        slug: 'velocity-drift',
        shortDescription: 'Arcade street racing with precision drifting mechanics.',
        fullDescription:
          'Tune custom sports cars, dominate night-time street circuits, and climb online global leaderboard ranks.',
        priceEgp: '129.99',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'racing',
        pageTheme: createDefaultTheme(
          'PRECISION DRIFTING & NIGHT CIRCUITS',
          'Fine-tune engine torque, master hair-pin turns, and dominate underground night street racing tournaments.'
        ),
        tagSlugs: ['multiplayer', 'singleplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Brain Teaser Extreme',
        slug: 'brain-teaser-extreme',
        shortDescription: 'Mind-bending physics puzzle game with creative level editor.',
        fullDescription:
          'Solve over 200 handcrafted physics puzzles and share custom levels with an active global community.',
        priceEgp: '49.99',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'puzzle',
        pageTheme: createDefaultTheme(
          'PHYSICS PUZZLES & LEVEL CREATION',
          'Engineered for puzzle enthusiasts—create complex mechanical contraptions and share custom challenges worldwide.'
        ),
        tagSlugs: ['indie', 'singleplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Stealth Assassin',
        slug: 'stealth-assassin',
        shortDescription: 'Tactical stealth action game with complete player freedom.',
        fullDescription:
          'Plan complex infiltrations, utilize shadow disguises, and eliminate targets without raising alarms.',
        priceEgp: '319.99',
        discountPercent: 10,
        bannerUrl:
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'action',
        pageTheme: createCyberpunkTheme(),
        tagSlugs: ['stealth', 'singleplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Space Colony Sim',
        slug: 'space-colony-sim',
        shortDescription: 'Manage life support and economic production on alien moons.',
        fullDescription:
          'Design modular habitats, balance oxygen supply, and protect colonists from harsh planetary environments.',
        priceEgp: '379.50',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'simulation',
        pageTheme: createDefaultTheme(
          'MODULAR HABITATS & LIFE SUPPORT MANAGEMENT',
          'Engineer atmospheric domes, regulate power grids, and safeguard colonists against alien solar flares.'
        ),
        tagSlugs: ['sci-fi', 'crafting', 'sandbox'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Dragon Slayer Chronicles',
        slug: 'dragon-slayer-chronicles',
        shortDescription: 'Third-person action RPG with giant monster hunting.',
        fullDescription:
          'Craft elemental armors, forge colossal blades, and track down elder dragons across vast open biomes.',
        priceEgp: '549.99',
        discountPercent: 30,
        bannerUrl:
          'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'rpg',
        pageTheme: createDragonTheme(),
        tagSlugs: ['dark-fantasy', 'crafting', 'open-world'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Free Runner City',
        slug: 'free-runner-city',
        shortDescription: 'Fast-paced parkour platformer across skyscraper rooftops.',
        fullDescription:
          'Flow through dynamic urban environments, string together acrobatic tricks, and outrun security drones.',
        priceEgp: '0.00',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        genreSlug: 'action',
        pageTheme: createDefaultTheme(
          'HIGH-ALTITUDE URBAN PARKOUR',
          'Leap across vertigo-inducing rooftops, wall-run past laser barriers, and master momentum fluid movement.'
        ),
        tagSlugs: ['platformer', 'indie'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Quantum Breakthrough',
        slug: 'quantum-breakthrough',
        shortDescription: 'Unreleased quantum physics puzzle game currently in active testing.',
        fullDescription: 'Manipulate subatomic particles to solve temporal paradoxes.',
        priceEgp: '199.00',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        status: 'draft',
        genreSlug: 'puzzle',
        pageTheme: createDefaultTheme(
          'QUANTUM MECHANICS',
          'Manipulate temporal particles in subatomic puzzle environments.'
        ),
        tagSlugs: ['sci-fi', 'indie'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Prototype Arena',
        slug: 'prototype-arena',
        shortDescription: 'Internal combat sandbox prototype.',
        fullDescription: 'Experimental weapons testbed for upcoming combat mechanics.',
        priceEgp: '99.99',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        status: 'draft',
        genreSlug: 'action',
        pageTheme: createDefaultTheme(
          'EXPERIMENTAL COMBAT',
          'Sandbox arena for testing next-generation weapon physics.'
        ),
        tagSlugs: ['multiplayer', 'sandbox'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Banned Shooter Z',
        slug: 'banned-shooter-z',
        shortDescription: 'Suspended title undergoing content review.',
        fullDescription: 'This title is temporarily suspended from public catalog listing.',
        priceEgp: '299.99',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
        status: 'suspended',
        genreSlug: 'action',
        pageTheme: createDefaultTheme('RESTRICTED CONTENT', 'Under active moderation review.'),
        tagSlugs: ['cyberpunk', 'multiplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Unannounced Project X',
        slug: 'unannounced-project-x',
        shortDescription: 'Top-secret unannounced RPG project.',
        fullDescription: 'Classified development build.',
        priceEgp: '699.99',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        status: 'draft',
        genreSlug: 'rpg',
        pageTheme: createDefaultTheme('CLASSIFIED PROJECT', 'Secret RPG development build.'),
        tagSlugs: ['dark-fantasy', 'singleplayer'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Archived Demo V1',
        slug: 'archived-demo-v1',
        shortDescription: 'Legacy prototype build removed from active listing.',
        fullDescription: 'Archived initial tech demo.',
        priceEgp: '0.00',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        status: 'suspended',
        genreSlug: 'adventure',
        pageTheme: createDefaultTheme('LEGACY ARCHIVE', 'Archived early tech demo build.'),
        tagSlugs: ['indie'],
      },
    ];

    const zipBuffer = getSeededZipBuffer();

    for (const gameData of demoGames) {
      const { tagSlugs, genreSlug, ...gameValues } = gameData;
      const genreId = genreSlug ? seededGenres[genreSlug] || null : null;

      const [insertedGame] = await catalogDb
        .insert(games)
        .values({ ...gameValues, genreId })
        .onConflictDoUpdate({
          target: games.slug,
          set: {
            title: sql`EXCLUDED.title`,
            shortDescription: sql`EXCLUDED.short_description`,
            fullDescription: sql`EXCLUDED.full_description`,
            priceEgp: sql`EXCLUDED.price_egp`,
            discountPercent: sql`EXCLUDED.discount_percent`,
            bannerUrl: sql`EXCLUDED.banner_url`,
            pageTheme: sql`EXCLUDED.page_theme`,
            status: sql`EXCLUDED.status`,
            genreId: sql`EXCLUDED.genre_id`,
          },
        })
        .returning();

      const targetGameId =
        insertedGame?.id ||
        (
          await catalogDb.query.games.findFirst({
            where: eq(games.slug, gameValues.slug),
          })
        )?.id;

      if (targetGameId) {
        for (const tagSlug of tagSlugs) {
          const tagId = seededTags[tagSlug];
          if (tagId) {
            await catalogDb
              .insert(gameTags)
              .values({ gameId: targetGameId, tagId })
              .onConflictDoNothing();
          }
        }

        if (gameValues.status === 'published') {
          const objectKey = `builds/${targetGameId}/v1.0.0/game.zip`;
          try {
            const { checksumSha256, sizeBytes } = await uploadGameBuildPackage({
              objectKey,
              buffer: zipBuffer,
            });

            await catalogDb
              .insert(gameBuilds)
              .values({
                gameId: targetGameId,
                version: 'v1.0.0',
                objectKey,
                checksumSha256,
                sizeBytes,
                state: 'published',
              })
              .onConflictDoNothing();
          } catch (storageErr) {
            console.warn(`Storage upload warning for game ${targetGameId}:`, storageErr);
          }
        }
      }
    }

    console.log(
      'Catalog database seeding completed successfully with demo games, builds, and custom pageThemes!'
    );
  } catch (error) {
    console.error('Error during catalog database seeding:', error);
    process.exitCode = 1;
  } finally {
    await catalogPool.end();
  }
}

void seed();
