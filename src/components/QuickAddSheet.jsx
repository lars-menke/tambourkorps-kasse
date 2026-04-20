import { useState, useEffect, useRef } from 'react';
import { dbGetAll, dbPut } from '../services/db';
import { generateId } from '../utils/imageUtils';
import { pushStore } from '../utils/sync';
import { haptic } from '../lib/haptics';

function getTopKategorien(buchungen, kategorien, n = 4) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const freq = {};
  for (const b of buchungen) {
    if (!b.kategorie) continue;
    if (new Date(b.datum + 'T12:00:00') < cutoff) continue;
    freq[b.kategorie] = (freq[b.kategorie] || 0) + 1;
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  if (sorted.length > 0) return sorted.slice(0, n);
  return kategorien.slice(0, n).map(k => k.name);
}

export function QuickAddSheet({ open, onClose, onSave, initialTyp = null }) {
  const [typ, setTyp] = useState(initialTyp || 'auszahlung');
  const [betrag, setBetrag] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [quickPicks, setQuickPicks] = useState([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTyp(initialTyp || 'auszahlung');
    setBetrag('');
    setKategorie('');
    setSaving(false);
    setTimeout(() => inputRef.current?.focus(), 80);

    const vv = window.visualViewport;
    if (vv) {
      const onResize = () => {
        document.documentElement.style.setProperty(
          '--kbd-offset',
          `${Math.max(0, window.innerHeight - vv.height)}px`
        );
      };
      vv.addEventListener('resize', onResize);
      vv.addEventListener('scroll', onResize);
      onResize();
      return () => {
        vv.removeEventListener('resize', onResize);
        vv.removeEventListener('scroll', onResize);
        document.documentElement.style.removeProperty('--kbd-offset');
      };
    }
  }, [open]);

  useEffect(() => {
    async function load() {
      const [buchungen, kategorien] = await Promise.all([
        dbGetAll('buchungen'),
        dbGetAll('kategorien'),
      ]);
      setQuickPicks(getTopKategorien(buchungen, kategorien));
    }
    if (open) load().catch(() => {});
  }, [open]);

  async function handleSave() {
    const val = parseFloat(betrag.replace(',', '.'));
    if (!val || val <= 0) return;
    setSaving(true);
    haptic('success');
    try {
      const today = new Date().toISOString().slice(0, 10);
      await dbPut('buchungen', {
        id: generateId('b'),
        typ,
        betrag: val,
        datum: today,
        kategorie: kategorie || null,
        kategorie_id: null,
        notiz: null,
        beleg_id: null,
      });
      await pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" role="dialog" aria-label="Buchung erfassen">
        <div className="bottom-sheet__handle" />

        <div className="sheet-type-row">
          <button
            className={`sheet-type-btn${typ === 'einzahlung' ? ' is-active is-active--income' : ''}`}
            onClick={() => setTyp('einzahlung')}
          >
            Einnahme
          </button>
          <button
            className={`sheet-type-btn${typ === 'auszahlung' ? ' is-active is-active--expense' : ''}`}
            onClick={() => setTyp('auszahlung')}
          >
            Ausgabe
          </button>
        </div>

        <div className="sheet-amount-wrap">
          <input
            ref={inputRef}
            className="sheet-amount"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            placeholder="0,00"
            value={betrag}
            onChange={e => setBetrag(e.target.value)}
          />
          <span className="sheet-amount__currency">€</span>
        </div>

        {quickPicks.length > 0 && (
          <div className="sheet-picks">
            {quickPicks.map(name => (
              <button
                key={name}
                className={`sheet-pick${kategorie === name ? ' is-active' : ''}`}
                onClick={() => setKategorie(k => k === name ? '' : name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        <div className="sheet-actions">
          <button className="btn btn--ghost" onClick={onClose}>Abbrechen</button>
          <button
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saving || !betrag.trim()}
          >
            {saving ? '…' : 'Speichern'}
          </button>
        </div>
      </div>
    </>
  );
}
