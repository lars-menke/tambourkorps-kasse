import {
  Users, HandCoins, Heart, Drum, Music, Shirt, Car, Utensils,
  Calendar, Landmark, MoreHorizontal, Package, Star, Wrench,
  Coffee, ShoppingBag, Tag, Banknote, Gift, Megaphone, BookOpen,
  Briefcase, Truck, Home,
} from 'lucide-react';
import { resolveCategoryDef } from '../config/categories';

const ICON_MAP = {
  Users, HandCoins, Heart, Drum, Music, Shirt, Car, Utensils,
  Calendar, Landmark, MoreHorizontal, Package, Star, Wrench,
  Coffee, ShoppingBag, Tag, Banknote, Gift, Megaphone, BookOpen,
  Briefcase, Truck, Home,
};

// cat = { icon?, color? } from useCategorienMap — overrides static config
export function CategoryChip({ name, cat, size = 'sm' }) {
  const def = resolveCategoryDef(name);
  const iconName = cat?.icon || def.icon;
  const Icon = ICON_MAP[iconName] ?? ICON_MAP.MoreHorizontal;
  const iconSize = size === 'sm' ? 11 : 13;

  const accent = cat?.color || def.accent;
  const bg = cat?.color ? cat.color + '1f' : def.bg;

  return (
    <span
      className={`cat-chip cat-chip--${size}`}
      style={{ background: bg, color: accent }}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2.25} aria-hidden />}
      <span>{name || def.label}</span>
    </span>
  );
}
