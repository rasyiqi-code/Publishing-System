'use client';

import React, { useState } from 'react';
import { Copy, Check, CheckCircle2, Clock } from 'lucide-react';

interface TrackingCardProps {
    project: any;
}

export function TrackingCard({ project }: TrackingCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(project.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // metrics
    const totalSteps = project.steps.length;
    const completedSteps = project.steps.filter((s: any) => s.status === 'completed').length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    const currentStep = project.steps.find((s: any) => s.status === 'active') ||
        project.steps.find((s: any) => s.status === 'warning') ||
        (completedSteps === totalSteps ? { label: 'Selesai', role: 'All Done' } : { label: 'Menunggu', role: '-' });

    const isCompleted = completedSteps === totalSteps;

    return (
        <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 p-8 text-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}>
                    {isCompleted ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    <span>{isCompleted ? 'Pesanan Selesai' : 'Sedang Diproses'}</span>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-2">Nomor Pesanan</h2>
                <p className="text-slate-500 text-sm mb-6 font-medium">Salin nomor ini untuk pengecekan berkala.</p>

                {/* ID Card */}
                <div className="bg-slate-50 rounded-2xl p-2 pl-6 border border-slate-200 flex items-center justify-between gap-4 group hover:border-indigo-200 transition-all shadow-inner">
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{project.id}</p>
                    <button
                        onClick={handleCopy}
                        className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-all"
                        title="Salin ID"
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>

                {/* Simple Progress Bar */}
                <div className="mt-8">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-3">
                        Tahap {completedSteps + 1}/{totalSteps}: <span className="text-indigo-600 font-bold">{currentStep.label}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
