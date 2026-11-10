import { useId } from 'react';
import './forms.css';

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

/**
 * Labelled form control with design-system error state.
 * `as` = 'input' | 'select' | 'textarea'. Pass `options` for selects.
 */
export function Field({ label, error = '', hint, as = 'input', options = [], className = '', id: idProp, dark = false, ...control }) {
  const autoId = useId();
  const id = idProp || autoId;
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  const common = {
    id,
    className: `field__control${error ? ' is-invalid' : ''}`,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': describedBy,
    ...control,
  };

  return (
    <div className={`field${dark ? ' field--dark' : ''} ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>{label}</label>
      {as === 'select' ? (
        <select {...common}>
          {options.map((o) => {
            const value = typeof o === 'string' ? o : o.value;
            const text = typeof o === 'string' ? o : o.label;
            return <option key={value} value={value}>{text}</option>;
          })}
        </select>
      ) : as === 'textarea' ? (
        <textarea rows={4} {...common} />
      ) : (
        <input {...common} />
      )}
      {hint && !error ? <span id={hintId} className="field__hint">{hint}</span> : null}
      {error ? <span id={errId} className="field__error"><ErrorIcon />{error}</span> : null}
    </div>
  );
}

/** Off-screen trap field. Real users never see or reach it. */
export function Honeypot(props) {
  return (
    <div className="hp-wrap" aria-hidden="true">
      <label>Leave this field empty<input type="text" {...props} /></label>
    </div>
  );
}

/** Polite live region for server/network errors. */
export function FormAlert({ children }) {
  if (!children) return null;
  return <p className="form-alert" role="alert">{children}</p>;
}
