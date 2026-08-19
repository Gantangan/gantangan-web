import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import Ticker from "@/components/Ticker";
import Logo from "@/components/Logo";
import { useBooking } from "@/hooks/useBooking";
import { useSettings } from "@/hooks/useSettings";
import { usePosts } from "@/hooks/usePosts";
import { usePhotos } from "@/hooks/usePhotos";
import { formatRupiah } from "@/utils/format";
import { formatTanggalPanjang, HARI_LABEL } from "@/utils/date";

export default function Landing() {
  const { categories, board, getHarga, getJadwal, getSlotCount, loaded } = useBooking();
  const { headerColor, heroImage } = useSettings();
  const { posts } = usePosts();
  const { photos } = usePhotos();
  const [, forceTick] = useState(0);

  // Refresh tiap menit biar countdown tetap akurat.
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const upcoming = categories
    .map((c) => ({ ...c, jadwal: getJadwal(c.id) }))
    .filter((c) => c.jadwal)
    .sort((a, b) => a.jadwal.localeCompare(b.jadwal))
    .find((c) => new Date(c.jadwal + "T00:00:00").getTime() >= new Date().setHours(0, 0, 0, 0));

  let countdown = null;
  if (upcoming) {
    const diffMs = new Date(upcoming.jadwal + "T00:00:00").getTime() - Date.now();
    countdown = {
      days: Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((diffMs / (1000 * 60 * 60)) % 24)),
      cat: upcoming,
    };
  }

  return (
    <div className="min-h-screen bg-cream font-body text-ink">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex w-full flex-col items-center justify-center px-6 py-10 text-center text-cream"
        style={{
          backgroundColor: headerColor,
          aspectRatio: heroImage ? "16 / 9" : undefined, // 1600x900 = rasio 16:9, standar umum banner web
          minHeight: heroImage ? undefined : "auto",
        }}
      >
        {heroImage && (
          <>
            {/* Kotak section ini sengaja dibuat rasio 3:2 (1200x800) supaya gambar
                pas mengisi penuh tanpa potong dan tanpa sisa ruang kosong. */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Overlay gelap tipis di atas gambar biar teks putih tetap kebaca */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/55" />
          </>
        )}
        <div className="relative z-10 flex flex-col items-center">
        <Logo size={56} className="mb-3" />
        <div className="mb-2 font-mono text-xs tracking-[0.3em] text-gold">◈ GANTANGAN KEBOKICAK</div>
        <h1 className="font-display text-3xl font-bold leading-tight">Lomba Burung Berkicau</h1>
        <p className="mt-2 max-w-xs text-sm text-border">Daftar nomor gantangan favoritmu, cepat dan mudah.</p>

        {countdown && (
          <div className="mt-6 rounded-2xl border border-gold/30 bg-white/5 px-6 py-4">
            <div className="mb-2 text-xs font-semibold text-gold">Menuju {countdown.cat.name}</div>
            <div className="flex justify-center gap-5">
              <div className="flex flex-col items-center">
                <div className="font-display text-3xl font-bold">{countdown.days}</div>
                <div className="text-[10px] text-border">hari</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="font-display text-3xl font-bold">{countdown.hours}</div>
                <div className="text-[10px] text-border">jam</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-border">{formatTanggalPanjang(countdown.cat.jadwal)}</div>
          </div>
        )}

        <div className="mt-7 flex gap-3">
          <Link to="/daftar" className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink hover:brightness-95">
            Daftar Akun
          </Link>
          <Link to="/login" className="rounded-full border border-cream px-6 py-3 text-sm font-bold text-cream hover:bg-white/10">
            Masuk
          </Link>
        </div>
        <Link to="/cek-pesanan" className="mt-3 text-xs font-semibold text-gold underline underline-offset-2">
          Sudah booking? Cek status pesanan
        </Link>
        </div>
      </motion.section>

      <Ticker items={[]} />

      {posts.length > 0 && (
        <section className="border-b border-border bg-card px-5 py-7">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between border-b-2 border-ink pb-2">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">
                📰 Kegiatan &amp; Update
              </h2>
              <Link to="/berita" className="text-xs font-bold text-goldDeep hover:underline">
                Semua Berita →
              </Link>
            </div>

            <div className="mt-4 grid gap-5 sm:grid-cols-5">
              {/* Berita utama — kolom besar, gaya headline portal berita */}
              <Link to={`/berita/${posts[0].id}`} className="group block sm:col-span-3">
                <div className="overflow-hidden rounded-card">
                  {posts[0].image ? (
                    <img
                      src={posts[0].image}
                      alt={posts[0].title}
                      className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-72"
                    />
                  ) : (
                    <div className="h-52 w-full bg-ink/10 sm:h-72" />
                  )}
                </div>
                <span className="mt-3 inline-block rounded bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
                  Terbaru
                </span>
                <h3 className="mt-2 font-display text-xl font-bold leading-snug text-ink group-hover:text-goldDeep sm:text-2xl">
                  {posts[0].title}
                </h3>
                {posts[0].excerpt && <p className="mt-1.5 line-clamp-2 text-sm text-inkSoft">{posts[0].excerpt}</p>}
                <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(posts[0].createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </Link>

              {/* Berita lainnya — list editorial: thumbnail kecil kiri, teks kanan */}
              {posts.length > 1 && (
                <div className="flex flex-col divide-y divide-border sm:col-span-2">
                  {posts.slice(1, 5).map((p) => (
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
              )}
            </div>
          </div>
        </section>
      )}

      <main className="px-5 py-6">
        {photos.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Galeri Foto</h2>
              <Link to="/galeri" className="text-xs font-semibold text-goldDeep underline">
                Lihat semua
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-1 sm:grid-cols-8">
              {photos.slice(0, 16).map((p) => (
                <Link key={p.id} to="/galeri" className="group overflow-hidden rounded border border-border">
                  <img
                    src={p.image}
                    alt={p.caption || "Foto galeri"}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="font-display text-2xl font-bold">Kategori Lomba</h2>
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 bg-card px-2 py-4 text-center"
              style={{ borderColor: c.tagColor }}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: c.tagColor }} />
              <div className="font-display text-sm font-bold leading-tight">{c.name}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-cream">
            Login Panitia
          </Link>
        </div>

        {!loaded && <p className="mt-6 text-center text-xs text-muted">Memuat data…</p>}
      </main>
    </div>
  );
}
