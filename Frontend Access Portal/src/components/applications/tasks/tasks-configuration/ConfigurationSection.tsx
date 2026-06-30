import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TaskConfigFormSchemaType } from "./TaskFormSchema";
import ScenariosConfigSection from "./SenariosConfigSection";
import AggregationConfigSection from "./AggregationConfigSection";

import { useTranslations } from "next-intl";
import CustomBadge from "../../common/CustomBadge";

export const entitlementOptions = [
  "refresh-entitlement-assignments",
  "check-request-policies",
  "refresh-the-entitlement-risk-scorecards",
  "maintain-entitlement-histories",
  "detect-orphaned-entitlements",
  "map-to-business-roles",
] as const;

export const entitlementsAdvancedOptions = [
  "max-deleted-entitlements",
  "entitlements-per-partition",
] as const;

export const accountsOptions = [
  "refresh-roles",
  "check-active-policies",
] as const;

export const accountsAdvancedOptions = [
  "maximum-deleted-accounts",
  "objects-per-partition",
  "loss-limit",
] as const;

const optionsMap = {
  account: accountsOptions,
  entitlement: entitlementOptions,
} as const;
const advancedOptionsMap = {
  account: accountsAdvancedOptions,
  entitlement: entitlementsAdvancedOptions,
} as const;

export default function ConfigurationSection({
  name,
}: {
  name: "account" | "entitlement";
}) {
  const options = optionsMap[name];
  const advancedOptions = advancedOptionsMap[name];
  const {
    control,
    formState: { dirtyFields, errors },
  } = useFormContext<TaskConfigFormSchemaType>();

  const isEnabled = useWatch({ control, name: `${name}.enabled` });

  const t = useTranslations(`ApplicationsPage.Import.configuration.${name}`);
  const commonT = useTranslations("common");
  const dirtySection = dirtyFields[name] as Partial<
    Record<(typeof options)[number] | (typeof advancedOptions)[number], boolean>
  >;
  const isDirtyOptions = Boolean(options.some((item) => dirtySection?.[item]));
  const isDirtyAdvancedOptions = Boolean(
    advancedOptions.some((item) => dirtySection?.[item])
  );

  const enabledError = errors?.account?.enabled?.message;

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center justify-between border px-6 py-4 rounded-md">
        <div>
          <h1 className="text-lg font-semibold">{t("toggle.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("toggle.description")}
          </p>
          {enabledError && (
            <p className="text-sm text-destructive mt-1">{enabledError}</p>
          )}
        </div>
        <FormField
          control={control}
          name={`${name}.enabled`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className={isEnabled ? "" : "opacity-50 pointer-events-none"}>
        <div className="flex flex-col gap-4">
      <ScenariosConfigSection />
      <AggregationConfigSection name={name} />
      <div
        className="flex flex-col gap-4 border px-6 py-4 rounded-md dark:data-[dirty=true]:border-yellow-500 data-[dirty=true]:border-yellow-300"
        data-dirty={isDirtyOptions}
      >
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {t("aggregation-option.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("aggregation-option.description")}
            </p>
          </div>
          {isDirtyOptions && (
            <CustomBadge color="yellow">
              {commonT("unsaved-changes")}
            </CustomBadge>
          )}
        </header>
        <main className="flex flex-col gap-4">
          {options.map((option) => (
            <FormField
              key={option}
              control={control}
              name={
                `${name}.${option}` as
                  | `${"entitlement"}.${(typeof entitlementOptions)[number]}`
                  | `${"account"}.${(typeof accountsOptions)[number]}`
              }
              render={({ field }) => (
                <FormItem className="flex items-start gap-2 flex-1 min-w-60">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <div className="flex flex-col items-start gap-1">
                    <FormLabel>
                      {t(`aggregation-option.options.${option}.label`)}
                    </FormLabel>
                    <FormDescription>
                      {t(`aggregation-option.options.${option}.description`)}
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          ))}
        </main>
      </div>
      <div
        className="flex flex-col gap-4 border px-6 py-4 rounded-md dark:data-[dirty=true]:border-yellow-500 data-[dirty=true]:border-yellow-300"
        data-dirty={isDirtyAdvancedOptions}
      >
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {t("advanced-options.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("advanced-options.description")}
            </p>
          </div>
          {isDirtyAdvancedOptions && (
            <CustomBadge color="yellow">
              {commonT("unsaved-changes")}
            </CustomBadge>
          )}
        </header>
        <main className="flex flex-row gap-2 flex-wrap">
          {advancedOptions.map((option) => (
            <FormField
              key={option}
              control={control}
              name={
                `${name}.${option}` as
                  | `${"entitlement"}.${(typeof entitlementsAdvancedOptions)[number]}`
                  | `${"account"}.${(typeof accountsAdvancedOptions)[number]}`
              }
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2 flex-1 min-w-60">
                  <FormLabel className=" flex items-center gap-1">
                    {t(`advanced-options.options.${option}.label`)}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="size-4 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {t(`advanced-options.options.${option}.description`)}
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="Enter count..."
                      value={field.value as number}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^-?\d*$/.test(value)) {
                          // If the input is not a valid number, clear the field
                          field.onChange(0);
                          return;
                        }
                        if (value === "-" || value === "") {
                          field.onChange(0); // Clear the field if empty
                          return;
                        }
                        const num = parseInt(value, 10);
                        if (num < Number.MIN_SAFE_INTEGER)
                          field.onChange(Number.MIN_SAFE_INTEGER);
                        else if (num > Number.MAX_SAFE_INTEGER)
                          field.onChange(Number.MAX_SAFE_INTEGER);
                        else field.onChange(num);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </main>
      </div>
      </div>
      </div>
    </main>
  );
}
