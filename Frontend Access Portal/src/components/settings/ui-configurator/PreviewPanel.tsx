"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";
import { UIConfig } from "@/types/UIConfig";
import { Button } from "@/components/ui/button";
import PreviewBadge from "./PreviewBadge";

interface PreviewPanelProps {
  config: UIConfig;
  previewMode: boolean;
  previewRole?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  config,
  previewRole = "admin",
}) => {
  const [activePreviewSection, setActivePreviewSection] = useState<
    "dashboard" | "login" | "navigation"
  >("dashboard");

  // Local theme state — the ONLY source of dark/light for this component
  const [mode, setMode] = useState<boolean>(false);

  const getRoleTheme = () => {
    return mode ? config.theme.darkPrimaryColor : config.theme.primaryColor;
  };

  const toggleTheme = () => setMode((m) => !m);

  let imageIconSrc: string | undefined;
  if (!mode) {
    imageIconSrc =
      config?.branding.logoLightData?.fileName === "image"
        ? `data:${config?.branding.logoLightData?.mime};base64,${config?.branding.logoLightData?.url}`
        : config?.branding.logoLightData?.url;
  } else {
    imageIconSrc =
      config?.branding.logoDarkData?.fileName === "image"
        ? `data:${config?.branding.logoDarkData?.mime};base64,${config?.branding.logoDarkData?.url}`
        : config?.branding.logoDarkData?.url;
  }


  // Helpers to pick styles based on local mode
  const surfaceStyle = {
    backgroundColor: mode ? config.theme.darkCardColor : config.theme.cardColor,
    color: mode ? "white" : "#111827", // Tailwind gray-900
  };

  const subSurfaceStyle = {
    backgroundColor: mode
      ? config.theme.darkBackgroundColor
      : config.theme.backgroundColor,
    color: mode ? "white" : "#111827",
  };

  const navbarStyle = {
    backgroundColor: mode
      ? config.theme.darkPrimaryColor
      : config.theme.primaryColor,
    color: mode ? "#111827" : "white",
  };

  const border = mode ? "border-gray-700" : "border-gray-200";
  const subtleText = mode ? "text-gray-400" : "text-gray-500";
  const mutedBg = mode ? "bg-gray-600" : "bg-gray-100";

  const pillSelected = mode
    ? "bg-blue-900 text-blue-200"
    : "bg-blue-100 text-blue-800";
  const pillUnselected = mode
    ? "bg-gray-700 text-gray-300"
    : "bg-gray-100 text-gray-600";

  const bannerColors = {
    warning: mode
      ? "bg-yellow-900 text-yellow-200"
      : "bg-yellow-100 text-yellow-800",
    error: mode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800",
    success: mode
      ? "bg-green-900 text-green-200"
      : "bg-green-100 text-green-800",
    info: mode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800",
  };

  return (
    // No reliance on global `.dark`. We DO NOT add `dark` here at all.
    <div className="preview-panel-container" style={{ isolation: "isolate" }}>
      <Card className="sticky top-6" style={surfaceStyle}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Preview</span>

            <div className="flex space-x-1">
              <Button
                size="icon"
                variant={"ghost"}
                onClick={toggleTheme}
                className="shadow-md hover:scale-105 transition"
                aria-label="Toggle theme"
              >
                {mode ? (
                  <Moon className="w-5 h-5 text-white" />
                ) : (
                  <Sun className="w-5 h-5 text-black" />
                )}
              </Button>
            </div>
          </CardTitle>

          {/* Preview Section Selector */}
          <div className="flex space-x-1 mt-2">
            {(["dashboard", "login", "navigation"] as const).map((section) => (
              <button
                key={section}
                onClick={() => setActivePreviewSection(section)}
                className={`px-2 py-1 text-xs rounded ${activePreviewSection === section
                  ? pillSelected
                  : pillUnselected
                  }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {/* Role badge */}
          {previewRole && (
            <div className={`text-xs mt-1 ${subtleText}`}>
              Previewing as:{" "}
              <PreviewBadge mode={mode}> {previewRole}</PreviewBadge>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div
            className={`rounded-lg p-4 min-h-96 ${mode ? "bg-gray-900" : "bg-white"
              }`}
          >
            {/* Simulated App Preview */}
            <div
              className={`rounded shadow-sm h-full ${border} border`}
              style={
                {
                  ...subSurfaceStyle,
                  fontFamily: config.typography.fontFamily,
                  fontSize:
                    config.typography?.bodySize === "sm"
                      ? "14px"
                      : config.typography?.bodySize === "lg"
                        ? "18px"
                        : "16px",
                  // theme variables your app might use
                  "--primary-color": getRoleTheme(),
                  "--secondary-color": config.theme.secondaryColor,
                  "--accent-color": config.theme.accentColor,
                } as React.CSSProperties
              }
            >
              {/* Header Banner */}
              {config.headerFooter?.header?.showBanner && (
                <div
                  className={`p-2 text-center text-xs ${bannerColors[
                    (config.headerFooter.header.bannerType || "info") as
                    | "warning"
                    | "error"
                    | "success"
                    | "info"
                  ]
                    }`}
                >
                  {config.headerFooter.header.bannerText ||
                    "System maintenance scheduled for tonight"}
                </div>
              )}

              {/* Main Header */}
              <div className={`border-b p-3 ${border}`} style={navbarStyle}>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: getRoleTheme() }}
                  >
                    {imageIconSrc && (
                      <img
                        src={imageIconSrc}
                        alt="Logo Preview"
                        width={32}
                        height={32}
                        className="object-cover rounded"
                      />
                    )}
                  </div>

                  <div>
                    <div
                      className={`font-semibold text-sm ${mode ? "text-white" : "text-gray-900"
                        }`}
                      style={{
                        fontWeight:
                          config.typography?.heading1FontWeight || "600",
                        fontSize:
                          config.typography?.heading1Size === "lg"
                            ? "16px"
                            : "14px",
                      }}
                    >
                      {config.branding.organizationName}
                    </div>

                    {config.branding.tagline && (
                      <div className={`text-xs ${mode ? "text-white" : "text-gray-900"
                        }`}>
                        {config.branding.tagline}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* --- SECTION SWITCH --- */}
              {activePreviewSection === "login" ? (
                <div
                  className="flex items-center justify-center h-64 p-4"
                  style={{
                    backgroundImage: (() => {
                      const backgroundImageSrc = config?.loginPage?.enableLoginBackgroundImage
                        ? mode === false
                          ? config?.loginPage?.backgroundImageData?.url
                            ? `data:${config?.loginPage?.backgroundImageData?.mime};base64,${config?.loginPage?.backgroundImageData?.url}`
                            : null
                          : config?.loginPage?.backgroundImageDarkData?.url
                            ? `data:${config?.loginPage?.backgroundImageDarkData?.mime};base64,${config?.loginPage?.backgroundImageDarkData?.url}`
                            : null
                        : null;
                      return backgroundImageSrc ? `url(${backgroundImageSrc})` : 'none';
                    })(),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <div
                    className={`p-4 rounded shadow-lg text-center ${mode ? ` text-white` : ` text-gray-900`
                      }`}
                    style={{
                      backgroundColor: mode
                        ? config.loginPage.darkBackgroundColor
                        : config.loginPage.backgroundColor,
                    }}
                  >
                    <div className="mb-3">
                      <div
                        className="w-12 h-12 mx-auto rounded mb-2 overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: getRoleTheme() }}
                      >
                        {imageIconSrc && (
                          <img
                            src={imageIconSrc}
                            alt="Logo Preview"
                            width={48}
                            height={48}
                            className="object-cover rounded"
                          />
                        )}
                      </div>

                      {config.branding.organizationName && (
                        <div className="font-semibold">
                          {config.branding.organizationName}
                        </div>
                      )}
                    </div>

                    <div
                      className={`text-sm mb-3 ${mode ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                      {config.loginPage.welcomeMessage || "Welcome"}
                    </div>

                    <div className="space-y-2">
                      <div className={`h-6 rounded ${mutedBg}`}></div>
                      <div className={`h-6 rounded ${mutedBg}`}></div>
                      <button
                        className={`h-8 w-full  text-sm ${config.theme.roundedStyle === "sharp"
                          ? "rounded-none"
                          : "rounded-[calc(0.625rem-2px)]"
                          }`}
                        style={{ backgroundColor: getRoleTheme() }}
                      >
                        Log In
                      </button>
                    </div>
                  </div>
                </div>
              ) : activePreviewSection === "navigation" ? (
                <div className="h-64 p-3">
                  <div className="space-y-2">
                    {config.navigation.enabledModules
                      .slice(0, 6)
                      .map((module, index) => (
                        <div
                          key={module}
                          className={`text-xs p-2 rounded flex items-center space-x-2 ${index === 0
                            ? "text-white"
                            : mode
                              ? "text-gray-200"
                              : "text-gray-900"
                            }`}
                          style={{
                            backgroundColor:
                              index === 0 ? getRoleTheme() : "transparent",
                            fontWeight:
                              config.typography?.bodyFontWeight || "400",
                          }}
                        >
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              backgroundColor:
                                index === 0
                                  ? "rgba(255,255,255,0.3)"
                                  : getRoleTheme(),
                              opacity: index === 0 ? 1 : 0.7,
                            }}
                          />
                          <span>
                            {module.charAt(0).toUpperCase() +
                              module.slice(1).replace("-", " ")}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-64">
                  {/* Sidebar */}
                  <div
                    className={`border-r p-2 space-y-2 ${mode
                      ? "bg-gray-800 text-white"
                      : "bg-gray-50 text-gray-900"
                      } ${border}`}
                    style={{
                      backgroundColor: mode
                        ? config.theme.sidebarStyle.darkBackgroundColor
                        : config.theme.sidebarStyle.backgroundColor,
                    }}
                  >
                    {config.navigation.enabledModules
                      .slice(0, 5)
                      .map((module, index) => (
                        <div
                          key={module}
                          className="text-xs p-2 rounded"
                          style={{
                            backgroundColor:
                              index === 0 ? getRoleTheme() : "transparent",
                            fontWeight:
                              config.typography?.bodyFontWeight || "400",
                          }}
                        >
                          {module.charAt(0).toUpperCase() +
                            module.slice(1).replace("-", " ")}
                        </div>
                      ))}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-3">
                    <div className="space-y-3">
                      <div
                        className="text-sm font-semibold"
                        style={{
                          fontWeight:
                            config.typography?.heading1FontWeight || "600",
                          fontSize:
                            config.typography?.heading1Size === "lg"
                              ? "16px"
                              : "14px",
                        }}
                      >
                        Dashboard Preview
                      </div>

                      {/* Widgets */}
                      <div
                        className={`grid gap-2 ${config.dashboard.layoutTemplate === "grid"
                          ? "grid-cols-2"
                          : config.dashboard.layoutTemplate === "stack"
                            ? "grid-cols-1"
                            : "grid-cols-2"
                          }`}
                      >
                        {config.dashboard.enabledWidgets
                          .slice(0, 4)
                          .map((widget) => (
                            <div
                              key={widget}
                              className={`p-2 rounded text-xs ${mode
                                ? "bg-gray-600 text-white"
                                : "bg-gray-100 text-gray-900"
                                }`}
                              style={{
                                margin: `${(config.typography?.cardSpacing || 16) / 4
                                  }px`,
                                fontWeight:
                                  config.typography?.bodyFontWeight || "400",
                              }}
                            >
                              {widget
                                .replace("-", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                          ))}
                      </div>

                      {/* Buttons */}
                      <div className="space-y-2">
                        <button
                          className={`px-3 py-1 text-xs   ${config.theme.roundedStyle === "sharp"
                            ? "rounded-none"
                            : "rounded-[calc(0.625rem-2px)]"
                            }`}
                          style={{ backgroundColor: getRoleTheme() }}
                        >
                          Primary Button
                        </button>

                        <button
                          className={`px-3 py-1 text-xs border ml-2  ${config.theme.roundedStyle === "sharp"
                            ? "rounded-none"
                            : "rounded-[calc(0.625rem-2px)]"
                            } ${mode ? "text-white" : "text-gray-900"}`}
                          style={{
                            borderColor: !mode
                              ? config.theme.darkSecondaryColor
                              : config.theme.secondaryColor,
                            color: !mode ? "black" : "white",
                          }}
                        >
                          Secondary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className={`border-t p-2 text-xs ${border} ${subtleText}`}>
                <div className="text-center">{config.branding.footerText}</div>

                {config.headerFooter?.footer?.showCompliance &&
                  config.headerFooter.footer.complianceText && (
                    <div className="text-center mt-1 text-xs">
                      {config.headerFooter.footer.complianceText}
                    </div>
                  )}
              </div>
            </div>
          </div>
          {/* Applied Settings */}
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Applied Settings</div>
            <div className="flex flex-wrap gap-1">
              <PreviewBadge mode={mode}>
                Theme: {mode ? "Dark" : "Light"}
              </PreviewBadge>
              <PreviewBadge mode={mode}>Role: {previewRole}</PreviewBadge>
              <PreviewBadge mode={mode}>
                Modules: {config.navigation.enabledModules.length}
              </PreviewBadge>
              <PreviewBadge mode={mode}>
                Widgets: {config.dashboard.enabledWidgets.length}
              </PreviewBadge>
              <PreviewBadge mode={mode}>
                Layout: {config.dashboard.layoutTemplate}
              </PreviewBadge>
              {config.typography && (
                <PreviewBadge mode={mode}>
                  Font: {config.typography.fontFamily}
                </PreviewBadge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewPanel;
