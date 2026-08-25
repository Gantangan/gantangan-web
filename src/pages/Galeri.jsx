import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import Header from "@/components/Header";
import { usePhotos } from "@/hooks/usePhotos";

export default function Galeri() {
  const { photos } = usePhotos();
  const [active, setActive] = useState(null);

  return (
    <div className="min-h-screen bg-bg">
      <Header subtitle="Galeri Foto" />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-textSoft">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Beranda
        </Link>
        <h1 className="border-b-2 border-cream pb-2 font-display text-2xl font-bold uppercase tracking-wide text-cream">
          📷 Galeri Foto
        </h1>

        {photos.length === 0 && <p className="mt-4 text-sm text-muted">Belum ada foto di galeri.</p>}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className="group relative overflow-hidden rounded-card border border-border"
            >
              <img
                src={p.image}
                alt={p.caption || "Foto galeri"}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
              />
              {p.caption && (
                <div className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1 text-[10.5px] text-white">
                  {p.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" onClick={() => setActive(null)}>
            <X className="h-5 w-5" />
          </button>
          <div className="max-h-[85vh] max-w-full" onClick={(e) => e.stopPropagation()}>
            <img src={active.image} alt={active.caption || "Foto galeri"} className="max-h-[85vh] rounded-lg object-contain" />
            {active.caption && <p className="mt-2 text-center text-sm text-white">{active.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
