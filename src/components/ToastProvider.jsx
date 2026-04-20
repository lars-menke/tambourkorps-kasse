import { createContext, useCallback, useContext, useRef, useState } from 'react';

const Ctx = createContext(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('ToastProvider fehlt');
  return c;
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setItems(prev => prev.filter(t => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const push = useCallback((t) => {
    const id = crypto.randomUUID();
    setItems(prev => [...prev, { ...t, id }]);
    const duration = t.undo ? 4500 : 2800;
    timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="toast-region" role="region" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`toast toast--${t.variant}`}>
            <span className="toast__msg">{t.message}</span>
            {t.undo && (
              <button className="toast__action" onClick={() => { t.undo(); dismiss(t.id); }}>
                Rückgängig
              </button>
            )}
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Schließen">✕</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
