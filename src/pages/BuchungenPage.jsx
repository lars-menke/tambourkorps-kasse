import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLargeTitle } from '../hooks/useLargeTitle';
import { dbGetAll, dbDelete, dbPut } from '../services/db';
import { pushStore } from '../utils/sync';
import BuchungModal from '../components/BuchungModal';
import BuchungDetailModal from '../components/BuchungDetailModal';
import { CategoryChip } from '../components/CategoryChip';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/ToastProvider';
import { haptic } from '../lib/haptics';
import { PullToRefresh } from '../components/PullToRefresh';
import { useCategorienMap } from '../hooks/useCategorienMap';
import { metaZusammenfassung } from '../lib/kategorieMeta';

const FILTER_TYPEN = [
  { value: 'alle',       label: 'Alle' },
  { value: 'einzahlung', label: 'Einzahlungen' },
  { value: 'auszahlung', label: 'Auszahlungen' },
  { value: 'saldo',      label: 'Saldo' },
];

const fmtEur = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0);

function buildMonatsSaldo(buchungen) {
  const map = {};
  for (const b of buchungen) {
    const d = new Date(b.datum + 'T12:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = { year: d.getFullYear(), month: d.getMonth(), net: 0 };
    map[key].net += b.typ === 'einzahlung' ? (b.betrag || 0) : -(b.betrag || 0);
  }
  const sorted = Object.keys(map).sort();
  let running = 0;
  return sorted.map(k => {
    running += map[k].net;
    return { key: k, ...map[k], saldo: running };
  }).reverse();
}

const SORT_OPTIONEN = [
  { value: 'datum_desc',  label: 'Neueste zuerst' },
  { value: 'datum_asc',   label: 'Älteste zuerst' },
  { value: 'betrag_desc', label: 'Höchster Betrag' },
  { value: 'betrag_asc',  label: 'Niedrigster Betrag' },
  { value: 'manuell',     label: 'Manuell' },
];

function groupByDate(items) {
  const groups = [];
  const dateMap = new Map();
  for (const item of items) {
    if (!dateMap.has(item.datum)) {
      const group = { datum: item.datum, items: [] };
      groups.push(group);
      dateMap.set(item.datum, group);
    }
    dateMap.get(item.datum).items.push(item);
  }
  return groups;
}

function formatDateLabel(datum) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (datum === today) return 'Heute';
  if (datum === yesterday) return 'Gestern';
  return new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
}

function dailyNet(items) {
  return items.reduce((sum, b) => sum + (b.typ === 'einzahlung' ? (b.betrag || 0) : -(b.betrag || 0)), 0);
}

const formatBetrag = (betrag, typ) => {
  const f = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
  return typ === 'einzahlung' ? `+${f}` : `−${f}`;
};

const formatDatum = (datum, uhrzeit) => {
  const d = new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  return uhrzeit ? `${d} ${uhrzeit}` : d;
};

function datumKey(item) {
  if (item.uhrzeit) return `${item.datum}T${item.uhrzeit}:00`;
  if (item.erstellt) {
    const t = new Date(item.erstellt);
    const time = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`;
    return `${item.datum}T${time}`;
  }
  return `${item.datum}T00:00:00`;
}

export default function BuchungenPage() {
  const { titleRef, compact } = useLargeTitle();
  const [listItems, setListItems]   = useState([]);
  const [monatsSaldo, setMonatsSaldo] = useState([]);
  const [filter, setFilter]         = useState('alle');
  const [sort, setSort]             = useState('datum_desc');
  const [manualOrder, setManualOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('buch_manual_order') || 'null'); }
    catch { return null; }
  });
  const [detailBuchung, setDetailBuchung] = useState(null);
  const [editBuchung,   setEditBuchung]   = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { push: toast } = useToast();
  const catIcons = useCategorienMap();

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
    setMonatsSaldo(buildMonatsSaldo(allBuchungen));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('tk-sync-complete', load);
    return () => window.removeEventListener('tk-sync-complete', load);
  }, [load]);

  useEffect(() => {
    if (sort !== 'manuell' || listItems.length === 0) return;
    const allIds = listItems.map(b => String(b.id));
    setManualOrder(prev => {
      if (!prev) {
        const ordered = [...listItems]
          .sort((a, b) => datumKey(b).localeCompare(datumKey(a)))
          .map(b => String(b.id));
        localStorage.setItem('buch_manual_order', JSON.stringify(ordered));
        return ordered;
      }
      const existing = new Set(prev);
      const newIds = allIds.filter(id => !existing.has(id));
      if (newIds.length === 0) return prev;
      const next = [...newIds, ...prev];
      localStorage.setItem('buch_manual_order', JSON.stringify(next));
      return next;
    });
  }, [sort, listItems]);

  const handleReorder = useCallback((fromId, toId) => {
    setManualOrder(prev => {
      const base = prev ?? [];
      const from = base.indexOf(String(fromId));
      const to = base.indexOf(String(toId));
      if (from === -1 || to === -1) return prev;
      const next = [...base];
      next.splice(from, 1);
      next.splice(to, 0, String(fromId));
      localStorage.setItem('buch_manual_order', JSON.stringify(next));
      return next;
    });
  }, []);

  const filtered = filter === 'alle'
    ? listItems
    : listItems.filter(b => b.typ === filter);

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (sort === 'betrag_desc') return b.betrag - a.betrag;
    if (sort === 'betrag_asc')  return a.betrag - b.betrag;
    if (sort === 'manuell') {
      const order = manualOrder ?? [];
      const ai = order.indexOf(String(a.id)), bi = order.indexOf(String(b.id));
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    const cmp = datumKey(a).localeCompare(datumKey(b));
    return sort === 'datum_asc' ? cmp : -cmp;
  });

  async function handleSave() {
    setEditBuchung(null);
    setDetailBuchung(null);
    await load();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
    haptic('success');
    toast({ message: 'Buchung gespeichert.', variant: 'success' });
  }

  function handleEditFromDetail(b) {
    setDetailBuchung(null);
    setEditBuchung(b);
  }

  async function handleDelete(id) {
    if (!confirm('Buchung löschen?')) return;
    const deleted = listItems.find(b => b.id === id);
    await dbDelete('buchungen', id);
    setDetailBuchung(null);
    await load();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
    haptic('warning');
    toast({
      message: 'Buchung gelöscht.',
      variant: 'success',
      undo: deleted ? async () => {
        const { _isUmlage, ...rest } = deleted;
        await dbPut('buchungen', rest);
        await load();
        pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
      } : undefined,
    });
  }

  async function handleSwipeDelete(id) {
    const deleted = listItems.find(b => b.id === id);
    await dbDelete('buchungen', id);
    await load();
    pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
    haptic('warning');
    toast({
      message: 'Buchung gelöscht.',
      variant: 'success',
      undo: deleted ? async () => {
        const { _isUmlage, ...rest } = deleted;
        await dbPut('buchungen', rest);
        await load();
        pushStore('buchungen', 'data/buchungen.json').catch(console.warn);
      } : undefined,
    });
  }

  function handleItemClick(item) {
    if (item._isUmlage) {
      navigate(`/umlagen/${item.umlage_id}`);
    } else {
      setDetailBuchung(item);
    }
  }

  const hasBuchungen = listItems.some(b => !b._isUmlage);

  const renderItem = (item) => item._isUmlage ? (
    <li
      key={item.id}
      className="buchung-item buchung-item--umlage"
      onClick={() => handleItemClick(item)}
    >
      <div className="buchung-item__meta">
        <span className="buchung-item__datum">{formatDatum(item.datum, item.uhrzeit)}</span>
        <CategoryChip name="Umlage" cat={catIcons['Umlage']} />
        <span className="buchung-item__umlage-count">{item.anzahl} Zahlung{item.anzahl !== 1 ? 'en' : ''}</span>
      </div>
      <div className="buchung-item__notiz">{item.notiz}</div>
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
      <div className="buchung-item" onClick={() => handleItemClick(item)}>
        <div className="buchung-item__meta">
          <span className="buchung-item__datum">{formatDatum(item.datum, item.uhrzeit)}</span>
          {item.kategorie && <CategoryChip name={item.kategorie} cat={catIcons[item.kategorie]} />}
        </div>
        {(item.notiz || metaZusammenfassung(item.meta, item.kategorie)) && (
          <div className="buchung-item__notiz">
            {metaZusammenfassung(item.meta, item.kategorie) && (
              <span className="buchung-item__notiz--meta">{metaZusammenfassung(item.meta, item.kategorie)}</span>
            )}
            {item.notiz && metaZusammenfassung(item.meta, item.kategorie) && (
              <span className="buchung-item__notiz-info"> ({item.notiz})</span>
            )}
            {item.notiz && !metaZusammenfassung(item.meta, item.kategorie) && (
              <span>{item.notiz}</span>
            )}
          </div>
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
  );

  return (
    <div className="page">
      <header className={`page-header${compact ? ' is-compact' : ''}`}>
        <h1>Buchungen</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setEditBuchung({})}>
          + Neu
        </button>
      </header>

      <PullToRefresh onRefresh={load}>
      <h1 ref={titleRef} className="page-large-title">Buchungen</h1>
      <div className="filter-bar">
        <div className="filter-bar__pills">
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
        {filter !== 'saldo' && (
          <select
            className="sort-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
            aria-label="Sortierung"
          >
            {SORT_OPTIONEN.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>

      {filter === 'saldo' ? (
        monatsSaldo.length === 0 ? (
          <EmptyState title="Keine Buchungen" description="Noch keine Daten für den Saldo-Verlauf." />
        ) : (
          <div className="monatssaldo-card">
            <div className="monatssaldo-card__title">Saldo</div>
            {monatsSaldo.map(m => (
              <div key={m.key} className="monatssaldo-row">
                <span className="monatssaldo-row__monat">
                  {new Date(m.year, m.month).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </span>
                <span className={`monatssaldo-row__net${m.net >= 0 ? ' monatssaldo-row__net--pos' : ' monatssaldo-row__net--neg'}`}>
                  {m.net >= 0 ? '+' : ''}{fmtEur(m.net)}
                </span>
                <span className="monatssaldo-row__saldo">{fmtEur(m.saldo)}</span>
              </div>
            ))}
          </div>
        )
      ) : sortedFiltered.length === 0 ? (
        !hasBuchungen && listItems.length === 0
          ? <EmptyState
              title="Noch keine Buchungen"
              description="Lege deine erste Einnahme oder Ausgabe an. Die App synchronisiert automatisch."
            />
          : <EmptyState
              title={filter === 'alle' ? 'Keine Buchungen' : `Keine ${filter === 'einzahlung' ? 'Einzahlungen' : 'Auszahlungen'}`}
              description="Wechsle den Filter, um andere Buchungen zu sehen."
            />
      ) : sort === 'manuell' ? (
        <DraggableList items={sortedFiltered} onReorder={handleReorder}>
          {(item) => (
            <div
              className={`buchung-item${item._isUmlage ? ' buchung-item--umlage' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="buchung-item__meta">
                <span className="buchung-item__datum">{formatDatum(item.datum, item.uhrzeit)}</span>
                {item._isUmlage ? (
                  <>
                    <CategoryChip name="Umlage" cat={catIcons['Umlage']} />
                    <span className="buchung-item__umlage-count">{item.anzahl} Zahlung{item.anzahl !== 1 ? 'en' : ''}</span>
                  </>
                ) : item.kategorie && (
                  <CategoryChip name={item.kategorie} cat={catIcons[item.kategorie]} />
                )}
              </div>
              {item._isUmlage ? (
                <div className="buchung-item__notiz">{item.notiz}</div>
              ) : (item.notiz || metaZusammenfassung(item.meta, item.kategorie)) && (
                <div className="buchung-item__notiz">
                  {metaZusammenfassung(item.meta, item.kategorie) && (
                    <span className="buchung-item__notiz--meta">{metaZusammenfassung(item.meta, item.kategorie)}</span>
                  )}
                  {item.notiz && metaZusammenfassung(item.meta, item.kategorie) && (
                    <span className="buchung-item__notiz-info"> ({item.notiz})</span>
                  )}
                  {item.notiz && !metaZusammenfassung(item.meta, item.kategorie) && (
                    <span>{item.notiz}</span>
                  )}
                </div>
              )}
              <div className="buchung-item__right">
                <div className={`buchung-item__betrag buchung-item__betrag--${item.typ}`}>
                  {formatBetrag(item.betrag, item.typ)}
                </div>
                {item.beleg_id && !item._isUmlage && (
                  <span className="buchung-item__beleg-icon" title="Beleg vorhanden">📎</span>
                )}
                {item._isUmlage && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    width={14} height={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </DraggableList>
      ) : (sort === 'datum_desc' || sort === 'datum_asc') ? (
        <div className="buchungen-grouped">
          {groupByDate(sortedFiltered).map(group => (
            <div key={group.datum} className="buchung-date-group">
              <div className="buchung-date-sep">
                <span className="buchung-date-sep__label">{formatDateLabel(group.datum)}</span>
                <span className={`buchung-date-sep__net${dailyNet(group.items) >= 0 ? ' buchung-date-sep__net--pos' : ' buchung-date-sep__net--neg'}`}>
                  {dailyNet(group.items) >= 0 ? '+' : ''}{fmtEur(dailyNet(group.items))}
                </span>
              </div>
              <ul className="buchungen-list">{group.items.map(renderItem)}</ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="buchungen-list">{sortedFiltered.map(renderItem)}</ul>
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
      </PullToRefresh>
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

function applyReorder(arr, fromId, toId) {
  const from = arr.findIndex(i => String(i.id) === fromId);
  const to   = arr.findIndex(i => String(i.id) === toId);
  if (from === -1 || to === -1) return arr;
  const next = [...arr];
  const [el] = next.splice(from, 1);
  next.splice(to, 0, el);
  return next;
}

function DraggableList({ items, onReorder, children }) {
  const [displayItems, setDisplayItems] = useState(items);
  const [draggingId, setDraggingId]     = useState(null);
  const dragRef  = useRef({ id: null, overId: null });
  const itemEls  = useRef({});

  useEffect(() => {
    if (!draggingId) setDisplayItems(items);
  }, [items, draggingId]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.id) return;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      if (y == null) return;
      for (const [id, el] of Object.entries(itemEls.current)) {
        if (!el || id === dragRef.current.id) continue;
        const r = el.getBoundingClientRect();
        if (y >= r.top && y < r.bottom && id !== dragRef.current.overId) {
          dragRef.current.overId = id;
          setDisplayItems(prev => applyReorder(prev, dragRef.current.id, id));
          break;
        }
      }
    };
    const onUp = () => {
      const { id, overId } = dragRef.current;
      if (id && overId && id !== overId) onReorder(id, overId);
      dragRef.current = { id: null, overId: null };
      setDraggingId(null);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [onReorder]);

  function startDrag(id, e) {
    e.preventDefault();
    dragRef.current = { id, overId: id };
    setDraggingId(id);
    setDisplayItems(items);
  }

  return (
    <ul className="buchungen-list">
      {displayItems.map(item => (
        <li
          key={item.id}
          ref={el => { itemEls.current[String(item.id)] = el; }}
          className={`draggable-item${draggingId === item.id ? ' draggable-item--active' : ''}`}
        >
          <button
            className="drag-handle"
            onPointerDown={(e) => startDrag(String(item.id), e)}
            aria-label="Reihenfolge ändern"
          >
            <svg viewBox="0 0 20 20" width={16} height={16} fill="currentColor" aria-hidden="true">
              <circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/>
              <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
              <circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/>
            </svg>
          </button>
          <div className="draggable-item__content">
            {children(item)}
          </div>
        </li>
      ))}
    </ul>
  );
}
