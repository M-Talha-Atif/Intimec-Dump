import { useState, useMemo, useEffect, useCallback } from "react";
import { PermissionCell, SelectedCell, ModuleResponse, RoleResponse } from "../types";
import { getHierarchicalPermissions, getAvailableModules, getAvailableRoles } from "../api/granular-permissions";
import { RolePolicyRule } from "@/types/permissions";

export const usePermissionMatrix = () => {
  // API Data State
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkMode, setBulkMode] = useState<"assign" | "revoke" | "">("")
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  /**
   * Fetches available roles and modules on mount
   */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch roles and modules in parallel
        const [rolesData, modulesData] = await Promise.all([
          getAvailableRoles(),
          getAvailableModules()
        ]);
        
        setAvailableRoles(rolesData);
        setAvailableModules(modulesData);
        
        // Set first role as selected by default
        if (rolesData.length > 0) {
          setSelectedRole(rolesData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch initial data");
        console.error("Error fetching initial data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  /**
   * Fetches hierarchical permissions from the backend
   */
  const fetchPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getHierarchicalPermissions({
        roleFilter: selectedRole || undefined,
        moduleFilter: filterGroup !== "all" ? filterGroup : undefined,
      });
      
      setModules(data);

      // Expand first group by default
      if (data.length > 0 && expandedGroups.size === 0) {
        setExpandedGroups(new Set([data[0].name]));
      }
      
      return data; // Return the data so it can be used immediately
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch permissions");
      console.error("Error fetching hierarchical permissions:", err);
      return []; // Return empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole, filterGroup]);

  /**
   * Fetches hierarchical permissions for a specific role (used for pre-loading)
   */
  const fetchPermissionsForRole = useCallback(async (roleId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getHierarchicalPermissions({
        roleFilter: roleId,
        moduleFilter: filterGroup !== "all" ? filterGroup : undefined,
      });
      
      setModules(data);

      // Expand first group by default
      if (data.length > 0 && expandedGroups.size === 0) {
        setExpandedGroups(new Set([data[0].name]));
      }
      
      return data; // Return the data so it can be used immediately
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch permissions");
      console.error("Error fetching hierarchical permissions:", err);
      return []; // Return empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [filterGroup]);

  /**
   * Refetch when role or filter changes
   */
  useEffect(() => {
    if (selectedRole) {
      fetchPermissions();
    }
  }, [selectedRole, filterGroup]);

  /**
   * Map backend roles to frontend format
   */
  const roles = useMemo(() => {
    return availableRoles.map((role: RoleResponse) => ({
      id: role.id,
      name: role.roleName,
      type: mapRoleType(role.role),
      userCount: role.userCount,
    }));
  }, [availableRoles]);

  /**
   * Create a mapping from "moduleId-actionName" to action IDs
   */
  const actionNameToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!modules) return map;
    
    modules.forEach((module: ModuleResponse) => {
      module.pages.forEach((page) => {
        page.actions.forEach((action) => {
          // Use pageId-actionName as key (matching selectedCells key format)
          // Note: In the context, page.id is used as moduleId in the UI
          const key = `${page.id}-${action.name}`;
          map.set(key, action.id);
        });
      });
    });
    
    return map;
  }, [modules]);

  /**
   * Extract all unique actions from modules
   */
  const allActions = useMemo(() => {
    if (!modules) return [];
    
    const actionSet = new Set<string>();
    modules.forEach((module: ModuleResponse) => {
      module.pages.forEach((page) => {
        page.actions.forEach((action) => {
          actionSet.add(action.name);
        });
      });
    });
    
    // Define custom action order
    const actionOrder = ["View", "Create", "Update", "Delete", "Import", "Export"];
    
    return Array.from(actionSet).sort((a, b) => {
      const indexA = actionOrder.indexOf(a);
      const indexB = actionOrder.indexOf(b);
      
      // If both actions are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only a is in the order array, it comes first
      if (indexA !== -1) return -1;
      // If only b is in the order array, it comes first
      if (indexB !== -1) return 1;
      // If neither is in the order array, sort alphabetically
      return a.localeCompare(b);
    });
  }, [modules]);

  /**
   * Transform backend modules to frontend format
   */
  const filteredModules = useMemo(() => {
    if (!modules) return [];

    const groupedModules = modules.map((module: ModuleResponse) => {
      const filteredPages = module.pages.filter((page) =>
        page.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        group: module.name,
        modules: filteredPages.map((page) => ({
          moduleId: page.id,
          label: page.name.charAt(0).toUpperCase() + page.name.slice(1), // Capitalize first letter for display
          pageName: page.name, // Original page name
          actions: page.actions.map((action) => action.name),
        })),
      };
    }).filter((group) => group.modules.length > 0);

    return groupedModules;
  }, [modules, searchTerm]);

  /**
   * Extract unique groups (module names)
   */
  const groups = useMemo(() => {
    return availableModules;
  }, [availableModules]);

  /**
   * Build permissions map from backend data
   */
  const permissions = useMemo(() => {
    if (!modules) return {};

    const permissionsMap: Record<string, Record<string, PermissionCell>> = {};

    modules.forEach((module: ModuleResponse) => {
      module.pages.forEach((page) => {
        page.actions.forEach((action) => {
          const key = `${page.id}-${action.name}`;
          
          if (!permissionsMap[selectedRole]) {
            permissionsMap[selectedRole] = {};
          }

          permissionsMap[selectedRole][key] = {
            moduleId: page.id,
            action: action.name,
            effect: action.hasRole ? "allow" : "inherit",
            source: "direct",
            hasConditions: false,
          };
        });
      });
    });

    return permissionsMap;
  }, [modules, selectedRole]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleCellClick = (moduleId: string, action: string) => {
    if (bulkEditMode) {
      // Check if this cell already has a permission (not inherit)
      const cellKey = `${moduleId}-${action}`;
      const cell = permissions[selectedRole]?.[cellKey];
      
      // Auto-detect mode based on first selected cell if mode is not set
      let currentMode = bulkMode;
      if (currentMode === "") {
        // First cell click determines the mode
        // Checked cell (has permission) -> revoke mode
        // Unchecked cell (no permission) -> assign mode
        const hasPermission = cell?.effect === "allow";
        currentMode = hasPermission ? "revoke" : "assign";
        setBulkMode(currentMode);
        // Don't validate on first click - we're setting the mode based on this click
        // Just add the cell to selection
        const newSelected = new Set(selectedCells);
        newSelected.add(cellKey);
        setSelectedCells(newSelected);
        return;
      }
      
      // Validate subsequent clicks based on the detected mode
      if (currentMode === "assign") {
        // Assign mode: Only allow selecting cells with "inherit" effect (no existing permission)
        if (cell && cell.effect !== "inherit") {
          // Don't allow selecting cells that already have permissions
          return;
        }
      } else if (currentMode === "revoke") {
        // Revoke mode: Only allow selecting cells that have permissions (not inherit)
        if (!cell || cell.effect === "inherit") {
          // Don't allow selecting cells that don't have permissions
          return;
        }
      }
      
      const newSelected = new Set(selectedCells);
      if (newSelected.has(cellKey)) {
        newSelected.delete(cellKey);
      } else {
        newSelected.add(cellKey);
      }
      setSelectedCells(newSelected);
    } else {
      // Find the action ID from the mapping using moduleId-actionName
      const mapKey = `${moduleId}-${action}`;
      const actionId = actionNameToIdMap.get(mapKey) || action;
      setSelectedCell({ moduleId, action, actionId });
    }
  };

  const handleSelectAllForModule = (moduleId: string, moduleActions: string[]) => {
    if (!bulkEditMode) return;

    const newSelected = new Set(selectedCells);
    
    // Get all valid cells for this module based on current mode
    const validCells: string[] = [];
    
    // If mode is empty, default to assign mode (most common use case)
    const effectiveMode = bulkMode === "" ? "assign" : bulkMode;
    
    moduleActions.forEach((action) => {
      const cellKey = `${moduleId}-${action}`;
      const cell = permissions[selectedRole]?.[cellKey];
      
      if (effectiveMode === "assign") {
        // Assign mode: only unchecked cells (inherit)
        if (cell?.effect === "inherit") {
          validCells.push(cellKey);
        }
      } else if (effectiveMode === "revoke") {
        // Revoke mode: only checked cells (allow)
        if (cell?.effect === "allow") {
          validCells.push(cellKey);
        }
      }
    });

    // Check if all valid cells are already selected
    const allSelected = validCells.every(cellKey => newSelected.has(cellKey));
    
    if (allSelected) {
      // Deselect all valid cells for this module
      validCells.forEach(cellKey => newSelected.delete(cellKey));
    } else {
      // Select all valid cells for this module
      validCells.forEach(cellKey => newSelected.add(cellKey));
      
      // If mode was empty, set it to the effective mode
      if (bulkMode === "") {
        setBulkMode(effectiveMode);
      }
    }
    
    setSelectedCells(newSelected);
  };

  const clearSelectedCells = () => {
    setSelectedCells(new Set());
    setBulkEditMode(false);
    setBulkMode(""); // Reset to empty state - mode will be determined by next selection
  };

  const closeSelectedCell = () => {
    setSelectedCell(null);
  };

  const openBulkDialog = () => {
    setShowBulkDialog(true);
  };

  const closeBulkDialog = () => {
    setShowBulkDialog(false);
  };

  const savePermissionRule = (rule: RolePolicyRule) => {
    // Convert RolePolicyRule to PermissionCell and save
    const permissionCell: PermissionCell = {
      moduleId: rule.moduleId,
      action: rule.action,
      effect: rule.effect,
      source: "direct",
      hasConditions: !!rule.conditions,
    };

    // TODO: Make API call to save the permission
    setSelectedCell(null);
  };

  const applyTemplate = (templateId: string) => {
    setShowTemplates(false);
  };

  return {
    // State
    selectedRole,
    searchTerm,
    filterGroup,
    expandedGroups,
    selectedCells,
    selectedCell,
    bulkEditMode,
    bulkMode,
    showTemplates,
    showBulkDialog,
    permissions,
    allActions,
    filteredModules,
    groups,
    roles,
    isLoading,
    error,
    actionNameToIdMap,
    modules,

    // Actions
    setSelectedRole,
    setSearchTerm,
    setFilterGroup,
    setBulkEditMode,
    setBulkMode,
    setShowTemplates,
    setSelectedCells,
    toggleGroup,
    handleCellClick,
    handleSelectAllForModule,
    clearSelectedCells,
    closeSelectedCell,
    openBulkDialog,
    closeBulkDialog,
    savePermissionRule,
    applyTemplate,
    refetch: fetchPermissions,
    fetchPermissionsForRole,
  };
};

/**
 * Maps backend role types to frontend role types
 */
function mapRoleType(
  backendRole: "ADMINISTRATOR" | "REVIEWER" | "OPERATOR" | "VIEWER"
): "admin" | "reviewer" | "operator" | "viewer" {
  const mapping = {
    ADMINISTRATOR: "admin" as const,
    REVIEWER: "reviewer" as const,
    OPERATOR: "operator" as const,
    VIEWER: "viewer" as const,
  };
  return mapping[backendRole];
}
