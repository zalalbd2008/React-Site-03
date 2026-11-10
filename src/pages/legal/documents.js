import { PATHS } from '../../config/site.js';

/**
 * Legal document templates from the "13 · Legal Template" artboard.
 * Bracketed text is placeholder structure — final wording must come from qualified counsel.
 */
const S = (n, h, b) => ({ n, h, b });

export const LEGAL_DOCS = {
  privacy: {
    t: 'Privacy Policy',
    path: PATHS.privacy,
    intro: 'This policy explains what information Alpha Dental Media collects through this website, how we use it, and the choices you have.',
    sections: [
      S(1, 'Information we collect', '[Contact details you submit in forms; technical data such as IP address, browser and pages visited; cookie data as described in our Cookie Policy.]'),
      S(2, 'How we use information', '[To respond to inquiries, deliver audits and services, improve the website, and send marketing emails you opt into.]'),
      S(3, 'Patient health information', '[We do not request protected health information through this website. Please do not submit it. Client PHI handling is governed by separate agreements.]'),
      S(4, 'Sharing and service providers', '[Categories of processors: hosting, analytics, CRM, email. We do not sell personal information.]'),
      S(5, 'Your rights and choices', '[Access, correction, deletion and opt-out rights, including state-specific rights where applicable.]'),
      S(6, 'Data retention and security', '[Retention periods and safeguards.]'),
    ],
  },
  terms: {
    t: 'Terms & Conditions',
    path: PATHS.terms,
    intro: 'These terms govern your use of the Alpha Dental Media website and any free tools or resources offered on it.',
    sections: [
      S(1, 'Use of the website', '[Permitted use, restrictions.]'),
      S(2, 'Free audits and tools', '[Audits are informational, not guarantees of results.]'),
      S(3, 'Intellectual property', '[Ownership of content, guides and templates.]'),
      S(4, 'No guarantee of results', '[Marketing outcomes vary and are not guaranteed.]'),
      S(5, 'Limitation of liability', '[To be drafted by counsel.]'),
      S(6, 'Governing law', '[Jurisdiction.]'),
    ],
  },
  cookies: {
    t: 'Cookie Policy',
    path: PATHS.cookies,
    intro: 'This policy describes the cookies and similar technologies used on this website and how to control them.',
    sections: [
      S(1, 'What cookies are', '[Plain-language definition.]'),
      S(2, 'Cookies we use', '[Table: strictly necessary, analytics, marketing — name, provider, purpose, duration.]'),
      S(3, 'Managing preferences', '[Consent banner controls and browser settings.]'),
      S(4, 'Changes to this policy', '[How updates are communicated.]'),
    ],
  },
  disclaimer: {
    t: 'Disclaimer',
    path: PATHS.disclaimer,
    intro: 'Content on this website is provided for general information about dental practice marketing.',
    sections: [
      S(1, 'Not legal or compliance advice', '[Guidance on HIPAA, advertising rules and state board regulations is general; consult counsel.]'),
      S(2, 'Results', '[Case study results are specific to those clients and not typical or guaranteed.]'),
      S(3, 'Third-party links', '[No responsibility for external sites.]'),
      S(4, 'Trademarks', '[Google, Meta and other names are trademarks of their owners; no endorsement implied.]'),
    ],
  },
  // Not in the design's tab set; written in the same template style for the footer's Accessibility link.
  accessibility: {
    t: 'Accessibility Statement',
    tab: 'Accessibility',
    path: PATHS.accessibility,
    intro: 'Alpha Dental Media wants everyone, including people with disabilities, to be able to use this website.',
    sections: [
      S(1, 'Our commitment', '[Target conformance level: WCAG 2.2 Level AA. Scope of the statement.]'),
      S(2, 'Measures we take', '[Semantic markup, keyboard navigation, visible focus, color contrast checks, text alternatives, testing approach.]'),
      S(3, 'Known limitations', '[Any content or features that do not yet meet the standard, and planned fixes.]'),
      S(4, 'Feedback and assistance', '[How to report a barrier or request content in another format; expected response time.]'),
      S(5, 'Review date', '[Date this statement was last reviewed.]'),
    ],
  },
};

/** Order of the document tabs. */
export const LEGAL_ORDER = ['privacy', 'terms', 'cookies', 'disclaimer', 'accessibility'];
