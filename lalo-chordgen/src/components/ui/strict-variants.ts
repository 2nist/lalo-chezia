import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const strictButtonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[#4f46e5] text-white hover:bg-[#4f46e5]/90",
        destructive: "bg-[#ef4444] text-white hover:bg-[#ef4444]/90",
        outline: "border border-[#737373] bg-[#f7f9f3] hover:bg-[#f59e0b] hover:text-black",
        secondary: "bg-[#14b8a6] text-white hover:bg-[#14b8a6]/80",
        ghost: "hover:bg-[#f59e0b] hover:text-black",
        link: "text-[#4f46e5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const strictCardVariants = cva(
  "border rounded-lg shadow-sm bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-lg",
        subtle: "bg-muted/50",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface StrictButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof strictButtonVariants> {}

export interface StrictCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof strictCardVariants> {}

export function cn(...inputs: any[]) {
  return twMerge(inputs.filter(Boolean).join(' '));
}