import { useState, useEffect } from 'react';
import { authenticate } from '../lib/biometrics';

export default function LockScreen({ onUnlock }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleAuth() {
    setLoading(true);
    setError('');
    try {
      await authenticate();
      onUnlock();
    } catch {
      setError('Tippe auf das Symbol um es erneut zu versuchen.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(handleAuth, 300);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="lock-screen">
      <img
        src={`${import.meta.env.BASE_URL}logo.PNG`}
        alt="TambourWallet"
        className="lock-screen__logo"
      />
      <h1 className="lock-screen__title">TambourWallet</h1>
      <p className="lock-screen__subtitle">Kassenbuch des Tambourkorps</p>

      <button
        className="lock-screen__btn"
        onClick={handleAuth}
        disabled={loading}
        aria-label="Mit Face ID entsperren"
      >
        {loading ? (
          <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={32} height={32}>
            <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
          </svg>
        ) : (
          <FaceIdIcon />
        )}
        <span>{loading ? 'Wird geprüft…' : 'Mit Face ID entsperren'}</span>
      </button>

      {error && <p className="lock-screen__error">{error}</p>}
    </div>
  );
}

function FaceIdIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} width={36} height={36} aria-hidden="true">
      <path d="M3 9V6a3 3 0 0 1 3-3h3" strokeLinecap="round" />
      <path d="M15 3h3a3 3 0 0 1 3 3v3" strokeLinecap="round" />
      <path d="M21 15v3a3 3 0 0 1-3 3h-3" strokeLinecap="round" />
      <path d="M9 21H6a3 3 0 0 1-3-3v-3" strokeLinecap="round" />
      <line x1="9" y1="10" x2="9" y2="10.01" strokeWidth={2.5} strokeLinecap="round" />
      <line x1="15" y1="10" x2="15" y2="10.01" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M12 10v2.5" strokeLinecap="round" />
      <path d="M9.5 15.5c.8.8 1.5 1 2.5 1s1.7-.2 2.5-1" strokeLinecap="round" />
    </svg>
  );
}
