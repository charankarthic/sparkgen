import { cn } from "@/lib/utils";

interface ShiningEffectProps {
  className?: string;
}

export function ShiningEffect({ className }: ShiningEffectProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div className="absolute -inset-[100%] animate-shine opacity-20"></div>
    </div>
  );
}