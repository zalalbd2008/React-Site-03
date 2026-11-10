import { useCallback, useMemo, useRef, useState } from 'react';
import { submitLead, LeadError } from '../services/leadService.js';

/**
 * Shared form state for every lead form on the site.
 *
 * @param {object} opts
 * @param {Record<string, string|string[]|boolean>} opts.initial  initial values
 * @param {Record<string, (v:any, all:object)=>string>} opts.validators  '' = valid
 * @param {string} opts.formType  lead type sent to the backend
 * @param {(values:object)=>object} [opts.serialize]  map values → payload
 * @param {(result:object, values:object)=>void} [opts.onSuccess]
 */
export function useLeadForm({ initial, validators = {}, formType, serialize, onSuccess }) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState('');
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const startedAt = useRef(Date.now());
  const honeypot = useRef('');

  const errors = useMemo(() => {
    const out = {};
    for (const [k, fn] of Object.entries(validators)) {
      const msg = fn(values[k], values);
      if (msg) out[k] = msg;
    }
    return { ...out, ...serverFieldErrors };
  }, [values, validators, serverFieldErrors]);

  /** Error shown for a field: only after a submit attempt or after the user leaves it. */
  const errorFor = useCallback((k) => ((tried || touched[k]) ? errors[k] || '' : ''), [errors, tried, touched]);

  const setValue = useCallback((k, v) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    setServerFieldErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));
  }, []);

  /** Props for a text input / select / textarea bound to `k`. */
  const field = useCallback((k) => ({
    name: k,
    value: values[k] ?? '',
    onChange: (e) => setValue(k, e.target.value),
    onBlur: () => setTouched((t) => (t[k] ? t : { ...t, [k]: true })),
  }), [values, setValue]);

  const validKeys = useCallback((keys) => keys.every((k) => !errors[k]), [errors]);

  const submit = useCallback(async (e) => {
    e?.preventDefault?.();
    if (status === 'submitting') return false;
    setTried(true);
    if (Object.values(errors).some(Boolean)) {
      // Move focus to the first invalid field for keyboard and screen-reader users
      const first = Object.keys(validators).find((k) => errors[k]);
      if (first && typeof document !== 'undefined') e?.currentTarget?.querySelector?.(`[name="${first}"]`)?.focus();
      return false;
    }
    setStatus('submitting');
    setServerError('');
    try {
      const payload = serialize ? serialize(values) : values;
      const result = await submitLead(formType, payload, { honeypot: honeypot.current, startedAt: startedAt.current });
      setStatus('success');
      onSuccess?.(result, values);
      return true;
    } catch (err) {
      setStatus('error');
      if (err instanceof LeadError && err.fieldErrors) setServerFieldErrors(err.fieldErrors);
      setServerError(err?.message || 'Something went wrong. Please try again.');
      return false;
    }
  }, [errors, formType, onSuccess, serialize, status, validators, values]);

  const reset = useCallback(() => {
    setValues(initial); setTouched({}); setTried(false); setStatus('idle'); setServerError(''); setServerFieldErrors({});
    startedAt.current = Date.now();
  }, [initial]);

  return {
    values, setValue, field, errors, errorFor, tried, setTried, validKeys,
    status, submitting: status === 'submitting', serverError, submit, reset,
    /** Props for the hidden honeypot input (bots fill it, people never see it). */
    honeypotProps: {
      name: 'company_fax', tabIndex: -1, autoComplete: 'off', 'aria-hidden': true,
      defaultValue: '', onChange: (e) => { honeypot.current = e.target.value; },
    },
  };
}
