import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardCard from "@/components/DashboardCard";
import { useBooking } from "@/hooks/useBooking";
import { useAuth } from "@/hooks/useAuth.jsx";
import { formatRupiah } from "@/utils/format";

const GRANULARITAS = [
  { id: "jam", label: "Per Jam" },
  { id: "hari", label: "Per Hari" },
  { id: "bulan", label: "Per Bulan" },
];

function groupKey(ts, granularitas) {
  const d = new Date(ts);
  if (granularitas === "jam") {
    return `${d.toISOString().slice(0, 13)}:00`; // YYYY-MM-DDTHH:00
  }
  if (granularitas === "bulan") {
    return d.toISOString().slice(0, 7); // YYYY-MM
  }
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatAxisLabel(key, granularitas) {
  if (granularitas === "jam") {
    const d = new Date(key);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  if (granularitas === "bulan") {
    const d = new Date(key + "-01T00:00:00");
    return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
  }
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatTooltipLabel(key, granularitas) {
  if (granularitas === "jam") {
    const d = new Date(key);
    return d.toLocaleString("id-ID", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  }
  if (granularitas === "bulan") {
    const d = new Date(key + "-01T00:00:00");
    return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

export default function AdminDashboard() {
  const { categories, board, getHarga, getSlotCount } = useBooking();
  const { users } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [granularitas, setGranularitas] = useState("hari");

  const allBookings = useMemo(() => {
    const rows = [];
    categories.forEach((c) => {
      (board[c.id] || []).forEach((slot) => {
        if (slot.status !== "kosong") rows.push({ ...slot, catId: c.id, catName: c.name });
      });
    });
    return rows;
  }, [categories, board]);

  const totalPeserta = Object.values(users).filter((u) => u.role === "peserta").length;
  const totalSlot = categories.reduce((sum, c) => sum + getSlotCount(c.id), 0);
  const totalTerjual = allBookings.length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const pendapatanHariIni = allBookings
    .filter((b) => b.status === "terkunci" && b.confirmedAt && new Date(b.confirmedAt).toISOString().slice(0, 10) === todayStr)
    .reduce((sum, b) => sum + getHarga(b.catId), 0);

  const chartData = useMemo(() => {
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;
    const perKey = {};
    categories.forEach((c) => {
      (board[c.id] || []).forEach((slot) => {
        if (slot.status !== "terkunci" || !slot.confirmedAt) return;
        if (fromTs && slot.confirmedAt < fromTs) return;
        if (toTs && slot.confirmedAt > toTs) return;
        const key = groupKey(slot.confirmedAt, granularitas);
        if (!perKey[key]) perKey[key] = { key, total: 0, jumlah: 0 };
        perKey[key].total += getHarga(c.id);
        perKey[key].jumlah += 1;
      });
    });
    return Object.values(perKey).sort((a, b) => a.key.localeCompare(b.key));
  }, [categories, board, getHarga, from, to, granularitas]);

  const chartTotal = chartData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream">Dashboard</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <DashboardCard label="Pendapatan Hari Ini" value={formatRupiah(pendapatanHariIni)} />
        <DashboardCard label="Total Peserta" value={totalPeserta} />
        <DashboardCard label="Nomor Terjual" value={`${totalTerjual} / ${totalSlot}`} />
        <DashboardCard label="Kategori Aktif" value={categories.length} />
      </div>

      <div className="mt-6 rounded-card border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold">Grafik Penjualan</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex rounded-lg bg-card p-1">
              {GRANULARITAS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGranularitas(g.id)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    granularitas === g.id ? "bg-ink text-cream" : "text-muted"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-border px-2 py-1" />
            <span className="text-muted">–</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-border px-2 py-1" />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          {chartData.length > 0
            ? `Total pada rentang ini: ${formatRupiah(chartTotal)} dari ${chartData.reduce((s, d) => s + d.jumlah, 0)} nomor lunas`
            : "Belum ada penjualan lunas pada rentang ini."}
        </p>
        {chartData.length === 0 ? null : (
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D9A441" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#D9A441" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" />
                <XAxis dataKey="key" tick={{ fontSize: 11, fill: "#8A8272" }} tickFormatter={(v) => formatAxisLabel(v, granularitas)} />
                <YAxis tick={{ fontSize: 11, fill: "#8A8272" }} tickFormatter={(v) => `${Math.round(v / 1000)}rb`} width={44} />
                <Tooltip formatter={(v) => [formatRupiah(v), "Pendapatan"]} labelFormatter={(v) => formatTooltipLabel(v, granularitas)} />
                <Area type="monotone" dataKey="total" stroke="#B8860B" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
