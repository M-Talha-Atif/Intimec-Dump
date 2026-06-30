"use client"

import { DashboardConfigProvider } from "@/contexts/DashboardConfigContext";
import GovernanceCommandCenter from "@/components/dashboard/GovernanceCommandCenter";

const DashboardPage = () => {
  return (
    <DashboardConfigProvider>
      <GovernanceCommandCenter />
    </DashboardConfigProvider>
  );
};

export default DashboardPage;
