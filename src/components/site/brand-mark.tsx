import mark from "@/assets/retailx-mark.png";
import { cn } from "@/lib/utils";

/**
 * Official RetailX brand lockup. Single source of truth for the logo so the
 * mark, wordmark and spacing stay identical across marketing and app surfaces.
 */
export function BrandMark({
  className,
  size = 32,
  showWordmark = true,
  wordmarkClassName,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img
        src={mark}
        alt="RetailX logo"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 select-none drop-shadow-[0_0_18px_oklch(0.88_0.216_124/0.35)]"
      />
      {showWordmark && (
        <span className={cn("font-display text-lg font-bold tracking-tight", wordmarkClassName)}>
          RetailX
        </span>
      )}
    </span>
  );
}
