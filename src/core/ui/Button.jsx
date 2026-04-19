import clsx from 'clsx';
import Spinner from './Spinner';

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className,
  disabled,
  ...rest
}) {
  const cls = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    outline: 'btn border border-ink-300 dark:border-white/10 hover:bg-ink-100/60 dark:hover:bg-white/5',
  }[variant] || 'btn-primary';

  return (
    <button
      className={clsx(cls, className)}
      disabled={loading || disabled}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
