import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface TypographyConfig {
  heading1FontWeight: string;
  heading2FontWeight: string;
  heading3FontWeight: string;
  bodyFontWeight: string;
  heading1Size: string;
  heading2Size: string;
  heading3Size: string;
  bodySize: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  letterSpacing: number;
  cardSpacing: number;
  blockAlignment: string;
  gridSpacing: number;
}

interface TypographySettingsProps {
  config: TypographyConfig;
  onUpdate: (updates: Partial<TypographyConfig>) => void;
}

const TypographySettings: React.FC<TypographySettingsProps> = ({
  config,
  onUpdate,
}) => {
  const fontWeights = [
    { value: "300", label: "Light" },
    { value: "400", label: "Regular" },
    { value: "500", label: "Medium" },
    { value: "600", label: "Semi Bold" },
    { value: "700", label: "Bold" },
  ];

  const fontSizes = [
    { value: "xs", label: "Extra Small" },
    { value: "sm", label: "Small" },
    { value: "base", label: "Base" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "Extra Large" },
    { value: "2xl", label: "2X Large" },
  ];

  const alignments = [
    { value: "left", label: "Left Aligned" },
    { value: "center", label: "Center Aligned" },
    { value: "right", label: "Right Aligned" },
    { value: "justify", label: "Justified" },
  ];
  const fontFamilies = [
    { value: "Inter", label: "Inter (Default)" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Source Sans Pro", label: "Source Sans Pro" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Typography Controls</CardTitle>
          <CardDescription>
            Configure font weights, sizes, and text styling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heading 1 Font Weight</Label>
              <Select
                value={config.heading1FontWeight}
                onValueChange={(value) =>
                  onUpdate({ heading1FontWeight: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Body Font Weight</Label>
              <Select
                value={config.bodyFontWeight}
                onValueChange={(value) => onUpdate({ bodyFontWeight: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heading 1 Size</Label>
              <Select
                value={config.heading1Size}
                onValueChange={(value) => onUpdate({ heading1Size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Body Size</Label>
              <Select
                value={config.bodySize}
                onValueChange={(value) => onUpdate({ bodySize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heading 2 Font Weight</Label>
              <Select
                value={config.heading2FontWeight}
                onValueChange={(value) =>
                  onUpdate({ heading2FontWeight: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Heading 3 Font Weight</Label>
              <Select
                value={config.heading3FontWeight}
                onValueChange={(value) =>
                  onUpdate({ heading3FontWeight: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heading 2 Size</Label>
              <Select
                value={config.heading2Size}
                onValueChange={(value) => onUpdate({ heading2Size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Heading 3 Size</Label>
              <Select
                value={config.heading3Size}
                onValueChange={(value) => onUpdate({ heading3Size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Line Height: {config.lineHeight}</Label>
            <Slider
              value={[config.lineHeight]}
              onValueChange={([value]) => onUpdate({ lineHeight: value })}
              min={1}
              max={2}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Letter Spacing: {config.letterSpacing}px</Label>
            <Slider
              value={[config.letterSpacing]}
              onValueChange={([value]) => onUpdate({ letterSpacing: value })}
              min={-2}
              max={4}
              step={0.1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TypographySettings;
