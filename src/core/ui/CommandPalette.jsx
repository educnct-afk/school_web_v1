import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@core/stores/authStore';
import { getVisiblePillars } from '@core/nav/pillars';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const permissions = useAuthStore((s) => s.permissions);
  const pillars = getVisiblePillars(permissions);

  const items = useMemo(() => {
    const flat = [];
    for (const p of pillars) {
      if (p.standalone) {
        flat.push({ to: p.to, label: p.label, hint: null, icon: p.icon });
      } else {
        for (const i of p.items) flat.push({ to: i.to, label: i.label, hint: p.label, icon: i.icon });
      }
    }
    const s = q.trim().toLowerCase();
    if (!s) return flat;
    return flat.filter((i) =>
      i.label.toLowerCase().includes(s) || (i.hint?.toLowerCase().includes(s) ?? false)
    );
  }, [pillars, q]);

  useEffect(() => {
    function onKey(e) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (open && e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [q]);

  function choose(i) {
    const item = items[i];
    if (!item) return;
    setOpen(false);
    navigate(item.to);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-ink-500 bg-ink-100/60 dark:bg-white/5 hover:bg-ink-100 dark:hover:bg-white/10 transition min-w-0"
        aria-label="Open command palette"
      >
        <Search size={14} className="shrink-0" />
        <span className="hidden lg:inline">Search…</span>
        <span className="hidden lg:inline ml-auto pl-6 text-[10px] font-mono text-ink-500 border border-ink-300/60 dark:border-white/10 rounded px-1.5 py-0.5">⌘K</span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-start pt-[10vh]">
          <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fadeIn" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-ink-800 rounded-xl2 shadow-pop animate-fadeIn overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-100 dark:border-white/5">
              <Search size={16} className="text-ink-500" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Jump to…"
                className="w-full bg-transparent focus:outline-none text-sm"
              />
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-1">
              {items.length === 0 && <li className="px-4 py-6 text-sm text-ink-500 text-center">No matches</li>}
              {items.map((item, i) => (
                <li key={item.to}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(i)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition',
                      i === active ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' : 'hover:bg-ink-100/60 dark:hover:bg-white/5'
                    )}
                  >
                    <item.icon size={16} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.hint && <span className="text-xs text-ink-500">{item.hint}</span>}
                    {i === active && <CornerDownLeft size={14} className="text-ink-500" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
