import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, Sun, Moon, Monitor, Check } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import { useAuthStore } from '@core/stores/authStore';
import { useThemeStore } from '@core/stores/themeStore';
import { api } from '@core/api/client';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutLocal = useAuthStore((s) => s.logoutLocal);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    try { await api.post('/api/auth/logout'); } catch { /* idempotent */ }
    logoutLocal();
    toast.success('Logged out');
    navigate('/login', { replace: true });
  }

  const name = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Guest';
  const roleLabel = user?.role?.displayName || user?.role?.name || '';

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-ink-100/60 dark:hover:bg-white/5 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={name} size="sm" src={user?.avatarUrl} />
        <span className="hidden md:inline text-sm font-medium truncate max-w-[140px]">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-ink-100 dark:border-white/5 bg-white dark:bg-ink-800 shadow-pop animate-fadeIn p-1 z-50"
        >
          <div className="px-3 py-3 border-b border-ink-100 dark:border-white/5">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-ink-500 truncate">{user?.email}</p>
            {roleLabel && <p className="text-xs text-ink-500 truncate mt-0.5">{roleLabel}</p>}
          </div>

          <MenuItem icon={UserCircle} onClick={() => { setOpen(false); navigate('/profile'); }}>
            Profile
          </MenuItem>

          <div className="mt-1 pt-1 border-t border-ink-100 dark:border-white/5">
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">Theme</p>
            <ThemeOption icon={Sun}     label="Light"  value="light"  active={mode === 'light'}  onSelect={setMode} />
            <ThemeOption icon={Moon}    label="Dark"   value="dark"   active={mode === 'dark'}   onSelect={setMode} />
            <ThemeOption icon={Monitor} label="System" value="system" active={mode === 'system'} onSelect={setMode} />
          </div>

          <div className="mt-1 pt-1 border-t border-ink-100 dark:border-white/5">
            <MenuItem icon={LogOut} onClick={handleLogout} tone="danger">Log out</MenuItem>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, children, onClick, tone }) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={clsx(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition',
        tone === 'danger'
          ? 'text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20'
          : 'text-ink-900 dark:text-ink-100 hover:bg-ink-100/60 dark:hover:bg-white/5'
      )}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}

function ThemeOption({ icon: Icon, label, value, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(value)}
      role="menuitemradio"
      aria-checked={active}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left hover:bg-ink-100/60 dark:hover:bg-white/5 transition"
    >
      <Icon size={16} />
      <span className="flex-1">{label}</span>
      {active && <Check size={14} className="text-brand-600 dark:text-brand-300" />}
    </button>
  );
}
