import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import BookingCard from "@/components/BookingCard";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { useBooking } from "@/hooks/useBooking";
import { useToast } from "@/components/Toast";
import { buildWaLink } from "@/services/whatsapp";

export default function AdminPembayaran() {
  const { categories, board, getHarga, setSlotStatus } = useBooking();
  const showToast = useToast();
  const [preview, setPreview] = useState(null);

  const antrian = useMemo(() => {
    const rows = [];
    categories.forEach((c) => {
      (board[c.id] || []).forEach((slot) => {
        if (slot.status === "pending" || slot.status === "verifikasi") rows.push({ ...slot, catId: c.id, catName: c.name });
      });
    });
    return rows;
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
      <h1 className="font-display text-2xl font-bold text-cream">Pembayaran</h1>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">✅ Transfer Bank</span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">✅ QRIS</span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">✅ E-Wallet</span>
      </div>
      <p className="mt-2 text-sm text-muted">Daftar pembayaran yang butuh tindakan (menunggu transfer / sedang diverifikasi).</p>

      <div className="mt-4 flex flex-col gap-2">
        {antrian.length === 0 && <p className="text-sm text-muted">Tidak ada antrian pembayaran saat ini.</p>}
        {antrian.map((b) => (
          <BookingCard
            key={`${b.catId}-${b.no}`}
            booking={b}
            nominal={b.kodeUnik != null ? getHarga(b.catId) + b.kodeUnik : null}
            right={
              <div className="flex items-center gap-1.5">
                {b.buktiTransfer && (
                  <Button size="sm" variant="ghost" onClick={() => setPreview(b)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button size="sm" variant="success" onClick={() => terima(b)}>
                  Terima
                </Button>
                <Button size="sm" variant="destructive" onClick={() => tolak(b)}>
                  Tolak
                </Button>
              </div>
            }
          />
        ))}
      </div>

      <Modal open={!!preview} onOpenChange={(o) => !o && setPreview(null)} title={preview ? `${preview.catName} — No. ${preview.no}` : ""}>
        {preview?.buktiTransfer && <img src={preview.buktiTransfer} alt="Bukti transfer" className="max-h-[50vh] w-full rounded-lg border border-border object-contain" />}
      </Modal>
    </div>
  );
}
