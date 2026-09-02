import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { useSettings } from "@/hooks/useSettings";

export default function AuthLayout({ children }) {
  const { headerColor, heroImage } = useSettings();

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-4 py-8 text-cream"
      style={{ backgroundColor: headerColor }}
    >
      {heroImage && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/60" />
        </>
      )}

      <Link to="/" className="relative z-10 mt-4 flex flex-col items-center text-center">
        <Logo size={48} className="mb-2" />
        <div className="font-mono text-xs tracking-[0.3em] text-gold">◈ GANTANGAN KEBOKICAK</div>
      </Link>

      <div className="relative z-10 flex flex-1 items-center justify-center py-10">{children}</div>
    </div>
  );
}
