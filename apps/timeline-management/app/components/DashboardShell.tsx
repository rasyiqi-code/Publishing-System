'use client';

import { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { AdminHeader } from '../admin/AdminHeader';

interface DashboardShellProps {
    children: React.ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    brandName?: string;
    isAdmin?: boolean;
    services?: Array<{ id: string; name: string; uiMode: string }>;
}

export function DashboardShell({ children, user, brandName, isAdmin, services }: DashboardShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-brand-dark">
            <DashboardSidebar
                user={user}
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
                brandName={brandName}
                isAdmin={isAdmin}
                services={services}
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
