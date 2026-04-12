import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbGetAll } from '../services/db';
import { useSync } from '../hooks/useSync';

export default function DashboardPage() {
  const [kassenstand, setKassenstand] = useState(null);
  const [buchungenCount, setBuchungenCount] = useState(0);
  const { sync, syncing } = useSync();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const buchungen = await dbGetAll('buchungen');
    setBuchungenCount(buchungen.length);

    const saldo = buchungen.reduce((sum, b) => {
      if (b.typ === 'einzahlung') return sum + (b.betrag || 0);
      if (b.typ === 'auszahlung') return sum - (b.betrag || 0);
      return sum;
    }, 0);
    setKassenstand(saldo);
  }

  const formatBetrag = (betrag) => {
    if (betrag === null) return '–';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(betrag);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Übersicht</h1>
        <button
          className="btn btn--icon"
          onClick={sync}
          disabled={syncing}
          title="Synchronisieren"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </header>

      <div className="dashboard">
        <div className="saldo-card">
          <div className="saldo-card__label">Kassenstand</div>
          <div className={`saldo-card__betrag ${kassenstand !== null && kassenstand < 0 ? 'saldo-card__betrag--negativ' : ''}`}>
            {formatBetrag(kassenstand)}
          </div>
          {buchungenCount > 0 && (
            <div className="saldo-card__info">
              aus {buchungenCount} Buchung{buchungenCount !== 1 ? 'en' : ''}
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <Link to="/buchungen" className="action-card">
            <div className="action-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div className="action-card__label">Buchung erfassen</div>
          </Link>

          <Link to="/buchungen" className="action-card">
            <div className="action-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="action-card__label">Buchungen ansehen</div>
          </Link>
        </div>

        {buchungenCount === 0 && (
          <div className="empty-state">
            <p>Noch keine Buchungen vorhanden.</p>
            <p>Tippe auf „Buchung erfassen" um loszulegen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
