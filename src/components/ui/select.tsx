import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.ComponentProps<"select"> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-900 shadow-xs transition-all hover:border-slate-400 focus:outline-none focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
