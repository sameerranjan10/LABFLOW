import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Enterprise Login | LabFlow",
  description: "Enterprise laboratory workstation authentication and single sign-on",
};

export default function LoginPage() {
  return <SplitScreenDashboard initialView="login" />;
}
