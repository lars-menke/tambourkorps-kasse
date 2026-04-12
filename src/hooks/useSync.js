import { useState, useCallback } from 'react';
import { syncAll } from '../utils/sync';

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const sync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncError(null);
    try {
      await syncAll();
      setLastSync(new Date().toISOString());
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  return { sync, syncing, lastSync, syncError };
}
