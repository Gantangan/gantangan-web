import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Lock, Timer, Wallet, ClipboardList, MessageCircleMore, CheckCircle2 } from "lucide-react";
import Ticker from "@/components/Ticker";
import { useBooking } from "@/hooks/useBooking";
import { useSettings } from "@/hooks/useSettings";
import { usePosts } from "@/hooks/usePosts";
import { usePhotos } from "@/hooks/usePhotos";
import { formatRupiah } from "@/utils/format";
import { formatTanggalPanjang, HARI_LABEL } from "@/utils/date";

const STEPS = [
  { no: "1", title: "Pilih nomor", desc: "Nomor yang sudah dipesan tampil abu-abu dan terkunci.", icon: ClipboardList },
  { no: "2", title: "Isi data", desc: "Nama peserta dan nomor WhatsApp untuk konfirmasi.", icon: MessageCircleMore },
  { no: "3", title: "Bayar 15 menit", desc: "Transfer bank, e-wallet, atau scan QRIS.", icon: Timer },
  { no: "4", title: "Konfirmasi", desc: "Nomor gantangan resmi jadi milik Anda.", icon: CheckCircle2 },
];

export default function Landing() {
  const { categories, board, getHarga, getJadwal, getSlotCount } = useBooking();
  const { headerColor, contactWhatsapp, announcements } = useSettings();
  const { posts } = usePosts();
  const { photos } = usePhotos();
  const [, forceTick] = useState(0);

  // Refresh tiap menit biar countdown/label tetap akurat.
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const jadwalCategories = categories
    .map((c) => ({ ...c, jadwal: getJadwal(c.id), harga: getHarga(c.id), sisa: getSlotCount(c.id) - (board[c.id] || []).filter((s) => s.status !== "kosong").length }))
    .filter((c) => c.jadwal)
    .sort((a, b) => a.jadwal.localeCompare(b.jadwal));

  return (
    <div className="min-h-screen bg-bg font-body text-cream">
      {/* Top bar minimal */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold" />
          <span className="font-display text-sm font-bold uppercase tracking-wide">Gantangan Kebokicak</span>
        </Link>
        <Link to="/daftar" className="rounded-full bg-gold px-5 py-2 text-xs font-bold text-ink hover:brightness-95">
          Pesan Tiket
        </Link>
      </header>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 py-12"
        style={{ background: `linear-gradient(180deg, ${headerColor}22, transparent)` }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Gantangan Kebokicak · Kicau Mania
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Booking gantangan
            <br />
            <span className="border-b-4 border-gold/70">tanpa rebutan</span> di lapangan.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-textSoft">
            Pilih nomor gantangan, kunci selama 15 menit, lalu bayar lewat transfer bank, e-wallet, atau QRIS. Nomor
            yang sudah dikunci tidak bisa diambil orang lain.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <FeatureCard icon={Lock} title="Nomor terkunci" desc="Satu nomor satu peserta, real-time." />
            <FeatureCard icon={Timer} title="15 menit bayar" desc="Lewat batas waktu, nomor dibuka lagi." />
            <FeatureCard icon={Wallet} title="3 metode bayar" desc="Bank, e-wallet, dan QRIS." />
          </div>
        </div>
      </motion.section>

      <Ticker items={announcements} />

      {/* Jadwal & tiket gantangan */}
      <section className="border-t border-border px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Jadwal &amp; tiket gantangan</h2>
          <p className="mt-1 text-sm text-textSoft">Klik kategori untuk memilih nomor gantangan.</p>

          {jadwalCategories.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Jadwal event belum diatur panitia.</p>
          ) : (
            <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 sm:gap-4">
              {jadwalCategories.map((c) => {
                const d = new Date(c.jadwal + "T00:00:00");
                return (
                  <Link
                    key={c.id}
                    to="/daftar"
                    className="group overflow-hidden rounded-card border border-border bg-card transition-colors hover:border-gold/60"
                  >
                    <div className="relative h-16 w-full sm:h-32" style={{ background: `linear-gradient(135deg, ${c.tagColor}55, ${c.tagColor}11)` }}>
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold text-ink sm:right-2 sm:top-2 sm:px-2.5 sm:text-[10px]">
                        {Math.max(c.sisa, 0)} sisa
                      </span>
                    </div>
                    <div className="p-2.5 sm:p-4">
                      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gold sm:gap-1.5 sm:text-[10.5px]">
                        <span className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2" style={{ background: c.tagColor }} />
                        Kelas {c.name}
                      </div>
                      <div className="mt-1 font-display text-xs font-bold leading-snug group-hover:text-goldDeep sm:text-base">
                        {c.name}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[9.5px] text-textSoft sm:mt-2 sm:text-[11px]">
                        <CalendarDays className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
                        <span className="truncate">{formatTanggalPanjang(c.jadwal)}</span>
                      </div>
                      <div className="mt-1 font-display text-xs font-bold sm:mt-2 sm:text-base">{formatRupiah(c.harga)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* 4 langkah */}
          <div className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.no}>
                <div className="text-xs font-bold text-gold">{s.no}. {s.title}</div>
                <p className="mt-1 text-xs text-textSoft">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kegiatan & Update */}
      {posts.length > 0 && (
        <section className="border-t border-border bg-card px-5 py-7">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between border-b-2 border-cream pb-2">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-cream">
                📰 Kegiatan &amp; Update
              </h2>
              <Link to="/berita" className="text-xs font-bold text-goldDeep hover:underline">
                Semua Berita →
              </Link>
            </div>

            <div className="mt-4 grid gap-5 sm:grid-cols-5">
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
                <h3 className="mt-2 font-display text-xl font-bold leading-snug text-cream group-hover:text-goldDeep sm:text-2xl">
                  {posts[0].title}
                </h3>
                {posts[0].excerpt && <p className="mt-1.5 line-clamp-2 text-sm text-textSoft">{posts[0].excerpt}</p>}
                <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(posts[0].createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </Link>

              {posts.length > 1 && (
                <div className="flex flex-col divide-y divide-border sm:col-span-2">
                  {posts.slice(1, 5).map((p) => (
                    <Link key={p.id} to={`/berita/${p.id}`} className="group flex gap-3 py-3 first:pt-0">
                      {p.image ? (
                        <img src={p.image} alt={p.title} loading="lazy" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="h-16 w-20 shrink-0 rounded-lg bg-ink/10" />
                      )}
                      <div className="min-w-0">
                        <h4 className="font-display text-sm font-bold leading-snug text-cream line-clamp-2 group-hover:text-goldDeep">
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

      {/* Galeri Foto */}
      {photos.length > 0 && (
        <section className="border-t border-border px-5 py-7">
          <div className="mx-auto max-w-4xl">
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
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center text-[11px] text-muted sm:flex-row sm:justify-between sm:text-left">
          <div>◈ Gantangan Kebokicak</div>
          {contactWhatsapp && <div>WhatsApp panitia: {contactWhatsapp}</div>}
          <Link to="/login" className="font-semibold text-textSoft hover:text-cream">
            Login Panitia
          </Link>
          <div>© {new Date().getFullYear()} Gantangan Kebokicak</div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <Icon className="h-4 w-4 text-gold" />
      <div className="mt-2 text-sm font-bold text-cream">{title}</div>
      <p className="mt-0.5 text-xs text-textSoft">{desc}</p>
    </div>
  );
}
