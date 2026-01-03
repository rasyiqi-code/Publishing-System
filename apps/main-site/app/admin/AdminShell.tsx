'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminShellProps {
    children: React.ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    brandName?: string;
}

export function AdminShell({ children, user, brandName }: AdminShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-brand-dark">
            <AdminSidebar
                user={user}
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
                brandName={brandName}
            />

            {/* Main Content Area */}
            <main className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isCollapsed ? 'md:ml-24' : 'md:ml-72'}`}>
                <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AdminHeader userName={user?.name} />
                    {children}
                </div>
            </main>
        </div>
    );
}
