export const TOKEN_KEY = 'gh_pat';
export const REPO_OWNER_KEY = 'gh_owner';
export const REPO_DATA_KEY = 'gh_data_repo';
export const LAST_SEEN_VERSION_KEY = 'app_last_version';

export const DEFAULT_DATA_REPO = 'tambourkorps-kasse-data';

export const CHANGELOG = [
  {
    version: '2.10.4',
    datum: '2026-05-31',
    aenderungen: [
      'Bugfix: Neue Buchung vom Dashboard oeffnet jetzt das vollstaendige Formular (Datum, Uhrzeit, Kategorie, Notiz, Beleg, Vorlage)',
    ],
  },
  {
    version: '2.10.3',
    datum: '2026-05-29',
    aenderungen: [
      'Animationen: Zeilen-Pop wenn Mitglied als bezahlt markiert wird',
      'Animationen: Fortschrittsbalken springt + Label wechselt auf Alles bezahlt! bei 100%',
      'Animationen: Speichern-Button zeigt Haekchen-Bestaetigung vor dem Schliessen',
      'Animationen: Tastaktiles Scale-Feedback auf allen Action-Buttons',
    ],
  },
  {
    version: '2.10.2',
    datum: '2026-05-28',
    aenderungen: [
      'Codequalitaet: Zentrale Formatierungs-Utility (fmtEur, roundCents)',
      'Stabilitaet: try/catch fuer IndexedDB-Zugriffe in allen Pages',
      'Sicherheit: GitHub-Token in sessionStorage statt localStorage',
      'Sicherheit: Token erst nach erfolgreicher Validierung gespeichert',
      'Bugfix: Belege werden beim Loeschen einer Buchung korrekt mitentfernt',
      'Bugfix: pushStore fuer Vorlagen nach dem Loeschen ergaenzt',
      'Bugfix: useEffect-Dependencies in Modals korrigiert',
      'Bugfix: Sync-Fehler werden sichtbar im Dashboard angezeigt',
    ],
  },
  {
    version: '2.10.1',
    datum: '2026-05-28',
    aenderungen: [
      'Umlagen: Umgelegten Betrag pro Mitglied individuell anpassbar',
      'Umlagen: Buchung wird bei nachtraeglicher Betragsaenderung automatisch aktualisiert',
    ],
  },
  {
    version: '2.10.0',
    datum: '2026-05-19',
    aenderungen: [
      'Vorlagen: Buchungen als Vorlage merken (im Formular und in der Detailansicht)',
      'Vorlagen: Vorlage nutzen — neues Schnellaktions-Feld oeffnet Vorlage-Auswahl',
      'Vorlagen: Antippen belegt das Schnellerfassungs-Sheet vor',
      'Vorlagen: Wischen oder Loeschen-Button entfernt Vorlagen aus der Liste',
    ],
  },
  {
    version: '2.9.0',
    datum: '2026-05-19',
    aenderungen: [
      'Design: Figtree und Fira Code — neue Schriften fuer Body und Zahlen',
      'Design: Sheets und Modals schliessen jetzt mit Exit-Animation (180 ms)',
      'Design: Hover-Effekte nur noch mit Maus — kein haengendes Highlight auf Touch',
      'Design: Skeleton-Ladeanimation gleichmaessig (kein Pulsieren mehr)',
      'Design: Alle Animationen vollstaendig unter "Bewegung reduzieren" abgedeckt',
    ],
  },
  {
    version: '2.8.0',
    datum: '2026-05-18',
    aenderungen: [
      'Dashboard: Bento Grid — Einnahmen und Ausgaben nebeneinander, Schnellaktionen als horizontale Karten',
      'Navigation: Aktiver Tab mit Pill-Hinterlegung (iOS-Stil)',
      'Alle Seiten: Large Title scrollt weg und taucht kompakt in der Kopfzeile auf',
      'Buchungen: Einträge nach Datum gruppiert mit Tages-Netto pro Gruppe',
      'Design: Aktiv-Zustände (Tippen) auf Karten und Buttons überall konsistent',
      'Design: Animationen deaktiviert wenn "Bewegung reduzieren" aktiviert ist',
    ],
  },
  {
    version: '2.7.0',
    datum: '2026-05-17',
    aenderungen: [
      'Buchungen: Sortierung nach eingetragenem Datum (Uhrzeit der Anlage als Fallback)',
      'Buchungen: Manuelle Sortierung per Drag & Drop (Sortierung "Manuell")',
    ],
  },
  {
    version: '2.6.0',
    datum: '2026-05-17',
    aenderungen: [
      'Dashboard: Letzte Buchung zeigt Meta und Notiz wie in der Buchungsliste',
      'Dashboard: Kategorie-Donut per Swipe zwischen Ausgaben und Einnahmen wechselbar',
      'Buchungen: Neuer Tab "Saldo" — monatlicher Saldo-Verlauf',
    ],
  },
  {
    version: '2.5.0',
    datum: '2026-05-15',
    aenderungen: [
      'Sicherheit: App mit Face ID / Touch ID sperren (WebAuthn, plattformeigen)',
      'Sperrbildschirm erscheint nach dem Splash wenn Face ID aktiviert ist',
      'Einstellungen: Face ID unter "Sicherheit" aktivieren und deaktivieren',
      'Kategorien: Benutzerdefinierte Felder werden in Buchungsliste und Detailansicht angezeigt',
    ],
  },
  {
    version: '2.4.2',
    datum: '2026-05-15',
    aenderungen: [
      'Buchungsliste: Notiz-Text immer grau — Metafelder kursiv, Notiz normal',
    ],
  },
  {
    version: '2.4.1',
    datum: '2026-05-15',
    aenderungen: [
      'Buchungsformular: Scroll funktioniert wieder korrekt (CSS-Konflikt behoben)',
      'Buchungsliste: Notiz und Kategorie-Infos (Ort, Spender, Strecke) werden gemeinsam angezeigt',
      'Kategorien: Zusatzfelder pro Kategorie in den Einstellungen konfigurierbar',
    ],
  },
  {
    version: '2.4.0',
    datum: '2026-05-15',
    aenderungen: [
      'Buchungen: Kategorie-spezifische Zusatzfelder (Spende: Spendername, Getränke/Essen: Ort + Trinkgeld, Taxi: Von/Nach)',
      'Trinkgeld: wird automatisch auf den Gesamtbetrag addiert, Aufschlüsselung in Detailansicht',
      'Spendername, Ort und Strecke werden in der Buchungsliste und Detailansicht angezeigt',
      'Detailansicht: Uhrzeit wird jetzt neben dem Datum angezeigt',
    ],
  },
  {
    version: '2.3.0',
    datum: '2026-05-15',
    aenderungen: [
      'Buchungen: Sortierung wählbar (Neueste, Älteste, Höchster/Niedrigster Betrag)',
      'Buchungsliste: mehr Abstand zwischen Einträgen für bessere Lesbarkeit',
      'Dashboard: Kassenstand-Kurve mit glatten Kurven und Verlaufsfüllung',
    ],
  },
  {
    version: '2.2.1',
    datum: '2026-04-21',
    aenderungen: [
      'Dark Mode: Umlage-Chip, Zahlungen-Badge und "Offen"-Status verwenden jetzt korrekte Dark-Mode-Farben',
    ],
  },
  {
    version: '2.2.0',
    datum: '2026-04-21',
    aenderungen: [
      'Kategorien: Farbe wählbar (10 Vorschläge + eigene Farbe), Vorschau im Modal',
      'Kategorien: Eingebaute Kategorien erhalten automatisch Icon und Farbe beim ersten Start',
      'Kategorie-Chips: Farbe und Symbol aus den Einstellungen werden überall angezeigt',
      'Scroll: Pull-to-Refresh erkennt jetzt den richtigen Scroll-Container (kein falsches Auslösen mehr)',
      'Scroll: overscroll-behavior korrigiert, sanfteres Scrollverhalten auf iOS',
      'Einstellungen: Feedback-Bereich ganz nach unten verschoben',
    ],
  },
  {
    version: '2.1.1',
    datum: '2026-04-21',
    aenderungen: [
      'Seitentitel "Mehr" auf "Einstellungen" korrigiert',
      'App-Header und Titelzeilen beim Scrollen fixiert (Scroll-Architektur korrigiert)',
      'Kategorie-Symbole werden jetzt aus den Einstellungen übernommen und synchronisiert',
    ],
  },
  {
    version: '2.1.0',
    datum: '2026-04-20',
    aenderungen: [
      'Dark Mode: Farbwechsel funktioniert jetzt korrekt',
      'Titelzeile aller Seiten ist beim Scrollen fixiert',
      'Kategorien-Verwaltung als eigene Seite mit Symbol-Auswahl und Bearbeiten-Funktion',
      'Reiter "Mehr" heißt jetzt "Einstellungen"',
    ],
  },
  {
    version: '2.0.0',
    datum: '2026-04-20',
    aenderungen: [
      'Dark Mode: Auto/Hell/Dunkel wählbar in den Einstellungen',
      'Neues Design: Token-System, semantische Farben, konsistente Abstände',
      'Dashboard: Kassenstand-Karte mit Sparkline und Monatsvergleich',
      'Dashboard: Ausgaben-Donut nach Kategorie',
      'Kategorie-Chips mit Icons in Buchungslisten',
      'Mitglieder-Avatare mit deterministischer Farbe',
      'Schnell-Erfassen: Bottom Sheet direkt vom Dashboard',
      'Toast-Meldungen mit Rückgängig-Funktion beim Löschen',
      'Pull-to-Refresh auf Dashboard und Buchungen',
      'Onboarding: Schritt-für-Schritt-Einrichtung',
      'PWA-Shortcuts: Lange drücken auf App-Icon für Einnahme/Ausgabe',
    ],
  },
  {
    version: '1.7.1',
    datum: '2026-04-17',
    aenderungen: [
      'App-Symbol: Stilisierter Adlerkopf in Gold auf Vereinsgrün',
      'Alle Icon-Varianten neu generiert (192px, 512px, Apple Touch Icon)',
      'Manifest + Theme-Color auf Vereinsgrün (#0d3d18) aktualisiert',
      'Portrait-Modus: Drehen des iPhones gesperrt',
    ],
  },
  {
    version: '1.7.0',
    datum: '2026-04-17',
    aenderungen: [
      'Design: Farbschema auf Vereinsfarben abgestimmt (Waldgrün + Gold)',
      'Splash Screen: Vereinslogo + goldener Fortschrittsbalken',
      'App-Header: Vereinslogo als rundes Icon mit Goldrand',
      'Umlagen: Fortschrittsbalken in Vereinsgold',
    ],
  },
  {
    version: '1.6.8',
    datum: '2026-04-17',
    aenderungen: [
      'Umlagen: erledigte Umlagen werden mit grünem „Erledigt"-Badge gekennzeichnet',
    ],
  },
  {
    version: '1.6.7',
    datum: '2026-04-17',
    aenderungen: [
      'Übersicht: Saldo berücksichtigt Umlage-Zahlungen korrekt',
    ],
  },
  {
    version: '1.6.6',
    datum: '2026-04-17',
    aenderungen: [
      'Übersicht: „Zuletzt"-Sektion mit letzter Buchung und letzter Umlage',
    ],
  },
  {
    version: '1.6.5',
    datum: '2026-04-17',
    aenderungen: [
      'Umlagen: Bearbeiten-Funktion (Anlass, Betrag, Fälligkeit)',
      'Umlagen: Teilnehmer einzeln aus Umlage entfernen',
      'Einstellungen: Feedback-Ansicht ohne Bearbeiten oder Löschen',
    ],
  },
  {
    version: '1.6.4',
    datum: '2026-04-15',
    aenderungen: [
      'Buchungen: Links wischen öffnet roten Löschen-Button',
    ],
  },
  {
    version: '1.6.3',
    datum: '2026-04-15',
    aenderungen: [
      'Buchungen: Umlage-Eintrag mit orangem Rand, Badge in der Kopfzeile sichtbar',
      'Buchungen: Zurück-Button aus Umlage-Detail führt wieder zur Buchungsliste',
      'Umlagen: Löschen fragt ob Buchungen mitgelöscht oder als Einzelbuchungen behalten werden',
      'Einstellungen: Feedback-Datei per Button leeren',
    ],
  },
  {
    version: '1.6.2',
    datum: '2026-04-15',
    aenderungen: [
      'Buchungen: Umlage-Zahlungen werden zu einem Eintrag zusammengefasst',
      'Buchungen: Klick auf Umlage-Eintrag öffnet die Umlage-Detailansicht',
    ],
  },
  {
    version: '1.6.1',
    datum: '2026-04-15',
    aenderungen: [
      'Mitglieder: Bearbeiten-Funktion hinzugefügt',
      'Mitglieder: Vor- und Nachname getrennt, Sortierung nach Nachname',
      'Mitglieder: Funktionen Tambourmajor, Vize, Kassenwart mit Badge',
    ],
  },
  {
    version: '1.6.0',
    datum: '2026-04-15',
    aenderungen: [
      'Umlage: Fälligkeitsdatum wird als Buchungsdatum verwendet',
      'Sync: Race-Condition bei gleichzeitigen Pushes behoben (kein stiller 409-Fehler mehr)',
    ],
  },
  {
    version: '1.5.9',
    datum: '2026-04-15',
    aenderungen: [
      'Feedback wird im App-Repository gespeichert (direkt lesbar für Entwicklung)',
    ],
  },
  {
    version: '1.5.8',
    datum: '2026-04-15',
    aenderungen: [
      'Feedback-Modul in den Einstellungen: Notizen und Wünsche direkt in GitHub speichern',
    ],
  },
  {
    version: '1.5.7',
    datum: '2026-04-15',
    aenderungen: [
      'Detailansicht: "Erfasst am" und alle Zeilen auch bei Beleg sichtbar',
    ],
  },
  {
    version: '1.5.6',
    datum: '2026-04-15',
    aenderungen: [
      'Detailansicht scrollt korrekt: Datum/Kategorie immer sichtbar',
      'Beleg-Vorschau auf max. 260px begrenzt, Vollbild per Lightbox',
    ],
  },
  {
    version: '1.5.5',
    datum: '2026-04-15',
    aenderungen: [
      'Notiz in Detailansicht: eigener Bereich unabhängig vom Beleg',
    ],
  },
  {
    version: '1.5.4',
    datum: '2026-04-15',
    aenderungen: [
      'Beleg-Lightbox: Tippen öffnet Vollbild-Overlay statt neuen Tab',
      'iOS Notch: App-Header und Navigation berücksichtigen Safe Area',
      'Detailansicht: Bemerkungen werden korrekt neben dem Beleg angezeigt',
    ],
  },
  {
    version: '1.5.3',
    datum: '2026-04-14',
    aenderungen: [
      'Belege werden nach GitHub synchronisiert (geräteübergreifend)',
      'Fehlender Beleg wird automatisch von GitHub nachgeladen',
    ],
  },
  {
    version: '1.5.2',
    datum: '2026-04-14',
    aenderungen: [
      'Buchungen: Detailansicht vor dem Bearbeiten',
      'Detailansicht zeigt Betrag, Datum, Kategorie, Notiz und Beleg',
      'Bearbeiten und Löschen nur über die Detailansicht',
    ],
  },
  {
    version: '1.5.1',
    datum: '2026-04-14',
    aenderungen: [
      'Splashscreen beim App-Start: Logo-Animation + Fortschrittsbalken',
    ],
  },
  {
    version: '1.5.0',
    datum: '2026-04-14',
    aenderungen: [
      'App umbenannt: TambourWallet',
      'Neues App-Symbol: Wallet-Icon (grün/weiß)',
    ],
  },
  {
    version: '1.4.1',
    datum: '2026-04-14',
    aenderungen: [
      'Browser-Icon: PNG-Favicon erzwingt grünes Symbol im Tab',
    ],
  },
  {
    version: '1.4.0',
    datum: '2026-04-14',
    aenderungen: [
      'Kategorien in Einstellungen verwaltbar (anlegen, löschen)',
      'Beleg-Upload: Foto oder Datei aus Galerie wählbar (iOS)',
      'App-Symbol für Windows/PC: 512×192px PNG ergänzt',
    ],
  },
  {
    version: '1.3.8',
    datum: '2026-04-13',
    aenderungen: [
      'App-Symbol überarbeitet: Trommel im Emoji-Stil (🥁)',
    ],
  },
  {
    version: '1.3.7',
    datum: '2026-04-13',
    aenderungen: [
      'App-Header: Euro-Zeichen durch Trommel-Symbol ersetzt',
    ],
  },
  {
    version: '1.3.6',
    datum: '2026-04-13',
    aenderungen: [
      'App-Symbol: Trommel mit Schlägeln statt Euro-Zeichen',
      'App-Symbol: grüner Hintergrund (Vereinsfarbe)',
      'iOS: apple-touch-icon.png hinzugefügt (180×180)',
    ],
  },
  {
    version: '1.3.5',
    datum: '2026-04-13',
    aenderungen: [
      'iOS: Zoom beim Anlegen von Mitgliedern behoben',
    ],
  },
  {
    version: '1.3.4',
    datum: '2026-04-13',
    aenderungen: [
      'iOS: Service Worker erzwingt App-Update bei nächstem Start',
      'iOS: Zoom bei Eingabefeldern global behoben (alle Formulare)',
    ],
  },
  {
    version: '1.3.3',
    datum: '2026-04-13',
    aenderungen: [
      'App-Symbol und Theme-Farbe auf Grün umgestellt',
      'Titel auf "Kasse" vereinfacht',
      'Blaue Button-Hover-Farben auf Grün korrigiert',
      'iOS: Automatisches Zoomen bei Eingabefeldern behoben',
    ],
  },
  {
    version: '1.3.2',
    datum: '2026-04-13',
    aenderungen: [
      'Vereinsfarbe Grün als Primärfarbe eingeführt',
    ],
  },
  {
    version: '1.3.1',
    datum: '2026-04-13',
    aenderungen: [
      'Sync: Löschungen werden auf allen Geräten übernommen',
      'Sync: 409-Fehler auf neuen Geräten behoben',
      'Seiten aktualisieren sich automatisch nach dem Sync',
      'Service Worker: altes Layout-Problem behoben',
    ],
  },
  {
    version: '1.3.0',
    datum: '2026-04-12',
    aenderungen: [
      'Professionelles Light Theme (Banking-Design)',
      'App-Header mit Logo und Versionsanzeige',
      'Versionstracker mit Changelog',
    ],
  },
  {
    version: '1.2.0',
    datum: '2026-04-12',
    aenderungen: [
      'Umlagen-System: Betrag pro Person, Mitglieder auswählen',
      'Zahlungsstatus je Mitglied (offen / bezahlt / befreit)',
      'Bezahlt-Markierung erstellt automatisch eine Buchung',
      'Fortschrittsanzeige pro Umlage',
    ],
  },
  {
    version: '1.1.0',
    datum: '2026-04-12',
    aenderungen: [
      'Buchungsformular: Einzahlung & Auszahlung erfassen',
      'Belegfotos: Kamera oder Datei, Komprimierung auf max. 1 MB',
      'Mitgliederverwaltung: anlegen, aktiv/inaktiv, löschen',
      'Buchungsliste mit Filter und Bearbeitungsfunktion',
    ],
  },
  {
    version: '1.0.0',
    datum: '2026-04-12',
    aenderungen: [
      'Grundgerüst: React + Vite PWA',
      'GitHub-API-Integration für Datenspeicherung',
      'Offline-fähig via IndexedDB + Service Worker',
      'GitHub Actions Deploy auf GitHub Pages',
    ],
  },
];
