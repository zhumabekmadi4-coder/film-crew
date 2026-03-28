import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Russian pluralization: plural(5, "участник", "участника", "участников") → "5 участников" */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const lastDigit = abs % 10;
  if (abs > 10 && abs < 20) return `${n} ${many}`;
  if (lastDigit > 1 && lastDigit < 5) return `${n} ${few}`;
  if (lastDigit === 1) return `${n} ${one}`;
  return `${n} ${many}`;
}

/** Capitalize first letter: "астана" → "Астана" */
export function capitalizeCity(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
