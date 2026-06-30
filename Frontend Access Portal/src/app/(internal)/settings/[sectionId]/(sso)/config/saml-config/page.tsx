"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SAMLConfigForm } from '@/components/Auth/sso/SAMLConfigForm'
import { SSOConfigProvider } from '@/components/Auth/sso/SSOConfigContext'
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react"
import { getSSOConfig } from '@/lib/sso'

import { Configuration } from '@/lib/sso'

export default function SAMLConfigPage() {
    const [loading, setLoading] = useState(false)
    const [existingConfig, setExistingConfig] = useState<Configuration | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('edit')
    const isEditing = !!editId

    useEffect(() => {
        if (isEditing) {
            // Fetch existing configuration for editing
            const fetchConfig = async () => {
                try {
                    setLoading(true)
                    const data = await getSSOConfig('saml');
                    setExistingConfig(data)
                } catch (error) {
                    console.error('Error fetching SAML config:', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchConfig()
        }
    }, [isEditing, editId])

    const handleBack = () => {
        if (isEditing) {
            router.push('/settings/sso')
        } else {
            router.push('/settings/sso/config')
        }
    }

    const handleContinue = (data: any) => {
        // console.log('SAML Configuration Data:', data)
        // Handle form submission here
        // After successful creation/update, go back to table view
        router.push('/settings/sso')
    }

    if (loading) {
        return (
            <div className="flex-1 p-8">
                <div className="flex items-center justify-center h-64">
                    <IconLoader2 className="w-8 h-8 text-[#438D98] animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <SSOConfigProvider>
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back button */}
                    <Button 
                        onClick={handleBack}
                        variant="outline" 
                        className="mb-6"
                    >
                        <IconArrowLeft className="w-4 h-4 mr-2" />
                        Back to {isEditing ? 'SSO Connections' : 'Method Selection'}
                    </Button>

                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                            {isEditing ? 'Edit' : 'Configure'} SAML 2.0
                        </h2>
                        <p className="text-slate-600">
                            {isEditing ? 'Update your' : 'Enter your'} SAML configuration details
                        </p>
                    </div>

                    <SAMLConfigForm 
                        onBack={handleBack} 
                        onContinue={handleContinue}
                        existingConfig={existingConfig}
                        isEditing={isEditing}
                    />
                </div>
            </div>
        </SSOConfigProvider>
    )
}
