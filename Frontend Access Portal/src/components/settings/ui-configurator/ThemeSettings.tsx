import debounce from "lodash.debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun } from "lucide-react";

import { UIConfig } from "@/types/UIConfig";

type ThemeConfig = UIConfig["theme"];
interface ThemeSettingsProps {
  config: ThemeConfig;
  onUpdate: (updates: Partial<ThemeConfig>) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ config, onUpdate }) => {
  const roundedStyles: { value: ThemeConfig["roundedStyle"]; label: string }[] =
    [
      { value: "sharp", label: "Sharp" },
      { value: "rounded", label: "Rounded" },
    ];

  // Debounced update for smoother color picking
  const handleDebouncedUpdate = debounce((updates) => {
    onUpdate(updates);
  }, 200);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
          <CardDescription>
            Configure the application&apos;s color palette for light and dark
            mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Light Mode */}
            <div className="space-y-6">
              <h3 className="flex gap-2 items-center font-semibold text-lg">
                <Sun className="size-6" /> Light Mode
              </h3>

              <div>
                <Label htmlFor="primary">Primary Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="primary"
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({ primaryColor: e.target.value })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                    placeholder="#428C95"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondary">Secondary Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="secondary"
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({ secondaryColor: e.target.value })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.secondaryColor}
                    onChange={(e) =>
                      onUpdate({ secondaryColor: e.target.value })
                    }
                    placeholder="#64748b"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accent">Accent Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="accent"
                    type="color"
                    value={config.accentColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({ accentColor: e.target.value })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.accentColor}
                    onChange={(e) => onUpdate({ accentColor: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Background Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({ backgroundColor: e.target.value })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) =>
                      onUpdate({ backgroundColor: e.target.value })
                    }
                    placeholder="#f8fafc"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Card Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={config.cardColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({ cardColor: e.target.value })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.cardColor}
                    onChange={(e) => onUpdate({ cardColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Dark Mode */}
            <div className="space-y-6">
              <h3 className="flex gap-2 items-center font-semibold text-lg">
                <Moon className="size-6" /> Dark Mode
              </h3>

              <div>
                <Label>Dark Primary Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={config.darkPrimaryColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({
                        darkPrimaryColor: e.target.value,
                      })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.darkPrimaryColor}
                    onChange={(e) =>
                      onUpdate({ darkPrimaryColor: e.target.value })
                    }
                    placeholder="#428C95"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Dark Secondary Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={config.darkSecondaryColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({
                        darkSecondaryColor: e.target.value,
                      })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.darkSecondaryColor}
                    onChange={(e) =>
                      onUpdate({ darkSecondaryColor: e.target.value })
                    }
                    placeholder="#64748b"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Dark Accent Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={config.darkAccentColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({ darkAccentColor: e.target.value })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.darkAccentColor}
                    onChange={(e) =>
                      onUpdate({ darkAccentColor: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Dark Background Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={config.darkBackgroundColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({
                        darkBackgroundColor: e.target.value,
                      })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.darkBackgroundColor}
                    onChange={(e) =>
                      onUpdate({ darkBackgroundColor: e.target.value })
                    }
                    placeholder="#0f172a"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Dark Card Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={config.darkCardColor}
                    onChange={(e) =>
                      handleDebouncedUpdate({ darkCardColor: e.target.value })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.darkCardColor}
                    onChange={(e) =>
                      onUpdate({ darkCardColor: e.target.value })
                    }
                    placeholder="#1e293b"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Component Styling</CardTitle>
          <CardDescription>Customize buttons and UI components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rounded-style">Rounded Style</Label>
            <Select
              value={config.roundedStyle}
              onValueChange={(value) =>
                onUpdate({ roundedStyle: value as ThemeConfig["roundedStyle"] })
              }
            >
              <SelectTrigger id="rounded-style">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {roundedStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Configuration</CardTitle>
          <CardDescription>
            Customize the sidebar appearance and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sidebar-primary">Primary Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="sidebar-primary"
                  type="color"
                  value={config.sidebarStyle.primaryColor}
                  onChange={(e) =>
                    handleDebouncedUpdate({
                      sidebarStyle: {
                        ...config.sidebarStyle,
                        primaryColor: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  value={config.sidebarStyle.primaryColor}
                  onChange={(e) =>
                    onUpdate({
                      sidebarStyle: {
                        ...config.sidebarStyle,
                        primaryColor: e.target.value,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sidebar-bg">Background Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="sidebar-bg"
                  type="color"
                  value={config.sidebarStyle.backgroundColor}
                  onChange={(e) =>
                    handleDebouncedUpdate({
                      sidebarStyle: {
                        ...config.sidebarStyle,
                        backgroundColor: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  value={config.sidebarStyle.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      sidebarStyle: {
                        ...config.sidebarStyle,
                        backgroundColor: e.target.value,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sidebar-dark-primary">Dark Primary Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="sidebar-dark-primary"
                  type="color"
                  value={config.sidebarStyle.darkPrimaryColor}
                  onChange={(e) =>
                    handleDebouncedUpdate({
                      sidebarStyle: {
                        ...config.sidebarStyle,
                        darkPrimaryColor: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  value={config.sidebarStyle.darkPrimaryColor}
                  onChange={(e) =>
                    onUpdate({
                      sidebarStyle: {
                        ...config.sidebarStyle,
                        darkPrimaryColor: e.target.value,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sidebar-dark-bg">Dark Background Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="sidebar-dark-bg"
                  type="color"
                  value={config.sidebarStyle.darkBackgroundColor}
                  onChange={(e) =>
                    handleDebouncedUpdate({
                      sidebarStyle: {
                        ...config.sidebarStyle,
                        darkBackgroundColor: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  value={config.sidebarStyle.darkBackgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      sidebarStyle: {
                        ...config.sidebarStyle,
                        darkBackgroundColor: e.target.value,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeSettings;
