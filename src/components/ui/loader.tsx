import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Loader = ({ className, size = 32 }: { className?: string; size?: number }) => {
  return (
    <div className={cn("flex w-full items-center justify-center p-8", className)}>
      <Loader2 className="animate-spin text-[color:var(--brand)]" size={size} />
    </div>
  );
};
