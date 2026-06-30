import { DebugConfiguration } from "@/components/debug-configuration/debug-configuration";
import { DebuggingConfigProvider } from "@/contexts/use-debug-configuration";

export default function DebugConfigurationPage() {
  return (
    <div className="container mx-auto py-8">
      <DebuggingConfigProvider>
        <DebugConfiguration />
      </DebuggingConfigProvider>
    </div>
  );
}
