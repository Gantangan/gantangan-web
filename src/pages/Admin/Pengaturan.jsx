import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentCard from "@/components/PaymentCard";
import Logo from "@/components/Logo";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/Toast";

export default function AdminPengaturan() {
  const { announcements, paymentAccounts, logo, setLogo, removeLogo, addAnnouncement, removeAnnouncement, addAccount, removeAccount } = useSettings();
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [newAccount, setNewAccount] = useState({ jenis: "Bank", nama: "", nomor: "", atasNama: "" });
  const showToast = useToast();

  function handleAddAccount() {
    if (!newAccount.nama.trim() || !newAccount.nomor.trim() || !newAccount.atasNama.trim()) return;
    addAccount(newAccount);
    setNewAccount({ jenis: "Bank", nama: "", nomor: "", atasNama: "" });
  }

  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showToast("error", "Ukuran gambar maksimal 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
      showToast("ok", "Logo berhasil diganti.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Pengaturan</h1>

      <section className="mt-5 max-w-md">
        <h2 className="font-display text-base font-bold">Logo</h2>
        <p className="mt-1 text-xs text-muted">
          Tampil di header semua halaman (peserta, admin, dan landing page). Bisa diganti kapan saja.
        </p>
        <div className="mt-3 flex items-center gap-4">
          <Logo size={64} />
          <div className="flex flex-col gap-2">
            <Input type="file" accept="image/*" onChange={handleLogoUpload} />
            {logo && (
              <button onClick={removeLogo} className="self-start text-xs text-red-700">
                ✕ Hapus logo (kembali ke ikon default)
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 max-w-md">
        <h2 className="font-display text-base font-bold">Rekening / Merchant Tujuan Transfer</h2>
        <p className="mt-1 text-xs text-muted">Ditampilkan ke peserta saat mereka pesan nomor.</p>
        <div className="mt-3 flex flex-col gap-2">
          <select value={newAccount.jenis} onChange={(e) => setNewAccount({ ...newAccount, jenis: e.target.value })} className="h-10 rounded-lg border border-border bg-white px-3 text-sm">
            <option>Bank</option>
            <option>E-Wallet</option>
            <option>QRIS</option>
          </select>
          <Input value={newAccount.nama} onChange={(e) => setNewAccount({ ...newAccount, nama: e.target.value })} placeholder="Nama bank/e-wallet" />
          <Input value={newAccount.nomor} onChange={(e) => setNewAccount({ ...newAccount, nomor: e.target.value })} placeholder="Nomor rekening / HP" />
          <Input value={newAccount.atasNama} onChange={(e) => setNewAccount({ ...newAccount, atasNama: e.target.value })} placeholder="Atas nama" />
          <Button onClick={handleAddAccount}>+ Tambah Rekening</Button>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {paymentAccounts.length === 0 && <p className="text-xs text-muted">Belum ada rekening tujuan.</p>}
          {paymentAccounts.map((a) => (
            <PaymentCard key={a.id} account={a} onRemove={() => removeAccount(a.id)} />
          ))}
        </div>
      </section>

      <section className="mt-8 max-w-md">
        <h2 className="font-display text-base font-bold">Pengumuman & Info Event</h2>
        <p className="mt-1 text-xs text-muted">Teks ini berjalan (running text) di bagian atas halaman.</p>
        <div className="mt-3 flex gap-2">
          <Input value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} placeholder="Contoh: Event Akbar 17 Agustus" onKeyDown={(e) => e.key === "Enter" && (addAnnouncement(newAnnouncement), setNewAnnouncement(""))} />
          <Button onClick={() => { addAnnouncement(newAnnouncement); setNewAnnouncement(""); }}>Tambah</Button>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {announcements.length === 0 && <p className="text-xs text-muted">Belum ada pengumuman.</p>}
          {announcements.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm">
              <span>{a.text}</span>
              <button onClick={() => removeAnnouncement(a.id)} className="text-xs text-red-700">
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
