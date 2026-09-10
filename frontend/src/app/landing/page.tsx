import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "LabFlow | Smart Laboratory Platform",
  description: "Manage orders, samples, processing and results from one operational platform.",
};

export default function LandingRoute() {
  return <SplitScreenDashboard initialView="landing" />;
}
