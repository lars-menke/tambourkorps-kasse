import { useState, useEffect } from 'react';
import { dbGetAll } from '../services/db';

export default function BuchungenPage() {
  const [buchungen, setBuchungen] = useState([]);

  useEffect(() => {
    dbGetAll('buchungen').then(data => {
      const sorted = [...data].sort((a, b) => b.datum.localeCompare(a.datum));
      setBuchungen(sorted);
    });
  }, []);

  const formatBetrag = (betrag, typ) => {
    const formatted = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(betrag);
    return typ === 'einzahlung' ? `+${formatted}` : `−${formatted}`;
  };

  const formatDatum = (datum) => {
    return new Date(datum).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Buchungen</h1>
        <button className="btn btn--primary btn--sm">
          + Neu
        </button>
      </header>

      {buchungen.length === 0 ? (
        <div className="empty-state">
          <p>Keine Buchungen vorhanden.</p>
          <p>Tippe auf „+ Neu" um eine Buchung zu erfassen.</p>
        </div>
      ) : (
        <ul className="buchungen-list">
          {buchungen.map(b => (
            <li key={b.id} className="buchung-item">
              <div className="buchung-item__meta">
                <span className="buchung-item__datum">{formatDatum(b.datum)}</span>
                {b.kategorie && (
                  <span className="buchung-item__kategorie">{b.kategorie}</span>
                )}
              </div>
              {b.notiz && (
                <div className="buchung-item__notiz">{b.notiz}</div>
              )}
              <div className={`buchung-item__betrag buchung-item__betrag--${b.typ}`}>
                {formatBetrag(b.betrag, b.typ)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
