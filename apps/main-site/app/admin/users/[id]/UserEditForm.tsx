'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from "@repo/ui";
import { updateUser, createUser, deleteUser } from '../actions';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

type UserWithRole = {
    id: string;
    name: string | null;
    email: string | null;
    role: { id: string; name: string } | null;
    roleId: string | null;
};

type Role = {
    id: string;
    name: string;
};

interface UserEditFormProps {
    user: UserWithRole | null;
    roles: Role[];
}

export default function UserEditForm({ user, roles }: UserEditFormProps) {
    const router = useRouter();
    const isEditMode = !!user;

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        roleId: user?.roleId || '',
        password: '' // Only for creation
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditMode && user) {
                await updateUser(user.id, {
                    name: formData.name,
                    email: formData.email,
                    roleId: formData.roleId
                });
                alert("User updated successfully");
            } else {
                await createUser({
                    name: formData.name,
                    email: formData.email,
                    roleId: formData.roleId,
                    password: formData.password
                });
                alert("User created successfully");
            }
            router.push('/admin/users');
            router.refresh();
        } catch (error: any) {
            alert("Failed to save user: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!user || !confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            await deleteUser(user.id);
            alert("User deleted successfully");
            router.push('/admin/users');
            router.refresh();
        } catch (error: any) {
            alert("Failed to delete user: " + error.message);
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Kembali
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h1>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <Input
                                className="w-full"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">Nama lengkap pengguna yang akan ditampilkan.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <Input
                                className="w-full"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isEditMode} // Prevent changing email on edit if desired, or keep enabled. Usually email is ID. Let's keep enabled but backend checks unique? UpdateUser keeps email.
                            />
                            <p className="text-xs text-slate-500 mt-1">Alamat email untuk login dan notifikasi.</p>
                        </div>

                        {!isEditMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <Input
                                    className="w-full"
                                    type="password"
                                    value={formData.password}
                                    placeholder="Default: Member123!"
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-1">Kosongkan untuk menggunakan password default.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role / Peran</label>
                            <select
                                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={formData.roleId}
                                onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                                required
                            >
                                <option value="">-- Pilih Role --</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Hak akses menentukan apa yang bisa dilakukan pengguna di sistem.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                        <div>
                            {isEditMode && (
                                <Button type="button" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete} disabled={isLoading}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Hapus User
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Link href="/admin/users">
                                <Button type="button" variant="outline">Batal</Button>
                            </Link>
                            <Button type="submit" disabled={isLoading}>
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Buat User')}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
}
