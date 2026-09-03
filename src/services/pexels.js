// Cari foto burung otomatis lewat Pexels API (gratis, legal, boleh dipakai komersial).
// Butuh API key gratis dari https://www.pexels.com/api/ — diatur admin di Pengaturan.
export async function fetchBirdPhoto(categoryName, apiKey) {
  if (!apiKey || !categoryName) return null;
  try {
    const query = encodeURIComponent(`${categoryName} burung bird`);
    const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data?.photos?.[0];
    return photo?.src?.large || photo?.src?.medium || null;
  } catch {
    return null;
  }
}
