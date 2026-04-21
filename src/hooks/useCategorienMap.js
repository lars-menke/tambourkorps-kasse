import { useState, useEffect } from 'react';
import { dbGetAll } from '../services/db';

export function useCategorienMap() {
  const [map, setMap] = useState({});

  async function load() {
    try {
      const data = await dbGetAll('kategorien');
      const m = {};
      for (const k of data) {
        if (k.name && k.icon) m[k.name] = k.icon;
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
