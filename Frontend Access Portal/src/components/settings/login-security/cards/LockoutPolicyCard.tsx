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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ExternalLink, Info } from "lucide-react";
import { LockoutPolicyConfig } from "@/types/loginSecurity";

interface LockoutPolicyCardProps {
  config: LockoutPolicyConfig;
  onChange: (updates: Partial<LockoutPolicyConfig>) => void;
  errors?: Record<string, string>;
}

export const LockoutPolicyCard: React.FC<LockoutPolicyCardProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const isUnlimitedAttempts = config.maxFailedAttempts === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Account Lockout Policy
        </CardTitle>
        <CardDescription>
          Protect against brute force attacks with automatic account lockouts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxAttempts">Maximum failed login attempts</Label>
            <Input
              id="maxAttempts"
              type="number"
              min="0"
              max="20"
              value={config.maxFailedAttempts}
              onChange={(e) =>
                onChange({ maxFailedAttempts: parseInt(e.target.value) || 0 })
              }
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              {isUnlimitedAttempts
                ? "Unlimited login attempts allowed"
                : `Lock account after ${config.maxFailedAttempts} failed attempts`}
            </p>
            {errors.maxFailedAttempts && (
              <p className="text-sm text-destructive">
                {errors.maxFailedAttempts}
              </p>
            )}
          </div>

          {!isUnlimitedAttempts && (
            <>
              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">
                  Lockout duration (minutes)
                </Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  min="1"
                  max="1440"
                  value={config.lockoutDurationMinutes}
                  onChange={(e) =>
                    onChange({
                      lockoutDurationMinutes: parseInt(e.target.value) || 15,
                    })
                  }
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Account locked for {config.lockoutDurationMinutes} minutes
                  {config.lockoutDurationMinutes >= 60 &&
                    ` (${Math.floor(
                      config.lockoutDurationMinutes / 60
                    )}h ${config.lockoutDurationMinutes % 60}m)`}
                </p>
                {errors.lockoutDurationMinutes && (
                  <p className="text-sm text-destructive">
                    {errors.lockoutDurationMinutes}
                  </p>
                )}
              </div>

              <div className="space-y-3">


                <div className="space-y-2">
                  <Label htmlFor="baseDelay">Base delay (seconds)</Label>
                  <Input
                    id="baseDelay"
                    type="number"
                    min="1"
                    max="60"
                    value={config.baseDelaySeconds}
                    onChange={(e) =>
                      onChange({
                        baseDelaySeconds: parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Delay formula: {config.baseDelaySeconds}s × attempt number
                  </p>
                  {errors.baseDelaySeconds && (
                    <p className="text-sm text-destructive">
                      {errors.baseDelaySeconds}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Security Guidelines */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">
            Lockout Policy Guidelines:
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Recommended: 5-10 failed attempts before lockout</li>
            <li>
              • Lockout duration: 15-30 minutes for balance of security/usability
            </li>
            <li>• Progressive backoff helps against automated attacks</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
