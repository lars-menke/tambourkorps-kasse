const PALETTE = [
  { bg: '#dcfce7', fg: '#166534' },
  { bg: '#dbeafe', fg: '#1e40af' },
  { bg: '#fef3c7', fg: '#92400e' },
  { bg: '#fce7f3', fg: '#9f1239' },
  { bg: '#e9d5ff', fg: '#6b21a8' },
  { bg: '#ccfbf1', fg: '#115e59' },
  { bg: '#ffedd5', fg: '#9a3412' },
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '');
}

export function Avatar({ name, size = 36 }) {
  const color = PALETTE[hash(name || '') % PALETTE.length];
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: color.bg, color: color.fg, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials(name || '?').toUpperCase()}
    </div>
  );
}
