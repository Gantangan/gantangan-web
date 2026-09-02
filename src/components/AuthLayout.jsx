import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { useSettings } from "@/hooks/useSettings";

export default function AuthLayout({ children }) {
  const { headerColor, heroImage } = useSettings();

  return (
    <div className="min-h-screen bg-bg font-body text-cream">
      <div
        className="relative flex w-full flex-col items-center justify-center overflow-hidden px-6 py-6 text-center text-cream"
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/55" />
          </>
        )}
        <Link to="/" className="relative z-10 flex flex-col items-center">
          <Logo size={48} className="mb-2" />
          <div className="font-mono text-xs tracking-[0.3em] text-gold">◈ GANTANGAN KEBOKICAK</div>
        </Link>
      </div>

      <div className="flex justify-center px-4 py-8">{children}</div>
    </div>
  );
}
