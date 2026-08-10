import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
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
import { HOLD_MINUTES } from "@/constants";

export default function Booking() {
  const { currentUser } = useAuth();
  const { categories, board, getHarga, getSlotCount, isBookingClosed, bookSlot } = useBooking();
  const showToast = useToast();
  const navigate = useNavigate();

  const [activeCat, setActiveCat] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null); // {catId, no}
  const [form, setForm] = useState({ namaPeserta: "", whatsapp: "", burung: "", namaPemilik: "", alamat: "", catatan: "" });
  const [successInfo, setSuccessInfo] = useState(null); // {kodeBooking, no, catName}

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
    setForm({
      namaPeserta: currentUser.nama || "",
      whatsapp: currentUser.hp || "",
      burung: "",
      namaPemilik: "",
      alamat: "",
      catatan: "",
    });
  }

  function handleSubmitBooking() {
    if (!form.namaPeserta.trim()) {
      showToast("error", "Nama peserta wajib diisi.");
      return;
    }
    if (!form.whatsapp.trim()) {
      showToast("error", "Nomor WhatsApp wajib diisi.");
      return;
    }
    if (!form.burung.trim()) {
      showToast("error", "Nama burung wajib diisi.");
      return;
    }
    const res = bookSlot(bookingSlot.catId, bookingSlot.no, currentUser, form);
    if (!res.ok) {
      showToast("error", res.error);
      setBookingSlot(null);
      return;
    }
    setSuccessInfo({ kodeBooking: res.kodeBooking, no: bookingSlot.no, catName: cat.name });
    setBookingSlot(null);
  }

  function closeSuccessAndGo() {
    setSuccessInfo(null);
    if (currentUser?.role === "peserta") navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header
        subtitle={currentUser ? `${currentUser.role === "admin" ? "Panitia" : "Peserta"} — ${currentUser.nama}` : "Pilih Nomor"}
        actions={
          currentUser?.role === "admin" ? (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="border-inkSoft text-cream">
                <LayoutDashboard className="mr-1 h-3.5 w-3.5" /> Panel Admin
              </Button>
            </Link>
          ) : currentUser?.role === "peserta" ? (
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="border-inkSoft text-cream">
                <LayoutDashboard className="mr-1 h-3.5 w-3.5" /> Dashboard
              </Button>
            </Link>
          ) : null
        }
      />

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
                    {count}/{getSlotCount(c.id)} terisi
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

          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Nama Peserta *</label>
              <Input value={form.namaPeserta} onChange={(e) => setForm({ ...form, namaPeserta: e.target.value })} autoFocus />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Nomor WhatsApp *</label>
              <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="08xx-xxxx-xxxx" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Nama Burung *</label>
              <Input value={form.burung} onChange={(e) => setForm({ ...form, burung: e.target.value })} placeholder="Contoh: Rajawali" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Nama Pemilik (jika berbeda)</label>
              <Input value={form.namaPemilik} onChange={(e) => setForm({ ...form, namaPemilik: e.target.value })} placeholder="Opsional" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Alamat</label>
              <Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Opsional" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Catatan</label>
              <Input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Opsional" />
            </div>
          </div>

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

      <Dialog open={!!successInfo} onOpenChange={(open) => !open && closeSuccessAndGo()}>
        <DialogContent>
          <DialogTitle>🎉 Booking Berhasil!</DialogTitle>
          <DialogDescription>
            {successInfo?.catName} — No. {successInfo?.no}. Simpan kode booking ini untuk cek status kapan saja.
          </DialogDescription>
          <div className="my-3 rounded-xl border-2 border-dashed border-gold bg-gold/10 p-4 text-center">
            <div className="text-xs text-muted">Kode Booking</div>
            <div className="font-mono text-xl font-bold tracking-wider text-ink">{successInfo?.kodeBooking}</div>
          </div>
          <p className="text-xs text-muted">
            Transfer dalam {HOLD_MINUTES} menit, lalu upload bukti di halaman Riwayat Booking.
          </p>
          <Button className="mt-4 w-full" onClick={closeSuccessAndGo}>
            Oke, Lanjutkan
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
