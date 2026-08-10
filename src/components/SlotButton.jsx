import { STATUS_COLOR } from "@/constants";

const STATUS_BG = {
  kosong: "bg-statusKosong/15 border-statusKosong text-emerald-800",
  pending: "bg-statusPending/20 border-statusPending text-amber-800",
  verifikasi: "bg-statusVerifikasi/15 border-statusVerifikasi text-blue-800",
  terkunci: "bg-statusTerisi/15 border-statusTerisi text-red-800",
};

export default function SlotButton({ slot, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`aspect-square min-h-[3.25rem] min-w-[3.25rem] rounded-xl border-2 font-mono text-base font-bold transition-transform active:scale-95 hover:scale-105 ${STATUS_BG[slot.status]}`}
      title={`Nomor ${slot.no} — ${slot.status}`}
    >
      {slot.no}
    </button>
  );
}
