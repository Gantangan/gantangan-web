import { Clock, Hourglass, Lock, Check } from "lucide-react";

// Satu sumber data untuk kotak nomor DAN legenda, supaya selalu sinkron.
// Status dibedakan lewat warna + ikon (bukan warna saja) demi pengguna buta warna.
export const SLOT_STATUS = {
  kosong: { label: "Kosong", cls: "bg-statusKosong/15 border-statusKosong text-emerald-300", Icon: null },
  pending: { label: "Pending", cls: "bg-statusPending/20 border-statusPending text-amber-300", Icon: Clock },
  verifikasi: { label: "Verifikasi", cls: "bg-statusVerifikasi/15 border-statusVerifikasi text-blue-300", Icon: Hourglass },
  terkunci: { label: "Terisi", cls: "bg-statusTerisi/15 border-statusTerisi text-red-300", Icon: Lock },
};

export const SLOT_SELECTED = {
  label: "Pilihan Anda",
  cls: "bg-gold/25 border-gold text-cream ring-2 ring-gold",
  Icon: Check,
};

export default function SlotButton({ slot, onClick, selected }) {
  const meta = selected ? SLOT_SELECTED : SLOT_STATUS[slot.status];
  const Icon = meta.Icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Nomor ${slot.no}, ${meta.label}`}
      aria-pressed={slot.status === "kosong" ? !!selected : undefined}
      className={`relative aspect-square min-h-[3.25rem] min-w-[3.25rem] rounded-xl border-2 font-mono text-base font-bold transition-transform active:scale-95 hover:scale-105 ${meta.cls}`}
      title={`Nomor ${slot.no} — ${meta.label}`}
    >
      {slot.no}
      {Icon && <Icon aria-hidden="true" className="absolute right-1 top-1 h-3 w-3" />}
    </button>
  );
}
