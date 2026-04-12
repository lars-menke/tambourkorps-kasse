import { useNavigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import { REPO_OWNER_KEY, REPO_DATA_KEY } from '../constants';

export default function EinstellungenPage() {
  const { clearToken } = useToken();
  const navigate = useNavigate();

  const owner = localStorage.getItem(REPO_OWNER_KEY) || '–';
  const dataRepo = localStorage.getItem(REPO_DATA_KEY) || '–';

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

        <section className="settings-section">
          <h2 className="settings-section__title">Navigation</h2>
          <button className="settings-item settings-item--link" onClick={() => navigate('/mitglieder')}>
            <span className="settings-item__label">Mitglieder verwalten</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </section>

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

        <section className="settings-section settings-section--info">
          <p className="settings-info">
            Version 1.0.0 — Phase 3<br />
            Daten werden offline in IndexedDB gespeichert<br />
            und mit GitHub synchronisiert.
          </p>
        </section>
      </div>
    </div>
  );
}
