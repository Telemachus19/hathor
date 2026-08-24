import { Type, type FunctionDeclaration } from '@google/genai';

export const getGameMetadataTool: FunctionDeclaration = {
  name: 'get_game_metadata',
  description:
    'Fetches the game title, genre, short description, tags, and banner/screenshot URLs from the catalog service for the given game ID.',
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

export const suggestColorPaletteTool: FunctionDeclaration = {
  name: 'suggest_color_palette',
  description:
    'Returns curated, high-contrast, theme-appropriate color palettes matching a requested mood, genre, or style.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      themeStyle: {
        type: Type.STRING,
        description:
          'The style or aesthetic (e.g., "cyberpunk", "dark-gothic", "sci-fi", "minimalist", "retro-arcade", "fantasy", "egyptian-gold").',
      },
    },
    required: ['themeStyle'],
  },
};

export const validateThemeSchemaTool: FunctionDeclaration = {
  name: 'validate_theme_schema',
  description:
    'Validates a candidate theme JSON object against Hathor ThemeDocument rules and security constraints. Returns whether it is valid and any specific error paths/messages for self-correction.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      themeJson: {
        type: Type.OBJECT,
        description:
          'The candidate theme JSON object containing pageSettings and/or sections array to validate.',
      },
    },
    required: ['themeJson'],
  },
};

export const proposeThemeLayoutTool: FunctionDeclaration = {
  name: 'propose_theme_layout',
  description:
    'Finalizes and proposes a validated theme layout for Human-in-the-Loop review by the creator. Call this tool when your theme is valid and ready.',
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
        description:
          'A list of 2-5 concise bullet points explaining the visual/layout changes made.',
      },
      explanation: {
        type: Type.STRING,
        description:
          'A friendly 1-2 sentence message summarizing the theme design for the creator.',
      },
    },
    required: ['theme', 'changeSummary', 'explanation'],
  },
};

export const AGENT_TOOL_DECLARATIONS = [
  getGameMetadataTool,
  suggestColorPaletteTool,
  validateThemeSchemaTool,
  proposeThemeLayoutTool,
];
