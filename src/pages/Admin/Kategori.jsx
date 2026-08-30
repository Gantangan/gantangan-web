import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBooking } from "@/hooks/useBooking";
import { useToast } from "@/components/Toast";
import { HARI_LABEL, HARI_LOMBA, formatTanggalPanjang } from "@/utils/date";

export default function AdminKategori() {
  const { categories, board, getHarga, getJadwal, getSlotCount, isBookingClosed, addCategory, renameCategory, removeCategory, resizeCategory, updateCategoryConfig } = useBooking();
  const showToast = useToast();
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState(categories[0]?.id || "");
  const [editName, setEditName] = useState("");
  const [slotInput, setSlotInput] = useState("");

  const selected = categories.find((c) => c.id === selectedId) || categories[0];
  const terisi = selected ? (board[selected.id] || []).filter((s) => s.status !== "kosong").length : 0;

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

          <Button variant="destructive" size="sm" className="mt-4" onClick={handleRemove}>
            Hapus Kategori Ini
          </Button>
        </div>
      )}
    </div>
  );
}
