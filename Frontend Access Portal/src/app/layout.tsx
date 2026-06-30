// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Inter, JetBrains_Mono } from "next/font/google";
import { GlobalSearchDialog } from "@/components/search/GlobalSearch";
import { SearchProvider } from "@/contexts/SearchContext";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AIManagementProvider } from "@/contexts/AIManagementContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import ThemeProvider from "@/contexts/themeConfigContext";
import { cookies } from "next/headers";
import { AIPromptProvider } from "@/contexts/AIPromptContext";
import { FetchInterceptor } from "@/components/FetchInterceptor";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Aidentx",
  description: "Secure Identity Management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("theme")?.value as
    | "light"
    | "dark"
    | "system"
    | undefined;
  const initialTheme = savedTheme || "system";

  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jetbrainsMono.variable} ${
        initialTheme === "dark" ? "dark" : ""
      }`}
    >
      <body className="font-sans antialiased">
        <ReactQueryProvider>
          <ThemeProvider initialTheme={initialTheme}>
            <NextIntlClientProvider>
              <AuthProvider>
                <AIAssistantProvider>
                  <SearchProvider>
                    <NotificationProvider>
                      <AIManagementProvider>
                        <AIPromptProvider>
                          <FetchInterceptor />
                          {children}
                        </AIPromptProvider>
                      </AIManagementProvider>
                      <Toaster />
                      <GlobalSearchDialog />
                    </NotificationProvider>
                  </SearchProvider>
                </AIAssistantProvider>
              </AuthProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
