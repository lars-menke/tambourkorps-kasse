# TambourWallet, Design-Update v2

> **Zweck dieses Dokuments:** Vollständige Umsetzungs-Spezifikation für das Design-Refresh der TambourWallet PWA. Dieses Dokument ist als direkte Arbeitsgrundlage für Claude Code gedacht. Es erweitert das bestehende `DESIGN_CONCEPT.md`, ersetzt es aber nicht. Wo eine Änderung gegen bestehende Regeln verstößt, ist das explizit vermerkt.
>
> **Leitprinzipien:** Bestehendes Token-System und Vereinsidentität bleiben erhalten. Alle Änderungen laufen über CSS Custom Properties und sind additiv, nicht destruktiv. Mobile-first, Touch-Targets ≥ 44px und iOS-Zoom-Schutz sind weiterhin Pflicht.

---

## 0. Executive Summary

Das Design-Update zielt auf vier Kernverbesserungen:

1. **Dark Mode** als erstklassige zweite Ansicht, über semantische Tokens
2. **Dashboard mit echter Datenvisualisierung** (Sparkline, Delta, Kategorie-Donut)
3. **Komponenten-Veredelung** (Kategorie-Icons, Avatare, Badges, Empty States)
4. **Micro-UX** (Toasts, Haptic Feedback, Skeleton Loader, Pull-to-Refresh, Quick-Add Bottom Sheet)

Das Update ist in **drei Phasen** gegliedert und soll in dieser Reihenfolge umgesetzt werden.

---

## 1. Phasen-Roadmap

### Phase 1, Foundation (muss zuerst erfolgen)
- [ ] Token-System refaktorieren: Basis-Paletten + semantische Tokens
- [ ] Dark Mode einführen (System-Präferenz + manueller Toggle)
- [ ] Fehlende Akzentfarben als Tokens (Blau, Orange, Gelb, Lila, Amber)
- [ ] WCAG-Kontrast: Gold auf Grün anpassen

### Phase 2, Komponenten & Dashboard
- [ ] Kategorie-Icons + Kategorie-Farbsystem
- [ ] Mitglieder-Avatare (deterministisch aus Namen)
- [ ] Tab-Bar Badges
- [ ] Saldo-Karte mit Sparkline und Delta
- [ ] Kategorie-Donut im Dashboard
- [ ] Typografie-Skala schärfen
- [ ] Empty States mit Illustrationen

### Phase 3, Micro-UX
- [ ] Toast-System mit Undo
- [ ] Haptic Feedback
- [ ] Skeleton Loader
- [ ] Pull-to-Refresh
- [ ] Quick-Add Bottom Sheet
- [ ] Onboarding-Flow mit Progress

---

## 2. Token-System, Refactoring

### 2.1. Neue Architektur: Basis + semantisch

Bisher zeigen Komponenten direkt auf Hex-Werte oder einzelne Tokens wie `--bg`. Das macht Dark Mode unmöglich. Neu: Zwei-Ebenen-System.

**Ebene 1, Basis-Paletten (nie direkt in Komponenten verwenden):**

```css
:root {
  /* Neutral */
  --neutral-0:   #ffffff;
  --neutral-50:  #f4f6f2;
  --neutral-100: #eef1ea;
  --neutral-200: #e8ece3;
  --neutral-300: #d8ddd2;
  --neutral-400: #bfc8b8;
  --neutral-500: #9ca3af;
  --neutral-600: #6b7280;
  --neutral-700: #4b5563;
  --neutral-800: #1f2937;
  --neutral-900: #111827;
  --neutral-950: #0a0f0d;

  /* Vereinsgrün (Brand Primary) */
  --green-50:  #edf5ea;
  --green-100: #dbe9d4;
  --green-200: #b6d4a8;
  --green-300: #7fae69;
  --green-400: #4a8739;
  --green-500: #2d6a1f;
  --green-600: #14532d;
  --green-700: #0d3d18;
  --green-800: #082b10;
  --green-900: #041807;

  /* Vereinsgold (Brand Secondary) */
  --gold-50:  #fdf8e6;
  --gold-100: #faefc2;
  --gold-200: #e8cc7a;
  --gold-300: #d9b948;      /* NEU: heller, AAA-tauglich auf green-700 */
  --gold-400: #c9a227;      /* Alt, für große Flächen/Splash */
  --gold-500: #9a7a1c;

  /* Semantisch: Einnahme (identisch grün) */
  /* Semantisch: Ausgabe */
  --red-50:  #fef2f2;
  --red-100: #fecaca;
  --red-200: #fca5a5;
  --red-500: #b91c1c;
  --red-600: #991b1b;

  /* Semantisch: Warnung */
  --orange-50:  #fff7ed;
  --orange-100: #ffedd5;
  --orange-200: #fed7aa;
  --orange-500: #b45309;
  --orange-600: #9a3412;

  /* Semantisch: Info (Action-Cards) */
  --blue-50:  #eff6ff;
  --blue-100: #dbeafe;
  --blue-200: #bfdbfe;
  --blue-500: #2563eb;
  --blue-600: #1d4ed8;

  /* Kategorie-Akzente */
  --purple-50:  #faf5ff;
  --purple-500: #7c3aed;
  --amber-50:   #fffbeb;
  --amber-500:  #d97706;
  --teal-50:    #f0fdfa;
  --teal-500:   #0d9488;
  --pink-50:    #fdf2f8;
  --pink-500:   #db2777;
}
```

**Ebene 2, semantische Tokens (in Komponenten verwenden):**

```css
:root {
  /* Surfaces */
  --color-bg:           var(--neutral-50);
  --color-bg-elevated:  var(--neutral-200);
  --color-surface:      var(--neutral-0);
  --color-surface-alt:  var(--neutral-100);
  --color-overlay:      rgba(0, 0, 0, 0.4);

  /* Borders */
  --color-border:        var(--neutral-300);
  --color-border-strong: var(--neutral-400);

  /* Text */
  --color-text:       var(--neutral-900);
  --color-text-dim:   var(--neutral-600);
  --color-text-muted: var(--neutral-500);
  --color-text-on-brand: var(--neutral-0);

  /* Brand */
  --color-brand:         var(--green-700);
  --color-brand-hover:   var(--green-600);
  --color-brand-subtle:  var(--green-50);
  --color-brand-border:  var(--green-200);
  --color-brand-accent:  var(--gold-300);     /* heller, AAA auf grün */
  --color-brand-accent-strong: var(--gold-400); /* Splash, Hero */

  /* Semantik */
  --color-income:         var(--green-700);
  --color-income-bg:      var(--green-50);
  --color-income-border:  var(--green-200);
  --color-expense:        var(--red-500);
  --color-expense-bg:     var(--red-50);
  --color-expense-border: var(--red-100);
  --color-warning:        var(--orange-500);
  --color-warning-bg:     var(--orange-50);
  --color-warning-border: var(--orange-200);
  --color-info:           var(--blue-500);
  --color-info-bg:        var(--blue-50);
  --color-info-border:    var(--blue-200);

  /* Focus Ring */
  --color-focus: var(--green-700);
}
```

**Ebene 2, Dark Mode:**

```css
[data-theme="dark"] {
  --color-bg:           var(--neutral-950);
  --color-bg-elevated:  var(--neutral-900);
  --color-surface:      #121a16;           /* leicht grünstichig */
  --color-surface-alt:  #1a241f;
  --color-overlay:      rgba(0, 0, 0, 0.6);

  --color-border:        #24332c;
  --color-border-strong: #35483e;

  --color-text:       #e8ede9;
  --color-text-dim:   #a1aca5;
  --color-text-muted: #6e7a72;
  --color-text-on-brand: var(--neutral-0);

  --color-brand:         var(--green-400);   /* heller, damit auf dunkel lesbar */
  --color-brand-hover:   var(--green-300);
  --color-brand-subtle:  #13251a;
  --color-brand-border:  #1f3d28;
  --color-brand-accent:  var(--gold-300);

  --color-income:         var(--green-300);
  --color-income-bg:      #13251a;
  --color-income-border:  #1f3d28;
  --color-expense:        var(--red-200);
  --color-expense-bg:     #2a1414;
  --color-expense-border: #3d1e1e;
  --color-warning:        var(--orange-200);
  --color-warning-bg:     #2a1c0d;
  --color-warning-border: #3d2b14;
  --color-info:           var(--blue-200);
  --color-info-bg:        #0f1d33;
  --color-info-border:    #1a2d4d;

  --color-focus: var(--green-300);
}
```

### 2.2. Theme-Umschaltung

```ts
// src/lib/theme.ts
export type Theme = 'light' | 'dark' | 'system';

export function applyTheme(theme: Theme) {
  const resolved = theme === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem('tw:theme', theme);

  // Update PWA Theme-Color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0a0f0d' : '#0d3d18');
  }
}

export function initTheme() {
  const stored = (localStorage.getItem('tw:theme') as Theme) || 'system';
  applyTheme(stored);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem('tw:theme') || 'system') === 'system') applyTheme('system');
  });
}
```

Aufruf in `main.tsx` vor React-Render: `initTheme()`.

### 2.3. Breaking Changes für bestehenden Code

Alle direkten Hex-Werte in CSS durch semantische Tokens ersetzen. Find-and-Replace Liste:

| Alt | Neu |
|-----|-----|
| `#f4f6f2` | `var(--color-bg)` |
| `#eef1ea` | `var(--color-surface-alt)` |
| `#ffffff` (Flächen) | `var(--color-surface)` |
| `#d8ddd2` | `var(--color-border)` |
| `#bfc8b8` | `var(--color-border-strong)` |
| `#111827` | `var(--color-text)` |
| `#6b7280` | `var(--color-text-dim)` |
| `#9ca3af` | `var(--color-text-muted)` |
| `#0d3d18` (Brand) | `var(--color-brand)` |
| `#14532d` (Hover) | `var(--color-brand-hover)` |
| `#edf5ea` | `var(--color-brand-subtle)` |
| `#c9a227` | `var(--color-brand-accent-strong)` oder `--color-brand-accent` |
| `#b91c1c` | `var(--color-expense)` |
| `#fef2f2` | `var(--color-expense-bg)` |
| `#fecaca` | `var(--color-expense-border)` |
| `#b45309` | `var(--color-warning)` |

**Legacy-Alias beibehalten** (damit alte Styles nicht sofort brechen):

```css
:root {
  --bg:        var(--color-bg);
  --bg2:       var(--color-bg-elevated);
  --surface:   var(--color-surface);
  --surface2:  var(--color-surface-alt);
  --border:    var(--color-border);
  --border2:   var(--color-border-strong);
  --text:      var(--color-text);
  --text-dim:  var(--color-text-dim);
  --text-muted: var(--color-text-muted);
}
```

---

## 3. Kategorie-Icons & Kategorie-Farbsystem

### 3.1. Kategorien-Definition

Zentrale Kategorien-Config unter `src/config/categories.ts`:

```ts
export type CategoryKey =
  | 'beitrag' | 'umlage' | 'spende'          // Einnahmen
  | 'instrument' | 'noten' | 'uniform'       // Ausgaben Ausstattung
  | 'fahrt' | 'verpflegung' | 'veranstaltung'// Ausgaben Betrieb
  | 'gebuehr' | 'sonstiges';                 // Rest

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: string;     // Lucide-Icon-Name
  accent: string;   // CSS-Variable (z.B. 'var(--green-500)')
  bg: string;       // CSS-Variable für helle Fläche
  type: 'income' | 'expense' | 'both';
}

export const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  beitrag:      { key:'beitrag',      label:'Mitgliedsbeitrag', icon:'users',        accent:'var(--green-500)',  bg:'var(--green-50)',  type:'income' },
  umlage:       { key:'umlage',       label:'Umlage',           icon:'hand-coins',   accent:'var(--teal-500)',   bg:'var(--teal-50)',   type:'income' },
  spende:       { key:'spende',       label:'Spende',           icon:'heart',        accent:'var(--pink-500)',   bg:'var(--pink-50)',   type:'income' },
  instrument:   { key:'instrument',   label:'Instrument',       icon:'drum',         accent:'var(--purple-500)', bg:'var(--purple-50)', type:'expense' },
  noten:        { key:'noten',        label:'Notenmaterial',    icon:'music',        accent:'var(--blue-500)',   bg:'var(--blue-50)',   type:'expense' },
  uniform:      { key:'uniform',      label:'Uniform',          icon:'shirt',        accent:'var(--amber-500)',  bg:'var(--amber-50)',  type:'expense' },
  fahrt:        { key:'fahrt',        label:'Fahrtkosten',      icon:'car',          accent:'var(--orange-500)', bg:'var(--orange-50)', type:'expense' },
  verpflegung:  { key:'verpflegung',  label:'Verpflegung',      icon:'utensils',     accent:'var(--red-500)',    bg:'var(--red-50)',    type:'expense' },
  veranstaltung:{ key:'veranstaltung',label:'Veranstaltung',    icon:'calendar',     accent:'var(--green-500)',  bg:'var(--green-50)',  type:'both' },
  gebuehr:      { key:'gebuehr',      label:'Gebühren/Bank',    icon:'landmark',     accent:'var(--neutral-600)',bg:'var(--neutral-100)',type:'expense' },
  sonstiges:    { key:'sonstiges',    label:'Sonstiges',        icon:'more-horizontal',accent:'var(--neutral-500)',bg:'var(--neutral-100)',type:'both' },
};
```

Nutze `lucide-react` (bereits schlanke SVG-Icons, ~500 Bytes pro Icon, Tree-shakable).

```bash
npm install lucide-react
```

### 3.2. CategoryChip-Komponente

Ersetzt den bisherigen generischen Text-Chip.

```tsx
// src/components/CategoryChip.tsx
import { CATEGORIES, CategoryKey } from '@/config/categories';
import * as Icons from 'lucide-react';

interface Props { category: CategoryKey; size?: 'sm' | 'md'; }

export function CategoryChip({ category, size = 'sm' }: Props) {
  const def = CATEGORIES[category];
  const Icon = (Icons as any)[toPascal(def.icon)];
  return (
    <span className={`cat-chip cat-chip--${size}`} style={{ background: def.bg, color: def.accent }}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2.25} />}
      <span>{def.label}</span>
    </span>
  );
}

function toPascal(kebab: string) {
  return kebab.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('');
}
```

CSS:

```css
.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
  white-space: nowrap;
}
.cat-chip--md { padding: 5px 10px; font-size: 0.78rem; gap: 6px; }
```

### 3.3. Buchungs-Item mit Icon

Die bisherige 3-Spalten-Struktur bleibt, links kommt ein Kategorie-Icon dazu:

```
[Icon-Box 36×36]  [Notiz + Chip + Datum]  [Betrag]
```

```css
.txn-item {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.txn-item__icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: grid; place-items: center;
  /* Hintergrund + Farbe werden inline aus CategoryDef gesetzt */
}
```

---

## 4. Mitglieder-Avatare

Deterministisch aus Namen, damit derselbe Name immer dieselbe Farbe bekommt.

```tsx
// src/components/Avatar.tsx
const PALETTE = [
  { bg: '#dcfce7', fg: '#166534' },
  { bg: '#dbeafe', fg: '#1e40af' },
  { bg: '#fef3c7', fg: '#92400e' },
  { bg: '#fce7f3', fg: '#9f1239' },
  { bg: '#e9d5ff', fg: '#6b21a8' },
  { bg: '#ccfbf1', fg: '#115e59' },
  { bg: '#ffedd5', fg: '#9a3412' },
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '');
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const color = PALETTE[hash(name) % PALETTE.length];
  return (
    <div
      className="avatar"
      style={{
        width: size, height: size, background: color.bg, color: color.fg,
        fontSize: size * 0.38,
      }}
      aria-hidden="true"
    >
      {initials(name).toUpperCase()}
    </div>
  );
}
```

```css
.avatar {
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

[data-theme="dark"] .avatar {
  /* Dark Mode: gleiche Paletten, aber gedämpft über Mix-Blend oder manuell */
  filter: brightness(0.85);
}
```

Dark Mode: Farben leicht dämpfen, ansonsten gleich.

---

## 5. Saldo-Karte, Redesign mit Sparkline + Delta

### 5.1. Layout

```
┌─────────────────────────────────────┐
│ KASSENSTAND                         │
│                                     │
│ 1.247,50 €                          │
│                                     │
│ [Sparkline, semi-transparent Gold]  │
│                                     │
│ ↑ 127,50 € ggü. Vormonat            │
└─────────────────────────────────────┘
```

### 5.2. Komponente

```tsx
// src/components/BalanceCard.tsx
import { Sparkline } from './Sparkline';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  balance: number;
  deltaAmount: number;
  deltaLabel: string;        // z.B. "ggü. März"
  history: number[];         // 30 Werte, letzte 30 Tage
}

export function BalanceCard({ balance, deltaAmount, deltaLabel, history }: Props) {
  const TrendIcon = deltaAmount > 0 ? TrendingUp : deltaAmount < 0 ? TrendingDown : Minus;
  const isNegative = balance < 0;
  return (
    <div className={`balance-card ${isNegative ? 'is-negative' : ''}`}>
      <div className="balance-card__label">Kassenstand</div>
      <div className="balance-card__amount">{formatEUR(balance)}</div>
      <Sparkline data={history} className="balance-card__spark" />
      <div className="balance-card__delta">
        <TrendIcon size={14} strokeWidth={2.5} />
        <span>{formatEUR(Math.abs(deltaAmount))} {deltaLabel}</span>
      </div>
    </div>
  );
}
```

### 5.3. Sparkline-Komponente (reines SVG, keine Library)

```tsx
// src/components/Sparkline.tsx
interface Props { data: number[]; className?: string; }

export function Sparkline({ data, className }: Props) {
  if (data.length < 2) return null;
  const W = 100, H = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  const area = `0,${H} ${points} ${W},${H}`;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={area} fill="currentColor" opacity="0.18" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.4"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}
```

### 5.4. CSS

```css
.balance-card {
  position: relative;
  background: var(--color-brand);
  color: var(--color-text-on-brand);
  padding: 20px 24px 24px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.balance-card__label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
}
.balance-card__amount {
  font-family: 'DM Mono', monospace;
  font-size: 2.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 8px 0 4px;
  color: var(--color-brand-accent);
}
.balance-card.is-negative .balance-card__amount { color: var(--red-200); }

.balance-card__spark {
  width: 100%;
  height: 32px;
  color: var(--color-brand-accent);
  margin: 8px 0 12px;
  display: block;
}
.balance-card__delta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.85;
  font-family: 'DM Mono', monospace;
}
```

---

## 6. Kategorie-Donut im Dashboard

Direkt unter Statistik-Grid, vor Letzte-Buchungen-Liste.

```tsx
// src/components/CategoryDonut.tsx
import { CATEGORIES, CategoryKey } from '@/config/categories';

interface Slice { category: CategoryKey; amount: number; }
interface Props { data: Slice[]; title?: string; }

export function CategoryDonut({ data, title = 'Ausgaben nach Kategorie' }: Props) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  if (total === 0) return null;

  const R = 40, CIRC = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="donut-card">
      <div className="donut-card__title">{title}</div>
      <div className="donut-card__body">
        <svg viewBox="0 0 100 100" className="donut-svg" aria-hidden="true">
          {data.map(slice => {
            const def = CATEGORIES[slice.category];
            const dash = (slice.amount / total) * CIRC;
            const el = (
              <circle
                key={slice.category}
                cx="50" cy="50" r={R}
                fill="none"
                stroke={def.accent}
                strokeWidth="14"
                strokeDasharray={`${dash} ${CIRC - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
              />
            );
            offset += dash;
            return el;
          })}
          <text x="50" y="48" textAnchor="middle" className="donut-total">
            {formatEUR(total, 0)}
          </text>
          <text x="50" y="60" textAnchor="middle" className="donut-sub">
            gesamt
          </text>
        </svg>
        <ul className="donut-legend">
          {data.map(s => {
            const def = CATEGORIES[s.category];
            const pct = Math.round((s.amount / total) * 100);
            return (
              <li key={s.category}>
                <span className="donut-legend__dot" style={{ background: def.accent }} />
                <span className="donut-legend__label">{def.label}</span>
                <span className="donut-legend__val">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
```

```css
.donut-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
}
.donut-card__title {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}
.donut-card__body {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  align-items: center;
}
.donut-svg { width: 120px; height: 120px; }
.donut-total {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  fill: var(--color-text);
}
.donut-sub {
  font-size: 5.5px;
  fill: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.donut-legend { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.donut-legend li { display: grid; grid-template-columns: 10px 1fr auto; gap: 8px; align-items: center; font-size: 0.78rem; }
.donut-legend__dot { width: 10px; height: 10px; border-radius: 2px; }
.donut-legend__label { color: var(--color-text-dim); }
.donut-legend__val { font-family: 'DM Mono', monospace; font-weight: 600; color: var(--color-text); }
```

---

## 7. Toast-System mit Undo

### 7.1. Toast-Context

```tsx
// src/components/ToastProvider.tsx
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type Toast = {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
  undo?: () => void;
};

const Ctx = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('ToastProvider fehlt');
  return c;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = (id: string) => {
    setItems(prev => prev.filter(t => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  };

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setItems(prev => [...prev, { ...t, id }]);
    const duration = t.undo ? 4500 : 2800;
    timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="toast-region" role="region" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`toast toast--${t.variant}`}>
            <span className="toast__msg">{t.message}</span>
            {t.undo && (
              <button className="toast__action" onClick={() => { t.undo!(); dismiss(t.id); }}>
                Rückgängig
              </button>
            )}
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Schließen">✕</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
```

### 7.2. CSS

```css
.toast-region {
  position: fixed;
  left: 50%;
  bottom: calc(var(--nav-h) + var(--sab) + 12px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 300;
  width: 92%;
  max-width: 420px;
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-text);
  color: var(--color-surface);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: 0.85rem;
  animation: toast-in 0.2s ease;
}
.toast--success { background: var(--green-700); color: #fff; }
.toast--error   { background: var(--red-600);  color: #fff; }
.toast__msg     { flex: 1; }
.toast__action  {
  background: transparent; border: none; color: var(--gold-300);
  font-weight: 700; font-size: 0.8rem; cursor: pointer; padding: 4px 8px;
}
.toast__close   { background: transparent; border: none; color: inherit; opacity: 0.6; cursor: pointer; }

@keyframes toast-in {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
```

### 7.3. Nutzung

```ts
const { push } = useToast();

// Nach dem Löschen einer Buchung:
push({
  message: 'Buchung gelöscht.',
  variant: 'success',
  undo: () => restoreTxn(txn),
});
```

---

## 8. Haptic Feedback

Dünner Wrapper, damit iOS-Safari nicht meckert (dort ist `navigator.vibrate` nicht vorhanden).

```ts
// src/lib/haptics.ts
type Pattern = 'light' | 'medium' | 'success' | 'warning' | 'error';

const PATTERNS: Record<Pattern, number | number[]> = {
  light:   10,
  medium:  20,
  success: [10, 40, 10],
  warning: [20, 60, 20],
  error:   [40, 80, 40],
};

export function haptic(pattern: Pattern = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try { navigator.vibrate(PATTERNS[pattern]); } catch { /* noop */ }
}
```

**Einsatzpunkte:**
- Bottom Sheet öffnen: `haptic('light')`
- Buchung gespeichert: `haptic('success')`
- Swipe-to-Delete Threshold erreicht: `haptic('medium')`
- Delete bestätigt: `haptic('warning')`
- API-Fehler: `haptic('error')`

---

## 9. Skeleton Loader

### 9.1. Basis-Komponente

```tsx
// src/components/Skeleton.tsx
interface Props { w?: string | number; h?: string | number; radius?: string; className?: string; }

export function Skeleton({ w = '100%', h = 16, radius = '6px', className = '' }: Props) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width: typeof w === 'number' ? `${w}px` : w, height: typeof h === 'number' ? `${h}px` : h, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
```

```css
.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--color-surface-alt) 0%,
    var(--color-border) 50%,
    var(--color-surface-alt) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; opacity: 0.7; }
}
```

### 9.2. Vorgefertigte Skeleton-Screens

```tsx
// src/components/skeletons/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <>
      <Skeleton h={150} radius="var(--radius-xl)" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <Skeleton h={72} radius="var(--radius-lg)" />
        <Skeleton h={72} radius="var(--radius-lg)" />
      </div>
      <Skeleton h={160} radius="var(--radius-lg)" className="mt-12" />
    </>
  );
}

// src/components/skeletons/TxnListSkeleton.tsx
export function TxnListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, padding: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <Skeleton w={36} h={36} radius="10px" />
          <div>
            <Skeleton w="60%" h={14} />
            <Skeleton w="40%" h={10} className="mt-8" />
          </div>
          <Skeleton w={72} h={16} />
        </div>
      ))}
    </div>
  );
}
```

Bisheriger Spinner fliegt raus aus Vollbild-Ladezuständen. Er bleibt nur noch in der StatusBar für aktive Syncs und auf Buttons während einer Aktion.

---

## 10. Pull-to-Refresh

Leichtgewichtige, eigene Implementierung ohne Library.

```tsx
// src/components/PullToRefresh.tsx
import { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { haptic } from '@/lib/haptics';

const THRESHOLD = 70;
const MAX_PULL = 120;

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>; children: React.ReactNode }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  return (
    <div
      className="ptr"
      onTouchStart={e => {
        if (window.scrollY <= 0 && !refreshing) startY.current = e.touches[0].clientY;
      }}
      onTouchMove={e => {
        if (startY.current === null) return;
        const dy = e.touches[0].clientY - startY.current;
        if (dy > 0) {
          setPull(Math.min(dy * 0.5, MAX_PULL));
          if (dy * 0.5 > THRESHOLD && pull <= THRESHOLD) haptic('light');
        }
      }}
      onTouchEnd={async () => {
        if (pull >= THRESHOLD && !refreshing) {
          setRefreshing(true);
          haptic('medium');
          try { await onRefresh(); } finally {
            setRefreshing(false);
            setPull(0);
          }
        } else {
          setPull(0);
        }
        startY.current = null;
      }}
    >
      <div className="ptr__indicator" style={{ height: pull, opacity: pull / THRESHOLD }}>
        <RefreshCw size={20} className={refreshing ? 'is-spinning' : ''} style={{ transform: `rotate(${pull * 3}deg)` }} />
      </div>
      {children}
    </div>
  );
}
```

```css
.ptr__indicator {
  display: grid;
  place-items: center;
  color: var(--color-brand);
  overflow: hidden;
  transition: height 0.2s ease;
}
.ptr__indicator .is-spinning { animation: spin 0.8s linear infinite; }
```

---

## 11. Tab-Bar Badges

Erweiterung der bestehenden BottomNav:

```tsx
interface NavItem { path: string; label: string; icon: string; badge?: number; }

// Badge in der NavItem-Komponente
{item.badge !== undefined && item.badge > 0 && (
  <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
)}
```

```css
.nav-item { position: relative; }
.nav-badge {
  position: absolute;
  top: 6px;
  right: calc(50% - 20px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--color-expense);
  color: #fff;
  font-size: 0.58rem;
  font-weight: 700;
  display: grid;
  place-items: center;
  line-height: 1;
}
```

Die Badge-Zahl wird aus dem Store gelesen, z.B. `openUmlagen.length` für den Umlagen-Tab.

---

## 12. Empty States mit Charakter

### 12.1. Illustrations-Set

Unter `src/assets/illustrations/` vier SVGs anlegen:
- `empty-txn.svg` (offene Kasse mit Federkiel)
- `empty-umlage.svg` (Münzen-Stack)
- `empty-members.svg` (Silhouetten im Halbkreis)
- `empty-search.svg` (Lupe über Notizblock)

Stil: einfarbig `currentColor` als Stroke, keine Fills, Strichstärke 1.5. Damit passen sie sich per `color: var(--color-text-muted)` automatisch an Light/Dark an.

### 12.2. EmptyState-Komponente

```tsx
// src/components/EmptyState.tsx
interface Props {
  illustration: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ illustration, title, description, action }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state__art">{illustration}</div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && (
        <button className="btn btn--primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
```

```css
.empty-state {
  text-align: center;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-state__art {
  color: var(--color-text-muted);
  width: 100px; height: 100px;
  opacity: 0.6;
}
.empty-state__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 8px 0 0;
}
.empty-state__desc {
  font-size: 0.875rem;
  color: var(--color-text-dim);
  max-width: 280px;
  line-height: 1.5;
  margin: 0 0 8px;
}
```

**Konkrete Texte:**
- Buchungen leer: Titel "Noch keine Buchungen", Desc "Lege deine erste Einnahme oder Ausgabe an. Die App synchronisiert automatisch.", Action "Erste Buchung"
- Umlagen leer: Titel "Keine offenen Umlagen", Desc "Sobald eine Umlage angelegt ist, siehst du hier den Stand pro Mitglied."
- Mitglieder leer: Titel "Noch keine Mitglieder", Desc "Füge dein erstes Mitglied hinzu, um Umlagen zu verwalten.", Action "Mitglied hinzufügen"

---

## 13. Typografie-Schärfung

Bestehende Skala punktuell anpassen:

| Rolle | Alt | Neu |
|-------|-----|-----|
| h1 (Seitentitel) | 1.35rem / 700 / -0.02em | **1.5rem / 800 / -0.03em** |
| Saldo-Betrag | 3rem / 700 | **2.75rem / 700 / -0.02em** (Platz für Sparkline) |
| Setup-Titel | 1.7rem / 700 | 1.75rem / 800 / -0.03em |

Großer Betrag bekommt `font-feature-settings: "tnum"` (Tabular Numerals), damit Ziffern gleichbreit laufen:

```css
.balance-card__amount,
.txn-item__amount,
.stat-card__value {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

---

## 14. Quick-Add Bottom Sheet

Statt direkt auf Neue-Buchung-Seite zu navigieren, öffnet der "+ Neu"-Button ein Bottom Sheet mit drei Feldern: Betrag, Kategorie (aus Quick-Picks), Typ. "Mehr Details" führt dann erst auf die volle Seite.

### 14.1. Quick-Picks

Drei bis fünf am häufigsten verwendete Kategorien des Users werden aus IndexedDB berechnet (Top-N der letzten 90 Tage). Darunter ein "Alle anzeigen", das den vollen Kategorie-Picker öffnet.

### 14.2. Layout

```
┌─ Bottom Sheet ─────────────────────┐
│         ─── Handle ───              │
│                                    │
│  [Einnahme]  [Ausgabe]             │
│                                    │
│        ┌────────────┐              │
│        │   0,00 €   │  (DM Mono)   │
│        └────────────┘              │
│                                    │
│  Kategorie                         │
│  [Chip] [Chip] [Chip] [Chip] [+]   │
│                                    │
│  [Abbrechen]    [Speichern]        │
└────────────────────────────────────┘
```

### 14.3. Keyboard Handling

Eingabefeld öffnet sofort Numpad (`inputMode="decimal"`, `pattern="[0-9]*"`). Sheet wandert mit `visualViewport`-Listener nach oben, damit es nicht von der Tastatur verdeckt wird:

```ts
const vv = window.visualViewport;
if (vv) {
  const onResize = () => {
    document.documentElement.style.setProperty('--kbd-offset', `${window.innerHeight - vv.height}px`);
  };
  vv.addEventListener('resize', onResize);
  vv.addEventListener('scroll', onResize);
  onResize();
}
```

```css
.bottom-sheet {
  transform: translateY(calc(-1 * var(--kbd-offset, 0px)));
  transition: transform 0.15s ease;
}
```

---

## 15. Onboarding-Flow

Ersetzt die einzelne Setup-Seite durch einen 4-Schritt-Flow mit Progress oben.

**Schritte:**
1. **Willkommen** (Logo, App-Name, kurze Erklärung, "Los geht's")
2. **GitHub-Verbindung** (Personal Access Token eingeben, Verbindung testen)
3. **Verein / Gruppe** (Name, Logo-Upload optional, Währungsformat)
4. **Mitglieder** (Import aus CSV oder manuell, mindestens 1 Mitglied)

### 15.1. Progress-Komponente

```tsx
// src/components/OnboardingProgress.tsx
export function OnboardingProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="ob-progress" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`ob-progress__dot ${i < current ? 'is-done' : ''} ${i === current ? 'is-current' : ''}`} />
      ))}
    </div>
  );
}
```

```css
.ob-progress {
  display: flex;
  gap: 6px;
  padding: 16px;
  justify-content: center;
}
.ob-progress__dot {
  width: 32px; height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  transition: background 0.2s;
}
.ob-progress__dot.is-current { background: var(--color-brand); }
.ob-progress__dot.is-done    { background: var(--color-brand); opacity: 0.5; }
```

### 15.2. State-Management

Ein Zustand `onboardingStep` in IndexedDB persistiert. Bei Reload startet der User dort, wo er aufgehört hat. Nach Abschluss wird `onboardingCompletedAt` gesetzt, ab dann Normal-Flow.

---

## 16. Einstellungs-Seite erweitern

Neue Sektionen unter dem bestehenden Grundgerüst:

```
DARSTELLUNG
- Theme: Auto / Hell / Dunkel         (Segmented Control)

STATISTIK
- Buchungen gesamt                     (Zahl)
- Aktive Mitglieder                    (Zahl)
- Letzter Sync                         (Zeit)
- Datenbankgröße                       (KB)

DATEN
- Export als CSV
- Export als JSON (Backup)
- Import aus Backup
- Alle lokalen Daten löschen           (Danger)

ÜBER
- Version + Build-Hash
- GitHub-Repo öffnen
- Changelog
```

### 16.1. Theme-Toggle als Segmented Control

```tsx
<div className="segmented">
  {(['system','light','dark'] as const).map(opt => (
    <button
      key={opt}
      className={`segmented__item ${theme === opt ? 'is-active' : ''}`}
      onClick={() => { applyTheme(opt); setTheme(opt); haptic('light'); }}
    >
      {opt === 'system' ? 'Auto' : opt === 'light' ? 'Hell' : 'Dunkel'}
    </button>
  ))}
</div>
```

```css
.segmented {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  padding: 3px;
}
.segmented__item {
  background: transparent;
  border: none;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-dim);
  border-radius: calc(var(--radius-md) - 3px);
  cursor: pointer;
  transition: all 0.12s;
}
.segmented__item.is-active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}
```

---

## 17. Barrierefreiheit (zusätzlich)

- `prefers-reduced-motion`: Alle Animationen auf `animation: none` oder deutlich kürzere Dauer
- Fokus-Ring bleibt verpflichtend (`:focus-visible`), bekommt im Dark Mode heller Grün (`--green-300`)
- Toast-Region hat `role="region"` und `aria-live="polite"`, Error-Toasts `aria-live="assertive"`
- Icon-Buttons brauchen `aria-label` (aktuell teilweise fehlend, bitte systematisch ergänzen)
- Avatare haben `aria-hidden="true"`, da der Name daneben steht
- Kontrastprüfung: Alle neuen Token-Kombinationen müssen AA erreichen, Body-Text AAA anstreben

---

## 18. PWA-Updates

### 18.1. Manifest anpassen

```json
{
  "name": "TambourWallet",
  "short_name": "TambourWallet",
  "display": "standalone",
  "background_color": "#0d3d18",
  "theme_color": "#0d3d18",
  "lang": "de",
  "orientation": "portrait-primary",
  "shortcuts": [
    {
      "name": "Neue Einnahme",
      "short_name": "Einnahme",
      "url": "/?quick=income",
      "icons": [{ "src": "/icons/shortcut-income.png", "sizes": "96x96" }]
    },
    {
      "name": "Neue Ausgabe",
      "short_name": "Ausgabe",
      "url": "/?quick=expense",
      "icons": [{ "src": "/icons/shortcut-expense.png", "sizes": "96x96" }]
    }
  ]
}
```

Shortcuts lassen sich per Long-Press auf dem App-Icon triggern (iOS 16+, Android). Beim Öffnen liest `App.tsx` den `?quick=`-Parameter und öffnet direkt das Quick-Add Sheet im passenden Typ.

### 18.2. Theme-Color dynamisch

Das `<meta name="theme-color">`-Tag bekommt zwei Varianten:

```html
<meta name="theme-color" content="#0d3d18" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0a0f0d" media="(prefers-color-scheme: dark)">
```

Zusätzlich wird der Wert in `applyTheme()` per JS überschrieben (für manuellen Toggle).

---

## 19. Migrationsreihenfolge, konkret

Bitte streng in dieser Reihenfolge arbeiten, damit keine Regressionen entstehen:

1. **Token-Refactoring** (Abschnitt 2)
   - Alle Komponenten auf semantische Tokens umstellen
   - Legacy-Alias setzen, damit nichts bricht
   - Manuelle Sichtprüfung auf jeder Seite

2. **Dark Mode** (Abschnitt 2.2 + 16.1)
   - `initTheme()` in `main.tsx`
   - Einstellungs-Seite Segmented Control
   - Jede Seite im Dark Mode durchklicken

3. **Kategorie-System** (Abschnitt 3)
   - `src/config/categories.ts`
   - Migrationsscript für bestehende Buchungen (Freitext-Kategorie → `sonstiges`-Mapping, Nutzer kann später manuell umordnen)
   - CategoryChip verbauen

4. **Komponenten-Aufwertung** (Abschnitte 4, 11, 12, 13)
   - Avatar, Nav-Badges, Empty States, Typografie

5. **Dashboard-Redesign** (Abschnitte 5, 6)
   - BalanceCard, Sparkline, CategoryDonut

6. **Toast + Haptic + Skeleton** (Abschnitte 7, 8, 9)
   - ToastProvider in `main.tsx` wrappen
   - Haptic in Swipe, Save, Delete einbauen
   - Skeletons in allen Lade-Pfaden

7. **Pull-to-Refresh** (Abschnitt 10)
   - Dashboard + Buchungen

8. **Quick-Add Sheet** (Abschnitt 14)

9. **Onboarding-Flow** (Abschnitt 15)

10. **PWA-Shortcuts** (Abschnitt 18)

---

## 20. Akzeptanzkriterien (Definition of Done)

Für jede Phase gilt:

**Phase 1**
- [ ] Keine Hex-Werte mehr in Komponenten-CSS (nur in Token-Definitionen)
- [ ] Dark Mode wechselt live ohne Reload
- [ ] PWA-Theme-Color passt sich an
- [ ] Alle bestehenden Screens sehen in Light identisch zum aktuellen Stand aus
- [ ] Alle Screens in Dark sauber lesbar, kein Text <AA-Kontrast
- [ ] `prefers-color-scheme` wird respektiert, wenn Theme = system

**Phase 2**
- [ ] Jede bestehende Buchung hat eine Kategorie (Migration geprüft)
- [ ] CategoryChip rendert mit Icon in Liste und Detail
- [ ] Saldo-Karte zeigt korrekte Sparkline und Delta
- [ ] Donut-Chart summiert sich zu 100%
- [ ] Avatare sind deterministisch (Reload behält Farbe)
- [ ] Tab-Badges aktualisieren sich, wenn Umlagen bezahlt werden

**Phase 3**
- [ ] Toasts erscheinen bei Save, Delete, Error
- [ ] Undo funktioniert bei Buchung gelöscht (4,5 s Fenster)
- [ ] Haptic triggert nicht im Desktop (kein Error in Console)
- [ ] Skeleton erscheint während initialem Laden, nicht bei jedem Re-Render
- [ ] Pull-to-Refresh löst Sync aus und zeigt korrekte Animation
- [ ] Quick-Add Sheet bleibt über der Tastatur
- [ ] Onboarding-Flow kann abgebrochen und fortgesetzt werden

---

## 21. Dateien-Übersicht (neue und geänderte)

**Neu:**
```
src/
├── config/
│   └── categories.ts
├── lib/
│   ├── theme.ts
│   └── haptics.ts
├── components/
│   ├── Avatar.tsx
│   ├── BalanceCard.tsx
│   ├── CategoryChip.tsx
│   ├── CategoryDonut.tsx
│   ├── EmptyState.tsx
│   ├── OnboardingProgress.tsx
│   ├── PullToRefresh.tsx
│   ├── Skeleton.tsx
│   ├── Sparkline.tsx
│   ├── ToastProvider.tsx
│   └── skeletons/
│       ├── DashboardSkeleton.tsx
│       └── TxnListSkeleton.tsx
├── features/
│   ├── onboarding/
│   │   ├── OnboardingFlow.tsx
│   │   ├── StepWelcome.tsx
│   │   ├── StepGitHub.tsx
│   │   ├── StepClub.tsx
│   │   └── StepMembers.tsx
│   └── quickadd/
│       └── QuickAddSheet.tsx
└── assets/illustrations/
    ├── empty-txn.svg
    ├── empty-umlage.svg
    ├── empty-members.svg
    └── empty-search.svg
```

**Geändert:**
```
src/
├── main.tsx                        (initTheme + ToastProvider)
├── styles/
│   ├── tokens.css                  (komplett neu, siehe Abschnitt 2)
│   └── components.css              (alle Hex → Tokens)
├── pages/
│   ├── Dashboard.tsx               (BalanceCard, Donut, Skeleton, PTR)
│   ├── Transactions.tsx            (CategoryChip, Icons, Skeleton, PTR)
│   ├── Umlagen.tsx                 (Badges, Empty State)
│   ├── Members.tsx                 (Avatar)
│   └── Settings.tsx                (Theme-Toggle, neue Sektionen)
├── components/
│   ├── AppHeader.tsx               (Token-Cleanup)
│   ├── BottomNav.tsx               (Badges)
│   ├── StatusBar.tsx               (Token-Cleanup)
│   └── TxnItem.tsx                 (Icon-Box, Skeleton-kompatibel)
└── public/
    └── manifest.webmanifest        (Shortcuts)
```

---

## 22. Was NICHT geändert wird

- Der Vereinsgrün/-gold-Markenkern bleibt bestehen
- Mobile-first, 480px Max-Breite unverändert
- BottomNav-Position (fixed, Bottom) bleibt
- IndexedDB-Schema für Buchungen bleibt kompatibel (Kategorie-Feld wird ggf. erweitert, nicht ersetzt)
- Service-Worker-Strategie bleibt
- Router-Struktur bleibt
- React 19, Vite 8, idb 8 bleiben

---

*Erstellt: April 2026 | Ausführender: Claude Code | Basis-Dokument: DESIGN_CONCEPT.md*
