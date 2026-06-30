import {
  Bell,
  Megaphone,
  TriangleAlert,
  HelpCircle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { GlobalSearchButton } from "@/components/search/GlobalSearch";
import { useThemeContext } from "@/contexts/themeConfigContext";

const Header = () => {
  const { isAssistantOpen, setIsAssistantOpen } = useAIAssistant();
  const { themeConfig, loadingTheme, loadingError } = useThemeContext();

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <header className="bg-primary text-white flex items-center justify-between px-6 h-16 flex-shrink-0 sticky top-0 z-50 w-full shadow-md">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">
          {!loadingTheme ? themeConfig?.branding.organizationName : "Loading"}
        </h1>
      </div>
      <div className="flex-1 max-w-lg mx-4">
        <GlobalSearchButton />
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className="text-white hover:bg-white/10"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
        <Bell className="h-6 w-6 cursor-pointer" />
        <Megaphone className="h-6 w-6 cursor-pointer" />
        <TriangleAlert className="h-6 w-6 cursor-pointer" />
        <HelpCircle className="h-6 w-6 cursor-pointer" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-white hover:bg-white/10"
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white text-primary">
                  A
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">Admin</p>
                <p className="text-xs text-gray-200">
                  {!loadingTheme
                    ? themeConfig?.branding.organizationName
                    : "Loading"}
                  {" Admin"}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
