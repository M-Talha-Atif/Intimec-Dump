"use client";

import { useThemeContext } from "@/contexts/themeConfigContext";

export default function Footer() {
    const { themeConfig, loadingTheme } = useThemeContext();
    const APP_VERSION = "v3.0.0";

    return (
        <footer className="h-6 bg-card  flex text-sm items-center justify-center ">
            {!loadingTheme ? themeConfig?.branding.footerText : "© 2025 Intimec"}
        </footer>
    );
}