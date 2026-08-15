import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { usePosts } from "@/hooks/usePosts";

export default function BeritaDetail() {
  const { id } = useParams();
  const { getPost, loaded } = usePosts();
  const post = getPost ? getPost(id) : null;

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
          <article>
            {post.image && <img src={post.image} alt={post.title} className="mb-4 w-full rounded-card object-cover" />}
            <h1 className="font-display text-2xl font-bold text-ink">{post.title}</h1>
            <div className="mt-1 text-xs text-muted">
              {new Date(post.createdAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-inkSoft">{post.content}</div>
          </article>
        )}
      </main>
    </div>
  );
}
