"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { workflowApi } from '@/services/workflowApi';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

interface SimulationStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration: number;
  output?: any;
  error?: string;
  conditions?: string[];
  riskLevel: string;
  pathTaken?: string;
  sodViolation?: boolean;
  approvalRequired?: boolean;
}

interface WorkflowSimulationResult {
  executionId: string;
  status: string;
  steps: SimulationStep[];
  summary?: any;
}

export function useWorkflowSimulation(workflowId: string) {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationStep[] | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvalPending, setApprovalPending] = useState<any | null>(null);
  const { toast } = useToast();
  
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  /**
   * Map node types to UI-friendly display types
   */
  const mapNodeType = (nodeType: string): string => {
    const typeMap: Record<string, string> = {
      'trigger.start': 'trigger',
      'trigger.end': 'trigger',
      'approval.single': 'approval',
      'approval.multi': 'approval',
      'approval.dynamic': 'approval',
      'condition.if': 'condition',
      'condition.switch': 'condition',
      'action.provision': 'provisioning',
      'action.deprovision': 'provisioning',
      'action.notify': 'notification',
      'action.script': 'script',
      'action.http': 'http',
      'delay.wait': 'delay',
      'delay.schedule': 'delay',
    };
    return typeMap[nodeType] || nodeType;
  };

  /**
   * Determine risk level based on node type and output
   */
  const determineRiskLevel = (nodeType: string, output?: any): string => {
    if (nodeType.includes('provision') || nodeType.includes('deprovision')) {
      return 'high';
    }
    if (nodeType.includes('approval') || nodeType.includes('http')) {
      return 'medium';
    }
    return 'low';
  };

  /**
   * Connect to WebSocket for real-time simulation updates
   */
  const connectWebSocket = useCallback((execId: string) => {
    // Get API URL (goes through API Gateway)
    let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';
    
    // If page is loaded over HTTPS, ensure WebSocket URL uses HTTPS too
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      API_URL = API_URL.replace(/^http:/, 'https:');
    }
    
    const wsUrl = `${API_URL}/workflows/ws`;  // WebSocket endpoint through API Gateway
    console.log('[Simulation WebSocket] 🔌 Attempting to connect to:', wsUrl);
    console.log('[Simulation WebSocket] 📋 Execution ID:', execId);
    const accessToken = Cookies.get('auth_token');

    if (!accessToken) {
      console.warn('[Simulation WebSocket] ⚠️ No auth token found - connecting without authentication');
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as any,
      connectHeaders: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[Simulation WebSocket] DEBUG:', str);
      },
      onConnect: () => {
        console.log('[Simulation WebSocket] ✅ Connected successfully');
        
        // Subscribe to simulation updates for this execution
        const destination = `/topic/simulation/${execId}`;
        console.log('[Simulation WebSocket] 📡 Subscribing to:', destination);
        
        subscriptionRef.current = client.subscribe(destination, (message) => {
          try {
            const update = JSON.parse(message.body);
            console.log('[Simulation WebSocket] Update received:', update);
            handleSimulationUpdate(update);
          } catch (error) {
            console.error('[Simulation WebSocket] Error parsing message:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('[Simulation WebSocket] ❌ STOMP error:', frame.headers, frame.body);
      },
      onWebSocketError: (event) => {
        console.error('[Simulation WebSocket] ❌ WebSocket error:', event);
      },
      onDisconnect: () => {
        console.log('[Simulation WebSocket] Disconnected');
      },
    });

    client.activate();
    clientRef.current = client;
  }, []);

  /**
   * Handle incoming WebSocket updates
   */
  const handleSimulationUpdate = (update: any) => {
    console.log('[Simulation] 📨 Received WebSocket update:', update);
    const { event, nodeId, nodeName, nodeType, status, duration, output, error: nodeError } = update;
    console.log('[Simulation] 🎯 Event type:', event, 'Node:', nodeName, 'NodeType:', nodeType, 'Status:', status);

    setSimulationResult(prev => {
      console.log('[Simulation] 📊 Current steps before update:', prev?.length || 0);
      console.log('[Simulation] 📊 All step statuses:', prev?.map(s => `${s.name}: ${s.status}`));
      if (!prev) return prev;
      
      const existingIndex = prev.findIndex(step => step.id === nodeId);
      
      if (event === 'node_start') {
        if (existingIndex >= 0) {
          // Update existing step to running
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: 'running'
          };
          setCurrentStep(existingIndex);
          return updated;
        } else {
          // Add new step
          const newStep: SimulationStep = {
            id: nodeId,
            name: nodeName,
            type: mapNodeType(nodeType),
            status: 'running',
            duration: 0,
            riskLevel: determineRiskLevel(nodeType),
          };
          setCurrentStep(prev.length);
          return [...prev, newStep];
        }
      }
      
      if (event === 'node_complete') {
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: 'completed',
            duration: duration || 0,
            output: output,
          };
          return updated;
        }
      }
      
      if (event === 'node_error') {
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: 'failed',
            duration: duration || 0,
            error: nodeError,
          };
          return updated;
        }
      }
      
      if (event === 'node_awaiting_approval') {
        console.log('[Simulation] === WEBSOCKET APPROVAL MESSAGE ===');
        console.log('[Simulation] Full update object:', JSON.stringify(update, null, 2));
        console.log('[Simulation] update.approvalData:', update.approvalData);
        console.log('[Simulation] Approval required:', update);
        setApprovalPending({
          nodeId,
          nodeName,
          nodeType,
          approvalData: update.approvalData,
          executionId: update.executionId,
        });
        
        // Mark step as paused/waiting
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: 'pending',
            approvalRequired: true,
          };
          return updated;
        }
      }
      
      if (event === 'simulation_complete') {
        console.log('[Simulation] ✅ Simulation complete');
        console.log('[Simulation] 📊 Final steps state before cleanup:', prev);
        
        // Mark any remaining 'running' or 'pending' steps as 'completed'
        // This handles trigger nodes (especially trigger.start) that the backend doesn't send complete events for
        const updated = prev.map(step => {
          if (step.status === 'running' || step.status === 'pending') {
            console.log('[Simulation] ⚠️  Node never received complete event:', step.name, '- marking as completed');
            return {
              ...step,
              status: 'completed' as const,
            };
          }
          return step;
        });
        
        console.log('[Simulation] 📊 Final steps state after cleanup:', updated);
        setIsRunning(false);
        setCurrentStep(-1);
        setApprovalPending(null);
        disconnectWebSocket();
        
        return updated;
      }
      
      return prev;
    });
  };

  /**
   * Disconnect WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  /**
   * Start simulation
   */
  const startSimulation = async (inputData: any, workflowData?: any) => {
    console.log('[Simulation] 🚀 START SIMULATION CALLED', { workflowId, inputData });
    try {
      setIsRunning(true);
      setError(null);
      setSimulationResult([]);
      setCurrentStep(-1);
      console.log('[Simulation] 🔄 State reset, preparing context...');

      // Parse and validate input data if it's a string
      let context: Record<string, any>;
      try {
        context = typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
      } catch (parseError) {
        toast({
          title: "Invalid JSON",
          description: "The input data is not valid JSON. Please check the format.",
          variant: "destructive",
        });
        setIsRunning(false);
        return;
      }

      // If workflow is unsaved (from designer), use workflowData directly
      if (workflowId === '' || workflowId === 'unsaved') {
        if (!workflowData) {
          throw new Error('Cannot simulate unsaved workflow without workflow data');
        }
        
        // For unsaved workflows, we need to save temporarily or simulate directly
        // For now, show error - this will be handled by first saving the workflow
        toast({
          title: "Save Required",
          description: "Please save the workflow before simulating",
          variant: "destructive",
        });
        setIsRunning(false);
        return;
      }

      // Call backend simulation API
      console.log('[Simulation] 📡 Calling backend API for workflowId:', workflowId);
      console.log('[Simulation] 📦 Context:', context);
      const result = await workflowApi.simulateWorkflow(workflowId, context);
      
      console.log('[Simulation] ✅ API Response received:', result);
      
      // Extract execution ID from result
      const execId = result.data?.executionId || result.executionId;
      console.log('[Simulation] 🔑 Execution ID:', execId);
      if (execId) {
        setExecutionId(execId);
        // Connect WebSocket to receive real-time updates
        console.log('[Simulation] 🔌 Initiating WebSocket connection...');
        connectWebSocket(execId);
      } else {
        throw new Error('No execution ID returned from simulation');
      }
      
    } catch (err) {
      console.error('[Simulation] ❌ CAUGHT ERROR:', err);
      console.error('[Simulation] ❌ Error stack:', (err as Error).stack);
      const errorMessage = (err as Error).message || 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Simulation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsRunning(false);
    }
  };

  /**
   * Process approval decision
   */
  const processApproval = async (approved: boolean, reason?: string) => {
    if (!executionId) {
      console.error('[Simulation] ❌ No execution ID for approval');
      toast({
        title: "Approval Failed",
        description: "No execution ID found",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`[Simulation] 📝 Processing approval: ${approved ? 'APPROVED' : 'REJECTED'}`);
      console.log(`[Simulation] 🔑 Execution ID: ${executionId}`);
      console.log(`[Simulation] 💬 Reason:`, reason);
      
      const result = await workflowApi.approveSimulation(executionId, approved, reason);
      console.log(`[Simulation] ✅ Approval API response:`, result);
      
      setApprovalPending(null);
      
      toast({
        title: approved ? "Approved" : "Rejected",
        description: `Approval ${approved ? 'granted' : 'denied'} - continuing simulation`,
      });
    } catch (err) {
      console.error('[Simulation] ❌ Approval error:', err);
      console.error('[Simulation] ❌ Error type:', typeof err);
      console.error('[Simulation] ❌ Error message:', (err as Error).message);
      console.error('[Simulation] ❌ Error stack:', (err as Error).stack);
      toast({
        title: "Approval Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return {
    isRunning,
    simulationResult,
    currentStep,
    error,
    approvalPending,
    startSimulation,
    processApproval,
  };
}
