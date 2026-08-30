const STATUS_BG = {
  kosong: "bg-statusKosong/15 border-statusKosong text-emerald-300",
  pending: "bg-statusPending/20 border-statusPending text-amber-300",
  verifikasi: "bg-statusVerifikasi/15 border-statusVerifikasi text-blue-300",
  terkunci: "bg-statusTerisi/15 border-statusTerisi text-red-300",
};

export default function SlotButton({ slot, onClick, selected }) {
  const cls = selected
    ? "bg-gold/25 border-gold text-cream ring-2 ring-gold"
    : STATUS_BG[slot.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`aspect-square min-h-[3.25rem] min-w-[3.25rem] rounded-xl border-2 font-mono text-base font-bold transition-transform active:scale-95 hover:scale-105 ${cls}`}
      title={`Nomor ${slot.no} — ${selected ? "pilihan Anda" : slot.status}`}
    >
      {slot.no}
    </button>
  );
}
