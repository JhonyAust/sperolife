import { Clock } from "lucide-react";

// Marks a cart/order line that is a pre-order (out-of-stock size ordered in advance)
export default function PreorderBadge({ note, className = "" }: { note?: string; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 ${className}`}>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
        <Clock className="h-3 w-3" />
        Pre-order
      </span>
      {note && <span className="text-[11px] text-amber-800">{note}</span>}
    </span>
  );
}
