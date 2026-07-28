import { Link } from "@tanstack/react-router";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,box-shadow,background-color,color] duration-200 ease-out will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110 hover:shadow-[0_0_0_1px_oklch(1_0_0/12%),0_36px_90px_-28px_oklch(0.88_0.216_124/50%)]",
  glass: "glass text-foreground hover:bg-secondary/70",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

function useMagnet(strength = 0.35) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (event: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (event.clientY - (rect.top + rect.height / 2)) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate3d(0,0,0)";
  };

  return { ref, onMove, onLeave };
}

interface Props {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

export function MagneticButton({
  children,
  variant = "primary",
  size = "md",
  className,
  to,
  href,
  onClick,
  type = "button",
}: Props) {
  const { ref, onMove, onLeave } = useMagnet();
  const classes = cn(base, variants[variant], sizes[size], className);

  if (to) {
    return (
      <Link
        ref={ref as never}
        to={to}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        ref={ref as never}
        href={href}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as never}
      type={type}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={classes}
    >
      {children}
    </button>
  );
}
