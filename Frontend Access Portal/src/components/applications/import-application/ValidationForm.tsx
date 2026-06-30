import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { useImportApplicationContext } from "@/contexts/ImportApplicationContext";
import { useTranslations } from "next-intl";
import React from "react";
import { get } from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Info, Loader2, TriangleAlert } from "lucide-react";

export default function ValidationForm() {
  const tCommon = useTranslations("common");
  const t = useTranslations("application.import-modal.validation");
  const {
    nextStep,
    prevStep,
    validationError,
    validationPassed,
    validationData,
    validationLoading,
    config,
  } = useImportApplicationContext();

  const warns = validationData?.warns || validationError?.warns || [];

  return (
    <>
      <div className="flex flex-col gap-4 flex-1 px-4 overflow-hidden">
        {validationPassed && (
          <Card className="border-green-500 bg-green-500/10">
            <CardContent className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle />
              {warns.length === 0 && t("validation-passed")}
              {warns.length > 0 &&
                t("validation-passed-with-warns")}
            </CardContent>
          </Card>
        )}
        {validationError && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Info />
                <p>
                  {t("validation-errors", {
                    count: validationError.errors.length,
                  })}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationError.errors.map((error, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-md text-destructive"
                >
                  <span className="font-semibold">
                    {get(config, error.field) ?? error.field}:{" "}
                  </span>
                  {error.message}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {warns && warns.length > 0 && (
          <Card className="border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <TriangleAlert />
                <p>
                  {t("validation-warnings", {
                    count: warns.length,
                  })}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {warns.map((warn, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-md text-yellow-600"
                >
                  <span className="font-semibold">
                    {get(config, warn.field) ?? warn.field}:{" "}
                  </span>
                  {warn.message}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {validationLoading && (
          <div className="flex-1 flex justify-center items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin size-12" />
          </div>
        )}
      </div>
      <SheetFooter className="flex-row justify-between">
        <Button
          className="w-fit"
          variant="outline"
          onClick={() => {
            prevStep();
          }}
        >
          {tCommon("actions.prev")}
        </Button>
        <Button
          className="w-fit"
          disabled={!validationPassed}
          onClick={() => {
            nextStep();
          }}
        >
          {tCommon("actions.next")}
        </Button>
      </SheetFooter>
    </>
  );
}
