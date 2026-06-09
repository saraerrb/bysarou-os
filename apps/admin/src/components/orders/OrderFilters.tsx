"use client";

import { Search, Filter, X } from "lucide-react";
import { ORDER_STATUSES, MOROCCAN_CITIES } from "@/lib/constants";

interface Props {
  filters: {
    status: string;
    city: string;
    search: string;
  };
  setFilters: (filters: any) => void;
}

export default function OrderFilters({ filters, setFilters }: Props) {
  const clearFilters = () => {
    setFilters({ status: "", city: "", search: "" });
  };

  const hasFilters = filters.status || filters.city || filters.search;

  return (
    <div className="card" style={{ marginBottom: "24px", padding: "16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            className="input"
            placeholder="Search customer, phone..."
            style={{ paddingLeft: "40px" }}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Status Filter */}
        <select
          className="input"
          style={{ width: "auto" }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        {/* City Filter */}
        <select
          className="input"
          style={{ width: "auto" }}
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        >
          <option value="">All Cities</option>
          {MOROCCAN_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={clearFilters}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
