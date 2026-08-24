import { fetchGameMetadata } from './metadataTool.js';
import { suggestColorPalette } from './paletteTool.js';
import { validateThemeSchema } from './validationTool.js';
import { proposeThemeLayout, type ProposeThemeArgs } from './proposalTool.js';

export * from './declarations.js';
export * from './paletteTool.js';
export * from './metadataTool.js';
export * from './validationTool.js';
export * from './proposalTool.js';

export interface ExecuteToolOptions {
  catalogServiceUrl: string;
  authToken?: string;
}

export async function executeAgentTool(
  name: string,
  args: Record<string, any>,
  options: ExecuteToolOptions
): Promise<any> {
  switch (name) {
    case 'get_game_metadata':
      return fetchGameMetadata(args.gameId, options.catalogServiceUrl, options.authToken);

    case 'suggest_color_palette':
      return suggestColorPalette(args.themeStyle || args.style);

    case 'validate_theme_schema':
      return validateThemeSchema(args.themeJson || args.theme);

    case 'propose_theme_layout':
      return proposeThemeLayout(args as ProposeThemeArgs);

    default:
      return { error: `Unknown tool "${name}"` };
  }
}
