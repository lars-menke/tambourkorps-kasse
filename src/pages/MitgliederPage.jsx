import { useState, useEffect, useCallback } from 'react';
import { dbGetAll, dbPut, dbDelete } from '../services/db';
import { generateId } from '../utils/imageUtils';
import { pushStore } from '../utils/sync';

export default function MitgliederPage() {
  const [mitglieder, setMitglieder] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await dbGetAll('mitglieder');
    const sorted = [...data].sort((a, b) => {
      if (a.aktiv !== b.aktiv) return a.aktiv ? -1 : 1;
      return a.name.localeCompare(b.name, 'de');
    });
    setMitglieder(sorted);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    window.addEventListener('tk-sync-complete', load);
    return () => window.removeEventListener('tk-sync-complete', load);
  }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await dbPut('mitglieder', {
        id: generateId('m'),
        name: newName.trim(),
        aktiv: true,
        erstellt: new Date().toISOString(),
      });
      setNewName('');
      setShowForm(false);
      await load();
      pushStore('mitglieder', 'data/mitglieder.json').catch(console.warn);
    } finally {
      setSaving(false);
    }
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

  const aktive = mitglieder.filter(m => m.aktiv);
  const inaktive = mitglieder.filter(m => !m.aktiv);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mitglieder</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Abbrechen' : '+ Neu'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleAdd} className="member-add-form">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Name des Mitglieds"
            autoFocus
            required
          />
          <button type="submit" className="btn btn--primary" disabled={saving || !newName.trim()}>
            {saving ? '…' : 'Hinzufügen'}
          </button>
        </form>
      )}

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
                    onToggle={handleToggleAktiv}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MemberItem({ member, onToggle, onDelete }) {
  return (
    <li className={`member-item${member.aktiv ? '' : ' member-item--inaktiv'}`}>
      <button
        className={`member-item__status ${member.aktiv ? 'member-item__status--aktiv' : 'member-item__status--inaktiv'}`}
        onClick={() => onToggle(member)}
        title={member.aktiv ? 'Als inaktiv markieren' : 'Als aktiv markieren'}
      >
        {member.aktiv ? 'Aktiv' : 'Inaktiv'}
      </button>
      <span className="member-item__name">{member.name}</span>
      <button
        className="member-item__delete"
        onClick={() => onDelete(member.id)}
        aria-label="Mitglied löschen"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </li>
  );
}
