import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import SettingsDialog from "./SettingsDialog";

export default function NavDropdown({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      toast.info("Logging out...", {
        duration: 3000,
      });
      await logout();
      toast.success("Logged out successfully", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <SettingsDialog>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Settings
          </DropdownMenuItem>
        </SettingsDialog>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
