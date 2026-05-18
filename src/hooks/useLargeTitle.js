import { useEffect, useRef, useState } from 'react';

export function useLargeTitle() {
  const titleRef = useRef(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const root = el.closest('.app-content') ?? null;
    const observer = new IntersectionObserver(
      ([entry]) => setCompact(!entry.isIntersecting),
      { root, threshold: 0, rootMargin: '-52px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { titleRef, compact };
}
