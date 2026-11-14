"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useToast } from "@/context/ToastContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import SlideDrawer from "@/components/ui/SlideDrawer";

const ROLE_OPTS = [
  { value: "store_manager", label: "Store Manager (Catalog & Orders)" },
  { value: "cashier", label: "POS Cashier (Terminal Only)" },
  { value: "delivery_rider", label: "Delivery Rider (6-Digit PIN Unlocker)" },
];

export default function StaffRbacManager() {
  const { role } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [staffList, setStaffList] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "delivery_rider",
  });

  const reloadStaff = useCallback(async () => {
    if (role !== "super_merchant") return;
    try {
      const data = await apiRequest("/api/v1/staff");
      setStaffList(Array.isArray(data) ? data : data?.items || []);
    } catch {
      setStaffList([]);
    }
  }, [role]);

  useEffect(() => {
    let isMounted = true;
    if (role !== "super_merchant") return undefined;
    (async () => {
      try {
        const data = await apiRequest("/api/v1/staff");
        if (isMounted)
          setStaffList(Array.isArray(data) ? data : data?.items || []);
      } catch {
        if (isMounted) setStaffList([]);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [role]);

  if (role !== "super_merchant") return null;

  const createStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest("/api/v1/staff", { method: "POST", body: form });
      showToast("Staff account created!", "success");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "delivery_rider",
      });
      setDrawerOpen(false);
      await reloadStaff();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title={t("staffManagerTitle")}
      subtitle="Tier 2+ Role-Based Access Control (RBAC)"
      action={
        <Button size="sm" onClick={() => setDrawerOpen(true)}>
          + {t("addStaffBtn")}
        </Button>
      }
    >
      <div className="space-y-2">
        {staffList.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-(--border-subtle) bg-(--bg-canvas) px-4 py-2.5 text-xs"
          >
            <div>
              <strong className="text-(--text-main)">{m.name}</strong> (
              {m.email}) <Badge variant="brand">{m.role}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                apiRequest(`/api/v1/staff/${m.id}`, { method: "DELETE" }).then(
                  reloadStaff,
                )
              }
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>
      <SlideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t("addStaffBtn")}
      >
        <form onSubmit={createStaff} className="space-y-3.5">
          <Input
            label="Staff Full Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Staff Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Select
            label="Assigned Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={ROLE_OPTS}
          />
          <Input
            label="Temporary Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" loading={submitting} fullWidth>
            {t("addStaffBtn")}
          </Button>
        </form>
      </SlideDrawer>
    </Card>
  );
}