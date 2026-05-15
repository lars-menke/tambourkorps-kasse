import { useId } from 'react';

export function Sparkline({ data, className }) {
  const uid = useId();
  const gradId = `sg${uid}`.replace(/:/g, '');

  if (!data || data.length < 2) return null;

  const W = 200, H = 40, PAD = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - PAD - ((v - min) / range) * (H - PAD * 2),
  ]);

  let linePath = `M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const cp = ((pts[i - 1][0] + pts[i][0]) / 2).toFixed(2);
    linePath += ` C ${cp},${pts[i - 1][1].toFixed(2)} ${cp},${pts[i][1].toFixed(2)} ${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`;
  }

  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
