import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface environments {
    name: string;
    icon: LucideIcon;
    subtitle: string;
}
export interface roles {
    name: string
    icon: LucideIcon
}
export interface WorkspaceContextSelectorProps {
    environments: environments[], roles: roles[],
}

export type SelectorItemProps<T extends environments | roles> = {
    items: T[];
    activeItem: T;
    setActiveItem: (item: T) => void;
    type: 'environment' | 'role';
    size?: 'small' | 'large';
};

export interface SidebarContextType {
    expanded: boolean;
    setExpanded: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export interface SidebarProps {
    children: ReactNode;
}

export interface SidebarItemProps {
    icon: ReactNode;
    text: string;
    route: string;
    alert?: boolean;
}

export interface SidebarSplitterProps {
    className?: string;
}

export interface SidebarLabelProps {
    text: string;
    className?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  // Add other user properties as needed
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: { identifier: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}
