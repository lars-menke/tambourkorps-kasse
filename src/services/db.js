import { openDB } from 'idb';

const DB_NAME = 'tk-kasse';
const DB_VERSION = 2; // Bumped: added belege store

let _db = null;

export async function getDB() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('buchungen')) {
        db.createObjectStore('buchungen', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('mitglieder')) {
        db.createObjectStore('mitglieder', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('kategorien')) {
        db.createObjectStore('kategorien', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('umlagen')) {
        db.createObjectStore('umlagen', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('umlage_status')) {
        const store = db.createObjectStore('umlage_status', { keyPath: ['umlage_id', 'mitglied_id'] });
        store.createIndex('by_umlage', 'umlage_id');
        store.createIndex('by_mitglied', 'mitglied_id');
      }
      if (!db.objectStoreNames.contains('belege')) {
        // Stores compressed image dataURLs — keyed by beleg_id
        db.createObjectStore('belege', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('_meta')) {
        db.createObjectStore('_meta', { keyPath: 'path' });
      }
    },
  });
  return _db;
}

// --- Generic CRUD ---

export async function dbGetAll(storeName) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function dbGet(storeName, id) {
  const db = await getDB();
  return db.get(storeName, id);
}

export async function dbPut(storeName, record) {
  const db = await getDB();
  return db.put(storeName, record);
}

export async function dbPutMany(storeName, records) {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  await Promise.all(records.map(r => tx.store.put(r)));
  await tx.done;
}

// Ersetzt den kompletten Store-Inhalt — wird beim Pull vom Remote verwendet,
// damit gelöschte Einträge auch lokal verschwinden.
export async function dbReplaceAll(storeName, records) {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.clear();
  await Promise.all(records.map(r => tx.store.put(r)));
  await tx.done;
}

export async function dbDelete(storeName, id) {
  const db = await getDB();
  return db.delete(storeName, id);
}

export async function dbCount(storeName) {
  const db = await getDB();
  return db.count(storeName);
}

// --- Sync metadata ---

export async function getMeta(path) {
  const db = await getDB();
  return db.get('_meta', path);
}

export async function putMeta(path, sha) {
  const db = await getDB();
  return db.put('_meta', { path, sha, syncedAt: new Date().toISOString() });
}

// --- Default data init ---

const DEFAULT_KATEGORIEN = [
  { id: 'k_umlage',      name: 'Umlage',       typ: 'einzahlung', icon: 'HandCoins',    color: '#0d9488' },
  { id: 'k_spende',      name: 'Spende',        typ: 'einzahlung', icon: 'Heart',        color: '#db2777' },
  { id: 'k_beitrag',     name: 'Beitrag',       typ: 'einzahlung', icon: 'Users',        color: '#2d6a1f' },
  { id: 'k_ausflug',     name: 'Ausflug',       typ: 'auszahlung', icon: 'Car',          color: '#b45309' },
  { id: 'k_ausruestung', name: 'Ausrüstung',    typ: 'auszahlung', icon: 'Drum',         color: '#7c3aed' },
  { id: 'k_notenmat',    name: 'Notenmaterial', typ: 'auszahlung', icon: 'Music',        color: '#2563eb' },
  { id: 'k_sonstiges',   name: 'Sonstiges',     typ: 'beide',      icon: 'MoreHorizontal', color: '#6b7280' },
];

export async function initDefaultKategorien() {
  const existing = await dbGetAll('kategorien');
  if (existing.length === 0) {
    await dbPutMany('kategorien', DEFAULT_KATEGORIEN);
    return;
  }
  // Migrate existing default entries that are missing icon/color
  const existingById = Object.fromEntries(existing.map(k => [k.id, k]));
  for (const def of DEFAULT_KATEGORIEN) {
    const k = existingById[def.id];
    if (k && (!k.icon || !k.color)) {
      await dbPut('kategorien', { ...k, icon: k.icon ?? def.icon, color: k.color ?? def.color });
    }
  }
}
