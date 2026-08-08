import { useMemo } from "react";
import { FileSpreadsheet, FileText, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/hooks/useBooking";
import { useToast } from "@/components/Toast";
import { formatRupiah } from "@/utils/format";
import { buildExportRows, exportCSV, exportExcel, exportPDF } from "@/services/export";

export default function AdminLaporan() {
  const { categories, board, getHarga } = useBooking();
  const showToast = useToast();

  const perKategori = useMemo(
    () =>
      categories.map((c) => {
        const lunas = (board[c.id] || []).filter((s) => s.status === "terkunci").length;
        return { id: c.id, name: c.name, lunas, total: lunas * getHarga(c.id) };
      }),
    [categories, board, getHarga]
  );
  const totalPendapatan = perKategori.reduce((s, p) => s + p.total, 0);
  const totalLunas = perKategori.reduce((s, p) => s + p.lunas, 0);

  function handleExport(fn) {
    const rows = buildExportRows(categories, board, getHarga);
    const res = fn(rows);
    if (!res.ok) showToast("error", res.error);
    else showToast("ok", "Data berhasil diekspor.");
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Laporan</h1>

      <div className="mt-4 flex flex-wrap gap-6 rounded-card bg-ink p-5 text-cream">
        <div>
          <div className="text-xs text-border">Total Pendapatan (tanpa kode unik)</div>
          <div className="font-display text-2xl font-bold text-gold">{formatRupiah(totalPendapatan)}</div>
          <div className="text-xs text-border">{totalLunas} nomor lunas</div>
        </div>
        <div className="flex flex-col justify-center gap-1 border-l border-inkSoft pl-6 text-sm">
          {perKategori.map((p) => (
            <div key={p.id} className="flex gap-2 text-border">
              <span>{p.name}</span>
              <span>
                {p.lunas}× {formatRupiah(getHarga(p.id))} = {formatRupiah(p.total)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={() => handleExport(exportExcel)}>
          <FileSpreadsheet className="h-4 w-4" /> Excel
        </Button>
        <Button onClick={() => handleExport(exportPDF)}>
          <FileText className="h-4 w-4" /> PDF
        </Button>
        <Button onClick={() => handleExport(exportCSV)}>
          <FileDown className="h-4 w-4" /> CSV
        </Button>
      </div>
    </div>
  );
}
