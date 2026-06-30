// SSO server actions for managing SSO configurations
// This uses server-side actions instead of API routes

"use server";

import { revalidatePath } from "next/cache";
import { _getAuthToken } from "./auth";

export type SSOConfigKey = 'saml' | 'oauth2' | 'ldap';
const BACKEND_URL = process.env.API_URL || 'http://localhost:8090/api/v1';
// Configuration interface matching the backend model
export interface Configuration {
  id: string;
  configType: string;
  configKey: string;
  configData: any;
  isActive: boolean;
  version: number;
  artifacts?: any[];
  createdAt: string;
  updatedAt: string;
  userCount: number;
  encrypted?: boolean;
}


export async function listSSOConfigs(): Promise<Configuration[]> {
  try {
    const token = await _getAuthToken();
    const response = await fetch(`${BACKEND_URL}/admin/sso/configurations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch SSO configurations');
    }

    const json_resp = await response.json();
    // console.log('SSO Configurations:', json_resp);

    // Transform the object response into an array of Configuration objects
    const configurations: Configuration[] = [];

    // Handle each SSO type
    Object.entries(json_resp).forEach(([ssoType, config]) => {
      if (config && typeof config === 'object') {
        // Extract the nested structure
        const ssoWrapper = config as any;
        const ssoConfig = ssoWrapper.data
        // Map backend type names to frontend config keys
        let configKey = '';
        let configType = '';
        switch (ssoType.toLowerCase()) {
          case 'ldap':
            configKey = 'ldap';
            configType = 'LDAP';
            break;
          case 'saml':
            configKey = 'saml';
            configType = 'SAML';
            break;
          case 'oauth2':
            configKey = 'oauth2';
            configType = 'OAuth2';
            break;
          default:
            configKey = ssoType;
            configType = ssoType.toUpperCase();
        }

        const configuration: Configuration = {
          id: configKey,
          configType: configType,
          configKey: configKey,
          configData: ssoConfig,
          isActive: ssoConfig.enabled || ssoConfig.active || false,
          version: 1,
          artifacts: [],
          encrypted: ssoWrapper.encrypted || false,
          createdAt: ssoWrapper.createdAt || ssoConfig.createdAt || new Date().toISOString(),
          updatedAt: ssoWrapper.updatedAt || ssoConfig.updatedAt || new Date().toISOString(),
          userCount: ssoConfig.userCount || 0
        };
        configurations.push(configuration);
      }
    });

    return configurations;
  } catch (error) {
    console.error('Error fetching SSO configurations:', error);
    throw new Error('Failed to fetch SSO configurations');
  }
}

export async function getSSOConfig(configKey: string): Promise<Configuration | null> {
  try {
    const token = await _getAuthToken();
    // Map configKey to the specific SSO type endpoint
    let endpoint = '';
    switch (configKey) {
      case 'ldap':
        endpoint = 'ldap';
        break;
      case 'saml':
        endpoint = 'saml';
        break;
      case 'oauth2':
        endpoint = 'oauth2';
        break;
      default:
        throw new Error(`Unsupported SSO config type: ${configKey}`);
    }

    const response = await fetch(`${BACKEND_URL}/admin/sso/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch SSO configuration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching SSO configuration:', error);
    throw new Error('Failed to fetch SSO configuration');
  }
}

export async function toggleSSOConfig(
  configKey: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await _getAuthToken();
    // Map configKey to the specific SSO type endpoint
    let endpoint = '';
    switch (configKey) {
      case 'ldap':
        endpoint = 'ldap';
        break;
      case 'saml':
        endpoint = 'saml';
        break;
      case 'oauth2':
        endpoint = 'oauth2';
        break;
      default:
        throw new Error(`Unsupported SSO config type: ${configKey}`);
    }

    const response = await patchSSOConfig(configKey, {
      data: { enabled: isActive },
    });

    if (!response.success) {
      return { success: false, error: response.error || 'Failed to toggle configuration' };
    }

    revalidatePath('/settings/sso');
    return { success: true };
  } catch (error) {
    console.error('Error toggling SSO configuration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle configuration'
    };
  }
}

export async function putSSOConfig(
  configKey: string,
  data: any,
  options?: { encryptEntireConfig?: boolean; }
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const token = await _getAuthToken();
    // Map configKey to the specific SSO type endpoint
    let endpoint = '';
    switch (configKey) {
      case 'ldap':
        endpoint = 'ldap';
        break;
      case 'saml':
        endpoint = 'saml';
        break;
      case 'oauth2':
        endpoint = 'oauth2';
        break;
      default:
        throw new Error(`Unsupported SSO config type: ${configKey}`);
    }

    // Remove the 'encrypted' field from data before sending
    const { encrypted, ...dataWithoutEncrypted } = data || {};
    const response = await fetch(`${BACKEND_URL}/admin/sso/${endpoint}`, {
      method: 'PUT',
      headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...dataWithoutEncrypted, ...options }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to update configuration' };
    }

    const responseData = await response.json();
    revalidatePath('/settings/sso');
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error updating SSO configuration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update configuration',
      data: undefined
    };
  }
}

export async function deleteSSOConfig(
  configKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await _getAuthToken();
    // Map configKey to the specific SSO type endpoint
    let endpoint = '';
    switch (configKey) {
      case 'ldap':
        endpoint = 'ldap';
        break;
      case 'saml':
        endpoint = 'saml';
        break;
      case 'oauth2':
        endpoint = 'oauth2';
        break;
      default:
        throw new Error(`Unsupported SSO config type: ${configKey}`);
    }

    const response = await fetch(`${BACKEND_URL}/admin/sso/${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to delete configuration' };
    }

    revalidatePath('/settings/sso');
    return { success: true };
  } catch (error) {
    console.error('Error deleting SSO configuration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete configuration'
    };
  }
}

export async function patchSSOConfig(
  configKey: string,
  updates: { active?: boolean; data?: any; encryptEntireConfig?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await _getAuthToken();
    // Map configKey to the specific SSO type endpoint
    let endpoint = '';
    switch (configKey) {
      case 'ldap':
        endpoint = 'ldap';
        break;
      case 'saml':
        endpoint = 'saml';
        break;
      case 'oauth2':
        endpoint = 'oauth2';
        break;
      default:
        throw new Error(`Unsupported SSO config type: ${configKey}`);
    }

    const response = await fetch(`${BACKEND_URL}/admin/sso/${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to patch configuration' };
    }

    revalidatePath('/settings/sso');
    return { success: true };
  } catch (error) {
    console.error('Error patching SSO configuration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to patch configuration'
    };
  }
}
