import { NavLink } from "react-router-dom";
import { LayoutDashboard, Ticket, Bird, Users, CreditCard, FileBarChart, Settings, Target, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/booking", label: "Booking", icon: Ticket },
  { to: "/admin/kategori", label: "Kategori", icon: Bird },
  { to: "/admin/peserta", label: "Peserta", icon: Users },
  { to: "/admin/pembayaran", label: "Pembayaran", icon: CreditCard },
  { to: "/admin/laporan", label: "Laporan", icon: FileBarChart },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function Sidebar() {
  const { logout } = useAuth();

  const itemClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
      isActive ? "bg-gold font-bold text-ink" : "text-border hover:bg-inkSoft"
    } md:flex-row md:text-sm max-md:flex-col max-md:text-[9.5px] max-md:px-2 max-md:py-1.5 max-md:whitespace-nowrap`;

  return (
    <aside className="flex w-full flex-row items-center gap-1 overflow-x-auto bg-ink px-2 py-2 text-cream md:w-44 md:min-w-[176px] md:flex-col md:items-stretch md:gap-1 md:overflow-visible md:px-3 md:py-5">
      <div className="mb-3 hidden items-center gap-2 px-2 md:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-gold text-gold">◈</div>
        <span className="font-display text-xs leading-tight tracking-wide">GANTANGAN KEBOKICAK</span>
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={itemClass}>
            <item.icon className="h-4 w-4 shrink-0 md:h-4 md:w-4" />
            {item.label}
          </NavLink>
        ))}
        <NavLink to="/booking" className={itemClass}>
          <Target className="h-4 w-4 shrink-0" />
          Papan Nomor
        </NavLink>
      </nav>

      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-300 hover:bg-inkSoft max-md:flex-col max-md:text-[9.5px] max-md:px-2 max-md:py-1.5"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Logout
      </button>
    </aside>
  );
}
