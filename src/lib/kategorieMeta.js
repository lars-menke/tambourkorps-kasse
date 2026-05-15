export const KATEGORIE_META_SCHEMA = {
  'Spende': [
    { key: 'spendername', label: 'Spendername', type: 'text', placeholder: 'Name des Spenders' },
  ],
  'Getränke': [
    { key: 'ort', label: 'Ort / Location', type: 'text', placeholder: 'z.B. Bar, Lokal' },
    { key: 'trinkgeld', label: 'Trinkgeld', type: 'trinkgeld' },
  ],
  'Essen': [
    { key: 'ort', label: 'Ort / Location', type: 'text', placeholder: 'z.B. Restaurant, Cafe' },
    { key: 'trinkgeld', label: 'Trinkgeld', type: 'trinkgeld' },
  ],
  'Taxi': [
    { key: 'von',  label: 'Von',  type: 'text', placeholder: 'Startpunkt' },
    { key: 'nach', label: 'Nach', type: 'text', placeholder: 'Ziel' },
  ],
};

export function getMetaSchema(kategorieName) {
  if (!kategorieName) return [];
  return KATEGORIE_META_SCHEMA[kategorieName] ?? [];
}

export function getMetaSchemaFromRecord(kategorie) {
  if (!kategorie) return [];
  if (kategorie.metaFelder !== undefined) return kategorie.metaFelder;
  return KATEGORIE_META_SCHEMA[kategorie.name] ?? [];
}

export function metaZusammenfassung(meta, kategorie) {
  if (!meta) return null;
  if (kategorie === 'Spende' && meta.spendername) return `Spende von ${meta.spendername}`;
  if ((kategorie === 'Getränke' || kategorie === 'Essen') && meta.ort) return meta.ort;
  if (kategorie === 'Taxi' && meta.von) return `${meta.von} → ${meta.nach ?? '?'}`;
  // Fallback: benutzerdefinierte Felder (Schluessel beginnen mit fld_)
  const custom = Object.entries(meta)
    .filter(([k, v]) => k.startsWith('fld_') && v?.toString().trim())
    .map(([, v]) => v.toString().trim());
  return custom.length > 0 ? custom.join(' · ') : null;
}
