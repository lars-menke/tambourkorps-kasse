import { useState, useEffect, useCallback } from 'react';
import { dbGetAll, dbPut, dbGet, dbDelete } from '../services/db';
import { generateId, todayIso } from '../utils/imageUtils';
import BelegUpload from './BelegUpload';

export default function BuchungModal({ buchung, onSave, onClose }) {
  const isEdit = Boolean(buchung);

  const [typ, setTyp] = useState(buchung?.typ ?? 'einzahlung');
  const [betrag, setBetrag] = useState(buchung ? String(buchung.betrag) : '');
  const [datum, setDatum] = useState(buchung?.datum ?? todayIso());
  const [kategorieId, setKategorieId] = useState(buchung?.kategorie_id ?? '');
  const [notiz, setNotiz] = useState(buchung?.notiz ?? '');
  const [belegDataUrl, setBelegDataUrl] = useState(null);
  const [kategorien, setKategorien] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dbGetAll('kategorien').then(setKategorien);
    if (buchung?.beleg_id) {
      dbGet('belege', buchung.beleg_id).then(b => {
        if (b) setBelegDataUrl(b.dataUrl);
      });
    }
  }, [buchung]);

  // Close on backdrop click
  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filteredKategorien = kategorien.filter(
    k => k.typ === typ || k.typ === 'beide'
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const betragNum = parseFloat(betrag.replace(',', '.'));
    if (isNaN(betragNum) || betragNum <= 0) return;

    setSaving(true);
    try {
      let belegId = buchung?.beleg_id ?? null;

      // Save beleg if changed
      if (belegDataUrl && belegDataUrl !== 'unchanged') {
        belegId = belegId ?? generateId('beleg');
        await dbPut('belege', { id: belegId, dataUrl: belegDataUrl, datum });
      } else if (!belegDataUrl && belegId) {
        // Removed beleg
        await dbDelete('belege', belegId);
        belegId = null;
      }

      const record = {
        id: buchung?.id ?? generateId('b'),
        typ,
        betrag: betragNum,
        datum,
        kategorie_id: kategorieId || null,
        kategorie: kategorien.find(k => k.id === kategorieId)?.name ?? null,
        notiz: notiz.trim() || null,
        beleg_id: belegId,
        erstellt: buchung?.erstellt ?? new Date().toISOString(),
        geaendert: new Date().toISOString(),
      };

      await dbPut('buchungen', record);
      onSave(record);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className="bottom-sheet" role="dialog" aria-modal="true">
        <div className="bottom-sheet__handle" />

        <div className="bottom-sheet__header">
          <h2>{isEdit ? 'Buchung bearbeiten' : 'Neue Buchung'}</h2>
          <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Schließen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bottom-sheet__body">

          {/* Typ Toggle */}
          <div className="type-toggle">
            <button
              type="button"
              className={`type-toggle__btn${typ === 'einzahlung' ? ' type-toggle__btn--active type-toggle__btn--green' : ''}`}
              onClick={() => { setTyp('einzahlung'); setKategorieId(''); }}
            >
              + Einzahlung
            </button>
            <button
              type="button"
              className={`type-toggle__btn${typ === 'auszahlung' ? ' type-toggle__btn--active type-toggle__btn--red' : ''}`}
              onClick={() => { setTyp('auszahlung'); setKategorieId(''); }}
            >
              − Auszahlung
            </button>
          </div>

          {/* Betrag */}
          <div className="form-group">
            <label htmlFor="betrag">Betrag (€)</label>
            <input
              id="betrag"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={betrag}
              onChange={e => setBetrag(e.target.value)}
              placeholder="0,00"
              className="betrag-input"
              required
              autoFocus
            />
          </div>

          {/* Datum */}
          <div className="form-group">
            <label htmlFor="datum">Datum</label>
            <input
              id="datum"
              type="date"
              value={datum}
              onChange={e => setDatum(e.target.value)}
              required
            />
          </div>

          {/* Kategorie */}
          <div className="form-group">
            <label htmlFor="kategorie">Kategorie</label>
            <select
              id="kategorie"
              value={kategorieId}
              onChange={e => setKategorieId(e.target.value)}
            >
              <option value="">— Keine —</option>
              {filteredKategorien.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>

          {/* Notiz */}
          <div className="form-group">
            <label htmlFor="notiz">Notiz</label>
            <textarea
              id="notiz"
              value={notiz}
              onChange={e => setNotiz(e.target.value)}
              placeholder="Optionale Beschreibung…"
              rows={2}
            />
          </div>

          {/* Beleg */}
          <div className="form-group">
            <label>Beleg</label>
            <BelegUpload value={belegDataUrl} onChange={setBelegDataUrl} />
          </div>

          <button
            type="submit"
            className={`btn btn--full btn--${typ === 'einzahlung' ? 'primary' : 'danger-solid'}`}
            disabled={saving || !betrag}
          >
            {saving ? 'Speichern…' : isEdit ? 'Speichern' : 'Buchung anlegen'}
          </button>
        </form>
      </div>
    </div>
  );
}
