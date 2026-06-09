import { ORDER_STATUSES } from "@/lib/constants";

interface Props {
  status: string;
}

export default function OrderStatusBadge({ status }: Props) {
  const config = ORDER_STATUSES.find((s) => s.value === status) || {
    label: status,
    color: "var(--color-outline)",
    bg: "var(--color-surface-container)",
  };

  return (
    <span
      className="px-3 py-1 font-label-caps text-[9px] tracking-widest uppercase inline-block luxury-card-shadow"
      style={{
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
