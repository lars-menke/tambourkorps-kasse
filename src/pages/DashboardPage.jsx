import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbGetAll, initDefaultKategorien } from '../services/db';
import { useSync } from '../hooks/useSync';
import { CategoryChip } from '../components/CategoryChip';

const fmtDatum = (datum) =>
  datum ? new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) : null;

const fmtIso = (iso) =>
  iso ? new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) : null;

export default function DashboardPage() {
  const [kassenstand, setKassenstand] = useState(null);
  const [einnahmen, setEinnahmen] = useState(0);
  const [ausgaben, setAusgaben] = useState(0);
  const [buchungenCount, setBuchungenCount] = useState(0);
  const [letzteBuchung, setLetzteBuchung] = useState(null);
  const [letzteUmlage, setLetzteUmlage] = useState(null);
  const { sync, syncing } = useSync();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    await initDefaultKategorien();
    const [buchungen, umlagen, statuses] = await Promise.all([
      dbGetAll('buchungen'),
      dbGetAll('umlagen'),
      dbGetAll('umlage_status'),
    ]);

    const normalBuchungen = buchungen.filter(b => !b.umlage_id);
    setBuchungenCount(buchungen.length);

    let ein = 0, aus = 0;
    for (const b of buchungen) {
      if (b.typ === 'einzahlung') ein += b.betrag || 0;
      else if (b.typ === 'auszahlung') aus += b.betrag || 0;
    }
    setEinnahmen(ein);
    setAusgaben(aus);
    setKassenstand(ein - aus);

    // Letzte normale Buchung (nach Datum)
    const sorted = [...normalBuchungen].sort((a, b) => b.datum.localeCompare(a.datum));
    setLetzteBuchung(sorted[0] ?? null);

    // Letzte Umlage (nach Erstelldatum)
    if (umlagen.length > 0) {
      const lastU = [...umlagen].sort((a, b) => (b.erstellt ?? '').localeCompare(a.erstellt ?? ''))[0];
      const uStatuses = statuses.filter(s => s.umlage_id === lastU.id);
      const bezahlt = uStatuses.filter(s => s.status === 'bezahlt').length;
      const befreit = uStatuses.filter(s => s.status === 'befreit').length;
      setLetzteUmlage({ ...lastU, bezahlt, befreit, gesamt: uStatuses.length });
    } else {
      setLetzteUmlage(null);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    window.addEventListener('tk-sync-complete', loadData);
    return () => window.removeEventListener('tk-sync-complete', loadData);
  }, [loadData]);

  const fmt = (n) => new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR',
  }).format(n ?? 0);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Übersicht</h1>
        <button
          className="btn btn--icon"
          onClick={async () => { await sync(); loadData(); }}
          disabled={syncing}
          title="Synchronisieren"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20} className={syncing ? 'spin' : ''}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </header>

      <div className="dashboard">
        {/* Kassenstand */}
        <div className="saldo-card">
          <div className="saldo-card__label">Kassenstand</div>
          <div className={`saldo-card__betrag${kassenstand !== null && kassenstand < 0 ? ' saldo-card__betrag--negativ' : ''}`}>
            {fmt(kassenstand)}
          </div>
          {buchungenCount > 0 && (
            <div className="saldo-card__info">
              aus {buchungenCount} Buchung{buchungenCount !== 1 ? 'en' : ''}
            </div>
          )}
        </div>

        {/* Einnahmen / Ausgaben */}
        {buchungenCount > 0 && (
          <div className="dashboard-stats">
            <div className="stat-card stat-card--green">
              <div className="stat-card__label">Einnahmen</div>
              <div className="stat-card__value">{fmt(einnahmen)}</div>
            </div>
            <div className="stat-card stat-card--red">
              <div className="stat-card__label">Ausgaben</div>
              <div className="stat-card__value">{fmt(ausgaben)}</div>
            </div>
          </div>
        )}

        {/* Schnellaktionen */}
        <div className="dashboard-actions">
          <button className="action-card" onClick={() => navigate('/buchungen')}>
            <div className="action-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div className="action-card__label">Buchung erfassen</div>
          </button>

          <button className="action-card" onClick={() => navigate('/mitglieder')}>
            <div className="action-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="action-card__label">Mitglieder</div>
          </button>
        </div>

        {buchungenCount === 0 && (
          <div className="empty-state">
            <p>Noch keine Buchungen vorhanden.</p>
            <p>Tippe auf „Buchung erfassen" um loszulegen.</p>
          </div>
        )}

        {/* Letzte Aktivitäten */}
        {(letzteBuchung || letzteUmlage) && (
          <div className="dashboard-recents">
            <div className="dashboard-recents__title">Zuletzt</div>

            {letzteBuchung && (
              <button
                className="recent-card"
                onClick={() => navigate('/buchungen', { state: { openBuchung: letzteBuchung } })}
              >
                <div className="recent-card__header">
                  <span className="recent-card__label">Letzte Buchung</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <div className="recent-card__body">
                  <span className="recent-card__datum">{fmtDatum(letzteBuchung.datum)}</span>
                  {letzteBuchung.kategorie && (
                    <CategoryChip name={letzteBuchung.kategorie} />
                  )}
                  {letzteBuchung.notiz && (
                    <span className="recent-card__notiz">{letzteBuchung.notiz}</span>
                  )}
                </div>
                <div className={`recent-card__betrag recent-card__betrag--${letzteBuchung.typ}`}>
                  {letzteBuchung.typ === 'einzahlung' ? '+' : '−'}{fmt(letzteBuchung.betrag)}
                </div>
              </button>
            )}

            {letzteUmlage && (
              <button
                className="recent-card"
                onClick={() => navigate(`/umlagen/${letzteUmlage.id}`)}
              >
                <div className="recent-card__header">
                  <span className="recent-card__label">Letzte Umlage</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <div className="recent-card__body">
                  {letzteUmlage.erstellt && (
                    <span className="recent-card__datum">{fmtIso(letzteUmlage.erstellt)}</span>
                  )}
                  <span className="recent-card__notiz">{letzteUmlage.anlass}</span>
                </div>
                <div className="recent-card__umlage-progress">
                  <div className="recent-card__umlage-bar">
                    <div
                      className="recent-card__umlage-fill"
                      style={{
                        width: (letzteUmlage.gesamt - letzteUmlage.befreit) > 0
                          ? `${Math.round(letzteUmlage.bezahlt / (letzteUmlage.gesamt - letzteUmlage.befreit) * 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                  <span className="recent-card__umlage-label">
                    {letzteUmlage.bezahlt} / {letzteUmlage.gesamt - letzteUmlage.befreit} bezahlt
                    {letzteUmlage.befreit > 0 ? ` · ${letzteUmlage.befreit} befreit` : ''}
                  </span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
