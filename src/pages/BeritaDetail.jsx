import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Header from "@/components/Header";
import { usePosts } from "@/hooks/usePosts";

export default function BeritaDetail() {
  const { id } = useParams();
  const { posts, getPost, loaded } = usePosts();
  const post = getPost ? getPost(id) : null;
  const related = post ? posts.filter((p) => p.id !== post.id).slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-cream">
      <Header subtitle="Kegiatan & Update" />
      <main className="mx-auto max-w-2xl px-5 py-8">
        <Link to="/berita" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-inkSoft">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Kegiatan &amp; Update
        </Link>

        {!loaded ? null : !post ? (
          <p className="text-sm text-muted">Postingan tidak ditemukan.</p>
        ) : (
          <>
            <article>
              <span className="inline-block rounded bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
                Kegiatan Gantangan
              </span>
              <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">{post.title}</h1>
              <div className="mt-2 flex items-center gap-1.5 border-b border-border pb-4 text-xs text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(post.createdAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              {post.image && <img src={post.image} alt={post.title} className="mt-4 w-full rounded-card object-cover" />}
              <div className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-inkSoft">{post.content}</div>
            </article>

            {related.length > 0 && (
              <div className="mt-10 border-t-2 border-ink pt-4">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink">Kegiatan Lainnya</h2>
                <div className="mt-3 flex flex-col divide-y divide-border">
                  {related.map((p) => (
                    <Link key={p.id} to={`/berita/${p.id}`} className="group flex gap-3 py-3 first:pt-0">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="h-16 w-20 shrink-0 rounded-lg bg-ink/10" />
                      )}
                      <div className="min-w-0">
                        <h4 className="font-display text-sm font-bold leading-snug text-ink line-clamp-2 group-hover:text-goldDeep">
                          {p.title}
                        </h4>
                        <div className="mt-1 text-[10.5px] text-muted">
                          {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
