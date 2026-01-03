'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Database,
    Workflow,
    Package,
    Tags,
    ChevronLeft,
    ChevronRight,
    Command,
    LogOut,
    LayoutTemplate,
    Globe
} from 'lucide-react';
import { Button } from '@repo/ui';
import { logoutAction } from '../logout-action';

interface AdminSidebarProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    isCollapsed: boolean;
    onToggle: () => void;
    brandName?: string;
}

export function AdminSidebar({ user, isCollapsed, onToggle, brandName }: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    interface NavItem {
        label: string;
        href: string;
        icon: React.ElementType;
        exact?: boolean;
    }

    const mainNavItems: NavItem[] = [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
        { label: 'Data Utama', href: '/admin/master-data', icon: Database },
        { label: 'Resep Layanan', href: '/admin/services', icon: Workflow },
        { label: 'Produk', href: '/admin/products', icon: Package },
        { label: 'Kategori', href: '/admin/categories', icon: Tags },
    ];

    const bottomNavItems: NavItem[] = [
        { label: 'Dashboard Produksi', href: '/dashboard', icon: LayoutTemplate },
        { label: 'Website Utama', href: '/', icon: Globe },
    ];

    return (
        <aside
            className={`hidden md:flex flex-col fixed left-4 top-4 bottom-4 bg-white rounded-3xl border border-gray-100 shadow-2xl z-20 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Floating Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-12 p-1.5 bg-white border border-gray-100 rounded-full shadow-md text-gray-400 hover:text-gray-900 z-50 transform hover:scale-110 transition-all"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo Section */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'}`}>
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-lg shrink-0">
                    <Command size={20} />
                </div>
                {!isCollapsed && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="font-bold text-lg tracking-tight">{brandName || 'Kreasibu'}</span>
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 no-scrollbar">
                {mainNavItems.map((item) => (
                    <Link key={item.href} href={item.href} title={isCollapsed ? item.label : undefined}>
                        <span
                            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3'} rounded-2xl transition-all duration-200 group
                            ${(item.exact ? pathname === item.href : isActive(item.href))
                                    ? 'bg-black text-white shadow-lg shadow-gray-200 transform scale-105'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon
                                strokeWidth={2.5}
                                className={`w-5 h-5 ${(item.exact ? pathname === item.href : isActive(item.href)) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}
                            />
                            {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                        </span>
                    </Link>
                ))}
            </nav>

            {/* Bottom Navigation (App Switchers) */}
            <div className="px-3 py-2 border-t border-gray-50">
                {bottomNavItems.map((item) => (
                    <Link key={item.href} href={item.href} title={isCollapsed ? item.label : undefined}>
                        <span
                            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3'} rounded-2xl transition-all duration-200 group text-gray-400 hover:bg-gray-50 hover:text-gray-900`}
                        >
                            <item.icon
                                strokeWidth={2.5}
                                className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
                            />
                            {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                        </span>
                    </Link>
                ))}
            </div>

            {/* User Profile */}
            <div className="p-4 flex flex-col items-center space-y-4">
                <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between space-x-2 bg-gray-50 p-2 pl-2 pr-2 rounded-full'}`}>
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity shrink-0">
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden flex-1 text-left">
                                <p className="font-semibold text-xs text-gray-900 truncate max-w-[80px]">{user?.name || 'Admin'}</p>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <form action={logoutAction} className="shrink-0">
                            <button
                                title="Keluar"
                                className="p-2 rounded-full text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all"
                            >
                                <LogOut size={16} strokeWidth={2.5} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </aside>
    );
}
