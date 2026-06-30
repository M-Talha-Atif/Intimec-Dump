"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  ConnectorFormSchemaType,
  getConnectorZodSchema,
} from "../schemas/connectorSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DynamicFormInput from "./DynamicFormInput";
import RequiredFormLabel from "@/components/applications/add-application/common/RequiredFormLabel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import { Connector } from "@/types/add-application";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import DOMPurify from "dompurify";
import linkifyHtml from "linkify-html";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  Info,
  Loader2,
  TestTubeDiagonal,
  Upload,
  X,
} from "lucide-react";
import useSWRMutation from "swr/mutation";
import { postFetcher } from "@/hooks/applications/fetcher";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ImportJsonButton from "../common/ImportJsonButton";
import NavigationButtons from "../NavigationButtons";
import TestConnectionButton from "./TestConnectionButton";
import ObjectTypeConfigurator from "./ObjectTypeConfigurator";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { SearchInput } from "@/components/ui/input";

function camelToTitleCase(str: string): string {
  if (!str) return "";

  const result = str
    // Add a space before capital letters that are followed by lowercase letters
    // OR between a lowercase/digit followed by an uppercase letter
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    // Optional: handle cases like "getHTTPResponseCode" → "Get HTTP Response Code"
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

  // Capitalize the first letter of each word
  return result
    .split(" ")
    .map((word) =>
      word.length > 1 && word === word.toUpperCase() // acronym? keep as-is
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function getSafeFormDescription(description: string): { __html: string } {
  const cleaned = DOMPurify.sanitize(description);
  if (!cleaned) return { __html: "" };
  const linked = linkifyHtml(cleaned, {
    defaultProtocol: "https",
    className: "text-blue-400 hover:underline",
    target: {
      url: "_blank",
    },
    rel: "noopener noreferrer",
    validate: {
      url: (value) => {
        return /^(https?:\/\/|ftp:\/\/)/i.test(value); // allow links starting with http/https/ftp
      },
    },
  });
  if (!linked) return { __html: "" };
  const output = DOMPurify.sanitize(linked, {
    ADD_ATTR: ["target", "rel"],
  });
  if (!output) return { __html: "" };
  // Return the sanitized HTML
  return { __html: output };
}

function getIsScript(attribute: string) {
  const name = attribute.toLowerCase();
  return (
    name.endsWith("script") || name.includes("query") || name.includes("json")
  );
}
const connectionStateMap = {
  default: { icon: <TestTubeDiagonal />, label: "Test connection" },
  loading: {
    icon: <Loader2 className="animate-spin" />,
    label: "Connecting...",
  },
  error: { icon: <X className="text-destructive" />, label: "Retry" },
  success: { icon: <Check className="text-green-500" />, label: "Connected" },
};

export default function ConnectorFormRender({
  schema,
  connector,
  defaultValues,
}: {
  schema: ReturnType<typeof getConnectorZodSchema>["schema"];
  connector: Connector;
  defaultValues: ConnectorFormSchemaType;
}) {
  const { finalFormData, handleFormUpdate, incrementStep } =
    useAddApplicationContext();

  const form = useForm<ConnectorFormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, ...finalFormData["connector"] },
  });

  // Auto-save form data when navigating away (unmount)
  useEffect(() => {
    return () => {
      handleFormUpdate("connector", form.getValues());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentFormData = form.watch();

  const {
    data: testStatus,
    isMutating,
    error: testError,
    trigger: testTrigger,
  } = useSWRMutation(
    `/api/applications/add-application/connectors/${connector.id}/test`,
    postFetcher("Failed to test connector"),
    {
      throwOnError: false,
      revalidate: false,
      populateCache: false,
    }
  );

  const connectionState = isMutating
    ? connectionStateMap["loading"]
    : testError
    ? connectionStateMap["error"]
    : testStatus?.data?.status === "success"
    ? connectionStateMap["success"]
    : connectionStateMap["default"];

  const [sortAsc, setSortAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Check if this connector supports objectClassDefinition (e.g., CSV connector)
  const hasObjectClassDef = connector.configurationProperties.some(
    (p) => p.name === "objectClassDefinition"
  );

  const sortedProperties = useMemo(
    () =>
      [...connector.configurationProperties]
        // Hide objectClassDefinition from normal fields — rendered as structured UI
        .filter((property) => property.name !== "objectClassDefinition")
        .filter((property) =>
          property.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (a.required && !b.required) return -1;
          if (!a.required && b.required) return 1;
          return sortAsc
            ? a.displayName.localeCompare(b.displayName)
            : b.displayName.localeCompare(a.displayName);
        }),
    [connector.configurationProperties, sortAsc, searchTerm]
  );

  return (
    <Form {...form}>
      <form
        id="connector-form"
        className="flex flex-col h-full"
        onSubmit={form.handleSubmit((data) => {
          handleFormUpdate("connector", data);
          incrementStep();
        })}
      >
        <header className="flex items-center justify-between mb-4 font-semibold text-md">
          {connector.displayName} Configuration
          <div className="flex flex-row items-center gap-2">
            <SearchInput
              placeholder="Search for a field..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm font-normal"
            />
            <Button
              onClick={() => setSortAsc(!sortAsc)}
              type="button"
              variant="outline"
            >
              Sort Fields: {sortAsc ? <ArrowDownAZ /> : <ArrowUpAZ />}
            </Button>
            <ImportJsonButton
              onImport={(data) => {
                const parseResults = schema.safeParse(data);
                if (!parseResults.success) {
                  toast.error("Failed to import attributes: Invalid format");
                  return;
                }
                form.reset(parseResults.data);
                toast.success(
                  `Imported ${Object.keys(parseResults.data).length} Fields`
                );
              }}
              variant="outline"
            >
              <Upload /> Import
            </ImportJsonButton>
          </div>
        </header>
        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 gap-4 m-2 lg:grid-cols-2">
            {sortedProperties.map((property, index) => (
              <FormField
                control={form.control}
                key={property.name + property.helpMessage + index}
                name={property.name}
                render={({ field }) => {
                  const LabelComponent = property.required
                    ? RequiredFormLabel
                    : FormLabel;
                  const isScript = getIsScript(property.name);
                  return (
                    <FormItem className="flex flex-col">
                      <Tooltip>
                        <div className="flex items-center">
                          <LabelComponent>
                            {camelToTitleCase(property.displayName)}
                          </LabelComponent>
                          {property.displayName !== property.helpMessage && (
                            <TooltipTrigger onClick={(e) => e.preventDefault()}>
                              <Info className="w-4 h-4 ml-1 text-blue-400 hover:text-blue-600" />
                            </TooltipTrigger>
                          )}
                        </div>
                        <TooltipContent>
                          <p
                            dangerouslySetInnerHTML={getSafeFormDescription(
                              property.helpMessage || ""
                            )}
                            className="max-w-md text-wrap"
                          />
                        </TooltipContent>
                      </Tooltip>
                      <FormControl>
                        <DynamicFormInput
                          type={property.type}
                          confidential={property.confidential}
                          field={field}
                          isScript={isScript}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>

          {/* Structured Object Type Configurator (replaces raw objectClassDefinition file input) */}
          {hasObjectClassDef && (
            <div className="m-2 mt-4">
              <FormField
                control={form.control}
                name="objectClassDefinition"
                render={({ field }) => (
                  <ObjectTypeConfigurator
                    value={field.value as string}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          )}
        </ScrollArea>

        <NavigationButtons
          disableNext={
            form.formState.isSubmitting ||
            Object.keys(form.formState.errors).length > 0 ||
            (testStatus?.data?.status !== "success" &&
              JSON.stringify(currentFormData, (_, value) =>
                typeof value === "bigint" ? value.toString() : value
              ) !==
                JSON.stringify(finalFormData["connector"], (_, value) =>
                  typeof value === "bigint" ? value.toString() : value
                )) ||
            testError
          }
        >
          <div className="flex flex-row items-center justify-between gap-2 pt-2 border-t-1">
            <div className="flex flex-row items-center gap-2">
              <NavigationButtons.PreviousButton />
              <TestConnectionButton
                isMutating={isMutating}
                onClick={async () => {
                  // Only validate connection-related fields, not optional fields like objectClassDefinition
                  const fieldsToValidate = connector.configurationProperties
                    .filter((p) => p.name !== "objectClassDefinition")
                    .map((p) => p.name);
                  const isValid = await form.trigger(fieldsToValidate);
                  if (!isValid) return;
                  testTrigger(form.getValues());
                }}
                connectionState={connectionState}
                testError={testError}
              />
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex w-fit">
                  <NavigationButtons.NextButton />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Test the connector to enable next button</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </NavigationButtons>
      </form>
    </Form>
  );
}
