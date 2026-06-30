import { EmailTemplate, BackendTemplatePayload, TriggerTypeVariable, TemplateVersion, BackendTemplateVersion } from '../types/emailTemplateTypes';
import { availableVariables } from '../components/settings/notificationsConfigurations/Email-Template/constants';

export function mapTemplateResponses(responses: any[]): EmailTemplate[] {
  return responses.map((response) => ({
    id: response.id,
    name: response.templateName,
    triggerType: response.triggerType,
    status: response.isEnabled,
    locale: response.language,
    lastModified: response.updatedAt || response.createdAt,
    createdBy: response.createdByName,
    createdAt: response.createdAt,
    modifiedBy: response.updatedByName || response.createdByName,
    subject: response.templateSubject,
    body: response.emailBody,
    version: response.currentVersion,
  }));
}

export function transformToBackendPayload(template: EmailTemplate): BackendTemplatePayload {
  return {
    templateName: template.name,
    triggerType: template.triggerType,
    language: template.locale,
    templateSubject: template.subject,
    emailBody: template.body,
    isEnabled: template.status,
  };
}

export function getAvailableVariables(
  triggerType: string | undefined,
  triggerTypeVariables: TriggerTypeVariable[]
): string[] {
  if (!triggerType) {
    return [];
  }

  // Ensure triggerTypeVariables is an array before calling find
  if (!Array.isArray(triggerTypeVariables)) {
    return availableVariables;
  }

  const triggerVars = triggerTypeVariables.find(
    tv => tv.triggerType === triggerType
  );

  if (triggerVars && Array.isArray(triggerVars.templateVariables)) {
    return triggerVars.templateVariables.map(variable => `\${${variable}}`);
  }

  return availableVariables;
}

export function createNewTemplate(): EmailTemplate {
  return {
    id: '',
    name: '',
    triggerType: '',
    status: true,
    locale: 'EN_UK',
    lastModified: new Date().getTime(),
    createdBy: 'current-user@company.com',
    createdAt: new Date().getTime(),
    modifiedBy: 'current-user@company.com',
    subject: '',
    body: '',
    version: 1
  };
}

export function cloneTemplate(template: EmailTemplate): EmailTemplate {
  return {
    ...template,
    id: '',
    name: `${template.name} (Copy)`,
    version: 1,
    lastModified: new Date().getTime(),
    createdAt: new Date().getTime(),
    modifiedBy: 'current-user@company.com'
  };
}

export function mapVersionResponses(responses: BackendTemplateVersion[]): TemplateVersion[] {
  return responses.map((response) => ({
    version: `${response.versionNumber}`,
    id: response.versionId,
    date: response.createdAt,
    user: response.createdByName,
    changes: response.changeComment || 'N/A',
    templateId: response.templateId,
  }));
}

export function mapToEmailTemplate(
  backend: BackendTemplateVersion
): EmailTemplate {
  return {
    id: backend.templateId,
    name: backend.templateName,
    triggerType: backend.triggerType,
    status: backend.isEnabled,
    locale: backend.language,
    lastModified: backend.createdAt, // could be updatedAt if backend had it
    createdBy: backend.createdByName,
    createdAt: backend.createdAt,
    modifiedBy: backend.createdByName, // no dedicated modifiedBy → fallback to createdBy
    subject: backend.templateSubject,
    body: backend.emailBody,
    version: backend.versionNumber,
  };
}