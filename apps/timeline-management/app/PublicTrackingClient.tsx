'use client';

import { useState } from 'react';
import { Package, Search, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PublicTrackingClient() {
    const [orderId, setOrderId] = useState('');

    const router = useRouter();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderId) {
            router.push(`/project/${orderId}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 mt-10 md:mt-20">
            <div className="w-full max-w-2xl text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-black text-white shadow-2xl mb-4">
                    <Package size={40} />
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                    Lacak Status <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        Pesanan Anda
                    </span>
                </h1>

                <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
                    Masukkan Nomor Order ID atau Token Pelacakan yang Anda terima untuk melihat progres produksi secara real-time.
                </p>

                <form onSubmit={handleTrack} className="w-full max-w-md mx-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Contoh: ORDER-12345"
                        className="w-full pl-12 pr-14 py-4 rounded-2xl border-2 border-gray-100 bg-white text-lg font-bold text-slate-900 shadow-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:font-medium placeholder:text-gray-300"
                        required
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div className="pt-10 flex flex-col md:flex-row items-center justify-center gap-6 text-sm font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live Tracking
                    </div>
                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                    <div>Real-time Updates</div>
                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                    <div>Secure & Private</div>
                </div>
            </div>
        </div>
    );
}
