import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Order Management | LabFlow",
  description: "Create, filter, and track clinical laboratory requisitions and test orders",
};

export default function OrdersPage() {
  return <SplitScreenDashboard initialView="orders" />;
}
