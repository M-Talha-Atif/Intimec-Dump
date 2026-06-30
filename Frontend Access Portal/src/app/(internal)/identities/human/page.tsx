"use client";

import EmployeeIdentitiesContent from "@/components/human-identities/HumanIdentitiesContent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  IdentityDetailProvider,
  useIdentityDetail,
} from "@/contexts/IdentityDetailContext";
import IdentityDetailPanel from "@/components/users/IdentityDetailPanel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { PeerComparisonProvider } from "@/contexts/PeerComparisonContext";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const EmployeeIdentitiesPageContent = () => {
  const { selectedUser, setSelectedUser } = useIdentityDetail();

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

          <EmployeeIdentitiesContent />
        </div>
      </div>

      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0">
          <VisuallyHidden>
            <DialogTitle>User Details</DialogTitle>
          </VisuallyHidden>

          {selectedUser && (
            <IdentityDetailPanel
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const HumanIdentitiesPage = () => {
  useDocumentTitle("Human Identities");

  return (
    <PeerComparisonProvider>
      <IdentityDetailProvider>
        <EmployeeIdentitiesPageContent />
      </IdentityDetailProvider>
    </PeerComparisonProvider>
  );
};

export default HumanIdentitiesPage;