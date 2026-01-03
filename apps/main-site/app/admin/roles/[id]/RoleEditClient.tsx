'use client';

import { useRouter } from 'next/navigation';
import { RoleBuilder, Role as BuilderRole } from "@repo/feature-access-control";
import { saveRole, deleteRole } from '../actions';
import { Button } from '@repo/ui';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

// DB Role Type (permissions is string)
type DBRole = {
    id: string;
    name: string;
    description: string | null;
    permissions: string | null;
};

interface RoleEditClientProps {
    role: DBRole | null;
}

export default function RoleEditClient({ role }: RoleEditClientProps) {
    const router = useRouter();

    // Helper to migrate legacy array tokens to new Permission Validation Grid
    // Copied from RoleManager.tsx for consistency
    const migrateLegacyPermissions = (legacyArray: string[]) => {
        const mapped: Record<string, 'none' | 'view' | 'edit'> = {};

        legacyArray.forEach(token => {
            if (token === 'project.view.kbm' || token === 'project.view.umum') mapped['manage_order'] = 'view';
            if (token === 'project.create') mapped['manage_order'] = 'edit';
            if (token === 'finance.validate') {
                mapped['verify_dp'] = 'edit';
                mapped['verify_settlement'] = 'edit';
            }
            if (token === 'legal.input') {
                mapped['manage_isbn'] = 'edit';
                mapped['manage_haki'] = 'edit';
                mapped['verify_auth'] = 'edit';
            }
            if (token === 'layout.assign') mapped['manage_creative_flow'] = 'edit';
            if (token === 'layout.upload' || token === 'layout.execute') mapped['submit_draft'] = 'edit';
            if (token === 'print.execute') mapped['manage_printing'] = 'edit';
            if (token === 'project.view.own') mapped['manage_order'] = 'view';
        });

        return mapped;
    };

    // Prepare initial data for builder
    let parsedPerms: any = {};
    if (role && role.permissions) {
        try {
            const parsed = JSON.parse(role.permissions);
            if (!Array.isArray(parsed)) {
                parsedPerms = parsed;
            } else {
                parsedPerms = migrateLegacyPermissions(parsed);
            }
        } catch (e) {
            console.error("Failed to parse permissions", e);
        }
    }

    const builderInitialRole: BuilderRole | undefined = role ? {
        id: role.id,
        name: role.name,
        description: role.description || '',
        permissions: parsedPerms
    } : undefined;

    const handleSave = async (updatedRole: BuilderRole) => {
        try {
            await saveRole({
                id: updatedRole.id,
                name: updatedRole.name,
                description: updatedRole.description,
                permissions: JSON.stringify(updatedRole.permissions)
            });
            alert("Role saved successfully!");
            router.push('/admin/roles');
            router.refresh();
        } catch (e) {
            alert("Error saving role: " + e);
        }
    };

    const handleDelete = async () => {
        if (!role || !confirm(`Are you sure you want to delete role "${role.name}"? This action cannot be undone.`)) return;

        try {
            await deleteRole(role.id);
            alert("Role deleted successfully");
            router.push('/admin/roles');
            router.refresh();
        } catch (e: any) {
            alert("Error deleting role: " + e.message);
        }
    };

    const handleCancel = () => {
        router.push('/admin/roles');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/roles">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Kembali
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {role ? `Edit Role: ${role.name}` : 'Buat Role Baru'}
                    </h1>
                </div>
                {role && (
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus Role
                    </Button>
                )}
            </div>

            <RoleBuilder
                initialRole={builderInitialRole}
                onSave={handleSave}
            />
        </div>
    );
}
