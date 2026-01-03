"use client";
import React from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { getStatusColor } from '../../engine';

interface ProjectDetailProps {
    project: any;
    onBack: () => void;
    userRole: string;
    onUpdateStatus?: (projectId: string, stepId: string, status: string, value?: string) => Promise<void>;
}

export const ProjectDetail = ({ project, onBack, userRole, onUpdateStatus }: ProjectDetailProps) => {
    const handleAction = async (stepId: string) => {
        if (onUpdateStatus) {
            // Optimistic update could go here, for now just await
            await onUpdateStatus(project.id, stepId, 'completed');
        }
    };
    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Ringkasan
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Timeline Section */}
                    <div className="lg:col-span-2">
                        <header className="mb-10">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-slate-900 leading-tight">{project.title}</h1>
                                <div className={`p-1.5 rounded-full ${project.health === 'healthy' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {project.health === 'healthy' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                </div>
                            </div>
                            <p className="text-slate-500 font-bold">Progress Produksi & Administrasi</p>
                        </header>

                        <div className="relative space-y-1">
                            <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-slate-100 rounded-full"></div>

                            {project.steps.map((step: any, i: number) => (
                                <div key={i} className="relative flex items-start gap-8 py-6">
                                    <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 shrink-0 ${getStatusColor(step.status)}`}>
                                        {step.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`text-lg font-bold ${step.status === 'locked' ? 'text-slate-300' : 'text-slate-800'}`}>
                                                {step.label}
                                            </h4>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{step.role}</span>
                                        </div>
                                        <p className={`text-sm font-medium ${step.status === 'locked' ? 'text-slate-200' : 'text-slate-500'}`}>
                                            {step.date}
                                        </p>

                                        {step.status === 'active' && (
                                            <div className="mt-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Status Sekarang:</p>
                                                <p className="text-sm text-indigo-900 font-bold leading-relaxed">
                                                    {step.isLocked ? `LOCKED: ${step.lockReason}` : "Sedang dikerjakan oleh tim."}
                                                </p>

                                                {/* Action Buttons */}
                                                {!step.isLocked && (userRole === 'admin' || userRole === step.role) ? (
                                                    <div className="mt-4 flex gap-2">
                                                        <button
                                                            onClick={() => handleAction(step.id)}
                                                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                                                        >
                                                            Tandai Selesai
                                                        </button>
                                                        <button className="px-4 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold">
                                                            Tanya Admin
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 text-center">
                                                        {step.isLocked ? "Menunggu Antrian" : `Menunggu proses oleh bagian: ${step.role}`}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {step.status === 'warning' && (
                                            <div className="mt-4 p-5 bg-red-50 rounded-2xl border border-red-100">
                                                <div className="flex items-center gap-2 mb-2 text-red-600">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <p className="text-xs font-black uppercase tracking-widest">
                                                        {step.status === 'warning' ? "Action Required" : "Bukti Transfer"}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-red-900 font-bold mb-4">
                                                    {step.status === 'warning'
                                                        ? "Pembayaran DP belum kami terima. Mohon upload bukti transfer agar tim layout bisa mulai bekerja."
                                                        : "Bukti transfer sudah diupload."}
                                                </p>

                                                {/* File Upload Logic */}
                                                <div className="space-y-3">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file || !onUpdateStatus) return;

                                                            const formData = new FormData();
                                                            formData.append('file', file);

                                                            try {
                                                                // 1. Upload
                                                                const res = await fetch('/api/upload', {
                                                                    method: 'POST',
                                                                    body: formData
                                                                });

                                                                if (!res.ok) throw new Error('Upload failed');
                                                                const { url } = await res.json();

                                                                // 2. Update Status & Save URL to Logs
                                                                // We use 'completed' for now, or could use a specific 'review' status if engine supports it
                                                                await onUpdateStatus(project.id, step.id, 'completed', url);

                                                            } catch (err) {
                                                                alert('Gagal upload gambar. Coba lagi.');
                                                                console.error(err);
                                                            }
                                                        }}
                                                        className="hidden"
                                                        id={`upload-${step.id}`}
                                                    />
                                                    <label
                                                        htmlFor={`upload-${step.id}`}
                                                        className="block w-full text-center py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-lg shadow-red-100"
                                                    >
                                                        📤 Upload Bukti Transfer
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Spesifikasi */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl shadow-slate-200 sticky top-8">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Detail Pesanan (Specs)</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Judul Buku</p>
                                    <p className="font-bold text-lg leading-tight">{project.title}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Penulis</p>
                                    <p className="font-bold">{project.author}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Kuantitas</p>
                                        <p className="font-black text-xl">{project.meta?.quantity || '-'} <span className="text-xs font-normal text-slate-400">eks</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Legalitas</p>
                                        <p className="font-bold text-sm">ISBN & HAKI</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Spesifikasi Cetak</p>
                                    <div className="bg-slate-800 p-4 rounded-2xl text-xs font-bold text-slate-300 space-y-2">
                                        {project.specs ? (
                                            Object.entries(project.specs).map(([key, value]) => (
                                                <p key={key} className="flex justify-between">
                                                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="text-white">{String(value)}</span>
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 text-center italic">Spesifikasi belum diatur.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button className="w-full py-4 bg-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all">
                                        <ExternalLink className="w-4 h-4" /> Share Tracking Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
