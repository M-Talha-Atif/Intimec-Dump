import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, useFormContext } from "react-hook-form";

import { scenairoSchema } from "./TaskFormSchema";
import CustomBadge from "../../common/CustomBadge";

export default function ScenariosConfigSection() {
  const {
    control,
    formState: { dirtyFields },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "account.scenarios",
  });
  const isDirty = Boolean(dirtyFields.account?.scenarios?.length);
  const t = useTranslations("ApplicationsPage.Import.configuration.scenarios");
  const commonT = useTranslations("common");
  return (
    <div
      className="flex flex-col gap-4 border px-6 py-4 rounded-md dark:data-[dirty=true]:border-yellow-500 data-[dirty=true]:border-yellow-300"
      data-dirty={isDirty}
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <CustomBadge color="yellow">
              {commonT("unsaved-changes")}
            </CustomBadge>
          )}
          <Button
            type="button"
            onClick={() => append({ scenario: "deleted", action: "sync" })}
          >
            <Plus className="size-4" /> Add Scenario
          </Button>
        </div>
      </header>
      <div className="gap-2 flex flex-col">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-row gap-4 items-end bg-muted/50 border-1 shadow-sm p-2 rounded-md"
          >
            <FormField
              control={control}
              name={`account.scenarios.${index}.scenario` as const}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <div className="flex flex-col gap-0.5">
                      <FormLabel className="ps-1 text-muted-foreground">
                        Scenario
                      </FormLabel>
                      <FormControl>
                        <SelectTrigger className="min-w-40 bg-background">
                          <SelectValue placeholder="Select Scenario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scenairoSchema.shape.scenario.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {t(`scenarios.${option}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      <FormMessage />
                    </div>
                  </Select>
                </FormItem>
              )}
            />

            <ArrowRight className="h-full mb-2.5 size-4 text-muted-foreground" />

            <FormField
              control={control}
              name={`account.scenarios.${index}.action` as const}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <div className="flex flex-col gap-0.5">
                      <FormLabel className="ps-1 text-muted-foreground">
                        Action
                      </FormLabel>
                      <FormControl>
                        <SelectTrigger className="min-w-40 bg-background">
                          <SelectValue placeholder="Select Action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scenairoSchema.shape.action.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {t(`actions.${option}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      <FormMessage />
                    </div>
                  </Select>
                </FormItem>
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive ml-auto"
              onClick={() => remove(index)}
            >
              <Trash />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
