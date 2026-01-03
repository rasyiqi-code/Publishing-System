"use client";
import React from 'react';
import { AccessLevel, Permission, ModuleId } from '../types';
import { MASTER_PERMISSIONS, MODULE_LABELS } from '../constants';

interface PermissionMatrixProps {
    permissions: Record<string, AccessLevel>;
    onChange: (permissionId: string, level: AccessLevel) => void;
}

export const PermissionMatrix = ({ permissions, onChange }: PermissionMatrixProps) => {
    // Group permissions by module
    const groupedPermissions = MASTER_PERMISSIONS.reduce((acc, perm) => {
        if (!acc[perm.moduleId]) acc[perm.moduleId] = [];
        acc[perm.moduleId].push(perm);
        return acc;
    }, {} as Record<ModuleId, Permission[]>);

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Modul / Izin</th>
                        <th scope="col" className="px-6 py-3 text-center">Tanpa Akses</th>
                        <th scope="col" className="px-6 py-3 text-center">Lihat Saja</th>
                        <th scope="col" className="px-6 py-3 text-center">Akses Penuh</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(groupedPermissions).map(([moduleId, perms]) => (
                        <React.Fragment key={moduleId}>
                            <tr className="bg-gray-100 border-b">
                                <td colSpan={4} className="px-6 py-2 font-bold text-gray-900">
                                    {MODULE_LABELS[moduleId as ModuleId]}
                                </td>
                            </tr>
                            {perms.map((perm) => (
                                <tr key={perm.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{perm.label}</div>
                                        <div className="text-xs text-gray-500">{perm.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="radio"
                                            name={perm.id}
                                            checked={permissions[perm.id] === 'none' || !permissions[perm.id]}
                                            onChange={() => onChange(perm.id, 'none')}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="radio"
                                            name={perm.id}
                                            checked={permissions[perm.id] === 'view'}
                                            onChange={() => onChange(perm.id, 'view')}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="radio"
                                            name={perm.id}
                                            checked={permissions[perm.id] === 'edit'}
                                            onChange={() => onChange(perm.id, 'edit')}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
