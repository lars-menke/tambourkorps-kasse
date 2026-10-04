# TambourWallet — Review-Empfehlungen (v2.10.3)

## P1 — sollte angegangen werden

### 1. Lint grün bekommen
`npm run lint` schlägt mit 20 Fehlern fehl, alle `react-hooks/set-state-in-effect`.
Betroffen: alle Pages mit dem Muster `useEffect(() => { load(); }, [load])`.
Der neue eslint-plugin-react-hooks v7 toleriert das Mount-Lade-Pattern nicht mehr.
Optionen: gezielt unterdrücken (`// eslint-disable-next-line`) oder Ladelogik umbauen.

### 2. Route-basiertes Code-Splitting
Aktueller Build: ein einziger Chunk, `index-*.js` 429 KB unkomprimiert, alle 8 Pages voraus geladen.
`React.lazy` + `Suspense` im Router (`src/router.jsx`) würde den initialen Load deutlich senken.

```js
// Beispiel router.jsx
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// Jede Page so umstellen, RouterProvider mit <Suspense fallback={<Skeleton />}> wrappen
```

### 3. Fonts selbst hosten
`@import url(fonts.googleapis.com)` in `index.css` Zeile 1 blockiert das Rendering (Request-Waterfall).
Der Service Worker umgeht Google Fonts bewusst — offline gibt es nie Figtree/Fira Code.
Lösung: woff2-Dateien in `/public/fonts/`, `@font-face` lokal deklarieren.
Vorteile: render-blockierfrei, offline-fest, kein Google-Request mit Nutzer-IP (DSGVO).

---

## P2 — wertvoll

### 4. Error Boundary ergänzen
Ein Render-Fehler auf irgendeiner Page whitescreent die ganze App.
Eine `ErrorBoundary`-Klassenkomponente als Top-Level-Wrapper in `main.jsx` kostet ~20 Zeilen.

### 5. PAT-Scope einschränken (Fine-grained Token)
Das Token in localStorage ist die bewusste Entscheidung (sessionStorage bricht PWA-Persistenz).
Der bessere Hebel ist der Scope: *Fine-grained PAT* nur für das Daten-Repo mit `Contents: read/write`.
Falls das Token je per XSS abfließt, bleibt der Schaden auf ein Repo begrenzt.

### 6. Sync: Last-Write-Wins dokumentieren / absichern
`syncStore` überschreibt lokal per `dbReplaceAll` wenn SHA abweicht.
Zwei Geräte im selben Zeitfenster können sich still überschreiben.
Kurzfristig: in der App als bekannte Einschränkung dokumentieren.
Langfristig: `updatedAt`-Timestamp pro Datensatz + serverseitiger Merge.

### 7. Belege in Git-History
Base64-dataURL-JSON-Blobs committen: +33 % Größe, bleibt ewig in der History.
Überlegung: separater `belege`-Branch ohne History-Aufbau, oder echte Binärdateien statt JSON.

---

## P3 — Detail

### 8. `index.css` aufteilen
3594 Zeilen — verletzt die eigene 500-Zeilen-Regel aus CLAUDE.md.
`tokens.css` und `sync-error.css` sind schon ausgelagert, konsequent weiter nach Domäne aufteilen
(z.B. `dashboard.css`, `buchungen.css`, `modals.css`, `sheets.css`).

### 9. Fira Code als Zahlen-Schrift überdenken
Fira Code ist eine Programmierschrift mit Ligaturen — funktioniert für Monospacing, wirkt aber „techy".
Alternativen mit ruhigerem Charakter und echten Tabular-Figures: IBM Plex Mono, Roboto Mono.
Subjektiv — kein Muss, wenn der Look gewollt ist.

---

## Empfohlene Reihenfolge

1. Lint grün (P1.1)
2. Fonts selbst hosten (P1.3) — Performance + Offline + Datenschutz
3. Route-Code-Splitting (P1.2)
4. Error Boundary (P2.4)
5. Fine-grained PAT erneuern (P2.5) — reine Token-Neuausstellung, kein Code
