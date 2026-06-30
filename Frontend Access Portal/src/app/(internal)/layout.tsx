"use server";
import Navbar from "@/components/nav-bar/Navbar";
import { IdleTimerProvider } from "@/contexts/IdleTimerContext";
import { AuthLayout } from "@/components/AuthLayout";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import DashboardClientWrapper from "@/components/DashboardClientWrapper";
import Footer from "@/components/Footer";
import { AIAssistantButton } from "@/components/ai/AIAssistant";
import PageAccessCheck from "@/components/PageAccessCheck";
import { getUserProfile } from "../actions/get-user-profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserProfile();
  return (
    <IdleTimerProvider>
      <AuthLayout>
        <DashboardClientWrapper>
          <SidebarProvider className="flex flex-col min-h-screen [--header-height:calc(--spacing(14))]">
            <Navbar username={user?.username ?? ''} displayName={user?.displayName ?? ''} />
            {/* Main content with sidebar */}
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <SidebarInset className="pt-[var(--header-height)] overflow-hidden flex-1">
                <div className="h-full overflow-hidden">
                  <PageAccessCheck>
                    {children}
                  </PageAccessCheck>
                </div>
              </SidebarInset>
              <AIAssistantButton />
            </div>
            <Footer />
          </SidebarProvider>
        </DashboardClientWrapper>
      </AuthLayout>
    </IdleTimerProvider>
  );
}
