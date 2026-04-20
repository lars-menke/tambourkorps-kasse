import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import { REPO_OWNER_KEY, REPO_DATA_KEY, LAST_SEEN_VERSION_KEY, CHANGELOG } from '../constants';
import { ghReadRawFile, ghWriteRawFile } from '../services/github';
import { applyTheme, getStoredTheme } from '../lib/theme';

const APP_VERSION = __APP_VERSION__;


export default function EinstellungenPage() {
  const { clearToken } = useToken();
  const navigate = useNavigate();
  const [changelogOffen, setChangelogOffen] = useState(false);
  const [istNeu, setIstNeu] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme());

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

        {/* Erscheinungsbild */}
        <section className="settings-section">
          <h2 className="settings-section__title">Erscheinungsbild</h2>
          <div className="settings-item">
            <span className="settings-item__label">Design</span>
            <div className="segmented">
              {(['system', 'light', 'dark']).map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`segmented__item${theme === opt ? ' is-active' : ''}`}
                  onClick={() => { applyTheme(opt); setTheme(opt); }}
                >
                  {opt === 'system' ? 'Auto' : opt === 'light' ? 'Hell' : 'Dunkel'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback */}
        <FeedbackSection />

        {/* Navigation */}
        <section className="settings-section">
          <h2 className="settings-section__title">Verwaltung</h2>
          <button className="settings-item settings-item--link" onClick={() => navigate('/mitglieder')}>
            <span className="settings-item__label">Mitglieder</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button className="settings-item settings-item--link" onClick={() => navigate('/kategorien')}>
            <span className="settings-item__label">Kategorien</span>
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

const FEEDBACK_PATH = 'feedback.md';
const CODE_REPO = 'tambourkorps-kasse';

function FeedbackSection() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // idle | saving | ok | error | clearing
  const [errorMsg, setErrorMsg] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [viewContent, setViewContent] = useState('');
  const [viewLoading, setViewLoading] = useState(false);

  const owner = localStorage.getItem(REPO_OWNER_KEY);
  const repo  = CODE_REPO;

  async function handleToggleView() {
    if (viewOpen) { setViewOpen(false); return; }
    setViewLoading(true);
    setViewOpen(true);
    try {
      const existing = await ghReadRawFile(owner, repo, FEEDBACK_PATH);
      setViewContent(existing?.content ?? '(leer)');
    } catch {
      setViewContent('Fehler beim Laden.');
    } finally {
      setViewLoading(false);
    }
  }

  async function handleClear() {
    if (!confirm('Feedback-Datei leeren?')) return;
    setStatus('clearing');
    setErrorMsg('');
    try {
      const existing = await ghReadRawFile(owner, repo, FEEDBACK_PATH);
      const emptyContent = '# TambourWallet — Feedback & Änderungswünsche\n\n---\n';
      await ghWriteRawFile(
        owner, repo, FEEDBACK_PATH,
        emptyContent,
        existing?.sha ?? null,
        'Feedback geleert'
      );
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setStatus('saving');
    setErrorMsg('');
    try {
      const existing = await ghReadRawFile(owner, repo, FEEDBACK_PATH);

      const datum = new Date().toLocaleDateString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      const header = `## ${datum} — v${APP_VERSION}`;
      const newEntry = `${header}\n\n${text.trim()}\n\n---\n\n`;

      let newContent;
      if (existing) {
        // Neuen Eintrag oben einfügen (nach dem H1-Header falls vorhanden)
        const lines = existing.content.split('\n');
        const h1End = lines.findIndex((l, i) => i > 0 && l.startsWith('---'));
        if (h1End > 0) {
          lines.splice(h1End + 1, 0, '', newEntry.trimEnd());
          newContent = lines.join('\n');
        } else {
          newContent = newEntry + existing.content;
        }
      } else {
        newContent = `# TambourWallet — Feedback & Änderungswünsche\n\n---\n\n${newEntry.trimEnd()}\n`;
      }

      await ghWriteRawFile(
        owner, repo, FEEDBACK_PATH,
        newContent,
        existing?.sha ?? null,
        `Feedback ${datum}`
      );

      setText('');
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  return (
    <section className="settings-section">
      <div className="settings-section__title-row">
        <h2 className="settings-section__title settings-section__title--inline">Feedback & Wünsche</h2>
        <button
          type="button"
          className="settings-section__add-btn"
          onClick={handleToggleView}
        >
          {viewOpen ? 'Schließen' : 'Anzeigen'}
        </button>
      </div>

      {viewOpen && (
        <div className="feedback-view">
          {viewLoading
            ? <span className="feedback-view__loading">Lädt…</span>
            : <pre className="feedback-view__content">{viewContent}</pre>
          }
        </div>
      )}

      <form onSubmit={handleSave} className="feedback-form">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Änderungswünsche, Bugs, Ideen…"
          rows={4}
          className="feedback-form__textarea"
        />
        {status === 'error' && (
          <div className="feedback-form__error">{errorMsg}</div>
        )}
        <div className="feedback-form__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={status === 'saving' || status === 'clearing' || !text.trim()}
          >
            {status === 'saving' ? 'Wird gespeichert…' : status === 'ok' ? '✓ Gespeichert' : 'Speichern'}
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={handleClear}
            disabled={status === 'saving' || status === 'clearing'}
          >
            {status === 'clearing' ? 'Wird geleert…' : 'Leeren'}
          </button>
        </div>
      </form>
      <p className="feedback-form__hint">
        Wird als <code>feedback.md</code> im App-Repository gespeichert.<br />
        Token benötigt <strong>Contents: Read &amp; Write</strong> auf <code>{CODE_REPO}</code>.
      </p>
    </section>
  );
}

