import { Link } from "react-router-dom";
import { Bird, History, User } from "lucide-react";
import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import BookingCard from "@/components/BookingCard";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useBooking } from "@/hooks/useBooking";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { categories, board, getHarga } = useBooking();

  const myBookings = [];
  categories.forEach((c) => {
    (board[c.id] || []).forEach((slot) => {
      if (slot.ownerEmail === currentUser?.email) myBookings.push({ ...slot, catId: c.id, catName: c.name });
    });
  });
  myBookings.sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));

  const countPending = myBookings.filter((b) => b.status === "pending" || b.status === "verifikasi").length;
  const countLunas = myBookings.filter((b) => b.status === "terkunci").length;

  return (
    <div className="min-h-screen bg-cream">
      <Header subtitle="Dashboard Peserta" />
      <main className="px-5 py-8">
        <h1 className="font-display text-2xl font-bold">Halo, {currentUser?.nama} 👋</h1>
        <p className="mt-1 text-sm text-muted">Selamat datang kembali di gantangan.</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <DashboardCard label="Total Booking" value={myBookings.length} />
          <DashboardCard label="Menunggu Bayar" value={countPending} />
          <DashboardCard label="Lunas" value={countLunas} />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Link to="/booking" className="flex flex-col items-center gap-2 rounded-card bg-ink px-3 py-5 text-center text-xs font-semibold text-cream">
            <Bird className="h-6 w-6" />
            Pilih Kategori
          </Link>
          <Link to="/riwayat" className="flex flex-col items-center gap-2 rounded-card bg-ink px-3 py-5 text-center text-xs font-semibold text-cream">
            <History className="h-6 w-6" />
            Riwayat Booking
          </Link>
          <Link to="/profil" className="flex flex-col items-center gap-2 rounded-card bg-ink px-3 py-5 text-center text-xs font-semibold text-cream">
            <User className="h-6 w-6" />
            Profil Saya
          </Link>
        </div>

        <h2 className="mt-7 font-display text-lg font-bold">Booking Terbaru</h2>
        {myBookings.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Belum ada booking. Yuk pilih kategori dan pesan nomor.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {myBookings.slice(0, 3).map((b) => (
              <BookingCard
                key={`${b.catId}-${b.no}`}
                booking={b}
                nominal={b.kodeUnik != null ? getHarga(b.catId) + b.kodeUnik : null}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
