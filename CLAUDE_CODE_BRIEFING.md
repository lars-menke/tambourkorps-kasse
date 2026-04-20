# Claude Code Briefing, TambourWallet Design-Update v2

> **Lies dieses Dokument zuerst.** Es definiert, wie du mit `DESIGN_UPDATE.md` umzugehen hast. `DESIGN_UPDATE.md` ist die **Spezifikation** (Was soll gebaut werden), dieses Dokument ist die **Arbeitsanweisung** (Wie sollst du arbeiten). Bei Widersprüchen gilt dieses Briefing vor der Spezifikation.

---

## 1. Deine Rolle

Du bist als ausführender Entwickler für ein Design-Refresh einer bestehenden, funktionierenden React/Vite-PWA beauftragt. Der Verein nutzt die App produktiv, die Codebase ist vom Projektinhaber (Lars, Kassenwart) selbst geschrieben und gepflegt. Dein Auftrag ist ein Refresh, **keine Neuentwicklung**. Respektiere den bestehenden Code.

**Dein wichtigster Grundsatz:** Im Zweifel weniger ändern, nicht mehr. Wenn etwas bereits funktioniert und nicht explizit in `DESIGN_UPDATE.md` adressiert wird, fass es nicht an.

---

## 2. Pflicht-Lektüre vor dem ersten Commit

Bevor du auch nur eine Zeile Code schreibst:

1. Lies `DESIGN_CONCEPT.md` vollständig, damit du den Ist-Stand kennst
2. Lies `DESIGN_UPDATE.md` vollständig, zweimal
3. Lies diese Datei zuende
4. Verschaffe dir einen Überblick über die Projektstruktur (`src/` durchgehen, nicht nur Dateinamen, kurz reinschauen)
5. Starte die App lokal (`npm run dev`), klicke dich einmal komplett durch, damit du weißt, wie die App aktuell funktioniert

Erst danach beginnst du mit Phase 1.

---

## 3. Arbeitsweise: eine Phase nach der anderen

`DESIGN_UPDATE.md` Abschnitt 19 definiert 10 Migrationsschritte in 3 Phasen. **Halte diese Reihenfolge strikt ein.** Keine Abkürzungen, keine parallelen Arbeiten, kein "das ziehe ich eben mit rein, passt thematisch".

**Für jeden der 10 Schritte gilt:**

### 3.1. Ablauf pro Schritt

1. **Briefing-Check:** Lies den betreffenden Abschnitt aus `DESIGN_UPDATE.md` nochmals durch
2. **Plan-Schritt:** Beschreibe in einem kurzen Kommentar (3 bis 5 Bullets, im Chat an Lars), was du konkret zu tun planst. Warte auf "ok".
3. **Branch:** Lege einen Feature-Branch an: `design/phase{N}-{kurzname}`, z.B. `design/phase1-tokens` oder `design/phase2-categories`
4. **Implementierung:** Arbeite den Schritt ab
5. **Self-Check:** Prüfe gegen die Akzeptanzkriterien in Abschnitt 20 von `DESIGN_UPDATE.md`
6. **Manual-Test:** Starte die App, klicke dich durch alle Seiten, teste in Light **und** Dark Mode (sobald Phase 1 durch ist)
7. **Commit & Push:** Konventionelle Commits (siehe Abschnitt 5)
8. **Report an Lars:** Kurzes Status-Update (siehe Abschnitt 8)
9. **Warten:** Bevor du den nächsten Schritt startest, holst du Lars' Freigabe ein

### 3.2. Keine Überspringen-Regel

Wenn du bei Schritt 4 feststellst, dass Schritt 2 unvollständig war, gehst du **zurück** zu Schritt 2. Du baust nicht "Workarounds" in Schritt 4, um eine unvollständige Phase zu kompensieren.

---

## 4. Technische Leitplanken

### 4.1. Dependencies

Die einzige **neue** Dependency, die ohne Rückfrage erlaubt ist: `lucide-react` (in `DESIGN_UPDATE.md` Abschnitt 3.1 vorgesehen).

**Jede weitere neue Dependency muss vorher mit Lars abgestimmt werden.** Auch wenn es verlockend erscheint: keine Animation-Libraries, keine Chart-Libraries, keine Form-Libraries, keine Utility-Libraries.

Besonders: **Keine Motion/Framer Motion, kein Recharts, kein react-spring.** Die Animationen und Charts in `DESIGN_UPDATE.md` sind bewusst als eigene, minimale Lösungen spezifiziert.

### 4.2. Vorhandenes Token-System

Wenn du einen Hex-Wert im Code siehst, der nicht in `DESIGN_UPDATE.md` Abschnitt 2.1 vorkommt, frag nach. Erfinde keine neuen Farben. Fehlende Tokens werden als Frage an Lars zurückgespielt, nicht stillschweigend ergänzt.

### 4.3. CSS-Ansatz

Das Projekt nutzt Vanilla CSS mit Custom Properties. **Das bleibt so.** Kein Tailwind, keine CSS-in-JS, keine CSS-Modules, kein PostCSS-Trickrepertoire. Die neuen Komponenten folgen dem bestehenden Stil: klassenbasiert, BEM-nah, Tokens statt Hex.

### 4.4. TypeScript

Types immer explizit, keine `any` außer in klar begründeten Ausnahmen (z.B. dynamischer Icon-Lookup in `CategoryChip.tsx`, dort mit Kommentar). `strict` bleibt an.

### 4.5. Bundle-Budget

Die App läuft auf älteren Smartphones im Proberaum. Das Bundle darf durch dieses Update **nicht mehr als 25 KB gzipped** wachsen. `lucide-react` ist tree-shakeable, importiere nur was du brauchst:

```ts
// RICHTIG
import { TrendingUp, Drum, Music } from 'lucide-react';

// FALSCH
import * as Icons from 'lucide-react';
```

Die Ausnahme in `CategoryChip.tsx` für dynamischen Lookup ist okay, dort bleibt es beim Sternchen-Import und wird über die Kategorie-Liste begrenzt.

Nach Phase 2 und Phase 3 jeweils `npm run build` laufen lassen und die Bundle-Größe im Report mitschicken.

### 4.6. IndexedDB-Schema

Das bestehende Schema **nicht verändern**. Wenn das Kategorie-System (Abschnitt 3 von `DESIGN_UPDATE.md`) ein neues Feld braucht, wird das additiv ergänzt (optionales Feld, mit Migration für Bestandsdaten). Bestehende Buchungen dürfen beim Migrieren nicht verloren gehen. **Niemals** ein destruktives Schema-Update ohne Backup-Hinweis an Lars.

---

## 5. Git-Workflow

### 5.1. Branches

Ein Branch pro Migrationsschritt, nicht pro Phase. 10 Schritte = 10 Branches = 10 Pull Requests oder Merges.

Namensschema: `design/phase{N}-{kurzname}`

Beispiele:
- `design/phase1-tokens`
- `design/phase1-darkmode`
- `design/phase2-categories`
- `design/phase2-dashboard-redesign`

### 5.2. Commit-Konvention

Conventional Commits, auf Deutsch für Kommunikation, Englisch für Code-Begriffe:

```
feat(tokens): Basis-Paletten und semantische Tokens einführen
feat(theme): Dark Mode mit System-Präferenz und manuellem Toggle
refactor(styles): Hex-Werte auf semantische Tokens umstellen
feat(categories): CategoryChip mit Icon und Akzentfarbe
feat(dashboard): Sparkline und Delta in BalanceCard
feat(a11y): Fokus-Ring für Dark Mode anpassen
fix(skeleton): Shimmer pausiert bei prefers-reduced-motion
```

Kein Emoji-Prefix. Keine Co-Author-Footer. Keine 80-Zeichen-Romane in der Body, kurze Zusammenfassung reicht.

### 5.3. Keine Force-Pushes auf main

Selbstverständlich, aber zur Sicherheit erwähnt. `main` ist tabu, außer für Merges nach Freigabe.

---

## 6. Code-Qualität

### 6.1. Bestehender Stil bleibt

Schau dir 2 bis 3 bestehende Komponenten an, bevor du neue schreibst. Übernimm:
- Import-Reihenfolge
- Prop-Typisierung
- File-Header-Kommentare (oder deren Abwesenheit)
- Export-Stil (named vs default)

### 6.2. Linter

Wenn ein ESLint/Prettier vorhanden ist, `npm run lint` vor jedem Commit. Kein Einchecken mit Errors. Warnings sind okay, sollten aber nicht zunehmen.

### 6.3. Kommentare

Sparsam, aber vorhanden, wo Code nicht selbsterklärend ist. Vor allem bei:
- Der deterministischen Hash-Funktion in `Avatar.tsx`
- Der Sparkline-Koordinatenberechnung
- Der VisualViewport-Logik für das Quick-Add Sheet
- Der iOS-Zoom-Schutz-Regel `max(16px, 1em)`

### 6.4. Keine Debug-Reste

Kein `console.log`, kein `TODO: fix this later`, kein `// eslint-disable` ohne Begründung. Kein auskommentierter Code.

### 6.5. Accessibility-Pflichten

Pro neuer Komponente prüfen:
- Interaktive Elemente haben `aria-label` oder sichtbaren Text
- Fokus-Reihenfolge sinnvoll
- `:focus-visible` führt zu sichtbarem Ring
- Icons ohne Bedeutung sind `aria-hidden="true"`

Das ist nicht optional, das ist Teil der Akzeptanzkriterien.

---

## 7. Testing

### 7.1. Manuelles Testen

Pro Migrationsschritt mindestens:
- Dashboard, Buchungen, Umlagen, Einstellungen durchklicken
- Alle Modals einmal öffnen und schließen
- Mindestens eine Buchung neu anlegen und löschen (Undo testen)
- Light und Dark Mode (ab Phase 1)
- Mobile-Viewport im Browser (375×812 iPhone, 360×800 Android)

### 7.2. Was passieren muss, bevor du "fertig" sagst

- App startet ohne Konsolen-Error
- Service Worker registriert sich fehlerfrei
- `npm run build` läuft durch
- Bundle-Größe im Budget (siehe 4.5)
- Alle in diesem Schritt betroffenen Akzeptanzkriterien aus Abschnitt 20 der `DESIGN_UPDATE.md` abgehakt

### 7.3. Regressionen

Wenn du bei einem Schritt feststellst, dass eine bisherige Funktion nicht mehr geht, ist das eine **Regression**. Regressions-Fixes haben Vorrang vor allem anderen. Erst zurück zum Ursprung, dann weiter.

---

## 8. Kommunikation mit Lars

### 8.1. Report-Format nach jedem Schritt

Schreibe Lars nach Abschluss jedes der 10 Migrationsschritte einen kurzen Report in folgendem Format:

```
Schritt {N} abgeschlossen: {Kurzname}

Branch: design/phase{N}-{kurzname}
Commits: {Anzahl}
Geänderte Dateien: {Anzahl}

Was ist passiert:
- {Stichpunkt}
- {Stichpunkt}
- {Stichpunkt}

Auffälligkeiten / Abweichungen vom Plan:
- {entweder: "Keine" oder konkrete Abweichung mit Begründung}

Bundle-Größe vorher/nachher: {nur in Phase 2 und 3 nötig}

Nächster Schritt: {Name des nächsten Schritts}
Bereit zum Mergen?
```

### 8.2. Wann du rückfragen sollst

Frag zurück bei:
- Fehlenden Tokens (siehe 4.2)
- Unklarem Verhalten der bestehenden App (du weißt nicht, wie Feature X aktuell funktioniert)
- Schema-relevanten Fragen zur IndexedDB
- Abweichungen in Kategorien-Liste (Abschnitt 3.1 von `DESIGN_UPDATE.md` ist ein Vorschlag, Lars hat ggf. eigene Wünsche)
- Illustrationen für Empty States (Abschnitt 12): Lars liefert diese, du implementierst nur das Komponenten-Gerüst. Wenn keine SVGs da sind, frag nach.

### 8.3. Wann du nicht rückfragen sollst

Nicht rückfragen bei:
- Namen von CSS-Klassen, Variablen, Funktionen (entscheide nach bestehendem Stil)
- Kleineren Umbau-Entscheidungen, die dem Token-System und der Spezifikation entsprechen
- Bundle-Splitting, Lazy-Loading von Routen (mach es sinnvoll, musst du nicht absegnen lassen)

### 8.4. Tonalität

Direkt, knapp, ohne übertriebene Höflichkeit. Keine Gedankenstriche in langer Form, keine Entschuldigungen für Nachfragen, kein "Ich habe erfolgreich…". Stattdessen: "Schritt X ist durch. Folgendes ist passiert, folgendes fiel mir auf."

---

## 9. Was definitiv **nicht** zu deinem Auftrag gehört

Klare Ausschlüsse, damit keine Missverständnisse entstehen:

- **Kein Redesign der Vereinsidentität.** Grün bleibt grün, Gold bleibt gold. Logo wird nicht ersetzt.
- **Kein Refactoring außerhalb der Design-Themen.** Wenn dir auffällt, dass `SyncEngine.ts` unelegant geschrieben ist, ist das nicht dein Thema in diesem Auftrag.
- **Keine Feature-Erweiterungen.** Du baust kein neues Feature, das nicht in `DESIGN_UPDATE.md` steht, auch wenn es "naheliegend" wäre.
- **Kein Austausch der Tech-Stack-Entscheidungen.** React 19, Vite 8, IndexedDB via idb, Vanilla CSS bleiben. Nichts davon wird hinterfragt.
- **Keine Tests hinzufügen**, wenn bisher keine da sind. Wenn welche da sind, aktuell halten.
- **Kein CI/CD-Umbau.** GitHub Pages bleibt Deployment-Ziel.
- **Keine Analytics, keine Telemetrie, kein Tracking.**

---

## 10. Bei Problemen

### 10.1. Wenn du nicht weiterkommst

Nach spätestens 20 Minuten sinnlosem Probieren: Stopp, beschreibe das Problem an Lars, liefere drei konkrete Lösungsoptionen mit Vor- und Nachteilen. Kein stundenlanges Brute-Force.

### 10.2. Wenn du einen Fehler in der Spezifikation findest

`DESIGN_UPDATE.md` ist nicht fehlerfrei. Wenn du beim Umsetzen merkst, dass eine CSS-Regel nicht aufgeht, ein Token-Name falsch ist, oder eine Code-Snippet nicht kompiliert: melden, nicht stillschweigend korrigieren. Lars entscheidet dann, ob das Dokument oder die Implementierung angepasst wird.

### 10.3. Wenn du etwas kaputt gemacht hast

Sofort melden. Nicht verstecken, nicht "wollte ich danach fixen". Rollback auf letzten funktionierenden Commit, dann ehrlich berichten, was passiert ist.

### 10.4. Wenn Lars etwas verlangt, das diesem Briefing widerspricht

Lars' Anweisungen gehen vor diesem Dokument. Wenn er sagt "mach mal kurz X, auch wenn es nicht im Plan steht", dann machst du X. Dieses Briefing ist ein Rahmen für den Normalfall, kein Gesetz gegen Lars' Wünsche.

---

## 11. Erfolgskriterium für den Gesamtauftrag

Das Projekt ist abgeschlossen, wenn:

- Alle 10 Migrationsschritte gemerged sind
- Alle Akzeptanzkriterien aus Abschnitt 20 der `DESIGN_UPDATE.md` erfüllt sind
- Die App in Light und Dark Mode fehlerfrei läuft
- Bundle-Wachstum ≤ 25 KB gzipped
- Keine bestehenden Features regredieren
- `DESIGN_CONCEPT.md` auf den neuen Stand aktualisiert ist (ergänzt, nicht neu geschrieben)
- Ein kurzer CHANGELOG-Eintrag existiert

**Nicht abgeschlossen ist es**, wenn eine Teilfunktion "halb da" ist. Entweder ein Schritt ist fertig oder er zählt nicht.

---

## 12. Kurzform (zum Ausdrucken)

Wenn du dich in drei Sätzen orientieren willst:

1. Lies `DESIGN_CONCEPT.md` und `DESIGN_UPDATE.md`, arbeite die 10 Schritte aus Abschnitt 19 strikt der Reihe nach ab, einer pro Branch.
2. Pro Schritt: kurzer Plan an Lars, Umsetzung, Self-Check gegen Akzeptanzkriterien, Manual-Test, Commit nach Konvention, Report an Lars, Freigabe abwarten.
3. Keine neuen Dependencies außer `lucide-react`, kein Refactoring außerhalb des Designs, kein Overengineering, bei Unsicherheit rückfragen statt raten.

---

*Erstellt: April 2026 | Gehört zu: DESIGN_UPDATE.md | Lesezeit: ~8 Minuten*
