export default function Ticker({ items = [] }) {
  if (!items || items.length === 0) return null;
  const combined = items.map((a) => a.text).join("      •      ");
  return (
    <div className="overflow-hidden whitespace-nowrap bg-gold py-1.5">
      <div className="inline-flex animate-marquee">
        <span className="inline-block px-6 text-xs font-bold text-cream">{combined}</span>
        <span className="inline-block px-6 text-xs font-bold text-cream">{combined}</span>
      </div>
    </div>
  );
}
