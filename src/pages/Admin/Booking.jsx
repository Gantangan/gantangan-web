import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/Modal";
import { useBooking } from "@/hooks/useBooking";
import { useToast } from "@/components/Toast";
import { formatRupiah } from "@/utils/format";
import { buildWaLink } from "@/services/whatsapp";

const BADGE_VARIANT = { kosong: "kosong", pending: "pending", verifikasi: "verifikasi", terkunci: "terisi" };

export default function AdminBooking() {
  const { categories, board, getHarga, setSlotStatus } = useBooking();
  const showToast = useToast();
  const [preview, setPreview] = useState(null);

  const rows = useMemo(() => {
    const list = [];
    categories.forEach((c) => {
      (board[c.id] || []).forEach((slot) => {
        if (slot.status !== "kosong") list.push({ ...slot, catId: c.id, catName: c.name });
      });
    });
    return list;
  }, [categories, board]);

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
      <h1 className="font-display text-2xl font-bold text-ink">Booking ({rows.length})</h1>

      <div className="mt-4 overflow-x-auto rounded-card border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left text-xs text-muted">
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
                    <span className="font-mono text-xs text-blue-700">{b.catatanTransfer}</span>
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
                <td colSpan={8} className="px-3 py-6 text-center text-muted">
                  Belum ada pendaftaran.
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
