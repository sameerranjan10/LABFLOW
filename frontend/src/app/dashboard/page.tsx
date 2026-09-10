import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Operations Dashboard | LabFlow",
  description: "Real-time laboratory workflow and diagnostic operations dashboard",
};

export default function DashboardPage() {
  return <SplitScreenDashboard initialView="dashboard" />;
}
