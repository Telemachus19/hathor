import { validateThemeAgainstDocument } from '../../../utils/themeValidator.js';
import { normalizeThemeSections } from '../normalizer.js';

export interface ProposeThemeArgs {
  theme: any;
  changeSummary?: string[];
  explanation?: string;
  reply?: string;
}

export function proposeThemeLayout(args: ProposeThemeArgs) {
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
    explanation: args.explanation || args.reply || '',
  };
}
