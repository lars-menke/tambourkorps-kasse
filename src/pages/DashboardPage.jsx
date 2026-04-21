import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dbGetAll, initDefaultKategorien } from '../services/db';
import { useSync } from '../hooks/useSync';
import { CategoryChip } from '../components/CategoryChip';
import { useCategorienMap } from '../hooks/useCategorienMap';
import { BalanceCard } from '../components/BalanceCard';
import { CategoryDonut } from '../components/CategoryDonut';
import { EmptyState } from '../components/EmptyState';
import { PullToRefresh } from '../components/PullToRefresh';
import { QuickAddSheet } from '../components/QuickAddSheet';

const fmtDatum = (datum) =>
  datum ? new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) : null;

const fmtIso = (iso) =>
  iso ? new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) : null;

function buildSparkline(buchungen, days = 30) {
  const now = new Date();
  const points = [];
  let running = 0;

  // Sum all buchungen before the window as baseline
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  for (const b of buchungen) {
    const d = new Date(b.datum + 'T12:00:00');
    if (d < cutoff) {
      running += b.typ === 'einzahlung' ? (b.betrag || 0) : -(b.betrag || 0);
    }
  }

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().slice(0, 10);
    for (const b of buchungen) {
      if (b.datum === dayStr) {
        running += b.typ === 'einzahlung' ? (b.betrag || 0) : -(b.betrag || 0);
      }
    }
    points.push(running);
  }
  return points;
}

function buildDelta(buchungen) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  let thisNet = 0, prevNet = 0;
  for (const b of buchungen) {
    const d = new Date(b.datum + 'T12:00:00');
    const sign = b.typ === 'einzahlung' ? 1 : -1;
    const val = (b.betrag || 0) * sign;
    if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) thisNet += val;
    if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) prevNet += val;
  }
  const delta = thisNet - prevNet;
  const prevLabel = new Date(prevYear, prevMonth).toLocaleDateString('de-DE', { month: 'long' });
  return { delta, label: `ggü. ${prevLabel}` };
}

function buildDonut(buchungen) {
  const map = {};
  for (const b of buchungen) {
    if (b.typ !== 'auszahlung') continue;
    const key = b.kategorie || 'Sonstiges';
    map[key] = (map[key] || 0) + (b.betrag || 0);
  }
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
}

export default function DashboardPage() {
  const [kassenstand, setKassenstand] = useState(null);
  const [einnahmen, setEinnahmen] = useState(0);
  const [ausgaben, setAusgaben] = useState(0);
  const [buchungenCount, setBuchungenCount] = useState(0);
  const [letzteBuchung, setLetzteBuchung] = useState(null);
  const [letzteUmlage, setLetzteUmlage] = useState(null);
  const [sparkData, setSparkData] = useState([]);
  const [deltaInfo, setDeltaInfo] = useState({ delta: 0, label: '' });
  const [donutData, setDonutData] = useState([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTyp, setQuickAddTyp] = useState(null);
  const { sync, syncing } = useSync();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catIcons = useCategorienMap();

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

    setSparkData(buildSparkline(buchungen));
    setDeltaInfo(buildDelta(buchungen));
    setDonutData(buildDonut(buchungen));

    const sorted = [...normalBuchungen].sort((a, b) => b.datum.localeCompare(a.datum));
    setLetzteBuchung(sorted[0] ?? null);

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
    const q = searchParams.get('quick');
    if (q === 'income' || q === 'expense') {
      setQuickAddTyp(q === 'income' ? 'einzahlung' : 'auszahlung');
      setQuickAddOpen(true);
    }
  }, [searchParams]);

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

      <PullToRefresh onRefresh={async () => { await sync(); await loadData(); }}>
      <div className="dashboard">
        {/* Kassenstand */}
        <BalanceCard
          balance={kassenstand ?? 0}
          deltaAmount={deltaInfo.delta}
          deltaLabel={deltaInfo.label}
          history={sparkData}
        />

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
          <button className="action-card" onClick={() => setQuickAddOpen(true)}>
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
          <EmptyState
            title="Noch keine Buchungen"
            description='Tippe auf "Buchung erfassen" um loszulegen.'
          />
        )}

        {/* Kategorie-Donut */}
        {ausgaben > 0 && <CategoryDonut data={donutData} />}

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
                    <CategoryChip name={letzteBuchung.kategorie} icon={catIcons[letzteBuchung.kategorie]} />
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
      </PullToRefresh>
      <QuickAddSheet
        open={quickAddOpen}
        initialTyp={quickAddTyp}
        onClose={() => { setQuickAddOpen(false); setQuickAddTyp(null); }}
        onSave={loadData}
      />
    </div>
  );
}
