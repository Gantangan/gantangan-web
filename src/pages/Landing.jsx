import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import Ticker from "@/components/Ticker";
import Logo from "@/components/Logo";
import { useBooking } from "@/hooks/useBooking";
import { useSettings } from "@/hooks/useSettings";
import { formatRupiah } from "@/utils/format";
import { formatTanggalPanjang, HARI_LABEL } from "@/utils/date";

export default function Landing() {
  const { categories, board, getHarga, getJadwal, getSlotCount, loaded } = useBooking();
  const { headerColor, heroImage } = useSettings();
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
        className="relative flex flex-col items-center overflow-hidden px-6 pb-8 pt-10 text-center text-cream"
        style={{ backgroundColor: headerColor }}
      >
        {heroImage && (
          <>
            {/* Lapisan gambar: "contain" supaya gambar utuh, tidak pernah terpotong.
                Sisi yang tidak tertutup gambar otomatis terisi warna latar di atas. */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
            {/* Overlay gelap tipis di atas gambar biar teks putih tetap kebaca */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/55" />
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

      <main className="px-5 py-6">
        <h2 className="font-display text-2xl font-bold">Kategori Lomba</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => {
            const jadwal = getJadwal(c.id);
            const count = board[c.id] ? board[c.id].filter((s) => s.status !== "kosong").length : 0;
            return (
              <div key={c.id} className="rounded-2xl border-2 bg-card p-4" style={{ borderColor: c.tagColor }}>
                <span className="mb-1 inline-block h-3.5 w-3.5 rounded-full" style={{ background: c.tagColor }} />
                <div className="font-display font-bold">{c.name}</div>
                <div className="font-mono text-xs text-muted">{count}/{getSlotCount(c.id)} terisi</div>
                <div className="font-mono text-xs font-bold text-goldDeep">{formatRupiah(getHarga(c.id))}</div>
                {jadwal && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-inkSoft">
                    <CalendarDays className="h-3 w-3" /> {HARI_LABEL[new Date(jadwal + "T00:00:00").getDay()]}
                  </div>
                )}
              </div>
            );
          })}
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
