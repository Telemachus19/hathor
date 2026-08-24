import { generateKeyPairSync, sign } from 'node:crypto';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createAIApp } from '../../../apps/ai-service/src/app.js';
import {
  normalizeThemeSections,
  buildUserDesignPrompt,
  suggestColorPalette,
  validateThemeSchema,
  proposeThemeLayout,
  AGENT_TOOL_DECLARATIONS,
  PRESET_PALETTES,
} from '../../../apps/ai-service/src/services/agent/index.js';

// Setup RSA keypair for JWT auth middleware testing in ai-service
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.JWT_PUBLIC_KEY = publicKey;

function signJwt(payload: object, privateKeyPem: string): string {
  const fullPayload = {
    iss: 'hathor-auth-service',
    aud: 'hathor-services',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  };
  const header = { alg: 'RS256', typ: 'JWT' };
  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = sign('sha256', Buffer.from(signatureInput), privateKeyPem).toString(
    'base64url'
  );
  return `${signatureInput}.${signature}`;
}

const ready = async () => undefined;
const app = createAIApp(ready);

describe('Agentic AI Storefront Theme Designer Suite', () => {
  describe('1. Tool Registry & Declarations', () => {
    it('registers all 4 mandatory autonomous agent tools', () => {
      const toolNames = AGENT_TOOL_DECLARATIONS.map((t) => t.name);
      expect(toolNames).toContain('get_game_metadata');
      expect(toolNames).toContain('suggest_color_palette');
      expect(toolNames).toContain('validate_theme_schema');
      expect(toolNames).toContain('propose_theme_layout');
    });

    it('validates tool parameter schemas are well-formed', () => {
      const metadataTool = AGENT_TOOL_DECLARATIONS.find((t) => t.name === 'get_game_metadata');
      expect(metadataTool?.parameters?.required).toContain('gameId');

      const paletteTool = AGENT_TOOL_DECLARATIONS.find((t) => t.name === 'suggest_color_palette');
      expect(paletteTool?.parameters?.required).toContain('themeStyle');

      const proposalTool = AGENT_TOOL_DECLARATIONS.find((t) => t.name === 'propose_theme_layout');
      expect(proposalTool?.parameters?.required).toEqual(
        expect.arrayContaining(['theme', 'changeSummary', 'explanation'])
      );
    });
  });

  describe('2. Palette Suggestion Tool', () => {
    it('returns preset color palettes for known aesthetic moods', () => {
      const cyberpunk = suggestColorPalette('cyberpunk');
      expect(cyberpunk.accent).toBe(PRESET_PALETTES['cyberpunk'].accent);

      const gothic = suggestColorPalette('dark-gothic');
      expect(gothic.accent).toBe(PRESET_PALETTES['dark-gothic'].accent);

      const egypt = suggestColorPalette('egyptian-gold');
      expect(egypt.accent).toBe(PRESET_PALETTES['egyptian-gold'].accent);
    });

    it('performs fuzzy matching on style descriptions', () => {
      const result = suggestColorPalette('I want a retro-synthwave neon 80s vibe');
      expect(result.accent).toBe(PRESET_PALETTES['retro-synthwave'].accent);
    });

    it('falls back gracefully to default palette for unknown aesthetic strings', () => {
      const unknown = suggestColorPalette('something-completely-unique-12345');
      expect(unknown).toBeDefined();
      expect(unknown.accent).toBe(PRESET_PALETTES['egyptian-gold'].accent);
    });
  });

  describe('3. Normalizer & AST Sanitization Node', () => {
    it('unwraps nested tool envelopes and parameters objects', () => {
      const nestedEnvelope = {
        theme: {
          pageSettings: { accentColor: '#ff007f' },
          sections: [{ type: 'game-header', titleColor: '#ffffff' }],
        },
      };

      const normalized = normalizeThemeSections(nestedEnvelope);
      expect(normalized.pageSettings.accentColor).toBe('#ff007f');
      expect(normalized.sections).toHaveLength(1);
      expect(normalized.sections[0].type).toBe('game-header');
      expect(normalized.sections[0].id).toBeDefined();
    });

    it('maps section colloquial aliases to canonical component keys', () => {
      const aliasTheme = {
        sections: [
          { type: 'hero' },
          { type: 'carousel' },
          { type: 'about' },
          { type: 'specs' },
          { type: 'reviews' },
          { type: 'ratings' },
          { type: 'info' },
        ],
      };

      const normalized = normalizeThemeSections(aliasTheme);
      const types = normalized.sections.map((s: any) => s.type);

      expect(types).toEqual([
        'media-carousel',
        'media-carousel',
        'about-game',
        'system-reqs',
        'user-reviews',
        'sidebar-ratings',
        'sidebar-info',
      ]);
    });

    it('scrubs misplaced media, review arrays, and catalog text fields', () => {
      const dirtyTheme = {
        sections: [
          {
            type: 'game-header',
            heroImages: ['https://example.com/shot.jpg'],
            gameTitle: 'Hardcoded Title Override',
            reqsMin: '16GB RAM',
          },
          {
            type: 'about-game',
            reviews: [{ user: 'Tester', text: 'Great!' }],
          },
        ],
      };

      const normalized = normalizeThemeSections(dirtyTheme);
      expect(normalized.sections[0].heroImages).toBeUndefined();
      expect(normalized.sections[0].gameTitle).toBeUndefined();
      expect(normalized.sections[0].reqsMin).toBeUndefined();
      expect(normalized.sections[1].reviews).toBeUndefined();
    });

    it('normalizes nested grid columns recursively and assigns IDs', () => {
      const gridTheme = {
        sections: [
          {
            type: 'grid',
            gridTemplate: '2:1',
            gridCols: [
              {
                elements: [{ type: 'about' }],
              },
              {
                elements: [{ type: 'info' }],
              },
            ],
          },
        ],
      };

      const normalized = normalizeThemeSections(gridTheme);
      expect(normalized.sections[0].id).toBeDefined();
      expect(normalized.sections[0].gridCols[0].id).toBeDefined();
      expect(normalized.sections[0].gridCols[0].elements[0].type).toBe('about-game');
      expect(normalized.sections[0].gridCols[0].elements[0].id).toBeDefined();
      expect(normalized.sections[0].gridCols[1].elements[0].type).toBe('sidebar-info');
    });
  });

  describe('4. Validation Tool & Proposal Tool', () => {
    it('validates clean theme against ThemeDocument successfully', () => {
      const cleanTheme = {
        pageSettings: {
          bg: '#0a0a0f',
          accentColor: '#00f3ff',
        },
        sections: [
          {
            type: 'media-carousel',
            carouselHeight: 480,
            carouselImages: ['https://example.com/1.jpg'],
          },
        ],
      };

      const res = validateThemeSchema(cleanTheme);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('proposeThemeLayout rejects non-compliant theme with actionable instruction', () => {
      const badTheme = {
        sections: [
          {
            type: 'game-header',
            titleColor: 'expression(alert("xss"))',
          },
        ],
      };

      const proposal = proposeThemeLayout({
        theme: badTheme,
        changeSummary: ['Updated title'],
        explanation: 'Here is the theme',
      });

      expect(proposal.success).toBe(false);
      expect(proposal.validated).toBe(false);
      expect(proposal.errors?.length).toBeGreaterThan(0);
      expect(proposal.instruction).toContain('Validation rejected your proposed theme layout');
    });

    it('proposeThemeLayout successfully packages valid theme proposal', () => {
      const validTheme = {
        sections: [
          {
            type: 'game-header',
            titleColor: '#00f3ff',
          },
        ],
      };

      const proposal = proposeThemeLayout({
        theme: validTheme,
        changeSummary: ['Applied cyan title color'],
        explanation: 'Customized header styling.',
      });

      expect(proposal.success).toBe(true);
      expect(proposal.validated).toBe(true);
      expect(proposal.theme).toBeDefined();
      expect(proposal.changeSummary).toContain('Applied cyan title color');
    });
  });

  describe('5. Prompt Builder Directives', () => {
    it('creates incremental edit directive when user requests minor modifications', () => {
      const currentTheme = { sections: [{ id: 's1', type: 'game-header' }] };
      const prompt = buildUserDesignPrompt(
        'only change button color to red',
        '\nGame Details: Title: "Space Racer"',
        currentTheme
      );

      expect(prompt).toContain('Current Layout (User requested minor modification');
      expect(prompt).toContain('Space Racer');
    });

    it('creates full creative freedom directive when user requests a new design', () => {
      const prompt = buildUserDesignPrompt(
        'Make me an epic dark fantasy storefront',
        '\nGame Details: Title: "Elden Kingdom"'
      );

      expect(prompt).toContain('Directive: Create a custom storefront layout');
      expect(prompt).toContain('Elden Kingdom');
    });
  });

  describe('6. Designer Chat HTTP Endpoint Security & Contracts', () => {
    it('POST /ai/games/:id/designer-chat rejects unauthenticated requests (401)', async () => {
      const res = await request(app).post('/ai/games/draft_123/designer-chat').send({
        message: 'Design a theme',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('POST /ai/games/:id/designer-chat rejects non-creator/non-admin roles (403)', async () => {
      const gamerToken = signJwt(
        {
          sub: '11111111-1111-1111-1111-111111111111',
          email: 'gamer@example.com',
          roles: ['gamer'],
        },
        privateKey
      );

      const res = await request(app)
        .post('/ai/games/draft_123/designer-chat')
        .set('Authorization', `Bearer ${gamerToken}`)
        .send({
          message: 'Design a theme',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /ai/games/:id/designer-chat handles creator authorization and validates payload structure', async () => {
      const creatorToken = signJwt(
        {
          sub: '22222222-2222-2222-2222-222222222222',
          email: 'creator@example.com',
          roles: ['creator'],
        },
        privateKey
      );

      const res = await request(app)
        .post('/ai/games/draft_new_game/designer-chat')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          message: 'Cyberpunk neon theme',
          currentTheme: { sections: [] },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.reply).toBeDefined();
      expect(Array.isArray(res.body.data.actionsTaken)).toBe(true);
    });
  });
});
