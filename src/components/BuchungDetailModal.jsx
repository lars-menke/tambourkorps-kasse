import { useEffect, useState, useCallback } from 'react';
import { dbGet } from '../services/db';
import { fetchBeleg } from '../utils/sync';

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
  const [belegStatus, setBelegStatus] = useState('idle'); // idle | loading | fetching | done | fehlt
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!buchung.beleg_id) return;
    setBelegStatus('loading');

    dbGet('belege', buchung.beleg_id).then(async (b) => {
      if (b?.dataUrl) {
        setBelegUrl(b.dataUrl);
        setBelegStatus('done');
        return;
      }
      setBelegStatus('fetching');
      try {
        const remote = await fetchBeleg(buchung.beleg_id);
        if (remote?.dataUrl) {
          setBelegUrl(remote.dataUrl);
          setBelegStatus('done');
        } else {
          setBelegStatus('fehlt');
        }
      } catch {
        setBelegStatus('fehlt');
      }
    });
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
    <>
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
                <div className="detail-row detail-row--notiz">
                  <span className="detail-row__label">Notiz</span>
                  <span className="detail-row__value detail-row__value--notiz">{buchung.notiz}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-row__label">Erfasst</span>
                <span className="detail-row__value">
                  {new Date(buchung.erstellt).toLocaleDateString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Beleg */}
            {buchung.beleg_id && (
              <div className="detail-beleg">
                <div className="detail-beleg__label">Beleg</div>

                {(belegStatus === 'loading' || belegStatus === 'fetching') && (
                  <div className="detail-beleg__loading">
                    {belegStatus === 'fetching' ? 'Lade von GitHub…' : 'Lädt…'}
                  </div>
                )}

                {belegStatus === 'done' && belegUrl && (
                  <button
                    type="button"
                    className="detail-beleg__btn"
                    onClick={() => setLightbox(true)}
                    aria-label="Beleg vergrößern"
                  >
                    <img src={belegUrl} alt="Beleg" className="detail-beleg__img" />
                    <span className="detail-beleg__hint">Antippen zum Vergrößern</span>
                  </button>
                )}

                {belegStatus === 'fehlt' && (
                  <div className="detail-beleg__fehlt">
                    Beleg nicht verfügbar — möglicherweise auf einem anderen Gerät hochgeladen und noch nicht synchronisiert.
                  </div>
                )}
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

      {/* Beleg Lightbox */}
      {lightbox && belegUrl && (
        <div className="beleg-lightbox" onClick={() => setLightbox(false)}>
          <button className="beleg-lightbox__close" onClick={() => setLightbox(false)} aria-label="Schließen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={24} height={24}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img src={belegUrl} alt="Beleg" className="beleg-lightbox__img" />
          <div className="beleg-lightbox__hint">Tippen zum Schließen</div>
        </div>
      )}
    </>
  );
}
