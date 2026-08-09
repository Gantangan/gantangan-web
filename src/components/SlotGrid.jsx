import SlotButton from "@/components/SlotButton";
import { SLOT_ROWS_PER_COLUMN } from "@/constants";

// Susun nomor gantangan pola "ular": kolom 1 dari atas ke bawah,
// kolom 2 dari bawah ke atas (menyambung di baris bawah), kolom 3 atas ke bawah lagi, dst.
// Contoh (ROWS=8): kolom1 = 1..8 (turun), kolom2 = 16..9 (naik dari bawah).
function buildSnakeLayout(totalSlots, rows) {
  const numColumns = Math.max(1, Math.ceil(totalSlots / rows));
  const positions = []; // { no, row, col }
  for (let col = 0; col < numColumns; col++) {
    const colStart = col * rows;
    const colCount = Math.min(rows, totalSlots - colStart);
    if (colCount <= 0) break;
    const reversed = col % 2 === 1;
    for (let i = 0; i < colCount; i++) {
      if (!reversed) {
        // kolom genap (0,2,4,...): atas ke bawah, rata atas
        positions.push({ no: colStart + i + 1, row: i, col });
      } else {
        // kolom ganjil (1,3,5,...): bawah ke atas, rata bawah (biar nyambung visual)
        positions.push({ no: colStart + colCount - i, row: rows - colCount + i, col });
      }
    }
  }
  return { positions, numColumns };
}

export default function SlotGrid({ slots, onSlotClick }) {
  const slotByNo = {};
  slots.forEach((s) => (slotByNo[s.no] = s));

  const { positions, numColumns } = buildSnakeLayout(slots.length, SLOT_ROWS_PER_COLUMN);

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${numColumns}, minmax(2.75rem, 1fr))`,
        gridTemplateRows: `repeat(${SLOT_ROWS_PER_COLUMN}, minmax(2.75rem, 1fr))`,
      }}
    >
      {positions.map(({ no, row, col }) => {
        const slot = slotByNo[no];
        if (!slot) return null;
        return (
          <div key={no} style={{ gridColumn: col + 1, gridRow: row + 1 }}>
            <SlotButton slot={slot} onClick={() => onSlotClick(slot)} />
          </div>
        );
      })}
    </div>
  );
}
