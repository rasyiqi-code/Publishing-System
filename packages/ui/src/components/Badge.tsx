"use client";
import React from "react";
import { cn } from "../utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline" | "danger" | "success";
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "border-transparent bg-brand-blue text-white hover:bg-brand-blue/80": variant === "default",
                    "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
                    "text-gray-900 border-gray-200": variant === "outline",
                    "border-transparent bg-red-100 text-red-800": variant === "danger",
                    "border-transparent bg-green-100 text-green-800": variant === "success",
                },
                className
            )}
            {...props}
        />
    );
};
