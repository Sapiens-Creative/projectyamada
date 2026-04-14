import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base — Intercom sharp geometry (4px radius), glass-aware
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#ff5600]/50 active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary — Fin Orange
        default:
          "bg-[#ff5600] text-white hover:bg-[#ff5600]/90 hover:scale-[1.02] shadow-[0_0_16px_rgba(255,86,0,0.25)] border-transparent rounded-[4px]",
        // Outlined glass
        outline:
          "border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white hover:border-white/20 rounded-[4px]",
        // Secondary glass
        secondary:
          "bg-white/[0.07] text-white/80 hover:bg-white/[0.11] hover:text-white border-white/[0.06] rounded-[4px]",
        // Ghost
        ghost:
          "bg-transparent text-white/60 hover:bg-white/[0.06] hover:text-white/90 rounded-md",
        // Destructive
        destructive:
          "bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/20 rounded-[4px]",
        // Link
        link: "text-[#ff5600] underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "h-8 gap-1.5 px-3",
        xs:      "h-6 gap-1 px-2 text-xs rounded-[4px] [&_svg:not([class*='size-'])]:size-3",
        sm:      "h-7 gap-1 px-2.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg:      "h-9 gap-2 px-4 text-sm",
        icon:    "size-8 rounded-md",
        "icon-xs":   "size-6 rounded-[4px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":   "size-7 rounded-[4px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg":   "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
