import { describe, it, expect } from 'vitest';
import { clean, isEmail, isPhone, normalizeWebsite, rules } from '../../src/utils/validation.js';
import { isInternalPath, safeExternalHref, safeRedirectPath } from '../../src/utils/url.js';

describe('validation', () => {
  it('normalizes practice websites', () => {
    expect(normalizeWebsite('smithdental.com')).toBe('https://smithdental.com');
    expect(normalizeWebsite('  https://www.Smith-Dental.com/ ')).toBe('https://www.smith-dental.com');
    expect(normalizeWebsite('http://a.co/path')).toBe('http://a.co/path');
  });
  it('rejects unsafe or malformed websites', () => {
    for (const bad of ['', 'nodot', 'javascript:alert(1)', 'ftp://x.com', 'https://user:pw@x.com', 'http://localhost', 'https://-bad.com']) {
      expect(normalizeWebsite(bad)).toBe('');
    }
  });
  it('validates email and phone', () => {
    expect(isEmail('jane@smithdental.com')).toBe(true);
    expect(isEmail('jane@smith')).toBe(false);
    expect(isEmail('<script>@x.com')).toBe(false);
    expect(isPhone('(555) 123-4567')).toBe(true);
    expect(isPhone('1-555-123-4567')).toBe(true);
    expect(isPhone('12345')).toBe(false);
  });
  it('strips control characters and caps length', () => {
    expect(clean('a\u0000b\u0007c  ', 10)).toBe('abc');
    expect(clean('x'.repeat(500), 20)).toHaveLength(20);
  });
  it('rule helpers return messages only when invalid', () => {
    expect(rules.optionalPhone('')).toBe('');
    expect(rules.optionalPhone('123')).not.toBe('');
    expect(rules.name('J')).not.toBe('');
    expect(rules.name('Jo')).toBe('');
  });
});

describe('url safety', () => {
  it('detects internal paths', () => {
    expect(isInternalPath('/blog/')).toBe(true);
    expect(isInternalPath('//evil.com')).toBe(false);
    expect(isInternalPath('/\\evil.com')).toBe(false);
    expect(isInternalPath('https://x.com')).toBe(false);
  });
  it('blocks dangerous external schemes', () => {
    expect(safeExternalHref('javascript:alert(1)')).toBeNull();
    expect(safeExternalHref('data:text/html,hi')).toBeNull();
    expect(safeExternalHref('https://linkedin.com/x')).toBe('https://linkedin.com/x');
    expect(safeExternalHref('tel:+15555550123')).toBe('tel:+15555550123');
  });
  it('only allows same-origin redirects', () => {
    expect(safeRedirectPath('/thank-you/?a=1#b')).toBe('/thank-you/?a=1#b');
    expect(safeRedirectPath('https://evil.com')).toBe('/');
    expect(safeRedirectPath('//evil.com/x')).toBe('/');
    expect(safeRedirectPath('/\\evil.com', '/home')).toBe('/home');
  });
});
