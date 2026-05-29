import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbGet, dbGetAll, dbPut, dbDelete } from '../services/db';
import { generateId, todayIso } from '../utils/imageUtils';
import { pushStore } from '../utils/sync';
import { fmtEur, roundCents } from '../utils/format';
import UmlageModal from '../components/UmlageModal';

export default function UmlageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [umlage, setUmlage] = useState(null);
  const [mitglieder, setMitglieder] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingVal, setEditingVal] = useState('');
  const [flashingId, setFlashingId] = useState(null);
  const [showAllPaid, setShowAllPaid] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [u, allMitglieder, allStatus] = await Promise.all([
        dbGet('umlagen', id),
        dbGetAll('mitglieder'),
        dbGetAll('umlage_status'),
      ]);
      if (!u) { navigate('/umlagen', { replace: true }); return; }
      setUmlage(u);

      const memberMap = Object.fromEntries(allMitglieder.map(m => [m.id, m]));
      setMitglieder(memberMap);

      const myStatuses = allStatus.filter(s => s.umlage_id === id);
      setStatuses(myStatuses);
    } catch (err) {
      setLoadError('Daten konnten nicht geladen werden: ' + err.message);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  function effectiveBetrag(status) {
    return status.betrag_individuell ?? umlage.betrag_pro_kopf;
  }

  async function handleAmountSave(status) {
    const val = roundCents(parseFloat(editingVal.replace(',', '.')));
    setEditingId(null);
    if (isNaN(val) || val <= 0) return;

    const individuell = val === umlage.betrag_pro_kopf ? null : val;

    // Frischen Status aus der DB lesen, um Race-Condition mit einem laufenden
    // Sync (dbReplaceAll) zu vermeiden — nie veraltete Closure-Daten schreiben.
    const freshStatus = await dbGet('umlage_status', [status.umlage_id, status.mitglied_id]);
    const currentStatus = freshStatus ?? status;

    await dbPut('umlage_status', { ...currentStatus, betrag_individuell: individuell });

    if (currentStatus.status === 'bezahlt' && currentStatus.buchung_id) {
      const buchung = await dbGet('buchungen', currentStatus.buchung_id);
      if (buchung) {
        await dbPut('buchungen', { ...buchung, betrag: val });
        pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
      }
    }

    await load();
    pushStore('umlage_status', 'data/umlage-status.json').catch(console.warn);
  }

  async function handleBezahlt(status) {
    const markingAsBezahlt = status.status !== 'bezahlt';

    if (!markingAsBezahlt) {
      if (status.buchung_id) {
        await dbDelete('buchungen', status.buchung_id);
      }
      await dbPut('umlage_status', {
        ...status, status: 'offen', bezahlt_am: null, buchung_id: null,
      });
    } else {
      const currentBezahlt = statuses.filter(s => s.status === 'bezahlt').length;
      const currentBefreit = statuses.filter(s => s.status === 'befreit').length;
      const currentZahlend = statuses.length - currentBefreit;
      const willComplete = currentBezahlt + 1 >= currentZahlend && currentZahlend > 0;

      const buchungId = generateId('b');
      const m = mitglieder[status.mitglied_id];
      await dbPut('buchungen', {
        id: buchungId,
        typ: 'einzahlung',
        betrag: roundCents(effectiveBetrag(status)),
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

      await load();
      setFlashingId(status.mitglied_id);
      setTimeout(() => setFlashingId(null), 420);
      if (willComplete) {
        setShowAllPaid(true);
        setTimeout(() => setShowAllPaid(false), 2600);
      }
      pushStore('umlage_status', 'data/umlage-status.json').catch(console.warn);
      return;
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

  async function handleRemoveMember(status) {
    const m = mitglieder[status.mitglied_id];
    const name = m?.name ?? 'Mitglied';
    const hatBuchung = status.status === 'bezahlt' && status.buchung_id;
    const msg = `${name} aus der Umlage entfernen?${hatBuchung ? '\nDie zugehörige Buchung wird ebenfalls gelöscht.' : ''}`;
    if (!confirm(msg)) return;

    if (status.buchung_id) {
      await dbDelete('buchungen', status.buchung_id);
    }
    await dbDelete('umlage_status', [status.umlage_id, status.mitglied_id]);
    await dbPut('umlagen', {
      ...umlage,
      mitglieder_ids: (umlage.mitglieder_ids ?? []).filter(mid => mid !== status.mitglied_id),
    });

    await load();
    pushStore('umlagen', 'data/umlagen.json').catch(console.warn);
    pushStore('umlage_status', 'data/umlage-status.json').catch(console.warn);
    if (hatBuchung) pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
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

    const allStatus = await dbGetAll('umlage_status');
    for (const s of allStatus.filter(s => s.umlage_id === id)) {
      await dbDelete('umlage_status', [s.umlage_id, s.mitglied_id]);
    }

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

  if (loadError) {
    return (
      <div className="page">
        <header className="page-header">
          <button className="btn btn--icon" onClick={() => navigate(-1)} aria-label="Zurück">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 style={{ flex: 1, textAlign: 'center' }}>Fehler</h1>
          <span style={{ width: 36 }} />
        </header>
        <div className="empty-state"><p>{loadError}</p></div>
      </div>
    );
  }

  if (!umlage) return null;

  const bezahlt = statuses.filter(s => s.status === 'bezahlt').length;
  const befreit = statuses.filter(s => s.status === 'befreit').length;
  const gesamt = statuses.length;
  const zahlend = gesamt - befreit;
  const erwartet = roundCents(
    statuses.filter(s => s.status !== 'befreit').reduce((sum, s) => sum + effectiveBetrag(s), 0)
  );
  const gesammelt = roundCents(
    statuses.filter(s => s.status === 'bezahlt').reduce((sum, s) => sum + effectiveBetrag(s), 0)
  );

  return (
    <div className="page">
      <header className="page-header">
        <button className="btn btn--icon" onClick={() => navigate(-1)} aria-label="Zurück">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ flex: 1, textAlign: 'center' }}>{umlage.anlass}</h1>
        <button className="btn btn--icon" onClick={() => setShowEdit(true)} aria-label="Bearbeiten">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button className="btn btn--icon" onClick={handleDelete} aria-label="Löschen" style={{ color: 'var(--red)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </header>

      <div className="umlage-detail-summary">
        <div className="umlage-detail-info">
          <span>{fmtEur(umlage.betrag_pro_kopf)} / Person</span>
          {umlage.faelligkeit && (
            <span>Fällig {new Date(umlage.faelligkeit).toLocaleDateString('de-DE')}</span>
          )}
        </div>

        <div className="umlage-detail-totals">
          <div className="umlage-total">
            <div className="umlage-total__label">Gesammelt</div>
            <div className="umlage-total__value umlage-total__value--green">{fmtEur(gesammelt)}</div>
          </div>
          <div className="umlage-total">
            <div className="umlage-total__label">Erwartet</div>
            <div className="umlage-total__value">{fmtEur(erwartet)}</div>
          </div>
        </div>

        <div className="umlage-progress">
          <div className="umlage-progress__bar">
            <div
              className={`umlage-progress__fill${showAllPaid ? ' umlage-progress__fill--complete' : ''}`}
              style={{ width: zahlend > 0 ? `${Math.round((bezahlt / zahlend) * 100)}%` : '0%' }}
            />
          </div>
          <div className="umlage-progress__label">
            {showAllPaid
              ? '✓ Alles bezahlt!'
              : `${bezahlt} von ${zahlend} bezahlt${befreit > 0 ? ` (${befreit} befreit)` : ''}`
            }
          </div>
        </div>
      </div>

      <ul className="umlage-member-list">
        {statuses.map(s => {
          const m = mitglieder[s.mitglied_id];
          return (
            <li key={`${s.umlage_id}-${s.mitglied_id}`} className={`umlage-member-item umlage-member-item--${s.status}${flashingId === s.mitglied_id ? ' umlage-member-item--flash' : ''}`}>
              <span className="umlage-member-item__name">{m?.name ?? s.mitglied_id}</span>
              <div className="umlage-member-item__amount">
                {editingId === s.mitglied_id ? (
                  <input
                    type="number"
                    className="umlage-amount-input"
                    value={editingVal}
                    step="0.01"
                    min="0.01"
                    onChange={e => setEditingVal(e.target.value)}
                    onBlur={() => handleAmountSave(s)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAmountSave(s); }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className={`umlage-amount-btn${s.betrag_individuell != null ? ' umlage-amount-btn--custom' : ''}`}
                    onClick={() => { setEditingId(s.mitglied_id); setEditingVal(String(effectiveBetrag(s))); }}
                    title="Betrag anpassen"
                  >
                    {fmtEur(effectiveBetrag(s))}
                  </button>
                )}
              </div>
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
                <button
                  className="umlage-action-btn umlage-action-btn--remove"
                  onClick={() => handleRemoveMember(s)}
                  title="Aus Umlage entfernen"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {showEdit && (
        <UmlageModal
          umlage={umlage}
          onSave={() => { setShowEdit(false); load(); }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
