"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  ScanFace,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";
import { filterNavByRole, ROLE_LABELS } from "@/config/navigation.registry";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";

const ICONS = {
  LayoutDashboard,
  ScanFace,
  Package,
  ShoppingBag,
  CreditCard,
  Store,
  ShieldCheck,
  Users,
};

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, logout } = useAuth();
  const { t } = useLocale();
  const { showToast } = useToast();
  const groups = filterNavByRole(role);

  const storeLabel = user?.storeName || user?.store_name || t("consoleBadge");
  const emailLabel = user?.email || "Merchant";
  const initials = emailLabel.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    showToast({
      title: t("logout"),
      message: "Signed out safely.",
      tone: "info",
    });
    router.replace("/login");
  };

  const navContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-ink">
      <div className="flex h-15 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-ink">
            C
          </span>
          {!collapsed && (
            <div className="min-w-0 text-start">
              <p className="truncate text-sm font-bold">{BRAND_CONFIG.name}</p>
              <p className="truncate text-[11px] text-sidebar-muted">
                {storeLabel}
              </p>
            </div>
          )}
        </Link>
        <Button
          variant="sidebarGhost"
          size="iconSm"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:inline-flex"
        >
          <ChevronLeft
            className={`size-4 transition-transform duration-200 rtl:rotate-180 ${collapsed ? "rotate-180 rtl:rotate-0" : ""}`}
          />
        </Button>
        <Button
          variant="sidebarGhost"
          size="iconSm"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden"
        >
          <X className="size-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 pb-1 text-start text-[10px] font-semibold tracking-wider uppercase text-sidebar-muted">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] || LayoutDashboard;
              const active = pathname === item.href;
              const baseCls = `group flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                active
                  ? "bg-brand text-brand-ink shadow-xs"
                  : item.ready
                    ? "text-sidebar-ink/85 hover:bg-white/8 hover:text-white"
                    : "cursor-not-allowed text-sidebar-muted/60"
              }`;

              return item.ready ? (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={baseCls}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              ) : (
                <div
                  key={item.id}
                  title={
                    collapsed ? `${item.label} (${item.stepTag})` : undefined
                  }
                  className={baseCls}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-start">
                        {item.label}
                      </span>
                      <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px]">
                        {item.stepTag}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <div
          className={`flex items-center gap-2.5 rounded-xl bg-white/6 p-2 ${collapsed ? "flex-col justify-center" : ""}`}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/30 text-xs font-bold text-white">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-start">
              <p
                className="truncate text-xs font-semibold text-white"
                dir="ltr"
              >
                {emailLabel}
              </p>
              <p className="truncate text-[11px] text-accent">
                {ROLE_LABELS[role] || "Store Owner"}
              </p>
            </div>
          )}
          <Button
            variant="sidebarGhost"
            size="iconSm"
            onClick={handleLogout}
            aria-label={t("logout")}
            title={t("logout")}
            className="shrink-0 hover:bg-danger/20 hover:text-danger"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden shrink-0 border-e border-line transition-[width] duration-200 lg:block ${collapsed ? "w-18" : "w-60"}`}
      >
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            aria-hidden="true"
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/45"
          />
          <aside className="relative z-10 h-full w-64 shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};