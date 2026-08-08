export function formatRupiah(n) {
  return "Rp" + Number(n || 0).toLocaleString("id-ID");
}

export function formatWaNumber(hp) {
  let digits = (hp || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (!digits.startsWith("62") && digits.length > 0) digits = "62" + digits;
  return digits;
}

export function formatMMSS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function slugify(text) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "kategori"
  );
}
