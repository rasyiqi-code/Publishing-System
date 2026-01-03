'use client';

import React, { useState } from 'react';
import { Button } from '@repo/ui';
import { Pencil } from 'lucide-react';
import Link from 'next/link';

// DB Role Type
type DBRole = {
    id: string;
    name: string;
    description: string | null;
    permissions: string | null;
};

interface RoleManagerProps {
    initialRoles: DBRole[];
}

export default function RoleManager({ initialRoles }: RoleManagerProps) {


    const renderPermissions = (permString: string | null) => {
        if (!permString) return <span className="text-gray-400 italic">None</span>;
        try {
            const parsed = JSON.parse(permString);
            if (Array.isArray(parsed)) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {parsed.map((p: string) => (
                            <span key={p} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">
                                {p}
                            </span>
                        ))}
                    </div>
                );
            } else {
                // Object (New Format)
                const keys = Object.keys(parsed).filter(k => parsed[k] !== 'none');
                if (keys.length === 0) return <span className="text-gray-400 italic">None</span>;
                return (
                    <div className="flex flex-wrap gap-1">
                        {keys.map((k) => (
                            <span key={k} className={`px-2 py-0.5 rounded text-xs border ${parsed[k] === 'edit' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'
                                }`}>
                                {k.replace(/_/g, ' ')} ({parsed[k]})
                            </span>
                        ))}
                    </div>
                );
            }
        } catch (e) {
            return <span className="text-red-400 text-xs">Invalid Format</span>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Available Roles</h2>
                    <p className="text-gray-500 text-sm">Manage system access levels and permissions.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/roles/new">
                        <Button size="sm" className="rounded-xl px-4">+ New Role</Button>
                    </Link>
                </div>
            </div>

            {/* Role List Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 text-xs uppercase text-gray-400 font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Role Identity</th>
                                <th className="px-6 py-5">Description</th>
                                <th className="px-6 py-5">Permissions Overview</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {initialRoles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-sm">
                                                {role.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{role.name}</p>
                                                <p className="text-xs text-gray-400 font-mono mt-0.5">{role.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6">
                                        <p className="text-gray-500 line-clamp-2 max-w-xs text-sm">
                                            {role.description || <span className="italic text-gray-300">No description</span>}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6">
                                        {renderPermissions(role.permissions)}
                                    </td>
                                    <td className="px-6 py-5 text-right align-middle">
                                        <Link href={`/admin/roles/${role.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl text-gray-400 hover:text-brand-blue hover:bg-blue-50 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-400 font-medium text-center">
                    Total {initialRoles.length} roles available
                </div>
            </div>
        </div>
    );
}
