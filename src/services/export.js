import { formatRupiah } from "@/utils/format";

export function buildExportRows(categories, board, getHarga) {
  const rows = [];
  categories.forEach((c) => {
    (board[c.id] || []).forEach((slot) => {
      if (slot.status === "kosong") return;
      rows.push({
        Kategori: c.name,
        "No. Gantangan": slot.no,
        Peserta: slot.pemilik,
        Burung: slot.burung,
        Email: slot.ownerEmail || "-",
        "No. HP": slot.hp || "-",
        Nominal: slot.kodeUnik != null ? getHarga(c.id) + slot.kodeUnik : "-",
        Status: slot.status,
        "Waktu Pesan": slot.bookedAt ? new Date(slot.bookedAt).toLocaleString("id-ID") : "-",
      });
    });
  });
  return rows;
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(rows) {
  if (rows.length === 0) return { ok: false, error: "Belum ada data untuk diekspor." };
  const headers = Object.keys(rows[0]);
  const escapeCell = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escapeCell(r[h])).join(","))];
  const content = "\uFEFF" + lines.join("\r\n");
  const tanggal = new Date().toISOString().slice(0, 10);
  downloadBlob(content, `pendaftaran-gantangan-${tanggal}.csv`, "text/csv;charset=utf-8;");
  return { ok: true };
}

export function exportExcel(rows) {
  if (rows.length === 0) return { ok: false, error: "Belum ada data untuk diekspor." };
  const headers = Object.keys(rows[0]);
  const esc = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const tableRows = rows.map((r) => `<tr>${headers.map((h) => `<td>${esc(r[h])}</td>`).join("")}</tr>`).join("");
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"></head><body><table border="1">` +
    `<tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${tableRows}</table></body></html>`;
  const tanggal = new Date().toISOString().slice(0, 10);
  downloadBlob(html, `pendaftaran-gantangan-${tanggal}.xls`, "application/vnd.ms-excel;charset=utf-8;");
  return { ok: true };
}

export function exportPDF(rows) {
  if (rows.length === 0) return { ok: false, error: "Belum ada data untuk diekspor." };
  const headers = Object.keys(rows[0]);
  const esc = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const tableRows = rows.map((r) => `<tr>${headers.map((h) => `<td>${esc(r[h])}</td>`).join("")}</tr>`).join("");
  const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laporan Pendaftaran Gantangan</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
      h1 { font-size: 18px; margin-bottom: 2px; }
      p { font-size: 11px; color: #666; margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 14px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 10.5px; text-align: left; }
      th { background: #2A2620; color: #fff; }
      tr:nth-child(even) { background: #f7f5f0; }
    </style></head>
    <body>
      <h1>Laporan Pendaftaran Gantangan</h1>
      <p>Dicetak pada ${tanggal} • ${rows.length} pendaftaran</p>
      <table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${tableRows}</tbody></table>
      <script>window.onload = () => { window.print(); };</script>
    </body></html>`;
  const win = window.open("", "_blank");
  if (!win) return { ok: false, error: "Pop-up diblokir browser. Izinkan pop-up untuk export PDF." };
  win.document.write(html);
  win.document.close();
  return { ok: true };
}

export { formatRupiah };
