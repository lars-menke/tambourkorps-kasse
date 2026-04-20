const STORAGE_KEY = 'tw:theme';

/** @param {'light'|'dark'|'system'} theme */
export function applyTheme(theme) {
  const resolved = theme === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  document.documentElement.dataset.theme = resolved;
  localStorage.setItem(STORAGE_KEY, theme);

  const meta = document.querySelector('meta[name="theme-color"][data-managed]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0a0f0d' : '#0d3d18');
  }
}

export function getStoredTheme() {
  return /** @type {'light'|'dark'|'system'} */ (localStorage.getItem(STORAGE_KEY) || 'system');
}

export function initTheme() {
  applyTheme(getStoredTheme());
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') applyTheme('system');
  });
}
