import { useState, useEffect, useCallback } from 'react';
import { dbGetAll } from '../services/db';

// Returns a map of { [name]: { icon, color } } from IndexedDB kategorien.
// load ist via useCallback stabil, damit der Event-Listener korrekt entfernt
// werden kann (removeEventListener benoetigt exakt dieselbe Referenz).
export function useCategorienMap() {
  const [map, setMap] = useState({});

  const load = useCallback(async () => {
    try {
      const data = await dbGetAll('kategorien');
      const m = {};
      for (const k of data) {
        if (k.name) m[k.name] = { icon: k.icon, color: k.color };
      }
      setMap(m);
    } catch {
      // Fehler beim DB-Zugriff ignorieren — Map bleibt leer
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('tk-sync-complete', load);
    return () => window.removeEventListener('tk-sync-complete', load);
  }, [load]);

  return map;
}
