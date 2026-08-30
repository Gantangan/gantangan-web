import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { compressImage } from "@/utils/image";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMPTY_FORM = { title: "", image: "", excerpt: "", content: "" };

export default function AdminPostingan() {
  const { posts, addPost, updatePost, removePost } = usePosts();
  const showToast = useToast();
  const [editingId, setEditingId] = useState(null); // null = tidak edit, "new" = form tambah
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId("new");
  }

  function openEdit(post) {
    setForm({ title: post.title, image: post.image || "", excerpt: post.excerpt || "", content: post.content || "" });
    setEditingId(post.id);
  }

  function closeForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "File harus berupa gambar (JPG/PNG).");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file, { maxSize: 1200, quality: 0.85 });
      setForm((f) => ({ ...f, image: compressed }));
    } catch (err) {
      showToast("error", err.message || "Gagal memproses gambar.");
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    if (!form.title.trim()) {
      showToast("error", "Judul wajib diisi.");
      return;
    }
    if (!form.content.trim()) {
      showToast("error", "Isi postingan wajib diisi.");
      return;
    }
    if (editingId === "new") {
      addPost({ ...form, title: form.title.trim() });
      showToast("ok", "Postingan berhasil ditambahkan.");
    } else {
      updatePost(editingId, { ...form, title: form.title.trim() });
      showToast("ok", "Postingan berhasil diperbarui.");
    }
    closeForm();
  }

  function handleDelete(id) {
    removePost(id);
    showToast("ok", "Postingan dihapus.");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-cream">Postingan</h1>
        {editingId === null && (
          <Button onClick={openNew}>
            <Plus className="mr-1 h-4 w-4" /> Postingan Baru
          </Button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">
        Kabar kegiatan, suasana lomba, hasil juara, atau pengumuman — tampil di Landing Page dan bisa diklik peserta
        untuk baca lengkap. Cocok diisi rutin tiap minggu biar halaman depan terasa hidup.
      </p>

      {editingId !== null && (
        <div className="mt-4 max-w-lg rounded-card border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold">{editingId === "new" ? "Postingan Baru" : "Edit Postingan"}</h2>
            <button onClick={closeForm} className="text-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Judul</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Juara Kelas Murai Batu Minggu Ini!" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Foto (opsional)</label>
              {form.image && <img src={form.image} alt="Preview" className="mb-2 h-32 w-full rounded-lg border border-border object-cover" />}
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Ringkasan Singkat (opsional, tampil di kartu Landing Page)</label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="1-2 kalimat singkat" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Isi Lengkap</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-cream focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="Ceritakan kegiatan, suasana gantangan, hasil lomba, dsb."
              />
            </div>
            <Button onClick={handleSave}>{editingId === "new" ? "Terbitkan" : "Simpan Perubahan"}</Button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {posts.length === 0 && <p className="text-sm text-muted">Belum ada postingan. Klik "Postingan Baru" untuk mulai.</p>}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-card border border-border bg-card p-3">
            {p.image ? (
              <img src={p.image} alt={p.title} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-lg bg-card" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-cream">{p.title}</div>
              <div className="text-[11px] text-muted">{new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
            <button onClick={() => openEdit(p)} className="shrink-0 rounded-lg p-2 text-muted hover:bg-card">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => handleDelete(p.id)} className="shrink-0 rounded-lg p-2 text-red-400 hover:bg-card">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
