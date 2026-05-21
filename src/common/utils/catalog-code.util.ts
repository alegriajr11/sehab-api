/**
 * Normaliza códigos de catálogo: trim y mayúsculas.
 */
export function normalizeCatalogCode(value: string): string {
  return value.trim().toUpperCase();
}
