import clsx from 'clsx';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(function Input({ label, hint, error, className, id, type, ...rest }, ref) {
  const inputId = id || rest.name;
  const isPassword = type === 'password';
  const [show, setShow] = useState(false);

  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-100">
          {label}
        </span>
      )}
      <div className={clsx(isPassword && 'relative')}>
        <input
          id={inputId}
          ref={ref}
          type={isPassword ? (show ? 'text' : 'password') : type}
          className={clsx(
            'input',
            error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
            isPassword && 'pr-10',
            // Force system font for the masked dots so they render as circles not rectangles
            !show && isPassword && '[font-family:Verdana,sans-serif]',
            className,
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && (
        <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>
      )}
      {error && (
        <span className="mt-1.5 block text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </label>
  );
});

export default Input;
