"use client";

import { useState } from "react";
import { IconShield, IconInfoCircle, IconLoader2 } from "@tabler/icons-react";
import { useSSOFormLogic } from "./useSSOFormLogic";

interface Oauth2ConfigFormProps {
  onBack: () => void;
  onContinue: (data: typeof initialFormData) => void;
  existingConfig?: any;
  isEditing?: boolean;
}

const initialFormData = {
  // Basic Configuration
  enabled: true,
  name: "",
  providerId: "",
  clientId: "",
  clientSecret: "",
  encryptEntireConfig: false,
  // Endpoints
  authorizationUri: "",
  tokenUri: "",
  userInfoUri: "",
  jwkSetUri: "",
  redirectUri: "",
  // Scopes and Username Attribute
  scopes: ["openid", "profile", "email"],
  userNameAttribute: "email",
  // Attribute Mapping
  attributeMapping: {
    email: "email",
    firstName: "given_name",
    lastName: "family_name",
    displayName: "name",
  },
};

export function Oauth2ConfigForm({
  onBack,
  onContinue,
  existingConfig,
  isEditing = false,
}: Oauth2ConfigFormProps) {
  const {
    formData,
    updateFormData,
    isSubmitting,
    submitConfiguration,
  } = useSSOFormLogic(
    initialFormData,
    existingConfig,
    isEditing,
    { configKey: 'oauth2', configName: 'OAuth2' }
  );
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Validate required fields
      const validateData = (data: typeof initialFormData) => {
        const requiredFields = [
          "name",
          "clientId",
          "clientSecret",
          "redirectUri",
          "authorizationUri",
          "tokenUri",
          "userInfoUri",
          "jwkSetUri"
        ];
        return requiredFields.filter(
          (field) => !data[field as keyof typeof data]
        );
      };

      // Transform data for backend
      const transformData = (data: any) => {
        const { attributeMapping, ...configData } = data;
        
        return {
          ...configData,
          // Map frontend attributeMapping to backend individual fields
          emailAttributeMapping: attributeMapping.email || null,
          firstNameAttributeMapping: attributeMapping.firstName || null,
          lastNameAttributeMapping: attributeMapping.lastName || null,
          displayNameAttributeMapping: attributeMapping.displayName || null,
        };
      };

      const success = await submitConfiguration(transformData, validateData);
      if (success) {
        onContinue(formData);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const updateAttributeMapping = (field: string, value: string) => {
    updateFormData('attributeMapping', {
      ...formData.attributeMapping,
      [field]: value,
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Basic Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Connection Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Google OAuth2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Provider ID *
            </label>
            <input
              type="text"
              value={formData.providerId}
              onChange={(e) => updateFormData("providerId", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="google"
              required
            />
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 my-6" />

          {/* Encryption Settings */}
          <div className="p-4 mt-6">
            <div className="flex items-start space-x-3">
              <IconShield className="h-5 w-5 text-[#438D98] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">
                      Encrypt Configuration
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Enable encryption for sensitive LDAP configuration data
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.encryptEntireConfig}
                      onChange={(e) =>
                        updateFormData("encryptEntireConfig", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#438D98]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#438D98]" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          OAuth2 Endpoints & Client
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Client ID *
            </label>
            <input
              type="text"
              value={formData.clientId}
              onChange={(e) => updateFormData("clientId", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="218184317376-..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Client Secret *
            </label>
            <input
              type="password"
              value={formData.clientSecret}
              onChange={(e) => updateFormData("clientSecret", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="GOCSPX-..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Authorization URI *
            </label>
            <input
              type="url"
              value={formData.authorizationUri}
              onChange={(e) =>
                updateFormData("authorizationUri", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://accounts.google.com/o/oauth2/v2/auth"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Token URI *
            </label>
            <input
              type="url"
              value={formData.tokenUri}
              onChange={(e) => updateFormData("tokenUri", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://oauth2.googleapis.com/token"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              User Info URI *
            </label>
            <input
              type="url"
              value={formData.userInfoUri}
              onChange={(e) => updateFormData("userInfoUri", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.googleapis.com/oauth2/v2/userinfo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              JWK Set URI *
            </label>
            <input
              type="url"
              value={formData.jwkSetUri}
              onChange={(e) => updateFormData("jwkSetUri", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.googleapis.com/oauth2/v3/certs"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Redirect URI *
            </label>
            <input
              type="url"
              value={formData.redirectUri}
              onChange={(e) => updateFormData("redirectUri", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://your-domain.com/login/oauth2/code/google"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Scopes *
            </label>
            <input
              type="text"
              value={formData.scopes.join(", ")}
              onChange={(e) =>
                updateFormData(
                  "scopes",
                  e.target.value.split(/[, ]+/).filter(Boolean)
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="openid, profile, email"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma or space separated
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              User Name Attribute *
            </label>
            <input
              type="text"
              value={formData.userNameAttribute}
              onChange={(e) =>
                updateFormData("userNameAttribute", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          User Attribute Mapping
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Email
            </label>
            <input
              type="text"
              value={formData.attributeMapping.email}
              onChange={(e) =>
                updateAttributeMapping('email', e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.attributeMapping.firstName}
              onChange={(e) =>
                updateAttributeMapping('firstName', e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="given_name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.attributeMapping.lastName}
              onChange={(e) =>
                updateAttributeMapping('lastName', e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="family_name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.attributeMapping.displayName}
              onChange={(e) =>
                updateAttributeMapping('displayName', e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="name"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(i + 1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  i + 1 <= currentStep
                    ? "bg-[#438D98] text-white hover:bg-[#3a7a84]"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    i + 1 < currentStep ? "bg-[#438D98]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="transition-all duration-300 ease-in-out">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm rounded-md bg-white border border-gray-300 text-slate-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 1 ? "Back" : "Previous"}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm rounded-md bg-[#438D98] text-white font-medium hover:bg-[#3a7a84] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <IconLoader2 className="h-4 w-4 animate-spin text-[#438D98]" />
            )}
            {currentStep === totalSteps
              ? isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Connection"
                : "Create Connection"
              : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}
