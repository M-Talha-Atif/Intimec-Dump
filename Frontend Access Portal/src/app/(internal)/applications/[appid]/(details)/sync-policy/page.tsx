"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
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
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const synchronizationSituations = [
  "UNMATCHED",
  "UNLINKED",
  "LINKED",
  "DELETED",
  "DISPUTED",
] as const;

const synchronizationActions = [
  "add-focus",
  "link",
  "sync",
  "unlink",
  "inactivate-focus",
  "delete-focus",
  "none",
] as const;

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

const syncPolicySchema = z.object({
  reactions: z.array(
    z.object({
      situation: z.enum(synchronizationSituations),
      action: z.enum(synchronizationActions),
    })
  ),
});

type SyncPolicyFormType = z.infer<typeof syncPolicySchema>;

export default function SyncPolicyPage() {
  const params = useParams();
  const appId = params.appid as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [identityType, setIdentityType] = useState<string | null>(null);

  const form = useForm<SyncPolicyFormType>({
    resolver: zodResolver(syncPolicySchema),
    defaultValues: {
      reactions: synchronizationSituations.map((situation) => ({
        situation,
        action: "none" as const,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "reactions",
  });

  // Fetch current sync policy
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const appRes = await fetch(`/api/applications/${appId}`);
        if (!appRes.ok) throw new Error("Failed to fetch application");
        const app = await appRes.json();
        setIdentityType(app.identityType || "EMPLOYEE");

        const reactionsRes = await fetch(
          `/api/identity/mapping/policies/${app.identityType || "EMPLOYEE"}/synchronization/reactions?resourceId=${appId}`
        );

        if (reactionsRes.ok) {
          const reactions = await reactionsRes.json();
          if (reactions && reactions.length > 0) {
            const formReactions = synchronizationSituations.map((situation) => {
              const found = reactions.find(
                (r: { situation: string; action: string }) =>
                  r.situation.toUpperCase() === situation
              );
              return {
                situation,
                action: found?.action || "none",
              };
            });
            form.reset({ reactions: formReactions });
          }
        }
      } catch (error) {
        console.error("Failed to fetch sync policy:", error);
        toast.error("Failed to load synchronization policy");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicy();
  }, [appId, form]);

  const onSubmit = async (data: SyncPolicyFormType) => {
    if (!identityType) {
      toast.error("Identity type not determined");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/identity/mapping/policies/${identityType}/synchronization/reactions?resourceId=${appId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.reactions),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save sync policy");
      }

      toast.success("Synchronization policy saved successfully");
    } catch (error) {
      console.error("Failed to save sync policy:", error);
      toast.error("Failed to save synchronization policy");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Synchronization Policy</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define the default action for each synchronization situation. Task-level
          overrides can be configured per execution.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Reaction Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-row gap-4 items-end bg-muted/50 border shadow-sm p-3 rounded-md"
                >
                  {/* Situation (read-only) */}
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
                              {synchronizationActions.map((action) => (
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
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Policy
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
