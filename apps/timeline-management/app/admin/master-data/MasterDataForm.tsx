'use client';

import { useActionState } from 'react';
import { createMasterData } from '../actions';
import { MASTER_DATA_GROUPS } from '../constants';

const initialState = {
    message: '',
    success: false
};

interface MasterDataFormProps {
    roles: Array<{ id: string; name: string }>;
}

export function MasterDataForm({ roles }: MasterDataFormProps) {
    const [state, formAction, isPending] = useActionState(createMasterData, initialState);

    return (
        <form action={formAction} className="space-y-4">
            {state?.message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {state.message}
                </div>
            )}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unique ID (Optional)</label>
                <input name="id" placeholder="e.g. proofread_internal" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Label</label>
                <input name="label" required placeholder="Display Name" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Role Responsible</label>
                <select name="role" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Group</label>
                <select name="group" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {MASTER_DATA_GROUPS.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.label}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" disabled={isPending} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed">
                {isPending ? 'Saving...' : '+ Add Data Point'}
            </button>
        </form>
    );
}
