import { useState } from 'react';
import { toast } from 'sonner';
import { putSSOConfig, patchSSOConfig, SSOConfigKey } from '@/lib/sso';
import { useSSOConfig } from './SSOConfigContext';
import { en } from 'zod/v4/locales';

interface SSOFormConfig {
  configKey: SSOConfigKey;
  configName: string;
}

export function useSSOFormLogic<T extends Record<string, any>>(
  initialFormData: T,
  existingConfig: any,
  isEditing: boolean,
  config: SSOFormConfig
) {
  const { refetch } = useSSOConfig();

  // Extract the configuration data from the new nested structure
  const getConfigData = (existingConfig: any) => {
    if (!existingConfig || !isEditing) return null;

    // Handle the new nested structure from the backend
    const configData = existingConfig.data || existingConfig;

    return {
      configData,
      encrypted: existingConfig.encrypted || false,
      enabled: configData.enabled || configData.active || false,
    };
  };

  const configInfo = getConfigData(existingConfig);

  const [formData, setFormData] = useState<T>(() => {
    if (configInfo) {
      const baseData = {
        ...initialFormData,
        ...configInfo.configData,
        encrypted: configInfo.encrypted,
        enabled: configInfo.enabled,
      };

      // Handle special mappings for different config types
      if ('attributeMapping' in initialFormData) {
        // For SAML and OAuth2 forms with attribute mapping
        const configData = configInfo.configData;
        (baseData as any).attributeMapping = {
          email: configData.emailAttributeMapping || "",
          firstName: configData.firstNameAttributeMapping || "",
          lastName: configData.lastNameAttributeMapping || "",
          displayName: configData.displayNameAttributeMapping || "",
        };
      }

      // Handle certificate mapping for SAML
      if ('certificate' in initialFormData) {
        (baseData as any).certificate = configInfo.configData.idpX509Certificate || "";
      }

      // Handle encryption mapping for all configs
      if ('encryptEntireConfig' in initialFormData) {
        (baseData as any).encryptEntireConfig = configInfo.encrypted || false;
      }

      return baseData as T;
    }
    return { ...initialFormData };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof T, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitConfiguration = async (
    transformData?: (data: T) => any,
    validateData?: (data: T) => string[]
  ) => {
    setIsSubmitting(true);

    try {
      // Validate if function provided
      if (validateData) {
        const missingFields = validateData(formData);
        if (missingFields.length > 0) {
          toast.error("Missing required fields", {
            description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
            duration: 5000,
          });
          return false;
        }
      }

      // Extract encryption option from form data
      const { encryptEntireConfig, ...configData } = formData;

      // Transform data if function provided
      const finalData = transformData ? transformData(configData as T) : configData;

      console.log({ ...finalData, encryptEntireConfig })
      // First, save the configuration data
      const result = await putSSOConfig(config.configKey, { ...finalData, encryptEntireConfig });

      if (!result.success) {
        throw new Error(result.error || `Failed to save ${config.configName} configuration`);
      }

      // Check if the response includes encryption status
      const encryptionStatus =
        result.data?.encrypted !== undefined
          ? result.data.encrypted
            ? " (Fully Encrypted)"
            : " (Not Encrypted)"
          : "";

      toast.success(
        `${config.configName} configuration ${isEditing ? "updated" : "created"
        } successfully${encryptionStatus}`
      );

      // Refresh the SSO configs in context
      await refetch();

      return true;
    } catch (err) {
      toast.error(`Failed to save ${config.configName} configuration`, {
        description: err instanceof Error ? err.message : String(err),
        duration: 5000,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    updateFormData,
    isSubmitting,
    submitConfiguration,
  };
}
