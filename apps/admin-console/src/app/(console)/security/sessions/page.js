import { SessionsSecurityView } from "@/components/sessions/SessionsSecurityView";

export const instant = false;

export const metadata = {
  title: "Active Devices — Commercia Console",
};

export default function SessionsSecurityPage() {
  return <SessionsSecurityView />;
};