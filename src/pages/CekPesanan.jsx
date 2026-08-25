import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBooking } from "@/hooks/useBooking";
import { formatRupiah } from "@/utils/format";

const STATUS_LABEL = {
  pending: { text: "Menunggu Pembayaran", variant: "pending" },
  verifikasi: { text: "Menunggu Verifikasi", variant: "verifikasi" },
  terkunci: { text: "Lunas", variant: "kosong" },
};

export default function CekPesanan() {
  const { findBooking } = useBooking();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(undefined); // undefined = belum cari, null = tidak ketemu

  function handleSearch() {
    if (!query.trim()) return;
    setResult(findBooking(query) || null);
  }

  const statusInfo = result ? STATUS_LABEL[result.status] : null;

  return (
    <div className="min-h-screen bg-bg">
      <Header subtitle="Cek Pesanan" />
      <main className="mx-auto max-w-md px-5 py-8">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-textSoft">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Beranda
        </Link>

        <h1 className="font-display text-2xl font-bold text-cream">Cek Pesanan</h1>
        <p className="mt-1 text-sm text-muted">Masukkan Kode Booking atau nomor WhatsApp yang dipakai saat mendaftar.</p>

        <div className="mt-4 flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Contoh: GTG-2026-00001 atau 08xxxxxxxxxx"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {result === null && (
          <p className="mt-4 text-sm text-red-700">Pesanan tidak ditemukan. Cek kembali kode booking atau nomor WhatsApp-nya.</p>
        )}

        {result && (
          <div className="mt-5 rounded-card border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm font-bold text-cream">{result.kodeBooking}</div>
              {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>}
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <Row label="Nama Peserta" value={result.pemilik} />
              <Row label="Kategori" value={result.catName} />
              <Row label="Nomor Gantangan" value={result.no} />
              <Row label="Nama Burung" value={result.burung} />
              {result.namaPemilik && <Row label="Pemilik Burung" value={result.namaPemilik} />}
              <Row label="Total" value={result.kodeUnik != null ? formatRupiah(result.harga + result.kodeUnik) : "-"} />
              {result.bookedAt && <Row label="Waktu Pesan" value={new Date(result.bookedAt).toLocaleString("id-ID")} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-cream">{value}</span>
    </div>
  );
}
