import AppLink from './AppLink.jsx';
import './Button.css';

/**
 * Design-system buttons.
 * variant: primary (orange) | navy | outline (navy border) | outline-dark (on navy) | ghost-light (white text, slate border)
 * size: md (12×20) | lg (16×24)
 * Renders a link when `to` is given, otherwise a <button>.
 */
export default function Button({ to, variant = 'primary', size = 'lg', block = false, loading = false, className = '', children, type = 'button', ...rest }) {
  const cls = `btn btn--${variant} btn--${size}${block ? ' btn--block' : ''} ${className}`.trim();
  if (to) {
    return <AppLink to={to} className={cls} {...rest}>{children}</AppLink>;
  }
  return (
    <button type={type} className={cls} aria-busy={loading || undefined} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
