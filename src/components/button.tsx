import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const map: Record<Variant, string> = {
  primary:
    "bg-[var(--sp-violet)] text-white hover:bg-[var(--sp-violet-deep)] shadow-sm",
  secondary:
    "border border-[color-mix(in_oklab,var(--sp-ink)_16%,transparent)] bg-white text-[var(--sp-ink)] hover:bg-[color-mix(in_oklab,var(--sp-sand)_70%,white)]",
  ghost: "text-[var(--sp-ink)] hover:bg-black/5",
};

export function Btn({
  children,
  className,
  variant = "primary",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  variant?: Variant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${map[variant]} ${className ?? ""}`}
      type={rest.type ?? "button"}
    >
      {children}
    </button>
  );
}

export function BtnLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${map[variant]} ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
