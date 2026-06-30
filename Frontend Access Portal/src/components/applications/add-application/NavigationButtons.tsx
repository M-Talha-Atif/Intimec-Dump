import { Button } from "@/components/ui/button";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import React, { createContext, useContext } from "react";

const NavigationButtonsContext = createContext<{
  disablePrevious: boolean;
  disableNext: boolean;
  submitting?: boolean;
} | null>(null);

const useNavigationButtonsContext = () => {
  const context = useContext(NavigationButtonsContext);
  if (!context) {
    throw new Error(
      "useNavigationButtonsContext must be used within a NavigationButtonsProvider"
    );
  }
  return context;
};

export default function NavigationButtons({
  disablePrevious = false,
  disableNext = false,
  submitting = false,
  children,
}: {
  disablePrevious?: boolean;
  disableNext?: boolean;
  children?: React.ReactNode;
  submitting?: boolean;
}) {
  return (
    <NavigationButtonsContext.Provider
      value={{ disablePrevious, disableNext, submitting }}
    >
      {children}
    </NavigationButtonsContext.Provider>
  );
}

NavigationButtons.FinishButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { submitting?: boolean }
>(function FinishButton(props, ref) {
  const { submitting } = useNavigationButtonsContext();
  return (
    <Button ref={ref} type="submit" {...props} disabled={submitting}>
      Save
      {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
    </Button>
  );
});

NavigationButtons.NextButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(function NextButton(props, ref) {
  const { disableNext, submitting } = useNavigationButtonsContext();
  return (
    <Button
      ref={ref}
      type="submit"
      disabled={disableNext || submitting}
      {...props}
    >
      Next <ChevronRight />
    </Button>
  );
});

NavigationButtons.PreviousButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(function PreviousButton(props, ref) {
  const { decrementStep } = useAddApplicationContext();
  const { disablePrevious, submitting } = useNavigationButtonsContext();
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => decrementStep()}
      disabled={disablePrevious || submitting}
      ref={ref}
      {...props}
    >
      <ChevronLeft />
      Previous
    </Button>
  );
});
