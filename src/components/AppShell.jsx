import { Outlet, Navigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import BottomNav from './BottomNav';
import StatusBar from './StatusBar';

export default function AppShell() {
  const { hasToken } = useToken();

  if (!hasToken) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="app-shell">
      <StatusBar />
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
