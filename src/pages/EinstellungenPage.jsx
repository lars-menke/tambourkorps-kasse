import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import { dbGetAll, dbPut, dbDelete } from '../services/db';
import { pushStore } from '../utils/sync';
import { generateId } from '../utils/imageUtils';
import { REPO_OWNER_KEY, REPO_DATA_KEY, LAST_SEEN_VERSION_KEY, CHANGELOG } from '../constants';

const APP_VERSION = __APP_VERSION__;

const TYP_LABELS = {
  einzahlung: 'Einnahme',
  auszahlung: 'Ausgabe',
  beide:      'Beide',
};

export default function EinstellungenPage() {
  const { clearToken } = useToken();
  const navigate = useNavigate();
  const [changelogOffen, setChangelogOffen] = useState(false);
  const [istNeu, setIstNeu] = useState(false);

  const owner = localStorage.getItem(REPO_OWNER_KEY) || '–';
  const dataRepo = localStorage.getItem(REPO_DATA_KEY) || '–';

  useEffect(() => {
    const lastSeen = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    if (lastSeen !== APP_VERSION) setIstNeu(true);
  }, []);

  function handleChangelogOeffnen() {
    setChangelogOffen(v => !v);
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
    setIstNeu(false);
  }

  function handleLogout() {
    if (confirm('Token und Konfiguration löschen? Lokale Daten bleiben erhalten.')) {
      clearToken();
      localStorage.removeItem(REPO_OWNER_KEY);
      localStorage.removeItem(REPO_DATA_KEY);
      navigate('/setup', { replace: true });
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mehr</h1>
      </header>

      <div className="settings-list">

        {/* Version */}
        <section className="settings-section">
          <h2 className="settings-section__title">App-Version</h2>
          <button className="settings-item settings-item--link" onClick={handleChangelogOeffnen}>
            <div className="version-item">
              <span className="version-item__number">v{APP_VERSION}</span>
              {istNeu && <span className="version-badge">Neu</span>}
            </div>
            <div className="version-item__right">
              <span className="version-item__label">
                {changelogOffen ? 'Schließen' : 'Was ist neu?'}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}
                style={{ transform: changelogOffen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {changelogOffen && (
            <div className="changelog">
              {CHANGELOG.map(entry => (
                <div key={entry.version} className="changelog-entry">
                  <div className="changelog-entry__header">
                    <span className="changelog-entry__version">v{entry.version}</span>
                    <span className="changelog-entry__datum">{entry.datum}</span>
                  </div>
                  <ul className="changelog-entry__list">
                    {entry.aenderungen.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Kategorien */}
        <KategorienSection />

        {/* Navigation */}
        <section className="settings-section">
          <h2 className="settings-section__title">Navigation</h2>
          <button className="settings-item settings-item--link" onClick={() => navigate('/mitglieder')}>
            <span className="settings-item__label">Mitglieder verwalten</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </section>

        {/* GitHub */}
        <section className="settings-section">
          <h2 className="settings-section__title">GitHub-Verbindung</h2>
          <div className="settings-item">
            <span className="settings-item__label">Benutzer</span>
            <span className="settings-item__value">{owner}</span>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">Daten-Repository</span>
            <span className="settings-item__value">{dataRepo}</span>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">Token</span>
            <span className="settings-item__value settings-item__value--muted">••••••••</span>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__title">Konto</h2>
          <button className="btn btn--danger btn--full" onClick={handleLogout}>
            Token zurücksetzen
          </button>
        </section>

      </div>
    </div>
  );
}

function KategorienSection() {
  const [kategorien, setKategorien] = useState([]);
  const [neuName, setNeuName] = useState('');
  const [neuTyp, setNeuTyp] = useState('auszahlung');
  const [addOffen, setAddOffen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    dbGetAll('kategorien').then(data =>
      setKategorien([...data].sort((a, b) => a.name.localeCompare(b.name, 'de')))
    );
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!neuName.trim()) return;
    setSaving(true);
    try {
      await dbPut('kategorien', { id: generateId('k'), name: neuName.trim(), typ: neuTyp });
      setNeuName('');
      setAddOffen(false);
      load();
      pushStore('kategorien', 'data/kategorien.json').catch(console.warn);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Kategorie löschen?')) return;
    await dbDelete('kategorien', id);
    load();
    pushStore('kategorien', 'data/kategorien.json').catch(console.warn);
  }

  return (
    <section className="settings-section">
      <div className="settings-section__title-row">
        <h2 className="settings-section__title settings-section__title--inline">Kategorien</h2>
        <button
          className="settings-section__add-btn"
          onClick={() => setAddOffen(v => !v)}
          aria-label="Kategorie hinzufügen"
        >
          {addOffen ? '✕' : '+ Neu'}
        </button>
      </div>

      {addOffen && (
        <form onSubmit={handleAdd} className="kategorie-add-form">
          <input
            type="text"
            value={neuName}
            onChange={e => setNeuName(e.target.value)}
            placeholder="Name der Kategorie"
            required
            autoFocus
          />
          <select value={neuTyp} onChange={e => setNeuTyp(e.target.value)}>
            <option value="einzahlung">Einnahme</option>
            <option value="auszahlung">Ausgabe</option>
            <option value="beide">Beide</option>
          </select>
          <button type="submit" className="btn btn--primary btn--sm" disabled={saving || !neuName.trim()}>
            {saving ? '…' : 'Hinzufügen'}
          </button>
        </form>
      )}

      {kategorien.length === 0 && !addOffen ? (
        <div className="settings-item">
          <span className="settings-item__label" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Noch keine Kategorien
          </span>
        </div>
      ) : (
        kategorien.map(k => (
          <div key={k.id} className="settings-item settings-item--kategorie">
            <div className="kategorie-item__info">
              <span className="kategorie-item__name">{k.name}</span>
              <span className={`kategorie-item__typ kategorie-item__typ--${k.typ}`}>
                {TYP_LABELS[k.typ] ?? k.typ}
              </span>
            </div>
            <button
              className="kategorie-item__delete"
              onClick={() => handleDelete(k.id)}
              aria-label={`${k.name} löschen`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        ))
      )}
    </section>
  );
}
