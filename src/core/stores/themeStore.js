import { create } from 'zustand';

const KEY = 'school.theme.v1';

function read() {
  try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; }
}

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function apply(mode) {
  const dark = mode === 'dark' || (mode === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
}

export const useThemeStore = create((set) => ({
  mode: read(),
  setMode: (mode) => {
    try { localStorage.setItem(KEY, mode); } catch {}
    apply(mode);
    set({ mode });
  },
}));

apply(read());
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useThemeStore.getState().mode === 'system') apply('system');
  });
}
