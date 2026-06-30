"use client";

import NonHumanIdentitiesContent from "@/components/non-human-identities/NonHumanIdentitiesContent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NhiDetailProvider, useNhiDetail } from "@/contexts/NhiDetailContext";
import { IdentityDetailPanel } from "@/components/non-human-identities/IdentityDetailPanel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";


const NonHumanIdentitiesPageContent = () => {
  const { selectedNhi, setSelectedNhi } = useNhiDetail();
   

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

          <NonHumanIdentitiesContent />
        </div>
      </div>

      <Dialog
        open={!!selectedNhi}
        onOpenChange={(open) => {
          if (!open) setSelectedNhi(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0">
          <VisuallyHidden>
            <DialogTitle>Non Human Identity Details</DialogTitle>
          </VisuallyHidden>

          {selectedNhi && (
            <IdentityDetailPanel
              identity={selectedNhi}
              onClose={() => setSelectedNhi(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const NonHumanIdentitiesPage = () => {
  useDocumentTitle("Non-Human Identities");

  return (
    <NhiDetailProvider>
      <NonHumanIdentitiesPageContent />
    </NhiDetailProvider>
  );
};

export default NonHumanIdentitiesPage;