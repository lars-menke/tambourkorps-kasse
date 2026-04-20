import { Users, HandCoins, Heart, Drum, Music, Shirt, Car, Utensils, Calendar, Landmark, MoreHorizontal } from 'lucide-react';
import { resolveCategoryDef } from '../config/categories';

const ICON_MAP = { Users, HandCoins, Heart, Drum, Music, Shirt, Car, Utensils, Calendar, Landmark, MoreHorizontal };

export function CategoryChip({ name, size = 'sm' }) {
  const def = resolveCategoryDef(name);
  const Icon = ICON_MAP[def.icon];
  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <span
      className={`cat-chip cat-chip--${size}`}
      style={{ background: def.bg, color: def.accent }}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2.25} aria-hidden />}
      <span>{name || def.label}</span>
    </span>
  );
}
