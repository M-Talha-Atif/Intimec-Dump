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
import { Switch } from "@/components/ui/switch";
import { ImageIcon } from "lucide-react";

interface LoginPageConfig {
  backgroundColor: string;
  darkBackgroundColor: string;
  welcomeMessage: string;
  showTagline: boolean;
  enableLoginBackgroundImage: boolean;
  backgroundImageData: {
    url: string | undefined;
    mime: string | undefined;
    fileName: string | undefined;
    fromApi: boolean;
  };
  backgroundImageDarkData: {
    url: string | undefined;
    mime: string | undefined;
    fileName: string | undefined;
    fromApi: boolean;
  }
}

interface LoginPageSettingsProps {
  config: LoginPageConfig;
  onUpdate: (updates: Partial<LoginPageConfig>) => void;
}

const LoginPageSettings: React.FC<LoginPageSettingsProps> = ({
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
      if (type === "backgroundImageData") {
        onUpdate({
          backgroundImageData: {
            url: dataUrl,
            mime: file.type,
            fileName: file.name,
            fromApi: false,
          },
        });
      } else if (type === "backgroundImageDarkData") {
        onUpdate({
          backgroundImageDarkData: {
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
          <CardTitle>Login Page Layout</CardTitle>
          <CardDescription>
            Customize the appearance of your login page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="welcome">Welcome Message</Label>
            <Textarea
              id="welcome"
              value={config.welcomeMessage}
              onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
              placeholder="Enter welcome message"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-tagline"
              checked={config.showTagline}
              onCheckedChange={(checked) => onUpdate({ showTagline: checked })}
            />
            <Label htmlFor="show-tagline">Show Organization Tagline</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background Configuration</CardTitle>
          <CardDescription>Set up the login page background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bg-color">Background Color</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="bg-color"
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                value={config.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                placeholder="#f8fafc"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="dark-bg-color">Dark Background Color</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="dark-bg-color"
                type="color"
                value={config.darkBackgroundColor}
                onChange={(e) =>
                  onUpdate({ darkBackgroundColor: e.target.value })
                }
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                value={config.darkBackgroundColor}
                onChange={(e) =>
                  onUpdate({ darkBackgroundColor: e.target.value })
                }
                placeholder="#1e293b"
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-tagline"
              checked={config.enableLoginBackgroundImage}
              onCheckedChange={(checked) => onUpdate({ enableLoginBackgroundImage: checked })}
            />
            <Label htmlFor="show-tagline">Show background image on login screen</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Light Mode Logo</Label>
              <div className="mt-2 border-2 border-dashed border-primary rounded-lg p-4 text-center">
                {config.backgroundImageData?.url ? (
                  <img
                    src={
                      config?.backgroundImageData?.fileName === "image"
                        ? `data:${config?.backgroundImageData?.mime};base64,${config?.backgroundImageData?.url}`
                        : config?.backgroundImageData?.url
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
                  onChange={(e) => handleImageChange(e, "backgroundImageData")}
                />
              </div>
            </div>

            <div>
              <Label>Dark Mode Logo</Label>
              <div className="mt-2 border-2 border-dashed border-primary rounded-lg p-4 text-center">
                {config.backgroundImageDarkData?.url ? (
                  <img
                    src={
                      config?.backgroundImageDarkData?.fileName === "image"
                        ? `data:${config?.backgroundImageDarkData?.mime};base64,${config?.backgroundImageDarkData?.url}`
                        : config?.backgroundImageDarkData?.url
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
                  onChange={(e) => handleImageChange(e, "backgroundImageDarkData")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPageSettings;
