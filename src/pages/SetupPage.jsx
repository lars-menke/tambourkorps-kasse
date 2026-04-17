import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import { ghVerifyToken } from '../services/github';
import { REPO_OWNER_KEY, REPO_DATA_KEY, DEFAULT_DATA_REPO } from '../constants';

export default function SetupPage() {
  const { setToken } = useToken();
  const navigate = useNavigate();

  const [pat, setPat] = useState('');
  const [dataRepo, setDataRepo] = useState(DEFAULT_DATA_REPO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pat.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Temporarily store token so ghVerifyToken can read it
      localStorage.setItem('gh_pat', pat.trim());
      const username = await ghVerifyToken();

      // Persist all config
      setToken(pat.trim());
      localStorage.setItem(REPO_OWNER_KEY, username);
      localStorage.setItem(REPO_DATA_KEY, dataRepo.trim() || DEFAULT_DATA_REPO);

      navigate('/', { replace: true });
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
        <div className="setup-page__icon">
          <img src={`${import.meta.env.BASE_URL}logo.PNG`} alt="TambourWallet" width="56" height="56" style={{ borderRadius: '12px' }} />
        </div>
        <h1 className="setup-page__title">TambourWallet</h1>
        <p className="setup-page__subtitle">Kassenbuch Tambourkorps</p>

        <div className="setup-page__info">
          <p>
            Diese App speichert alle Daten in einem privaten GitHub-Repository.
            Du benötigst einen <strong>Personal Access Token</strong> (PAT) mit
            Schreibzugriff auf das Daten-Repository.
          </p>
          <ol>
            <li>
              Gehe zu{' '}
              <span className="setup-page__link">
                github.com → Settings → Developer settings → Personal access tokens
              </span>
            </li>
            <li>
              Erstelle einen <strong>Fine-grained token</strong> mit
              Zugriff auf das Daten-Repository
            </li>
            <li>
              Berechtigungen: <strong>Contents: Read and Write</strong>
            </li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="setup-page__form">
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
            <span className="form-hint">
              Name des privaten Repositories für die Datendateien
            </span>
          </div>

          {error && <div className="setup-page__error">{error}</div>}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading || !pat.trim()}
          >
            {loading ? 'Prüfe Token…' : 'Verbinden'}
          </button>
        </form>
      </div>
    </div>
  );
}
