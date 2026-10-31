const PLATE_PATTERN = /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/;
const YEAR_MIN = 1950;

/** Require a value in a mandatory text field. */
export function requireText(value: string, message: string): string | null {
  return value.trim() ? null : message;
}

/** Accept a model year between 1950 and next year. */
export function validateYear(value: string): string | null {
  const year = Number(value.trim());
  const max = new Date().getFullYear() + 1;
  if (!/^\d{4}$/.test(value.trim()) || year < YEAR_MIN || year > max) return `Informe um ano entre ${YEAR_MIN} e ${max}, com 4 dígitos.`;
  return null;
}

/** Accept the old and the Mercosul plate formats. */
export function validatePlate(value: string): string | null {
  if (!PLATE_PATTERN.test(value.trim().toUpperCase())) return 'Informe a placa no formato ABC1234 ou ABC1D23.';
  return null;
}

/** Accept a whole number of kilometers, with or without a thousands separator. */
export function validateMileage(value: string): string | null {
  const digits = value.trim().replace(/\./g, '');
  if (!/^\d+$/.test(digits) || Number(digits) > 2000000) return 'Informe a quilometragem só com números, como 38450.';
  return null;
}
