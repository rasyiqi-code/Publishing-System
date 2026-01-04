'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Share2, Lock, ChevronRight, X, AlertCircle, PenTool } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { verifyProjectAccess } from './actions';

interface PublicTimelineProps {
    project: any;
    sidebarProjects?: any[];
    canEdit?: boolean;
}

export function PublicTimeline({ project, sidebarProjects = [], canEdit = false }: PublicTimelineProps) {
    const router = useRouter();
    const [selectedProjectTitle, setSelectedProjectTitle] = useState<string | null>(null);
    const [verificationId, setVerificationId] = useState('');

    const [verificationError, setVerificationError] = useState<string | null>(null);

    const handleBack = () => {
        router.push('/');
    };

    const handleShare = () => {
        const url = `${window.location.origin}/?ticket=${project.id}`;
        navigator.clipboard.writeText(url);
        alert('Link kartu digital telah disalin!');
    };

    const handleVerifyParams = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerificationError(null);

        if (verificationId) {
            try {
                const result = await verifyProjectAccess(verificationId);

                if (!result.valid) {
                    setVerificationError(result.error || 'Project tidak valid');
                    return;
                }

                // Strict Match: Title mismatch check
                if (selectedProjectTitle && result.title !== selectedProjectTitle) {
                    setVerificationError('ID yang dimasukkan bukan untuk project yang dipilih.');
                    return;
                }

                router.push(`/?track=${verificationId}`);
                setSelectedProjectTitle(null);
                setVerificationId('');
            } catch (err) {
                setVerificationError('Terjadi kesalahan saat verifikasi.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modal Verification */}
            {selectedProjectTitle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Verifikasi Akses</h3>
                            <button onClick={() => {
                                setSelectedProjectTitle(null);
                                setVerificationError(null);
                            }} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">
                            Untuk melihat detail <strong>{selectedProjectTitle}</strong>, silakan masukkan Nomor Resi / Order ID:
                        </p>

                        {verificationError && (
                            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-1">
                                <AlertCircle size={16} />
                                <span className="font-bold">{verificationError}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerifyParams} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Contoh: SPT-KBM-001"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-center font-bold text-slate-800 placeholder:font-sans placeholder:font-normal"
                                value={verificationId}
                                onChange={(e) => setVerificationId(e.target.value)}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!verificationId}
                                className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Buka Project
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-8">

                {/* Navigation */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-sm transition-colors group pl-2"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Pencarian
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: Main Ticket Card */}
                    <div className="lg:col-span-2 bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">

                        {/* Header Info */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                            {/* Decor */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h1 className="text-sm font-medium text-violet-200 uppercase tracking-widest mb-1">Status Pengerjaan</h1>
                                    <div className="flex items-center gap-3">
                                        <p className="text-3xl font-black leading-tight">{project.title}</p>
                                        {canEdit && (
                                            <a
                                                href={`/project/${project.id}/edit`}
                                                className="bg-white/20 p-2 rounded-full hover:bg-white/30 text-white transition-all backdrop-blur-sm"
                                                title="Edit Detail Project"
                                            >
                                                <PenTool className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                                    <p className="text-[10px] uppercase font-bold text-violet-200 mb-1">Estimasi</p>
                                    <p className="font-bold text-white">-</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-sm relative z-10">
                                <div>
                                    <p className="text-violet-200 text-xs mb-1">Penulis</p>
                                    <p className="font-bold">{project.author}</p>
                                </div>
                                <div>
                                    <p className="text-violet-200 text-xs mb-1">Order ID</p>
                                    <p className="font-mono font-bold bg-white/10 inline-block px-2 py-0.5 rounded text-xs">{project.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Content */}
                        <div className="p-8 md:p-10">
                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-100"></div>

                                <div className="space-y-10">
                                    {project.steps.map((step: any, i: number) => {
                                        const isCompleted = step.status === 'completed';
                                        const isActive = step.status === 'active' || step.status === 'warning';
                                        const isPending = !isCompleted && !isActive;

                                        return (
                                            <div key={i} className={`relative flex gap-6 group ${isPending ? 'opacity-50 blur-[0.5px]' : ''}`}>
                                                {/* Dot / Icon */}
                                                <div className={`
                                                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-300
                                                    ${isCompleted ? 'bg-green-500 border-green-100 text-white' :
                                                        isActive ? 'bg-violet-600 border-violet-100 text-white scale-110 shadow-lg shadow-violet-200' :
                                                            'bg-white border-slate-200 text-slate-300'}
                                                `}>
                                                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> :
                                                        isActive ? <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" /> :
                                                            <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                                                </div>

                                                {/* Content */}
                                                <div className={`flex-1 pt-1 transition-all ${isActive ? 'scale-100' : 'scale-95'}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className={`font-bold text-lg ${isActive ? 'text-violet-900' : 'text-slate-800'}`}>
                                                            {step.label}
                                                        </h4>
                                                        {isCompleted && (
                                                            <span className="text-xs font-medium text-slate-400 font-mono tracking-tight">{step.date || 'Selesai'}</span>
                                                        )}
                                                    </div>

                                                    {isActive && (
                                                        <div className="animate-in slide-in-from-left-2 duration-300">
                                                            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100 text-sm text-violet-800 font-medium leading-relaxed">
                                                                Tim sedang mengerjakan tahap ini. Mohon menunggu update selanjutnya.
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isPending && (
                                                        <p className="text-sm text-slate-400 font-medium">Menunggu antrian</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col items-center gap-4">
                            <button
                                onClick={handleShare}
                                className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all shadow-sm"
                            >
                                <Share2 className="w-4 h-4" /> Simpan / Bagikan Kartu Digital
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Ongoing */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-lg sticky top-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Antrian Produksi Lainnya</h3>
                            </div>

                            {sidebarProjects.length > 0 ? (
                                <div className="space-y-3">
                                    {sidebarProjects.map((p, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedProjectTitle(p.title);
                                                setVerificationId('');
                                            }}
                                            className="w-full text-left p-4 rounded-xl bg-slate-50 hover:bg-violet-50 border border-slate-100 hover:border-violet-200 transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-slate-700 text-sm line-clamp-2 group-hover:text-violet-700 transition-colors pr-6">
                                                    {p.title}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    {(p as any).canEdit && (
                                                        <a
                                                            href={`/project/${(p as any).id}/edit`}
                                                            onClick={(e) => e.stopPropagation()} // Prevent card click
                                                            className="p-1 hover:bg-indigo-200 rounded text-indigo-500 hover:text-indigo-700 transition-colors"
                                                            title="Edit Project"
                                                        >
                                                            <PenTool size={12} />
                                                        </a>
                                                    )}
                                                    <Lock size={14} className="text-slate-300 group-hover:text-violet-300" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 mb-2 truncate">Penulis: {p.author}</p>

                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${(p as any).isComplete ? 'bg-blue-500' : 'bg-indigo-500 animate-pulse'
                                                    }`}></span>
                                                <span className={`text-[10px] font-bold uppercase ${(p as any).isComplete ? 'text-blue-600' : 'text-slate-400'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    Tidak ada antrian lain saat ini.
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Project Anda tidak ada di daftar? <br />
                                    Pastikan memiliki <strong>Order ID</strong> yang valid.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                <p className="text-center text-slate-400 text-xs font-medium">
                    &copy; 2024 Penerbit KBM. All rights reserved.
                </p>
            </div>
        </div>
    );
}
