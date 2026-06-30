"use client";

import { useForm } from "react-hook-form";
import NavigationButtons from "../NavigationButtons";
import { Form } from "@/components/ui/form";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Eye,
  Plus,
  Trash2,
  Code,
  Zap,
  Shield,
  CheckCircle,
  Settings,
  Edit,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProvisioningRule {
  id: string;
  action: "create" | "update" | "delete" | "suspend" | "unlock";
  condition: string;
  value: string;
}

export default function ProvisioningForm() {
  const { currentFormStep, handleFinalSubmit, mode, applicationId } =
    useAddApplicationContext();
  const form = useForm();
  const router = useRouter();

  const [enabledActions, setEnabledActions] = useState({
    create: true,
    update: true,
    delete: false,
    suspend: true,
    unlock: true,
  });

  const [enabledEntitlementActions, setEnabledEntitlementActions] = useState({
    create: true,
    update: true,
    delete: false,
  });

  const [rules, setRules] = useState<ProvisioningRule[]>([
    { id: "1", action: "create", condition: "department", value: "Finance" },
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [showRulesPanel, setShowRulesPanel] = useState(false);
  const [accountMappingCounts] = useState<Record<string, number>>({
    create: 0, update: 0, delete: 0, suspend: 0, unlock: 0,
  });
  const [entitlementMappingCounts] = useState<Record<string, number>>({
    create: 0, update: 0, delete: 0,
  });

  const toggleAction = (action: keyof typeof enabledActions) => {
    setEnabledActions((prev) => ({ ...prev, [action]: !prev[action] }));
  };

  const toggleEntitlementAction = (
    action: keyof typeof enabledEntitlementActions
  ) => {
    setEnabledEntitlementActions((prev) => ({
      ...prev,
      [action]: !prev[action],
    }));
  };

  const addRule = () => {
    setRules([
      ...rules,
      { id: Date.now().toString(), action: "create", condition: "", value: "" },
    ]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const updateRule = (
    id: string,
    field: keyof ProvisioningRule,
    value: string
  ) => {
    setRules(
      rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule))
    );
  };

  const actionDescriptions: Record<string, string> = {
    create:
      "Automatically create an account when a user is granted access.",
    update:
      "Keep account attributes in sync with the identity profile.",
    delete: "Delete the account when all access is revoked.",
    suspend: "Temporarily disable account access when needed.",
    unlock: "Automatically unlock accounts when conditions are met.",
  };

  const entitlementDescriptions: Record<string, string> = {
    create:
      "Automatically create an entitlement when a user is granted access.",
    update:
      "Keep entitlement attributes in sync with the identity profile.",
    delete: "Delete the entitlement when all access is revoked.",
  };

  if (currentFormStep !== "provisioning") return null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (await handleFinalSubmit(data)) {
            if (mode === "edit" && applicationId) {
              router.push(`/applications/${applicationId}/overview`);
            } else {
              router.push("/applications");
            }
          }
        })}
        id="details-form"
        className="flex flex-col h-full"
      >
        <h1 className="mb-4 text-lg font-semibold">Provisioning</h1>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-6 pb-4">
            {/* Account Provisioning Policies */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Provisioning Policies</CardTitle>
                    <CardDescription>
                      Define how accounts and access should be managed for this
                      application.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRulesPanel(!showRulesPanel)}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Rules
                    </Button>
                    <Button type="button" variant="outline" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      AI Optimize
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(enabledActions).map(([action, enabled]) => (
                    <div
                      key={action}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <Label
                        htmlFor={`${action}-account`}
                        className="flex flex-col space-y-1"
                      >
                        <span className="capitalize">{action} Account</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                          {actionDescriptions[action]}
                        </span>
                        {enabled && (
                          <button
                            type="button"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-700 underline text-left"
                            onClick={() =>
                              toast.info(`Configure mapping for ${action} coming soon`)
                            }
                          >
                            ⚙ Configure Mapping ({accountMappingCounts[action] ?? 0})
                          </button>
                        )}
                      </Label>
                      <Switch
                        id={`${action}-account`}
                        checked={enabled}
                        onCheckedChange={() =>
                          toggleAction(
                            action as keyof typeof enabledActions
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Entitlement Policies */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Entitlement Policies
                    </CardTitle>
                    <CardDescription>
                      Define how entitlements (groups, roles, permissions) should
                      be managed for this application.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    AI Optimize
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(enabledEntitlementActions).map(
                    ([action, enabled]) => (
                      <div
                        key={action}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <Label
                          htmlFor={`${action}-entitlement`}
                          className="flex flex-col space-y-1"
                        >
                          <span className="capitalize">
                            {action} Entitlement
                          </span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            {entitlementDescriptions[action]}
                          </span>
                          {enabled && (
                            <button
                              type="button"
                              className="mt-1 text-sm text-blue-600 hover:text-blue-700 underline text-left"
                              onClick={() =>
                                toast.info(`Configure mapping for ${action} entitlement coming soon`)
                              }
                            >
                              ⚙ Configure Mapping ({entitlementMappingCounts[action] ?? 0})
                            </button>
                          )}
                        </Label>
                        <Switch
                          id={`${action}-entitlement`}
                          checked={enabled}
                          onCheckedChange={() =>
                            toggleEntitlementAction(
                              action as keyof typeof enabledEntitlementActions
                            )
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Provisioning Rules */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Basic Provisioning Rules</CardTitle>
                    <CardDescription>
                      Define simple conditions for each provisioning action.
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? "Hide" : "Show"} Preview
                    </Button>
                    <Button type="button" variant="outline" size="sm">
                      <Brain className="h-4 w-4 mr-2" />
                      AI Suggestions
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Rule Configuration
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Action
                        </Label>
                        <Select
                          value={rule.action}
                          onValueChange={(value) =>
                            updateRule(rule.id, "action", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="create">Create</SelectItem>
                            <SelectItem value="update">Update</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="suspend">Suspend</SelectItem>
                            <SelectItem value="unlock">Unlock</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Condition
                        </Label>
                        <Select
                          value={rule.condition}
                          onValueChange={(value) =>
                            updateRule(rule.id, "condition", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="department">
                              Department
                            </SelectItem>
                            <SelectItem value="title">Job Title</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="costCenter">
                              Cost Center
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Value
                        </Label>
                        <Input
                          placeholder="Enter value"
                          value={rule.value}
                          onChange={(e) =>
                            updateRule(rule.id, "value", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      <strong>Rule:</strong>{" "}
                      {rule.action.charAt(0).toUpperCase() +
                        rule.action.slice(1)}{" "}
                      account only if {rule.condition} equals &quot;{rule.value}
                      &quot;
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addRule}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Provisioning Preview
                  </CardTitle>
                  <CardDescription>
                    Before and after comparison of provisioning behavior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Before (Legacy)
                      </Label>
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded dark:bg-red-950 dark:border-red-800">
                        <ul className="text-sm space-y-1">
                          <li>• Create account for all users</li>
                          <li>• Manual attribute updates</li>
                          <li>• No conditional logic</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        After (Enhanced)
                      </Label>
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded dark:bg-green-950 dark:border-green-800">
                        <ul className="text-sm space-y-1">
                          {rules.map((rule) => (
                            <li key={rule.id}>
                              •{" "}
                              {rule.action.charAt(0).toUpperCase() +
                                rule.action.slice(1)}{" "}
                              if {rule.condition} = {rule.value}
                            </li>
                          ))}
                          <li>• Automatic attribute synchronization</li>
                          <li>• Rule-based provisioning</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Smart Workflow Recommender */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  Smart Workflow Recommender
                  <Badge
                    variant="outline"
                    className="ml-2 bg-background border-purple-300 text-purple-700 dark:bg-purple-950 dark:border-purple-600"
                  >
                    AI Powered
                  </Badge>
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Get intelligent workflow recommendations based on your
                  application&apos;s characteristics, risk profile, and industry
                  best practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Compliance-aware suggestions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Risk-based flow optimization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Industry best practices</span>
                  </div>
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
                  onClick={() =>
                    toast.info("AI Workflow Recommender coming soon")
                  }
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Get AI Workflow Recommendations
                </Button>
              </CardContent>
            </Card>

            {/* Create Custom Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Create Custom Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Design a custom approval workflow tailored to this
                  application&apos;s specific requirements and your
                  organization&apos;s governance policies.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      router.push("/workflows?tab=designer&mode=canvas")
                    }
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Canvas Designer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push("/workflows?tab=designer&mode=linear")
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Linear Builder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <NavigationButtons submitting={form.formState.isSubmitting}>
          <div className="flex justify-between mt-4">
            <NavigationButtons.PreviousButton />
            <NavigationButtons.FinishButton />
          </div>
        </NavigationButtons>
      </form>
    </Form>
  );
}
