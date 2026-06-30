import { useEffect } from "react";
import {
  ConnectorAttribute,
  MetaSystemAttribute,
} from "@/types/add-application";

import { Form } from "@/components/ui/form";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { Resolver, useForm } from "react-hook-form";
import {
  getCorrelationFormSchema,
  CorrelationFormSchemaType,
} from "../schemas/correlationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";

import {
  Tabs,
  TabsContent,
  // TabsList, TabsTrigger
} from "@/components/ui/tabs";
import CorrelationSection from "./CorrelationSection";
import NavigationButtons from "../NavigationButtons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Mode = "attribute" | "role-based" | "none";

// const activeBranchFields: Record<
//   Mode | "none",
//   Path<CorrelationFormSchemaType["manager"]>[]
// > = {
//   attribute: ["ruleGroup"],
//   "role-based": ["script"],
//   none: [],
// };

export default function CorrelationFormRender({
  accountAttributes,
  systemAttributes,
}: {
  accountAttributes: ConnectorAttribute[];
  systemAttributes: MetaSystemAttribute[];
}) {
  const { finalFormData, handleFormUpdate, incrementStep, handleFinalSubmit, mode, applicationId } =
    useAddApplicationContext();

  const router = useRouter();

  const resolver = useMemo(
    () =>
      zodResolver(
        getCorrelationFormSchema(systemAttributes, accountAttributes)
      ) as Resolver<CorrelationFormSchemaType>,
    [systemAttributes, accountAttributes]
  );

  const form = useForm<CorrelationFormSchemaType>({
    resolver,
    defaultValues: finalFormData["correlation"] || {
      account: {
        mode: "attribute" as Mode,
        ruleGroup: {
          combinator: "and",
          rules: [],
        },
        script: {
          lang: "typescript",
          data: "",
        },
      },
      manager: {
        mode: "none" as Mode | "none",
        ruleGroup: {
          combinator: "and",
          rules: [],
        },
        script: {
          lang: "typescript",
          data: "",
        },
      },
    },
  });

  // Auto-save form data when navigating away (unmount)
  useEffect(() => {
    return () => {
      handleFormUpdate("correlation", form.getValues());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const hasAccountErrors =
  //   activeBranchFields[form.watch("account.mode")]?.some(
  //     (field) => !!hookFormGet(form.formState.errors, `account.${field}`)
  //   ) ?? false;

  // const hasManagerErrors =
  //   activeBranchFields[form.watch("manager.mode")]?.some(
  //     (field) => !!hookFormGet(form.formState.errors, `manager.${field}`)
  //   ) ?? false;

  return (
    <Form {...form}>
      <form
        id="details-form"
        className="flex flex-col h-full gap-2"
        onSubmit={form.handleSubmit(
          (data) => {
            handleFormUpdate("correlation", data);
            incrementStep();
          },
          (errors) => {
            console.error("Correlation form validation errors:", errors);
            toast.error("Correlation validation failed — check console for details");
          }
        )}
      >
        <h1 className="mb-2 text-lg font-semibold">Correlation Logic</h1>
        <Tabs defaultValue="account" className="flex-1 h-full">
          {/* <TabsList className="w-full">
            <TabsTrigger
              value="account"
              className={clsx(
                "px-4",
                hasAccountErrors && "text-destructive dark:text-destructive"
              )}
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="manager"
              className={clsx(
                "px-4",
                hasManagerErrors && "text-destructive dark:text-destructive"
              )}
            >
              Manager
            </TabsTrigger>
          </TabsList> */}
          <TabsContent
            value="account"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            <CorrelationSection form={form} name="account" />
          </TabsContent>
          {/* <TabsContent
            value="manager"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            <CorrelationSection
              form={form}
              name="manager"
            />
          </TabsContent> */}
        </Tabs>
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
                          correlation: data,
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
                      console.error("Correlation save validation errors:", errors);
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
