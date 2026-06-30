import { lazy, Suspense } from "react";
import ApplicationContextProvider from "@/contexts/ApplicationContext";

const ApplicationAuditLogModal = lazy(
  () => import("@/components/applications/AuditLogModal"),
);

const ApplicationExportModal = lazy(
  () => import("@/components/applications/ExportApplicationModal"),
);

const ApplicationImportModal = lazy(
  () => import("@/components/applications/import-application/ImportApplicationModal"),
);

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationContextProvider>
      {children}
      <Suspense fallback={null}>
        <ApplicationAuditLogModal />
        <ApplicationExportModal />
        <ApplicationImportModal />
      </Suspense>
    </ApplicationContextProvider>
  );
}
