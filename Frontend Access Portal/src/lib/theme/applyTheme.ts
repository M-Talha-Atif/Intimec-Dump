// lib/updateTheme.ts
export function updateThemeFromConfig(config: any) {
  console.log("Updating theme with config:", 123123123);
  if (!config?.theme) return;

  const root = document.documentElement;

  root.style.setProperty("--primary-color", config.theme.primaryColor);
  root.style.setProperty("--secondary-color", config.theme.secondaryColor);
  root.style.setProperty("--accent-color", config.theme.accentColor);

  root.style.setProperty(
    "--background-color",
    config.loginPage.backgroundColor || "#ffffff"
  );
  root.style.setProperty("--foreground-color", "#000000");

  if (config.typography) {
    root.style.setProperty(
      "--font-family",
      config.typography.fontFamily || "Inter, sans-serif"
    );
    root.style.setProperty(
      "--line-height",
      config.typography.lineHeight?.toString() || "1.5"
    );
    root.style.setProperty(
      "--letter-spacing",
      `${config.typography.letterSpacing || 0}px`
    );
  }
}
