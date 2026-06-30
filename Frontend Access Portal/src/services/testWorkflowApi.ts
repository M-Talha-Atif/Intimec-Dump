/**
 * Test workflow API connectivity
 * This file can be run independently to test backend integration
 */

import { workflowApi } from '@/services/workflowApi';

export async function testWorkflowApi() {
  console.log('=== Testing Workflow API ===\n');
  
  try {
    // Test 1: Create a workflow
    console.log('Test 1: Creating workflow...');
    const testWorkflow = {
      name: 'Test Workflow ' + Date.now(),
      description: 'Automated test workflow',
      category: 'access-request',
      triggerType: 'manual',
      riskLevel: 'low' as const,
      applicationScope: ['Active Directory'],
      complianceFrameworks: ['ISO 27001'],
      policyCompliance: 'compliant',
      tags: ['test', 'automated'],
      nodes: [
        {
          id: 'node-1',
          type: 'workflowNode',
          position: { x: 250, y: 25 },
          data: {
            label: 'Start',
            stepType: 'trigger',
            icon: 'Settings',
            risk: 'low'
          }
        },
        {
          id: 'node-2',
          type: 'workflowNode',
          position: { x: 250, y: 200 },
          data: {
            label: 'Approval',
            stepType: 'approval',
            icon: 'CheckCircle',
            risk: 'medium'
          }
        }
      ],
      edges: [
        {
          id: 'e1-2',
          source: 'node-1',
          target: 'node-2',
          type: 'custom'
        }
      ]
    };
    
    const created = await workflowApi.createWorkflow(testWorkflow);
    console.log('✅ Workflow created:', created.id);
    console.log('   Name:', created.name);
    console.log('   Status:', created.status);
    console.log('   Nodes:', created.nodes.length);
    console.log('   Edges:', created.edges.length);
    
    // Test 2: Get the workflow back
    console.log('\nTest 2: Fetching workflow...');
    const fetched = await workflowApi.getWorkflow(created.id);
    console.log('✅ Workflow fetched:', fetched.id);
    console.log('   Data matches:', fetched.name === created.name);
    
    // Test 3: Update the workflow
    console.log('\nTest 3: Updating workflow...');
    const updated = await workflowApi.updateWorkflow(created.id, {
      ...testWorkflow,
      description: 'Updated description',
      tags: ['test', 'automated', 'updated']
    });
    console.log('✅ Workflow updated');
    console.log('   New description:', updated.description);
    
    // Test 4: Partial update (auto-save)
    console.log('\nTest 4: Partial update (auto-save)...');
    await workflowApi.partialUpdateWorkflow(created.id, {
      nodes: [
        ...testWorkflow.nodes,
        {
          id: 'node-3',
          type: 'workflowNode',
          position: { x: 250, y: 400 },
          data: {
            label: 'Notification',
            stepType: 'notification',
            icon: 'Bell',
            risk: 'low'
          }
        }
      ]
    });
    console.log('✅ Partial update successful');
    
    // Test 5: List workflows
    console.log('\nTest 5: Listing workflows...');
    const list = await workflowApi.listWorkflows({ status: 'DRAFT' });
    console.log('✅ Found', list.content.length, 'draft workflows');
    
    // Test 6: Delete the workflow
    console.log('\nTest 6: Deleting workflow...');
    await workflowApi.deleteWorkflow(created.id);
    console.log('✅ Workflow deleted');
    
    console.log('\n=== All Tests Passed! ===');
    return true;
    
  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('Details:', error);
    return false;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testWorkflowApi = testWorkflowApi;
  console.log('Test function loaded! Run: window.testWorkflowApi()');
}
