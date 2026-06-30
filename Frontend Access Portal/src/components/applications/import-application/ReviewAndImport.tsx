import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SheetFooter } from "@/components/ui/sheet";
import { useImportApplicationContext } from "@/contexts/ImportApplicationContext";
import { useTranslations } from "next-intl";
import React from "react";

export default function ReviewAndImport() {
  const { config, prevStep, finish } = useImportApplicationContext();

  const tCommon = useTranslations("common");

  return (
    <>
      <Card className="mx-4">
        <CardContent className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{config?.details.name}</h1>
          <p>{config?.details.description}</p>

          <h2 className="text-lg font-semibold">Schema Definitions</h2>
          {config?.schema.definitions.map((definition, index) => (
            <div key={index} className="border rounded-md p-2">
              <h3 className="font-semibold">{definition.objectClass}</h3>
              <p>Type: {definition.type}</p>
              <p>Display Attribute: {definition.displayAttribute}</p>
              <h4>Attributes:</h4>
              <ul className="list-disc list-inside">
                {definition.attributes.map((attr, attrIndex) => (
                  <li key={attrIndex}>
                    {attr.name} ({attr.type})
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Button onClick={finish} className="w-fit">{tCommon("actions.finish")}</Button>
        </CardContent>
      </Card>
      <SheetFooter className="flex justify-between flex-row gap-2">
        <Button variant="outline" onClick={prevStep}>
          {tCommon("actions.prev")}
        </Button>
      </SheetFooter>
    </>
  );
}
