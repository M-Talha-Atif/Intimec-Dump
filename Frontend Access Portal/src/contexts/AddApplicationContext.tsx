"use client";
import {
  ConnectorAttribute,
  FinalFormData,
  FinalFormDataOutput,
  MetaSystemAttribute,
  RecivedApplication,
} from "@/types/add-application";
export type { FinalFormData } from "@/types/add-application";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AuthSchemaFromSchemaType,
  NonAuthSchemaFromSchemaType,
  EntitlementFormFields,
} from "@/components/applications/add-application/schemas/schemaFormSchema";
import useSystemAttributes from "@/hooks/applications/add-application/useSystemAttributes";
import useFormSubmit from "@/hooks/applications/add-application/useFormSubmit";
import { toast } from "sonner";

const stepsMap: (keyof FinalFormData)[] = [
  "details",
  "connector",
  "schema",
  "correlation",
  "synchronizationPolicy",
  "access",
  "visibility",
  "provisioning",
];

const getOutputData = (finalData: FinalFormData): FinalFormDataOutput => {
  const { schemaId, ...detailsWithoutSchemaId } = finalData.details!;
  
  return {
  details: {
    ...detailsWithoutSchemaId,
    identityType: schemaId, // Backend needs identityType (schemaId from form is actually the identity type)
    schemaId: undefined, // Don't send schemaId as it's not a UUID yet
  },
  connector: finalData.connector!,
  schema: {
    definitions: [
      {
        objectClass: finalData.schema?.account.name || "",
        displayAttribute:
          finalData.schema?.account.accountDisplayNameAttribute || "",
        type: "account" as const,
        attributes:
          finalData.schema?.account.attributes?.map((attr) => ({
            name: attr.name,
            type: attr.type,
            category: attr.category,
            ...(attr.description?.trim() !== "" && {
              description: attr.description,
            }),
            ...(attr.flags && {
              flags: attr.flags,
            }),
          })) || [],
      },
      ...((finalData.schema as EntitlementFormFields)?.entitlements?.map(
        (entitlement) => ({
          objectClass: entitlement.name,
          displayAttribute: entitlement.entitlementDisplayNameAttribute || "",
          descriptionAttribute: entitlement.entitlementDescriptionAttribute || "",
          type: "entitlement" as const,
          attributes:
            entitlement.attributes?.map((attr) => ({
              name: attr.name,
              type: attr.type,
              ...(attr.description?.trim() !== "" && {
                description: attr.description,
              }),
              ...(attr.flags && {
                flags: attr.flags,
              }),
            })) || [],
        }),
      ) || []),
    ],
  },
  correlation: finalData.correlation?.account || null,
  ...(finalData.details?.isAuthoritative && {
    attributeMappings: {
      attributeMappings: (
        finalData.schema as AuthSchemaFromSchemaType
      )?.account.attributes
        .filter((attr) => attr.targetAttribute != null)
        .map((attr) => ({
          targetAttributeName: attr.targetAttribute!.systemKey,
          sourceAttributeName: attr.name,
          mode: attr.transformation!.mode,
          ...(attr.transformation?.mode === "script" && {
            script: attr.transformation.script,
          }),
        })),
    },
  }),
  access: finalData.access,
  synchronizationPolicy: finalData.synchronizationPolicy ? {
    reactions: finalData.synchronizationPolicy.reactions.map(r => ({
      situation: r.situation,
      action: r.action,
    })),
  } : undefined,
  visibility: finalData.visibility,
  provisioning: finalData.provisioning,
  };
};

const AddApplicationContext = createContext<{
  // Mode
  mode: "create" | "edit";
  applicationId?: string;

  // State management for the current form step
  currentFormStep: keyof FinalFormData;
  incrementStep: () => void;
  decrementStep: () => void;
  goToStep: (step: keyof FinalFormData) => void;
  isStepReachable: (step: keyof FinalFormData) => boolean;
  highestStepReached: number;
  getStepIndex: (step: keyof FinalFormData) => number;
  getStepName: (index: number) => keyof FinalFormData | null;

  // Update submitted form data
  handleFormUpdate: <K extends keyof FinalFormData>(
    step: K,
    data: FinalFormData[K],
  ) => void;

  systemAttributes: MetaSystemAttribute[] | undefined;
  accountAttributes: ConnectorAttribute[] | undefined;
  loadingSystemAttributes: boolean;
  errorLoadingSystemAttributes: Error | null;
  refreshSystemAttributes: () => void;

  handleFinalSubmit: (
    data: Partial<FinalFormData>,
  ) => boolean | Promise<boolean>;

  // Final form data to be submitted
  finalFormData: FinalFormData;
} | null>(null);

/**
 * Converts a backend `RecivedApplication` (FinalFormDataOutput shape) back
 * into the `FinalFormData` shape expected by each form step.
 */
function convertReceivedToFormData(app: RecivedApplication): FinalFormData {
  const accountDef = app.schema?.definitions?.find(
    (d) => d.type === "account"
  );
  const entitlementDefs = app.schema?.definitions?.filter(
    (d) => d.type === "entitlement"
  );

  // Map correlation back to the form format { account: ..., manager: ... }
  // getOutputData sends correlation = finalData.correlation?.account (just the
  // discriminated union), so the backend stores and returns the inner section.
  // We need to wrap it back into { account: ..., manager: ... } and ensure
  // each rule has `valueSource: "value"` which react-querybuilder expects.
  const defaultManagerSection = {
    mode: "none" as const,
  };

  function ensureValueSource(section: Record<string, unknown> | undefined | null) {
    if (!section) return undefined;
    const mode = section.mode as string;
    if (mode === "attribute" && section.ruleGroup) {
      return {
        ...section,
        ruleGroup: addValueSourceToRuleGroup(section.ruleGroup as Record<string, unknown>),
      };
    }
    return section;
  }

  function addValueSourceToRuleGroup(rg: Record<string, unknown>): Record<string, unknown> {
    if (!rg || typeof rg !== "object") return rg;
    const rules = rg.rules as Record<string, unknown>[] | undefined;
    if (!Array.isArray(rules)) return rg;
    return {
      ...rg,
      rules: rules.map((r) => {
        if ("combinator" in r) {
          // Nested group
          return addValueSourceToRuleGroup(r);
        }
        // Leaf rule — ensure valueSource is present
        return { valueSource: "value", ...r };
      }),
    };
  }

  const rawCorrelation = app.correlation as Record<string, unknown> | null | undefined;
  let correlation: FinalFormData["correlation"] | undefined;
  if (rawCorrelation) {
    // Backend stores just the account discriminated union (getOutputData sends
    // correlation: finalData.correlation?.account). So rawCorrelation is
    // something like { mode: "attribute", ruleGroup: { ... } }
    const fixedAccount = ensureValueSource(rawCorrelation);
    correlation = {
      account: fixedAccount,
      manager: defaultManagerSection,
    } as FinalFormData["correlation"];
  }

  // Map sync policy
  const synchronizationPolicy = app.synchronizationPolicy
    ? {
        reactions: app.synchronizationPolicy.reactions.map((r) => ({
          situation: r.situation as "UNMATCHED" | "UNLINKED" | "LINKED" | "DELETED" | "DISPUTED",
          action: r.action as "add-focus" | "link" | "sync" | "unlink" | "inactivate-focus" | "delete-focus" | "none",
        })),
      }
    : undefined;

  const isAuthoritative = app.details?.isAuthoritative ?? false;

  // Extract attribute mappings for authoritative apps
  // getOutputData sends { attributeMappings: { attributeMappings: [...] } }
  // so the backend may return either the nested or flat format
  type MappingEntry = {
    sourceAttributeName: string;
    targetAttributeName: string;
    mode: string;
    script?: { data: string; lang: string };
  };
  let mappings: MappingEntry[] = [];
  if (isAuthoritative && app.attributeMappings) {
    if (Array.isArray(app.attributeMappings)) {
      mappings = app.attributeMappings as unknown as MappingEntry[];
    } else if (
      typeof app.attributeMappings === "object" &&
      "attributeMappings" in app.attributeMappings &&
      Array.isArray(
        (app.attributeMappings as { attributeMappings: MappingEntry[] })
          .attributeMappings
      )
    ) {
      mappings = (
        app.attributeMappings as { attributeMappings: MappingEntry[] }
      ).attributeMappings;
    }
  }

  // Build account attributes — for authoritative apps, merge targetAttribute
  // and transformation from attributeMappings back into each attribute
  const accountAttributes =
    accountDef?.attributes?.map((attr) => {
      const base = {
        name: attr.name,
        type: attr.type,
        category: (attr.category ?? "metadata") as
          | "identity"
          | "entitlement"
          | "risk"
          | "metadata",
        description: attr.description ?? undefined,
        flags: attr.flags ?? undefined,
      };

      if (!isAuthoritative) return base;

      // Authoritative: merge targetAttribute + transformation from mappings
      const mapping = mappings.find(
        (m) => m.sourceAttributeName === attr.name
      );
      if (mapping) {
        const normalizedMode = (mapping.mode?.toLowerCase() || "default") as
          | "default"
          | "uppercase"
          | "lowercase"
          | "script";
        return {
          ...base,
          targetAttribute: {
            // systemKey is the key; dataType and displayName are placeholders
            // that will be resolved once systemAttributes are loaded
            systemKey: mapping.targetAttributeName,
            dataType: "__pending__",
            displayName: mapping.targetAttributeName,
          },
          transformation: {
            mode: normalizedMode,
            ...(normalizedMode === "script" && mapping.script
              ? { script: mapping.script }
              : {}),
          },
        };
      }
      return { ...base, targetAttribute: null, transformation: null };
    }) ?? [];

  return {
    details: {
      name: app.details?.name ?? "",
      owner: app.details?.owner ?? [],
      businessOwner: app.details?.businessOwner ?? [],
      connectorId: app.details?.connectorId ?? "",
      category: app.details?.category ?? [],
      isAuthoritative,
      schemaId: app.details?.identityType ?? "",
      riskLevel: (app.details?.riskLevel ?? "Low") as "Low" | "Medium" | "High",
      complianceLabels: app.details?.complianceLabels ?? [],
      scopes: app.details?.scopes ?? [],
      department: app.details?.department ?? null,
      description: app.details?.description ?? "",
    },
    connector: app.connector as FinalFormData["connector"],
    schema: accountDef
      ? {
          account: {
            name: accountDef.objectClass ?? "__ACCOUNT__",
            accountDisplayNameAttribute: accountDef.displayAttribute ?? "",
            attributes: accountAttributes,
          },
          ...(entitlementDefs && entitlementDefs.length > 0
            ? {
                entitlements: entitlementDefs.map((entDef) => ({
                  name: entDef.objectClass ?? "",
                  entitlementDisplayNameAttribute: entDef.displayAttribute ?? "",
                  entitlementDescriptionAttribute: entDef.descriptionAttribute ?? "",
                  attributes: entDef.attributes?.map((attr) => ({
                    name: attr.name,
                    type: attr.type,
                    description: attr.description ?? undefined,
                    flags: attr.flags ?? undefined,
                  })) ?? [],
                })),
              }
            : {}),
        } as FinalFormData["schema"]
      : undefined,
    correlation: correlation as FinalFormData["correlation"],
    access: app.access as FinalFormData["access"],
    synchronizationPolicy,
    visibility: app.visibility as FinalFormData["visibility"],
    provisioning: app.provisioning,
  };
}

export default function AddApplicationContextProvider({
  children,
  mode = "create",
  applicationId,
  initialData,
}: {
  children: React.ReactNode;
  mode?: "create" | "edit";
  applicationId?: string;
  initialData?: RecivedApplication | null;
}) {
  const [currentFormStep, setCurrentFormStep] =
    useState<keyof FinalFormData>("details");
  const [highestStepReached, setHighestStepReached] = useState(
    mode === "edit" ? stepsMap.length - 1 : 0
  );

  const initialFormData = initialData
    ? convertReceivedToFormData(initialData)
    : {};
  const [finalFormData, setFinalFormData] = useState<FinalFormData>(initialFormData);

  // Track whether this is the initial mount to avoid resetting connector/schema
  // data that was pre-populated from the backend in edit mode.
  const isInitialMount = useRef(true);
  useEffect(() => {
    // After the first render cycle, mark as no longer initial
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const {
    attributes: systemAttributes,
    isLoading: loadingSystemAttributes,
    error: errorLoadingSystemAttributes,
    refresh: refreshSystemAttributes,
  } = useSystemAttributes(finalFormData.details?.schemaId);

  // In edit mode for authoritative apps, resolve placeholder targetAttribute
  // values (dataType, displayName) once systemAttributes are loaded.
  const resolvedTargetAttrsRef = useRef(false);
  useEffect(() => {
    if (
      resolvedTargetAttrsRef.current ||
      !systemAttributes?.length ||
      !finalFormData.details?.isAuthoritative ||
      mode !== "edit"
    )
      return;

    const schema = finalFormData.schema as AuthSchemaFromSchemaType | undefined;
    const attrs = schema?.account?.attributes;
    if (!attrs?.length) return;

    const needsResolve = attrs.some(
      (a) =>
        a.targetAttribute &&
        (a.targetAttribute as { dataType?: string }).dataType === "__pending__"
    );
    if (!needsResolve) return;

    resolvedTargetAttrsRef.current = true;
    setFinalFormData((prev) => {
      const prevSchema = prev.schema as AuthSchemaFromSchemaType | undefined;
      if (!prevSchema?.account?.attributes) return prev;

      return {
        ...prev,
        schema: {
          ...prevSchema,
          account: {
            ...prevSchema.account,
            attributes: prevSchema.account.attributes.map((attr) => {
              if (!attr.targetAttribute) return attr;
              const sysAttr = systemAttributes.find(
                (sa) => sa.systemKey === attr.targetAttribute!.systemKey
              );
              if (!sysAttr) return attr;
              return {
                ...attr,
                targetAttribute: {
                  systemKey: sysAttr.systemKey,
                  dataType: sysAttr.dataType,
                  displayName: sysAttr.displayName,
                },
              };
            }),
          },
        } as FinalFormData["schema"],
      };
    });
  }, [systemAttributes, finalFormData.details?.isAuthoritative, mode]);

  const { submitForm } = useFormSubmit({
    mode: mode === "edit" ? "edit" : "create",
    applicationId,
    onSuccess: (data) => {
      console.log(
        mode === "edit"
          ? "Application updated successfully:"
          : "Application created successfully:",
        data
      );
    },
    onError: (error) => {
      console.error(
        mode === "edit"
          ? "Error updating application:"
          : "Error creating application:",
        error
      );
    },
  });

  const handleFormUpdate = useCallback(
    <K extends keyof FinalFormData>(step: K, data: FinalFormData[K]) => {
      setFinalFormData((prev) => ({
        ...prev,
        [step]: data,
      }));
    },
    [],
  );

  const handleFinalSubmit = async (data: Partial<FinalFormData>) => {
    const finalDataMerged = {
      ...finalFormData,
      ...data,
    };
    getOutputData(finalDataMerged);
    console.log("Final data", finalDataMerged);
    try {
      await submitForm(getOutputData(finalDataMerged));
      setFinalFormData(finalDataMerged);
      toast.success(
        mode === "edit"
          ? "Application updated successfully"
          : "Application created successfully"
      );
      return true;
    } catch (e) {
      console.error(e);
      toast.error(
        mode === "edit"
          ? "Failed to update application"
          : "Failed to create application"
      );
      return false;
    }
  };

  const accountAttributes = finalFormData.schema?.account.attributes;

  const incrementStep = useCallback(() => {
    setCurrentFormStep((prev) => {
      const currentIndex = stepsMap.indexOf(prev);
      if (currentIndex + 1 >= stepsMap.length) return prev;
      const nextIndex = currentIndex + 1;
      setHighestStepReached((h) => Math.max(h, nextIndex));
      return stepsMap[nextIndex];
    });
  }, []);

  const decrementStep = useCallback(() => {
    setCurrentFormStep((prev) => {
      const currentIndex = stepsMap.indexOf(prev);
      if (currentIndex - 1 < 0) return prev;
      const next = stepsMap[currentIndex - 1];
      return next;
    });
  }, []);

  const goToStep = useCallback((step: keyof FinalFormData) => {
    const targetIndex = stepsMap.indexOf(step);
    if (targetIndex >= 0 && targetIndex <= highestStepReached) {
      setCurrentFormStep(step);
    }
  }, [highestStepReached]);

  const isStepReachable = useCallback(
    (step: keyof FinalFormData) => stepsMap.indexOf(step) <= highestStepReached,
    [highestStepReached]
  );

  // New helpers
  const getStepIndex = useCallback(
    (step: keyof FinalFormData) => stepsMap.indexOf(step),
    [],
  );

  const getStepName = useCallback(
    (index: number): keyof FinalFormData | null =>
      index >= 0 && index < stepsMap.length ? stepsMap[index] : null,
    [],
  );

  useEffect(() => {
    // In edit mode, don't reset on initial mount — the data is pre-populated
    if (isInitialMount.current) return;
    setFinalFormData((prev) => ({
      ...prev,
      connector: undefined,
      schema: undefined,
      correlation: undefined,
    }));
  }, [finalFormData.details?.connectorId]);

  useEffect(() => {
    if (isInitialMount.current) return;
    setFinalFormData((prev) => ({
      ...prev,
      schema: undefined,
    }));
  }, [finalFormData.details?.isAuthoritative]);

  return (
    <AddApplicationContext.Provider
      value={{
        mode,
        applicationId,
        currentFormStep,
        incrementStep,
        decrementStep,
        goToStep,
        isStepReachable,
        highestStepReached,
        getStepName,
        getStepIndex,
        handleFormUpdate,
        systemAttributes,
        loadingSystemAttributes,
        errorLoadingSystemAttributes,
        accountAttributes,
        finalFormData,
        handleFinalSubmit,
        refreshSystemAttributes,
      }}
    >
      {children}
    </AddApplicationContext.Provider>
  );
}

export const useAddApplicationContext = () => {
  const context = useContext(AddApplicationContext);
  if (!context) {
    throw new Error(
      "useAddApplicationContext must be used within an AddApplicationProvider",
    );
  }
  return context;
};
