import { Sparkline } from './Sparkline';

const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0);

const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconTrendDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const IconMinus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export function BalanceCard({ balance, deltaAmount, deltaLabel, history }) {
  const TrendIcon = deltaAmount > 0 ? IconTrendUp : deltaAmount < 0 ? IconTrendDown : IconMinus;
  const isNegative = balance < 0;
  return (
    <div className={`balance-card${isNegative ? ' is-negative' : ''}`}>
      <div className="balance-card__label">Kassenstand</div>
      <div className="balance-card__amount">{fmt(balance)}</div>
      <Sparkline data={history} className="balance-card__spark" />
      {deltaLabel && (
        <div className="balance-card__delta">
          <TrendIcon />
          <span>{fmt(Math.abs(deltaAmount))} {deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
