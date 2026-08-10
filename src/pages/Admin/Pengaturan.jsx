import { useState, useRef, useEffect } from "react";
import { Image, Landmark, Megaphone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentCard from "@/components/PaymentCard";
import Logo from "@/components/Logo";
import { compressImage } from "@/utils/image";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/Toast";

const SUB_TABS = [
  { id: "logo", label: "Logo", icon: Image },
  { id: "rekening", label: "Rekening Bank", icon: Landmark },
  { id: "pengumuman", label: "Pengumuman & Event", icon: Megaphone },
];

export default function AdminPengaturan() {
  const [tab, setTab] = useState("logo");
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef(null);
  const activeTab = SUB_TABS.find((t) => t.id === tab);

  // Klik di luar dropdown -> otomatis tertutup juga
  useEffect(() => {
    if (!navOpen) return;
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navOpen]);

  function selectTab(id) {
    setTab(id);
    setNavOpen(false); // auto-hide setelah pilih sub
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Pengaturan</h1>

      <div className="mt-5 max-w-md">
        {/* Sub-navigasi: tombol dropdown yang auto-hide */}
        <div ref={navRef} className="relative">
          <button
            onClick={() => setNavOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 rounded-card border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm"
          >
            <span className="flex items-center gap-2">
              {activeTab && <activeTab.icon className="h-4 w-4 text-gold" />}
              {activeTab?.label}
            </span>
            <ChevronDown className={`h-4 w-4 text-muted transition-transform ${navOpen ? "rotate-180" : ""}`} />
          </button>

          {navOpen && (
            <nav className="absolute left-0 right-0 top-full z-10 mt-1 flex flex-col gap-0.5 rounded-card border border-border bg-white p-1.5 shadow-lg">
              {SUB_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    tab === t.id ? "bg-ink text-cream" : "text-muted hover:bg-cream"
                  }`}
                >
                  <t.icon className="h-4 w-4 shrink-0" />
                  {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Konten sub */}
        <div className="mt-4">
          {tab === "logo" && <LogoSection />}
          {tab === "rekening" && <RekeningSection />}
          {tab === "pengumuman" && <PengumumanSection />}
        </div>
      </div>
    </div>
  );
}

function LogoSection() {
  const { logo, setLogo, removeLogo } = useSettings();
  const showToast = useToast();

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset biar bisa upload file yang sama lagi kalau perlu
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "File harus berupa gambar (JPG/PNG).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("error", "Ukuran file terlalu besar (maksimal 8MB). Coba foto lain atau kompres dulu.");
      return;
    }
    try {
      const compressed = await compressImage(file, { maxSize: 400, quality: 0.85 });
      const ok = await setLogo(compressed);
      if (ok === false) {
        showToast("error", "Gagal menyimpan logo — penyimpanan browser penuh. Coba pakai gambar yang lebih kecil.");
        return;
      }
      showToast("ok", "Logo berhasil diganti.");
    } catch (err) {
      showToast("error", err.message || "Gagal memproses gambar. Coba file lain.");
    }
  }

  return (
    <section>
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
  );
}

function RekeningSection() {
  const { paymentAccounts, addAccount, removeAccount } = useSettings();
  const showToast = useToast();
  const [newAccount, setNewAccount] = useState({ jenis: "Bank", nama: "", nomor: "", atasNama: "", qrImage: "" });
  const [qrPreview, setQrPreview] = useState("");
  const isQris = newAccount.jenis === "QRIS";

  async function handleQrUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "File harus berupa gambar (JPG/PNG).");
      return;
    }
    try {
      // Format PNG (bukan JPEG) supaya kode QR tetap tajam dan gampang dipindai.
      const compressed = await compressImage(file, { maxSize: 600, format: "png" });
      setNewAccount({ ...newAccount, qrImage: compressed });
      setQrPreview(compressed);
    } catch (err) {
      showToast("error", err.message || "Gagal memproses gambar QR.");
    }
  }

  function handleAddAccount() {
    if (!newAccount.nama.trim() || !newAccount.atasNama.trim()) return;
    if (isQris && !newAccount.qrImage) {
      showToast("error", "Upload dulu gambar QR code-nya.");
      return;
    }
    if (!isQris && !newAccount.nomor.trim()) {
      showToast("error", "Nomor rekening/HP wajib diisi.");
      return;
    }
    addAccount(newAccount);
    setNewAccount({ jenis: "Bank", nama: "", nomor: "", atasNama: "", qrImage: "" });
    setQrPreview("");
  }

  return (
    <section>
      <h2 className="font-display text-base font-bold">Rekening / Merchant Tujuan Transfer</h2>
      <p className="mt-1 text-xs text-muted">Ditampilkan ke peserta saat mereka pesan nomor.</p>
      <div className="mt-3 flex flex-col gap-2">
        <select
          value={newAccount.jenis}
          onChange={(e) => setNewAccount({ ...newAccount, jenis: e.target.value })}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm"
        >
          <option>Bank</option>
          <option>E-Wallet</option>
          <option>QRIS</option>
        </select>
        <Input
          value={newAccount.nama}
          onChange={(e) => setNewAccount({ ...newAccount, nama: e.target.value })}
          placeholder={isQris ? "Contoh: QRIS (GoPay/ShopeePay/OVO/DANA)" : "Nama bank/e-wallet"}
        />
        {isQris ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Gambar QR Code</label>
            {qrPreview && <img src={qrPreview} alt="QR code" className="mb-2 h-32 w-32 rounded-lg border border-border object-contain bg-white p-1" />}
            <Input type="file" accept="image/*" onChange={handleQrUpload} />
            <p className="mt-1 text-[11px] text-muted">
              Upload screenshot QRIS statis dari GoPay/ShopeePay/OVO/DANA/Bank — satu QR biasanya bisa dipindai semua e-wallet.
            </p>
            <label className="mb-1 mt-2 block text-xs font-medium text-muted">Nomor/ID (opsional)</label>
            <Input value={newAccount.nomor} onChange={(e) => setNewAccount({ ...newAccount, nomor: e.target.value })} placeholder="Opsional, misal ID merchant" />
          </div>
        ) : (
          <Input value={newAccount.nomor} onChange={(e) => setNewAccount({ ...newAccount, nomor: e.target.value })} placeholder="Nomor rekening / HP" />
        )}
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
  );
}

function PengumumanSection() {
  const { announcements, addAnnouncement, removeAnnouncement } = useSettings();
  const [newAnnouncement, setNewAnnouncement] = useState("");

  return (
    <section>
      <h2 className="font-display text-base font-bold">Pengumuman & Info Event</h2>
      <p className="mt-1 text-xs text-muted">Teks ini berjalan (running text) di bagian atas halaman.</p>
      <div className="mt-3 flex gap-2">
        <Input
          value={newAnnouncement}
          onChange={(e) => setNewAnnouncement(e.target.value)}
          placeholder="Contoh: Event Akbar 17 Agustus"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addAnnouncement(newAnnouncement);
              setNewAnnouncement("");
            }
          }}
        />
        <Button
          onClick={() => {
            addAnnouncement(newAnnouncement);
            setNewAnnouncement("");
          }}
        >
          Tambah
        </Button>
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
  );
}
