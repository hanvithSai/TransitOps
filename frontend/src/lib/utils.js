import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format fuel volume for display — up to 4 decimal places, trailing zeros trimmed. */
export function formatFuelLiters(value) {
  if (value == null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

/** Liters with unit suffix, or em dash when empty. */
export function formatFuelLitersDisplay(value, unit = 'L') {
  const formatted = formatFuelLiters(value);
  return formatted != null ? `${formatted} ${unit}` : '—';
}
