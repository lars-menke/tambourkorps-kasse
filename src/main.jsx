import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import SplashScreen from './components/SplashScreen';
import LockScreen from './components/LockScreen';
import { ToastProvider } from './components/ToastProvider';
import { initTheme } from './lib/theme';
import { isEnabled } from './lib/biometrics';
import './index.css';
import './styles/sync-error.css';

initTheme();

function Root() {
  const [splashDone, setSplashDone] = useState(false);
  const [unlocked, setUnlocked]     = useState(!isEnabled());

  return (
    <ToastProvider>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      {splashDone && !unlocked && <LockScreen onUnlock={() => setUnlocked(true)} />}
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/tambourkorps-kasse/sw.js')
      .then(reg => console.log('[SW] registered, scope:', reg.scope))
      .catch(err => console.error('[SW] registration failed:', err));
  });
}
