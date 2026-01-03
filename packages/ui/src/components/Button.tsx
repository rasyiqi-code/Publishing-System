"use client";
import React from "react";
import { cn } from "../utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed",
                    {
                        "bg-gradient-to-r from-brand-blue to-blue-700 text-white hover:opacity-90 shadow-md": variant === "primary",
                        "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50": variant === "secondary",
                        "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50": variant === "outline",
                        "bg-transparent text-gray-600 hover:bg-gray-100": variant === "ghost",
                        "bg-red-50 text-red-600 hover:bg-red-100": variant === "danger",
                        "h-8 px-3 text-xs": size === "sm",
                        "h-10 px-4 text-sm": size === "md",
                        "h-12 px-6 text-base": size === "lg",
                    },
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
