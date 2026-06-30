import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Key } from "lucide-react";
import { PasswordPolicyConfig } from "@/types/loginSecurity";

interface PasswordPolicyCardProps {
  config: PasswordPolicyConfig;
  onChange: (updates: Partial<PasswordPolicyConfig>) => void;
  errors?: Record<string, string>;
}

export const PasswordPolicyCard: React.FC<PasswordPolicyCardProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleLengthChange = (delta: number) => {
    const newLength = Math.max(6, Math.min(128, config.minLength + delta));
    onChange({ minLength: newLength });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Password Policy
        </CardTitle>
        <CardDescription>
          Configure password complexity requirements following NIST guidelines
          for improved security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Length */}
        <div className="space-y-2">
          <Label>Minimum Password Length</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleLengthChange(-1)}
              disabled={config.minLength <= 6}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium w-8 text-center">
                {config.minLength}
              </span>
              <span className="text-sm text-muted-foreground">characters</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleLengthChange(1)}
              disabled={config.minLength >= 128}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {errors.minLength && (
            <p className="text-sm text-destructive">{errors.minLength}</p>
          )}
        </div>

        {/* Character Requirements */}
        <div className="space-y-3">
          <Label>Character Requirements</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="requireLowercase" className="text-sm">
                Require lowercase
              </Label>
              <Switch
                id="requireLowercase"
                checked={config.requireLowercase}
                onCheckedChange={(checked) =>
                  onChange({ requireLowercase: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireUppercase" className="text-sm">
                Require uppercase
              </Label>
              <Switch
                id="requireUppercase"
                checked={config.requireUppercase}
                onCheckedChange={(checked) =>
                  onChange({ requireUppercase: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireNumber" className="text-sm">
                Require number
              </Label>
              <Switch
                id="requireNumber"
                checked={config.requireNumber}
                onCheckedChange={(checked) =>
                  onChange({ requireNumber: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireSymbol" className="text-sm">
                Require symbol
              </Label>
              <Switch
                id="requireSymbol"
                checked={config.requireSymbol}
                onCheckedChange={(checked) =>
                  onChange({ requireSymbol: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Additional Security Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="disallowUsername">
                Disallow username/email in password
              </Label>
              <p className="text-xs text-muted-foreground">
                Prevents users from including their username or email
              </p>
            </div>
            <Switch
              id="disallowUsername"
              checked={config.disallowUsernameInPassword}
              onCheckedChange={(checked) =>
                onChange({ disallowUsernameInPassword: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannedWords">Custom banned substrings</Label>
            <Textarea
              id="bannedWords"
              placeholder="Enter words or phrases to ban, separated by commas"
              value={config.customBannedWords?.join(", ") ?? ""}  // convert array → string
              onChange={(e) =>
                onChange({
                  customBannedWords: e.target.value
                    .split(",")                       // string → array
                    .map((word) => word.trim())
                })
              }
              rows={3}
            />

          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordHistory">Password history count</Label>
            <Input
              id="passwordHistory"
              type="number"
              min="0"
              max="50"
              value={config.passwordHistoryCount}
              onChange={(e) =>
                onChange({ passwordHistoryCount: parseInt(e.target.value) || 0 })
              }
              className="w-24"
            />
            <p className="text-xs text-muted-foreground">
              Prevent reuse of last {config.passwordHistoryCount} passwords (0 =
              no history)
            </p>
          </div>
        </div>




      </CardContent>
    </Card>
  );
};
