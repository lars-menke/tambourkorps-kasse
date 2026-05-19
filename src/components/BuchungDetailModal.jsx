import { useEffect, useRef, useState, useCallback } from 'react';
import { dbGet } from '../services/db';
import { fetchBeleg } from '../utils/sync';
import { getMetaSchemaFromRecord } from '../lib/kategorieMeta';
import { useClosingAnimation } from '../hooks/useClosingAnimation';

const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0);

const formatBetrag = (betrag, typ) => {
  const formatted = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
  return typ === 'einzahlung' ? `+${formatted}` : `−${formatted}`;
};

const formatDatum = (datum) =>
  new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

export default function BuchungDetailModal({ buchung, onClose, onEdit, onDelete }) {
  const { isClosing, handleClose } = useClosingAnimation(onClose);
  const [belegUrl, setBelegUrl] = useState(null);
  const [belegStatus, setBelegStatus] = useState('idle'); // idle | loading | fetching | done | fehlt
  const [lightbox, setLightbox] = useState(false);
  const [metaSchema, setMetaSchema] = useState([]);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (buchung.kategorie_id) {
      dbGet('kategorien', buchung.kategorie_id).then(k => {
        setMetaSchema(getMetaSchemaFromRecord(k));
      });
    }
  }, [buchung.kategorie_id]);

  // Scroll immer ganz nach oben beim Öffnen (iOS-Problem)
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [buchung]);

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
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isEin = buchung.typ === 'einzahlung';

  return (
    <>
      <div className={`modal-overlay${isClosing ? ' is-closing' : ''}`} onClick={handleBackdrop}>
        <div className={`bottom-sheet${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true">
          <div className="bottom-sheet__handle" />

          <div className="bottom-sheet__header">
            <h2>Buchungsdetails</h2>
            <button type="button" className="btn btn--icon" onClick={handleClose} aria-label="Schließen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="bottom-sheet__body" ref={bodyRef}>

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
                <span className="detail-row__value">
                  {formatDatum(buchung.datum)}
                  {buchung.uhrzeit && <span style={{ marginLeft: 6, opacity: 0.6 }}>{buchung.uhrzeit} Uhr</span>}
                </span>
              </div>
              {buchung.kategorie && (
                <div className="detail-row">
                  <span className="detail-row__label">Kategorie</span>
                  <span className="detail-row__value">{buchung.kategorie}</span>
                </div>
              )}
              {buchung.meta?.spendername && (
                <div className="detail-row">
                  <span className="detail-row__label">Spender</span>
                  <span className="detail-row__value">{buchung.meta.spendername}</span>
                </div>
              )}
              {buchung.meta?.ort && (
                <div className="detail-row">
                  <span className="detail-row__label">Ort</span>
                  <span className="detail-row__value">{buchung.meta.ort}</span>
                </div>
              )}
              {buchung.meta?.von && (
                <div className="detail-row">
                  <span className="detail-row__label">Strecke</span>
                  <span className="detail-row__value">{buchung.meta.von} → {buchung.meta.nach ?? '?'}</span>
                </div>
              )}
              {buchung.meta?.trinkgeld != null && (
                <div className="detail-row">
                  <span className="detail-row__label">Trinkgeld</span>
                  <span className="detail-row__value">
                    {fmt(buchung.meta.betragBase)} + {fmt(buchung.meta.trinkgeld)}
                  </span>
                </div>
              )}
              {metaSchema
                .filter(f => f.type === 'text' && f.key.startsWith('fld_') && buchung.meta?.[f.key]?.toString().trim())
                .map(f => (
                  <div key={f.key} className="detail-row">
                    <span className="detail-row__label">{f.label || 'Zusatz'}</span>
                    <span className="detail-row__value">{buchung.meta[f.key]}</span>
                  </div>
                ))
              }
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

            {/* Notiz (außerhalb der Tabelle, damit overflow:hidden nicht stört) */}
            {buchung.notiz ? (
              <div className="detail-notiz">
                <div className="detail-notiz__label">Notiz</div>
                <div className="detail-notiz__text">{buchung.notiz}</div>
              </div>
            ) : null}

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
