import { useEffect } from 'react';
import AppRouter from '@core/router/AppRouter';
import { useAuthStore } from '@core/stores/authStore';

export default function App() {
  const rehydrate = useAuthStore((s) => s.rehydrate);
  useEffect(() => { rehydrate(); }, [rehydrate]);
  return <AppRouter />;
}
