export const DEFAULT_CATEGORIES = [
  { id: "murai", name: "Murai Batu", tagColor: "#8B4513" },
  { id: "kacer", name: "Kacer", tagColor: "#1F2937" },
  { id: "lovebird", name: "Lovebird", tagColor: "#16A34A" },
  { id: "cucak", name: "Cucak Hijau", tagColor: "#166534" },
];

export const COLOR_PALETTE = ["#8B4513", "#1F2937", "#16A34A", "#166534", "#B8860B", "#7C3AED", "#B91C1C", "#0E7490"];
export const SLOTS_PER_CATEGORY = 30;
export const SLOT_ROWS_PER_COLUMN = 8; // pola penomoran ular: kolom 1 turun, kolom 2 naik, dst
export const HOLD_MINUTES = 15;
export const HOLD_MS = HOLD_MINUTES * 60 * 1000;
export const HARGA_DASAR = 50000;

export const STATUS_COLOR = {
  kosong: "#22C55E",
  pending: "#EAB308",
  verifikasi: "#3B82F6",
  terkunci: "#EF4444",
};
