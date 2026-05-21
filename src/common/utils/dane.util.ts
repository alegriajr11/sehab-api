/**
 * Normaliza código DANE: solo dígitos y relleno con ceros a la izquierda.
 */
export function normalizeCodigoDane(
  value: string,
  maxLength: number,
): string {
  const digits = value.replace(/\D/g, '');
  return digits.padStart(maxLength, '0').slice(-maxLength);
}

export const DANE_DEPARTAMENTO_LENGTH = 5;
export const DANE_MUNICIPIO_LENGTH = 8;
