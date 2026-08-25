import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { usePhotos } from "@/hooks/usePhotos";
import { compressImage } from "@/utils/image";
import { useToast } from "@/components/Toast";
import { Input } from "@/components/ui/input";

export default function AdminGaleri() {
  const { photos, addPhoto, removePhoto } = usePhotos();
  const showToast = useToast();
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "File harus berupa gambar (JPG/PNG).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("error", "Ukuran file terlalu besar (maksimal 8MB).");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file, { maxSize: 1000, quality: 0.8 });
      const ok = await addPhoto({ image: compressed, caption: caption.trim() });
      if (ok === false) {
        showToast("error", "Gagal menyimpan foto — penyimpanan browser penuh.");
        return;
      }
      setCaption("");
      showToast("ok", "Foto berhasil ditambahkan ke galeri.");
    } catch (err) {
      showToast("error", err.message || "Gagal memproses gambar.");
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(id) {
    removePhoto(id);
    showToast("ok", "Foto dihapus dari galeri.");
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream">Galeri Foto</h1>
      <p className="mt-1 text-xs text-muted">
        Dokumentasi kegiatan, momen juara, atau suasana lomba — tampil di Landing Page dalam bentuk galeri foto.
      </p>

      <div className="mt-4 max-w-md rounded-card border border-border bg-card p-4">
        <label className="mb-1 block text-xs font-medium text-muted">Keterangan foto (opsional)</label>
        <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Contoh: Juara 1 Kelas Murai Batu" />
        <label className="mb-1 mt-3 block text-xs font-medium text-muted">Upload Foto</label>
        <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        {uploading && <p className="mt-1 text-[11px] text-muted">Sedang memproses gambar…</p>}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.length === 0 && <p className="col-span-full text-sm text-muted">Belum ada foto di galeri.</p>}
        {photos.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-card border border-border">
            <img src={p.image} alt={p.caption || "Foto galeri"} className="aspect-square w-full object-cover" />
            {p.caption && (
              <div className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1 text-[10.5px] text-white">
                {p.caption}
              </div>
            )}
            <button
              onClick={() => handleDelete(p.id)}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
