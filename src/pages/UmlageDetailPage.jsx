import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbGet, dbGetAll, dbPut, dbDelete } from '../services/db';
import { generateId, todayIso } from '../utils/imageUtils';
import { pushStore } from '../utils/sync';

export default function UmlageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [umlage, setUmlage] = useState(null);
  const [mitglieder, setMitglieder] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const load = useCallback(async () => {
    const [u, allMitglieder, allStatus] = await Promise.all([
      dbGet('umlagen', id),
      dbGetAll('mitglieder'),
      dbGetAll('umlage_status'),
    ]);
    if (!u) { navigate('/umlagen', { replace: true }); return; }
    setUmlage(u);

    // Members of this umlage
    const memberMap = Object.fromEntries(allMitglieder.map(m => [m.id, m]));
    setMitglieder(memberMap);

    // Statuses for this umlage
    const myStatuses = allStatus.filter(s => s.umlage_id === id);
    setStatuses(myStatuses);
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  async function handleBezahlt(status) {
    if (status.status === 'bezahlt') {
      // Undo: delete booking, set back to offen
      if (status.buchung_id) {
        await dbDelete('buchungen', status.buchung_id);
      }
      await dbPut('umlage_status', {
        ...status, status: 'offen', bezahlt_am: null, buchung_id: null,
      });
    } else {
      // Mark as bezahlt → create Buchung
      const buchungId = generateId('b');
      const m = mitglieder[status.mitglied_id];
      await dbPut('buchungen', {
        id: buchungId,
        typ: 'einzahlung',
        betrag: umlage.betrag_pro_kopf,
        datum: umlage.faelligkeit || todayIso(),
        kategorie_id: 'k_umlage',
        kategorie: 'Umlage',
        notiz: `${umlage.anlass}${m ? ` — ${m.name}` : ''}`,
        beleg_id: null,
        umlage_id: id,
        erstellt: new Date().toISOString(),
        geaendert: new Date().toISOString(),
      });
      await dbPut('umlage_status', {
        ...status, status: 'bezahlt',
        bezahlt_am: new Date().toISOString(),
        buchung_id: buchungId,
      });
      pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
    }
    await load();
    pushStore('umlage_status', 'data/umlage-status.json').catch(console.warn);
  }

  async function handleBefreit(status) {
    const newStatus = status.status === 'befreit' ? 'offen' : 'befreit';
    if (status.buchung_id && newStatus !== 'bezahlt') {
      await dbDelete('buchungen', status.buchung_id);
    }
    await dbPut('umlage_status', {
      ...status, status: newStatus,
      bezahlt_am: null, buchung_id: null,
    });
    await load();
    pushStore('umlage_status', 'data/umlage-status.json').catch(console.warn);
  }

  async function handleDelete() {
    if (!confirm(`Umlage „${umlage.anlass}" löschen?`)) return;

    const allBuchungen = await dbGetAll('buchungen');
    const zugehoerig = allBuchungen.filter(b => b.umlage_id === id);

    let buchungenLoeschen = false;
    if (zugehoerig.length > 0) {
      buchungenLoeschen = confirm(
        `${zugehoerig.length} Zahlung${zugehoerig.length !== 1 ? 'en' : ''} vorhanden.\n\n` +
        `OK → Buchungen löschen\nAbbrechen → als Einzelbuchungen behalten`
      );
    }

    // Umlage-Status löschen
    const allStatus = await dbGetAll('umlage_status');
    for (const s of allStatus.filter(s => s.umlage_id === id)) {
      await dbDelete('umlage_status', [s.umlage_id, s.mitglied_id]);
    }

    // Buchungen löschen oder zu Einzelbuchungen konvertieren
    if (buchungenLoeschen) {
      for (const b of zugehoerig) {
        await dbDelete('buchungen', b.id);
      }
    } else if (zugehoerig.length > 0) {
      for (const b of zugehoerig) {
        await dbPut('buchungen', { ...b, umlage_id: null });
      }
    }

    await dbDelete('umlagen', id);
    navigate('/umlagen', { replace: true });

    pushStore('umlagen', 'data/umlagen.json').catch(console.warn);
    pushStore('umlage_status', 'data/umlage-status.json').catch(console.warn);
    if (zugehoerig.length > 0) {
      pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
    }
  }

  if (!umlage) return null;

  const bezahlt = statuses.filter(s => s.status === 'bezahlt').length;
  const befreit = statuses.filter(s => s.status === 'befreit').length;
  const gesamt = statuses.length;
  const zahlend = gesamt - befreit;
  const erwartet = zahlend * umlage.betrag_pro_kopf;
  const gesammelt = bezahlt * umlage.betrag_pro_kopf;

  return (
    <div className="page">
      <header className="page-header">
        <button className="btn btn--icon" onClick={() => navigate(-1)} aria-label="Zurück">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ flex: 1, textAlign: 'center' }}>{umlage.anlass}</h1>
        <button className="btn btn--icon" onClick={handleDelete} aria-label="Löschen" style={{ color: 'var(--red)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </header>

      {/* Summary */}
      <div className="umlage-detail-summary">
        <div className="umlage-detail-info">
          <span>{fmt(umlage.betrag_pro_kopf)} / Person</span>
          {umlage.faelligkeit && (
            <span>Fällig {new Date(umlage.faelligkeit).toLocaleDateString('de-DE')}</span>
          )}
        </div>

        <div className="umlage-detail-totals">
          <div className="umlage-total">
            <div className="umlage-total__label">Gesammelt</div>
            <div className="umlage-total__value umlage-total__value--green">{fmt(gesammelt)}</div>
          </div>
          <div className="umlage-total">
            <div className="umlage-total__label">Erwartet</div>
            <div className="umlage-total__value">{fmt(erwartet)}</div>
          </div>
        </div>

        <div className="umlage-progress">
          <div className="umlage-progress__bar">
            <div
              className="umlage-progress__fill"
              style={{ width: zahlend > 0 ? `${Math.round((bezahlt / zahlend) * 100)}%` : '0%' }}
            />
          </div>
          <div className="umlage-progress__label">
            {bezahlt} von {zahlend} bezahlt{befreit > 0 ? ` (${befreit} befreit)` : ''}
          </div>
        </div>
      </div>

      {/* Member List */}
      <ul className="umlage-member-list">
        {statuses.map(s => {
          const m = mitglieder[s.mitglied_id];
          return (
            <li key={`${s.umlage_id}-${s.mitglied_id}`} className={`umlage-member-item umlage-member-item--${s.status}`}>
              <span className="umlage-member-item__name">{m?.name ?? s.mitglied_id}</span>
              <div className="umlage-member-item__actions">
                <button
                  className={`umlage-action-btn umlage-action-btn--befreit${s.status === 'befreit' ? ' active' : ''}`}
                  onClick={() => handleBefreit(s)}
                  title={s.status === 'befreit' ? 'Befreiung aufheben' : 'Als befreit markieren'}
                  disabled={s.status === 'bezahlt'}
                >
                  Befreit
                </button>
                <button
                  className={`umlage-action-btn umlage-action-btn--bezahlt${s.status === 'bezahlt' ? ' active' : ''}`}
                  onClick={() => handleBezahlt(s)}
                  title={s.status === 'bezahlt' ? 'Zahlung rückgängig machen' : 'Als bezahlt markieren'}
                  disabled={s.status === 'befreit'}
                >
                  {s.status === 'bezahlt' ? '✓ Bezahlt' : 'Bezahlt'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function fmt(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}
