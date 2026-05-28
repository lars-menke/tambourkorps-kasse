import { useState, useEffect, useCallback } from 'react';
import { dbGetAll, dbPut, dbGet, dbDelete } from '../services/db';
import { pushBeleg, deleteBeleg } from '../utils/sync';
import { generateId, todayIso } from '../utils/imageUtils';
import BelegUpload from './BelegUpload';
import { useClosingAnimation } from '../hooks/useClosingAnimation';
import { getMetaSchemaFromRecord } from '../lib/kategorieMeta';
import { fmtEur, roundCents } from '../utils/format';

async function saveVorlage({ name, typ, betrag, kategorieId, kategorieName, notiz }) {
  await dbPut('vorlagen', {
    id: generateId('v'),
    name: name || kategorieName || (typ === 'einzahlung' ? 'Einnahme' : 'Ausgabe'),
    typ,
    betrag,
    kategorie_id: kategorieId || null,
    kategorie: kategorieName || null,
    notiz: notiz || null,
    verwendungen: 0,
    zuletzt_verwendet: null,
    erstellt: new Date().toISOString(),
  });
}

export default function BuchungModal({ buchung, onSave, onClose }) {
  const isEdit = Boolean(buchung);
  const { isClosing, handleClose } = useClosingAnimation(onClose);

  const [typ, setTyp]         = useState(buchung?.typ ?? 'einzahlung');
  const [betrag, setBetrag]   = useState(buchung ? String(buchung.meta?.betragBase ?? buchung.betrag) : '');
  const [datum, setDatum]     = useState(buchung?.datum ?? todayIso());
  const [uhrzeit, setUhrzeit] = useState(buchung?.uhrzeit ?? '');
  const [kategorieId, setKategorieId] = useState(buchung?.kategorie_id ?? '');
  const [notiz, setNotiz]     = useState(buchung?.notiz ?? '');
  const [belegDataUrl, setBelegDataUrl] = useState(null);
  const [kategorien, setKategorien] = useState([]);
  const [saving, setSaving]   = useState(false);

  const initMeta = () => {
    const m = buchung?.meta ?? {};
    const { trinkgeld: _, betragBase: __, ...rest } = m;
    return rest;
  };
  const [meta, setMeta]               = useState(initMeta);
  const [hatTrinkgeld, setHatTrinkgeld] = useState(buchung?.meta?.trinkgeld != null);
  const [trinkgeld, setTrinkgeld]     = useState(buchung?.meta?.trinkgeld != null ? String(buchung.meta.trinkgeld) : '');
  const [alsVorlage, setAlsVorlage]   = useState(false);
  const [vorlageName, setVorlageName] = useState('');

  useEffect(() => {
    dbGetAll('kategorien').then(setKategorien);
    if (buchung?.beleg_id) {
      dbGet('belege', buchung.beleg_id).then(b => {
        if (b) setBelegDataUrl(b.dataUrl);
      });
    }
  }, [buchung]);

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  // handleClose (nicht onClose) als Dependency — handleClose ist die stabile
  // Referenz aus useClosingAnimation, die auch die Exit-Animation ausfuehrt.
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  function handleKategorieChange(newId) {
    setKategorieId(newId);
    setMeta({});
    setHatTrinkgeld(false);
    setTrinkgeld('');
  }

  const filteredKategorien = kategorien.filter(k => k.typ === typ || k.typ === 'beide');
  const aktKategorie       = kategorien.find(k => k.id === kategorieId) ?? null;
  const metaSchema         = getMetaSchemaFromRecord(aktKategorie);

  const betragNum    = parseFloat(String(betrag).replace(',', '.')) || 0;
  const trinkgeldNum = hatTrinkgeld ? (parseFloat(String(trinkgeld).replace(',', '.')) || 0) : 0;
  // roundCents verhindert Fliesskomma-Fehler beim Summieren
  const gesamtNum    = roundCents(betragNum + trinkgeldNum);

  async function handleSubmit(e) {
    e.preventDefault();
    if (betragNum <= 0) return;

    setSaving(true);
    try {
      let belegId = buchung?.beleg_id ?? null;

      if (belegDataUrl && belegDataUrl !== 'unchanged') {
        belegId = belegId ?? generateId('beleg');
        await dbPut('belege', { id: belegId, dataUrl: belegDataUrl, datum });
        pushBeleg(belegId, belegDataUrl).catch(console.warn);
      } else if (!belegDataUrl && belegId) {
        await dbDelete('belege', belegId);
        deleteBeleg(belegId).catch(console.warn);
        belegId = null;
      }

      const metaEntries = Object.entries(meta).filter(([, v]) => v?.toString().trim());
      const hasMeta = metaEntries.length > 0 || trinkgeldNum > 0;
      const metaRecord = hasMeta ? {
        ...Object.fromEntries(metaEntries),
        ...(trinkgeldNum > 0 ? { betragBase: roundCents(betragNum), trinkgeld: roundCents(trinkgeldNum) } : {}),
      } : null;

      const record = {
        id:           buchung?.id ?? generateId('b'),
        typ,
        betrag:       gesamtNum,
        datum,
        uhrzeit:      uhrzeit.trim() || null,
        kategorie_id: kategorieId || null,
        kategorie:    kategorien.find(k => k.id === kategorieId)?.name ?? null,
        notiz:        notiz.trim() || null,
        meta:         metaRecord,
        beleg_id:     belegId,
        erstellt:     buchung?.erstellt ?? new Date().toISOString(),
        geaendert:    new Date().toISOString(),
      };

      await dbPut('buchungen', record);

      if (alsVorlage) {
        const kategorieName = kategorien.find(k => k.id === kategorieId)?.name ?? null;
        await saveVorlage({
          name: vorlageName.trim(),
          typ,
          betrag: roundCents(betragNum),
          kategorieId: kategorieId || null,
          kategorieName,
          notiz: notiz.trim() || null,
        });
      }

      onSave(record);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`modal-overlay${isClosing ? ' is-closing' : ''}`} onClick={handleBackdrop}>
      <div className={`bottom-sheet${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true">
        <div className="bottom-sheet__handle" />

        <div className="bottom-sheet__header">
          <h2>{isEdit ? 'Buchung bearbeiten' : 'Neue Buchung'}</h2>
          <button type="button" className="btn btn--icon" onClick={handleClose} aria-label="Schließen">
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
            <label htmlFor="betrag">{hatTrinkgeld ? 'Grundbetrag (€)' : 'Betrag (€)'}</label>
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

          {/* Datum + Uhrzeit */}
          <div className="form-row">
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
            <div className="form-group">
              <label htmlFor="uhrzeit">Uhrzeit <span className="form-hint">(optional)</span></label>
              <input
                id="uhrzeit"
                type="time"
                value={uhrzeit}
                onChange={e => setUhrzeit(e.target.value)}
              />
            </div>
          </div>

          {/* Kategorie */}
          <div className="form-group">
            <label htmlFor="kategorie">Kategorie</label>
            <select
              id="kategorie"
              value={kategorieId}
              onChange={e => handleKategorieChange(e.target.value)}
            >
              <option value="">— Keine —</option>
              {filteredKategorien.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>

          {/* Kategorie-spezifische Felder */}
          {metaSchema.map(field => field.type === 'text' ? (
            <div key={field.key} className="form-group">
              <label>{field.label}</label>
              <input
                type="text"
                value={meta[field.key] ?? ''}
                onChange={e => setMeta(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
            </div>
          ) : field.type === 'trinkgeld' ? (
            <div key="trinkgeld" className="form-group">
              <div className="form-group--inline">
                <label>Trinkgeld gegeben?</label>
                <button
                  type="button"
                  className={`toggle-btn${hatTrinkgeld ? ' toggle-btn--active' : ''}`}
                  onClick={() => { setHatTrinkgeld(v => !v); setTrinkgeld(''); }}
                >
                  {hatTrinkgeld ? 'Ja' : 'Nein'}
                </button>
              </div>
              {hatTrinkgeld && (
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={trinkgeld}
                  onChange={e => setTrinkgeld(e.target.value)}
                  placeholder="0,00"
                  style={{ marginTop: 8 }}
                />
              )}
              {hatTrinkgeld && trinkgeldNum > 0 && betragNum > 0 && (
                <div className="trinkgeld-total">
                  {fmtEur(betragNum)} + {fmtEur(trinkgeldNum)} Trinkgeld = <strong>{fmtEur(gesamtNum)}</strong>
                </div>
              )}
            </div>
          ) : null)}

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

          {/* Als Vorlage merken */}
          {!isEdit && (
            <div className="form-group">
              <div className="form-group--inline">
                <label>Als Vorlage merken</label>
                <button
                  type="button"
                  className={`toggle-btn${alsVorlage ? ' toggle-btn--active' : ''}`}
                  onClick={() => { setAlsVorlage(v => !v); setVorlageName(''); }}
                >
                  {alsVorlage ? 'Ja' : 'Nein'}
                </button>
              </div>
              {alsVorlage && (
                <input
                  type="text"
                  placeholder={kategorien.find(k => k.id === kategorieId)?.name || (typ === 'einzahlung' ? 'Einnahme' : 'Ausgabe')}
                  value={vorlageName}
                  onChange={e => setVorlageName(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn--full btn--${typ === 'einzahlung' ? 'primary' : 'danger-solid'}`}
            disabled={saving || betragNum <= 0}
          >
            {saving ? 'Speichern…' : isEdit ? 'Speichern' : 'Buchung anlegen'}
          </button>
        </form>
      </div>
    </div>
  );
}
