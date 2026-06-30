"use client";
import {
  Bell,
  HelpCircle,
  Megaphone,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { GlobalSearchButton } from "../search/GlobalSearch";
import { useThemeContext } from "@/contexts/themeConfigContext";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useNotifications } from "@/contexts/NotificationContext";
import { UIConfig } from "@/types/UIConfig";
import NavDropdown from "./NavDropdown";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar({
  username,
  displayName,
}: {
  username: string;
  displayName: string;
}) {
  const { isAssistantOpen, setIsAssistantOpen } = useAIAssistant();
  const { themeConfig, loadingTheme, mode } = useThemeContext();
  const { counts } = useNotifications();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 flex items-center justify-between flex-shrink-0 w-full px-2 h-[var(--header-height)] bg-primary z-50 text-navbar-text">
      <div className="flex flex-row items-center gap-3">
        <SidebarTrigger className="size-8" />
        <div className="flex items-center">
          {!loadingTheme ? (
            <CompanyLogo themeConfig={themeConfig} mode={mode} />
          ) : (
            <Image
              src="/image.png"
              alt="Logo Preview"
              width={32}
              height={32}
              className="object-cover w-8 h-8 rounded bg-accent"
            />
          )}

          <div className="flex flex-col  ml-2 leading-tight">
            <h1 className="ml-2 text-xl font-semibold">
              {!loadingTheme
                ? themeConfig?.branding.organizationName
                : "AidentX"}
            </h1>
            <h2 className="text-xs text-navbar-text/70 ">
              {themeConfig?.loginPage.showTagline
                ? !loadingTheme
                  ? themeConfig?.branding.tagline
                  : "Your trusted security partner"
                : ""}
            </h2>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <GlobalSearchButton />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
        >
          <Sparkles />
        </Button>
        <NotificationDropdown
          type="NOTIFICATIONS"
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          count={counts.notifications}
        />

        <NotificationDropdown
          type="ANNOUNCEMENTS"
          icon={<Megaphone className="h-5 w-5" />}
          title="Announcements"
          count={counts.announcements}
        />

        <NotificationDropdown
          type="ALERTS"
          icon={<TriangleAlert className="h-5 w-5" />}
          title="Alerts"
          count={counts.alerts}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/documentation")}
              >
                <HelpCircle />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Documentation</p>
                <p className="text-xs text-muted-foreground">
                  Learn how to use the Identity Governance platform, explore features,
                  workflows, and step-by-step guides for managing identities and access.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <NavDropdown>
          <div className="flex items-center space-x-2 cursor-pointer mr-4">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-white text-black">
                {username ? username.charAt(0).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{username}</p>
              <p className="text-xs">{displayName}</p>
            </div>
          </div>
        </NavDropdown>
      </div>
    </header>
  );
}

function CompanyLogo({
  themeConfig,
  mode,
}: {
  themeConfig: UIConfig | undefined;
  mode: string;
}) {
  const logoData =
    mode === "light"
      ? themeConfig?.branding.logoLightData
      : themeConfig?.branding.logoDarkData;

  let src: string;

  if (logoData?.fileName === "image" && logoData?.mime && logoData?.url) {
    src = `data:${logoData.mime};base64,${logoData.url}`;
  } else if (logoData?.url) {
    src = logoData.url;
  } else {
    src = "/image.png";
  }

  return (
    <Image
      src={src}
      alt="Logo Preview"
      width={32}
      height={32}
      className="object-cover w-8 h-8 p-1 rounded bg-accent"
    />
  );
}
