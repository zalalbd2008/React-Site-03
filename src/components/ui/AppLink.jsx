import { forwardRef, useCallback } from 'react';
import { Link, NavLink } from 'react-router';
import { preloadPath } from '../../routes/preload.js';
import { isInternalPath, safeExternalHref } from '../../utils/url.js';
import { suspendSmoothScroll } from '../../utils/scroll.js';

/**
 * The one link component for the whole site.
 * - Internal paths → client-side <Link> (no page reload) with chunk prefetch on intent.
 * - External URLs → validated <a>; unsafe schemes (javascript:, data:) render as plain text.
 * - Hash-only links ("#faq") → plain in-page anchors.
 */
const AppLink = forwardRef(function AppLink({ to, href, nav = false, onMouseEnter, onFocus, onTouchStart, onClick, children, ...rest }, ref) {
  const target = to ?? href ?? '';

  const prefetch = useCallback(() => { preloadPath(target); }, [target]);

  if (isInternalPath(target)) {
    const Comp = nav ? NavLink : Link;
    return (
      <Comp
        ref={ref}
        to={target}
        onMouseEnter={(e) => { prefetch(); onMouseEnter?.(e); }}
        onFocus={(e) => { prefetch(); onFocus?.(e); }}
        onTouchStart={(e) => { prefetch(); onTouchStart?.(e); }}
        onClick={(e) => {
          // Different page → jump, don't animate; same page #anchor → keep smooth scrolling
          if (target.split(/[?#]/)[0] !== window.location.pathname) suspendSmoothScroll();
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </Comp>
    );
  }

  if (target.startsWith('#')) {
    return <a ref={ref} href={target} onClick={onClick} {...rest}>{children}</a>;
  }

  const safe = safeExternalHref(target);
  if (!safe) return <span className={rest.className} style={rest.style}>{children}</span>;
  const isWeb = /^https?:/i.test(safe);
  return (
    <a ref={ref} href={safe} onClick={onClick} {...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  );
});

export default AppLink;
