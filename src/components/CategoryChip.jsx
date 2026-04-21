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

export function CategoryChip({ name, icon: iconOverride, size = 'sm' }) {
  const def = resolveCategoryDef(name);
  const iconName = iconOverride || def.icon;
  const Icon = ICON_MAP[iconName] ?? ICON_MAP.MoreHorizontal;
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
