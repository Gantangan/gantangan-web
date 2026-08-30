import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, CalendarDays, MapPin } from "lucide-react";
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
import { formatTanggalPanjang } from "@/utils/date";
import { HOLD_MINUTES } from "@/constants";

export default function Booking() {
  const { currentUser } = useAuth();
  const { categories, board, getHarga, getDeskripsi, getJadwal, getSlotCount, isBookingClosed, bookSlot } = useBooking();
  const showToast = useToast();
  const navigate = useNavigate();

  const [activeCat, setActiveCat] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);
  const [form, setForm] = useState({ namaPeserta: "", whatsapp: "", burung: "", namaPemilik: "", alamat: "", catatan: "" });
  const [successInfo, setSuccessInfo] = useState(null); // {kodeBooking, no, catName}

  const cat = categories.find((c) => c.id === activeCat);
  const slots = cat ? board[cat.id] || [] : [];
  const sisa = cat ? getSlotCount(cat.id) - slots.filter((s) => s.status !== "kosong").length : 0;
  const jadwal = cat ? getJadwal(cat.id) : null;

  function openCategory(id) {
    setActiveCat(id);
    setSelectedNo(null);
    setForm({
      namaPeserta: currentUser?.nama || "",
      whatsapp: currentUser?.hp || "",
      burung: "",
      namaPemilik: "",
      alamat: "",
      catatan: "",
    });
  }

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
    setSelectedNo(slot.no);
  }

  function handleSubmitBooking() {
    if (!selectedNo) {
      showToast("error", "Pilih nomor gantangan dulu.");
      return;
    }
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
    const res = bookSlot(cat.id, selectedNo, currentUser, form);
    if (!res.ok) {
      showToast("error", res.error);
      setSelectedNo(null);
      return;
    }
    setSuccessInfo({ kodeBooking: res.kodeBooking, no: selectedNo, catName: cat.name });
    setSelectedNo(null);
  }

  function closeSuccessAndGo() {
    setSuccessInfo(null);
    if (currentUser?.role === "peserta") navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg">
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
          <h2 className="font-display text-2xl font-bold text-cream">Pilih Kategori</h2>
          <p className="mt-1 text-sm text-muted">Klik kategori untuk melihat &amp; memesan nomor gantangan</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((c) => {
              const count = board[c.id] ? board[c.id].filter((s) => s.status !== "kosong").length : 0;
              const closed = isBookingClosed(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => openCategory(c.id)}
                  className="rounded-2xl border-2 bg-card p-4 text-left"
                  style={{ borderColor: c.tagColor }}
                >
                  <span className="mb-1 inline-block h-3.5 w-3.5 rounded-full" style={{ background: c.tagColor }} />
                  <div className="font-display font-bold text-cream">{c.name}</div>
                  <div className="font-mono text-xs text-muted">
                    {count}/{getSlotCount(c.id)} terisi
                  </div>
                  <div className="font-mono text-xs font-bold text-goldDeep">{formatRupiah(getHarga(c.id))}</div>
                  {closed && <div className="mt-1 text-[11px] font-bold text-red-400">Pendaftaran ditutup</div>}
                </button>
              );
            })}
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-5xl px-5 py-6">
          <button onClick={() => setActiveCat(null)} className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-textSoft hover:text-cream">
            <ArrowLeft className="h-3.5 w-3.5" /> Semua jadwal
          </button>

          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">Gantangan Kebokicak — {cat.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-textSoft">
            {jadwal && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> {formatTanggalPanjang(jadwal)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Lapangan Gantangan Kebokicak
            </span>
            <span className="font-bold text-goldDeep">{formatRupiah(getHarga(cat.id))} / gantangan</span>
          </div>

          {getDeskripsi(cat.id) && <p className="mt-3 max-w-2xl text-sm text-textSoft">{getDeskripsi(cat.id)}</p>}

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-card border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-cream">Pilih nomor gantangan</h2>
                <span className="text-xs text-muted">{Math.max(sisa, 0)} tersedia</span>
              </div>
              <div className="mt-4">
                <SlotGrid slots={slots} onSlotClick={handleSlotClick} selectedNo={selectedNo} />
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1"><Badge variant="kosong">🟢</Badge> Kosong</span>
                <span className="flex items-center gap-1"><Badge variant="pending">🟡</Badge> Pending</span>
                <span className="flex items-center gap-1"><Badge variant="verifikasi">🔵</Badge> Verifikasi</span>
                <span className="flex items-center gap-1"><Badge variant="terisi">🔴</Badge> Terisi</span>
              </div>
            </div>

            <div className="h-fit rounded-card border border-border bg-card p-5">
              <h2 className="font-display text-base font-bold text-cream">Data peserta</h2>

              <label className="mb-1 mt-3 block text-xs font-medium text-muted">Nama peserta</label>
              <Input value={form.namaPeserta} onChange={(e) => setForm({ ...form, namaPeserta: e.target.value })} placeholder="Nama lengkap" />

              <label className="mb-1 mt-3 block text-xs font-medium text-muted">Nomor WhatsApp</label>
              <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="08xxxxxxxxxx" />

              <label className="mb-1 mt-3 block text-xs font-medium text-muted">Nama burung</label>
              <Input value={form.burung} onChange={(e) => setForm({ ...form, burung: e.target.value })} placeholder="Contoh: Rajawali" />

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-muted">+ Detail tambahan (opsional)</summary>
                <div className="mt-2 flex flex-col gap-2">
                  <Input value={form.namaPemilik} onChange={(e) => setForm({ ...form, namaPemilik: e.target.value })} placeholder="Nama pemilik (jika beda)" />
                  <Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat" />
                  <Input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Catatan" />
                </div>
              </details>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted">Nomor gantangan:</span>
                <span className="font-display font-bold text-cream">{selectedNo || "—"}</span>
              </div>

              <Button className="mt-4 w-full" style={{ background: cat.tagColor }} onClick={handleSubmitBooking} disabled={!selectedNo}>
                Kunci &amp; bayar ({HOLD_MINUTES} menit)
              </Button>
            </div>
          </div>
        </main>
      )}

      <Dialog open={!!successInfo} onOpenChange={(open) => !open && closeSuccessAndGo()}>
        <DialogContent>
          <DialogTitle>🎉 Booking Berhasil!</DialogTitle>
          <DialogDescription>
            {successInfo?.catName} — No. {successInfo?.no}. Simpan kode booking ini untuk cek status kapan saja.
          </DialogDescription>
          <div className="my-3 rounded-xl border-2 border-dashed border-gold bg-gold/10 p-4 text-center">
            <div className="text-xs text-muted">Kode Booking</div>
            <div className="font-mono text-xl font-bold tracking-wider text-cream">{successInfo?.kodeBooking}</div>
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
