import { describe, expect, it } from 'vitest';
import { validateThemeAgainstDocument } from '../../../apps/web/src/utils/themeValidator.js';

describe('themeValidator - ThemeDocument JSON Schema & Injection Defense', () => {
  it('validates clean designer page theme JSON with linear gradients successfully', () => {
    const validTheme = {
      pageSettings: {
        bg: 'linear-gradient(135deg, #180010 0%, #2a001a 100%)',
        titleFont: "'Cinzel', serif",
        textFont: "'Raleway', sans-serif",
        accentColor: '#ff1493',
        padTop: 0,
        padBottom: 40,
        containerWidth: 1240,
      },
      sections: [
        {
          id: 'sec_1',
          type: 'media-carousel',
          carouselHeight: 480,
          showThumbnails: true,
          heroShadowEnabled: true,
          heroShadowColor: 'rgba(24, 0, 16, 0.8)',
          carouselImages: ['https://example.com/shot1.jpg'],
        },
        {
          id: 'sec_2',
          type: 'game-header',
          headerBg: 'linear-gradient(90deg, #26001d 0%, #150010 100%)',
          headerBorder: '1px solid #353c4d',
          titleFont: "'Cinzel', serif",
          titleColor: '#ffb3de',
          descColor: '#e6edf3',
        },
        {
          id: 'sec_3',
          type: 'grid',
          gridTemplate: '2:1',
          gridGap: 32,
          gridCols: [
            {
              id: 'col_left',
              elements: [
                {
                  id: 'elem_about',
                  type: 'about-game',
                  aboutTitle: 'ABOUT THIS GAME',
                  aboutBg: 'transparent',
                  aboutBorder: 'none',
                  aboutSections: [
                    {
                      title: 'STORY OVERVIEW',
                      text: 'An epic tale across a shattered galaxy.',
                      img: 'https://example.com/lore.jpg',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = validateThemeAgainstDocument(validTheme);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects XSS script injection inside nested aboutSections text/title', () => {
    const maliciousTheme = {
      sections: [
        {
          id: 'sec_about',
          type: 'about-game',
          aboutSections: [
            {
              title: 'LORE SECTION',
              text: 'Normal intro text <script>alert("XSS in aboutSections")</script>',
              img: 'https://example.com/img.jpg',
            },
          ],
        },
      ],
    };

    const result = validateThemeAgainstDocument(maliciousTheme);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SECURITY_VIOLATION')).toBe(true);
    expect(result.errors[0].path).toContain('aboutSections[0].text');
    expect(result.errors[0].message).toContain('prohibited script tag/XSS');
  });

  it('rejects unsafe image URLs (javascript: protocol) inside nested aboutSections img', () => {
    const maliciousTheme = {
      sections: [
        {
          id: 'sec_about',
          type: 'about-game',
          aboutSections: [
            {
              title: 'HERO LORE',
              text: 'Valid description',
              img: 'javascript:alert(document.cookie)',
            },
          ],
        },
      ],
    };

    const result = validateThemeAgainstDocument(maliciousTheme);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SECURITY_VIOLATION')).toBe(true);
    expect(result.errors[0].path).toContain('aboutSections[0].img');
    expect(result.errors[0].message).toContain('prohibited script tag/XSS');
  });

  it('rejects XSS script injection attempts (<script> tag)', () => {
    const maliciousTheme = {
      sections: [
        {
          id: 'sec_xss',
          type: 'heading',
          text: '<script>alert("XSS")</script>WELCOME TO THE GAME',
        },
      ],
    };

    const result = validateThemeAgainstDocument(maliciousTheme);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SECURITY_VIOLATION')).toBe(true);
    expect(result.errors[0].message).toContain('prohibited script tag/XSS injection vector');
  });

  it('rejects CSS injection attempts (expression vector)', () => {
    const maliciousTheme = {
      sections: [
        {
          id: 'sec_css',
          type: 'game-header',
          titleColor: 'expression(alert(document.cookie))',
        },
      ],
    };

    const result = validateThemeAgainstDocument(maliciousTheme);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SECURITY_VIOLATION')).toBe(true);
    expect(result.errors[0].message).toContain('prohibited CSS injection vector');
  });

  it('rejects SQL injection attempts (UNION SELECT)', () => {
    const maliciousTheme = {
      sections: [
        {
          id: 'sec_sql',
          type: 'about-game',
          aboutTitle: "ABOUT GAME' UNION SELECT * FROM users --",
        },
      ],
    };

    const result = validateThemeAgainstDocument(maliciousTheme);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SECURITY_VIOLATION')).toBe(true);
    expect(result.errors[0].message).toContain('prohibited SQL injection vector');
  });

  it('rejects invalid color formats that are not hex, rgba, hsla, or gradient', () => {
    const invalidColorTheme = {
      sections: [
        {
          id: 'sec_bad_color',
          type: 'game-header',
          titleColor: 'not-a-color-value; body { display: none }',
        },
      ],
    };

    const result = validateThemeAgainstDocument(invalidColorTheme);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_VALUE')).toBe(true);
  });

  it('warns when attempting to modify non-editable/restricted properties (e.g. sidebarPrice)', () => {
    const restrictedPropTheme = {
      sections: [
        {
          id: 'sec_sidebar',
          type: 'sidebar-cta',
          sidebarPrice: 'FREE OVERRIDE',
        },
      ],
    };

    const result = validateThemeAgainstDocument(restrictedPropTheme);
    expect(result.warnings.some((w) => w.message.includes('non-editable/restricted'))).toBe(true);
  });
});
