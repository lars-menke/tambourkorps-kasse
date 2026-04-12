import { Outlet, Navigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import AppHeader from './AppHeader';
import StatusBar from './StatusBar';
import BottomNav from './BottomNav';

export default function AppShell() {
  const { hasToken } = useToken();

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
