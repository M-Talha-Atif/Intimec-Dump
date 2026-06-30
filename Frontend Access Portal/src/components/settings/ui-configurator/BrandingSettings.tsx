import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { UIConfig } from "@/types/UIConfig";
import { ImageIcon } from "lucide-react";

interface BrandingSettingsProps {
  config: UIConfig["branding"];
  onUpdate: (updates: Partial<UIConfig["branding"]>) => void;
}

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({
  config,
  onUpdate,
}) => {
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (type === "logoLight") {
        onUpdate({
          logoLightData: {
            url: dataUrl,
            mime: file.type,
            fileName: file.name,
            fromApi: false,
          },
        });
      } else if (type === "logoDark") {
        onUpdate({
          logoDarkData: {
            url: dataUrl,
            mime: file.type,
            fileName: file.name,
            fromApi: false,
          },
        });
      } else if (type === "favicon") {
        onUpdate({
          faviconData: {
            url: dataUrl,
            mime: file.type,
            fileName: file.name,
            fromApi: false,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Identity</CardTitle>
          <CardDescription>
            Configure your organization&apos;s basic branding information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={config.organizationName || ""}
              onChange={(e) => onUpdate({ organizationName: e.target.value })}
              placeholder={`Enter organization name`}
            />
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={config.tagline}
              onChange={(e) => onUpdate({ tagline: e.target.value })}
              placeholder="Enter organization tagline"
            />
          </div>

          <div>
            <Label htmlFor="footer">Footer Text</Label>
            <Textarea
              id="footer"
              value={config.footerText}
              onChange={(e) => onUpdate({ footerText: e.target.value })}
              placeholder="Enter footer text"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo & Visual Assets</CardTitle>
          <CardDescription>
            Upload and manage your organization&apos;s visual identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Light Mode Logo</Label>
              <div className="mt-2 border-2 border-dashed border-primary rounded-lg p-4 text-center">
                {config.logoLightData?.url ? (
                  <img
                    src={
                      config?.logoLightData?.fileName === "image"
                        ? `data:${config?.logoLightData?.mime};base64,${config?.logoLightData?.url}`
                        : config?.logoLightData?.url
                    }
                    alt="Light logo"
                    className="max-h-16 mx-auto"
                  />
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500">No logo uploaded</p>
                  </div>
                )}

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "logoLight")}
                />
              </div>
            </div>

            <div>
              <Label>Dark Mode Logo</Label>
              <div className="mt-2 border-2 border-dashed border-primary rounded-lg p-4 text-center">
                {config.logoDarkData?.url ? (
                  <img
                    src={
                      config?.logoDarkData?.fileName === "image"
                        ? `data:${config?.logoDarkData?.mime};base64,${config?.logoDarkData?.url}`
                        : config?.logoDarkData?.url
                    }
                    alt="Dark logo"
                    className="max-h-16 mx-auto"
                  />
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500">No logo uploaded</p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "logoDark")}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Favicon</Label>
            <div className="mt-2 border-2 border-dashed border-primary rounded-lg p-4 text-center">
              {config.faviconData?.url ? (
                <img
                  src={
                    config?.faviconData?.fileName === "image"
                      ? `data:${config?.faviconData?.mime};base64,${config?.faviconData?.url}`
                      : config?.faviconData?.url
                  }
                  alt="Favicon"
                  className="h-8 w-8 mx-auto"
                />
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500">No favicon uploaded</p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "favicon")}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 32x32px PNG or ICO format
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
