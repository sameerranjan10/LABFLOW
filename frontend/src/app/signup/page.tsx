import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Create Workspace Account | LabFlow",
  description: "Create an enterprise laboratory account on LabFlow",
};

export default function SignupRoutePage() {
  return <SplitScreenDashboard initialView="signup" />;
}

