import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import SplashScreen from './components/SplashScreen';
import { ToastProvider } from './components/ToastProvider';
import { initTheme } from './lib/theme';
import './index.css';

initTheme();

function Root() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <ToastProvider>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
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
