"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Settings, Users, Shield, Mail, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ReportsManagement = () => {
  const [defaultFormat, setDefaultFormat] = useState('pdf');
  const [retentionDays, setRetentionDays] = useState('90');
  const [brandingEnabled, setBrandingEnabled] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Report management settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FileText className="h-6 w-6 text-brand-teal" />
        <h2 className="text-2xl font-bold">Reports Management</h2>
      </div>

      <Tabs defaultValue="defaults" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="defaults">Default Settings</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="retention">Retention Policies</TabsTrigger>
          <TabsTrigger value="permissions">Access Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="defaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Default Export Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default-format">Default Export Format</Label>
                <Select value={defaultFormat} onValueChange={setDefaultFormat}>
                  <SelectTrigger id="default-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="xlsx">Excel Workbook</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="charts" defaultChecked />
                  <Label htmlFor="charts">Include charts by default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="summary" defaultChecked />
                  <Label htmlFor="summary">Include executive summary</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={brandingEnabled} 
                  onCheckedChange={setBrandingEnabled}
                />
                <Label>Enable custom branding on reports</Label>
              </div>
              
              {brandingEnabled && (
                <>
                  <div>
                    <Label htmlFor="logo-url">Company Logo URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="logo-url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://your-company.com/logo.png"
                      />
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      placeholder="Your Company Name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="header-color">Header Color</Label>
                    <Input
                      id="header-color"
                      type="color"
                      defaultValue="#0ea5e9"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Output Retention Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="retention-days">Retention Period (Days)</Label>
                <Select value={retentionDays} onValueChange={setRetentionDays}>
                  <SelectTrigger id="retention-days">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="180">180 Days</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                    <SelectItem value="never">Never Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-cleanup" defaultChecked />
                  <Label htmlFor="auto-cleanup">Enable automatic cleanup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="archive-before-delete" />
                  <Label htmlFor="archive-before-delete">Archive reports before deletion</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Access Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Report Creation Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">Administrators</Badge>
                    <Badge variant="secondary">Report Managers</Badge>
                    <Badge variant="outline">+ Add Role</Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Report Scheduling Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">Administrators</Badge>
                    <Badge variant="secondary">Report Managers</Badge>
                    <Badge variant="secondary">Compliance Team</Badge>
                    <Badge variant="outline">+ Add Role</Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Sensitive Data Access</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">Administrators</Badge>
                    <Badge variant="outline">+ Add Role</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default ReportsManagement;
