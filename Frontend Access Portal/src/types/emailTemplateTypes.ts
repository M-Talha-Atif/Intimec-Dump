export interface EmailTemplate {
  id: string;
  name: string;
  triggerType: string;
  status: boolean;
  locale: string;
  lastModified: number;
  createdBy: string;
  createdAt: number;
  modifiedBy: string;
  subject: string;
  body: string;
  version: number;
}

export interface TemplateVersion {
  version: string;
  id: string;
  date: number;
  user: string;
  changes: string;
  templateId: string;
}

export interface TriggerTypeVariable {
  triggerType: string;
  templateVariables: string[];
}

export interface BackendTemplatePayload {
  templateName: string;
  triggerType: string;
  language: string;
  templateSubject: string;
  emailBody: string;
  isEnabled: boolean;
}

export interface TriggerType {
  value: string;
  label: string;
}

export interface Locale {
  value: string;
  label: string;
}

export interface BackendTemplateVersion {
  versionId: string;
  templateId: string;
  versionNumber: number;
  templateName: string;
  triggerType: string;
  isEnabled: boolean;
  language: string;
  templateSubject: string;
  emailBody: string;
  createdAt: number; // timestamp (ms)
  createdById: string;
  createdByName: string;
  changeComment: string;
  isCurrent: boolean;
  changeType: "CREATED" | "UPDATED" | "DELETED" | string; // extendable
}

// {
//     "versionId": "54d05558-c9c0-4a19-a14a-3401d854bc40",
//     "templateId": "f83a3675-ae66-4941-bd7e-cf1b7ac6c0f7",
//     "versionNumber": 2,
//     "templateName": "Password reset",
//     "triggerType": "PASSWORD_RESET",
//     "isEnabled": true,
//     "language": "EN_UK",
//     "templateSubject": "Password Expiration ${username}!",
//     "emailBody": "<html>\n  <body style=\"font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;\">\n    <div style=\"max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">\n      <h2 style=\"color: #333333;\">Password Reset Successful</h2>\n      <p>Dear <strong>${username}</strong>,</p>\n      <p>Your password has been reset successfully. You can now log in with your new password.</p>\n      <p style=\"margin-top: 30px;\">Best regards,<br/>The Team</p>\n    </div>\n  </body>\n</html>",
//     "createdAt": 1758198718897,
//     "createdById": "4bb2c7df-5677-4cd2-a0d1-aad3fa8afe8f",
//     "createdByName": "imadmin",
//     "changeComment": "Template updated",
//     "isCurrent": false,
//     "changeType": "UPDATED"
// }