import * as React from "react"
import { clsx, type ClassValue } from "clsx"

// Simple utility for merging tailwind classes since we don't have tailwind-merge
function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-blue-600 text-gray-50 hover:bg-blue-700",
            destructive: "bg-red-500 text-gray-50 hover:bg-red-600",
            outline: "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900",
            ghost: "hover:bg-gray-100 hover:text-gray-900",
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
