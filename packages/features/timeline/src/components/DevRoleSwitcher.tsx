"use client";
import React, { useEffect, useState } from 'react';
import { User, Shield, ChevronUp, ChevronDown } from 'lucide-react';

const ROLES = [
    { id: 'super_admin', label: 'Super Admin' },
    { id: 'marketing_kbm', label: 'Marketing Penerbit KBM' },
    { id: 'admin_kbm', label: 'Admin Penerbit KBM (Client)' },
    { id: 'marketing_external', label: 'Marketing Luar KBM' },
    { id: 'admin_external', label: 'Admin Penerbit Luar (Client)' },
    { id: 'finance', label: 'Finance' },
    { id: 'legal', label: 'Legal' },
    { id: 'production', label: 'Production / Cetak' },
    { id: 'layout_coordinator', label: 'Layout Coordinator' },
    { id: 'layouter', label: 'Layouter' },
];

interface DevRoleSwitcherProps {
    currentRole: string;
    baseRole: string; // The actua logged-in user role
    onRoleChange: (role: string) => void;
}

export const DevRoleSwitcher = ({ currentRole, baseRole, onRoleChange }: DevRoleSwitcherProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Only show for admins (or everyone in dev)
    // if (baseRole !== 'marketing_kbm') return null; // Logic is handled elsewhere or let it be available for all in dev

    return (
        <div className="fixed bottom-4 right-4 z-[9999] font-sans">
            <div className={`bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-auto'}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-3 w-full hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <Shield className="w-4 h-4 text-emerald-400" />
                    {isOpen ? (
                        <span className="font-bold text-sm">Role Simulator</span>
                    ) : (
                        <span className="font-bold text-xs">{currentRole}</span>
                    )}
                    {isOpen ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronUp className="w-4 h-4 ml-2" />}
                </button>

                {isOpen && (
                    <div className="p-2 border-t border-slate-800 max-h-[300px] overflow-y-auto">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-2">Simulate Role:</p>
                        <div className="space-y-1">
                            {ROLES.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => {
                                        onRoleChange(role.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${currentRole === role.id
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
