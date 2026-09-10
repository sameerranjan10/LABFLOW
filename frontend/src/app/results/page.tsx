import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Result Review & Sign-Off | LabFlow",
  description: "Pathologist verification queue, clinical panic alerts, and digital attestation",
};

export default function ResultsPage() {
  return <SplitScreenDashboard initialView="results" />;
}
