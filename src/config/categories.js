export const CATEGORIES = {
  beitrag:      { key: 'beitrag',       label: 'Mitgliedsbeitrag', icon: 'Users',        accent: 'var(--green-500)',    bg: 'var(--green-50)',    type: 'income' },
  umlage:       { key: 'umlage',        label: 'Umlage',           icon: 'HandCoins',    accent: 'var(--teal-500)',     bg: 'var(--teal-50)',     type: 'income' },
  spende:       { key: 'spende',        label: 'Spende',           icon: 'Heart',        accent: 'var(--pink-500)',     bg: 'var(--pink-50)',     type: 'income' },
  instrument:   { key: 'instrument',    label: 'Instrument',       icon: 'Drum',         accent: 'var(--purple-500)',   bg: 'var(--purple-50)',   type: 'expense' },
  noten:        { key: 'noten',         label: 'Notenmaterial',    icon: 'Music',        accent: 'var(--blue-500)',     bg: 'var(--blue-50)',     type: 'expense' },
  uniform:      { key: 'uniform',       label: 'Uniform',          icon: 'Shirt',        accent: 'var(--amber-500)',    bg: 'var(--amber-50)',    type: 'expense' },
  fahrt:        { key: 'fahrt',         label: 'Fahrtkosten',      icon: 'Car',          accent: 'var(--orange-500)',   bg: 'var(--orange-50)',   type: 'expense' },
  verpflegung:  { key: 'verpflegung',   label: 'Verpflegung',      icon: 'Utensils',     accent: 'var(--red-500)',      bg: 'var(--red-50)',      type: 'expense' },
  veranstaltung:{ key: 'veranstaltung', label: 'Veranstaltung',    icon: 'Calendar',     accent: 'var(--green-500)',    bg: 'var(--green-50)',    type: 'both' },
  gebuehr:      { key: 'gebuehr',       label: 'Gebühren/Bank',    icon: 'Landmark',     accent: 'var(--neutral-600)',  bg: 'var(--neutral-100)', type: 'expense' },
  sonstiges:    { key: 'sonstiges',     label: 'Sonstiges',        icon: 'MoreHorizontal', accent: 'var(--neutral-500)', bg: 'var(--neutral-100)', type: 'both' },
};

// Maps lowercase category names / legacy ids to a CATEGORIES key
const LABEL_MAP = {
  'beitrag': 'beitrag', 'mitgliedsbeitrag': 'beitrag',
  'umlage': 'umlage',
  'spende': 'spende',
  'instrument': 'instrument', 'ausrüstung': 'instrument', 'ausruestung': 'instrument',
  'noten': 'noten', 'notenmaterial': 'noten',
  'uniform': 'uniform',
  'fahrt': 'fahrt', 'fahrtkosten': 'fahrt', 'ausflug': 'fahrt',
  'verpflegung': 'verpflegung',
  'veranstaltung': 'veranstaltung',
  'gebühren': 'gebuehr', 'gebühren/bank': 'gebuehr', 'gebuehr': 'gebuehr',
};

export function resolveCategoryDef(name) {
  if (!name) return CATEGORIES.sonstiges;
  const key = LABEL_MAP[name.toLowerCase().trim()];
  return CATEGORIES[key] ?? CATEGORIES.sonstiges;
}
