"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { useTranslations } from "next-intl";
import ImportApplicationContextProvider, {
  useImportApplicationContext,
} from "@/contexts/ImportApplicationContext";
import ConfigUploadForm from "./ConfigUploadForm";
import FormSteps from "./FormSteps";
import VariablesForm from "./VariablesForm";
import ValidationForm from "./ValidationForm";
import ReviewAndImport from "./ReviewAndImport";

export default function ImportApplicationModal() {
  const { modalState, closeApplicationDialog } = useApplicationContext();

  const t = useTranslations("application.import-modal");
  const isOpen = modalState?.type === "import-application";

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeApplicationDialog();
        }
      }}
    >
      <SheetContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="overflow-hidden flex flex-col"
        minWidth={760} //760px
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <ImportApplicationContextProvider>
          <ImportApplicationModalContent />
        </ImportApplicationContextProvider>
      </SheetContent>
    </Sheet>
  );
}

function ImportApplicationModalContent() {
  const { step } = useImportApplicationContext();
  return (
    <>
      <FormSteps />
      {step === "configuration" && <ConfigUploadForm />}
      {step === "variables" && <VariablesForm />}
      {step === "validation" && <ValidationForm />}
      {step === "review" && <ReviewAndImport />}
    </>
  );
}
