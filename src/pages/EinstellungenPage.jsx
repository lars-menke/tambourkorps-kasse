import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import { REPO_OWNER_KEY, REPO_DATA_KEY, LAST_SEEN_VERSION_KEY, CHANGELOG } from '../constants';

const APP_VERSION = __APP_VERSION__;

export default function EinstellungenPage() {
  const { clearToken } = useToken();
  const navigate = useNavigate();
  const [changelogOffen, setChangelogOffen] = useState(false);
  const [istNeu, setIstNeu] = useState(false);

  const owner = localStorage.getItem(REPO_OWNER_KEY) || '–';
  const dataRepo = localStorage.getItem(REPO_DATA_KEY) || '–';

  useEffect(() => {
    const lastSeen = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    if (lastSeen !== APP_VERSION) {
      setIstNeu(true);
    }
  }, []);

  function handleChangelogOeffnen() {
    setChangelogOffen(v => !v);
    // Mark as seen
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
