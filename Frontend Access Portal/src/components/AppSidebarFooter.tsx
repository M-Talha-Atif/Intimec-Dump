import React, { useMemo, useState } from "react";

import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AudioWaveformIcon,
  ChevronsUpDown,
  CommandIcon,
  Fingerprint,
  GalleryVerticalEndIcon,
  User2,
} from "lucide-react";
import { environments, roles } from "@/types/types";

const data: { environments: environments[]; roles: roles[] } = {
  environments: [
    {
      name: "Testing",
      icon: CommandIcon,
      subtitle: "Development",
    },
    {
      name: "Pre-Production",
      icon: AudioWaveformIcon,
      subtitle: "Staging",
    },
    {
      name: "Production",
      icon: GalleryVerticalEndIcon,
      subtitle: "Enterprise",
    },
  ],
  roles: [
    {
      name: "Admin",
      icon: Fingerprint,
    },
    {
      name: "User",
      icon: User2,
    },
  ],
};

export default function AppSidebarFooter() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<environments>(
    data.environments[0]
  );

  const environmentMap = useMemo(
    () => new Map(data.environments.map((env) => [env.name, env])),
    []
  );

  const roleMap = useMemo(
    () => new Map(data.roles.map((role) => [role.name, role])),
    []
  );

  const {open} = useSidebar();

  const [selectedRole, setSelectedRole] = useState<roles>(data.roles[0]);
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <div className="flex items-center justify-center h-full rounded-md bg-primary aspect-square">
                  <selectedRole.icon className="size-5" />
                </div>
                Role: {selectedRole.name}
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className={open ? "w-[var(--radix-popper-anchor-width)]" : ""}
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Switch Role</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={selectedRole.name}
                      onValueChange={(val) =>
                        setSelectedRole(roleMap.get(val)!)
                      }
                    >
                      {data.roles.map((role) => (
                        <DropdownMenuRadioItem
                          key={role.name}
                          value={role.name}
                        >
                          <div className="flex items-center justify-center h-8 rounded-md bg-primary aspect-square">
                            <role.icon className="size-5" />
                          </div>
                          <div className="flex flex-col">{role.name}</div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Switch Environment
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={selectedEnvironment.name}
                      onValueChange={(val) =>
                        setSelectedEnvironment(environmentMap.get(val)!)
                      }
                    >
                      {data.environments.map((env) => (
                        <DropdownMenuRadioItem
                          key={env.name}
                          value={env.name}
                        >
                          <div className="flex items-center justify-center h-8 rounded-md bg-primary aspect-square">
                            <env.icon className="size-5" />
                          </div>
                          <div className="flex flex-col">
                            {env.name}
                            <span className="text-muted-foreground">
                              {env.subtitle}
                            </span>
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
