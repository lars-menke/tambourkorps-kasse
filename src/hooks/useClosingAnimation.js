import { useState, useCallback, useRef } from 'react';

const DURATION = 180;

export function useClosingAnimation(onClose) {
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef(null);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    timerRef.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [isClosing, onClose]);

  return { isClosing, handleClose };
}

export function useExitAnimation(open, duration = DURATION) {
  const [isVisible, setIsVisible] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef(null);

  const prev = useRef(open);
  if (prev.current !== open) {
    prev.current = open;
    if (open) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      setIsClosing(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsClosing(false);
        setIsVisible(false);
      }, duration);
    }
  }

  return { isVisible, isClosing };
}
