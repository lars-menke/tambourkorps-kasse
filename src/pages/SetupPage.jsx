import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import { ghVerifyToken } from '../services/github';
import { REPO_OWNER_KEY, REPO_DATA_KEY, DEFAULT_DATA_REPO } from '../constants';
import { OnboardingProgress } from '../components/OnboardingProgress';

const TOTAL_STEPS = 3;

export default function SetupPage() {
  const { setToken } = useToken();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [pat, setPat] = useState('');
  const [dataRepo, setDataRepo] = useState(DEFAULT_DATA_REPO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConnect(e) {
    e.preventDefault();
    if (!pat.trim()) return;
    setLoading(true);
    setError('');
    try {
      localStorage.setItem('gh_pat', pat.trim());
      const username = await ghVerifyToken();
      setToken(pat.trim());
      localStorage.setItem(REPO_OWNER_KEY, username);
      localStorage.setItem(REPO_DATA_KEY, dataRepo.trim() || DEFAULT_DATA_REPO);
      setStep(2);
    } catch (err) {
      localStorage.removeItem('gh_pat');
      setError(`Token ungültig oder keine Berechtigung: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-page__card">
        <OnboardingProgress current={step} total={TOTAL_STEPS} />

        {step === 0 && (
          <div className="ob-step ob-step--welcome">
            <div className="setup-page__icon">
              <img src={`${import.meta.env.BASE_URL}logo.PNG`} alt="TambourWallet" width="72" height="72" style={{ borderRadius: '16px' }} />
            </div>
            <h1 className="setup-page__title">TambourWallet</h1>
            <p className="setup-page__subtitle">Kassenbuch für Tambourkorps</p>
            <p className="ob-step__desc">
              Verwalte Einnahmen, Ausgaben und Umlagen – sicher in deinem privaten GitHub-Repository gespeichert.
            </p>
            <button className="btn btn--primary btn--full" onClick={() => setStep(1)}>
              Los geht's
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="ob-step">
            <h2 className="ob-step__title">GitHub-Verbindung</h2>
            <p className="ob-step__desc">
              Die App benötigt einen <strong>Personal Access Token</strong> mit <strong>Contents: Read &amp; Write</strong> auf dein Daten-Repository.
            </p>
            <div className="setup-page__info">
              <ol>
                <li>github.com → Settings → Developer settings → Personal access tokens</li>
                <li>Fine-grained token für das Daten-Repository erstellen</li>
                <li>Berechtigung: <strong>Contents: Read and Write</strong></li>
              </ol>
            </div>
            <form onSubmit={handleConnect} className="setup-page__form">
              <div className="form-group">
                <label htmlFor="pat">Personal Access Token</label>
                <input
                  id="pat"
                  type="password"
                  value={pat}
                  onChange={e => setPat(e.target.value)}
                  placeholder="github_pat_…"
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="data-repo">Daten-Repository</label>
                <input
                  id="data-repo"
                  type="text"
                  value={dataRepo}
                  onChange={e => setDataRepo(e.target.value)}
                  placeholder={DEFAULT_DATA_REPO}
                />
                <span className="form-hint">Name des privaten Repositories für die Datendateien</span>
              </div>
              {error && <div className="setup-page__error">{error}</div>}
              <div className="ob-step__nav">
                <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>Zurück</button>
                <button type="submit" className="btn btn--primary" disabled={loading || !pat.trim()}>
                  {loading ? 'Prüfe…' : 'Verbinden'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="ob-step ob-step--done">
            <div className="ob-done__icon">✓</div>
            <h2 className="ob-step__title">Alles bereit!</h2>
            <p className="ob-step__desc">
              Die Verbindung wurde hergestellt. Du kannst jetzt loslegen.
            </p>
            <button className="btn btn--primary btn--full" onClick={() => navigate('/', { replace: true })}>
              Zur App
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
