"use client";
import React from 'react';
import { cn } from '../utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl p-6 transition-all duration-200",
                    {
                        "bg-white shadow-sm border border-gray-100": variant === 'default',
                        "bg-white/70 backdrop-blur-md border border-white/50 shadow-lg": variant === 'glass',
                        "bg-transparent border border-gray-200": variant === 'outline',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";
