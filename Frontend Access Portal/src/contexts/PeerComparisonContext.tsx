"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { type User } from "@/data/mock-users";

type PeerComparisonContextType = {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  selectedUsers: User[];
  toggleUserSelection: (user: User) => void;
  clearSelection: () => void;
};

const PeerComparisonContext = createContext<
  PeerComparisonContextType | undefined
>(undefined);

export const PeerComparisonProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      }
      if (prev.length < 3) {
        return [...prev, user];
      }
      return prev;
    });
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  return (
    <PeerComparisonContext.Provider
      value={{
        isDialogOpen,
        setIsDialogOpen,
        selectedUsers,
        toggleUserSelection,
        clearSelection,
      }}
    >
      {children}
    </PeerComparisonContext.Provider>
  );
};

export const usePeerComparison = () => {
  const context = useContext(PeerComparisonContext);
  if (!context) {
    throw new Error(
      "usePeerComparison must be used within a PeerComparisonProvider"
    );
  }
  return context;
};
