import { openDB } from 'idb';

const DB_NAME = 'tk-kasse';
const DB_VERSION = 1;

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
        // composite key: umlage_id + mitglied_id
        const store = db.createObjectStore('umlage_status', { keyPath: ['umlage_id', 'mitglied_id'] });
        store.createIndex('by_umlage', 'umlage_id');
        store.createIndex('by_mitglied', 'mitglied_id');
      }
      if (!db.objectStoreNames.contains('_meta')) {
        // Sync metadata — SHA per file, last sync time
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
