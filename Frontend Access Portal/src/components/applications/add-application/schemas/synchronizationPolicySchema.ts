import z from "zod";

/**
 * Synchronization situations following MidPoint/SailPoint IGA patterns.
 * These represent the state of an account relative to its identity linkage.
 */
export const synchronizationSituations = [
  "UNMATCHED",   // No correlation match found
  "UNLINKED",    // Correlation match found but not yet linked
  "LINKED",      // Account is linked to an identity
  "DELETED",     // Account no longer exists in source
  "DISPUTED",    // Multiple correlation matches found
] as const;

export type SynchronizationSituation = (typeof synchronizationSituations)[number];

/**
 * Actions that can be taken in response to each situation.
 * These follow industry-standard IGA patterns.
 */
export const synchronizationActions = [
  "add-focus",         // Create a new identity
  "link",              // Link shadow to existing identity
  "sync",              // Update identity attributes from shadow
  "unlink",            // Remove link between shadow and identity
  "inactivate-focus",  // Disable the linked identity
  "delete-focus",      // Delete the linked identity
  "none",              // Take no action
] as const;

export type SynchronizationAction = (typeof synchronizationActions)[number];

/**
 * A single reaction mapping situation → action.
 */
export const synchronizationReactionSchema = z.object({
  situation: z.enum(synchronizationSituations),
  action: z.enum(synchronizationActions),
});

export type SynchronizationReactionType = z.infer<typeof synchronizationReactionSchema>;

/**
 * The complete synchronization policy form schema.
 * Contains reactions for each situation.
 */
export const synchronizationPolicySchema = z.object({
  reactions: z.array(synchronizationReactionSchema).default([
    { situation: "UNMATCHED", action: "add-focus" },
    { situation: "UNLINKED", action: "link" },
    { situation: "LINKED", action: "sync" },
    { situation: "DELETED", action: "unlink" },
    { situation: "DISPUTED", action: "none" },
  ]),
});

export type SynchronizationPolicyFormSchemaType = z.infer<typeof synchronizationPolicySchema>;

/**
 * Get default reactions based on whether the application is authoritative.
 * Authoritative sources (like HR) create identities; non-authoritative don't.
 */
export function getDefaultReactions(isAuthoritative: boolean): SynchronizationReactionType[] {
  return [
    { 
      situation: "UNMATCHED", 
      action: isAuthoritative ? "add-focus" : "none"  // HR creates identities, AD doesn't
    },
    { 
      situation: "UNLINKED", 
      action: "link"  // Always auto-link when correlation matches
    },
    { 
      situation: "LINKED", 
      action: "sync"  // Keep attributes in sync
    },
    { 
      situation: "DELETED", 
      action: isAuthoritative ? "inactivate-focus" : "unlink"  // HR disables, others just unlink
    },
    { 
      situation: "DISPUTED", 
      action: "none"  // Manual resolution required
    },
  ];
}

/**
 * Descriptions for each situation (for UI tooltips/help).
 */
export const situationDescriptions: Record<SynchronizationSituation, string> = {
  UNMATCHED: "Account found in source but no matching identity exists in the system",
  UNLINKED: "Account found and correlation matched an identity, but they are not yet linked",
  LINKED: "Account is already linked to an identity in the system",
  DELETED: "Account was previously known but no longer exists in the source system",
  DISPUTED: "Multiple potential identity matches found - requires manual resolution",
};

/**
 * Descriptions for each action (for UI tooltips/help).
 */
export const actionDescriptions: Record<SynchronizationAction, string> = {
  "add-focus": "Create a new identity from this account",
  "link": "Link the account to the matched identity",
  "sync": "Update the identity's attributes from the account",
  "unlink": "Remove the link between account and identity",
  "inactivate-focus": "Disable the linked identity",
  "delete-focus": "Delete the linked identity completely",
  "none": "Take no action - skip processing",
};
