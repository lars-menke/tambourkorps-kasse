import { useState, useEffect, useCallback } from 'react';
import { dbGetAll, dbPut, dbDelete } from '../services/db';
import { pushStore } from '../utils/sync';
import { generateId } from '../utils/imageUtils';
import {
  Users, HandCoins, Heart, Drum, Music, Shirt, Car, Utensils,
  Calendar, Landmark, MoreHorizontal, Package, Star, Wrench,
  Coffee, ShoppingBag, Tag, Banknote, Gift, Megaphone, BookOpen,
  Briefcase, Truck, Home,
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

const ICON_MAP = {
  Users, HandCoins, Heart, Drum, Music, Shirt, Car, Utensils,
  Calendar, Landmark, MoreHorizontal, Package, Star, Wrench,
  Coffee, ShoppingBag, Tag, Banknote, Gift, Megaphone, BookOpen,
  Briefcase, Truck, Home,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);

// Farbpalette — Vorschlagsfarben für Kategorien
export const COLOR_SWATCHES = [
  { hex: '#2d6a1f', label: 'Grün' },
  { hex: '#0d9488', label: 'Türkis' },
  { hex: '#2563eb', label: 'Blau' },
  { hex: '#7c3aed', label: 'Lila' },
  { hex: '#d97706', label: 'Amber' },
  { hex: '#b45309', label: 'Orange' },
  { hex: '#b91c1c', label: 'Rot' },
  { hex: '#db2777', label: 'Pink' },
  { hex: '#9a7a1c', label: 'Gold' },
  { hex: '#6b7280', label: 'Grau' },
];

const TYP_LABELS = {
  einzahlung: 'Einnahme',
  auszahlung: 'Ausgabe',
  beide: 'Beide',
};

export function KategorieIcon({ iconName, size = 18 }) {
  const Icon = ICON_MAP[iconName] ?? ICON_MAP.MoreHorizontal;
  return <Icon size={size} strokeWidth={2} aria-hidden />;
}

export default function KategorienPage() {
  const [kategorien, setKategorien] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const load = useCallback(async () => {
    const data = await dbGetAll('kategorien');
    setKategorien([...data].sort((a, b) => a.name.localeCompare(b.name, 'de')));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('tk-sync-complete', load);
    return () => window.removeEventListener('tk-sync-complete', load);
  }, [load]);

  async function handleSave(record) {
    await dbPut('kategorien', record);
    setEditItem(null);
    await load();
    pushStore('kategorien', 'data/kategorien.json').catch(console.warn);
  }

  async function handleDelete(id) {
    if (!confirm('Kategorie löschen?')) return;
    await dbDelete('kategorien', id);
    await load();
    pushStore('kategorien', 'data/kategorien.json').catch(console.warn);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Kategorien</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setEditItem({})}>
          + Neu
        </button>
      </header>

      {kategorien.length === 0 ? (
        <EmptyState
          title="Noch keine Kategorien"
          description="Füge eigene Kategorien für Buchungen hinzu."
        />
      ) : (
        <ul className="member-list">
          {kategorien.map(k => (
            <KategorieItem
              key={k.id}
              kategorie={k}
              onEdit={() => setEditItem(k)}
              onDelete={() => handleDelete(k.id)}
            />
          ))}
        </ul>
      )}

      {editItem !== null && (
        <KategorieModal
          kategorie={Object.keys(editItem).length === 0 ? null : editItem}
          onSave={handleSave}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}

function KategorieItem({ kategorie, onEdit, onDelete }) {
  const color = kategorie.color;
  return (
    <li className="member-item">
      <span
        className="kategorie-list__icon"
        style={color ? { background: color + '1f', color } : undefined}
      >
        <KategorieIcon iconName={kategorie.icon || 'MoreHorizontal'} size={18} />
      </span>
      <span className="member-item__name">
        {kategorie.name}
        <span className={`kategorie-item__typ kategorie-item__typ--${kategorie.typ}`}>
          {TYP_LABELS[kategorie.typ] ?? kategorie.typ}
        </span>
      </span>
      <button className="member-item__edit" onClick={onEdit} aria-label="Kategorie bearbeiten">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button className="member-item__delete" onClick={onDelete} aria-label="Kategorie löschen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </button>
    </li>
  );
}

function KategorieModal({ kategorie, onSave, onClose }) {
  const isEdit = Boolean(kategorie);
  const [name, setName] = useState(kategorie?.name ?? '');
  const [typ, setTyp] = useState(kategorie?.typ ?? 'auszahlung');
  const [icon, setIcon] = useState(kategorie?.icon ?? 'MoreHorizontal');
  const [color, setColor] = useState(kategorie?.color ?? COLOR_SWATCHES[0].hex);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: kategorie?.id ?? generateId('k'),
        name: name.trim(),
        typ,
        icon,
        color,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet" role="dialog" aria-modal="true">
        <div className="bottom-sheet__handle" />
        <div className="bottom-sheet__header">
          <h2>{isEdit ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</h2>
          <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Schließen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bottom-sheet__body">
          <div className="form-group">
            <label htmlFor="kat-name">Name</label>
            <input
              id="kat-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="z. B. Wartung"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="kat-typ">Typ</label>
            <select id="kat-typ" value={typ} onChange={e => setTyp(e.target.value)}>
              <option value="einzahlung">Einnahme</option>
              <option value="auszahlung">Ausgabe</option>
              <option value="beide">Beide</option>
            </select>
          </div>

          <div className="form-group">
            <label>Farbe</label>
            <div className="color-picker">
              {COLOR_SWATCHES.map(s => (
                <button
                  key={s.hex}
                  type="button"
                  className={`color-picker__swatch${color === s.hex ? ' color-picker__swatch--active' : ''}`}
                  style={{ background: s.hex }}
                  onClick={() => setColor(s.hex)}
                  title={s.label}
                  aria-label={s.label}
                />
              ))}
              {/* Eigene Farbe via native color input */}
              <label className="color-picker__custom" title="Eigene Farbe">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                />
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 8,
                  border: `1.5px solid ${color}`,
                  background: color + '1f',
                  color,
                  fontSize: 14,
                }}>✎</span>
              </label>
            </div>
            {/* Vorschau */}
            <span
              className="cat-chip cat-chip--sm"
              style={{ background: color + '1f', color, marginTop: 6, display: 'inline-flex' }}
            >
              {name || 'Vorschau'}
            </span>
          </div>

          <div className="form-group">
            <label>Symbol</label>
            <div className="icon-picker">
              {ICON_OPTIONS.map(n => {
                const Icon = ICON_MAP[n];
                return (
                  <button
                    key={n}
                    type="button"
                    className={`icon-picker__item${icon === n ? ' icon-picker__item--active' : ''}`}
                    style={icon === n ? { background: color + '1f', borderColor: color, color } : undefined}
                    onClick={() => setIcon(n)}
                    title={n}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={saving || !name.trim()}
          >
            {saving ? 'Speichern…' : isEdit ? 'Speichern' : 'Hinzufügen'}
          </button>
        </form>
      </div>
    </div>
  );
}
