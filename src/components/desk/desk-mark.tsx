import { initials } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function DeskMark({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center border border-primary/60 text-[0.68rem] font-semibold tracking-[0.08em] text-primary shadow-[0_0_24px_var(--glow)]",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
