import { useState, useCallback } from 'react';
import { TOKEN_KEY } from '../constants';

// Der Token wird aus Sicherheitsgruenden in sessionStorage gehalten (nur fuer
// die aktuelle Browser-Session, kein persistenter Klartext-Schluessel im
// localStorage, der fuer jedes Script im selben Origin dauerhaft lesbar ist).
//
// Migration: Beim ersten Start wird ein vorhandener localStorage-Eintrag
// einmalig nach sessionStorage uebertragen und aus localStorage entfernt.
function readToken() {
  const session = sessionStorage.getItem(TOKEN_KEY);
  if (session) return session;

  const legacy = localStorage.getItem(TOKEN_KEY);
  if (legacy) {
    sessionStorage.setItem(TOKEN_KEY, legacy);
    localStorage.removeItem(TOKEN_KEY);
    return legacy;
  }

  return '';
}

export function useToken() {
  const [token, setTokenState] = useState(() => readToken());

  const setToken = useCallback((newToken) => {
    if (newToken) {
      sessionStorage.setItem(TOKEN_KEY, newToken);
      localStorage.removeItem(TOKEN_KEY); // Sicherstellen, kein Legacy-Eintrag bleibt
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(newToken ?? '');
  }, []);

  const clearToken = useCallback(() => setToken(''), [setToken]);

  return { token, setToken, clearToken, hasToken: Boolean(token) };
}
