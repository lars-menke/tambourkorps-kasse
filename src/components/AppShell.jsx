import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import { syncAll } from '../utils/sync';
import AppHeader from './AppHeader';
import StatusBar from './StatusBar';
import BottomNav from './BottomNav';

export default function AppShell() {
  const { hasToken } = useToken();

  useEffect(() => {
    if (navigator.onLine) {
      syncAll().catch(console.warn);
    }
  }, []);

  if (!hasToken) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <StatusBar />
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
