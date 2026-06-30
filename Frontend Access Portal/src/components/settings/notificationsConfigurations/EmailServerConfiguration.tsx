"use client";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, RotateCcw, ChevronDown, AlertCircle, CheckCircle, Loader2, HelpCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useSimpleNavigationGuard } from "@/hooks/useNavigationGuard";
import { SimpleConfirmDialog } from "@/components/ui/ConfirmDialog";


export const emailConfigSchema = z.object({
  smtpHostname: z.string().min(1, { message: "SMTP hostname is required" }),
  smtpPort: z
    .number()
    .min(1, { message: "Port is required" })
    .max(65535, { message: "Port must be between 1 and 65535" }),
  encryptionType: z.enum(["NONE", "STARTTLS", "SSL_TLS"]),
  authMethod: z.enum(["USERNAME_PASSWORD", "API_KEY", "OAUTH2"]),
  username: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  emailAddress: z.string().email({ message: "Invalid email address" }),
  testRecipient: z
    .union([z.string().email({ message: "Invalid email address" }), z.literal("")])
    .optional()
    .default(""),
  retryAttempts: z
    .number()
    .min(1, { message: "Retry attempts is required" })
    .max(10, { message: "Retry attempts must be between 1 and 10" })
    .default(3),
  connectionTimeout: z
    .number()
    .min(1000, { message: "Timeout must be at least 1000ms" })
    .max(60000, { message: "Timeout must be less than 60000ms" })
    .default(30000),
  enableEmailLogs: z.boolean().default(true),
  enableRateLimit: z.boolean().default(false),
});


export type EmailConfigFormData = z.infer<typeof emailConfigSchema>;
export interface EmailServerConfigurationRef {
  hasUnsavedChanges: () => boolean;
}

const toNumber = (value: string) => (value === "" ? (undefined as unknown as number) : Number(value));

const EmailServerConfiguration = forwardRef<EmailServerConfigurationRef>((props, ref) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNew, setIsNew] = useState(true);

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => hasUnsavedChanges,
  }));

  const form = useForm({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      smtpHostname: "",
      smtpPort: 587,
      encryptionType: "STARTTLS",
      authMethod: "USERNAME_PASSWORD",
      username: "",
      password: "",
      apiKey: "",
      emailAddress: "",
      testRecipient: "",
      retryAttempts: 3,
      connectionTimeout: 30000,
      enableEmailLogs: true,
      enableRateLimit: false,
    },
    mode: "onChange",
  });


  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/email/configuration");
      if (!res.ok) throw new Error("Failed to fetch config");

      const { data } = await res.json();
      console.log("Email Configuation Data:", data.encryptionType)
      if (data) {
        setIsNew(false);
        form.reset({
          smtpHostname: data.smtpHostname ?? "",
          smtpPort: data.smtpPort ?? 587,
          encryptionType: data.encryptionType,
          authMethod: data.authMethod ?? "USERNAME_PASSWORD",
          username: data.username ?? "",
          apiKey: data.apiKey ?? "",
          emailAddress: data.emailAddress ?? "",
          testRecipient: "",
          retryAttempts: data.retryAttempts ?? 3,
          connectionTimeout: data.connectionTimeout ?? 30000,
          enableEmailLogs: data.enableEmailLogs ?? true,
          enableRateLimit: data.enableRateLimit ?? false,
        });
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.log(error)
      // fallback to defaults
      form.reset();
      setHasUnsavedChanges(false);
    }
  };


  useEffect(() => {
    fetchConfig();
  }, []);


  const handleFormChange = () => {
    setHasUnsavedChanges(true);
    setTestResult(null);
  };

  const onSave = async (data: z.infer<typeof emailConfigSchema>) => {
    setIsSaving(true);
    try {
      let res;
      if (isNew) {

        res = await fetch("/api/email/configuration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      else {
        res = await fetch(`/api/email/configuration`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      if (!res.ok) throw new Error("Failed to save");
      setHasUnsavedChanges(false);
      toast("Saved successfully ✅", {
        description: "Email server configuration saved successfully.",
      });
    } catch (error) {
      toast("Save failed ❌", {
        description: "Failed to save email configuratio",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSendTest = async () => {
    const formData = form.getValues();

    if (!formData.testRecipient) {

      toast("Test failed ❌", {
        description: "Please enter a test recipient email address",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/email/configuration/test/${formData.testRecipient}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to send test email");

      setTestResult({
        success: true,
        message: `Test email sent successfully to ${formData.testRecipient}`,
      });
      toast("Test Sent ✅", {
        description: "Test email sent successfully",
      });
    } catch (error) {
      setTestResult({ success: false, message: "Failed to send test email" });

      toast("Test failed ❌", {
        description: "Test email failed to send",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onReset = () => {
    fetchConfig();
    setHasUnsavedChanges(false);
    setTestResult(null);
  };

  const navigationGuard = useSimpleNavigationGuard({
    hasUnsavedChanges: hasUnsavedChanges, // or isDirty for React Hook Form
    message: "You have unsaved changes. Are you sure you want to leave?", // Optional custom message
  });

  return (
    <>
      <TooltipProvider>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-brand-teal" />
            <h2 className="text-2xl font-bold">Email Server Configuration</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} onChange={handleFormChange} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SMTP Server Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpHostname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <span>SMTP Hostname</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>The hostname of your SMTP server (e.g., smtp.gmail.com)</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <span>SMTP Port</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Common ports: 587 (STARTTLS), 465 (SSL), 25 (Plain)</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="587"
                              value={Number.isNaN(field.value as unknown as number) ? "" : field.value}
                              onChange={(e) => field.onChange(toNumber(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="encryptionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Encryption Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select encryption type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="STARTTLS">STARTTLS</SelectItem>
                            <SelectItem value="SSL_TLS">SSL/TLS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="noreply@yourcompany.com" {...field} />
                        </FormControl>
                        <FormDescription>This will be used as the sender address for all outbound emails</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="testRecipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Recipient Email</FormLabel>
                        <FormControl>
                          <Input placeholder="test@example.com" {...field} />
                        </FormControl>
                        <FormDescription>Enter an email address to receive test emails</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="button" variant="outline" onClick={onSendTest} disabled={isTesting} className="w-full md:w-auto">
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Test Email...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>

                  {testResult && (
                    <Alert variant={testResult.success ? "default" : "destructive"}>
                      {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <AlertDescription>{testResult.message}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:bg-primary hover:text-navbar-text transition-colors duration-200 ease-in-out">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Advanced Settings</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="retryAttempts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Retry Attempts</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={Number.isNaN(field.value as unknown as number) ? "" : field.value}
                                  onChange={(e) => field.onChange(toNumber(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Number of retry attempts for failed emails</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="connectionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Connection Timeout (ms)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1000}
                                  max={60000}
                                  value={Number.isNaN(field.value as unknown as number) ? "" : field.value}
                                  onChange={(e) => field.onChange(toNumber(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Connection timeout in milliseconds</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="enableEmailLogs"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Email Logs</FormLabel>
                                <FormDescription>Log all email sending activities for audit purposes</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enableRateLimit"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Rate Limiting</FormLabel>
                                <FormDescription>Limit the number of emails sent per minute</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-none">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={onReset} disabled={isSaving} className="flex-1 sm:flex-none">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>

                {hasUnsavedChanges && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            </form>
          </Form>
        </div>
      </TooltipProvider >
      <SimpleConfirmDialog
        open={navigationGuard.showDialog}
        message={navigationGuard.message}
        onIgnoreChanges={navigationGuard.onIgnoreChanges}
        onCancel={navigationGuard.onCancel}
      />
    </>
  );
});

EmailServerConfiguration.displayName = "EmailServerConfiguration";

export default EmailServerConfiguration;