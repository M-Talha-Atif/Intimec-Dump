"use client";

import IdentityGroupsContent from "@/components/identity-groups/IdentityGroupsContent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  ResizablePanelGroup,
  ResizablePanel,
} from "@/components/ui/resizable";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const IdentityGroupsPage = () => {

  useDocumentTitle('Identity Groups');
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={100}>
        <main className="h-full overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* <Link
              href="/identities"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Identities</span>
            </Link> */}

            <IdentityGroupsContent />
          </div>
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default IdentityGroupsPage;