"use client";

import * as React from "react";
import { toast } from "sonner";
import { deleteSSOConfig, toggleSSOConfig } from "@/lib/sso";
import { useSSOConfig } from "./SSOConfigContext";
import {
    IconCircleCheck,
    IconClock,
    IconEdit,
    IconExclamationCircle,
    IconKey,
    IconLoader2,
    IconPlus,
    IconShield,
    IconTrash,
    IconUsers,
} from "@tabler/icons-react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

export interface SSOConnection {
    id: string;
    name: string;
    type: "OAuth2" | "SAML" | "LDAP";
    status: "active" | "inactive" | "error";
    provider?: string;
    usersCount?: number;
    enabled?: boolean;
    encrypted?: boolean;
    config?: any;
    configId?: string;
    configKey?: string;
    configType?: string;
    version?: number;
    updatedAt?: string;
}

const EnabledSwitch = React.memo(({
                                      connection,
                                      isLoading,
                                      onToggle
                                  }: {
    connection: SSOConnection;
    isLoading: boolean;
    onToggle: (id: string, enabled: boolean) => void;
}) => (
    // FIX: Stop click propagation to prevent triggering row click
    <div className="flex items-center w-[120px]" onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
            <div className="flex items-center gap-2 min-w-0">
                <IconLoader2 className="h-4 w-4 animate-spin text-[#438D98] flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate">
                    {connection.enabled ? "Disabling..." : "Enabling..."}
                </span>
            </div>
        ) : (
            <Switch
                checked={connection.enabled}
                onCheckedChange={() => onToggle(connection.id, connection.enabled || false)}
                disabled={isLoading}
                className={connection.enabled ? "data-[state=checked]:bg-[#438D98]" : ""}
            />
        )}
    </div>
));
EnabledSwitch.displayName = "EnabledSwitch";

const ActionButtons = React.memo(({
                                      connection,
                                      onEdit,
                                      onDelete
                                  }: {
    connection: SSOConnection;
    onEdit: (connection: SSOConnection) => void;
    onDelete: (id: string, type: string) => void;
}) => (
    // FIX: Stop click propagation to prevent triggering row click
    <div className="flex items-center gap-2 opacity-70" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => onEdit(connection)} className="h-8 w-8 p-0">
            <IconEdit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => onDelete(connection.id, connection.type)} className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
            <IconTrash className="h-4 w-4" />
        </Button>
    </div>
));
ActionButtons.displayName = "ActionButtons";


interface SSOConnectionsTableProps {
    connections?: SSOConnection[];
    existingTypes?: string[];
    onAddConnection: () => void;
    onEditConnection: (connection: SSOConnection) => void;
    onRefresh?: () => void;
    loading?: boolean;
}

export function SSOConnectionsTable({
                                        connections = [],
                                        existingTypes = [],
                                        onAddConnection,
                                        onEditConnection,
                                        onRefresh,
                                        loading = true, // Default to loading to prevent flash
                                    }: SSOConnectionsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [toggleLoading, setToggleLoading] = React.useState<Set<string>>(new Set());

    const canAddNewConnection = React.useMemo(() => existingTypes.length < 3, [existingTypes]);

    const handleToggleConnection = React.useCallback(async (id: string, currentEnabled: boolean) => {
        setToggleLoading(prev => new Set(prev).add(id));
        try {
            const connection = connections.find(conn => conn.id === id);
            if (!connection) throw new Error("Connection not found");
            const result = await toggleSSOConfig(connection.type.toLowerCase(), !currentEnabled);
            if (!result.success) throw new Error(result.error || 'Failed to toggle configuration');
            
            // Call onRefresh to update the context data
            if (onRefresh) {
                await onRefresh();
            }
            
            toast.success(`Connection ${!currentEnabled ? "enabled" : "disabled"} successfully`);
        } catch (error) {
            toast.error("Failed to update connection status", { description: error instanceof Error ? error.message : String(error) });
        } finally {
            setToggleLoading(prev => { const newSet = new Set(prev); newSet.delete(id); return newSet; });
        }
    }, [connections]);

    const handleDeleteConnection = React.useCallback(async (id: string, type: string) => {
        try {
            const result = await deleteSSOConfig(type.toLowerCase());
            if (!result.success) throw new Error(result.error || 'Failed to delete configuration');
            
            // Call onRefresh to update the context data
            if (onRefresh) {
                await onRefresh();
            }
            
            toast.success("Connection deleted successfully");
        } catch (error) {
            toast.error("Failed to delete connection", { description: error instanceof Error ? error.message : String(error) });
        }
    }, [onRefresh]);

    const columns: ColumnDef<SSOConnection>[] = React.useMemo(() => [
        {
            accessorKey: "name", header: "Connection Name", cell: ({ row }) => {
                const connection = row.original;
                const type = connection.type;
                const typeColor = type === "OAuth2" ? "bg-blue-100 text-blue-700 border-blue-200" : type === "SAML" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-green-100 text-green-700 border-green-200";
                const typeIcon = type === "OAuth2" ? <IconKey className="h-4 w-4" /> : type === "SAML" ? <IconShield className="h-4 w-4" /> : <IconUsers className="h-4 w-4" />;
                return (<div className="flex items-center space-x-3"><div className={`p-2 rounded-lg ${typeColor}`}>{typeIcon}</div><div><div className="font-medium text-slate-900">{connection.name}</div>{connection.provider && <div className="text-sm text-slate-500">{connection.provider}</div>}</div></div>);
            }
        },
        { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline" className={row.original.type === "OAuth2" ? "bg-blue-100 text-blue-700 border-blue-200" : row.original.type === "SAML" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-green-100 text-green-700 border-green-200"}>{row.original.type}</Badge> },
        {
            accessorKey: "status", header: "Status", cell: ({ row }) => {
                const status = row.original.status;
                const statusIcon = status === "active" ? <IconCircleCheck className="h-4 w-4 text-green-500" /> : status === "inactive" ? <IconClock className="h-4 w-4 text-yellow-500" /> : <IconExclamationCircle className="h-4 w-4 text-red-500" />;
                const statusColor = status === "active" ? "bg-green-50 text-green-700 border-green-200" : status === "inactive" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200";
                return (<div className="flex items-center space-x-2">{statusIcon}<Badge variant="outline" className={statusColor}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge></div>);
            }
        },
        { accessorKey: "usersCount", header: "Users", cell: ({ row }) => <div className="text-sm font-medium">{(row.original.usersCount || 0).toLocaleString()}</div> },
        { accessorKey: "updatedAt", header: "Last Updated", cell: ({ row }) => <div className="text-sm text-slate-500">{row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleString("en-GB") : "Never"}</div> },
        { accessorKey: "enabled", header: "Enabled", size: 120, cell: ({ row }) => <EnabledSwitch connection={row.original} isLoading={toggleLoading.has(row.original.id)} onToggle={handleToggleConnection} /> },
        { accessorKey: "encrypted", header: "Encryption", size: 100, cell: ({ row }) => (<div className="flex items-center w-[100px]">{row.original.encrypted ? <div className="flex items-center gap-1"><IconShield className="h-4 w-4 text-green-600" /><span className="text-xs text-green-700 font-medium">Encrypted</span></div> : <span className="text-xs text-slate-500">Not Encrypted</span>}</div>) },
        { id: "actions", header: "", cell: ({ row }) => <ActionButtons connection={row.original} onEdit={onEditConnection} onDelete={handleDeleteConnection} /> },
    ], [handleToggleConnection, handleDeleteConnection, onEditConnection, toggleLoading]);

    const table = useReactTable({ data: connections, columns, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(), state: { sorting } });
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900">SSO Connections</h2>
                    <p className="text-sm text-slate-600 mt-1">Manage your Single Sign-On connections and providers</p>
                </div>
                {!loading && (
                    <Button onClick={onAddConnection} variant={"secondary"} disabled={!canAddNewConnection}>
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add Connection
                        {!canAddNewConnection && <span className="ml-2 text-xs">(Max 3)</span>}
                    </Button>
                )}
            </div>

            {loading ? (
                // LOADING STATE: Show the table shell with a single loading indicator inside.
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50">{table.getHeaderGroups().map(hg => <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id} className="px-6 py-4" />)}</TableRow>)}</TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-60 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <IconLoader2 className="h-6 w-6 animate-spin text-[#438D98]" />
                                        <span className="text-slate-500">Loading connections...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            ) : connections.length === 0 ? (
                // EMPTY STATE: Shown only after loading is complete and there is no connections.
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><IconShield className="h-6 w-6 text-slate-400" /></div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900">No SSO connections</h3>
                                <p className="text-sm text-slate-500 mt-1">Get started by creating your first SSO connection</p>
                            </div>
                            <Button onClick={onAddConnection} className="mt-4"><IconPlus className="mr-2 h-4 w-4" />Add SSO Connection</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                // DATA STATE: The table with data.
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50">{table.getHeaderGroups().map(hg => <TableRow key={hg.id} className="border-b border-gray-200">{hg.headers.map(h => <TableHead key={h.id} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
                        <TableBody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={(e) => onEditConnection(row.original)}>
                                    {row.getVisibleCells().map((cell) => <TableCell key={cell.id} className="px-6 py-4 whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {!loading && connections.length > 0 && table.getPageCount() > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, connections.length)} of {connections.length} connection(s)</div>
                    <div className="flex items-center space-x-2"><Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button><Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button></div>
                </div>
            )}
        </div>
    );
}