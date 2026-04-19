import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="py-14 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-700 grid place-items-center dark:bg-brand-900/40 dark:text-brand-200">
        <Icon size={26} />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
