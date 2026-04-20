import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Sparkline } from './Sparkline';

const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0);

export function BalanceCard({ balance, deltaAmount, deltaLabel, history }) {
  const TrendIcon = deltaAmount > 0 ? TrendingUp : deltaAmount < 0 ? TrendingDown : Minus;
  const isNegative = balance < 0;
  return (
    <div className={`balance-card${isNegative ? ' is-negative' : ''}`}>
      <div className="balance-card__label">Kassenstand</div>
      <div className="balance-card__amount">{fmt(balance)}</div>
      <Sparkline data={history} className="balance-card__spark" />
      {deltaLabel && (
        <div className="balance-card__delta">
          <TrendIcon size={14} strokeWidth={2.5} />
          <span>{fmt(Math.abs(deltaAmount))} {deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
