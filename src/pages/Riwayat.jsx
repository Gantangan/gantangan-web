import { useState } from "react";
import Header from "@/components/Header";
import BookingCard from "@/components/BookingCard";
import PaymentCard from "@/components/PaymentCard";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useBooking } from "@/hooks/useBooking";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/Toast";
import { formatRupiah, formatMMSS } from "@/utils/format";
import { HOLD_MS } from "@/constants";
import { payWithMidtrans, isPaymentGatewayConfigured } from "@/services/payment";

export default function Riwayat() {
  const { currentUser } = useAuth();
  const { categories, board, getHarga, submitBukti, setSlotStatus } = useBooking();
  const { paymentAccounts } = useSettings();
  const showToast = useToast();

  const [uploadTarget, setUploadTarget] = useState(null); // {catId, no}
  const [kodeText, setKodeText] = useState("");
  const [payingOnline, setPayingOnline] = useState(false);

  const myBookings = [];
  categories.forEach((c) => {
    (board[c.id] || []).forEach((slot) => {
      if (slot.ownerEmail === currentUser?.email) myBookings.push({ ...slot, catId: c.id, catName: c.name });
    });
  });
  myBookings.sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));

  const targetSlot = uploadTarget ? myBookings.find((b) => b.catId === uploadTarget.catId && b.no === uploadTarget.no) : null;
  const targetCat = targetSlot ? categories.find((c) => c.id === targetSlot.catId) : null;
  const targetNominal = targetSlot?.kodeUnik != null ? getHarga(targetSlot.catId) + targetSlot.kodeUnik : null;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      submitBukti(uploadTarget.catId, uploadTarget.no, { buktiTransfer: reader.result });
      showToast("ok", "Bukti terkirim. Menunggu konfirmasi admin.");
      setUploadTarget(null);
    };
    reader.readAsDataURL(file);
  }

  function handleKirimKode() {
    if (!kodeText.trim()) return;
    submitBukti(uploadTarget.catId, uploadTarget.no, { catatanTransfer: kodeText.trim() });
    showToast("ok", "Kode terkirim. Menunggu konfirmasi admin.");
    setUploadTarget(null);
    setKodeText("");
  }

  function handleBayarOnline() {
    setPayingOnline(true);
    payWithMidtrans(
      {
        catId: targetSlot.catId,
        no: targetSlot.no,
        catName: targetCat?.name,
        pemilik: targetSlot.pemilik,
        email: currentUser.email,
        hp: targetSlot.hp,
        burung: targetSlot.burung,
        nominal: targetNominal,
      },
      {
        onSuccess: () => {
          setSlotStatus(targetSlot.catId, targetSlot.no, "terkunci");
          showToast("ok", "Pembayaran berhasil! Nomor kamu sudah lunas.");
          setPayingOnline(false);
          setUploadTarget(null);
        },
        onPending: () => {
          showToast("ok", "Pembayaran sedang diproses.");
          setPayingOnline(false);
        },
        onError: (err) => {
          showToast("error", err?.message || "Pembayaran online belum tersedia. Silakan transfer manual di bawah.");
          setPayingOnline(false);
        },
        onClose: () => setPayingOnline(false),
      }
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header subtitle="Riwayat Booking" />
      <main className="px-5 py-8">
        <h1 className="font-display text-2xl font-bold">Riwayat Saya ({myBookings.length})</h1>

        {myBookings.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Kamu belum memesan nomor gantangan apa pun. Pilih kategori dan nomor di halaman "Pilih Kategori".
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {myBookings.map((b) => {
              const nominal = b.kodeUnik != null ? getHarga(b.catId) + b.kodeUnik : null;
              return (
                <BookingCard
                  key={`${b.catId}-${b.no}`}
                  booking={b}
                  nominal={nominal}
                  right={
                    b.status === "pending" && (
                      <Button size="sm" variant="primary" onClick={() => setUploadTarget({ catId: b.catId, no: b.no })}>
                        Upload Bukti
                      </Button>
                    )
                  }
                />
              );
            })}
          </div>
        )}
      </main>

      <Modal
        open={!!uploadTarget}
        onOpenChange={(open) => !open && setUploadTarget(null)}
        title={targetSlot ? `${targetSlot.catName} — No. ${targetSlot.no}` : ""}
        description={targetSlot?.bookedAt ? `Sisa waktu: ${formatMMSS(HOLD_MS - (Date.now() - targetSlot.bookedAt))}` : ""}
      >
        {targetSlot && (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-gold/40 bg-gold/10 p-3">
              <p className="mb-2 text-xs font-bold text-ink">💳 Bayar Online (Midtrans)</p>
              <p className="mb-2 text-xs text-muted">
                {isPaymentGatewayConfigured()
                  ? "Bayar langsung via VA, QRIS, atau e-wallet — otomatis terkonfirmasi."
                  : "Belum aktif untuk event ini. Panitia perlu menyambungkan backend pembayaran dulu."}
              </p>
              <Button size="sm" onClick={handleBayarOnline} disabled={payingOnline}>
                {payingOnline ? "Memproses…" : `Bayar ${targetNominal != null ? formatRupiah(targetNominal) : ""}`}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted">
              <div className="h-px flex-1 bg-border" /> atau transfer manual <div className="h-px flex-1 bg-border" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Upload bukti transfer</label>
              <Input type="file" accept="image/*" onChange={handleFile} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Atau ketik kode transfer</label>
              <div className="flex gap-2">
                <Input value={kodeText} onChange={(e) => setKodeText(e.target.value)} placeholder="Kode transfer" />
                <Button onClick={handleKirimKode}>Kirim</Button>
              </div>
            </div>
            {paymentAccounts.length > 0 && (
              <div className="rounded-lg bg-cream p-3">
                <p className="mb-2 text-xs font-bold text-ink">Transfer ke:</p>
                <div className="flex flex-col gap-2">
                  {paymentAccounts.map((a) => (
                    <PaymentCard key={a.id} account={a} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
