import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-secondary hover:bg-primary-dark disabled:opacity-50",
  secondary:
    "bg-secondary text-primary-dark hover:brightness-95 disabled:opacity-50",
  outline:
    "border border-primary text-primary hover:bg-primary hover:text-secondary disabled:opacity-50",
};

const base =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variantClasses[variant]} ${className}`}>
      {children}
    </Link>
  );
}
