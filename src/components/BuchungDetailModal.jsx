import { useEffect, useState, useCallback } from 'react';
import { dbGet } from '../services/db';

const formatBetrag = (betrag, typ) => {
  const formatted = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
  return typ === 'einzahlung' ? `+${formatted}` : `−${formatted}`;
};

const formatDatum = (datum) =>
  new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

export default function BuchungDetailModal({ buchung, onClose, onEdit, onDelete }) {
  const [belegUrl, setBelegUrl] = useState(null);

  useEffect(() => {
    if (buchung.beleg_id) {
      dbGet('belege', buchung.beleg_id).then(b => { if (b) setBelegUrl(b.dataUrl); });
    }
  }, [buchung]);

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isEin = buchung.typ === 'einzahlung';

  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className="bottom-sheet" role="dialog" aria-modal="true">
        <div className="bottom-sheet__handle" />

        <div className="bottom-sheet__header">
          <h2>Buchungsdetails</h2>
          <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Schließen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="bottom-sheet__body">

          {/* Betrag + Typ */}
          <div className="detail-hero">
            <div className={`detail-hero__betrag detail-hero__betrag--${buchung.typ}`}>
              {formatBetrag(buchung.betrag, buchung.typ)}
            </div>
            <span className={`detail-hero__typ detail-hero__typ--${buchung.typ}`}>
              {isEin ? 'Einzahlung' : 'Auszahlung'}
            </span>
          </div>

          {/* Infotabelle */}
          <div className="detail-table">
            <div className="detail-row">
              <span className="detail-row__label">Datum</span>
              <span className="detail-row__value">{formatDatum(buchung.datum)}</span>
            </div>
            {buchung.kategorie && (
              <div className="detail-row">
                <span className="detail-row__label">Kategorie</span>
                <span className="detail-row__value">{buchung.kategorie}</span>
              </div>
            )}
            {buchung.notiz && (
              <div className="detail-row">
                <span className="detail-row__label">Notiz</span>
                <span className="detail-row__value detail-row__value--notiz">{buchung.notiz}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-row__label">Erstellt</span>
              <span className="detail-row__value">
                {new Date(buchung.erstellt).toLocaleDateString('de-DE', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Beleg */}
          {belegUrl && (
            <div className="detail-beleg">
              <div className="detail-beleg__label">Beleg</div>
              <img
                src={belegUrl}
                alt="Beleg"
                className="detail-beleg__img"
                onClick={() => window.open(belegUrl)}
              />
              <div className="detail-beleg__hint">Antippen zum Vergrößern</div>
            </div>
          )}

          {/* Aktionen */}
          <div className="detail-actions">
            <button className="btn btn--primary btn--full" onClick={() => onEdit(buchung)}>
              Bearbeiten
            </button>
            <button className="btn btn--danger btn--full" onClick={() => onDelete(buchung.id)}>
              Löschen
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
