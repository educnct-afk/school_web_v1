import clsx from 'clsx';

function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

export default function Avatar({ name, src, size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };
  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={clsx(sizes[size], 'rounded-full object-cover', className)}
      />
    );
  }
  return (
    <div
      className={clsx(
        sizes[size],
        'rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold grid place-items-center',
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
