import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLargeTitle } from '../hooks/useLargeTitle';
import { dbGetAll } from '../services/db';
import { fmtEur, roundCents } from '../utils/format';
import UmlageModal from '../components/UmlageModal';

export default function UmlagenPage() {
  const { titleRef, compact } = useLargeTitle();
  const [umlagen, setUmlagen] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [uList, sList] = await Promise.all([
        dbGetAll('umlagen'),
        dbGetAll('umlage_status'),
      ]);
      const sorted = [...uList].sort((a, b) =>
        (b.erstellt ?? '').localeCompare(a.erstellt ?? '')
      );
      setUmlagen(sorted);

      const map = {};
      for (const s of sList) {
        if (!map[s.umlage_id]) map[s.umlage_id] = [];
        map[s.umlage_id].push(s);
      }
      setStatusMap(map);
    } catch (err) {
      setLoadError('Daten konnten nicht geladen werden: ' + err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    window.addEventListener('tk-sync-complete', load);
    return () => window.removeEventListener('tk-sync-complete', load);
  }, [load]);

  function handleSave() {
    setShowModal(false);
    load();
  }

  return (
    <div className="page">
      <header className={`page-header${compact ? ' is-compact' : ''}`}>
        <h1>Umlagen</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setShowModal(true)}>
          + Neu
        </button>
      </header>
      <h1 ref={titleRef} className="page-large-title">Umlagen</h1>

      {loadError ? (
        <div className="empty-state"><p>{loadError}</p></div>
      ) : umlagen.length === 0 ? (
        <div className="empty-state">
          <p>Noch keine Umlagen vorhanden.</p>
          <p>Tippe auf „+ Neu" um eine Umlage anzulegen.</p>
        </div>
      ) : (
        <ul className="umlage-list">
          {umlagen.map(u => {
            const statuses = statusMap[u.id] ?? [];
            const total = statuses.length;
            const bezahlt = statuses.filter(s => s.status === 'bezahlt').length;
            const befreit = statuses.filter(s => s.status === 'befreit').length;
            const offen = total - bezahlt - befreit;
            const erledigt = total > 0 && offen === 0;
            const progress = total > 0 ? bezahlt / (total - befreit) : 0;
            // roundCents verhindert Fliesskomma-Akkumulation bei vielen Mitgliedern
            const erwartet = roundCents((total - befreit) * u.betrag_pro_kopf);
            const gesammelt = roundCents(bezahlt * u.betrag_pro_kopf);

            return (
              <li key={u.id} className={`umlage-card${erledigt ? ' umlage-card--erledigt' : ''}`} onClick={() => navigate(`/umlagen/${u.id}`)}>
                <div className="umlage-card__header">
                  <div className="umlage-card__anlass">
                    {u.anlass}
                    {erledigt && (
                      <span className="umlage-erledigt-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={11} height={11}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Erledigt
                      </span>
                    )}
                  </div>
                  <div className="umlage-card__betrag">
                    {fmtEur(u.betrag_pro_kopf)} <span>/ Person</span>
                  </div>
                </div>

                <div className="umlage-progress">
                  <div className="umlage-progress__bar">
                    <div
                      className="umlage-progress__fill"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                  <div className="umlage-progress__label">
                    {fmtEur(gesammelt)} von {fmtEur(erwartet)}
                  </div>
                </div>

                <div className="umlage-card__stats">
                  <span className="umlage-stat umlage-stat--bezahlt">{bezahlt} bezahlt</span>
                  {offen > 0 && <span className="umlage-stat umlage-stat--offen">{offen} offen</span>}
                  {befreit > 0 && <span className="umlage-stat umlage-stat--befreit">{befreit} befreit</span>}
                  {u.faelligkeit && (
                    <span className="umlage-stat umlage-stat--faelligkeit">
                      bis {new Date(u.faelligkeit).toLocaleDateString('de-DE')}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showModal && (
        <UmlageModal onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
