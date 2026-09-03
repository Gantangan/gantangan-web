import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBooking } from "@/hooks/useBooking";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/Toast";
import { compressImage } from "@/utils/image";
import { fetchBirdPhoto } from "@/services/pexels";
import { HARI_LABEL, HARI_LOMBA, formatTanggalPanjang } from "@/utils/date";

export default function AdminKategori() {
  const { categories, board, getHarga, getJadwal, getDeskripsi, getAutoImage, getTutupPendaftaran, getSlotCount, isBookingClosed, addCategory, renameCategory, removeCategory, resizeCategory, updateCategoryConfig } = useBooking();
  const { pexelsApiKey } = useSettings();
  const showToast = useToast();
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState(categories[0]?.id || "");
  const [editName, setEditName] = useState("");
  const [slotInput, setSlotInput] = useState("");
  const [searching, setSearching] = useState(false);

  const selected = categories.find((c) => c.id === selectedId) || categories[0];
  const terisi = selected ? (board[selected.id] || []).filter((s) => s.status !== "kosong").length : 0;

  async function handleResearch() {
    if (!pexelsApiKey) {
      showToast("error", "Isi dulu API key Pexels di Pengaturan → Tampilan.");
      return;
    }
    setSearching(true);
    const url = await fetchBirdPhoto(selected.name, pexelsApiKey);
    setSearching(false);
    if (url) {
      updateCategoryConfig(selected.id, { autoImage: url });
      showToast("ok", "Gambar berhasil diperbarui.");
    } else {
      showToast("error", "Tidak ketemu foto yang cocok. Coba upload manual saja.");
    }
  }

  async function handleManualUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "File harus berupa gambar (JPG/PNG).");
      return;
    }
    try {
      const compressed = await compressImage(file, { maxSize: 800, quality: 0.85 });
      updateCategoryConfig(selected.id, { autoImage: compressed });
      showToast("ok", "Gambar berhasil diganti.");
    } catch (err) {
      showToast("error", err.message || "Gagal memproses gambar.");
    }
  }

  function handleAdd() {
    if (!newName.trim()) return;
    addCategory(newName);
    setNewName("");
  }

  function handleResize() {
    const res = resizeCategory(selected.id, slotInput);
    if (!res.ok) showToast("error", res.error);
    else showToast("ok", "Jumlah nomor berhasil diubah.");
    setSlotInput("");
  }

  function handleJadwal(e) {
    const val = e.target.value;
    if (!val) {
      updateCategoryConfig(selected.id, { jadwal: "" });
      return;
    }
    const day = new Date(val + "T00:00:00").getDay();
    if (!HARI_LOMBA.includes(day)) {
      showToast("error", `Tanggal itu hari ${HARI_LABEL[day]}. Pilih hari Kamis atau Minggu.`);
      return;
    }
    updateCategoryConfig(selected.id, { jadwal: val });
  }

  function handleRemove() {
    const res = removeCategory(selected.id);
    if (!res.ok) showToast("error", res.error);
    else {
      showToast("ok", "Kategori dihapus.");
      setSelectedId(categories.find((c) => c.id !== selected.id)?.id || "");
    }
  }

  const jadwal = selected ? getJadwal(selected.id) : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream">Kategori</h1>
      <p className="mt-1 text-sm text-muted">
        Jadwal lomba hanya hari <strong>Kamis</strong> dan <strong>Minggu</strong>. Pendaftaran otomatis ditutup H-2 sebelum tanggal event.
      </p>

      <div className="mt-4 flex max-w-md gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama kategori baru, contoh: Ciblek" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <Button onClick={handleAdd}>+ Tambah</Button>
      </div>

      <label className="mb-1 mt-5 block text-xs font-medium text-muted">Pilih kategori untuk diatur</label>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="h-10 w-full max-w-md rounded-lg border border-border bg-card px-3 text-sm">
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {selected && (
        <div className="mt-4 max-w-md rounded-card border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: selected.tagColor }} />
            <span className="font-display font-bold">{selected.name}</span>
          </div>

          <label className="mb-1 block text-xs font-medium text-muted">Nama Kategori</label>
          <div className="flex gap-2">
            <Input defaultValue={selected.name} key={selected.id} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
            <Button size="sm" variant="success" onClick={() => renameCategory(selected.id, editName || selected.name)}>
              Simpan
            </Button>
          </div>

          <label className="mb-1 mt-3 block text-xs font-medium text-muted">Jumlah Petak Nomor</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={slotInput}
              onChange={(e) => setSlotInput(e.target.value)}
              placeholder={String(getSlotCount(selected.id))}
              className="flex-1"
            />
            <Button size="sm" onClick={handleResize}>
              Simpan
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted">
            Sekarang {getSlotCount(selected.id)} nomor ({terisi} sudah terisi). Boleh ditambah kapan saja; mengurangi
            hanya bisa kalau nomor yang dihapus masih kosong.
          </p>

          <label className="mb-1 mt-3 block text-xs font-medium text-muted">Harga Pendaftaran (Rp)</label>
          <Input type="number" min="0" value={getHarga(selected.id)} onChange={(e) => updateCategoryConfig(selected.id, { harga: Math.max(0, Number(e.target.value) || 0) })} />

          <label className="mb-1 mt-3 block text-xs font-medium text-muted">Tanggal Event (Kamis/Minggu)</label>
          <Input type="date" value={jadwal || ""} onChange={handleJadwal} />
          {jadwal && (
            <p className="mt-2 text-xs text-muted">
              Terjadwal {formatTanggalPanjang(jadwal)}
              {isBookingClosed(selected.id) && <span className="ml-1 font-bold text-red-400">— pendaftaran ditutup</span>}
            </p>
          )}

          <label className="mb-1 mt-3 block text-xs font-medium text-muted">Tutup Pendaftaran (tanggal &amp; jam)</label>
          <Input
            type="datetime-local"
            defaultValue={getTutupPendaftaran(selected.id) ? getTutupPendaftaran(selected.id).slice(0, 16) : ""}
            key={selected.id + "-tutup"}
            onChange={(e) => updateCategoryConfig(selected.id, { tutupPendaftaran: e.target.value ? new Date(e.target.value).toISOString() : "" })}
          />
          <p className="mt-1 text-[11px] text-muted">
            Setelah tanggal &amp; jam ini, peserta tidak bisa pesan nomor lagi. Kosongkan kalau tidak mau dibatasi.
          </p>

          <label className="mb-1 mt-3 block text-xs font-medium text-muted">Gambar Kategori</label>
          {getAutoImage(selected.id) && (
            <img src={getAutoImage(selected.id)} alt={selected.name} className="mb-2 h-28 w-full rounded-lg object-cover" />
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" disabled={searching} onClick={handleResearch}>
              {searching ? "Mencari…" : "🔄 Cari Ulang (Pexels)"}
            </Button>
            <label className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-cream hover:bg-card">
              📤 Upload Manual
              <input type="file" accept="image/*" className="hidden" onChange={handleManualUpload} />
            </label>
            {getAutoImage(selected.id) && (
              <button
                onClick={() => updateCategoryConfig(selected.id, { autoImage: "" })}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-card"
              >
                ✕ Hapus
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Nama kicau mania (Murai Batu, Kacer, dll) kadang tidak dikenali situs foto internasional, jadi hasil
            pencarian otomatis bisa meleset. Kalau kurang pas, upload foto sendiri saja.
          </p>

          <label className="mb-1 mt-3 block text-xs font-medium text-muted">Deskripsi Event (opsional)</label>
          <textarea
            defaultValue={getDeskripsi(selected.id)}
            key={selected.id + "-deskripsi"}
            onBlur={(e) => updateCategoryConfig(selected.id, { deskripsi: e.target.value })}
            placeholder="Contoh: Latihan bersama rutin dengan juri bersertifikat. Gantangan bersih, sound system jernih, dan hadiah trofi untuk juara 1-5."
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-cream placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <p className="mt-1 text-[11px] text-muted">Tampil di halaman pilih nomor peserta. Otomatis tersimpan saat pindah fokus.</p>

          <Button variant="destructive" size="sm" className="mt-4" onClick={handleRemove}>
            Hapus Kategori Ini
          </Button>
        </div>
      )}
    </div>
  );
}
