import { useState, useEffect, useCallback } from 'react';
import { dbGetAll, dbPutMany, dbPut } from '../services/db';
import { generateId } from '../utils/imageUtils';
import { pushStore } from '../utils/sync';

export default function UmlageModal({ onSave, onClose, umlage = null }) {
  const isEdit = Boolean(umlage);
  const [anlass, setAnlass] = useState(umlage?.anlass ?? '');
  const [betrag, setBetrag] = useState(umlage ? String(umlage.betrag_pro_kopf) : '');
  const [faelligkeit, setFaelligkeit] = useState(umlage?.faelligkeit ?? '');
  const [mitglieder, setMitglieder] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) return; // Mitgliederauswahl nur beim Neuanlegen
    dbGetAll('mitglieder').then(data => {
      const aktive = data.filter(m => m.aktiv).sort((a, b) => a.name.localeCompare(b.name, 'de'));
      setMitglieder(aktive);
      // Select all active members by default
      setSelected(new Set(aktive.map(m => m.id)));
    });
  }, []);

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function toggleMember(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === mitglieder.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(mitglieder.map(m => m.id)));
    }
  }

  const betragNum = parseFloat(betrag.replace(',', '.'));
  const total = selected.size * (isNaN(betragNum) ? 0 : betragNum);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!anlass.trim() || isNaN(betragNum) || betragNum <= 0) return;
    if (!isEdit && selected.size === 0) return;

    setSaving(true);
    try {
      if (isEdit) {
        await dbPut('umlagen', {
          ...umlage,
          anlass: anlass.trim(),
          betrag_pro_kopf: betragNum,
          faelligkeit: faelligkeit || null,
        });
        pushStore('umlagen', 'data/umlagen.json').catch(console.warn);
        onSave();
        return;
      }

      const umlageId = generateId('u');
      const now = new Date().toISOString();

      // Save Umlage
      await dbPut('umlagen', {
        id: umlageId,
        anlass: anlass.trim(),
        betrag_pro_kopf: betragNum,
        faelligkeit: faelligkeit || null,
        mitglieder_ids: [...selected],
        erstellt: now,
      });

      // Create status records (offen) for each selected member
      const statusRecords = [...selected].map(mitgliedId => ({
        umlage_id: umlageId,
        mitglied_id: mitgliedId,
        status: 'offen',
        bezahlt_am: null,
        buchung_id: null,
      }));
      await dbPutMany('umlage_status', statusRecords);

      pushStore('umlagen', 'data/umlagen.json').catch(console.warn);
      pushStore('umlage_status', 'data/umlage-status.json').catch(console.warn);

      onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className="bottom-sheet" role="dialog" aria-modal="true">
        <div className="bottom-sheet__handle" />
        <div className="bottom-sheet__header">
          <h2>{isEdit ? 'Umlage bearbeiten' : 'Neue Umlage'}</h2>
          <button type="button" className="btn btn--icon" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bottom-sheet__body">

          <div className="form-group">
            <label htmlFor="anlass">Anlass</label>
            <input
              id="anlass"
              type="text"
              value={anlass}
              onChange={e => setAnlass(e.target.value)}
              placeholder="z.B. Ausflug Hannover, Neue Uniformen"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="betrag-u">Betrag pro Person (€)</label>
            <input
              id="betrag-u"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={betrag}
              onChange={e => setBetrag(e.target.value)}
              placeholder="0,00"
              className="betrag-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="faelligkeit">Fälligkeitsdatum (optional)</label>
            <input
              id="faelligkeit"
              type="date"
              value={faelligkeit}
              onChange={e => setFaelligkeit(e.target.value)}
            />
          </div>

          {/* Member Selection — nur beim Neuanlegen */}
          {!isEdit && (
            <>
              <div className="form-group">
                <div className="form-label-row">
                  <label>Mitglieder ({selected.size} ausgewählt)</label>
                  <button type="button" className="link-btn" onClick={toggleAll}>
                    {selected.size === mitglieder.length ? 'Alle abwählen' : 'Alle auswählen'}
                  </button>
                </div>

                {mitglieder.length === 0 ? (
                  <div className="form-hint" style={{ padding: 'var(--space-md)' }}>
                    Keine aktiven Mitglieder vorhanden. Zuerst Mitglieder anlegen.
                  </div>
                ) : (
                  <div className="member-checkboxes">
                    {mitglieder.map(m => (
                      <label key={m.id} className={`member-checkbox${selected.has(m.id) ? ' member-checkbox--checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selected.has(m.id)}
                          onChange={() => toggleMember(m.id)}
                        />
                        <span>{m.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {selected.size > 0 && betragNum > 0 && (
                <div className="umlage-total-preview">
                  <span>Gesamtbetrag</span>
                  <span className="umlage-total-preview__value">
                    {selected.size} × {fmt(betragNum)} = <strong>{fmt(total)}</strong>
                  </span>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={saving || !anlass.trim() || isNaN(betragNum) || betragNum <= 0 || (!isEdit && selected.size === 0)}
          >
            {saving ? 'Speichern…' : isEdit ? 'Speichern' : 'Umlage anlegen'}
          </button>
        </form>
      </div>
    </div>
  );
}

function fmt(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}
