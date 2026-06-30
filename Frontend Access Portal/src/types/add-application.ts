import {
  AuthSchemaFromSchemaType,
  NonAuthoritativeSingleAccountConnectorObjectSchemaType,
  NonAuthSchemaFromSchemaType,
} from "@/components/applications/add-application/schemas/schemaFormSchema";
import { CorrelationFormSchemaType } from "@/components/applications/add-application/schemas/correlationSchema";
import { AccessFormSchemaType } from "@/components/applications/add-application/schemas/accessSchema";
import { ScriptEditorContent } from "@/components/script-editor/schema";
import { DetailsFormSchemaType } from "@/components/applications/add-application/schemas/detailsSchema";
import { ConnectorFormSchemaType } from "@/components/applications/add-application/schemas/connectorSchema";
import { VisibilityFormSchemaType } from "@/components/applications/add-application/schemas/VisibilitySchema";
import { SynchronizationPolicyFormSchemaType } from "@/components/applications/add-application/schemas/synchronizationPolicySchema";

export type DropDownOption = {
  id: string;
  label: string;
};

export type DynamicFieldType =
  | "char"
  | "int"
  | "long"
  | "string"
  | "boolean"
  | "File"
  | "string[]"
  | "byte[]";

export type ConnectorConfigurationProperty = {
  name: string;
  displayName: string;
  helpMessage: string;
  type: DynamicFieldType;
  required?: boolean;
  confidential?: boolean;
};

export const connectorAttributeTypes = [
  "char",
  "int",
  "int[]",
  "long",
  "long[]",
  "string",
  "string[]",
  "boolean",
  "boolean[]",
  "File",
  "File[]",
] as const;

export type ConnectorAttributeType = (typeof connectorAttributeTypes)[number];

export const connectorAttributeCategories = [
  "identity",
  "entitlement",
  "risk",
  "metadata",
] as const;

export type ConnectorAttributeCategory =
  (typeof connectorAttributeCategories)[number];

export type ConnectorAttribute = NonNullable<
  NonAuthoritativeSingleAccountConnectorObjectSchemaType["attributes"]
>[number];

export type ConnectorObject =
  NonAuthoritativeSingleAccountConnectorObjectSchemaType;

export type Connector = {
  id: string;
  displayName: string;
  connectorKey: string;
  configurationProperties: ConnectorConfigurationProperty[];
};

export type MetaSystemAttribute = {
  systemKey: string;
  displayName: string;
  dataType: string;
  isRequired?: boolean;
  isRelationship?: boolean;
  relationshipType?: unknown;
  description?: string;
};

export type FinalFormDataOutput = {
  details: DetailsFormSchemaType;
  connector: ConnectorFormSchemaType;
  schema: {
    definitions: (
      | {
          objectClass: string;
          type: "account";
          displayAttribute: string;
          attributes: {
            name: string;
            type: string;
            category: (typeof connectorAttributeCategories)[number];
            description?: string;
            flags?: string[];
          }[]
        }
      | {
          objectClass: string;
          type: "entitlement" | "generic";
          displayAttribute: string;
          descriptionAttribute?: string;
          attributes: {
            name: string;
            type: string;
            description?: string;
            flags?: string[];
          }[];
        }
    )[];
  };
  correlation?: {
    account: CorrelationFormSchemaType["account"] | undefined;
    manager?: CorrelationFormSchemaType["manager"] | undefined;
  };
  access?: AccessFormSchemaType | undefined;
  synchronizationPolicy?: {
    reactions: {
      situation: string;
      action: string;
    }[];
  } | undefined;
  visibility?: VisibilityFormSchemaType | undefined;
  provisioning?: unknown;
  attributeMappings?:
    | {
        sourceAttributeName: string;
        targetAttributeName: string;
        mode: "default" | "uppercase" | "lowercase" | "script";
        script?: ScriptEditorContent;
      }[]
    | undefined;
};

export type FinalFormData = {
  details?: DetailsFormSchemaType;
  connector?: ConnectorFormSchemaType;
  schema?: NonAuthSchemaFromSchemaType | AuthSchemaFromSchemaType;
  correlation?: CorrelationFormSchemaType;
  access?: AccessFormSchemaType;
  synchronizationPolicy?: SynchronizationPolicyFormSchemaType;
  visibility?: VisibilityFormSchemaType;
  provisioning?: unknown;
};

export type RecivedApplication = FinalFormDataOutput & {
  iconPath?: string;
};
