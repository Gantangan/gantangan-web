import { Landmark, Smartphone, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ICONS = { Bank: Landmark, "E-Wallet": Smartphone, QRIS: QrCode };

export default function PaymentCard({ account, onRemove }) {
  const Icon = ICONS[account.jenis] || Landmark;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
      <div className="flex items-center gap-2.5">
        {account.qrImage ? (
          <img src={account.qrImage} alt="QR code" className="h-10 w-10 rounded border border-border object-contain bg-white" />
        ) : (
          <Icon className="h-4 w-4 shrink-0 text-goldDeep" />
        )}
        <span>
          <strong>{account.nama}</strong>
          {account.nomor ? ` — ${account.nomor}` : ""} a/n {account.atasNama}
        </span>
      </div>
      {onRemove && (
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onRemove}>
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
