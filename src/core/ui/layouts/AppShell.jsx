import { useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@core/stores/authStore';
import { getVisiblePillars, getActivePillar } from '@core/nav/pillars';
import Breadcrumbs from '@core/ui/Breadcrumbs';
import CommandPalette from '@core/ui/CommandPalette';
import UserMenu from '@core/ui/UserMenu';

export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const permissions = useAuthStore((s) => s.permissions);

  const pillars = useMemo(() => getVisiblePillars(permissions), [permissions]);
  const activePillar = useMemo(() => getActivePillar(pathname, pillars), [pathname, pillars]);

  function onPillarClick(p) {
    if (p.standalone) return navigate(p.to);
    if (p.id === activePillar?.id) return;
    const first = p.items[0];
    if (first) navigate(first.to);
  }

  const showSubPanel = activePillar && !activePillar.standalone;

  return (
    <div className="min-h-screen bg-ink-100/40 dark:bg-ink-900">
      {/* Desktop: rail + (optional) sub-panel + content */}
      <div className="hidden md:flex min-h-screen">
        <Rail pillars={pillars} activeId={activePillar?.id} onSelect={onPillarClick} />
        {showSubPanel && <SubPanel pillar={activePillar} />}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 min-w-0 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile: top bar + content + bottom tabs + drawer */}
      <div className="md:hidden flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex items-center gap-2 px-3 py-2.5 bg-white/95 dark:bg-ink-800/95 backdrop-blur border-b border-ink-100 dark:border-white/5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-ink-100/60 dark:hover:bg-white/5"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <Breadcrumbs />
          </div>
          <UserMenu />
        </header>

        <main className="flex-1 min-w-0 p-4 pb-24">
          <Outlet />
        </main>

        <BottomTabs pillars={pillars} activeId={activePillar?.id} onSelect={onPillarClick} />

        {drawerOpen && (
          <MobileDrawer pillars={pillars} pathname={pathname} onClose={() => setDrawerOpen(false)} />
        )}
      </div>
    </div>
  );
}

function Rail({ pillars, activeId, onSelect }) {
  return (
    <aside className="w-[68px] shrink-0 flex flex-col items-center bg-white dark:bg-ink-800 border-r border-ink-100 dark:border-white/5">
      <div className="py-4">
        <div className="w-10 h-10 rounded-xl bg-brand-600 text-white grid place-items-center shadow-pop">
          <GraduationCap size={20} />
        </div>
      </div>
      <nav className="flex-1 flex flex-col items-center gap-1 py-2">
        {pillars.map((p) => {
          const Icon = p.icon;
          const active = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              title={p.label}
              aria-label={p.label}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'relative w-11 h-11 rounded-xl grid place-items-center transition',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                  : 'text-ink-500 hover:bg-ink-100/60 hover:text-ink-900 dark:hover:bg-white/5 dark:hover:text-ink-100'
              )}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-brand-600 dark:bg-brand-300" />}
              <Icon size={20} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function SubPanel({ pillar }) {
  return (
    <aside className="w-[240px] shrink-0 flex flex-col bg-white dark:bg-ink-800 border-r border-ink-100 dark:border-white/5">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">Section</p>
        <h2 className="text-lg font-semibold mt-0.5">{pillar.label}</h2>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {pillar.items.map((item) => <SubItem key={item.to} item={item} />)}
      </nav>
    </aside>
  );
}

function SubItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition',
        isActive
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 font-medium'
          : 'text-ink-700 dark:text-ink-100 hover:bg-ink-100/60 dark:hover:bg-white/5'
      )}
    >
      <item.icon size={16} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-6 lg:px-8 py-3 bg-white/80 dark:bg-ink-800/80 backdrop-blur border-b border-ink-100 dark:border-white/5">
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>
      <CommandPalette />
      <UserMenu />
    </header>
  );
}

function BottomTabs({ pillars, activeId, onSelect }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-ink-800/95 backdrop-blur border-t border-ink-100 dark:border-white/5 z-30">
      <ul className="flex">
        {pillars.map((p) => {
          const Icon = p.icon;
          const active = p.id === activeId;
          return (
            <li key={p.id} className="flex-1">
              <button
                onClick={() => onSelect(p)}
                className={clsx(
                  'w-full flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition',
                  active ? 'text-brand-700 dark:text-brand-300' : 'text-ink-500'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={20} />
                <span>{p.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileDrawer({ pillars, pathname, onClose }) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-ink-800 p-4 overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-ink-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white grid place-items-center">
              <GraduationCap size={18} />
            </div>
            <span className="font-semibold text-lg">School</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-ink-100/60 dark:hover:bg-white/5" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="space-y-4">
          {pillars.map((p) => (
            <div key={p.id}>
              {p.standalone ? (
                <SubItem item={{ to: p.to, label: p.label, icon: p.icon }} onNavigate={onClose} />
              ) : (
                <>
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-500">{p.label}</p>
                  <div className="space-y-0.5">
                    {p.items.map((item) => <SubItem key={item.to} item={item} onNavigate={onClose} />)}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
