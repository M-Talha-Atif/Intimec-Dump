import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CoorelationEditor from "./CoorelationEditor";
import clsx from "clsx";
import AttributeCorrelationEditor from "./AttributeCorrelationEditor";
import { get as hookFormGet, UseFormReturn } from "react-hook-form";
import { CorrelationFormSchemaType } from "@/components/applications/add-application/schemas/correlationSchema";

export default function CorrelationSection({
  form,
  name,
}: {
  form: UseFormReturn<CorrelationFormSchemaType>;
  name: keyof CorrelationFormSchemaType;
}) {
  const scriptDataError = hookFormGet(
    form.formState.errors,
    `${name}.script.data`
  );
  const scriptLangError = hookFormGet(
    form.formState.errors,
    `${name}.script.lang`
  );

  return (
    <div className="h-full space-y-4">
      <FormField
        control={form.control}
        name={`${name}.mode`}
        render={({ field }) => (
          <FormItem className="h-full">
            <RadioGroup
              className="flex flex-col"
              value={field.value}
              onValueChange={field.onChange}
            >
              <div className="gap-3 border-1 flex items-start rounded-md p-4">
                <RadioGroupItem value="attribute" id={`${name}-r1`} />
                <div className="flex flex-col gap-2  h-full w-full">
                  <Label htmlFor={`${name}-r1`}>Attribute Matching</Label>
                  <p className="text-muted-foreground text-xs">
                    Match based on common attributes like email, username, or
                    employee ID.
                  </p>
                  {field.value === "attribute" && (
                    <AttributeCorrelationEditor name={name} />
                  )}
                </div>
              </div>
              <div
                className={clsx(
                  "gap-3 border-1 flex items-start rounded-md p-4",
                  field.value === "role-based" && "flex-1"
                )}
              >
                <RadioGroupItem value="role-based" id={`${name}-r2`} />
                <div className="flex flex-col gap-2 h-full w-full">
                  <Label htmlFor={`${name}-r2`}>Rule-Based Matching</Label>
                  <p className="text-muted-foreground text-xs">
                    Use custom rules and transformations for complex matching
                    scenarios.
                  </p>
                  {field.value === "role-based" && (
                    <FormField
                      control={form.control}
                      name={`${name}.script`}
                      render={({ field }) => (
                        <FormItem className="h-full flex flex-col">
                          <FormControl className="flex-1">
                            <CoorelationEditor
                              onChange={field.onChange}
                              value={field.value}
                            />
                          </FormControl>
                          {scriptDataError && (
                            <p className="text-sm text-destructive">
                              {scriptDataError.message}
                            </p>
                          )}
                          {scriptLangError && (
                            <p className="text-sm text-destructive">
                              {scriptLangError.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
              <div className="gap-3 border-1 flex items-start rounded-md p-4">
                <RadioGroupItem value="none" id={`${name}-r3`} />
                <div className="flex flex-col gap-2  h-full w-full">
                  <Label htmlFor={`${name}-r3`}>Do Not Correlate</Label>
                  <p className="text-muted-foreground text-xs">
                    Do not perform any correlation logic for the accounts in this
                    application.
                  </p>
                </div>
              </div>
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
