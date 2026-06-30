import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import { useImportApplicationContext } from "@/contexts/ImportApplicationContext";
import { useConnectorTest } from "@/hooks/applications/useConnectorTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { capitalize } from "lodash";
import { Check, Loader2, TestTubeDiagonal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod/v3";
import { isEqual } from "lodash";

const variablesSchema = z.object({
  variables: z.array(
    z.object({
      key: z.string(),
      value: z.string().trim().min(1, "This field is required"),
    }),
  ),
});

type FormValues = z.infer<typeof variablesSchema>;

const connectionStateMap = {
  default: { icon: <TestTubeDiagonal />, key: "label" },
  loading: {
    icon: <Loader2 className="animate-spin" />,
    key: "loading",
  },
  error: { icon: <X className="text-destructive" />, key: "retry" },
  success: { icon: <Check className="text-green-500" />, key: "success" },
} as const;

export default function VariablesForm() {
  const tCommon = useTranslations("common");
  const t = useTranslations("application.import-modal.variables");
  const { variables, nextStep, prevStep, submitVariables, config } =
    useImportApplicationContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(variablesSchema),
    defaultValues: {
      variables: variables.map((variable) => ({
        key: variable.key,
        value: variable.value ?? "",
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "variables",
  });

  const {
    trigger: testConnection,
    isMutating: isLoading,
    error,
    data: testResult,
  } = useConnectorTest(config?.details ?? null);

  const connectionStatus = useMemo(() => {
    if (isLoading) return "loading";
    if (error) return "error";
    if (testResult?.data?.status === "success") return "success";
    return "default";
  }, [isLoading, error, testResult]);

  const onSubmit = (data: FormValues) => {
    submitVariables(data.variables);
    nextStep();
  };

  const [passedValues, setPassedValues] = useState<FormValues | null>(
    variables.length > 0 ? form.getValues() : null,
  );

  const onTestSubmit = async (data: FormValues) => {
    if (!config) return;

    const result = await testConnection(
      data.variables.reduce(
        (acc, variable) => {
          acc[variable.key] = variable.value;
          return acc;
        },
        {} as Record<string, string>,
      ),
    );

    if (result?.data?.status === "success") {
      setPassedValues(data);
    }
  };

  const formData = form.watch();

  const testPassed = useMemo(() => {
    return isEqual(passedValues, formData);
  }, [passedValues, formData]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(25rem,1fr))] gap-4 px-4 py-6">
            {fields.map((fieldVar, index) => (
              <FormField
                key={fieldVar.id}
                control={form.control}
                name={`variables.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="flex flex-col items-start gap-1">
                      {capitalize(variables[index].key)}
                    </FormLabel>
                    <FormMessage />
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || "")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </form>
      </Form>
      <SheetFooter className="justify-between flex flex-row">
        <Button variant="outline" onClick={prevStep}>
          {tCommon("actions.prev")}
        </Button>
        <div className="flex items-center gap-2">
          {error && (
            <p className="text-destructive text-right">{error?.message}</p>
          )}
          <Button
            variant="outline"
            onClick={form.handleSubmit(onTestSubmit)}
            disabled={form.formState.isSubmitting}
          >
            {connectionStateMap[connectionStatus].icon}
            {t(`test-connection.${connectionStateMap[connectionStatus].key}`)}
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              form.formState.isSubmitting ||
              !form.formState.isValid ||
              !testPassed // Ensure values haven't changed since passing test
            }
          >
            {tCommon("actions.next")}
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}
