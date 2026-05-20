import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const SPORT_COLORS: Record<string, string> = {
  green: "bg-green-100 text-green-800 border-green-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  red: "bg-red-100 text-red-800 border-red-200",
  cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
  lime: "bg-lime-100 text-lime-800 border-lime-200",
  rose: "bg-rose-100 text-rose-800 border-rose-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
};
