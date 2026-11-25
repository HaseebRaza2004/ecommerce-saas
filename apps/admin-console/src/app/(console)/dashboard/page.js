import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export const instant = false;

export const metadata = {
  title: "Dashboard — Commercia Console",
};

export default function DashboardPage() {
  return <DashboardOverview />;
};