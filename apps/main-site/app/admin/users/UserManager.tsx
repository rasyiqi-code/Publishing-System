'use client';

import { useState } from 'react';
import { Button, Card, Badge, Input } from "@repo/ui";
import { Pencil } from 'lucide-react';
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

interface UserManagerProps {
    initialUsers: UserWithRole[];
    roles: Role[];
}

export default function UserManager({ initialUsers, roles }: UserManagerProps) {
    const [users, setUsers] = useState(initialUsers);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
                    <p className="text-gray-500 mt-1">Kelola akses dan akun pengguna sistem secara terpusat.</p>
                </div>
                <Link href="/admin/users/new">
                    <Button className="rounded-xl px-6 py-2.5 shadow-lg shadow-blue-100">Tambah Pengguna</Button>
                </Link>
            </div>

            <Card className="p-0 overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative max-w-md w-full">
                        <Input
                            placeholder="Cari pengguna berdasarkan nama atau email..."
                            className="bg-gray-50 border-transparent focus:bg-white focus:border-brand-blue rounded-xl w-full transition-all py-2.5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:ring-brand-blue focus:border-brand-blue outline-none cursor-pointer hover:border-gray-300 transition-colors"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">Semua Role</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 text-xs uppercase text-gray-400 font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Nama User</th>
                                <th className="px-6 py-5">Email</th>
                                <th className="px-6 py-5">Role</th>
                                <th className="px-6 py-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-5 font-medium text-gray-900">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-brand-blue flex items-center justify-center font-bold text-sm shadow-sm border border-white">
                                                {user.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="font-semibold">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-500">{user.email}</td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${user.role ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {user.role?.name || 'No Role'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <Link href={`/admin/users/${user.id}`}>
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
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <span className="mb-2 text-3xl">🔍</span>
                                            <p>Tidak ada pengguna yang ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-400 font-medium text-center">
                    Menampilkan {filteredUsers.length} pengguna
                </div>
            </Card>
        </div>
    );
}
