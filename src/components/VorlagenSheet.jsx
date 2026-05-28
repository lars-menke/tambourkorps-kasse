import { useState, useEffect } from 'react';
import { useExitAnimation } from '../hooks/useClosingAnimation';
import { dbGetAll, dbDelete, dbPut } from '../services/db';
import { pushStore } from '../utils/sync';
import { fmtEur } from '../utils/format';

export function VorlagenSheet({ open, onClose, onSelect }) {
  const { isVisible, isClosing } = useExitAnimation(open);
  const [vorlagen, setVorlagen] = useState([]);

  useEffect(() => {
    if (!open) return;
    dbGetAll('vorlagen').then(list => {
      setVorlagen([...list].sort((a, b) => {
        if (b.verwendungen !== a.verwendungen) return b.verwendungen - a.verwendungen;
        const da = a.zuletzt_verwendet || a.erstellt;
        const db_ = b.zuletzt_verwendet || b.erstellt;
        return new Date(db_) - new Date(da);
      }));
    });
  }, [open]);

  async function handleDelete(id) {
    await dbDelete('vorlagen', id);
    setVorlagen(prev => prev.filter(v => v.id !== id));
    // Vorlage auch auf GitHub loeschen (konsistent mit anderen Stores)
    pushStore('vorlagen', 'data/vorlagen.json').catch(console.warn);
  }

  async function handleSelect(vorlage) {
    await dbPut('vorlagen', {
      ...vorlage,
      verwendungen: (vorlage.verwendungen || 0) + 1,
      zuletzt_verwendet: new Date().toISOString(),
    });
    onSelect(vorlage);
    onClose();
  }

  if (!isVisible) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className={`quick-sheet${isClosing ? ' is-closing' : ''}`} role="dialog" aria-label="Vorlage nutzen">
        <div className="quick-sheet__handle" />

        <div className="vorlage-sheet-header">
          <span className="vorlage-sheet-title">Vorlage nutzen</span>
          <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Schließen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {vorlagen.length === 0 ? (
          <div className="vorlage-empty">
            <p>Noch keine Vorlagen gespeichert.</p>
            <p>Aktiviere „Als Vorlage merken" beim Anlegen oder Anzeigen einer Buchung.</p>
          </div>
        ) : (
          <ul className="vorlage-list">
            {vorlagen.map(v => (
              <li key={v.id} className="vorlage-item">
                <button className="vorlage-item__btn" onClick={() => handleSelect(v)}>
                  <div className="vorlage-item__info">
                    <span className="vorlage-item__name">{v.name}</span>
                    {v.kategorie && (
                      <span className="vorlage-item__meta">{v.kategorie}</span>
                    )}
                  </div>
                  <span className={`vorlage-item__betrag vorlage-item__betrag--${v.typ}`}>
                    {v.typ === 'einzahlung' ? '+' : '−'}{fmtEur(v.betrag)}
                  </span>
                </button>
                <button
                  className="vorlage-item__del"
                  onClick={() => handleDelete(v.id)}
                  aria-label={`${v.name} löschen`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
