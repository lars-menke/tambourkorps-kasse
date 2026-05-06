# TambourWallet — Vollständiges Design- & Funktionskonzept

> **Version:** 1.7.1 · **Stand:** Mai 2026  
> Dieses Dokument beschreibt das vollständige Design- und Funktionssystem der TambourWallet PWA. Es dient als verbindliche Grundlage für alle Weiterentwicklungen.

---

## Inhaltsverzeichnis

1. [Produktübersicht](#1-produktübersicht)
2. [Technische Architektur](#2-technische-architektur)
3. [Datenmodell](#3-datenmodell)
4. [Funktionen & Screens](#4-funktionen--screens)
5. [Designprinzipien](#5-designprinzipien)
6. [Farbsystem](#6-farbsystem)
7. [Typografie](#7-typografie)
8. [Abstands- & Größensystem](#8-abstands---größensystem)
9. [CSS Custom Properties (vollständig)](#9-css-custom-properties-vollständig)
10. [Komponenten-Bibliothek](#10-komponenten-bibliothek)
11. [Interaktionsmuster](#11-interaktionsmuster)
12. [Animationen & Übergänge](#12-animationen--übergänge)
13. [PWA-Konfiguration](#13-pwa-konfiguration)
14. [Weiterentwicklungs-Leitfaden](#14-weiterentwicklungs-leitfaden)

---

## 1. Produktübersicht

**TambourWallet** ist eine Progressive Web App für den Kassenwart eines Tambourkorps. Sie ersetzt eine Papier-Kassenbuchhaltung durch eine mobile-first Lösung mit GitHub als kostenlosem Cloud-Backend.

### Kernfunktionen auf einen Blick

| Funktion | Beschreibung |
|----------|-------------|
| **Kassenbuch** | Einnahmen & Ausgaben mit Belegfotos erfassen |
| **Umlagen** | Sammelzahlungen für Mitglieder verwalten (Feste, Ausflüge) |
| **Mitglieder** | Vereinsmitglieder mit Funktionen pflegen |
| **Sync** | Alle Daten werden via GitHub API geräteübergreifend synchronisiert |
| **Offline** | Vollständig offline nutzbar (IndexedDB + Service Worker) |
| **Belege** | Fotos direkt in der App aufnehmen, komprimiert in GitHub gespeichert |

### Zielgruppe

Ein einzelner Kassenwart, der die App primär auf seinem Smartphone nutzt. Kein Multi-User-Szenario.

### Technische Rahmenbedingungen

- **Datenablage:** Privates GitHub-Repository (`tambourkorps-kasse-data`) des Nutzers
- **Authentifizierung:** GitHub Personal Access Token (PAT), lokal in `localStorage` gespeichert
- **Keine Backend-Infrastruktur:** Alles läuft clientseitig
- **Offline-fähig:** Daten lokal in IndexedDB, Sync bei Verbindung

---

## 2. Technische Architektur

### Tech-Stack

| Schicht | Technologie | Version |
|---------|-------------|---------|
| UI-Framework | React | 19.2.4 |
| Routing | React Router DOM | 7.14.0 |
| Build | Vite | 8.0.4 |
| Lokale DB | IndexedDB via `idb` | 8.0.3 |
| Styling | Vanilla CSS (Custom Properties) | — |
| Deployment | GitHub Pages | — |
| Sprache | Deutsch (de-DE) | Alle Formatierungen |

### Verzeichnisstruktur

```
tambourkorps-kasse/
├── public/
│   ├── manifest.json          # PWA-Manifest
│   ├── sw.js                  # Service Worker
│   ├── favicon.svg
│   ├── icon-192.png, icon-512.png
│   ├── apple-touch-icon.png   # 180×180px für iOS
│   └── logo.PNG               # Vereinslogo (rund, mit Goldrand im Header)
├── src/
│   ├── components/            # Wiederverwendbare UI-Komponenten
│   │   ├── AppHeader.jsx      # Obere Leiste mit Logo & Version
│   │   ├── AppShell.jsx       # Haupt-Layout-Wrapper
│   │   ├── BottomNav.jsx      # Feste untere Navigation (4 Tabs)
│   │   ├── StatusBar.jsx      # Sync-Statusanzeige unter dem Header
│   │   ├── SplashScreen.jsx   # Ladebildschirm beim App-Start
│   │   ├── BuchungModal.jsx   # Buchung anlegen/bearbeiten (Bottom Sheet)
│   │   ├── BuchungDetailModal.jsx  # Buchung-Detailansicht (Bottom Sheet)
│   │   ├── BelegUpload.jsx    # Beleg-Foto hochladen
│   │   └── UmlageModal.jsx    # Umlage anlegen/bearbeiten (Bottom Sheet)
│   ├── pages/                 # Seitenkomponenten (ein Tab = eine Page)
│   │   ├── SetupPage.jsx      # Erstkonfiguration (GitHub-Token)
│   │   ├── DashboardPage.jsx  # Übersicht (Kassenstand, Schnellaktionen)
│   │   ├── BuchungenPage.jsx  # Buchungsliste mit Filter & Swipe-Delete
│   │   ├── UmlagenPage.jsx    # Umlage-Liste mit Fortschrittsbalken
│   │   ├── UmlageDetailPage.jsx  # Einzelne Umlage mit Zahlungsstatus
│   │   ├── MitgliederPage.jsx # Mitgliederverwaltung
│   │   └── EinstellungenPage.jsx # Einstellungen, Kategorien, Feedback
│   ├── services/
│   │   ├── db.js              # IndexedDB CRUD via `idb`
│   │   └── github.js          # GitHub Contents API (lesen/schreiben/löschen)
│   ├── hooks/
│   │   ├── useToken.js        # GitHub-Token aus localStorage
│   │   └── useSync.js         # Sync-State & Trigger
│   ├── utils/
│   │   ├── sync.js            # Sync-Logik (push/pull pro Store + Belege)
│   │   └── imageUtils.js      # Bild-Komprimierung (Canvas, max. 1 MB)
│   ├── constants.js           # Token-Keys, Changelog, Default-Kategorien
│   ├── router.jsx             # React Router Konfiguration
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css              # Gesamte CSS-Datei (~2300 Zeilen)
```

### Datenfluss

```
Nutzer-Aktion
    │
    ▼
IndexedDB (lokal, sofort)
    │
    ├── pushStore() → GitHub API (async, fire-and-forget)
    │
    └── syncAll()  ← manuell oder bei App-Start
         │
         ▼
    SHA-Vergleich:
    gleich  → prüfe ob lokale Daten mehr Einträge haben → ggf. push
    anders  → pull von GitHub → dbReplaceAll()
    neu     → push von lokal → Init-Commit
```

### Sync-Strategie (Race-Condition-Schutz)

Bei jedem Push wird der aktuelle SHA **frisch von GitHub gelesen** bevor geschrieben wird. Das verhindert `409 Conflict`-Fehler bei gleichzeitigen Schreibvorgängen.

---

## 3. Datenmodell

### IndexedDB Stores

| Store | Schlüssel | Beschreibung |
|-------|-----------|-------------|
| `buchungen` | `id` | Alle Kassenbuch-Einträge |
| `mitglieder` | `id` | Vereinsmitglieder |
| `kategorien` | `id` | Buchungskategorien (anpassbar) |
| `umlagen` | `id` | Sammelzahlungen |
| `umlage_status` | `[umlage_id, mitglied_id]` | Zahlungsstatus je Mitglied je Umlage |
| `belege` | `id` | Komprimierte Foto-DataURLs |
| `_meta` | `path` | GitHub-SHAs für Sync (pro Datei) |

### Buchung-Objekt

```js
{
  id:          "b_abc123",         // generateId('b')
  typ:         "einzahlung",       // | "auszahlung"
  betrag:      25.00,              // Float, immer positiv
  datum:       "2026-04-15",       // ISO-Datum (YYYY-MM-DD)
  kategorie_id: "k_umlage",
  kategorie:   "Umlage",          // Anzeigename (denormalisiert)
  notiz:       "Frühlingsfest — Müller, Max",
  beleg_id:    "bel_xyz",         // null wenn kein Beleg
  umlage_id:   "u_789",           // null bei Normal-Buchung
  erstellt:    "2026-04-15T10:00:00.000Z",
  geaendert:   "2026-04-15T10:00:00.000Z",
}
```

### Mitglied-Objekt

```js
{
  id:       "m_abc",
  vorname:  "Max",
  nachname: "Mustermann",
  name:     "Mustermann, Max",    // Für Umlage-Notiz, Abwärtskompatibilität
  funktion: "tambourmajor",       // | "vize" | "kassenwart" | null
  aktiv:    true,
  erstellt: "2026-04-12T...",
  geaendert: "2026-04-15T...",
}
```

### Umlage-Objekt

```js
{
  id:             "u_abc",
  anlass:         "Frühlingsfest 2026",
  betrag_pro_kopf: 15.00,
  faelligkeit:    "2026-04-30",   // null wenn ohne Fälligkeit
  mitglieder_ids: ["m_1", "m_2", ...],
  erstellt:       "2026-04-12T...",
}
```

### Umlage-Status-Objekt

```js
{
  umlage_id:   "u_abc",
  mitglied_id: "m_1",
  status:      "offen",           // | "bezahlt" | "befreit"
  bezahlt_am:  null,              // ISO-String wenn bezahlt
  buchung_id:  null,              // ID der automatisch erstellten Buchung
}
```

### GitHub-Dateistruktur (Data-Repo)

```
tambourkorps-kasse-data/
├── data/
│   ├── buchungen.json
│   ├── mitglieder.json
│   ├── kategorien.json
│   ├── umlagen.json
│   ├── umlage-status.json
│   └── belege/
│       ├── bel_abc.json         # { id, dataUrl }
│       └── bel_xyz.json
```

### Standard-Kategorien (bei Erststart automatisch angelegt)

| ID | Name | Typ |
|----|------|-----|
| `k_umlage` | Umlage | einzahlung |
| `k_spende` | Spende | einzahlung |
| `k_beitrag` | Beitrag | einzahlung |
| `k_ausflug` | Ausflug | auszahlung |
| `k_ausruestung` | Ausrüstung | auszahlung |
| `k_notenmat` | Notenmaterial | auszahlung |
| `k_sonstiges` | Sonstiges | beide |

---

## 4. Funktionen & Screens

### 4.1 Setup-Seite (`/setup`)

**Zweck:** Einmalige Erstkonfiguration mit GitHub-Token

**Felder:**
- GitHub Personal Access Token (Passwort-Feld)
- GitHub-Benutzername (Text)
- Optionales: Daten-Repository-Name (Standard: `tambourkorps-kasse-data`)

**Ablauf:**
1. Token-Validierung über `GET /user` (prüft Login-Name)
2. Benutzername & Token in `localStorage` speichern
3. Weiterleitung zu `/`

**Layout:** Zentrierte Karte (max. 400px), Info-Box mit Anleitung zur Token-Erstellung, Fehler-Box bei ungültigem Token

---

### 4.2 Dashboard (`/`)

**Zweck:** Schnellübersicht über den Kassenstand und letzte Aktivitäten

**Sektionen von oben nach unten:**

**1. Seiten-Header**
- Titel „Übersicht"
- Sync-Button (Pfeil-Icon, dreht sich beim Synchronisieren)

**2. Saldo-Karte** (immer sichtbar)
- Kassenstand = Summe aller Einzahlungen − Summe aller Auszahlungen
- Umlage-Buchungen fließen in die Berechnung ein
- Farbe: Gold positiv, Hellrot negativ

**3. Statistik-Grid** (nur wenn Buchungen vorhanden)
- „Einnahmen" (grün) | „Ausgaben" (rot)
- 2-Spalten-Grid

**4. Aktions-Grid** (immer)
- „Buchung erfassen" → navigiert zu `/buchungen` und öffnet Neu-Modal
- „Mitglieder" → navigiert zu `/mitglieder`

**5. Leerstand** (nur wenn keine Buchungen)
- Erklärender Text mit Handlungsaufforderung

**6. „Zuletzt"-Sektion** (wenn Daten vorhanden)
- Letzte normale Buchung: Datum, Kategorie, Notiz, Betrag — Klick öffnet Detail-Modal in Buchungen
- Letzte Umlage: Anlass, Goldbalken (bezahlt/gesamt) — Klick navigiert zu Umlage-Detail

---

### 4.3 Buchungen (`/buchungen`)

**Zweck:** Vollständige Buchungsliste mit Anlegen, Anzeigen, Bearbeiten, Löschen

**Filter-Leiste:**
- „Alle" | „Einzahlungen" | „Auszahlungen"
- Pill-Buttons, aktiver Filter: grüner Hintergrund

**Listen-Darstellung:**

Normale Buchungen erscheinen als einzelne Zeilen. Umlage-Buchungen werden **gruppenweise** zu einem virtuellen Eintrag zusammengefasst (mit orangem linken Rand und Anzahl-Badge).

**Buchungs-Item (normale Buchung):**
- Datum (DM Mono) + Kategorie-Chip
- Notiz (fettere Schrift)
- Betrag rechts (grün/rot, DM Mono) + ggf. Büroklammer-Emoji für Beleg

**Buchungs-Item (Umlage-Gruppe):**
- Gleiche Struktur, aber:
  - Oranger linker Rand (4px)
  - „Umlage"-Chip + Badge mit Zahlungsanzahl
  - Pfeil-Icon rechts (→ navigiert zu Umlage-Detail)

**Swipe-to-Delete** (nur normale Buchungen):
- Links wischen enthüllt roten Löschen-Button (76px breit)
- Schwellwert: 38px
- Kein Bestätigungsdialog beim Swipe (sofort)

**Detail-Modal:** Klick auf normale Buchung öffnet `BuchungDetailModal` (Bottom Sheet)

**Neu/Bearbeiten:** `BuchungModal` (Bottom Sheet)

---

### 4.4 BuchungModal (Bottom Sheet)

**Felder:**
1. **Typ-Toggle:** Einzahlung | Auszahlung (beeinflusst Kategorie-Filter)
2. **Betrag:** Zentriertes Großfeld (2rem, DM Mono)
3. **Datum:** Date-Input (Standardwert: heutiges Datum)
4. **Kategorie:** Select (nur Kategorien passend zum Typ)
5. **Notiz:** Textarea (optional)
6. **Beleg:** `BelegUpload`-Komponente

**Speichern-Ablauf:**
1. Buchung in IndexedDB speichern (`dbPut`)
2. Beleg komprimieren + lokal speichern + zu GitHub hochladen (`pushBeleg`)
3. Buchungen-Store pushen (`pushStore`)
4. Modal schließen, Liste neu laden

---

### 4.5 BuchungDetailModal (Bottom Sheet)

**Darstellung:**
- **Hero:** Betrag (2.4rem, DM Mono) + Typ-Badge (EINZAHLUNG/AUSZAHLUNG, Pill)
- **Detail-Tabelle:** Datum, Kategorie, Erfasst am
- **Notiz-Box** (wenn vorhanden): eigener Bereich
- **Beleg-Vorschau** (max. 260px): Klick öffnet Lightbox
- **Aktionen:** „Bearbeiten" (öffnet BuchungModal) + „Löschen" (Bestätigungs-Dialog)

**Beleg-Lightbox:**
- Vollbild-Overlay (rgba(0,0,0,0.92))
- Bild `contain`, max. 85dvh
- X-Button oben rechts (40px, halbtransparent weiß, rund)
- Schließen via Klick auf Overlay

---

### 4.6 Umlagen (`/umlagen`)

**Zweck:** Sammelzahlungen anlegen und ihren Einsammel-Fortschritt verfolgen

**Umlage-Karte:**
- Anlass (1rem, weight 600) + ggf. „Erledigt"-Badge (grüner Haken)
- Betrag pro Person (DM Mono, grün) rechts
- Goldener Fortschrittsbalken (bezahlt / (gesamt − befreit))
- Fortschrittstext: „X,XX € von Y,YY €"
- Status-Badges: bezahlt (grün) | offen (orange, gestrichelt) | befreit (grau) | Fälligkeitsdatum (grau)

**Erledigt-Zustand:** 72% Deckkraft, grüner linker Rand (3px), „Erledigt"-Badge

**Neu-Button:** `+ Neu` öffnet `UmlageModal`

---

### 4.7 UmlageModal (Bottom Sheet)

**Felder:**
1. **Anlass:** Text (Pflichtfeld)
2. **Betrag pro Person:** Betrag-Input (DM Mono, groß)
3. **Fälligkeitsdatum:** Date-Input (optional, wird als Buchungsdatum verwendet)
4. **Mitglieder:** Checkbox-Liste (scrollbar, max. 220px) mit „Alle"/"Keine"-Links
5. **Vorschau:** „Gesamt: X Mitglieder · Y,YY €" (grüne Info-Box)

**Speichern-Ablauf:**
1. Umlage in `umlagen`-Store speichern
2. Für jedes ausgewählte Mitglied einen `umlage_status`-Eintrag erstellen (Status: `offen`)
3. Beide Stores pushen

---

### 4.8 Umlage-Detail (`/umlagen/:id`)

**Zweck:** Zahlungsverfolgung per Mitglied

**Header:** Zurück-Button | Anlass-Titel | Bearbeiten-Button | Löschen-Button (rot)

**Summary-Box:**
- Betrag/Person + Fälligkeitsdatum (DM Mono)
- 2-Spalten-Grid: „Gesammelt" (grün) | „Erwartet"
- Goldener Fortschrittsbalken mit Label

**Mitglieder-Liste:**

Jede Zeile: Name | [Befreit] [Bezahlt] [Löschen-Icon]

| Zustand | Visuell |
|---------|---------|
| Offen | Kein grüner Rand, Buttons inaktiv-Stil |
| Bezahlt | Grüner linker Rand (3px), „✓ Bezahlt"-Button aktiv-grün |
| Befreit | 50% Deckkraft, „Befreit"-Button aktiv |

**Bezahlt-Markierung:**
- Erstellt automatisch eine Buchung (`typ: einzahlung`, `umlage_id` gesetzt)
- Rückgängig: Buchung wird gelöscht, Status zurück auf `offen`

**Umlage löschen:**
- Bestätigung: „X Zahlungen vorhanden — OK=löschen, Abbrechen=behalten"
- Behaltene Buchungen werden zu Normal-Buchungen (umlage_id = null)

---

### 4.9 Mitglieder (`/mitglieder`)

**Zweck:** Vereinsmitglieder anlegen, bearbeiten, aktivieren/deaktivieren, löschen

**Sortierung:** Aktive vor Inaktive, dann alphabetisch nach Nachname

**Sektionen:** „Aktiv (N)" | „Inaktiv (N)" mit Zähler-Badge

**Mitglieder-Item:**
- Status-Button (klickbar): „Aktiv" (grün) | „Inaktiv" (grau) — toggelt zwischen beiden
- Name (Nachname, Vorname) + ggf. Funktions-Badge
- Bearbeiten-Icon | Löschen-Icon

**Funktions-Badges:**

| Funktion | Badge-Text | Farbe |
|----------|-----------|-------|
| Tambourmajor | TM | Gelb/Braun |
| Vize | Vize | Himmelblau/Blau |
| Kassenwart | KW | Grün/Dunkelgrün |

**Regel:** Eine Funktion kann nur ein Mitglied gleichzeitig haben. Bei Zuweisung wird die Funktion beim bisherigen Träger entfernt.

**MemberModal (Bottom Sheet):**
- Felder: Nachname (Pflicht), Vorname, Funktion (Select), Status (Toggle, nur beim Bearbeiten)

---

### 4.10 Einstellungen (`/einstellungen` — Tab „Mehr")

**Sektionen:**

**App-Version**
- Versionsnummer (DM Mono) + „Neu"-Badge bei erster Anzeige nach Update
- „Was ist neu?"-Button öffnet Changelog (collapsible)
- Changelog: Versionsnummer + Datum + Liste der Änderungen

**Kategorien**
- Liste aller Kategorien mit Typ-Badge (Einnahme/Ausgabe/Beide)
- „+ Neu"-Button öffnet Inline-Formular (Name + Typ-Select)
- Löschen-Icon pro Kategorie

**Feedback & Wünsche**
- Textarea für Freitext-Feedback
- Wird als `feedback.md` im **App-Repository** (nicht Data-Repo!) gespeichert
- „Anzeigen"-Button zeigt aktuellen Inhalt der Datei (read-only, `DM Mono`)
- „Leeren"-Button setzt die Datei zurück

**Navigation**
- Link zu Mitglieder-Seite

**GitHub-Verbindung**
- Anzeige: Benutzername, Daten-Repository, Token (maskiert als `••••••••`)

**Konto**
- „Token zurücksetzen" → löscht Token + Konfiguration aus localStorage, Weiterleitung zu Setup

---

### 4.11 Beleg-Upload (`BelegUpload`)

**Zustände:**
1. **Leer:** Gestrichelte Box mit Kamera-Emoji, „Beleg hinzufügen", Hinweis zu iOS-Galerie
2. **Vorschau:** Bild (max. 200px Höhe) mit „Entfernen"-Button oben rechts

**Komprimierung:**
- Via `<canvas>` auf max. 1 MB
- Iterativ: Qualitätsstufen 0.7 → 0.5 → 0.3 → 0.15

**iOS-Spezifik:**
- `accept="image/*"` (öffnet Kamera + Galerie)
- `capture`-Attribut nicht verwendet (zu restriktiv)

---

### 4.12 Splash Screen

**Ablauf (ca. 2.3 Sekunden):**

| Zeit | Ereignis |
|------|---------|
| 0ms | Schwarzer Hintergrund |
| 0ms | Logo-Animation startet (scale 0.72→1, fade in, 0.75s) |
| 150ms | Fortschrittsbalken läuft (2s, Gold) |
| 400ms | App-Name einblenden (0.45s, translateY 10px→0) |
| 580ms | Sub-Text einblenden |
| ~2300ms | Fade-Out (0.4s) |

**Styling:**
- Hintergrund: `#000`
- Logo: 200×200px, drop-shadow
- Name: 1.75rem, Vereinsgold, weight 700
- Sub: 0.82rem, Gold 75% Deckkraft, UPPERCASE
- Fortschrittsbalken: 3px, absolute unten mit Safe-Area-Abstand

---

## 5. Designprinzipien

### 1. Vereinsidentität vor allem
Das Farbschema basiert auf den Vereinsfarben (Waldgrün + Gold). Die Saldo-Karte ist immer dunkelgrün — sie ist der visuelle Kern der App und muss diese Farbe behalten.

### 2. Klarheit durch Hierarchie
Zahlen (Beträge) sind immer in DM Mono und stehen visuell im Mittelpunkt. Text-Labels sind bewusst kleiner und gedimmt.

### 3. Mobile-first, kein Desktop-Denken
Max-Width 480px. Touch-Targets ≥ 44px. Keine Hover-only-Interaktionen ohne Touch-Äquivalent.

### 4. Semantische Farbkodierung ist unverhandelbar
- **Grün = Einnahme / positiv / aktiv / bestätigt**
- **Rot = Ausgabe / negativ / Fehler / löschen**
- **Orange = ausstehend / warnung / Umlage offen**
- **Gold = Fortschritt / Branding / Premium**
- **Grau = neutral / inaktiv / sekundär**

Diese Zuordnungen dürfen niemals umgekehrt oder gemischt werden.

### 5. Sparsamkeit bei Animationen
Animationen existieren, um Übergänge verständlich zu machen (Bottom Sheet: slidesUp, Overlay: fadeIn). Keine dekorativen Animationen ohne funktionalen Zweck.

### 6. Kein Dark Mode ohne vollständiges Redesign
Das aktuelle Farbsystem ist auf ein helles Theme ausgelegt. Ein Dark Mode würde alle Farbvariablen erfordern und sollte als eigenständiges Projekt behandelt werden.

---

## 6. Farbsystem

### 6.1 Primärfarben (Marke)

| Name | Hex | Beschreibung |
|------|-----|-------------|
| Vereinsgrün | `#0d3d18` | Primärfarbe, Buttons, Saldo-BG, Theme-Color |
| Vereinsgrün Hover | `#14532d` | Hover-Zustand Primary Button |
| Vereinsgrün Hell | `#edf5ea` | Hintergründe, Info-Boxen, Einnahme-BG |
| Vereinsgrün Border | `#b6d4a8` | Rahmen auf grünem Hintergrund |
| Vereinsgold | `#c9a227` | Splash, Fortschrittsbalken, Saldo-Betrag |
| Vereinsgold Hell | `#fdf8e6` | Hintergrund für Gold-Elemente |
| Vereinsgold Border | `#e8cc7a` | Rahmen auf goldenem Hintergrund / Logo |

> **Hinweis:** Im CSS heißen die Primärfarb-Variablen historisch `--blue` / `--blue-light` / `--blue-mid` — das ist ein Überbleibsel aus der Vorgängerversion und bedeutet inhaltlich „Vereinsgrün". Diese Variablen sollten bei einer Überarbeitung umbenannt werden.

### 6.2 Semantische Farben (Finanzen)

| Name | Hex | Verwendung |
|------|-----|-----------|
| `--green` | `#0d3d18` | Einnahmen, positive Beträge, aktive Status |
| `--green-bg` | `#edf5ea` | Hintergrund für Einnahmen-Elemente |
| `--red` | `#b91c1c` | Ausgaben, negative Beträge, Fehler |
| `--red-bg` | `#fef2f2` | Hintergrund für Ausgaben/Fehler-Elemente |
| Rot-Border | `#fecaca` | Rahmen für Fehler-Boxen |
| `--orange` | `#b45309` | Offene Umlagen, Warnungen |
| Orange-BG | `#fffbeb` | Hintergrund für Warnungs-Elemente |
| Orange-Border | `#fde68a` | Rahmen für Warnungs-Elemente |

### 6.3 Neutralfarben (Oberflächen)

| Variable | Hex | Verwendung |
|----------|-----|-----------|
| `--bg` | `#f4f6f2` | App-Haupthintergrund |
| `--bg2` | `#e8ece3` | Sekundärer Seitenhintergrund |
| `--surface` | `#ffffff` | Karten, Inputs, Modals |
| `--surface2` | `#eef1ea` | Toggle-BG, Chip-BG, Info-Box-BG |
| `--border` | `#d8ddd2` | Standard-Rahmen |
| `--border2` | `#bfc8b8` | Verstärkte Rahmen (Inputs, Hover) |

### 6.4 Textfarben

| Variable | Hex | Verwendung |
|----------|-----|-----------|
| `--text` | `#111827` | Primärer Fließtext, Titel |
| `--text-dim` | `#6b7280` | Labels, sekundärer Text |
| `--text-muted` | `#9ca3af` | Platzhalter, Leerstand, dekoratives |

### 6.5 Funktions-Badge-Farben (Mitglieder)

| Funktion | Hintergrund | Textfarbe |
|----------|-------------|-----------|
| Tambourmajor | `#fef3c7` | `#92400e` |
| Vize | `#e0f2fe` | `#075985` |
| Kassenwart | `#edf5ea` | `#0d3d18` |

---

## 7. Typografie

### 7.1 Schriftfamilien

| Familie | Gewichte | Herkunft | Verwendung |
|---------|----------|----------|-----------|
| **Inter** | 400, 500, 600, 700 | Google Fonts | Alle UI-Texte |
| **DM Mono** | 400, 500 | Google Fonts | Geldbeträge, Datumsangaben, Codes, Versionen |

**Fallback:** `system-ui, sans-serif`

**Basis:** `font-size: 16px` auf `html`, `-webkit-font-smoothing: antialiased`

### 7.2 Typografische Skala

| Rolle | Größe | Gewicht | Familie | Besonderheiten |
|-------|-------|---------|---------|----------------|
| Seiten-H1 | 1.35rem | 700 | Inter | letter-spacing: -0.02em |
| App-Header-Titel | 0.95rem | 700 | Inter | letter-spacing: -0.01em |
| App-Header-Sub | 0.62rem | 500 | Inter | letter-spacing: 0.02em, text-muted |
| Modal-Titel (h2) | 1rem | 700 | Inter | letter-spacing: -0.01em |
| Karten-Titel | 1rem | 600 | Inter | — |
| Body-Text | 0.875rem | 400 | Inter | line-height 1.5–1.65 |
| Sekundärer Text | 0.875rem | 400 | Inter | color: text-dim |
| Form-Label | 0.8rem | 600 | Inter | letter-spacing: 0.01em, color: text-dim |
| Sektion-Label | 0.72rem | 600 | Inter | UPPERCASE, letter-spacing: 0.07–0.1em |
| Badge/Chip | 0.65–0.72rem | 600–700 | Inter | UPPERCASE oder normal |
| Betrag Dashboard | 3rem | 700 | DM Mono | letter-spacing: -0.03em |
| Betrag Detail | 2.4rem | 700 | DM Mono | letter-spacing: -0.03em |
| Betrag Eingabefeld | 2rem | 600 | DM Mono | letter-spacing: -0.02em, zentriert |
| Betrag Statistik | 1.05rem | 600 | DM Mono | — |
| Betrag Listen | 0.95rem | 600 | DM Mono | — |
| Betrag Recent | 1rem | 600 | DM Mono | — |
| Betrag Umlage | 0.88rem | 600 | DM Mono | — |
| Datum in Listen | 0.78rem | 400 | DM Mono | color: text-muted |
| Version-Nummer | 0.9rem | 600 | DM Mono | — |
| StatusBar | 0.75rem | 400 | DM Mono | — |
| Versions-Badge | 0.7rem | 400 | DM Mono | — |

### 7.3 Wichtige Typografie-Regeln

1. **Alle Geldbeträge in DM Mono** — keine Ausnahmen
2. **Alle Datums-Anzeigen in DM Mono**
3. **Sektion-Überschriften in UPPERCASE** mit erhöhtem Letter-Spacing
4. **iOS Zoom-Schutz:** `font-size: max(16px, 1em)` auf allen `input`, `select`, `textarea`
5. Negative Beträge mit `−` (echtes Minus `U+2212`), nicht mit `-`

---

## 8. Abstands- & Größensystem

### 8.1 Spacing-Skala

| Variable | Wert | Typische Verwendung |
|----------|------|---------------------|
| `--space-xs` | 4px | Icon-to-Icon, enge Gaps |
| `--space-sm` | 8px | Icon-Padding, enge Inline-Abstände |
| `--space-md` | 12px | Card-Innenabstand, Standard-Gap |
| `--space-lg` | 16px | Seiten-Padding (seitlich), Standard-Padding |
| `--space-xl` | 24px | Seiten-Padding (oben), Sektions-Abstände |
| `--space-2xl` | 32px | Setup-Seite, große vertikale Abstände |

### 8.2 Border-Radius

| Variable | Wert | Verwendung |
|----------|------|-----------|
| `--r-sm` | 6px | Badge, kleine Buttons, Chips, Löschen-Hover |
| `--r-md` | 10px | Inputs, Buchungs-Items, Filter-Buttons |
| `--r-lg` | 14px | Karten, Settings-Sektionen, Umlage-Karten |
| `--r-xl` | 18px | Saldo-Karte, Bottom Sheet obere Ecken |

### 8.3 Schatten

| Variable | Wert | Verwendung |
|----------|------|-----------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Standard für Listen-Items, Karten |
| `--shadow` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Hover-Zustand Listen |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` | Karten Hover, BottomNav |
| `--shadow-lg` | `0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)` | Saldo-Karte, Bottom Sheet, Splash |

### 8.4 Layout-Konstanten

| Variable | Wert | Beschreibung |
|----------|------|-------------|
| `--nav-h` | 64px | Höhe der BottomNav |
| `--sat` | `env(safe-area-inset-top, 0px)` | iOS Notch oben |
| `--sab` | `env(safe-area-inset-bottom, 0px)` | iOS Home-Indikator unten |

**Max-Width der App:** 480px (`.app-shell`)

---

## 9. CSS Custom Properties (vollständig)

```css
:root {
  /* ── Hintergründe ────────────────────────────── */
  --bg:        #f4f6f2;   /* App-Hintergrund */
  --bg2:       #e8ece3;   /* Sekundärer BG */
  --surface:   #ffffff;   /* Karten, Inputs, Modals */
  --surface2:  #eef1ea;   /* Toggle-BG, Chips, Sektion-Titel */

  /* ── Rahmen ──────────────────────────────────── */
  --border:    #d8ddd2;   /* Standard */
  --border2:   #bfc8b8;   /* Verstärkt (Inputs, Hover) */

  /* ── Primärfarbe (CSS-Name historisch "blue") ── */
  --blue:       #0d3d18;  /* Vereinsgrün — Buttons, aktive Nav */
  --blue-light: #edf5ea;  /* Vereinsgrün hell — Hintergründe */
  --blue-mid:   #b6d4a8;  /* Vereinsgrün Border */

  /* ── Gold ────────────────────────────────────── */
  --gold:        #c9a227;
  --gold-light:  #fdf8e6;
  --gold-border: #e8cc7a;

  /* ── Finanzen ────────────────────────────────── */
  --green:    #0d3d18;    /* Einnahme-Farbe */
  --green-bg: #edf5ea;
  --red:      #b91c1c;    /* Ausgabe-Farbe */
  --red-bg:   #fef2f2;
  --orange:   #b45309;    /* Offene Umlagen */

  /* ── Text ────────────────────────────────────── */
  --text:       #111827;
  --text-dim:   #6b7280;
  --text-muted: #9ca3af;

  /* ── Schatten ────────────────────────────────── */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow:    0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05);

  /* ── Abstände ────────────────────────────────── */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  12px;
  --space-lg:  16px;
  --space-xl:  24px;
  --space-2xl: 32px;

  /* ── Border-Radius ───────────────────────────── */
  --r-sm:  6px;
  --r-md:  10px;
  --r-lg:  14px;
  --r-xl:  18px;

  /* ── Layout ──────────────────────────────────── */
  --nav-h: 64px;
  --sat:   env(safe-area-inset-top,    0px);
  --sab:   env(safe-area-inset-bottom, 0px);
}
```

---

## 10. Komponenten-Bibliothek

### 10.1 AppShell & Layout

```
┌──────────────────────────────┐  ← AppHeader (52px + --sat)
│ [Logo] TambourWallet v1.7.1  │
├──────────────────────────────┤  ← StatusBar (optional, ~30px)
│ ● Synchronisiert             │
├──────────────────────────────┤
│                              │
│        .app-content          │  ← flex:1, overflow-y:auto
│  (padding-bottom: nav+sab)   │
│                              │
├──────────────────────────────┤
│  [▦]  [≡]  [€]  [⋮]         │  ← BottomNav (64px + --sab)
└──────────────────────────────┘
```

### 10.2 AppHeader

```
Höhe:         52px + var(--sat)
Hintergrund:  --surface
Rahmen:       1px solid --border (unten) + --shadow-sm
Padding:      var(--sat) var(--space-lg) 10px

Logo:         34×34px, border-radius 50%, border: 2px solid --gold-border
App-Titel:    0.95rem, weight 700, letter-spacing -0.01em
Sub-Text:     0.62rem, weight 500, text-muted
Versions-Tag: DM Mono, 0.7rem, surface2-BG, 1px border, border-radius 5px
```

### 10.3 StatusBar

| Zustand | Klasse | BG | Farbe | Inhalt |
|---------|--------|----|-------|--------|
| Offline | `--offline` | surface2 | text-dim | „Offline" |
| Syncing | `--syncing` | blue-light | blue | „Synchronisiere…" + Spinner |
| Fehler | `--error` | red-bg | red | Fehlermeldung + Retry-Link |

Schrift: DM Mono, 0.75rem, zentriert

### 10.4 BottomNav

```
Position:     fixed, bottom 0, zentriert, max-width 480px
Höhe:         64px + var(--sab)
Hintergrund:  --surface
Oberer Rand:  1px solid --border + --shadow-md
Z-Index:      100

Items (4):    flex:1, flex-direction:column, zentriert, gap 3px
Icon:         22×22px SVG, currentColor
Label:        0.66rem, weight 500
Inaktiv:      text-muted
Aktiv:        --blue (Vereinsgrün)
```

**Tab-Items:**
- Dashboard (Grid-Icon, Titel „Übersicht")
- Buchungen (Dokument-Icon)
- Umlagen (Währungs-Icon)
- Mehr (Punkte-Menü, Einstellungen)

### 10.5 Buttons

#### `.btn` (Basis)

```
display:        inline-flex, align-items center, gap --space-sm
padding:        10px 16px
border-radius:  --r-md
font-size:      0.875rem
font-weight:    600
transition:     background/box-shadow/opacity 0.12s
```

#### Button-Varianten

| Klasse | BG | Farbe | Border | Besonderheiten |
|--------|----|----|--------|----------------|
| `--primary` | `--blue` | weiß | — | Hover: `#14532d` |
| `--danger` | `--red-bg` | `--red` | 1px `#fecaca` | — |
| `--danger-solid` | `--red-bg` | `--red` | 1px `#fecaca` | Identisch mit --danger |
| `--icon` | none | text-dim | — | Padding 7px, Hover: surface2 BG |
| `--sm` | — | — | — | Padding 6px 12px, Font 0.8rem |
| `--full` | — | — | — | width: 100% |

`disabled`: opacity 0.45, cursor not-allowed

### 10.6 Form-Elemente

#### Standard-Input/Select/Textarea

```
Hintergrund:  --surface
Rahmen:       1px solid --border2
Padding:      11px 12px
Radius:       --r-md
Font-Größe:   max(16px, 1em)   ← iOS-Zoom-Schutz!
Schatten:     --shadow-sm
Fokus:        Rahmen --blue + box-shadow 0 0 0 3px rgba(22,101,52,0.1)
Placeholder:  --text-muted
```

#### `.betrag-input`

```
font-size:    2rem (erzwungen mit !important)
font-family:  DM Mono (erzwungen)
font-weight:  600
text-align:   center
padding:      16px
letter-spacing: -0.02em
```

#### `.type-toggle`

```
Container:    Grid 1fr 1fr, --surface2 BG, 3px Padding, --r-md Radius
Inaktiver Btn: kein BG, text-dim
Aktiv Grün:   --surface BG, --green Text, --shadow-sm
Aktiv Rot:    --surface BG, --red Text, --shadow-sm
Transition:   0.12s
```

#### `.filter-btn`

```
Inaktiv:  --surface BG, --border2 Rahmen, text-dim, Radius 20px
Aktiv:    --blue BG, weiß, kein Rahmen
Padding:  6px 14px
```

### 10.7 Karten

#### `.saldo-card`

```
Hintergrund:  --blue (#0d3d18)
Radius:       --r-xl (18px)
Padding:      24px 24px 32px
Schatten:     --shadow-lg
Textfarbe:    weiß

Label:        0.75rem, UPPERCASE, letter-spacing 0.1em, opacity 0.7
Betrag:       3rem, DM Mono, weight 700, letter-spacing -0.03em
  Positiv:    --gold (#c9a227)
  Negativ:    #fca5a5 (hellrot)
Info-Text:    0.8rem, opacity 0.65
```

#### `.stat-card`

```
Hintergrund:  --surface, 1px --border, --r-lg, --shadow-sm
Padding:      12px 16px
Label:        0.72rem, UPPERCASE, letter-spacing 0.07em, --text-muted
Wert:         DM Mono, 1.05rem, weight 600
  Grün-Variante: --green
  Rot-Variante:  --red
```

#### `.action-card`

```
Hintergrund:  --surface, 1px --border, --r-lg, --shadow-sm
Padding:      16px, flex column, zentriert, gap --space-sm
Hover:        --shadow-md, --border2

Icon-Box:     40×40px, --blue-light BG, --r-lg, --blue Icon-Farbe
Label:        0.8rem, weight 500, text-dim
```

#### `.recent-card`

```
Hintergrund:  --surface, 1px --border, --r-md, --shadow-sm
Padding:      12px, flex column, gap 6px
Hover:        --shadow, --border2
Breite:       100%

Header:       Flex space-between, text-muted (Label + Chevron)
Body:         Flex wrap, gap --space-sm (Datum, Chips, Notiz)
Betrag:       DM Mono, 1rem, grün/rot
Notiz:        0.85rem, weight 500, ellipsis
Datum:        DM Mono, 0.78rem, text-muted

Umlage-Fortschrittsbalken:
  Höhe:       4px, --border BG, overflow hidden
  Füllung:    --gold, Transition 0.3s ease
  Label:      0.75rem, text-dim
```

### 10.8 Listen-Items

#### `.buchung-item`

```
Layout:   Grid 3 Spalten (1fr auto auto), 2 Zeilen
          Zeile 1: Meta | Right (1/3) | Delete (1/3)
          Zeile 2: Notiz | (übergreifend)
Padding:  12px
Rahmen:   1px --border, --r-md
Hover:    --shadow

Meta (Z1, S1):  Datum (DM Mono, 0.78rem) + Kategorie-Chip
Notiz (Z2, S1): 0.875rem, weight 500
Right (Z1-2, S2): Betrag (DM Mono, 0.95rem, grün/rot) + Beleg-Emoji

Umlage-Variante (--umlage):
  border-left: 4px solid --orange
  Hover-BG:    --surface2
  Extra-Badge: 0.65rem, --orange BG, weiß, Radius 10px
```

#### `.umlage-card`

```
Layout:    Flex column, gap --space-md
Padding:   16px, --r-lg, --shadow-sm
Hover:     --shadow-md

Header:    Flex space-between (Anlass | Betrag/Person)
Anlass:    1rem, weight 600
Betrag:    DM Mono, 0.88rem, --green

Fortschrittsbalken:
  Höhe:    5px, --surface2 BG, 1px --border
  Füllung: --gold, Transition 0.4s ease
  Label:   DM Mono, 0.72rem, text-muted

Stats:     Flex wrap, gap --space-sm
  Bezahlt: --green-bg, --green, Padding 3px 8px, Radius 5px
  Offen:   #fffbeb BG, --orange, 1px #fde68a Border
  Befreit: --surface2, text-muted
  Fälligkeit: --surface2, text-dim

Erledigt-Variante:
  opacity: 0.72
  border-left: 3px solid --blue
```

#### `.member-item`

```
Layout:    Flex, gap --space-md, align-items center
Padding:   11px 12px, --r-md, 1px --border

Status-Button (klickbar):
  Aktiv:   --green-bg, --green
  Inaktiv: --surface2, text-dim
  Größe:   0.68rem, weight 600, Radius 5px, Padding 3px 8px

Name:      flex:1, 0.9rem, weight 500
Inaktiv:   Gesamte Zeile opacity 0.5

Edit-Btn:  text-muted → --blue + --blue-light on hover
Delete-Btn: text-muted → --red + --red-bg on hover
```

#### `.umlage-member-item`

```
Ähnlich wie member-item, aber:
  Bezahlt-Variante: border-left 3px solid --green
  Befreit-Variante: opacity 0.5

Aktions-Buttons:
  Base:          --surface2 BG, --border2 Rahmen, text-dim, 0.72rem, Radius --r-sm
  Bezahlt aktiv: --green-bg, #a7f3d0 Rahmen, --green
  Bezahlt hover: --green-bg, --green
  Befreit aktiv: --surface2, text-dim
  Remove hover:  --red-bg, --red
```

### 10.9 Modal-System

#### `.modal-overlay`

```
Position:        fixed inset 0
Hintergrund:     rgba(0,0,0,0.4)
Backdrop-filter: blur(2px)
Z-Index:         200
Animation:       fadeIn 0.15s ease
Layout:          Flex, align-items flex-end, justify-content center
```

#### `.bottom-sheet`

```
Breite:          100%, max-width 480px
Max-Höhe:        92dvh
Hintergrund:     --surface
Radius:          --r-xl --r-xl 0 0
Oberer Rand:     1px solid --border
Animation:       slideUp 0.22s ease
Schatten:        --shadow-lg
Layout:          Flex column, overflow hidden

Handle:          36×4px, --border2, Radius 2px, margin 10px auto 4px
Header:          Flex space-between, padding --space-sm --space-lg, border-bottom
  Titel:         1rem, weight 700, letter-spacing -0.01em
  X-Button:      .btn--icon
Body:            flex:1, overflow-y auto, padding 16px + safe-area bottom
                 Flex column, gap --space-lg
```

**Schließen:**
- Klick auf `.modal-overlay` (außerhalb des Sheets)
- Escape-Taste (Event-Listener)
- X-Button

### 10.10 Detail-Ansicht (BuchungDetailModal)

#### `.detail-hero`

```
Layout:  Flex column, zentriert, gap --space-sm, padding --space-lg 0

Betrag:  DM Mono, 2.4rem, weight 700, letter-spacing -0.03em
  Einzahlung: --green
  Auszahlung: --red

Typ-Badge: 0.8rem, weight 600, Padding 3px 10px, Radius 99px, UPPERCASE
  Einzahlung: --green-bg, --green
  Auszahlung: --red-bg, --red
```

#### `.detail-table`

```
--surface2 BG, 1px --border, --r-lg, overflow hidden

Zeile (.detail-row):
  Flex space-between, Padding 11px --space-lg, border-bottom
  Label:  0.8rem, text-muted, weight 500, flex-shrink 0
  Wert:   0.875rem, --text, text-align right, flex:1
```

#### `.detail-notiz`

```
--surface2 BG, 1px --border, --r-lg, Padding --space-md --space-lg
Label:  0.8rem, text-muted, weight 500
Text:   0.875rem, white-space pre-wrap, line-height 1.55
```

#### `.detail-beleg`

```
Vorschau: max-height 260px, object-fit cover, --r-lg, cursor zoom-in
Lightbox: s. Beleg-Lightbox unten
```

### 10.11 Beleg-Upload (`.beleg-upload`)

```
Border:     1.5px dashed --border2
BG:         --surface2
Padding:    --space-xl
Flex column, zentriert, gap --space-sm

Hover:      border-color --blue, BG --blue-light

Icon:       1.6rem Emoji
Label:      0.85rem, text-dim, weight 500
Hint:       0.72rem, text-muted
```

Vorschau (`.beleg-preview`):
```
Radius:     --r-md, overflow hidden, 1px --border
Bild:       max-height 200px, object-fit cover
Remove-Btn: Absolut top-right, rgba(0,0,0,0.55), weiß
```

### 10.12 Beleg-Lightbox (`.beleg-lightbox`)

```
Position:    fixed inset 0, z-index 9999
BG:          rgba(0,0,0,0.92)
Flex column, zentriert, cursor pointer

X-Button:    40×40px, Absolut top-right (safe area), 
             rgba(255,255,255,0.15), rund, weiß
Bild:        max-width 100%, max-height 85dvh, contain, Radius 4px
Hinweis:     0.8rem, rgba(255,255,255,0.5), margin-top 12px
```

### 10.13 Settings-Komponenten

#### `.settings-section`

```
--surface BG, 1px --border, --r-lg, overflow hidden, --shadow-sm

Sektion-Titel (.settings-section__title):
  0.72rem, UPPERCASE, letter-spacing 0.08em, text-muted
  Padding: --space-md --space-lg
  BG: --surface2, border-bottom: 1px --border

Item (.settings-item):
  Flex space-between, Padding 13px --space-lg, border-bottom
  Letztes Item: kein border

Link-Item (.settings-item--link):
  Vollbreite Button, hover: --surface2 BG
  Font 0.875rem, weight 500
```

### 10.14 Swipe-to-Delete

```
Wrapper:      position relative, overflow hidden, --r-md
Delete-BG:    Absolut rechts, 76px breit, --red
Delete-Btn:   100% des BG, weiß, weiß-Icon

Content:      position relative, z-index 1, will-change transform
  Bei Swipe:  transform translateX(0 bis -76px)
  Schwelle:   -38px → spring auf -76px | sonst zurück auf 0
  Animate:    transition transform 0.2s ease (nur nach touchend)

Kein Click:   Wenn isOpen, Klick auf Content wird geblockt → schließt erst
```

---

## 11. Interaktionsmuster

### Navigation

- **Tab-Navigation** via BottomNav (4 Tabs)
- **Zurück-Navigation** via Icon-Button (← Pfeil) auf Detailseiten
- **Deep-Link vom Dashboard:** `navigate('/buchungen', { state: { openBuchung: ... } })` → öffnet automatisch das Detail-Modal

### Modals öffnen/schließen

```
Öffnen:   State-Variable (show/edit) auf true/Objekt setzen
Schließen:
  a) X-Button → onClose()
  b) Overlay-Klick → `e.target === e.currentTarget && onClose()`
  c) Escape-Taste → `window.addEventListener('keydown', ...)`
```

### Datenmutationen (Muster)

```
1. Lokal speichern: dbPut(store, record)
2. Liste neu laden: load() / setItems(...)
3. Async Push:      pushStore(store, path).catch(console.warn)
   (Fire-and-forget, Fehler werden nur geloggt)
```

### Sync

```
Trigger:  a) Manueller Klick auf Sync-Button (Dashboard)
          b) Nach syncAll() via 'tk-sync-complete'-Event (Custom Event)
          
Alle Pages horchen auf: window.addEventListener('tk-sync-complete', load)
→ Nach Sync werden alle offenen Pages automatisch neu geladen
```

### Formatierung

Alle Geldbeträge:
```js
new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
// → "25,00 €"
```

Datumsanzeige aus ISO-Datum (YYYY-MM-DD):
```js
new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', {
  day: '2-digit', month: '2-digit', year: 'numeric'
})
// → "15.04.2026"  (T12:00:00 verhindert Timezone-Fehler)
```

---

## 12. Animationen & Übergänge

### Keyframe-Animationen

| Name | Dauer | Easing | Verwendung |
|------|-------|--------|-----------|
| `fadeIn` | 0.15s | ease | Modal-Overlay einblenden |
| `slideUp` | 0.22s | ease | Bottom Sheet hochfahren |
| `splash-logo-in` | 0.75s | `cubic-bezier(0.22,1,0.36,1)` | Splash Logo (scale + fade) |
| `splash-text-in` | 0.45s | ease | Splash Name/Sub (translateY 10px→0) |
| `splash-progress` | 2s | `cubic-bezier(0.4,0,0.2,1)` | Splash Ladebalken |
| `spin` | 0.8s | linear infinite | Sync-Spinner in StatusBar/Header |

### Standard-Transitions

```css
/* Buttons, Links, interaktive Elemente */
transition: background 0.12s, color 0.12s, box-shadow 0.12s, border-color 0.12s;

/* Fortschrittsbalken */
transition: width 0.3s ease;   /* Recent-Card */
transition: width 0.4s ease;   /* Umlage-Progress */

/* Chevron in Einstellungen */
transition: transform 0.2s;

/* Swipe-to-Delete */
transition: transform 0.2s ease;   /* nur nach touchend */
```

### Fokus-Zustände (Accessibility)

```css
:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
```

Inputs zusätzlich:
```css
box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.1);
```

---

## 13. PWA-Konfiguration

### Manifest (`public/manifest.json`)

```json
{
  "name": "TambourWallet",
  "short_name": "TambourWallet",
  "description": "Kassenbuch für den Tambourkorps-Schatzmeister",
  "display": "standalone",
  "start_url": "/tambourkorps-kasse/",
  "scope": "/tambourkorps-kasse/",
  "background_color": "#0d3d18",
  "theme_color": "#0d3d18",
  "lang": "de",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "apple-touch-icon.png", "sizes": "180x180", "purpose": "any" },
    { "src": "icon-192.png",          "sizes": "192x192", "purpose": "any" },
    { "src": "icon-512.png",          "sizes": "512x512", "purpose": "any maskable" },
    { "src": "icon.svg",              "sizes": "any",     "purpose": "any maskable" }
  ]
}
```

### HTML-Meta-Tags

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#0d3d18">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### Service Worker Strategie

| Anfrage-Typ | Strategie | Cache-Name |
|-------------|-----------|-----------|
| Statische Vite-Assets (gehashte Namen) | Cache First | `tk-kasse-v6` |
| Alles andere | Network First | `tk-kasse-v6` |
| `api.github.com` | Kein Cache | — |
| Google Fonts | Kein Cache | — |

Service Worker installiert sofort via `skipWaiting()`.

### iOS-Optimierungen

- `viewport-fit=cover` + `env(safe-area-inset-*)` für Notch/Home-Indikator
- `min-height: 100dvh` überall statt `100vh`
- Input `font-size: max(16px, 1em)` — verhindert Auto-Zoom
- `-webkit-text-size-adjust: 100%`
- `-webkit-font-smoothing: antialiased`
- `portrait-primary` im Manifest — sperrt Querformat

---

## 14. Weiterentwicklungs-Leitfaden

### 14.1 Unbedingt beibehalten

| Regel | Begründung |
|-------|-----------|
| `max(16px, 1em)` auf **allen** Inputs | Verhindert iOS-Zoom — globale Regel in index.css |
| `var(--sat)` / `var(--sab)` in Header/Nav | Notch-Unterstützung auf allen iPhones |
| `100dvh` statt `100vh` | Verhindert Layout-Sprünge bei mobiler Browser-UI |
| DM Mono für **alle** Geldbeträge | Kern der visuellen Sprache |
| Semantische Farben (Grün=Einnahme, Rot=Ausgabe) | Darf nie umgekehrt werden |
| Saldo-Karte bleibt dunkelgrün | Markenkern, Erkennungsmerkmal |

### 14.2 Bekannte technische Schulden

| Problem | Beschreibung | Priorität |
|---------|-------------|-----------|
| `--blue` heißt eigentlich Grün | Historische Variable, sollte zu `--primary` / `--brand` umbenannt werden | Mittel |
| Kein Dark Mode | Farbsystem ist light-only, alle Farben hard-coded | Niedrig |
| `confirm()` für Dialoge | Native Browser-Dialoge, kein einheitliches Erscheinungsbild | Mittel |
| Aktionsfarbe (Icon-Hintergrund) nicht als Variable | `action-card__icon` nutzt `--blue-light` (= Vereinsgrün hell) | Niedrig |

### 14.3 Design-Erweiterungen (Ideen)

**Kategorie-Farben:**  
Aktuell haben alle Kategorie-Chips dasselbe Grau (`--surface2`). Kategorien könnten individuelle Farben erhalten (kleine farbige Punkte o.ä.).

**Charts/Statistiken:**  
Das Dashboard könnte um Balken- oder Tortendiagramme erweitert werden. DM Mono für Achsenbeschriftungen, Vereinsgrün/-gold als Primärfarben.

**Animiertes Listen-Erscheinen:**  
Neu geladene Listeneinträge könnten mit `staggered`-Animation erscheinen (jeweils 50ms versetzt).

**Filter-Bar horizontal scrollbar:**  
Bei vielen Kategorien wird die Filter-Bar voll. `overflow-x: auto; white-space: nowrap` wäre eine saubere Lösung.

**Suche in Buchungen:**  
Ein Such-Input über der Filter-Bar würde die Nutzbarkeit bei vielen Einträgen verbessern.

### 14.4 Neue Komponenten entwickeln

Checkliste für neue UI-Elemente:

- [ ] Farbe aus Custom Properties (keine Hard-coded Hex-Werte)
- [ ] `border-radius` aus `--r-*`-Variablen
- [ ] Padding/Gap aus `--space-*`-Variablen
- [ ] Touch-Targets ≥ 44px
- [ ] Hover-States für alle interaktiven Elemente
- [ ] `:focus-visible` funktioniert (kein `outline: none` ohne Alternative)
- [ ] Kein `font-size < max(16px, ...)` auf Inputs
- [ ] Safe Areas berücksichtigt (wenn am Rand des Bildschirms)
- [ ] Responsive innerhalb 320px–480px getestet

### 14.5 CSS-Klassen-Naming-Konvention

Das Projekt nutzt **BEM** (Block Element Modifier):

```
.buchung-item              ← Block
.buchung-item__meta        ← Element
.buchung-item__betrag      ← Element
.buchung-item--umlage      ← Modifier
.buchung-item__betrag--einzahlung  ← Element + Modifier
```

Neue Klassen sollten dieser Konvention folgen.

---

*Dieses Dokument wird mit jeder größeren Feature-Änderung aktualisiert.*  
*Zuletzt aktualisiert: Mai 2026 — v1.7.1*
