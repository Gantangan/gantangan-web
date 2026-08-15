import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { usePosts } from "@/hooks/usePosts";

export default function Berita() {
  const { posts } = usePosts();

  return (
    <div className="min-h-screen bg-cream">
      <Header subtitle="Kegiatan & Update" />
      <main className="mx-auto max-w-2xl px-5 py-8">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-inkSoft">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Beranda
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">Kegiatan &amp; Update</h1>

        <div className="mt-5 flex flex-col gap-4">
          {posts.length === 0 && <p className="text-sm text-muted">Belum ada postingan.</p>}
          {posts.map((p) => (
            <Link key={p.id} to={`/berita/${p.id}`} className="flex gap-3 rounded-card border border-border bg-card p-3 hover:bg-white">
              {p.image ? (
                <img src={p.image} alt={p.title} className="h-20 w-24 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-20 w-24 shrink-0 rounded-lg bg-cream" />
              )}
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-ink">{p.title}</div>
                <div className="mt-1 text-[11px] text-muted">
                  {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                {p.excerpt && <p className="mt-1 line-clamp-2 text-xs text-inkSoft">{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
