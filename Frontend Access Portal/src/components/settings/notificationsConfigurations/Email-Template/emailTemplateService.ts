// import { EmailTemplate, TriggerTypeVariable, BackendTemplatePayload } from '../../../../types/emailTemplateTypes';
// import { mapTemplateResponses, mapVersionResponses, transformToBackendPayload } from '../../../../utils/emailTemplate-utils';
import { EmailTemplate, TriggerTypeVariable } from "@/types/emailTemplateTypes";
import { mapTemplateResponses, mapToEmailTemplate, mapVersionResponses, transformToBackendPayload } from "@/utils/emailTemplate-utils";
import { toast } from "sonner";

export class EmailTemplateService {
  static async fetchTemplates(): Promise<EmailTemplate[]> {
    try {
      const res = await fetch('/api/email/template');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      const templateArr = mapTemplateResponses(data.data);
      console.log("the API Data is ", data.data)
      console.log("the Template Arr is", templateArr)
      return templateArr;
    } catch (error) {
      console.log('Error fetching templates:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to fetch Email Templates ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }

  static async fetchVariables(): Promise<TriggerTypeVariable[]> {
    try {
      const res = await fetch('/api/email/template/variables');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();

      // Ensure data is an array before returning
      if (Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('Variables API response is not an array:', data);
        return [];
      }
    } catch (error) {
      console.log('Error fetching variables:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to fetch Template Variables ❌", {
        description: errorMessage,
      });
      return [];
    }
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      const res = await fetch(`/api/email/template/${templateId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      toast("Deleted successfully ✅", {
        description: "Email Template deleted successfully.",
      });
    } catch (error) {
      console.log('Error deleting template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to delete ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }

  static async updateTemplateStatus(templateId: string, isEnabled: boolean): Promise<void> {
    try {
      const res = await fetch(`/api/email/template/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      toast("Updated successfully ✅", {
        description: "Template status updated.",
      });
    } catch (error) {
      console.log('Error updating template status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to update ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }

  static async updateTemplate(template: EmailTemplate): Promise<void> {
    try {
      const backendPayload = transformToBackendPayload(template);
      console.log('Updating template with payload:', backendPayload);
      const res = await fetch(`/api/email/template/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      toast("Updated successfully ✅", {
        description: "Template updated successfully.",
      });
    } catch (error) {
      console.log('Error updating template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to update ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }

  static async createTemplate(template: EmailTemplate): Promise<void> {
    try {
      const backendPayload = transformToBackendPayload(template);
      const res = await fetch(`/api/email/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      toast("Created successfully ✅", {
        description: "Email Template created successfully.",
      });
    } catch (error) {
      console.log('Error creating template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to create template ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }
  static async getTemplateVersions(templateID: string | undefined): Promise<any> {
    if (!templateID) return [];
    try {
      const res = await fetch(`/api/email/template/${templateID}/versions`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      return mapVersionResponses(data.data);
    } catch (error) {
      console.log('Error fetching template versions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to fetch template versions ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }

  static async restoreTemplateVersion(templateID: string | undefined, versionNumber: string): Promise<void> {
    if (!templateID) return;
    try {
      const res = await fetch(`/api/email/template/${templateID}/versions/${versionNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      toast("Restored successfully ✅", {
        description: `Template restored to version ${versionNumber}.`,
      });
    } catch (error) {
      console.log('Error restoring template version:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to restore version ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }

  static async getTemplateVersionDetails(templateID: string | undefined, versionNumber: string): Promise<EmailTemplate | null> {
    if (!templateID) return null;
    try {
      const res = await fetch(`/api/email/template/${templateID}/versions/${versionNumber}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      const templateArr = data.data;
      const template = mapToEmailTemplate(templateArr);
      return template;
    } catch (error) {
      console.log('Error fetching template version details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to fetch version details ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }

  static async sendTestEmail(templateSubject: string, emailBody: string, testEmailAddress: string): Promise<void> {
    try {
      const res = await fetch(`/api/email/template/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSubject,
          emailBody,
          testEmailAddress,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      toast("Test email sent successfully ✅", {
        description: `Test email has been sent to ${testEmailAddress}.`,
      });
    } catch (error) {
      console.log('Error sending test email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast("Failed to send test email ❌", {
        description: errorMessage,
      });
      throw error;
    }
  }
}