import useAddApplicationSubmit from "@/hooks/applications/add-application/useAddApplicationSubmit";
import {
  ErrorResult,
  SuccessResult,
  useApplicationValidation,
} from "@/hooks/applications/useApplicationValidation";
import { FinalFormDataOutput } from "@/types/add-application";
import { createContext, useContext, useState } from "react";

type ConfigVariable = {
  key: string;
  value: string | null;
};
const STEPS = ["configuration", "variables", "validation", "review"] as const;
type Step = (typeof STEPS)[number];

const ImportApplicationContext = createContext<{
  submitConfig(config: FinalFormDataOutput): void;
  config: FinalFormDataOutput | null;
  variables: ConfigVariable[];
  submitVariables(variables: ConfigVariable[]): void;
  variablesChanged(formVariables: ConfigVariable[]): boolean;
  step: Step;
  steps: typeof STEPS;
  nextStep(): void;
  prevStep(): void;
  hasNextStep: boolean;
  hasPrevStep: boolean;
  finish(): void;
  validationError: ErrorResult | null | undefined;
  validationPassed: boolean;
  validationLoading: boolean;
  validationData: SuccessResult | null | undefined;
  mergeVariablesWithConfig(
    config: FinalFormDataOutput,
    variables: ConfigVariable[],
  ): FinalFormDataOutput;
} | null>(null);

export default function ImportApplicationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [variables, setVariables] = useState<ConfigVariable[]>([]);
  const [config, setConfig] = useState<FinalFormDataOutput | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const step = STEPS[stepIndex];

  const parseVariablesFromConfig = (config: FinalFormDataOutput) => {
    for (const connectorField of Object.entries(config.connector)) {
      const value = connectorField[1];
      const key = connectorField[0];
      variables.push({ key, value: String(value) });
    }
    return variables;
  };

  const mergeVariablesWithConfig = (
    config: FinalFormDataOutput,
    variables: ConfigVariable[],
  ) => {
    const configString = JSON.parse(
      JSON.stringify(config),
    ) as FinalFormDataOutput;
    variables.forEach((variable) => {
      if (variable.value === null) return;
      configString.connector[variable.key] = variable.value;
    });
    return configString;
  };

  const submitConfig = (config: FinalFormDataOutput) => {
    const extractedVariables = parseVariablesFromConfig(config);
    setVariables(extractedVariables);
    setConfig(config);
  };

  const submitVariables = (variables: ConfigVariable[]) => {
    setVariables(variables);
  };

  const variablesChanged = (formVariables: ConfigVariable[]) => {
    if (!config) return false;
    return JSON.stringify(formVariables) !== JSON.stringify(variables);
  };

  const nextStep = () => {
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const { submitForm } = useAddApplicationSubmit({
    onSuccess(data) {
      console.log("Application imported successfully:", data);
    },
    onError(error) {
      console.error("Failed to import application:", error);
    },
  });

  const mergedConfig =
    config && variables.every((variable) => variable.value !== null)
      ? mergeVariablesWithConfig(config, variables)
      : null;

  const {
    data: validationData,
    error: validationError,
    isLoading: validationLoading,
  } = useApplicationValidation(mergedConfig);

  const validationPassed = !!validationData && !validationError;

  const finish = async () => {
    if (!mergedConfig) return;
    try {
      await submitForm(mergedConfig);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ImportApplicationContext.Provider
      value={{
        submitConfig,
        config,
        submitVariables,
        variablesChanged,
        step,
        steps: STEPS,
        nextStep,
        prevStep,
        hasNextStep: step !== "review",
        hasPrevStep: step !== "configuration",
        finish,
        variables,
        validationError,
        validationPassed,
        validationLoading,
        validationData,
        mergeVariablesWithConfig,
      }}
    >
      {children}
    </ImportApplicationContext.Provider>
  );
}

export const useImportApplicationContext = () => {
  const context = useContext(ImportApplicationContext);
  if (!context) {
    throw new Error(
      "useImportApplicationContext must be used within an ImportApplicationContextProvider",
    );
  }
  return context;
};
