import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import BuchungenPage from './pages/BuchungenPage';
import MitgliederPage from './pages/MitgliederPage';
import UmlagenPage from './pages/UmlagenPage';
import UmlageDetailPage from './pages/UmlageDetailPage';
import EinstellungenPage from './pages/EinstellungenPage';

export const router = createBrowserRouter(
  [
    {
      path: '/setup',
      element: <SetupPage />,
    },
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'buchungen', element: <BuchungenPage /> },
        { path: 'umlagen', element: <UmlagenPage /> },
        { path: 'umlagen/:id', element: <UmlageDetailPage /> },
        { path: 'mitglieder', element: <MitgliederPage /> },
        { path: 'einstellungen', element: <EinstellungenPage /> },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename: '/tambourkorps-kasse' }
);
