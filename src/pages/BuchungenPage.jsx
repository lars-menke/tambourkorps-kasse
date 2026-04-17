import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dbGetAll, dbDelete } from '../services/db';
import { pushStore } from '../utils/sync';
import BuchungModal from '../components/BuchungModal';
import BuchungDetailModal from '../components/BuchungDetailModal';

const FILTER_TYPEN = [
  { value: 'alle',       label: 'Alle' },
  { value: 'einzahlung', label: 'Einzahlungen' },
  { value: 'auszahlung', label: 'Auszahlungen' },
];

const formatBetrag = (betrag, typ) => {
  const f = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
  return typ === 'einzahlung' ? `+${f}` : `−${f}`;
};

const formatDatum = (datum) =>
  new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

export default function BuchungenPage() {
  const [listItems, setListItems] = useState([]); // Normal-Buchungen + virtuelle Umlage-Einträge
  const [filter, setFilter]       = useState('alle');
  const [detailBuchung, setDetailBuchung] = useState(null);
  const [editBuchung,   setEditBuchung]   = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Direkt-Aufruf vom Dashboard: Detail-Modal der übergebenen Buchung öffnen
  useEffect(() => {
    if (location.state?.openBuchung) {
      setDetailBuchung(location.state.openBuchung);
      window.history.replaceState({}, ''); // State einmalig konsumieren
    }
  }, []);

  const load = useCallback(async () => {
    const [allBuchungen, allUmlagen] = await Promise.all([
      dbGetAll('buchungen'),
      dbGetAll('umlagen'),
    ]);

    // Umlage-Buchungen herausfiltern und gruppieren
    const normalBuchungen  = allBuchungen.filter(b => !b.umlage_id);
    const umlageBuchungen  = allBuchungen.filter(b =>  b.umlage_id);

    const umlageGruppen = {};
    for (const b of umlageBuchungen) {
      if (!umlageGruppen[b.umlage_id]) umlageGruppen[b.umlage_id] = [];
      umlageGruppen[b.umlage_id].push(b);
    }

    // Pro Umlage einen virtuellen Listeneintrag erzeugen
    const umlageMap = Object.fromEntries(allUmlagen.map(u => [u.id, u]));
    const verwaisteBuchungen = []; // Umlage-Buchungen deren Umlage gelöscht wurde
    const virtuelleEintraege = Object.entries(umlageGruppen)
      .filter(([umlageId, buchungen]) => {
        if (umlageMap[umlageId]) return true;
        // Umlage nicht mehr vorhanden → als normale Buchungen behandeln
        verwaisteBuchungen.push(...buchungen);
        return false;
      })
      .map(([umlageId, buchungen]) => {
        const umlage = umlageMap[umlageId];
        const gesamtBetrag = buchungen.reduce((s, b) => s + b.betrag, 0);
        // Datum: Fälligkeit der Umlage, sonst letztes Zahlungsdatum
        const datum = umlage?.faelligkeit
          ?? [...buchungen].sort((a, b) => b.datum.localeCompare(a.datum))[0]?.datum
          ?? new Date().toISOString().slice(0, 10);
        return {
          id:        `__umlage_${umlageId}`,
          typ:       'einzahlung',
          betrag:    gesamtBetrag,
          datum,
          kategorie: 'Umlage',
          notiz:     umlage?.anlass ?? 'Umlage',
          umlage_id: umlageId,
          anzahl:    buchungen.length,
          _isUmlage: true,
        };
      });

    const combined = [...normalBuchungen, ...verwaisteBuchungen, ...virtuelleEintraege]
      .sort((a, b) => b.datum.localeCompare(a.datum));

    setListItems(combined);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('tk-sync-complete', load);
    return () => window.removeEventListener('tk-sync-complete', load);
  }, [load]);

  const filtered = filter === 'alle'
    ? listItems
    : listItems.filter(b => b.typ === filter);

  async function handleSave() {
    setEditBuchung(null);
    setDetailBuchung(null);
    await load();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
  }

  function handleEditFromDetail(b) {
    setDetailBuchung(null);
    setEditBuchung(b);
  }

  async function handleDelete(id) {
    if (!confirm('Buchung löschen?')) return;
    await dbDelete('buchungen', id);
    setDetailBuchung(null);
    await load();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
  }

  async function handleSwipeDelete(id) {
    await dbDelete('buchungen', id);
    await load();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
  }

  function handleItemClick(item) {
    if (item._isUmlage) {
      navigate(`/umlagen/${item.umlage_id}`);
    } else {
      setDetailBuchung(item);
    }
  }

  const hasBuchungen = listItems.some(b => !b._isUmlage);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Buchungen</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setEditBuchung({})}>
          + Neu
        </button>
      </header>

      <div className="filter-bar">
        {FILTER_TYPEN.map(({ value, label }) => (
          <button
            key={value}
            className={`filter-btn${filter === value ? ' filter-btn--active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {!hasBuchungen && listItems.length === 0
            ? <><p>Noch keine Buchungen.</p><p>Tippe auf „+ Neu" um loszulegen.</p></>
            : <p>Keine {filter === 'einzahlung' ? 'Einzahlungen' : 'Auszahlungen'} vorhanden.</p>
          }
        </div>
      ) : (
        <ul className="buchungen-list">
          {filtered.map(item => item._isUmlage
            ? (
              <li
                key={item.id}
                className="buchung-item buchung-item--umlage"
                onClick={() => handleItemClick(item)}
              >
                <div className="buchung-item__meta">
                  <span className="buchung-item__datum">{formatDatum(item.datum)}</span>
                  <span className="buchung-item__kategorie">Umlage</span>
                  <span className="buchung-item__umlage-count">{item.anzahl} Zahlung{item.anzahl !== 1 ? 'en' : ''}</span>
                </div>
                <div className="buchung-item__notiz">
                  {item.notiz}
                </div>
                <div className="buchung-item__right">
                  <div className={`buchung-item__betrag buchung-item__betrag--${item.typ}`}>
                    {formatBetrag(item.betrag, item.typ)}
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    width={14} height={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </li>
            ) : (
              <SwipeToDelete key={item.id} onDelete={() => handleSwipeDelete(item.id)}>
                <div
                  className="buchung-item"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="buchung-item__meta">
                    <span className="buchung-item__datum">{formatDatum(item.datum)}</span>
                    {item.kategorie && (
                      <span className="buchung-item__kategorie">{item.kategorie}</span>
                    )}
                  </div>
                  {item.notiz && (
                    <div className="buchung-item__notiz">{item.notiz}</div>
                  )}
                  <div className="buchung-item__right">
                    <div className={`buchung-item__betrag buchung-item__betrag--${item.typ}`}>
                      {formatBetrag(item.betrag, item.typ)}
                    </div>
                    {item.beleg_id && (
                      <span className="buchung-item__beleg-icon" title="Beleg vorhanden">📎</span>
                    )}
                  </div>
                </div>
              </SwipeToDelete>
            )
          )}
        </ul>
      )}

      {detailBuchung && (
        <BuchungDetailModal
          buchung={detailBuchung}
          onClose={() => setDetailBuchung(null)}
          onEdit={handleEditFromDetail}
          onDelete={handleDelete}
        />
      )}

      {editBuchung !== null && (
        <BuchungModal
          buchung={Object.keys(editBuchung).length === 0 ? null : editBuchung}
          onSave={handleSave}
          onClose={() => setEditBuchung(null)}
        />
      )}
    </div>
  );
}

const DELETE_W = 76;
const THRESHOLD = 38;

function SwipeToDelete({ children, onDelete }) {
  const [offset, setOffset]   = useState(0);
  const [animate, setAnimate] = useState(false);
  const touch = useRef({ startX: 0, startY: 0, active: false, wasOpen: false });

  const isOpen = offset <= -DELETE_W;

  function onTouchStart(e) {
    touch.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      active: false,
      wasOpen: isOpen,
    };
    setAnimate(false);
  }

  function onTouchMove(e) {
    const t = touch.current;
    const dx = e.touches[0].clientX - t.startX;
    const dy = e.touches[0].clientY - t.startY;

    if (!t.active) {
      if (Math.abs(dy) > Math.abs(dx) + 4) return; // vertikales Scrollen
      t.active = true;
    }

    const base = t.wasOpen ? -DELETE_W : 0;
    setOffset(Math.max(-DELETE_W, Math.min(0, base + dx)));
  }

  function onTouchEnd() {
    if (!touch.current.active) return;
    setAnimate(true);
    setOffset(prev => prev < -THRESHOLD ? -DELETE_W : 0);
  }

  function close() {
    setAnimate(true);
    setOffset(0);
  }

  return (
    <li className="swipeable-wrapper">
      <div className="swipeable-delete-bg">
        <button
          className="swipeable-delete-btn"
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); close(); onDelete(); }}
          tabIndex={isOpen ? 0 : -1}
          aria-label="Buchung löschen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>
      <div
        className="swipeable-content"
        style={{
          transform: `translateX(${offset}px)`,
          transition: animate ? 'transform 0.2s ease' : 'none',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={isOpen ? (e) => { e.stopPropagation(); e.preventDefault(); close(); } : undefined}
      >
        {children}
      </div>
    </li>
  );
}
