import { formatWaNumber } from "@/utils/format";

export function buildWaLink(slot, catName) {
  const nomor = formatWaNumber(slot.hp);
  const pesan =
    `Halo ${slot.pemilik},\n\n` +
    `Pembayaran ${catName}\n` +
    `Nomor ${slot.no}\n` +
    `Burung: ${slot.burung}\n\n` +
    `Sudah kami terima.\n\n` +
    `Terima kasih.`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}
