const PATTERNS = {
  light:   10,
  medium:  20,
  success: [10, 40, 10],
  warning: [20, 60, 20],
  error:   [40, 80, 40],
};

export function haptic(pattern = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try { navigator.vibrate(PATTERNS[pattern]); } catch { /* noop */ }
}
