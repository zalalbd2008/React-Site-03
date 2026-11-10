/** Alpha Dental Media monogram (A with ember crossbar). `inverse` = white tile for dark backgrounds. */
export function LogoMark({ size = 40, inverse = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="8" fill={inverse ? '#FFFFFF' : '#0B1F3A'} />
      <path d="M12 29L20 11l8 18" fill="none" stroke={inverse ? '#0B1F3A' : '#FFFFFF'} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 22.5h9" stroke="#E4570F" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}
