# TambourWallet — Designsystem

Referenz für alle Design-Entscheidungen. Alles hier korrespondiert mit Variablen in `src/styles/tokens.css`.

---

## Designsprache

Eigene Vereinsidentität — kein iOS, kein Material Design. Zwei Prinzipien:

1. **Ruhig und strukturiert.** Weissraum trennt, Karten heben hervor. Keine überladenen Flächen.
2. **Vereinsfarben zuerst.** Waldgrün und Gold sind die Marke. Alles andere ist neutral.

---

## Farben

### Primärpalette

| Token | Wert | Verwendung |
|---|---|---|
| `--green-700` | `#0d3d18` | Brand-Primär (Light), Buttons, Links, Fokus |
| `--green-400` | `#4a8739` | Brand-Primär (Dark) |
| `--gold-400`  | `#c9a227` | Akzent auf Hero-Flächen, Splash, Logo-Rand |
| `--gold-300`  | `#d9b948` | Akzent auf dunklem Grün (besserer Kontrast) |

### Semantische Tokens (in Komponenten verwenden)

| Token | Light | Dark | Bedeutung |
|---|---|---|---|
| `--color-bg` | `#f4f6f2` | `#0a0f0d` | Seitenhintergrund |
| `--color-surface` | `#ffffff` | `#1f2937` | Karten, Sheets, Modals |
| `--color-surface-alt` | `#eef1ea` | `#111827` | Felder, Input-BG |
| `--color-border` | `#d8ddd2` | `#4b5563` | Hairlines, Trennlinien |
| `--color-border-strong` | `#bfc8b8` | `#6b7280` | Buttons, Inputs |
| `--color-text` | `#111827` | `#f4f6f2` | Primärtext |
| `--color-text-dim` | `#6b7280` | `#9ca3af` | Labels, Sekundärtext |
| `--color-text-muted` | `#9ca3af` | `#6b7280` | Hints, Placeholder |
| `--color-brand` | `#0d3d18` | `#4a8739` | Brand-Farbe |
| `--color-income` | `#0d3d18` | `#7fae69` | Einzahlung, positiv |
| `--color-expense` | `#b91c1c` | `#fca5a5` | Auszahlung, negativ |
| `--color-warning` | `#b45309` | `#fed7aa` | Offen, ausstehend |
| `--color-info` | `#2563eb` | `#bfdbfe` | Info, Aktionskarten |

### Legacy-Aliases (bestehende Styles)

Ältere Klassen nutzen Kurz-Aliases wie `--bg`, `--surface`, `--text`, `--red`, `--green`. Diese zeigen auf die semantischen Tokens und dürfen in neuen Styles nicht mehr verwendet werden.

---

## Typografie

| Schrift | Verwendung | Gewichte |
|---|---|---|
| **Figtree** | Alles — Body, Headlines, Labels | 300, 400, 500, 600, 700, 800, 900 |
| **Fira Code** | Zahlen, Beträge, Versionsnummern, Monospace-Elemente | 400, 500, 600 |

### Skala

| Rolle | Grösse | Gewicht | Klasse / Kontext |
|---|---|---|---|
| Large Title | `2.1rem` | 800 | `.page-large-title` |
| Page H1 | `1.5rem` | 800 | `.page-header h1` |
| Card-Betrag | `2rem+` | 800 | `.balance-card__amount` |
| Body | `1rem` | 400 | Standard |
| Label | `0.8rem` | 600 | `form-group label` |
| Chip / Badge | `0.72rem` | 600 | `.category-chip` |
| Caption | `0.75rem` | 500–600 | Datumsangaben, Hints |
| Micro | `0.66rem` | 500 | Nav-Labels |

**Beträge immer:** `font-family: 'Fira Code'` + `font-variant-numeric: tabular-nums`

---

## Spacing

| Token | Wert | Typische Verwendung |
|---|---|---|
| `--space-xs` | `4px` | Interne Abstände in Chips, Icons |
| `--space-sm` | `8px` | Abstände zwischen Label und Wert |
| `--space-md` | `12px` | Input-Padding, Karten-Innenabstand klein |
| `--space-lg` | `16px` | Seitenränder, Karten-Innenabstand |
| `--space-xl` | `24px` | Abstand zwischen Sektionen |
| `--space-2xl` | `32px` | Grösste vertikale Abstände |

---

## Radien

| Token | Wert | Verwendung |
|---|---|---|
| `--r-sm` / `--radius-sm` | `6px` | Chips, Badges, Icon-Buttons |
| `--r-md` / `--radius-md` | `10px` | Buttons, Inputs, Felder |
| `--r-lg` / `--radius-lg` | `14px` | Karten, Modals |
| `--r-xl` / `--radius-xl` | `18px` | Bottom Sheets, grosse Karten |
| `border-radius: 50%` | — | Avatare, kreisförmige Elemente |

---

## Shadows

| Token | Wert | Verwendung |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Inputs, subtile Erhöhung |
| `--shadow` | `0 1px 3px … 0 1px 2px …` | Karten auf normalem Hintergrund |
| `--shadow-md` | `0 4px 6px … 0 2px 4px …` | Navigation, Modals |
| `--shadow-lg` | `0 10px 25px … 0 4px 10px …` | Schwebende Elemente (sparsam) |

Dark Mode: Stärkere Shadows (höhere Alpha-Werte) da dunkle Flächen sonst verschmelzen.

---

## Animationen und Übergänge

| Situation | Dauer | Eigenschaft |
|---|---|---|
| Hover-Zustand (Farbe) | `0.12s` | `background`, `color`, `opacity` |
| Nav-Pill erscheint | `0.18s` | `background` |
| Modal / Sheet öffnet | CSS-Transition via `useClosingAnimation` | `transform: translateY` + `opacity` |
| Modal / Sheet schliesst | `180ms` | `is-closing`-Klasse |
| Skeleton | `1.6s infinite` | `@keyframes shimmer` |
| Sparkline-Zeichnen | `0.6s ease-out` | SVG `stroke-dashoffset` |
| Paid-Zeilen-Pop | `@keyframes row-pop` | `transform: scaleX` |

**Regel:** Nie schwerer als `transition: 0.18s`. Alle Animationen unter `@media (prefers-reduced-motion: reduce)` deaktivieren.

---

## Komponenten

### Buttons

```
.btn                 Base (padding, radius, flex, font)
.btn--primary        Grün, weisser Text — Hauptaktion
.btn--danger-solid   Rot, Border — destruktive Aktion
.btn--ghost          Transparent, Border — Sekundäraktion
.btn--icon           Quadratisch, kein Rand — Icon-only
.btn--sm             Kleiner Padding
.btn--full           Volle Breite
```

### Cards / Karten

Kein dedizierter `.card`-Klassensatz. Karten sind:
- `background: var(--color-surface)`
- `border-radius: var(--r-lg)` oder `--r-xl`
- `border: 1px solid var(--color-border)`
- `box-shadow: var(--shadow)` oder keiner

### Bottom Sheet

```
.modal-overlay       Hintergrund-Dimmer (backdrop)
.bottom-sheet        Das Sheet selbst (slideUp-Animation)
.bottom-sheet__handle  Anfass-Streifen oben
.bottom-sheet__header  Titel + Schliessen-Button
.bottom-sheet__body    Scrollbarer Inhalt (form)
```

Exit-Animation: `is-closing`-Klasse setzt `transform: translateY(100%)` + `opacity: 0`.

### Formulare

```
.form-group          Flex column, gap 6px
.form-group label    0.8rem, 600, color: text-dim
.form-group input / select / textarea
                     surface-BG, border2, r-md, shadow-sm, focus: brand-ring
.form-row            Zwei Felder nebeneinander (grid 1fr 1fr)
.form-hint           0.75rem, muted — "(optional)"-Hinweis
.form-group--inline  Label + Toggle in einer Zeile
.toggle-btn          Ja/Nein-Toggle
```

### Kategorie-Chips

```
.category-chip       Icon + Name, kleiner Chip
.category-chip--income / --expense   Farbvarianten
```

### Navigation

```
.bottom-nav          Fixed, 64px + safe-area
.bottom-nav__item    Flex column, muted wenn inaktiv
.bottom-nav__item--active  Brand-Farbe
.bottom-nav__pill    Hinterlegung bei aktivem Tab (Brand-Subtle)
```

### Avatar

Deterministischer Farbton aus Namens-Hash. Kreis, `border-radius: 50%`, 36px Standard.

---

## Dark Mode

Umschaltung via `[data-theme="dark"]` auf `<html>` oder `<body>`. Kein JS-Check in Komponenten. Tokens decken alle Farbwechsel ab.

Einstellung: `auto` (System), `light`, `dark` — gespeichert in `localStorage`.

---

## Layout

- **Max-Breite:** `480px` (app-shell) — zentral, Handy-First
- **Header:** fixiert oben, `min-height: 52px + safe-area-top`
- **Content:** scrollbar, `padding-bottom: 64px + safe-area-bottom`
- **Nav:** fixed bottom, `64px + safe-area-bottom`

---

## Offen / Design-Verbesserungspotenzial

Bereiche die noch nicht final ausgearbeitet sind oder verbessert werden können:

- **Buchungs-Listeneintrag** — Kompaktheit vs. Lesbarkeit, Metafelder-Darstellung
- **Dashboard Bento-Grid** — Karten-Hierarchie und Weissraum auf grösseren Phones
- **Kategorie-Donut** — Legende und Beschriftung bei vielen Kategorien
- **Formular-UX (BuchungModal)** — Gruppierung und Reihenfolge der Felder
- **Leer-Zustände** — Illustration vs. reine Text-Beschreibung
- **Onboarding** — Schritt-Visualisierung (aktuell nur Dots)
- **Farbkontrast Dark Mode** — einzelne Badges und Chips noch nicht geprüft
- **Typo-Hierarchie im Dashboard** — Betrag vs. Label-Grössenverhältnis
