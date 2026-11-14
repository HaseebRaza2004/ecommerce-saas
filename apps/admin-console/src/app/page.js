"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthPortalCard from "@/components/auth/AuthPortalCard";
import TopHeader from "@/components/layout/TopHeader";
import SidebarNav from "@/components/layout/SidebarNav";
import CommandPalette from "@/components/layout/CommandPalette";
import ActiveSessionsPanel from "@/components/security/ActiveSessionsPanel";
import StaffRbacManager from "@/components/staff/StaffRbacManager";
import Card from "@/components/ui/Card";

export default function AdminConsolePage() {
  const { merchant, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("step1");
  const [searchOpen, setSearchOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-canvas) text-sm font-semibold text-(--text-muted)">
        Verifying Zero-Trust HttpOnly Session...
      </div>
    );
  }

  if (!merchant) {
    return <AuthPortalCard />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-(--bg-canvas) text-(--text-main) pb-16 md:pb-0">
      <TopHeader onOpenSearch={() => setSearchOpen(true)} />
      <div className="flex flex-1">
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          {activeTab === "step1" ? (
            <>
              <ActiveSessionsPanel />
              <StaffRbacManager />
            </>
          ) : (
            <Card
              title={`Module ${activeTab.toUpperCase()} — Ready for Next Step`}
              subtitle="Plug-and-play versioned architecture active"
            >
              <p className="text-xs text-(--text-muted)">
                This module slot is wired in moduleRegistry.js and ready for
                Step 2–5 implementation.
              </p>
            </Card>
          )}
        </main>
      </div>
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectModule={(id) => setActiveTab(id)}
      />
    </div>
  );
}