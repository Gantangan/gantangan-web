import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import { Button } from "@/components/ui/button";

export default function Header({ subtitle, actions }) {
  const { currentUser, logout } = useAuth();
  return (
    <header className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-cream">
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gold text-lg text-gold">◈</div>
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
