// Nama Indonesia (kicau mania) sering tidak dikenali situs foto internasional,
// jadi dipetakan dulu ke nama Inggris/ilmiah yang lebih dikenal supaya hasil
// pencarian lebih akurat.
const SPECIES_MAP = [
  { match: /murai/i, query: "White-rumped Shama bird" },
  { match: /kacer/i, query: "Oriental Magpie Robin bird" },
  { match: /love\s*bird|lovebird/i, query: "Lovebird parrot" },
  { match: /cucak\s*hijau|cucak\s*ijo/i, query: "Blue-winged Leafbird" },
  { match: /cucak\s*rowo|cucakrowo/i, query: "Straw-headed Bulbul" },
  { match: /kenari|canary/i, query: "Canary bird yellow" },
  { match: /pleci|kacamata/i, query: "White-eye bird small" },
  { match: /ciblek/i, query: "Prinia bird small" },
  { match: /kolibri|konin/i, query: "Sunbird small bird" },
  { match: /jalak/i, query: "Myna bird black" },
  { match: /kapas\s*tembak/i, query: "Pied Fantail bird" },
  { match: /trucukan/i, query: "Yellow-vented Bulbul" },
  { match: /perkutut/i, query: "Zebra Dove bird" },
  { match: /branjangan/i, query: "Skylark bird" },
];

function resolveSearchQuery(categoryName) {
  const found = SPECIES_MAP.find((s) => s.match.test(categoryName));
  return found ? found.query : `${categoryName} songbird`;
}

// Cari foto burung otomatis lewat Pexels API (gratis, legal, boleh dipakai komersial).
// Butuh API key gratis dari https://www.pexels.com/api/ — diatur admin di Pengaturan.
export async function fetchBirdPhoto(categoryName, apiKey) {
  if (!apiKey || !categoryName) return null;
  try {
    const query = encodeURIComponent(resolveSearchQuery(categoryName));
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
