import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/utils/format";

const BADGE_VARIANT = { kosong: "kosong", pending: "pending", verifikasi: "verifikasi", terkunci: "terisi" };

export default function BookingCard({ booking, nominal, right, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cream font-mono text-lg font-bold">
          #{booking.no}
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">
            {booking.catName} — {booking.pemilik}
          </div>
          <div className="text-xs text-muted">
            Burung: {booking.burung}
            {nominal != null && <> • {formatRupiah(nominal)}</>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={BADGE_VARIANT[booking.status]}>{booking.status}</Badge>
        {right}
      </div>
      {children}
    </div>
  );
}
