import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QRTicket({ value, size = 200, onReady }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: "#0A0A0A", light: "#F1EDE4" } }).then((url) => {
      if (!cancelled) {
        setDataUrl(url);
        onReady?.(url);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, size]);

  if (!dataUrl) return <div style={{ width: size, height: size }} className="animate-pulse rounded-lg bg-card" />;
  return <img src={dataUrl} alt={`QR tiket ${value}`} width={size} height={size} className="rounded-lg" />;
}
