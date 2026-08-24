import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';
import { validateThemeAgainstDocument, type ThemeValidationResult } from '../utils/themeValidator.js';

export interface AgentChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AgentChatInput {
  gameId: string;
  message: string;
  currentTheme?: any;
  conversationHistory?: AgentChatMessage[];
  provider?: 'gemini' | 'glm' | 'auto';
  model?: string;
  authToken?: string;
}

export interface AgentChatResponse {
  reply: string;
  proposedTheme?: any;
  changeSummary?: string[];
  actionsTaken?: string[];
  validationResult?: ThemeValidationResult;
  providerUsed?: 'gemini' | 'glm';
}

// 1. Define Tool Declarations for Agent Tool Calling
const getGameMetadataTool: FunctionDeclaration = {
  name: 'get_game_metadata',
  description: 'Fetches the game title, genre, short description, tags, and banner/screenshot URLs from the catalog service for the given game ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      gameId: {
        type: Type.STRING,
        description: 'The unique ID, UUID, or slug of the game.',
      },
    },
    required: ['gameId'],
  },
};

const suggestColorPaletteTool: FunctionDeclaration = {
  name: 'suggest_color_palette',
  description: 'Returns curated, high-contrast, theme-appropriate color palettes matching a requested mood, genre, or style.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      themeStyle: {
        type: Type.STRING,
        description: 'The style or aesthetic (e.g., "cyberpunk", "dark-gothic", "sci-fi", "minimalist", "retro-arcade", "fantasy", "egyptian-gold").',
      },
    },
    required: ['themeStyle'],
  },
};

const validateThemeSchemaTool: FunctionDeclaration = {
  name: 'validate_theme_schema',
  description: 'Validates a candidate theme JSON object against Hathor ThemeDocument rules and security constraints. Returns whether it is valid and any specific error paths/messages for self-correction.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      themeJson: {
        type: Type.OBJECT,
        description: 'The candidate theme JSON object containing pageSettings and/or sections array to validate.',
      },
    },
    required: ['themeJson'],
  },
};

const proposeThemeLayoutTool: FunctionDeclaration = {
  name: 'propose_theme_layout',
  description: 'Finalizes and proposes a validated theme layout for Human-in-the-Loop review by the creator. Call this tool when your theme is valid and ready.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      theme: {
        type: Type.OBJECT,
        description: 'The complete validated theme object containing { sections, pageSettings }.',
      },
      changeSummary: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of 2-5 concise bullet points explaining the visual/layout changes made.',
      },
      explanation: {
        type: Type.STRING,
        description: 'A friendly 1-2 sentence message summarizing the theme design for the creator.',
      },
    },
    required: ['theme', 'changeSummary', 'explanation'],
  },
};

// Preset high-contrast palettes
const PRESET_PALETTES: Record<string, { accent: string; bg: string; text: string; headerBg: string }> = {
  'cyberpunk': { accent: '#00f3ff', bg: '#070a13', text: '#ffffff', headerBg: '#0e1424' },
  'neon-cyan': { accent: '#00f3ff', bg: '#08090d', text: '#eeeeee', headerBg: '#121620' },
  'dark-gothic': { accent: '#c5a059', bg: '#0a0a0d', text: '#f0e2b6', headerBg: '#14141a' },
  'egyptian-gold': { accent: '#f26b21', bg: '#0e1116', text: '#ffffff', headerBg: '#161a22' },
  'desert-dynasty': { accent: '#b85328', bg: '#f4e8d3', text: '#1c140c', headerBg: '#e6d5bd' },
  'retro-synthwave': { accent: '#ff007f', bg: '#0f051d', text: '#ffffff', headerBg: '#1a0933' },
  'deep-ocean': { accent: '#00b4d8', bg: '#03045e', text: '#caf0f8', headerBg: '#023e8a' },
  'emerald-forest': { accent: '#10b981', bg: '#061a14', text: '#ecfdf5', headerBg: '#064e3b' },
};

/**
 * Normalizes section types and scrubs misplaced media arrays to guarantee ThemeDocument compliance.
 */
function normalizeThemeSections(theme: any): any {
  if (!theme || typeof theme !== 'object') return theme;

  // 1. Unwrap nested theme envelopes (e.g. from tool calls or LLM propose_theme_layout arguments)
  let targetTheme = theme;
  if (
    theme.theme &&
    typeof theme.theme === 'object' &&
    (Array.isArray(theme.theme.sections) || theme.theme.pageSettings)
  ) {
    targetTheme = theme.theme;
  } else if (
    theme.parameters?.theme &&
    typeof theme.parameters.theme === 'object' &&
    (Array.isArray(theme.parameters.theme.sections) || theme.parameters.theme.pageSettings)
  ) {
    targetTheme = theme.parameters.theme;
  } else if (
    theme.arguments?.theme &&
    typeof theme.arguments.theme === 'object' &&
    (Array.isArray(theme.arguments.theme.sections) || theme.arguments.theme.pageSettings)
  ) {
    targetTheme = theme.arguments.theme;
  }

  const aliasType = (t: string): string => {
    const low = (t || '').toLowerCase().trim();
    if (low === 'hero' || low === 'carousel' || low === 'game-hero' || low === 'mediacarousel')
      return 'media-carousel';
    if (low === 'header' || low === 'gameheader') return 'game-header';
    if (low === 'reviews' || low === 'review') return 'user-reviews';
    if (low === 'specs' || low === 'spec' || low === 'systemreqs') return 'system-reqs';
    if (low === 'ratings' || low === 'rating') return 'sidebar-ratings';
    if (low === 'info') return 'sidebar-info';
    if (low === 'about') return 'about-game';
    if (low === 'recs' || low === 'more_like_this' || low === 'more-like-this')
      return 'recommendations';
    return t;
  };

  const sanitizeSection = (sec: any, idx: number): any => {
    if (!sec || typeof sec !== 'object') return sec;
    let s = { ...sec };

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
        const rawElements = Array.isArray(col.elements) ? col.elements : [];
        const sanitizedElements = rawElements.map((el: any, eIdx: number) => sanitizeSection(el, eIdx));
        return {
          ...col,
          id: colId,
          elements: sanitizedElements,
        };
      });
    }

    return s;
  };

  // Find raw sections, prioritizing populated arrays
  let rawSections: any[] = [];
  if (Array.isArray(targetTheme.sections) && targetTheme.sections.length > 0) {
    rawSections = targetTheme.sections;
  } else if (Array.isArray(theme.sections) && theme.sections.length > 0) {
    rawSections = theme.sections;
  } else if (Array.isArray(targetTheme)) {
    rawSections = targetTheme;
  } else if (Array.isArray(theme)) {
    rawSections = theme;
  }

  const sanitizedSections = rawSections.map((sec: any, idx: number) => sanitizeSection(sec, idx));
  const pageSettings = targetTheme.pageSettings || theme.pageSettings || {};

  return {
    pageSettings,
    sections: sanitizedSections,
  };
}

export class AiThemeAgent {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API || process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  public isConfigured(): boolean {
    return this.ai !== null || Boolean(process.env.GLM_API || process.env.GLM_API_KEY);
  }

  private getGlmApiKey(): string {
    return (process.env.GLM_API || process.env.GLM_API_KEY || '').trim();
  }

  private getGlmBaseUrl(): string {
    return process.env.GLM_BASE_URL || 'https://openrouter.ai/api/v1';
  }

  private getCatalogServiceUrl(): string {
    return process.env.CATALOG_SERVICE_URL || 'http://catalog-service:5002';
  }

  /**
   * Executes tool functions requested by the agent.
   * Fetches metadata through catalog-service HTTP API preserving service boundaries.
   */
  private async executeTool(name: string, args: Record<string, any>, authToken?: string): Promise<any> {
    switch (name) {
      case 'get_game_metadata': {
        const { gameId } = args;
        if (!gameId || gameId === 'draft' || gameId === 'draft_new_game') {
          return {
            title: 'UNTITLED GAME DRAFT',
            genre: 'Action RPG',
            shortDescription: 'An immersive new indie game experience.',
            tags: ['Indie', 'Action', 'Atmospheric'],
            bannerUrl: '',
            screenshots: [],
          };
        }

        try {
          const catalogUrl = this.getCatalogServiceUrl();
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (authToken) {
            headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
          }

          // Try fetching from creator endpoint first (with auth), or fallback to store endpoint
          let res = await fetch(`${catalogUrl}/creator/games/${encodeURIComponent(gameId)}`, { headers });
          if (!res.ok) {
            res = await fetch(`${catalogUrl}/store/games/${encodeURIComponent(gameId)}`, { headers });
          }

          if (res.ok) {
            const data: any = await res.json();
            const game = data.data || data.game || data;
            return {
              id: game.id,
              title: game.title || 'UNTITLED GAME DRAFT',
              genre: game.genreName || game.genre?.name || game.category || 'Action RPG',
              shortDescription: game.shortDescription || game.description || 'An immersive new indie game experience.',
              fullDescription: game.fullDescription || '',
              priceEgp: game.priceEgp,
              bannerUrl: game.bannerUrl || game.coverUrl || '',
              screenshots: Array.isArray(game.screenshots) ? game.screenshots : [],
              tags: Array.isArray(game.tags)
                ? game.tags.map((t: any) => (typeof t === 'string' ? t : t.name))
                : ['Indie', 'Action', 'Atmospheric'],
            };
          }

          return {
            title: 'UNTITLED GAME DRAFT',
            genre: 'Action RPG',
            shortDescription: 'An immersive new indie game experience.',
            tags: ['Indie', 'Action', 'Atmospheric'],
            bannerUrl: '',
            screenshots: [],
          };
        } catch (err: any) {
          console.warn(`[AI Theme Agent] Could not fetch game metadata for ${gameId}:`, err.message);
          return {
            title: 'UNTITLED GAME DRAFT',
            genre: 'Action RPG',
            shortDescription: 'An immersive new indie game experience.',
            tags: ['Indie', 'Action', 'Atmospheric'],
            bannerUrl: '',
            screenshots: [],
          };
        }
      }

      case 'suggest_color_palette': {
        const { themeStyle } = args;
        const normalized = (themeStyle || '').toLowerCase().trim();
        const matched =
          PRESET_PALETTES[normalized] ||
          Object.entries(PRESET_PALETTES).find(([k]) => normalized.includes(k))?.[1] ||
          PRESET_PALETTES['egyptian-gold'];
        return matched;
      }

      case 'validate_theme_schema': {
        const { themeJson } = args;
        const normalized = normalizeThemeSections(themeJson);
        const result = validateThemeAgainstDocument(normalized);
        return {
          valid: result.valid,
          errors: result.errors.map((e) => ({ path: e.path, message: e.message, code: e.code })),
          warnings: result.warnings.map((w) => ({ path: w.path, message: w.message })),
        };
      }

      case 'propose_theme_layout': {
        const normalizedTheme = normalizeThemeSections(args.theme);
        const validation = validateThemeAgainstDocument(normalizedTheme);
        if (!validation.valid) {
          return {
            success: false,
            validated: false,
            errors: validation.errors.map((e) => ({
              path: e.path,
              message: e.message,
              code: e.code,
            })),
            instruction:
              'Validation rejected your proposed theme layout. Please review the errors list, fix the invalid property names or types according to ThemeDocument, and call propose_theme_layout again with the corrected theme JSON.',
          };
        }
        return {
          success: true,
          validated: true,
          theme: normalizedTheme,
          changeSummary: args.changeSummary || [],
          explanation: args.explanation || '',
        };
      }

      default:
        return { error: `Unknown tool "${name}"` };
    }
  }

  /**
   * Generates completion via GLM 5.2 / OpenRouter API.
   */
  private async generateWithGlm(
    messages: Array<{ role: string; content: string }>,
    candidateModels: string[]
  ): Promise<{ text: string; modelUsed: string }> {
    const apiKey = this.getGlmApiKey();
    if (!apiKey) {
      throw new Error('GLM API key is not configured. Please set GLM_API in .env.');
    }

    const baseUrl = this.getGlmBaseUrl();
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://hathor.portal',
            'X-Title': 'Hathor Developer Portal',
          },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            messages,
            temperature: 0.7,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          if (res.status === 402) {
            throw new Error('GLM / OpenRouter requires credits (HTTP 402 Payment Required).');
          }
          if (res.status === 429) {
            console.warn(`[GLM 5.2 Agent] Model ${model} is rate-limited (HTTP 429). Retrying in 2s...`);
            await new Promise((r) => setTimeout(r, 2000));
            // One immediate retry on rate-limit
            const retryRes = await fetch(`${baseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://hathor.portal',
                'X-Title': 'Hathor Developer Portal',
              },
              body: JSON.stringify({
                model,
                response_format: { type: 'json_object' },
                messages,
                temperature: 0.7,
              }),
            });
            if (retryRes.ok) {
              const retryData = (await retryRes.json()) as any;
              const text = retryData.choices?.[0]?.message?.content || '';
              if (text) return { text, modelUsed: model };
            }
          }
          throw new Error(`GLM HTTP ${res.status}: ${errBody}`);
        }

        const data = (await res.json()) as any;
        const text = data.choices?.[0]?.message?.content || '';
        if (!text) {
          throw new Error('Empty response content received from GLM.');
        }

        return { text, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        console.warn(`[GLM 5.2 Agent] Model ${model} failed (${err.message}). Trying next...`);
        continue;
      }
    }

    throw lastError || new Error('All GLM candidate models failed.');
  }

  /**
   * Generates completion via Google Gemini.
   */
  private async generateWithGemini(
    contents: any[],
    systemInstruction: string,
    candidateModels: string[]
  ): Promise<{ text: string; modelUsed: string }> {
    if (!this.ai) {
      throw new Error('Gemini API is not configured. Please set GEMINI_API in .env.');
    }

    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const candidate = response.candidates?.[0];
        const text = candidate?.content?.parts?.find((p: any) => p.text)?.text || '';
        if (!text) {
          throw new Error('Empty response received from Gemini.');
        }

        return { text, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Agent] Model ${model} failed (${err.message}). Trying next...`);
        continue;
      }
    }

    throw lastError || new Error('All Gemini candidate models failed.');
  }

  /**
   * Main Autonomous Multi-Provider AI Agent.
   * Supports Google Gemini & GLM 5.2 with hot-swapping and self-correction.
   */
  public async handleChat(input: AgentChatInput): Promise<AgentChatResponse> {
    const hasGemini = Boolean(this.ai);
    const hasGlm = Boolean(this.getGlmApiKey());

    if (!hasGemini && !hasGlm) {
      return {
        reply:
          'No AI provider is configured. Please configure GEMINI_API or GLM_API in your server environment variables.',
        actionsTaken: ['Configuration error: Missing GEMINI_API and GLM_API'],
      };
    }

    const { gameId, message, currentTheme, conversationHistory = [], authToken } = input;
    const actionsTaken: string[] = [];
    let proposedTheme: any = null;
    let changeSummary: string[] = [];
    let finalExplanation = '';

    // Determine provider preference: 'glm' | 'gemini' | 'auto'
    const requestedProvider = input.provider || process.env.AI_PROVIDER || 'auto';
    let primaryProvider: 'gemini' | 'glm' = 'gemini';

    if (requestedProvider === 'glm') {
      primaryProvider = 'glm';
    } else if (requestedProvider === 'gemini') {
      primaryProvider = 'gemini';
    } else {
      primaryProvider = hasGemini ? 'gemini' : 'glm';
    }

    actionsTaken.push(`Selected primary AI engine: ${primaryProvider.toUpperCase()}`);

    try {
      // 1. Pre-fetch Game Metadata from catalog-service via HTTP
      let gameMetadataContext = '';
      if (gameId && gameId !== 'draft') {
        const gameMeta = await this.executeTool('get_game_metadata', { gameId }, authToken);
        if (gameMeta && !('error' in gameMeta)) {
          gameMetadataContext = `\nGame Details (From Catalog Service):\n- Title: "${gameMeta.title}"\n- Genre: "${gameMeta.genre}"\n- Short Description: "${gameMeta.shortDescription}"\n- Tags: ${JSON.stringify(gameMeta.tags)}`;
          actionsTaken.push(`Loaded game profile: ${gameMeta.title}`);
        }
      }

      // Load canonical system instruction prompt
      let promptPath = path.resolve(process.cwd(), 'src/services/ai/AgentPrompt.md');
      if (!fs.existsSync(promptPath)) {
        promptPath = path.resolve(process.cwd(), 'apps/ai-service/src/services/ai/AgentPrompt.md');
      }
      const SYSTEM_INSTRUCTION = fs.existsSync(promptPath)
        ? fs.readFileSync(promptPath, 'utf8')
        : 'You are an elite Game Storefront Architect and Visual Designer for Hathor.';

      const isIncrementalEdit = /\b(only change|tweak color|change color of|change button|change only|keep my layout)\b/i.test(
        message
      );

      let contextDirective = '';
      if (
        isIncrementalEdit &&
        currentTheme &&
        Array.isArray(currentTheme.sections) &&
        currentTheme.sections.length > 0
      ) {
        contextDirective = `\nCurrent Layout (User requested minor modification to this existing layout):\n${JSON.stringify(
          currentTheme,
          null,
          2
        )}`;
      } else {
        contextDirective = `\nDirective: Create a custom storefront layout tailored to the requested aesthetic. You have full creative freedom in choosing which components to use, how to arrange them, and the overall page structure.`;
      }

      const userDesignPrompt = `User Design Request: "${message}"${gameMetadataContext}\n${contextDirective}\n\nTask: Design and assemble a storefront layout tailored to this request. You have complete creative freedom over component selection, structure, and ordering. Return ONLY the valid JSON object or invoke propose_theme_layout.`;

      // Candidate models for providers
      const geminiCandidateModels = [
        input.model,
        process.env.GEMINI_MODEL,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-pro',
      ].filter(Boolean) as string[];

      const glmCandidateModels = [
        input.model,
        process.env.GLM_MODEL,
        'z-ai/glm-5.2:free',
      ].filter(Boolean) as string[];

      let activeProvider = primaryProvider;
      let providerUsed: 'gemini' | 'glm' = activeProvider;

      // Multi-turn generation loop with self-correction headroom (Max 3 steps)
      const MAX_ITERATIONS = 3;
      let currentIteration = 0;

      // Prepare conversation formats
      const geminiContents: any[] = [];
      const glmOpenAiMessages: Array<{ role: string; content: string }> = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
      ];

      for (const msg of conversationHistory) {
        geminiContents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
        glmOpenAiMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }

      geminiContents.push({
        role: 'user',
        parts: [{ text: userDesignPrompt }],
      });
      glmOpenAiMessages.push({
        role: 'user',
        content: userDesignPrompt,
      });

      while (currentIteration < MAX_ITERATIONS) {
        currentIteration++;

        let rawJsonText = '';
        let modelUsed = '';

        try {
          if (activeProvider === 'glm' && hasGlm) {
            const glmRes = await this.generateWithGlm(glmOpenAiMessages, glmCandidateModels);
            rawJsonText = glmRes.text;
            modelUsed = glmRes.modelUsed;
            providerUsed = 'glm';
          } else if (hasGemini) {
            const geminiRes = await this.generateWithGemini(
              geminiContents,
              SYSTEM_INSTRUCTION,
              geminiCandidateModels
            );
            rawJsonText = geminiRes.text;
            modelUsed = geminiRes.modelUsed;
            providerUsed = 'gemini';
          } else if (hasGlm) {
            const glmRes = await this.generateWithGlm(glmOpenAiMessages, glmCandidateModels);
            rawJsonText = glmRes.text;
            modelUsed = glmRes.modelUsed;
            providerUsed = 'glm';
          }
        } catch (providerErr: any) {
          console.warn(`[AI Theme Agent] Provider ${activeProvider} failed:`, providerErr.message);

          // Hot-swap fallback to alternate provider if available
          if (activeProvider === 'gemini' && hasGlm) {
            actionsTaken.push(`Gemini quota/error encountered. Hot-swapping to GLM 5.2 engine...`);
            activeProvider = 'glm';
            const glmRes = await this.generateWithGlm(glmOpenAiMessages, glmCandidateModels);
            rawJsonText = glmRes.text;
            modelUsed = glmRes.modelUsed;
            providerUsed = 'glm';
          } else if (activeProvider === 'glm' && hasGemini) {
            actionsTaken.push(`GLM error encountered. Hot-swapping to Gemini engine...`);
            activeProvider = 'gemini';
            const geminiRes = await this.generateWithGemini(
              geminiContents,
              SYSTEM_INSTRUCTION,
              geminiCandidateModels
            );
            rawJsonText = geminiRes.text;
            modelUsed = geminiRes.modelUsed;
            providerUsed = 'gemini';
          } else {
            throw providerErr;
          }
        }

        try {
          const parsed = JSON.parse(rawJsonText);

          // Check if output is a Tool Calling invocation
          const toolName = (
            parsed.tool_code ||
            parsed.tool ||
            parsed.function ||
            parsed.name ||
            parsed.action ||
            ''
          ).trim();
          const toolArgs = parsed.parameters || parsed.arguments || parsed.args || parsed;

          // 1. propose_theme_layout tool or nested theme payload
          if (
            toolName === 'propose_theme_layout' ||
            (parsed.theme && typeof parsed.theme === 'object' && (Array.isArray(parsed.theme.sections) || parsed.theme.pageSettings))
          ) {
            const rawTheme = parsed.theme || toolArgs.theme || parsed;
            const normalized = normalizeThemeSections(rawTheme);
            const toolResult = await this.executeTool('propose_theme_layout', {
              theme: normalized,
              changeSummary: parsed.changeSummary || toolArgs.changeSummary || [],
              explanation: parsed.explanation || toolArgs.explanation || parsed.reply || '',
            });

            if (toolResult.validated && toolResult.theme) {
              proposedTheme = toolResult.theme;
              actionsTaken.push(
                `Theme proposal finalized via propose_theme_layout (${toolResult.theme.sections?.length || 0} sections)`
              );
              changeSummary =
                Array.isArray(toolResult.changeSummary) && toolResult.changeSummary.length > 0
                  ? toolResult.changeSummary
                  : [
                    `Assembled full-page storefront layout with ${toolResult.theme.sections?.length || 0} sections`,
                    `Configured theme palette: accent ${toolResult.theme.pageSettings?.accentColor || '#f26b21'}, bg ${toolResult.theme.pageSettings?.bg || '#080b10'}`,
                    `Populated narrative lore, feature matrices, and sidebar widgets`,
                  ];
              finalExplanation =
                toolResult.explanation ||
                `Here is the custom theme layout designed for your game based on your request. You can preview it live on the canvas, accept, or reject the proposal below.`;
              break;
            } else {
              actionsTaken.push(
                `Theme proposal rejected (${toolResult.errors?.length || 0} validation errors). Requesting self-correction from agent...`
              );
              const feedbackText = `Tool propose_theme_layout Validation Rejected with errors: ${JSON.stringify(
                toolResult.errors
              )}. Please correct these properties according to the Hathor Theme Document and return the corrected JSON object.`;

              geminiContents.push({ role: 'model', parts: [{ text: rawJsonText }] });
              geminiContents.push({ role: 'user', parts: [{ text: feedbackText }] });

              glmOpenAiMessages.push({ role: 'assistant', content: rawJsonText });
              glmOpenAiMessages.push({ role: 'user', content: feedbackText });
              continue;
            }
          }

          // 2. suggest_color_palette tool
          if (toolName === 'suggest_color_palette') {
            const themeStyle = toolArgs.themeStyle || toolArgs.style || message;
            const palette = await this.executeTool('suggest_color_palette', { themeStyle });
            actionsTaken.push(`Executed suggest_color_palette tool for "${themeStyle}"`);
            const feedbackText = `suggest_color_palette result: ${JSON.stringify(palette)}. Now please assemble the full-page theme layout and call propose_theme_layout or output the complete JSON.`;

            geminiContents.push({ role: 'model', parts: [{ text: rawJsonText }] });
            geminiContents.push({ role: 'user', parts: [{ text: feedbackText }] });

            glmOpenAiMessages.push({ role: 'assistant', content: rawJsonText });
            glmOpenAiMessages.push({ role: 'user', content: feedbackText });
            continue;
          }

          // 3. validate_theme_schema tool
          if (toolName === 'validate_theme_schema') {
            const themeJson = toolArgs.themeJson || toolArgs.theme || parsed;
            const valResult = await this.executeTool('validate_theme_schema', { themeJson });
            actionsTaken.push(`Executed validate_theme_schema tool (valid=${valResult.valid})`);
            const feedbackText = `validate_theme_schema result: ${JSON.stringify(valResult)}. If valid, finalize with propose_theme_layout. Otherwise, fix any errors.`;

            geminiContents.push({ role: 'model', parts: [{ text: rawJsonText }] });
            geminiContents.push({ role: 'user', parts: [{ text: feedbackText }] });

            glmOpenAiMessages.push({ role: 'assistant', content: rawJsonText });
            glmOpenAiMessages.push({ role: 'user', content: feedbackText });
            continue;
          }

          // 4. Direct Theme Output
          const normalized = normalizeThemeSections(parsed);
          const val = validateThemeAgainstDocument(normalized);

          if (val.valid && (normalized.sections?.length > 0 || normalized.pageSettings)) {
            proposedTheme = normalized;
            actionsTaken.push(
              `Theme proposal generated & validated via ${providerUsed.toUpperCase()} (${normalized.sections?.length || 0} sections)`
            );
            changeSummary = Array.isArray(parsed.changeSummary) && parsed.changeSummary.length > 0
              ? parsed.changeSummary
              : [
                `Assembled full-page storefront layout with ${normalized.sections?.length || 0} sections`,
                `Configured theme palette: accent ${normalized.pageSettings?.accentColor || '#f26b21'}, bg ${normalized.pageSettings?.bg || '#080b10'}`,
                `Populated narrative lore, feature matrices, and sidebar widgets`,
              ];
            finalExplanation = parsed.explanation || parsed.reply || `Here is the custom theme layout designed for your game based on your request. You can preview it live on the canvas, accept, or reject the proposal below.`;
            break;
          } else {
            actionsTaken.push(
              `Theme proposal rejected (${val.errors.length} validation errors). Requesting self-correction from agent...`
            );
            const feedbackText = `Validation Rejected with errors: ${JSON.stringify(
              val.errors.map((e) => ({ path: e.path, message: e.message }))
            )}. Please correct these properties according to the Hathor Theme Document and return the corrected JSON object.`;

            geminiContents.push({ role: 'model', parts: [{ text: rawJsonText }] });
            geminiContents.push({ role: 'user', parts: [{ text: feedbackText }] });

            glmOpenAiMessages.push({ role: 'assistant', content: rawJsonText });
            glmOpenAiMessages.push({ role: 'user', content: feedbackText });
          }
        } catch (parseErr: any) {
          actionsTaken.push(`JSON parse error on turn ${currentIteration}: ${parseErr.message}`);
          const parseFeedback = `Your response was not valid JSON (${parseErr.message}). Please return ONLY a valid, parseable JSON object matching the Hathor Storefront Schema or invoke propose_theme_layout.`;

          geminiContents.push({ role: 'model', parts: [{ text: rawJsonText }] });
          geminiContents.push({ role: 'user', parts: [{ text: parseFeedback }] });

          glmOpenAiMessages.push({ role: 'assistant', content: rawJsonText });
          glmOpenAiMessages.push({ role: 'user', content: parseFeedback });
        }
      }

      // If proposedTheme was generated, run a final verification pass
      let finalValidation: ThemeValidationResult | undefined;
      if (proposedTheme) {
        finalValidation = validateThemeAgainstDocument(proposedTheme);
      }

      let cleanReply = (finalExplanation || '').trim();
      if (
        !cleanReply ||
        cleanReply.includes('```json') ||
        cleanReply.startsWith('{') ||
        cleanReply.includes('"pageSettings"')
      ) {
        cleanReply = `Here is the custom theme layout designed for your game based on your request. You can preview it live on the canvas, accept, or reject the proposal below.`;
      }

      return {
        reply: cleanReply,
        proposedTheme,
        changeSummary: changeSummary.length > 0 ? changeSummary : undefined,
        actionsTaken,
        validationResult: finalValidation,
        providerUsed,
      };
    } catch (err: any) {
      console.error('Agentic AI execution error:', err);
      let errorDetail = err.message || 'Unknown error occurred.';
      if (err.message && err.message.includes('429')) {
        errorDetail =
          'AI API quota limit reached. Please wait a moment, check your API key credits in .env, or switch providers.';
      } else if (err.message && err.message.includes('402')) {
        errorDetail =
          'AI Provider credits exhausted (402 Payment Required). Please top up your OpenRouter/GLM credits or switch providers.';
      }
      return {
        reply: `The AI agent encountered an error: ${errorDetail}`,
        actionsTaken: [...actionsTaken, `Error: ${errorDetail}`],
      };
    }
  }
}

export const aiThemeAgent = new AiThemeAgent();
