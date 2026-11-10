import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Faq from '../../src/components/ui/Faq.jsx';
import AppLink from '../../src/components/ui/AppLink.jsx';
import { Field } from '../../src/components/forms/Field.jsx';
import { buildHead, headToHtml, safeJson } from '../../src/components/seo/Seo.jsx';

describe('Faq', () => {
  it('toggles answers with aria-expanded', async () => {
    const user = userEvent.setup();
    render(<Faq items={[{ q: 'One?', a: 'First' }, { q: 'Two?', a: 'Second' }]} />);
    const [b1, b2] = screen.getAllByRole('button');
    expect(b1).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Second').closest('[role="region"]')).not.toBeVisible();
    await user.click(b2);
    expect(b2).toHaveAttribute('aria-expanded', 'true');
    expect(b1).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('AppLink', () => {
  const renderLink = (to) => render(<MemoryRouter><AppLink to={to}>go</AppLink></MemoryRouter>);
  it('renders internal paths as client-side links', () => {
    renderLink('/blog/');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/');
  });
  it('opens safe external links in a new tab with noopener', () => {
    renderLink('https://linkedin.com/company/x');
    const a = screen.getByRole('link');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a.getAttribute('rel')).toContain('noopener');
  });
  it('never renders a javascript: URL as a link', () => {
    renderLink('javascript:alert(1)');
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('Field', () => {
  it('wires label, error and aria-invalid', () => {
    render(<Field label="Work email" error="Enter a valid email address." value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Work email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email address.');
  });
});

describe('SEO head', () => {
  it('escapes HTML in head tags and JSON-LD', () => {
    const head = buildHead({ title: 'A "quoted" <b>title</b>', path: '/x/', jsonLd: { name: '</script><script>alert(1)</script>' } });
    const html = headToHtml(head);
    expect(html).toContain('&lt;b&gt;');
    expect(html).not.toContain('</script><script>');
    expect(safeJson({ a: '<' })).toBe('{"a":"\\u003c"}');
    expect(head.canonical).toMatch(/\/x\/$/);
  });
  it('marks noindex pages', () => {
    expect(buildHead({ noindex: true }).robots).toContain('noindex');
  });
});
