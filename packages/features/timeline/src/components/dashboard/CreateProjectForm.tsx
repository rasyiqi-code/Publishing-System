'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, PenTool, Building2, Package, Layers, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';

interface CreateProjectFormProps {
    services: any[];
    products: any[];
    categories: any[];
    onCreate: (formData: FormData) => Promise<void>;
}

export const CreateProjectForm = ({ services, products, categories, onCreate }: CreateProjectFormProps) => {
    // If we have products, we start in 'selection' mode.
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    const getProductsByCategory = (catId: string) => products.filter(p => p.categoryId === catId && p.isActive);

    if (!selectedProduct) {
        return (
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Input Pesanan Baru</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">Pilih paket atau layanan yang dipesan oleh klien.</p>
                </div>

                {/* Dynamic Categories Grid */}
                {categories.map((cat) => {
                    const catProducts = getProductsByCategory(cat.id);
                    if (catProducts.length === 0) return null;

                    return (
                        <div key={cat.id}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-indigo-600" /> {cat.name}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {catProducts.map((p: any) => (
                                    <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                                        <div className="text-3xl font-black text-emerald-600 mb-6">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.price)}
                                        </div>
                                        <div className="space-y-3 mb-6">
                                            {/* Parse JSON features safely */}
                                            {(() => {
                                                try {
                                                    const feats = JSON.parse(p.features || '[]');
                                                    return Array.isArray(feats) ? feats.slice(0, 5).map((f: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                            <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                                            <span>{f}</span>
                                                        </div>
                                                    )) : null;
                                                } catch (e) { return null; }
                                            })()}
                                        </div>
                                        <div className="bg-slate-50 -mx-6 -mb-6 p-4 text-center text-sm font-bold text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                                            Pilih {cat.slug === 'paket_penerbitan' ? 'Paket' : 'Layanan'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="text-center pt-8 border-t border-slate-200">
                    <p className="text-slate-400 mb-4 text-sm">Atau buat project manual tanpa paket?</p>
                    <button onClick={() => setSelectedProduct({ id: 'custom', name: 'Custom Project', price: 0, serviceId: services[0]?.id })} className="text-indigo-600 font-bold hover:underline">
                        Mulai Project Kosong &rarr;
                    </button>
                </div>
            </div>
        );
    }

    // FORM MODE
    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Pilihan Paket
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-8">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Detail Project</h2>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            {selectedProduct.name}
                        </span>
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Lengkapi informasi naskah untuk memulai produksi.</p>
                </div>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    // Inject Product ID if not custom
                    if (selectedProduct.id !== 'custom') {
                        formData.append('productId', selectedProduct.id);
                    }
                    await onCreate(formData);
                }} className="p-8 space-y-6">
                    <input type="hidden" name="productId" value={selectedProduct.id !== 'custom' ? selectedProduct.id : ''} />

                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            <BookOpen className="w-4 h-4" /> Judul Buku
                        </label>
                        <input name="title" required placeholder="Judul Naskah..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <PenTool className="w-4 h-4" /> Penulis
                            </label>
                            <input name="authorName" required placeholder="Nama Penulis/Klien" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <Building2 className="w-4 h-4" /> Penerbit
                            </label>
                            <input name="publisher" required placeholder="Nama Penerbit" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <Package className="w-4 h-4" /> Layanan (Resep)
                            </label>
                            <div className="relative">
                                {/* If product has specific service link, verify it exists. Else fallback to first available or manual select */}
                                <select
                                    name="serviceId"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    defaultValue={selectedProduct.serviceId || services[0]?.id}
                                // If Product enforces service, maybe disable edit? Let's keep flexible for now but default to product's service
                                >
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.type === 'timeline' ? 'Timeline' : 'Tiket'})</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <Layers className="w-4 h-4" /> Oplah (Eks)
                            </label>
                            <input name="quantity" type="number" required placeholder="500" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <Link href="/" className="flex-1 py-4 text-center font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center">
                            Batal
                        </Link>
                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <span>✨ Buat Project</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
