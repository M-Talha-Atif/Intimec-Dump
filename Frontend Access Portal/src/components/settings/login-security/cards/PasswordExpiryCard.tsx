import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, AlertTriangle, Info } from "lucide-react";
import { PasswordExpiryConfig } from "@/types/loginSecurity";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PasswordExpiryCardProps {
  config: PasswordExpiryConfig;
  onChange: (updates: Partial<PasswordExpiryConfig>) => void;
  errors?: Record<string, string>;
}

export const PasswordExpiryCard: React.FC<PasswordExpiryCardProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const isNeverExpire = config.maxValidityDays === 0;
  const warningTooLate =
    config.warnAfterDays >= config.maxValidityDays && config.maxValidityDays > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Password Expiry
        </CardTitle>
        <CardDescription>
          Configure automatic password expiration and user warnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex-col gap-100 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxValidity">Maximum password validity (days)</Label>
            <Input
              id="maxValidity"
              type="number"
              min="0"
              max="730"
              value={config.maxValidityDays}
              onChange={(e) =>
                onChange({ maxValidityDays: parseInt(e.target.value) || 0 })
              }
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              {isNeverExpire
                ? "Passwords never expire"
                : `Passwords expire after ${config.maxValidityDays} days`}
            </p>
            {errors.maxValidityDays && (
              <p className="text-sm text-destructive">{errors.maxValidityDays}</p>
            )}
          </div>

          {!isNeverExpire && (
            <div className="space-y-2">
              <Label htmlFor="warnAfter">Warn users after (days)</Label>
              <Input
                id="warnAfter"
                type="number"
                min="0"
                max={config.maxValidityDays}
                value={config.warnAfterDays}
                onChange={(e) =>
                  onChange({ warnAfterDays: parseInt(e.target.value) || 0 })
                }
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                {config.warnAfterDays === 0
                  ? "No advance warning"
                  : `Warn users ${config.maxValidityDays - config.warnAfterDays
                  } days before expiry`}
              </p>
              {warningTooLate && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">
                    Warning period should be less than validity period
                  </span>
                </div>
              )}
              {errors.warnAfterDays && (
                <p className="text-sm text-destructive">{errors.warnAfterDays}</p>
              )}
            </div>
          )}

        </div>

        {/* Guidelines */}
        <div className="space-y-3">


          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Best Practices:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use 0 days to disable automatic expiration</li>
              <li>• If expiration is required, use 90-365 day cycles</li>
              <li>• Provide 7-14 day advance warnings</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card >
  );
};
