import { useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuthStore } from '@core/stores/authStore';
import { getVisiblePillars, findItemByPath } from '@core/nav/pillars';

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const permissions = useAuthStore((s) => s.permissions);
  const pillars = getVisiblePillars(permissions);

  if (pathname === '/') {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center text-sm text-ink-500">
        <Home size={14} className="mr-1.5" /> Home
      </nav>
    );
  }

  const hit = findItemByPath(pathname, pillars);
  const crumbs = [];
  if (hit) {
    crumbs.push({ label: hit.pillar.label });
    crumbs.push({ label: hit.item.label });
  } else {
    crumbs.push({ label: pathname.slice(1) });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight size={14} className="text-ink-300 dark:text-ink-500 shrink-0" />}
            <span className={last ? 'font-medium truncate' : 'text-ink-500 truncate'}>{c.label}</span>
          </span>
        );
      })}
    </nav>
  );
}
