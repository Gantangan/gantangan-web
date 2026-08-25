export default function DashboardCard({ label, value, sub }) {
  return (
    <div className="flex-1 min-w-[130px] rounded-card border border-border bg-card p-4 text-center">
      <div className="text-[10.5px] text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold text-cream">{value}</div>
      {sub && <div className="text-[10px] text-muted">{sub}</div>}
    </div>
  );
}
