export const HARI_LABEL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const HARI_LOMBA = [0, 4]; // Minggu & Kamis
export const BOOKING_CUTOFF_HARI = 2;

export function isHariLomba(dateStr) {
  if (!dateStr) return false;
  const day = new Date(dateStr + "T00:00:00").getDay();
  return HARI_LOMBA.includes(day);
}

export function isBookingClosed(jadwal, cutoffHari = BOOKING_CUTOFF_HARI) {
  if (!jadwal) return false;
  const eventDate = new Date(jadwal + "T00:00:00");
  const cutoff = new Date(eventDate);
  cutoff.setDate(cutoff.getDate() - Number(cutoffHari));
  cutoff.setHours(23, 59, 59, 999);
  return Date.now() > cutoff.getTime();
}

export function formatTanggalPanjang(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
