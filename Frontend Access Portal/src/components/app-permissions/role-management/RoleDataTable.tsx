import React from "react";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { useRoleManagementContext } from "./contexts/RoleManagementContext";
import { RoleCard } from "./components/RoleCard";
import { RoleTableView } from "./components/RoleTableView";
import { RolePagination } from "./RolePagination";

export const RoleDataTable: React.FC = () => {
  const { roles, loading, viewMode, setShowCreateWizard, currentPage, pageSize, totalPages, totalElements, setCurrentPage, setPageSize } =
    useRoleManagementContext();
  console.log("roles", roles);

  if (loading) {
    return <Loader />;
  }

  // Empty state when no roles
  if (!roles || roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Roles Created Yet</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Get started by creating your first role to manage permissions and
              access control for your organization.
            </p>
            <Button
              onClick={() => setShowCreateWizard(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Role
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render table or card view based on viewMode
  if (viewMode === "table") {
    return (
      <>
        <RoleTableView roles={roles} loading={loading} size={10} />
        <RolePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
      <RolePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
};
