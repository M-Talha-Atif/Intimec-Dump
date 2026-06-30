import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface HeaderFooterConfig {
  header: {
    showBanner: boolean;
    bannerText: string;
    bannerType: "info" | "warning" | "success" | "error";
    contactLinks: Array<{ label: string; url: string; type: string }>;
  };
  footer: {
    showCompliance: boolean;
    complianceText: string;
    customLinks: Array<{ label: string; url: string }>;
    localeSupport: boolean;
    showVersion: boolean;
  };
}

interface HeaderFooterSettingsProps {
  config: HeaderFooterConfig;
  onUpdate: (updates: Partial<HeaderFooterConfig>) => void;
}

const HeaderFooterSettings: React.FC<HeaderFooterSettingsProps> = ({
  config,
  onUpdate,
}) => {
  const bannerTypes = [
    { value: "info", label: "Information", color: "bg-blue-100 text-blue-800" },
    {
      value: "warning",
      label: "Warning",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "success",
      label: "Success",
      color: "bg-green-100 text-green-800",
    },
    { value: "error", label: "Error", color: "bg-red-100 text-red-800" },
  ];

  const linkTypes = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "url", label: "Website" },
    { value: "help", label: "Help Center" },
  ];

  const addContactLink = () => {
    const newLink = { label: "", url: "", type: "email" };
    onUpdate({
      header: {
        ...config.header,
        contactLinks: [...config.header.contactLinks, newLink],
      },
    });
  };

  const updateContactLink = (index: number, field: string, value: string) => {
    const updatedLinks = [...config.header.contactLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    onUpdate({
      header: {
        ...config.header,
        contactLinks: updatedLinks,
      },
    });
  };

  const removeContactLink = (index: number) => {
    const updatedLinks = config.header.contactLinks.filter(
      (_, i) => i !== index
    );
    onUpdate({
      header: {
        ...config.header,
        contactLinks: updatedLinks,
      },
    });
  };

  const addFooterLink = () => {
    const newLink = { label: "", url: "" };
    onUpdate({
      footer: {
        ...config.footer,
        customLinks: [...config.footer.customLinks, newLink],
      },
    });
  };

  const updateFooterLink = (index: number, field: string, value: string) => {
    const updatedLinks = [...config.footer.customLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    onUpdate({
      footer: {
        ...config.footer,
        customLinks: updatedLinks,
      },
    });
  };

  const removeFooterLink = (index: number) => {
    const updatedLinks = config.footer.customLinks.filter(
      (_, i) => i !== index
    );
    onUpdate({
      footer: {
        ...config.footer,
        customLinks: updatedLinks,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Header Configuration</CardTitle>
          <CardDescription>
            Configure header banners and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-banner"
              checked={config.header.showBanner}
              onCheckedChange={(checked) =>
                onUpdate({
                  header: { ...config.header, showBanner: checked },
                })
              }
            />
            <Label htmlFor="show-banner">Show Header Banner</Label>
          </div>

          {config.header.showBanner && (
            <div className="space-y-3 p-4 border rounded-lg">
              <div>
                <Label htmlFor="banner-text">Banner Message</Label>
                <Textarea
                  id="banner-text"
                  value={config.header.bannerText}
                  onChange={(e) =>
                    onUpdate({
                      header: { ...config.header, bannerText: e.target.value },
                    })
                  }
                  placeholder="Enter banner message"
                  rows={2}
                />
              </div>

              <div>
                <Label>Banner Type</Label>
                <Select
                  value={config.header.bannerType}
                  onValueChange={(
                    value: "info" | "warning" | "success" | "error"
                  ) =>
                    onUpdate({
                      header: { ...config.header, bannerType: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bannerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded ${type.color}`} />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Contact Links</Label>
              <Button variant="outline" size="sm" onClick={addContactLink}>
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            </div>

            {config.header.contactLinks.map((link, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-2 p-3 border rounded"
              >
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) =>
                    updateContactLink(index, "label", e.target.value)
                  }
                />
                <Input
                  placeholder="URL/Email/Phone"
                  value={link.url}
                  onChange={(e) =>
                    updateContactLink(index, "url", e.target.value)
                  }
                />
                <Select
                  value={link.type}
                  onValueChange={(value) =>
                    updateContactLink(index, "type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {linkTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeContactLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer Configuration</CardTitle>
          <CardDescription>
            Configure footer content and compliance information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-compliance"
              checked={config.footer.showCompliance}
              onCheckedChange={(checked) =>
                onUpdate({
                  footer: { ...config.footer, showCompliance: checked },
                })
              }
            />
            <Label htmlFor="show-compliance">Show Compliance Disclaimer</Label>
          </div>

          {config.footer.showCompliance && (
            <div>
              <Label htmlFor="compliance-text">Compliance Text</Label>
              <Textarea
                id="compliance-text"
                value={config.footer.complianceText}
                onChange={(e) =>
                  onUpdate({
                    footer: {
                      ...config.footer,
                      complianceText: e.target.value,
                    },
                  })
                }
                placeholder="Enter compliance disclaimer"
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="locale-support"
                checked={config.footer.localeSupport}
                onCheckedChange={(checked) =>
                  onUpdate({
                    footer: { ...config.footer, localeSupport: checked },
                  })
                }
              />
              <Label htmlFor="locale-support">Multi-language Support</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-version"
                checked={config.footer.showVersion}
                onCheckedChange={(checked) =>
                  onUpdate({
                    footer: { ...config.footer, showVersion: checked },
                  })
                }
              />
              <Label htmlFor="show-version">Show Version Number</Label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Custom Footer Links</Label>
              <Button variant="outline" size="sm" onClick={addFooterLink}>
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            </div>

            {config.footer.customLinks.map((link, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-2 p-3 border rounded"
              >
                <Input
                  placeholder="Link Label"
                  value={link.label}
                  onChange={(e) =>
                    updateFooterLink(index, "label", e.target.value)
                  }
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) =>
                    updateFooterLink(index, "url", e.target.value)
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFooterLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeaderFooterSettings;
