'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, Package, Tag, Check, X, Plus, Save, LayoutGrid, List as ListIcon } from 'lucide-react';

interface ProductListProps {
    products: any[];
    services: any[];
    categories: any[];
    onDelete: (id: string) => Promise<void>;
    onUpdate: (id: string, formData: FormData) => Promise<void>;
    onCreate: (formData: FormData) => Promise<void>;
}

export const ProductList = ({ products, services, categories, onDelete, onUpdate, onCreate }: ProductListProps) => {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Helper to find service name
    const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Unknown';
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown Category';
    const getCategoryColor = (slug: string) => {
        if (!slug) return 'bg-slate-100 text-slate-400';
        if (slug === 'paket_penerbitan') return 'bg-purple-100 text-purple-600';
        if (slug === 'layanan_satuan') return 'bg-orange-100 text-orange-600';
        if (slug === 'jasa_satuan') return 'bg-pink-100 text-pink-600'; // Legacy
        return 'bg-blue-100 text-blue-600';
    };

    return (
        <div className="relative">
            {/* List Section (Main) */}
            <div className="w-full transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Package className="w-6 h-6 text-indigo-600" />
                            Daftar Produk ({products.length})
                        </h2>
                        {/* View Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="List View"
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Tambah Produk
                        </button>
                    )}
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(p => {
                            const isEditing = editingId === p.id;
                            const category = p.productCategory || categories.find(c => c.id === p.categoryId);

                            return (
                                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative group">
                                    {/* Status Badge */}
                                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-[10px] uppercase font-black tracking-wider ${p.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {p.isActive ? 'Active' : 'Draft'}
                                    </div>

                                    {isEditing ? (
                                        <form action={async (formData) => {
                                            await onUpdate(p.id, formData);
                                            setEditingId(null);
                                        }} className="p-5 flex flex-col h-full gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400">Nama Produk</label>
                                                <input name="name" defaultValue={p.name} className="w-full px-3 py-2 border rounded-lg text-sm font-bold" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400">Harga (IDR)</label>
                                                <input name="price" type="number" defaultValue={p.price} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400">Kategori</label>
                                                <select name="categoryId" defaultValue={p.categoryId} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400">Alur Kerja</label>
                                                <select name="serviceId" defaultValue={p.serviceId} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.uiMode})</option>)}
                                                </select>
                                            </div>

                                            <div className="flex gap-2 mt-auto pt-4">
                                                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">Simpan</button>
                                                <button type="button" onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-xs font-bold">Batal</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${getCategoryColor(category?.slug || '')}`}>
                                                        {category?.name || 'Uncategorized'}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-black text-slate-800 mb-1 leading-snug">{p.name}</h4>
                                                <p className="text-2xl font-black text-indigo-600 mb-6">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.price)}
                                                </p>

                                                <div className="mt-auto pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                        Workflow: <span className="text-indigo-600">{getServiceName(p.serviceId)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                                                <button onClick={() => {
                                                    setEditingId(p.id);
                                                    setIsCreating(false);
                                                }} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all flex items-center justify-center gap-1.5">
                                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                <button onClick={() => confirm('Hapus produk ini?') && onDelete(p.id)} className="w-10 flex items-center justify-center py-2.5 bg-white border border-slate-200 text-rose-500 rounded-xl hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // List View
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Produk</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Harga</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map(p => {
                                    const isEditing = editingId === p.id;
                                    const category = p.productCategory || categories.find(c => c.id === p.categoryId);

                                    if (isEditing) {
                                        return (
                                            <tr key={p.id} className="bg-indigo-50/50">
                                                <td colSpan={5} className="p-4">
                                                    <form action={async (formData) => {
                                                        await onUpdate(p.id, formData);
                                                        setEditingId(null);
                                                    }} className="flex items-center gap-3">
                                                        <div className="flex-1 space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400">Nama</label>
                                                            <input name="name" defaultValue={p.name} className="w-full px-3 py-2 border rounded-lg text-sm font-bold bg-white" />
                                                        </div>
                                                        <div className="w-40 space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400">Kategori</label>
                                                            <select name="categoryId" defaultValue={p.categoryId} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="w-40 space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400">Harga</label>
                                                            <input name="price" type="number" defaultValue={p.price} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
                                                        </div>
                                                        <div className="w-32 space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400">Action</label>
                                                            <div className="flex gap-1">
                                                                <button type="submit" className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><Save className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"><X className="w-4 h-4" /></button>
                                                            </div>
                                                        </div>
                                                        {/* Hidden fields needed for update logic consistency if required */}
                                                        <input type="hidden" name="serviceId" value={p.serviceId} />
                                                    </form>
                                                </td>
                                            </tr>
                                        )
                                    }

                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50 group transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{p.name}</div>
                                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {getServiceName(p.serviceId)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${getCategoryColor(category?.slug || '')}`}>
                                                    {category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-700">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.price)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${p.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                                    {p.isActive ? 'Active' : 'Draft'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditingId(p.id); setIsCreating(false); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => confirm('Hapus produk ini?') && onDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div className="p-12 text-center text-slate-400 text-sm">
                                Belum ada produk. Klik "Tambah Produk" untuk memulai.
                            </div>
                        )}
                    </div>
                )}
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
                                        Produk Baru
                                    </h3>
                                    <p className="text-slate-500 text-xs font-medium mt-1 ml-11">Tambah paket layanan atau jasa satuan.</p>
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
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Identitas Produk</label>
                                        <div className="space-y-3">
                                            <input name="name" required placeholder="Nama Paket (mis: Paket Majapahit)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">Rp</span>
                                                <input name="price" type="number" required placeholder="0" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Klasifikasi</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="relative">
                                            <select name="categoryId" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-sm" required>
                                                <option value="">Pilih Kategori...</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <select name="serviceId" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-sm" required>
                                                <option value="">Pilih Workflow...</option>
                                                {services.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.uiMode})</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Detail & Spesifikasi</label>
                                    <textarea name="description" rows={3} placeholder="Deskripsi singkat produk..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm mb-3" />

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Fitur (JSON Array)</label>
                                            <input name="features" placeholder='["Layout", "Cover"]' className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Specs (JSON Object)</label>
                                            <input name="specs" placeholder='{"size": "A5"}' className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50 rounded-xl flex items-center gap-3">
                                    <input type="checkbox" name="isActive" value="true" defaultChecked id="isActiveNew" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-indigo-200" />
                                    <label htmlFor="isActiveNew" className="text-sm font-bold text-indigo-900 select-none cursor-pointer">Aktifkan Produk Ini Segera</label>
                                </div>

                                <div className="pt-4 sticky bottom-0 bg-white pb-4 border-t border-slate-100">
                                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 text-base">
                                        <Save className="w-5 h-5" /> Simpan Produk Baru
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

