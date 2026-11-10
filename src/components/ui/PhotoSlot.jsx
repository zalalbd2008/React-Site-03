import './PhotoSlot.css';

/**
 * Art-directed image slot.
 *
 * Until real photography exists, renders the design's striped placeholder with its
 * shot description (role="img" + aria-label keeps it accessible).
 * When `src` is provided it renders an optimized <picture>:
 *   - `sources`: [{ type: 'image/avif', srcSet: '...' }, { type: 'image/webp', srcSet: '...' }]
 *   - width/height are required to reserve space and prevent layout shift (CLS)
 *   - below-the-fold images lazy-load; pass priority for the LCP/hero image.
 */
export default function PhotoSlot({
  label, tag, cap, className = '', style, ratio,
  src, sources = [], srcSet, sizes, width, height, priority = false, children,
}) {
  const s = { ...(ratio ? { aspectRatio: ratio } : null), ...style };

  if (src) {
    return (
      <picture className={`photo ${className}`.trim()} style={s}>
        {sources.map((so) => <source key={so.type} type={so.type} srcSet={so.srcSet} sizes={sizes} />)}
        <img
          src={src} srcSet={srcSet} sizes={sizes} alt={label} width={width} height={height}
          loading={priority ? 'eager' : 'lazy'} decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
        />
      </picture>
    );
  }

  return (
    <div className={`ph ${className}`.trim()} role="img" aria-label={label} style={s}>
      {children}
      {tag ? <span className="ph-tag">{tag}</span> : null}
      {cap ? <span className="ph-cap">{cap}</span> : null}
    </div>
  );
}
