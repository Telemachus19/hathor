import ThemeDocument from './ThemeDocument.json';

export interface ValidationError {
  path: string;
  message: string;
  code:
    | 'INVALID_ROOT'
    | 'SECURITY_VIOLATION'
    | 'DISALLOWED_PROPERTY'
    | 'TYPE_MISMATCH'
    | 'BOUNDS_EXCEEDED'
    | 'INVALID_VALUE';
}

export interface ValidationWarning {
  path: string;
  message: string;
}

export interface ThemeValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Security rule regex compilations
const CSS_SECURITY_PATTERNS = ThemeDocument.securityRules.disallowRawCSS.forbiddenPatterns.map(
  (p) => new RegExp(p, 'i')
);
const SCRIPT_SECURITY_PATTERNS = ThemeDocument.securityRules.disallowScriptTags.forbiddenPatterns.map(
  (p) => new RegExp(p, 'i')
);
const SQL_SECURITY_PATTERNS = ThemeDocument.securityRules.disallowSQLKeywords.forbiddenPatterns.map(
  (p) => new RegExp(p, 'i')
);

const COLOR_REGEX = new RegExp(ThemeDocument.globalConstraints.allowedColorPattern, 'i');
const BORDER_REGEX = new RegExp(ThemeDocument.globalConstraints.allowedBorderPattern, 'i');

// Map section type strings to component keys in ThemeDocument.json
const SECTION_TYPE_TO_COMPONENT_KEY: Record<string, string> = {
  'game-header': 'GameHeader',
  'ownership-banner': 'OwnershipBanner',
  'about-game': 'AboutGame',
  'system-reqs': 'SystemReqs',
  'user-reviews': 'UserReviews',
  'sidebar-cta': 'SidebarCTA',
  'sidebar-info': 'SidebarInfo',
  'sidebar-ratings': 'SidebarRatings',
  'sidebar-community': 'SidebarCommunity',
  recommendations: 'Recommendations',
  'media-carousel': 'MediaCarousel',
  'game-hero': 'GameHero',
  carousel: 'CarouselShowcase',
  heading: 'HeadingBlock',
  text: 'TextBlock',
  image: 'ImageBlock',
  button: 'ButtonBlock',
  features: 'FeaturesGrid',
  'two-col': 'TwoColumns',
  cta: 'CTABlock',
  divider: 'Divider',
  spacer: 'Spacer',
  grid: 'CustomGrid',
};

/**
 * Validates a theme JSON object against the authoritative ThemeDocument specification
 * and anti-injection security rules.
 */
export function validateThemeAgainstDocument(userThemeJson: unknown): ThemeValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!userThemeJson || typeof userThemeJson !== 'object' || Array.isArray(userThemeJson)) {
    errors.push({
      path: 'root',
      message: 'Theme JSON must be a valid root object containing pageSettings and/or sections.',
      code: 'INVALID_ROOT',
    });
    return { valid: false, errors, warnings };
  }

  const themeObj = userThemeJson as Record<string, any>;

  // 1. Validate pageSettings (if provided)
  if (themeObj.pageSettings !== undefined) {
    if (typeof themeObj.pageSettings !== 'object' || themeObj.pageSettings === null) {
      errors.push({
        path: 'pageSettings',
        message: 'pageSettings must be an object.',
        code: 'TYPE_MISMATCH',
      });
    } else {
      validateProperties(
        themeObj.pageSettings,
        'pageSettings',
        ThemeDocument.pageSettingsProperties as Record<string, any>,
        errors,
        warnings
      );
    }
  }

  // 2. Extract sections array
  const sections = Array.isArray(themeObj.sections)
    ? themeObj.sections
    : Array.isArray(themeObj)
    ? themeObj
    : null;

  if (sections) {
    sections.forEach((section: any, idx: number) => {
      validateSection(section, `sections[${idx}]`, errors, warnings);
    });
  } else if (themeObj.pageSettings === undefined) {
    errors.push({
      path: 'root',
      message: 'Theme payload must contain a sections array or pageSettings object.',
      code: 'INVALID_ROOT',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateSection(
  section: any,
  pathPrefix: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  if (!section || typeof section !== 'object') {
    errors.push({
      path: pathPrefix,
      message: 'Section must be an object.',
      code: 'TYPE_MISMATCH',
    });
    return;
  }

  const type = section.type;
  if (!type || typeof type !== 'string') {
    errors.push({
      path: `${pathPrefix}.type`,
      message: 'Section must have a valid string "type" property.',
      code: 'INVALID_VALUE',
    });
    return;
  }

  // Common section layout validation
  validateProperties(
    section,
    pathPrefix,
    ThemeDocument.commonSectionProperties as Record<string, any>,
    errors,
    warnings
  );

  const componentKey = SECTION_TYPE_TO_COMPONENT_KEY[type];
  if (!componentKey) {
    warnings.push({
      path: `${pathPrefix}.type`,
      message: `Unknown section type "${type}". It will be rendered using fallback default rules.`,
    });
    return;
  }

  const compSpec = (ThemeDocument.components as Record<string, any>)[componentKey];
  if (compSpec && compSpec.editableProperties) {
    validateProperties(
      section,
      pathPrefix,
      compSpec.editableProperties,
      errors,
      warnings
    );
  }

  // Handle grid nested columns and elements recursively
  if (type === 'grid' && Array.isArray(section.gridCols)) {
    section.gridCols.forEach((col: any, colIdx: number) => {
      const colPath = `${pathPrefix}.gridCols[${colIdx}]`;
      if (col && Array.isArray(col.elements)) {
        col.elements.forEach((elem: any, elemIdx: number) => {
          validateSection(elem, `${colPath}.elements[${elemIdx}]`, errors, warnings);
        });
      }
    });
  }
}

function validateProperties(
  obj: Record<string, any>,
  pathPrefix: string,
  schemaProps: Record<string, any>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  for (const [propName, propValue] of Object.entries(obj)) {
    if (propName === 'id' || propName === 'type' || propName === 'gridCols' || propName === 'elements') {
      continue;
    }

    const propPath = `${pathPrefix}.${propName}`;
    const propSpec = schemaProps[propName];

    // DEEP RECURSIVE SECURITY SCAN across strings, nested arrays, and objects
    deepScanSecurity(propValue, propPath, errors);

    if (!propSpec) {
      continue; // Unrecognized property; allowed unless strict mode enforced
    }

    // Check if property is non-editable
    if (propSpec.editable === false) {
      warnings.push({
        path: propPath,
        message: `Property "${propName}" is non-editable/restricted by theme specification. Value will be ignored/overridden at runtime.`,
      });
      continue;
    }

    // Sanitization & Value Validation
    const sanitization = propSpec.sanitization;

    if (sanitization === 'hex_color') {
      if (typeof propValue === 'string' && !COLOR_REGEX.test(propValue.trim())) {
        errors.push({
          path: propPath,
          message: `Invalid color format "${propValue}". Must be hex, rgba, hsla, transparent, or linear/radial gradient.`,
          code: 'INVALID_VALUE',
        });
      }
    } else if (sanitization === 'border_color') {
      if (typeof propValue === 'string' && !BORDER_REGEX.test(propValue.trim()) && !COLOR_REGEX.test(propValue.trim())) {
        errors.push({
          path: propPath,
          message: `Invalid border format "${propValue}". Must be hex, rgba, transparent, none, or border shorthand (e.g. 1px solid #353c4d).`,
          code: 'INVALID_VALUE',
        });
      }
    } else if (sanitization === 'enum_check') {
      const allowedValues = propSpec.allowedValues || getRefValues(propSpec.allowedValuesRef);
      if (allowedValues && !allowedValues.includes(propValue)) {
        errors.push({
          path: propPath,
          message: `Value "${propValue}" is not in the allowed enumeration list: [${allowedValues.join(', ')}].`,
          code: 'INVALID_VALUE',
        });
      }
    } else if (sanitization === 'numeric_bound') {
      if (typeof propValue !== 'number' || isNaN(propValue)) {
        errors.push({
          path: propPath,
          message: `Property "${propName}" must be a valid number.`,
          code: 'TYPE_MISMATCH',
        });
      } else {
        if (propSpec.min !== undefined && propValue < propSpec.min) {
          errors.push({
            path: propPath,
            message: `Value ${propValue} is below minimum allowed bound of ${propSpec.min}.`,
            code: 'BOUNDS_EXCEEDED',
          });
        }
        if (propSpec.max !== undefined && propValue > propSpec.max) {
          errors.push({
            path: propPath,
            message: `Value ${propValue} exceeds maximum allowed bound of ${propSpec.max}.`,
            code: 'BOUNDS_EXCEEDED',
          });
        }
      }
    } else if (sanitization === 'plain_text') {
      if (typeof propValue === 'string' && propSpec.maxLength && propValue.length > propSpec.maxLength) {
        errors.push({
          path: propPath,
          message: `Text length (${propValue.length}) exceeds maximum limit of ${propSpec.maxLength} characters.`,
          code: 'BOUNDS_EXCEEDED',
        });
      }
    } else if (sanitization === 'safe_url') {
      if (typeof propValue === 'string' && propValue.trim()) {
        const urlLower = propValue.trim().toLowerCase();
        const hasSafeProtocol = ThemeDocument.globalConstraints.allowedUrlProtocols.some((p) =>
          urlLower.startsWith(p)
        );
        if (!hasSafeProtocol && !urlLower.startsWith('/')) {
          errors.push({
            path: propPath,
            message: `URL "${propValue}" uses an unsafe protocol. Must start with http:, https:, data:, or relative path /.`,
            code: 'SECURITY_VIOLATION',
          });
        }
      }
    }
  }
}

/**
 * Deep recursive scanner traversing strings, nested arrays, and objects
 * to ensure no injection vectors are hidden in child properties (e.g. aboutSections[0].title/text/img).
 */
function deepScanSecurity(val: unknown, path: string, errors: ValidationError[]) {
  if (val === null || val === undefined) return;

  if (typeof val === 'string') {
    checkStringSecurity(val, path, errors);
  } else if (Array.isArray(val)) {
    val.forEach((item, idx) => {
      deepScanSecurity(item, `${path}[${idx}]`, errors);
    });
  } else if (typeof val === 'object') {
    for (const [key, propVal] of Object.entries(val)) {
      const currentPath = `${path}.${key}`;
      deepScanSecurity(propVal, currentPath, errors);

      // Validate image URLs inside nested objects (e.g. aboutSections[0].img)
      if (
        (key === 'img' || key === 'imageSrc' || key === 'src') &&
        typeof propVal === 'string' &&
        propVal.trim()
      ) {
        const urlLower = propVal.trim().toLowerCase();
        const hasSafeProtocol = ThemeDocument.globalConstraints.allowedUrlProtocols.some((p) =>
          urlLower.startsWith(p)
        );
        if (!hasSafeProtocol && !urlLower.startsWith('/')) {
          errors.push({
            path: currentPath,
            message: `URL "${propVal}" uses an unsafe protocol. Must start with http:, https:, data:, or relative path /.`,
            code: 'SECURITY_VIOLATION',
          });
        }
      }
    }
  }
}

function checkStringSecurity(val: string, path: string, errors: ValidationError[]) {
  for (const pattern of SCRIPT_SECURITY_PATTERNS) {
    if (pattern.test(val)) {
      errors.push({
        path,
        message: `Security Violation: String contains prohibited script tag/XSS injection vector matching "${pattern.source}".`,
        code: 'SECURITY_VIOLATION',
      });
      return;
    }
  }

  for (const pattern of CSS_SECURITY_PATTERNS) {
    if (pattern.test(val)) {
      errors.push({
        path,
        message: `Security Violation: String contains prohibited CSS injection vector matching "${pattern.source}".`,
        code: 'SECURITY_VIOLATION',
      });
      return;
    }
  }

  for (const pattern of SQL_SECURITY_PATTERNS) {
    if (pattern.test(val)) {
      errors.push({
        path,
        message: `Security Violation: String contains prohibited SQL injection vector matching "${pattern.source}".`,
        code: 'SECURITY_VIOLATION',
      });
      return;
    }
  }
}

function getRefValues(refPath?: string): string[] | undefined {
  if (!refPath) return undefined;
  if (refPath === 'globalConstraints.allowedFonts') return ThemeDocument.globalConstraints.allowedFonts;
  if (refPath === 'globalConstraints.allowedFontWeights') return ThemeDocument.globalConstraints.allowedFontWeights;
  if (refPath === 'globalConstraints.allowedAlignments') return ThemeDocument.globalConstraints.allowedAlignments;
  if (refPath === 'globalConstraints.allowedTextTransforms') return ThemeDocument.globalConstraints.allowedTextTransforms;
  if (refPath === 'globalConstraints.allowedGridTemplates') return ThemeDocument.globalConstraints.allowedGridTemplates;
  if (refPath === 'globalConstraints.allowedBackgroundSizes') return ThemeDocument.globalConstraints.allowedBackgroundSizes;
  if (refPath === 'globalConstraints.allowedBackgroundPositions') return ThemeDocument.globalConstraints.allowedBackgroundPositions;
  if (refPath === 'globalConstraints.allowedBackgroundRepeats') return ThemeDocument.globalConstraints.allowedBackgroundRepeats;
  if (refPath === 'globalConstraints.allowedBackgroundAttachments') return ThemeDocument.globalConstraints.allowedBackgroundAttachments;
  return undefined;
}
