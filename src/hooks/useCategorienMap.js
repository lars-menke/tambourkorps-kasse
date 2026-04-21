import { useState, useEffect } from 'react';
import { dbGetAll } from '../services/db';

// Returns a map of { [name]: { icon, color } } from IndexedDB kategorien
export function useCategorienMap() {
  const [map, setMap] = useState({});

  async function load() {
    try {
      const data = await dbGetAll('kategorien');
      const m = {};
      for (const k of data) {
        if (k.name) m[k.name] = { icon: k.icon, color: k.color };
      }
      setMap(m);
    } catch {/* ignore */}
  }

  useEffect(() => {
    load();
    window.addEventListener('tk-sync-complete', load);
    return () => window.removeEventListener('tk-sync-complete', load);
  }, []);

  return map;
}
