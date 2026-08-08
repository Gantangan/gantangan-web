import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper standar shadcn/ui: gabungkan className kondisional lalu selesaikan
// konflik utility Tailwind (mis. "p-2 p-4" -> "p-4").
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
