"use client";

import { useRouter } from "next/navigation";
import FullScreenChat from "@/components/ai/FullScreenChat";

export default function AIChatPage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="h-full">
      <FullScreenChat onClose={handleClose} />
    </div>
  );
}
