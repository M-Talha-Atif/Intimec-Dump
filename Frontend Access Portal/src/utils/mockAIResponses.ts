export interface MockResponseContext {
  isAnalysis?: boolean;
  isPatternAnalysis?: boolean;
  logContext?: any;
  query: string;
}

export const generateMockAIResponse = (
  context: MockResponseContext
): string => {
  const { isAnalysis, isPatternAnalysis, logContext, query } = context;

  if (isPatternAnalysis) {
    return generatePatternAnalysisMockResponse(query);
  }

  if (isAnalysis && logContext) {
    return generateLogAnalysisMockResponse(logContext, query);
  }

  return generateGeneralMockResponse(query);
};

const generateLogAnalysisMockResponse = (
  logContext: any,
  query: string
): string => {
  const templates = [
    `**IDENTITY PROVISIONING FAILURE ANALYSIS**

**Root Cause Analysis:**
• Salesforce connector timeout threshold exceeded (30s limit)
• High volume of concurrent provisioning requests causing queue buildup
• No exponential backoff configured for retry attempts
• Service endpoint experiencing intermittent latency spikes

**Security & Compliance Impact:**
• SOX Compliance: Provisioning SLA breach - user access delayed beyond policy requirements
• GDPR Risk: Potential for stale account data persisting beyond data retention policy
• ISO 27001: Access control process integrity compromised

**Immediate Remediation Steps:**
1. Retry the failed provisioning operation immediately
2. Increase connector timeout threshold from 30s to 60s
3. Enable exponential backoff for retry mechanisms
4. Monitor service endpoint health and latency metrics

**Long-term Prevention Strategies:**
• Implement circuit breaker pattern for external service calls
• Add request queuing and throttling mechanisms
• Set up proactive monitoring alerts for connector performance
• Regular review and adjustment of timeout thresholds based on historical data

**Related Pattern Insights:**
Similar Salesforce connector timeouts detected 15 times in the last 24 hours, suggesting a systemic issue requiring immediate attention.`,

    `**ACCESS VIOLATION SECURITY ANALYSIS**

**Root Cause Analysis:**
• User attempted to access resource beyond assigned role permissions
• Role-based access control (RBAC) policy enforcement working correctly
• Potential indication of privilege escalation attempt or misconfigured access request

**Security & Compliance Impact:**
• SOX Compliance: Unauthorized access attempt logged and blocked successfully
• PCI DSS: Access control mechanisms functioning as designed
• ISO 27001: Security incident requires documentation and review

**Immediate Remediation Steps:**
1. Review user's current role assignments and access patterns
2. Investigate if this was a legitimate business need or security incident
3. Update access request workflows if legitimate need identified
4. Document incident for compliance reporting

**Long-term Prevention Strategies:**
• Implement just-in-time (JIT) access for elevated permissions
• Regular access reviews and recertification campaigns
• Enhanced user training on proper access request procedures
• Implement risk-based authentication for sensitive resources

**Related Pattern Insights:**
No similar violations detected for this user in the past 30 days. Access patterns appear normal otherwise.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

const generatePatternAnalysisMockResponse = (query: string): string => {
  return `**LOG PATTERN ANALYSIS RESULTS**

**Detected Patterns Summary:**
Over the analyzed timeframe, we've identified several critical patterns requiring immediate attention:

**High-Frequency Issues:**
• Salesforce Connector Timeouts: 15 occurrences (High severity)
• Failed Authentication Attempts: 23 occurrences (Medium severity)
• Bulk Provisioning Failures: 8 occurrences (High severity)
• Queue Backlog Buildup: 12 occurrences (High severity)

**Root Cause Analysis:**
• Connector service experiencing performance degradation during peak hours
• Authentication service rate limiting affecting legitimate users
• Bulk operations not properly batched, causing resource exhaustion
• Message queue not scaling with increased load

**Security & Compliance Impact:**
• SOX: Multiple SLA breaches affecting provisioning timelines
• GDPR: Risk of delayed account deprovisioning
• ISO 27001: System availability concerns affecting business operations

**Immediate Actions Required:**
1. Scale connector service infrastructure immediately
2. Review and adjust authentication rate limits
3. Implement proper batching for bulk operations
4. Configure auto-scaling for message queue infrastructure

**Pattern Trends:**
Peak failure times: 9-11 AM and 2-4 PM (business hours)
Success rate degradation: 15% over the past week
Average resolution time: 45 minutes (exceeds SLA)

**Recommended Monitoring:**
Set up alerts for connector response times > 25s, queue depth > 100 messages, and authentication failure rate > 5%.`;
};

const generateGeneralMockResponse = (query: string): string => {
  const responses = [
    `**IDENTITY GOVERNANCE INSIGHTS**

Based on your query about "${query.substring(0, 50)}...", here's what I found:

**Current System Health:**
• Overall platform availability: 99.2%
• Active user sessions: 1,247
• Pending access requests: 23
• Failed authentications (24h): 12

**Key Recommendations:**
1. Review pending access requests to maintain compliance SLAs
2. Investigate recent authentication failures for potential security issues
3. Consider implementing single sign-on for improved user experience
4. Schedule regular access reviews to maintain proper governance

**Compliance Status:**
• SOX: All critical controls operational
• GDPR: Data retention policies active
• ISO 27001: Security controls within acceptable parameters

This analysis is based on current system data and industry best practices for identity and access management.`,

    `**ACCESS MANAGEMENT OVERVIEW**

Your query regarding "${query.substring(
      0,
      50
    )}..." reveals several important considerations:

**Risk Assessment:**
• High-risk users: 5 (requiring immediate review)
• Orphaned accounts: 12 (cleanup recommended)
• Excessive permissions: 8 users identified
• Inactive accounts: 34 (deprovisioning candidate)

**Governance Recommendations:**
1. Initiate access review campaign for high-risk users
2. Automated cleanup of orphaned accounts
3. Implement principle of least privilege reviews
4. Schedule quarterly access certifications

**Security Posture:**
Current security score: 87/100
Areas for improvement: Access reviews, permission optimization
Compliance gaps: None identified

Regular monitoring and proactive governance are key to maintaining a secure identity environment.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};
