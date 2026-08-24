import { GoogleGenAI } from '@google/genai';
import {
  validateThemeAgainstDocument,
  type ThemeValidationResult,
} from '../../utils/themeValidator.js';
import type { AgentChatInput, AgentChatResponse } from './types.js';
import { normalizeThemeSections } from './normalizer.js';
import { getSystemInstruction, buildUserDesignPrompt } from './prompt.js';
import { executeAgentTool, type ProposeThemeArgs } from './tools/index.js';
import { generateWithGemini, generateWithGlm } from './providers/index.js';

function extractJsonPayload(text: string): any {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty response from model');
  }

  const cleaned = text.trim();

  // 1. Strip markdown code fences if present (e.g. ```json ... ```)
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const targetStr = fenceMatch ? fenceMatch[1].trim() : cleaned;

  try {
    return JSON.parse(targetStr);
  } catch {
    // 2. Try to find the outermost { ... }
    const firstBrace = targetStr.indexOf('{');
    const lastBrace = targetStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const substr = targetStr.substring(firstBrace, lastBrace + 1);
      return JSON.parse(substr);
    }
    throw new Error('No valid JSON object found in LLM response.');
  }
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
      if (gameId && gameId !== 'draft' && gameId !== 'draft_new_game') {
        try {
          const gameMeta = await executeAgentTool(
            'get_game_metadata',
            { gameId },
            { catalogServiceUrl: this.getCatalogServiceUrl(), authToken }
          );
          if (gameMeta && !('error' in gameMeta)) {
            gameMetadataContext = `\nGame Details (From Catalog Service):\n- Title: "${gameMeta.title}"\n- Genre: "${gameMeta.genre}"\n- Short Description: "${gameMeta.shortDescription}"\n- Tags: ${JSON.stringify(gameMeta.tags)}`;
            actionsTaken.push(`Loaded game profile: ${gameMeta.title}`);
          }
        } catch {
          // Gracefully continue without metadata if catalog lookup fails
        }
      }

      // Load canonical system instruction prompt
      const systemInstruction = getSystemInstruction();
      const userDesignPrompt = buildUserDesignPrompt(message, gameMetadataContext, currentTheme);

      // Candidate models for providers
      const geminiCandidateModels = [
        input.model,
        process.env.GEMINI_MODEL,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-pro',
      ].filter(Boolean) as string[];

      const glmCandidateModels = [input.model, process.env.GLM_MODEL, 'z-ai/glm-5.2:free'].filter(
        Boolean
      ) as string[];

      let activeProvider = primaryProvider;
      let providerUsed: 'gemini' | 'glm' = activeProvider;

      // Multi-turn generation loop with self-correction headroom (Max 3 steps)
      const MAX_ITERATIONS = 3;
      let currentIteration = 0;

      // Prepare conversation formats
      const geminiContents: any[] = [];
      const glmOpenAiMessages: Array<{ role: string; content: string }> = [
        { role: 'system', content: systemInstruction },
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
            const glmRes = await generateWithGlm(
              this.getGlmApiKey(),
              this.getGlmBaseUrl(),
              glmOpenAiMessages,
              glmCandidateModels
            );
            rawJsonText = glmRes.text;
            modelUsed = glmRes.modelUsed;
            providerUsed = 'glm';
          } else if (hasGemini) {
            const geminiRes = await generateWithGemini(
              this.ai,
              geminiContents,
              systemInstruction,
              geminiCandidateModels
            );
            rawJsonText = geminiRes.text;
            modelUsed = geminiRes.modelUsed;
            providerUsed = 'gemini';
          } else if (hasGlm) {
            const glmRes = await generateWithGlm(
              this.getGlmApiKey(),
              this.getGlmBaseUrl(),
              glmOpenAiMessages,
              glmCandidateModels
            );
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
            const glmRes = await generateWithGlm(
              this.getGlmApiKey(),
              this.getGlmBaseUrl(),
              glmOpenAiMessages,
              glmCandidateModels
            );
            rawJsonText = glmRes.text;
            modelUsed = glmRes.modelUsed;
            providerUsed = 'glm';
          } else if (activeProvider === 'glm' && hasGemini) {
            actionsTaken.push(`GLM error encountered. Hot-swapping to Gemini engine...`);
            activeProvider = 'gemini';
            const geminiRes = await generateWithGemini(
              this.ai,
              geminiContents,
              systemInstruction,
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
          const parsed = extractJsonPayload(rawJsonText);

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

          // 1. suggest_color_palette tool
          if (toolName === 'suggest_color_palette') {
            const themeStyle = toolArgs.themeStyle || toolArgs.style || message;
            const palette = await executeAgentTool(
              'suggest_color_palette',
              { themeStyle },
              { catalogServiceUrl: this.getCatalogServiceUrl(), authToken }
            );
            actionsTaken.push(`Executed suggest_color_palette tool for "${themeStyle}"`);
            const feedbackText = `suggest_color_palette result: ${JSON.stringify(palette)}. Now please assemble the full-page theme layout and call propose_theme_layout or output the complete JSON with 4-8 sections.`;

            geminiContents.push({ role: 'model', parts: [{ text: rawJsonText }] });
            geminiContents.push({ role: 'user', parts: [{ text: feedbackText }] });

            glmOpenAiMessages.push({ role: 'assistant', content: rawJsonText });
            glmOpenAiMessages.push({ role: 'user', content: feedbackText });
            continue;
          }

          // 2. validate_theme_schema tool
          if (toolName === 'validate_theme_schema') {
            const themeJson = toolArgs.themeJson || toolArgs.theme || parsed;
            const valResult = await executeAgentTool(
              'validate_theme_schema',
              { themeJson },
              { catalogServiceUrl: this.getCatalogServiceUrl(), authToken }
            );
            actionsTaken.push(`Executed validate_theme_schema tool (valid=${valResult.valid})`);
            const feedbackText = `validate_theme_schema result: ${JSON.stringify(valResult)}. If valid, finalize with propose_theme_layout. Otherwise, fix any errors.`;

            geminiContents.push({ role: 'model', parts: [{ text: rawJsonText }] });
            geminiContents.push({ role: 'user', parts: [{ text: feedbackText }] });

            glmOpenAiMessages.push({ role: 'assistant', content: rawJsonText });
            glmOpenAiMessages.push({ role: 'user', content: feedbackText });
            continue;
          }

          // 3. Theme Proposal (from propose_theme_layout tool OR direct JSON)
          const rawThemeCandidate =
            parsed.proposedTheme ||
            parsed.theme ||
            parsed.layout ||
            toolArgs.proposedTheme ||
            toolArgs.theme ||
            toolArgs.layout ||
            parsed;

          const normalized = normalizeThemeSections(rawThemeCandidate);
          const hasSections = Array.isArray(normalized.sections) && normalized.sections.length > 0;
          const val = validateThemeAgainstDocument(normalized);

          if (val.valid && hasSections) {
            proposedTheme = normalized;
            actionsTaken.push(
              `Theme proposal generated & validated via ${providerUsed.toUpperCase()} (${normalized.sections.length} sections)`
            );
            changeSummary =
              Array.isArray(parsed.changeSummary || toolArgs.changeSummary) &&
              (parsed.changeSummary || toolArgs.changeSummary).length > 0
                ? parsed.changeSummary || toolArgs.changeSummary
                : [
                    `Assembled full-page storefront layout with ${normalized.sections.length} sections`,
                    `Configured theme palette: accent ${normalized.pageSettings?.accentColor || '#f26b21'}, bg ${normalized.pageSettings?.bg || '#080b10'}`,
                    `Populated narrative lore, feature matrices, and sidebar widgets`,
                  ];
            finalExplanation =
              parsed.explanation ||
              parsed.reply ||
              toolArgs.explanation ||
              toolArgs.reply ||
              `Here is the custom theme layout designed for your game based on your request. You can preview it live on the canvas, accept, or reject the proposal below.`;
            break;
          } else if (val.valid && !hasSections) {
            actionsTaken.push(
              `Theme proposal contained 0 sections. Requesting full layout generation from agent...`
            );
            const feedbackText = `Your proposal contained 0 sections. You MUST assemble a full-page storefront layout with 4-8 rich sections (e.g. "media-carousel", "game-header", "grid" with "about-game", "system-reqs", "sidebar-cta", "sidebar-info", "sidebar-ratings", "user-reviews", "recommendations"). Please return the complete JSON object with all sections populated.`;

            geminiContents.push({ role: 'model', parts: [{ text: rawJsonText }] });
            geminiContents.push({ role: 'user', parts: [{ text: feedbackText }] });

            glmOpenAiMessages.push({ role: 'assistant', content: rawJsonText });
            glmOpenAiMessages.push({ role: 'user', content: feedbackText });
            continue;
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
            continue;
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
        proposedTheme: proposedTheme || undefined,
        changeSummary: proposedTheme && changeSummary.length > 0 ? changeSummary : undefined,
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
