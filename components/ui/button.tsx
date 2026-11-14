import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:brightness-95",
        secondary: "border bg-surface text-text hover:bg-surface-2",
        ghost: "text-text hover:bg-surface-2",
        link: "min-h-0 px-0 text-text underline underline-offset-4",
      },
      size: { md: "", lg: "min-h-12 text-base", sm: "min-h-9 px-3 text-xs" },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, block, type = "button", ...props }: Props) {
  return <button type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
