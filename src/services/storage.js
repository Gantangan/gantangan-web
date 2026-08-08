// Lapisan penyimpanan data.
//
// PENTING buat kamu yang awam: file ini SENGAJA dipisah supaya nanti gampang
// diganti ke Supabase tanpa harus mengubah komponen/halaman lain sama sekali.
// Semua komponen memanggil fungsi di sini (getItem/setItem), bukan langsung
// ke localStorage atau Supabase. Jadi kalau nanti connect ke Supabase, kamu
// (atau saya) cukup ganti ISI file ini, sisanya tetap jalan seperti biasa.
//
// Versi sekarang: pakai localStorage browser (data tersimpan di perangkat
// masing-masing, belum sinkron antar perangkat/peserta - itu alasan utama
// nanti perlu pindah ke Supabase untuk versi produksi sungguhan).

const PREFIX = "gantangan:";

export async function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error("storage.getItem error", key, e);
    return fallback;
  }
}

export async function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("storage.setItem error", key, e);
    return false;
  }
}

export async function removeItem(key) {
  try {
    localStorage.removeItem(PREFIX + key);
    return true;
  } catch (e) {
    return false;
  }
}
