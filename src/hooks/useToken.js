import { useState, useCallback } from 'react';
import { TOKEN_KEY } from '../constants';

export function useToken() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '');

  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(newToken ?? '');
  }, []);

  const clearToken = useCallback(() => setToken(''), [setToken]);

  return { token, setToken, clearToken, hasToken: Boolean(token) };
}
