import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useBooking } from "@/hooks/useBooking";

export default function AdminPeserta() {
  const { users } = useAuth();
  const { categories, board } = useBooking();

  const peserta = useMemo(() => Object.entries(users).filter(([, u]) => u.role === "peserta"), [users]);

  function jumlahBooking(email) {
    let n = 0;
    categories.forEach((c) => {
      (board[c.id] || []).forEach((s) => {
        if (s.ownerEmail === email) n++;
      });
    });
    return n;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream">Peserta ({peserta.length})</h1>
      <div className="mt-4 overflow-x-auto rounded-card border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left text-xs text-muted">
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">No. HP</th>
              <th className="px-3 py-2">Jumlah Booking</th>
            </tr>
          </thead>
          <tbody>
            {peserta.map(([email, u]) => (
              <tr key={email} className="border-b border-border/60">
                <td className="px-3 py-2">{u.nama}</td>
                <td className="px-3 py-2">{email}</td>
                <td className="px-3 py-2">{u.hp}</td>
                <td className="px-3 py-2">{jumlahBooking(email)}</td>
              </tr>
            ))}
            {peserta.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted">
                  Belum ada peserta terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
