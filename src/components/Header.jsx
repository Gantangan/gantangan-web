import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function Header({ subtitle, actions }) {
  const { currentUser, logout } = useAuth();
  const { headerColor } = useSettings();
  const homeLink = currentUser?.role === "admin" ? "/admin" : currentUser?.role === "peserta" ? "/dashboard" : "/";

  return (
    <header className="w-full text-cream" style={{ backgroundColor: headerColor }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
        <Link to={homeLink} className="flex items-center gap-3">
          <Logo size={40} />
          <div>
            <div className="font-display text-base tracking-wide">GANTANGAN KEBOKICAK</div>
            {subtitle && <div className="text-xs text-textSoft">{subtitle}</div>}
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
      </div>
    </header>
  );
}
