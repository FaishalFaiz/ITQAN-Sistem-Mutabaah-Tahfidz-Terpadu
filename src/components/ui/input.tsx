import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9.5 w-full rounded-lg border border-slate-300 bg-slate-100/75 px-3 py-2 text-xs font-normal text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all hover:bg-slate-100 hover:border-slate-400 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#0070BA] focus-visible:ring-2 focus-visible:ring-[#0070BA]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
