import { useId, useState } from 'react';
import './Faq.css';

/**
 * Accessible accordion (button + region). One item open at a time; `defaultOpen` index or -1.
 * headingLevel controls the wrapping heading for correct document outline.
 * Use faqJsonLd(items) from components/seo/jsonld.js for FAQPage structured data.
 */
export default function Faq({ items, defaultOpen = 0, headingLevel = 3, variant = 'light', className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  const baseId = useId();
  const H = `h${headingLevel}`;

  return (
    <div className={`faq faq--${variant} ${className}`.trim()}>
      {items.map((f, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <div className="faq__item" key={f.q}>
            <H className="faq__q">
              <button
                type="button" id={btnId} aria-expanded={isOpen} aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{f.q}</span>
                <span className="faq__sign" aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
            </H>
            <div id={panelId} role="region" aria-labelledby={btnId} className="faq__a" hidden={!isOpen}>
              {typeof f.a === 'string' ? <p>{f.a}</p> : f.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
