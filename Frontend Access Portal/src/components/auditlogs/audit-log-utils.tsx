import {
  FileText,
  Shield,
  Zap,
  AlertTriangle,
  Eye,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Copy,
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Settings,
  LogIn,
  LogOut,
  Files,
  RotateCcw,
  FileCheck,
  UserX,
  Workflow,
  AppWindow,
  ListTodo,
} from "lucide-react";
import { formatTimestampToLocal } from "@/utils/timestamp-utils";

export const getEventIcon = (eventType: string) => {
  const eventLower = eventType.toLowerCase();
  
  switch (eventLower) {
    // Create operations
    case "create":
      return <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />;
    
    case "create dynamic rule":
      return <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />;
    
    case "created session control policy for tenant":
      return <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />;
    
    // Update operations
    case "update":
      return <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    
    case "update dynamic rule":
      return <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    
    case "update permission":
      return <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    
    case "updated session control policy for tenant":
      return <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    
    // Delete operations
    case "delete":
      return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />;
    
    case "delete permission":
      return <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />;
    
    case "bulk role delete":
      return <Files className="h-4 w-4 text-red-600 dark:text-red-400" />;
    
    // Assignment operations
    case "assign":
      return <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    
    case "assign permission":
      return <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    
    case "assign role":
      return <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    
    // Revoke operations
    case "revoke":
    case "remove":
      return <UserMinus className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    
    case "revoke role":
      return <UserMinus className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    
    case "revoke role (bulk)":
      return <Files className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    
    // Copy operations
    case "copy":
      return <Copy className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />;
    
    // Restore operations
    case "restore":
      return <RotateCcw className="h-4 w-4 text-green-600 dark:text-green-400" />;
    
    // Role reconciliation
    case "role reconciliation":
      return <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
    
    // Authentication operations
    case "login":
      return <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    
    case "logout":
      return <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    
    case "terminate session":
      return <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />;
    
    // Password operations
    case "password_reset":
    case "password reset":
      return <KeyRound className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    
    case "password_update":
    case "password update":
      return <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    
    // Legacy/fallback cases
    case "approve":
      return <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />;
    
    case "reject":
      return <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />;
    
    case "escalate":
      return <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    
    case "fail":
    case "failure":
      return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    
    case "provision":
      return <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />;
    
    // Workflow operations
    case "workflow-created":
      return <Workflow className="h-4 w-4 text-green-600 dark:text-green-400" />;
    
    case "workflow-updated":
      return <Workflow className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    
    case "workflow-deleted":
      return <Workflow className="h-4 w-4 text-red-600 dark:text-red-400" />;
    
    case "workflow-executed":
      return <Workflow className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    
    case "workflow-simulated":
      return <Workflow className="h-4 w-4 text-teal-600 dark:text-teal-400" />;
    
    case "workflow-execution-cancelled":
      return <Workflow className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    
    // IGA Application events — AppWindow icon, color encodes the action
    case "application_created":
      return <AppWindow className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case "application_updated":
      return <AppWindow className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
    case "application_deleted":
      return <AppWindow className="h-4 w-4 text-red-600 dark:text-red-400" />;

    // IGA Task events — ListTodo icon, color encodes the action
    case "task_created":
      return <ListTodo className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case "task_updated":
      return <ListTodo className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
    case "task_deleted":
      return <ListTodo className="h-4 w-4 text-red-600 dark:text-red-400" />;
    case "task_executed":
      return <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case "task_terminated":
      return <ListTodo className="h-4 w-4 text-orange-600 dark:text-orange-400" />;

    // Default
    default:
      return <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  }
};

export const getRiskBadgeColor = (risk: string) => {
  switch (risk) {
    case "low":
      return "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100";
    case "medium":
      return "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100";
    case "high":
      return "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100";
    case "critical":
      return "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100";
  }
};

export const getOutcomeBadgeColor = (outcome: string) => {
  switch (outcome) {
    case "success":
      return "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100";
    case "failure":
      return "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100";
    case "pending":
      return "bg-yellow-100 dark:bg-yellow-800  text-yellow-800 dark:text-yellow-100";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800";
  }
};

export const formatTimestamp = (timestamp: string | number) => {
  return formatTimestampToLocal(timestamp, {
    includeSeconds: true,
    use12Hour: false,
  });
};
