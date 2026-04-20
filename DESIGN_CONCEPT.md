# TambourWallet – Designkonzept

> Dieses Dokument beschreibt das vollständige Designsystem der TambourWallet PWA. Es dient als Grundlage für die Weiterentwicklung und Vereinheitlichung des Erscheinungsbilds.

---

## 1. Markenidentität

**App-Name:** TambourWallet  
**Zweck:** Digitales Kassenbuch für den Tambourkorps-Schatzmeister  
**Sprache:** Deutsch (de-DE)  
**Tonalität:** Vertrauenswürdig, klar, vereinsnah – kein Corporate-Stil

### Markenwerte im Design
- **Vereinstreue:** Farben und Logo spiegeln die Vereinsidentität wider
- **Klarheit:** Finanzinformationen auf einen Blick lesbar
- **Zuverlässigkeit:** Stabiles, ruhiges Layout ohne visuelle Unruhe
- **Mobilität:** Optimiert für Smartphones, immer griffbereit

---

## 2. Farbpalette

### Primärfarben

| Name | Hex | Verwendung |
|------|-----|------------|
| Vereinsgrün (dunkel) | `#0d3d18` | Primär-Buttons, aktive Nav, Saldo-Karte, Theme-Farbe |
| Vereinsgrün (mittel) | `#14532d` | Hover-Zustand Primary Button |
| Vereinsgrün (hell) | `#edf5ea` | Hintergründe, Hover-States, Info-Boxen |
| Vereinsgrün (border) | `#b6d4a8` | Rahmen auf grünem Hintergrund |
| Vereinsgold | `#c9a227` | Fortschrittsbalken, Splash Screen, Premium-Akzente |
| Vereinsgold (hell) | `#fdf8e6` | Hintergrund bei Gold-Akzenten |
| Vereinsgold (border) | `#e8cc7a` | Rahmen auf goldenem Hintergrund |

### Semantische Farben (Finanzen)

| Name | Hex | Bedeutung |
|------|-----|-----------|
| Einnahme-Grün | `#0d3d18` | Positive Beträge, Einnahmen |
| Einnahme-Hintergrund | `#edf5ea` | Hintergrund für Einnahmen-Elemente |
| Ausgabe-Rot | `#b91c1c` | Negative Beträge, Ausgaben |
| Ausgabe-Hintergrund | `#fef2f2` | Hintergrund für Ausgaben-Elemente |
| Ausgabe-Border | `#fecaca` | Rahmen auf rotem Hintergrund |
| Warnung-Orange | `#b45309` | Offene Umlagen, ausstehende Zahlungen |

### Neutrale Farben

| CSS-Variable | Hex | Verwendung |
|---|---|---|
| `--bg` | `#f4f6f2` | App-Hintergrund |
| `--bg2` | `#e8ece3` | Sekundärer Hintergrund |
| `--surface` | `#ffffff` | Karten, Modals, Inputs |
| `--surface2` | `#eef1ea` | Inaktive Toggle-Buttons, Chip-Hintergründe |
| `--border` | `#d8ddd2` | Standard-Rahmen |
| `--border2` | `#bfc8b8` | Verstärkte Rahmen (Hover, Fokus) |
| `--text` | `#111827` | Primärer Text |
| `--text-dim` | `#6b7280` | Sekundärer Text, Labels |
| `--text-muted` | `#9ca3af` | Dezenter Text, Platzhalter, Leerstand |

### Einsatzregel: Farbsemantik
- **Grün = positiv / Einnahme / aktiv / bestätigt**
- **Rot = negativ / Ausgabe / Fehler / löschen**
- **Orange = Warnung / offen / ausstehend**
- **Gold = besonders / Fortschritt / Branding**
- **Grau = neutral / inaktiv / deaktiviert**

---

## 3. Typografie

### Schriftarten

| Familie | Gewichte | Verwendung |
|---------|----------|------------|
| **Inter** | 400, 500, 600, 700 | Alle UI-Texte, Überschriften, Labels, Body |
| **DM Mono** | 400, 500 | Geldbeträge, Datumsangaben, Versionsnummern |

### Typografische Skala

| Rolle | Größe | Gewicht | Besonderheiten |
|-------|-------|---------|----------------|
| Seitentitel (h1) | 1.35rem | 700 | letter-spacing: -0.02em |
| Abschnittstitel | 0.95rem | 700 | — |
| Kartentitel | 1rem | 600 | — |
| Body-Text | 0.875rem | 400 | line-height 1.5–1.65 |
| Labels | 0.8rem | 600 | letter-spacing 0.01em |
| Kleine Labels | 0.72rem | 600 | UPPERCASE, letter-spacing 0.05–0.08em |
| Mikro-Labels | 0.65rem | 600 | UPPERCASE, stark gedimmt |
| Großer Betrag (Dashboard) | 3rem | 700 | DM Mono |
| Mittlerer Betrag (Detail) | 2.4rem | 700 | DM Mono |
| Listen-Betrag | 1rem | 600 | DM Mono |
| Kleiner Betrag | 0.78rem | 500 | DM Mono |

### Typografie-Regeln
- Geldbeträge **immer** in DM Mono
- Datumsanzeigen in DM Mono
- Abschnitts-Labels in UPPERCASE mit erhöhtem Letter-Spacing
- iOS-Zoom-Schutz: `font-size: max(16px, 1em)` für alle Inputs

---

## 4. Abstands-System

Alle Abstände basieren auf CSS Custom Properties mit einer 4px-Basis:

| Variable | Wert | Verwendung |
|----------|------|------------|
| `--space-xs` | 4px | Minimal-Abstände, enge Gaps |
| `--space-sm` | 8px | Kompakte Abstände, Icon-Padding |
| `--space-md` | 12px | Standard-Innen-Padding |
| `--space-lg` | 16px | Standard-Seiten-Padding |
| `--space-xl` | 24px | Seiten-Padding oben, Sektions-Abstände |
| `--space-2xl` | 32px | Große Abstände, Setup-Seite |

---

## 5. Border-Radius

| Variable | Wert | Verwendung |
|----------|------|------------|
| `--radius-sm` | 6px | Kleine Buttons, Badges, Chips |
| `--radius-md` | 10px | Form-Inputs, kleine Karten |
| `--radius-lg` | 14px | Sektion-Container, Karten |
| `--radius-xl` | 18px | Bottom Sheets, Hauptkarten, Saldo-Karte |

---

## 6. Schatten-System

| Variable | Wert | Verwendung |
|----------|------|------------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Minimaler Schatten |
| `--shadow` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Standard (Listen-Items) |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` | Karten (Hover) |
| `--shadow-lg` | `0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)` | Modals, Saldo-Karte, Splash |

---

## 7. Layout & Responsive Design

### App-Container
- **Maximale Breite:** 480px
- **Zentrierung:** `margin: 0 auto`
- **Grundprinzip:** Mobile-first, kein Desktop-Layout notwendig

### Viewport & Safe Areas
```
viewport-fit: cover
```
CSS-Variablen für Safe Areas:
- `--sat` → `env(safe-area-inset-top)` (Notch oben)
- `--sab` → `env(safe-area-inset-bottom)` (Home-Indikator unten)

**Anwendung:** Header-Padding, BottomNav-Padding, Content-Padding-Bottom

### Viewport-Höhe
Verwendung von `100dvh` (Dynamic Viewport Height) statt `100vh` – reagiert auf mobile Browser-UI

### Navigation
- `--nav-h`: 64px (BottomNav-Höhe)
- Content erhält `padding-bottom: calc(var(--nav-h) + var(--sab))`

---

## 8. Komponenten-Bibliothek

### AppHeader

| Eigenschaft | Wert |
|-------------|------|
| Höhe | 52px + safe-area-inset-top |
| Layout | Flexbox, space-between |
| Logo | 34×34px, rund, 2px Goldrahmen |
| App-Name | 0.95rem, weight 700 |
| Sub-Text | 0.62rem, weight 500, text-muted |
| Versions-Badge | Monospace, 0.7rem, surface2-Hintergrund |

---

### StatusBar

Zeigt den aktuellen Synchronisierungsstatus:

| Zustand | Hintergrund | Textfarbe | Sonstiges |
|---------|-------------|-----------|-----------|
| Offline | Grau (surface2) | text-muted | — |
| Synchronisiert | Normal | Normal | — |
| Syncing | Blau-hell | Blau | Lade-Spinner (0.8s) |
| Fehler | Rot-hell | Rot | Retry-Button |

---

### BottomNav

| Eigenschaft | Wert |
|-------------|------|
| Position | Fixed, Bottom |
| Höhe | 64px + safe-area-inset-bottom |
| Layout | Flex, 4 gleiche Items |
| Icon-Größe | 22×22px SVG |
| Label | 0.66rem, weight 500 |
| Aktiv-Farbe | Vereinsgrün (`#0d3d18`) |
| Inaktiv-Farbe | text-dim |
| Oberer Rand | 1px solid border + shadow-md |

**Navigation-Items:**
1. Dashboard (Grid-Icon)
2. Buchungen (Dokument-Icon)
3. Umlagen (Währungs-Icon)
4. Einstellungen (Menü-Icon)

---

### Buttons

#### Varianten

**Primary Button**
```
Hintergrund:  #0d3d18
Farbe:        weiß
Padding:      10px 16px
Radius:       10px
Font:         0.875rem, weight 600
Hover:        #14532d
Disabled:     45% Deckkraft
```

**Danger Button**
```
Hintergrund:  #fef2f2
Farbe:        #b91c1c
Border:       1px solid #fecaca
Padding:      10px 16px
Radius:       10px
```

**Icon Button**
```
Hintergrund:  keiner
Border:       keiner
Padding:      7px
Radius:       6px
Farbe:        text-dim
Hover-BG:     surface2
```

**Modifikatoren:**
- `--sm`: Padding 6px 12px, Font 0.8rem
- `--full`: width 100%

---

### Filter-Buttons (Listen-Seiten)

```
Inaktiv:    Weiß, 1px border, Radius 20px
Aktiv:      Vereinsgrün, weiß, kein Border
Padding:    6px 14px
Transition: 0.12s
```

---

### Type-Toggle (Einnahme / Ausgabe)

```
Container:  Grid 1fr 1fr, surface2-BG, 3px Padding, Radius 10px
Inaktiv:    Kein BG, text-dim
Aktiv Grün: Weiß BG, grüner Text
Aktiv Rot:  Weiß BG, roter Text
Transition: 0.12s
```

---

### Form-Elemente

#### Eingabefelder (Inputs, Select, Textarea)

```
Hintergrund:  #ffffff
Border:       1px solid --border2
Padding:      11px 12px
Radius:       10px
Font-Größe:   max(16px, 1em)  ← verhindert iOS-Zoom
Fokus:        Grüner Border + Grüner Glow (0 0 0 3px rgba(22,101,52,0.1))
Placeholder:  text-muted
```

#### Betragsfeld (Sonderfall)

```
Font:         DM Mono, 2rem, weight 600
Text-align:   center
Padding:      16px
Letter-spacing: -0.02em
```

#### Select

```
Appearance:   none (custom)
Pfeil:        SVG-Chevron rechts (Background-Image)
Padding-right: 36px
```

#### Checkbox

```
Accent-color: Vereinsgrün
Größe:        15×15px
Container:    Flex, gap 12px, padding 9px
```

---

### Form-Labels

```
Größe:        0.8rem
Gewicht:      600
Letter-spacing: 0.01em
Farbe:        text (Standard)
```

---

### Beleg-Upload-Feld

```
Border:       1.5px dashed --border2
Hintergrund:  surface2
Hover:        Blauer Border, hellblauer BG
Icon:         1.6rem Emoji
Label:        0.85rem, text-dim
Hint:         0.72rem, text-muted
```

---

### Karten-Komponenten

#### Saldo-Karte (Dashboard)

```
Hintergrund:  #0d3d18 (Vereinsgrün)
Farbe:        weiß
Padding:      24px 24px 32px
Radius:       18px
Schatten:     --shadow-lg
Label:        0.75rem, UPPERCASE, 70% Deckkraft
Betrag:       3rem, DM Mono, weight 700
  ↳ Positiv:  Vereinsgold (#c9a227)
  ↳ Negativ:  Rot-hell
Info-Text:    0.8rem, 65% Deckkraft
```

#### Statistik-Karten (2-Spalten-Grid)

```
Hintergrund:  weiß
Border:       1px solid --border
Padding:      12px 16px
Radius:       14px
Label:        0.72rem, UPPERCASE, text-muted
Wert:         DM Mono, 1.05rem, weight 600
```

#### Aktions-Karten (2-Spalten-Grid)

```
Hintergrund:  weiß
Border:       1px solid --border
Padding:      16px
Layout:       Flex column, zentriert
Icon-Box:     40×40px, blau-hell BG, blauer Icon
Label:        0.8rem, text-dim
Hover:        shadow-md, border2
```

#### Buchungs-Item (Liste)

```
Grid:         1fr auto auto (3 Spalten)
Background:   weiß, 1px border
Padding:      12px
Radius:       10px
Hover:        shadow
Datum:        0.78rem, DM Mono
Kategorie:    Chip (surface2 BG)
Notiz:        0.875rem, weight 500
Betrag:       1rem, DM Mono, grün/rot
```

Swipe-to-Delete:
```
Löschen-BG:   76px breite rote Zone, rechts
Threshold:    38px
Transition:   0.2s
```

#### Umlage-Karte

```
Hintergrund:  weiß
Border:       1px solid --border
Padding:      16px
Radius:       14px
Hover:        shadow-md
Erledigt:     72% Deckkraft, linker grüner Rand (4px)
Betrag:       0.88rem, DM Mono, grün
Fortschrittsbalken: 5px, Gold-Füllung, Radius 3px, Transition 0.4s
```

#### Mitglieder-Item

```
Layout:       Flex, gap 12px
Name:         0.9rem, weight 500
Status-Badge: Klein, grün/grau
```

---

### Badges & Chips

#### Kategorie-Chip

```
Größe:        0.68rem, weight 500
Padding:      2px 6px
Hintergrund:  surface2
Border:       1px solid --border
Radius:       4px
Farbe:        text-dim
```

#### Mitglieder-Funktions-Badges

| Funktion | Hintergrund | Textfarbe |
|----------|-------------|-----------|
| Tambourmajor | `#fef3c7` (gelb) | `#92400e` (braun) |
| Vize | `#e0f2fe` (himmelblau) | `#075985` (blau) |
| Kassenwart | `#edf5ea` (grün) | `#0d3d18` (grün) |

Alle: 0.62rem, weight 600, Radius 4px

#### Umlage-Status-Badges

| Status | Stil |
|--------|------|
| Bezahlt | Grüner BG & Text |
| Offen | Orange BG, orange Text, Border |
| Befreit | surface2, text-muted |
| Erledigt | Grüner Check-Badge mit SVG |

---

## 9. Modal & Overlay-System

### Overlay

```
Position:       fixed inset 0
Hintergrund:    rgba(0,0,0,0.4)
Backdrop-filter: blur(2px)
Z-Index:        200
Animation:      fadeIn 0.15s ease
```

### Bottom Sheet

```
Position:       Absolute, unten
Breite:         100%, max 480px
Max-Höhe:       92dvh
Hintergrund:    weiß
Radius:         18px 18px 0 0
Oberer Rand:    1px solid --border
Animation:      slideUp 0.22s ease
Schatten:       --shadow-lg
Handle-Bar:     36×4px grau, oben zentriert
```

**Schließen möglich durch:**
- Klick auf Overlay
- Escape-Taste
- X-Button (oben rechts)

### Modal-Header

```
Padding:        8px 16px
Border-bottom:  1px
Titel:          1rem, weight 700
Schließen:      Icon-Button
```

### Modal-Body

```
Layout:         Flex column, gap 16px
Overflow-y:     auto
Padding:        16px + safe-area bottom
```

---

## 10. Seiten-Layouts

### Setup-Seite

```
Layout:   Zentriert, max 400px
Padding:  32px 16px
Card:     Flex column, zentriert
Icon:     2.5rem, zentriert
Titel:    1.7rem, weight 700, letter-spacing -0.03em
Sub:      0.875rem, zentriert, text-muted
Info-Box: Blau-hell BG, blauer Border, 0.85rem, line-height 1.65
Fehler:   Rot-hell BG, roter Border & Text, Radius 10px
```

### Dashboard-Seite

Sektionen von oben nach unten:
1. Seiten-Header (h1 + Sync-Button)
2. Saldo-Karte (volle Breite)
3. Statistik-Grid (2 Spalten)
4. Aktions-Grid (2 Spalten)
5. Letzten Buchungen oder Leerstand

### Buchungen-Seite

```
Header:     h1 + "+ Neu"-Button
Filter-Bar: Flex, gap 8px, horizontaler Scroll
Liste:      Flex column, gap 2px
```

### Einstellungen-Seite

```
Sektionen:   Flex column, gap 24px
Sektion-Box: Weiß, 1px border, Radius 14px
Titel:       0.72rem, UPPERCASE, surface2 BG, Padding, Border-Bottom
Items:       Flex space-between, 13px Padding, border-bottom
Letztes Item: kein border
```

---

## 11. Leer- & Feedback-Zustände

### Leerstand (Empty State)

```
Text-align:   center
Padding:      32px 16px
Farbe:        text-muted
Größe:        0.875rem
Line-height:  1.9
```

### Lade-Zustand

```
Spinner:    SVG, spin-Animation (0.8s linear infinite)
Texte:      "Synchronisiere…", "Komprimiere…", "Lädt…"
```

### Fehler-Zustand

```
Hintergrund:  #fef2f2
Border:       1px solid #fecaca
Farbe:        #b91c1c
Radius:       10px
Padding:      12px
Größe:        0.83rem
```

### Info/Erfolgs-Zustand

```
Hintergrund:  #edf5ea
Border:       1px solid #b6d4a8
Farbe:        #0d3d18
Padding:      16px
Radius:       14px
```

---

## 12. Animationen & Übergänge

### Keyframe-Animationen

| Name | Dauer | Easing | Verwendung |
|------|-------|--------|------------|
| `fadeIn` | 0.15s | ease | Overlay-Einblenden |
| `slideUp` | 0.22s | ease | Bottom Sheet |
| `splash-logo-in` | 0.75s | cubic-bezier | Splash Logo |
| `splash-text-in` | 0.45s | ease | Splash Texte |
| `splash-progress` | 2s | cubic-bezier | Splash Ladebalken |
| `spin` | 0.8s | linear infinite | Lade-Spinner |

### Standard-Transitions

```css
transition: color 0.12s, background 0.12s, border-color 0.12s, box-shadow 0.12s;
```

### Fokus-Zustände (Accessibility)

```css
:focus-visible {
  outline: 2px solid #0d3d18;
  outline-offset: 2px;
}
```

---

## 13. Splash Screen

```
Hintergrund:       #000000
Gesamt-Dauer:      ~2.3 Sekunden
Logo:              200×200px, Einblenden 0.75s
Name:              1.75rem, Vereinsgold, weight 700
Sub-Text:          0.82rem, Gold 75%, UPPERCASE
Name-Verzögerung:  0.4s
Sub-Verzögerung:   0.58s
Fortschrittsbalken: 3px, Gold, 2s → 100%
Ausblenden:        0.4s
```

---

## 14. Beleg-Lightbox

```
Hintergrund:    rgba(0,0,0,0.92)
Schließen-Btn:  40×40px, rgba(255,255,255,0.15), rund, weiß
Bild:           max-width 100%, max-height 85dvh, contain
Hinweis:        Weiß, 50% Deckkraft, unten zentriert
```

---

## 15. PWA-Konfiguration

### Manifest

```json
{
  "name": "TambourWallet",
  "short_name": "TambourWallet",
  "display": "standalone",
  "background_color": "#0d3d18",
  "theme_color": "#0d3d18",
  "lang": "de",
  "orientation": "portrait-primary"
}
```

### iOS-Meta-Tags

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### Service Worker Cache-Strategie

- **Cache First** für statische Vite-Assets (gehashte Dateinamen)
- **Network First** für alles andere
- **Ausgeschlossen:** api.github.com, Google Fonts

---

## 16. Icon-System

### Verwendete Icons

| Bereich | Größe | Stil |
|---------|-------|------|
| BottomNav | 22×22px | Stroke, 2px |
| Buttons | 20×20px | Stroke, 2px |
| Status | 20×20px | Stroke, 2px |

**Stil-Regeln:**
- `stroke: currentColor` (erbt Eltern-Farbe)
- `stroke-linecap: round`
- `stroke-linejoin: round`
- Kein Fill (außer speziellen Aktiv-States)

---

## 17. CSS Custom Properties (vollständige Liste)

```css
:root {
  /* Farben */
  --bg:        #f4f6f2;
  --bg2:       #e8ece3;
  --surface:   #ffffff;
  --surface2:  #eef1ea;
  --border:    #d8ddd2;
  --border2:   #bfc8b8;
  --text:      #111827;
  --text-dim:  #6b7280;
  --text-muted: #9ca3af;

  /* Abstände */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  12px;
  --space-lg:  16px;
  --space-xl:  24px;
  --space-2xl: 32px;

  /* Radien */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;

  /* Schatten */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow:    0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05);

  /* Layout */
  --nav-h:     64px;
  --sat:       env(safe-area-inset-top);
  --sab:       env(safe-area-inset-bottom);
}
```

---

## 18. Tech-Stack

| Kategorie | Technologie |
|-----------|-------------|
| Framework | React 19 |
| Router | React Router DOM 7 |
| Datenbank | IndexedDB (idb 8) |
| Build | Vite 8 |
| Styling | Vanilla CSS (Custom Properties) |
| Deployment | GitHub Pages |

---

## 19. Weiterentwicklungs-Hinweise

### Designprinzipien beibehalten
1. **Keine Farbvariablen ohne Custom Property** – alle neuen Farben als `--variable` definieren
2. **DM Mono bleibt Zahlen-Schrift** – keine numerischen Werte in Inter
3. **Semantische Farben konsistent** – Grün = Einnahme, Rot = Ausgabe, nie umkehren
4. **Touch-Targets ≥ 44px** – alle interaktiven Elemente ausreichend groß
5. **Kein Dark Mode ohne vollständiges Redesign** – aktuell nur Light Theme

### Erweiterbare Bereiche
- **Kategorie-Farben:** Aktuell immer surface2 – könnten kategorienspezifisch werden
- **Chart-Darstellungen:** Dashboard könnte Balken-/Tortendiagramme ergänzen
- **Animationen:** Listenelemente könnten beim Erscheinen animiert werden (staggered)
- **Akzentfarbe:** Das Blau für Aktions-Icons (`action-card`) ist nicht als Variable definiert

### Bestehendes nicht brechen
- `max(16px, 1em)` auf allen Inputs beibehalten (iOS-Zoom-Schutz)
- Safe-Area-Handling auf neuen Seiten / Modals nicht vergessen
- `100dvh` statt `100vh` bei Vollbild-Elementen
- Saldo-Karte bleibt immer auf dunkelgrünem Hintergrund (Markenkern)

---

*Zuletzt aktualisiert: April 2026*
