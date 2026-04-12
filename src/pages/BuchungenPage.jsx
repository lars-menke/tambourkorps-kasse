import { useState, useEffect, useCallback } from 'react';
import { dbGetAll, dbDelete } from '../services/db';
import { pushStore } from '../utils/sync';
import BuchungModal from '../components/BuchungModal';

const FILTER_TYPEN = [
  { value: 'alle', label: 'Alle' },
  { value: 'einzahlung', label: 'Einzahlungen' },
  { value: 'auszahlung', label: 'Auszahlungen' },
];

export default function BuchungenPage() {
  const [buchungen, setBuchungen] = useState([]);
  const [filter, setFilter] = useState('alle');
  const [showModal, setShowModal] = useState(false);
  const [editBuchung, setEditBuchung] = useState(null);

  const loadBuchungen = useCallback(async () => {
    const data = await dbGetAll('buchungen');
    const sorted = [...data].sort((a, b) => b.datum.localeCompare(a.datum));
    setBuchungen(sorted);
  }, []);

  useEffect(() => {
    loadBuchungen();
  }, [loadBuchungen]);

  const filtered = filter === 'alle'
    ? buchungen
    : buchungen.filter(b => b.typ === filter);

  function handleNeu() {
    setEditBuchung(null);
    setShowModal(true);
  }

  function handleEdit(b) {
    setEditBuchung(b);
    setShowModal(true);
  }

  async function handleSave(record) {
    setShowModal(false);
    await loadBuchungen();
    // Sync in background
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
  }

  async function handleDelete(id) {
    if (!confirm('Buchung löschen?')) return;
    await dbDelete('buchungen', id);
    await loadBuchungen();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
  }

  const formatBetrag = (betrag, typ) => {
    const formatted = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(betrag);
    return typ === 'einzahlung' ? `+${formatted}` : `−${formatted}`;
  };

  const formatDatum = (datum) =>
    new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="page">
      <header className="page-header">
        <h1>Buchungen</h1>
        <button className="btn btn--primary btn--sm" onClick={handleNeu}>
          + Neu
        </button>
      </header>

      {/* Filter */}
      <div className="filter-bar">
        {FILTER_TYPEN.map(({ value, label }) => (
          <button
            key={value}
            className={`filter-btn${filter === value ? ' filter-btn--active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {buchungen.length === 0
            ? <><p>Noch keine Buchungen.</p><p>Tippe auf „+ Neu" um loszulegen.</p></>
            : <p>Keine {filter === 'einzahlung' ? 'Einzahlungen' : 'Auszahlungen'} vorhanden.</p>
          }
        </div>
      ) : (
        <ul className="buchungen-list">
          {filtered.map(b => (
            <li key={b.id} className="buchung-item" onClick={() => handleEdit(b)}>
              <div className="buchung-item__meta">
                <span className="buchung-item__datum">{formatDatum(b.datum)}</span>
                {b.kategorie && (
                  <span className="buchung-item__kategorie">{b.kategorie}</span>
                )}
              </div>
              {b.notiz && (
                <div className="buchung-item__notiz">{b.notiz}</div>
              )}
              <div className="buchung-item__right">
                <div className={`buchung-item__betrag buchung-item__betrag--${b.typ}`}>
                  {formatBetrag(b.betrag, b.typ)}
                </div>
                {b.beleg_id && <span className="buchung-item__beleg-icon" title="Beleg vorhanden">📎</span>}
              </div>
              <button
                className="buchung-item__delete"
                onClick={e => { e.stopPropagation(); handleDelete(b.id); }}
                aria-label="Löschen"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <BuchungModal
          buchung={editBuchung}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
