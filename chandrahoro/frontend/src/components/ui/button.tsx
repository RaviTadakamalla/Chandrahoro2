import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-saffron to-gold text-white hover:shadow-lg hover:scale-105 active:scale-95",
        secondary: "bg-celestial-medium text-white hover:bg-celestial-deep hover:shadow-md active:scale-95",
        ghost: "hover:bg-accent/10 hover:text-accent active:bg-accent/20",
        outline: "border-2 border-primary text-primary hover:bg-primary/5 active:bg-primary/10",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-md",
        default: "h-10 px-4 py-2 rounded-md",
        md: "h-11 px-5 py-2 rounded-md",
        lg: "h-12 px-8 py-3 rounded-lg text-base",
        icon: "h-10 w-10 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
