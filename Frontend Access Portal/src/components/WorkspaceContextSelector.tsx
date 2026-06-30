"use client"

import * as React from "react"
import { useContext } from "react"
import { ChevronsUpDown } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { environments, roles, SelectorItemProps, WorkspaceContextSelectorProps } from "@/types/types"
import { SidebarContext } from "@/components/AppSidebar";


export function WorkspaceContextSelector({
    environments,
    roles
}: WorkspaceContextSelectorProps) {
    const context = useContext(SidebarContext)

    if (!context) {
        throw new Error('SidebarItem must be used within a Sidebar');
    }

    const { expanded } = context
    const [activeEnvironment, setActiveEnvironment] = React.useState(environments[0])
    const [activeRole, setActiveRole] = React.useState(roles[0])

    if (!activeEnvironment || !activeRole) {
        return null
    }

    // Collapsed sidebar view
    if (!expanded) {
        return (
            <div className="flex flex-col gap-2 pb-3 px-1">
                <SelectorItem<environments>
                    items={environments}
                    activeItem={activeEnvironment}
                    setActiveItem={setActiveEnvironment}
                    type="environment"
                    size="small"
                />
                <SelectorItem<roles>
                    items={roles}
                    activeItem={activeRole}
                    setActiveItem={setActiveRole}
                    type="role"
                    size="small"
                />
            </div>
        )
    }

    // Expanded sidebar view
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    className="flex flex-row items-center justify-between cursor-pointer pl-0 p-3 transition-all duration-200 hover:bg-gray-50 rounded-md">
                    <div className="flex flex-col gap-1 min-w-48">
                        {/* Environment Section */}
                        <div className="flex items-center gap-3">
                            <div className={STYLES.triggers.environment}>
                                <activeEnvironment.icon className="size-4" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{activeEnvironment.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">{activeEnvironment.subtitle}</span>
                            </div>
                        </div>

                        {/* Role Section */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                            <div className={STYLES.triggers.role}>
                                <activeRole.icon className="size-4" />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="font-medium text-sm">Role: {activeRole.name}</span>
                            </div>
                        </div>
                    </div>
                    <ChevronsUpDown
                        className="size-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
            >
                <DropdownMenuLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    Switch Environment
                </DropdownMenuLabel>
                {environments.map((environment, index) => {
                    const isActive = activeEnvironment.name === environment.name;
                    return (
                        <DropdownMenuItem
                            key={environment.name}
                            onClick={() => setActiveEnvironment(environment)}
                            className={`gap-3 p-3 ${STYLES.menuItems.base} ${isActive
                                ? STYLES.menuItems.environment.active
                                : STYLES.menuItems.environment.inactive
                                }`}
                        >
                            <div className={`${STYLES.icons.base} size-7 ${isActive
                                ? STYLES.icons.environment.active
                                : STYLES.icons.environment.inactive
                                }`}>
                                <environment.icon className="size-4 shrink-0" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm">{environment.name}</div>
                                <div className="text-xs text-gray-500">{environment.subtitle}</div>
                            </div>
                            <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    );
                })}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    Switch Role
                </DropdownMenuLabel>
                {roles.map((role, index) => {
                    const isActive = activeRole.name === role.name;
                    return (
                        <DropdownMenuItem
                            key={role.name}
                            onClick={() => setActiveRole(role)}
                            className={`gap-3 p-3 ${STYLES.menuItems.base} ${isActive
                                ? STYLES.menuItems.role.active
                                : STYLES.menuItems.role.inactive
                                }`}
                        >
                            <div className={`${STYLES.icons.base} size-7 ${isActive
                                ? STYLES.icons.role.active
                                : STYLES.icons.role.inactive
                                }`}>
                                <role.icon className="size-4 shrink-0" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm">{role.name}</div>
                            </div>
                            <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Reusable component for both environments and roles
function SelectorItem<T extends environments | roles>({
    items,
    activeItem,
    setActiveItem,
    type,
    size = 'large'
}: SelectorItemProps<T>) {
    const isEnvironment = type === 'environment';
    const colorScheme = isEnvironment ? 'environment' : 'role';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className={STYLES.triggers[colorScheme]}>
                    <activeItem.icon className="size-4" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className={`rounded-lg flex flex-row gap-3 p-2 ${size === 'large' ? 'w-52 min-w-56' : ''}`}
                align="center"
                side="right"
                sideOffset={8}
            >
                {items.map((item, index) => {
                    const isActive = activeItem.name === item.name;
                    const menuItemClass = `${STYLES.menuItems.base} ${isActive
                        ? STYLES.menuItems[colorScheme].active
                        : STYLES.menuItems[colorScheme].inactive
                        }`;

                    const iconClass = `${STYLES.icons.base} ${size === 'small' ? 'size-2' : 'size-7'} ${isActive
                        ? STYLES.icons[colorScheme].active
                        : STYLES.icons[colorScheme].inactive
                        }`;

                    return (
                        <DropdownMenuItem
                            key={item.name}
                            onClick={() => setActiveItem(item)}
                            className={menuItemClass}
                        >
                            <div className={iconClass}>
                                <item.icon className="size-4 shrink-0" />
                            </div>
                            {size === 'large' && (
                                <>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{item.name}</div>
                                        {"subtitle" in item && (item as environments).subtitle && (
                                            <div className="text-xs text-gray-500">{(item as environments).subtitle}</div>
                                        )}
                                    </div>
                                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                                </>
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Shared styling configurations
const STYLES = {
    triggers: {
        environment: "bg-teal-600 text-white flex aspect-square w-10 h-10 items-center justify-center rounded-lg transition-all duration-200 hover:bg-teal-700",
        role: "bg-cyan-600 text-white flex aspect-square w-10 h-10 items-center justify-center rounded-lg transition-all duration-200 hover:bg-cyan-700"
    },
    menuItems: {
        base: "rounded-md mx-1 transition-all duration-200 hover:bg-gray-50",
        environment: {
            active: "bg-teal-50 text-teal-700 border-teal-200",
            inactive: "hover:bg-teal-25"
        },
        role: {
            active: "bg-cyan-50 text-cyan-700 border-cyan-200",
            inactive: "hover:bg-cyan-25"
        }
    },
    icons: {
        base: "flex items-center justify-center rounded-md border transition-all duration-200",
        environment: {
            active: "border-teal-200 bg-teal-100",
            inactive: "border-gray-200 hover:border-teal-200"
        },
        role: {
            active: "border-cyan-200 bg-cyan-100",
            inactive: "border-gray-200 hover:border-cyan-200"
        }
    }
}