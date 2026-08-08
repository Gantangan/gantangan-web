import SlotButton from "@/components/SlotButton";

export default function SlotGrid({ slots, onSlotClick }) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
      {slots.map((slot) => (
        <SlotButton key={slot.no} slot={slot} onClick={() => onSlotClick(slot)} />
      ))}
    </div>
  );
}
