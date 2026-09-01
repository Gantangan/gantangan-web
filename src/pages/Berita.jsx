import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Header from "@/components/Header";
import { usePosts } from "@/hooks/usePosts";

export default function Berita() {
  const { posts } = usePosts();

  return (
    <div className="min-h-screen bg-bg">
      <Header subtitle="Kegiatan & Update" />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-textSoft">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Beranda
        </Link>
        <h1 className="border-b-2 border-cream pb-2 font-display text-2xl font-bold uppercase tracking-wide text-cream">
          📰 Kegiatan &amp; Update
        </h1>

        {posts.length === 0 && <p className="mt-4 text-sm text-muted">Belum ada postingan.</p>}

        <div className="mt-5 flex flex-col divide-y divide-border">
          {posts.map((p, i) => (
            <Link
              key={p.id}
              to={`/berita/${p.id}`}
              className={`group flex gap-4 py-4 first:pt-0 ${i === 0 ? "flex-col sm:flex-row" : ""}`}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  className={i === 0 ? "h-48 w-full rounded-card object-cover sm:h-32 sm:w-48 sm:shrink-0" : "h-20 w-24 shrink-0 rounded-lg object-cover"}
                />
              ) : (
                <div className={i === 0 ? "h-48 w-full rounded-card bg-ink/10 sm:h-32 sm:w-48 sm:shrink-0" : "h-20 w-24 shrink-0 rounded-lg bg-ink/10"} />
              )}
              <div className="min-w-0">
                <h3
                  className={`font-display font-bold leading-snug text-cream group-hover:text-goldDeep ${
                    i === 0 ? "text-xl" : "text-sm line-clamp-2"
                  }`}
                >
                  {p.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                {i === 0 && p.excerpt && <p className="mt-2 text-sm text-textSoft">{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
