/**
 * Formatiert einen Geldbetrag als Euro-String (de-DE).
 * Zentrale Utility — wird in allen Komponenten und Pages verwendet.
 */
export function fmtEur(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}

/**
 * Rundet einen Geldbetrag auf zwei Nachkommastellen (Cent-genau).
 * Verhindert Fliesskomma-Akkumulationsfehler bei Summen.
 */
export function roundCents(n) {
  return Math.round((n ?? 0) * 100) / 100;
}
