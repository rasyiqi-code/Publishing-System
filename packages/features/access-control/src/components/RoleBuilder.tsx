"use client";
import React, { useState } from 'react';
import { Role, AccessLevel } from '../types';
import { PermissionMatrix } from './PermissionMatrix';
import { Button } from '@repo/ui';

interface RoleBuilderProps {
    initialRole?: Role; // For editing
    onSave?: (role: Role) => Promise<void>;
    onCancel?: () => void;
}

export const RoleBuilder = ({ initialRole, onSave, onCancel }: RoleBuilderProps) => {
    const [roleName, setRoleName] = useState(initialRole?.name || '');
    const [description, setDescription] = useState(initialRole?.description || '');

    // Parse permissions if it's a string (from DB) or use object (if already passed as object, though types say Record)
    // The prop Role from 'types' has permissions as Record. 
    // But if we pass data from DB, we might need to handle the conversion in the parent.
    // Assuming initialRole.permissions is already Record matchign the type.
    const [permissions, setPermissions] = useState<Record<string, AccessLevel>>(initialRole?.permissions || {});

    const handlePermissionChange = (permId: string, level: AccessLevel) => {
        setPermissions(prev => ({
            ...prev,
            [permId]: level
        }));
    };

    const handleSave = async () => {
        const newRole: Role = {
            id: initialRole?.id || roleName.toLowerCase().replace(/\s+/g, '_'),
            name: roleName,
            description,
            permissions
        };

        if (onSave) {
            await onSave(newRole);
        } else {
            alert(JSON.stringify(newRole, null, 2));
        }
    };

    const isEditMode = !!initialRole?.id;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold mb-4">{isEditMode ? 'Edit Role' : 'Buat Role Baru'}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Role</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            placeholder="Contoh: Supervisor Logistik"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            placeholder="Detail hak akses role ini..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Konfigurasi Hak Akses</h3>
                    <PermissionMatrix permissions={permissions} onChange={handlePermissionChange} />
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave}>{isEditMode ? 'Simpan Perubahan' : 'Simpan Role Baru'}</Button>
                </div>
            </div>
        </div>
    );
};
