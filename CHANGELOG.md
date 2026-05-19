# Changelog

## v2.9.0 — 2026-05-19

- **Design: Typografie** — Figtree (Body) und Fira Code (Zahlen/Betraege) ersetzen Plus Jakarta Sans und DM Mono; Fira Code mit slashed zero fuer Finanzzahlen
- **Design: Animationen** — Sheet und Modal oeffnen per CSS-Transition (`@starting-style`) statt Keyframe; Schliessen mit 180ms Exit-Animation
- **Design: Hover** — Alle Hover-Effekte nur noch auf Geraeten mit Zeiger aktiv (`pointer: fine`); kein haengendes Highlight auf Touch
- **Design: Shimmer** — Skeleton-Ladeanimation laeuft jetzt gleichmaessig (`linear` statt `ease-in-out`)
- **Design: Reduzierte Bewegung** — Splash, Toast, Skeleton und alle Sheets werden von `prefers-reduced-motion` abgedeckt
- **Design: Kleinigkeiten** — Splash-Logo startet von `scale(0.88)` statt `scale(0.72)`; Filter-Buttons geben beim Tippen jetzt skalierendes Feedback

## v2.8.0 — 2026-05-18

- **Dashboard: Bento Grid** — Einnahmen und Ausgaben nebeneinander, Schnellaktionen als horizontale Karten mit Icon links und Label rechts
- **Navigation: Pill-Indikator** — Aktiver Tab erhält eine subtile Pill-Hinterlegung (iOS-Stil)
- **Large Title** — Alle vier Tabs (Übersicht, Buchungen, Umlagen, Mitglieder) haben eine scrollbare Großüberschrift, die sich beim Scrollen in die Kopfzeile einklappt
- **Buchungen: Datumsgruppen** — Einträge nach Datum gruppiert mit Netto-Saldo pro Tag; Datumsangabe in der Zeile entfällt
- **Design: Aktiv-Zustände** — Tippen auf Karten, Buttons und Listeneinträge gibt durchgehend konsistentes visuelles Feedback
- **Accessibility: Reduced Motion** — Animationen werden automatisch reduziert wenn "Bewegung reduzieren" in den Systemeinstellungen aktiviert ist

## v2.7.0 — 2026-05-17

- **Buchungen: Datum-Sortierung** — Sortierung nach eingetragenem Datum (Uhrzeit der Anlage als Fallback)
- **Buchungen: Drag & Drop** — Manuelle Reihenfolge per Drag & Drop (Sortierung "Manuell")

## v2.6.0 — 2026-05-17

- **Dashboard** — Letzte Buchung zeigt Meta-Felder und Notiz wie in der Buchungsliste
- **Dashboard** — Kategorie-Donut per Swipe zwischen Ausgaben und Einnahmen wechselbar
- **Buchungen** — Neuer Tab "Saldo" mit monatlichem Saldo-Verlauf

## v2.5.0 — 2026-05-15

- **Sicherheit** — App mit Face ID / Touch ID sperren (WebAuthn, plattformeigen)
- Sperrbildschirm erscheint nach dem Splash wenn Face ID aktiviert ist
- **Einstellungen** — Face ID unter "Sicherheit" aktivieren und deaktivieren
- **Kategorien** — Benutzerdefinierte Felder werden in Buchungsliste und Detailansicht angezeigt

## v2.4.x

- **2.4.2** — Buchungsliste: Notiz-Text immer grau, Metafelder kursiv
- **2.4.1** — Buchungsformular: Scroll-Fix; Notiz und Kategorie-Infos gemeinsam; Zusatzfelder konfigurierbar
- **2.4.0** — Kategorie-spezifische Zusatzfelder (Spende, Getränke/Essen, Taxi); Trinkgeld-Berechnung; Detailansicht mit Uhrzeit

## v2.3.0 — 2026-05-15

- **Buchungen** — Sortierung wählbar (Neueste, Älteste, Höchster/Niedrigster Betrag)
- **Dashboard** — Kassenstand-Kurve mit glatten Kurven und Verlaufsfüllung

## v2.2.0 — 2026-04-21

- **Kategorien** — Farbe wählbar (10 Vorschläge + eigene Farbe)
- Eingebaute Kategorien erhalten automatisch Icon und Farbe beim ersten Start
- Kategorie-Chips zeigen Farbe und Symbol überall in der App
- Pull-to-Refresh und Scroll-Verhalten auf iOS verbessert

## v2.1.0 — 2026-04-21

- Dark Mode funktioniert korrekt
- Titelzeile aller Seiten beim Scrollen fixiert
- Kategorien-Verwaltung als eigene Seite

## v2.0.0 — 2026-04-20

- Dark Mode: Auto / Hell / Dunkel
- Neues Design: Token-System, semantische Farben
- Dashboard: Kassenstand-Karte mit Sparkline und Monatsvergleich, Ausgaben-Donut
- Schnell-Erfassen als Bottom Sheet direkt vom Dashboard
- Toast-Meldungen mit Rückgängig-Funktion beim Löschen
- Pull-to-Refresh, PWA-Shortcuts, Onboarding

## v1.7.x — 2026-04-17

- App-Symbol: Stilisierter Adlerkopf in Gold auf Vereinsgrün
- Farbschema auf Vereinsfarben (Waldgrün + Gold) abgestimmt
- Splash Screen mit Vereinslogo

## v1.6.x — 2026-04-15 bis 2026-04-17

- Umlagen: Bearbeiten, Teilnehmer entfernen, Erledigt-Badge
- Buchungen: Wisch-Löschen, Umlage-Einträge gebündelt, Detailansicht
- Mitglieder: Vor-/Nachname getrennt, Funktionsbadges (TM, Vize, KW), Bearbeiten

## v1.5.x — 2026-04-14

- App umbenannt: **TambourWallet**
- Splash Screen, Detailansicht mit Belegvorschau, Belege per GitHub synchronisiert

## v1.0.0 bis v1.4.x — 2026-04-12 bis 2026-04-14

- Grundgerüst: React + Vite PWA, IndexedDB, Service Worker
- GitHub-API-Integration für Datenspeicherung und Deployment
- Buchungsformular, Belegfotos, Mitgliederverwaltung, Kategorien, Umlagen-System
