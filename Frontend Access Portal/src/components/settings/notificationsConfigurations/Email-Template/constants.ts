import { EmailTemplate, TriggerType, Locale, TemplateVersion } from '../../../../types/emailTemplateTypes';

export const triggerTypes: TriggerType[] = [
  { value: 'PASSWORD_RESET', label: 'Password Reset' },
  { value: 'PASSWORD_REMINDER_RESET', label: 'Password Reminder Reset' },
  { value: 'ASSIGN_INTERNAL_ROLE', label: 'Assign Internal Role' },
  { value: 'REVOKE_INTERNAL_ROLE', label: 'Revoke Internal Role' },
];

export const locales: Locale[] = [
  { value: 'EN_UK', label: 'English (UK)' },
  { value: 'EN_US', label: 'English (US)' },
  { value: 'ES_ES', label: 'Spanish' },
  { value: 'FR_FR', label: 'French' },
  { value: 'DE_DE', label: 'German' }
];

export const availableVariables: string[] = [
  '${user.displayName}',
  '${user.email}',
  '${user.department}',
  '${user.manager}',
  '${application.name}',
  '${application.type}',
  '${requestId}',
  '${approver.displayName}',
  '${approvalLink}',
  '${dueDate}',
  '${company.name}',
  '${company.logo}',
  '${company.themeColor}'
];

export const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Access Request Approved',
    triggerType: 'access_approved',
    status: true,
    locale: 'en_US',
    lastModified: 1757333755634,
    createdAt: 1757333755634,
    createdBy: 'admin@company.com',
    modifiedBy: 'admin@company.com',
    subject: 'Your access request has been approved - ${requestId}',
    body: `<div>
      <h2>Access Request Approved</h2>
      <p>Hello ${'${user.displayName}'},</p>
      <p>Your access request for ${'${application.name}'} has been approved.</p>
      <p>Request ID: ${'${requestId}'}</p>
      <p>Approved by: ${'${approver.displayName}'}</p>
      <p><a href="${'${approvalLink}'}">View Details</a></p>
    </div>`,
    version: 3
  },
  {
    id: '2',
    name: 'Password Reset Request',
    triggerType: 'password_reset',
    status: true,
    locale: 'en_US',
    lastModified: 1757333755634,
    createdAt: 1757333755634,
    createdBy: 'admin@company.com',
    modifiedBy: 'admin@company.com',
    subject: 'Password Reset Request',
    body: `<div>
      <h2>Password Reset</h2>
      <p>Hello ${'${user.displayName}'},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${'${resetLink}'}">Reset Password</a></p>
      <p>This link expires in 24 hours.</p>
    </div>`,
    version: 1
  }
];

export const mockVersionHistory: TemplateVersion[] = [
  { version: "3", id: "3", date: 1758646678510, user: 'admin@company.com', changes: 'Updated styling and added approval link', templateId: '1' },
  { version: "2", id: "2", date: 1758646678510, user: 'admin@company.com', changes: 'Added approver name variable', templateId: '1' },
  { version: "1", id: "1", date: 1758646678510, user: 'admin@company.com', changes: 'Initial template creation', templateId: '1' },
];