import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function Header({ subtitle, actions }) {
  const { currentUser, logout } = useAuth();
  const homeLink = currentUser?.role === "admin" ? "/admin" : currentUser?.role === "peserta" ? "/dashboard" : "/";

  return (
    <header className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-cream">
      <Link to={homeLink} className="flex items-center gap-3">
        <Logo size={40} />
        <div>
          <div className="font-display text-base tracking-wide">GANTANGAN KEBOKICAK</div>
          {subtitle && <div className="text-xs text-border">{subtitle}</div>}
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {actions}
        {currentUser && (
          <Button variant="ghost" size="sm" className="text-cream border-inkSoft" onClick={logout}>
            Keluar
          </Button>
        )}
      </div>
    </header>
  );
}
