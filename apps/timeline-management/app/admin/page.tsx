import Link from 'next/link';
import { Database, Workflow, Package, Tags, ArrowRight, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Feature Card 1: Data Utama */}
                <Link href="/admin/master-data" className="group md:col-span-1">
                    <div className="h-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database size={120} className="text-indigo-600" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                                    <Database className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Data Utama</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Kelola inventaris bahan baku (Lego Blocks) dan titik data.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm">
                                <span>Kelola Data</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Feature Card 2: Resep & Workflow */}
                <Link href="/admin/services" className="group md:col-span-1">
                    <div className="h-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Workflow size={120} className="text-purple-600" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                                    <Workflow className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Resep Layanan</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Atur alur kerja (Workflow) dan definisi layanan.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center text-purple-600 font-bold text-sm">
                                <span>Atur Workflow</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Feature Card 3: Products */}
                <Link href="/admin/products" className="group md:col-span-1">
                    <div className="h-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-pink-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Package size={120} className="text-pink-600" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mb-4 text-pink-600 group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Produk</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Manajemen paket penerbitan dan etalase produk.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center text-pink-600 font-bold text-sm">
                                <span>Lihat Produk</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Quick Stats: Categories */}
                <div className="md:col-span-3 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 translate-y-1/2"></div>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2 text-indigo-300">
                                <Tags className="w-5 h-5" />
                                <span className="font-bold text-sm uppercase tracking-wider">Kategori Produk</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Kelola Kategori</h2>
                            <p className="text-indigo-200 max-w-lg">
                                Organisasi produk Anda ke dalam kategori yang rapi untuk memudahkan navigasi pelanggan.
                            </p>
                        </div>
                        <Link href="/admin/categories">
                            <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/50">
                                Atur Kategori
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
