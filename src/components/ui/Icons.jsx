/* 24px outline icons, 2px stroke, round caps — per the design system. All decorative (aria-hidden). */

const base = (size, stroke, strokeWidth) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth,
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false',
});

/** Generic outline icon from a path `d` string (used for data-driven icon lists). */
export const PathIcon = ({ d, size = 24, color = 'currentColor', width = 2, ...p }) => (
  <svg {...base(size, color, width)} {...p}><path d={d} /></svg>
);

export const CheckIcon = ({ size = 20, color = 'var(--c-teal)', ...p }) => (
  <svg {...base(size, color, 2.8)} {...p}><path d="M5 12l5 5L20 7" /></svg>
);
export const CrossIcon = ({ size = 20, color = 'var(--c-red)', ...p }) => (
  <svg {...base(size, color, 2.8)} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const PhoneIcon = ({ size = 18, color = 'var(--c-cta)', ...p }) => (
  <svg {...base(size, color, 2)} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" /></svg>
);
export const MailIcon = ({ size = 22, color = 'currentColor', ...p }) => (
  <svg {...base(size, color, 2)} {...p}><path d="M3 6h18v12H3zM3 7l9 6 9-6" /></svg>
);
export const PinIcon = ({ size = 22, color = 'currentColor', ...p }) => (
  <svg {...base(size, color, 2)} {...p}><path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const ChevronDown = ({ size = 12, ...p }) => (
  <svg {...base(size, 'currentColor', 2.6)} {...p}><path d="M6 9l6 6 6-6" /></svg>
);
export const SearchIcon = ({ size = 20, color = 'var(--c-muted)', ...p }) => (
  <svg {...base(size, color, 2)} {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
export const MenuIcon = ({ size = 22, ...p }) => (
  <svg {...base(size, 'currentColor', 2.4)} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = ({ size = 22, ...p }) => (
  <svg {...base(size, 'currentColor', 2.4)} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const ArrowRight = ({ size = 18, ...p }) => (
  <svg {...base(size, 'currentColor', 2.2)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const PlayIcon = ({ size = 14, color = 'var(--c-navy)', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" {...p}><path d="M7 4l13 8-13 8z" /></svg>
);
