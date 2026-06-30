import { NextResponse } from "next/server";

// Types for the API response
export interface IdentitySchemaContext {
  schemaId: string;
  schemaName: string;
}

/**
 * GET /api/identity/contexts
 * Returns the fixed identity entity types since schema contexts are no longer used
 */
export async function GET() {
  try {
    // Return the fixed entity types in the format expected by the frontend
    const contexts = [
      {
        id: "employee",
        schemaName: "Employee",
        schemaCode: "EMPLOYEE",
        identityType: "employee",
        description: "Employee identity schema",
        version: 1,
        isActive: true,
        isDefault: true,
        createdBy: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fieldsLength: 16, // Based on the API response you provided
      },
      {
        id: "non_employee",
        schemaName: "Non-Employee",
        schemaCode: "NON_EMPLOYEE",
        identityType: "non_employee",
        description: "Non-employee identity schema",
        version: 1,
        isActive: true,
        isDefault: true,
        createdBy: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fieldsLength: 16,
      },
      {
        id: "non_human",
        schemaName: "Non-Human",
        schemaCode: "NON_HUMAN",
        identityType: "non_human",
        description: "Non-human identity schema",
        version: 1,
        isActive: true,
        isDefault: true,
        createdBy: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fieldsLength: 16,
      },
    ];

    return NextResponse.json(contexts);
  } catch (error: unknown) {
    console.error("Error in GET /api/identity/contexts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
