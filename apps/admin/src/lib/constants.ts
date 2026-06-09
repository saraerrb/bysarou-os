import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  RotateCcw,
  Phone,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  Zap,
} from "lucide-react";

export const APP_NAME = "BySarou OS";
export const APP_DESCRIPTION = "COD Commerce Operating System";

export const ORDER_STATUSES = [
  { value: "NEW", label: "New", color: "var(--color-primary)", bg: "var(--color-primary-container)" },
  {
    value: "PENDING_CONFIRMATION",
    label: "Pending Confirmation",
    color: "var(--color-outline)",
    bg: "var(--color-surface-container)"
  },
  {
    value: "CALL_LATER",
    label: "Call Later",
    color: "var(--color-secondary)",
    bg: "var(--color-secondary-container)"
  },
  {
    value: "NO_ANSWER",
    label: "No Answer",
    color: "var(--color-error)",
    bg: "var(--color-error-container)"
  },
  {
    value: "WRONG_NUMBER",
    label: "Wrong Number",
    color: "var(--color-outline)",
    bg: "var(--color-surface-container-highest)"
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
    color: "var(--color-on-primary)",
    bg: "var(--color-primary)"
  },
  {
    value: "SHIPPED",
    label: "Shipped",
    color: "var(--color-primary)",
    bg: "var(--color-primary-fixed)"
  },
  {
    value: "DELIVERED",
    label: "Delivered",
    color: "var(--color-on-primary)",
    bg: "var(--color-primary)"
  },
  {
    value: "RETURNED",
    label: "Returned",
    color: "var(--color-error)",
    bg: "var(--color-error-container)"
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "var(--color-on-error)",
    bg: "var(--color-error)"
  },
  {
    value: "FAKE",
    label: "Fake",
    color: "var(--color-outline)",
    bg: "var(--color-inverse-on-surface)"
  },
] as const;

export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Safi",
  "Mohammédia",
  "Khouribga",
  "El Jadida",
  "Béni Mellal",
  "Nador",
  "Taza",
  "Settat",
  "Temara",
] as const;

export const RETURN_REASONS = [
  { value: "SIZE_ISSUE", label: "Size Issue" },
  { value: "REFUSED_BY_CUSTOMER", label: "Refused by Customer" },
  { value: "NOT_REACHABLE", label: "Not Reachable" },
  { value: "WRONG_PRODUCT", label: "Wrong Product" },
  { value: "DAMAGED_PRODUCT", label: "Damaged Product" },
  { value: "CHANGED_MIND", label: "Changed Mind" },
  { value: "OTHER", label: "Other" },
] as const;

export const RETURN_STATUSES = [
  { value: "PENDING", label: "Pending", color: "var(--warning)", bg: "var(--warning-bg)" },
  { value: "RECEIVED", label: "Received", color: "var(--info)", bg: "var(--info-bg)" },
  { value: "RESTOCKED", label: "Restocked", color: "var(--success)", bg: "var(--success-bg)" },
  { value: "DAMAGED", label: "Damaged", color: "var(--danger)", bg: "var(--danger-bg)" },
] as const;

export const SHIPPING_STATUSES = [
  { value: "READY_TO_SHIP", label: "Ready to Ship", color: "var(--info)", bg: "var(--info-bg)" },
  { value: "PICKED_UP", label: "Picked Up", color: "#6c5ce7", bg: "rgba(108, 92, 231, 0.15)" },
  { value: "IN_TRANSIT", label: "In Transit", color: "#0984e3", bg: "rgba(9, 132, 227, 0.15)" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "#e17055", bg: "rgba(225, 112, 85, 0.15)" },
  { value: "DELIVERED", label: "Delivered", color: "var(--success)", bg: "var(--success-bg)" },
  { value: "FAILED_DELIVERY", label: "Failed Delivery", color: "var(--danger)", bg: "var(--danger-bg)" },
  { value: "RETURNED", label: "Returned", color: "#636e72", bg: "rgba(99, 110, 114, 0.15)" },
] as const;

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    label: "Confirmation",
    href: "/confirmation",
    icon: Phone,
  },
  {
    label: "Shipping",
    href: "/shipping",
    icon: Truck,
  },
  {
    label: "Returns",
    href: "/returns",
    icon: RotateCcw,
  },
  {
    label: "Finance",
    href: "/finance",
    icon: DollarSign,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Team",
    href: "/users",
    icon: Users,
  },
  {
    label: "Automations",
    href: "/automations",
    icon: Zap,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;
