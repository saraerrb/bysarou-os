"use client";

import { Search, Bell, User } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header
      style={{
        height: "72px",
        borderBottom: "1px solid var(--color-outline-variant)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        background: "var(--color-surface)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Title */}
      <div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 400,
            fontFamily: "var(--font-noto-serif), serif",
            letterSpacing: "-0.01em",
            color: "var(--color-on-surface)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="label-caps"
            style={{
              fontSize: "10px",
              marginTop: "4px",
              opacity: 0.8
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            background: "var(--color-surface-container)",
            border: "1px solid var(--color-outline-variant)",
            cursor: "pointer",
            transition: "all 200ms ease",
          }}
        >
          <Search size={15} style={{ color: "var(--color-outline)" }} />
          <span
            style={{
              fontSize: "13px",
              color: "var(--color-outline)",
            }}
          >
            Search...
          </span>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 6px",
              background: "var(--color-surface-container-high)",
              color: "var(--color-outline)",
              fontWeight: 500,
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Notifications */}
        <button
          className="btn-ghost btn-icon"
          style={{
            position: "relative",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-on-surface-variant)",
          }}
        >
          <Bell size={18} />
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--color-primary)",
            }}
          />
        </button>

        {/* User Avatar */}
        <div
          style={{
            width: 40,
            height: 40,
            background: "var(--color-surface-container-high)",
            border: "1px solid var(--color-outline-variant)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden"
          }}
        >
          <User size={18} color="var(--color-primary)" />
        </div>
      </div>
    </header>
  );
}
