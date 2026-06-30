import React from "react";
import { Button } from "@/components/ui/button";
import { useCreateRoleContext } from "../contexts/CreateRoleContext";

export const FormActions: React.FC = () => {
  const { handleSubmit, onCreateRole, onClose, isFormValid } =
    useCreateRoleContext();

  return (
    <div className="flex justify-end space-x-3 pt-4 border-t">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        onClick={() => handleSubmit(onCreateRole)}
        disabled={!isFormValid}
      >
        Create Role
      </Button>
    </div>
  );
};
