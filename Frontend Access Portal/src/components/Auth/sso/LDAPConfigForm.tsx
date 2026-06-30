"use client";

import React, { useState } from "react";
import { IconShield, IconInfoCircle, IconLoader2 } from "@tabler/icons-react";
import { useSSOFormLogic } from "./useSSOFormLogic";

interface LDAPConfigFormProps {
  onBack: () => void;
  onContinue: (data: typeof initialFormData) => void;
  existingConfig?: any;
  isEditing?: boolean;
}

const initialFormData = {
  enabled: true,
  name: "",
  url: "",
  baseDn: "",
  bindDn: "",
  bindPassword: "",
  userSearchFilter: "",
  encryptEntireConfig: false,
};

export function LDAPConfigForm({
  onBack,
  onContinue,
  existingConfig,
  isEditing = false,
}: LDAPConfigFormProps) {
  const {
    formData,
    updateFormData,
    isSubmitting,
    submitConfiguration,
  } = useSSOFormLogic(
    initialFormData,
    existingConfig,
    isEditing,
    { configKey: 'ldap', configName: 'LDAP' }
  );

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Validate required fields
      const validateData = (data: typeof initialFormData) => {
        const requiredFields = ["name", "url", "baseDn", "userSearchFilter"];
        return requiredFields.filter(
          (field) => !data[field as keyof typeof data]
        );
      };

      const success = await submitConfiguration(undefined, validateData);
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
              placeholder="Production Active Directory"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              LDAP URL *
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => updateFormData("url", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ldap://dc.company.com:389"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use ldap:// for standard connections or ldaps:// for SSL
              connections
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
          LDAP Authentication
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Base DN *
            </label>
            <input
              type="text"
              value={formData.baseDn}
              onChange={(e) => updateFormData("baseDn", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="dc=company,dc=com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Bind DN
            </label>
            <input
              type="text"
              value={formData.bindDn}
              onChange={(e) => updateFormData("bindDn", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="cn=ldapuser,ou=service,dc=company,dc=com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Service account DN for authenticated searches
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Bind Password
            </label>
            <input
              type="password"
              value={formData.bindPassword}
              onChange={(e) => updateFormData("bindPassword", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Service account password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Password for the service account
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              User Search Filter *
            </label>
            <input
              type="text"
              value={formData.userSearchFilter}
              onChange={(e) =>
                updateFormData("userSearchFilter", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="sAMAccountName={0}"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Filter to find users. Use {"{0}"} as placeholder for username
            </p>
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
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 hover:scale-105 ${
                  i + 1 <= currentStep
                    ? "bg-[#438D98] text-white hover:bg-[#3a7a84]"
                    : "bg-gray-200 text-slate-400 hover:bg-gray-300"
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
                : "Complete Setup"
              : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
