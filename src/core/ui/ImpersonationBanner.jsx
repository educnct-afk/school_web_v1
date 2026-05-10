import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@core/stores/authStore';
import { authService } from '@modules/auth/services/authService';

/**
 * Persistent banner shown at the top of the app while a super admin is
 * impersonating another user. Hidden when not impersonating. The Stop button
 * tells the server to invalidate the impersonation session, then restores the
 * admin's saved auth from the store.
 */
export default function ImpersonationBanner() {
  const navigate = useNavigate();
  const original = useAuthStore((s) => s.original);
  const user = useAuthStore((s) => s.user);
  const impersonatorEmail = useAuthStore((s) => s.impersonatorEmail);
  const stopLocal = useAuthStore((s) => s.stopImpersonationLocal);

  if (!original) return null;

  async function handleStop() {
    try {
      await authService.stopImpersonation();
    } catch {
      // Even if the server call fails (expired token, network), drop locally
      // so the user isn't stuck.
    }
    stopLocal();
    toast.success('Returned to admin session');
    navigate('/', { replace: true });
  }

  const targetLabel = (() => {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
    return name || user?.email || 'this user';
  })();

  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex items-center gap-3 px-4 py-2 bg-amber-500 text-amber-950 shadow-sm"
    >
      <ShieldAlert size={18} className="shrink-0" />
      <p className="flex-1 text-sm">
        <span className="font-semibold">Impersonating</span> {targetLabel}
        {impersonatorEmail ? <span className="opacity-80"> · signed in as admin {impersonatorEmail}</span> : null}
      </p>
      <button
        onClick={handleStop}
        className="inline-flex items-center gap-1.5 rounded-md bg-amber-950/15 hover:bg-amber-950/25 px-3 py-1 text-xs font-medium transition"
      >
        <LogOut size={14} />
        Stop impersonating
      </button>
    </div>
  );
}
