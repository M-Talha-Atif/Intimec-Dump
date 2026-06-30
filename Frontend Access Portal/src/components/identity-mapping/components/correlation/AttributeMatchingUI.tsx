"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { useCorrelationRulesContext } from "../../context/CorrelationRulesContext";
import { SchemaAttribute } from "../../types/index";

interface ApiRule {
  field?: string;
  operator?: string;
  valueSource?: string;
  value?: string;
}

interface Rule {
  id: string;
  type: "rule";
  field: string;        // IDENTITY attribute key (e.g. "employeeId") — queries identity table
  operator: string;
  valueSource: string;  // "value" = look up rule.value in account attrs at runtime
  value: string;        // ACCOUNT attribute key to look up at runtime
}

interface AttributeMatchingUIProps {
  resourceId: string;
  /** Stable card-level id used to look up the correct apiRule when multiple cards share the same source app. */
  cardRuleId?: string;
  onChange?: (ruleGroup: { combinator: string; rules: { field: string; operator: string; valueSource: string; value: string }[] }) => void;
}

interface Group {
  id: string;
  type: "group";
  combinator: "AND" | "OR";
  not: boolean;
  children: (Rule | Group)[];
}

export default function AttributeMatchingUI({ resourceId, cardRuleId, onChange }: AttributeMatchingUIProps) {
  const {
    apiRules,
    isLoading,
    error,
    schemaAttributes,
    isLoadingSchemaAttributes,
    schemaAttributesError,
    identityAttributes,
    isLoadingIdentityAttributes,
  } = useCorrelationRulesContext();

  // Initialize query state from API data or with default structure
  const [query, setQuery] = useState<Group>({
    id: "root",
    type: "group",
    combinator: "AND",
    not: false,
    children: [],
  });

  // Ref to break the apiRules→query→onChange→apiRules infinite loop.
  // Starts as true so the initial mount effect run (before apiRules load) is skipped.
  const isSyncingFromApi = useRef(true);

  // RIGHT side: account/connector attributes for this resource
  const getAccountAttributes = (): {
    fieldOptions: { key: string; label: string }[];
    isLoading: boolean;
    error: string | null;
  } => {
    const isLoadingForResource = isLoadingSchemaAttributes[resourceId] || false;
    const errorForResource = schemaAttributesError[resourceId] || null;
    const attributesForResource = schemaAttributes[resourceId] || [];
    const fieldOptions = attributesForResource.map((attr: SchemaAttribute) => ({
      key: attr.nativeAttributeName,
      label: attr.nativeAttributeName,
    }));
    return { fieldOptions, isLoading: isLoadingForResource, error: errorForResource };
  };

  // LEFT side: identity schema attributes
  const getIdentityAttributeOptions = (): {
    fieldOptions: { key: string; label: string }[];
    isLoading: boolean;
  } => ({
    fieldOptions: identityAttributes.map((a) => ({
      key: a.systemKey,
      label: a.displayName ? `${a.displayName} (${a.systemKey})` : a.systemKey,
    })),
    isLoading: isLoadingIdentityAttributes,
  });

  // Transform API data to component format when apiRules change
  useEffect(() => {
    if (apiRules && apiRules.length > 0 && resourceId) {
      // Prefer matching by cardRuleId (_cardId) so two cards with the same source app
      // don't display each other's conditions. Fall back to resourceId for backward compat.
      const matchingApiRule = cardRuleId
        ? apiRules.find((r) => r._cardId === cardRuleId)
        : apiRules.find((r) => r.resourceId === resourceId);

      if (matchingApiRule && matchingApiRule.ruleGroup) {
        // rule.field = IDENTITY attribute | rule.value = ACCOUNT attribute key (valueSource="value")
        const transformedRules: Rule[] = matchingApiRule.ruleGroup.rules.map(
          (rule: ApiRule, index: number) => ({
            id: (index + 1).toString(),
            type: "rule",
            field: rule.field || "",
            operator: rule.operator || "=",
            valueSource: rule.valueSource || "value",
            value: rule.value || "",
          })
        );

        const combinator = matchingApiRule.ruleGroup.combinator;
        let validCombinator: "AND" | "OR" = "AND";
        if (combinator) {
          const upperCombinator = combinator.toUpperCase();
          if (upperCombinator === "AND" || upperCombinator === "OR") {
            validCombinator = upperCombinator as "AND" | "OR";
          }
        }

        isSyncingFromApi.current = true;
        setQuery({
          id: "root",
          type: "group",
          combinator: validCombinator,
          not: false,
          children: transformedRules,
        });
      }
    } else if (!resourceId) {
      isSyncingFromApi.current = true;
      setQuery({
        id: "root",
        type: "group",
        combinator: "AND",
        not: false,
        children: [],
      });
    }
  }, [apiRules, resourceId, cardRuleId]);

  // Propagate query changes back to parent via onChange
  // Skip when the change came from apiRules sync (breaks the infinite loop)
  useEffect(() => {
    if (isSyncingFromApi.current) {
      isSyncingFromApi.current = false;
      return;
    }
    if (!onChange) return;
    const extractRules = (group: Group): { field: string; operator: string; valueSource: string; value: string }[] => {
      const result: { field: string; operator: string; valueSource: string; value: string }[] = [];
      for (const child of group.children) {
        if (child.type === "rule") {
          result.push({
            field: child.field,
            operator: child.operator,
            valueSource: child.valueSource || "value",
            value: child.value,
          });
        } else if (child.type === "group") {
          result.push(...extractRules(child));
        }
      }
      return result;
    };
    onChange({
      combinator: query.combinator.toLowerCase(),
      rules: extractRules(query),
    });
  }, [query]); // intentionally omit onChange to avoid infinite loops

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-gray-500">
            Loading correlation rules...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-red-600">
            Error loading correlation rules: {error}
          </div>
        </div>
      </div>
    );
  }

  const addRule = (parentId: string) => {
    const newRule: Rule = {
      id: Date.now().toString(),
      type: "rule",
      field: "",
      operator: "=",
      valueSource: "value",
      value: "",
    };
    updateGroup(parentId, (group) => ({
      ...group,
      children: [...group.children, newRule],
    }));
  };

  const addGroup = (parentId: string) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      type: "group",
      combinator: "AND",
      not: false,
      children: [],
    };
    updateGroup(parentId, (group) => ({
      ...group,
      children: [...group.children, newGroup],
    }));
  };

  const removeItem = (itemId: string) => {
    const removeFromGroup = (group: Group): Group => ({
      ...group,
      children: group.children
        .filter((child) => child.id !== itemId)
        .map((child) =>
          child.type === "group" ? removeFromGroup(child) : child
        ),
    });
    setQuery(removeFromGroup(query));
  };

  const updateGroup = (groupId: string, updater: (group: Group) => Group) => {
    const updateInGroup = (group: Group): Group => {
      if (group.id === groupId) {
        return updater(group);
      }
      return {
        ...group,
        children: group.children.map((child) =>
          child.type === "group" ? updateInGroup(child) : child
        ),
      };
    };
    setQuery(updateInGroup(query));
  };

  const updateRule = (ruleId: string, updates: Partial<Rule>) => {
    const updateInGroup = (group: Group): Group => ({
      ...group,
      children: group.children.map((child) => {
        if (child.type === "rule" && child.id === ruleId) {
          return { ...child, ...updates };
        }
        if (child.type === "group") {
          return updateInGroup(child);
        }
        return child;
      }),
    });
    setQuery(updateInGroup(query));
  };

  const renderGroup = (group: Group, depth = 0): React.ReactNode => {
    const backgroundColor = `bg-gray-${50 + depth * 10}`;

    return (
      <div
        key={group.id}
        className={`space-y-2 ${backgroundColor} rounded-lg p-4 border ${
          depth > 0 ? "ml-6 pl-4 border-l-2 border-gray-200" : ""
        }`}
      >
        {/* Group Header */}
        <div className="flex items-center gap-2">
          <Select
            value={group.combinator}
            onValueChange={(value) =>
              updateGroup(group.id, (g) => ({
                ...g,
                combinator: value as "AND" | "OR",
              }))
            }
          >
            <SelectTrigger className="w-20 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Checkbox
              checked={group.not}
              onCheckedChange={(checked) =>
                updateGroup(group.id, (g) => ({ ...g, not: checked === true }))
              }
            />
            <span className="text-sm">Not</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRule(group.id)}
            >
              <Plus className="w-4 h-4" />
              Rule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addGroup(group.id)}
            >
              <Plus className="w-4 h-4" />
              Group
            </Button>
            {depth > 0 && (
              <Button
                variant="destructive"
                size="icon"
                className="w-8 h-8"
                onClick={() => removeItem(group.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Group Children */}
        <div className="space-y-2">
          {group.children.map((child) => {
            if (child.type === "group") {
              return renderGroup(child, depth + 1);
            } else {
              return renderRule(child);
            }
          })}
        </div>
      </div>
    );
  };

  const renderRule = (rule: Rule): React.ReactNode => {
    const {
      fieldOptions: accountOptions,
      isLoading: isLoadingAccount,
      error: accountError,
    } = getAccountAttributes();

    const {
      fieldOptions: identityOptions,
      isLoading: isLoadingIdentity,
    } = getIdentityAttributeOptions();

    // Identity field is invalid when options loaded but rule.field doesn't match any known identity attribute
    const identityFieldInvalid =
      !isLoadingIdentity &&
      identityOptions.length > 0 &&
      !!rule.field &&
      !identityOptions.some((o) => o.key === rule.field);

    // Account value matches when empty (unset) or found in connector schema
    const accountValueHasMatch = !rule.value || accountOptions.some((o) => o.key === rule.value);

    return (
      <div key={rule.id} className="flex items-start gap-2 ml-6">
        {/* LEFT: Identity attribute — rule.field — queries the identity table */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide pl-1">
            Identity Attribute
          </span>
          <Select
            value={identityFieldInvalid ? "" : rule.field}
            onValueChange={(value) => updateRule(rule.id, { field: value })}
            disabled={isLoadingIdentity}
          >
            <SelectTrigger
              className={`w-48 bg-white ${isLoadingIdentity ? "opacity-60" : ""} ${
                identityFieldInvalid ? "border-red-400" : ""
              }`}
            >
              <SelectValue placeholder={isLoadingIdentity ? "Loading..." : "Select identity attribute"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingIdentity ? (
                <SelectItem value="__loading__" disabled>Loading identity attributes...</SelectItem>
              ) : identityOptions.length > 0 ? (
                identityOptions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                ))
              ) : (
                <SelectItem value="__empty__" disabled>No identity attributes found</SelectItem>
              )}
            </SelectContent>
          </Select>
          {identityFieldInvalid && (
            <span className="text-[10px] text-red-500 pl-1 mt-0.5">
              Invalid: &quot;{rule.field}&quot; is not a known identity attribute
            </span>
          )}
        </div>

        {/* Operator */}
        <Select
          value={rule.operator}
          onValueChange={(value) => updateRule(rule.id, { operator: value })}
        >
          <SelectTrigger className="w-16 bg-white mt-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="=">=</SelectItem>
            <SelectItem value="!=">!=</SelectItem>
            <SelectItem value="contains">contains</SelectItem>
          </SelectContent>
        </Select>

        {/* RIGHT: Account attribute — rule.value — looked up in connector account data at runtime */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide pl-1">
            Account Attribute
          </span>
          <Select
            value={accountValueHasMatch ? rule.value : ""}
            onValueChange={(value) => updateRule(rule.id, { value, valueSource: "value" })}
            disabled={isLoadingAccount}
          >
            <SelectTrigger
              className={`w-56 bg-white ${isLoadingAccount ? "opacity-60" : ""} ${
                accountError ? "border-red-300" : ""
              }`}
            >
              <SelectValue
                placeholder={
                  isLoadingAccount
                    ? "Loading..."
                    : rule.value && !accountValueHasMatch
                    ? rule.value
                    : "Select account attribute"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {isLoadingAccount ? (
                <SelectItem value="__loading__" disabled>Loading account attributes...</SelectItem>
              ) : accountError ? (
                <SelectItem value="__error__" disabled>Error: {accountError}</SelectItem>
              ) : accountOptions.length > 0 ? (
                accountOptions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                ))
              ) : (
                <SelectItem value="__empty__" disabled>No schema attributes configured</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="destructive"
          size="icon"
          className="w-8 h-8 ml-auto mt-4"
          onClick={() => removeItem(rule.id)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">{renderGroup(query)}</div>
  );
}