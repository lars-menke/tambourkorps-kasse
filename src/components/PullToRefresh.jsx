import { useRef, useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { haptic } from '../lib/haptics';

const THRESHOLD = 70;
const MAX_PULL = 120;

export function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const scrollElRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Find the scrollable ancestor (.app-content)
    let parent = el.parentElement;
    while (parent) {
      const { overflowY } = getComputedStyle(parent);
      if (overflowY === 'auto' || overflowY === 'scroll') break;
      parent = parent.parentElement;
    }
    scrollElRef.current = parent;

    function handleTouchStart(e) {
      const scrollTop = scrollElRef.current ? scrollElRef.current.scrollTop : window.scrollY;
      if (scrollTop <= 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY;
      }
    }

    function handleTouchMove(e) {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        e.preventDefault();
        const next = Math.min(dy * 0.5, MAX_PULL);
        if (next > THRESHOLD && pullRef.current <= THRESHOLD) haptic('light');
        pullRef.current = next;
        setPull(next);
      } else {
        // Scrolling down — cancel PTR
        startY.current = null;
        pullRef.current = 0;
        setPull(0);
      }
    }

    async function handleTouchEnd() {
      const current = pullRef.current;
      startY.current = null;
      if (current >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        haptic('medium');
        try { await onRefresh(); } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          setPull(0);
          pullRef.current = 0;
        }
      } else {
        setPull(0);
        pullRef.current = 0;
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);

  return (
    <div ref={containerRef} className="ptr">
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
