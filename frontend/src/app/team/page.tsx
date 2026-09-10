import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Laboratory Team | LabFlow",
  description: "Laboratory staff roster, operational duty assignments, and qualifications",
};

export default function TeamPage() {
  return <SplitScreenDashboard initialView="team" />;
}
