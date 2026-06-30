"use client";

import { useState } from "react";
import { IconShield, IconLoader2 } from "@tabler/icons-react";
import { useSSOFormLogic } from "./useSSOFormLogic";

interface SAMLConfigFormProps {
  onBack: () => void;
  onContinue: (data: typeof initialFormData) => void;
  existingConfig?: any;
  isEditing?: boolean;
}

// Available NameID format options for IGA applications
const nameIdFormatOptions = [
  {
    value: "emailAddress",
    label: "Email Address",
    description: "Use email as unique identifier (most common)",
  },
  {
    value: "persistent",
    label: "Persistent",
    description: "Persistent opaque identifier",
  },
  {
    value: "transient",
    label: "Transient",
    description: "Temporary identifier for this session",
  },
  {
    value: "unspecified",
    label: "Unspecified",
    description: "Let IdP decide the format",
  },
  { value: "entity", label: "Entity", description: "Entity-based identifier" },
  {
    value: "kerberos",
    label: "Kerberos",
    description: "Kerberos principal name",
  },
  {
    value: "WindowsDomainQualifiedName",
    label: "Windows Domain",
    description: "Windows domain\\username format",
  },
  {
    value: "X509SubjectName",
    label: "X509 Subject",
    description: "X.509 certificate subject name",
  },
];

const initialFormData = {
  // Required Fields
  enabled: true,
  name: "",
  idpEntityId: "",
  idpSsoUrl: "",
  certificate: "",
  entityId: "",
  assertionConsumerServiceUrl: "",

  // Optional but Recommended Fields
  samlBinding: "POST",
  nameIdFormat: "emailAddress",
  singleLogoutServiceUrl: "",
  metadataUrl: "",
  correlationRule: "",

  // Encryption Configuration
  encryptEntireConfig: false,

  // Security Settings
  keyStoreLocation: "",
  keyStorePassword: "",
  keyAlias: "",
  privateKey: "",
  signRequests: true,
  encryptAssertions: false,

  // User Mapping
  attributeMapping: {
    email: "",
    firstName: "",
    lastName: "",
    displayName: "",
  },
};

export function SAMLConfigForm({
  onBack,
  onContinue,
  existingConfig,
  isEditing = false,
}: SAMLConfigFormProps) {
  const {
    formData,
    updateFormData,
    isSubmitting,
    submitConfiguration,
  } = useSSOFormLogic(
    initialFormData,
    existingConfig,
    isEditing,
    { configKey: 'saml', configName: 'SAML' }
  );
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Validate required fields
      const validateData = (data: typeof initialFormData) => {
        const requiredFields = [
          "name",
          "idpEntityId",
          "idpSsoUrl",
          "certificate",
          "entityId",
          "assertionConsumerServiceUrl",
        ];
        return requiredFields.filter(
          (field) => !data[field as keyof typeof data]
        );
      };

      // Transform data for backend
      const transformData = (data: any) => {
        const { attributeMapping, certificate, ...configData } = data;
        
        return {
          ...configData,
          // Map certificate to backend idpX509Certificate
          idpX509Certificate: certificate || null,
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
        <p className="text-sm text-slate-600 mb-6">
          Configure your SAML connection for enterprise identity integration.
        </p>

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
              placeholder=""
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              A descriptive name for your SAML integration
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Service Provider Entity ID *
            </label>
            <input
              type="text"
              value={formData.entityId}
              onChange={(e) => updateFormData("entityId", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Your application&#39;s unique identifier (Service Provider Entity
              ID)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Assertion Consumer Service URL *
            </label>
            <input
              type="url"
              value={formData.assertionConsumerServiceUrl}
              onChange={(e) =>
                updateFormData("assertionConsumerServiceUrl", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              SAML URL (ACS) where IdP sends authentication responses
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Single Logout Service URL
            </label>
            <input
              type="url"
              value={formData.singleLogoutServiceUrl}
              onChange={(e) =>
                updateFormData("singleLogoutServiceUrl", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
            />
            <p className="text-xs text-slate-500 mt-1">
              URL for SAML logout requests
            </p>
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
          Identity Provider Settings
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Configure your Identity Provider (IdP) settings. These values are
          provided by your IdP administrator.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              IdP Entity ID *
            </label>
            <input
              type="text"
              value={formData.idpEntityId}
              onChange={(e) => updateFormData("idpEntityId", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Identity Provider&#39;s unique identifier (Entity ID)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              SSO Login URL *
            </label>
            <input
              type="url"
              value={formData.idpSsoUrl}
              onChange={(e) => updateFormData("idpSsoUrl", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Identity Provider&#39;s Single Sign-On URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              X.509 Certificate *
            </label>
            <textarea
              value={formData.certificate}
              onChange={(e) => updateFormData("certificate", e.target.value)}
              rows={8}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder=""
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Public X.509 Certificate from Identity Provider (PEM format)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Metadata URL
            </label>
            <input
              type="url"
              value={formData.metadataUrl}
              onChange={(e) => updateFormData("metadataUrl", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              placeholder=""
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional: IdP metadata URL for automatic configuration
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          SAML Configuration & User Mapping
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Configure SAML-specific settings and user attribute mapping.
        </p>

        <div className="space-y-6">
          {/* SAML Configuration Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-slate-900 mb-4">
              SAML Protocol Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  SAML Binding
                </label>
                <select
                  value={formData.samlBinding}
                  onChange={(e) =>
                    updateFormData("samlBinding", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="POST">HTTP POST</option>
                  <option value="REDIRECT">HTTP Redirect</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  SAML binding method (recommended: POST)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Name ID Format
                </label>
                <select
                  value={formData.nameIdFormat}
                  onChange={(e) =>
                    updateFormData("nameIdFormat", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {nameIdFormatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {nameIdFormatOptions.find(
                    (opt) => opt.value === formData.nameIdFormat
                  )?.description ||
                    "Format for user identifiers in SAML responses"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Correlation Rule
              </label>
              <input
                type="text"
                value={formData.correlationRule}
                onChange={(e) =>
                  updateFormData("correlationRule", e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
              />
              <p className="text-xs text-slate-500 mt-1">
                Rule for matching SAML users to existing accounts
              </p>
            </div>
          </div>

          {/* Attribute Mapping */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-slate-900 mb-4">
              User Attribute Mapping
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              Map SAML assertion attributes to user profile fields.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Email Attribute
                </label>
                <input
                  type="text"
                  value={formData.attributeMapping.email}
                  onChange={(e) =>
                    updateAttributeMapping("email", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  First Name Attribute
                </label>
                <input
                  type="text"
                  value={formData.attributeMapping.firstName}
                  onChange={(e) =>
                    updateAttributeMapping("firstName", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Last Name Attribute
                </label>
                <input
                  type="text"
                  value={formData.attributeMapping.lastName}
                  onChange={(e) =>
                    updateAttributeMapping("lastName", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Display Name Attribute
                </label>
                <input
                  type="text"
                  value={formData.attributeMapping.displayName}
                  onChange={(e) =>
                    updateAttributeMapping("displayName", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder=""
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Standard SAML claim URIs for enterprise integration. Modify only
              if your IdP uses custom attributes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Advanced & Security Settings
        </h3>

        <div className="space-y-4">
            {/* Security Options */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-slate-900 mb-3">
              Security Options
            </h4>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.signRequests}
                  onChange={(e) =>
                    updateFormData("signRequests", e.target.checked)
                  }
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-slate-900 text-sm">
                    Sign Authentication Requests
                  </div>
                  <div className="text-xs text-slate-500">
                    Digitally sign SAML requests
                  </div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.encryptAssertions}
                  onChange={(e) =>
                    updateFormData("encryptAssertions", e.target.checked)
                  }
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-slate-900 text-sm">
                    Encrypt Assertions
                  </div>
                  <div className="text-xs text-slate-500">
                    Require encrypted SAML assertions
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Key Store Location
            </label>
            <input
              type="text"
              value={formData.keyStoreLocation}
              onChange={(e) =>
                updateFormData("keyStoreLocation", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Key Store Password
            </label>
            <input
              type="password"
              value={formData.keyStorePassword}
              onChange={(e) =>
                updateFormData("keyStorePassword", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Key Alias
            </label>
            <input
              type="text"
              value={formData.keyAlias}
              onChange={(e) => updateFormData("keyAlias", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
            />
          </div>

          {formData.signRequests && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Private Key for Signing
              </label>
              <textarea
                value={formData.privateKey}
                onChange={(e) => updateFormData("privateKey", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                placeholder=""
              />
              <p className="text-xs text-slate-500 mt-1">
                Private key for signing SAML requests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center">
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
                    disabled={isSubmitting}
                  >
                    {i + 1}
                  </button>
                  {i < totalSteps - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                        i + 1 < currentStep ? "bg-[#438D98]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="transition-all duration-300 ease-in-out transform">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-md bg-white border border-gray-300 text-slate-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 1 ? "Back" : "Previous"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-md bg-[#438D98] text-white font-medium hover:bg-[#3a7a84] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <IconLoader2 className="h-4 w-4 animate-spin" />}
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
    </div>
  );
}
