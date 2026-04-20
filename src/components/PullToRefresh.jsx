import { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { haptic } from '../lib/haptics';

const THRESHOLD = 70;
const MAX_PULL = 120;

export function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pullRef = useRef(0);

  return (
    <div
      className="ptr"
      onTouchStart={e => {
        if (window.scrollY <= 0 && !refreshing) {
          startY.current = e.touches[0].clientY;
        }
      }}
      onTouchMove={e => {
        if (startY.current === null) return;
        const dy = e.touches[0].clientY - startY.current;
        if (dy > 0) {
          const next = Math.min(dy * 0.5, MAX_PULL);
          if (next > THRESHOLD && pullRef.current <= THRESHOLD) haptic('light');
          pullRef.current = next;
          setPull(next);
        }
      }}
      onTouchEnd={async () => {
        const current = pullRef.current;
        startY.current = null;
        if (current >= THRESHOLD && !refreshing) {
          setRefreshing(true);
          haptic('medium');
          try { await onRefresh(); } finally {
            setRefreshing(false);
            setPull(0);
            pullRef.current = 0;
          }
        } else {
          setPull(0);
          pullRef.current = 0;
        }
      }}
    >
      <div className="ptr__indicator" style={{ height: pull, opacity: pull / THRESHOLD }}>
        <RefreshCw
          size={20}
          className={refreshing ? 'is-spinning' : ''}
          style={{ transform: `rotate(${pull * 3}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
