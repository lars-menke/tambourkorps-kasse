import { useState, useEffect } from 'react';
import { useSync } from '../hooks/useSync';

export default function StatusBar() {
  const [online, setOnline] = useState(navigator.onLine);
  const { sync, syncing, lastSync, syncError } = useSync();

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      sync(); // Auto-sync when coming back online
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [sync]);

  if (!online) {
    return (
      <div className="status-bar status-bar--offline">
        Offline — Änderungen werden lokal gespeichert
      </div>
    );
  }

  if (syncing) {
    return <div className="status-bar status-bar--syncing">Synchronisiere…</div>;
  }

  if (syncError) {
    return (
      <div className="status-bar status-bar--error" title={syncError}>
        Sync-Fehler — <button onClick={sync}>Erneut versuchen</button>
      </div>
    );
  }

  return null; // Online + no error = no bar needed
}
