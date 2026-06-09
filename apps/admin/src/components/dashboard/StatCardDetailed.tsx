import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  subtitle?: string;
}

export default function StatCardDetailed({ label, value, icon: Icon, color, bg, subtitle }: Props) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-sm)",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {subtitle && (
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            {subtitle}
          </span>
        )}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2px" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}
