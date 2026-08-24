import { validateThemeAgainstDocument } from '../../../utils/themeValidator.js';
import { normalizeThemeSections } from '../normalizer.js';

export function validateThemeSchema(themeJson: any) {
  const normalized = normalizeThemeSections(themeJson);
  const result = validateThemeAgainstDocument(normalized);
  return {
    valid: result.valid,
    errors: result.errors.map((e) => ({ path: e.path, message: e.message, code: e.code })),
    warnings: result.warnings.map((w) => ({ path: w.path, message: w.message })),
  };
}
