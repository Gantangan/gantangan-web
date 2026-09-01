import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import { useBooking } from "@/hooks/useBooking";
import { useToast } from "@/components/Toast";
import { formatRupiah } from "@/utils/format";
import { buildWaLink } from "@/services/whatsapp";

const BADGE_VARIANT = { kosong: "kosong", pending: "pending", verifikasi: "verifikasi", terkunci: "terisi" };

const STATUS_FILTERS = [
  { id: "semua", label: "Semua" },
  { id: "pending", label: "Pending" },
  { id: "verifikasi", label: "Verifikasi" },
  { id: "terkunci", label: "Lunas" },
];

export default function AdminBooking() {
  const { categories, board, getHarga, setSlotStatus } = useBooking();
  const showToast = useToast();
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  const allRows = useMemo(() => {
    const list = [];
    categories.forEach((c) => {
      (board[c.id] || []).forEach((slot) => {
        if (slot.status !== "kosong") list.push({ ...slot, catId: c.id, catName: c.name });
      });
    });
    return list;
  }, [categories, board]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((b) => {
      if (statusFilter !== "semua" && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (b.pemilik || "").toLowerCase().includes(q) ||
        (b.burung || "").toLowerCase().includes(q) ||
        (b.hp || "").toLowerCase().includes(q) ||
        (b.kodeBooking || "").toLowerCase().includes(q) ||
        (b.catName || "").toLowerCase().includes(q) ||
        String(b.no).includes(q)
      );
    });
  }, [allRows, query, statusFilter]);

  function terima(b) {
    const confirmed = setSlotStatus(b.catId, b.no, "terkunci");
    showToast("ok", `Nomor ${b.no} (${b.catName}) diterima.`);
    if (confirmed.hp) window.open(buildWaLink(confirmed, b.catName), "_blank");
  }
  function tolak(b) {
    setSlotStatus(b.catId, b.no, "kosong");
    showToast("ok", `Nomor ${b.no} (${b.catName}) dibuka kembali.`);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream">
        Booking ({rows.length}{rows.length !== allRows.length ? ` dari ${allRows.length}` : ""})
      </h1>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, burung, WA, kode..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                statusFilter === f.id ? "border-gold bg-gold/10 text-cream" : "border-border text-textSoft hover:border-inkSoft"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left text-xs text-muted">
              <th className="px-3 py-2">Kode Booking</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2">No</th>
              <th className="px-3 py-2">Peserta</th>
              <th className="px-3 py-2">Burung</th>
              <th className="px-3 py-2">Nominal</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Bukti</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={`${b.catId}-${b.no}`} className="border-b border-border/60">
                <td className="px-3 py-2 font-mono text-xs">{b.kodeBooking || "-"}</td>
                <td className="px-3 py-2">{b.catName}</td>
                <td className="px-3 py-2">{b.no}</td>
                <td className="px-3 py-2">{b.pemilik}</td>
                <td className="px-3 py-2">{b.burung}</td>
                <td className="px-3 py-2">{b.kodeUnik != null ? formatRupiah(getHarga(b.catId) + b.kodeUnik) : "-"}</td>
                <td className="px-3 py-2">
                  <Badge variant={BADGE_VARIANT[b.status]}>{b.status}</Badge>
                </td>
                <td className="px-3 py-2">
                  {b.buktiTransfer ? (
                    <button onClick={() => setPreview(b)} className="text-goldDeep underline">
                      <Eye className="h-4 w-4" />
                    </button>
                  ) : b.catatanTransfer ? (
                    <span className="font-mono text-xs text-blue-300">{b.catatanTransfer}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <Button size="sm" variant="success" onClick={() => terima(b)} className="mr-1">
                    Terima
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => tolak(b)}>
                    Tolak
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-muted">
                  {allRows.length === 0 ? "Belum ada pendaftaran." : "Tidak ada hasil yang cocok. Coba kata kunci lain."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!preview} onOpenChange={(o) => !o && setPreview(null)} title={preview ? `${preview.catName} — No. ${preview.no}` : ""}>
        {preview?.buktiTransfer && <img src={preview.buktiTransfer} alt="Bukti transfer" className="max-h-[50vh] w-full rounded-lg border border-border object-contain" />}
        <div className="mt-4 flex gap-2">
          <Button variant="success" className="flex-1" onClick={() => { terima(preview); setPreview(null); }}>
            Terima
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => { tolak(preview); setPreview(null); }}>
            Tolak
          </Button>
        </div>
      </Modal>
    </div>
  );
}
