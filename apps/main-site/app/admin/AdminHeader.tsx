'use client';

import { Search, Bell, Settings, Command } from 'lucide-react';
import { Button } from '@repo/ui';
import { useEffect, useState } from 'react';

interface AdminHeaderProps {
    userName?: string | null;
}

export function AdminHeader({ userName }: AdminHeaderProps) {
    const [today, setToday] = useState('');

    useEffect(() => {
        setToday(new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hi, {userName || 'User'}!</h1>
                <p className="text-sm text-gray-500 mt-1">{today}</p>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-brand-blue" />
                    </div>
                    <input
                        type="text"
                        placeholder="Find Something"
                        className="pl-10 pr-12 py-2.5 w-64 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Command className="h-3 w-3 text-gray-300" />
                    </div>
                </div>

                {/* Actions */}
                <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 shadow-sm transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 shadow-sm transition-colors">
                    <Bell className="w-5 h-5" />
                </button>

                <Button className="bg-black hover:bg-gray-900 text-white rounded-xl px-6 py-2.5 font-medium shadow-lg shadow-gray-200">
                    Optimize
                </Button>
            </div>
        </header>
    );
}
