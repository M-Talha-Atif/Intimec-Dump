import { UIConfig } from "@/types/UIConfig";
function hexToHSL(hex: string | undefined) {
  let h = 0,
    s;
  if (!hex) return { s: 0, h: 0, l: 60 };
  hex = hex.replace(/^#/, "");

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function getTextColorFromHex(hex: string | undefined) {
  const { l = 60 } = hexToHSL(hex);
  return l > 45 ? "#000000" : "#ffffff";
}

function applyRounded(root: HTMLElement, style: string) {
  root.style.setProperty("--radius", style === "rounded" ? "0.625rem" : "0rem");
}

export function applyLightTheme(config: UIConfig) {
  const root = document.documentElement;
  root.classList.remove("dark");

  const theme = config.theme;
  root.style.setProperty("--primary", theme.primaryColor);
  root.style.setProperty(
    "--navbar-text",
    getTextColorFromHex(theme.primaryColor)
  );
  root.style.setProperty("--secondary", theme.secondaryColor);
  root.style.setProperty("--accent", theme.accentColor);
  root.style.setProperty("--background", theme.backgroundColor);
  root.style.setProperty("--card", theme.cardColor);
  root.style.setProperty("--sidebar", theme.sidebarStyle.backgroundColor);
  applyRounded(root, theme.roundedStyle);

  // typography
  const typo = config.typography;

  root.style.setProperty("--line-height", String(typo.lineHeight));
  root.style.setProperty("--letter-spacing", `${typo.letterSpacing}px`);
  root.style.setProperty("--font-size", typo.fontSize);

  const login = config.loginPage;
  root.style.setProperty("--login", login.backgroundColor);
}

export function applyDarkTheme(config: UIConfig) {
  const root = document.documentElement;
  root.classList.add("dark");

  const theme = config.theme;
  root.style.setProperty("--primary", theme.darkPrimaryColor);
  console.log(getTextColorFromHex(theme.darkPrimaryColor));
  root.style.setProperty(
    "--navbar-text",
    getTextColorFromHex(theme.darkPrimaryColor)
  );
  root.style.setProperty("--secondary", theme.darkSecondaryColor);
  root.style.setProperty("--background", theme.darkBackgroundColor);
  root.style.setProperty("--card", theme.darkCardColor);
  root.style.setProperty("--accent", theme.darkAccentColor);
  root.style.setProperty("--sidebar", theme.sidebarStyle.darkBackgroundColor);
  applyRounded(root, theme.roundedStyle);

  // typography
  const typo = config.typography;

  root.style.setProperty("--line-height", String(typo.lineHeight));
  root.style.setProperty("--letter-spacing", `${typo.letterSpacing}px`);
  root.style.setProperty("--font-size", typo.fontSize);

  const login = config.loginPage;

  root.style.setProperty("--login", login.darkBackgroundColor);
}
