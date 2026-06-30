import {
  SystemAttributeMapping,
  IdentityType,
  ScriptType,
} from "../types/index";

export const getMockSystemMappings = (
  identityType: IdentityType
): SystemAttributeMapping[] => {
  switch (identityType) {
    case "employee":
      return [
        {
          id: "sys-map-1",
          systemAttributeId: "personal_email",
          systemAttributeName: "First Name",
          priority: 1,
          identityType: "employee",
          condition:
            "source.firstName != null && source.firstName.trim() != ''",
          fallbackValue: "Unknown",
          isCollapsed: false,
          mappings: [
            {
              resourceId: "3d37e3db-5488-42ae-9525-4db35d195a7f",
              sourceAttributeName: "firstName",
              transformation: "direct",
            },
            {
              resourceId: "3d37e3db-5488-42ae-9525-4db35d195a7f",
              sourceAttributeName: "first_name",
              transformation: "script",
              script: {
                type: "JAVASCRIPT",
                content:
                  "return source.first_name ? source.first_name.trim().toLowerCase() : null;",
              },
            },
            {
              resourceId: "3d37e3db-5488-42ae-9525-4db35d195a7f",
              sourceAttributeName: "firstName",
              transformation: "direct",
            },
          ],
        },
      ];

    case "non-human":
      return [
        {
          id: "sys-map-nh-1",
          systemAttributeId: "attr-servicename",
          systemAttributeName: "Service Name",
          priority: 1,
          identityType: "non-human",
          condition: "source.serviceName != null",
          fallbackValue: "Unknown Service",
          isCollapsed: false,
          mappings: [
            {
              resourceId: "active-directory",
              sourceAttributeName: "cn",
              transformation: "direct",
            },
            {
              resourceId: "service-registry",
              sourceAttributeName: "name",
              transformation: "uppercase",
            },
          ],
        },
        {
          id: "sys-map-nh-2",
          systemAttributeId: "attr-serviceaccount",
          systemAttributeName: "Service Account",
          priority: 2,
          identityType: "non-human",
          condition: "source.accountName != null",
          fallbackValue: undefined,
          isCollapsed: false,
          mappings: [
            {
              resourceId: "active-directory",
              sourceAttributeName: "sAMAccountName",
              transformation: "direct",
            },
          ],
        },
      ];

    case "non-employee":
      return [
        {
          id: "sys-map-ne-1",
          systemAttributeId: "attr-contractorfirstname",
          systemAttributeName: "Contractor First Name",
          priority: 1,
          identityType: "non-employee",
          condition: "source.firstName != null",
          fallbackValue: "Contractor",
          isCollapsed: false,
          mappings: [
            {
              resourceId: "contractor-system",
              sourceAttributeName: "firstName",
              transformation: "direct",
            },
            {
              resourceId: "vendor-portal",
              sourceAttributeName: "given_name",
              transformation: "capitalize",
            },
          ],
        },
        {
          id: "sys-map-ne-2",
          systemAttributeId: "attr-contractorlastname",
          systemAttributeName: "Contractor Last Name",
          priority: 2,
          identityType: "non-employee",
          condition: "source.lastName != null",
          fallbackValue: "Unknown",
          isCollapsed: false,
          mappings: [
            {
              resourceId: "contractor-system",
              sourceAttributeName: "lastName",
              transformation: "direct",
            },
            {
              resourceId: "vendor-portal",
              sourceAttributeName: "family_name",
              transformation: "uppercase",
            },
          ],
        },
        {
          id: "sys-map-ne-3",
          systemAttributeId: "attr-contractorcompany",
          systemAttributeName: "Contractor Company",
          priority: 3,
          identityType: "non-employee",
          condition: "source.company != null",
          fallbackValue: "External",
          isCollapsed: true,
          mappings: [
            {
              resourceId: "contractor-system",
              sourceAttributeName: "companyName",
              transformation: "direct",
            },
            {
              resourceId: "vendor-portal",
              sourceAttributeName: "organization",
              transformation: "script",
              script: {
                type: "JAVASCRIPT",
                content:
                  "// Clean up company name\nconst company = source.organization;\nif (company) {\n  return company.replace(/\\b(Inc|LLC|Corp|Ltd)\\b/gi, '').trim();\n}\nreturn company;",
              },
            },
          ],
        },
      ];

    default:
      return [];
  }
};

// Mock API function to simulate fetching system mappings
export const fetchSystemMappings = async (
  schemaId: string,
  identityType: IdentityType
): Promise<SystemAttributeMapping[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mappings = getMockSystemMappings(identityType);

  // You can add logic here to filter by schemaId if needed
  console.log(
    `Fetching system mappings for schema: ${schemaId}, identity type: ${identityType}`
  );

  return mappings;
};

// Helper function to create a new empty system mapping
export const createNewSystemMapping = (
  identityType: IdentityType,
  systemAttributeId: string,
  systemAttributeName: string,
  priority: number
): SystemAttributeMapping => {
  return {
    id: `sys-map-${Date.now()}`,
    systemAttributeId,
    systemAttributeName,
    priority,
    identityType,
    condition: undefined,
    fallbackValue: undefined,
    isCollapsed: false,
    mappings: [],
  };
};

// Helper function to create a new empty source mapping
export const createNewSourceMapping = (
  resourceId: string
): SystemAttributeMapping["mappings"][0] => {
  return {
    resourceId,
    sourceAttributeName: "",
    transformation: "direct",
  };
};
