import { create } from 'zustand';

const STORAGE_KEY = 'school.auth.v1';

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredAuth(state) {
  try {
    if (!state) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable in private modes */
  }
}

// Hydrate synchronously at module init so the first render already knows auth state.
// This prevents PublicRoute / ProtectedRoute from returning null on the initial paint.
const _initial = (() => {
  const stored = readStoredAuth();
  if (stored?.token) {
    return {
      token: stored.token,
      user: stored.user ?? null,
      organization: stored.organization ?? null,
      permissions: stored.permissions ?? [],
      hydrated: true,
    };
  }
  return { token: null, user: null, organization: null, permissions: [], hydrated: true };
})();

export const useAuthStore = create((set, get) => ({
  ..._initial,

  // kept for call-site compatibility; no-op because we're already hydrated
  rehydrate: () => {
    if (get().hydrated) return;
    set({ hydrated: true });
  },

  loginSuccess: ({ token, user, organization, permissions }) => {
    const next = {
      token,
      user: user ?? null,
      organization: organization ?? null,
      permissions: permissions ?? [],
    };
    writeStoredAuth(next);
    set({ ...next, hydrated: true });
  },

  updateMe: ({ user, organization, permissions }) => {
    const state = get();
    const next = {
      token: state.token,
      user: user ?? state.user,
      organization: organization ?? state.organization,
      permissions: permissions ?? state.permissions,
    };
    writeStoredAuth(next);
    set(next);
  },

  logoutLocal: () => {
    writeStoredAuth(null);
    set({ token: null, user: null, organization: null, permissions: [] });
  },
}));
