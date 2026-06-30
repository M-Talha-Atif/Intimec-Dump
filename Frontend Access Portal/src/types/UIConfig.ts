export interface UIConfig {
  branding: {
    organizationName: string;
    tagline: string;
    logoLightData: {
      url: string | undefined;
      mime: string | undefined;
      fileName: string | undefined;
      fromApi: boolean;
    };
    logoDarkData: {
      url: string | undefined;
      mime: string | undefined;
      fileName: string | undefined;
      fromApi: boolean;
    };
    faviconData: {
      url: string | undefined;
      mime: string | undefined;
      fileName: string | undefined;
      fromApi: boolean;
    };
    footerText: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkPrimaryColor: string;
    darkAccentColor: string;
    darkSecondaryColor: string;
    roundedStyle: "rounded" | "sharp";
    backgroundColor: string;
    darkBackgroundColor: string;
    cardColor: string;
    darkCardColor: string;
    sidebarStyle: {
      backgroundColor: string;
      darkBackgroundColor: string;
      primaryColor: string;
      darkPrimaryColor: string;
    };
  };
  loginPage: {
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
    };
  };
  navigation: {
    enabledModules: string[];
    menuOrder: string[];
    iconStyle: "filled" | "outline" | "minimal";
    defaultLandingPage: string;
    sidebarCollapsible: boolean;
  };
  dashboard: {
    enabledWidgets: string[];
    layoutTemplate: "grid" | "stack" | "fluid";
    widgetVisibility: Record<string, boolean>;
  };
  advanced: {
    customCSS: string;
    roleBasedThemes: Record<string, string>;
    departmentThemes: Record<string, string>;
    scriptTriggers: Array<{ event: string; script: string; enabled: boolean }>;
    versionHistory: Array<{
      id: string;
      name: string;
      date: string;
      active: boolean;
    }>;
  };
  typography: {
    heading1FontWeight: string;
    heading2FontWeight: string;
    heading3FontWeight: string;
    bodyFontWeight: string;
    heading1Size: string;
    heading2Size: string;
    heading3Size: string;
    bodySize: string;
    lineHeight: number;
    letterSpacing: number;
    fontFamily: string;
    fontSize: string;
    cardSpacing: number;
    blockAlignment: string;
    gridSpacing: number;
  };
  headerFooter: {
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
  };
}
