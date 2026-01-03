'use client';
import React from 'react';
import { Trash2, Layers } from 'lucide-react';
import { MASTER_DATA_GROUPS } from '../constants';

interface MasterDataListProps {
    dataPoints: any[];
    roles: Array<{ id: string; name: string }>;
    onDelete: (id: string) => Promise<void>;
    onUpdate: (id: string, formData: FormData) => Promise<void>;
}

export const MasterDataList = ({ dataPoints, roles, onDelete, onUpdate }: MasterDataListProps) => {
    const [editingId, setEditingId] = React.useState<string | null>(null);

    return (
        <div className="space-y-3">
            {dataPoints.map((dp) => (
                <div key={dp.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                    {editingId === dp.id ? (
                        <form
                            action={async (formData) => {
                                await onUpdate(dp.id, formData);
                                setEditingId(null);
                            }}
                            className="flex items-center gap-4 w-full"
                        >
                            <div className="flex-1 grid grid-cols-3 gap-2">
                                <input name="label" defaultValue={dp.label} className="px-2 py-1 border rounded text-sm" placeholder="Label" required />
                                <select name="role" defaultValue={dp.role} className="px-2 py-1 border rounded text-sm bg-white" required>
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <select name="group" defaultValue={dp.group} className="px-2 py-1 border rounded text-sm bg-white" required>
                                    {MASTER_DATA_GROUPS.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700">
                                    Simpan
                                </button>
                                <button type="button" onClick={() => setEditingId(null)} className="text-xs bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-300">
                                    Batal
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setEditingId(dp.id)}>
                                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{dp.label}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{dp.id}</span>
                                        <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                                            • {roles.find(r => r.id === dp.role)?.name || dp.role}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                            • {MASTER_DATA_GROUPS.find(g => g.id === dp.group)?.label || dp.group}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingId(dp.id)}
                                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    Ubah
                                </button>
                                <button
                                    onClick={() => onDelete(dp.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};
