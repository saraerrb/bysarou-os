"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Hexagon,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import StoreSwitcher from "./StoreSwitcher";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setUser(data.user);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // RBAC Filtering
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;

    const rolePermissions: Record<string, string[]> = {
      MANAGER: ["/", "/inventory", "/orders", "/shipping"],
      CALL_AGENT: ["/confirmation"],
      WAREHOUSE: ["/inventory", "/shipping"],
      FINANCE: ["/finance"],
    };

    const allowedPaths = rolePermissions[user.role] || [];
    return allowedPaths.some(path => item.href === path || (path !== "/" && item.href.startsWith(path)));
  });

  return (
    <aside
      className="fade-in"
      style={{
        width: collapsed ? "80px" : "260px",
        minHeight: "100vh",
        background: "var(--color-surface-container)",
        borderRight: "1px solid var(--color-outline-variant)",
        display: "flex",
        flexDirection: "column",
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* Brand & Store Switcher */}
      <div
        style={{
          padding: "24px 0",
          borderBottom: "1px solid var(--color-outline-variant)",
          minHeight: "72px",
        }}
        suppressHydrationWarning
      >
        {!collapsed ? (
          <StoreSwitcher />
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, background: "var(--color-primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Hexagon size={18} color="white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
        }}
      >
        {filteredNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const isDisabled = "disabled" in item && item.disabled;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              onClick={(e) => isDisabled && e.preventDefault()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: collapsed ? "12px 0" : "12px 20px",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 500,
                letterSpacing: "0.05em",
                color: isDisabled
                  ? "var(--color-outline-variant)"
                  : isActive
                    ? "var(--color-primary)"
                    : "var(--color-on-surface-variant)",
                background: isActive
                  ? "rgba(119, 90, 25, 0.05)"
                  : "transparent",
                textDecoration: "none",
                transition: "all 200ms ease",
                cursor: isDisabled ? "not-allowed" : "pointer",
                justifyContent: collapsed ? "center" : "flex-start",
                opacity: isDisabled ? 0.4 : 1,
                position: "relative",
                fontFamily: "var(--font-inter), sans-serif",
                textTransform: "uppercase",
              }}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 18,
                    background: "var(--color-primary)",
                  }}
                />
              )}
              <Icon
                size={20}
                style={{
                  flexShrink: 0,
                  color: isActive
                    ? "var(--color-primary-container)"
                    : undefined,
                }}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid var(--color-outline-variant)",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}
      >
        {!collapsed && user && (
          <div style={{ padding: "0 12px 8px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 32, height: 32, background: "var(--color-surface-container-high)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserIcon size={16} color="var(--color-outline)" />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: "10px", color: "var(--color-primary)", fontWeight: 700, letterSpacing: "0.02em" }}>{user.role}</div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "12px",
            padding: "10px 12px",
            fontSize: "13px",
            color: "var(--color-error)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 200ms ease",
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Log Out</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "12px",
            padding: "10px 12px",
            fontSize: "13px",
            color: "var(--color-outline)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 200ms ease",
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
