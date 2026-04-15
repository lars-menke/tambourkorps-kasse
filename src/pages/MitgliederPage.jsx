import { useState, useEffect, useCallback } from 'react';
import { dbGetAll, dbPut, dbDelete } from '../services/db';
import { generateId } from '../utils/imageUtils';
import { pushStore } from '../utils/sync';

const FUNKTIONEN = [
  { value: '',             label: '— Keine —' },
  { value: 'tambourmajor', label: 'Tambourmajor' },
  { value: 'vize',         label: 'Vize' },
  { value: 'kassenwart',   label: 'Kassenwart' },
];

const FUNKTION_BADGE = {
  tambourmajor: { label: 'TM',    title: 'Tambourmajor' },
  vize:         { label: 'Vize',  title: 'Vize' },
  kassenwart:   { label: 'KW',    title: 'Kassenwart' },
};

// Anzeigename: "Nachname, Vorname" wenn beide vorhanden, sonst name
function displayName(m) {
  if (m.nachname && m.vorname) return `${m.nachname}, ${m.vorname}`;
  if (m.nachname) return m.nachname;
  return m.name ?? '';
}

// Sortierschlüssel: Nachname zuerst
function sortKey(m) {
  return (m.nachname ?? m.name ?? '').toLowerCase();
}

// Beim Speichern: name-Feld für Abwärtskompatibilität (Umlage-Notiz etc.)
function computeName(vorname, nachname) {
  const v = vorname.trim();
  const n = nachname.trim();
  if (n && v) return `${n}, ${v}`;
  return n || v;
}

export default function MitgliederPage() {
  const [mitglieder, setMitglieder] = useState([]);
  const [editMember, setEditMember] = useState(null); // null | {} (neu) | {...} (bearbeiten)

  const load = useCallback(async () => {
    const data = await dbGetAll('mitglieder');
    const sorted = [...data].sort((a, b) => {
      if (a.aktiv !== b.aktiv) return a.aktiv ? -1 : 1;
      return sortKey(a).localeCompare(sortKey(b), 'de');
    });
    setMitglieder(sorted);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('tk-sync-complete', load);
    return () => window.removeEventListener('tk-sync-complete', load);
  }, [load]);

  async function handleSave(record) {
    // Wenn eine Funktion vergeben wird: bisherigen Träger dieser Funktion entfernen
    if (record.funktion) {
      const all = await dbGetAll('mitglieder');
      for (const m of all) {
        if (m.funktion === record.funktion && m.id !== record.id) {
          await dbPut('mitglieder', { ...m, funktion: null });
        }
      }
    }
    await dbPut('mitglieder', record);
    setEditMember(null);
    await load();
    pushStore('mitglieder', 'data/mitglieder.json').catch(console.warn);
  }

  async function handleToggleAktiv(m) {
    await dbPut('mitglieder', { ...m, aktiv: !m.aktiv });
    await load();
    pushStore('mitglieder', 'data/mitglieder.json').catch(console.warn);
  }

  async function handleDelete(id) {
    if (!confirm('Mitglied löschen?')) return;
    await dbDelete('mitglieder', id);
    await load();
    pushStore('mitglieder', 'data/mitglieder.json').catch(console.warn);
  }

  const aktive   = mitglieder.filter(m => m.aktiv);
  const inaktive = mitglieder.filter(m => !m.aktiv);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mitglieder</h1>
        <button
          className="btn btn--primary btn--sm"
          onClick={() => setEditMember({})}
        >
          + Neu
        </button>
      </header>

      {mitglieder.length === 0 ? (
        <div className="empty-state">
          <p>Noch keine Mitglieder.</p>
          <p>Tippe auf „+ Neu" um ein Mitglied hinzuzufügen.</p>
        </div>
      ) : (
        <>
          {aktive.length > 0 && (
            <section className="member-section">
              <div className="member-section__title">
                Aktiv <span className="member-section__count">{aktive.length}</span>
              </div>
              <ul className="member-list">
                {aktive.map(m => (
                  <MemberItem
                    key={m.id}
                    member={m}
                    onEdit={() => setEditMember(m)}
                    onToggle={handleToggleAktiv}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            </section>
          )}
          {inaktive.length > 0 && (
            <section className="member-section">
              <div className="member-section__title">
                Inaktiv <span className="member-section__count">{inaktive.length}</span>
              </div>
              <ul className="member-list">
                {inaktive.map(m => (
                  <MemberItem
                    key={m.id}
                    member={m}
                    onEdit={() => setEditMember(m)}
                    onToggle={handleToggleAktiv}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {editMember !== null && (
        <MemberModal
          member={Object.keys(editMember).length === 0 ? null : editMember}
          onSave={handleSave}
          onClose={() => setEditMember(null)}
        />
      )}
    </div>
  );
}

function MemberItem({ member, onEdit, onToggle, onDelete }) {
  const badge = member.funktion ? FUNKTION_BADGE[member.funktion] : null;

  return (
    <li className={`member-item${member.aktiv ? '' : ' member-item--inaktiv'}`}>
      <button
        className={`member-item__status ${member.aktiv ? 'member-item__status--aktiv' : 'member-item__status--inaktiv'}`}
        onClick={() => onToggle(member)}
        title={member.aktiv ? 'Als inaktiv markieren' : 'Als aktiv markieren'}
      >
        {member.aktiv ? 'Aktiv' : 'Inaktiv'}
      </button>

      <span className="member-item__name">
        {displayName(member)}
        {badge && (
          <span
            className={`member-funktion-badge member-funktion-badge--${member.funktion}`}
            title={badge.title}
          >
            {badge.label}
          </span>
        )}
      </span>

      <button
        className="member-item__edit"
        onClick={() => onEdit(member)}
        aria-label="Mitglied bearbeiten"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button
        className="member-item__delete"
        onClick={() => onDelete(member.id)}
        aria-label="Mitglied löschen"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </button>
    </li>
  );
}

function MemberModal({ member, onSave, onClose }) {
  const isEdit = Boolean(member);
  const [vorname,  setVorname]  = useState(member?.vorname  ?? '');
  const [nachname, setNachname] = useState(member?.nachname ?? (isEdit ? '' : ''));
  const [funktion, setFunktion] = useState(member?.funktion ?? '');
  const [aktiv,    setAktiv]    = useState(member?.aktiv    ?? true);
  const [saving,   setSaving]   = useState(false);

  // Für alte Einträge ohne vorname/nachname: name in Felder aufteilen
  useEffect(() => {
    if (isEdit && !member.vorname && !member.nachname && member.name) {
      const parts = member.name.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        setNachname(parts[0]);
        setVorname(parts[1]);
      } else {
        setNachname(parts[0]);
      }
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nachname.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id:       member?.id ?? generateId('m'),
        vorname:  vorname.trim(),
        nachname: nachname.trim(),
        name:     computeName(vorname, nachname),
        funktion: funktion || null,
        aktiv,
        erstellt: member?.erstellt ?? new Date().toISOString(),
        geaendert: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet" role="dialog" aria-modal="true">
        <div className="bottom-sheet__handle" />
        <div className="bottom-sheet__header">
          <h2>{isEdit ? 'Mitglied bearbeiten' : 'Neues Mitglied'}</h2>
          <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Schließen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bottom-sheet__body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nachname">Nachname</label>
              <input
                id="nachname"
                type="text"
                value={nachname}
                onChange={e => setNachname(e.target.value)}
                placeholder="Mustermann"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="vorname">Vorname</label>
              <input
                id="vorname"
                type="text"
                value={vorname}
                onChange={e => setVorname(e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="funktion">Funktion</label>
            <select
              id="funktion"
              value={funktion}
              onChange={e => setFunktion(e.target.value)}
            >
              {FUNKTIONEN.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div className="form-group form-group--inline">
              <label>Status</label>
              <div className="toggle-row">
                <button
                  type="button"
                  className={`type-toggle__btn${aktiv ? ' type-toggle__btn--active type-toggle__btn--green' : ''}`}
                  onClick={() => setAktiv(true)}
                >
                  Aktiv
                </button>
                <button
                  type="button"
                  className={`type-toggle__btn${!aktiv ? ' type-toggle__btn--active type-toggle__btn--red' : ''}`}
                  onClick={() => setAktiv(false)}
                >
                  Inaktiv
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={saving || !nachname.trim()}
          >
            {saving ? 'Speichern…' : isEdit ? 'Speichern' : 'Hinzufügen'}
          </button>
        </form>
      </div>
    </div>
  );
}
