import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { TaskConfigFormSchemaType } from "./TaskFormSchema";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import CustomBadge from "@/components/applications/common/CustomBadge";

const options = ["full-aggregation", "delta-aggregation"] as const;

export default function AggregationConfigSection({
  name,
}: {
  name: "account" | "entitlement";
}) {
  const {
    control,
    formState: { dirtyFields },
  } = useFormContext<TaskConfigFormSchemaType>();
  const t = useTranslations(
    `ApplicationsPage.Import.configuration.${name}.aggregation-mode`
  );
  const commonT = useTranslations("common");
  const isDirty = Boolean(dirtyFields[name]?.aggregationMode);
  return (
    <div
      className="flex flex-col gap-4 border px-6 py-4 rounded-md dark:data-[dirty=true]:border-yellow-500 data-[dirty=true]:border-yellow-300"
      data-dirty={isDirty}
    >
      <FormField
        control={control}
        name={`${name}.aggregationMode`}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <header>
                <FormLabel className="text-lg">{t("title")}</FormLabel>
                <FormDescription>{t("description")}</FormDescription>
              </header>
              {isDirty && (
                <CustomBadge color="yellow">
                  {commonT("unsaved-changes")}
                </CustomBadge>
              )}
            </div>
            <FormControl>
              <RadioGroup
                className="flex flex-row flex-wrap gap-2"
                defaultValue={options[0]}
                onValueChange={field.onChange}
                value={field.value}
              >
                {options.map((option) => (
                  <FormItem key={option} className="flex-1 min-w-85">
                    <FormLabel
                      className={cn(
                        "flex items-start gap-3 border rounded-md p-4",
                        option === field.value && "border-primary"
                      )}
                    >
                      <FormControl>
                        <RadioGroupItem value={option} />
                      </FormControl>
                      <div className="flex flex-col items-start gap-2">
                        <h3>{t(`options.${option}.label`)}</h3>
                        <FormDescription>
                          {t(`options.${option}.description`)}
                        </FormDescription>
                      </div>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
