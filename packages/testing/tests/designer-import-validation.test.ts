import { describe, expect, it } from 'vitest';
import { validateThemeAgainstDocument } from '../../../apps/web/src/utils/themeValidator.js';

describe('DesignerPage JSON Import Validation Flow', () => {
  it('allows valid layout JSON with sections and pageSettings', () => {
    const validJson = JSON.stringify({
      pageSettings: {
        bg: '#180010',
        titleFont: "'Cinzel', serif",
        textFont: "'Raleway', sans-serif",
        accentColor: '#ff1493',
        padTop: 0,
        padBottom: 40,
        containerWidth: 1240,
      },
      sections: [
        {
          id: 'sec_hero',
          type: 'media-carousel',
          carouselHeight: 480,
          showThumbnails: true,
          carouselImages: ['https://example.com/hero.jpg'],
        },
        {
          id: 'sec_header',
          type: 'game-header',
          headerBg: '#26001d',
          headerBorder: 'none',
          titleColor: '#ffb3de',
        },
      ],
    });

    const parsed = JSON.parse(validJson);
    const result = validateThemeAgainstDocument(parsed);
    expect(result.valid).toBe(true);
  });

  it('blocks layout JSON containing XSS script injection and returns error details', () => {
    const maliciousJson = JSON.stringify({
      sections: [
        {
          id: 'sec_xss',
          type: 'heading',
          text: '<script>alert("Hacked")</script>',
        },
      ],
    });

    const parsed = JSON.parse(maliciousJson);
    const result = validateThemeAgainstDocument(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].code).toBe('SECURITY_VIOLATION');
    expect(result.errors[0].message).toContain('prohibited script tag/XSS');
  });

  it('blocks layout JSON containing CSS injection vectors', () => {
    const maliciousCssJson = JSON.stringify({
      sections: [
        {
          id: 'sec_css',
          type: 'text',
          color: 'expression(alert(1))',
        },
      ],
    });

    const parsed = JSON.parse(maliciousCssJson);
    const result = validateThemeAgainstDocument(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('SECURITY_VIOLATION');
    expect(result.errors[0].message).toContain('prohibited CSS injection');
  });
});
