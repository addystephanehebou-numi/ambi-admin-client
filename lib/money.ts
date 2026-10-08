/**
 * A dollar amount as a money input shows it: always two decimals ("12.50"),
 * since Postgres numerics arrive as plain numbers (12.5). Empty or
 * non-numeric text is left as typed, for validation to report.
 */
export function toMoneyInput(value: number | string | null | undefined): string {
  if (value == null || value === '') return '';
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : String(value);
}
