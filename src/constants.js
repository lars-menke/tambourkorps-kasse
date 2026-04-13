export const TOKEN_KEY = 'gh_pat';
export const REPO_OWNER_KEY = 'gh_owner';
export const REPO_DATA_KEY = 'gh_data_repo';
export const LAST_SEEN_VERSION_KEY = 'app_last_version';

export const DEFAULT_DATA_REPO = 'tambourkorps-kasse-data';

export const CHANGELOG = [
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
