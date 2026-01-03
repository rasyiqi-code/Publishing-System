'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, List, Grid, Plus, X, Save } from 'lucide-react';

interface CategoryListProps {
    categories: any[];
    onDelete: (id: string) => Promise<void>;
    onUpdate: (id: string, formData: FormData) => Promise<void>;
    onCreate: (formData: FormData) => Promise<void>;
}

export const CategoryList = ({ categories, onDelete, onUpdate, onCreate }: CategoryListProps) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div className="relative">
            {/* List Section (Main) */}
            <div className={`w-full transition-all duration-300`}>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <List className="w-5 h-5 text-indigo-600" /> Daftar Kategori
                            </h2>
                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isCreating && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> Tambah
                            </button>
                        )}
                    </div>

                    {/* View Switcher Logic */}
                    {viewMode === 'list' ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-black text-xs text-slate-400 uppercase tracking-widest w-16 text-center">Urutan</th>
                                    <th className="px-6 py-4 font-black text-xs text-slate-400 uppercase tracking-widest text-left">Info Kategori</th>
                                    <th className="px-6 py-4 font-black text-xs text-slate-400 uppercase tracking-widest text-right w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories.map((cat) => {
                                    const isEditing = editingId === cat.id;

                                    if (isEditing) {
                                        return (
                                            <tr key={cat.id} className="bg-indigo-50/30">
                                                <td colSpan={3} className="p-4">
                                                    <form action={async (formData) => {
                                                        await onUpdate(cat.id, formData);
                                                        setEditingId(null);
                                                    }} className="space-y-4">
                                                        <div className="flex gap-4">
                                                            <div className="w-20">
                                                                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Sort</label>
                                                                <input name="order" type="number" defaultValue={cat.order} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-bold" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Nama</label>
                                                                <input name="name" defaultValue={cat.name} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold" />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Slug</label>
                                                            <input name="slug" defaultValue={cat.slug} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs text-indigo-600 bg-white" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Deskripsi</label>
                                                            <input name="description" defaultValue={cat.description} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                                        </div>

                                                        <div className="flex gap-2 justify-end">
                                                            <button type="button" onClick={() => setEditingId(null)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold">Batal</button>
                                                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Simpan</button>
                                                        </div>
                                                    </form>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={cat.id} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm font-mono">
                                                    {cat.order}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <h4 className="text-base font-black text-slate-800 mb-1">
                                                    {cat.name}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <code className="text-[10px] font-mono text-indigo-500 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/50">
                                                        {cat.slug}
                                                    </code>
                                                </div>
                                                <p className="text-sm font-medium text-slate-500 line-clamp-2">
                                                    {cat.description || <span className="text-slate-300 italic">No description</span>}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(cat.id);
                                                            setIsCreating(false);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirm('Hapus kategori ini?') && onDelete(cat.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        // Grid View
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {categories.map((cat) => {
                                const isEditing = editingId === cat.id;

                                if (isEditing) {
                                    return (
                                        <div key={cat.id} className="bg-indigo-50/50 rounded-2xl p-5 border-2 border-indigo-100 shadow-xl shadow-indigo-100/50 relative">
                                            <form action={async (formData) => {
                                                await onUpdate(cat.id, formData);
                                                setEditingId(null);
                                            }} className="space-y-4">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="w-16">
                                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Sort</label>
                                                        <input name="order" type="number" defaultValue={cat.order} className="w-full px-2 py-1.5 border border-slate-200 rounded text-center font-bold text-sm" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Nama</label>
                                                        <input name="name" defaultValue={cat.name} autoFocus className="w-full px-3 py-1.5 border border-slate-200 rounded font-bold text-sm" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Slug</label>
                                                    <input name="slug" defaultValue={cat.slug} className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-xs text-indigo-600 bg-white" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Deskripsi</label>
                                                    <textarea name="description" rows={2} defaultValue={cat.description} className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm resize-none" />
                                                </div>
                                                <div className="flex gap-2 justify-end pt-2">
                                                    <button type="button" onClick={() => setEditingId(null)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Batal</button>
                                                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Simpan</button>
                                                </div>
                                            </form>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={cat.id} className="group bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/40 transition-all flex flex-col justify-between h-full relative">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold flex items-center justify-center font-mono shadow-sm">
                                                    {cat.order}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(cat.id);
                                                            setIsCreating(false);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg border border-slate-100"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirm('Hapus kategori ini?') && onDelete(cat.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-slate-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <h4 className="text-lg font-black text-slate-800 mb-2 leading-tight">
                                                {cat.name}
                                            </h4>

                                            <div className="mb-3">
                                                <code className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                                    {cat.slug}
                                                </code>
                                            </div>

                                            <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                                                {cat.description || <span className="text-slate-300 italic">Belum ada deskripsi.</span>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Form Section (Right Side Overlay) */}
            {isCreating && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsCreating(false)}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
                    />

                    {/* Drawer */}
                    <div className="fixed top-0 right-0 h-full w-full sm:w-[28rem] bg-white shadow-2xl z-50 border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        Kategori Baru
                                    </h3>
                                    <p className="text-slate-500 text-xs font-medium mt-1 ml-11">Buat kategori untuk mengelompokkan produk.</p>
                                </div>
                                <button onClick={() => setIsCreating(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form action={async (formData) => {
                                await onCreate(formData);
                                setIsCreating(false);
                            }} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Info Utama</label>
                                        <div className="space-y-3">
                                            <input name="name" required placeholder="Nama Kategori (mis: Paket Penerbitan)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Urutan</label>
                                        <input name="order" type="number" defaultValue={0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Slug (Auto)</label>
                                        <input name="slug" placeholder="slug-otomatis" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Deskripsi</label>
                                    <textarea name="description" rows={3} placeholder="Penjelasan singkat kategori ini..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm" />
                                </div>

                                <div className="pt-4 sticky bottom-0 bg-white pb-4 border-t border-slate-100">
                                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 text-base">
                                        <Save className="w-5 h-5" /> Simpan Kategori
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
