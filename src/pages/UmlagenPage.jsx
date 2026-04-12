import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbGetAll } from '../services/db';
import UmlageModal from '../components/UmlageModal';

export default function UmlagenPage() {
  const [umlagen, setUmlagen] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const [uList, sList] = await Promise.all([
      dbGetAll('umlagen'),
      dbGetAll('umlage_status'),
    ]);
    const sorted = [...uList].sort((a, b) =>
      (b.erstellt ?? '').localeCompare(a.erstellt ?? '')
    );
    setUmlagen(sorted);

    // Group statuses by umlage_id
    const map = {};
    for (const s of sList) {
      if (!map[s.umlage_id]) map[s.umlage_id] = [];
      map[s.umlage_id].push(s);
    }
    setStatusMap(map);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSave() {
    setShowModal(false);
    load();
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Umlagen</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setShowModal(true)}>
          + Neu
        </button>
      </header>

      {umlagen.length === 0 ? (
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
            const progress = total > 0 ? bezahlt / (total - befreit) : 0;
            const erwartet = (total - befreit) * u.betrag_pro_kopf;
            const gesammelt = bezahlt * u.betrag_pro_kopf;

            return (
              <li key={u.id} className="umlage-card" onClick={() => navigate(`/umlagen/${u.id}`)}>
                <div className="umlage-card__header">
                  <div className="umlage-card__anlass">{u.anlass}</div>
                  <div className="umlage-card__betrag">
                    {fmt(u.betrag_pro_kopf)} <span>/ Person</span>
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
                    {fmt(gesammelt)} von {fmt(erwartet)}
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

function fmt(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}
