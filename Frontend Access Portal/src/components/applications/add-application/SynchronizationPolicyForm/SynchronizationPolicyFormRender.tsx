"use client";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { useForm, useFieldArray } from "react-hook-form";
import {
  SynchronizationPolicyFormSchemaType,
  getDefaultReactions,
  synchronizationActions,
} from "../schemas/synchronizationPolicySchema";
import NavigationButtons from "../NavigationButtons";
import { useRouter } from "next/navigation";
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
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const synchronizationSituations = [
  "UNMATCHED",
  "UNLINKED",
  "LINKED",
  "DELETED",
  "DISPUTED",
] as const;

const syncPolicyFormSchema = z.object({
  reactions: z.array(
    z.object({
      situation: z.enum(synchronizationSituations),
      action: z.enum([
        "add-focus",
        "link",
        "sync",
        "unlink",
        "inactivate-focus",
        "delete-focus",
        "none",
      ]),
    })
  ),
});

type SyncPolicyFormType = z.infer<typeof syncPolicyFormSchema>;

const situationLabels: Record<string, string> = {
  UNMATCHED: "Unmatched",
  UNLINKED: "Unlinked",
  LINKED: "Linked",
  DELETED: "Deleted",
  DISPUTED: "Disputed",
};

const actionLabels: Record<string, string> = {
  "add-focus": "Create Identity",
  link: "Link",
  sync: "Synchronize",
  unlink: "Unlink",
  "inactivate-focus": "Disable Identity",
  "delete-focus": "Delete Identity",
  none: "No Action",
};

export default function SynchronizationPolicyFormRender({
  isAuthoritative,
}: {
  isAuthoritative: boolean;
}) {
  const { finalFormData, handleFormUpdate, incrementStep, handleFinalSubmit, mode, applicationId } =
    useAddApplicationContext();

  const router = useRouter();
  const t = useTranslations(
    "ApplicationsPage.AddApplication.synchronizationPolicy"
  );

  const defaultReactions = getDefaultReactions(isAuthoritative);

  // Non-authoritative apps cannot create/disable/delete identities
  const allowedActions = isAuthoritative
    ? synchronizationActions
    : synchronizationActions.filter(
        (a) => a !== "add-focus" && a !== "inactivate-focus" && a !== "delete-focus"
      );

  const form = useForm<SyncPolicyFormType>({
    resolver: zodResolver(syncPolicyFormSchema),
    defaultValues: finalFormData["synchronizationPolicy"] || {
      reactions: defaultReactions,
    },
  });

  // Auto-save form data when navigating away (unmount)
  useEffect(() => {
    return () => {
      handleFormUpdate("synchronizationPolicy", form.getValues());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { fields } = useFieldArray({
    control: form.control,
    name: "reactions",
  });

  return (
    <Form {...form}>
      <form
        id="sync-policy-form"
        className="flex flex-col h-full"
        onSubmit={form.handleSubmit((data) => {
          handleFormUpdate(
            "synchronizationPolicy",
            data as SynchronizationPolicyFormSchemaType
          );
          incrementStep();
        })}
      >
        <h1 className="mb-2 text-lg font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Define how the system handles each synchronization situation during
          import.
        </p>

        <div className="h-full space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-row gap-4 items-end bg-muted/50 border shadow-sm p-3 rounded-md"
            >
              {/* Situation (read-only display) */}
              <div className="flex flex-col gap-0.5 min-w-[160px]">
                <span className="text-xs ps-1 text-muted-foreground">
                  Situation
                </span>
                <div className="h-9 flex items-center px-3 rounded-md border bg-background text-sm">
                  {situationLabels[field.situation] || field.situation}
                </div>
              </div>

              <ArrowRight className="mb-2.5 size-4 shrink-0 text-muted-foreground" />

              {/* Action selector */}
              <FormField
                control={form.control}
                name={`reactions.${index}.action`}
                render={({ field: actionField }) => (
                  <FormItem className="min-w-[180px]">
                    <Select
                      onValueChange={actionField.onChange}
                      value={actionField.value}
                    >
                      <div className="flex flex-col gap-0.5">
                        <FormLabel className="ps-1 text-muted-foreground text-xs">
                          Action
                        </FormLabel>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedActions.map((action) => (
                            <SelectItem key={action} value={action}>
                              {actionLabels[action] || action}
                            </SelectItem>
                          ))}
                        </SelectContent>
                        <FormMessage />
                      </div>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <NavigationButtons submitting={form.formState.isSubmitting}>
          <div className="flex justify-between w-full gap-2">
            <NavigationButtons.PreviousButton />
            <div className="space-x-2">
              <NavigationButtons.FinishButton
                onClick={async (e) => {
                  e.preventDefault();
                  form.handleSubmit(
                    async (data) => {
                      if (
                        await handleFinalSubmit({
                          synchronizationPolicy:
                            data as SynchronizationPolicyFormSchemaType,
                        })
                      ) {
                        if (mode === "edit" && applicationId) {
                          router.push(`/applications/${applicationId}/overview`);
                        } else {
                          router.push("/applications");
                        }
                      }
                    },
                    (errors) => {
                      console.error("Sync policy save validation errors:", errors);
                      toast.error("Please fix validation errors before saving");
                    }
                  )();
                }}
              />
              <NavigationButtons.NextButton />
            </div>
          </div>
        </NavigationButtons>
      </form>
    </Form>
  );
}
