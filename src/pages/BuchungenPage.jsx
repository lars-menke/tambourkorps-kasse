import { useState, useEffect, useCallback } from 'react';
import { dbGetAll, dbDelete } from '../services/db';
import { pushStore } from '../utils/sync';
import BuchungModal from '../components/BuchungModal';
import BuchungDetailModal from '../components/BuchungDetailModal';

const FILTER_TYPEN = [
  { value: 'alle', label: 'Alle' },
  { value: 'einzahlung', label: 'Einzahlungen' },
  { value: 'auszahlung', label: 'Auszahlungen' },
];

export default function BuchungenPage() {
  const [buchungen, setBuchungen] = useState([]);
  const [filter, setFilter] = useState('alle');
  const [detailBuchung, setDetailBuchung] = useState(null);
  const [editBuchung, setEditBuchung] = useState(null);

  const loadBuchungen = useCallback(async () => {
    const data = await dbGetAll('buchungen');
    const sorted = [...data].sort((a, b) => b.datum.localeCompare(a.datum));
    setBuchungen(sorted);
  }, []);

  useEffect(() => { loadBuchungen(); }, [loadBuchungen]);

  useEffect(() => {
    window.addEventListener('tk-sync-complete', loadBuchungen);
    return () => window.removeEventListener('tk-sync-complete', loadBuchungen);
  }, [loadBuchungen]);

  const filtered = filter === 'alle'
    ? buchungen
    : buchungen.filter(b => b.typ === filter);

  async function handleSave(record) {
    setEditBuchung(null);
    setDetailBuchung(null);
    await loadBuchungen();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
  }

  function handleEditFromDetail(b) {
    setDetailBuchung(null);
    setEditBuchung(b);
  }

  async function handleDelete(id) {
    if (!confirm('Buchung löschen?')) return;
    await dbDelete('buchungen', id);
    setDetailBuchung(null);
    await loadBuchungen();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
  }

  const formatBetrag = (betrag, typ) => {
    const formatted = new Intl.NumberFormat('de-DE', {
      style: 'currency', currency: 'EUR',
    }).format(betrag);
    return typ === 'einzahlung' ? `+${formatted}` : `−${formatted}`;
  };

  const formatDatum = (datum) =>
    new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  return (
    <div className="page">
      <header className="page-header">
        <h1>Buchungen</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setEditBuchung({})}>
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
            <li key={b.id} className="buchung-item" onClick={() => setDetailBuchung(b)}>
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
                {b.beleg_id && (
                  <span className="buchung-item__beleg-icon" title="Beleg vorhanden">📎</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {detailBuchung && (
        <BuchungDetailModal
          buchung={detailBuchung}
          onClose={() => setDetailBuchung(null)}
          onEdit={handleEditFromDetail}
          onDelete={handleDelete}
        />
      )}

      {editBuchung !== null && (
        <BuchungModal
          buchung={Object.keys(editBuchung).length === 0 ? null : editBuchung}
          onSave={handleSave}
          onClose={() => setEditBuchung(null)}
        />
      )}
    </div>
  );
}
