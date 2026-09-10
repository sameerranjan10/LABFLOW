import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Platform Settings & Billing | LabFlow",
  description: "Organization profile, test catalog, collection centers, and subscription billing",
};

export default function SettingsPage() {
  return <SplitScreenDashboard initialView="settings" />;
}
