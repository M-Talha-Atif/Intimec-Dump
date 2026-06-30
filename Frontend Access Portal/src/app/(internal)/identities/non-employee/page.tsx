"use client";

import NonEmployeeContent from "@/components/non-employee/NonEmployeeContent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  NonEmployeeDetailProvider,
  useNonEmployeeDetail,
} from "@/contexts/NonEmployeeDetailContext";
import { NonEmployeeDetailPanel } from "@/components/non-employee/NonEmployeeDetailPanel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const NonEmployeeIdentitiesPageContent = () => {
  const { selectedNonEmployee, setSelectedNonEmployee } =
    useNonEmployeeDetail();

  return (
    <>
      <div className="h-full overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* <Link
            href="/identities"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Identities</span>
          </Link> */}

          <NonEmployeeContent />
        </div>
      </div>

      <Dialog
        open={!!selectedNonEmployee}
        onOpenChange={(open) => {
          if (!open) setSelectedNonEmployee(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0">
          <VisuallyHidden>
            <DialogTitle>Non Employee Details</DialogTitle>
          </VisuallyHidden>

          {selectedNonEmployee && (
            <NonEmployeeDetailPanel
              nonEmployee={selectedNonEmployee}
              onClose={() => setSelectedNonEmployee(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const NonEmployeeIdentitiesPage = () => {
  useDocumentTitle("Non-Employee Identities");

  return (
    <NonEmployeeDetailProvider>
      <NonEmployeeIdentitiesPageContent />
    </NonEmployeeDetailProvider>
  );
};

export default NonEmployeeIdentitiesPage;