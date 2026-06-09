interface InsightItem {
  name: string;
  value?: number;
  quantity?: number;
}

interface Props {
  title: string;
  items: InsightItem[];
  type: "count" | "amount";
}

export default function InsightsList({ title, items, type }: Props) {
  const max = items.length > 0 ? (items[0].value || items[0].quantity || 1) : 1;

  return (
    <div className="card" style={{ height: "100%" }}>
      <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
        {title}
      </h3>
      {items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item, i) => {
            const val = item.value || item.quantity || 0;
            const percentage = (val / max) * 100;
            
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{item.name}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    {val} {type === "count" ? "units" : ""}
                  </span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      height: "100%", 
                      width: `${percentage}%`, 
                      background: i === 0 ? "var(--primary)" : "rgba(108, 92, 231, 0.4)",
                      borderRadius: "3px",
                      transition: "width 1s ease-out"
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
          No sales data yet
        </div>
      )}
    </div>
  );
}
