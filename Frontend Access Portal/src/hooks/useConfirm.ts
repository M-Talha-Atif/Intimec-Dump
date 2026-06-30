import { useState, useCallback } from "react";

export interface ConfirmOptions {
  title: string;
  description: string;
  requireReason?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export interface ConfirmResult {
  confirmed: boolean;
  reason?: string;
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((result: ConfirmResult) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<ConfirmResult> => {
    setOptions(opts);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback((reason?: string) => {
    if (resolver) {
      resolver({ confirmed: true, reason });
    }
    setIsOpen(false);
    setOptions(null);
    setResolver(null);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    if (resolver) {
      resolver({ confirmed: false });
    }
    setIsOpen(false);
    setOptions(null);
    setResolver(null);
  }, [resolver]);

  return {
    confirm,
    isOpen,
    options,
    handleConfirm,
    handleCancel,
  };
};
