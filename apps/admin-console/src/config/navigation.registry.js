export const ROLE_LABELS = Object.freeze({
  super_merchant: "Store Owner",
  store_manager: "Store Manager",
  cashier: "Cashier",
  delivery_rider: "Delivery Rider",
});

export const NAV_GROUPS = Object.freeze([
  {
    id: "overview",
    label: "Command Center",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        roles: ["super_merchant", "store_manager", "cashier", "delivery_rider"],
        ready: true,
      },
      {
        id: "kyc",
        label: "Biometric KYC",
        href: "/kyc",
        icon: "ScanFace",
        roles: ["super_merchant"],
        ready: false,
        stepTag: "Step 2",
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      {
        id: "catalog",
        label: "Categories & Products",
        href: "/products",
        icon: "Package",
        roles: ["super_merchant", "store_manager"],
        ready: false,
        stepTag: "Step 3",
      },
      {
        id: "orders",
        label: "Orders & PIN Unlock",
        href: "/orders",
        icon: "ShoppingBag",
        roles: ["super_merchant", "store_manager", "cashier", "delivery_rider"],
        ready: false,
        stepTag: "Step 4",
      },
      {
        id: "payments",
        label: "Logistics & Payments",
        href: "/payments",
        icon: "CreditCard",
        roles: ["super_merchant"],
        ready: false,
        stepTag: "Step 4",
      },
      {
        id: "storefront",
        label: "Storefront & Policies",
        href: "/storefront",
        icon: "Store",
        roles: ["super_merchant", "store_manager"],
        ready: false,
        stepTag: "Step 5",
      },
    ],
  },
  {
    id: "security",
    label: "Security & Access",
    items: [
      {
        id: "sessions",
        label: "Active Devices",
        href: "/security/sessions",
        icon: "ShieldCheck",
        roles: ["super_merchant", "store_manager", "cashier", "delivery_rider"],
        ready: true,
      },
      {
        id: "staff",
        label: "Staff & Roles",
        href: "/staff",
        icon: "Users",
        roles: ["super_merchant"],
        ready: false,
        stepTag: "Step 2",
      },
    ],
  },
]);

export function filterNavByRole(role) {
  const safeRole = role || "super_merchant";
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(safeRole)),
  })).filter((group) => group.items.length > 0);
};