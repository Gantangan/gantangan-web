import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
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
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4">
        <Link to={homeLink} className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Logo size={32} className="shrink-0 sm:!h-10 sm:!w-10" />
          <div className="min-w-0">
            <div className="hidden font-display text-base tracking-wide sm:block">GANTANGAN KEBOKICAK</div>
            {subtitle && <div className="truncate text-xs text-textSoft">{subtitle}</div>}
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {actions}
          {currentUser && (
            <Button variant="ghost" size="sm" className="border-inkSoft px-2 text-cream sm:px-3" onClick={logout}>
              <LogOut className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
