import { useSettings } from "@/hooks/useSettings";

export default function Logo({ size = 40, className = "" }) {
  const { logo } = useSettings();
  const style = { width: size, height: size };

  if (logo) {
    return (
      <img
        src={logo}
        alt="Logo"
        style={style}
        className={`rounded-lg object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`flex items-center justify-center rounded-lg border-2 border-gold text-gold ${className}`}
    >
      <span style={{ fontSize: size * 0.45 }}>◈</span>
    </div>
  );
}
