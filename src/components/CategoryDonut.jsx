import { CATEGORIES } from '../config/categories';
import { resolveCategoryDef } from '../config/categories';

const fmt = (n) => new Intl.NumberFormat('de-DE', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
}).format(n ?? 0);

export function CategoryDonut({ data, title = 'Ausgaben nach Kategorie' }) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  if (total === 0 || data.length === 0) return null;

  const R = 40, CIRC = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="donut-card">
      <div className="donut-card__title">{title}</div>
      <div className="donut-card__body">
        <svg viewBox="0 0 100 100" className="donut-svg" aria-hidden="true">
          {data.map(slice => {
            const def = resolveCategoryDef(slice.category);
            const dash = (slice.amount / total) * CIRC;
            const currentOffset = offset;
            offset += dash;
            return (
              <circle
                key={slice.category}
                cx="50" cy="50" r={R}
                fill="none"
                stroke={def.accent}
                strokeWidth="14"
                strokeDasharray={`${dash} ${CIRC - dash}`}
                strokeDashoffset={-currentOffset}
                transform="rotate(-90 50 50)"
              />
            );
          })}
          <text x="50" y="48" textAnchor="middle" className="donut-total">
            {fmt(total)}
          </text>
          <text x="50" y="60" textAnchor="middle" className="donut-sub">
            gesamt
          </text>
        </svg>
        <ul className="donut-legend">
          {data.map(s => {
            const def = resolveCategoryDef(s.category);
            const pct = Math.round((s.amount / total) * 100);
            return (
              <li key={s.category}>
                <span className="donut-legend__dot" style={{ background: def.accent }} />
                <span className="donut-legend__label">{s.category || def.label}</span>
                <span className="donut-legend__val">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
