"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react"
import { SSOConfigProvider, useSSOConfig } from '@/components/Auth/sso/SSOConfigContext'

const ssoMethods = [
    {
        id: "oauth2",
        label: "OAUTH",
        title: "OAUTH2",
        description: "Modern authentication for web and mobile apps.",
        color: "bg-blue-100",
        iconColor: "text-blue-600",
        border: "border-blue-500",
        text: "text-blue-700"
    },
    {
        id: "saml",
        label: "SAML",
        title: "SAML 2.0",
        description: "Enterprise SSO for legacy and cloud apps.",
        color: "bg-purple-100",
        iconColor: "text-purple-600",
        border: "border-purple-500",
        text: "text-purple-700"
    },
    {
        id: "ldap",
        label: "LDAP",
        title: "LDAP Directory",
        description: "Enterprise directory services and authentication.",
        color: "bg-green-100",
        iconColor: "text-green-600",
        border: "border-green-500",
        text: "text-green-700"
    }
]

function SSOConfigSelectionPageInner() {
    const { configs, loading } = useSSOConfig();
    const [existingTypes, setExistingTypes] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const types = configs.map((config: any) => {
            if (config.configKey.includes('saml')) return 'saml';
            if (config.configKey.includes('oauth2')) return 'oauth2';
            if (config.configKey.includes('ldap')) return 'ldap';
            return null;
        }).filter((type): type is "oauth2" | "saml" | "ldap" => type !== null);
        setExistingTypes(types);
    }, [configs]);

    const handleMethodSelect = (methodId: string) => {
        router.push(`/settings/sso/config/${methodId}-config`);
    };

    const handleBack = () => {
        router.push('/settings/sso');
    };

    const isMethodDisabled = (methodId: string) => {
        return existingTypes.includes(methodId);
    };

    if (loading) {
        return (
            <div className="flex-1 p-8">
                <div className="flex items-center justify-center h-64">
                    <IconLoader2 className="w-8 h-8 text-[#438D98] animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Connect a Single Sign-On Provider
                        </h2>
                        <Button 
                            onClick={handleBack}
                            variant="outline" 
                            size="sm"
                        >
                            <IconArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </div>
                    <p className="text-slate-600">Choose your SSO method to get started</p>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center mb-10">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            1
                        </div>
                        <span className="ml-3 text-slate-900 font-medium">Choose Method</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-slate-400 flex items-center justify-center font-bold">
                            2
                        </div>
                        <span className="ml-3 text-slate-400">Configure</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-slate-400 flex items-center justify-center font-bold">
                            3
                        </div>
                        <span className="ml-3 text-slate-400">Complete</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {ssoMethods.map((method) => {
                        const isDisabled = isMethodDisabled(method.id);
                        const isConfigured = existingTypes.includes(method.id);
                        return (
                            <button
                                key={method.id}
                                className={`rounded-xl border-2 p-6 text-left transition-all duration-300 ${
                                    isDisabled 
                                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                                        : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transform hover:scale-105'
                                }`}
                                onClick={() => !isDisabled && handleMethodSelect(method.id)}
                                disabled={isDisabled}
                            >
                                <div className={`flex items-center mb-3`}>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${method.color} ${method.iconColor} mr-6`}>
                                        {method.label}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="text-LG font-semibold text-slate-900">
                                                {method.title}
                                            </div>
                                            {isConfigured && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    Configured
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-slate-500 text-sm">
                                            {method.description}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-slate-500">
                                    Authentication Method: <span className={method.text}>{method.title}</span>
                                    {isConfigured && (
                                        <div className="text-orange-600 mt-1">
                                            This method is already configured. Please edit the existing configuration instead.
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {existingTypes.length === 3 && (
                    <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 font-medium">
                            All SSO methods have been configured. You can edit existing configurations from the main SSO Connections page.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SSOConfigSelectionPage() {
    return (
        <SSOConfigProvider>
            <SSOConfigSelectionPageInner />
        </SSOConfigProvider>
    );
}
