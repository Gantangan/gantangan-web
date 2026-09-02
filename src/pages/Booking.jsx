import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, CalendarDays, MapPin, Landmark, Smartphone, QrCode } from "lucide-react";
import Header from "@/components/Header";
import SlotGrid from "@/components/SlotGrid";
import PaymentCard from "@/components/PaymentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useBooking } from "@/hooks/useBooking";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/Toast";
import { formatRupiah, formatMMSS } from "@/utils/format";
import { formatTanggalPanjang, formatTanggalWaktu } from "@/utils/date";
import { HOLD_MINUTES, HOLD_MS } from "@/constants";
import { getItem, setItem, removeItem } from "@/services/storage";

const METHOD_TABS = [
  { id: "Bank", label: "Transfer Bank", icon: Landmark },
  { id: "E-Wallet", label: "E-Wallet", icon: Smartphone },
  { id: "QRIS", label: "QRIS", icon: QrCode },
];

export default function Booking() {
  const { currentUser } = useAuth();
  const { categories, board, getHarga, getDeskripsi, getJadwal, getTutupPendaftaran, getSlotCount, isBookingClosed, bookSlot, submitBukti } = useBooking();
  const { paymentAccounts } = useSettings();
  const showToast = useToast();
  const navigate = useNavigate();

  const [activeCat, setActiveCat] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);
  const [form, setForm] = useState({ namaPeserta: "", whatsapp: "", burung: "", namaPemilik: "", alamat: "", catatan: "" });
  const [successInfo, setSuccessInfo] = useState(null); // {catId, no, catName}
  const [payMethod, setPayMethod] = useState("Bank");
  const [payStep, setPayStep] = useState("confirm"); // confirm -> proof -> done
  const [kodeText, setKodeText] = useState("");
  const [, forceTick] = useState(0);

  // Detak tiap detik biar sisa waktu bayar di popup selalu akurat.
  useEffect(() => {
    if (!successInfo) return;
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [successInfo]);

  const cat = categories.find((c) => c.id === activeCat);
  const slots = cat ? board[cat.id] || [] : [];
  const sisa = cat ? getSlotCount(cat.id) - slots.filter((s) => s.status !== "kosong").length : 0;
  const jadwal = cat ? getJadwal(cat.id) : null;

  function openCategory(id) {
    setActiveCat(id);
    setSelectedNo(null);
    const defaultForm = {
      namaPeserta: currentUser?.nama || "",
      whatsapp: currentUser?.hp || "",
      burung: "",
      namaPemilik: "",
      alamat: "",
      catatan: "",
    };
    getItem(`bookingDraft:${id}`, null).then((draft) => {
      if (draft) {
        setForm(draft);
        showToast("ok", "Draf isian sebelumnya dipulihkan.");
      } else {
        setForm(defaultForm);
      }
    });
  }

  // Simpan draf otomatis tiap kali isian berubah, biar tidak hilang kalau
  // HP nge-lag / browser ke-close tidak sengaja sebelum sempat submit.
  useEffect(() => {
    if (!activeCat) return;
    const isEmpty = !form.namaPeserta && !form.whatsapp && !form.burung && !form.namaPemilik && !form.alamat && !form.catatan;
    if (isEmpty) return;
    const t = setTimeout(() => setItem(`bookingDraft:${activeCat}`, form), 400);
    return () => clearTimeout(t);
  }, [form, activeCat]);

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
      const tutup = getTutupPendaftaran(cat.id);
      showToast("error", `Pendaftaran ditutup sejak ${tutup ? formatTanggalWaktu(tutup) : "sebelumnya"}.`);
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
    setSuccessInfo({ catId: cat.id, no: selectedNo, catName: cat.name });
    removeItem(`bookingDraft:${cat.id}`);
    setPayMethod("Bank");
    setPayStep("confirm");
    setSelectedNo(null);
  }

  function closeDialog() {
    setSuccessInfo(null);
    setPayStep("confirm");
    setKodeText("");
  }

  function handleUploadBukti(e) {
    const file = e.target.files?.[0];
    if (!file || !successInfo) return;
    const reader = new FileReader();
    reader.onload = () => {
      submitBukti(successInfo.catId, successInfo.no, { buktiTransfer: reader.result });
      setPayStep("done");
      showToast("ok", "Bukti transfer terkirim, menunggu verifikasi panitia.");
    };
    reader.readAsDataURL(file);
  }

  function handleKirimKode() {
    if (!kodeText.trim() || !successInfo) {
      showToast("error", "Isi kode/keterangan transfer dulu.");
      return;
    }
    submitBukti(successInfo.catId, successInfo.no, { catatanTransfer: kodeText.trim() });
    setPayStep("done");
    showToast("ok", "Keterangan transfer terkirim, menunggu verifikasi panitia.");
  }

  // Data booking yang baru dibuat, diambil live dari board biar sisa waktu & kode akurat.
  const paidSlot = successInfo ? (board[successInfo.catId] || []).find((s) => s.no === successInfo.no) : null;
  const paidNominal = paidSlot?.kodeUnik != null ? getHarga(successInfo.catId) + paidSlot.kodeUnik : null;
  const sisaWaktuMs = paidSlot?.bookedAt ? Math.max(0, HOLD_MS - (Date.now() - paidSlot.bookedAt)) : 0;
  const accountsForMethod = paymentAccounts.filter((a) => a.jenis === payMethod);

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

      <Dialog open={!!successInfo} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogTitle>Gantangan Kebokicak</DialogTitle>
          <DialogDescription className="sr-only">Selesaikan pembayaran dalam {HOLD_MINUTES} menit.</DialogDescription>

          {/* Kartu ringkasan + sisa waktu — selalu tampil di semua tahap */}
          <div className="mt-2 rounded-card border border-border bg-ink/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-gold">Sisa waktu bayar</div>
                <div className="mt-0.5 font-display text-2xl font-bold text-cream">{formatMMSS(sisaWaktuMs)}</div>
              </div>
              <div className="text-right text-[11px] leading-relaxed text-textSoft">
                <div>{successInfo?.catName}</div>
                <div>
                  Nomor gantangan <strong className="text-cream">{successInfo?.no}</strong>
                </div>
                {paidSlot && (
                  <div>
                    {paidSlot.pemilik} · {paidSlot.kodeBooking}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 font-display text-xl font-bold text-gold">
              {paidNominal != null ? formatRupiah(paidNominal) : "-"}
            </div>
          </div>

          {payStep === "confirm" && (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {METHOD_TABS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-semibold transition-colors ${
                      payMethod === m.id ? "border-gold bg-gold/10 text-cream" : "border-border text-textSoft hover:border-inkSoft"
                    }`}
                  >
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-lg bg-card p-3">
                {accountsForMethod.length === 0 ? (
                  <p className="text-xs text-muted">
                    Panitia belum menambahkan {payMethod === "Bank" ? "rekening bank" : payMethod === "E-Wallet" ? "e-wallet" : "QRIS"}.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {accountsForMethod.map((a) => (
                      <PaymentCard key={a.id} account={a} />
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[11px] text-muted">Transfer sesuai nominal persis agar verifikasi otomatis berhasil.</p>
              </div>

              <Button className="mt-4 w-full" onClick={() => setPayStep("proof")}>
                Saya sudah bayar
              </Button>
            </>
          )}

          {payStep === "proof" && (
            <div className="mt-3">
              <h3 className="text-sm font-bold text-cream">Kirim bukti transfer</h3>
              <p className="mt-1 text-xs text-muted">Upload screenshot bukti transfer, atau ketik keterangan singkat.</p>
              <Input type="file" accept="image/*" onChange={handleUploadBukti} className="mt-2" />

              <div className="my-3 flex items-center gap-2 text-[11px] text-muted">
                <div className="h-px flex-1 bg-border" /> atau <div className="h-px flex-1 bg-border" />
              </div>

              <Input value={kodeText} onChange={(e) => setKodeText(e.target.value)} placeholder="Contoh: sudah transfer via m-banking BCA jam 14:05" />
              <Button className="mt-2 w-full" variant="ghost" onClick={handleKirimKode}>
                Kirim Keterangan
              </Button>

              <button onClick={() => setPayStep("confirm")} className="mt-3 text-xs font-semibold text-textSoft hover:text-cream">
                ← Kembali ke info rekening
              </button>
            </div>
          )}

          {payStep === "done" && (
            <div className="mt-4 flex flex-col items-center py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold text-2xl text-gold">
                ✓
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-cream">Bukti Terkirim!</h3>
              <p className="mt-1 max-w-xs text-xs text-textSoft">
                Nomor gantangan <strong className="text-cream">{successInfo?.no}</strong> sedang diproses panitia.
                Cek status kapan saja di halaman Riwayat Booking begitu sudah diverifikasi.
              </p>
              <Button className="mt-5 w-full" onClick={closeDialog}>
                Pesan Lagi
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
