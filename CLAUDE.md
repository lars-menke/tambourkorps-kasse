# TambourWallet — Claude Code Kontext

## Projekt

PWA-Kassenverwaltung für den Tambourkorps. Offline-fähig via IndexedDB + Service Worker, Datenspeicherung in GitHub via API.

Aktuelle Version: siehe `package.json` und `src/constants.js` (beide gleichzeitig anpassen).

## Stack

- React 18, Vite, JavaScript (kein TypeScript)
- **Kein CSS-Modules-System** — alles in `src/index.css` (global, BEM-Klassen)
- Tokens in `src/styles/tokens.css` — nie direkt Farben oder Abstände hardcoden
- Schriften: Figtree (Body), Fira Code (Monospace/Zahlen)
- Deployment: GitHub Pages via GitHub Actions (push auf `main` löst Deploy aus)

## Dateistruktur

```
src/
├── styles/
│   ├── tokens.css        Alle Design-Variablen — Farben, Spacing, Radien, Shadows
│   └── sync-error.css    Styles für den Sync-Fehler-Banner
├── components/           Wiederverwendbare UI-Bausteine
│   ├── AppHeader.jsx     Kopfzeile mit Logo, Name, Version
│   ├── AppShell.jsx      Wurzelstruktur: Header + Content + Nav
│   ├── BottomNav.jsx     Tab-Navigation unten (5 Tabs)
│   ├── BuchungModal.jsx  Buchung anlegen / bearbeiten (vollständiges Formular)
│   ├── BuchungDetailModal.jsx  Buchungsdetail-Ansicht (readonly + Aktionen)
│   ├── VorlagenSheet.jsx Vorlage-Auswahl als Bottom Sheet
│   ├── QuickAddSheet.jsx Schnelleingabe (veraltet, nicht mehr im Dashboard genutzt)
│   ├── UmlageModal.jsx   Umlage anlegen / bearbeiten
│   ├── CategoryChip.jsx  Kategorie-Chip mit Icon und Farbe
│   ├── CategoryDonut.jsx Donut-Diagramm für Kategorieverteilung
│   ├── BalanceCard.jsx   Kassenstand-Karte mit Sparkline
│   ├── Sparkline.jsx     Mini-Liniendiagramm
│   ├── Avatar.jsx        Mitglieder-Avatar mit deterministischer Farbe
│   ├── BelegUpload.jsx   Beleg-Foto-Upload
│   ├── EmptyState.jsx    Leer-Zustand-Anzeige
│   ├── Skeleton.jsx      Skeleton-Loader
│   ├── LockScreen.jsx    Face-ID-Sperrbildschirm
│   ├── SplashScreen.jsx  Ladebildschirm beim App-Start
│   ├── PullToRefresh.jsx Pull-to-Refresh-Wrapper
│   ├── StatusBar.jsx     Sync-Status-Anzeige (Offline / Syncing / Fehler)
│   └── ToastProvider.jsx Toast-Benachrichtigungen
├── pages/
│   ├── DashboardPage.jsx  Übersicht, Schnellaktionen, letzte Buchungen
│   ├── BuchungenPage.jsx  Buchungsliste mit Filter, Sortierung, Swipe-Delete
│   ├── UmlagenPage.jsx    Umlage-Übersicht
│   ├── UmlageDetailPage.jsx  Umlage-Detail mit Zahlungsstatus
│   ├── MitgliederPage.jsx Mitgliederverwaltung
│   ├── KategorienPage.jsx Kategorienverwaltung mit Custom-Feldern
│   ├── EinstellungenPage.jsx  Dark Mode, GitHub, Face ID, Feedback
│   └── SetupPage.jsx      Ersteinrichtung / Onboarding
├── lib/
│   ├── haptics.js        Haptik-Feedback (vibrate API)
│   ├── kategorieMeta.js  Meta-Schema für kategoriespezifische Felder
│   └── webauthn.js       Face-ID / Touch-ID via WebAuthn
├── services/
│   └── db.js             IndexedDB-Wrapper (dbGet, dbGetAll, dbPut, dbDelete)
├── utils/
│   ├── format.js         fmtEur(), roundCents()
│   ├── imageUtils.js     generateId(), todayIso(), Bild-Komprimierung
│   └── sync.js           GitHub-API-Sync (pushStore, pushBeleg, deleteBeleg)
├── hooks/
│   └── useClosingAnimation.js  Exit-Animations-Hook für Modals und Sheets
├── constants.js          CHANGELOG, App-Konstanten, Token-Keys
├── index.css             Globale Styles und Komponenten-CSS (BEM)
└── App.jsx               Router, Theme-Provider, Auth-Gate
```

## CSS-Konventionen

- **Tokens immer aus `tokens.css`** — keine Hardcode-Farben oder -Abstände in index.css
- **BEM-artige Klassen** in index.css: `.block`, `.block__element`, `.block--modifier`
- **Dark Mode** via `[data-theme="dark"]`-Selector in tokens.css — nie in Komponenten prüfen
- **Hover nur mit Maus**: `@media (hover: hover) and (pointer: fine)` — kein Touch-Highlight
- **Tabular Numbers** für alle Geldbeträge: `font-variant-numeric: tabular-nums` + Fira Code
- `font-size: max(16px, 1em)` auf allen Inputs — verhindert iOS-Zoom

## Versions-Regeln

Immer beide Stellen gleichzeitig anpassen:
1. `package.json` → `"version": "x.y.z"`
2. `src/constants.js` → neuen Eintrag oben in `CHANGELOG` einfügen

Schema: PATCH für Bugfixes, MINOR für neue Features.

## Deploy

```bash
npm run build   # muss fehlerfrei durchlaufen
git add ...
git commit -m "..."
git push        # GitHub Actions deployt automatisch auf GitHub Pages
```

## Nicht machen

- Kein Tailwind, keine UI-Libraries (shadcn, MUI, Chakra)
- Keine CSS Modules
- Keine Inline-Styles ausser für dynamische Werte (z.B. Prozentwerte)
- Keine Schatten > `--shadow-md` auf Karten
- Keine Animationen schwerer als `transition: 0.18s`
- Keine neue Abhängigkeit ohne guten Grund
- Keine Kommentare die erklären WAS der Code tut — nur WARUM (Ausnahmen, Workarounds)
