export const HARI_LABEL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const HARI_LOMBA = [0, 4]; // Minggu & Kamis

export function isHariLomba(dateStr) {
  if (!dateStr) return false;
  const day = new Date(dateStr + "T00:00:00").getDay();
  return HARI_LOMBA.includes(day);
}

export function isBookingClosed(tutupPendaftaran) {
  if (!tutupPendaftaran) return false;
  return Date.now() > new Date(tutupPendaftaran).getTime();
}

export function formatTanggalWaktu(dateTimeStr) {
  return new Date(dateTimeStr).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTanggalPanjang(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
