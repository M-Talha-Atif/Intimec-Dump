import { LucideIcon } from 'lucide-react';

// Extended node types for enterprise IGA workflows
export type ExtendedNodeType = 
  // Existing (keep for compatibility)
  | 'trigger' | 'approval' | 'provisioning' | 'notification' 
  | 'condition' | 'wait' | 'webhook' | 'database'
  | 'sod.evaluate' | 'lifecycle.joiner' | 'lifecycle.mover' 
  | 'lifecycle.leaver' | 'parallel' | 'script' 
  | 'data.enrichment' | 'certification' | 'recertification'
  | 'transformation' | 'integration'
  
  // Advanced control flow
  | 'parallel.fanout'      // Split into multiple parallel paths
  | 'parallel.join'        // Wait for all parallel paths to complete
  | 'foreach'              // Iterate over collection
  | 'foreach.end'          // End of iteration
  
  // Forms & input
  | 'form.dynamic'         // Dynamic form with field builder
  | 'form.fileupload'      // File upload form
  
  // Policy & governance
  | 'policy.gate'          // ABAC/RBAC policy evaluation
  | 'policy.eligibility'   // Eligibility check (geo, time, data residency)
  | 'sod.precheck'         // Pre-provisioning SoD check
  | 'sod.postcheck'        // Post-provisioning SoD verification
  | 'risk.score'           // ML-based or heuristic risk scoring
  | 'impact.analyzer'      // Blast radius analysis
  
  // ITSM ticketing (critical for enterprise)
  | 'ticket.create'        // Create ServiceNow/Jira ticket
  | 'ticket.update'        // Update ticket status/fields
  | 'ticket.wait'          // Wait for ticket completion
  | 'ticket.close'         // Close ticket with notes
  
  // Advanced data operations
  | 'data.correlate'       // Link identity to accounts
  | 'data.reconcile'       // Read and compare (recon)
  | 'data.transform'       // ETL transformation
  | 'data.pii.redact'      // PII redaction
  
  // Account operations
  | 'account.provision'    // Create account
  | 'account.deprovision'  // Delete account
  | 'account.update'       // Update account attributes
  | 'account.disable'      // Immediate disable (emergency)
  
  // Approval & escalation
  | 'approval.multi'       // Multi-stage approval chain
  | 'approval.quorum'      // Require N of M approvers
  | 'escalation'           // Escalation with SLA
  | 'reminder'             // Send reminders
  
  // Monitoring & observability
  | 'snapshot'             // Capture current state
  | 'version'              // Version control checkpoint
  | 'rollback'             // Compensation/rollback logic
  | 'evidence.collect'     // Collect audit evidence
  | 'metrics.trace'        // Emit metrics/traces
  | 'audit.append'         // Append to audit log
  
  // Error handling & resilience
  | 'error.handler'        // Catch and handle errors
  | 'retry'                // Retry with exponential backoff
  | 'circuit.breaker'      // Circuit breaker pattern
  | 'featureflag'          // Conditional path via feature flag
  
  // Security & secrets
  | 'secrets.fetch'        // Fetch from vault
  | 'session.monitor'      // PSM session monitoring
  
  // RPA & external
  | 'rpa.step'             // RPA bot invocation
  | 'script.faas'          // Serverless function
  | 'http.call'            // HTTP/REST call;

export interface ExtendedNodeDefinition {
  type: ExtendedNodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  risk: 'low' | 'medium' | 'high';
  category: string;
}
