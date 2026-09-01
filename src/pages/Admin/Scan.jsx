import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { CheckCircle2, XCircle, QrCode as QrIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBooking } from "@/hooks/useBooking";
import { useToast } from "@/components/Toast";
import { formatRupiah } from "@/utils/format";

const STATUS_LABEL = {
  pending: { text: "Menunggu Pembayaran", variant: "pending" },
  verifikasi: { text: "Menunggu Verifikasi", variant: "verifikasi" },
  terkunci: { text: "Lunas", variant: "kosong" },
};

export default function AdminScan() {
  const { findBooking, markHadir } = useBooking();
  const showToast = useToast();
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState(null); // null | { found: bool, booking? }

  useEffect(() => {
    if (!videoRef.current) return;
    const scanner = new QrScanner(
      videoRef.current,
      (res) => handleScanned(res.data || res),
      { highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 3 }
    );
    scannerRef.current = scanner;
    scanner
      .start()
      .then(() => setScanning(true))
      .catch(() => setCameraError("Tidak bisa akses kamera. Pastikan izin kamera diaktifkan di browser."));

    return () => {
      scanner.stop();
      scanner.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScanned(text) {
    if (!text) return;
    scannerRef.current?.pause();
    const booking = findBooking(text.trim());
    setResult(booking ? { found: true, booking } : { found: false });
  }

  function resumeScan() {
    setResult(null);
    scannerRef.current?.start();
  }

  function handleCheckin() {
    if (!result?.booking) return;
    const res = markHadir(result.booking.catId, result.booking.no);
    if (res.ok) {
      showToast("ok", `${result.booking.pemilik} — Nomor ${result.booking.no} berhasil check-in.`);
      setResult({ ...result, booking: { ...result.booking, hadir: true, checkinAt: Date.now() } });
    } else {
      showToast("error", res.error);
    }
  }

  const statusInfo = result?.booking ? STATUS_LABEL[result.booking.status] : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream">Scan QR Tiket</h1>
      <p className="mt-1 text-sm text-muted">Scan QR tiket peserta untuk check-in di lokasi lomba.</p>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <div className="w-full max-w-sm overflow-hidden rounded-card border border-border bg-card">
          <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
          {cameraError && <p className="p-3 text-xs text-red-400">{cameraError}</p>}
          {!cameraError && (
            <p className="p-3 text-center text-xs text-muted">
              {scanning ? "Arahkan kamera ke QR tiket peserta." : "Menyiapkan kamera…"}
            </p>
          )}
        </div>

        <div className="w-full max-w-sm">
          {!result && (
            <div className="flex h-40 flex-col items-center justify-center rounded-card border border-dashed border-border text-center text-muted">
              <QrIcon className="mb-2 h-6 w-6" />
              <p className="text-xs">Hasil scan akan muncul di sini.</p>
            </div>
          )}

          {result && !result.found && (
            <div className="rounded-card border border-red-400/40 bg-card p-4 text-center">
              <XCircle className="mx-auto mb-2 h-8 w-8 text-red-400" />
              <p className="text-sm font-bold text-cream">Tiket tidak ditemukan</p>
              <p className="mt-1 text-xs text-muted">
                Kode tidak cocok dengan data booking manapun di perangkat ini. Kalau peserta daftar dari HP lain,
                sistem belum sinkron antar perangkat (masih tahap prototype).
              </p>
              <Button className="mt-3 w-full" variant="ghost" onClick={resumeScan}>
                Scan Lagi
              </Button>
            </div>
          )}

          {result?.found && (
            <div className="rounded-card border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-muted">{result.booking.kodeBooking}</div>
                {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>}
              </div>
              <div className="mt-3 flex flex-col gap-1.5 text-sm">
                <Row label="Nama Peserta" value={result.booking.pemilik} />
                <Row label="Kategori" value={result.booking.catName} />
                <Row label="Nomor Gantangan" value={result.booking.no} />
                <Row label="Nama Burung" value={result.booking.burung} />
                <Row label="Total" value={result.booking.kodeUnik != null ? formatRupiah(result.booking.harga + result.booking.kodeUnik) : "-"} />
              </div>

              {result.booking.status !== "terkunci" ? (
                <p className="mt-3 text-xs font-bold text-amber-300">
                  ⚠ Pembayaran belum lunas — cek dulu di Admin → Pembayaran sebelum check-in.
                </p>
              ) : result.booking.hadir ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Sudah check-in
                  {result.booking.checkinAt && ` — ${new Date(result.booking.checkinAt).toLocaleTimeString("id-ID")}`}
                </p>
              ) : (
                <Button className="mt-3 w-full" onClick={handleCheckin}>
                  ✓ Tandai Hadir
                </Button>
              )}

              <Button className="mt-2 w-full" variant="ghost" onClick={resumeScan}>
                Scan Lagi
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 pb-1.5">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-cream">{value}</span>
    </div>
  );
}
