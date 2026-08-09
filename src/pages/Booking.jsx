import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import SlotGrid from "@/components/SlotGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useBooking } from "@/hooks/useBooking";
import { useToast } from "@/components/Toast";
import { formatRupiah } from "@/utils/format";
import { HOLD_MINUTES, SLOTS_PER_CATEGORY } from "@/constants";

export default function Booking() {
  const { currentUser } = useAuth();
  const { categories, board, getHarga, isBookingClosed, bookSlot } = useBooking();
  const showToast = useToast();
  const navigate = useNavigate();

  const [activeCat, setActiveCat] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null); // {catId, no}
  const [burung, setBurung] = useState("");

  const cat = categories.find((c) => c.id === activeCat);
  const slots = cat ? board[cat.id] || [] : [];

  function handleSlotClick(slot) {
    if (slot.status !== "kosong") {
      showToast("error", "Nomor ini sudah diambil. Cek Riwayat/Dashboard untuk detail.");
      return;
    }
    if (!currentUser) {
      showToast("error", "Login sebagai peserta dulu untuk memesan nomor.");
      navigate("/login");
      return;
    }
    if (isBookingClosed(cat.id)) {
      showToast("error", "Pendaftaran ditutup H-2 sebelum tanggal event.");
      return;
    }
    setBookingSlot({ catId: cat.id, no: slot.no });
    setBurung("");
  }

  function handleSubmitBooking() {
    if (!burung.trim()) {
      showToast("error", "Isi nama burung dulu.");
      return;
    }
    const res = bookSlot(bookingSlot.catId, bookingSlot.no, currentUser, burung.trim());
    if (!res.ok) {
      showToast("error", res.error);
      setBookingSlot(null);
      return;
    }
    showToast("ok", `Nomor ${bookingSlot.no} dipesan. Transfer dalam ${HOLD_MINUTES} menit.`);
    setBookingSlot(null);
    if (currentUser?.role === "peserta") {
      // Balik ke Dashboard biar peserta tidak bingung — dari situ mereka lihat
      // pilihan Pilih Kategori, Riwayat Booking, dan Profil Saya dengan jelas.
      setTimeout(() => navigate("/dashboard"), 600);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header subtitle={currentUser ? `${currentUser.role === "admin" ? "Panitia" : "Peserta"} — ${currentUser.nama}` : "Pilih Nomor"} />

      {!cat ? (
        <main className="px-5 py-6">
          <h2 className="font-display text-2xl font-bold">Pilih Kategori</h2>
          <p className="mt-1 text-sm text-muted">Klik kategori untuk melihat & memesan nomor gantangan</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((c) => {
              const count = board[c.id] ? board[c.id].filter((s) => s.status !== "kosong").length : 0;
              const closed = isBookingClosed(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className="rounded-2xl border-2 bg-card p-4 text-left"
                  style={{ borderColor: c.tagColor }}
                >
                  <span className="mb-1 inline-block h-3.5 w-3.5 rounded-full" style={{ background: c.tagColor }} />
                  <div className="font-display font-bold">{c.name}</div>
                  <div className="font-mono text-xs text-muted">
                    {count}/{SLOTS_PER_CATEGORY} terisi
                  </div>
                  <div className="font-mono text-xs font-bold text-goldDeep">{formatRupiah(getHarga(c.id))}</div>
                  {closed && <div className="mt-1 text-[11px] font-bold text-red-700">Pendaftaran ditutup</div>}
                </button>
              );
            })}
          </div>
        </main>
      ) : (
        <main className="px-5 py-6">
          <button onClick={() => setActiveCat(null)} className="mb-4 inline-flex items-center gap-1 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-cream">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Kategori
          </button>
          <h2 className="font-display text-xl font-bold">{cat.name}</h2>
          <SlotGrid slots={slots} onSlotClick={handleSlotClick} />

          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1"><Badge variant="kosong">🟢</Badge> Kosong</span>
            <span className="flex items-center gap-1"><Badge variant="pending">🟡</Badge> Pending</span>
            <span className="flex items-center gap-1"><Badge variant="verifikasi">🔵</Badge> Verifikasi</span>
            <span className="flex items-center gap-1"><Badge variant="terisi">🔴</Badge> Terisi</span>
          </div>
        </main>
      )}

      <Dialog open={!!bookingSlot} onOpenChange={(open) => !open && setBookingSlot(null)}>
        <DialogContent>
          <DialogTitle>
            {cat?.name} — No. {bookingSlot?.no}
          </DialogTitle>
          <DialogDescription>Nomor ditahan {HOLD_MINUTES} menit setelah dipesan.</DialogDescription>
          <label className="mb-1 block text-xs font-medium text-muted">Nama Burung</label>
          <Input value={burung} onChange={(e) => setBurung(e.target.value)} placeholder="Contoh: Rajawali" autoFocus />
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setBookingSlot(null)}>
              Batal
            </Button>
            <Button className="flex-1" style={{ background: cat?.tagColor }} onClick={handleSubmitBooking}>
              Pesan Nomor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
