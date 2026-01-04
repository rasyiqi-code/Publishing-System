'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, PenTool, Building2, Package, Layers, ChevronRight, CheckCircle2, ArrowLeft, Save } from 'lucide-react';

interface EditProjectFormProps {
    initialData: any;
    categories: any[];
    onUpdate: (formData: FormData) => Promise<void>;
}

export const EditProjectForm = ({ initialData, categories, onUpdate }: EditProjectFormProps) => {
    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8">
                <Link href={`/`} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Project</h1>
                <p className="text-slate-500 font-medium">Ubah informasi detail project ini.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">Project ID</span>
                        <span className="font-mono text-sm font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded">{initialData.id}</span>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        {initialData.productName || 'Custom Project'}
                    </span>
                </div>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    await onUpdate(formData);
                }} className="p-8 space-y-6">
                    <input type="hidden" name="id" value={initialData.id} />

                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            <BookOpen className="w-4 h-4" /> Judul Buku
                        </label>
                        <input name="title" required defaultValue={initialData.title} placeholder="Judul Naskah..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <PenTool className="w-4 h-4" /> Penulis
                            </label>
                            <input name="authorName" required defaultValue={initialData.authorName || initialData.author?.name} placeholder="Nama Penulis/Klien" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <Building2 className="w-4 h-4" /> Penerbit
                            </label>
                            <input name="publisher" required defaultValue={initialData.publisher} placeholder="Nama Penerbit" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <Layers className="w-4 h-4" /> Oplah (Eks)
                            </label>
                            <input name="quantity" type="number" required defaultValue={initialData.quantity} placeholder="500" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                        {/* Status could be editable here if needed provided we map it correctly */}
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Kategori / Departemen
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {categories.map((cat: any) => (
                                <label key={cat.id} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat.slug}
                                        className="peer sr-only"
                                        defaultChecked={cat.slug === (initialData.category || 'umum')}
                                    />
                                    <div className="p-4 rounded-xl border-2 border-slate-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all text-center h-full flex flex-col items-center justify-center">
                                        <span className="block font-bold text-slate-700 peer-checked:text-indigo-700">{cat.name}</span>
                                        {cat.description && <span className="text-xs text-slate-400 mt-1 line-clamp-1">{cat.description}</span>}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <Link href="/" className="flex-1 py-4 text-center font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center">
                            Batal
                        </Link>
                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" />
                            <span>Simpan Perubahan</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
